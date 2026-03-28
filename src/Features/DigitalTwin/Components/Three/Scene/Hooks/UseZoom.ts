import { useCallback, useMemo } from "react";
import { SCENE_CONSTANTS } from "../Constants/SceneConstants";
import { ZoomState } from "../Types/ZoomTypes";
import { useCamera } from "@/Features/DigitalTwin/Context/CameraContext";

export const useZoom = () => {
	const { cameraState, setCameraState } = useCamera();
	const { ZOOM_FACTOR, MAX_ZOOM, MIN_ZOOM, DEFAULT_ZOOM } = SCENE_CONSTANTS;

	const handleZoomIn = useCallback(() => {
		const newZoom = cameraState.targetZoom * ZOOM_FACTOR;
		if (newZoom <= MAX_ZOOM) {
			setCameraState({
				...cameraState,
				targetZoom: newZoom,
			});
		}
	}, [cameraState, setCameraState]);

	const handleZoomOut = useCallback(() => {
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
	}, [cameraState, setCameraState]);

	const zoomState = useMemo<ZoomState>(() => {
		const nextZoomIn = cameraState.targetZoom * ZOOM_FACTOR;
		const nextZoomOut = cameraState.targetZoom / ZOOM_FACTOR;

		return {
			nextZoomIn,
			nextZoomOut,
			isZoomInDisabled: nextZoomIn > MAX_ZOOM,
			isZoomOutDisabled: nextZoomOut < MIN_ZOOM,
		};
	}, [cameraState.targetZoom]);

	return {
		handleZoomIn,
		handleZoomOut,
		zoomState,
	};
};
