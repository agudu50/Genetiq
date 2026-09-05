import * as THREE from "three";

export interface Patient3DSymptom {
	id: string;
	name: string;
	severity: number;
	duration?: string;
	urgency: "Red" | "Yellow" | "Green";
	notes?: string;
}

export interface Patient3DLabMarker {
	marker: string;
	value: string;
	refRange?: string;
	status: "critical_high" | "elevated" | "optimal" | "low";
	system: string;
	clinicalInsight?: string;
}

export interface Patient3DData {
	id: string;
	mrn?: string;
	name: string;
	age?: number;
	gender?: "Male" | "Female";
	status: "urgent" | "monitoring" | "stable";
	primaryDiagnosis?: string;
	defaultOrgan?: string;
	symptoms?: Patient3DSymptom[];
	labMarkers?: Patient3DLabMarker[];
}

export interface SystemGlowConfig {
	systemKey: string;
	systemName: string;
	urgency: "urgent" | "warning" | "optimal";
	coreColor: THREE.Color;
	midColor: THREE.Color;
	outerColor: THREE.Color;
	pulseSpeed: number;
	intensity: number;
	label: string;
}

export interface CardioHotspotConfig {
	id: string;
	title: string;
	position: [number, number, number];
	scale: number;
	coreColor: THREE.Color;
	midColor: THREE.Color;
	outerColor: THREE.Color;
	pulseSpeed: number;
	intensity: number;
	label: string;
}

export interface Patient3DGlowResult {
	patientId: string;
	patientName: string;
	status: "urgent" | "monitoring" | "stable";
	auraColor: THREE.Color;
	auraHex: string;
	lightIntensity: number;
	pulseSpeed: number;
	telemetryBadge: string;
	affectedSystems: Map<string, SystemGlowConfig>;
	cardioHotspots: CardioHotspotConfig[];
}

/**
 * Derives dynamic 3D glowing light parameters and organ hotspot colors based on
 * the active patient assigned to the doctor.
 */
export function derivePatient3DGlowConfig(patient: Patient3DData): Patient3DGlowResult {
	const status = patient.status || "stable";

	// 1. Overall biometric scene illumination & aura
	let auraHex = "#10b981"; // Serene Emerald
	let lightIntensity = 1.0;
	let pulseSpeed = 1.2;
	let telemetryBadge = "Optimal Vital Baseline";

	if (status === "urgent") {
		auraHex = "#ef4444"; // Urgent Crimson
		lightIntensity = 1.8;
		pulseSpeed = 3.2;
		telemetryBadge = "Critical Clinical Telemetry";
	} else if (status === "monitoring") {
		auraHex = "#f59e0b"; // Monitoring Amber
		lightIntensity = 1.4;
		pulseSpeed = 2.0;
		telemetryBadge = "Elevated Biometric Surveillance";
	}

	const auraColor = new THREE.Color(auraHex);

	// 2. Identify affected systems from symptoms and lab markers
	const affectedSystems = new Map<string, SystemGlowConfig>();

	// Color palette definitions
	const RED_COLORS = {
		core: new THREE.Color(0xff2222),
		mid: new THREE.Color(0xee1111),
		outer: new THREE.Color(0x990000),
	};
	const AMBER_COLORS = {
		core: new THREE.Color(0xffaa00),
		mid: new THREE.Color(0xff7700),
		outer: new THREE.Color(0x993300),
	};
	const VIOLET_COLORS = {
		core: new THREE.Color(0xe879f9), // Bright Fuchsia / Violet
		mid: new THREE.Color(0xa855f7),
		outer: new THREE.Color(0x6b21a8),
	};
	const EMERALD_COLORS = {
		core: new THREE.Color(0x34d399), // Mint / Emerald
		mid: new THREE.Color(0x10b981),
		outer: new THREE.Color(0x064e3b),
	};
	const CYAN_COLORS = {
		core: new THREE.Color(0x38bdf8), // Sky / Cyan
		mid: new THREE.Color(0x06b6d4),
		outer: new THREE.Color(0x164e63),
	};

	const symptoms = patient.symptoms || [];
	const labMarkers = patient.labMarkers || [];

	// Map symptoms to 3D system keys
	symptoms.forEach((s) => {
		const name = s.name.toLowerCase();
		const isRed = s.urgency === "Red";
		const speed = isRed ? 3.0 : 2.0;
		const colors = isRed ? RED_COLORS : AMBER_COLORS;
		const urgencyLevel = isRed ? "urgent" : "warning";

		if (name.includes("palpitation") || name.includes("shortness of breath") || name.includes("chest")) {
			// Cardiovascular & Respiratory
			affectedSystems.set("cardiovascular", {
				systemKey: "cardiovascular",
				systemName: "Cardiovascular",
				urgency: urgencyLevel,
				coreColor: colors.core,
				midColor: colors.mid,
				outerColor: colors.outer,
				pulseSpeed: speed,
				intensity: isRed ? 1.6 : 1.2,
				label: s.name,
			});
			affectedSystems.set("Pulmonology", {
				systemKey: "Pulmonology",
				systemName: "Respiratory",
				urgency: urgencyLevel,
				coreColor: colors.core,
				midColor: colors.mid,
				outerColor: colors.outer,
				pulseSpeed: speed,
				intensity: isRed ? 1.5 : 1.1,
				label: s.name,
			});
		}


		if (name.includes("fatigue") || name.includes("cold") || name.includes("thyroid")) {
			// Endocrine / Thyroid
			affectedSystems.set("Endocrinology", {
				systemKey: "Endocrinology",
				systemName: "Endocrine",
				urgency: urgencyLevel,
				coreColor: VIOLET_COLORS.core,
				midColor: VIOLET_COLORS.mid,
				outerColor: VIOLET_COLORS.outer,
				pulseSpeed: speed,
				intensity: 1.4,
				label: s.name,
			});
		}
	});

	// Map lab markers to 3D system keys
	labMarkers.forEach((m) => {
		const isElevatedOrLow = m.status === "elevated" || m.status === "low" || m.status === "critical_high";
		if (!isElevatedOrLow) return;

		const sys = (m.system || "").toLowerCase();
		const marker = m.marker.toLowerCase();
		const isCritical = m.status === "critical_high" || marker.includes("creatinine") || marker.includes("troponin") || marker.includes("apob");
		const speed = isCritical ? 3.0 : 2.0;
		const colors = isCritical ? RED_COLORS : AMBER_COLORS;
		const urgencyLevel = isCritical ? "urgent" : "warning";

		if (sys.includes("heart") || sys.includes("cardio") || marker.includes("apob") || marker.includes("ldl") || marker.includes("crp")) {
			affectedSystems.set("cardiovascular", {
				systemKey: "cardiovascular",
				systemName: "Cardiovascular",
				urgency: urgencyLevel,
				coreColor: colors.core,
				midColor: colors.mid,
				outerColor: colors.outer,
				pulseSpeed: speed,
				intensity: isCritical ? 1.6 : 1.2,
				label: `${m.marker}: ${m.value}`,
			});
		}

		if (sys.includes("renal") || sys.includes("kidney") || marker.includes("egfr") || marker.includes("creatinine") || marker.includes("bun")) {
			// Renal / Kidneys
			affectedSystems.set("Pulmonology1", {
				systemKey: "Pulmonology1",
				systemName: "Renal",
				urgency: urgencyLevel,
				coreColor: colors.core,
				midColor: colors.mid,
				outerColor: colors.outer,
				pulseSpeed: speed,
				intensity: isCritical ? 1.6 : 1.3,
				label: `${m.marker}: ${m.value}`,
			});
		}

		if (sys.includes("endocrine") || sys.includes("thyroid") || marker.includes("tsh") || marker.includes("vitamin d")) {
			affectedSystems.set("Endocrinology", {
				systemKey: "Endocrinology",
				systemName: "Endocrine",
				urgency: urgencyLevel,
				coreColor: VIOLET_COLORS.core,
				midColor: VIOLET_COLORS.mid,
				outerColor: VIOLET_COLORS.outer,
				pulseSpeed: speed,
				intensity: 1.4,
				label: `${m.marker}: ${m.value}`,
			});
		}

		if (sys.includes("metabolic") || marker.includes("glucose") || marker.includes("hba1c") || marker.includes("sugar")) {
			// Digestive / Metabolic
			affectedSystems.set("Gastroenterolgy", {
				systemKey: "Gastroenterolgy",
				systemName: "Metabolic / Digestive",
				urgency: urgencyLevel,
				coreColor: AMBER_COLORS.core,
				midColor: AMBER_COLORS.mid,
				outerColor: AMBER_COLORS.outer,
				pulseSpeed: speed,
				intensity: 1.3,
				label: `${m.marker}: ${m.value}`,
			});
		}
	});

	// If the patient is completely optimal (e.g. Sarah Lin), add serene homeostatic vital glow
	if (status === "stable" && affectedSystems.size === 0) {
		affectedSystems.set("cardiovascular", {
			systemKey: "cardiovascular",
			systemName: "Cardiovascular",
			urgency: "optimal",
			coreColor: EMERALD_COLORS.core,
			midColor: EMERALD_COLORS.mid,
			outerColor: EMERALD_COLORS.outer,
			pulseSpeed: 1.2,
			intensity: 0.9,
			label: "Optimal Sinus Rhythm & Cellular Tone",
		});
		affectedSystems.set("Pulmonology", {
			systemKey: "Pulmonology",
			systemName: "Respiratory",
			urgency: "optimal",
			coreColor: CYAN_COLORS.core,
			midColor: CYAN_COLORS.mid,
			outerColor: CYAN_COLORS.outer,
			pulseSpeed: 1.1,
			intensity: 0.8,
			label: "Optimal Oxygenation & Tidal Volume",
		});
	}

	// 3. Custom cardio model hotspots based on the patient's condition
	const cardioHotspots: CardioHotspotConfig[] = [];
	const diagnosis = (patient.primaryDiagnosis || "").toLowerCase();

	if (patient.id === "pt-101" || diagnosis.includes("fibrillation") || diagnosis.includes("apob")) {
		// Marcus Vance: High ApoB, AFib, hs-CRP
		cardioHotspots.push({
			id: "apob",
			title: "ApoB 128 mg/dL & LDL Atheroma Burden",
			position: [0.8, 21.2, 3.2],
			scale: 3.6,
			coreColor: new THREE.Color(0xf59e0b),
			midColor: new THREE.Color(0xd97706),
			outerColor: new THREE.Color(0x78350f),
			pulseSpeed: 2.2,
			intensity: 1.4,
			label: "Coronary Artery / LAD Atheroma",
		});
		cardioHotspots.push({
			id: "afib",
			title: "Paroxysmal Atrial Fibrillation Arrhythmia",
			position: [-1.4, 23.8, 2.0],
			scale: 3.5,
			coreColor: new THREE.Color(0xef4444),
			midColor: new THREE.Color(0xdc2626),
			outerColor: new THREE.Color(0x7f1d1d),
			pulseSpeed: 3.6,
			intensity: 1.7,
			label: "Sinoatrial Node / Right Atrium",
		});
		cardioHotspots.push({
			id: "hscrp",
			title: "hs-CRP 3.4 mg/L Inflammatory Stress",
			position: [1.2, 18.8, 2.8],
			scale: 3.4,
			coreColor: new THREE.Color(0xf43f5e),
			midColor: new THREE.Color(0xe11d48),
			outerColor: new THREE.Color(0x881337),
			pulseSpeed: 2.5,
			intensity: 1.5,
			label: "Myocardial Micro-Vascular Bed",
		});
	} else if (patient.id === "pt-103" || diagnosis.includes("hypertension")) {
		// David Campbell: Stage 2 Hypertension & Renal strain
		cardioHotspots.push({
			id: "hypertension_aorta",
			title: "Aortic Root Hypertensive Pressure Load (158/96 mmHg)",
			position: [0.0, 23.0, 2.8],
			scale: 4.2,
			coreColor: new THREE.Color(0xef4444),
			midColor: new THREE.Color(0xdc2626),
			outerColor: new THREE.Color(0x7f1d1d),
			pulseSpeed: 3.2,
			intensity: 1.6,
			label: "Ascending Aorta & Wall Shear Stress",
		});
		cardioHotspots.push({
			id: "lv_hypertrophy",
			title: "Left Ventricular Wall Pressure Strain",
			position: [1.5, 17.5, 2.5],
			scale: 3.8,
			coreColor: new THREE.Color(0xf97316),
			midColor: new THREE.Color(0xea580c),
			outerColor: new THREE.Color(0x7c2d12),
			pulseSpeed: 2.8,
			intensity: 1.4,
			label: "Left Ventricular Myocardium",
		});
	} else if (patient.id === "pt-102" || diagnosis.includes("thyroid") || diagnosis.includes("diabetes")) {
		// Elena Rostova: Mild metabolic cardiovascular baseline
		cardioHotspots.push({
			id: "metabolic_vascular",
			title: "Micro-Vascular Metabolic Surveillance (Fasting Glucose 112 mg/dL)",
			position: [0.5, 19.5, 2.7],
			scale: 3.0,
			coreColor: new THREE.Color(0xf59e0b),
			midColor: new THREE.Color(0xd97706),
			outerColor: new THREE.Color(0x78350f),
			pulseSpeed: 1.8,
			intensity: 1.1,
			label: "Myocardial Perfusion Bed",
		});
	} else {
		// Sarah Lin (or optimal longevity baseline): Harmonious, serene vital rhythm
		cardioHotspots.push({
			id: "optimal_cardio",
			title: "Optimal Sinus Rhythm (ApoB 72 mg/dL, hs-CRP 0.4 mg/L)",
			position: [0.0, 20.0, 2.5],
			scale: 3.4,
			coreColor: new THREE.Color(0x34d399),
			midColor: new THREE.Color(0x10b981),
			outerColor: new THREE.Color(0x064e3b),
			pulseSpeed: 1.2,
			intensity: 1.0,
			label: "Sinus Node Homeostasis",
		});
	}

	return {
		patientId: patient.id,
		patientName: patient.name,
		status,
		auraColor,
		auraHex,
		lightIntensity,
		pulseSpeed,
		telemetryBadge,
		affectedSystems,
		cardioHotspots,
	};
}
