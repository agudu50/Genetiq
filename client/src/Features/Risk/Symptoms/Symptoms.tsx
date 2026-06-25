import React, { useState } from "react";
import styles from "./Symptoms.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import {
	HeartPulse,
	Wind,
	BatteryLow,
	AlertTriangle,
	Activity,
	EyeOff,
	Footprints,
	Brain,
	MessageSquareOff,
	Moon,
	Droplet,
	Flame,
	ZapOff,
	ShieldAlert,
	X,
	CheckCircle,
} from "lucide-react";

interface SymptomsProps {
	description?: string;
	symptomList?: string[];
}

interface SymptomDetail {
	definition: string;
	action: string;
	priority: "High" | "Medium";
}

const SYMPTOM_DETAILS: Record<string, SymptomDetail> = {
	"palpitations": {
		definition: "Feelings of having a fast-beating, fluttering, or pounding heart.",
		action: "Rest in a quiet place, practice slow breathing, and log the duration of the event.",
		priority: "Medium"
	},
	"shortness of breath": {
		definition: "Difficulty breathing or feeling like you cannot get enough air.",
		action: "Sit upright, loosen tight clothing. Seek immediate medical assistance if breathing does not settle.",
		priority: "High"
	},
	"fatigue or weakness": {
		definition: "A persistent feeling of tiredness or lack of energy that does not improve with rest.",
		action: "Monitor blood pressure, stay hydrated, and report progressive fatigue to your doctor.",
		priority: "Medium"
	},
	"chest pain": {
		definition: "Discomfort or pain in the chest area, which can feel tight, heavy, or squeezing.",
		action: "Stop all physical activity immediately. Seek urgent emergency services if pain persists for more than 5 minutes.",
		priority: "High"
	},
	"dizziness or lightheadedness": {
		definition: "A sensation of spinning, instability, or feeling like you might faint.",
		action: "Sit or lie down immediately to prevent falls. Drink water and avoid sudden movements.",
		priority: "High"
	},
	// Stroke symptoms
	"sudden numbness or weakness, especially on one side of the body": {
		definition: "Loss of sensation or motor control, usually affecting the face, arm, or leg on one side.",
		action: "Perform the FAST check. Call emergency medical services immediately. Time is critical.",
		priority: "High"
	},
	"confusion or trouble speaking": {
		definition: "Difficulty understanding speech, slurred pronunciation, or inability to express words.",
		action: "Call emergency services immediately. Note the exact time when symptoms started.",
		priority: "High"
	},
	"vision problems in one or both eyes": {
		definition: "Sudden double vision, blurred sight, or complete loss of vision in an eye.",
		action: "Keep your head stable. Contact emergency medical services immediately.",
		priority: "High"
	},
	"difficulty walking, dizziness, or loss of balance": {
		definition: "Unsteadiness on your feet, sudden clumsiness, or coordination issues.",
		action: "Sit down to avoid falls. Seek emergency medical attention.",
		priority: "High"
	},
	"severe headache with no known cause": {
		definition: "An extremely painful headache that starts suddenly, often described as a 'thunderclap' headache.",
		action: "Seek immediate emergency evaluation. Do not take aspirin until a stroke type has been confirmed.",
		priority: "High"
	},
	// CAD symptoms
	"chest pain (angina)": {
		definition: "Chest discomfort caused by reduced blood flow to the heart muscle, often triggered by exertion.",
		action: "Rest immediately. Take prescribed nitroglycerin if available. Call emergency services if pain lasts > 5 mins.",
		priority: "High"
	},
	"fatigue": {
		definition: "Extreme physical or mental tiredness, limiting daily activities.",
		action: "Track daily energy levels and balance activities with scheduled rest periods.",
		priority: "Medium"
	},
	"heart palpitations": {
		definition: "Sensation of a racing, irregular, or skipped heartbeat.",
		action: "Rest, monitor heart rate via smartwatch, and practice deep breathing.",
		priority: "Medium"
	},
	"nausea": {
		definition: "A feeling of sickness in the stomach with an urge to vomit.",
		action: "Sip clear fluids, rest with head elevated. Report if accompanied by chest pain.",
		priority: "Medium"
	},
	// Hypertension symptoms
	"headaches": {
		definition: "Severe pressure or pain in the head, often localized at the back.",
		action: "Measure blood pressure immediately. Rest in a dark, quiet room.",
		priority: "Medium"
	},
	"nosebleeds": {
		definition: "Sudden bleeding from the blood vessels in the nasal passage.",
		action: "Lean forward, pinch the soft part of the nose for 10 minutes. Check blood pressure.",
		priority: "Medium"
	},
	"fatigue or confusion": {
		definition: "Feeling disoriented, tired, or having trouble thinking clearly.",
		action: "Sit down, check vital readings, and contact your care provider if readings are high.",
		priority: "High"
	},
	"vision problems": {
		definition: "Blurred or spotty vision, often linked to extremely high blood pressure.",
		action: "Avoid driving or strain. Sit quietly and seek prompt medical advice.",
		priority: "High"
	},
	// Cardiac arrest / failure symptoms
	"sudden collapse": {
		definition: "Abrupt loss of consciousness and postural tone.",
		action: "Call emergency services immediately. Retrieve an AED and begin CPR.",
		priority: "High"
	},
	"no pulse": {
		definition: "Absence of a detectable heartbeat in the carotid or radial artery.",
		action: "Start high-quality chest compressions immediately.",
		priority: "High"
	},
	"no breathing": {
		definition: "Absence of normal breathing (only gasping or no breath at all).",
		action: "Perform rescue breaths if trained, and continue CPR.",
		priority: "High"
	},
	"loss of consciousness": {
		definition: "State of unresponsiveness to external stimuli.",
		action: "Place in recovery position if breathing. Monitor vitals, call 911.",
		priority: "High"
	},
	"sometimes preceded by chest pain, shortness of breath, or dizziness": {
		definition: "Warning signs occurring minutes to hours before a cardiac event.",
		action: "Seek immediate cardiovascular emergency care.",
		priority: "High"
	}
};

const getSymptomIcon = (symptom: string) => {
	const lower = symptom.toLowerCase();
	if (lower.includes("palpitation")) return <HeartPulse size={13} />;
	if (lower.includes("breath") || lower.includes("breathing")) return <Wind size={13} />;
	if (lower.includes("fatigue") || lower.includes("weakness")) return <BatteryLow size={13} />;
	if (lower.includes("chest pain") || lower.includes("angina")) return <Flame size={13} />;
	if (lower.includes("dizziness") || lower.includes("balance") || lower.includes("lightheaded")) return <Activity size={13} />;
	if (lower.includes("numbness")) return <ZapOff size={13} />;
	if (lower.includes("speech") || lower.includes("speak") || lower.includes("confusion")) return <MessageSquareOff size={13} />;
	if (lower.includes("vision") || lower.includes("eye")) return <EyeOff size={13} />;
	if (lower.includes("walk") || lower.includes("gait")) return <Footprints size={13} />;
	if (lower.includes("headache")) return <Brain size={13} />;
	if (lower.includes("nosebleed")) return <Droplet size={13} />;
	if (lower.includes("collapse")) return <ShieldAlert size={13} />;
	if (lower.includes("pulse")) return <HeartPulse size={13} />;
	if (lower.includes("consciousness") || lower.includes("unconscious")) return <Moon size={13} />;
	return <AlertTriangle size={13} />;
};

export const Symptoms: React.FC<SymptomsProps> = ({
	description,
	symptomList,
}) => {
	const [activeSymptom, setActiveSymptom] = useState<string | null>(null);

	const handleSymptomClick = (symptom: string) => {
		setActiveSymptom((prev) => (prev === symptom ? null : symptom));
	};

	const getActiveDetails = (): SymptomDetail | null => {
		if (!activeSymptom) return null;
		const key = activeSymptom.toLowerCase().trim();
		return SYMPTOM_DETAILS[key] || null;
	};

	const activeDetails = getActiveDetails();

	return (
		<div className={styles["Symptoms-wrapper"]}>
			<div className={styles["Symptoms-header-wrapper"]}>
				<div className={styles["Symptoms-header-title"]}>Symptoms</div>
				{description && (
					<div className={styles["Symptoms-header-desc"]}>
						{description} <span className={styles["Symptoms-interactive-tip"]}>— click symptoms below to learn more</span>
					</div>
				)}
			</div>
			
			<div className={styles["Symptoms-list"]}>
				{symptomList?.map((symptom) => {
					const isActive = activeSymptom === symptom;
					return (
						<button
							key={symptom}
							type="button"
							className={`${styles["Symptoms-list-item"]} ${
								isActive ? styles["Symptoms-list-item-active"] : ""
							}`}
							onClick={() => handleSymptomClick(symptom)}
						>
							<span className={styles["Symptoms-item-icon-wrapper"]}>
								{getSymptomIcon(symptom)}
							</span>
							<span className={styles["Symptoms-item-text"]}>{symptom}</span>
						</button>
					);
				})}
			</div>

			<AnimatePresence mode="wait">
				{activeSymptom && activeDetails && (
					<motion.div
						key={activeSymptom}
						initial={{ opacity: 0, y: 10, height: 0 }}
						animate={{ opacity: 1, y: 0, height: "auto" }}
						exit={{ opacity: 0, y: 10, height: 0 }}
						transition={{ duration: 0.25, ease: "easeInOut" }}
						className={styles["Symptoms-detail-card-wrapper"]}
					>
						<div
							className={`${styles["Symptoms-detail-card"]} ${
								activeDetails.priority === "High"
									? styles["priority-high"]
									: styles["priority-medium"]
							}`}
						>
							<div className={styles["Symptoms-detail-header"]}>
								<h4 className={styles["Symptoms-detail-title"]}>
									{activeSymptom}
								</h4>
								<div className={styles["Symptoms-detail-badges"]}>
									<span
										className={`${styles["priority-pill"]} ${
											activeDetails.priority === "High"
												? styles["pill-high"]
												: styles["pill-medium"]
										}`}
									>
										{activeDetails.priority === "High"
											? "Urgent Action"
											: "Care Guidance"}
									</span>
									<button
										type="button"
										className={styles["Symptoms-detail-close"]}
										onClick={() => setActiveSymptom(null)}
										aria-label="Close details"
									>
										<X size={14} />
									</button>
								</div>
							</div>
							
							<div className={styles["Symptoms-detail-body"]}>
								<div className={styles["Symptom-detail-section"]}>
									<div className={styles["section-label"]}>What is this?</div>
									<div className={styles["section-text"]}>
										{activeDetails.definition}
									</div>
								</div>
								
								<div className={styles["Symptom-detail-section"]}>
									<div className={styles["section-label"]}>Recommended Action</div>
									<div className={styles["section-text-action"]}>
										<CheckCircle size={14} className={styles["action-check-icon"]} />
										{activeDetails.action}
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
