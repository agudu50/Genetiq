import { Canvas } from "@react-three/fiber";
import { useEffect, useState, Suspense } from "react";
import { useCamera } from "../../../Context/CameraContext";
import {
	SCENE_CONSTANTS,
	CAMERA_SETTINGS,
	TRANSITION_CAMERA_SETTINGS,
	INTERMEDIATE_CAMERA_SETTINGS,
	ZOOM_CONFIGS,
} from "./Constants/SceneConstants";
import { ModelType } from "./Types/ZoomTypes";
import Model from "../Model/Model";
import CameraController from "../../../Controller/CameraController";
import SideBar from "../../SideBar/SideBar";
import { useCanvasBackground } from "../../../hooks/useCanvasBackground";
import BackgroundPicker from "./Controls/BackgroundPicker";
import ZoomControls from "./Controls/ZoomControls";
import "./canvas.scss";
interface MainSceneProps {
	selectedCategory: string | null;
	sidebarCollapsed?: boolean;
	onSidebarToggle?: () => void;
	onSidebarSelectionMade?: () => void;
	isPaused?: boolean;
}

const MainScene: React.FC<MainSceneProps> = ({
	selectedCategory,
	sidebarCollapsed,
	onSidebarToggle,
	onSidebarSelectionMade,
	isPaused = false,
}) => {
	const { cameraState, setCameraState } = useCamera();
	const { backgroundId, preset, selectBackground, wrapperStyle } =
		useCanvasBackground();
	const [modelType, setModelType] = useState<ModelType>(() =>
		selectedCategory === "cardiovascular" ? "cardio" : "body",
	);
	const [previousModelType, setPreviousModelType] = useState<ModelType | null>(
		null,
	);
	const [isModelHidden, setIsModelHidden] = useState(false);
	const [startNewModelFade, setStartNewModelFade] = useState(true);
	const [pendingCameraConfig, setPendingCameraConfig] = useState<{
		position: [number, number, number];
		zoom: number;
	} | null>(() => {
		// Initialize camera config based on selected Category
		if (selectedCategory === "cardiovascular") {
			return {
				position: [0, 20, 200],
				zoom: 20,
			};
		} else {
			return {
				position: [0, 0, 200],
				zoom: 8,
			};
		}
	});
	const { MODEL_ZOOM_VALUE } = SCENE_CONSTANTS;

	const moveCamera = (
		position: [number, number, number],
		zoom: number,
		delay = 0,
	) => {
		setTimeout(() => {
			setCameraState({
				targetPosition: position,
				targetZoom: zoom,
			});
		}, delay);
	};

	const handleModelTransitionComplete = () => {
		setPreviousModelType(null);

		if (pendingCameraConfig) {
			if (modelType === "cardio") {
				moveCamera(pendingCameraConfig.position, pendingCameraConfig.zoom);
				setPendingCameraConfig(null);
				setStartNewModelFade(true);
			} else {
				setIsModelHidden(true);
				moveCamera(
					TRANSITION_CAMERA_SETTINGS.POSITION,
					TRANSITION_CAMERA_SETTINGS.ZOOM,
				);

				setTimeout(() => {
					moveCamera(
						INTERMEDIATE_CAMERA_SETTINGS.POSITION,
						INTERMEDIATE_CAMERA_SETTINGS.ZOOM,
						0,
					);

					setTimeout(() => {
						moveCamera(pendingCameraConfig.position, pendingCameraConfig.zoom);
						setIsModelHidden(false);
						setPendingCameraConfig(null);
						setStartNewModelFade(true);
					}, 190);
				}, 280);
			}
		} else {
			setStartNewModelFade(true);
		}
	};

	useEffect(() => {
		if (!selectedCategory) return;

		const config = ZOOM_CONFIGS[selectedCategory];
		if (config) {
			const targetModelType =
				selectedCategory === "cardiovascular" ||
				selectedCategory === "CardioLoad"
					? "cardio"
					: "body";
			handleModelChange(targetModelType, config);
		} else if (selectedCategory === "total") {
			handleModelChange("body", ZOOM_CONFIGS.total);
		}
	}, [selectedCategory]);

	const handleModelChange = (
		type: ModelType,
		cameraConfig: {
			position: [number, number, number];
			zoom: number;
		},
	) => {
		if (type === modelType && !isModelHidden && !previousModelType) {
			if (cameraConfig) {
				moveCamera(cameraConfig.position, cameraConfig.zoom);
			}
			return;
		}

		setStartNewModelFade(false);
		setPreviousModelType(modelType);
		setModelType(type);
		setPendingCameraConfig(cameraConfig);
	};

	return (
		<div className='canvas-container'>
			<SideBar
				onModelChange={handleModelChange}
				modelType={modelType}
				externalCollapsed={sidebarCollapsed}
				onExternalToggle={onSidebarToggle}
				onSelectionMade={onSidebarSelectionMade}
			/>
			<div
				className='canvas-wrapper'
				data-bg={backgroundId}
				data-scanline={preset.showScanline ? "true" : "false"}
				style={wrapperStyle}
			>
				<Canvas
					orthographic
					frameloop={isPaused ? "never" : "always"}
					dpr={isPaused ? 1 : [1, 1.15]}
					gl={{
						powerPreference: "high-performance",
						antialias: true,
						stencil: false,
						alpha: true,
					}}
					onCreated={({ gl }) => {
						gl.setClearColor(0x000000, 0);
					}}
					camera={{
						near: CAMERA_SETTINGS.NEAR,
						far: CAMERA_SETTINGS.FAR,
						zoom: cameraState.targetZoom,
						position: cameraState.targetPosition,
					}}
				>
					<CameraController />
					<Suspense fallback={null}>
						{previousModelType && (
							<Model
								key={`previous-${previousModelType}`}
								scale={[MODEL_ZOOM_VALUE, MODEL_ZOOM_VALUE, MODEL_ZOOM_VALUE]}
								position={[0, (-MODEL_ZOOM_VALUE * 70) / 2 - 1 - 5, 0]}
								modelType={previousModelType}
								isFading={true}
								onTransitionComplete={handleModelTransitionComplete}
								isHidden={isModelHidden}
								isPaused={isPaused}
							/>
						)}
						<Model
							key={`current-${modelType}`}
							scale={[MODEL_ZOOM_VALUE, MODEL_ZOOM_VALUE, MODEL_ZOOM_VALUE]}
							position={[0, (-MODEL_ZOOM_VALUE * 70) / 2 - 1 - 8, 0]}
							modelType={modelType}
							isNew={true}
							isHidden={isModelHidden}
							startFadeIn={startNewModelFade}
							onModelChange={handleModelChange}
							isPaused={isPaused}
						/>
					</Suspense>
				</Canvas>
				<div className='canvas-controls'>
					<BackgroundPicker value={backgroundId} onChange={selectBackground} />
					<ZoomControls />
				</div>
			</div>
		</div>
	);
};

export default MainScene;
