import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { paths } from "@/App/Routes/Paths";
import { toast } from "react-toastify";
import ThemeSwitcher from "@/Features/Structural/ThemeSwitcher/ThemeSwitcher";
import {
	Activity,
	AlertTriangle,
	ArrowDownRight,
	ArrowUpRight,
	Brain,
	Calendar,
	CalendarPlus,
	Check,
	CheckCircle2,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Clock,
	Database,
	Droplet,
	ExternalLink,
	Heart,
	Mic,
	MicOff,
	Pill,
	Plus,
	RefreshCw,
	Search,
	Send,
	Settings,
	ShieldAlert,
	ShieldCheck,
	Sparkles,
	Stethoscope,
	Target,
	User,
	Wind,
	X,
} from "lucide-react";
import { CameraProvider } from "@/Features/DigitalTwin/Context/CameraContext";
import MainScene from "@/Features/DigitalTwin/Components/Three/Scene/MainScene";
import styles from "./DoctorPortal.module.scss";

// ─── System Mock Lab Biomarkers for Interactive Organ Controls ───────────────

const SYSTEM_MOCK_LABS: Record<string, { marker: string; value: string; refRange: string; status: "elevated" | "optimal" | "low"; system: string }[]> = {
	total: [
		{ marker: "Apolipoprotein B (ApoB)", value: "94 mg/dL", refRange: "< 90 mg/dL", status: "elevated", system: "Heart" },
		{ marker: "SpO2 (Blood Oxygen)", value: "98 %", refRange: "95 - 100 %", status: "optimal", system: "Lungs" },
		{ marker: "Fasting Blood Glucose", value: "92 mg/dL", refRange: "70 - 99 mg/dL", status: "optimal", system: "Metabolic" },
		{ marker: "eGFR (Kidney Filtration)", value: "88 mL/min", refRange: "> 90 mL/min", status: "low", system: "Renal" },
	],
	cardiovascular: [
		{ marker: "Apolipoprotein B (ApoB)", value: "128 mg/dL", refRange: "< 90 mg/dL", status: "elevated", system: "Heart" },
		{ marker: "LDL Cholesterol", value: "142 mg/dL", refRange: "< 100 mg/dL", status: "elevated", system: "Heart" },
		{ marker: "hs-CRP (Inflammation)", value: "3.4 mg/L", refRange: "< 1.0 mg/L", status: "elevated", system: "Heart" },
		{ marker: "Troponin I", value: "0.02 ng/mL", refRange: "< 0.04 ng/mL", status: "optimal", system: "Heart" },
	],
	respiratory: [
		{ marker: "SpO2 (Blood Oxygen)", value: "96 %", refRange: "95 - 100 %", status: "optimal", system: "Lungs" },
		{ marker: "FEV1 / FVC Ratio", value: "81 %", refRange: "> 75 %", status: "optimal", system: "Lungs" },
		{ marker: "Arterial pO2", value: "92 mmHg", refRange: "80 - 100 mmHg", status: "optimal", system: "Lungs" },
		{ marker: "Respiratory Rate", value: "18 bpm", refRange: "12 - 20 bpm", status: "optimal", system: "Lungs" },
	],
	neurological: [
		{ marker: "Serum S100B Protein", value: "0.08 ug/L", refRange: "< 0.10 ug/L", status: "optimal", system: "Brain" },
		{ marker: "Morning Cortisol", value: "18.4 ug/dL", refRange: "6.0 - 19.4 ug/dL", status: "optimal", system: "Brain" },
		{ marker: "Sleep Architecture Index", value: "78 / 100", refRange: "> 80 / 100", status: "low", system: "Brain" },
		{ marker: "Cognitive Stress Score", value: "6.2 / 10", refRange: "< 5.0 / 10", status: "elevated", system: "Brain" },
	],
	renal: [
		{ marker: "eGFR (Kidney Filtration)", value: "58 mL/min", refRange: "> 90 mL/min", status: "low", system: "Renal" },
		{ marker: "Serum Creatinine", value: "1.4 mg/dL", refRange: "0.7 - 1.3 mg/dL", status: "elevated", system: "Renal" },
		{ marker: "Blood Urea Nitrogen (BUN)", value: "26 mg/dL", refRange: "7 - 20 mg/dL", status: "elevated", system: "Renal" },
		{ marker: "Urine Protein/Creatinine", value: "0.18 mg/mg", refRange: "< 0.20 mg/mg", status: "optimal", system: "Renal" },
	],
};

// ─── Patient Database (Ghanaian Patient Cohort) ───────────────────────────────

interface PatientProblemHistory {
	date: string;
	title: string;
	severity: number;
	status: "Resolved" | "Active" | "Monitored";
	resolutionNote?: string;
}

interface DiagnosticSpot {
	organSystem: string;
	primaryIssue: string;
	labBiomarkerSpot: string;
	admissionNotes: string;
	urgencyColor: "Red" | "Yellow" | "Green";
}

interface ChatMessage {
	id: string;
	sender: "doctor" | "patient";
	text: string;
	timestamp: string;
	isVoice?: boolean;
}

interface ClinicalPatient {
	id: string;
	mrn: string;
	name: string;
	age: number;
	gender: "Male" | "Female";
	avatarUrl?: string;
	bloodType: string;
	bmi: number;
	status: "urgent" | "monitoring" | "stable";
	primaryDiagnosis: string;
	lastSync: string;
	defaultOrgan: string;
	initialSpot: DiagnosticSpot;
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
		name: "Kofi Mensah",
		age: 52,
		gender: "Male",
		avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
		bloodType: "A+",
		bmi: 27.4,
		status: "urgent",
		primaryDiagnosis: "Atrial Fibrillation & Elevated ApoB",
		lastSync: "14 mins ago",
		defaultOrgan: "cardiovascular",
		initialSpot: {
			organSystem: "Cardiovascular (Heart)",
			primaryIssue: "Atrial Fibrillation & Cardiac Lipid Particle Strain",
			labBiomarkerSpot: "Apolipoprotein B (ApoB): 128 mg/dL (High) & hs-CRP: 3.4 mg/L",
			admissionNotes: "First arrived at Accra Clinic with acute chest palpitations & elevated lipid particle strain following stair exertion.",
			urgencyColor: "Red",
		},
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
		],
		labMarkers: [
			{ marker: "Apolipoprotein B (ApoB)", value: "128 mg/dL", refRange: "< 90 mg/dL", status: "elevated", system: "Heart" },
			{ marker: "LDL Cholesterol", value: "142 mg/dL", refRange: "< 100 mg/dL", status: "elevated", system: "Heart" },
			{ marker: "hs-CRP (Inflammation)", value: "3.4 mg/L", refRange: "< 1.0 mg/L", status: "elevated", system: "Heart" },
			{ marker: "eGFR (Kidney)", value: "78 mL/min", refRange: "> 90 mL/min", status: "low", system: "Renal" },
		],
		medications: [
			{ name: "Atorvastatin", dosage: "20 mg", frequency: "Daily (Night)", adherence: 94 },
			{ name: "Metoprolol", dosage: "25 mg", frequency: "Daily (Morning)", adherence: 90 },
		],
	},
	{
		id: "pt-102",
		mrn: "MRN-67219",
		name: "Ama Serwaa",
		age: 44,
		gender: "Female",
		avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
		bloodType: "O-",
		bmi: 24.1,
		status: "monitoring",
		primaryDiagnosis: "Pre-Diabetes & Thyroid Fatigue",
		lastSync: "2 hours ago",
		defaultOrgan: "total",
		initialSpot: {
			organSystem: "Endocrine & Metabolic System",
			primaryIssue: "Postprandial Glycemic Spikes & Thyroid Function Strain",
			labBiomarkerSpot: "Fasting Glucose: 112 mg/dL & HbA1c: 5.9% (Elevated)",
			admissionNotes: "First arrived with morning exhaustion, cold sensitivity, and elevated post-meal sugar readings.",
			urgencyColor: "Yellow",
		},
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
			{ marker: "Fasting Glucose", value: "112 mg/dL", refRange: "70 - 99 mg/dL", status: "elevated", system: "Metabolic" },
			{ marker: "HbA1c", value: "5.9 %", refRange: "< 5.7 %", status: "elevated", system: "Metabolic" },
			{ marker: "TSH (Thyroid)", value: "4.2 uIU/mL", refRange: "0.4 - 4.0 uIU/mL", status: "elevated", system: "Endocrine" },
		],
		medications: [
			{ name: "Metformin XR", dosage: "500 mg", frequency: "Daily with dinner", adherence: 98 },
		],
	},
	{
		id: "pt-103",
		mrn: "MRN-91044",
		name: "Kwame Addo",
		age: 61,
		gender: "Male",
		avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
		bloodType: "B+",
		bmi: 28.9,
		status: "urgent",
		primaryDiagnosis: "Stage 2 Hypertension & Renal Strain",
		lastSync: "35 mins ago",
		defaultOrgan: "cardiovascular",
		initialSpot: {
			organSystem: "Renal (Kidneys) & Vascular System",
			primaryIssue: "Stage 2 Hypertension & Glomerular Filtration Decline",
			labBiomarkerSpot: "eGFR: 58 mL/min (Low) & Serum Creatinine: 1.4 mg/dL",
			admissionNotes: "First arrived with occipital morning headaches and home blood pressure logged at 162/98 mmHg.",
			urgencyColor: "Red",
		},
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
			{ marker: "Serum Creatinine", value: "1.4 mg/dL", refRange: "0.7 - 1.3 mg/dL", status: "elevated", system: "Renal" },
			{ marker: "eGFR", value: "58 mL/min", refRange: "> 90 mL/min", status: "low", system: "Renal" },
		],
		medications: [
			{ name: "Lisinopril", dosage: "20 mg", frequency: "Daily (Morning)", adherence: 82 },
		],
	},
	{
		id: "pt-104",
		mrn: "MRN-33012",
		name: "Abena Osei",
		age: 36,
		gender: "Female",
		avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
		bloodType: "A-",
		bmi: 21.8,
		status: "stable",
		primaryDiagnosis: "Optimal Longevity Baseline",
		lastSync: "1 hour ago",
		defaultOrgan: "total",
		initialSpot: {
			organSystem: "Full Body (Baseline)",
			primaryIssue: "Optimal Health & Preventative Screening",
			labBiomarkerSpot: "ApoB: 72 mg/dL (Optimal) & eGFR: 108 mL/min",
			admissionNotes: "Preventative screening visit, zero acute anatomical or biomarker strain.",
			urgencyColor: "Green",
		},
		symptoms: [],
		problemHistory: [],
		labMarkers: [
			{ marker: "ApoB", value: "72 mg/dL", refRange: "< 90 mg/dL", status: "optimal", system: "Heart" },
			{ marker: "eGFR", value: "108 mL/min", refRange: "> 90 mL/min", status: "optimal", system: "Renal" },
		],
		medications: [],
	},
];

// Initial Chat History per patient
const initialPatientChats: Record<string, ChatMessage[]> = {
	"pt-101": [
		{ id: "m1", sender: "patient", text: "Doctor, I experienced rapid heart beating after walking up stairs yesterday.", timestamp: "14 mins ago" },
		{ id: "m2", sender: "patient", text: "I felt shortness of breath for about 10 minutes.", timestamp: "12 mins ago" },
	],
	"pt-102": [
		{ id: "m3", sender: "patient", text: "Doctor, my morning fasting glucose was 112 mg/dL and I felt very tired upon waking.", timestamp: "2 hours ago" },
	],
	"pt-103": [
		{ id: "m4", sender: "patient", text: "Doctor, I logged my morning blood pressure of 158/96 mmHg with an occipital headache.", timestamp: "35 mins ago" },
	],
	"pt-104": [
		{ id: "m5", sender: "patient", text: "Hello Doctor, routine wellness logs updated. Zero symptoms today!", timestamp: "1 hour ago" },
	],
};

export interface ClinicalSpecialist {
	id: string;
	name: string;
	role: string;
	initials: string;
}

export const CLINICAL_SPECIALISTS: ClinicalSpecialist[] = [
	{ id: "km", name: "Dr. Kwame Mensah", role: "General Physician & Telehealth", initials: "KM" },
	{ id: "ao", name: "Dr. Abena Osei", role: "Clinical Hematologist", initials: "AO" },
	{ id: "ka", name: "Dr. Kofi Annan", role: "Geneticist & Bio-consultant", initials: "KA" },
	{ id: "aa", name: "Akosua Addo, MSc", role: "Clinical Dietitian & Nutritionist", initials: "AA" },
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
		patientName: "Kofi Mensah",
		patientMrn: "MRN-84920",
		patientAvatar: "KM",
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
		notes: "Experiencing rapid heartbeat and chest tightness after stair climb.",
		roomOrLink: "https://telehealth.genetiq.health/room/pt-101",
	},
	{
		id: "apt-2",
		patientId: "pt-102",
		patientName: "Ama Serwaa",
		patientMrn: "MRN-67219",
		patientAvatar: "AS",
		appointmentType: "Clinical Glycemic & Thyroid Telemetry Review",
		specialistName: "Dr. Abena Osei",
		specialistRole: "Clinical Hematologist",
		specialistInitials: "AO",
		department: "Clinical Hematology",
		date: "Today",
		time: "5:30 PM",
		durationMinutes: 45,
		mode: "in-person",
		status: "confirmed",
		notes: "Discussing postprandial sugar spikes, cold sensitivity, and thyroid panel balance.",
	},
];

export const DoctorPortal = () => {
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.user);
	const doctor = user.doctorProfile || {
		doctorName: "Dr. Sarah Jenkins, MD",
		hospitalName: "Metropolitan Medical Center",
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

	// Diagnostic Spotlight Close state
	const [isSpotlightClosed, setIsSpotlightClosed] = useState(false);

	// Patient Chat State
	const [patientChats, setPatientChats] = useState<Record<string, ChatMessage[]>>(initialPatientChats);

	// Appointments State
	const [appointments, setAppointments] = useState<DoctorAppointment[]>(initialAppointments);
	const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
	const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
	const [newApptPatientId, setNewApptPatientId] = useState("pt-101");
	const [newApptSlot, setNewApptSlot] = useState(CONSULTATION_TIME_SLOTS[0]);
	const [newApptNotes, setNewApptNotes] = useState("");

	// Advice / Messaging Modal State
	const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
	const [adviceText, setAdviceText] = useState("");
	const [isVoiceRecording, setIsVoiceRecording] = useState(false);
	const recognitionRef = useRef<any>(null);

	// Settings Modal State
	const [isDoctorMenuOpen, setIsDoctorMenuOpen] = useState(false);
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
	const [ehrSyncing, setEhrSyncing] = useState(false);

	const doctorMenuRef = useRef<HTMLDivElement>(null);
	const patientDropdownRef = useRef<HTMLDivElement>(null);

	// Panel Collapsible State
	const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(() =>
		typeof window !== "undefined" ? window.innerWidth <= 900 : false,
	);
	const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(() =>
		typeof window !== "undefined" ? window.innerWidth <= 1200 : false,
	);

	// Reset spotlight visibility when selected patient changes
	useEffect(() => {
		setIsSpotlightClosed(false);
	}, [selectedPatientId]);

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
			if (doctorMenuRef.current && !doctorMenuRef.current.contains(event.target as Node)) {
				setIsDoctorMenuOpen(false);
			}
			if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
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
			toast.success("EHR FHIR v4 synchronization completed. Patient records updated.");
		}, 1200);
	};

	const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
	const currentChatMessages = patientChats[selectedPatient.id] || [];

	// Displayed Lab Markers dynamically derived from active organ system pill or patient default
	const displayedLabMarkers =
		selectedOrganSystem && SYSTEM_MOCK_LABS[selectedOrganSystem]
			? SYSTEM_MOCK_LABS[selectedOrganSystem]
			: selectedPatient.labMarkers;

	// Organ System Selection Handler with toast feedback
	const handleSelectOrganSystem = (sysId: string, label: string) => {
		setSelectedOrganSystem(sysId);
		toast.info(`3D Twin & Telemetry focused on ${label}`);
	};

	// Filtered dropdown
	const filteredDropdownPatients = patients.filter((p) =>
		p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
		p.primaryDiagnosis.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleOpenAdviceModal = (symptomName?: string) => {
		if (symptomName?.includes("Palpitation") || selectedPatient.primaryDiagnosis.includes("Fibrillation")) {
			setAdviceText(
				`Hello ${selectedPatient.name}, I reviewed your report of ${symptomName || "palpitations"}. Please rest immediately, drink water, and ensure you take your morning Metoprolol 25mg.`,
			);
		} else if (selectedPatient.primaryDiagnosis.includes("Hypertension")) {
			setAdviceText(
				`Hello ${selectedPatient.name}, I noticed your blood pressure entry of 158/96 mmHg. Rest quietly for 10 minutes and retake it. Take your morning Lisinopril 20mg.`,
			);
		} else {
			setAdviceText(
				`Hello ${selectedPatient.name}, I reviewed your symptom log. Please rest adequately today and notify us if discomfort continues.`,
			);
		}
		setIsAdviceModalOpen(true);
	};

	const toggleVoiceInput = () => {
		if (isVoiceRecording) {
			if (recognitionRef.current) recognitionRef.current.stop();
			setIsVoiceRecording(false);
			toast.info("Voice dictation stopped.");
			return;
		}

		const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

		if (!SpeechRecognition) {
			toast.error("Speech Recognition is not supported on this browser.");
			return;
		}

		try {
			const recognition = new SpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = "en-US";
			recognition.onstart = () => {
				setIsVoiceRecording(true);
				toast.success("Listening... Dictate clinical note now.");
			};
			recognition.onresult = (event: any) => {
				let transcript = "";
				for (let i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) transcript += event.results[i][0].transcript + " ";
				}
				if (transcript) setAdviceText((prev) => `${prev.trim()} ${transcript.trim()}`);
			};
			recognition.onend = () => setIsVoiceRecording(false);
			recognitionRef.current = recognition;
			recognition.start();
		} catch (e) {
			console.error(e);
			setIsVoiceRecording(false);
		}
	};

	const handleDispatchAdvice = () => {
		if (!adviceText.trim()) {
			toast.error("Please type or dictate a message.");
			return;
		}

		const newMsg: ChatMessage = {
			id: `msg-${Date.now()}`,
			sender: "doctor",
			text: adviceText.trim(),
			timestamp: "Just now",
			isVoice: isVoiceRecording,
		};

		setPatientChats((prev) => ({
			...prev,
			[selectedPatient.id]: [...(prev[selectedPatient.id] || []), newMsg],
		}));

		setPatients((prev) =>
			prev.map((p) => (p.id === selectedPatient.id ? { ...p, status: "monitoring" as const } : p)),
		);

		setAdviceText("");
		setIsAdviceModalOpen(false);
		toast.success(`Message sent directly to ${selectedPatient.name}'s Genetiq app!`);
	};

	const handleAcknowledge = () => {
		setPatients((prev) =>
			prev.map((p) => (p.id === selectedPatient.id ? { ...p, status: "monitoring" as const } : p)),
		);
		toast.success(`Triage alert for ${selectedPatient.name} cleared.`);
	};

	const handleOrderRetest = () => {
		toast.success(`90-day lab re-test order dispatched for ${selectedPatient.name}.`);
	};

	const handleCreateNewAppointment = (e: React.FormEvent) => {
		e.preventDefault();
		const patientObj = patients.find((p) => p.id === newApptPatientId) || selectedPatient;
		const specObj = CLINICAL_SPECIALISTS[0];

		const newAppt: DoctorAppointment = {
			id: `apt-${Date.now()}`,
			patientId: patientObj.id,
			patientName: patientObj.name,
			patientMrn: patientObj.mrn,
			patientAvatar: patientObj.name.split(" ").map((n) => n[0]).join(""),
			appointmentType: `${specObj.role} Consultation`,
			specialistName: specObj.name,
			specialistRole: specObj.role,
			specialistInitials: specObj.initials,
			department: specObj.role,
			date: newApptSlot.split(",")[0]?.trim() || "Today",
			time: newApptSlot.split(",")[1]?.trim() || newApptSlot,
			durationMinutes: 30,
			mode: "telehealth",
			status: "confirmed",
			notes: newApptNotes.trim() || "Scheduled consultation via Doctor Portal.",
			roomOrLink: `https://telehealth.genetiq.health/room/${patientObj.id}`,
		};

		setAppointments((prev) => [newAppt, ...prev]);
		setIsBookingModalOpen(false);
		setNewApptNotes("");
		toast.success(`New consultation booked with ${specObj.name} for ${patientObj.name}!`);
	};

	return (
		<div className={`${styles.clinicalStage} ${isLeftPanelCollapsed ? styles.leftCollapsed : ""}`}>
			{/* 1. Full-Screen 3D Digital Twin Stage */}
			<div className={styles.canvasFullStage}>
				<CameraProvider>
					<MainScene selectedCategory={selectedOrganSystem} showSidebar={false} gender={selectedPatient.gender} />
				</CameraProvider>
			</div>

			{/* 1b. Glowing 3D Target Spot Marker on the Body (Pulsing Beacon) */}
			<div className={`${styles.bodySpotBeacon} ${styles[`beacon_${selectedOrganSystem || selectedPatient.defaultOrgan}`]}`}>
				<div className={styles.beaconRingPulse} />
				<div className={styles.beaconCoreDot} />
				<div className={styles.beaconSpotCard}>
					<Target size={13} style={{ color: selectedPatient.gender === "Female" ? "#d946ef" : "#00a896", flexShrink: 0 }} />
					<span>
						<strong>3D Twin ({selectedPatient.gender} Body Model):</strong>{" "}
						{selectedOrganSystem ? selectedOrganSystem.toUpperCase() : selectedPatient.initialSpot?.organSystem}
					</span>
				</div>
			</div>

			{/* 1c. 3D Twin Diagnostic Risk Spotlight Card (Closable) */}
			{selectedPatient.initialSpot && !isSpotlightClosed && (
				<div className={styles.diagnosticSpotlightBadge}>
					<div className={styles.spotlightHeader}>
						<div
							className={styles.spotlightPulseDot}
							style={{
								background:
									selectedPatient.initialSpot.urgencyColor === "Red"
										? "#ef4444"
										: selectedPatient.initialSpot.urgencyColor === "Yellow"
										? "#f59e0b"
										: "#10b981",
							}}
						/>
						<span className={styles.spotlightTag}>
							INITIAL ADMISSION SPOT & LAB SPOTLIGHT ({selectedPatient.name})
						</span>
						<span
							className={
								selectedPatient.initialSpot.urgencyColor === "Red"
									? styles.badgeUrgent
									: selectedPatient.initialSpot.urgencyColor === "Yellow"
									? styles.badgeWarning
									: styles.badgeOptimal
							}
						>
							{selectedPatient.initialSpot.organSystem}
						</span>
						<button
							type="button"
							className={styles.spotlightCloseBtn}
							onClick={() => setIsSpotlightClosed(true)}
							title="Close Diagnostic Spotlight"
						>
							<X size={14} />
						</button>
					</div>
					<div className={styles.spotlightTitle}>{selectedPatient.initialSpot.primaryIssue}</div>
					<div className={styles.spotlightBiomarker}>
						<Activity size={13} style={{ color: "#00a896", flexShrink: 0 }} />
						<span><strong>Lab Findings at Arrival:</strong> {selectedPatient.initialSpot.labBiomarkerSpot}</span>
					</div>
					<div className={styles.spotlightNotes}>{selectedPatient.initialSpot.admissionNotes}</div>
					<button
						type="button"
						className={styles.spotlightFocusBtn}
						onClick={() => handleSelectOrganSystem(selectedPatient.defaultOrgan, selectedPatient.initialSpot.organSystem)}
					>
						<Target size={13} /> Zoom 3D Twin to Affected Organ Spot
					</button>
				</div>
			)}

			{/* 2. Top Floating Header & Patient Selector */}
			<header className={styles.topHeader}>
				<div className={styles.brandArea}>
					<div className={styles.brandLogo}>
						<Stethoscope size={20} />
					</div>
					<div className={styles.hospitalMeta}>
						<h1 className={styles.hospitalTitle}>{doctor.hospitalName}</h1>
						<p className={styles.hospitalSubtitle}>Clinical Suite · {doctor.department}</p>
					</div>
				</div>

				{/* Center Patient Switcher Selector */}
				<div className={styles.patientSwitcherWrapper} ref={patientDropdownRef}>
					<button
						type='button'
						className={styles.patientSwitcherBtn}
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
					>
						<div className={styles.activePatientPill}>
							<User size={14} style={{ color: "#00a896", flexShrink: 0 }} />
							<span className={styles.patientNameFull}>{selectedPatient.name} ({selectedPatient.mrn})</span>
							<span className={styles.patientNameMobile}>{selectedPatient.name}</span>
							<span
								className={
									selectedPatient.status === "urgent"
										? styles.badgeUrgent
										: selectedPatient.status === "monitoring"
										? styles.badgeWarning
										: styles.badgeOptimal
								}
								style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}
							>
								{selectedPatient.status === "urgent" ? (
									<>
										<ShieldAlert size={11} /> <span className={styles.badgeText}>Urgent</span>
									</>
								) : selectedPatient.status === "monitoring" ? (
									<>
										<AlertTriangle size={11} /> <span className={styles.badgeText}>Monitored</span>
									</>
								) : (
									<>
										<CheckCircle2 size={11} /> <span className={styles.badgeText}>Stable</span>
									</>
								)}
							</span>
						</div>
						<ChevronDown size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
					</button>

					{/* Dropdown Menu */}
					{isDropdownOpen && (
						<div className={styles.patientDropdownMenu}>
							<div className={styles.dropdownSearch}>
								<Search size={14} className={styles.searchIcon} />
								<input
									type='text'
									placeholder='Search assigned patients...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									autoFocus
								/>
							</div>

							<div className={styles.dropdownList}>
								{filteredDropdownPatients.map((p) => (
									<div
										key={p.id}
										className={`${styles.dropdownItem} ${p.id === selectedPatient.id ? styles.dropdownItemActive : ""}`}
										onClick={() => {
											setSelectedPatientId(p.id);
											setSelectedOrganSystem(p.defaultOrgan);
											setIsDropdownOpen(false);
										}}
									>
										<div className={`${styles.dropdownAvatar} ${p.gender === "Female" ? styles.patientAvatarFemale : ""}`}>
											{p.avatarUrl ? (
												<img src={p.avatarUrl} alt={p.name} className={styles.patientAvatarImg} />
											) : (
												p.name.split(" ").map((n) => n[0]).join("")
											)}
										</div>
										<div style={{ flex: 1, minWidth: 0 }}>
											<div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{p.name}</div>
											<div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
												{p.age}y · {p.gender} · {p.primaryDiagnosis}
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
											{p.status === "urgent" ? "Urgent" : p.status === "monitoring" ? "Monitoring" : "Stable"}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Header Right Controls */}
				<div className={styles.headerControls}>
					<div className={styles.kpiPills}>
						<div className={styles.kpiPill}>
							<ShieldAlert size={13} style={{ color: "#ef4444" }} />
							<span>2 Urgent</span>
						</div>
						<div className={styles.kpiPill}>
							<AlertTriangle size={13} style={{ color: "#f59e0b" }} />
							<span>6 Reports</span>
						</div>
					</div>

					<button
						type='button'
						className={styles.scheduleHeaderBtn}
						onClick={() => setIsScheduleModalOpen(true)}
						title='View Booked Patient Appointments & Schedules'
					>
						<Calendar size={14} style={{ color: "#ffffff" }} />
						<span className={styles.scheduleBtnText}>Appointments</span>
						<span className={styles.scheduleCountBadge}>
							{appointments.filter((a) => a.status === "waiting" || a.date.includes("Today")).length} Today
						</span>
					</button>

					<ThemeSwitcher />

					{/* Doctor Profile Menu */}
					<div className={styles.doctorMenuWrapper} ref={doctorMenuRef}>
						<button
							type='button'
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
								</div>

								<div className={styles.menuDivider} />

								<div className={styles.doctorMenuItems}>
									<button
										type='button'
										className={styles.doctorMenuItem}
										onClick={() => {
											setIsScheduleModalOpen(true);
											setIsDoctorMenuOpen(false);
										}}
									>
										<div className={styles.menuItemIcon} style={{ background: "rgba(0, 168, 150, 0.15)", color: "#00a896" }}>
											<Calendar size={15} />
										</div>
										<div className={styles.menuItemText}>
											<span className={styles.menuItemTitle}>Patient Appointments & Schedule</span>
											<span className={styles.menuItemSub}>{appointments.length} booked consultations</span>
										</div>
									</button>

									<button
										type='button'
										className={styles.doctorMenuItem}
										onClick={() => {
											setIsSettingsModalOpen(true);
											setIsDoctorMenuOpen(false);
										}}
									>
										<div className={styles.menuItemIcon} style={{ background: "rgba(0, 168, 150, 0.15)", color: "#00a896" }}>
											<Database size={15} />
										</div>
										<div className={styles.menuItemText}>
											<span className={styles.menuItemTitle}>EHR & FHIR Sync</span>
											<span className={styles.menuItemSub}>Epic / Cerner live sync status</span>
										</div>
									</button>
								</div>

								<div className={styles.menuDivider} />

								<div className={styles.doctorMenuFooter}>
									<button
										type='button'
										className={styles.patientModeItem}
										onClick={() => {
											setIsDoctorMenuOpen(false);
											navigate(paths.dashboard.root);
										}}
									>
										<User size={14} />
										<span>Switch to Patient Mode</span>
										<ExternalLink size={12} style={{ marginLeft: "auto", opacity: 0.7 }} />
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
						if (window.innerWidth <= 768) setIsRightPanelCollapsed(true);
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
						if (window.innerWidth <= 768) setIsLeftPanelCollapsed(true);
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
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
							<span style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#00a896" }}>
								Assigned Patient
							</span>
							<button
								type='button'
								className={styles.panelCollapseBtn}
								onClick={() => setIsLeftPanelCollapsed(true)}
								title='Collapse Patient Panel'
							>
								<ChevronLeft size={16} />
							</button>
						</div>

						<div className={styles.patientHeroBlock}>
							<div className={`${styles.patientAvatarHero} ${selectedPatient.gender === "Female" ? styles.patientAvatarFemale : ""}`}>
								{selectedPatient.avatarUrl ? (
									<img src={selectedPatient.avatarUrl} alt={selectedPatient.name} className={styles.patientAvatarImg} />
								) : (
									selectedPatient.name.split(" ").map((n) => n[0]).join("")
								)}
							</div>
							<div className={styles.patientInfo}>
								<div className={styles.patientName}>{selectedPatient.name}</div>
								<div className={styles.patientMetaText}>{selectedPatient.primaryDiagnosis}</div>
							</div>
						</div>

						<div className={styles.patientBiometricsGrid}>
							<div className={styles.biometricItem}>
								<span className={styles.bioLabel}>Age / Sex</span>
								<span className={styles.bioValue}>{selectedPatient.age} ({selectedPatient.gender[0]})</span>
							</div>
							<div className={styles.biometricItem}>
								<span className={styles.bioLabel}>Blood</span>
								<span className={styles.bioValue}>{selectedPatient.bloodType}</span>
							</div>
							<div className={styles.biometricItem}>
								<span className={styles.bioLabel}>BMI</span>
								<span className={styles.bioValue}>{selectedPatient.bmi}</span>
							</div>
						</div>
					</div>

					{/* Live Home-Logged Symptoms Card */}
					<div className={styles.glassCard}>
						<div className={styles.cardHeader}>
							<h3>
								<AlertTriangle size={16} style={{ color: "#f59e0b" }} />
								Home Symptoms (Real-Time)
							</h3>
							<span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
								<Clock size={11} /> {selectedPatient.lastSync}
							</span>
						</div>

						{selectedPatient.symptoms.length === 0 ? (
							<div style={{ textAlign: "center", padding: "20px 0", color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>
								<CheckCircle2 size={24} style={{ color: "#10b981", margin: "0 auto 6px auto", display: "block" }} />
								No active distress symptoms logged.
							</div>
						) : (
							selectedPatient.symptoms.map((s) => (
								<div key={s.id} className={styles.symptomCard}>
									<div className={styles.symptomTitleRow}>
										<span className={styles.symptomName}>{s.name}</span>
										<span className={s.urgency === "Red" ? styles.badgeUrgent : styles.badgeWarning}>
											Sev: {s.severity}/10
										</span>
									</div>
									<div className={styles.symptomNotes}>{s.notes}</div>
									<div className={styles.symptomFooter}>
										<span>{s.duration}</span>
										<span style={{ color: s.urgency === "Red" ? "#ef4444" : "#f59e0b", fontWeight: 700 }}>
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
									className={styles.btnActionPrimary}
									style={{ background: "#ef4444" }}
									onClick={handleAcknowledge}
								>
									<CheckCircle2 size={14} /> Clear Alert
								</button>
							)}
							<button
								type='button'
								className={styles.btnActionPrimary}
								onClick={() => handleOpenAdviceModal(selectedPatient.symptoms[0]?.name)}
							>
								<Send size={14} /> Text Patient / Advice
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
								Lab Biomarkers & Chemistry ({selectedOrganSystem ? selectedOrganSystem.toUpperCase() : "HEART"})
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

						{displayedLabMarkers.map((m, idx) => (
							<div key={idx} className={styles.markerRow}>
								<div>
									<div className={styles.markerName}>{m.marker}</div>
									<div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)" }}>
										Ref: {m.refRange}
									</div>
								</div>
								<div style={{ textAlign: "right" }}>
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
												High <ArrowUpRight size={12} strokeWidth={2.5} />
											</span>
										) : m.status === "low" ? (
											<span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
												Low <ArrowDownRight size={12} strokeWidth={2.5} />
											</span>
										) : (
											<span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
												Optimal <Check size={12} strokeWidth={2.5} />
											</span>
										)}
									</span>
								</div>
							</div>
						))}

						<div style={{ marginTop: "10px" }}>
							<button
								type='button'
								className={styles.btnActionSecondary}
								style={{ width: "100%" }}
								onClick={handleOrderRetest}
							>
								<Plus size={14} /> Order 90-Day Lab Re-Test
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
						</div>

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

			{/* 4. Doctor-Patient Chat & Voice Drawer / Modal */}
			{isAdviceModalOpen && (
				<div className={styles.modalOverlay} onClick={() => setIsAdviceModalOpen(false)}>
					<div className={`${styles.modalContent} ${styles.chatModalCard}`} onClick={(e) => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<h2>
								<Send size={18} style={{ color: "#00a896" }} />
								Direct Chat with {selectedPatient.name}
							</h2>
							<button
								type='button'
								className={styles.closeBtn}
								onClick={() => setIsAdviceModalOpen(false)}
							>
								<X size={18} />
							</button>
						</div>

						<div className={styles.modalBody}>
							<div className={styles.patientTargetBox}>
								<div className={`${styles.dropdownAvatar} ${selectedPatient.gender === "Female" ? styles.patientAvatarFemale : ""}`}>
									{selectedPatient.avatarUrl ? (
										<img src={selectedPatient.avatarUrl} alt={selectedPatient.name} className={styles.patientAvatarImg} />
									) : (
										selectedPatient.name.split(" ").map((n) => n[0]).join("")
									)}
								</div>
								<div style={{ flex: 1, minWidth: 0 }}>
									<div className={styles.targetName}>{selectedPatient.name} ({selectedPatient.mrn})</div>
									<div className={styles.targetDetails}>{selectedPatient.primaryDiagnosis} · Age {selectedPatient.age}</div>
								</div>
								<span className={styles.badgeOptimal}>Live Patient Chat Sync</span>
							</div>

							{/* Chat Messages Stream */}
							<div className={styles.chatMessageStream}>
								{currentChatMessages.map((msg) => (
									<div
										key={msg.id}
										className={`${styles.chatBubble} ${msg.sender === "doctor" ? styles.chatBubbleDoctor : styles.chatBubblePatient}`}
									>
										<div className={styles.chatBubbleHeader}>
											<span>{msg.sender === "doctor" ? doctor.doctorName : selectedPatient.name}</span>
											<span className={styles.chatBubbleTime}>{msg.timestamp}</span>
										</div>
										<div className={styles.chatBubbleText}>{msg.text}</div>
										{msg.isVoice && (
											<div className={styles.voiceBadgeTag}>
												<Mic size={10} /> Voice Note Dictated
											</div>
										)}
									</div>
								))}
							</div>

							{/* Input Box */}
							<div className={styles.adviceInputWrapper}>
								<label>
									<span>Text Message / Care Advice</span>
									<button
										type='button'
										className={`${styles.voiceBtn} ${isVoiceRecording ? styles.voiceBtnRecording : ""}`}
										onClick={toggleVoiceInput}
									>
										{isVoiceRecording ? <MicOff size={14} /> : <Mic size={14} />}
										{isVoiceRecording ? "Listening..." : "Voice Note Dictate"}
									</button>
								</label>

								<textarea
									className={styles.adviceTextarea}
									value={adviceText}
									onChange={(e) => setAdviceText(e.target.value)}
									placeholder={`Type a message to text ${selectedPatient.name} or use Voice Note...`}
								/>
							</div>
						</div>

						<div className={styles.modalFooter}>
							<button
								type='button'
								className={styles.btnActionSecondary}
								onClick={() => setIsAdviceModalOpen(false)}
							>
								Close Chat
							</button>

							<button
								type='button'
								className={styles.btnActionPrimary}
								onClick={handleDispatchAdvice}
							>
								<Sparkles size={14} /> Send Message to Patient App
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 5. Doctor Settings Modal */}
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
										{doctor.doctorName} · {doctor.hospitalName}
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
							<div className={styles.settingsSection}>
								<div className={styles.sectionHeader}>
									<div>
										<h3>EHR & Health System Interoperability</h3>
										<p>Real-time FHIR v4 bidirectional synchronization with hospital EHR networks.</p>
									</div>
									<button
										type='button'
										className={styles.syncNowBtn}
										onClick={handleTriggerEhrSync}
										disabled={ehrSyncing}
									>
										<RefreshCw size={14} className={ehrSyncing ? styles.spinning : ""} />
										<span>{ehrSyncing ? "Syncing..." : "Sync EHR Now"}</span>
									</button>
								</div>
							</div>
						</div>

						<div className={styles.modalFooter}>
							<button
								type='button'
								className={styles.btnActionPrimary}
								onClick={() => setIsSettingsModalOpen(false)}
							>
								<Check size={14} /> Save & Close Settings
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 6. Patient Appointments Modal */}
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
										{doctor.doctorName} ({appointments.length} Booked)
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

						<div className={styles.scheduleModalBody}>
							<div className={styles.appointmentsGridList}>
								{appointments.map((appt) => (
									<div key={appt.id} className={styles.apptCardItem}>
										<div className={styles.apptCardHeader}>
											<div>
												<div className={styles.apptPatientName}>{appt.patientName} ({appt.patientMrn})</div>
												<div className={styles.apptType}>{appt.appointmentType}</div>
											</div>
											<span className={appt.status === "waiting" ? styles.badgeUrgent : styles.badgeOptimal}>
												{appt.status.toUpperCase()}
											</span>
										</div>
										<div className={styles.apptMetaRow}>
											<span><Clock size={12} /> {appt.date}, {appt.time}</span>
											<span>Mode: {appt.mode}</span>
										</div>
										{appt.roomOrLink && (
											<div style={{ marginTop: "6px" }}>
												<a
													href={appt.roomOrLink}
													target="_blank"
													rel="noreferrer"
													style={{ color: "#00a896", fontSize: "0.76rem", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
												>
													<ExternalLink size={12} /> Launch Telehealth Session
												</a>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 7. New Booking Modal */}
			{isBookingModalOpen && (
				<div className={styles.modalOverlay} onClick={() => setIsBookingModalOpen(false)}>
					<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<h2>Schedule Consultation</h2>
							<button
								type='button'
								className={styles.closeBtn}
								onClick={() => setIsBookingModalOpen(false)}
							>
								<X size={18} />
							</button>
						</div>

						<form onSubmit={handleCreateNewAppointment}>
							<div className={styles.modalBody}>
								<div className={styles.inputGroup}>
									<label>Select Patient</label>
									<select
										className={styles.modalSelect}
										value={newApptPatientId}
										onChange={(e) => setNewApptPatientId(e.target.value)}
									>
										{patients.map((p) => (
											<option key={p.id} value={p.id}>
												{p.name} ({p.mrn})
											</option>
										))}
									</select>
								</div>

								<div className={styles.inputGroup}>
									<label>Time Slot</label>
									<select
										className={styles.modalSelect}
										value={newApptSlot}
										onChange={(e) => setNewApptSlot(e.target.value)}
									>
										{CONSULTATION_TIME_SLOTS.map((slot, idx) => (
											<option key={idx} value={slot}>
												{slot}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className={styles.modalFooter}>
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
						</form>
					</div>
				</div>
			)}

			{/* 8. Bottom Floating Organ System Bar */}
			<div className={styles.bottomOrganBar}>
				<button
					type='button'
					className={`${styles.organPill} ${selectedOrganSystem === "cardiovascular" ? styles.organPillActive : ""}`}
					onClick={() => handleSelectOrganSystem("cardiovascular", "Cardiovascular (Heart)")}
				>
					<Heart size={14} /> Cardiovascular (Heart)
				</button>
				<button
					type='button'
					className={`${styles.organPill} ${selectedOrganSystem === "total" ? styles.organPillActive : ""}`}
					onClick={() => handleSelectOrganSystem("total", "Full Body (Overview)")}
				>
					<User size={14} /> Full Body (Overview)
				</button>
				<button
					type='button'
					className={`${styles.organPill} ${selectedOrganSystem === "respiratory" || selectedOrganSystem === "Pulmonology" ? styles.organPillActive : ""}`}
					onClick={() => handleSelectOrganSystem("respiratory", "Respiratory (Lungs)")}
				>
					<Wind size={14} /> Respiratory (Lungs)
				</button>
				<button
					type='button'
					className={`${styles.organPill} ${selectedOrganSystem === "neurological" || selectedOrganSystem === "StressManagement" ? styles.organPillActive : ""}`}
					onClick={() => handleSelectOrganSystem("neurological", "Neurological (Brain)")}
				>
					<Brain size={14} /> Neurological (Brain)
				</button>
				<button
					type='button'
					className={`${styles.organPill} ${selectedOrganSystem === "renal" || selectedOrganSystem === "Pulmonology1" ? styles.organPillActive : ""}`}
					onClick={() => handleSelectOrganSystem("renal", "Renal (Kidneys)")}
				>
					<Droplet size={14} /> Renal (Kidneys)
				</button>
			</div>
		</div>
	);
};

export default DoctorPortal;
