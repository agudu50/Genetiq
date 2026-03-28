import { Canvas } from "@react-three/fiber";
import { useCamera } from "../../Context/CameraContext";
import CameraController from "@/Features/DigitalTwin/Controller/CameraController";
import SideBar from "@/Features/DigitalTwin/Components/SideBar/SideBar";
import { useEffect, useState, Suspense } from "react";
import Model from "./Model/Model";
import "./Scene/canvas.scss";
import { useParams } from "react-router-dom";

const MainScene = (props: { useSideBar?: boolean }) => {
	const zoomValue = 1.1;
	const { cameraState, setCameraState } = useCamera();
	const [modelType, setModelType] = useState<"body" | "cardio">("body");
	const { systemName } = useParams();

	const ZOOM_FACTOR = 1.05;
	const DEFAULT_ZOOM = 10;
	const MAX_ZOOM = 60;
	const MIN_ZOOM = DEFAULT_ZOOM;

	useEffect(() => {
		// Set appropriate model type based on system name
		if (systemName?.toLowerCase() === "cardiovascular") {
			setModelType("cardio");
			// Adjust camera for cardio view
			setCameraState({
				targetPosition: [0, 20, 200],
				targetZoom: 15,
			});
		} else {
			setModelType("body");
			// Reset camera for body view
			setCameraState({
				targetPosition: [0, 0, 200],
				targetZoom: 8,
			});
		}
	}, [systemName, setCameraState]);

	const handleZoomIn = () => {
		const newZoom = cameraState.targetZoom * ZOOM_FACTOR;
		if (newZoom <= MAX_ZOOM) {
			setCameraState({
				...cameraState,
				targetZoom: newZoom,
			});
		}
	};

	const handleZoomOut = () => {
		const newZoom = cameraState.targetZoom / ZOOM_FACTOR;
		if (newZoom >= MIN_ZOOM) {
			setCameraState({
				...cameraState,
				targetZoom: newZoom,
			});
		} else {
			setCameraState({
				...cameraState,
				targetZoom: DEFAULT_ZOOM,
			});
		}
	};

	const nextZoomIn = cameraState.targetZoom * ZOOM_FACTOR;
	const isZoomInDisabled = nextZoomIn > MAX_ZOOM;
	const nextZoomOut = cameraState.targetZoom / ZOOM_FACTOR;
	const isZoomOutDisabled = nextZoomOut < MIN_ZOOM;

	return (
		<div className='canvas-container'>
			{props.useSideBar ? (
				<SideBar onModelChange={setModelType} modelType={modelType} />
			) : null}
			<div className='canvas-wrapper'>
				<Canvas
					orthographic
					camera={{
						near: 0.0001,
						far: 20000,
						zoom: cameraState.targetZoom,
						position: cameraState.targetPosition,
					}}
				>
					<CameraController />
					<Suspense fallback={null}>
						<Model
							key={modelType}
							scale={[zoomValue, zoomValue, zoomValue]}
							position={[0, (-zoomValue * 70) / 2 - 1, 0]}
							modelType={modelType}
						/>
					</Suspense>
				</Canvas>
				<div className='canvas-controls'>
					<button
						onClick={handleZoomIn}
						className='control-btn'
						disabled={isZoomInDisabled}
					>
						<span>+</span>
					</button>
					<button
						onClick={handleZoomOut}
						className='control-btn'
						disabled={isZoomOutDisabled}
					>
						<span>−</span>
					</button>
				</div>
				{/* Enhanced mobile help section */}
				<div className='mobile-help-box'>
					<span className='help-title'>Need help?</span>
					<p className='help-desc'>
						Contact our{" "}
						<a href='mailto:support@genetiq.com' className='help-link'>
							support team
						</a>{" "}
						or check out our{" "}
						<a href='/getting-started' className='help-link'>
							getting started guide
						</a>
						.
					</p>
				</div>
				{/* Modern cards section */}
				<div className='feature-cards'>
					<div className='feature-card coming-soon'>
						<div className='feature-card-header'>Take quiz</div>
						<div className='feature-card-body'>
							Answer a few quick questions to receive a personalised health plan
							tailored to your needs.
						</div>
						<div className='feature-card-footer'>Coming Soon</div>
					</div>
					<div className='feature-card coming-soon'>
						<div className='feature-card-header'>
							Buy Supplements, Peptides, & Diagnostic Tests
						</div>
						<div className='feature-card-body'>
							Order custom-formulated supplements designed specifically for your
							health goals and genetic profile.
						</div>
						<div className='feature-card-footer'>Coming Soon</div>
					</div>
					<div className='feature-card'>
						<div className='feature-card-header'>Upload files</div>
						<div className='feature-card-body'>
							Securely upload your test results to get precise recommendations
							based on your medical history.
						</div>
					</div>
					<div className='feature-card'>
						<div className='feature-card-header'>Connect a device app</div>
						<div className='feature-card-body'>
							Sync your favorite health tracking apps and devices for real-time
							insights and better health monitoring.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MainScene;
