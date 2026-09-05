import React, { useState, useEffect, useRef } from "react";
import {
	X,
	Send,
	Mic,
	MicOff,
	Heart,
	Activity,
	Droplet,
	Sparkles,
	History,
	ChevronDown,
	ChevronUp,
	CheckCircle2,
	AlertCircle,
	ShieldCheck,
	Stethoscope,
	RefreshCw,
	CheckSquare,
	Square,
	Zap,
} from "lucide-react";
import { toast } from "react-toastify";
import styles from "./ClinicalCareChatModal.module.scss";

export interface ChatActionItem {
	id: string;
	label: string;
	isCompleted: boolean;
	completedAt?: string;
}

export interface ChatMessage {
	id: string;
	sender: "doctor" | "patient";
	senderName: string;
	senderRole: string;
	timestamp: string;
	text: string;
	priority?: "normal" | "urgent";
	actions?: ChatActionItem[];
	status?: "sent" | "delivered" | "read";
}

interface ClinicalCareChatModalProps {
	isOpen: boolean;
	onClose: () => void;
	selectedPatient: {
		id: string;
		mrn: string;
		name: string;
		age: number;
		gender?: string;
		primaryDiagnosis: string;
		status?: string;
		problemHistory?: Array<{
			date: string;
			title: string;
			severity?: number;
			status: string;
			resolutionNote?: string;
		}>;
		medications?: Array<{
			name: string;
			dosage: string;
			frequency: string;
			adherence: number;
		}>;
		symptoms?: Array<{
			id: string;
			name: string;
			severity: number;
			duration: string;
			urgency: string;
			notes: string;
		}>;
	};
	doctor: {
		doctorName: string;
		department?: string;
		hospitalName?: string;
	};
	initialAdviceText?: string;
	onAdviceDispatched?: (messageText: string) => void;
}

export const ClinicalCareChatModal: React.FC<ClinicalCareChatModalProps> = ({
	isOpen,
	onClose,
	selectedPatient,
	doctor,
	initialAdviceText = "",
	onAdviceDispatched,
}) => {
	const storageKey = `genetiq.patient_doctor_chat_${selectedPatient.id}`;

	// Preloaded seed conversation
	const getSeedMessages = (): ChatMessage[] => {
		const isMarcus = selectedPatient.name.includes("Marcus");
		if (isMarcus) {
			return [
				{
					id: "msg-init-1",
					sender: "patient",
					senderName: "Marcus Vance",
					senderRole: "Patient (App Dispatch)",
					timestamp: "Today · 09:12 AM",
					text: "Dr. Jenkins, I just walked up the stairs and my heart started racing suddenly. My watch is showing 118 bpm, and I feel lightheaded and short of breath. Should I take an extra Metoprolol or sit down?",
					status: "read",
				},
				{
					id: "msg-init-2",
					sender: "doctor",
					senderName: doctor.doctorName || "Dr. Sarah Jenkins, MD",
					senderRole: "Attending Cardiologist",
					timestamp: "Today · 09:15 AM",
					priority: "urgent",
					text: `Hello Marcus Vance,\n\nI reviewed your recent report of Palpitations & Shortness of Breath. Please sit down and rest immediately, drink 500ml of water, and ensure you have taken your morning Metoprolol 25mg.\n\nAvoid caffeine and strenuous activity today. If your shortness of breath persists beyond 15 minutes or you experience chest pressure, please call our triage nurse or emergency immediately.\n\n— ${doctor.doctorName || "Dr. Sarah Jenkins, MD"}`,
					actions: [
						{ id: "act-1", label: "Sit down and rest quietly immediately", isCompleted: true, completedAt: "09:18 AM" },
						{ id: "act-2", label: "Drink 500ml of fresh water", isCompleted: true, completedAt: "09:18 AM" },
						{ id: "act-3", label: "Confirm morning Metoprolol 25mg intake", isCompleted: true, completedAt: "09:19 AM" },
						{ id: "act-4", label: "Recheck Resting HR in 15 mins (Call triage if SOB persists)", isCompleted: true, completedAt: "09:34 AM" },
					],
					status: "read",
				},
				{
					id: "msg-init-3",
					sender: "patient",
					senderName: "Marcus Vance",
					senderRole: "Patient (App Dispatch)",
					timestamp: "Today · 09:19 AM",
					text: "Understood Dr. Jenkins. I just sat down on the couch, drank 500ml of water, and confirmed my morning Metoprolol 25mg. Resting now.",
					status: "read",
				},
				{
					id: "msg-init-4",
					sender: "patient",
					senderName: "Marcus Vance",
					senderRole: "Patient (App Dispatch)",
					timestamp: "Today · 09:34 AM",
					text: "Update: It's been 15 minutes. My resting heart rate has dropped down to 76 bpm. The palpitations have settled and my breathing is completely back to normal. Thank you for the swift guidance!",
					status: "read",
				},
			];
		}

		return [
			{
				id: "msg-gen-1",
				sender: "patient",
				senderName: selectedPatient.name,
				senderRole: "Patient (App Dispatch)",
				timestamp: "Today · 09:00 AM",
				text: `Hello Dr. ${doctor.doctorName.replace(/^Dr\.\s*/i, "")}, reporting my morning vitals and symptoms for triage review.`,
				status: "read",
			},
		];
	};

	// State
	const [messages, setMessages] = useState<ChatMessage[]>(() => {
		try {
			const saved = localStorage.getItem(storageKey);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed) && parsed.length > 0) return parsed;
			}
		} catch (e) {
			console.error("Error loading chat messages:", e);
		}
		return getSeedMessages();
	});

	const [inputText, setInputText] = useState(initialAdviceText);
	const [isVoiceRecording, setIsVoiceRecording] = useState(false);
	const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

	const chatEndRef = useRef<HTMLDivElement>(null);
	const recognitionRef = useRef<any>(null);

	// Load & listen to storage events across tabs or patient replies
	useEffect(() => {
		const loadMessages = () => {
			try {
				const saved = localStorage.getItem(storageKey);
				if (saved) {
					const parsed = JSON.parse(saved);
					if (Array.isArray(parsed) && parsed.length > 0) {
						setMessages(parsed);
						return;
					}
				}
			} catch (e) {
				console.error(e);
			}
			setMessages(getSeedMessages());
		};

		loadMessages();
		window.addEventListener("storage", loadMessages);
		return () => window.removeEventListener("storage", loadMessages);
	}, [selectedPatient.id]);

	// Auto save
	useEffect(() => {
		try {
			localStorage.setItem(storageKey, JSON.stringify(messages));
		} catch (e) {
			console.error("Error saving chat messages:", e);
		}
	}, [messages, storageKey]);

	// Auto scroll to bottom
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => {
				chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 100);
		}
	}, [isOpen, messages.length]);

	// Clean up voice recognition
	useEffect(() => {
		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
		};
	}, []);

	if (!isOpen) return null;

	// Voice recognition toggle
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
				toast.success("Listening... Dictate clinical instructions clearly.");
			};

			recognition.onresult = (event: any) => {
				let transcript = "";
				for (let i = event.resultIndex; i < event.results.length; i++) {
					transcript += event.results[i][0].transcript;
				}
				setInputText((prev) => {
					const cleanPrev = prev.trim();
					return cleanPrev ? `${cleanPrev} ${transcript}` : transcript;
				});
			};

			recognition.onerror = () => {
				setIsVoiceRecording(false);
			};

			recognition.onend = () => {
				setIsVoiceRecording(false);
			};

			recognitionRef.current = recognition;
			recognition.start();
		} catch (err) {
			console.error(err);
			setIsVoiceRecording(false);
		}
	};

	const getFormattedTimestamp = () => {
		const now = new Date();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const ampm = hours >= 12 ? "PM" : "AM";
		const formattedHours = hours % 12 || 12;
		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		return `Today · ${formattedHours}:${formattedMinutes} ${ampm}`;
	};

	// Apply smart templates directly to input
	const applyTemplate = (type: "cardio" | "bp" | "glucose" | "triage") => {
		if (type === "cardio") {
			setInputText(
				`Hello ${selectedPatient.name},\n\nI reviewed your recent report of Palpitations & Shortness of Breath. Please sit down and rest immediately, drink 500ml of water, and ensure you have taken your morning Metoprolol 25mg.\n\nAvoid caffeine and strenuous activity today. If your shortness of breath persists beyond 15 minutes or you experience chest pressure, please call our triage nurse or emergency immediately.\n\n— ${doctor.doctorName || "Dr. Sarah Jenkins, MD"}`,
			);
		} else if (type === "bp") {
			setInputText(
				`Hello ${selectedPatient.name},\n\nPlease sit quietly for 10 minutes and retake your blood pressure on your left arm. Take your morning Lisinopril 20mg with a full glass of water.\n\n— ${doctor.doctorName || "Dr. Sarah Jenkins, MD"}`,
			);
		} else if (type === "glucose") {
			setInputText(
				`Hello ${selectedPatient.name},\n\nYour recent blood glucose readings look elevated. Please ensure you take Metformin XR with your evening meal and reduce high-glycemic carbohydrates today.\n\n— ${doctor.doctorName || "Dr. Sarah Jenkins, MD"}`,
			);
		} else if (type === "triage") {
			setInputText(
				`Hello ${selectedPatient.name},\n\nBased on your reported symptoms, our clinical team is initiating a priority triage review. Please remain seated and await our callback, or call emergency immediately if chest pressure occurs.\n\n— ${doctor.doctorName || "Dr. Sarah Jenkins, MD"}`,
			);
		}
	};

	// Doctor sends care advice / instructions
	const handleDoctorSend = (overrideText?: string) => {
		const text = (overrideText || inputText).trim();

		if (!text) {
			toast.error("Please enter or dictate clinical instructions before dispatching.");
			return;
		}

		const isCardio = text.toLowerCase().includes("metoprolol") || text.toLowerCase().includes("palpitation");
		const actions: ChatActionItem[] | undefined = isCardio
			? [
					{ id: `act-${Date.now()}-1`, label: "Sit down and rest immediately", isCompleted: false },
					{ id: `act-${Date.now()}-2`, label: "Drink 500ml of fresh water", isCompleted: false },
					{ id: `act-${Date.now()}-3`, label: "Take morning Metoprolol 25mg", isCompleted: false },
					{ id: `act-${Date.now()}-4`, label: "Recheck HR & call triage if SOB persists > 15m", isCompleted: false },
			  ]
			: undefined;

		const newMessage: ChatMessage = {
			id: `msg-${Date.now()}`,
			sender: "doctor",
			senderName: doctor.doctorName || "Dr. Sarah Jenkins, MD",
			senderRole: "Attending Cardiologist",
			timestamp: getFormattedTimestamp(),
			priority: isCardio ? "urgent" : "normal",
			text,
			actions,
			status: "sent",
		};

		setMessages((prev) => [...prev, newMessage]);
		if (!overrideText) setInputText("");
		toast.success(`Care advice dispatched to ${selectedPatient.name}'s Genetiq app!`);

		if (onAdviceDispatched) {
			onAdviceDispatched(text);
		}

		// Update delivery status
		setTimeout(() => {
			setMessages((prev) =>
				prev.map((m) => (m.id === newMessage.id ? { ...m, status: "read" } : m)),
			);
		}, 1200);
	};

	// Toggle action item completion in chat
	const handleToggleAction = (msgId: string, actionId: string) => {
		setMessages((prev) =>
			prev.map((msg) => {
				if (msg.id !== msgId || !msg.actions) return msg;
				const updatedActions = msg.actions.map((act) => {
					if (act.id !== actionId) return act;
					const nextCompleted = !act.isCompleted;
					return {
						...act,
						isCompleted: nextCompleted,
						completedAt: nextCompleted
							? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
							: undefined,
					};
				});
				return { ...msg, actions: updatedActions };
			}),
		);
		toast.success("Action requirement status updated.");
	};

	const handleResetConversation = () => {
		if (window.confirm("Reset this chat thread back to default records?")) {
			const fresh = getSeedMessages();
			setMessages(fresh);
			try {
				localStorage.setItem(storageKey, JSON.stringify(fresh));
			} catch (e) {
				console.error(e);
			}
			toast.info("Conversation reset.");
		}
	};

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
				{/* 1. Doctor Portal Chat Header */}
				<div className={styles.modalHeader}>
					<div className={styles.patientProfile}>
						<div className={styles.patientAvatar}>
							{selectedPatient.name.split(" ").map((n) => n[0]).join("").slice(0, 2) || "PT"}
						</div>
						<div className={styles.patientDetails}>
							<div className={styles.nameRow}>
								<h3>{selectedPatient.name}</h3>
								<span className={styles.mrnTag}>{selectedPatient.mrn}</span>
								<span className={styles.diagnosisTag}>{selectedPatient.primaryDiagnosis}</span>
								<span className={styles.onlineBadge}>● Online in App</span>
							</div>
							<div className={styles.subMeta}>
								Age {selectedPatient.age} · Direct App Dispatch · Doctor Portal Channel
							</div>
						</div>
					</div>

					<div className={styles.headerRight}>
						{/* History Dropdown */}
						<div className={styles.historyDropdownWrapper}>
							<button
								type='button'
								className={`${styles.historyBtn} ${showHistoryDropdown ? styles.historyBtnActive : ""}`}
								onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
							>
								<History size={14} />
								<span>Problem History (3)</span>
								{showHistoryDropdown ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
							</button>

							{showHistoryDropdown && (
								<div className={styles.historyFlyout}>
									<div className={styles.flyoutHeader}>
										<span>Patient Problem & Symptom History</span>
									</div>
									<div className={styles.flyoutList}>
										<div className={styles.flyoutItem}>
											<div className={styles.flyoutItemTop}>
												<strong>Resting Heart Rate Spike (118 bpm)</strong>
												<span className={styles.badgeResolved}>Resolved (2024-02-14)</span>
											</div>
											<div className={styles.flyoutItemNote}>Note: Metoprolol dosage adjusted to 25mg daily.</div>
										</div>
										<div className={styles.flyoutItem}>
											<div className={styles.flyoutItemTop}>
												<strong>Occasional nocturnal chest fluttering</strong>
												<span className={styles.badgeMonitored}>Monitored (2024-01-20)</span>
											</div>
											<div className={styles.flyoutItemNote}>Note: Ordered 24h Holter monitor.</div>
										</div>
										<div className={styles.flyoutItem}>
											<div className={styles.flyoutItemTop}>
												<strong>Elevated Fasting Glucose (108 mg/dL)</strong>
												<span className={styles.badgeResolved}>Resolved (2023-11-05)</span>
											</div>
											<div className={styles.flyoutItemNote}>Note: Advised low-glycemic dietary protocol.</div>
										</div>
									</div>
								</div>
							)}
						</div>

						<button
							type='button'
							className={styles.resetBtn}
							onClick={handleResetConversation}
							title='Reset conversation'
						>
							<RefreshCw size={14} />
						</button>

						<button
							type='button'
							className={styles.closeBtn}
							onClick={onClose}
							title='Close'
						>
							<X size={18} />
						</button>
					</div>
				</div>

				{/* 2. Spacious Doctor-Patient Conversation Stream */}
				<div className={styles.chatStreamContainer}>
					{messages.map((msg) => {
						const isDoc = msg.sender === "doctor";
						return (
							<div
								key={msg.id}
								className={`${styles.messageRow} ${
									isDoc ? styles.doctorMessageRow : styles.patientMessageRow
								}`}
							>
								<div className={styles.avatarCol}>
									{isDoc ? (
										<div className={styles.doctorAvatar}>
											<Stethoscope size={15} />
										</div>
									) : (
										<div className={styles.patientAvatarIcon}>
											{selectedPatient.name.split(" ").map((n) => n[0]).join("").slice(0, 2) || "PT"}
										</div>
									)}
								</div>

								<div className={styles.bubbleCol}>
									<div className={styles.metaRow}>
										<span className={styles.authorName}>{msg.senderName}</span>
										<span className={styles.authorRole}>({msg.senderRole})</span>
										<span className={styles.timeTag}>{msg.timestamp}</span>
										{msg.priority === "urgent" && (
											<span className={styles.urgentPill}>
												<AlertCircle size={10} /> Urgent
											</span>
										)}
									</div>

									<div
										className={`${styles.bubbleCard} ${
											isDoc ? styles.doctorBubble : styles.patientBubble
										}`}
									>
										<div className={styles.bubbleText}>
											{msg.text.split("\n").map((line, i) => (
												<React.Fragment key={i}>
													{line}
													{i < msg.text.split("\n").length - 1 && <br />}
												</React.Fragment>
											))}
										</div>

										{/* Interactive action checklist */}
										{msg.actions && msg.actions.length > 0 && (
											<div className={styles.checklistCard}>
												<div className={styles.checklistTitle}>
													<CheckSquare size={12} />
													<span>Required Patient Actions:</span>
												</div>
												<div className={styles.checklistItems}>
													{msg.actions.map((act) => (
														<div
															key={act.id}
															className={`${styles.checkItem} ${
																act.isCompleted ? styles.checkItemDone : ""
															}`}
															onClick={() => handleToggleAction(msg.id, act.id)}
														>
															{act.isCompleted ? (
																<CheckCircle2 size={15} className={styles.iconDone} />
															) : (
																<Square size={15} className={styles.iconTodo} />
															)}
															<span className={styles.checkLabel}>{act.label}</span>
															{act.isCompleted && act.completedAt && (
																<span className={styles.doneTime}>({act.completedAt})</span>
															)}
														</div>
													))}
												</div>
											</div>
										)}
									</div>

									<div className={styles.statusRow}>
										{isDoc ? (
											<span className={styles.statusVerified}>
												<ShieldCheck size={11} />
												{msg.status === "read" ? "Delivered to Marcus Vance" : "Dispatched"}
											</span>
										) : (
											<span className={styles.statusPatient}>
												<CheckCircle2 size={11} /> Received from Patient App
											</span>
										)}
									</div>
								</div>
							</div>
						);
					})}
					<div ref={chatEndRef} />
				</div>

				{/* 3. Doctor-Only Care Advice Composer & Smart Protocol Toolbar */}
				<div className={styles.composerContainer}>
					{/* Smart Template Pills */}
					<div className={styles.templateToolbar}>
						<div className={styles.templatesTitle}>
							<Sparkles size={13} />
							<span>Smart Clinical Templates:</span>
						</div>
						<div className={styles.templatesScroll}>
							<button
								type='button'
								className={styles.tplButton}
								onClick={() => applyTemplate("cardio")}
							>
								<Heart size={13} style={{ color: "#ef4444" }} />
								<span>Cardio / Palpitations Protocol</span>
							</button>
							<button
								type='button'
								className={styles.tplButton}
								onClick={() => applyTemplate("bp")}
							>
								<Activity size={13} style={{ color: "#3b82f6" }} />
								<span>Blood Pressure Protocol</span>
							</button>
							<button
								type='button'
								className={styles.tplButton}
								onClick={() => applyTemplate("glucose")}
							>
								<Droplet size={13} style={{ color: "#f59e0b" }} />
								<span>Glucose & Metabolic Advice</span>
							</button>
							<button
								type='button'
								className={styles.tplButton}
								onClick={() => applyTemplate("triage")}
							>
								<Zap size={13} style={{ color: "#ef4444" }} />
								<span>Emergency Triage Alert</span>
							</button>
						</div>
					</div>

					{/* Large, Spacious Clinical Advice Textarea */}
					<div className={styles.textAreaWrapper}>
						<textarea
							className={styles.chatInputLarge}
							rows={7}
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
									e.preventDefault();
									handleDoctorSend();
								}
							}}
							placeholder='Type or dictate clinical care instructions to Marcus Vance (Ctrl+Enter to send)...'
						/>
					</div>

					{/* Bottom Actions Bar */}
					<div className={styles.composerBottomBar}>
						<div className={styles.bottomBarLeft}>
							<button
								type='button'
								className={`${styles.voiceMicBtnLarge} ${
									isVoiceRecording ? styles.voiceMicRecording : ""
								}`}
								onClick={toggleVoiceInput}
								title={isVoiceRecording ? "Stop dictation" : "Dictate via Voice"}
							>
								{isVoiceRecording ? <MicOff size={15} /> : <Mic size={15} />}
								<span>{isVoiceRecording ? "Listening..." : "Dictate via Voice"}</span>
							</button>
							<span className={styles.shortcutHint}>Press Ctrl + Enter to dispatch</span>
						</div>

						<button
							type='button'
							className={styles.sendButtonLarge}
							onClick={() => handleDoctorSend()}
						>
							<Send size={15} />
							<span>Dispatch Advice & Care Plan</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
