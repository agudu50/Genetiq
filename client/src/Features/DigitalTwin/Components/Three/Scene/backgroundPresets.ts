import type { CSSProperties } from "react";
import canvasBgImage from "@assets/DigitalTwin/images/canvas-bg.jpg";

export type CanvasBackgroundId =
	| "clinical"
	| "studio"
	| "slate"
	| "midnight"
	| "ocean"
	| "violet"
	| "warm";

export interface CanvasBackgroundPreset {
	id: CanvasBackgroundId;
	labelKey: string;
	bgColor: string;
	bgImage: string | null;
	bgSize: "contain" | "cover";
	blendMode: "multiply" | "normal" | "overlay" | "soft-light";
	vignetteColor: string;
	showScanline: boolean;
	preview: string;
}

export const CANVAS_BG_STORAGE_KEY = "genetiq_canvas_background";

export const CANVAS_BACKGROUND_PRESETS: CanvasBackgroundPreset[] = [
	{
		id: "clinical",
		labelKey: "canvas_bg_clinical",
		bgColor: "#f0f2f5",
		bgImage: `url(${canvasBgImage})`,
		bgSize: "contain",
		blendMode: "multiply",
		vignetteColor: "#f0f2f5",
		showScanline: true,
		preview: "linear-gradient(135deg, #f0f2f5 0%, #dbeafe 100%)",
	},
	{
		id: "studio",
		labelKey: "canvas_bg_studio",
		bgColor: "#ffffff",
		bgImage: null,
		bgSize: "cover",
		blendMode: "normal",
		vignetteColor: "#ffffff",
		showScanline: false,
		preview: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
	},
	{
		id: "slate",
		labelKey: "canvas_bg_slate",
		bgColor: "#e2e8f0",
		bgImage: null,
		bgSize: "cover",
		blendMode: "normal",
		vignetteColor: "#e2e8f0",
		showScanline: false,
		preview: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
	},
	{
		id: "midnight",
		labelKey: "canvas_bg_midnight",
		bgColor: "#0a0e1a",
		bgImage: null,
		bgSize: "cover",
		blendMode: "normal",
		vignetteColor: "#0a0e1a",
		showScanline: false,
		preview: "linear-gradient(135deg, #0a0e1a 0%, #1e293b 100%)",
	},
	{
		id: "ocean",
		labelKey: "canvas_bg_ocean",
		bgColor: "#0c4a6e",
		bgImage:
			"radial-gradient(ellipse 80% 60% at 50% 20%, rgba(56, 189, 248, 0.35), transparent 60%), linear-gradient(180deg, #0c4a6e 0%, #082f49 100%)",
		bgSize: "cover",
		blendMode: "normal",
		vignetteColor: "#0c4a6e",
		showScanline: false,
		preview: "linear-gradient(135deg, #0ea5e9 0%, #0c4a6e 100%)",
	},
	{
		id: "violet",
		labelKey: "canvas_bg_violet",
		bgColor: "#1e1b4b",
		bgImage:
			"radial-gradient(ellipse 70% 55% at 50% 15%, rgba(139, 92, 246, 0.28), transparent 62%), linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)",
		bgSize: "cover",
		blendMode: "normal",
		vignetteColor: "#1e1b4b",
		showScanline: false,
		preview: "linear-gradient(135deg, #7c3aed 0%, #1e1b4b 100%)",
	},
	{
		id: "warm",
		labelKey: "canvas_bg_warm",
		bgColor: "#faf5ef",
		bgImage: null,
		bgSize: "cover",
		blendMode: "normal",
		vignetteColor: "#faf5ef",
		showScanline: false,
		preview: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
	},
];

export const DEFAULT_CANVAS_BACKGROUND: CanvasBackgroundId = "clinical";

export function getCanvasBackgroundPreset(id: string): CanvasBackgroundPreset {
	return (
		CANVAS_BACKGROUND_PRESETS.find((preset) => preset.id === id) ??
		CANVAS_BACKGROUND_PRESETS[0]
	);
}

export function getCanvasBackgroundStyle(
	preset: CanvasBackgroundPreset,
): CSSProperties {
	return {
		["--canvas-vignette" as string]: preset.vignetteColor,
		backgroundColor: preset.bgColor,
		backgroundImage: preset.bgImage ?? "none",
		backgroundSize: preset.bgSize,
		backgroundBlendMode: preset.blendMode,
		backgroundPosition: "center",
		backgroundRepeat: "no-repeat",
	};
}
