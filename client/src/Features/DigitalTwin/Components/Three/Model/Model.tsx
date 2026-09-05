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
import {
	Patient3DData,
	derivePatient3DGlowConfig,
} from "./Utils/patientModelMapping";
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
	patientData?: Patient3DData;
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
	patientData,
	onModelChange,
	isPaused = false,
	selectedCategory: propCategory,
}: ExtendedModelProps & { isPaused?: boolean }) {
	const cardioTextures = useCardioTextures();
	const bodyTextures = useBodyTextures();
	const groupRef = useRef<THREE.Group>(null);
	const patientGlowLightRef = useRef<THREE.PointLight>(null);
	const patientGlowBackLightRef = useRef<THREE.PointLight>(null);
	const dispatch = useDispatch();
	const reduxCategory = useSelector(
		(state: RootState) => state.category.selectedCategory,
	);
	const selectedCategory = propCategory !== undefined ? propCategory : reduxCategory;
	const user = useSelector((state: RootState) => state.user);
	const activeAlerts = useSelector(
		(state: RootState) => state.triage.activeAlerts,
	);

	// ─── Patient-specific glowing telemetry (Doctor Portal) ──────────────
	const patientGlow = useMemo(() => {
		return patientData ? derivePatient3DGlowConfig(patientData) : null;
	}, [patientData]);

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
		// If patientData is present (Doctor Portal), prioritize patient clinical symptoms & labs
		if (patientGlow) {
			const aliasMap: Record<string, string> = {
				Respiratory: "Pulmonology",
				Digestive: "Gastroenterolgy",
				Endocrine: "Endocrinology",
				Renal: "Pulmonology1",
				Urological: "Urology",
				Neurological: "StressManagement",
				Musculoskeletal: "UlnaRadiusAlt",
				Cardiovascular: "cardiovascular",
				cardiovascular: "cardiovascular",
				Hematology: "Hematology",
			};

			const defaultPalette: Record<string, [number, number, number]> = {
				Cardiovascular: [0xfbbf24, 0xf59e0b, 0xb45309], // Golden Amber
				Respiratory: [0x38bdf8, 0x0284c7, 0x0369a1],    // Electric Cyan
				Renal: [0xfb923c, 0xea580c, 0x9a3412],          // Warm Tangerine / Coral
				Endocrine: [0xc084fc, 0x9333ea, 0x581c87],      // Vivid Amethyst
				Neurological: [0x818cf8, 0x4f46e5, 0x312e81],   // Electric Indigo
				Digestive: [0x34d399, 0x059669, 0x064e3b],      // Emerald
				Musculoskeletal: [0x2dd4bf, 0x0d9488, 0x115e59],// Mint
				Urological: [0xfacc15, 0xca8a04, 0x713f12],     // Yellow Ochre
				Hematology: [0xf43f5e, 0xe11d48, 0x881337],     // Ruby Rose
			};

			const pMats: Record<string, THREE.ShaderMaterial> = {};
			for (const sys of Object.keys(defaultPalette)) {
				const sysKey = aliasMap[sys] || sys;
				const customGlow = patientGlow.affectedSystems.get(sysKey) || patientGlow.affectedSystems.get(sys);
				if (customGlow) {
					pMats[sys] = createGlowingMaterial(
						customGlow.coreColor,
						customGlow.midColor,
						customGlow.outerColor,
					);
				} else {
					const std = defaultPalette[sys];
					pMats[sys] = createGlowingMaterial(
						new THREE.Color(std[0]),
						new THREE.Color(std[1]),
						new THREE.Color(std[2]),
					);
				}
			}
			pMats.General = painAreaMaterial;
			return pMats;
		}

		// Fallback for regular Patient Dashboard / non-doctor screens
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
						new THREE.Color(0xef4444),
						new THREE.Color(0xdc2626),
						new THREE.Color(0x7f1d1d),
					] as [THREE.Color, THREE.Color, THREE.Color];
				if (alert.urgency === "Yellow")
					return [
						new THREE.Color(0xfbbf24),
						new THREE.Color(0xf59e0b),
						new THREE.Color(0xb45309),
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

			// 3. Clinical Profile Highlights with distinct organ colors
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
					new THREE.Color(0xfbbf24), // Vibrant Golden-Amber Chest Glow
					new THREE.Color(0xf59e0b),
					new THREE.Color(0xb45309),
				] as [THREE.Color, THREE.Color, THREE.Color];
			}

			const isRenal =
				system === "Renal" &&
				user?.medicalConditions?.some((c: string) =>
					/renal|kidney|egfr|filtration/i.test(c),
				);
			if (isRenal) {
				return [
					new THREE.Color(0xfb923c), // Warm Tangerine / Coral Glow
					new THREE.Color(0xea580c),
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
					new THREE.Color(0x38bdf8), // Electric Cyan / Azure Glow
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
					new THREE.Color(0x818cf8), // Electric Indigo / Cobalt Glow
					new THREE.Color(0x4f46e5),
					new THREE.Color(0x312e81),
				] as [THREE.Color, THREE.Color, THREE.Color];
			}

			const isEndo =
				system === "Endocrine" &&
				user?.medicalConditions?.some((c: string) =>
					/glucose|sugar|diabetes|thyroid/i.test(c),
				);
			if (isEndo) {
				return [
					new THREE.Color(0xc084fc), // Vivid Amethyst / Violet Glow
					new THREE.Color(0x9333ea),
					new THREE.Color(0x581c87),
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
				...getColor("Cardiovascular", [0xfbbf24, 0xf59e0b, 0xb45309]),
			),
			Respiratory: createGlowingMaterial(
				...getColor("Respiratory", [0x38bdf8, 0x0284c7, 0x0369a1]),
			),
			Digestive: createGlowingMaterial(
				...getColor("Digestive", [0x34d399, 0x059669, 0x064e3b]),
			),
			Endocrine: createGlowingMaterial(
				...getColor("Endocrine", [0xc084fc, 0x9333ea, 0x581c87]),
			),
			Renal: createGlowingMaterial(
				...getColor("Renal", [0xfb923c, 0xea580c, 0x9a3412]),
			),
			Urological: createGlowingMaterial(
				...getColor("Urological", [0xfacc15, 0xca8a04, 0x713f12]),
			),
			Neurological: createGlowingMaterial(
				...getColor("Neurological", [0x818cf8, 0x4f46e5, 0x312e81]),
			),
			Musculoskeletal: createGlowingMaterial(
				...getColor("Musculoskeletal", [0x2dd4bf, 0x0d9488, 0x115e59]),
			),
			Hematology: createGlowingMaterial(
				...getColor("Hematology", [0xf43f5e, 0xe11d48, 0x881337]),
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
	}, [patientGlow, activeAlerts, labHighlights]);

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
					scale: 2.6,
					material: materials.Cardiovascular,
				}, // Heart Hotspot Point
			],
			Cardiovascular: [
				{
					position: [0.8, 17.5, 2.2],
					rotation: [0, 0, 0],
					scale: 2.6,
					material: materials.Cardiovascular,
				}, // Heart Hotspot Point
			],
			CardioLoad: [
				{
					position: [0.8, 17.5, 2.2],
					rotation: [0, 0, 0],
					scale: 2.6,
					material: materials.Cardiovascular,
				}, // Heart Hotspot Point
			],
			Pulmonology: [
				{
					position: [-1.8, 15, 1.8],
					rotation: [0, 0, 0],
					scale: 2.4,
					material: materials.Respiratory,
				}, // Left Lung Point
				{
					position: [1.8, 15, 1.8],
					rotation: [0, 0, 0],
					scale: 2.4,
					material: materials.Respiratory,
				}, // Right Lung Point
			],
			Gastroenterolgy: [
				{
					position: [0, 10, 2.5],
					rotation: [0, 0, 0],
					scale: 2.5,
					material: materials.Digestive,
				}, // Digestive Point
			],
			Endocrinology: [
				{
					position: [0, 24, 1.8],
					rotation: [-0.2, 0, 0],
					scale: 2.2,
					material: materials.Endocrine,
				}, // Thyroid Point
			],
			Pulmonology1: [
				// Renal
				{
					position: [-2, 8, -1.8],
					rotation: [0, Math.PI, 0],
					scale: 2.3,
					material: materials.Renal,
				}, // Left Kidney Point
				{
					position: [2, 8, -1.8],
					rotation: [0, Math.PI, 0],
					scale: 2.3,
					material: materials.Renal,
				}, // Right Kidney Point
			],
			Urology: [
				{
					position: [0, 0, 1.5],
					rotation: [0, 0, 0],
					scale: 2.2,
					material: materials.Urological,
				}, // Bladder Point
			],
			StressManagement: [
				// Neurological
				{
					position: [0, 31, 1],
					rotation: [-0.2, 0, 0],
					scale: 2.4,
					material: materials.Neurological,
				}, // Brain Point
			],
			UlnaRadiusAlt: [
				// Musculoskeletal
				{
					position: [-6, 15, 0],
					rotation: [0, 0, 0],
					scale: 2.2,
					material: materials.Musculoskeletal,
				}, // Left Joint Point
				{
					position: [6, 15, 0],
					rotation: [0, 0, 0],
					scale: 2.2,
					material: materials.Musculoskeletal,
				}, // Right Joint Point
			],
			Hematology: [
				{
					position: [0, 15, 1.5],
					rotation: [0, 0, 0],
					scale: 2.8,
					material: materials.Hematology || materials.Respiratory,
				},
			],
		};

		// ─── Inject lab-result highlights as additional overlay features ─────
		// Position configs for lab system keys that aren't already in the base map
		const LAB_SYSTEM_POSITIONS: Record<
			string,
			{ position: [number, number, number]; rotation: [number, number, number]; scale: number }[]
		> = {
			// Hematology → torso center point
			Hematology: [
				{ position: [0, 15, 1.5], rotation: [0, 0, 0], scale: 2.8 },
			],
			// Cardiovascular → heart region point
			cardiovascular: [
				{ position: [0.8, 17.5, 2.2], rotation: [0, 0, 0], scale: 2.6 },
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
	}, [materials, labHighlights, patientGlow]);

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
		const uniformGlow = createGlowingMaterial(
			new THREE.Color(0xfbbf24), // Vibrant Yellow / Golden-Amber
			new THREE.Color(0xf59e0b),
			new THREE.Color(0x92400e),
		);
		return {
			apobLdl: uniformGlow,
			afib: uniformGlow,
			hscrp: uniformGlow,
		};
	}, []);

	// Patient-specific cardio glowing hotspot materials
	const patientCardioMaterials: Record<string, THREE.ShaderMaterial> = useMemo(() => {
		if (!patientGlow) return {};
		const mats: Record<string, THREE.ShaderMaterial> = {};
		for (const spot of patientGlow.cardioHotspots) {
			mats[spot.id] = createGlowingMaterial(
				spot.coreColor,
				spot.midColor,
				spot.outerColor,
			);
		}
		return mats;
	}, [patientGlow]);

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

		// 2. Animate all glowing materials with patient-specific or standard organic pulse
		const pulseRate = patientGlow ? patientGlow.pulseSpeed : 1.5;
		const slowPulse = Math.sin(time * pulseRate) * 0.5 + 0.5;
		const heartPulse = Math.pow(Math.max(0.0, Math.sin(time * pulseRate)), 2.0) * 0.8;

		// Animate patient biometric glow lights
		if (patientGlowLightRef.current && patientGlow) {
			const pulseMultiplier = Math.sin(time * pulseRate) * 0.35 + 1.0;
			patientGlowLightRef.current.intensity = patientGlow.lightIntensity * pulseMultiplier;
		}
		if (patientGlowBackLightRef.current && patientGlow) {
			const pulseMultiplier = Math.cos(time * pulseRate) * 0.25 + 0.8;
			patientGlowBackLightRef.current.intensity = (patientGlow.lightIntensity * 0.6) * pulseMultiplier;
		}

		const allActiveMaterials = [
			...Object.values(materials),
			...Object.values(cardioHotspotMaterials),
			...Object.values(patientCardioMaterials),
		];

		for (const mat of allActiveMaterials) {
			if (mat && mat.uniforms) {
				mat.uniforms.time.value = time;
				mat.uniforms.pulse.value = heartPulse;
				mat.uniforms.intensity.value = 0.85 + slowPulse * 0.45;
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

			{/* Cardiovascular 3D Model Clinical Hotspots */}
			{shouldShowCardioHotspots && (
				<group>
					{patientGlow ? (
						patientGlow.cardioHotspots.map((spot) => {
							const mat = patientCardioMaterials[spot.id] || cardioHotspotMaterials.apobLdl;
							return (
								<mesh
									key={`patient-cardio-${spot.id}`}
									position={spot.position}
									onClick={(e) => handleMeshClick(e, "Cardiovascular")}
								>
									<planeGeometry args={[spot.scale, spot.scale, 32, 32]} />
									<primitive attach='material' object={mat} />
								</mesh>
							);
						})
					) : (
						<>
							{/* 1. Coronary Artery / LAD: ApoB 128 mg/dL & LDL 142 mg/dL Atheroma Burden */}
							<mesh
								position={[0.8, 21.2, 3.2]}
								onClick={(e) => handleMeshClick(e, "Cardiovascular")}
							>
								<planeGeometry args={[1.5, 1.5, 32, 32]} />
								<primitive attach='material' object={cardioHotspotMaterials.apobLdl} />
							</mesh>

							{/* 2. Sinoatrial Node / Right Atrium: Paroxysmal Atrial Fibrillation */}
							<mesh
								position={[-1.4, 23.8, 2.0]}
								onClick={(e) => handleMeshClick(e, "Cardiovascular")}
							>
								<planeGeometry args={[1.4, 1.4, 32, 32]} />
								<primitive attach='material' object={cardioHotspotMaterials.afib} />
							</mesh>

							{/* 3. Myocardial Micro-Vascular Bed: hs-CRP 3.4 mg/L Inflammatory Stress */}
							<mesh
								position={[1.2, 18.8, 2.8]}
								onClick={(e) => handleMeshClick(e, "Cardiovascular")}
							>
								<planeGeometry args={[1.4, 1.4, 32, 32]} />
								<primitive attach='material' object={cardioHotspotMaterials.hscrp} />
							</mesh>
						</>
					)}
				</group>
			)}

			{/* 1. Full Body (Overview) Active Clinical Hotspots & Organ Systems */}
			{shouldShowPainArea &&
				(selectedCategory === "total" || !selectedCategory) && (
					<group>
						{patientGlow ? (
							Array.from(patientGlow.affectedSystems.entries()).map(([sysKey]) => {
								const features = systemFeatures[sysKey];
								if (!features) return null;
								return features.map((feature, idx) => (
									<mesh
										key={`patient-glow-total-${sysKey}-${idx}`}
										position={feature.position}
										rotation={feature.rotation}
										onClick={(e) => handleMeshClick(e, sysKey)}
									>
										<planeGeometry args={[feature.scale, feature.scale, 32, 32]} />
										<primitive attach='material' object={feature.material} />
									</mesh>
								));
							})
						) : (
							<>
								{/* Cardiovascular System: Heart (Golden Amber Glow) */}
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

								{/* Renal System: Kidneys (Warm Tangerine Glow) */}
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

								{/* Respiratory System: Lungs (Electric Cyan Glow) */}
								{systemFeatures.Pulmonology?.map((feature, idx) => (
									<mesh
										key={`overview-resp-${idx}`}
										position={feature.position}
										rotation={feature.rotation}
										onClick={(e) => handleMeshClick(e, "Pulmonology")}
									>
										<planeGeometry args={[feature.scale, feature.scale, 32, 32]} />
										<primitive attach='material' object={feature.material} />
									</mesh>
								))}

								{/* Neurological System: Brain (Electric Indigo Glow) */}
								{systemFeatures.StressManagement?.map((feature, idx) => (
									<mesh
										key={`overview-neuro-${idx}`}
										position={feature.position}
										rotation={feature.rotation}
										onClick={(e) => handleMeshClick(e, "StressManagement")}
									>
										<planeGeometry args={[feature.scale, feature.scale, 32, 32]} />
										<primitive attach='material' object={feature.material} />
									</mesh>
								))}

								{/* Endocrine System: Thyroid / Metabolism (Vivid Amethyst Glow) */}
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

								{/* Additional lab findings */}
								{Array.from(labHighlights.entries()).map(([systemKey]) => {
									if (
										systemKey === "cardiovascular" ||
										systemKey === "Cardiovascular" ||
										systemKey === "Pulmonology1" ||
										systemKey === "Pulmonology" ||
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
							</>
						)}
					</group>
				)}

			{/* Category-based pain areas — when a specific system has an active alert or lab finding or patient finding */}
			{shouldShowPainArea &&
				selectedCategory &&
				selectedCategory !== "total" &&
				selectedCategory !== "ClinicalNotes" &&
				((patientGlow && patientGlow.affectedSystems.has(selectedCategory)) ||
					activeAlerts.some(
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

			{/* Biometric patient-specific glowing point lights */}
			{patientGlow && (
				<>
					<pointLight
						ref={patientGlowLightRef}
						position={[0, 16, 18]}
						color={patientGlow.auraColor}
						intensity={patientGlow.lightIntensity}
						distance={90}
						decay={2}
					/>
					<pointLight
						ref={patientGlowBackLightRef}
						position={[0, 10, -16]}
						color={patientGlow.auraColor}
						intensity={patientGlow.lightIntensity * 0.7}
						distance={80}
						decay={2}
					/>
				</>
			)}

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
