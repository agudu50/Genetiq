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

	// 3. Dynamically generate 3D Heart hotspots directly from the patient's lab results
	const cardioHotspots: CardioHotspotConfig[] = [];

	if (labMarkers.length > 0) {
		const ANATOMICAL_POSITIONS: [number, number, number][] = [
			[0.8, 21.2, 3.2],   // 1. Anterior Descending / LAD Coronary Artery
			[-1.4, 23.8, 2.0],  // 2. Right Atrium / Sinoatrial Node
			[1.2, 18.8, 2.8],   // 3. Myocardial Micro-Vascular Bed & Apex
			[-0.6, 25.4, 2.8],  // 4. Pulmonary Arterial Outflow Tract
			[0.2, 26.2, 1.6],   // 5. Aortic Arch & Cardiac Autonomic Plexus
			[2.0, 20.2, 2.2],   // 6. Left Circumflex / Lateral Myocardium
		];

		labMarkers.forEach((m, idx) => {
			const marker = m.marker.toLowerCase();
			const sys = (m.system || "").toLowerCase();
			const pos = ANATOMICAL_POSITIONS[idx % ANATOMICAL_POSITIONS.length];
			const isOptimal = m.status === "optimal";
			const isCritical = m.status === "critical_high" || m.status === "elevated" || m.status === "low";

			let coreColor = CARDIO_COLORS.core;
			let midColor = CARDIO_COLORS.mid;
			let outerColor = CARDIO_COLORS.outer;
			const label = m.clinicalInsight ? m.clinicalInsight.split(".")[0] : `${m.system || "Cardiac"} Marker`;

			if (isOptimal) {
				coreColor = EMERALD_COLORS.core; // #34d399 (Optimal Homeostasis)
				midColor = EMERALD_COLORS.mid;   // #10b981
				outerColor = EMERALD_COLORS.outer; // #064e3b
			} else if (marker.includes("apob") || marker.includes("ldl") || marker.includes("lipid") || marker.includes("cholesterol")) {
				// Lipid / Atheroma Burden → Golden Amber
				coreColor = CARDIO_COLORS.core; // #fbbf24
				midColor = CARDIO_COLORS.mid;   // #f59e0b
				outerColor = CARDIO_COLORS.outer; // #b45309
			} else if (marker.includes("crp") || marker.includes("inflammation") || sys.includes("inflamm")) {
				// Inflammatory Marker → Vivid Amethyst
				coreColor = ENDO_COLORS.core; // #c084fc
				midColor = ENDO_COLORS.mid;   // #9333ea
				outerColor = ENDO_COLORS.outer; // #581c87
			} else if (sys.includes("renal") || sys.includes("kidney") || marker.includes("egfr") || marker.includes("creatinine") || marker.includes("bun")) {
				// Cardio-Renal Hemodynamics → Warm Tangerine / Coral
				coreColor = RENAL_COLORS.core; // #fb923c
				midColor = RENAL_COLORS.mid;   // #ea580c
				outerColor = RENAL_COLORS.outer; // #9a3412
			} else if (sys.includes("metabolic") || marker.includes("glucose") || marker.includes("hba1c") || marker.includes("sugar")) {
				// Glycemic / Metabolic Strain → Mint / Emerald
				coreColor = GASTRO_COLORS.core; // #34d399
				midColor = GASTRO_COLORS.mid;   // #059669
				outerColor = GASTRO_COLORS.outer; // #064e3b
			} else if (sys.includes("resp") || sys.includes("lung") || marker.includes("spo2") || marker.includes("oxygen")) {
				// Pulmonary Oxygenation → Electric Cyan
				coreColor = RESP_COLORS.core; // #38bdf8
				midColor = RESP_COLORS.mid;   // #0284c7
				outerColor = RESP_COLORS.outer; // #0369a1
			} else if (sys.includes("endocrine") || sys.includes("thyroid") || marker.includes("tsh") || marker.includes("vitamin d")) {
				// Endocrine / Thyroid → Vivid Amethyst
				coreColor = ENDO_COLORS.core; // #c084fc
				midColor = ENDO_COLORS.mid;   // #9333ea
				outerColor = ENDO_COLORS.outer; // #581c87
			}

			cardioHotspots.push({
				id: `lab-marker-${idx}-${m.marker.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}`,
				title: `${m.marker}: ${m.value} (${m.status.toUpperCase()})`,
				position: pos,
				scale: isOptimal ? 3.4 : (isCritical ? 3.8 : 3.5),
				coreColor,
				midColor,
				outerColor,
				pulseSpeed: isCritical ? 2.6 : 1.4,
				intensity: isCritical ? 1.6 : 1.1,
				label,
			});
		});
	} else {
		// Fallback for patients without explicit lab arrays
		const diagnosis = (patient.primaryDiagnosis || "").toLowerCase();
		if (patient.id === "pt-101" || diagnosis.includes("fibrillation") || diagnosis.includes("apob")) {
			cardioHotspots.push({
				id: "apob",
				title: "ApoB 128 mg/dL & LDL Atheroma Burden",
				position: [0.8, 21.2, 3.2],
				scale: 3.8,
				coreColor: new THREE.Color(0xfbbf24),
				midColor: new THREE.Color(0xf59e0b),
				outerColor: new THREE.Color(0xb45309),
				pulseSpeed: 2.2,
				intensity: 1.6,
				label: "Coronary Artery / LAD Atheroma",
			});
		} else {
			cardioHotspots.push({
				id: "optimal_cardio",
				title: "Optimal Sinus Rhythm & Intima Tone",
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
