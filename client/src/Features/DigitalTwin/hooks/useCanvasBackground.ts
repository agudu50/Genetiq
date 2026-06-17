import { useCallback, useEffect, useState } from "react";
import {
	CANVAS_BG_STORAGE_KEY,
	CanvasBackgroundId,
	DEFAULT_CANVAS_BACKGROUND,
	getCanvasBackgroundPreset,
	getCanvasBackgroundStyle,
} from "../Components/Three/Scene/backgroundPresets";

function readStoredBackground(): CanvasBackgroundId {
	if (typeof localStorage === "undefined") return DEFAULT_CANVAS_BACKGROUND;

	const stored = localStorage.getItem(CANVAS_BG_STORAGE_KEY);
	if (
		stored &&
		getCanvasBackgroundPreset(stored).id === stored
	) {
		return stored as CanvasBackgroundId;
	}

	return DEFAULT_CANVAS_BACKGROUND;
}

export function useCanvasBackground() {
	const [backgroundId, setBackgroundId] = useState<CanvasBackgroundId>(
		readStoredBackground,
	);

	const preset = getCanvasBackgroundPreset(backgroundId);

	useEffect(() => {
		localStorage.setItem(CANVAS_BG_STORAGE_KEY, backgroundId);
	}, [backgroundId]);

	const selectBackground = useCallback((id: CanvasBackgroundId) => {
		setBackgroundId(id);
	}, []);

	return {
		backgroundId,
		preset,
		selectBackground,
		wrapperStyle: getCanvasBackgroundStyle(preset),
	};
}
