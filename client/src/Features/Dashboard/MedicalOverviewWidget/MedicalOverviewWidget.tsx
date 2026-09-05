import { useState, useMemo, useEffect } from "react";
import styles from "./MedicalOverviewWidget.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { paths } from "@/App/Routes/Paths";
import {
	Activity,
	ShieldCheck,
	Pill,
	Stethoscope,
	FlaskConical,
	MessageSquare,
	CheckSquare,
	Square,
	CheckCircle2,
	AlertCircle,
	ChevronRight,
} from "lucide-react";
import { PatientCareChatModal, ChatMessage } from "../Components/PatientCareChatModal/PatientCareChatModal";

type Tab = "conditions" | "medications" | "symptoms" | "labs";

export const MedicalOverviewWidget = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.user);
	const uploadRecords = useSelector((state: RootState) => state.uploadHistory.records);
	const [activeTab, setActiveTab] = useState<Tab>("conditions");
	const [isDoctorChatOpen, setIsDoctorChatOpen] = useState(false);
	const [latestDoctorMessage, setLatestDoctorMessage] = useState<ChatMessage | null>(null);

	const patientId = "pt-101";
	const storageKey = `genetiq.patient_doctor_chat_${patientId}`;

	// Load latest doctor response
	const loadLatestDoctorResponse = () => {
		try {
			const saved = localStorage.getItem(storageKey);
			if (saved) {
				const parsed: ChatMessage[] = JSON.parse(saved);
				if (Array.isArray(parsed) && parsed.length > 0) {
					const doctorMsgs = parsed.filter((m) => m.sender === "doctor");
					if (doctorMsgs.length > 0) {
						setLatestDoctorMessage(doctorMsgs[doctorMsgs.length - 1]);
						return;
					}
				}
			}
		} catch (e) {
			console.error(e);
		}

		// Fallback default advice from Dr. Sarah Jenkins
		setLatestDoctorMessage({
			id: "msg-init-2",
			sender: "doctor",
			senderName: "Dr. Sarah Jenkins, MD",
			senderRole: "Attending Cardiologist",
			timestamp: "Today · 09:15 AM",
			priority: "urgent",
			text: "Hello Marcus Vance,\n\nI reviewed your recent report of Palpitations & Shortness of Breath. Please sit down and rest immediately, drink 500ml of water, and ensure you have taken your morning Metoprolol 25mg.\n\nAvoid caffeine and strenuous activity today. If your shortness of breath persists beyond 15 minutes or you experience chest pressure, please call our triage nurse or emergency immediately.\n\n— Dr. Sarah Jenkins, MD",
			actions: [
				{ id: "act-1", label: "Sit down and rest quietly immediately", isCompleted: true, completedAt: "09:18 AM" },
				{ id: "act-2", label: "Drink 500ml of fresh water", isCompleted: true, completedAt: "09:18 AM" },
				{ id: "act-3", label: "Confirm morning Metoprolol 25mg intake", isCompleted: true, completedAt: "09:19 AM" },
				{ id: "act-4", label: "Recheck Resting HR in 15 mins (Call triage if SOB persists)", isCompleted: true, completedAt: "09:34 AM" },
			],
			status: "read",
		});
	};

	useEffect(() => {
		loadLatestDoctorResponse();
		window.addEventListener("storage", loadLatestDoctorResponse);
		return () => window.removeEventListener("storage", loadLatestDoctorResponse);
	}, []);

	// Toggle action on the widget card
	const handleToggleActionFromWidget = (actionId: string) => {
		if (!latestDoctorMessage || !latestDoctorMessage.actions) return;

		try {
			const saved = localStorage.getItem(storageKey);
			let allMsgs: ChatMessage[] = saved ? JSON.parse(saved) : [];
			if (allMsgs.length === 0 && latestDoctorMessage) allMsgs = [latestDoctorMessage];

			const updated = allMsgs.map((m) => {
				if (m.id !== latestDoctorMessage.id || !m.actions) return m;
				const newActs = m.actions.map((act) => {
					if (act.id !== actionId) return act;
					const nextDone = !act.isCompleted;
					return {
						...act,
						isCompleted: nextDone,
						completedAt: nextDone
							? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
							: undefined,
					};
				});
				return { ...m, actions: newActs };
			});

			localStorage.setItem(storageKey, JSON.stringify(updated));
			const currentDoc = updated.find((m) => m.id === latestDoctorMessage.id);
			if (currentDoc) setLatestDoctorMessage(currentDoc);
		} catch (e) {
			console.error(e);
		}
	};

	const medicalConditions = Array.isArray(user?.medicalConditions) ? user.medicalConditions : [];
	const medications = Array.isArray(user?.medications) ? user.medications : [];
	const symptoms = Array.isArray(user?.symptoms) ? user.symptoms : [];
	const latestRecord = uploadRecords[0];
	const labFindings = latestRecord?.findings || [];

	const conditionsCount = medicalConditions.length;
	const activeMeds = medications.filter((m) => m && m.name);
	const medicationsCount = activeMeds.length;
	const symptomsCount = symptoms.length;
	const labsCount = labFindings.length;

	const bmiValue = useMemo(() => {
		const h = Number(user.height);
		const w = Number(user.weight);
		if (!h || !w) return null;
		return Number((w / ((h / 100) * (h / 100))).toFixed(1));
	}, [user.height, user.weight]);

	const tabs: { key: Tab; label: string; count: number }[] = [
		{
			key: "conditions",
			label: t("conditions") || "Conditions",
			count: conditionsCount,
		},
		{
			key: "medications",
			label: t("medications") || "Medications",
			count: medicationsCount,
		},
		{
			key: "symptoms",
			label: t("symptoms") || "Symptoms",
			count: symptomsCount,
		},
		{
			key: "labs",
			label: t("labs") || "Labs",
			count: labsCount,
		},
	];

	const hasAnyData = conditionsCount > 0 || medicationsCount > 0 || symptomsCount > 0 || labsCount > 0;

	return (
		<div className={styles.medicalWidget}>
			<div className={styles.header}>
				<h3 className={styles.title}>
					<Stethoscope size={18} strokeWidth={2.25} />
					{t("medical_overview") || "Medical Overview"}
				</h3>

				<button
					type='button'
					className={styles.doctorCareBtn}
					onClick={() => setIsDoctorChatOpen(true)}
					title='Open care advice & chat with Dr. Sarah Jenkins'
				>
					<MessageSquare size={13} />
					<span>Doctor Care Chat</span>
					<span className={styles.pulseDot} />
				</button>
			</div>

			<PatientCareChatModal
				isOpen={isDoctorChatOpen}
				onClose={() => setIsDoctorChatOpen(false)}
				patientName={user?.firstName ? `${user.firstName} ${user.lastName}`.trim() : "Marcus Vance"}
				doctorName='Dr. Sarah Jenkins, MD'
				doctorRole='Attending Cardiologist'
			/>

			{/* Doctor Clinical Care Response & Directives Card */}
			{latestDoctorMessage && (
				<div className={styles.doctorResponseCard}>
					<div className={styles.responseCardHeader}>
						<div className={styles.docHeaderLeft}>
							<div className={styles.docAvatarBadge}>
								<Stethoscope size={15} />
							</div>
							<div>
								<div className={styles.docName}>{latestDoctorMessage.senderName}</div>
								<div className={styles.docRole}>
									{latestDoctorMessage.senderRole} · {latestDoctorMessage.timestamp}
								</div>
							</div>
						</div>
						{latestDoctorMessage.priority === "urgent" && (
							<span className={styles.urgentBadge}>
								<AlertCircle size={11} /> Clinical Directive
							</span>
						)}
					</div>

					<div className={styles.responseBody}>
						<p className={styles.responseText}>
							{latestDoctorMessage.text.split("\n").map((line, i) => (
								<span key={i}>
									{line}
									{i < latestDoctorMessage.text.split("\n").length - 1 && <br />}
								</span>
							))}
						</p>

						{latestDoctorMessage.actions && latestDoctorMessage.actions.length > 0 && (
							<div className={styles.widgetActionsList}>
								<div className={styles.widgetActionsTitle}>
									<CheckSquare size={13} />
									<span>Doctor Action Directives (Tap to check off):</span>
								</div>
								<div className={styles.actionsGrid}>
									{latestDoctorMessage.actions.map((act) => (
										<div
											key={act.id}
											className={`${styles.widgetActionItem} ${
												act.isCompleted ? styles.widgetActionDone : ""
											}`}
											onClick={() => handleToggleActionFromWidget(act.id)}
											title='Tap to mark completed'
										>
											{act.isCompleted ? (
												<CheckCircle2 size={15} className={styles.actionIconDone} />
											) : (
												<Square size={15} className={styles.actionIconTodo} />
											)}
											<span className={styles.actionText}>{act.label}</span>
											{act.isCompleted && act.completedAt && (
												<span className={styles.actionDoneTag}>Done ({act.completedAt})</span>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					<div className={styles.responseCardFooter}>
						<button
							type='button'
							className={styles.btnOpenChat}
							onClick={() => setIsDoctorChatOpen(true)}
						>
							<MessageSquare size={13} />
							<span>Open Full Chat & Reply to {latestDoctorMessage.senderName}</span>
							<ChevronRight size={13} />
						</button>
					</div>
				</div>
			)}

			{/* Onboarding Health Metrics Summary Row */}
			<div className={styles.summaryGrid}>
				{/* BMI */}
				<div className={styles.summaryCard}>
					<div className={styles.summaryCardHeader}>
						<Activity size={13} className={styles.iconBmi} />
						<span className={styles.summaryLabel}>BMI</span>
					</div>
					<span className={styles.summaryStatus}>
						{bmiValue !== null ? `${bmiValue} kg/m²` : "No data"}
					</span>
					<strong className={styles.summaryCount}>
						{bmiValue !== null ? bmiValue : 0}
					</strong>
				</div>

				{/* Conditions */}
				<div className={styles.summaryCard}>
					<div className={styles.summaryCardHeader}>
						<ShieldCheck size={13} className={styles.iconConditions} />
						<span className={styles.summaryLabel}>{t("conditions") || "Conditions"}</span>
					</div>
					<span
						className={`${styles.summaryStatus} ${
							conditionsCount === 0 ? styles.statusClear : ""
						}`}
					>
						{conditionsCount > 0 ? `${conditionsCount} Recorded` : "Clear"}
					</span>
					<strong className={styles.summaryCount}>{conditionsCount}</strong>
				</div>

				{/* Medications */}
				<div className={styles.summaryCard}>
					<div className={styles.summaryCardHeader}>
						<Pill size={13} className={styles.iconMeds} />
						<span className={styles.summaryLabel}>{t("medications") || "Medications"}</span>
					</div>
					<span
						className={`${styles.summaryStatus} ${
							medicationsCount === 0 ? styles.statusClear : ""
						}`}
					>
						{medicationsCount > 0 ? `${medicationsCount} Active` : "Clear"}
					</span>
					<strong className={styles.summaryCount}>{medicationsCount}</strong>
				</div>
			</div>

			<div className={styles.tabBar}>
				{tabs.map((tab) => (
					<button
						key={tab.key}
						className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ""}`}
						onClick={() => setActiveTab(tab.key)}
					>
						{tab.label}
						{tab.count > 0 && (
							<span className={styles.tabCount}>{tab.count}</span>
						)}
					</button>
				))}
			</div>

			<div className={styles.tabContent}>
				{activeTab === "conditions" && (
					<div className={styles.conditionsGrid}>
						{medicalConditions.length > 0 ? (
							medicalConditions.map((cond) => (
								<div
									key={cond}
									className={styles.conditionPill}
								>
									<span className={styles.pillDot} />
									{cond}
								</div>
							))
						) : (
							<EmptyTabState
								text={t("no_conditions") || "No medical conditions recorded"}
								onImport={() => navigate("/config/import")}
							/>
						)}
					</div>
				)}

				{activeTab === "medications" && (
					<div className={styles.medList}>
						{activeMeds.length > 0 ? (
							activeMeds.map((med, i) => (
								<div key={i} className={styles.medItem}>
									<div className={styles.medIcon}>
										<Pill size={16} />
									</div>
									<div className={styles.medInfo}>
										<span className={styles.medName}>{med.name}</span>
										<span className={styles.medDetails}>
											{med.dosage && `${med.dosage}`}
											{med.frequency && ` · ${med.frequency}`}
										</span>
									</div>
								</div>
							))
						) : (
							<EmptyTabState
								text={t("no_medications") || "No medications recorded"}
								onImport={() => navigate("/config/import")}
							/>
						)}
					</div>
				)}

				{activeTab === "symptoms" && (
					<div className={styles.symptomsGrid}>
						{symptoms.length > 0 ? (
							symptoms.map((sym) => (
								<div key={sym} className={styles.symptomChip}>
									<Activity size={14} />
									{sym}
								</div>
							))
						) : (
							<EmptyTabState
								text={t("no_symptoms") || "No symptoms recorded"}
								onImport={() => navigate("/config/import")}
							/>
						)}
					</div>
				)}

				{activeTab === "labs" && (
					<div className={styles.labsContainer}>
						<div className={styles.labsHeader}>
							<div className={styles.labsHeaderTitle}>
								<FlaskConical size={13} />
								<span>{latestRecord?.fileName || "90-Day ApoB & Lipid Subfraction"}</span>
							</div>
							<span className={styles.labsHeaderMeta}>Quest Diagnostics Direct</span>
						</div>
						<div className={styles.labsList}>
							{labFindings.length > 0 ? (
								labFindings.map((f) => {
									const isHigh = f.status === "elevated" || f.status === "action";
									const isLow = f.status === "low";
									const tagClass = isHigh ? styles.tagHigh : isLow ? styles.tagLow : styles.tagNormal;
									const statusText = isHigh ? "High" : isLow ? "Low" : "Normal";

									return (
										<div
											key={f.id}
											className={styles.labItem}
											onClick={() => navigate(paths.clinicalHistory)}
										>
											<div className={styles.labItemLeft}>
												<span className={styles.labItemName}>{f.name}</span>
												<span className={styles.labItemRef}>
													{f.statusLabel.includes("Ref")
														? f.statusLabel.slice(f.statusLabel.indexOf("Ref"))
														: `Marker: ${f.marker}`}
												</span>
											</div>
											<div className={styles.labItemRight}>
												<span className={styles.labItemValue}>{f.value}</span>
												<span className={`${styles.labStatusTag} ${tagClass}`}>
													{statusText}
												</span>
											</div>
										</div>
									);
								})
							) : (
								<EmptyTabState
									text={t("no_labs") || "No lab biomarkers recorded"}
									onImport={() => navigate(paths.clinicalHistory)}
								/>
							)}
						</div>
					</div>
				)}
			</div>

			{!hasAnyData && (
				<div className={styles.globalEmpty}>
					<button
						className={styles.importBtn}
						onClick={() => navigate("/config/import")}
					>
						{t("import_health_data") || "Import Health Data"}
					</button>
				</div>
			)}
		</div>
	);
};

const EmptyTabState = ({
	text,
	onImport,
}: {
	text: string;
	onImport: () => void;
}) => (
	<div className={styles.emptyTab}>
		<p>{text}</p>
		<button className={styles.emptyImportBtn} onClick={onImport}>
			Add Data
		</button>
	</div>
);
