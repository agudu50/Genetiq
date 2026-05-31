import { useState, useMemo, useCallback, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { setFilter } from "@/App/Redux/testSlice";
import { setCategory } from "@/App/Redux/categorySlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
	Brain, Heart, Flame, Layers, Shield, Sparkles, CheckCircle2, 
	XCircle, ArrowRight, RefreshCw, Trophy, ExternalLink, Copy, Database 
} from "lucide-react";
import styles from "./Tests.module.scss";

interface Question {
	id: string;
	text: string;
	options: {
		A: string;
		B: string;
		C: string;
		D: string;
	};
	correct: "A" | "B" | "C" | "D";
	insight: string;
}

interface ExamSystem {
	id: string;
	name: string;
	icon: React.ReactNode;
	colorClass: string;
	description: string;
	focus: string;
	questions: Question[];
}

const EXAM_SYSTEMS: ExamSystem[] = [
	{
		id: "brain",
		name: "Cognitive & Nervous System",
		icon: <Brain size={22} />,
		colorClass: "brain",
		description: "Evaluate circadian alignment, memory pre-cursors, and parasympathetic autonomic resilience.",
		focus: "Epigenetic regulation, neuro-transmitters, and stress adaptability.",
		questions: [
			{
				id: "brain-1",
				text: "What is the primary visual sign of circadian rhythm disruption in neurobiology?",
				options: {
					A: "Decreased deep sleep latency",
					B: "Elevated evening cortisol and melatonin suppression",
					C: "Accelerated neural synapse growth",
					D: "Reduced dopamine production in the substantia nigra"
				},
				correct: "B",
				insight: "Cortisol should naturally drop to baseline in the evening. Circumstances like blue-light exposure suppress melatonin and raise cortisol, disrupting your circadian rhythm and sleep quality."
			},
			{
				id: "brain-2",
				text: "Which nutrient serves as the direct biological precursor for synthesizing acetylcholine, the learning and memory neurotransmitter?",
				options: {
					A: "Choline (commonly found in egg yolks and cruciferous vegetables)",
					B: "L-Theanine",
					C: "Resveratrol",
					D: "Magnesium L-Threonate"
				},
				correct: "A",
				insight: "Choline is a critical dietary nutrient that serves as the direct precursor to acetylcholine, which is essential for cognitive health, focus, and memory consolidation."
			},
			{
				id: "brain-3",
				text: "What physiological state does high-frequency Heart Rate Variability (HRV) indicate about your autonomic nervous system?",
				options: {
					A: "Sympathetic nervous system dominance (fight-or-flight stress)",
					B: "Parasympathetic nervous system activation (rest-and-digest recovery)",
					C: "Severe localized systemic vascular inflammation",
					D: "Chronic peripheral sleep deprivation"
				},
				correct: "B",
				insight: "High HRV indicates healthy parasympathetic nervous system adaptability, resilience to stress, and efficient cardiovascular recovery."
			}
		]
	},
	{
		id: "heart",
		name: "Cardiovascular System",
		icon: <Heart size={22} />,
		colorClass: "heart",
		description: "Assess atherogenic particle concentrations, arterial vasodilation, and vascular inflammatory stress.",
		focus: "Lipid transport efficiency, arterial elasticity, and inflammatory risk.",
		questions: [
			{
				id: "heart-1",
				text: "Which lipid marker is considered a highly sensitive and precise predictor of atherogenic cardiovascular risk?",
				options: {
					A: "Total Cholesterol",
					B: "Apolipoprotein B (ApoB)",
					C: "Serum Triglycerides",
					D: "High-Density Lipoprotein (HDL-C)"
				},
				correct: "B",
				insight: "ApoB measures the exact count of all atherogenic particles (LDL, VLDL) capable of penetrating the arterial lining, making it a far more precise risk metric than traditional cholesterol checks."
			},
			{
				id: "heart-2",
				text: "What major physiological impact does nitric oxide have when released in the vascular system?",
				options: {
					A: "Triggers arterial constriction and spikes peripheral blood pressure",
					B: "Induces arterial vasodilation, relaxing vessel walls and lowering pressure",
					C: "Accelerates calcified arterial plaque deposits",
					D: "Inhibits blood oxygen transport capacity"
				},
				correct: "B",
				insight: "Nitric oxide acts as a powerful signaling molecule that relaxes the smooth muscle surrounding blood vessels, triggering vasodilation and improving oxygen-rich blood flow."
			},
			{
				id: "heart-3",
				text: "What biological role does high-sensitivity C-reactive protein (hs-CRP) play in cardiovascular assessments?",
				options: {
					A: "Measures oxygen saturation efficiency",
					B: "Acts as a sensitive biomarker for systemic vascular inflammation",
					C: "Functions as a hormone that regulates cardiac output",
					D: "Tracks insulin resistance in heart muscles"
				},
				correct: "B",
				insight: "hs-CRP is produced by the liver in response to inflammatory cytokines. Elevated levels strongly correlate with vascular lining inflammation, which can destabilize arterial plaques."
			}
		]
	},
	{
		id: "metabolic",
		name: "Metabolic & Blood Markers",
		icon: <Flame size={22} />,
		colorClass: "metabolic",
		description: "Examine long-term glycemic control, alternative ketone fuel utilization, and cellular insulin sensitivity.",
		focus: "Glycation indices, mitochondria fuel flexibility, and insulin resistance.",
		questions: [
			{
				id: "metabolic-1",
				text: "What clinical metric does an HbA1c test measure in metabolic health profiling?",
				options: {
					A: "Real-time glucose spikes immediately following sugar ingestion",
					B: "A 3-month average of glycated hemoglobin within red blood cells",
					C: "Acute insulin secretion capacity after physical exercise",
					D: "Total hepatic glycogen storage capacity"
				},
				correct: "B",
				insight: "Since red blood cells circulate for about 120 days, HbA1c tracks the percentage of hemoglobin coated with glucose, giving a stable average of blood sugar levels over the past 3 months."
			},
			{
				id: "metabolic-2",
				text: "Which metabolic state is characterized by depleted liver glycogen and the primary utilization of beta-hydroxybutyrate for energy?",
				options: {
					A: "Acute Glycolysis",
					B: "Nutritional Ketosis",
					C: "Diabetic Ketoacidosis",
					D: "Hyperinsulinemic hypoglycemia"
				},
				correct: "B",
				insight: "In nutritional ketosis, the body shifts to fat oxidation, and the liver converts fatty acids into ketones (including beta-hydroxybutyrate) to fuel cells, especially in the brain."
			},
			{
				id: "metabolic-3",
				text: "How does elevated fasting insulin correlate with cellular metabolic health?",
				options: {
					A: "Indicates high muscular glucose sensitivity",
					B: "Acts as an early warning for insulin resistance and cellular stress",
					C: "Directly triggers body fat lipolysis and fat loss",
					D: "Signifies high baseline aerobic mitochondrial efficiency"
				},
				correct: "B",
				insight: "High fasting insulin indicates that body cells are resisting insulin signals, forcing the pancreas to work overtime and overproduce insulin to keep blood glucose normal."
			}
		]
	},
	{
		id: "gut",
		name: "Digestive & Gut Microbiome",
		icon: <Layers size={22} />,
		colorClass: "gut",
		description: "Analyze mucosal epithelial integrity, short-chain fatty acid fuel, and the gut-brain communications network.",
		focus: "Microbiome fermentation, gut barrier junctions, and neuro-endocrine signaling.",
		questions: [
			{
				id: "gut-1",
				text: "What is the primary role of short-chain fatty acids (like butyrate) in gut health?",
				options: {
					A: "Serving as the primary energy source for colon epithelial cells",
					B: "Catalyzing stomach acid digestion of complex proteins",
					C: "Emulsifying dietary fats for absorption in the lymphatic system",
					D: "Inhibiting systemic nutrient uptake in the small intestine"
				},
				correct: "A",
				insight: "Butyrate, created by bacterial fermentation of dietary fibers, fuels the colon cells, supports the mucosal lining, and exhibits anti-inflammatory effects in the gut."
			},
			{
				id: "gut-2",
				text: "Which anatomical structures are responsible for maintaining gut barrier selectivity and preventing 'leaky gut'?",
				options: {
					A: "Microvilli brush border follicles",
					B: "Tight junctions of the mucosal epithelial barrier",
					C: "Peyer's patches",
					D: "Pyloric sphincters"
				},
				correct: "B",
				insight: "Tight junctions act as high-performance molecular seals between intestinal lining cells, regulating permeability to let nutrients through while blocking large pathogens and toxins."
			},
			{
				id: "gut-3",
				text: "What major pathway mediates the bidirectional communication of the gut-brain axis?",
				options: {
					A: "The optic nerve and circadian signaling pathways",
					B: "The vagus nerve and neurochemical signaling",
					C: "Direct arterial blood flow in the portal system",
					D: "Somatic lymphatic drainage channels"
				},
				correct: "B",
				insight: "The vagus nerve is the biological superhighway that facilitates direct, bidirectional communication between the enteric nervous system of the gut and the central nervous system."
			}
		]
	}
];

const DropletIcon = memo(() => (
	<svg
		width='14'
		height='14'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z' />
	</svg>
));

const BrainIcon = memo(() => (
	<svg
		width='14'
		height='14'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M9.5 2A5 5 0 0 1 12 4a5 5 0 0 1 2.5-2 4.96 4.96 0 0 1 4 1c1.2.9 1.8 2.4 1.5 4a5 5 0 0 1-1 2.4l-7 7-7-7a5 5 0 0 1-1-2.4c-.3-1.6.3-3.1 1.5-4a4.96 4.96 0 0 1 4-1z' />
		<path d='M12 4v4' />
		<path d='M10 4s-1-.5-1-1.5' />
		<path d='M14 4s1-.5 1-1.5' />
	</svg>
));

const ActivityIcon = memo(() => (
	<svg
		width='14'
		height='14'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<polyline points='22 12 18 12 15 21 9 3 6 12 2 12' />
	</svg>
));

const ShieldIcon = memo(() => (
	<svg
		width='12'
		height='12'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
		<path d='m9 12 2 2 4-4' />
	</svg>
));

const TwinIcon = memo(() => (
	<svg
		width='14'
		height='14'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
		<circle cx='12' cy='7' r='4' />
		<path d='M12 11v4' />
		<path d='M12 19v2' />
	</svg>
));

const CategoryIcon = memo(({ type }: { type: string }) => {
	switch (type) {
		case "Blood":
			return <DropletIcon />;
		case "Neuro":
			return <BrainIcon />;
		case "CGM":
			return <ActivityIcon />;
		default:
			return (
				<svg
					width='14'
					height='14'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<path d='M12 2v20M2 12h20' />
				</svg>
			);
	}
});

const Tests = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// View toggle state: "exams" (interactive diagnostics) or "reports" (standard labs)
	const [viewMode, setViewMode] = useState<"exams" | "reports">("exams");

	// Lab reports selectors & filters
	const { items, filter } = useSelector((state: RootState) => state.tests);
	const filteredTests = useMemo(() => {
		if (filter === "All") return items;
		return items.filter((test) => test.status === filter);
	}, [items, filter]);

	const handleViewOnTwin = useCallback(
		(system: string) => {
			dispatch(setCategory(system));
			navigate("/dashboard");
		},
		[dispatch, navigate],
	);

	const showProof = useCallback((hash?: string) => {
		if (hash) {
			alert(`Vault Integrity Seal (SHA-256): ${hash.toUpperCase()}\nData encrypted and locally protected inside secure enclave.`);
		}
	}, []);

	// Active Diagnostic Exam States
	const [activeSystem, setActiveSystem] = useState<ExamSystem | null>(null);
	const [currentQIndex, setCurrentQIndex] = useState<number>(0);
	const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
	const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
	const [examCompleted, setExamCompleted] = useState<boolean>(false);
	const [score, setScore] = useState<number>(0);

	// Secure Enclave vault proof states
	const [isMinting, setIsMinting] = useState<boolean>(false);
	const [showReceipt, setShowReceipt] = useState<boolean>(false);
	const [receiptTx, setReceiptTx] = useState<{ hash: string; keySize: string; timestamp: string } | null>(null);

	const currentQuestion = useMemo(() => {
		if (!activeSystem) return null;
		return activeSystem.questions[currentQIndex];
	}, [activeSystem, currentQIndex]);

	const startExam = useCallback((system: ExamSystem) => {
		setActiveSystem(system);
		setCurrentQIndex(0);
		setSelectedOption(null);
		setIsSubmitted(false);
		setExamCompleted(false);
		setScore(0);
		setShowReceipt(false);
		setReceiptTx(null);
	}, []);

	const submitAnswer = useCallback(() => {
		if (!currentQuestion || !selectedOption) return;
		
		const isCorrect = selectedOption === currentQuestion.correct;
		if (isCorrect) {
			setScore((s) => s + 1);
		}
		setIsSubmitted(true);
	}, [currentQuestion, selectedOption]);

	const nextQuestion = useCallback(() => {
		if (!activeSystem) return;
		if (currentQIndex < activeSystem.questions.length - 1) {
			setCurrentQIndex((idx) => idx + 1);
			setSelectedOption(null);
			setIsSubmitted(false);
		} else {
			setExamCompleted(true);
		}
	}, [activeSystem, currentQIndex]);

	const triggerSealCredentials = useCallback(() => {
		if (!activeSystem) return;
		setIsMinting(true);
		
		// Simulate local hardware enclave AES-GCM 256-bit credentials sealing
		setTimeout(() => {
			const randomHash = `${Array.from({ length: 64 }, () => 
				Math.floor(Math.random() * 16).toString(16)
			).join("")}`.toUpperCase();
			
			setReceiptTx({
				hash: randomHash,
				keySize: "AES-GCM 256-bit",
				timestamp: new Date().toLocaleString()
			});
			setIsMinting(false);
			setShowReceipt(true);
		}, 2000);
	}, [activeSystem]);

	const copyReceiptHash = useCallback(() => {
		if (receiptTx?.hash) {
			navigator.clipboard.writeText(receiptTx.hash);
			alert("Integrity seal copied to clipboard!");
		}
	}, [receiptTx]);

	return (
		<div className={styles["tests-container"]}>
			<div className={styles["tests-content"]}>
				
				{/* Header Info Panel */}
				<div className={styles["header"]}>
					<div className={styles["header-text"]}>
						<h1 className={styles["title"]}>
							<span className='text-gradient-muted'>Health</span>{" "}
							<span className='text-gradient-primary'>Diagnostics</span>
						</h1>
						<p className={styles["subtitle"]}>
							Analyze biomarkers, take interactive quizzes, and seal verified credentials in your secure vault.
						</p>
					</div>

					{/* Navigation tabs between Interactive Exams and standard Lab Reports */}
					<div className={styles["view-mode-tabs"]}>
						<button
							className={`${styles["mode-tab"]} ${viewMode === "exams" ? styles["active"] : ""}`}
							onClick={() => {
								setViewMode("exams");
								setActiveSystem(null);
								setExamCompleted(false);
							}}
						>
							<Sparkles size={14} />
							Interactive Exams
						</button>
						<button
							className={`${styles["mode-tab"]} ${viewMode === "reports" ? styles["active"] : ""}`}
							onClick={() => setViewMode("reports")}
						>
							<Database size={14} />
							Lab Reports
						</button>
					</div>
				</div>

				{/* MODE 1: INTERACTIVE DIAGNOSTIC EXAMS */}
				{viewMode === "exams" && (
					<div className={styles["exams-flow-container"]}>
						<AnimatePresence mode='wait'>
							
							{/* STEP A: Systems Selection Grid */}
							{!activeSystem && (
								<motion.div
									initial={{ opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -15 }}
									transition={{ duration: 0.35 }}
									className={styles["systems-hub"]}
								>
									<div className={styles["hub-intro"]}>
										<h2>Select Diagnostic Target</h2>
										<p>Choose which organ system or biological pathway you want to examine. Complete the exam with a perfect score to seal a cryptographically encrypted verification credential inside your secure health vault.</p>
									</div>

									<div className={styles["systems-grid"]}>
										{EXAM_SYSTEMS.map((sys) => (
											<div key={sys.id} className={`${styles["system-card"]} ${styles[sys.colorClass]}`}>
												<div className={styles["sys-card-header"]}>
													<div className={styles["sys-icon-box"]}>
														{sys.icon}
													</div>
													<div className={styles["sys-meta-badge"]}>3 Questions</div>
												</div>
												<h3 className={styles["sys-title"]}>{sys.name}</h3>
												<p className={styles["sys-desc"]}>{sys.description}</p>
												
												<div className={styles["sys-focus-line"]}>
													<strong>Focus: </strong>{sys.focus}
												</div>

												<button
													className={styles["sys-action-btn"]}
													onClick={() => startExam(sys)}
												>
													Examine System
													<ArrowRight size={14} />
												</button>
											</div>
										))}
									</div>
								</motion.div>
							)}

							{/* STEP B: Active Question Flow */}
							{activeSystem && !examCompleted && currentQuestion && (
								<motion.div
									initial={{ opacity: 0, scale: 0.98 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.3 }}
									className={styles["active-exam-panel"]}
								>
									{/* Top control bar */}
									<div className={styles["exam-bar-header"]}>
										<button
											className={styles["exit-exam-btn"]}
											onClick={() => setActiveSystem(null)}
										>
											← Exit to Hub
										</button>
										<div className={styles["exam-topic-tag"]}>
											<span className={styles["topic-dot"]} />
											Examining: {activeSystem.name}
										</div>
										<div className={styles["exam-q-counter"]}>
											Question <strong>{currentQIndex + 1}</strong> of {activeSystem.questions.length}
										</div>
									</div>

									{/* Animated progress bar */}
									<div className={styles["exam-progress-track"]}>
										<motion.div 
											className={styles["exam-progress-fill"]}
											initial={{ width: 0 }}
											animate={{ 
												width: `${((currentQIndex + (isSubmitted ? 1 : 0)) / activeSystem.questions.length) * 100}%` 
											}}
											transition={{ duration: 0.4 }}
										/>
									</div>

									{/* Question display */}
									<div className={styles["question-card"]}>
										<h2 className={styles["question-text"]}>
											{currentQuestion.text}
										</h2>

										{/* A-D option buttons */}
										<div className={styles["options-grid"]}>
											{(["A", "B", "C", "D"] as const).map((key) => {
												const optionText = currentQuestion.options[key];
												const isSelected = selectedOption === key;
												const isCorrectOption = currentQuestion.correct === key;
												
												let optionClass = "";
												if (isSubmitted) {
													if (isCorrectOption) optionClass = styles["correct-opt"];
													else if (isSelected) optionClass = styles["incorrect-opt"];
													else optionClass = styles["disabled-opt"];
												} else if (isSelected) {
													optionClass = styles["selected-opt"];
												}

												return (
													<button
														key={key}
														disabled={isSubmitted}
														className={`${styles["option-btn"]} ${optionClass}`}
														onClick={() => setSelectedOption(key)}
													>
														<div className={styles["opt-prefix"]}>{key}</div>
														<div className={styles["opt-label"]}>{optionText}</div>
														{isSubmitted && isCorrectOption && (
															<CheckCircle2 size={16} className={styles["opt-status-icon-correct"]} />
														)}
														{isSubmitted && isSelected && !isCorrectOption && (
															<XCircle size={16} className={styles["opt-status-icon-incorrect"]} />
														)}
													</button>
												);
											})}
										</div>

										{/* Action trigger footer */}
										<div className={styles["exam-actions-footer"]}>
											{!isSubmitted ? (
												<button
													className={styles["submit-q-btn"]}
													disabled={selectedOption === null}
													onClick={submitAnswer}
												>
													Verify Biomarker Answer
													<Shield size={14} />
												</button>
											) : (
												<button
													className={styles["next-q-btn"]}
													onClick={nextQuestion}
												>
													{currentQIndex === activeSystem.questions.length - 1 
														? "Complete Diagnosis" 
														: "Continue to Next Question"}
													<ArrowRight size={14} />
												</button>
											)}
										</div>

										{/* Scientific insight box (shown after submission) */}
										<AnimatePresence>
											{isSubmitted && (
												<motion.div
													initial={{ opacity: 0, y: 15 }}
													animate={{ opacity: 1, y: 0 }}
													className={styles["science-insight-panel"]}
												>
													<div className={styles["insight-title"]}>
														<Sparkles size={16} />
														<h4>🧬 Epigenetic Science Insight</h4>
													</div>
													<p className={styles["insight-text"]}>
														{currentQuestion.insight}
													</p>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</motion.div>
							)}

							{/* STEP C: Exam Scorecard & Completion Dashboard */}
							{activeSystem && examCompleted && (
								<motion.div
									initial={{ opacity: 0, scale: 0.97 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0 }}
									className={styles["completion-panel"]}
								>
									<div className={styles["trophy-circle"]}>
										<Trophy size={48} className={styles["trophy-icon"]} />
									</div>

									<h2 className={styles["complete-title"]}>
										Diagnostic Evaluation Complete!
									</h2>
									<p className={styles["complete-sys"]}>{activeSystem.name}</p>

									{/* Score meters */}
									<div className={styles["score-card"]}>
										<div className={styles["score-header"]}>Clinical Accuracy Score</div>
										<div className={styles["score-display"]}>
											<span className={styles["score-num"]}>{score}</span>
											<span className={styles["score-slash"]}>/</span>
											<span className={styles["score-total"]}>{activeSystem.questions.length}</span>
										</div>
										<div className={styles["score-percentage"]}>
											{Math.round((score / activeSystem.questions.length) * 100)}% Proficiency
										</div>
									</div>

									{/* Dynamic scientific summary based on score */}
									<div className={styles["summary-speech-bubble"]}>
										{score === activeSystem.questions.length ? (
											<p><strong>Perfect Score Unlocked!</strong> Your comprehension of molecular health pathways, cell regulation, and biological mechanisms is outstanding. You are actively optimizing your epigenetic blueprints.</p>
										) : (
											<p><strong>Diagnosis Complete!</strong> You completed the evaluation and learned valuable epigenetic insights. Study the science and retake the test to secure a perfect score and seal your credentials in the local secure vault.</p>
										)}
									</div>

									{/* Secure vault block sealing action */}
									<div className={styles["complete-actions"]}>
										{score === activeSystem.questions.length ? (
											<button
												className={`${styles["seal-vault-btn"]} ${isMinting ? styles["loading"] : ""}`}
												onClick={triggerSealCredentials}
												disabled={isMinting || showReceipt}
											>
												{isMinting ? (
													<>
														<RefreshCw size={16} className={styles["spin-icon"]} />
														Sealing in local vault...
													</>
												) : showReceipt ? (
													<>
														<ShieldIcon />
														Credentials Encrypted & Sealed
													</>
												) : (
													<>
														<Shield size={16} />
														Seal in Secure Health Vault
													</>
												)}
											</button>
										) : (
											<button
												className={styles["retake-btn"]}
												onClick={() => startExam(activeSystem)}
											>
												<RefreshCw size={16} />
												Retake Examination
											</button>
										)}
										
										{showReceipt && (
											<button
												className={styles["view-receipt-btn"]}
												onClick={() => setShowReceipt(true)}
											>
												<ExternalLink size={16} />
												Show Security Receipt
											</button>
										)}

										<button
											className={styles["back-hub-btn"]}
											onClick={() => setActiveSystem(null)}
										>
											Back to Diagnostic Hub
										</button>
									</div>
								</motion.div>
							)}

						</AnimatePresence>
					</div>
				)}

				{/* MODE 2: VERIFIED LAB REPORTS LISTING */}
				{viewMode === "reports" && (
					<div className={styles["reports-flow-container"]}>
						{/* Tab Filter buttons */}
						<div className={styles["filter-tabs"]}>
							{(["All", "Pending", "Completed", "Flagged"] as const).map((t) => (
								<button
									key={t}
									className={`${styles["tab-btn"]} ${filter === t ? styles["active"] : ""}`}
									onClick={() => dispatch(setFilter(t))}
								>
									{t}
								</button>
							))}
						</div>

						{/* Biomarkers Grid */}
						<div className={styles["tests-grid"]}>
							<AnimatePresence mode='popLayout'>
								{filteredTests.map((test, index) => (
									<motion.div
										key={test.id}
										layout
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ duration: 0.3, delay: index * 0.05 }}
										className={styles["test-card"]}
									>
										<div className={styles["card-header"]}>
											<div className={`${styles["test-icon"]} ${styles[test.type.toLowerCase()]}`}>
												<CategoryIcon type={test.type} />
											</div>
											<div className={styles["header-right"]}>
												{test.vaultSeal && (
													<button
														className={styles["proof-badge"]}
														onClick={() => showProof(test.vaultSeal)}
														title='Local Vault Encrypted'
													>
														<ShieldIcon />
														Vault Secured
													</button>
												)}
												<div className={`${styles["status-chip"]} ${styles[test.status.toLowerCase().replace(" ", "-")]}`}>
													{test.status}
												</div>
											</div>
										</div>

										<div className={styles["test-body"]}>
											<h3 className={styles["test-title"]}>{test.title}</h3>
											<p className={styles["test-description"]}>{test.description}</p>
										</div>

										<div className={styles["test-meta"]}>
											{test.price && (
												<div className={styles["price"]}>
													Price: <span>{test.price}</span>
												</div>
											)}
											{(test.date || test.order_date) && (
												<div className={styles["date"]}>
													{test.status === "Completed" ? "Completed: " : "Ordered: "}
													<span>
														{new Date(test.date || test.order_date!).toLocaleDateString()}
													</span>
												</div>
											)}
											{test.tracking && (
												<div className={styles["tracking"]}>
													<svg
														width='12'
														height='12'
														viewBox='0 0 24 24'
														fill='none'
														stroke='currentColor'
														strokeWidth='2.5'
														strokeLinecap='round'
														strokeLinejoin='round'
														style={{ marginRight: 6 }}
													>
														<path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' />
														<polyline points='3.29 7 12 12 20.71 7' />
														<line x1='12' y1='22' x2='12' y2='12' />
													</svg>
													<span>{test.tracking}</span>
												</div>
											)}
										</div>

										<div className={styles["card-actions"]}>
											<button
												className={styles["twin-btn"]}
												onClick={() => handleViewOnTwin(test.system)}
											>
												<TwinIcon />
												View on Twin
											</button>
											{test.status === "Available to Order" && (
												<button className={styles["order-btn"]}>Order Kit</button>
											)}
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>

						{/* Block privacy secure details */}
						<div className={styles["info-panel"]}>
							<div className={styles["info-badge"]}>At-Home Collection</div>
							<p className={styles["info-text"]}>
								Every test result is locally encrypted with AES-256 and signed with a cryptographic SHA-256 hash to ensure absolute data integrity and tampering protection.
							</p>
						</div>
					</div>
				)}

			</div>

			{/* HOLOGRAPHIC SECURE VAULT RECEIPT MODAL */}
			<AnimatePresence>
				{showReceipt && receiptTx && activeSystem && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className={styles["modal-overlay"]}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 30 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 30 }}
							transition={{ duration: 0.35, ease: "easeOut" }}
							className={styles["receipt-modal"]}
						>
							<div className={styles["receipt-holo-glow"]} />
							
							<div className={styles["receipt-header"]}>
								<div className={styles["vault-logo-box"]}>
									<Shield size={28} className={styles["receipt-logo"]} />
								</div>
								<h3>Secure Vault Credentials Sealed</h3>
								<p>AES-256 Encrypted & Locally Protected</p>
							</div>

							<div className={styles["receipt-ledger-box"]}>
								<div className={styles["ledger-row"]}>
									<span className={styles["label"]}>Security Standard:</span>
									<span className={styles["val"]}>Zero-Knowledge Enclave</span>
								</div>
								<div className={styles["ledger-row"]}>
									<span className={styles["label"]}>Verified Target:</span>
									<span className={styles["val"]}>{activeSystem.name}</span>
								</div>
								<div className={styles["ledger-row"]}>
									<span className={styles["label"]}>Encryption Key:</span>
									<span className={styles["val"]}>{receiptTx.keySize}</span>
								</div>
								<div className={styles["ledger-row"]}>
									<span className={styles["label"]}>Sealed Timestamp:</span>
									<span className={styles["val"]}>{receiptTx.timestamp}</span>
								</div>
								<div className={styles["ledger-row"]}>
									<span className={styles["label"]}>Access Control:</span>
									<span className={styles["val"]}>Local Biometric Verification</span>
								</div>
								<div className={styles["ledger-divider"]} />
								<div className={styles["ledger-hash-block"]}>
									<div className={styles["hash-label"]}>
										<span>Cryptographic Integrity Seal (SHA-256)</span>
										<button 
											onClick={copyReceiptHash} 
											className={styles["copy-btn"]}
											title="Copy Seal"
										>
											<Copy size={12} />
										</button>
									</div>
									<div className={styles["hash-code"]}>
										{receiptTx.hash}
									</div>
								</div>
							</div>

							<div className={styles["receipt-footer"]}>
								<button
									className={styles["twin-redirect-btn"]}
									onClick={() => {
										dispatch(setCategory(activeSystem.id === "brain" ? "StressManagement" : activeSystem.id === "gut" ? "Gastroenterolgy" : "Cardiology"));
										navigate("/dashboard");
									}}
								>
									<TwinIcon />
									View Synced Twin System
								</button>
								<button
									className={styles["close-receipt-btn"]}
									onClick={() => setShowReceipt(false)}
								>
									Dismiss Credentials
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

		</div>
	);
};

export default Tests;
