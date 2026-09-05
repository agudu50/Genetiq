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

	// Distinct clinical color palettes for each organ issue
	const CARDIO_COLORS = {
		core: new THREE.Color(0xfbbf24), // Golden Amber (Cardiovascular / Heart)
		mid: new THREE.Color(0xf59e0b),
		outer: new THREE.Color(0xb45309),
	};
	const RENAL_COLORS = {
		core: new THREE.Color(0xfb923c), // Warm Tangerine / Coral (Renal / Kidneys)
		mid: new THREE.Color(0xea580c),
		outer: new THREE.Color(0x9a3412),
	};
	const RESP_COLORS = {
		core: new THREE.Color(0x38bdf8), // Electric Cyan (Respiratory / Lungs)
		mid: new THREE.Color(0x0284c7),
		outer: new THREE.Color(0x0369a1),
	};
	const ENDO_COLORS = {
		core: new THREE.Color(0xc084fc), // Vivid Amethyst (Endocrine / Metabolism / Thyroid)
		mid: new THREE.Color(0x9333ea),
		outer: new THREE.Color(0x581c87),
	};
	const NEURO_COLORS = {
		core: new THREE.Color(0x818cf8), // Electric Indigo (Neurological / Brain / Fatigue)
		mid: new THREE.Color(0x4f46e5),
		outer: new THREE.Color(0x312e81),
	};
	const GASTRO_COLORS = {
		core: new THREE.Color(0x34d399), // Emerald (Digestive / Gastrointestinal)
		mid: new THREE.Color(0x059669),
		outer: new THREE.Color(0x064e3b),
	};
	const EMERALD_COLORS = {
		core: new THREE.Color(0x34d399), // Mint / Emerald
		mid: new THREE.Color(0x10b981),
		outer: new THREE.Color(0x064e3b),
	};

	const symptoms = patient.symptoms || [];
	const labMarkers = patient.labMarkers || [];

	// Map symptoms to 3D system keys with distinct organ colors
	symptoms.forEach((s) => {
		const name = s.name.toLowerCase();
		const isRed = s.urgency === "Red";
		const speed = isRed ? 3.0 : 2.0;
		const urgencyLevel = isRed ? "urgent" : "warning";

		if (name.includes("palpitation") || name.includes("chest") || name.includes("heart")) {
			// Cardiovascular → Golden Amber
			affectedSystems.set("cardiovascular", {
				systemKey: "cardiovascular",
				systemName: "Cardiovascular",
				urgency: urgencyLevel,
				coreColor: CARDIO_COLORS.core,
				midColor: CARDIO_COLORS.mid,
				outerColor: CARDIO_COLORS.outer,
				pulseSpeed: speed,
				intensity: isRed ? 1.6 : 1.3,
				label: s.name,
			});
		}

		if (name.includes("shortness of breath") || name.includes("breath") || name.includes("cough")) {
			// Respiratory → Electric Cyan
			affectedSystems.set("Pulmonology", {
				systemKey: "Pulmonology",
				systemName: "Respiratory",
				urgency: urgencyLevel,
				coreColor: RESP_COLORS.core,
				midColor: RESP_COLORS.mid,
				outerColor: RESP_COLORS.outer,
				pulseSpeed: speed,
				intensity: 1.3,
				label: s.name,
			});
		}

		if (name.includes("fatigue") || name.includes("stress") || name.includes("headache") || name.includes("dizzi")) {
			// Neurological / Cognitive → Electric Indigo
			affectedSystems.set("StressManagement", {
				systemKey: "StressManagement",
				systemName: "Neurological",
				urgency: urgencyLevel,
				coreColor: NEURO_COLORS.core,
				midColor: NEURO_COLORS.mid,
				outerColor: NEURO_COLORS.outer,
				pulseSpeed: speed,
				intensity: 1.3,
				label: s.name,
			});
		}

		if (name.includes("cold") || name.includes("thyroid") || name.includes("heat")) {
			// Endocrine / Thyroid → Vivid Amethyst
			affectedSystems.set("Endocrinology", {
				systemKey: "Endocrinology",
				systemName: "Endocrine",
				urgency: urgencyLevel,
				coreColor: ENDO_COLORS.core,
				midColor: ENDO_COLORS.mid,
				outerColor: ENDO_COLORS.outer,
				pulseSpeed: speed,
				intensity: 1.3,
				label: s.name,
			});
		}
	});

	// Map lab markers to 3D system keys with distinct organ colors
	labMarkers.forEach((m) => {
		const isElevatedOrLow = m.status === "elevated" || m.status === "low" || m.status === "critical_high";
		if (!isElevatedOrLow) return;

		const sys = (m.system || "").toLowerCase();
		const marker = m.marker.toLowerCase();
		const isCritical = m.status === "critical_high" || marker.includes("creatinine") || marker.includes("troponin") || marker.includes("apob");
		const speed = isCritical ? 2.8 : 2.0;
		const urgencyLevel = isCritical ? "urgent" : "warning";

		if (sys.includes("heart") || sys.includes("cardio") || marker.includes("apob") || marker.includes("ldl") || marker.includes("crp")) {
			// Cardiovascular → Golden Amber
			affectedSystems.set("cardiovascular", {
				systemKey: "cardiovascular",
				systemName: "Cardiovascular",
				urgency: urgencyLevel,
				coreColor: CARDIO_COLORS.core,
				midColor: CARDIO_COLORS.mid,
				outerColor: CARDIO_COLORS.outer,
				pulseSpeed: speed,
				intensity: isCritical ? 1.6 : 1.3,
				label: `${m.marker}: ${m.value}`,
			});
		}

		if (sys.includes("renal") || sys.includes("kidney") || marker.includes("egfr") || marker.includes("creatinine") || marker.includes("bun")) {
			// Renal / Kidneys → Warm Tangerine / Coral
			affectedSystems.set("Pulmonology1", {
				systemKey: "Pulmonology1",
				systemName: "Renal",
				urgency: urgencyLevel,
				coreColor: RENAL_COLORS.core,
				midColor: RENAL_COLORS.mid,
				outerColor: RENAL_COLORS.outer,
				pulseSpeed: speed,
				intensity: isCritical ? 1.6 : 1.3,
				label: `${m.marker}: ${m.value}`,
			});
		}

		if (sys.includes("resp") || sys.includes("lung") || marker.includes("spo2") || marker.includes("oxygen")) {
			// Respiratory → Electric Cyan
			affectedSystems.set("Pulmonology", {
				systemKey: "Pulmonology",
				systemName: "Respiratory",
				urgency: urgencyLevel,
				coreColor: RESP_COLORS.core,
				midColor: RESP_COLORS.mid,
				outerColor: RESP_COLORS.outer,
				pulseSpeed: speed,
				intensity: 1.3,
				label: `${m.marker}: ${m.value}`,
			});
		}

		if (sys.includes("endocrine") || sys.includes("thyroid") || marker.includes("tsh") || marker.includes("glucose") || marker.includes("hba1c")) {
			// Endocrine / Metabolic → Vivid Amethyst
			affectedSystems.set("Endocrinology", {
				systemKey: "Endocrinology",
				systemName: "Endocrine",
				urgency: urgencyLevel,
				coreColor: ENDO_COLORS.core,
				midColor: ENDO_COLORS.mid,
				outerColor: ENDO_COLORS.outer,
				pulseSpeed: speed,
				intensity: 1.3,
				label: `${m.marker}: ${m.value}`,
			});
		}

		if (sys.includes("metabolic") || sys.includes("digestive") || sys.includes("liver") || marker.includes("alt") || marker.includes("ast") || marker.includes("bilirubin")) {
			// Digestive / Gastrointestinal → Emerald
			affectedSystems.set("Gastroenterolgy", {
				systemKey: "Gastroenterolgy",
				systemName: "Metabolic / Digestive",
				urgency: urgencyLevel,
				coreColor: GASTRO_COLORS.core,
				midColor: GASTRO_COLORS.mid,
				outerColor: GASTRO_COLORS.outer,
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
	}

	// 3. Custom cardio model hotspots based on the patient's condition
	const cardioHotspots: CardioHotspotConfig[] = [];
	const diagnosis = (patient.primaryDiagnosis || "").toLowerCase();

	if (patient.id === "pt-101" || diagnosis.includes("fibrillation") || diagnosis.includes("apob")) {
		// Marcus Vance: High ApoB, AFib, hs-CRP — matching the exact color tokens from Full Body Overview
		cardioHotspots.push({
			id: "apob",
			title: "ApoB 128 mg/dL & LDL Atheroma Burden",
			position: [0.8, 21.2, 3.2],
			scale: 3.8,
			coreColor: new THREE.Color(0xfbbf24), // 1. Golden Amber (Cardiovascular)
			midColor: new THREE.Color(0xf59e0b),
			outerColor: new THREE.Color(0xb45309),
			pulseSpeed: 2.2,
			intensity: 1.6,
			label: "Coronary Artery / LAD Atheroma",
		});
		cardioHotspots.push({
			id: "afib",
			title: "Paroxysmal Atrial Fibrillation Arrhythmia",
			position: [-1.4, 23.8, 2.0],
			scale: 3.5,
			coreColor: new THREE.Color(0xfb923c), // 2. Warm Tangerine / Coral (Renal / Electrophysiology)
			midColor: new THREE.Color(0xea580c),
			outerColor: new THREE.Color(0x9a3412),
			pulseSpeed: 2.5,
			intensity: 1.6,
			label: "Sinoatrial Node / Right Atrium",
		});
		cardioHotspots.push({
			id: "pulmonary_outflow",
			title: "Pulmonary Arterial Oxygenation Outflow (SpO2 96%)",
			position: [-0.6, 25.4, 2.8],
			scale: 3.4,
			coreColor: new THREE.Color(0x38bdf8), // 3. Electric Cyan (Respiratory / Pulmonary)
			midColor: new THREE.Color(0x0284c7),
			outerColor: new THREE.Color(0x0369a1),
			pulseSpeed: 2.0,
			intensity: 1.5,
			label: "Pulmonary Arterial Outflow Tract",
		});
		cardioHotspots.push({
			id: "autonomic_plexus",
			title: "Cardiac Autonomic Plexus & Sympathetic Stress",
			position: [0.2, 26.2, 1.6],
			scale: 3.5,
			coreColor: new THREE.Color(0x818cf8), // 4. Electric Indigo (Neurological / Autonomic Tone)
			midColor: new THREE.Color(0x4f46e5),
			outerColor: new THREE.Color(0x312e81),
			pulseSpeed: 2.4,
			intensity: 1.5,
			label: "Cardiac Autonomic Ganglia",
		});
		cardioHotspots.push({
			id: "hscrp",
			title: "hs-CRP 3.4 mg/L Inflammatory Stress",
			position: [1.2, 18.8, 2.8],
			scale: 3.6,
			coreColor: new THREE.Color(0xc084fc), // 5. Vivid Amethyst (Endocrine / Inflammatory)
			midColor: new THREE.Color(0x9333ea),
			outerColor: new THREE.Color(0x581c87),
			pulseSpeed: 2.2,
			intensity: 1.6,
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
