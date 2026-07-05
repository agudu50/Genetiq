import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/App/Redux/store";
import {
	setSymptomsInput,
	addAlert,
	addMessage,
	clearMessages,
	clearAlerts,
	setAnalyzing,
	setLanguage,
} from "@/App/Redux/triageSlice";
import { setCategory } from "@/App/Redux/categorySlice";
import { chatWithGemma, checkGemmaHealth, getTranslation } from "@/App/Services/GemmaService";
import type { GemmaLanguage } from "@/App/Services/GemmaService";
import { Send, Bot, AlertTriangle, RefreshCw, Globe, Wifi, WifiOff } from "lucide-react";
import { ChatMessageContent } from "@/Features/Dashboard/ChatMessageContent/ChatMessageContent";
import styles from "./TriageWidget.module.scss";

const LANGUAGES: { id: GemmaLanguage; label: string; flag: string }[] = [
	{ id: "english", label: "English", flag: "🇬🇧" },
	{ id: "twi", label: "Twi", flag: "🇬🇭" },
	{ id: "ga", label: "Ga", flag: "🇬🇭" },
	{ id: "ewe", label: "Ewe", flag: "🇬🇭" },
	{ id: "fante", label: "Fante", flag: "🇬🇭" },
];

export interface TriageWidgetProps {
	onClose?: () => void;
}

export const TriageWidget: React.FC<TriageWidgetProps> = ({ onClose }) => {
	const dispatch = useDispatch();
	const chatEndRef = useRef<HTMLDivElement>(null);
	const [gemmaOnline, setGemmaOnline] = useState(false);
	const [cpuFastMode, setCpuFastMode] = useState(false);
	const [showLangDropdown, setShowLangDropdown] = useState(false);
	const [waitSecs, setWaitSecs] = useState(0);

	const { symptomsInput, messages, isAnalyzing, selectedLanguage } = useSelector(
		(state: RootState) => state.triage,
	);

	// Check Gemma health on mount
	useEffect(() => {
		checkGemmaHealth().then((h) => {
			setGemmaOnline(h.available && h.modelLoaded);
			setCpuFastMode(h.device === "cpu" && h.modelLoaded);
		});
	}, []);

	// Auto-scroll to bottom of chat when new messages or typing state changes
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isAnalyzing]);

	useEffect(() => {
		if (!isAnalyzing) {
			setWaitSecs(0);
			return;
		}
		const id = window.setInterval(() => setWaitSecs((s) => s + 1), 1000);
		return () => clearInterval(id);
	}, [isAnalyzing]);

	// Ghana-focused quick symptom suggestions
	const quickSymptoms = [
		{ label: "🦟 Malaria symptoms", text: "I have fever, chills, headache, and body pain — I think it might be malaria" },
		{ label: "🤒 Typhoid fever", text: "I have stomach pain, high fever, and diarrhea for several days" },
		{ label: "😮‍💨 Breathing trouble", text: "I have difficulty breathing and persistent cough" },
		{ label: "🩸 Feeling weak", text: "I feel very weak, tired, and dizzy — my skin looks pale" },
	];

	const handleAnalyze = async (overrideText?: string) => {
		const userInput = (overrideText ?? symptomsInput).trim();
		if (!userInput) return;

		const recentUserMessages = messages
			.filter((m) => m.role === "user")
			.map((m) => m.text)
			.slice(-5);

		// Add User Message
		dispatch(
			addMessage({
				id: `usr-${Date.now()}`,
				role: "user",
				text: userInput,
			}),
		);

		// Start Analyzing
		dispatch(setAnalyzing(true));
		dispatch(setSymptomsInput(""));

		try {
			const result = await chatWithGemma({
				message: userInput,
				language: selectedLanguage,
				recentUserMessages,
			});

			// Add alert
			dispatch(
				addAlert({
					id: `alert-${Date.now()}`,
					system: result.system,
					condition: result.condition,
					description: result.message.substring(0, 150) + "...",
					urgency: result.urgency,
					requiresAction: result.urgency !== "Green",
				}),
			);

			// Add bot message
			dispatch(
				addMessage({
					id: `bot-${Date.now()}`,
					role: "bot",
					text: result.message,
				}),
			);

			// 🧬 Zoom the 3D Digital Twin to the relevant body system
			if (result.bodySystem && result.bodySystem !== "total") {
				dispatch(setCategory(result.bodySystem));
			}
		} catch (error) {
			dispatch(
				addMessage({
					id: `bot-err-${Date.now()}`,
					role: "bot",
					text: "I'm sorry, I encountered an error. Please try again or visit your nearest health facility.",
				}),
			);
		} finally {
			dispatch(setAnalyzing(false));
		}
	};

	const handleReset = () => {
		dispatch(clearMessages());
		dispatch(clearAlerts());
		// Reset 3D twin to default view
		dispatch(setCategory("total"));
	};

	const handleChipClick = (text: string) => {
		void handleAnalyze(text);
	};

	const handleLanguageChange = (lang: GemmaLanguage) => {
		dispatch(setLanguage(lang));
		setShowLangDropdown(false);
	};

	const currentLang = LANGUAGES.find((l) => l.id === selectedLanguage) || LANGUAGES[0];

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
						<h3 className={styles.title}>
							Gemma 4 Health Assistant
						</h3>
						<span className={styles.statusLabel}>
							{gemmaOnline ? (
								cpuFastMode ? (
									<><Wifi size={10} /> Fast triage (CPU)</>
								) : (
									<><Wifi size={10} /> Gemma 4 Local</>
								)
							) : (
								<><WifiOff size={10} /> Offline Mode</>
							)}
						</span>
					</div>
				</div>
				<div className={styles.headerActions}>
					{/* Language selector */}
					<div className={styles.langSelector}>
						<button
							className={styles.langButton}
							onClick={() => setShowLangDropdown(!showLangDropdown)}
							title="Select language"
						>
							<Globe size={13} />
							<span>{currentLang.flag} {currentLang.label}</span>
						</button>
						{showLangDropdown && (
							<div className={styles.langDropdown}>
								{LANGUAGES.map((lang) => (
									<button
										key={lang.id}
										className={`${styles.langOption} ${lang.id === selectedLanguage ? styles.langOptionActive : ""}`}
										onClick={() => handleLanguageChange(lang.id)}
									>
										<span>{lang.flag}</span>
										<span>{lang.label}</span>
									</button>
								))}
							</div>
						)}
					</div>
					<button 
						onClick={handleReset} 
						className={styles.resetButton}
						title="Clear Chat History"
					>
						<RefreshCw size={14} />
						<span>Reset</span>
					</button>
					{onClose && (
						<button
							type="button"
							className={styles.closeButton}
							onClick={onClose}
							aria-label="Close AI Assistant"
							title="Close"
						>
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								style={{ width: 14, height: 14 }}
							>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					)}
				</div>
			</div>

			{/* ── Chat Feed ── */}
			<div className={styles.chatArea}>
				{messages.length === 0 && !isAnalyzing && (
					<div className={styles.emptyState}>
						<p className={styles.emptyTitle}>How can I help today?</p>
						<p className={styles.emptyHint}>
							Describe your symptoms or tap a suggestion below.
						</p>
					</div>
				)}

				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`${styles.messageRow} ${
							msg.role === "bot" ? styles.messageRowBot : styles.messageRowUser
						}`}
					>
						<div
							className={
								msg.role === "bot" ? styles.botMessage : styles.userMessage
							}
						>
							{msg.role === "bot" && (
								<Bot size={16} className={styles.inlineBotIcon} />
							)}
							<div className={styles.messageBody}>
								{msg.role === "bot" ? (
									<ChatMessageContent text={msg.text} />
								) : (
									<p className={styles.userText}>{msg.text}</p>
								)}
							</div>
						</div>
					</div>
				))}

				{/* ── Bouncing Typing Dots when Analyzing ── */}
				{isAnalyzing && (
					<div className={`${styles.messageRow} ${styles.messageRowBot}`}>
						<div className={styles.botMessage}>
							<Bot size={16} className={styles.inlineBotIcon} />
							<div className={styles.messageBody}>
								<div className={styles.typingIndicator}>
									<span />
									<span />
									<span />
								</div>
								<p className={styles.waitHint}>
								{cpuFastMode || !gemmaOnline
									? "Analyzing your symptoms…"
									: waitSecs < 8
										? "Gemma is analyzing…"
										: `Gemma is analyzing… ${waitSecs}s (local CPU — can take 1–3 min)`}
							</p>
							</div>
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
					placeholder={
						selectedLanguage === "twi"
							? "Kyerɛ wo yare ahoɔ..."
							: selectedLanguage === "ga"
								? "Kɛ wo hewale shishi..."
								: "Describe your symptoms..."
					}
					className={styles.chatInput}
					disabled={isAnalyzing}
				/>
				<button
					onClick={() => handleAnalyze()}
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
					{getTranslation("This analysis is for information only", selectedLanguage)}.{" "}
					{selectedLanguage !== "english" && "AI assessments are not medical diagnoses. "}
					Always consult a healthcare professional.
				</span>
			</div>
		</div>
	);
};
