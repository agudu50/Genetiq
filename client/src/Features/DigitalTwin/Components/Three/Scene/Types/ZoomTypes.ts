export type ModelType = "body" | "cardio";

export interface ZoomState {
	isZoomInDisabled: boolean;
	isZoomOutDisabled: boolean;
	nextZoomIn: number;
	nextZoomOut: number;
}
