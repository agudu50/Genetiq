import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { updateUserInfo } from "@/App/Redux/userSlice";
import { addUploadRecord } from "@/App/Redux/uploadHistorySlice";
import type { LabFinding, Recommendation } from "@/App/Redux/uploadHistorySlice";
import { paths } from "@/App/Routes/Paths";
import { Upload, FileText, ShieldCheck, Zap, ChevronRight, X, CheckCircle, ArrowLeft, Loader2, Wifi, WifiOff, Brain, Stethoscope, User, Droplets, Ruler, Scale, Activity, Clock, Check, Lock, ChevronDown } from "lucide-react";
import {
	analyzeLabResults,
	getTranslation,
	translateAnalysisResult,
} from "@/App/Services/GemmaService";
import type { GemmaLanguage, GemmaAnalysisResult, AnalyzeProgressPhase } from "@/App/Services/GemmaService";
import { useGemmaConnection } from "@/App/Hooks/useGemmaConnection";
import { enrichFindingsWithPlainNotes } from "@/App/Utils/buildResultsSummary";
import { extractPdfContent, readTextFile } from "@/App/Utils/extractFileText";
import styles from "./ImportOrUpload.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "personal" | "upload" | "analyzing" | "done";

interface UploadedFile {
	file: File;
	progress: number;
	done: boolean;
	previewUrl?: string;
	hidePreview?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_OPTIONS  = ["Male", "Female", "Non-binary", "Prefer not to say"];
const BLOOD_OPTIONS   = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−", "Unknown"];

const PROGRESS_RING_R = 36;
const PROGRESS_RING_C = 2 * Math.PI * PROGRESS_RING_R;

const LANGUAGES: { id: GemmaLanguage; label: string; flag: string; code: string }[] = [
	{ id: "english", label: "English", flag: "🇬🇧", code: "EN" },
	{ id: "twi", label: "Twi", flag: "🇬🇭", code: "TW" },
	{ id: "ga", label: "Ga", flag: "🇬🇭", code: "GA" },
	{ id: "ewe", label: "Ewe", flag: "🇬🇭", code: "EW" },
	{ id: "fante", label: "Fante", flag: "🇬🇭", code: "FT" },
];

const PRESETS = [
	{ id: "malaria_rdt", emoji: "🦟", title: "Malaria RDT Strip", desc: "Positive for P. falciparum malaria" },
	{ id: "cbc_anemia", emoji: "🩸", title: "Full Blood Count", desc: "Severe anemia & likely infection" },
	{ id: "typhoid", emoji: "🦠", title: "Typhoid Test (Widal)", desc: "Positive for Salmonella typhi" },
	{ id: "hep_b", emoji: "🧬", title: "Hepatitis B Profile", desc: "Reactive HBsAg screening" },
	{ id: "fbs_diabetes", emoji: "🍬", title: "Fasting Blood Sugar", desc: "Elevated glucose levels (Diabetes)" },
	{ id: "sickle_cell", emoji: "🔬", title: "Sickle Cell Screening", desc: "Hb electrophoresis (Sickle Trait)" },
	{ id: "urinalysis", emoji: "🧪", title: "Urinalysis Report", desc: "Dehydration & urinary tract infection" },
	{ id: "cholera", emoji: "💧", title: "Stool Analysis", desc: "Suspicion of acute watery diarrhea" },
];

// ─── Component ────────────────────────────────────────────────────────────────

function AiThinkingStatus({ phase, gemmaOnline }: { phase: string | null; gemmaOnline: boolean }) {
	const [elapsed, setElapsed] = useState(0);
	const [msgIndex, setMsgIndex] = useState(0);

	const messages = [
		"Gemma AI is interpreting your lab values...",
		"Cross-referencing with medical databases...",
		"Reasoning through your health profile...",
		"Formulating localized recommendations...",
		"Finalizing your personalized plan..."
	];

	useEffect(() => {
		if (phase !== "ai" || !gemmaOnline) return;
		const timer = setInterval(() => setElapsed(e => e + 1), 1000);
		const msgTimer = setInterval(() => setMsgIndex(i => Math.min(i + 1, messages.length - 1)), 8500);
		return () => { clearInterval(timer); clearInterval(msgTimer); };
	}, [phase, gemmaOnline]);

	if (phase !== "ai" || !gemmaOnline) return null;

	return (
		<div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
			<p style={{ fontWeight: 600, color: "var(--iou-heading)", margin: 0, fontSize: "1rem" }}>
				{messages[msgIndex]}
			</p>
			<div style={{ 
				background: "var(--iou-surface)", 
				border: "1px solid var(--iou-border)", 
				padding: "4px 12px", 
				borderRadius: 99, 
				fontSize: "0.8rem", 
				color: "var(--iou-muted)",
				display: "flex",
				alignItems: "center",
				gap: 6
			}}>
				<Clock size={12} />
				<span>Estimated time: ~60s (Elapsed: {elapsed}s)</span>
			</div>
		</div>
	);
}

const ImportOrUpload = () => {
	const navigate   = useNavigate();
	const location   = useLocation();
	const dispatch   = useDispatch();

	// If coming from the navbar "Upload Results" button, skip personal info
	const skipToUpload = (location.state as { skipToUpload?: boolean } | null)?.skipToUpload;

	const [step, setStep] = useState<Step>(skipToUpload ? "upload" : "personal");
	const [files, setFiles] = useState<UploadedFile[]>([]);
	const [dragging, setDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
	const [uploadTab, setUploadTab] = useState<"file" | "text" | "preset">("file");
	const [langDropdownOpen, setLangDropdownOpen] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState<GemmaLanguage>("english");
	const { gemmaOnline, gemmaAvailable, mode, statusLabel, refresh, cpuFastMode } = useGemmaConnection();
	const [analysisResults, setAnalysisResults] = useState<{ result: GemmaAnalysisResult, fileName: string }[] | null>(null);
	const [labTextPaste, setLabTextPaste] = useState("");
	const [analyzeStatus, setAnalyzeStatus] = useState({ message: "", pct: 0 });
	const [analyzePhase, setAnalyzePhase] = useState<AnalyzeProgressPhase | null>(null);

	const user = useSelector((state: RootState) => state.user);

	const [info, setInfo] = useState({
		firstName: user.firstName || "",
		lastName:  user.lastName  || "",
		age:       user.age       || "",
		gender:    user.gender    || "",
		bloodType: user.bloodType || "",
		height:    user.height    || "",
		weight:    user.weight    || "",
	});

	const profileCompleteness = useMemo(() => {
		const fields = [
			info.firstName,
			info.lastName,
			info.age,
			info.gender,
			info.height,
			info.weight,
			info.bloodType,
		];
		return Math.round((fields.filter(Boolean).length / fields.length) * 100);
	}, [info]);

	const requiredFieldsLeft = useMemo(() => {
		let left = 0;
		if (!info.firstName.trim()) left++;
		if (!info.lastName.trim()) left++;
		if (!info.age) left++;
		if (!info.gender) left++;
		return left;
	}, [info]);

	const canContinue = requiredFieldsLeft === 0;

	const liveBmi = useMemo(() => {
		const h = Number(info.height);
		const w = Number(info.weight);
		if (!h || !w) return null;
		const bmi = w / ((h / 100) * (h / 100));
		if (bmi < 18.5) return { value: bmi, label: "Underweight", cls: "underweight" as const };
		if (bmi < 25) return { value: bmi, label: "Normal", cls: "normal" as const };
		if (bmi < 30) return { value: bmi, label: "Overweight", cls: "overweight" as const };
		return { value: bmi, label: "Obese", cls: "obese" as const };
	}, [info.height, info.weight]);

	// ── Step 1: Personal info submit ──────────────────────────────────────────

	const handlePersonalSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		dispatch(updateUserInfo(info));
		setStep("upload");
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const set = (field: keyof typeof info) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
			setInfo((p) => ({ ...p, [field]: e.target.value }));

	// ── Step 2: File handling ─────────────────────────────────────────────────

	const addFiles = (list: FileList | null) => {
		if (!list) return;
		setSelectedPreset(null); // Clear preset if files uploaded
		const newFiles: UploadedFile[] = Array.from(list).map((file) => ({
			file, 
			progress: 0, 
			done: false,
			previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
		}));
		setFiles((p) => [...p, ...newFiles]);
		newFiles.forEach((f) => simulateProgress(f.file));
	};

	const simulateProgress = (file: File) => {
		let progress = 0;
		const interval = setInterval(() => {
			progress += Math.random() * 18 + 8;
			if (progress >= 100) {
				progress = 100;
				clearInterval(interval);
				setFiles((p) =>
					p.map((f) =>
						f.file === file ? { ...f, progress: 100, done: true } : f,
					),
				);
			} else {
				setFiles((p) =>
					p.map((f) => (f.file === file ? { ...f, progress } : f)),
				);
			}
		}, 300);
	};

	const removeFile = (file: File) =>
		setFiles((p) => p.filter((f) => {
			if (f.file === file) {
				if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
				return false;
			}
			return true;
		}));

	const togglePreview = (file: File, e?: React.MouseEvent) => {
		if (e) e.stopPropagation();
		setFiles((p) => p.map((f) => f.file === file ? { ...f, hidePreview: !f.hidePreview } : f));
	};

	// ── Drag & Drop ───────────────────────────────────────────────────────────

	const onDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setDragging(true);
	}, []);
	const onDragLeave = useCallback(() => setDragging(false), []);
	const onDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setDragging(false);
		addFiles(e.dataTransfer.files);
	}, []);

	// ── Preset selection ──────────────────────────────────────────────────────

	const handlePresetClick = (presetId: string) => {
		setSelectedPreset(presetId === selectedPreset ? null : presetId);
		setFiles([]);
		setLabTextPaste("");
	};

	// ── Step 2: Analyze with Gemma ────────────────────────────────────────────

	const handleAnalyze = async () => {
		setStep("analyzing");
		setAnalyzePhase(null);
		setAnalyzeStatus({ message: "Preparing your lab data…", pct: 0 });
		void refresh();
		dispatch(updateUserInfo({ ...info, uploadStatus: "processing" }));

		try {
			const newResults: { result: GemmaAnalysisResult, fileName: string }[] = [];

			if (selectedPreset || labTextPaste) {
				const combinedLabText = labTextPaste.trim() || undefined;
				const result = await analyzeLabResults({
					labText: combinedLabText,
					presetId: selectedPreset || undefined,
					patientAge: info.age || "35",
					patientGender: info.gender || "unknown",
					language: selectedLanguage,
					onProgress: (phase, message, pct) => {
						setAnalyzePhase(phase);
						setAnalyzeStatus({ message, pct: pct ?? 0 });
					},
				});

				const enriched = enrichFindingsWithPlainNotes(result);
				const fileName = selectedPreset
					? PRESETS.find((p) => p.id === selectedPreset)?.title || "Preset Analysis"
					: "Pasted Text";
				
				newResults.push({ result: enriched, fileName });

				const findings: LabFinding[] = enriched.findings.map((f) => ({
					id: f.id,
					name: f.name,
					marker: f.marker,
					value: f.value,
					status: f.status,
					statusLabel: f.statusLabel,
					note: f.note,
				}));

				const recommendations: Recommendation[] = result.recommendations.map((r) => ({
					icon: r.icon,
					title: r.title,
					body: r.body,
				}));

				dispatch(addUploadRecord({
					id: crypto.randomUUID(),
					uploadedAt: new Date().toISOString(),
					fileName,
					healthScore: enriched.healthScore,
					findings,
					recommendations,
					firstName: info.firstName,
					lastName: info.lastName,
					age: info.age,
					gender: info.gender,
					bloodType: info.bloodType,
				}));
			} else if (files.length > 0) {
				for (let i = 0; i < files.length; i++) {
					const { file } = files[i];
					const prefix = files.length > 1 ? `[File ${i + 1} of ${files.length}] ` : "";
					const imageBase64List: string[] = [];
					const extractedTextParts: string[] = [];
					const type = file.type || "";
					const name = file.name.toLowerCase();

					if (type.startsWith("image/") || (!type && !name.includes("."))) {
						imageBase64List.push(await fileToBase64(file));
					} else if (type === "application/pdf" || name.endsWith(".pdf")) {
						setAnalyzeStatus({ message: prefix + `Reading ${file.name}…`, pct: 0 });
						try {
							const pdf = await extractPdfContent(file);
							if (pdf.text) {
								extractedTextParts.push(pdf.text);
							} else {
								imageBase64List.push(...pdf.pageImagesBase64);
							}
						} catch (e) {
							console.warn(`Could not read PDF ${file.name}:`, e);
						}
					} else if (
						type === "text/csv" ||
						type.startsWith("text/") ||
						name.endsWith(".csv") ||
						name.endsWith(".txt")
					) {
						try {
							extractedTextParts.push(await readTextFile(file));
						} catch (e) {
							console.warn(`Could not read ${file.name}:`, e);
						}
					}

					const combinedLabText = extractedTextParts.filter(Boolean).join("\n\n");

					const result = await analyzeLabResults({
						imageBase64List: imageBase64List.length ? imageBase64List : undefined,
						labText: combinedLabText || undefined,
						patientAge: info.age || "35",
						patientGender: info.gender || "unknown",
						language: selectedLanguage,
						onProgress: (phase, message, pct) => {
							setAnalyzePhase(phase);
							setAnalyzeStatus({ message: prefix + message, pct: pct ?? 0 });
						},
					});

					const enriched = enrichFindingsWithPlainNotes(result);
					newResults.push({ result: enriched, fileName: file.name });

					const findings: LabFinding[] = enriched.findings.map((f) => ({
						id: f.id,
						name: f.name,
						marker: f.marker,
						value: f.value,
						status: f.status,
						statusLabel: f.statusLabel,
						note: f.note,
					}));

					const recommendations: Recommendation[] = result.recommendations.map((r) => ({
						icon: r.icon,
						title: r.title,
						body: r.body,
					}));

					dispatch(addUploadRecord({
						id: crypto.randomUUID(),
						uploadedAt: new Date().toISOString(),
						fileName: file.name,
						healthScore: enriched.healthScore,
						findings,
						recommendations,
						firstName: info.firstName,
						lastName: info.lastName,
						age: info.age,
						gender: info.gender,
						bloodType: info.bloodType,
					}));
				}
			}

			setAnalysisResults(newResults);
			dispatch(updateUserInfo({ uploadStatus: "completed" }));
			setStep("done");
		} catch (error) {
			console.error("Analysis error:", error);
			dispatch(updateUserInfo({ uploadStatus: "completed" }));
			setStep("done");
		}
	};

	const fileToBase64 = (file: File): Promise<string> =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				resolve(result.split(",")[1]); // Remove data:...;base64, prefix
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});

	const allDone   = files.length > 0 && files.every((f) => f.done);
	const hasLabText = labTextPaste.trim().length >= 12;
	const canAnalyze = allDone || !!selectedPreset || hasLabText;

	// Helper to translate status labels
	const t = (text: string) => getTranslation(text, selectedLanguage);

	// Removed specific useMemos for scoreBands, scoreTier, and summarySections.
	// They will be moved to the SingleResultView component.

	const analyzeConnBadge = useMemo(() => {
		if (analyzePhase === "ocr") {
			return { icon: "scan" as const, label: "Reading on your device", tone: "local" as const };
		}
		if (gemmaOnline) {
			return { icon: "live" as const, label: statusLabel, tone: "live" as const };
		}
		if (gemmaAvailable || mode === "starting") {
			return { icon: "spin" as const, label: "AI starting up…", tone: "starting" as const };
		}
		if (mode === "checking") {
			return { icon: "spin" as const, label: "Checking AI…", tone: "checking" as const };
		}
		return { icon: "offline" as const, label: "Offline — smart fallback", tone: "offline" as const };
	}, [analyzePhase, gemmaOnline, gemmaAvailable, mode, statusLabel]);

	// ─────────────────────────────────────────────────────────────────────────

	return (
		<div className={styles.page}>

			{/* ── Analyzing overlay ───────────────────────────────────── */}
			{step === "analyzing" && (
				<div className={styles.overlay}>
					<div className={styles.overlayCard}>
						<div className={styles.aiThinkingGraphic}>
							<div className={styles.aiOrbit1} />
							<div className={styles.aiOrbit2} />
							<div className={styles.aiCore} />
						</div>
						<h2>{analyzeStatus.message || "Analysing your results…"}</h2>
						{analyzePhase === "ai" && gemmaOnline && !cpuFastMode ? (
							<AiThinkingStatus phase={analyzePhase} gemmaOnline={gemmaOnline} />
						) : (
							<p>
								{analyzePhase === "ocr"
									? "Extracting values from your photo on this device, then AI will interpret them."
									: gemmaOnline && cpuFastMode
										? "Reading your lab text and building your personalised report — this is fast on CPU."
										: gemmaAvailable || mode === "starting"
											? "Waiting for the AI model to finish loading, then your results will be ready."
											: "Building your personalised health insights with smart offline analysis."
								}
							</p>
						)}
						{(analyzePhase === "ocr" || analyzeStatus.message.includes("Reading text")) && analyzeStatus.pct > 0 && (
							<div className={styles.analyzeProgressTrack}>
								<div
									className={styles.analyzeProgressFill}
									style={{ width: `${analyzeStatus.pct}%` }}
								/>
							</div>
						)}
						<div
							className={`${styles.gemmaStatusBadge} ${styles[`gemmaStatusBadge-${analyzeConnBadge.tone}`]}`}
						>
							{analyzeConnBadge.icon === "live" && <Wifi size={12} />}
							{analyzeConnBadge.icon === "spin" && (
								<Loader2 size={12} className={styles.gemmaStatusSpinner} />
							)}
							{analyzeConnBadge.icon === "offline" && <Brain size={12} />}
							{analyzeConnBadge.icon === "scan" && <FileText size={12} />}
							{analyzeConnBadge.label}
						</div>
					</div>
				</div>
			)}

			{/* ── AI Results screen ─────────────────────────────────── */}
			{step === "done" && analysisResults && analysisResults.length > 0 && (
				<div className={styles.resultsPage}>
					{analysisResults.map((res, idx) => (
						<div key={idx} className={styles.multiResultContainer}>
							{analysisResults.length > 1 && (
								<div className={styles.multiResultHeader}>
									<FileText size={18} /> 
									<h3>Results for: {res.fileName}</h3>
								</div>
							)}
							<SingleResultView 
								analysisResult={res.result} 
								t={t} 
								selectedLanguage={selectedLanguage}
								setSelectedLanguage={setSelectedLanguage}
								onRetry={() => {
									setFiles([]);
									setSelectedPreset(null);
									setLabTextPaste("");
									setAnalysisResults(null);
									setStep("upload");
									window.scrollTo({ top: 0, behavior: "smooth" });
								}}
							/>
							{idx < analysisResults.length - 1 && (
								<hr className={styles.multiResultDivider} />
							)}
						</div>
					))}

					{/* ── Global Disclaimer & CTAs ───────────────────────────────────────── */}
					<div className={styles.disclaimer} style={{ marginTop: 32 }}>
						<div className={styles.disclaimerIcon}>
							<ShieldCheck size={18} />
						</div>
						<div className={styles.disclaimerText}>
							<strong>{t("This analysis is for information only") || "This analysis is for information only"}</strong>
							<span>
								{t("Always speak to a qualified doctor about your health.")}{" "}
								{t("Visit your nearest CHPS compound") || ""}
							</span>
						</div>
					</div>

					<div className={styles.resultsCtasWrap}>
						<div className={styles.resultsCtas}>
							<button className={styles.primaryBtn} onClick={() => navigate(paths.dashboard.root)}>
								<Brain size={16} /> {t("Go to my dashboard")}
							</button>
							<button className={styles.outlineBtn} onClick={() => navigate(paths.clinicalHistory)}>
								<FileText size={16} /> {t("View clinical history")}
							</button>
							<button
								className={styles.ghostBtn}
								onClick={() => {
									setFiles([]);
									setSelectedPreset(null);
									setAnalysisResults(null);
									setStep("upload");
									window.scrollTo({ top: 0, behavior: "smooth" });
								}}
							>
								<Upload size={14} /> {t("Upload more results")}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ── Normal flow ─────────────────────────────────────────────── */}
			{(step === "personal" || step === "upload") && (
				<>
					{/* Header row — Back (left) + Steps (right) */}
				<div className={styles.header}>
					<button className={styles.backBtn} onClick={() => step === "upload" ? setStep("personal") : navigate(paths.config.root)}>
						<ArrowLeft size={16} /> Back
					</button>

					<div className={`${styles.steps} ${styles.stepsMobile}`}>
						<div className={`${styles.step} ${step === "upload" ? styles.stepDone : styles.stepActive}`}>
							<span className={styles.stepNum}>
								{step === "upload" ? <CheckCircle size={13} /> : "1"}
							</span>
							<span>About You</span>
						</div>
						<div className={`${styles.stepLine} ${step === "upload" ? styles.stepLineDone : ""}`} />
						<div className={`${styles.step} ${step === "upload" ? styles.stepActive : styles.stepIdle}`}>
							<span className={styles.stepNum}>2</span>
							<span>Upload Results</span>
						</div>
					</div>
				</div>

				{/* Step 1 — Personal Info */}
				{step === "personal" && (
					<div className={styles.personalStage}>
						<div className={styles.personalHero}>
							<div className={styles.personalHeroTop}>
								<div className={styles.personalHeroLead}>
									<div className={styles.personalIconBadge}>
										<User size={22} strokeWidth={2.25} />
									</div>
									<div
										className={styles.personalProgressRing}
										role="img"
										aria-label={`Profile ${profileCompleteness}% complete`}
									>
										<svg viewBox="0 0 88 88" aria-hidden>
											<circle
												className={styles.personalProgressTrack}
												cx="44"
												cy="44"
												r={PROGRESS_RING_R}
											/>
											<circle
												className={styles.personalProgressFill}
												cx="44"
												cy="44"
												r={PROGRESS_RING_R}
												strokeDasharray={PROGRESS_RING_C}
												strokeDashoffset={
													PROGRESS_RING_C - (profileCompleteness / 100) * PROGRESS_RING_C
												}
											/>
										</svg>
										<span className={styles.personalProgressPct}>{profileCompleteness}%</span>
									</div>
								</div>

								<div className={styles.personalHeroCopy}>
									<div className={styles.personalHeroMeta}>
										<span className={styles.personalEyebrow}>Step 1 of 2</span>
										{info.firstName.trim() ? (
											<p className={styles.personalGreeting}>
												Hi, {info.firstName.trim()}
											</p>
										) : null}
									</div>
									<h1 className={styles.personalTitle}>
										Tell us about <span className={styles.teal}>yourself</span>
									</h1>
									<p className={styles.personalSubtitle}>
										We use this to personalise your health insights. Takes 30 seconds.
									</p>
								</div>
							</div>

							<div className={styles.personalStepJourney} aria-hidden>
								<div className={`${styles.personalStepDot} ${styles.personalStepDotActive}`}>
									<span>1</span>
									About you
								</div>
								<div className={styles.personalStepConnector} />
								<div className={styles.personalStepDot}>
									<span>2</span>
									Upload
								</div>
							</div>

							<div className={styles.personalTrustRow}>
								<div className={styles.personalTrustCard}>
									<ShieldCheck size={16} />
									<div>
										<strong>Private &amp; secure</strong>
										<span>Stored locally on your device</span>
									</div>
								</div>
								<div className={styles.personalTrustCard}>
									<Clock size={16} />
									<div>
										<strong>About 30 seconds</strong>
										<span>Quick setup, no account needed</span>
									</div>
								</div>
								<div className={styles.personalTrustCard}>
									<Activity size={16} />
									<div>
										<strong>Better lab insights</strong>
										<span>Personalised reference ranges</span>
									</div>
								</div>
							</div>
						</div>

						<form className={styles.personalCard} onSubmit={handlePersonalSubmit}>
							<div className={styles.personalCardProgress}>
								<div className={styles.personalCardProgressHead}>
									<span>Profile progress</span>
									<span>{profileCompleteness}%</span>
								</div>
								<div className={styles.personalCardProgressTrack}>
									<div
										className={styles.personalCardProgressBar}
										style={{ width: `${profileCompleteness}%` }}
									/>
								</div>
							</div>

							<section className={styles.personalSection}>
								<div className={styles.personalSectionHead}>
									<span className={styles.personalSectionNum}>01</span>
									<h2 className={styles.personalSectionTitle}>
										<User size={15} /> Personal info
									</h2>
								</div>
								<div className={styles.personalGrid}>
									<div className={styles.personalField}>
										<label htmlFor="iou-first-name">First name</label>
										<div className={`${styles.personalInputWrap} ${info.firstName ? styles.personalInputFilled : ""}`}>
											<input
												id="iou-first-name"
												placeholder="e.g. Kwame"
												value={info.firstName}
												onChange={set("firstName")}
												required
											/>
											{info.firstName ? (
												<span className={styles.personalFieldCheck} aria-hidden>
													<Check size={14} strokeWidth={3} />
												</span>
											) : null}
										</div>
									</div>
									<div className={styles.personalField}>
										<label htmlFor="iou-last-name">Last name</label>
										<div className={`${styles.personalInputWrap} ${info.lastName ? styles.personalInputFilled : ""}`}>
											<input
												id="iou-last-name"
												placeholder="e.g. Mensah"
												value={info.lastName}
												onChange={set("lastName")}
												required
											/>
											{info.lastName ? (
												<span className={styles.personalFieldCheck} aria-hidden>
													<Check size={14} strokeWidth={3} />
												</span>
											) : null}
										</div>
									</div>
									<div className={styles.personalField}>
										<label htmlFor="iou-age">Age</label>
										<div className={`${styles.personalInputWrap} ${info.age ? styles.personalInputFilled : ""}`}>
											<input
												id="iou-age"
												type="number"
												min="1"
												max="120"
												placeholder="e.g. 34"
												value={info.age}
												onChange={set("age")}
												required
											/>
											<span className={styles.personalSuffix}>yrs</span>
										</div>
									</div>
									<div className={`${styles.personalField} ${styles.personalFieldFull}`}>
										<label id="iou-gender-label">Gender</label>
										<div
											className={styles.personalChipGroup}
											role="group"
											aria-labelledby="iou-gender-label"
										>
											{GENDER_OPTIONS.map((g) => (
												<button
													key={g}
													type="button"
													className={`${styles.personalChip} ${info.gender === g ? styles.personalChipActive : ""}`}
													onClick={() => setInfo((p) => ({ ...p, gender: g }))}
													aria-pressed={info.gender === g}
												>
													{g}
												</button>
											))}
										</div>
									</div>
								</div>
							</section>

							<section className={styles.personalSection}>
								<div className={styles.personalSectionHead}>
									<span className={styles.personalSectionNum}>02</span>
									<h2 className={styles.personalSectionTitle}>
										<Droplets size={15} /> Health details
									</h2>
								</div>
								<div className={`${styles.personalField} ${styles.personalFieldFull}`}>
									<label id="iou-blood-label">
										Blood type <span className={styles.optional}>(optional)</span>
									</label>
									<div
										className={styles.personalBloodGrid}
										role="group"
										aria-labelledby="iou-blood-label"
									>
										{BLOOD_OPTIONS.map((b) => {
											const isUnknown = b === "Unknown";
											const selected = isUnknown
												? !info.bloodType || info.bloodType === "Unknown"
												: info.bloodType === b;
											return (
												<button
													key={b}
													type="button"
													className={`${styles.personalBloodChip} ${selected ? styles.personalBloodChipActive : ""}`}
													onClick={() =>
														setInfo((p) => ({
															...p,
															bloodType: isUnknown ? "" : b,
														}))
													}
													aria-pressed={selected}
												>
													{b}
												</button>
											);
										})}
									</div>
								</div>
							</section>

							<section className={styles.personalSection}>
								<div className={styles.personalSectionHead}>
									<span className={styles.personalSectionNum}>03</span>
									<h2 className={styles.personalSectionTitle}>
										<Ruler size={15} /> Body metrics
										<span className={styles.personalOptionalBadge}>Optional</span>
									</h2>
								</div>
								<p className={styles.personalSectionHint}>
									Height and weight help us calculate BMI and tailor your results.
								</p>
								<div className={styles.personalGrid}>
									<div className={styles.personalField}>
										<label htmlFor="iou-height">Height</label>
										<div className={`${styles.personalInputWrap} ${info.height ? styles.personalInputFilled : ""}`}>
											<input
												id="iou-height"
												type="number"
												min="50"
												max="300"
												placeholder="e.g. 175"
												value={info.height}
												onChange={set("height")}
											/>
											<span className={styles.personalSuffix}>cm</span>
										</div>
									</div>
									<div className={styles.personalField}>
										<label htmlFor="iou-weight">Weight</label>
										<div className={`${styles.personalInputWrap} ${info.weight ? styles.personalInputFilled : ""}`}>
											<input
												id="iou-weight"
												type="number"
												min="10"
												max="500"
												placeholder="e.g. 72"
												value={info.weight}
												onChange={set("weight")}
											/>
											<span className={styles.personalSuffix}>kg</span>
										</div>
									</div>
								</div>

								{liveBmi && (
									<div className={`${styles.personalBmiCard} ${styles[`bmi${liveBmi.cls.charAt(0).toUpperCase()}${liveBmi.cls.slice(1)}`]}`}>
										<div className={styles.personalBmiIcon}>
											<Scale size={18} />
										</div>
										<div className={styles.personalBmiCopy}>
											<span className={styles.personalBmiLabel}>BMI preview</span>
											<span className={styles.personalBmiValue}>{liveBmi.value.toFixed(1)}</span>
											<div className={styles.personalBmiScale}>
												<div className={styles.personalBmiScaleTrack}>
													<span className={styles.personalBmiZoneUnder} />
													<span className={styles.personalBmiZoneNormal} />
													<span className={styles.personalBmiZoneOver} />
													<span className={styles.personalBmiZoneObese} />
													<span
														className={styles.personalBmiMarker}
														style={{
															left: `${Math.min(100, Math.max(0, ((liveBmi.value - 15) / 25) * 100))}%`,
														}}
													/>
												</div>
												<div className={styles.personalBmiScaleLabels}>
													<span>15</span>
													<span>25</span>
													<span>30</span>
													<span>40</span>
												</div>
											</div>
										</div>
										<span className={styles.personalBmiBadge}>{liveBmi.label}</span>
									</div>
								)}
							</section>

							<div className={styles.personalFooter}>
								<p className={styles.personalFooterNote}>
									<Lock size={14} />
									Your data stays on this device unless you choose to sync.
								</p>
								<button
									type="submit"
									className={styles.personalSubmitBtn}
									disabled={!canContinue}
								>
									{canContinue ? (
										<>
											Continue to upload
											<ChevronRight size={18} strokeWidth={2.5} />
										</>
									) : (
										<>
											{requiredFieldsLeft} required field{requiredFieldsLeft !== 1 ? "s" : ""} left
										</>
									)}
								</button>
							</div>
						</form>
					</div>
				)}

				{/* Step 2 — Upload */}
			{step === "upload" && (
				<div className={styles.uploadHubContainer}>
					
					{/* Header Actions */}
					<div className={styles.uploadHubHeaderActions}>
						<div className={styles.uploadHubStatusBadge}>
							<div className={`${styles.uploadHubStatusDot} ${
								gemmaOnline ? styles.dotOnline
								: mode === "starting" || mode === "checking" ? styles.dotStarting
								: styles.dotOffline
							}`} />
							{statusLabel}
						</div>
						
						<div className={styles.uploadHubLangSelectWrapper}>
							<button 
								className={styles.uploadHubLangSelect}
								onClick={() => setLangDropdownOpen(!langDropdownOpen)}
							>
								{LANGUAGES.find((l) => l.id === selectedLanguage)?.flag || "🇬🇧"}{" "}
								{LANGUAGES.find((l) => l.id === selectedLanguage)?.code || "EN"}{" "}
								<ChevronDown size={14} />
							</button>
							{langDropdownOpen && (
								<div className={styles.uploadHubLangDropdown}>
									{LANGUAGES.map((lang) => (
										<button
											key={lang.id}
											className={styles.uploadHubLangOption}
											onClick={() => {
												setSelectedLanguage(lang.id);
												setLangDropdownOpen(false);
											}}
										>
											<span className={styles.uploadHubLangOptionFlag}>{lang.flag}</span>
											<span className={styles.uploadHubLangOptionLabel}>{lang.label}</span>
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Hero text */}
					<div className={styles.uploadHubHero}>
						<h1>Analyze your lab results</h1>
						<p>Get plain-English insights from any medical report in seconds.</p>
					</div>

					{/* Main Card */}
					<div className={styles.uploadHubCard}>
						
						{/* Tabs */}
						<div className={styles.uploadHubTabs}>
							<button 
								className={`${styles.uploadHubTab} ${uploadTab === "file" ? styles.uploadHubTabActive : ""}`}
								onClick={() => setUploadTab("file")}
							>
								Upload File
							</button>
							<button 
								className={`${styles.uploadHubTab} ${uploadTab === "text" ? styles.uploadHubTabActive : ""}`}
								onClick={() => setUploadTab("text")}
							>
								Paste Text
							</button>
							<button 
								className={`${styles.uploadHubTab} ${uploadTab === "preset" ? styles.uploadHubTabActive : ""}`}
								onClick={() => setUploadTab("preset")}
							>
								Try a Sample
							</button>
						</div>

						{/* Content */}
						<div className={styles.uploadHubContent}>
							{uploadTab === "file" && (
								<>
									<div
										className={`${styles.uploadHubDropzone} ${dragging ? styles.uploadHubDropzoneActive : ""}`}
										onDragOver={onDragOver}
										onDragLeave={onDragLeave}
										onDrop={onDrop}
										onClick={() => fileInputRef.current?.click()}
									>
										<input
											ref={fileInputRef}
											type="file"
											multiple
											accept=".pdf,.jpg,.jpeg,.png,.csv"
											style={{ display: "none" }}
											onChange={(e) => addFiles(e.target.files)}
										/>
										<div className={styles.uploadHubDropIcon}><Upload size={24} /></div>
										<h3>Drop files here or browse</h3>
										<p>PDF, JPG, PNG, or CSV up to 25MB</p>
									</div>

									{files.length > 0 && (
										<div className={styles.uploadFileList} style={{ marginTop: '24px' }}>
											{files.map(({ file, progress, done, previewUrl, hidePreview }) => (
												<div 
													key={file.name} 
													className={`${styles.fileRow} ${done ? styles.fileRowDone : ""}`}
													style={previewUrl && !hidePreview ? { flexDirection: 'column', alignItems: 'stretch', padding: 0, overflow: 'hidden' } : {}}
												>
													{previewUrl && !hidePreview && (
														<div style={{ width: '100%', height: 180, background: 'var(--iou-surface)', position: 'relative' }}>
															<img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
															<button
																onClick={(e) => togglePreview(file, e)}
																style={{ 
																	position: 'absolute', top: 12, right: 12, 
																	background: 'rgba(0,0,0,0.7)', 
																	color: '#ffffff', 
																	border: '2px solid rgba(255,255,255,0.4)', 
																	borderRadius: '50%', 
																	width: 32, height: 32, 
																	display: 'flex', alignItems: 'center', justifyContent: 'center', 
																	cursor: 'pointer',
																	zIndex: 999,
																	boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
																}}
																title="Hide preview"
															>
																<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
																	<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" style={{ stroke: 'white', strokeWidth: 2, fill: 'none' }} />
																	<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" style={{ stroke: 'white', strokeWidth: 2, fill: 'none' }} />
																	<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" style={{ stroke: 'white', strokeWidth: 2, fill: 'none' }} />
																	<line x1="2" x2="22" y1="2" y2="22" style={{ stroke: 'white', strokeWidth: 2 }} />
																</svg>
															</button>
														</div>
													)}
													<div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: previewUrl && !hidePreview ? '12px 16px' : 0 }}>
														<div className={styles.fileIcon}>
															{done ? <CheckCircle size={16} /> : <FileText size={16} />}
														</div>
														<div className={styles.fileMeta}>
															<span className={styles.fileName}>{file.name}</span>
															<span className={styles.fileSize}>
																{(file.size / 1024).toFixed(0)} KB
																{done && " · Ready"}
															</span>
															{!done && (
																<div className={styles.progressBar}>
																	<div className={styles.progressFill} style={{ width: `${progress}%` }} />
																</div>
															)}
														</div>
														{done && (
															<div style={{ display: 'flex', gap: 8 }}>
																{previewUrl && hidePreview && (
																	<button className={styles.removeBtn} onClick={(e) => togglePreview(file, e)} title="Show preview">
																		<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
																			<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
																			<circle cx="12" cy="12" r="3" />
																		</svg>
																	</button>
																)}
																<button className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); removeFile(file); }} title="Remove file">
																	<X size={14} />
																</button>
															</div>
														)}
														{!done && <Loader2 size={15} className={styles.spinner} />}
													</div>
												</div>
											))}
										</div>
									)}
								</>
							)}

							{uploadTab === "text" && (
								<div className={styles.uploadLabTextCard}>
									<div className={styles.uploadLabTextHeaderGroup}>
										<div className={styles.uploadLabTextIconWrapper}>
											<FileText size={20} strokeWidth={2} />
										</div>
										<div className={styles.uploadLabTextTitleGroup}>
											<label htmlFor="iou-lab-text" className={styles.uploadLabTextTitle}>
												Paste lab results 
											</label>
											<p className={styles.uploadLabTextSubtitle}>
												Use this if your photo is unclear or if you only have text.
											</p>
										</div>
									</div>

									<div className={styles.uploadLabTextTextareaWrapper}>
										<textarea
											id="iou-lab-text"
											className={styles.uploadLabTextArea}
											placeholder="Example:\nHemoglobin: 7.2 g/dL\nWBC: 6.2 x10⁹/L\nMalaria RDT: Positive"
											value={labTextPaste}
											onChange={(e) => {
												setLabTextPaste(e.target.value);
												if (e.target.value.trim()) setSelectedPreset(null);
											}}
											rows={5}
										/>
									</div>
								</div>
							)}

							{uploadTab === "preset" && (
								<div className={styles.uploadPresetsGrid}>
									{PRESETS.map((preset) => (
										<button
											key={preset.id}
											className={`${styles.uploadPresetCard} ${selectedPreset === preset.id ? styles.uploadPresetCardActive : ""}`}
											onClick={() => handlePresetClick(preset.id)}
										>
											<span className={styles.uploadPresetEmoji}>{preset.emoji}</span>
											<div className={styles.uploadPresetText}>
												<span className={styles.uploadPresetTitle}>{preset.title}</span>
												<span className={styles.uploadPresetDesc}>{preset.desc}</span>
											</div>
											{selectedPreset === preset.id && (
												<CheckCircle size={16} className={styles.uploadPresetCheck} />
											)}
										</button>
									))}
								</div>
							)}
						</div>

						{/* Actions */}
						<div className={styles.uploadHubActions}>
							<button
								className={styles.uploadHubBtnPrimary}
								disabled={!canAnalyze}
								onClick={handleAnalyze}
							>
								<Brain size={16} />
								{canAnalyze
									? hasLabText && !allDone && !selectedPreset
										? "Analyse pasted results"
										: `Analyse with ${gemmaOnline ? "Gemma AI" : "AI"}`
									: allDone
										? "Analyse my results"
										: files.length > 0
											? "Uploading…"
											: "Add results to analyse"
								}
							</button>
							<button className={styles.uploadHubBtnGhost} onClick={() => navigate(paths.dashboard.root)}>
								Skip for now
							</button>
						</div>
					</div>

					{/* Trust Footer */}
					<div className={styles.uploadHubTrustFooter}>
						<div className={styles.uploadHubTrustItem}>
							<ShieldCheck size={14} /> Encrypted
						</div>
						<div className={styles.uploadHubTrustItem}>
							<Zap size={14} /> Instant
						</div>
						<div className={styles.uploadHubTrustItem}>
							<Brain size={14} /> Medical AI
						</div>
					</div>
				</div>
			)}
			</>
			)}
		</div>
	);
};

function SingleResultView({
	analysisResult: rawAnalysisResult,
	t,
	selectedLanguage,
	setSelectedLanguage,
	onRetry
}: {
	analysisResult: GemmaAnalysisResult;
	t: (text: string) => string;
	selectedLanguage: GemmaLanguage;
	setSelectedLanguage: (lang: GemmaLanguage) => void;
	onRetry: () => void;
}) {
	const analysisResult = useMemo(() => {
		return translateAnalysisResult(rawAnalysisResult, selectedLanguage);
	}, [rawAnalysisResult, selectedLanguage]);

	const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);

	const scoreTier = useMemo(() => {
		const score = analysisResult?.healthScore ?? 0;
		if (score <= 50) {
			return {
				key: "attention" as const,
				label: "Needs attention",
				plain: "Some results look off. Discuss these with your doctor soon.",
				range: "0 – 50",
			};
		}
		if (score <= 74) {
			return {
				key: "improve" as const,
				label: "Room to improve",
				plain: "A few values need follow-up. Ask your doctor what to watch.",
				range: "51 – 74",
			};
		}
		if (score <= 89) {
			return {
				key: "good" as const,
				label: "Looking good",
				plain: "Most results look fine. Keep healthy habits and check-ups.",
				range: "75 – 89",
			};
		}
		return {
			key: "excellent" as const,
			label: "Excellent",
			plain: "Your results look strong overall. Stay consistent.",
			range: "90 – 100",
		};
	}, [analysisResult?.healthScore]);

	const scoreBands = useMemo(
		() => [
			{
				key: "attention" as const,
				range: "0 – 50",
				label: "Needs attention",
				hint: "Discuss with your doctor",
				active: (analysisResult?.healthScore ?? 0) <= 50,
			},
			{
				key: "improve" as const,
				range: "51 – 74",
				label: "Room to improve",
				hint: "Follow up on a few values",
				active: (analysisResult?.healthScore ?? 0) > 50 && (analysisResult?.healthScore ?? 0) <= 74,
			},
			{
				key: "good" as const,
				range: "75 – 89",
				label: "Looking good",
				hint: "Mostly in a healthy range",
				active: (analysisResult?.healthScore ?? 0) > 74 && (analysisResult?.healthScore ?? 0) <= 89,
			},
			{
				key: "excellent" as const,
				range: "90 – 100",
				label: "Excellent",
				hint: "Strong overall results",
				active: (analysisResult?.healthScore ?? 0) > 89,
			},
		],
		[analysisResult?.healthScore],
	);

	const summarySections = useMemo(() => {
		if (!analysisResult || !analysisResult.summary) return [];
		return [
			{
				id: "ai-summary",
				title: "Report Overview",
				body: analysisResult.summary,
				tone: (analysisResult.healthScore ?? 0) >= 75 ? "info" : "caution" as "info" | "caution" | "neutral",
			}
		];
	}, [analysisResult]);

	if (analysisResult.healthScore === 0 && analysisResult.findings.length === 0) {
		return (
			<>
				{/* Notice Hero */}
				<div className={styles.unavailableHero}>
					<div className={styles.unavailableIconWrap}>
						<div className={styles.unavailableIcon}>
							<Stethoscope size={32} />
						</div>
						<div className={styles.unavailablePulse} />
					</div>

					<div className={styles.unavailableContent}>
						<div className={styles.unavailableBadge}>
							<WifiOff size={12} /> Couldn't complete analysis
						</div>
						<h1>We couldn't read your lab report</h1>
						<p>{analysisResult.summary}</p>
					</div>
				</div>

				{/* What You Can Do */}
				<div className={styles.section}>
					<div className={styles.sectionHead}>
						<h2 className={styles.sectionTitle}>Here's what to try</h2>
						<p className={styles.sectionSub}>Pick any option below — each takes about a minute</p>
					</div>

					<div className={styles.unavailableActions}>
						{analysisResult.recommendations.map((rec) => (
							<button
								key={rec.title}
								className={styles.unavailableActionCard}
								onClick={onRetry}
							>
								<div className={styles.unavailableActionIcon} data-color="teal">
									<span>{rec.icon}</span>
								</div>
								<div className={styles.unavailableActionText}>
									<h3>{rec.title}</h3>
									<p>{rec.body}</p>
								</div>
								<ChevronRight size={18} className={styles.unavailableActionArrow} />
							</button>
						))}
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			{/* ── Native App Style Score Hero ─────────────────────────────────── */}
			<div className={`${styles.card} ${styles.mainScoreCard}`}>
				<div className={styles.scoreTop}>
					<div className={`${styles.scoreCircleNative} ${styles[`scoreCircle-${scoreTier.key}`]}`}>
						<div className={styles.scoreCircleValue}>{analysisResult.healthScore}</div>
						<div className={styles.scoreCircleTotal}>/100</div>
					</div>
					<div className={styles.scoreInfoNative}>
						<div className={styles.scoreTitleNative}>{t("Health Score")}</div>
						<div className={`${styles.scoreStatusNative} ${styles[`scoreStatus-${scoreTier.key}`]}`}>{t(scoreTier.label)}</div>
					</div>
				</div>
				
				<p className={styles.scoreDescNative}>{t(scoreTier.plain)}</p>
				
				<div className={styles.miniScale}>
					<div className={`${styles.miniScaleSeg} ${styles.seg1}`}></div>
					<div className={`${styles.miniScaleSeg} ${styles.seg2}`}></div>
					<div className={`${styles.miniScaleSeg} ${styles.seg3}`}></div>
					<div className={`${styles.miniScaleSeg} ${styles.seg4}`}></div>
					<div className={styles.miniScaleMarker} style={{ left: `${Math.min(100, Math.max(0, analysisResult.healthScore))}%` }}></div>
				</div>

				{/* Lang selection inside the card for compactness */}
				<div className={styles.langSectionNative}>
					{LANGUAGES.map((lang) => (
						<button
							key={lang.id}
							type="button"
							className={`${styles.langPillNative} ${lang.id === selectedLanguage ? styles.langPillActiveNative : ""}`}
							onClick={() => setSelectedLanguage(lang.id)}
						>
							{lang.flag} {lang.code}
						</button>
					))}
				</div>
			</div>

			{/* ── Legend Card ──────────────────────────────── */}
			<div className={styles.card}>
				<div className={styles.legendListNative}>
					{scoreBands.map((band) => (
						<div
							key={band.key}
							className={`${styles.legendItemNative} ${band.active ? styles.legendItemActiveNative : ""}`}
						>
							<div className={`${styles.legendDotNative} ${styles[`legendDot-${band.key}`]}`}></div>
							<div className={styles.legendRangeNative}>{band.range}</div>
							<div className={styles.legendLabelNative}>{t(band.label)}</div>
							{band.active && <div className={styles.legendHereNative}>{t("You are here")}</div>}
						</div>
					))}
				</div>
			</div>

			{/* ── Plain-English summary (re-styled) ──────────────────────── */}
			{summarySections.length > 0 && (
				<div className={styles.sectionHeaderNative}>
					<h2>{t("What this means for you")}</h2>
					<p>{t("Brief insights from your data.")}</p>
				</div>
			)}
			<div className={styles.resultsBriefNative}>
				<dl className={styles.resultsBriefList}>
					{summarySections.map((section) => (
						<div
							key={section.id}
							className={`${styles.resultsBriefItem} ${styles[`resultsBriefItem-${section.tone}`]}`}
						>
							<dt className={styles.resultsBriefTerm}>
								{t(section.title) || section.title}
							</dt>
							<dd className={styles.resultsBriefDesc}>
								{t(section.body) || section.body}
							</dd>
						</div>
					))}
				</dl>
			</div>

			{/* ── Key findings ───────────────────────────────── */}
			<div className={styles.section}>
				<div className={styles.sectionHeaderNative}>
					<h2>{t("What we found")}</h2>
					<p>{t("Each result explained in plain English — no medical jargon.")}</p>
				</div>

				<div className={styles.findingsListNative}>
					{analysisResult.findings.map((f) => {
						const statusClass = f.status === "normal" ? "good"
							: f.status === "action" ? "critical"
							: "warning";
						const displayName = t(f.name) || f.name;
						const displayMarker = t(f.marker) || f.marker;
						const showMarker = displayMarker.toLowerCase() !== displayName.toLowerCase();
						const isOpen = expandedFindingId === f.id;
						const hasNote = Boolean((f.note || "").trim());

						return (
							<div key={f.id} className={`${styles.resultCardNative} ${styles[`resultCard-${statusClass}`]}`}>
								<div className={styles.resultHeaderNative}>
									<div className={styles.resultTitleNative}>{displayName}</div>
									{showMarker && <div className={styles.resultSubtitleNative}>{displayMarker}</div>}
								</div>
								<div className={`${styles.resultStatusNative} ${styles[`resultStatusText-${statusClass}`]}`}>{t(f.statusLabel) || f.statusLabel}</div>
								
								<div className={styles.findingTopNative}>
									<span className={`${styles.findingValueNative} ${styles[`value-${statusClass}`]}`}>{f.value}</span>
								</div>

								{hasNote && (
									<button className={styles.resultActionNative} onClick={() => setExpandedFindingId(isOpen ? null : f.id)}>
										{isOpen ? t("Hide Details") : t("Why this matters")}
										<ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
									</button>
								)}
								
								{isOpen && hasNote && (
									<div className={styles.findingNoteNative}>
										{(t(f.note) || f.note)
											.split(/\n\n+/)
											.map((block) => block.trim())
											.filter(Boolean)
											.map((block, i) => {
												const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
												const heading = lines[0];
												const isHeading = /^(what this means|in simple words|what you should|what to|what helps|get emergency|urgent|still important|if this)/i.test(heading);
												const bodyLines = isHeading ? lines.slice(1) : lines;
												return (
													<div key={`${f.id}-note-${i}`} className={styles.findingNoteBlock}>
														{isHeading ? <span className={styles.findingNoteHeading}>{heading}</span> : null}
														{(isHeading ? bodyLines : lines).map((line, li) => (
															<p key={`${f.id}-line-${i}-${li}`} className={styles.findingNoteLine}>{line}</p>
														))}
													</div>
												);
											})}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* ── What to do next ────────────────────────────── */}
			<div className={styles.section}>
				<div className={styles.sectionHead}>
					<h2 className={styles.sectionTitle}>{t("What to do next")}</h2>
					<p className={styles.sectionSub}>{t("Simple steps based on your results.")}</p>
				</div>
				<div className={styles.recsList}>
					{analysisResult.recommendations.map((r, idx) => (
						<div key={r.title} className={styles.recCard}>
							<span className={styles.recStep}>{idx + 1}</span>
							<span className={styles.recIcon} data-step={idx + 1}>{r.icon}</span>
							<div className={styles.recContent}>
								<div className={styles.recTitle}>{t(r.title) || r.title}</div>
								<div className={styles.recBody}>{t(r.body) || r.body}</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
}

export default ImportOrUpload;
