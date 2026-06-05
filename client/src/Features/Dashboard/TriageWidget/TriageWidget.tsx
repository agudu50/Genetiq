import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/App/Redux/store";
import {
	setSymptomsInput,
	appendSymptom,
	addAlert,
	addMessage,
	clearMessages,
	clearAlerts,
	setAnalyzing,
} from "@/App/Redux/triageSlice";
import { Send, Bot, AlertTriangle, RefreshCw } from "lucide-react";
import styles from "./TriageWidget.module.scss";

export const TriageWidget: React.FC = () => {
	const dispatch = useDispatch();
	const chatEndRef = useRef<HTMLDivElement>(null);

	const { symptomsInput, messages, isAnalyzing } = useSelector(
		(state: RootState) => state.triage,
	);

	// Auto-scroll to bottom of chat when new messages or typing state changes
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isAnalyzing]);

	const quickSymptoms = [
		{ label: "🫁 Breathless", text: "Shortness of breath" },
		{ label: "🫀 Chest Pain", text: "Chest pain and high heart rate" },
		{ label: "🧠 Migraine", text: "Severe headache and dizziness" },
		{ label: "🤢 Nausea", text: "Nausea and stomach ache" },
	];

	const handleAnalyze = () => {
		if (!symptomsInput.trim()) return;

		const userInput = symptomsInput.trim();

		// Add User Message
		dispatch(
			addMessage({
				id: `usr-${Date.now()}`,
				role: "user",
				text: userInput,
			}),
		);

		// Start Analyzing Spinner / Typing dots
		dispatch(setAnalyzing(true));
		dispatch(setSymptomsInput(""));

		let system = "General";
		let condition = "Symptom Analysis Complete";
		let urgency: "Green" | "Yellow" | "Red" = "Green";
		let requiresAction = false;
		let recommendation =
			"I recommend monitoring your symptoms. If they persist or worsen, please consult a healthcare professional.";

		const lowerInput = userInput.toLowerCase();
		if (
			lowerInput.includes("chest") ||
			lowerInput.includes("heart") ||
			lowerInput.includes("pain")
		) {
			system = "Cardiovascular";
			condition = "Elevated Heart Risk Detected";
			urgency = "Red";
			requiresAction = true;
			recommendation =
				"Given your symptoms, please seek immediate medical attention. Cardiovascular symptoms should always be evaluated by a doctor.";
		} else if (
			lowerInput.includes("breath") ||
			lowerInput.includes("cough") ||
			lowerInput.includes("wheez")
		) {
			system = "Respiratory";
			condition = "Potential Airway Restriction";
			urgency = "Yellow";
			requiresAction = true;
			recommendation =
				"Try to rest in a well-ventilated area and stay hydrated. Consider using an inhaler if prescribed. If breathing difficulties worsen, seek urgent care.";
		} else if (
			lowerInput.includes("head") ||
			lowerInput.includes("migraine") ||
			lowerInput.includes("dizz")
		) {
			system = "Neurological";
			condition = "Neurological Strain";
			urgency = "Yellow";
			requiresAction = true;
			recommendation =
				"Rest in a quiet, dark room and stay hydrated. Monitor for any cognitive changes or severe pain.";
		} else if (
			lowerInput.includes("stomach") ||
			lowerInput.includes("nausea") ||
			lowerInput.includes("belly")
		) {
			system = "Gastrointestinal";
			condition = "Digestive Irregularity";
			urgency = "Green";
			requiresAction = false;
			recommendation =
				"Stick to bland foods and drink plenty of fluids. Rest and avoid strenuous activity.";
		}

		const newAlert = {
			id: `alert-${Date.now()}`,
			system,
			condition,
			description: `Based on your reported symptoms, our AI models indicate ${condition}. On-chain medical history has been cross-referenced.`,
			urgency,
			requiresAction,
		};

		// Mock delay for AI reasoning
		setTimeout(() => {
			dispatch(addAlert(newAlert));
			dispatch(
				addMessage({
					id: `bot-${Date.now()}`,
					role: "bot",
					text: `I've analyzed your symptoms. It looks like a ${condition} related to your ${system} system. ${recommendation}`,
				}),
			);
			dispatch(setAnalyzing(false));
		}, 1200);
	};

	const handleReset = () => {
		dispatch(clearMessages());
		dispatch(clearAlerts());
	};

	const handleChipClick = (text: string) => {
		dispatch(appendSymptom(text));
	};

	return (
		<div className={styles.widgetContainer}>
			{/* ── Header ── */}
			<div className={styles.header}>
				<div className={styles.titleArea}>
					<div className={styles.botIconWrapper}>
						<Bot size={20} />
						<div className={styles.onlineDot} />
					</div>
					<div>
						<h3 className={styles.title}>AI Symptom Triage</h3>
						<span className={styles.statusLabel}>AI Physician Assistant</span>
					</div>
				</div>
				<button 
					onClick={handleReset} 
					className={styles.resetButton}
					title="Clear Chat History"
				>
					<RefreshCw size={14} />
					<span>Reset</span>
				</button>
			</div>

			{/* ── Chat Feed ── */}
			<div className={styles.chatArea}>
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={
							msg.role === "bot" ? styles.botMessage : styles.userMessage
						}
					>
						{msg.role === "bot" && (
							<Bot size={16} className={styles.inlineBotIcon} />
						)}
						<p>{msg.text}</p>
					</div>
				))}

				{/* ── Bouncing Typing Dots when Analyzing ── */}
				{isAnalyzing && (
					<div className={styles.botMessage}>
						<Bot size={16} className={styles.inlineBotIcon} />
						<div className={styles.typingIndicator}>
							<span />
							<span />
							<span />
						</div>
					</div>
				)}
				<div ref={chatEndRef} />
			</div>

			{/* ── Quick Symptom Suggestions ── */}
			<div className={styles.suggestionGrid}>
				{quickSymptoms.map((chip, idx) => (
					<button
						key={idx}
						onClick={() => handleChipClick(chip.text)}
						className={styles.suggestionChip}
					>
						{chip.label}
					</button>
				))}
			</div>

			{/* ── Chat Input ── */}
			<div className={styles.chatInputWrapper}>
				<input
					type='text'
					value={symptomsInput}
					onChange={(e) => dispatch(setSymptomsInput(e.target.value))}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleAnalyze();
					}}
					placeholder='Type your symptoms...'
					className={styles.chatInput}
					disabled={isAnalyzing}
				/>
				<button
					onClick={handleAnalyze}
					disabled={isAnalyzing || !symptomsInput.trim()}
					className={styles.sendButton}
				>
					{isAnalyzing ? (
						<div className={styles.loader} />
					) : (
						<Send size={16} color='#ffffff' strokeWidth={2.5} />
					)}
				</button>
			</div>

			{/* ── Disclaimer ── */}
			<div className={styles.disclaimer}>
				<AlertTriangle size={12} className={styles.warningIcon} />
				<span>
					AI assessments are not medical diagnoses. Always consult a healthcare
					professional.
				</span>
			</div>
		</div>
	);
};
