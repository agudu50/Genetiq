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
} from "./Utils/materialUtils";
import { useModelTransforms } from "./Hooks/useModelTransforms";
import {
	createGlowingMaterial,
	painAreaMaterial,
} from "./Utils/painAreaMaterial";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { setSymptomsInput } from "@/App/Redux/triageSlice";

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
	textures: ModelTextures | BodyModelTextures;
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
	const model = useLoader(OBJLoader, "/assets/models/normal/normal.obj");

	useEffect(() => {
		if (!model) return;
		model.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				if (child.name === "Body_final") {
					child.raycast = new THREE.Mesh().raycast;
					child.userData.clickable = true;
				}
				const material = createBodyMaterial(textures as BodyModelTextures);
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

	const [opacity, setOpacity] = useState(isNew ? 0 : 1);
	const [shouldRender, setShouldRender] = useState(!isNew);
	const [hasFadedOut, setHasFadedOut] = useState(false);
	const { currentPosition, currentScale, updateTransforms } =
		useModelTransforms(position, scale);

	const [pointerDownTime, setPointerDownTime] = useState(0);

	const activeMaterialKey = useMemo(() => {
		const mapping: Record<string, string> = {
			Pulmonology: "Respiratory",
			Gastroenterolgy: "Digestive",
			Endocrinology: "Endocrine",
			Pulmonology1: "Renal",
			Urology: "Urological",
			StressManagement: "Neurological",
			UlnaRadiusAlt: "Musculoskeletal",
		};
		return mapping[selectedCategory || ""] || "General";
	}, [selectedCategory]);

	const materials: Record<string, THREE.ShaderMaterial> = useMemo(() => {
		const getColor = (system: string, standard: [number, number, number]) => {
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
			return [
				new THREE.Color(standard[0]),
				new THREE.Color(standard[1]),
				new THREE.Color(standard[2]),
			] as [THREE.Color, THREE.Color, THREE.Color];
		};

		return {
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
	}, [activeAlerts]);

	const systemFeatures: Record<
		string,
		{
			position: [number, number, number];
			rotation: [number, number, number];
			scale: number;
			material: THREE.ShaderMaterial;
		}[]
	> = useMemo(
		() => ({
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
		}),
		[materials],
	);

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

		updateTransforms(position, scale);

		// 1. Optimized Opacity & Visibility Handling (using refs)
		let currentOpacity = opacity;
		if (isHidden && modelType !== "cardio") {
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

		// Direct material update via ref (avoids traverse)
		if (groupRef.current) {
			groupRef.current.traverse((child) => {
				if (child instanceof THREE.Mesh && child.material) {
					const mat = child.material as THREE.Material;
					mat.opacity = currentOpacity;
					mat.visible = !isHidden && shouldRender && currentOpacity > 0;
				}
			});
		}

		// 2. Optimized Material Uniforms (selective update)
		const time = state.clock.getElapsedTime();
		const updateMaterialUniforms = (mat: THREE.ShaderMaterial) => {
			if (!mat) return;
			mat.uniforms.time.value = time;
			const pulse =
				Math.pow(Math.abs(Math.sin(time * 2.0)), 3) * 0.7 +
				Math.pow(Math.abs(Math.sin(time * 8.0)), 2) * 0.3;
			mat.uniforms.pulse.value = pulse;
			mat.uniforms.intensity.value = 0.7 + pulse * 0.3;
		};

		// Only animate relevant materials
		if (materials[activeMaterialKey]) {
			updateMaterialUniforms(materials[activeMaterialKey]);
		}
		if (activeMaterialKey !== "General") {
			updateMaterialUniforms(materials.General);
		}
	});

	useEffect(() => {
		if (isNew && !shouldRender && startFadeIn) {
			setShouldRender(true);
		}
	}, [isNew, shouldRender, startFadeIn]);

	if (
		(!shouldRender || (isFading && opacity <= 0) || isHidden) &&
		modelType !== "cardio"
	)
		return null;

	const shouldShowPainArea =
		modelType === "body" && shouldRender && !isHidden && opacity > 0;

	return (
		<group onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
			{modelType === "body" ? (
				<BodyModelContent
					modelType={modelType}
					textures={bodyTextures}
					isHidden={isHidden}
					shouldRender={shouldRender}
					position={currentPosition}
					rotation={rotation}
					scale={currentScale}
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
					position={currentPosition}
					rotation={rotation}
					scale={currentScale}
					handlePointerDown={handlePointerDown}
					handlePointerUp={handlePointerUp}
					groupRef={groupRef}
				/>
			)}
			{shouldShowPainArea &&
				(systemFeatures[selectedCategory || ""] ? (
					systemFeatures[selectedCategory || ""].map((feature, idx) => (
						<mesh
							key={idx}
							position={feature.position}
							rotation={feature.rotation}
							onClick={(e) => handleMeshClick(e, selectedCategory || "")}
						>
							<planeGeometry args={[feature.scale, feature.scale, 32, 32]} />
							<primitive attach='material' object={feature.material} />
						</mesh>
					))
				) : selectedCategory === "ClinicalNotes" ||
				  selectedCategory === "total" ? (
					<mesh
						position={[1, 15, 1.5]}
						rotation={[0, 0, 0]}
						onClick={(e) => handleMeshClick(e, "Chest")}
					>
						<planeGeometry args={[15, 15, 32, 32]} />
						<primitive attach='material' object={materials.General} />
					</mesh>
				) : null)}
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
