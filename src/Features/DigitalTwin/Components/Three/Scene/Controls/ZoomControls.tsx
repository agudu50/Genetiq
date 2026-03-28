import { useZoom } from "../Hooks/UseZoom";

const ZoomControls = () => {
	const { handleZoomIn, handleZoomOut, zoomState } = useZoom();
	const { isZoomInDisabled, isZoomOutDisabled } = zoomState;

	return (
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
	);
};

export default ZoomControls;
