// Hooks/useModelTransforms.ts
import { useState } from "react";
import { Vector3Tuple } from "three";

export function useModelTransforms(
	initialPosition: Vector3Tuple,
	initialScale: Vector3Tuple,
) {
	const [currentPosition, setCurrentPosition] =
		useState<Vector3Tuple>(initialPosition);
	const [currentScale, setCurrentScale] = useState<Vector3Tuple>(initialScale);

	const updateTransforms = (position: Vector3Tuple, scale: Vector3Tuple) => {
		setCurrentPosition((prev) => [
			prev[0] + (position[0] - prev[0]) * 0.1,
			prev[1] + (position[1] - prev[1]) * 0.1,
			prev[2] + (position[2] - prev[2]) * 0.1,
		]);

		setCurrentScale((prev) => [
			prev[0] + (scale[0] - prev[0]) * 0.1,
			prev[1] + (scale[1] - prev[1]) * 0.1,
			prev[2] + (scale[2] - prev[2]) * 0.1,
		]);
	};

	return {
		currentPosition,
		currentScale,
		updateTransforms,
	};
}
