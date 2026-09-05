import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { resetUser } from "@/App/Redux/userSlice";
import { paths } from "@/App/Routes/Paths";
import { toast } from "react-toastify";
import ThemeSwitcher from "@/Features/Structural/ThemeSwitcher/ThemeSwitcher";
import { AuthCredentials } from "@/App/Services/AuthCredentials";
import {
	Activity,
	AlertTriangle,
	ArrowDownRight,
	ArrowUpRight,
	Bell,
	Bot,
	Brain,
	Calendar,
	CalendarPlus,
	Check,
	CheckCheck,
	CheckCircle2,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Clock,
	Copy,
	Database,
	Droplet,
	ExternalLink,
	FileText,
	Heart,
	Info,
	LogOut,
	MapPin,
	PhoneCall,
	Pill,
	Plus,
	RefreshCw,
	Search,
	Send,
	Settings,
	ShieldAlert,
	ShieldCheck,
	Sparkles,
	FlaskConical,
	Microscope,
	Eye,
	User,
	UserCheck,
	Video,
	Volume2,
	Wind,
	X,
	Zap,
} from "lucide-react";
import { CameraProvider } from "@/Features/DigitalTwin/Context/CameraContext";
import MainScene from "@/Features/DigitalTwin/Components/Three/Scene/MainScene";
import { ClinicalCareChatModal } from "./Components/ClinicalCareChatModal/ClinicalCareChatModal";
import styles from "./DoctorPortal.module.scss";

// ─── Patient Database ────────────────────────────────────────────────────────

interface PatientProblemHistory {
	date: string;
	title: string;
	severity: number;
	status: "Resolved" | "Active" | "Monitored";
	resolutionNote?: string;
}

interface ClinicalPatient {
	id: string;
	mrn: string;
	name: string;
	age: number;
	gender: "Male" | "Female";
	bloodType: string;
	bmi: number;
	status: "urgent" | "monitoring" | "stable";
	primaryDiagnosis: string;
	lastSync: string;
	defaultOrgan: string;
	symptoms: {
		id: string;
		name: string;
		severity: number;
		duration: string;
		urgency: "Red" | "Yellow" | "Green";
		notes: string;
	}[];
	problemHistory: PatientProblemHistory[];
	labMarkers: {
		marker: string;
		value: string;
		refRange: string;
		status: "elevated" | "optimal" | "low";
		system: string;
		clinicalInsight?: string;
		target?: string;
		trend?: string;
	}[];
	medications: {
		name: string;
		dosage: string;
		frequency: string;
		adherence: number;
	}[];
}

const mockPatients: ClinicalPatient[] = [
	{
		id: "pt-101",
		mrn: "MRN-84920",
		name: "Marcus Vance",
		age: 52,
		gender: "Male",
		bloodType: "A+",
		bmi: 27.4,
		status: "urgent",
		primaryDiagnosis: "Atrial Fibrillation & Elevated ApoB",
		lastSync: "14 mins ago",
		defaultOrgan: "cardiovascular",
		symptoms: [
			{
				id: "sym-1",
				name: "Palpitations & Shortness of Breath",
				severity: 8,
				duration: "Started 2 days ago",
				urgency: "Red",
				notes: "Episode reported after walking up stairs at home.",
			},
			{
				id: "sym-2",
				name: "Afternoon Lightheadedness",
				severity: 5,
				duration: "Daily for 1 week",
				urgency: "Yellow",
				notes: "Correlated with borderline hydration and morning pill timing.",
			},
		],
		problemHistory: [
			{ date: "2024-02-14", title: "Resting Heart Rate Spike (118 bpm)", severity: 7, status: "Resolved", resolutionNote: "Metoprolol dosage adjusted to 25mg daily." },
			{ date: "2024-01-20", title: "Occasional nocturnal chest fluttering", severity: 6, status: "Monitored", resolutionNote: "Ordered 24h Holter monitor." },
			{ date: "2023-11-05", title: "Elevated Fasting Glucose (108 mg/dL)", severity: 4, status: "Resolved", resolutionNote: "Advised low-glycemic dietary protocol." },
		],
		labMarkers: [
			{
				marker: "Apolipoprotein B (ApoB)",
				value: "128 mg/dL",
				refRange: "< 90 mg/dL",
				status: "elevated",
				system: "Heart",
				clinicalInsight: "Direct metric of total circulating atherogenic particle count (LDL, VLDL, IDL). Concentration > 90 mg/dL indicates elevated atherosclerotic plaque risk and vascular endothelial penetration.",
				target: "< 80 mg/dL (High-Risk Target)",
				trend: "+14 mg/dL vs prior 90d lab",
			},
			{
				marker: "LDL Cholesterol",
				value: "142 mg/dL",
				refRange: "< 100 mg/dL",
				status: "elevated",
				system: "Heart",
				clinicalInsight: "Primary lipid transport particle. Combined elevated LDL-C with high ApoB suggests dense atherogenic lipid profile.",
				target: "< 70 mg/dL (Goal)",
				trend: "+18 mg/dL vs baseline",
			},
			{
				marker: "hs-CRP (Inflammation)",
				value: "3.4 mg/L",
				refRange: "< 1.0 mg/L",
				status: "elevated",
				system: "Heart",
				clinicalInsight: "High-sensitivity biomarker of systemic vascular inflammatory stress and plaque destabilization vulnerability.",
				target: "< 1.0 mg/L (Low Risk)",
				trend: "+1.2 mg/L increase",
			},
			{
				marker: "eGFR (Kidney)",
				value: "78 mL/min",
				refRange: "> 90 mL/min",
				status: "low",
				system: "Renal",
				clinicalInsight: "Estimated glomerular filtration rate reflects baseline renal capacity. Requires ongoing hydration and medication review.",
				target: "> 90 mL/min (Optimal)",
				trend: "-6 mL/min variance",
			},
			{
				marker: "Fasting Blood Glucose",
				value: "104 mg/dL",
				refRange: "70 - 99 mg/dL",
				status: "elevated",
				system: "Metabolic",
				clinicalInsight: "Slightly elevated fasting blood sugar indicates early insulin resistance and impaired fasting tolerance.",
				target: "< 95 mg/dL (Optimal)",
				trend: "+4 mg/dL variance",
			},
		],
		medications: [
			{ name: "Atorvastatin", dosage: "20 mg", frequency: "Daily (Night)", adherence: 94 },
			{ name: "Metoprolol", dosage: "25 mg", frequency: "Daily (Morning)", adherence: 90 },
		],
	},
	{
		id: "pt-102",
		mrn: "MRN-67219",
		name: "Elena Rostova",
		age: 44,
		gender: "Female",
		bloodType: "O-",
		bmi: 24.1,
		status: "monitoring",
		primaryDiagnosis: "Pre-Diabetes & Thyroid Fatigue",
		lastSync: "2 hours ago",
		defaultOrgan: "total",
		symptoms: [
			{
				id: "sym-3",
				name: "Fatigue & Cold Sensitivity",
				severity: 6,
				duration: "Past 2 weeks",
				urgency: "Yellow",
				notes: "Patient logged lower energy in mornings despite 8h sleep.",
			},
		],
		problemHistory: [
			{ date: "2024-02-01", title: "Postprandial sugar spike (162 mg/dL)", severity: 6, status: "Monitored", resolutionNote: "Started Metformin XR 500mg." },
		],
		labMarkers: [
			{
				marker: "Fasting Glucose",
				value: "112 mg/dL",
				refRange: "70 - 99 mg/dL",
				status: "elevated",
				system: "Metabolic",
				clinicalInsight: "Impaired fasting glucose requiring continued Metformin titration and post-meal glucose monitoring.",
				target: "< 99 mg/dL",
				trend: "+6 mg/dL vs baseline",
			},
			{
				marker: "HbA1c",
				value: "5.9 %",
				refRange: "< 5.7 %",
				status: "elevated",
				system: "Metabolic",
				clinicalInsight: "3-month weighted glycemic baseline reflecting pre-diabetic glucose exposure.",
				target: "< 5.6 %",
				trend: "-0.2 % improvement",
			},
			{
				marker: "TSH (Thyroid)",
				value: "4.2 uIU/mL",
				refRange: "0.4 - 4.0 uIU/mL",
				status: "elevated",
				system: "Endocrine",
				clinicalInsight: "Subclinical hypothyroid elevation correlating with morning fatigue and cold intolerance.",
				target: "1.0 - 2.5 uIU/mL",
				trend: "+0.6 uIU/mL increase",
			},
			{
				marker: "Vitamin D",
				value: "24 ng/mL",
				refRange: "30 - 100 ng/mL",
				status: "low",
				system: "Endocrine",
				clinicalInsight: "Serum 25-hydroxyvitamin D deficit contributing to fatigue and immune-endocrine sluggishness.",
				target: "> 40 ng/mL",
				trend: "+2 ng/mL steady",
			},
		],
		medications: [
			{ name: "Metformin XR", dosage: "500 mg", frequency: "Daily with dinner", adherence: 98 },
			{ name: "Levothyroxine", dosage: "25 mcg", frequency: "Daily (Morning fasting)", adherence: 94 },
		],
	},
	{
		id: "pt-103",
		mrn: "MRN-91044",
		name: "David K. Campbell",
		age: 61,
		gender: "Male",
		bloodType: "B+",
		bmi: 28.9,
		status: "urgent",
		primaryDiagnosis: "Stage 2 Hypertension & Renal Strain",
		lastSync: "35 mins ago",
		defaultOrgan: "cardiovascular",
		symptoms: [
			{
				id: "sym-4",
				name: "Occipital Morning Headache",
				severity: 7,
				duration: "Past 4 mornings",
				urgency: "Red",
				notes: "Home blood pressure logged at 158/96 mmHg.",
			},
		],
		problemHistory: [
			{ date: "2024-02-10", title: "Blood pressure elevation (162/98)", severity: 8, status: "Active", resolutionNote: "Added Amlodipine 5mg." },
		],
		labMarkers: [
			{
				marker: "Serum Creatinine",
				value: "1.4 mg/dL",
				refRange: "0.7 - 1.3 mg/dL",
				status: "elevated",
				system: "Renal",
				clinicalInsight: "Serum creatinine elevation indicating reduced renal clearance in the setting of chronic stage 2 hypertension.",
				target: "0.8 - 1.1 mg/dL",
				trend: "+0.2 mg/dL increase",
			},
			{
				marker: "eGFR",
				value: "58 mL/min",
				refRange: "> 90 mL/min",
				status: "low",
				system: "Renal",
				clinicalInsight: "Stage 3a chronic renal filtration reduction. Requires cautious ACE-inhibitor dosing and blood pressure control.",
				target: "> 60 mL/min",
				trend: "-4 mL/min decrease",
			},
			{
				marker: "Blood Urea Nitrogen",
				value: "26 mg/dL",
				refRange: "7 - 20 mg/dL",
				status: "elevated",
				system: "Renal",
				clinicalInsight: "Elevated BUN indicating nitrogenous waste retention and potential pre-renal hypoperfusion.",
				target: "< 20 mg/dL",
				trend: "+3 mg/dL increase",
			},
			{
				marker: "Serum Potassium",
				value: "4.8 mEq/L",
				refRange: "3.5 - 5.0 mEq/L",
				status: "optimal",
				system: "Renal",
				clinicalInsight: "Serum potassium within safe therapeutic range under Lisinopril therapy.",
				target: "4.0 - 4.8 mEq/L",
				trend: "Stable",
			},
		],
		medications: [
			{ name: "Lisinopril", dosage: "20 mg", frequency: "Daily (Morning)", adherence: 82 },
			{ name: "Amlodipine", dosage: "5 mg", frequency: "Daily (Morning)", adherence: 88 },
		],
	},
	{
		id: "pt-104",
		mrn: "MRN-33012",
		name: "Sarah Lin",
		age: 36,
		gender: "Female",
		bloodType: "A-",
		bmi: 21.8,
		status: "stable",
		primaryDiagnosis: "Optimal Longevity Baseline",
		lastSync: "1 hour ago",
		defaultOrgan: "total",
		symptoms: [],
		problemHistory: [],
		labMarkers: [
			{
				marker: "Apolipoprotein B (ApoB)",
				value: "72 mg/dL",
				refRange: "< 90 mg/dL",
				status: "optimal",
				system: "Heart",
				clinicalInsight: "Optimal circulating atherogenic particle count indicating very low cardiovascular plaque burden risk.",
				target: "< 80 mg/dL",
				trend: "-4 mg/dL improvement",
			},
			{
				marker: "LDL Cholesterol",
				value: "88 mg/dL",
				refRange: "< 100 mg/dL",
				status: "optimal",
				system: "Heart",
				clinicalInsight: "Optimal LDL-C level maintaining healthy arterial intima homeostasis.",
				target: "< 100 mg/dL",
				trend: "Stable",
			},
			{
				marker: "hs-CRP (Inflammation)",
				value: "0.4 mg/L",
				refRange: "< 1.0 mg/L",
				status: "optimal",
				system: "Heart",
				clinicalInsight: "Extremely low systemic inflammation baseline promoting longevity resilience.",
				target: "< 0.8 mg/L",
				trend: "Stable",
			},
			{
				marker: "Fasting Glucose",
				value: "84 mg/dL",
				refRange: "70 - 99 mg/dL",
				status: "optimal",
				system: "Metabolic",
				clinicalInsight: "High insulin sensitivity and optimal fasting glycemic regulation.",
				target: "75 - 90 mg/dL",
				trend: "Optimal",
			},
			{
				marker: "eGFR",
				value: "108 mL/min",
				refRange: "> 90 mL/min",
				status: "optimal",
				system: "Renal",
				clinicalInsight: "Excellent glomerular filtration and baseline kidney function reserve.",
				target: "> 90 mL/min",
				trend: "Optimal",
			},
		],
		medications: [
			{ name: "Omega-3 EPA/DHA", dosage: "1000 mg", frequency: "Daily (Morning)", adherence: 96 },
			{ name: "Vitamin D3 + K2", dosage: "5000 IU", frequency: "Daily (Morning)", adherence: 95 },
		],
	},
];

// ─── Lab Results Notification & Ingestion Database ──────────────────────────

export interface ReadyLabMarker {
	name: string;
	value: string;
	unit: string;
	refRange: string;
	priorValue?: string;
	deltaPct?: string;
	status: "critical_high" | "elevated" | "optimal" | "low";
	interpretation: string;
}

export interface ReadyLabResult {
	id: string;
	patientId: string;
	patientName: string;
	mrn: string;
	panelName: string;
	labProvider: string;
	orderedAt: string;
	completedAt: string;
	urgency: "urgent" | "routine" | "stat";
	isViewed: boolean;
	isAcknowledged: boolean;
	targetOrgan: string;
	findingsSummary: string;
	markers: ReadyLabMarker[];
	recommendedNextStep: string;
}

export interface LabPanelPreset {
	id: string;
	name: string;
	category: string;
	description: string;
	typicalTurnaround: string;
	defaultOrgan: string;
	markersIncluded: string[];
}

export const LAB_PANEL_PRESETS: LabPanelPreset[] = [
	{
		id: "apob_lipids",
		name: "90-Day ApoB & Comprehensive Lipid Subfraction",
		category: "Cardiovascular",
		description: "Apolipoprotein B, LDL Cholesterol, hs-CRP, eGFR, and Fasting Blood Glucose.",
		typicalTurnaround: "12-24 Hours",
		defaultOrgan: "cardiovascular",
		markersIncluded: ["Apolipoprotein B (ApoB)", "LDL Cholesterol", "hs-CRP (Inflammation)", "eGFR (Kidney)", "Fasting Blood Glucose"],
	},
	{
		id: "cardiac_telemetry",
		name: "High-Sensitivity Troponin-I & NT-proBNP",
		category: "Cardiovascular",
		description: "Myocardial wall stress, micro-ischemia detection, and acute arrhythmia indices.",
		typicalTurnaround: "Stat 2-4 Hours",
		defaultOrgan: "cardiovascular",
		markersIncluded: ["hs-Troponin I", "NT-proBNP", "CK-MB", "D-Dimer"],
	},
	{
		id: "renal_metabolic",
		name: "Comprehensive Metabolic & eGFR Renal Panel",
		category: "Renal & Metabolic",
		description: "Serum Creatinine, Cystatin-C, eGFR CKD-EPI, BUN, and complete electrolyte balance.",
		typicalTurnaround: "6-12 Hours",
		defaultOrgan: "cardiovascular",
		markersIncluded: ["eGFR", "Serum Creatinine", "Blood Urea Nitrogen", "Serum Potassium"],
	},
	{
		id: "thyroid_endocrine",
		name: "Advanced Endocrine & Thyroid Panel",
		category: "Endocrine",
		description: "Ultrasensitive TSH, Free T3, Free T4, Anti-TPO, and 25-OH Vitamin D3 levels.",
		typicalTurnaround: "24 Hours",
		defaultOrgan: "cardiovascular",
		markersIncluded: ["TSH (Thyroid)", "Free T4", "Free T3", "Vitamin D"],
	},
	{
		id: "genomic_pharmacogenomic",
		name: "Multi-Omics Genetic & Drug Metabolism Screen",
		category: "Genetics",
		description: "CYP2C19 / CYP2D6 statin clearance kinetics and SLCO1B1 myopathy risk alleles.",
		typicalTurnaround: "48 Hours",
		defaultOrgan: "total",
		markersIncluded: ["CYP2C19 *2/*3", "SLCO1B1 521T>C", "APOE E3/E4", "VKORC1"],
	},
];

export const initialReadyLabResults: ReadyLabResult[] = [
	{
		id: "lab-res-101",
		patientId: "pt-101",
		patientName: "Marcus Vance",
		mrn: "MRN-84920",
		panelName: "90-Day ApoB & Comprehensive Lipid Subfraction",
		labProvider: "Quest Diagnostics Direct · HL7 FHIR v4",
		orderedAt: "2 days ago",
		completedAt: "14 mins ago",
		urgency: "urgent",
		isViewed: false,
		isAcknowledged: false,
		targetOrgan: "cardiovascular",
		findingsSummary: "Direct HL7 Ingestion: Apolipoprotein B (128 mg/dL), LDL Cholesterol (142 mg/dL), and hs-CRP (3.4 mg/L) are elevated indicating active atherogenic and inflammatory burden. eGFR is 78 mL/min (Low), and Fasting Blood Glucose is 104 mg/dL (High).",
		markers: [
			{
				name: "Apolipoprotein B (ApoB)",
				value: "128",
				unit: "mg/dL",
				refRange: "< 90 mg/dL",
				priorValue: "114 mg/dL",
				deltaPct: "+14 mg/dL",
				status: "elevated",
				interpretation: "Direct metric of total circulating atherogenic particle count (LDL, VLDL, IDL). Concentration > 90 mg/dL indicates elevated atherosclerotic plaque risk and vascular endothelial penetration.",
			},
			{
				name: "LDL Cholesterol",
				value: "142",
				unit: "mg/dL",
				refRange: "< 100 mg/dL",
				priorValue: "124 mg/dL",
				deltaPct: "+18 mg/dL",
				status: "elevated",
				interpretation: "Primary lipid transport particle. Combined elevated LDL-C with high ApoB suggests dense atherogenic lipid profile.",
			},
			{
				name: "hs-CRP (Inflammation)",
				value: "3.4",
				unit: "mg/L",
				refRange: "< 1.0 mg/L",
				priorValue: "2.2 mg/L",
				deltaPct: "+1.2 mg/L",
				status: "elevated",
				interpretation: "High-sensitivity biomarker of systemic vascular inflammatory stress and plaque destabilization vulnerability.",
			},
			{
				name: "eGFR (Kidney)",
				value: "78",
				unit: "mL/min",
				refRange: "> 90 mL/min",
				priorValue: "84 mL/min",
				deltaPct: "-6 mL/min",
				status: "low",
				interpretation: "Estimated glomerular filtration rate reflects baseline renal capacity. Requires ongoing hydration and medication review.",
			},
			{
				name: "Fasting Blood Glucose",
				value: "104",
				unit: "mg/dL",
				refRange: "70 - 99 mg/dL",
				priorValue: "100 mg/dL",
				deltaPct: "+4 mg/dL",
				status: "elevated",
				interpretation: "Slightly elevated fasting blood sugar indicates early insulin resistance and impaired fasting tolerance.",
			},
		],
		recommendedNextStep: "Add Ezetimibe 10mg daily or increase Atorvastatin to 40mg. Re-evaluate ApoB, lipid profile, and renal markers in 60-90 days.",
	},
	{
		id: "lab-res-102",
		patientId: "pt-103",
		patientName: "David K. Campbell",
		mrn: "MRN-91044",
		panelName: "Emergency Renal Filtration & Electrolyte Panel",
		labProvider: "Labcorp Biometrics FHIR Direct",
		orderedAt: "Yesterday",
		completedAt: "45 mins ago",
		urgency: "urgent",
		isViewed: false,
		isAcknowledged: false,
		targetOrgan: "cardiovascular",
		findingsSummary: "Serum Creatinine elevated to 1.48 mg/dL with eGFR dropping to 54 mL/min (Stage 3a CKD threshold). Potassium steady at 4.8 mEq/L under Lisinopril therapy.",
		markers: [
			{
				name: "eGFR (CKD-EPI)",
				value: "54",
				unit: "mL/min/1.73m²",
				refRange: "> 90 mL/min",
				priorValue: "58 mL/min",
				deltaPct: "-6.9%",
				status: "low",
				interpretation: "Moderate filtration decline; requires close blood pressure stabilization and hydration review.",
			},
			{
				name: "Serum Creatinine",
				value: "1.48",
				unit: "mg/dL",
				refRange: "0.7 - 1.3 mg/dL",
				priorValue: "1.40 mg/dL",
				deltaPct: "+5.7%",
				status: "elevated",
				interpretation: "Reduced clearance in setting of uncontrolled stage 2 hypertension.",
			},
			{
				name: "Blood Urea Nitrogen (BUN)",
				value: "28",
				unit: "mg/dL",
				refRange: "7 - 20 mg/dL",
				priorValue: "26 mg/dL",
				deltaPct: "+7.6%",
				status: "elevated",
				interpretation: "Mild azotemia present; verify oral fluid intake protocol.",
			},
		],
		recommendedNextStep: "Review antihypertensive regimen with nephrology consult; repeat serum chemistry in 14 days.",
	},
	{
		id: "lab-res-103",
		patientId: "pt-102",
		patientName: "Elena Rostova",
		mrn: "MRN-72391",
		panelName: "Thyroid & 25-OH Vitamin D3 Follow-Up",
		labProvider: "Genetiq Molecular Core Laboratory",
		orderedAt: "3 days ago",
		completedAt: "2 hours ago",
		urgency: "routine",
		isViewed: true,
		isAcknowledged: true,
		targetOrgan: "cardiovascular",
		findingsSummary: "TSH normalized to 2.6 uIU/mL following morning fasting Levothyroxine. 25-OH Vitamin D restored to 36 ng/mL.",
		markers: [
			{
				name: "TSH (Ultrasensitive)",
				value: "2.6",
				unit: "uIU/mL",
				refRange: "0.4 - 4.0 uIU/mL",
				priorValue: "4.2 uIU/mL",
				deltaPct: "-38.1%",
				status: "optimal",
				interpretation: "Euthyroid state achieved; metabolic and cognitive fatigue symptoms expected to resolve.",
			},
			{
				name: "25-OH Vitamin D3",
				value: "36",
				unit: "ng/mL",
				refRange: "30 - 100 ng/mL",
				priorValue: "24 ng/mL",
				deltaPct: "+50.0%",
				status: "optimal",
				interpretation: "Adequate serum 25(OH)D reserve restored; immune and bone metabolism normalized.",
			},
		],
		recommendedNextStep: "Continue current Levothyroxine 25mcg and Vitamin D3 supplementation. Routine 6-month re-check.",
	},
];

// ─── Doctor Booked Appointments & Schedules ─────────────────────────────────

export interface ClinicalSpecialist {
	id: string;
	name: string;
	role: string;
	initials: string;
}

export const CLINICAL_SPECIALISTS: ClinicalSpecialist[] = [
	{
		id: "km",
		name: "Dr. Kwame Mensah",
		role: "General Physician & Telehealth",
		initials: "KM",
	},
	{
		id: "ao",
		name: "Dr. Abena Osei",
		role: "Clinical Hematologist",
		initials: "AO",
	},
	{
		id: "ka",
		name: "Dr. Kofi Annan",
		role: "Geneticist & Bio-consultant",
		initials: "KA",
	},
	{
		id: "aa",
		name: "Akosua Addo, MSc",
		role: "Clinical Dietitian & Nutritionist",
		initials: "AA",
	},
];

export const CONSULTATION_TIME_SLOTS = [
	"Today, 3:00 PM",
	"Today, 5:30 PM",
	"Tomorrow, 10:00 AM",
	"Tomorrow, 2:15 PM",
];

export interface DoctorAppointment {
	id: string;
	patientId: string;
	patientName: string;
	patientMrn: string;
	patientAvatar: string;
	appointmentType: string;
	specialistName: string;
	specialistRole: string;
	specialistInitials: string;
	department: string;
	date: string;
	time: string;
	durationMinutes: number;
	mode: "telehealth" | "in-person" | "phone" | "ai-consult";
	status: "waiting" | "confirmed" | "completed" | "cancelled";
	notes: string;
	roomOrLink?: string;
}

const initialAppointments: DoctorAppointment[] = [
	{
		id: "apt-1",
		patientId: "pt-101",
		patientName: "Marcus Vance",
		patientMrn: "MRN-84920",
		patientAvatar: "MV",
		appointmentType: "Urgent Arrhythmia & Palpitations Check-in",
		specialistName: "Dr. Kwame Mensah",
		specialistRole: "General Physician & Telehealth",
		specialistInitials: "KM",
		department: "General Physician & Telehealth",
		date: "Today",
		time: "3:00 PM",
		durationMinutes: 30,
		mode: "telehealth",
		status: "waiting",
		notes: "Experiencing rapid heartbeat and chest tightness after stair climb. Would like doctor to review latest Metoprolol adherence.",
		roomOrLink: "https://telehealth.genetiq.health/room/pt-101",
	},
	{
		id: "apt-2",
		patientId: "pt-102",
		patientName: "Elena Rostova",
		patientMrn: "MRN-67219",
		patientAvatar: "ER",
		appointmentType: "Clinical Hematology & Ferritin Telemetry Review",
		specialistName: "Dr. Abena Osei",
		specialistRole: "Clinical Hematologist",
		specialistInitials: "AO",
		department: "Clinical Hematology",
		date: "Today",
		time: "5:30 PM",
		durationMinutes: 45,
		mode: "in-person",
		status: "confirmed",
		notes: "Discussing borderline low RBC indices, cold sensitivity, and thyroid panel balance.",
	},
	{
		id: "apt-3",
		patientId: "pt-103",
		patientName: "David Chen",
		patientMrn: "MRN-33108",
		patientAvatar: "DC",
		appointmentType: "Familial Hypercholesterolemia Genomic Screening",
		specialistName: "Dr. Kofi Annan",
		specialistRole: "Geneticist & Bio-consultant",
		specialistInitials: "KA",
		department: "Genetics & Bio-consultation",
		date: "Tomorrow",
		time: "10:00 AM",
		durationMinutes: 30,
		mode: "telehealth",
		status: "confirmed",
		notes: "Reviewing PCSK9 and LDLR gene variant risk profile and high baseline ApoB (128 mg/dL).",
		roomOrLink: "https://telehealth.genetiq.health/room/pt-103",
	},
	{
		id: "apt-4",
		patientId: "pt-101",
		patientName: "Marcus Vance",
		patientMrn: "MRN-84920",
		patientAvatar: "MV",
		appointmentType: "Cardio-Metabolic Dietary Protocol & Macro Intake",
		specialistName: "Akosua Addo, MSc",
		specialistRole: "Clinical Dietitian & Nutritionist",
		specialistInitials: "AA",
		department: "Clinical Nutrition",
		date: "Tomorrow",
		time: "2:15 PM",
		durationMinutes: 30,
		mode: "phone",
		status: "confirmed",
		notes: "Formulating low-sodium, high-fiber dietary plan to assist blood pressure regulation.",
	},
	{
		id: "apt-5",
		patientId: "pt-102",
		patientName: "Elena Rostova",
		patientMrn: "MRN-67219",
		patientAvatar: "ER",
		appointmentType: "AI Clinical Biomarker Triage & Lab Interpretation",
		specialistName: "Dr. Kwame Mensah",
		specialistRole: "General Physician & Telehealth",
		specialistInitials: "KM",
		department: "General Physician & Telehealth",
		date: "Aug 28",
		time: "11:00 AM",
		durationMinutes: 20,
		mode: "ai-consult",
		status: "completed",
		notes: "AI multi-system review of thyroid panel, fasting insulin, and renal markers.",
	},
];

export interface PatientAiInsightReport {
	executiveSummary: string;
	triageScore: {
		score: number;
		level: "High Risk" | "Moderate Risk" | "Low / Optimal";
		label: string;
		color: string;
	};
	systemScores: Array<{
		name: string;
		score: number;
		status: "Optimal" | "Monitored" | "Strain";
		alert?: string;
	}>;
	biomarkerCorrelations: Array<{
		title: string;
		finding: string;
		correlation: string;
		urgency: "high" | "moderate" | "low";
	}>;
	pharmacologyInsights: Array<{
		drug: string;
		dosage: string;
		adherence: number;
		efficacy: string;
		recommendation: string;
	}>;
	protocolSteps: Array<{
		step: number;
		category: "Rx" | "Diagnostics" | "Care Guidance";
		title: string;
		action: string;
	}>;
	soapNote: {
		subjective: string;
		objective: string;
		assessment: string;
		plan: string;
	};
	suggestedQuestions: string[];
}

export function generatePatientAiAnalysis(patient: ClinicalPatient, _doctorName?: string): PatientAiInsightReport {
	if (patient.id === "pt-101") {
		return {
			executiveSummary:
				"52-year-old male presenting with acute 8/10 palpitations and exertional shortness of breath following stair climbing. High atherogenic particle load (ApoB 128 mg/dL, LDL 142 mg/dL) coupled with acute vascular inflammation (hs-CRP 3.4 mg/L) significantly elevates cardiovascular vulnerability and arrhythmia provocation risk.",
			triageScore: {
				score: 78,
				level: "High Risk",
				label: "Grade 2 Exertional Arrhythmia Risk + Atherogenic Particle Excess",
				color: "#ef4444",
			},
			systemScores: [
				{ name: "Cardiovascular (Heart)", score: 58, status: "Strain", alert: "High Atherogenic Load & Tachycardia Spike (118 bpm)" },
				{ name: "Renal (Kidneys)", score: 76, status: "Monitored", alert: "eGFR 78 mL/min (Mild clearance reduction)" },
				{ name: "Metabolic Homeostasis", score: 82, status: "Optimal", alert: "Fasting Glucose 104 mg/dL (Early insulin resistance)" },
			],
			biomarkerCorrelations: [
				{
					title: "ApoB & Vascular Endothelial Plaque Risk",
					finding: "Apolipoprotein B is 128 mg/dL (Ref < 90 mg/dL)",
					correlation: "Direct atherogenic particle burden accelerates endothelial sub-intimal trapping and arterial stiffness, predisposing to exertional ischemic substrate.",
					urgency: "high",
				},
				{
					title: "hs-CRP & Inflammatory Destabilization",
					finding: "hs-CRP is 3.4 mg/L (Ref < 1.0 mg/L)",
					correlation: "Active systemic vascular inflammation lowers myocardial threshold for autonomic arrhythmias during physical exertion.",
					urgency: "high",
				},
				{
					title: "Exertional Heart Rate Flare",
					finding: "Resting rate spike to 118 bpm after stair climb",
					correlation: "Autonomic decompensation following exertion; reflects beta-adrenergic sensitivity and potential paroxysmal atrial fibrillation episodes.",
					urgency: "high",
				},
			],
			pharmacologyInsights: [
				{
					drug: "Atorvastatin",
					dosage: "20 mg Daily",
					adherence: 94,
					efficacy: "Sub-Target ApoB Reduction",
					recommendation: "ApoB remains at 128 mg/dL despite 94% adherence. Recommend adding Ezetimibe 10mg daily or titrating Atorvastatin to 40mg.",
				},
				{
					drug: "Metoprolol",
					dosage: "25 mg Daily",
					adherence: 90,
					efficacy: "Effective Rate Control, Orthostatic Trough",
					recommendation: "Afternoon lightheadedness suggests peak hypotensive effect. Advise morning administration with 500ml water and evaluate split-dose.",
				},
			],
			protocolSteps: [
				{
					step: 1,
					category: "Diagnostics",
					title: "24-Hour Ambulatory Holter ECG",
					action: "Dispatch continuous Holter monitor to capture paroxysmal atrial flutter & nocturnal rhythm anomalies.",
				},
				{
					step: 2,
					category: "Rx",
					title: "Adjunctive Lipid Lowering (Ezetimibe 10mg)",
					action: "Prescribe Ezetimibe 10mg daily to accelerate ApoB clearance toward target < 80 mg/dL.",
				},
				{
					step: 3,
					category: "Diagnostics",
					title: "Order Follow-Up ApoB & Lipid Panel (60 Days)",
					action: "Requisition repeat chemistry to evaluate response to intensified lipid protocol.",
				},
				{
					step: 4,
					category: "Care Guidance",
					title: "Exertion & Hydration Counseling",
					action: "Restrict rapid stair climb bursts until rhythm telemetry is verified. Ensure 2.0L daily hydration.",
				},
			],
			soapNote: {
				subjective:
					"52yo male reports 8/10 palpitations and shortness of breath 2 days ago after climbing stairs at home. Also notes recurring afternoon lightheadedness. Denies syncope or radiating chest pressure.",
				objective:
					"Labs: ApoB 128 mg/dL (High), LDL-C 142 mg/dL (High), hs-CRP 3.4 mg/L (High), eGFR 78 mL/min (Low), Fasting Glucose 104 mg/dL. BMI 27.4. BP 124/82. HR peak logged 118 bpm.",
				assessment:
					"1. Paroxysmal Atrial Fibrillation / Exertional Arrhythmia (Triage: Red).\n2. Atherogenic Hyperlipidemia with Elevated ApoB.\n3. Elevated Systemic Inflammation (hs-CRP).\n4. Mild Afternoon Orthostasis secondary to beta-blocker trough.",
				plan:
					"1. Order 24h ambulatory Holter ECG monitor.\n2. Prescribe Ezetimibe 10mg PO daily adjunctive to Atorvastatin 20mg.\n3. Continue Metoprolol 25mg with improved hydration counseling.\n4. Repeat ApoB & Lipid panel in 60 days.\n5. Follow-up consultation in 2 weeks or sooner if palpitations worsen.",
			},
			suggestedQuestions: [
				"Why is ApoB still 128 mg/dL despite 94% Atorvastatin adherence?",
				"How does Metoprolol timing correlate with his afternoon lightheadedness?",
				"What is the recommended pharmacotherapy sequence for his lipid targets?",
				"Should we order an echocardiogram alongside the 24h Holter monitor?",
			],
		};
	} else if (patient.id === "pt-102") {
		return {
			executiveSummary:
				"44-year-old female presenting with chronic morning fatigue and cold sensitivity. Chemistry profile shows pre-diabetic glucose exposure (HbA1c 5.9%, Fasting Glucose 112 mg/dL) combined with subclinical thyroid slowing (TSH 4.2 uIU/mL) and Vitamin D deficiency (24 ng/mL).",
			triageScore: {
				score: 62,
				level: "Moderate Risk",
				label: "Pre-Diabetes + Subclinical Thyroid Fatigue Strain",
				color: "#f59e0b",
			},
			systemScores: [
				{ name: "Endocrine & Thyroid", score: 64, status: "Strain", alert: "TSH 4.2 uIU/mL (Subclinical Hypothyroid)" },
				{ name: "Metabolic Homeostasis", score: 68, status: "Monitored", alert: "HbA1c 5.9%, Fasting Glucose 112 mg/dL" },
				{ name: "Nutritional Micronutrients", score: 60, status: "Strain", alert: "Vitamin D 24 ng/mL (Deficiency)" },
			],
			biomarkerCorrelations: [
				{
					title: "TSH & Metabolic Slowing",
					finding: "TSH 4.2 uIU/mL (Ref 0.4 - 4.0 uIU/mL)",
					correlation: "Mild thyroid hypofunction reduces resting metabolic rate, directly driving cold intolerance and sluggish morning recovery.",
					urgency: "moderate",
				},
				{
					title: "HbA1c & Fasting Hyperglycemia",
					finding: "HbA1c 5.9%, Fasting Glucose 112 mg/dL",
					correlation: "Insulin resistance pattern. Postprandial glucose surges contribute to afternoon energy dips.",
					urgency: "moderate",
				},
			],
			pharmacologyInsights: [
				{
					drug: "Metformin XR",
					dosage: "500 mg Daily",
					adherence: 98,
					efficacy: "Good Glycemic Control",
					recommendation: "Maintain 500mg with dinner. Re-check 30d glucose logs to determine if 850mg titration is required.",
				},
				{
					drug: "Levothyroxine",
					dosage: "25 mcg Daily",
					adherence: 94,
					efficacy: "Early Thyroid Normalization",
					recommendation: "Ensure strict fasting morning ingestion with water 30 minutes before coffee or food.",
				},
			],
			protocolSteps: [
				{
					step: 1,
					category: "Rx",
					title: "Vitamin D3 Supplementation (5000 IU)",
					action: "Prescribe Cholecalciferol 5000 IU daily with morning meal to restore 25(OH)D > 40 ng/mL.",
				},
				{
					step: 2,
					category: "Diagnostics",
					title: "Repeat Thyroid Panel & HbA1c (8 Weeks)",
					action: "Evaluate TSH, Free T4, and 3-month glycemic shift following Levothyroxine optimization.",
				},
				{
					step: 3,
					category: "Care Guidance",
					title: "Low-Glycemic Chrono-Nutrition",
					action: "Advise balanced protein-rich breakfasts and 10-minute postprandial walks to blunt glucose spikes.",
				},
			],
			soapNote: {
				subjective: "44yo female logs low morning energy, sluggish waking, and cold sensitivity despite 8 hours of sleep.",
				objective: "Fasting Glucose 112 mg/dL, HbA1c 5.9%, TSH 4.2 uIU/mL, Vitamin D 24 ng/mL, BMI 24.1.",
				assessment: "1. Pre-Diabetes with Impaired Fasting Glucose.\n2. Subclinical Hypothyroidism.\n3. Vitamin D Deficiency.",
				plan: "1. Continue Metformin XR 500mg with dinner.\n2. Continue Levothyroxine 25mcg fasting morning.\n3. Start Vitamin D3 5000 IU daily.\n4. Repeat TSH/HbA1c in 8 weeks.",
			},
			suggestedQuestions: [
				"Is her TSH elevation sufficient to explain the chronic fatigue?",
				"Should we titrate Metformin XR from 500mg to 850mg?",
				"What target Vitamin D level should we aim for to support thyroid function?",
			],
		};
	} else if (patient.id === "pt-103") {
		return {
			executiveSummary:
				"61-year-old male with persistent morning occipital headaches and home BP readings averaging 158/96 mmHg. Renal chemistry reveals Stage 3a filtration strain (eGFR 58 mL/min, Serum Creatinine 1.4 mg/dL, BUN 26 mg/dL) secondary to chronic hypertensive nephrosclerosis.",
			triageScore: {
				score: 84,
				level: "High Risk",
				label: "Stage 2 Hypertension + Stage 3a Renal Filtration Strain",
				color: "#ef4444",
			},
			systemScores: [
				{ name: "Renal Function (Kidneys)", score: 54, status: "Strain", alert: "eGFR 58 mL/min & Creatinine 1.4 mg/dL" },
				{ name: "Vascular Pressure Control", score: 50, status: "Strain", alert: "BP 158/96 mmHg (Morning Headaches)" },
				{ name: "Electrolyte Homeostasis", score: 86, status: "Optimal", alert: "Potassium 4.8 mEq/L (Normal)" },
			],
			biomarkerCorrelations: [
				{
					title: "Systolic Hypertensive Load & Glomerular Strain",
					finding: "BP 158/96 mmHg, eGFR 58 mL/min",
					correlation: "Sustained arterial hypertension causes intra-glomerular capillary hyperfiltration and progressive nephron loss.",
					urgency: "high",
				},
				{
					title: "Creatinine Elevation & Nitrogen Retention",
					finding: "Creatinine 1.4 mg/dL, BUN 26 mg/dL",
					correlation: "Reduced clearance reflects reduced renal perfusion and potential pre-renal dehydration.",
					urgency: "high",
				},
			],
			pharmacologyInsights: [
				{
					drug: "Lisinopril",
					dosage: "20 mg Daily",
					adherence: 82,
					efficacy: "Sub-Optimal Adherence & BP Escape",
					recommendation: "Adherence is only 82%. Automated Genetiq reminders recommended; re-evaluate dual therapy with Amlodipine.",
				},
				{
					drug: "Amlodipine",
					dosage: "5 mg Daily",
					adherence: 88,
					efficacy: "Active Vasodilator",
					recommendation: "Evaluate increasing to 10mg if systolic pressure remains > 140 mmHg after Lisinopril adherence improves.",
				},
			],
			protocolSteps: [
				{
					step: 1,
					category: "Diagnostics",
					title: "24-Hour Ambulatory Blood Pressure Monitor (ABPM)",
					action: "Order continuous ABPM to determine nocturnal dipping profile and peak surge hours.",
				},
				{
					step: 2,
					category: "Rx",
					title: "Adherence Support & Dual Antihypertensive Titration",
					action: "Ensure strict daily Lisinopril 20mg + Amlodipine 5mg regimen with automated app check-ins.",
				},
				{
					step: 3,
					category: "Diagnostics",
					title: "Repeat Renal Panel & Urine Albumin/Creatinine (30 Days)",
					action: "Check serum creatinine, eGFR, and microalbuminuria to monitor nephroprotection.",
				},
			],
			soapNote: {
				subjective: "61yo male reports morning occipital headaches for past 4 mornings. Home BP logged 158/96 mmHg.",
				objective: "BP 158/96 mmHg, Creatinine 1.4 mg/dL, eGFR 58 mL/min, BUN 26 mg/dL, K+ 4.8 mEq/L, Uric Acid 7.6 mg/dL.",
				assessment: "1. Uncontrolled Stage 2 Essential Hypertension.\n2. Chronic Kidney Disease Stage 3a (Hypertensive Nephrosclerosis).\n3. Hypertensive Cephalea.",
				plan: "1. Order 24h ABPM.\n2. Reinforce Lisinopril 20mg + Amlodipine 5mg adherence.\n3. Sodium restriction < 2000mg/day.\n4. Repeat renal chemistry in 30 days.",
			},
			suggestedQuestions: [
				"Is Lisinopril safe given the patient's eGFR of 58 mL/min?",
				"Should we uptitrate Amlodipine to 10mg or add a thiazide diuretic?",
				"What microalbuminuria threshold should trigger nephrology referral?",
			],
		};
	} else {
		// Sarah Lin (pt-104)
		return {
			executiveSummary:
				"36-year-old female with optimal physiological biomarkers across all surveyed biological systems. ApoB (72 mg/dL), LDL (88 mg/dL), hs-CRP (0.4 mg/L), eGFR (108 mL/min), and Fasting Glucose (84 mg/dL) demonstrate excellent cardiovascular, renal, and metabolic resilience.",
			triageScore: {
				score: 18,
				level: "Low / Optimal",
				label: "Optimal Longevity Biomarker Baseline",
				color: "#10b981",
			},
			systemScores: [
				{ name: "Cardiovascular Intima", score: 96, status: "Optimal", alert: "ApoB 72 mg/dL & hs-CRP 0.4 mg/L" },
				{ name: "Renal Filtration Reserve", score: 98, status: "Optimal", alert: "eGFR 108 mL/min" },
				{ name: "Metabolic Homeostasis", score: 95, status: "Optimal", alert: "Fasting Glucose 84 mg/dL" },
			],
			biomarkerCorrelations: [
				{
					title: "ApoB Homeostasis & Endothelial Protection",
					finding: "ApoB 72 mg/dL (Ref < 90 mg/dL)",
					correlation: "Extremely low circulating atherogenic particle count minimizes lifetime cumulative lipid burden and calcification risk.",
					urgency: "low",
				},
			],
			pharmacologyInsights: [
				{
					drug: "Omega-3 EPA/DHA",
					dosage: "1000 mg Daily",
					adherence: 96,
					efficacy: "Optimal Anti-inflammatory Index",
					recommendation: "Continue current longevity baseline supplementation.",
				},
			],
			protocolSteps: [
				{
					step: 1,
					category: "Care Guidance",
					title: "Maintain Longevity Protocol",
					action: "Continue zone-2 aerobic conditioning, resistance training, and Mediterranean nutrition.",
				},
				{
					step: 2,
					category: "Diagnostics",
					title: "Annual Longitudinal Longevity Screening",
					action: "Schedule next comprehensive panel in 12 months.",
				},
			],
			soapNote: {
				subjective: "36yo female presents for annual longevity and preventive wellness baseline. Asymptomatic with optimal energy.",
				objective: "ApoB 72 mg/dL, hs-CRP 0.4 mg/L, Fasting Glucose 84 mg/dL, eGFR 108 mL/min, BMI 21.8.",
				assessment: "1. Optimal Cardiovascular & Metabolic Longevity Baseline.\n2. No active pathology.",
				plan: "1. Continue current diet, exercise, and supplement protocol.\n2. Routine follow-up in 12 months.",
			},
			suggestedQuestions: [
				"What additional advanced longevity biomarkers (e.g. Lp(a), CAC) should be considered?",
				"How does her biological age compare to chronological age?",
			],
		};
	}
}

export const DoctorPortal = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const user = useSelector((state: RootState) => state.user);
	const doctor = user.doctorProfile || {
		doctorName: "Dr. Sarah Jenkins, MD",
		hospitalName: "Genetiq",
		department: "Cardiology & Internal Medicine",
		title: "Attending Physician",
	};

	const doctorInitials = (
		(user.firstName && user.lastName ? `${user.firstName[0]}${user.lastName[0]}` : "") ||
		(doctor.doctorName ? doctor.doctorName.replace(/^(Dr\.|Doctor)\s*/i, "").split(" ").map((n: string) => n[0]).join("").slice(0, 2) : "") ||
		"AG"
	).toUpperCase();

	const [patients, setPatients] = useState<ClinicalPatient[]>(mockPatients);
	const [selectedPatientId, setSelectedPatientId] = useState<string>("pt-101");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedOrganSystem, setSelectedOrganSystem] = useState<string>("cardiovascular");
	const [expandedMarker, setExpandedMarker] = useState<string | null>(null);
	const [isPrescribeOpen, setIsPrescribeOpen] = useState(false);
	const [newMedName, setNewMedName] = useState("");
	const [newMedDosage, setNewMedDosage] = useState("");
	const [newMedFrequency, setNewMedFrequency] = useState("Daily (Morning)");

	// Appointments & Patient Schedule State
	const [appointments, setAppointments] = useState<DoctorAppointment[]>(initialAppointments);
	const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
	const [appointmentFilter, setAppointmentFilter] = useState<"all" | "today" | "telehealth" | "in-person" | "completed">("all");
	const [specialistFilter, setSpecialistFilter] = useState<string>("all");
	const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
	const [newApptPatientId, setNewApptPatientId] = useState("pt-101");
	const [newApptSpecialistId, setNewApptSpecialistId] = useState("km");
	const [newApptSlot, setNewApptSlot] = useState(CONSULTATION_TIME_SLOTS[0]);
	const [newApptMode, setNewApptMode] = useState<"telehealth" | "in-person" | "phone" | "ai-consult">("telehealth");
	const [newApptNotes, setNewApptNotes] = useState("");

	// Load stored appointments on mount & listen for updates from patient booking modal
	useEffect(() => {
		const loadStoredAppointments = () => {
			try {
				const saved = localStorage.getItem("genetiq.doctor_appointments");
				if (saved) {
					const parsed = JSON.parse(saved);
					if (Array.isArray(parsed) && parsed.length > 0) {
						setAppointments((prev) => {
							const existingIds = new Set(prev.map((a) => a.id));
							const uniqueNew = parsed.filter((a: any) => !existingIds.has(a.id));
							return [...uniqueNew, ...prev];
						});
					}
				}
			} catch (err) {
				console.error(err);
			}
		};

		loadStoredAppointments();
		window.addEventListener("storage", loadStoredAppointments);
		return () => window.removeEventListener("storage", loadStoredAppointments);
	}, []);

	// Advice & Clinical Dispatch Modal State
	const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
	const [adviceText, setAdviceText] = useState("");

	// AI Clinical Insights & Report Analysis Modal State
	const [isAiReportModalOpen, setIsAiReportModalOpen] = useState(false);
	const [aiAnalysisTab, setAiAnalysisTab] = useState<
		"summary" | "biomarkers" | "pharma" | "protocol" | "soap" | "chat"
	>("summary");
	const [aiCustomQuestion, setAiCustomQuestion] = useState("");
	const [aiChatMessages, setAiChatMessages] = useState<
		Array<{ sender: "doctor" | "ai"; text: string; timestamp: string }>
	>([]);
	const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
	const [isCopiedSoap, setIsCopiedSoap] = useState(false);

	// Lab Results Ready & Clinical Ingestion Hub State
	const [readyLabResults, setReadyLabResults] = useState<ReadyLabResult[]>(initialReadyLabResults);
	const [isLabsHubModalOpen, setIsLabsHubModalOpen] = useState(false);
	const [labsFilter, setLabsFilter] = useState<"all" | "unread" | "critical" | "acknowledged">("all");
	const [isOrderLabModalOpen, setIsOrderLabModalOpen] = useState(false);
	const [orderLabPatientId, setOrderLabPatientId] = useState("pt-101");
	const [orderLabPanelId, setOrderLabPanelId] = useState("apob_lipids");
	const [orderLabPriority, setOrderLabPriority] = useState<"routine" | "priority" | "stat">("routine");
	const [orderLabProvider, setOrderLabProvider] = useState("Quest Diagnostics Direct · HL7 FHIR v4");
	const [orderLabNotes, setOrderLabNotes] = useState("");
	const [isDispatchingLab, setIsDispatchingLab] = useState(false);

	// Doctor Profile Menu & Clinical Settings State
	const [isDoctorMenuOpen, setIsDoctorMenuOpen] = useState(false);
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
	const [activeSettingsTab, setActiveSettingsTab] = useState<
		"ehr" | "alerts" | "orders" | "voice" | "security"
	>("ehr");
	const [ehrSyncing, setEhrSyncing] = useState(false);

	const doctorMenuRef = useRef<HTMLDivElement>(null);
	const patientDropdownRef = useRef<HTMLDivElement>(null);

	// Appointment Handlers
	const handleJoinTelehealth = (appt: DoctorAppointment) => {
		toast.info(`Launching encrypted Telehealth session with ${appt.patientName}...`);
		setTimeout(() => {
			toast.success(`Connected to secure clinical room with ${appt.patientName}.`);
		}, 800);
	};

	const handleFocusPatientFromAppt = (patientId: string) => {
		const target = patients.find((p) => p.id === patientId);
		if (target) {
			setSelectedPatientId(target.id);
			setSelectedOrganSystem(target.defaultOrgan);
			setIsScheduleModalOpen(false);
			toast.success(`Patient Chart & 3D Twin switched to ${target.name}.`);
		}
	};

	const handleMarkApptCompleted = (apptId: string) => {
		setAppointments((prev) =>
			prev.map((a) => (a.id === apptId ? { ...a, status: "completed" as const } : a)),
		);
		toast.success("Appointment completed and recorded into clinical encounter audit trail.");
	};

	const handleCreateNewAppointment = (e: React.FormEvent) => {
		e.preventDefault();
		const patientObj = patients.find((p) => p.id === newApptPatientId);
		const specObj = CLINICAL_SPECIALISTS.find((s) => s.id === newApptSpecialistId) || CLINICAL_SPECIALISTS[0];
		if (!patientObj) return;

		const slotParts = newApptSlot.split(",");
		const datePart = slotParts[0]?.trim() || "Today";
		const timePart = slotParts[1]?.trim() || newApptSlot;

		const newAppt: DoctorAppointment = {
			id: `apt-${Date.now()}`,
			patientId: patientObj.id,
			patientName: patientObj.name,
			patientMrn: patientObj.mrn,
			patientAvatar: patientObj.name.split(" ").map((n) => n[0]).join(""),
			appointmentType: `${specObj.role}: ${newApptMode === "telehealth" ? "Online Video" : newApptMode === "in-person" ? "In-Person Clinic" : newApptMode === "phone" ? "Audio Phone" : "AI Clinical"} Consultation`,
			specialistName: specObj.name,
			specialistRole: specObj.role,
			specialistInitials: specObj.initials,
			department: specObj.role,
			date: datePart,
			time: timePart,
			durationMinutes: newApptMode === "in-person" ? 45 : 30,
			mode: newApptMode,
			status: "confirmed",
			notes: newApptNotes.trim() || "Scheduled consultation via Doctor Portal.",
			roomOrLink: newApptMode === "telehealth" ? `https://telehealth.genetiq.health/room/${patientObj.id}` : undefined,
		};

		setAppointments((prev) => [newAppt, ...prev]);

		try {
			const existing = localStorage.getItem("genetiq.doctor_appointments");
			const parsed = existing ? JSON.parse(existing) : [];
			localStorage.setItem("genetiq.doctor_appointments", JSON.stringify([newAppt, ...parsed]));
		} catch (err) {
			console.error(err);
		}

		setIsBookingModalOpen(false);
		setNewApptNotes("");
		toast.success(`New consultation booked with ${specObj.name} for ${patientObj.name} at ${newApptSlot}!`);
	};

	const filteredAppointments = appointments.filter((a) => {
		if (specialistFilter !== "all" && a.specialistInitials?.toLowerCase() !== specialistFilter) {
			return false;
		}
		if (appointmentFilter === "today") return a.date.toLowerCase().includes("today") || a.status === "waiting";
		if (appointmentFilter === "telehealth") return a.mode === "telehealth";
		if (appointmentFilter === "in-person") return a.mode === "in-person";
		if (appointmentFilter === "completed") return a.status === "completed";
		return true;
	});

	// Panel Collapsible State - auto collapse on smaller screens for immediate 3D twin visibility
	const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(() =>
		typeof window !== "undefined" ? window.innerWidth <= 900 : false,
	);
	const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(() =>
		typeof window !== "undefined" ? window.innerWidth <= 1200 : false,
	);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth <= 900) {
				setIsLeftPanelCollapsed(true);
				setIsRightPanelCollapsed(true);
			}
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Click outside handlers
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				doctorMenuRef.current &&
				!doctorMenuRef.current.contains(event.target as Node)
			) {
				setIsDoctorMenuOpen(false);
			}
			if (
				patientDropdownRef.current &&
				!patientDropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleTriggerEhrSync = () => {
		setEhrSyncing(true);
		setTimeout(() => {
			setEhrSyncing(false);
			toast.success("EHR FHIR v4 synchronization completed. 3 patient records updated with latest lab telemetry.");
		}, 1400);
	};

	const selectedPatient =
		patients.find((p) => p.id === selectedPatientId) || patients[0];

	// Filtered dropdown
	const filteredDropdownPatients = patients.filter((p) =>
		p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
		p.primaryDiagnosis.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// Pre-fill advice text when opening advice modal
	const handleOpenAdviceModal = (symptomName?: string) => {
		if (symptomName?.includes("Palpitation") || selectedPatient.primaryDiagnosis.includes("Fibrillation")) {
			setAdviceText(
				`Hello ${selectedPatient.name},\n\nI reviewed your recent report of ${symptomName || "palpitations and shortness of breath"}. Please sit down and rest immediately, drink 500ml of water, and ensure you have taken your morning Metoprolol 25mg.\n\nAvoid caffeine and strenuous activity today. If your shortness of breath persists beyond 15 minutes or you experience chest pressure, please call our triage nurse or emergency immediately.\n\n— ${doctor.doctorName}`,
			);
		} else if (selectedPatient.primaryDiagnosis.includes("Hypertension")) {
			setAdviceText(
				`Hello ${selectedPatient.name},\n\nI noticed your morning blood pressure entry of 158/96 mmHg. Please sit quietly for 10 minutes and retake the measurement on your left arm. Take your prescribed morning Lisinopril 20mg and stay well hydrated.\n\n— ${doctor.doctorName}`,
			);
		} else {
			setAdviceText(
				`Hello ${selectedPatient.name},\n\nI have reviewed your latest symptom and lab log. Please continue your current daily protocol and rest adequately today. Let us know if any discomfort persists.\n\n— ${doctor.doctorName}`,
			);
		}
		setIsAdviceModalOpen(true);
	};

	const handleAcknowledge = () => {
		setPatients((prev) =>
			prev.map((p) =>
				p.id === selectedPatient.id ? { ...p, status: "monitoring" } : p,
			),
		);
		toast.success(`Triage alert for ${selectedPatient.name} cleared.`);
	};

	// Lab Results Ready & Ingestion Handlers
	const unreadReadyLabsCount = readyLabResults.filter((l) => !l.isAcknowledged).length;
	const selectedPatientReadyLabs = readyLabResults.filter((l) => l.patientId === selectedPatient.id);
	const selectedPatientUnreadLab = selectedPatientReadyLabs.find((l) => !l.isAcknowledged);

	const handleOpenOrderLabModal = (patientId?: string) => {
		setOrderLabPatientId(patientId || selectedPatient.id);
		setIsOrderLabModalOpen(true);
	};

	const handleAcknowledgeLabResult = (labId: string) => {
		setReadyLabResults((prev) =>
			prev.map((l) => (l.id === labId ? { ...l, isAcknowledged: true, isViewed: true } : l)),
		);
		toast.success("Lab result signed off and archived into Patient EHR record.");
	};

	const handleFocusPatientFromLab = (patientId: string, organ?: string) => {
		const target = patients.find((p) => p.id === patientId);
		if (target) {
			setSelectedPatientId(target.id);
			if (organ) setSelectedOrganSystem(organ);
			setIsLabsHubModalOpen(false);
			toast.success(`Chart & 3D Twin focused on ${target.name}.`);
		}
	};

	const handleLaunchAiFromLab = (lab: ReadyLabResult) => {
		handleFocusPatientFromLab(lab.patientId, lab.targetOrgan);
		setTimeout(() => {
			handleRunAiAnalysis("biomarkers");
		}, 300);
	};

	const handleDispatchCarePlanFromLab = (lab: ReadyLabResult) => {
		handleFocusPatientFromLab(lab.patientId, lab.targetOrgan);
		setAdviceText(
			`Hello ${lab.patientName},\n\nWe received your recent lab results for "${lab.panelName}" from ${lab.labProvider}.\n\nKey Finding: ${lab.findingsSummary}\n\nClinical Next Steps: ${lab.recommendedNextStep}\n\nPlease reach out if you have any questions or experience new symptoms.\n\n— ${doctor.doctorName}`,
		);
		setIsAdviceModalOpen(true);
	};

	const handleDispatchLabOrder = (e: React.FormEvent, simulateImmediate?: boolean) => {
		e.preventDefault();
		const targetPatient = patients.find((p) => p.id === orderLabPatientId) || selectedPatient;
		const panelObj = LAB_PANEL_PRESETS.find((p) => p.id === orderLabPanelId) || LAB_PANEL_PRESETS[0];

		setIsDispatchingLab(true);
		setTimeout(() => {
			setIsDispatchingLab(false);
			setIsOrderLabModalOpen(false);
			toast.success(`Lab Order for "${panelObj.name}" dispatched to ${orderLabProvider} for ${targetPatient.name}.`);

			// Simulate lab completion after 3.5s (or immediately if chosen)
			const delay = simulateImmediate ? 500 : 3500;
			setTimeout(() => {
				const newLabResult: ReadyLabResult = {
					id: `lab-${Date.now()}`,
					patientId: targetPatient.id,
					patientName: targetPatient.name,
					mrn: targetPatient.mrn,
					panelName: panelObj.name,
					labProvider: orderLabProvider,
					orderedAt: "Just now",
					completedAt: "Just now (Live FHIR Ingestion)",
					urgency: orderLabPriority === "stat" ? "urgent" : "routine",
					isViewed: false,
					isAcknowledged: false,
					targetOrgan: panelObj.defaultOrgan,
					findingsSummary: `Automated FHIR Telemetry Ingest: All ${panelObj.markersIncluded.length} biomarkers for ${panelObj.name} processed and cross-correlated.`,
					markers: panelObj.markersIncluded.map((markerName) => ({
						name: markerName,
						value: markerName.includes("ApoB") ? "78" : markerName.includes("Troponin") ? "0.01" : markerName.includes("eGFR") ? "68" : markerName.includes("TSH") ? "2.1" : "Normal",
						unit: markerName.includes("ApoB") ? "mg/dL" : markerName.includes("Troponin") ? "ng/mL" : markerName.includes("eGFR") ? "mL/min" : markerName.includes("TSH") ? "uIU/mL" : "",
						refRange: "Normal Bounds",
						priorValue: targetPatient.labMarkers.find((m) => m.marker.includes(markerName.split(" ")[0]))?.value || "Baseline",
						deltaPct: "-18.5%",
						status: "optimal",
						interpretation: "Biomarker stabilized within healthy therapeutic reference limits.",
					})),
					recommendedNextStep: "Maintain active care protocol and monitor home telemetry.",
				};

				setReadyLabResults((prev) => [newLabResult, ...prev]);

				// Also update the patient's lab markers in real time if matched
				setPatients((prev) =>
					prev.map((p) => {
						if (p.id !== targetPatient.id) return p;
						return {
							...p,
							labMarkers: p.labMarkers.map((m) => {
								if (panelObj.markersIncluded.some((pName) => m.marker.includes(pName.split(" ")[0]))) {
									return {
										...m,
										value: m.marker.includes("ApoB") ? "78 mg/dL" : m.value,
										status: m.marker.includes("ApoB") ? "optimal" : m.status,
										trend: "Recent Improvement (-39 mg/dL)",
									};
								}
								return m;
							}),
						};
					}),
				);

				toast.info(
					`🔔 New Lab Results Ready: "${panelObj.name}" for ${targetPatient.name} ingested via ${orderLabProvider}! Click "Labs Ready" to review.`,
					{ autoClose: 7000 },
				);
			}, delay);
		}, 800);
	};

	const handlePrescribeMedicine = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMedName.trim()) {
			toast.error("Please enter a medication name.");
			return;
		}

		const newMed = {
			name: newMedName.trim(),
			dosage: newMedDosage.trim() || "Standard Dose",
			frequency: newMedFrequency.trim() || "Daily (Morning)",
			adherence: 100,
		};

		setPatients((prev) =>
			prev.map((p) =>
				p.id === selectedPatient.id
					? { ...p, medications: [newMed, ...p.medications] }
					: p,
			),
		);

		toast.success(`Prescribed ${newMed.name} (${newMed.dosage}) for ${selectedPatient.name} — Dispatched to Patient EHR & App.`);
		setNewMedName("");
		setNewMedDosage("");
		setNewMedFrequency("Daily (Morning)");
		setIsPrescribeOpen(false);
	};

	// AI Clinical Analysis Handlers
	const handleRunAiAnalysis = (initialTab?: "summary" | "biomarkers" | "pharma" | "protocol" | "soap" | "chat") => {
		setIsAiAnalyzing(true);
		setIsAiReportModalOpen(true);
		setAiAnalysisTab(initialTab || "summary");
		setAiChatMessages([]);
		setTimeout(() => {
			setIsAiAnalyzing(false);
			toast.success(`AI Multi-System Intelligence generated for ${selectedPatient.name}.`);
		}, 600);
	};

	const handleSendAiQuestion = (questionText?: string) => {
		const query = (questionText || aiCustomQuestion).trim();
		if (!query) return;

		const userMsg = {
			sender: "doctor" as const,
			text: query,
			timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
		};

		setAiChatMessages((prev) => [...prev, userMsg]);
		if (!questionText) setAiCustomQuestion("");

		setTimeout(() => {
			const report = generatePatientAiAnalysis(selectedPatient, doctor.doctorName);
			let answer = `Based on ${selectedPatient.name}'s multi-omics telemetry and recent lab reports: `;

			const qLower = query.toLowerCase();
			if (qLower.includes("apob") || qLower.includes("lipid") || qLower.includes("atorvastatin") || qLower.includes("cholesterol")) {
				answer += `The elevated ApoB (${selectedPatient.labMarkers.find((m) => m.marker.includes("ApoB"))?.value || "128 mg/dL"}) reflects high circulating atherogenic particle count despite statin adherence. We strongly recommend combining Atorvastatin with Ezetimibe 10mg daily or increasing statin potency to achieve the < 80 mg/dL target.`;
			} else if (qLower.includes("metoprolol") || qLower.includes("lightheaded") || qLower.includes("pressure") || qLower.includes("bp")) {
				answer += `Afternoon lightheadedness correlates with peak plasma concentrations of morning beta-blockade / antihypertensives. Splitting the dose or scheduling morning hydration with 500ml of water significantly stabilizes hemodynamics.`;
			} else if (qLower.includes("holter") || qLower.includes("ecg") || qLower.includes("arrhythmia") || qLower.includes("palpitation")) {
				answer += `Given the exertional palpitations (severity 8/10) with heart rate spikes up to 118 bpm, a 24-hour ambulatory Holter ECG is essential to rule out paroxysmal atrial fibrillation or flutter before clearing for strenuous exertion.`;
			} else if (qLower.includes("tsh") || qLower.includes("thyroid") || qLower.includes("fatigue") || qLower.includes("levothyroxine")) {
				answer += `The subclinical TSH elevation (4.2 uIU/mL) combined with 25(OH)D deficiency (24 ng/mL) directly blunts mitochondrial energy efficiency. Fasting morning Levothyroxine and Vitamin D3 (5000 IU) supplementation should restore metabolic vitality.`;
			} else if (qLower.includes("egfr") || qLower.includes("kidney") || qLower.includes("renal") || qLower.includes("creatinine")) {
				answer += `Renal indices show mild-to-moderate filtration strain. Strict blood pressure control below 130/80 mmHg and maintaining hydration are the highest-yield nephroprotective interventions.`;
			} else {
				answer += `The primary clinical priority is addressing the ${report.triageScore.label}. Clinical protocol step 1 recommends: "${report.protocolSteps[0]?.title} - ${report.protocolSteps[0]?.action}". Follow-up lab panel in 60-90 days is advised.`;
			}

			const aiMsg = {
				sender: "ai" as const,
				text: answer,
				timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			};
			setAiChatMessages((prev) => [...prev, aiMsg]);
		}, 500);
	};

	const handleCopySoapNote = () => {
		const report = generatePatientAiAnalysis(selectedPatient, doctor.doctorName);
		const soapText = `CLINICAL SOAP NOTE — GENETIQ AI INTELLIGENCE
Patient: ${selectedPatient.name} (MRN: ${selectedPatient.mrn})
Age/Gender: ${selectedPatient.age}yo ${selectedPatient.gender} | Date: ${new Date().toLocaleDateString()}
Attending Physician: ${doctor.doctorName} (${doctor.department})

[SUBJECTIVE]
${report.soapNote.subjective}

[OBJECTIVE]
${report.soapNote.objective}

[ASSESSMENT]
${report.soapNote.assessment}

[PLAN]
${report.soapNote.plan}
`;
		navigator.clipboard.writeText(soapText);
		setIsCopiedSoap(true);
		toast.success("SOAP Note copied to clipboard for EHR documentation!");
		setTimeout(() => setIsCopiedSoap(false), 2500);
	};

	const handlePopulateAdviceFromAi = (customText?: string) => {
		const report = generatePatientAiAnalysis(selectedPatient, doctor.doctorName);
		const defaultAdvice = customText || `Hello ${selectedPatient.name},\n\nBased on our AI Clinical Analysis of your recent lab panel and telemetry:\n\n` +
			report.protocolSteps.map((s) => `• ${s.title}: ${s.action}`).join("\n\n") +
			`\n\nPlease follow these instructions and let us know immediately if symptoms worsen.\n\n— ${doctor.doctorName}`;

		setAdviceText(defaultAdvice);
		setIsAiReportModalOpen(false);
		setIsAdviceModalOpen(true);
		toast.info("AI Care Plan loaded into Patient Dispatch composer.");
	};

	return (
		<div className={`${styles.clinicalStage} ${isLeftPanelCollapsed ? styles.leftCollapsed : ""}`}>
			{/* 1. Full-Screen 3D Digital Twin Stage */}
			<div
				className={styles.canvasFullStage}
				data-patient-status={selectedPatient.status}
			>
				<CameraProvider>
					<MainScene
						selectedCategory={selectedOrganSystem}
						showSidebar={false}
						gender={selectedPatient.gender}
						patientData={selectedPatient}
					/>
				</CameraProvider>
			</div>

			{/* 2. Top Floating Header & Patient Selector */}
			<header className={styles.topHeader}>
				<div
					className={styles.brandArea}
					onClick={() => navigate(paths.dashboard.root)}
					title="Return to Patient Dashboard"
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							navigate(paths.dashboard.root);
						}
					}}
				>
					<div className={styles.brandLogo}>
						<img
							src="/assets/genetiq-logo.jpeg"
							alt="Genetiq Logo"
							className={styles.logoImage}
							width="38"
							height="38"
							loading="eager"
						/>
					</div>
					<div className={styles.hospitalMeta}>
						<h1 className={styles.hospitalTitle}>Genetiq</h1>
					</div>
				</div>

				{/* Center Patient Switcher Selector */}
				<div className={styles.patientSwitcherWrapper} ref={patientDropdownRef}>
					<button
						type="button"
						className={styles.patientSwitcherBtn}
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						aria-haspopup="listbox"
						aria-expanded={isDropdownOpen}
						title="Switch Active Clinical Patient"
					>
						<div className={styles.activePatientPill}>
							<div className={styles.patientIconCircle}>
								<User size={13} />
								<span
									className={`${styles.patientStatusDot} ${selectedPatient.status === "urgent"
											? styles.dotUrgent
											: selectedPatient.status === "monitoring"
												? styles.dotWarning
												: styles.dotOptimal
										}`}
								/>
							</div>
							<span className={styles.patientName}>
								{selectedPatient.name}
								<span className={styles.patientMrn}> ({selectedPatient.mrn})</span>
							</span>
						</div>
						<ChevronDown
							size={13}
							className={`${styles.patientChevron} ${isDropdownOpen ? styles.patientChevronRotated : ""}`}
						/>
					</button>

					{/* Dropdown Menu */}
					{isDropdownOpen && (
						<div className={styles.patientDropdownMenu}>
							<div className={styles.dropdownHeader}>
								<span className={styles.dropdownSectionTitle}>Assigned Patients</span>
								<span className={styles.dropdownCountBadge}>{patients.length} Total</span>
							</div>

							<div className={styles.dropdownSearch}>
								<Search size={14} className={styles.searchIcon} />
								<input
									type="text"
									placeholder="Search name, MRN, or diagnosis..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									autoFocus
								/>
							</div>

							<div className={styles.dropdownList}>
								{filteredDropdownPatients.map((p) => {
									const hasUnreadLab = readyLabResults.some((l) => l.patientId === p.id && !l.isAcknowledged);
									return (
										<div
											key={p.id}
											className={`${styles.dropdownItem} ${p.id === selectedPatient.id ? styles.dropdownItemActive : ""}`}
											onClick={() => {
												setSelectedPatientId(p.id);
												setSelectedOrganSystem(p.defaultOrgan);
												setIsDropdownOpen(false);
											}}
										>
											<div className={styles.dropdownItemLeft}>
												<div className={styles.dropdownPatientName}>
													{p.name}
													{hasUnreadLab && (
														<span className={styles.patientCardLabBadge} style={{ marginLeft: "6px" }}>
															<FlaskConical size={9} /> Labs Ready
														</span>
													)}
												</div>
												<div className={styles.dropdownPatientMeta}>
													{p.mrn} · {p.age}y {p.gender[0]} · {p.primaryDiagnosis}
												</div>
											</div>
											<span
												className={
													p.status === "urgent"
														? styles.badgeUrgent
														: p.status === "monitoring"
															? styles.badgeWarning
															: styles.badgeOptimal
												}
											>
												{p.status === "urgent" ? "Urgent" : p.status === "monitoring" ? "Monitored" : "Stable"}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>

				{/* Header Right Controls: Quick Navigation + KPIs + Doctor Profile */}
				<div className={styles.headerControls}>
					{/* Ready Lab Results Notification Ingestion Trigger */}
					<button
						type="button"
						className={styles.btnLabsReadyHeader}
						onClick={() => {
							setLabsFilter("all");
							setIsLabsHubModalOpen(true);
						}}
						title="Incoming Ready Lab Results & Telemetry Ingestion"
					>
						<FlaskConical size={14} style={{ color: "#00a896" }} />
						<span>Labs Ready</span>
						{unreadReadyLabsCount > 0 && (
							<span className={styles.labsReadyBadgeCount}>{unreadReadyLabsCount} New</span>
						)}
						{unreadReadyLabsCount > 0 && <span className={styles.labsReadyPulseDot} />}
					</button>

					{/* AI Insights & Report Analysis Trigger */}
					<button
						type="button"
						className={styles.btnAiInsights}
						onClick={() => handleRunAiAnalysis()}
						title="Run AI Multi-System Clinical Analysis"
					>
						<div className={styles.aiBrainIconWrapper}>
							<Brain size={14} className={styles.aiBrainIcon} />
							<Sparkles size={9} className={styles.aiSparkleBadge} />
						</div>
						<span className={styles.btnAiInsightsText}>AI Insights</span>
					</button>

					{/* KPI Pills */}
					<div className={styles.kpiPills}>
						<div className={styles.kpiPill} title="Urgent Triage Cases">
							<ShieldAlert size={13} style={{ color: "#ef4444" }} />
							<span>{patients.filter((p) => p.status === "urgent").length} Urgent</span>
						</div>
					</div>

					{/* Doctor Profile & Clinical Features Dropdown */}
					<div className={styles.doctorMenuWrapper} ref={doctorMenuRef}>
						<button
							type="button"
							className={`${styles.doctorTriggerBtn} ${isDoctorMenuOpen ? styles.doctorTriggerBtnActive : ""}`}
							onClick={() => setIsDoctorMenuOpen(!isDoctorMenuOpen)}
							title={`${doctor.doctorName} · Doctor Profile & Settings`}
							aria-label="Doctor Profile and Clinical Settings"
						>
							<div className={styles.doctorAvatarBadge}>
								<span>{doctorInitials}</span>
								<span className={styles.onlineDot} />
							</div>
						</button>

						{isDoctorMenuOpen && (
							<div className={styles.doctorMenuDropdown}>
								{/* Doctor Profile Hero */}
								<div className={styles.doctorMenuHero}>
									<div className={styles.doctorMenuHeroAvatar}>
										{doctorInitials}
									</div>
									<div className={styles.doctorMenuHeroInfo}>
										<div className={styles.heroName}>{doctor.doctorName}</div>
										<div className={styles.heroDept}>{doctor.hospitalName} · {doctor.department}</div>
										<div className={styles.heroCredentials}>
											<span className={styles.verifiedBadge}>
												<ShieldCheck size={11} /> NPI #1849204812 · Verified
											</span>
										</div>
									</div>
									<button
										type="button"
										className={styles.dropdownCloseBtn}
										onClick={() => setIsDoctorMenuOpen(false)}
										title="Close Menu"
										aria-label="Close Profile Menu"
									>
										<X size={16} strokeWidth={2.5} />
									</button>
								</div>

								{/* Appearance Theme Switcher Row */}
								<div className={styles.doctorMenuThemeRow}>
									<span className={styles.themeRowLabel}>Appearance</span>
									<ThemeSwitcher />
								</div>

								<div className={styles.menuDivider} />

								{/* Direct Appointments / Schedule Quick Trigger */}
								<button
									type="button"
									className={styles.dropdownActionBtn}
									onClick={() => {
										setIsScheduleModalOpen(true);
										setIsDoctorMenuOpen(false);
									}}
									title="View Booked Patient Appointments & Schedules"
								>
									<Calendar size={14} />
									<span>Appointments Schedule</span>
									<span className={styles.scheduleCountBadge}>
										{appointments.filter((a) => a.status === "waiting" || a.date.includes("Today")).length} Today
									</span>
								</button>

								{/* Labs Ready Hub Quick Trigger */}
								<button
									type="button"
									className={styles.dropdownActionBtn}
									onClick={() => {
										setLabsFilter("all");
										setIsLabsHubModalOpen(true);
										setIsDoctorMenuOpen(false);
									}}
									title="View Incoming Ready Lab Results"
								>
									<FlaskConical size={14} style={{ color: "#00a896" }} />
									<span>Labs Ready Ingestion</span>
									<span className={styles.scheduleCountBadge} style={{ background: "rgba(0,168,150,0.2)", color: "#00a896" }}>
										{unreadReadyLabsCount} Ready
									</span>
								</button>

								{/* Clinical Features & Access List */}
								<div className={styles.doctorMenuItems}>
									<button
										type="button"
										className={styles.doctorMenuItem}
										onClick={() => {
											setActiveSettingsTab("ehr");
											setIsSettingsModalOpen(true);
											setIsDoctorMenuOpen(false);
										}}
									>
										<div className={styles.menuItemIcon} style={{ background: "rgba(0, 168, 150, 0.15)", color: "#00a896" }}>
											<Database size={15} />
										</div>
										<div className={styles.menuItemText}>
											<span className={styles.menuItemTitle}>EHR &amp; FHIR Sync</span>
											<span className={styles.menuItemSub}>Epic / Cerner live sync status</span>
										</div>
										<span className={styles.statusPillLive}>Live</span>
									</button>

									<button
										type="button"
										className={styles.doctorMenuItem}
										onClick={() => {
											setActiveSettingsTab("alerts");
											setIsSettingsModalOpen(true);
											setIsDoctorMenuOpen(false);
										}}
									>
										<div className={styles.menuItemIcon} style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
											<Bell size={15} />
										</div>
										<div className={styles.menuItemText}>
											<span className={styles.menuItemTitle}>Triage Thresholds &amp; Alerts</span>
											<span className={styles.menuItemSub}>ApoB &amp; arrhythmia triggers</span>
										</div>
										<ChevronRight size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
									</button>

									<button
										type="button"
										className={styles.doctorMenuItem}
										onClick={() => {
											setActiveSettingsTab("orders");
											setIsSettingsModalOpen(true);
											setIsDoctorMenuOpen(false);
										}}
									>
										<div className={styles.menuItemIcon} style={{ background: "rgba(14, 165, 233, 0.15)", color: "#0ea5e9" }}>
											<FileText size={15} />
										</div>
										<div className={styles.menuItemText}>
											<span className={styles.menuItemTitle}>Order Sets &amp; Formulary</span>
											<span className={styles.menuItemSub}>90-day lab &amp; prescription sets</span>
										</div>
										<ChevronRight size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
									</button>

									<button
										type="button"
										className={styles.doctorMenuItem}
										onClick={() => {
											setActiveSettingsTab("voice");
											setIsSettingsModalOpen(true);
											setIsDoctorMenuOpen(false);
										}}
									>
										<div className={styles.menuItemIcon} style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }}>
											<Volume2 size={15} />
										</div>
										<div className={styles.menuItemText}>
											<span className={styles.menuItemTitle}>Voice AI Dictation</span>
											<span className={styles.menuItemSub}>Continuous speech &amp; lexicon</span>
										</div>
										<ChevronRight size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
									</button>

									<button
										type="button"
										className={styles.doctorMenuItem}
										onClick={() => {
											setActiveSettingsTab("security");
											setIsSettingsModalOpen(true);
											setIsDoctorMenuOpen(false);
										}}
									>
										<div className={styles.menuItemIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
											<ShieldCheck size={15} />
										</div>
										<div className={styles.menuItemText}>
											<span className={styles.menuItemTitle}>HIPAA Audit &amp; Credentials</span>
											<span className={styles.menuItemSub}>Active session &amp; AES-256 logs</span>
										</div>
										<ChevronRight size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
									</button>
								</div>

								<div className={styles.menuDivider} />

								{/* Bottom Switch to Patient View & Settings & Logout */}
								<div className={styles.doctorMenuFooter}>
									<button
										type="button"
										className={styles.doctorSettingsBtn}
										onClick={() => {
											setActiveSettingsTab("ehr");
											setIsSettingsModalOpen(true);
											setIsDoctorMenuOpen(false);
										}}
									>
										<Settings size={14} />
										<span>Portal Settings</span>
									</button>

									<button
										type="button"
										className={styles.patientModeItem}
										onClick={() => {
											setIsDoctorMenuOpen(false);
											navigate(paths.dashboard.root);
										}}
									>
										<User size={14} />
										<span>Patient Dashboard</span>
										<ExternalLink size={12} style={{ marginLeft: "auto", opacity: 0.7 }} />
									</button>

									<button
										type='button'
										className={styles.doctorSettingsBtn}
										onClick={() => {
											setIsDoctorMenuOpen(false);
											AuthCredentials.logout();
											dispatch(resetUser());
											toast.success("You have been signed out.");
											navigate(paths.auth.login, { replace: true });
										}}
									>
										<LogOut size={14} />
										<span>Log out</span>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</header>

			{/* Floating Expand Buttons (shown when panels are collapsed) */}
			{isLeftPanelCollapsed && (
				<button
					type='button'
					className={`${styles.expandToggleBtn} ${styles.expandToggleBtnLeft}`}
					onClick={() => {
						setIsLeftPanelCollapsed(false);
						if (window.innerWidth <= 768) {
							setIsRightPanelCollapsed(true);
						}
					}}
				>
					<User size={14} />
					<span>Patient Profile</span>
				</button>
			)}

			{isRightPanelCollapsed && (
				<button
					type='button'
					className={`${styles.expandToggleBtn} ${styles.expandToggleBtnRight}`}
					onClick={() => {
						setIsRightPanelCollapsed(false);
						if (window.innerWidth <= 768) {
							setIsLeftPanelCollapsed(true);
						}
					}}
				>
					<Activity size={14} />
					<span>Labs & Meds</span>
				</button>
			)}

			{/* 3. Floating Overlay Panels (Left & Right) */}
			<div className={styles.floatingLayout}>
				{/* Left Floating Panel: Patient Profile & Live Symptoms */}
				<div className={`${styles.leftPanel} ${isLeftPanelCollapsed ? styles.collapsed : ""}`}>
					{/* Patient Biometrics Card */}
					<div className={styles.glassCard}>
						<div className={styles.cardHeaderTop}>
							<div className={styles.cardTagGroup}>
								<span className={styles.cardTagLabel}>Assigned Patient</span>
								<span
									className={`${styles.patientStatusPillBadge} ${selectedPatient.status === "urgent"
											? styles.statusUrgent
											: selectedPatient.status === "monitoring"
												? styles.statusWarning
												: styles.statusOptimal
										}`}
								>
									<span className={styles.statusPulseDot} />
									{selectedPatient.status === "urgent"
										? "Urgent Case"
										: selectedPatient.status === "monitoring"
											? "Monitoring"
											: "Stable"}
								</span>
							</div>
							<button
								type='button'
								className={styles.panelCollapseBtn}
								onClick={() => setIsLeftPanelCollapsed(true)}
								title='Collapse Patient Panel'
								aria-label='Collapse Patient Panel'
							>
								<ChevronLeft size={16} />
							</button>
						</div>

						<div className={styles.patientHeroBlock}>
							<div className={styles.patientAvatarHero}>
								{selectedPatient.name.split(" ").map((n) => n[0]).join("")}
								<span
									className={`${styles.avatarStatusBeacon} ${selectedPatient.status === "urgent"
											? styles.beaconUrgent
											: selectedPatient.status === "monitoring"
												? styles.beaconWarning
												: styles.beaconOptimal
										}`}
								/>
							</div>
							<div className={styles.patientInfo}>
								<div className={styles.patientNameRow}>
									<span className={styles.patientName}>{selectedPatient.name}</span>
									<span className={styles.patientMrnBadge}>{selectedPatient.mrn}</span>
									{selectedPatientUnreadLab && (
										<button
											type="button"
											className={styles.patientCardLabBadge}
											onClick={() => {
												setLabsFilter("unread");
												setIsLabsHubModalOpen(true);
											}}
											title="Patient has unread ready lab results - Click to review"
										>
											<FlaskConical size={10} /> Labs Ready
										</button>
									)}
								</div>
								<div className={styles.patientDiagnosisPill}>
									<Heart size={12} className={styles.diagnosisIcon} />
									<span className={styles.patientMetaText}>{selectedPatient.primaryDiagnosis}</span>
								</div>
							</div>
						</div>

						<div className={styles.patientBiometricsGrid}>
							<div className={styles.biometricItem}>
								<div className={styles.bioHeader}>
									<User size={12} className={styles.bioIcon} />
									<span className={styles.bioLabel}>Age / Sex</span>
								</div>
								<span className={styles.bioValue}>{selectedPatient.age} ({selectedPatient.gender[0]})</span>
							</div>
							<div className={styles.biometricItem}>
								<div className={styles.bioHeader}>
									<Droplet size={12} className={styles.bioIconBlood} />
									<span className={styles.bioLabel}>Blood</span>
								</div>
								<span className={styles.bioValue}>{selectedPatient.bloodType}</span>
							</div>
							<div className={styles.biometricItem}>
								<div className={styles.bioHeader}>
									<Activity size={12} className={styles.bioIconBmi} />
									<span className={styles.bioLabel}>BMI</span>
								</div>
								<span className={styles.bioValue}>{selectedPatient.bmi}</span>
							</div>
						</div>

						{/* AI Analysis Quick Trigger Banner */}
						<button
							type="button"
							className={styles.btnLeftAiReport}
							onClick={() => handleRunAiAnalysis()}
							title="Generate AI Multi-System Clinical Analysis"
						>
							<div className={styles.btnLeftAiIconWrapper}>
								<Brain size={16} />
								<Sparkles size={11} className={styles.btnLeftAiSparkle} />
							</div>
							<div className={styles.btnLeftAiTextCol}>
								<span className={styles.btnLeftAiTitle}>AI Report Analysis</span>
								<span className={styles.btnLeftAiSubtitle}>Multi-System Diagnostics &amp; SOAP</span>
							</div>
							<ChevronRight size={14} className={styles.btnLeftAiChevron} />
						</button>
					</div>

					{/* Live Home-Logged Symptoms Card */}
					<div className={styles.glassCard}>
						<div className={styles.cardHeader}>
							<div className={styles.symptomsHeaderTitle}>
								<AlertTriangle size={15} style={{ color: "#f59e0b" }} />
								<h3>Home Symptoms</h3>
								<span className={styles.liveSyncBadge}>
									<span className={styles.livePulseDot} />
									Live
								</span>
							</div>
							<span className={styles.syncTimeText}>
								<Clock size={11} /> {selectedPatient.lastSync}
							</span>
						</div>

						{selectedPatient.symptoms.length === 0 ? (
							<div className={styles.emptySymptomsState}>
								<CheckCircle2 size={24} style={{ color: "#10b981", margin: "0 auto 6px auto", display: "block" }} />
								No active distress symptoms logged.
							</div>
						) : (
							selectedPatient.symptoms.map((s) => (
								<div
									key={s.id}
									className={styles.symptomCard}
								>
									<div className={styles.symptomTitleRow}>
										<span className={styles.symptomName}>{s.name}</span>
										<span className={s.urgency === "Red" ? styles.badgeUrgent : styles.badgeWarning}>
											Sev: {s.severity}/10
										</span>
									</div>

									<div className={styles.symptomNotes}>{s.notes}</div>

									<div className={styles.symptomFooter}>
										<span className={styles.symptomDuration}>
											<Clock size={10} /> {s.duration}
										</span>
										<span className={s.urgency === "Red" ? styles.triageTagRed : styles.triageTagYellow}>
											{s.urgency === "Red" ? <ShieldAlert size={11} /> : <AlertTriangle size={11} />}
											{s.urgency} Triage
										</span>
									</div>
								</div>
							))
						)}

						{/* Doctor Quick Action Buttons */}
						<div className={styles.actionButtonsGrid}>
							{selectedPatient.status === "urgent" && (
								<button
									type='button'
									className={styles.btnClearAlert}
									onClick={handleAcknowledge}
									title="Acknowledge and clear active clinical alert"
								>
									<CheckCircle2 size={14} /> Clear Alert
								</button>
							)}
							<button
								type='button'
								className={styles.btnSendAdvice}
								onClick={() => handleOpenAdviceModal(selectedPatient.symptoms[0]?.name)}
								title="Dispatch clinical advice directly to patient app"
							>
								<Send size={14} /> Send Advice
							</button>
						</div>
					</div>
				</div>

				{/* Right Floating Panel: Point-in-Time Chemistry & Diagnostics */}
				<div className={`${styles.rightPanel} ${isRightPanelCollapsed ? styles.collapsed : ""}`}>
					{/* Lab Biomarkers Card */}
					<div className={styles.glassCard}>
						<div className={styles.cardHeader}>
							<h3>
								<Activity size={16} style={{ color: "#00a896" }} />
								Lab Biomarkers & Chemistry
							</h3>
							<button
								type='button'
								className={styles.panelCollapseBtn}
								onClick={() => setIsRightPanelCollapsed(true)}
								title='Collapse Labs Panel'
							>
								<ChevronRight size={16} />
							</button>
						</div>

						{/* Ingested Lab Results Notification Banner for Current Patient */}
						{selectedPatientUnreadLab && (
							<div className={styles.labIngestedBanner}>
								<div className={styles.labIngestedInfo}>
									<FlaskConical size={18} className={styles.labIngestedIcon} />
									<div>
										<span className={styles.labIngestedTitle}>
											{selectedPatientUnreadLab.panelName}
										</span>
										<span className={styles.labIngestedMeta}>
											Completed {selectedPatientUnreadLab.completedAt} · {selectedPatientUnreadLab.labProvider}
										</span>
									</div>
								</div>
								<button
									type="button"
									className={styles.btnLabBannerReview}
									onClick={() => {
										setLabsFilter("all");
										setIsLabsHubModalOpen(true);
									}}
								>
									<Eye size={12} /> Review
								</button>
							</div>
						)}

						{selectedPatient.labMarkers.map((m, idx) => {
							const isExpanded = expandedMarker === m.marker;
							return (
								<div
									key={idx}
									className={`${styles.markerCard} ${isExpanded ? styles.markerCardExpanded : ""}`}
								>
									<button
										type='button'
										className={styles.markerRowBtn}
										onClick={() => setExpandedMarker(isExpanded ? null : m.marker)}
										aria-expanded={isExpanded}
										title={isExpanded ? "Click to collapse details" : "Click to view clinical details"}
									>
										<div className={styles.markerLeft}>
											<div className={styles.markerNameRow}>
												<span className={styles.markerName}>{m.marker}</span>
												<ChevronDown
													size={13}
													className={`${styles.markerChevron} ${isExpanded ? styles.markerChevronRotated : ""}`}
												/>
											</div>
											<div className={styles.markerRefText}>
												Ref: {m.refRange}
											</div>
										</div>
										<div className={styles.markerRight}>
											<div className={styles.markerVal}>{m.value}</div>
											<span
												className={
													m.status === "elevated"
														? styles.badgeUrgent
														: m.status === "low"
															? styles.badgeWarning
															: styles.badgeOptimal
												}
											>
												{m.status === "elevated" ? (
													<span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
														High <ArrowUpRight size={11} strokeWidth={2.5} />
													</span>
												) : m.status === "low" ? (
													<span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
														Low <ArrowDownRight size={11} strokeWidth={2.5} />
													</span>
												) : (
													<span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
														Optimal <Check size={11} strokeWidth={2.5} />
													</span>
												)}
											</span>
										</div>
									</button>

									{isExpanded && (
										<div className={styles.markerExpandedBody}>
											{m.clinicalInsight && (
												<div className={styles.markerInsightBox}>
													<div className={styles.markerInsightHeader}>
														<Info size={12} className={styles.insightIcon} />
														<span className={styles.markerInsightLabel}>Clinical Interpretation</span>
													</div>
													<p className={styles.markerInsightText}>{m.clinicalInsight}</p>
												</div>
											)}
											<div className={styles.markerMetaGrid}>
												{m.target && (
													<div className={styles.markerMetaCard}>
														<div className={styles.markerMetaHeader}>
															<ShieldCheck size={11} className={styles.metaIcon} />
															<span className={styles.markerMetaLabel}>Target Goal</span>
														</div>
														<span className={styles.markerMetaVal}>{m.target}</span>
													</div>
												)}
												{m.trend && (
													<div className={styles.markerMetaCard}>
														<div className={styles.markerMetaHeader}>
															<Activity size={11} className={styles.metaIcon} />
															<span className={styles.markerMetaLabel}>90-Day Trend</span>
														</div>
														<span className={`${styles.markerMetaVal} ${m.status === "elevated" ? styles.trendWarning : styles.trendNormal}`}>
															{m.trend}
														</span>
													</div>
												)}
												<div className={styles.markerMetaCard}>
													<div className={styles.markerMetaHeader}>
														<Heart size={11} className={styles.metaIcon} />
														<span className={styles.markerMetaLabel}>Organ System</span>
													</div>
													<span className={styles.markerMetaVal}>{m.system}</span>
												</div>
											</div>
										</div>
									)}
								</div>
							);
						})}

						<div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
							<button
								type='button'
								className={styles.btnActionSecondary}
								style={{ width: "100%" }}
								onClick={() => handleOpenOrderLabModal(selectedPatient.id)}
							>
								<RefreshCw size={13} /> Order Follow-Up Lab Panel
							</button>
							<button
								type='button'
								className={styles.btnQuickAiBiomarker}
								onClick={() => handleRunAiAnalysis("biomarkers")}
								title="Run AI Cross-Correlation on Biomarkers"
							>
								<Brain size={13} />
								<span>AI Biomarker Cross-Correlation</span>
							</button>
						</div>
					</div>

					{/* Active Prescriptions Card */}
					<div className={styles.glassCard}>
						<div className={styles.cardHeader}>
							<h3>
								<Pill size={16} style={{ color: "#0ea5e9" }} />
								Medications & Home Adherence
							</h3>
							<button
								type='button'
								className={styles.btnPrescribeToggle}
								onClick={() => setIsPrescribeOpen((prev) => !prev)}
								title={isPrescribeOpen ? "Close prescription form" : "Prescribe medication manually"}
							>
								{isPrescribeOpen ? <X size={12} /> : <Plus size={12} />}
								<span>{isPrescribeOpen ? "Cancel" : "Prescribe"}</span>
							</button>
						</div>

						{/* Inline Manual Prescription Form */}
						{isPrescribeOpen && (
							<form className={styles.prescribeForm} onSubmit={handlePrescribeMedicine}>
								<div className={styles.prescribeFormHeader}>
									<span className={styles.prescribeFormTitle}>Manual Prescription</span>
									<span className={styles.prescribeFormTarget}>for {selectedPatient.name}</span>
								</div>

								<div className={styles.prescribeFormFields}>
									<div className={styles.prescribeField}>
										<label htmlFor='newMedName'>Medication Name</label>
										<input
											id='newMedName'
											type='text'
											placeholder='e.g. Rosuvastatin, Losartan'
											value={newMedName}
											onChange={(e) => setNewMedName(e.target.value)}
											autoFocus
											required
										/>
									</div>

									<div className={styles.prescribeFieldRow}>
										<div className={styles.prescribeField}>
											<label htmlFor='newMedDosage'>Dosage</label>
											<input
												id='newMedDosage'
												type='text'
												placeholder='e.g. 20 mg, 50 mg'
												value={newMedDosage}
												onChange={(e) => setNewMedDosage(e.target.value)}
											/>
										</div>

										<div className={styles.prescribeField}>
											<label htmlFor='newMedFrequency'>Frequency</label>
											<select
												id='newMedFrequency'
												value={newMedFrequency}
												onChange={(e) => setNewMedFrequency(e.target.value)}
											>
												<option value='Daily (Morning)'>Daily (Morning)</option>
												<option value='Daily (Night)'>Daily (Night)</option>
												<option value='Twice Daily'>Twice Daily</option>
												<option value='Daily with dinner'>Daily with dinner</option>
												<option value='As needed (PRN)'>As needed (PRN)</option>
											</select>
										</div>
									</div>
								</div>

								<div className={styles.prescribeFormActions}>
									<button
										type='button'
										className={styles.btnCancelSmall}
										onClick={() => setIsPrescribeOpen(false)}
									>
										Cancel
									</button>
									<button type='submit' className={styles.btnSubmitPrescription}>
										<Send size={12} /> Prescribe Medicine
									</button>
								</div>
							</form>
						)}

						{selectedPatient.medications.length === 0 ? (
							<div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
								No active prescription medications.
							</div>
						) : (
							selectedPatient.medications.map((med, idx) => (
								<div key={idx} className={styles.markerRow}>
									<div>
										<div className={styles.markerName}>{med.name} ({med.dosage})</div>
										<div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)" }}>
											{med.frequency}
										</div>
									</div>
									<span className={styles.badgeOptimal}>
										{med.adherence}% streak
									</span>
								</div>
							))
						)}
					</div>
				</div>
			</div>

			{/* 4. Advice & Care Plan Dispatch Modal (Interactive 2-Way Patient & Doctor Chat Hub) */}
			<ClinicalCareChatModal
				isOpen={isAdviceModalOpen}
				onClose={() => setIsAdviceModalOpen(false)}
				selectedPatient={selectedPatient}
				doctor={doctor}
				initialAdviceText={adviceText}
				onAdviceDispatched={(_dispatchedText) => {
					setPatients((prev) =>
						prev.map((p) =>
							p.id === selectedPatient.id ? { ...p, status: "monitoring" } : p,
						),
					);
				}}
			/>

			{/* 5. Doctor Clinical Settings & Feature Hub Modal */}
			{isSettingsModalOpen && (
				<div className={styles.modalOverlay} onClick={() => setIsSettingsModalOpen(false)}>
					<div className={`${styles.modalContent} ${styles.settingsModalContent}`} onClick={(e) => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
								<div className={styles.settingsModalIconBadge}>
									<Settings size={18} style={{ color: "#00a896" }} />
								</div>
								<div>
									<h2>Doctor Portal Settings & Features</h2>
									<p style={{ margin: 0, fontSize: "0.74rem", color: "rgba(255,255,255,0.5)" }}>
										{doctor.doctorName} · Genetiq ({doctor.department})
									</p>
								</div>
							</div>
							<button
								type='button'
								className={styles.closeBtn}
								onClick={() => setIsSettingsModalOpen(false)}
							>
								<X size={18} />
							</button>
						</div>

						<div className={styles.settingsModalBody}>
							{/* Tab Navigation */}
							<div className={styles.settingsTabsList}>
								<button
									type='button'
									className={`${styles.settingsTabBtn} ${activeSettingsTab === "ehr" ? styles.settingsTabBtnActive : ""}`}
									onClick={() => setActiveSettingsTab("ehr")}
								>
									<Database size={15} />
									<span>EHR & FHIR Sync</span>
								</button>
								<button
									type='button'
									className={`${styles.settingsTabBtn} ${activeSettingsTab === "alerts" ? styles.settingsTabBtnActive : ""}`}
									onClick={() => setActiveSettingsTab("alerts")}
								>
									<Bell size={15} />
									<span>Triage & Alerts</span>
								</button>
								<button
									type='button'
									className={`${styles.settingsTabBtn} ${activeSettingsTab === "orders" ? styles.settingsTabBtnActive : ""}`}
									onClick={() => setActiveSettingsTab("orders")}
								>
									<FileText size={15} />
									<span>Order Sets & Formularies</span>
								</button>
								<button
									type='button'
									className={`${styles.settingsTabBtn} ${activeSettingsTab === "voice" ? styles.settingsTabBtnActive : ""}`}
									onClick={() => setActiveSettingsTab("voice")}
								>
									<Volume2 size={15} />
									<span>Voice AI Dictation</span>
								</button>
								<button
									type='button'
									className={`${styles.settingsTabBtn} ${activeSettingsTab === "security" ? styles.settingsTabBtnActive : ""}`}
									onClick={() => setActiveSettingsTab("security")}
								>
									<ShieldCheck size={15} />
									<span>HIPAA & Credentials</span>
								</button>
							</div>

							{/* Tab Content Panel */}
							<div className={styles.settingsTabContent}>
								{/* TAB 1: EHR & FHIR SYNC */}
								{activeSettingsTab === "ehr" && (
									<div className={styles.settingsSection}>
										<div className={styles.sectionHeader}>
											<div>
												<h3>EHR and Health System Connections</h3>
												<p>Sync patient records and data between Genetiq and your connected health systems.</p>
											</div>
											<button
												type='button'
												className={styles.syncNowBtn}
												onClick={handleTriggerEhrSync}
												disabled={ehrSyncing}
											>
												<RefreshCw size={14} className={ehrSyncing ? styles.spinning : ""} />
												<span>{ehrSyncing ? "Syncing records..." : "Sync EHR now"}</span>
											</button>
										</div>

										<div className={styles.integrationCardsGrid}>
											<div className={styles.integrationCard}>
												<div className={styles.integrationHeader}>
													<div className={styles.intIconTitle}>
														<Database size={16} style={{ color: "#00a896" }} />
														<span style={{ fontWeight: 700 }}>Epic Systems FHIR API</span>
													</div>
													<span className={styles.statusPillLive}>Connected</span>
												</div>
												<div className={styles.integrationMeta}>
													<div>Endpoint: <code>https://fhir.genetiq.io/r4</code></div>
													<div>Protocol: Standard health data exchange</div>
													<div>Last sync: Just now · Auto-sync on</div>
												</div>
											</div>

											<div className={styles.integrationCard}>
												<div className={styles.integrationHeader}>
													<div className={styles.intIconTitle}>
														<Activity size={16} style={{ color: "#0ea5e9" }} />
														<span style={{ fontWeight: 700 }}>Telemetry and Wearables</span>
													</div>
													<span className={styles.statusPillLive}>Active</span>
												</div>
												<div className={styles.integrationMeta}>
													<div>Source: Apple Health / Withings</div>
													<div>Data: heart rate, blood pressure, glucose</div>
													<div>Connected patients: 3 active streams</div>
												</div>
											</div>
										</div>

										<div className={styles.settingsCardBox}>
											<div className={styles.settingRow}>
												<div>
													<div className={styles.settingTitle}>Daily biometrics auto-import</div>
													<div className={styles.settingDesc}>Pull home-reported symptoms and blood pressure readings into each patient chart.</div>
												</div>
												<input type="checkbox" defaultChecked className={styles.toggleCheckbox} />
											</div>
											<div className={styles.settingRow}>
												<div>
													<div className={styles.settingTitle}>Clinical notes auto-save</div>
													<div className={styles.settingDesc}>Send care plans and doctor notes directly to each patient’s record.</div>
												</div>
												<input type="checkbox" defaultChecked className={styles.toggleCheckbox} />
											</div>
										</div>
									</div>
								)}

								{/* TAB 2: TRIAGE & ALERTS */}
								{activeSettingsTab === "alerts" && (
									<div className={styles.settingsSection}>
										<div className={styles.sectionHeader}>
											<div>
												<h3>Clinical Triage Thresholds & Notifications</h3>
												<p>Automated telemetry alarms and notification escalation protocols for urgent patient conditions.</p>
											</div>
										</div>

										<div className={styles.settingsCardBox}>
											<div className={styles.settingRow}>
												<div>
													<div className={styles.settingTitle}>ApoB Critical Elevated Threshold</div>
													<div className={styles.settingDesc}>Trigger urgent doctor notification when patient ApoB exceeds this level.</div>
												</div>
												<div className={styles.settingControl}>
													<span className={styles.thresholdVal}>120 mg/dL</span>
												</div>
											</div>

											<div className={styles.settingRow}>
												<div>
													<div className={styles.settingTitle}>Resting Heart Rate Triage Spike</div>
													<div className={styles.settingDesc}>Flag patient in red banner if resting HR exceeds threshold for over 15 minutes.</div>
												</div>
												<div className={styles.settingControl}>
													<span className={styles.thresholdVal}>105 bpm</span>
												</div>
											</div>

											<div className={styles.settingRow}>
												<div>
													<div className={styles.settingTitle}>Home Blood Pressure Red Flag</div>
													<div className={styles.settingDesc}>Escalate triage priority when systolic reading exceeds threshold.</div>
												</div>
												<div className={styles.settingControl}>
													<span className={styles.thresholdVal}>150 mmHg</span>
												</div>
											</div>

											<div className={styles.settingRow}>
												<div>
													<div className={styles.settingTitle}>Emergency SMS & Pager Escalation</div>
													<div className={styles.settingDesc}>Dispatch immediate SMS alert to on-call cardiology team for Red Severity symptoms.</div>
												</div>
												<input type="checkbox" defaultChecked className={styles.toggleCheckbox} />
											</div>
										</div>
									</div>
								)}

								{/* TAB 3: ORDER SETS & FORMULARIES */}
								{activeSettingsTab === "orders" && (
									<div className={styles.settingsSection}>
										<div className={styles.sectionHeader}>
											<div>
												<h3>Clinical Order Sets & Fast Protocols</h3>
												<p>Pre-configured standard order sets for fast lab scheduling and pharmacotherapy prescription.</p>
											</div>
										</div>

										<div className={styles.orderSetsList}>
											<div className={styles.orderSetCard}>
												<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
													<div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#00a896" }}>
														90-Day Advanced Lipid & Inflammatory Panel
													</div>
													<span className={styles.badgeOptimal}>Standard Protocol</span>
												</div>
												<div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>
													Markers: ApoB, LDL-P, hs-CRP, Fasting Lipid Panel, eGFR, Liver Panel (ALT/AST).
												</div>
												<div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
													<button
														type='button'
														className={styles.orderSetApplyBtn}
														onClick={() => {
															handleOpenOrderLabModal(selectedPatient.id);
															setIsSettingsModalOpen(false);
														}}
													>
														<Plus size={13} /> Order for {selectedPatient.name}
													</button>
												</div>
											</div>

											<div className={styles.orderSetCard}>
												<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
													<div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#00a896" }}>
														Atrial Fibrillation Rhythm Assessment & Patch
													</div>
													<span className={styles.badgeWarning}>Cardio Protocol</span>
												</div>
												<div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>
													Order: 14-Day Continuous ECG Adhesive Patch + Serum Potassium & Magnesium Check.
												</div>
												<div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
													<button
														type='button'
														className={styles.orderSetApplyBtn}
														onClick={() => {
															toast.success(`14-Day ECG Patch order queued for ${selectedPatient.name}.`);
															setIsSettingsModalOpen(false);
														}}
													>
														<Plus size={13} /> Order for {selectedPatient.name}
													</button>
												</div>
											</div>
										</div>
									</div>
								)}

								{/* TAB 4: VOICE AI DICTATION */}
								{activeSettingsTab === "voice" && (
									<div className={styles.settingsSection}>
										<div className={styles.sectionHeader}>
											<div>
												<h3>Voice AI Dictation & Clinical Speech Model</h3>
												<p>Configured for hands-free clinical advice generation and real-time medical entity parsing.</p>
											</div>
										</div>

										<div className={styles.settingsCardBox}>
											<div className={styles.settingRow}>
												<div>
													<div className={styles.settingTitle}>Continuous Speech Recognition</div>
													<div className={styles.settingDesc}>Enables real-time streaming voice-to-text without word truncation.</div>
												</div>
												<input type="checkbox" defaultChecked className={styles.toggleCheckbox} />
											</div>

											<div className={styles.settingRow}>
												<div>
													<div className={styles.settingTitle}>Cardiology & Pharmacology Lexicon</div>
													<div className={styles.settingDesc}>Enhance phoneme recognition for drug names (e.g., Metoprolol, Atorvastatin, Lisinopril).</div>
												</div>
												<span className={styles.badgeOptimal}>Active</span>
											</div>

											<div className={styles.settingRow}>
												<div>
													<div className={styles.settingTitle}>Background Noise Suppression</div>
													<div className={styles.settingDesc}>Filter hospital ambient sounds and room reverberation during voice dictation.</div>
												</div>
												<input type="checkbox" defaultChecked className={styles.toggleCheckbox} />
											</div>
										</div>
									</div>
								)}

								{/* TAB 5: HIPAA & SECURITY */}
								{activeSettingsTab === "security" && (
									<div className={styles.settingsSection}>
										<div className={styles.sectionHeader}>
											<div>
												<h3>HIPAA Compliance, Audit Trail & Credentials</h3>
												<p>Active physician verification, access logging, and cryptographic transport protection.</p>
											</div>
										</div>

										<div className={styles.credentialsGrid}>
											<div className={styles.credentialCard}>
												<div className={styles.credLabel}>Practicing Physician</div>
												<div className={styles.credValue}>{doctor.doctorName}</div>
												<div className={styles.credSub}>{doctor.title} · {doctor.hospitalName}</div>
											</div>
											<div className={styles.credentialCard}>
												<div className={styles.credLabel}>Medical License & NPI</div>
												<div className={styles.credValue}>MD-882914</div>
												<div className={styles.credSub}>NPI #1849204812 · Board Certified</div>
											</div>
											<div className={styles.credentialCard}>
												<div className={styles.credLabel}>Data Encryption</div>
												<div className={styles.credValue}>AES-256-GCM</div>
												<div className={styles.credSub}>TLS 1.3 In-Transit · Zero-Knowledge Storage</div>
											</div>
										</div>

										<div className={styles.settingsCardBox} style={{ marginTop: "16px" }}>
											<div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "8px", color: "rgba(255,255,255,0.8)" }}>
												Recent HIPAA Audit Access Trail:
											</div>
											<div className={styles.auditLogList}>
												<div className={styles.auditLogRow}>
													<span>Marcus Vance (MRN-84920) chart accessed for Triage Review</span>
													<span style={{ color: "rgba(255,255,255,0.4)" }}>Today, 09:14 AM</span>
												</div>
												<div className={styles.auditLogRow}>
													<span>Elena Rostova (MRN-67219) lab panel telemetry viewed</span>
													<span style={{ color: "rgba(255,255,255,0.4)" }}>Today, 08:42 AM</span>
												</div>
												<div className={styles.auditLogRow}>
													<span>EHR FHIR v4 synchronization performed</span>
													<span style={{ color: "rgba(255,255,255,0.4)" }}>Today, 08:30 AM</span>
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>

						<div className={styles.modalFooter}>
							<button
								type='button'
								className={styles.btnActionPrimary}
								onClick={() => {
									setIsSettingsModalOpen(false);
									toast.success("Doctor clinical settings and preferences saved.");
								}}
							>
								<Check size={14} /> Save & Close Settings
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 6. Patient Appointments & Clinical Schedules Modal */}
			{isScheduleModalOpen && (
				<div className={styles.modalOverlay} onClick={() => setIsScheduleModalOpen(false)}>
					<div className={`${styles.modalContent} ${styles.scheduleModalContent}`} onClick={(e) => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
								<div className={styles.scheduleModalIconBadge}>
									<Calendar size={18} style={{ color: "#00a896" }} />
								</div>
								<div>
									<h2>Patient Appointments & Clinical Schedules</h2>
									<p style={{ margin: 0, fontSize: "0.74rem", color: "rgba(255,255,255,0.5)" }}>
										{doctor.doctorName} · {doctor.hospitalName} ({appointments.length} Total Booked)
									</p>
								</div>
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
								<button
									type='button'
									className={styles.bookNewApptBtn}
									onClick={() => setIsBookingModalOpen(true)}
								>
									<CalendarPlus size={14} />
									<span>Schedule Consultation</span>
								</button>
								<button
									type='button'
									className={styles.closeBtn}
									onClick={() => setIsScheduleModalOpen(false)}
								>
									<X size={18} />
								</button>
							</div>
						</div>

						{/* Filter Pills */}
						<div className={styles.scheduleFiltersBar}>
							<div className={styles.filterPillsGroup}>
								<button
									type='button'
									className={`${styles.filterPill} ${appointmentFilter === "all" ? styles.filterPillActive : ""}`}
									onClick={() => setAppointmentFilter("all")}
								>
									All Consultations ({appointments.length})
								</button>
								<button
									type='button'
									className={`${styles.filterPill} ${appointmentFilter === "today" ? styles.filterPillActive : ""}`}
									onClick={() => setAppointmentFilter("today")}
								>
									Today's Schedule ({appointments.filter((a) => a.date.toLowerCase().includes("today") || a.status === "waiting").length})
								</button>
								<button
									type='button'
									className={`${styles.filterPill} ${appointmentFilter === "telehealth" ? styles.filterPillActive : ""}`}
									onClick={() => setAppointmentFilter("telehealth")}
								>
									Video Call (Online) ({appointments.filter((a) => a.mode === "telehealth").length})
								</button>
								<button
									type='button'
									className={`${styles.filterPill} ${appointmentFilter === "in-person" ? styles.filterPillActive : ""}`}
									onClick={() => setAppointmentFilter("in-person")}
								>
									In-Person Clinic ({appointments.filter((a) => a.mode === "in-person").length})
								</button>
								<button
									type='button'
									className={`${styles.filterPill} ${appointmentFilter === "completed" ? styles.filterPillActive : ""}`}
									onClick={() => setAppointmentFilter("completed")}
								>
									Completed ({appointments.filter((a) => a.status === "completed").length})
								</button>
							</div>

							{/* Filter by Specialist */}
							<div className={styles.specialistFilterRow}>
								<span className={styles.specialistFilterLabel}>Specialist:</span>
								<button
									type='button'
									className={`${styles.specPillSmall} ${specialistFilter === "all" ? styles.specPillSmallActive : ""}`}
									onClick={() => setSpecialistFilter("all")}
								>
									All
								</button>
								{CLINICAL_SPECIALISTS.map((spec) => (
									<button
										key={spec.id}
										type='button'
										className={`${styles.specPillSmall} ${specialistFilter === spec.initials.toLowerCase() ? styles.specPillSmallActive : ""}`}
										onClick={() => setSpecialistFilter(spec.initials.toLowerCase())}
									>
										<strong>{spec.initials}</strong> {spec.name}
									</button>
								))}
							</div>
						</div>

						{/* Appointments List Body */}
						<div className={styles.scheduleModalBody}>
							{filteredAppointments.length === 0 ? (
								<div className={styles.emptyScheduleState}>
									<Calendar size={32} style={{ color: "rgba(255,255,255,0.2)", marginBottom: "8px" }} />
									<div>No booked appointments found for this filter.</div>
								</div>
							) : (
								filteredAppointments.map((appt) => (
									<div
										key={appt.id}
										className={`${styles.appointmentCard} ${appt.status === "waiting" ? styles.appointmentCardWaiting : ""}`}
									>
										{/* Top Row: Patient Info + Mode & Status Badges */}
										<div className={styles.apptTopRow}>
											<div className={styles.apptPatientMeta}>
												<div className={styles.apptPatientAvatar}>{appt.patientAvatar}</div>
												<div>
													<div className={styles.apptPatientName}>{appt.patientName}</div>
													<div className={styles.apptMrn}>{appt.patientMrn}</div>
												</div>
											</div>

											<div className={styles.apptBadgesGroup}>
												<span
													className={
														appt.mode === "telehealth"
															? styles.modeBadgeTelehealth
															: appt.mode === "in-person"
																? styles.modeBadgeInPerson
																: appt.mode === "phone"
																	? styles.modeBadgePhone
																	: styles.modeBadgeAi
													}
												>
													{appt.mode === "telehealth" && <Video size={12} />}
													{appt.mode === "in-person" && <MapPin size={12} />}
													{appt.mode === "phone" && <PhoneCall size={12} />}
													{appt.mode === "ai-consult" && <Sparkles size={12} />}
													<span>
														{appt.mode === "telehealth"
															? "Video Call (Online)"
															: appt.mode === "in-person"
																? "In-Person Clinic"
																: appt.mode === "phone"
																	? "Audio Phone"
																	: "AI Consultation"}
													</span>
												</span>

												<span
													className={
														appt.status === "waiting"
															? styles.badgeUrgentPulse
															: appt.status === "confirmed"
																? styles.badgeOptimal
																: styles.badgeWarning
													}
												>
													{appt.status === "waiting" ? "Waiting in Room" : appt.status === "confirmed" ? "Confirmed" : "Completed"}
												</span>
											</div>
										</div>

										{/* Specialist Assigned Banner */}
										<div className={styles.apptSpecialistBanner}>
											<div className={styles.specBadgeIcon}>{appt.specialistInitials || "KM"}</div>
											<div className={styles.specMeta}>
												<span className={styles.specName}>{appt.specialistName || "Dr. Kwame Mensah"}</span>
												<span className={styles.specRole}>{appt.specialistRole || appt.department}</span>
											</div>
										</div>

										{/* Details: Title, Preferred Time Slot, Notes */}
										<div className={styles.apptDetailsBlock}>
											<div className={styles.apptTitle}>{appt.appointmentType}</div>
											<div className={styles.apptTimeRow}>
												<span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
													<Clock size={13} style={{ color: "#00a896" }} />
													Preferred Time Slot: <strong>{appt.date}, {appt.time}</strong> ({appt.durationMinutes} mins)
												</span>
											</div>
											<div className={styles.apptNotesText}>
												<strong>Notes for Physician:</strong> {appt.notes || "No additional pre-consultation notes provided."}
											</div>
										</div>

										{/* Action Buttons Row */}
										<div className={styles.apptActionsRow}>
											{appt.mode === "telehealth" && appt.status !== "completed" && (
												<button
													type='button'
													className={styles.joinTelehealthBtn}
													onClick={() => handleJoinTelehealth(appt)}
												>
													<Video size={14} />
													<span>{appt.status === "waiting" ? "Join Waiting Room Video Now" : "Launch Encrypted Video Room"}</span>
												</button>
											)}

											<button
												type='button'
												className={styles.focusPatientBtn}
												onClick={() => handleFocusPatientFromAppt(appt.patientId)}
											>
												<UserCheck size={14} />
												<span>Focus 3D Twin & Chart</span>
											</button>

											{appt.status !== "completed" && (
												<button
													type='button'
													className={styles.markDoneBtn}
													onClick={() => handleMarkApptCompleted(appt.id)}
													title='Mark appointment completed'
												>
													<Check size={13} />
													<span>Mark Done</span>
												</button>
											)}
										</div>
									</div>
								))
							)}
						</div>

						<div className={styles.modalFooter}>
							<button
								type='button'
								className={styles.btnActionSecondary}
								onClick={() => setIsScheduleModalOpen(false)}
							>
								Close Schedule
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 7. Book New Patient Appointment Sub-Modal */}
			{isBookingModalOpen && (
				<div className={styles.modalOverlay} onClick={() => setIsBookingModalOpen(false)}>
					<div className={`${styles.modalContent} ${styles.bookingModalContent}`} onClick={(e) => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
								<div className={styles.scheduleModalIconBadge}>
									<CalendarPlus size={18} style={{ color: "#00a896" }} />
								</div>
								<div>
									<h2>Schedule Patient Consultation</h2>
									<p style={{ margin: 0, fontSize: "0.74rem", color: "rgba(255,255,255,0.5)" }}>
										Book next clinical visit or specialist review
									</p>
								</div>
							</div>
							<button
								type='button'
								className={styles.closeBtn}
								onClick={() => setIsBookingModalOpen(false)}
							>
								<X size={18} />
							</button>
						</div>

						<form onSubmit={handleCreateNewAppointment}>
							<div className={styles.bookingModalBody}>
								{/* Patient selector */}
								<div className={styles.formGroup}>
									<label>Select Patient</label>
									<select
										className={styles.formSelect}
										value={newApptPatientId}
										onChange={(e) => setNewApptPatientId(e.target.value)}
									>
										{patients.map((p) => (
											<option key={p.id} value={p.id}>
												{p.name} ({p.mrn}) · {p.primaryDiagnosis}
											</option>
										))}
									</select>
								</div>

								{/* Select Specialist */}
								<div className={styles.formGroup}>
									<label>Select Specialist</label>
									<div className={styles.specialistGrid}>
										{CLINICAL_SPECIALISTS.map((doc) => (
											<button
												key={doc.id}
												type='button'
												className={`${styles.specialistCard} ${newApptSpecialistId === doc.id ? styles.specialistCardActive : ""
													}`}
												onClick={() => setNewApptSpecialistId(doc.id)}
											>
												<div className={styles.specialistAvatar}>{doc.initials}</div>
												<div>
													<p className={styles.specialistName}>{doc.name}</p>
													<p className={styles.specialistRole}>{doc.role}</p>
												</div>
											</button>
										))}
									</div>
								</div>

								{/* Consultation Type / Mode */}
								<div className={styles.formGroup}>
									<label>Consultation Type</label>
									<div className={styles.modeGridFour}>
										<button
											type='button'
											className={`${styles.modeCardBtn} ${newApptMode === "telehealth" ? styles.modeCardBtnActive : ""}`}
											onClick={() => setNewApptMode("telehealth")}
										>
											<Video size={18} />
											<span>Video Call</span>
										</button>
										<button
											type='button'
											className={`${styles.modeCardBtn} ${newApptMode === "in-person" ? styles.modeCardBtnActive : ""}`}
											onClick={() => setNewApptMode("in-person")}
										>
											<MapPin size={18} />
											<span>In-Person</span>
										</button>
										<button
											type='button'
											className={`${styles.modeCardBtn} ${newApptMode === "phone" ? styles.modeCardBtnActive : ""}`}
											onClick={() => setNewApptMode("phone")}
										>
											<PhoneCall size={18} />
											<span>Audio Phone</span>
										</button>
										<button
											type='button'
											className={`${styles.modeCardBtn} ${newApptMode === "ai-consult" ? styles.modeCardBtnActive : ""}`}
											onClick={() => setNewApptMode("ai-consult")}
										>
											<Sparkles size={18} />
											<span>AI Consultation</span>
										</button>
									</div>
								</div>

								{/* Preferred Time Slot */}
								<div className={styles.formGroup}>
									<label>Preferred Time Slot</label>
									<div className={styles.slotGridTwo}>
										{CONSULTATION_TIME_SLOTS.map((slot) => (
											<button
												key={slot}
												type='button'
												className={`${styles.slotCardBtn} ${newApptSlot === slot ? styles.slotCardBtnActive : ""
													}`}
												onClick={() => setNewApptSlot(slot)}
											>
												{slot}
											</button>
										))}
									</div>
								</div>

								{/* Notes for Physician (Optional) */}
								<div className={styles.formGroup}>
									<label>Notes for Physician (Optional)</label>
									<textarea
										className={styles.formTextarea}
										value={newApptNotes}
										onChange={(e) => setNewApptNotes(e.target.value)}
										placeholder="Mention any symptoms, specific questions, or lab results you'd like the doctor to review..."
										rows={3}
									/>
								</div>
							</div>

							<div className={styles.modalFooter}>
								<div className={styles.trustBadge}>
									<ShieldCheck size={16} style={{ color: "#10b981" }} />
									<span>HIPAA Compliant & Confidential</span>
								</div>
								<div style={{ display: "flex", gap: "8px" }}>
									<button
										type='button'
										className={styles.btnActionSecondary}
										onClick={() => setIsBookingModalOpen(false)}
									>
										Cancel
									</button>
									<button
										type='submit'
										className={styles.btnActionPrimary}
									>
										<CalendarPlus size={14} /> Confirm & Schedule
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* 5. AI Clinical Intelligence & Multi-System Report Analysis Modal */}
			{isAiReportModalOpen && (() => {
				const aiReport = generatePatientAiAnalysis(selectedPatient, doctor.doctorName);
				return (
					<div className={styles.modalOverlay} onClick={() => setIsAiReportModalOpen(false)}>
						<div className={styles.aiModalContent} onClick={(e) => e.stopPropagation()}>
							{/* AI Header */}
							<div className={styles.aiModalHeader}>
								<div className={styles.aiHeaderLeft}>
									<div className={styles.aiHeaderIconBadge}>
										<Brain size={24} className={styles.aiHeaderBrainIcon} />
										<Sparkles size={13} className={styles.aiHeaderSparkle} />
										<span className={styles.aiHeaderGlowRing} />
									</div>
									<div className={styles.aiHeaderMetaCol}>
										<div className={styles.aiHeaderTitleRow}>
											<h2 className={styles.aiHeaderMainTitle}>
												AI Clinical Intelligence <span className={styles.aiTitleAmp}>&amp;</span> Multi-System Analysis
											</h2>
											<div className={styles.aiEngineTag}>
												<Bot size={13} />
												<span>DeepBio LLM v4.2</span>
												<span className={styles.aiEngineDot} />
												<span className={styles.aiEngineLiveText}>Telemetry Grounded</span>
											</div>
										</div>

										<div className={styles.aiPatientSubBar}>
											{/* Patient Avatar & Name Pill */}
											<div className={styles.aiPatientHeroPill}>
												<div className={styles.aiPatientMiniAvatar}>
													{selectedPatient.name.split(" ").map((n) => n[0]).join("")}
												</div>
												<span className={styles.aiPatientSubName}>{selectedPatient.name}</span>
												<span className={styles.aiPatientMrnTag}>{selectedPatient.mrn}</span>
											</div>

											<span className={styles.aiDotSep}>•</span>

											{/* Demographics Pill */}
											<div className={styles.aiDemographicsPill}>
												<User size={12} />
												<span>{selectedPatient.age}yo {selectedPatient.gender}</span>
												<span className={styles.aiBloodPill}>{selectedPatient.bloodType}</span>
											</div>

											<span className={styles.aiDotSep}>•</span>

											{/* Diagnosis Chip */}
											<div className={styles.aiDiagnosisChip}>
												<Heart size={12} className={styles.aiDiagIcon} />
												<span>{selectedPatient.primaryDiagnosis}</span>
											</div>

											{/* Live Status Beacon */}
											<div
												className={`${styles.aiStatusBeaconPill} ${selectedPatient.status === "urgent"
														? styles.aiBeaconUrgent
														: selectedPatient.status === "monitoring"
															? styles.aiBeaconWarning
															: styles.aiBeaconOptimal
													}`}
											>
												<span className={styles.aiBeaconPulse} />
												<span>
													{selectedPatient.status === "urgent"
														? "Urgent Case"
														: selectedPatient.status === "monitoring"
															? "Monitored"
															: "Stable Baseline"}
												</span>
											</div>
										</div>
									</div>
								</div>

								<div className={styles.aiHeaderActions}>
									<button
										type='button'
										className={`${styles.btnAiReanalyze} ${isAiAnalyzing ? styles.btnAiHeaderActionLoading : ""}`}
										onClick={() => handleRunAiAnalysis(aiAnalysisTab)}
										title='Re-run AI Multi-System Analysis'
									>
										<RefreshCw size={14} className={isAiAnalyzing ? styles.spinIcon : ""} />
										<span>{isAiAnalyzing ? "Analyzing Telemetry..." : "Re-Analyze"}</span>
									</button>

									<button
										type='button'
										className={`${styles.btnAiCopySoap} ${isCopiedSoap ? styles.btnAiCopySoapSuccess : ""}`}
										onClick={handleCopySoapNote}
										title='Copy full SOAP note to clipboard for EHR'
									>
										{isCopiedSoap ? (
											<>
												<CheckCheck size={14} />
												<span>Copied SOAP!</span>
											</>
										) : (
											<>
												<Copy size={14} />
												<span>Copy SOAP</span>
											</>
										)}
									</button>

									<button
										type='button'
										className={styles.aiModalCloseBtn}
										onClick={() => setIsAiReportModalOpen(false)}
										aria-label='Close AI Intelligence Modal'
										title='Close Analysis'
									>
										<X size={18} strokeWidth={2.2} />
									</button>
								</div>
							</div>

							{/* AI Navigation Tabs */}
							<div className={styles.aiTabBar}>
								<button
									type='button'
									className={`${styles.aiTab} ${aiAnalysisTab === "summary" ? styles.aiTabActive : ""}`}
									onClick={() => setAiAnalysisTab("summary")}
								>
									<Activity size={14} />
									<span>Executive &amp; Systems</span>
								</button>
								<button
									type='button'
									className={`${styles.aiTab} ${aiAnalysisTab === "biomarkers" ? styles.aiTabActive : ""}`}
									onClick={() => setAiAnalysisTab("biomarkers")}
								>
									<Heart size={14} />
									<span>Biomarker Insights</span>
								</button>
								<button
									type='button'
									className={`${styles.aiTab} ${aiAnalysisTab === "pharma" ? styles.aiTabActive : ""}`}
									onClick={() => setAiAnalysisTab("pharma")}
								>
									<Pill size={14} />
									<span>Pharmacology</span>
								</button>
								<button
									type='button'
									className={`${styles.aiTab} ${aiAnalysisTab === "protocol" ? styles.aiTabActive : ""}`}
									onClick={() => setAiAnalysisTab("protocol")}
								>
									<FileText size={14} />
									<span>Care Protocol</span>
								</button>
								<button
									type='button'
									className={`${styles.aiTab} ${aiAnalysisTab === "soap" ? styles.aiTabActive : ""}`}
									onClick={() => setAiAnalysisTab("soap")}
								>
									<CheckCircle2 size={14} />
									<span>EHR SOAP Note</span>
								</button>
								<button
									type='button'
									className={`${styles.aiTab} ${aiAnalysisTab === "chat" ? styles.aiTabActive : ""}`}
									onClick={() => setAiAnalysisTab("chat")}
								>
									<Bot size={14} />
									<span>AI Copilot Q&amp;A</span>
								</button>
							</div>

							{/* AI Body Content */}
							<div className={styles.aiModalBody}>
								{/* TAB 1: EXECUTIVE & SYSTEMS */}
								{aiAnalysisTab === "summary" && (
									<div className={styles.aiTabContentFade}>
										{/* Executive Diagnostic Box */}
										<div className={styles.aiExecutiveBox}>
											<div className={styles.aiExecutiveHeader}>
												<div className={styles.aiBadgeGlow}>
													<Zap size={14} /> Executive Diagnostic Synthesis
												</div>
												<span className={styles.aiTimestamp}>Live EHR Synchronized</span>
											</div>
											<p className={styles.aiExecutiveText}>{aiReport.executiveSummary}</p>
										</div>

										{/* Triage Risk Score Card */}
										<div className={styles.aiTriageBanner}>
											<div className={styles.aiTriageLeft}>
												<div
													className={styles.aiTriageScoreCircle}
													style={{ borderColor: aiReport.triageScore.color, color: aiReport.triageScore.color }}
												>
													<span className={styles.aiScoreVal}>{aiReport.triageScore.score}</span>
													<span className={styles.aiScoreDenom}>/100</span>
												</div>
												<div>
													<div className={styles.aiTriageLevelBadge} style={{ background: `${aiReport.triageScore.color}22`, color: aiReport.triageScore.color }}>
														{aiReport.triageScore.level}
													</div>
													<div className={styles.aiTriageLabel}>{aiReport.triageScore.label}</div>
												</div>
											</div>
											<button
												type='button'
												className={styles.btnAiDispatchFast}
												onClick={() => handlePopulateAdviceFromAi()}
											>
												<Send size={13} />
												<span>Dispatch Care Guidance</span>
											</button>
										</div>

										{/* Multi-System Stability Matrix */}
										<div className={styles.aiSectionTitle}>
											<span>Multi-System Physiological Stability Index</span>
										</div>

										<div className={styles.aiSystemsGrid}>
											{aiReport.systemScores.map((sys, idx) => (
												<div key={idx} className={styles.aiSystemCard}>
													<div className={styles.aiSystemHeader}>
														<span className={styles.aiSystemName}>{sys.name}</span>
														<span
															className={
																sys.status === "Optimal"
																	? styles.badgeOptimal
																	: sys.status === "Monitored"
																		? styles.badgeWarning
																		: styles.badgeUrgent
															}
														>
															{sys.status} ({sys.score}%)
														</span>
													</div>

													<div className={styles.aiProgressBarBg}>
														<div
															className={styles.aiProgressBarFill}
															style={{
																width: `${sys.score}%`,
																backgroundColor:
																	sys.status === "Optimal"
																		? "#10b981"
																		: sys.status === "Monitored"
																			? "#f59e0b"
																			: "#ef4444",
															}}
														/>
													</div>

													{sys.alert && (
														<div className={styles.aiSystemAlert}>
															<AlertTriangle size={12} />
															<span>{sys.alert}</span>
														</div>
													)}
												</div>
											))}
										</div>
									</div>
								)}

								{/* TAB 2: BIOMARKER CROSS-CORRELATIONS */}
								{aiAnalysisTab === "biomarkers" && (
									<div className={styles.aiTabContentFade}>
										<div className={styles.aiSectionTitle}>
											<span>Multi-Omics &amp; Biomarker Pathophysiology Correlations</span>
										</div>

										<div className={styles.aiCorrelationsList}>
											{aiReport.biomarkerCorrelations.map((c, idx) => (
												<div key={idx} className={styles.aiCorrelationCard}>
													<div className={styles.aiCorrelationHeader}>
														<div className={styles.aiCorrelationTitle}>
															<Sparkles size={14} style={{ color: "#00a896" }} />
															<span>{c.title}</span>
														</div>
														<span
															className={
																c.urgency === "high"
																	? styles.badgeUrgent
																	: c.urgency === "moderate"
																		? styles.badgeWarning
																		: styles.badgeOptimal
															}
														>
															{c.urgency === "high" ? "High Priority" : c.urgency === "moderate" ? "Moderate" : "Optimal"}
														</span>
													</div>

													<div className={styles.aiFindingBox}>
														<strong>Telemetry Finding:</strong> {c.finding}
													</div>

													<div className={styles.aiCorrelationExpl}>
														<strong>Pathophysiological Mechanism:</strong> {c.correlation}
													</div>
												</div>
											))}
										</div>

										{/* Active Lab Telemetry Snapshot Table */}
										<div className={styles.aiSectionTitle} style={{ marginTop: "16px" }}>
											<span>Current Lab Requisition Snapshot</span>
										</div>
										<div className={styles.aiBiomarkerTable}>
											{selectedPatient.labMarkers.map((m, idx) => (
												<div key={idx} className={styles.aiBiomarkerRow}>
													<div className={styles.aiBioNameCol}>
														<strong>{m.marker}</strong>
														<span>Ref: {m.refRange}</span>
													</div>
													<div className={styles.aiBioValCol}>
														<span className={styles.aiBioVal}>{m.value}</span>
														<span
															className={
																m.status === "elevated"
																	? styles.badgeUrgent
																	: m.status === "low"
																		? styles.badgeWarning
																		: styles.badgeOptimal
															}
														>
															{m.status === "elevated" ? "Elevated" : m.status === "low" ? "Low" : "Normal"}
														</span>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* TAB 3: PHARMACOLOGY & TITRATION */}
								{aiAnalysisTab === "pharma" && (
									<div className={styles.aiTabContentFade}>
										<div className={styles.aiSectionTitle}>
											<span>Pharmacodynamics, Adherence &amp; Titration Intelligence</span>
										</div>

										<div className={styles.aiPharmaGrid}>
											{aiReport.pharmacologyInsights.map((p, idx) => (
												<div key={idx} className={styles.aiPharmaCard}>
													<div className={styles.aiPharmaHeader}>
														<div>
															<div className={styles.aiDrugName}>
																<Pill size={15} style={{ color: "#0ea5e9" }} />
																<span>{p.drug}</span>
															</div>
															<span className={styles.aiDosageBadge}>{p.dosage}</span>
														</div>
														<div className={styles.aiAdherencePill}>
															<span>{p.adherence}% adherence</span>
														</div>
													</div>

													<div className={styles.aiPharmaRow}>
														<span className={styles.aiPharmaLabel}>Observed Telemetry Efficacy:</span>
														<span className={styles.aiPharmaVal}>{p.efficacy}</span>
													</div>

													<div className={styles.aiTitrationBox}>
														<div className={styles.aiTitrationHeader}>
															<Brain size={13} style={{ color: "#00a896" }} />
															<span>AI Titration Recommendation</span>
														</div>
														<p className={styles.aiTitrationText}>{p.recommendation}</p>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* TAB 4: CARE ACTION PROTOCOL */}
								{aiAnalysisTab === "protocol" && (
									<div className={styles.aiTabContentFade}>
										<div className={styles.aiSectionTitle}>
											<span>Recommended Clinical Care Protocol &amp; Actions</span>
										</div>

										<div className={styles.aiProtocolList}>
											{aiReport.protocolSteps.map((step) => (
												<div key={step.step} className={styles.aiProtocolItem}>
													<div className={styles.aiStepNumber}>{step.step}</div>
													<div className={styles.aiStepDetails}>
														<div className={styles.aiStepTitleRow}>
															<span className={styles.aiStepTitle}>{step.title}</span>
															<span
																className={
																	step.category === "Rx"
																		? styles.badgePharma
																		: step.category === "Diagnostics"
																			? styles.badgeDiagnostics
																			: styles.badgeCare
																}
															>
																{step.category}
															</span>
														</div>
														<p className={styles.aiStepAction}>{step.action}</p>
													</div>
												</div>
											))}
										</div>

										<div className={styles.aiProtocolTransferBanner}>
											<div>
												<strong>Apply to Patient Encounter</strong>
												<p>Instantly transfer these clinical steps to the patient dispatch composer.</p>
											</div>
											<button
												type='button'
												className={styles.btnActionPrimary}
												onClick={() => handlePopulateAdviceFromAi()}
											>
												<Send size={14} /> Dispatch Plan
											</button>
										</div>
									</div>
								)}

								{/* TAB 5: EHR SOAP NOTE */}
								{aiAnalysisTab === "soap" && (
									<div className={styles.aiTabContentFade}>
										<div className={styles.aiSoapBox}>
											<div className={styles.aiSoapHeader}>
												<div>
													<h3>Clinical SOAP Documentation</h3>
													<span>Ready for Epic / Cerner / AthenaHealth FHIR Export</span>
												</div>
												<button
													type='button'
													className={styles.btnCopySoapInline}
													onClick={handleCopySoapNote}
												>
													{isCopiedSoap ? <CheckCheck size={14} /> : <Copy size={14} />}
													<span>{isCopiedSoap ? "Copied to Clipboard" : "Copy Full Note"}</span>
												</button>
											</div>

											<div className={styles.soapSection}>
												<div className={styles.soapLabel}>[S] SUBJECTIVE</div>
												<div className={styles.soapText}>{aiReport.soapNote.subjective}</div>
											</div>

											<div className={styles.soapSection}>
												<div className={styles.soapLabel}>[O] OBJECTIVE</div>
												<div className={styles.soapText}>{aiReport.soapNote.objective}</div>
											</div>

											<div className={styles.soapSection}>
												<div className={styles.soapLabel}>[A] ASSESSMENT</div>
												<div className={styles.soapText}>{aiReport.soapNote.assessment}</div>
											</div>

											<div className={styles.soapSection}>
												<div className={styles.soapLabel}>[P] PLAN</div>
												<div className={styles.soapText}>{aiReport.soapNote.plan}</div>
											</div>
										</div>
									</div>
								)}

								{/* TAB 6: INTERACTIVE COPILOT CHAT */}
								{aiAnalysisTab === "chat" && (
									<div className={styles.aiTabContentFade}>
										<div className={styles.aiChatContainer}>
											{/* Suggested Prompts */}
											<div className={styles.aiSuggestedHeader}>
												<Sparkles size={13} style={{ color: "#00a896" }} />
												<span>Suggested Diagnostic Queries for {selectedPatient.name}:</span>
											</div>
											<div className={styles.aiPromptChips}>
												{aiReport.suggestedQuestions.map((q, idx) => (
													<button
														key={idx}
														type='button'
														className={styles.aiPromptChip}
														onClick={() => handleSendAiQuestion(q)}
													>
														{q}
													</button>
												))}
											</div>

											{/* Message Log */}
											<div className={styles.aiChatLogs}>
												<div className={styles.aiChatBubbleAssistant}>
													<div className={styles.aiChatAvatarBadge}>
														<Bot size={13} />
													</div>
													<div className={styles.aiChatBubbleText}>
														Hello {doctor.doctorName}. I have ingested {selectedPatient.name}&apos;s lab chemistry, real-time home symptoms, and pharmacy adherence logs. Ask me any clinical question or select a suggested query above.
													</div>
												</div>

												{aiChatMessages.map((msg, idx) => (
													<div
														key={idx}
														className={
															msg.sender === "doctor"
																? styles.aiChatBubbleUser
																: styles.aiChatBubbleAssistant
														}
													>
														{msg.sender === "ai" && (
															<div className={styles.aiChatAvatarBadge}>
																<Bot size={13} />
															</div>
														)}
														<div className={styles.aiChatBubbleText}>
															{msg.text}
															<span className={styles.aiChatTimestamp}>{msg.timestamp}</span>
														</div>
													</div>
												))}
											</div>

											{/* Input Form */}
											<form
												className={styles.aiChatInputForm}
												onSubmit={(e) => {
													e.preventDefault();
													handleSendAiQuestion();
												}}
											>
												<input
													type='text'
													placeholder='Ask about lab correlations, drug titration, ECG findings...'
													value={aiCustomQuestion}
													onChange={(e) => setAiCustomQuestion(e.target.value)}
													className={styles.aiChatInput}
												/>
												<button
													type='submit'
													className={styles.btnAiChatSend}
													disabled={!aiCustomQuestion.trim()}
												>
													<Send size={14} />
												</button>
											</form>
										</div>
									</div>
								)}
							</div>

							{/* AI Footer */}
							<div className={styles.aiModalFooter}>
								<div className={styles.aiTrustBadge}>
									<ShieldCheck size={16} style={{ color: "#10b981" }} />
									<span>Genetiq DeepBio-Intelligence Engine · HIPAA Compliant · Grounded in Live Telemetry</span>
								</div>
								<div style={{ display: "flex", gap: "10px" }}>
									<button
										type='button'
										className={styles.btnActionSecondary}
										onClick={() => setIsAiReportModalOpen(false)}
									>
										Close
									</button>
									<button
										type='button'
										className={styles.btnActionPrimary}
										onClick={() => handlePopulateAdviceFromAi()}
									>
										<Send size={14} /> Dispatch Plan
									</button>
								</div>
							</div>
						</div>
					</div>
				);
			})()}

			{/* 8. Clinical Lab Results Ingestion Hub Modal */}
			{isLabsHubModalOpen && (
				<div className={styles.modalOverlay} onClick={() => setIsLabsHubModalOpen(false)}>
					<div className={`${styles.modalContent} ${styles.labsHubModalContent}`} onClick={(e) => e.stopPropagation()}>
						{/* Modal Header */}
						<div className={styles.modalHeader}>
							<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
								<div className={styles.scheduleModalIconBadge}>
									<FlaskConical size={18} style={{ color: "#00a896" }} />
								</div>
								<div>
									<h2>Clinical Lab Results Ingestion Hub</h2>
									<p className={styles.labsHubSubtitle}>
										Real-Time HL7 FHIR Direct Telemetry · {readyLabResults.length} Ingested Diagnostic Panels
									</p>
								</div>
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
								<button
									type="button"
									className={styles.btnActionSecondary}
									style={{ fontSize: "0.72rem", padding: "6px 10px" }}
									onClick={() => {
										setIsLabsHubModalOpen(false);
										handleOpenOrderLabModal();
									}}
								>
									<Plus size={13} /> Order New Lab
								</button>
								<button
									type='button'
									className={styles.aiModalCloseBtn}
									onClick={() => setIsLabsHubModalOpen(false)}
									aria-label="Close Labs Hub Modal"
								>
									<X size={18} strokeWidth={2.2} />
								</button>
							</div>
						</div>

						{/* Filter Tabs */}
						<div className={styles.labsFilterTabs}>
							<button
								type="button"
								className={`${styles.labsFilterTab} ${labsFilter === "all" ? styles.labsFilterTabActive : ""}`}
								onClick={() => setLabsFilter("all")}
							>
								All Results ({readyLabResults.length})
							</button>
							<button
								type="button"
								className={`${styles.labsFilterTab} ${labsFilter === "unread" ? styles.labsFilterTabActive : ""}`}
								onClick={() => setLabsFilter("unread")}
							>
								Unreviewed Action Items ({readyLabResults.filter((l) => !l.isAcknowledged).length})
							</button>
							<button
								type="button"
								className={`${styles.labsFilterTab} ${labsFilter === "critical" ? styles.labsFilterTabActive : ""}`}
								onClick={() => setLabsFilter("critical")}
							>
								Elevated &amp; Low ({readyLabResults.filter((l) => l.urgency === "urgent" || l.markers.some((m) => m.status === "critical_high" || m.status === "elevated" || m.status === "low")).length})
							</button>
							<button
								type="button"
								className={`${styles.labsFilterTab} ${labsFilter === "acknowledged" ? styles.labsFilterTabActive : ""}`}
								onClick={() => setLabsFilter("acknowledged")}
							>
								Signed Off ({readyLabResults.filter((l) => l.isAcknowledged).length})
							</button>
						</div>

						{/* Results List */}
						<div className={styles.labsResultsList}>
							{(() => {
								const displayLabs = readyLabResults.filter((l) => {
									if (labsFilter === "unread") return !l.isAcknowledged;
									if (labsFilter === "critical") return l.urgency === "urgent" || l.markers.some((m) => m.status === "critical_high" || m.status === "elevated" || m.status === "low");
									if (labsFilter === "acknowledged") return l.isAcknowledged;
									return true;
								});

								if (displayLabs.length === 0) {
									return (
										<div className={styles.labsEmptyState}>
											<FlaskConical size={32} style={{ marginBottom: "10px", opacity: 0.5 }} />
											<p>No lab results match the selected filter.</p>
										</div>
									);
								}

								return displayLabs.map((lab) => (
									<div
										key={lab.id}
										className={`${styles.labResultCard} ${!lab.isAcknowledged ? styles.labResultCardUnread : ""}`}
									>
										<div className={styles.labResultCardHeader}>
											<div className={styles.labResultHeaderLeft}>
												<div className={styles.labResultIconBadge}>
													<Microscope size={20} />
												</div>
												<div>
													<h3 className={styles.labResultPanelName}>{lab.panelName}</h3>
													<div className={styles.labResultMetaLine}>
														<strong>{lab.patientName}</strong> ({lab.mrn})
														<span>•</span>
														<span>Completed: {lab.completedAt}</span>
														<span>•</span>
														<span>Provider: {lab.labProvider}</span>
													</div>
												</div>
											</div>
											<div className={styles.labResultHeaderRight}>
												{lab.isAcknowledged ? (
													<span className={styles.badgeLabAcknowledged}>
														<Check size={11} /> Signed Off
													</span>
												) : lab.urgency === "urgent" ? (
													<span className={styles.badgeLabUrgencyUrgent}>
														<AlertTriangle size={11} /> Priority Review
													</span>
												) : (
													<span className={styles.badgeLabUrgencyRoutine}>
														New Ingestion
													</span>
												)}
											</div>
										</div>

										{/* Findings & Interpretation */}
										<div className={styles.labFindingsBox}>
											<span className={styles.labFindingsLabel}>
												<Info size={11} /> Automated Clinical Summary
											</span>
											<p>{lab.findingsSummary}</p>
										</div>

										{/* Biomarkers Delta Table */}
										<table className={styles.labMarkersTable}>
											<thead>
												<tr>
													<th>Biomarker</th>
													<th>Ingested Value</th>
													<th>Reference Range</th>
													<th>Prior Baseline</th>
													<th>Delta %</th>
													<th>Status</th>
												</tr>
											</thead>
											<tbody>
												{lab.markers.map((m, mIdx) => (
													<tr key={mIdx}>
														<td style={{ fontWeight: 600 }}>{m.name}</td>
														<td className={styles.labMarkerValueCell}>
															{m.value} {m.unit}
														</td>
														<td className={styles.labMarkerMutedCell}>{m.refRange}</td>
														<td className={styles.labMarkerMutedCell}>{m.priorValue || "—"}</td>
														<td>
															{m.deltaPct ? (
																<span
																	className={
																		m.status === "optimal"
																			? styles.labDeltaBadgeGood
																			: m.status === "elevated" || m.status === "low"
																				? styles.labDeltaBadgeWarn
																				: styles.labDeltaBadgeNeutral
																	}
																>
																	{m.deltaPct.startsWith("-") ? (
																		<ArrowDownRight size={11} />
																	) : (
																		<ArrowUpRight size={11} />
																	)}
																	{m.deltaPct}
																</span>
															) : (
																"—"
															)}
														</td>
														<td>
															<span
																className={
																	m.status === "optimal"
																		? styles.badgeOptimal
																		: m.status === "elevated" || m.status === "critical_high"
																			? styles.badgeUrgent
																			: styles.badgeWarning
																}
															>
																{m.status === "optimal"
																	? "Optimal"
																	: m.status === "elevated"
																		? "Elevated"
																		: m.status === "low"
																			? "Low"
																			: "Critical"}
															</span>
														</td>
													</tr>
												))}
											</tbody>
										</table>

										{/* Action Bar */}
										<div className={styles.labResultActionsBar}>
											<button
												type="button"
												className={styles.btnLabActionSecondary}
												onClick={() => handleFocusPatientFromLab(lab.patientId, lab.targetOrgan)}
												title="Focus on this patient's 3D twin and chart"
											>
												<UserCheck size={13} /> Focus 3D Twin
											</button>
											<button
												type="button"
												className={styles.btnLabActionSecondary}
												onClick={() => handleLaunchAiFromLab(lab)}
												title="Run AI Multi-System analysis on this lab"
											>
												<Brain size={13} /> AI Analysis
											</button>
											<button
												type="button"
												className={styles.btnLabActionSecondary}
												onClick={() => handleDispatchCarePlanFromLab(lab)}
												title="Dispatch patient care plan with these findings"
											>
												<Send size={13} /> Dispatch Plan
											</button>
											{!lab.isAcknowledged && (
												<button
													type="button"
													className={styles.btnLabActionPrimary}
													onClick={() => handleAcknowledgeLabResult(lab.id)}
												>
													<Check size={13} /> Sign Off Lab
												</button>
											)}
										</div>
									</div>
								));
							})()}
						</div>

						{/* Modal Footer */}
						<div className={styles.modalFooter} style={{ display: "flex", justifyContent: "space-between" }}>
							<div className={styles.labsHubFooterNote}>
								<ShieldCheck size={14} style={{ color: "#10b981" }} />
								<span>All lab telemetry encrypted in transit &amp; at rest via HIPAA AES-256</span>
							</div>
							<button
								type='button'
								className={styles.btnActionSecondary}
								onClick={() => setIsLabsHubModalOpen(false)}
							>
								Close Hub
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 9. Order Clinical Lab Biomarker Panel Modal */}
			{isOrderLabModalOpen && (
				<div className={styles.modalOverlay} onClick={() => setIsOrderLabModalOpen(false)}>
					<div className={`${styles.modalContent} ${styles.orderLabModalContent}`} onClick={(e) => e.stopPropagation()}>
						{/* Header */}
						<div className={styles.modalHeader}>
							<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
								<div className={styles.scheduleModalIconBadge}>
									<RefreshCw size={18} style={{ color: "#00a896" }} />
								</div>
								<div>
									<h2>Order Clinical Lab Biomarker Panel</h2>
									<p style={{ margin: 0, fontSize: "0.74rem", color: "rgba(255,255,255,0.5)" }}>
										Electronic Lab Requisition via Quest / Labcorp Direct HL7 Connector
									</p>
								</div>
							</div>
							<button
								type='button'
								className={styles.aiModalCloseBtn}
								onClick={() => setIsOrderLabModalOpen(false)}
							>
								<X size={18} strokeWidth={2.2} />
							</button>
						</div>

						<form onSubmit={(e) => handleDispatchLabOrder(e, false)}>
							<div className={styles.orderLabBody}>
								{/* Patient Selector */}
								<div className={styles.formGroup}>
									<label>Patient Target</label>
									<select
										className={styles.formSelect}
										value={orderLabPatientId}
										onChange={(e) => setOrderLabPatientId(e.target.value)}
									>
										{patients.map((p) => (
											<option key={p.id} value={p.id}>
												{p.name} ({p.mrn}) · {p.primaryDiagnosis}
											</option>
										))}
									</select>
								</div>

								{/* Preset Panels Grid */}
								<div className={styles.formGroup}>
									<label>Select Diagnostic Panel</label>
									<div className={styles.presetPanelsGrid}>
										{LAB_PANEL_PRESETS.map((panel) => (
											<div
												key={panel.id}
												className={`${styles.presetPanelCard} ${orderLabPanelId === panel.id ? styles.presetPanelCardActive : ""
													}`}
												onClick={() => setOrderLabPanelId(panel.id)}
											>
												<FlaskConical size={16} className={styles.presetPanelIcon} />
												<div>
													<h4 className={styles.presetPanelTitle}>{panel.name}</h4>
													<p className={styles.presetPanelSub}>{panel.description}</p>
													<span style={{ display: "inline-block", marginTop: "4px", fontSize: "0.65rem", color: "#00a896", fontWeight: 600 }}>
														Turnaround: {panel.typicalTurnaround}
													</span>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Order Priority */}
								<div className={styles.formGroup}>
									<label>Diagnostic Priority</label>
									<div className={styles.priorityButtonGroup}>
										<button
											type="button"
											className={`${styles.btnPriorityOption} ${orderLabPriority === "routine" ? styles.btnPriorityOptionActive : ""}`}
											onClick={() => setOrderLabPriority("routine")}
										>
											Routine (60-90 Days)
										</button>
										<button
											type="button"
											className={`${styles.btnPriorityOption} ${orderLabPriority === "priority" ? styles.btnPriorityOptionActive : ""}`}
											onClick={() => setOrderLabPriority("priority")}
										>
											Priority (24-48 Hours)
										</button>
										<button
											type="button"
											className={`${styles.btnPriorityOption} ${orderLabPriority === "stat" ? styles.btnPriorityOptionActiveUrgent : ""}`}
											onClick={() => setOrderLabPriority("stat")}
										>
											Stat Urgent (4 Hours)
										</button>
									</div>
								</div>

								{/* Lab Provider */}
								<div className={styles.formGroup}>
									<label>Diagnostic Network &amp; FHIR Ingestion Pipeline</label>
									<select
										className={styles.formSelect}
										value={orderLabProvider}
										onChange={(e) => setOrderLabProvider(e.target.value)}
									>
										<option value="Quest Diagnostics Direct · HL7 FHIR v4">Quest Diagnostics Direct (HL7 FHIR v4 Ingest)</option>
										<option value="Labcorp Biometrics FHIR Direct">Labcorp Biometrics (Direct EHR Ingest)</option>
										<option value="Genetiq Molecular Core Laboratory">Genetiq Molecular Core (Next-Gen Multi-Omics)</option>
										<option value="Hospital Inpatient Stat Laboratory">Hospital Inpatient Stat Laboratory</option>
									</select>
								</div>

								{/* Clinical Indications */}
								<div className={styles.formGroup}>
									<label>Clinical Indications / Requisition Notes</label>
									<textarea
										rows={3}
										className={styles.formTextarea}
										placeholder="e.g. Statin titration efficacy check; rule out secondary dyslipidemia or renal impairment."
										value={orderLabNotes}
										onChange={(e) => setOrderLabNotes(e.target.value)}
									/>
								</div>
							</div>

							<div className={styles.modalFooter} style={{ display: "flex", justifyContent: "space-between" }}>
								<button
									type="button"
									className={styles.btnActionSecondary}
									onClick={(e) => handleDispatchLabOrder(e, true)}
									disabled={isDispatchingLab}
									title="Dispatches and immediately generates incoming lab results for testing"
								>
									<Sparkles size={13} style={{ color: "#00a896" }} /> Simulate Live Ingestion
								</button>

								<div style={{ display: "flex", gap: "8px" }}>
									<button
										type="button"
										className={styles.btnActionSecondary}
										onClick={() => setIsOrderLabModalOpen(false)}
									>
										Cancel
									</button>
									<button
										type="submit"
										className={styles.btnActionPrimary}
										disabled={isDispatchingLab}
									>
										<Send size={13} /> {isDispatchingLab ? "Dispatching..." : "Dispatch Lab Order"}
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* 10. Bottom Floating Organ System Bar */}
			<div className={styles.bottomOrganBar}>
				<button
					type='button'
					className={`${styles.organPill} ${selectedOrganSystem === "cardiovascular" || selectedOrganSystem === "CardioLoad" ? styles.organPillActive : ""}`}
					onClick={() => setSelectedOrganSystem("cardiovascular")}
				>
					<Heart size={14} /> Cardiovascular (Heart)
				</button>
				<button
					type='button'
					className={`${styles.organPill} ${selectedOrganSystem === "total" ? styles.organPillActive : ""}`}
					onClick={() => setSelectedOrganSystem("total")}
				>
					<User size={14} /> Full Body (Overview)
				</button>
				<button
					type='button'
					className={`${styles.organPill} ${selectedOrganSystem === "Pulmonology" ? styles.organPillActive : ""}`}
					onClick={() => setSelectedOrganSystem("Pulmonology")}
				>
					<Wind size={14} /> Respiratory (Lungs)
				</button>
				<button
					type='button'
					className={`${styles.organPill} ${selectedOrganSystem === "StressManagement" ? styles.organPillActive : ""}`}
					onClick={() => setSelectedOrganSystem("StressManagement")}
				>
					<Brain size={14} /> Neurological (Brain)
				</button>
				<button
					type='button'
					className={`${styles.organPill} ${selectedOrganSystem === "Pulmonology1" ? styles.organPillActive : ""}`}
					onClick={() => setSelectedOrganSystem("Pulmonology1")}
				>
					<Droplet size={14} /> Renal (Kidneys)
				</button>
			</div>
		</div>
	);
};

export default DoctorPortal;
