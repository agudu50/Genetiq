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
useLoader.preload(OBJLoader, "/assets/models/female/female.obj");
useLoader.preload(OBJLoader, "/assets/models/cardio/cardio.obj");

interface ExtendedModelProps extends ModelProps {
	isFading?: boolean;
	isNew?: boolean;
	onTransitionComplete?: () => void;
	isHidden?: boolean;
	startFadeIn?: boolean;
	selectedCategory?: string | null;
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
	gender?: string;
}

const BodyModelContent = memo(function BodyModelContent({
	textures,
	position,
	scale,
	rotation,
	handlePointerDown,
	handlePointerUp,
	groupRef,
	gender,
}: InternalModelProps) {
	// Non-suspending OBJ load — model renders instantly with placeholder geometry
	const [model, setModel] = useState<THREE.Group | null>(null);
	const matRef = useRef<THREE.MeshStandardMaterial | null>(null);

	const isFemale = gender?.toLowerCase() === "female";
	const modelPath = isFemale
		? "/assets/models/female/female.obj"
		: "/assets/models/normal/normal.obj";

	useEffect(() => {
		let mounted = true;
		const loader = new OBJLoader();
		// loadAsync goes through THREE's DefaultLoadingManager which checks the
		// fetch cache primed by useLoader.preload — resolves quickly if already cached
		loader.loadAsync(modelPath).then((obj) => {
			if (!mounted) return;
			const mat = createBodyMaterial(textures as Partial<BodyModelTextures>);
			mat.transparent = true;
			mat.depthWrite = true;
			matRef.current = mat;
			obj.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.raycast = new THREE.Mesh().raycast;
					child.userData.clickable = true;
					child.material = mat;
				}
			});
			setModel(obj);
		});
		return () => {
			mounted = false;
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modelPath]);

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
	selectedCategory: propCategory,
	gender: propGender,
}: ExtendedModelProps & { isPaused?: boolean }) {
	const cardioTextures = useCardioTextures();
	const bodyTextures = useBodyTextures();
	const groupRef = useRef<THREE.Group>(null);
	const dispatch = useDispatch();
	const reduxCategory = useSelector(
		(state: RootState) => state.category.selectedCategory,
	);
	const selectedCategory = propCategory !== undefined ? propCategory : reduxCategory;
	const user = useSelector((state: RootState) => state.user);
	const effectiveGender = propGender || user?.gender || "Male";
	const activeAlerts = useSelector(
		(state: RootState) => state.triage.activeAlerts,
	);

	// ─── Lab-result body highlights ──────────────────────────────────────
	const uploadRecords = useSelector(
		(state: RootState) => state.uploadHistory.records,
	);

	const labHighlights = useMemo(() => {
		if (!uploadRecords || uploadRecords.length === 0) return new Map();
		const latestFindings = uploadRecords[0]?.findings;
		if (!latestFindings || latestFindings.length === 0) return new Map();
		return mapLabFindingsToBodyHighlights(latestFindings);
	}, [uploadRecords]);

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
				(a) =>
					system.toLowerCase().includes(a.system.toLowerCase()) ||
					a.system.toLowerCase().includes(system.toLowerCase()),
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
					Cardiovascular: "Cardiovascular",
				};
				const mappedName = labSystemMap[highlight.systemKey] || highlight.systemKey;
				if (
					mappedName.toLowerCase() === system.toLowerCase() ||
					system.toLowerCase().includes(mappedName.toLowerCase()) ||
					mappedName.toLowerCase().includes(system.toLowerCase())
				) {
					return [
						highlight.coreColor,
						highlight.midColor,
						highlight.outerColor,
					] as [THREE.Color, THREE.Color, THREE.Color];
				}
			}

			// 3. Clinical Profile Highlights for Marcus Vance / Patient
			const isCardio =
				system === "Cardiovascular" &&
				(user?.medicalConditions?.some((c: string) =>
					/cardio|heart|atrial|apob|lipid|arter/i.test(c),
				) ||
					user?.symptoms?.some((s: string) =>
						/palpitation|chest|racing|breath/i.test(s),
					));
			if (isCardio) {
				return [
					new THREE.Color(0xfbbf24), // Vibrant Yellow / Golden-Amber Chest Glow
					new THREE.Color(0xf59e0b),
					new THREE.Color(0x92400e),
				] as [THREE.Color, THREE.Color, THREE.Color];
			}

			const isRenal =
				system === "Renal" &&
				user?.medicalConditions?.some((c: string) =>
					/renal|kidney|egfr|filtration/i.test(c),
				);
			if (isRenal) {
				return [
					new THREE.Color(0xfb923c), // Amber / Orange Glow
					new THREE.Color(0xf97316),
					new THREE.Color(0x9a3412),
				] as [THREE.Color, THREE.Color, THREE.Color];
			}

			const isResp =
				system === "Respiratory" &&
				user?.symptoms?.some((s: string) =>
					/breath|lung|respir|cough/i.test(s),
				);
			if (isResp) {
				return [
					new THREE.Color(0x00f0ff), // Cyan / Azure Glow
					new THREE.Color(0x0284c7),
					new THREE.Color(0x0369a1),
				] as [THREE.Color, THREE.Color, THREE.Color];
			}

			const isNeuro =
				system === "Neurological" &&
				user?.symptoms?.some((s: string) =>
					/fatigue|stress|headache|brain|dizzi/i.test(s),
				);
			if (isNeuro) {
				return [
					new THREE.Color(0xa855f7), // Soft Violet / Indigo Glow (No Red)
					new THREE.Color(0x7e22ce),
					new THREE.Color(0x3b0764),
				] as [THREE.Color, THREE.Color, THREE.Color];
			}

			const isEndo =
				system === "Endocrine" &&
				user?.medicalConditions?.some((c: string) =>
					/glucose|sugar|diabetes|thyroid/i.test(c),
				);
			if (isEndo) {
				return [
					new THREE.Color(0xffb703), // Golden Amber Glow
					new THREE.Color(0xfb8500),
					new THREE.Color(0x9a3412),
				] as [THREE.Color, THREE.Color, THREE.Color];
			}

			return [
				new THREE.Color(standard[0]),
				new THREE.Color(standard[1]),
				new THREE.Color(standard[2]),
			] as [THREE.Color, THREE.Color, THREE.Color];
		};

		const baseMaterials: Record<string, THREE.ShaderMaterial> = {
			Cardiovascular: createGlowingMaterial(
				...getColor("Cardiovascular", [0xfbbf24, 0xf59e0b, 0x92400e]),
			),
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
				...getColor("Neurological", [0xa855f7, 0x7e22ce, 0x3b0764]),
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
	}, [activeAlerts, labHighlights, user]);

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
			cardiovascular: [
				{
					position: [0.8, 17.5, 2.2],
					rotation: [0, 0, 0],
					scale: 8.5,
					material: materials.Cardiovascular,
				}, // Heart
			],
			Cardiovascular: [
				{
					position: [0.8, 17.5, 2.2],
					rotation: [0, 0, 0],
					scale: 8.5,
					material: materials.Cardiovascular,
				}, // Heart
			],
			CardioLoad: [
				{
					position: [0.8, 17.5, 2.2],
					rotation: [0, 0, 0],
					scale: 8.5,
					material: materials.Cardiovascular,
				}, // Heart
			],
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
				{ position: [0.8, 17.5, 2.2], rotation: [0, 0, 0], scale: 8.5 }, // Heart
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

	const cardioHotspotMaterials = useMemo(() => {
		return {
			apobLdl: createGlowingMaterial(
				new THREE.Color(0xf59e0b), // Amber (ApoB & LDL Plaque)
				new THREE.Color(0xd97706),
				new THREE.Color(0x78350f),
			),
			afib: createGlowingMaterial(
				new THREE.Color(0xf97316), // Orange (Atrial Fibrillation Arrhythmia)
				new THREE.Color(0xea580c),
				new THREE.Color(0x9a3412),
			),
			hscrp: createGlowingMaterial(
				new THREE.Color(0xef4444), // Red (hs-CRP Inflammation)
				new THREE.Color(0xb91c1c),
				new THREE.Color(0x7f1d1d),
			),
		};
	}, []);

	useFrame((state) => {
		if (isPaused) return;

		const isHiddenChanged = prevIsHiddenRef.current !== isHidden;
		const isShouldRenderChanged = prevShouldRenderRef.current !== shouldRender;
		prevIsHiddenRef.current = isHidden;
		prevShouldRenderRef.current = shouldRender;

		const time = state.clock.getElapsedTime();

		// Smoothly interpolate position and scale directly on the WebGL object ref
		if (groupRef.current) {
			groupRef.current.position.x += (position[0] - groupRef.current.position.x) * 0.1;
			groupRef.current.position.y += (position[1] - groupRef.current.position.y) * 0.1;
			groupRef.current.position.z += (position[2] - groupRef.current.position.z) * 0.1;

			groupRef.current.scale.x += (scale[0] - groupRef.current.scale.x) * 0.1;
			groupRef.current.scale.y += (scale[1] - groupRef.current.scale.y) * 0.1;
			groupRef.current.scale.z += (scale[2] - groupRef.current.scale.z) * 0.1;
		}

		// 1. Optimized Opacity & Visibility Handling
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

		// Direct material update via ref
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
		const slowPulse = Math.sin(time * 1.5) * 0.5 + 0.5;
		const heartPulse = Math.pow(Math.max(0.0, Math.sin(time * 1.5)), 2.0) * 0.7;

		const allActiveMaterials = [
			...Object.values(materials),
			...Object.values(cardioHotspotMaterials),
		];

		for (const mat of allActiveMaterials) {
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
	const shouldShowCardioHotspots =
		modelType === "cardio" && shouldRender && !isHidden && opacity > 0;

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
					gender={effectiveGender}
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

			{/* Cardiovascular 3D Model Clinical Hotspots (ApoB Plaque, AFib Arrhythmia, hs-CRP Inflammation) */}
			{shouldShowCardioHotspots && (
				<group>
					{/* 1. Coronary Artery / LAD: ApoB 128 mg/dL & LDL 142 mg/dL Atheroma Burden */}
					<mesh
						position={[0.8, 21.2, 3.2]}
						onClick={(e) => handleMeshClick(e, "Cardiovascular")}
					>
						<planeGeometry args={[3.5, 3.5, 32, 32]} />
						<primitive attach='material' object={cardioHotspotMaterials.apobLdl} />
					</mesh>

					{/* 2. Sinoatrial Node / Right Atrium: Paroxysmal Atrial Fibrillation */}
					<mesh
						position={[-1.4, 23.8, 2.0]}
						onClick={(e) => handleMeshClick(e, "Cardiovascular")}
					>
						<planeGeometry args={[3.2, 3.2, 32, 32]} />
						<primitive attach='material' object={cardioHotspotMaterials.afib} />
					</mesh>

					{/* 3. Myocardial Micro-Vascular Bed: hs-CRP 3.4 mg/L Inflammatory Stress */}
					<mesh
						position={[1.2, 18.8, 2.8]}
						onClick={(e) => handleMeshClick(e, "Cardiovascular")}
					>
						<planeGeometry args={[3.4, 3.4, 32, 32]} />
						<primitive attach='material' object={cardioHotspotMaterials.hscrp} />
					</mesh>
				</group>
			)}

			{/* 1. Full Body (Overview) Active Clinical Hotspots & Organ Systems */}
			{shouldShowPainArea &&
				(selectedCategory === "total" || !selectedCategory) && (
					<group>
						{/* Chest Yellow Hotspot: Cardiovascular / Heart (ApoB, AFib, Palpitations) */}
						{systemFeatures.cardiovascular?.map((feature, idx) => (
							<mesh
								key={`overview-cardio-${idx}`}
								position={feature.position}
								rotation={feature.rotation}
								onClick={(e) => handleMeshClick(e, "Cardiovascular")}
							>
								<planeGeometry args={[feature.scale, feature.scale, 32, 32]} />
								<primitive attach='material' object={feature.material} />
							</mesh>
						))}

						{/* Renal System: Kidneys (Stage 2 Renal Filtration Strain, eGFR 78) */}
						{systemFeatures.Pulmonology1?.map((feature, idx) => (
							<mesh
								key={`overview-renal-${idx}`}
								position={feature.position}
								rotation={feature.rotation}
								onClick={(e) => handleMeshClick(e, "Pulmonology1")}
							>
								<planeGeometry args={[feature.scale, feature.scale, 32, 32]} />
								<primitive attach='material' object={feature.material} />
							</mesh>
						))}

						{/* Endocrine System: Thyroid / Metabolism (Fasting Blood Glucose) */}
						{systemFeatures.Endocrinology?.map((feature, idx) => (
							<mesh
								key={`overview-endo-${idx}`}
								position={feature.position}
								rotation={feature.rotation}
								onClick={(e) => handleMeshClick(e, "Endocrinology")}
							>
								<planeGeometry args={[feature.scale, feature.scale, 32, 32]} />
								<primitive attach='material' object={feature.material} />
							</mesh>
						))}

						{/* Additional active non-cardio/non-pulmo triage alerts or lab highlights */}
						{Array.from(labHighlights.entries()).map(([systemKey]) => {
							if (
								systemKey === "cardiovascular" ||
								systemKey === "Cardiovascular" ||
								systemKey === "CardioLoad" ||
								systemKey === "Pulmonology1" ||
								systemKey === "Pulmonology" ||
								systemKey === "Respiratory" ||
								systemKey === "StressManagement" ||
								systemKey === "Endocrinology"
							) {
								return null;
							}
							const features = systemFeatures[systemKey];
							if (!features) return null;
							return features.map((feature, idx) => (
								<mesh
									key={`overview-lab-${systemKey}-${idx}`}
									position={feature.position}
									rotation={feature.rotation}
									onClick={(e) => handleMeshClick(e, systemKey)}
								>
									<planeGeometry args={[feature.scale, feature.scale, 32, 32]} />
									<primitive attach='material' object={feature.material} />
								</mesh>
							));
						})}
					</group>
				)}

			{/* 2. Specific Selected Category Pain Area — when viewing an isolated organ */}
			{shouldShowPainArea &&
				selectedCategory &&
				selectedCategory !== "total" &&
				selectedCategory !== "ClinicalNotes" &&
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

			{/* 3. Lab-result-driven body highlights when viewing an isolated organ */}
			{shouldShowLabOverlays &&
				selectedCategory !== "total" &&
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
