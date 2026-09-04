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
	Bell,
	Brain,
	Calendar,
	CalendarPlus,
	Check,
	CheckCircle2,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	Clock,
	Database,
	Droplet,
	ExternalLink,
	FileText,
	Heart,
	History,
	MapPin,
	Mic,
	MicOff,
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
	Stethoscope,
	User,
	UserCheck,
	Video,
	Volume2,
	Wind,
	X,
} from "lucide-react";
import { CameraProvider } from "@/Features/DigitalTwin/Context/CameraContext";
import MainScene from "@/Features/DigitalTwin/Components/Three/Scene/MainScene";
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
			{ marker: "Apolipoprotein B (ApoB)", value: "128 mg/dL", refRange: "< 90 mg/dL", status: "elevated", system: "Heart" },
			{ marker: "LDL Cholesterol", value: "142 mg/dL", refRange: "< 100 mg/dL", status: "elevated", system: "Heart" },
			{ marker: "hs-CRP (Inflammation)", value: "3.4 mg/L", refRange: "< 1.0 mg/L", status: "elevated", system: "Heart" },
			{ marker: "eGFR (Kidney)", value: "78 mL/min", refRange: "> 90 mL/min", status: "low", system: "Renal" },
			{ marker: "Fasting Blood Glucose", value: "104 mg/dL", refRange: "70 - 99 mg/dL", status: "elevated", system: "Metabolic" },
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
			{ marker: "Fasting Glucose", value: "112 mg/dL", refRange: "70 - 99 mg/dL", status: "elevated", system: "Metabolic" },
			{ marker: "HbA1c", value: "5.9 %", refRange: "< 5.7 %", status: "elevated", system: "Metabolic" },
			{ marker: "TSH (Thyroid)", value: "4.2 uIU/mL", refRange: "0.4 - 4.0 uIU/mL", status: "elevated", system: "Endocrine" },
			{ marker: "Vitamin D", value: "24 ng/mL", refRange: "30 - 100 ng/mL", status: "low", system: "Endocrine" },
		],
		medications: [
			{ name: "Metformin XR", dosage: "500 mg", frequency: "Daily with dinner", adherence: 98 },
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
			{ marker: "Serum Creatinine", value: "1.4 mg/dL", refRange: "0.7 - 1.3 mg/dL", status: "elevated", system: "Renal" },
			{ marker: "eGFR", value: "58 mL/min", refRange: "> 90 mL/min", status: "low", system: "Renal" },
			{ marker: "Blood Urea Nitrogen", value: "26 mg/dL", refRange: "7 - 20 mg/dL", status: "elevated", system: "Renal" },
		],
		medications: [
			{ name: "Lisinopril", dosage: "20 mg", frequency: "Daily (Morning)", adherence: 82 },
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
			{ marker: "ApoB", value: "72 mg/dL", refRange: "< 90 mg/dL", status: "optimal", system: "Heart" },
			{ marker: "Fasting Glucose", value: "84 mg/dL", refRange: "70 - 99 mg/dL", status: "optimal", system: "Metabolic" },
			{ marker: "eGFR", value: "108 mL/min", refRange: "> 90 mL/min", status: "optimal", system: "Renal" },
		],
		medications: [],
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
	const [isVoiceRecording, setIsVoiceRecording] = useState(false);
	const [showProblemHistory, setShowProblemHistory] = useState(true);
	const recognitionRef = useRef<any>(null);

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

	// Voice recognition handler
	const toggleVoiceInput = () => {
		if (isVoiceRecording) {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
			setIsVoiceRecording(false);
			toast.info("Voice dictation stopped.");
			return;
		}

		const SpeechRecognition =
			(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

		if (!SpeechRecognition) {
			toast.error("Speech Recognition is not supported on this browser. You can type your note directly.");
			return;
		}

		try {
			const recognition = new SpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = "en-US";

			recognition.onstart = () => {
				setIsVoiceRecording(true);
				toast.success("Listening... Speak your clinical advice now.");
			};

			recognition.onresult = (event: any) => {
				let transcript = "";
				for (let i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) {
						transcript += event.results[i][0].transcript + " ";
					}
				}
				if (transcript) {
					setAdviceText((prev) => `${prev.trim()} ${transcript.trim()}`);
				}
			};

			recognition.onerror = () => {
				setIsVoiceRecording(false);
			};

			recognition.onend = () => {
				setIsVoiceRecording(false);
			};

			recognitionRef.current = recognition;
			recognition.start();
		} catch (e) {
			console.error(e);
			setIsVoiceRecording(false);
		}
	};

	// Cleanup recognition on unmount
	useEffect(() => {
		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
		};
	}, []);

	// Send advice to patient
	const handleDispatchAdvice = () => {
		if (!adviceText.trim()) {
			toast.error("Please enter or dictate clinical advice.");
			return;
		}

		// Clear urgent flag if any
		setPatients((prev) =>
			prev.map((p) =>
				p.id === selectedPatient.id ? { ...p, status: "monitoring" } : p,
			),
		);

		setIsAdviceModalOpen(false);
		toast.success(`Clinical advice and care plan dispatched to ${selectedPatient.name}'s Genetiq app!`);
	};

	const handleAcknowledge = () => {
		setPatients((prev) =>
			prev.map((p) =>
				p.id === selectedPatient.id ? { ...p, status: "monitoring" } : p,
			),
		);
		toast.success(`Triage alert for ${selectedPatient.name} cleared.`);
	};

	const handleOrderRetest = () => {
		toast.success(`90-day lab re-test order dispatched for ${selectedPatient.name}.`);
	};

	return (
		<div className={`${styles.clinicalStage} ${isLeftPanelCollapsed ? styles.leftCollapsed : ""}`}>
			{/* 1. Full-Screen 3D Digital Twin Stage */}
			<div className={styles.canvasFullStage}>
				<CameraProvider>
					<MainScene selectedCategory={selectedOrganSystem} showSidebar={false} />
				</CameraProvider>
			</div>

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
										<div>
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

				{/* Header Right Controls: KPIs + Schedule + Doctor Profile & Settings Menu */}
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

					{/* Direct Appointments / Schedule Quick Trigger */}
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

					{/* Theme Switcher */}
					<ThemeSwitcher />

					{/* Doctor Profile & Clinical Features Dropdown */}
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
								</div>

								<div className={styles.menuDivider} />

								{/* Clinical Features & Access List */}
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
										<span className={styles.statusPillLive}>
											{appointments.filter((a) => a.status === "waiting").length > 0 ? "1 Waiting" : "Active"}
										</span>
									</button>

									<button
										type='button'
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
											<span className={styles.menuItemTitle}>EHR & FHIR Sync</span>
											<span className={styles.menuItemSub}>Epic / Cerner live sync status</span>
										</div>
										<span className={styles.statusPillLive}>Live</span>
									</button>

									<button
										type='button'
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
											<span className={styles.menuItemTitle}>Triage Thresholds & Alerts</span>
											<span className={styles.menuItemSub}>ApoB & arrhythmia triggers</span>
										</div>
										<ChevronRight size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
									</button>

									<button
										type='button'
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
											<span className={styles.menuItemTitle}>Order Sets & Formulary</span>
											<span className={styles.menuItemSub}>90-day lab & prescription sets</span>
										</div>
										<ChevronRight size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
									</button>

									<button
										type='button'
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
											<span className={styles.menuItemSub}>Continuous speech & lexicon</span>
										</div>
										<ChevronRight size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
									</button>

									<button
										type='button'
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
											<span className={styles.menuItemTitle}>HIPAA Audit & Credentials</span>
											<span className={styles.menuItemSub}>Active session & AES-256 logs</span>
										</div>
										<ChevronRight size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
									</button>
								</div>

								<div className={styles.menuDivider} />

								{/* Bottom Switch to Patient View & Settings */}
								<div className={styles.doctorMenuFooter}>
									<button
										type='button'
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
							<div className={styles.patientAvatarHero}>
								{selectedPatient.name.split(" ").map((n) => n[0]).join("")}
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

						{selectedPatient.labMarkers.map((m, idx) => (
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

			{/* 4. Advice & Care Plan Dispatch Modal (Voice + Text + Historical Problems) */}
			{isAdviceModalOpen && (
				<div className={styles.modalOverlay} onClick={() => setIsAdviceModalOpen(false)}>
					<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<h2>
								<Send size={18} style={{ color: "#00a896" }} />
								Clinical Care Advice & Patient Dispatch
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
							{/* Patient target box */}
							<div className={styles.patientTargetBox}>
								<div>
									<div className={styles.targetName}>Recipient: {selectedPatient.name} ({selectedPatient.mrn})</div>
									<div className={styles.targetDetails}>{selectedPatient.primaryDiagnosis} · Age {selectedPatient.age}</div>
								</div>
								<span className={styles.badgeUrgent}>Direct App Dispatch</span>
							</div>

							{/* Patient Problem History Accordion */}
							<div className={styles.historyAccordion}>
								<div
									className={styles.accordionTitle}
									onClick={() => setShowProblemHistory(!showProblemHistory)}
									style={{ cursor: "pointer" }}
								>
									<span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
										<History size={14} />
										Patient Problem & Symptom History ({selectedPatient.problemHistory.length})
									</span>
									{showProblemHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
								</div>

								{showProblemHistory && (
									<div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
										{selectedPatient.problemHistory.length === 0 ? (
											<div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.4)", padding: "4px" }}>
												No prior unresolved issues on record.
											</div>
										) : (
											selectedPatient.problemHistory.map((prob, idx) => (
												<div key={idx} className={styles.historyItem}>
													<div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: "2px" }}>
														<span>{prob.title}</span>
														<span style={{ color: prob.status === "Resolved" ? "#10b981" : "#f59e0b", fontSize: "0.72rem" }}>
															{prob.status} ({prob.date})
														</span>
													</div>
													{prob.resolutionNote && (
														<div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.55)" }}>
															Note: {prob.resolutionNote}
														</div>
													)}
												</div>
											))
										)}
									</div>
								)}
							</div>

							{/* Quick Smart Templates */}
							<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
								<span style={{ fontSize: "0.76rem", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
									Smart Clinical Templates:
								</span>
								<div className={styles.templatePills}>
									<button
										type='button'
										className={styles.templatePill}
										onClick={() =>
											setAdviceText(
												`Hello ${selectedPatient.name},\n\nPlease sit down and rest immediately, drink 500ml of water, and ensure you have taken your morning Metoprolol 25mg.\n\nAvoid caffeine and strenuous activity today. If your shortness of breath persists beyond 15 minutes, please contact emergency.\n\n— ${doctor.doctorName}`,
											)
										}
									>
										<Heart size={13} /> Cardio / Palpitations Protocol
									</button>
									<button
										type='button'
										className={styles.templatePill}
										onClick={() =>
											setAdviceText(
												`Hello ${selectedPatient.name},\n\nPlease sit quietly for 10 minutes and retake your blood pressure on your left arm. Take your morning Lisinopril 20mg with a full glass of water.\n\n— ${doctor.doctorName}`,
											)
										}
									>
										<Activity size={13} /> Blood Pressure Protocol
									</button>
									<button
										type='button'
										className={styles.templatePill}
										onClick={() =>
											setAdviceText(
												`Hello ${selectedPatient.name},\n\nYour recent blood glucose readings look elevated. Please ensure you take Metformin XR with your evening meal and reduce high-glycemic carbohydrates today.\n\n— ${doctor.doctorName}`,
											)
										}
									>
										<Droplet size={13} /> Glucose & Metabolic Advice
									</button>
								</div>
							</div>

							{/* Editable Advice Textarea with Voice Dictation */}
							<div className={styles.adviceInputWrapper}>
								<label>
									<span>Doctor Care Message & Instructions</span>
									<div className={styles.voiceControlRow}>
										<button
											type='button'
											className={`${styles.voiceBtn} ${isVoiceRecording ? styles.voiceBtnRecording : ""}`}
											onClick={toggleVoiceInput}
										>
											{isVoiceRecording ? <MicOff size={14} /> : <Mic size={14} />}
											{isVoiceRecording ? "Listening..." : "Dictate via Voice"}
										</button>
									</div>
								</label>

								<textarea
									className={styles.adviceTextarea}
									value={adviceText}
									onChange={(e) => setAdviceText(e.target.value)}
									placeholder='Type or dictate clinical instructions to the patient...'
								/>
							</div>
						</div>

						<div className={styles.modalFooter}>
							<button
								type='button'
								className={styles.btnActionSecondary}
								onClick={() => setIsAdviceModalOpen(false)}
							>
								Cancel
							</button>

							<button
								type='button'
								className={styles.btnActionPrimary}
								onClick={handleDispatchAdvice}
							>
								<Sparkles size={14} /> Dispatch to Patient App & Sync EHR
							</button>
						</div>
					</div>
				</div>
			)}

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
										{doctor.doctorName} · {doctor.hospitalName} ({doctor.department})
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
												<span>{ehrSyncing ? "Syncing Records..." : "Sync EHR Now"}</span>
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
													<div>Endpoint: <code>https://fhir.metropolitanmed.org/r4</code></div>
													<div>Protocol: US Core STU3 (LOINC, SNOMED-CT, RxNorm)</div>
													<div>Last sync: Just now · Auto-sync active (every 5m)</div>
												</div>
											</div>

											<div className={styles.integrationCard}>
												<div className={styles.integrationHeader}>
													<div className={styles.intIconTitle}>
														<Activity size={16} style={{ color: "#0ea5e9" }} />
														<span style={{ fontWeight: 700 }}>Telemetry & Wearable Stream</span>
													</div>
													<span className={styles.statusPillLive}>Active</span>
												</div>
												<div className={styles.integrationMeta}>
													<div>Stream: Apple HealthKit / Withings Cloud API</div>
													<div>Ingestion: Real-time PPG, Blood Pressure, Glucose</div>
													<div>Connected Patients: 3 active monitoring pipelines</div>
												</div>
											</div>
										</div>

										<div className={styles.settingsCardBox}>
											<div className={styles.settingRow}>
												<div>
													<div className={styles.settingTitle}>Auto-Import Daily Biometrics</div>
													<div className={styles.settingDesc}>Automatically fetch home-logged symptoms and blood pressures into patient charts.</div>
												</div>
												<input type="checkbox" defaultChecked className={styles.toggleCheckbox} />
											</div>
											<div className={styles.settingRow}>
												<div>
													<div className={styles.settingTitle}>EHR Clinical Note Auto-Append</div>
													<div className={styles.settingDesc}>Push all care advice and doctor notes directly to patient EHR encounter history.</div>
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
															handleOrderRetest();
															setIsSettingsModalOpen(false);
														}}
													>
														<Plus size={13} /> Order for {selectedPatient.name}
													</button>
												</div>
											</div>

											<div className={styles.orderSetCard}>
												<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
													<div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0ea5e9" }}>
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
												className={`${styles.specialistCard} ${
													newApptSpecialistId === doc.id ? styles.specialistCardActive : ""
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
												className={`${styles.slotCardBtn} ${
													newApptSlot === slot ? styles.slotCardBtnActive : ""
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

			{/* 8. Bottom Floating Organ System Bar */}
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
