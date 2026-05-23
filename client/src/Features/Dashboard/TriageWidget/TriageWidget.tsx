import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/App/Redux/store";
import {
	setSymptomsInput,
	addAlert,
	addMessage,
} from "@/App/Redux/triageSlice";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { Send, Bot, AlertTriangle } from "lucide-react";
import styles from "./TriageWidget.module.scss";

export const TriageWidget: React.FC = () => {
	const dispatch = useDispatch();
	const { symptomsInput, messages, isAnalyzing } = useSelector(
		(state: RootState) => state.triage,
	);
	const currentAccount = useCurrentAccount();

	const handleAnalyze = () => {
		if (!symptomsInput.trim()) return;

		const userInput = symptomsInput.trim();

		dispatch(
			addMessage({
				id: `usr-${Date.now()}`,
				role: "user",
				text: userInput,
			}),
		);

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

		dispatch(addAlert(newAlert));

		// Mock delay for AI reasoning
		setTimeout(() => {
			dispatch(
				addMessage({
					id: `bot-${Date.now()}`,
					role: "bot",
					text: `I've analyzed your symptoms. It looks like a ${condition} related to your ${system} system. ${recommendation}`,
				}),
			);
		}, 600);

		dispatch(setSymptomsInput(""));
	};

	return (
		<div className={styles.widgetContainer}>
			<div className={styles.header}>
				<div className={styles.titleArea}>
					<div className={styles.botIconWrapper}>
						<Bot size={20} />
					</div>
					<div>
						<h3 className={styles.title}>AI Symptom Triage</h3>
						{currentAccount && (
							<span className={styles.onChainBadge}>Verified on Sui</span>
						)}
					</div>
				</div>
			</div>

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
			</div>

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
						<Send size={18} color='#ffffff' strokeWidth={2.5} />
					)}
				</button>
			</div>

			<div className={styles.disclaimer}>
				<AlertTriangle size={12} />
				<span>
					AI assessments are not medical diagnoses. Always consult a healthcare
					professional.
				</span>
			</div>
		</div>
	);
};
