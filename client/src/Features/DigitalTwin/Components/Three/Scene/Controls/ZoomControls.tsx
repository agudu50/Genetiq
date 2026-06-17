import { useZoom } from "../Hooks/UseZoom";

const ZoomControls = () => {
	const { handleZoomIn, handleZoomOut, zoomState } = useZoom();
	const { isZoomInDisabled, isZoomOutDisabled } = zoomState;

	return (
		<>
			<button
				type="button"
				onClick={handleZoomIn}
				className='control-btn'
				disabled={isZoomInDisabled}
				aria-label="Zoom in"
			>
				<span>+</span>
			</button>
			<button
				type="button"
				onClick={handleZoomOut}
				className='control-btn'
				disabled={isZoomOutDisabled}
				aria-label="Zoom out"
			>
				<span>−</span>
			</button>
		</>
	);
};

export default ZoomControls;
