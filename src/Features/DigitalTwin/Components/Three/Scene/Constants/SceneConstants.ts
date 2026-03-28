export const SCENE_CONSTANTS = {
	ZOOM_FACTOR: 1.05,
	DEFAULT_ZOOM: 10,
	MAX_ZOOM: 60,
	MIN_ZOOM: 10,
	MODEL_ZOOM_VALUE: 1.1,
} as const;

export const CAMERA_SETTINGS = {
	NEAR: 0.1,
	FAR: 2000,
	DEFAULT_POSITION: [0, 0, 800] as [number, number, number],
	DEFAULT_ZOOM: 5,
} as const;

export const TRANSITION_CAMERA_SETTINGS = {
	POSITION: [0, 0, 2000] as [number, number, number],
	ZOOM: 0.8,
} as const;

export const INTERMEDIATE_CAMERA_SETTINGS = {
	POSITION: [0, 0, 1800] as [number, number, number],
	ZOOM: 0.9,
} as const;

export const ZOOM_CONFIGS: Record<
	string,
	{ position: [number, number, number]; zoom: number }
> = {
	total: { position: [0, 0, 200], zoom: 8 },
	ClinicalNotes: { position: [0, -25, 200], zoom: 4.8 },
	StressManagement: { position: [0, 30, 200], zoom: 25 },
	CardioLoad: { position: [0, 20, 200], zoom: 15 },
	Pulmonology: { position: [0, 10, 200], zoom: 43 },
	Gastroenterolgy: { position: [0, 7, 200], zoom: 45 },
	Endocrinology: { position: [0, 25, 200], zoom: 45 },
	Pulmonology1: { position: [0, -15, 200], zoom: 17 },
	Urology: { position: [0, -10, 200], zoom: 35 },
	UlnaRadiusAlt: { position: [0, 0, 200], zoom: 10 },
	Gynecology: { position: [0, -15, 200], zoom: 40 },
	Hematology: { position: [0, 0, 200], zoom: 8 },
	Nephrology: { position: [0, 0, 200], zoom: 12 },
	Alergy: { position: [10, 25, 200], zoom: 30 },
	OxygenSaturation: { position: [0, 0, 200], zoom: 10 },
	cardiovascular: { position: [0, 20, 200], zoom: 15 },
};
