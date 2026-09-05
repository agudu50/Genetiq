import React, { useState, useEffect, useRef } from "react";
import {
	X,
	Send,
	CheckCircle2,
	AlertCircle,
	ShieldCheck,
	Stethoscope,
	RefreshCw,
	CheckSquare,
	Square,
} from "lucide-react";
import { toast } from "react-toastify";
import {
	ChatMessage,
	loadChatMessages,
	saveAndBroadcastChat,
	dispatchNewMessage,
	toggleMessageAction,
	subscribeToChatUpdates,
	getDefaultSeedMessages,
} from "@/App/Services/PatientDoctorChatSync";
import styles from "./PatientCareChatModal.module.scss";

interface PatientCareChatModalProps {
	isOpen: boolean;
	onClose: () => void;
	patientId?: string;
	patientName?: string;
	doctorName?: string;
	doctorRole?: string;
}

export const PatientCareChatModal: React.FC<PatientCareChatModalProps> = ({
	isOpen,
	onClose,
	patientId = "pt-101",
	patientName = "Marcus Vance",
	doctorName = "Dr. Sarah Jenkins, MD",
	doctorRole = "Attending Cardiologist",
}) => {
	const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatMessages(patientId));
	const [replyText, setReplyText] = useState("");
	const chatEndRef = useRef<HTMLDivElement>(null);

	// Sync messages in real-time across tabs / doctor portal updates
	useEffect(() => {
		const unsubscribe = subscribeToChatUpdates(patientId, (updated) => {
			setMessages(updated);
		});
		return () => unsubscribe();
	}, [patientId]);

	// Auto-scroll
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => {
				chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 100);
		}
	}, [isOpen, messages.length]);

	if (!isOpen) return null;

	// Patient sends reply
	const handleSendReply = (customText?: string) => {
		const text = (customText || replyText).trim();
		if (!text) {
			toast.error("Please enter a message before sending.");
			return;
		}

		dispatchNewMessage(patientId, {
			sender: "patient",
			senderName: patientName,
			senderRole: "Patient (App Dispatch)",
			text,
			status: "read",
		});

		if (!customText) setReplyText("");
		toast.success(`Message dispatched to ${doctorName}!`);
	};

	// Toggle action task checklist as patient in real-time
	const handleToggleAction = (msgId: string, actionId: string) => {
		toggleMessageAction(patientId, msgId, actionId);
		toast.success("Action marked as completed and synced with Dr. Jenkins.");
	};

	const handleReset = () => {
		if (window.confirm("Reset conversation thread?")) {
			const fresh = getDefaultSeedMessages(patientName, doctorName);
			saveAndBroadcastChat(patientId, fresh);
			toast.info("Chat thread reset.");
		}
	};

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
				{/* 1. Patient Modal Header */}
				<div className={styles.modalHeader}>
					<div className={styles.doctorInfo}>
						<div className={styles.doctorAvatar}>
							<Stethoscope size={18} />
						</div>
						<div className={styles.doctorDetails}>
							<div className={styles.doctorNameRow}>
								<h3>{doctorName}</h3>
								<span className={styles.roleTag}>{doctorRole}</span>
								<span className={styles.onlineBadge}>● Online</span>
							</div>
							<div className={styles.hospitalMeta}>
								Genetiq Clinical Center · Direct Care Advice & Triage Link
							</div>
						</div>
					</div>

					<div className={styles.headerActions}>
						<button
							type='button'
							className={styles.iconBtn}
							onClick={handleReset}
							title='Reset chat thread'
						>
							<RefreshCw size={14} />
						</button>
						<button
							type='button'
							className={styles.iconBtn}
							onClick={onClose}
							title='Close'
						>
							<X size={18} />
						</button>
					</div>
				</div>

				{/* 2. Chat Conversation Timeline */}
				<div className={styles.chatStream}>
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
										<div className={styles.docAvatar}>
											<Stethoscope size={14} />
										</div>
									) : (
										<div className={styles.patAvatar}>
											{patientName.split(" ").map((n) => n[0]).join("").slice(0, 2) || "PT"}
										</div>
									)}
								</div>

								<div className={styles.bubbleCol}>
									<div className={styles.metaRow}>
										<span className={styles.senderTitle}>{msg.senderName}</span>
										<span className={styles.timeTitle}>{msg.timestamp}</span>
										{msg.priority === "urgent" && (
											<span className={styles.urgentBadge}>
												<AlertCircle size={10} /> Doctor Directive
											</span>
										)}
									</div>

									<div
										className={`${styles.bubble} ${
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

										{/* Interactive Checklist inside Doctor Advice */}
										{msg.actions && msg.actions.length > 0 && (
											<div className={styles.actionsBox}>
												<div className={styles.actionsTitle}>
													<CheckSquare size={13} />
													<span>Doctor Prescribed Actions (Tap to complete):</span>
												</div>
												<div className={styles.actionsList}>
													{msg.actions.map((act) => (
														<div
															key={act.id}
															className={`${styles.actionItem} ${
																act.isCompleted ? styles.actionItemDone : ""
															}`}
															onClick={() => handleToggleAction(msg.id, act.id)}
														>
															{act.isCompleted ? (
																<CheckCircle2 size={16} className={styles.checkDone} />
															) : (
																<Square size={16} className={styles.checkTodo} />
															)}
															<span className={styles.actionText}>{act.label}</span>
															{act.isCompleted && act.completedAt && (
																<span className={styles.timeDone}>Done ({act.completedAt})</span>
															)}
														</div>
													))}
												</div>
											</div>
										)}
									</div>

									<div className={styles.statusRow}>
										{isDoc ? (
											<span className={styles.docStatus}>
												<ShieldCheck size={11} /> Verified Clinical Order
											</span>
										) : (
											<span className={styles.patStatus}>
												<CheckCircle2 size={11} /> Sent to {doctorName}
											</span>
										)}
									</div>
								</div>
							</div>
						);
					})}
					<div ref={chatEndRef} />
				</div>

				{/* 3. Patient Quick Reply Options */}
				<div className={styles.quickOptions}>
					<span className={styles.quickLabel}>Quick Reply:</span>
					<div className={styles.quickScroll}>
						<button
							type='button'
							className={styles.quickBtn}
							onClick={() =>
								handleSendReply(
									"I just drank 500ml of water and took my Metoprolol 25mg. Resting quietly now.",
								)
							}
						>
							"Drank 500ml water & took Metoprolol 25mg"
						</button>
						<button
							type='button'
							className={styles.quickBtn}
							onClick={() =>
								handleSendReply(
									"Resting HR is down to 76 bpm. Palpitations stopped and shortness of breath is resolved.",
								)
							}
						>
							"HR down to 76 bpm, feeling much better"
						</button>
						<button
							type='button'
							className={styles.quickBtn}
							onClick={() =>
								handleSendReply(
									"Retook blood pressure on left arm: 124/82 mmHg. Pulse 72 bpm.",
								)
							}
						>
							"Retook BP: 124/82 mmHg"
						</button>
					</div>
				</div>

				{/* 4. Patient Reply Input Box */}
				<div className={styles.patientComposer}>
					<div className={styles.inputRow}>
						<textarea
							className={styles.replyTextarea}
							rows={3}
							value={replyText}
							onChange={(e) => setReplyText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
									e.preventDefault();
									handleSendReply();
								}
							}}
							placeholder={`Reply back to ${doctorName} (Ctrl+Enter to send)...`}
						/>
						<button
							type='button'
							className={styles.btnSendReply}
							onClick={() => handleSendReply()}
						>
							<Send size={15} />
							<span>Reply to Doctor</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
