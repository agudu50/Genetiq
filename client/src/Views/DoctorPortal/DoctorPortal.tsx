import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { paths } from "@/App/Routes/Paths";
import { toast } from "react-toastify";
import {
	Activity,
	AlertTriangle,
	ArrowDownRight,
	ArrowUpRight,
	Check,
	CheckCircle2,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	Clock,
	Droplet,
	Heart,
	History,
	Mic,
	MicOff,
	Pill,
	Plus,
	Search,
	Send,
	ShieldAlert,
	Sparkles,
	Stethoscope,
	User,
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
		defaultOrgan: "gastroenterolgy",
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

export const DoctorPortal = () => {
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.user);
	const doctor = user.doctorProfile || {
		doctorName: "Dr. Sarah Jenkins, MD",
		hospitalName: "Metropolitan Medical Center",
		department: "Cardiology & Internal Medicine",
		title: "Attending Physician",
	};

	const [patients, setPatients] = useState<ClinicalPatient[]>(mockPatients);
	const [selectedPatientId, setSelectedPatientId] = useState<string>("pt-101");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedOrganSystem, setSelectedOrganSystem] = useState<string>("cardiovascular");

	// Advice & Clinical Dispatch Modal State
	const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
	const [adviceText, setAdviceText] = useState("");
	const [isVoiceRecording, setIsVoiceRecording] = useState(false);
	const [showProblemHistory, setShowProblemHistory] = useState(true);
	const recognitionRef = useRef<any>(null);

	// Panel Collapsible State
	const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
	const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

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
				<div className={styles.patientSwitcherWrapper}>
					<button
						type='button'
						className={styles.patientSwitcherBtn}
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
					>
						<div className={styles.activePatientPill}>
							<User size={15} style={{ color: "#00a896" }} />
							<span>{selectedPatient.name} ({selectedPatient.mrn})</span>
							<span
								className={
									selectedPatient.status === "urgent"
										? styles.badgeUrgent
										: selectedPatient.status === "monitoring"
										? styles.badgeWarning
										: styles.badgeOptimal
								}
								style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
							>
								{selectedPatient.status === "urgent" ? (
									<>
										<ShieldAlert size={12} /> Urgent
									</>
								) : selectedPatient.status === "monitoring" ? (
									<>
										<AlertTriangle size={12} /> Monitored
									</>
								) : (
									<>
										<CheckCircle2 size={12} /> Stable
									</>
								)}
							</span>
						</div>
						<ChevronDown size={14} style={{ opacity: 0.6 }} />
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
						className={styles.patientViewBtn}
						onClick={() => navigate(paths.dashboard.root)}
					>
						<User size={14} /> Patient Mode
					</button>
				</div>
			</header>

			{/* Floating Expand Buttons (shown when panels are collapsed) */}
			{isLeftPanelCollapsed && (
				<button
					type='button'
					className={`${styles.expandToggleBtn} ${styles.expandToggleBtnLeft}`}
					onClick={() => setIsLeftPanelCollapsed(false)}
				>
					<User size={14} /> Show Patient Profile
				</button>
			)}

			{isRightPanelCollapsed && (
				<button
					type='button'
					className={`${styles.expandToggleBtn} ${styles.expandToggleBtnRight}`}
					onClick={() => setIsRightPanelCollapsed(false)}
				>
					<Activity size={14} /> Show Labs & Meds
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

			{/* 5. Bottom Floating Organ System Bar */}
			<div className={styles.bottomOrganBar}>
				<button
					type='button'
					className={`${styles.organPill} ${selectedOrganSystem === "cardiovascular" ? styles.organPillActive : ""}`}
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
					className={`${styles.organPill} ${selectedOrganSystem === "gastroenterolgy" ? styles.organPillActive : ""}`}
					onClick={() => setSelectedOrganSystem("gastroenterolgy")}
				>
					<Activity size={14} /> Metabolic & Liver
				</button>
			</div>
		</div>
	);
};

export default DoctorPortal;
