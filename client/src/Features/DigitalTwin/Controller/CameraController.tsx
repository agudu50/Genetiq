import { useFrame, useThree } from "@react-three/fiber";
import { useCamera } from "../Context/CameraContext";
import { Vector3 } from "three";
import { useRef, useEffect } from "react";

const CameraController = () => {
	const { camera } = useThree();
	const { cameraState } = useCamera();
	const rotationRef = useRef<number>(0);
	const isDraggingRef = useRef<boolean>(false);
	const previousMouseXRef = useRef<number>(0);
	const currentPositionRef = useRef(new Vector3());
	const currentZoomRef = useRef(camera.zoom);
	const targetYRef = useRef(0);
	const currentYRef = useRef(0);
	const lastTargetZoomRef = useRef(cameraState.targetZoom);
	const zoomStartTimeRef = useRef(Date.now());
	const POSITION_LERP_FACTOR = 0.025;
	const Y_LERP_FACTOR = 0.03;

	// Zoom control constants
	const ZOOM_SPEED = 0.035;
	const ZOOM_THRESHOLD = 0.005;

	useEffect(() => {
		if (lastTargetZoomRef.current !== cameraState.targetZoom) {
			zoomStartTimeRef.current = Date.now();
			lastTargetZoomRef.current = cameraState.targetZoom;
		}
	}, [cameraState.targetZoom]);

	useEffect(() => {
		const handleMouseDown = (e: MouseEvent) => {
			isDraggingRef.current = true;
			previousMouseXRef.current = e.clientX;
		};

		const handleMouseUp = () => {
			isDraggingRef.current = false;
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!isDraggingRef.current) return;

			const deltaX = e.clientX - previousMouseXRef.current;
			const sensitivity = 0.01;
			rotationRef.current -= deltaX * sensitivity;
			previousMouseXRef.current = e.clientX;
		};

		const handleMouseLeave = () => {
			isDraggingRef.current = false;
		};

		const canvas = document.querySelector("canvas");
		if (!canvas) return;

		canvas.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("mouseup", handleMouseUp);
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			canvas.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("mouseup", handleMouseUp);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, []);

	useFrame(() => {
		// Position and rotation handling
		targetYRef.current = cameraState.targetPosition[1];
		currentYRef.current +=
			(targetYRef.current - currentYRef.current) * Y_LERP_FACTOR;

		const targetPosition = new Vector3(
			cameraState.targetPosition[0],
			currentYRef.current,
			cameraState.targetPosition[2],
		);

		const distance = targetPosition.length() || 200; // Default distance if zero
		const rotatedPosition = new Vector3(
			Math.sin(rotationRef.current) * distance,
			currentYRef.current,
			Math.cos(rotationRef.current) * distance,
		);

		currentPositionRef.current.lerp(rotatedPosition, POSITION_LERP_FACTOR);
		camera.position.copy(currentPositionRef.current);
		camera.lookAt(0, currentYRef.current, 0);

		// Simple direct zoom to target
		const zoomDiff = cameraState.targetZoom - currentZoomRef.current;
		if (Math.abs(zoomDiff) > ZOOM_THRESHOLD) {
			currentZoomRef.current += zoomDiff * ZOOM_SPEED;
		} else {
			currentZoomRef.current = cameraState.targetZoom;
		}

		camera.zoom = currentZoomRef.current;
		camera.updateProjectionMatrix();
	});

	return null;
};

export default CameraController;
