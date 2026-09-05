import { Clone } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useRef, useEffect, useState, useMemo, memo } from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import {
	ModelTextures,
	BodyModelTextures,
	ModelProps,
} from "./Types/modelTypes";
import { useCardioTextures, useBodyTextures } from "./Hooks/useModelTextures";
import {
	createCardioMaterial,
	createBodyMaterial,
	updateBodyMaterial,
} from "./Utils/materialUtils";

import {
	createGlowingMaterial,
	painAreaMaterial,
} from "./Utils/painAreaMaterial";
import { mapLabFindingsToBodyHighlights } from "./Utils/labBodyMapping";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { setSymptomsInput } from "@/App/Redux/triageSlice";

// ─── Module-level OBJ preloads ───────────────────────────────────────────────
// These run once when the Dashboard lazy-chunk is first imported, so the
// browser fetches both model files in parallel with JS parsing. When the Canvas
// mounts and BodyModelContent/CardioModelContent call useLoader(), the cache
// is already warm and they resolve without an extra network round-trip.
useLoader.preload(OBJLoader, "/assets/models/normal/normal.obj");
useLoader.preload(OBJLoader, "/assets/models/cardio/cardio.obj");

interface ExtendedModelProps extends ModelProps {
	isFading?: boolean;
	isNew?: boolean;
	onTransitionComplete?: () => void;
	isHidden?: boolean;
	startFadeIn?: boolean;
	onModelChange?: (
		type: "body" | "cardio",
		cameraConfig: {
			position: [number, number, number];
			zoom: number;
		},
	) => void;
}

interface InternalModelProps {
	modelType: "body" | "cardio";
	textures: ModelTextures | Partial<BodyModelTextures>;
	isHidden: boolean;
	shouldRender: boolean;
	position: [number, number, number];
	scale: [number, number, number];
	rotation: [number, number, number];
	handlePointerDown: () => void;
	handlePointerUp: (event: ThreeEvent<PointerEvent>) => void;
	groupRef: React.RefObject<THREE.Group>;
}

const BodyModelContent = memo(function BodyModelContent({
	textures,
	position,
	scale,
	rotation,
	handlePointerDown,
	handlePointerUp,
	groupRef,
}: InternalModelProps) {
	// Non-suspending OBJ load — model renders instantly with placeholder geometry
	const [model, setModel] = useState<THREE.Group | null>(null);
	const matRef = useRef<THREE.MeshStandardMaterial | null>(null);

	useEffect(() => {
		let mounted = true;
		const loader = new OBJLoader();
		// loadAsync goes through THREE's DefaultLoadingManager which checks the
		// fetch cache primed by useLoader.preload — resolves quickly if already cached
		loader.loadAsync("/assets/models/normal/normal.obj").then((obj) => {
			if (!mounted) return;
			const mat = createBodyMaterial(textures as Partial<BodyModelTextures>);
			mat.transparent = true;
			mat.depthWrite = true;
			matRef.current = mat;
			obj.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					if (child.name === "Body_final") {
						child.raycast = new THREE.Mesh().raycast;
						child.userData.clickable = true;
					}
					child.material = mat;
				}
			});
			setModel(obj);
		});
		return () => {
			mounted = false;
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Patch material in-place as textures arrive — no shader recompilation
	useEffect(() => {
		if (matRef.current) {
			updateBodyMaterial(matRef.current, textures as Partial<BodyModelTextures>);
		}
	}, [textures]);

	return (
		<group
			ref={groupRef}
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
		>
			{model && (
				<Clone
					object={model}
					position={position}
					rotation={rotation}
					scale={scale}
					castShadow
					receiveShadow
				/>
			)}
		</group>
	);
});

const CardioModelContent = memo(function CardioModelContent({
	textures,
	position,
	scale,
	rotation,
	handlePointerDown,
	handlePointerUp,
	groupRef,
}: InternalModelProps) {
	const model = useLoader(OBJLoader, "/assets/models/cardio/cardio.obj");

	useEffect(() => {
		if (!model) return;
		model.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				const material = createCardioMaterial(
					child.name,
					textures as ModelTextures,
				);
				child.material = material;
				if (child.material) {
					child.material.transparent = true;
					child.material.depthWrite = true;
				}
			}
		});
	}, [model, textures]);

	return (
		<group
			ref={groupRef}
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
		>
			<Clone
				object={model}
				position={position}
				rotation={rotation}
				scale={scale}
				castShadow
				receiveShadow
			/>
		</group>
	);
});

function Model({
	position = [0, 0, 0],
	rotation = [0, 0, 0],
	scale = [1, 1, 1],
	modelType = "body",
	isFading = false,
	isNew = false,
	onTransitionComplete,
	isHidden = false,
	startFadeIn = true,
	onModelChange,
	isPaused = false,
}: ExtendedModelProps & { isPaused?: boolean }) {
	const cardioTextures = useCardioTextures();
	const bodyTextures = useBodyTextures();
	const groupRef = useRef<THREE.Group>(null);
	const dispatch = useDispatch();
	const selectedCategory = useSelector(
		(state: RootState) => state.category.selectedCategory,
	);
	const activeAlerts = useSelector(
		(state: RootState) => state.triage.activeAlerts,
	);

	// ─── Lab-result body highlights ──────────────────────────────────────
	const uploadStatus = useSelector((state: RootState) => state.user.uploadStatus);
	const uploadRecords = useSelector(
		(state: RootState) => state.uploadHistory.records,
	);

	const labHighlights = useMemo(() => {
		// Strictly only highlight when the user has uploaded and processed a lab file
		if (uploadStatus !== "completed") return new Map();
		if (!uploadRecords || uploadRecords.length === 0) return new Map();
		const userUploads = uploadRecords.filter(
			(r) =>
				r.id !== "default-seed-record" &&
				!r.id.startsWith("seed") &&
				r.fileName !== "blood_panel_report.pdf",
		);
		if (userUploads.length === 0) return new Map();
		const latestFindings = userUploads[0].findings;
		if (!latestFindings || latestFindings.length === 0) return new Map();
		return mapLabFindingsToBodyHighlights(latestFindings);
	}, [uploadStatus, uploadRecords]);

	const [opacity, setOpacity] = useState(isNew ? 0 : 1);
	const [shouldRender, setShouldRender] = useState(!isNew);
	const [hasFadedOut, setHasFadedOut] = useState(false);
	// Initialize position and scale directly on the ref on mount or modelType changes
	useEffect(() => {
		if (groupRef.current) {
			groupRef.current.position.set(position[0], position[1], position[2]);
			groupRef.current.scale.set(scale[0], scale[1], scale[2]);
		}
	}, [modelType, position, scale]);

	const [pointerDownTime, setPointerDownTime] = useState(0);
	const prevIsHiddenRef = useRef(isHidden);
	const prevShouldRenderRef = useRef(shouldRender);

	const materials: Record<string, THREE.ShaderMaterial> = useMemo(() => {
		const getColor = (system: string, standard: [number, number, number]) => {
			// 1. Check triage alerts (highest priority)
			const alert = activeAlerts.find(
				(a) => system.includes(a.system) || a.system.includes(system),
			);
			if (alert) {
				if (alert.urgency === "Red")
					return [
						new THREE.Color(0xff0000),
						new THREE.Color(0xaa0000),
						new THREE.Color(0x550000),
					] as [THREE.Color, THREE.Color, THREE.Color];
				if (alert.urgency === "Yellow")
					return [
						new THREE.Color(0xffaa00),
						new THREE.Color(0xff6600),
						new THREE.Color(0xaa3300),
					] as [THREE.Color, THREE.Color, THREE.Color];
			}

			// 2. Check lab-result highlights (second priority)
			for (const [, highlight] of labHighlights) {
				// Match lab systemKey → material system name
				const labSystemMap: Record<string, string> = {
					Endocrinology: "Endocrine",
					Gastroenterolgy: "Digestive",
					Pulmonology: "Respiratory",
					Pulmonology1: "Renal",
					Urology: "Urological",
					StressManagement: "Neurological",
					UlnaRadiusAlt: "Musculoskeletal",
					Hematology: "Hematology",
					cardiovascular: "Cardiovascular",
				};
				const mappedName = labSystemMap[highlight.systemKey] || highlight.systemKey;
				if (mappedName === system || system.includes(mappedName) || mappedName.includes(system)) {
					return [
						highlight.coreColor,
						highlight.midColor,
						highlight.outerColor,
					] as [THREE.Color, THREE.Color, THREE.Color];
				}
			}

			return [
				new THREE.Color(standard[0]),
				new THREE.Color(standard[1]),
				new THREE.Color(standard[2]),
			] as [THREE.Color, THREE.Color, THREE.Color];
		};

		const baseMaterials: Record<string, THREE.ShaderMaterial> = {
			Respiratory: createGlowingMaterial(
				...getColor("Respiratory", [0x00ffff, 0x0088ff, 0x002288]),
			),
			Digestive: createGlowingMaterial(
				...getColor("Digestive", [0xff8800, 0xff4400, 0x882200]),
			),
			Endocrine: createGlowingMaterial(
				...getColor("Endocrine", [0xff00ff, 0x8800ff, 0x440088]),
			),
			Renal: createGlowingMaterial(
				...getColor("Renal", [0xffff00, 0x888800, 0x444400]),
			),
			Urological: createGlowingMaterial(
				...getColor("Urological", [0xffff00, 0xaaaa00, 0x555500]),
			),
			Neurological: createGlowingMaterial(
				...getColor("Neurological", [0xff00aa, 0xaa00aa, 0x550055]),
			),
			Musculoskeletal: createGlowingMaterial(
				...getColor("Musculoskeletal", [0x00ffaa, 0x00aa55, 0x005522]),
			),
			General: painAreaMaterial,
		};

		// Add lab-derived materials for systems not already covered
		for (const [systemKey, highlight] of labHighlights) {
			const matKey = `Lab_${systemKey}`;
			if (!baseMaterials[matKey]) {
				baseMaterials[matKey] = createGlowingMaterial(
					highlight.coreColor,
					highlight.midColor,
					highlight.outerColor,
				);
			}
		}

		return baseMaterials;
	}, [activeAlerts, labHighlights]);

	const systemFeatures: Record<
		string,
		{
			position: [number, number, number];
			rotation: [number, number, number];
			scale: number;
			material: THREE.ShaderMaterial;
		}[]
	> = useMemo(() => {
		const base: Record<
			string,
			{
				position: [number, number, number];
				rotation: [number, number, number];
				scale: number;
				material: THREE.ShaderMaterial;
			}[]
		> = {
			Pulmonology: [
				{
					position: [-1.8, 15, 1.8],
					rotation: [0, 0, 0],
					scale: 8,
					material: materials.Respiratory,
				}, // Left Lung
				{
					position: [1.8, 15, 1.8],
					rotation: [0, 0, 0],
					scale: 8,
					material: materials.Respiratory,
				}, // Right Lung
			],
			Gastroenterolgy: [
				{
					position: [0, 10, 2.5],
					rotation: [0, 0, 0],
					scale: 10,
					material: materials.Digestive,
				}, // Stomach/Intestines
			],
			Endocrinology: [
				{
					position: [0, 24, 1.8],
					rotation: [-0.2, 0, 0],
					scale: 5,
					material: materials.Endocrine,
				}, // Thyroid
			],
			Pulmonology1: [
				// Renal
				{
					position: [-2, 8, -1.8],
					rotation: [0, Math.PI, 0],
					scale: 6,
					material: materials.Renal,
				}, // Left Kidney
				{
					position: [2, 8, -1.8],
					rotation: [0, Math.PI, 0],
					scale: 6,
					material: materials.Renal,
				}, // Right Kidney
			],
			Urology: [
				{
					position: [0, 0, 1.5],
					rotation: [0, 0, 0],
					scale: 7,
					material: materials.Urological,
				}, // Bladder/Pelvis
			],
			StressManagement: [
				// Neurological
				{
					position: [0, 31, 1],
					rotation: [-0.2, 0, 0],
					scale: 11,
					material: materials.Neurological,
				}, // Brain
			],
			UlnaRadiusAlt: [
				// Musculoskeletal
				{
					position: [-6, 15, 0],
					rotation: [0, 0, 0],
					scale: 6,
					material: materials.Musculoskeletal,
				}, // Left Arm/Shoulder
				{
					position: [6, 15, 0],
					rotation: [0, 0, 0],
					scale: 6,
					material: materials.Musculoskeletal,
				}, // Right Arm/Shoulder
			],
		};

		// ─── Inject lab-result highlights as additional overlay features ─────
		// Position configs for lab system keys that aren't already in the base map
		const LAB_SYSTEM_POSITIONS: Record<
			string,
			{ position: [number, number, number]; rotation: [number, number, number]; scale: number }[]
		> = {
			// Hematology → full-body circulatory glow (torso center)
			Hematology: [
				{ position: [0, 15, 1.5], rotation: [0, 0, 0], scale: 12 },
			],
			// Cardiovascular → heart region
			cardiovascular: [
				{ position: [1, 18, 2], rotation: [0, 0, 0], scale: 7 }, // Heart
			],
		};

		for (const [systemKey, highlight] of labHighlights) {
			const matKey = `Lab_${systemKey}`;
			const labMat = materials[matKey];
			if (!labMat) continue;

			// If the system already has base features, merge lab color in
			if (base[systemKey]) {
				// Override material colors on existing features
				for (const feature of base[systemKey]) {
					feature.material = labMat;
				}
			} else {
				// Create new overlay entries for this lab system
				const positions = LAB_SYSTEM_POSITIONS[systemKey];
				if (positions) {
					base[systemKey] = positions.map((pos) => ({
						...pos,
						material: labMat,
					}));
				}
			}

			// Suppress the "not used" TS warning for highlight
			void highlight;
		}

		return base;
	}, [materials, labHighlights]);

	const handlePointerDown = () => {
		setPointerDownTime(Date.now());
	};

	const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
		const clickDuration = Date.now() - pointerDownTime;
		const wasDragged = event.movementX !== 0 || event.movementY !== 0;

		if (!wasDragged && clickDuration < 200) {
			const clickedMesh = event.object;
			if (clickedMesh.userData.clickable) {
				handleMeshClick(event, "Chest");
			}
		}
	};

	const handleMeshClick = (
		event: ThreeEvent<MouseEvent>,
		systemName: string,
	) => {
		event.stopPropagation();
		dispatch(setSymptomsInput(systemName));
		if (
			modelType === "body" &&
			(systemName === "Cardiovascular" ||
				systemName === "Chest" ||
				systemName === "cardiovascular")
		) {
			const cardioConfig: {
				position: [number, number, number];
				zoom: number;
			} = {
				position: [0, 20, 200] as [number, number, number],
				zoom: 15,
			};
			onModelChange?.("cardio", cardioConfig);
		}
	};

	useFrame((state) => {
		if (isPaused) return;

		const isHiddenChanged = prevIsHiddenRef.current !== isHidden;
		const isShouldRenderChanged = prevShouldRenderRef.current !== shouldRender;
		prevIsHiddenRef.current = isHidden;
		prevShouldRenderRef.current = shouldRender;

		// Smoothly interpolate position and scale directly on the WebGL object ref
		// This avoids triggering synchronous React state updates on every frame.
		if (groupRef.current) {
			groupRef.current.position.x += (position[0] - groupRef.current.position.x) * 0.1;
			groupRef.current.position.y += (position[1] - groupRef.current.position.y) * 0.1;
			groupRef.current.position.z += (position[2] - groupRef.current.position.z) * 0.1;

			groupRef.current.scale.x += (scale[0] - groupRef.current.scale.x) * 0.1;
			groupRef.current.scale.y += (scale[1] - groupRef.current.scale.y) * 0.1;
			groupRef.current.scale.z += (scale[2] - groupRef.current.scale.z) * 0.1;
		}

		// 1. Optimized Opacity & Visibility Handling (using refs)
		let currentOpacity = opacity;
		if (isHidden) {
			currentOpacity = 0;
		} else if (isFading && !hasFadedOut) {
			const fadeSpeed = 0.15;
			currentOpacity = Math.max(0, opacity - fadeSpeed);
			if (currentOpacity === 0) {
				setHasFadedOut(true);
				setShouldRender(false);
				onTransitionComplete?.();
			}
		} else if (isNew && startFadeIn && (!isFading || hasFadedOut)) {
			if (shouldRender) {
				const fadeSpeed = 0.15;
				currentOpacity = Math.min(1, opacity + fadeSpeed);
			}
		} else if (!isFading && !isNew && opacity !== 1) {
			currentOpacity = 1;
		}

		if (currentOpacity !== opacity) {
			setOpacity(currentOpacity);
		}

		// Direct material update via ref (avoids traverse on every frame, only executes when properties change)
		if ((currentOpacity !== opacity || isHiddenChanged || isShouldRenderChanged) && groupRef.current) {
			groupRef.current.traverse((child) => {
				if (child instanceof THREE.Mesh && child.material) {
					const mat = child.material as THREE.Material;
					mat.opacity = currentOpacity;
					mat.visible = !isHidden && shouldRender && currentOpacity > 0;
				}
			});
		}

		// 2. Animate all glowing materials with a smooth, slow, organic breathing cycle
		const time = state.clock.getElapsedTime();
		const slowPulse = Math.sin(time * 1.5) * 0.5 + 0.5;
		const heartPulse = Math.pow(Math.max(0.0, Math.sin(time * 1.5)), 2.0) * 0.7;

		for (const key in materials) {
			const mat = materials[key];
			if (mat && mat.uniforms) {
				mat.uniforms.time.value = time;
				mat.uniforms.pulse.value = heartPulse;
				mat.uniforms.intensity.value = 0.8 + slowPulse * 0.4;
			}
		}
	});

	useEffect(() => {
		if (isNew && !shouldRender && startFadeIn) {
			setShouldRender(true);
		}
	}, [isNew, shouldRender, startFadeIn]);

	if (!shouldRender || (isFading && hasFadedOut)) {
		return null;
	}

	// Show pain/lab overlays when body model is visible, OR when lab highlights exist
	const hasLabHighlights = labHighlights.size > 0;
	const shouldShowPainArea =
		modelType === "body" && shouldRender && !isHidden && opacity > 0;
	const shouldShowLabOverlays =
		modelType === "body" && shouldRender && !isHidden && opacity > 0 && hasLabHighlights;

	return (
		<group onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
			{modelType === "body" ? (
				<BodyModelContent
					modelType={modelType}
					textures={bodyTextures}
					isHidden={isHidden}
					shouldRender={shouldRender}
					position={[0, 0, 0]}
					rotation={rotation}
					scale={[1, 1, 1]}
					handlePointerDown={handlePointerDown}
					handlePointerUp={handlePointerUp}
					groupRef={groupRef}
				/>
			) : (
				<CardioModelContent
					modelType={modelType}
					textures={cardioTextures}
					isHidden={isHidden}
					shouldRender={shouldRender}
					position={[0, 0, 0]}
					rotation={rotation}
					scale={[1, 1, 1]}
					handlePointerDown={handlePointerDown}
					handlePointerUp={handlePointerUp}
					groupRef={groupRef}
				/>
			)}
			{/* Category-based pain areas — only when a specific system has an active alert or lab finding */}
			{shouldShowPainArea &&
				selectedCategory &&
				selectedCategory !== "total" &&
				selectedCategory !== "ClinicalNotes" &&
				(activeAlerts.some(
					(a) =>
						selectedCategory.includes(a.system) ||
						a.system.includes(selectedCategory),
				) ||
					labHighlights.has(selectedCategory)) &&
				systemFeatures[selectedCategory] &&
				systemFeatures[selectedCategory].map((feature, idx) => (
					<mesh
						key={`cat-${idx}`}
						position={feature.position}
						rotation={feature.rotation}
						onClick={(e) => handleMeshClick(e, selectedCategory || "")}
					>
						<planeGeometry args={[feature.scale, feature.scale, 32, 32]} />
						<primitive attach='material' object={feature.material} />
					</mesh>
				))}

			{/* Lab-result-driven body highlights */}
			{shouldShowLabOverlays &&
				Array.from(labHighlights.entries()).map(([systemKey]) => {
					// Don't double-render if this system is already shown by the selected category
					if (systemKey === selectedCategory) return null;
					const features = systemFeatures[systemKey];
					if (!features) return null;
					return features.map((feature, idx) => (
						<mesh
							key={`lab-${systemKey}-${idx}`}
							position={feature.position}
							rotation={feature.rotation}
							onClick={(e) => handleMeshClick(e, systemKey)}
						>
							<planeGeometry args={[feature.scale, feature.scale, 32, 32]} />
							<primitive attach='material' object={feature.material} />
						</mesh>
					));
				})}
			<ambientLight intensity={0.5} />
			<directionalLight
				position={[2, 10, 5]}
				intensity={0.8}
				castShadow
				color='#CFD8EA'
				shadow-mapSize-width={1024}
				shadow-mapSize-height={1024}
			/>
			<directionalLight
				position={[0, 10, 10]}
				intensity={1.0}
				color='#FFFFFF'
			/>
		</group>
	);
}

export default Model;
