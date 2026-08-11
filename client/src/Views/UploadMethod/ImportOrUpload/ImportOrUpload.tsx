import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { updateUserInfo } from "@/App/Redux/userSlice";
import { addUploadRecord } from "@/App/Redux/uploadHistorySlice";
import type { LabFinding, Recommendation } from "@/App/Redux/uploadHistorySlice";
import { paths } from "@/App/Routes/Paths";
import { Upload, FileText, ShieldCheck, Zap, ChevronRight, CheckCircle, ArrowLeft, Loader2, Wifi, WifiOff, Brain, Stethoscope, User, Droplets, Ruler, Scale, Activity, Clock, Check, Lock, ChevronDown, Bug, Microscope, FlaskConical, Dna, Candy, ScanSearch, Waves, Info, Sparkles, Camera, Globe, Eye, EyeOff, ZoomIn } from "lucide-react";
import {
	analyzeLabResults,
	getTranslation,
	translateAnalysisResult,
} from "@/App/Services/GemmaService";
import type { GemmaLanguage, GemmaAnalysisResult, AnalyzeProgressPhase } from "@/App/Services/GemmaService";
import { useGemmaConnection } from "@/App/Hooks/useGemmaConnection";
import { enrichFindingsWithPlainNotes } from "@/App/Utils/buildResultsSummary";
import { extractPdfContent, readTextFile } from "@/App/Utils/extractFileText";
import { renderRecommendationIcon } from "@/App/Utils/renderRecommendationIcon";
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
	{ id: "malaria_rdt", icon: <Bug size={18} />, title: "Malaria RDT Strip", desc: "Positive for P. falciparum malaria" },
	{ id: "cbc_anemia", icon: <Activity size={18} />, title: "Full Blood Count", desc: "Severe anemia & likely infection" },
	{ id: "typhoid", icon: <Microscope size={18} />, title: "Typhoid Test (Widal)", desc: "Positive for Salmonella typhi" },
	{ id: "hep_b", icon: <Dna size={18} />, title: "Hepatitis B Profile", desc: "Reactive HBsAg screening" },
	{ id: "fbs_diabetes", icon: <Candy size={18} />, title: "Fasting Blood Sugar", desc: "Elevated glucose levels (Diabetes)" },
	{ id: "sickle_cell", icon: <ScanSearch size={18} />, title: "Sickle Cell Screening", desc: "Hb electrophoresis (Sickle Trait)" },
	{ id: "urinalysis", icon: <FlaskConical size={18} />, title: "Urinalysis Report", desc: "Dehydration & urinary tract infection" },
	{ id: "cholera", icon: <Waves size={18} />, title: "Stool Analysis", desc: "Suspicion of acute watery diarrhea" },
];

// ─── Component ────────────────────────────────────────────────────────────────

function AiThinkingStatus({ phase, gemmaOnline, t }: { phase: string | null; gemmaOnline: boolean; t: (s: string) => string }) {
	const [elapsed, setElapsed] = useState(0);
	const [msgIndex, setMsgIndex] = useState(0);

	const messages = [
		"Genetiq AI is interpreting your lab values...",
		"Cross-referencing with medical reference ranges...",
		"Reasoning through your health profile...",
		"Formulating localized care recommendations...",
		"Finalizing your personalized health plan..."
	];

	useEffect(() => {
		if (phase !== "ai" || !gemmaOnline) return;
		const timer = setInterval(() => setElapsed(e => e + 1), 1000);
		const msgTimer = setInterval(() => setMsgIndex(i => (i + 1) % messages.length), 3000);
		return () => { clearInterval(timer); clearInterval(msgTimer); };
	}, [phase, gemmaOnline]);

	if (phase !== "ai" || !gemmaOnline) return null;

	return (
		<div className={styles.aiThinkingStatusWrapper}>
			<p className={styles.aiThinkingMessage}>
				<Sparkles size={16} className={styles.aiThinkingSparkleIcon} />
				{t(messages[msgIndex])}
			</p>
			<div className={styles.aiThinkingTimerPill}>
				<Clock size={13} />
				<span>{t("Estimated time")}: ~5s ({t("Elapsed")}: {elapsed}s)</span>
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
	const cameraInputRef = useRef<HTMLInputElement>(null);
	const [zoomModalUrl, setZoomModalUrl] = useState<string | null>(null);
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
							<div className={styles.aiOrbit3} />
							<div className={styles.aiCore}>
								<Brain size={28} />
							</div>
						</div>
						
						<h2 className={styles.overlayTitle}>
							{t(analyzeStatus.message) || t("Analysing your results with Gemma AI…")}
						</h2>

						{analyzePhase === "ai" && gemmaOnline && !cpuFastMode ? (
							<AiThinkingStatus phase={analyzePhase} gemmaOnline={gemmaOnline} t={t} />
						) : (
							<p className={styles.overlaySubtitle}>
								{analyzePhase === "ocr"
									? t("Extracting values from your photo on this device, then AI will interpret them.")
									: gemmaOnline && cpuFastMode
										? t("Reading your lab text and building your personalised report — this is fast on CPU.")
										: gemmaAvailable || mode === "starting"
											? t("Waiting for the AI model to finish loading, then your results will be ready.")
											: t("Building your personalised health insights with smart offline analysis.")
								}
							</p>
						)}

						<div className={styles.analyzeProgressTrack}>
							<div
								className={styles.analyzeProgressFill}
								style={{ width: `${Math.max(15, analyzeStatus.pct || 45)}%` }}
							/>
						</div>

						<div
							className={`${styles.gemmaStatusBadge} ${styles[`gemmaStatusBadge-${analyzeConnBadge.tone}`]}`}
						>
							{analyzeConnBadge.icon === "live" && <Wifi size={12} />}
							{analyzeConnBadge.icon === "spin" && (
								<Loader2 size={12} className={styles.gemmaStatusSpinner} />
							)}
							{analyzeConnBadge.icon === "offline" && <Brain size={12} />}
							{analyzeConnBadge.icon === "scan" && <FileText size={12} />}
							{t(analyzeConnBadge.label)}
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
						<ArrowLeft size={16} /> <span className={styles.backBtnText}>Back</span>
					</button>

					<div className={`${styles.steps} ${styles.stepsMobile}`}>
						<div className={`${styles.step} ${step === "upload" ? styles.stepDone : styles.stepActive}`}>
							<span className={styles.stepNum}>
								{step === "upload" ? <CheckCircle size={13} /> : "1"}
							</span>
							<span className={styles.stepText}>About You</span>
						</div>
						<div className={`${styles.stepLine} ${step === "upload" ? styles.stepLineDone : ""}`} />
						<div className={`${styles.step} ${step === "upload" ? styles.stepActive : styles.stepIdle}`}>
							<span className={styles.stepNum}>2</span>
							<span className={styles.stepText}>Upload Results</span>
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

					{/* Hero text with Human-Centered privacy badge */}
					<div className={styles.uploadHubHero}>
						<div className={styles.uploadHubPrivacyChip}>
							<ShieldCheck size={13} /> <span className={styles.privacyFullText}>{t("Private & Confidential")} · {t("Processed locally on your device")}</span><span className={styles.privacyMobileText}>{t("Private & Local AI")}</span>
						</div>
						<h1>{t("Analyze your lab results")}</h1>
						<p className={styles.heroSubFull}>{t("Get plain-English insights from any medical report in seconds.")}</p>
						<p className={styles.heroSubMobile}>{t("Get plain-English insights in seconds.")}</p>
					</div>

					{/* Main Card */}
					<div className={styles.uploadHubCard}>
						
						{/* HCD Segmented Tabs */}
						<div className={styles.uploadHubTabs}>
							<button 
								className={`${styles.uploadHubTab} ${uploadTab === "file" ? styles.uploadHubTabActive : ""}`}
								onClick={() => setUploadTab("file")}
							>
								<Upload size={16} /> {t("Upload File")}
							</button>
							<button 
								className={`${styles.uploadHubTab} ${uploadTab === "text" ? styles.uploadHubTabActive : ""}`}
								onClick={() => setUploadTab("text")}
							>
								<FileText size={16} /> {t("Paste Text")}
							</button>
							<button 
								className={`${styles.uploadHubTab} ${uploadTab === "preset" ? styles.uploadHubTabActive : ""}`}
								onClick={() => setUploadTab("preset")}
							>
								<FlaskConical size={16} /> {t("Try a Sample")}
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
										<input
											ref={cameraInputRef}
											type="file"
											accept="image/*"
											capture="environment"
											style={{ display: "none" }}
											onChange={(e) => addFiles(e.target.files)}
										/>
										<div className={styles.uploadHubDropIcon}><Upload size={24} /></div>
										<h3>{t("Drop files here or browse")}</h3>
										<p>{t("PDF, JPG, PNG, or CSV up to 25MB")}</p>

										<div className={styles.uploadHubDropzoneBtns}>
											<button
												type="button"
												className={styles.uploadHubBrowseBtn}
												onClick={(e) => {
													e.stopPropagation();
													fileInputRef.current?.click();
												}}
											>
												<FileText size={14} /> {t("Browse Files")}
											</button>
											<button
												type="button"
												className={styles.uploadHubCameraBtn}
												onClick={(e) => {
													e.stopPropagation();
													cameraInputRef.current?.click();
												}}
											>
												<Camera size={14} /> {t("Snap Photo")}
											</button>
										</div>
									</div>

									<div className={styles.uploadHubTipCard}>
										<Info size={15} className={styles.uploadHubTipIcon} />
										<span>
											<strong>{t("Human-Centered Privacy Guarantee")}:</strong> {t("Your lab documents are processed locally. We never share or sell your personal medical data.")}
										</span>
									</div>

									{files.length > 0 && (
										<div className={styles.uploadFileList} style={{ marginTop: '24px' }}>
											{files.map(({ file, progress, done, previewUrl, hidePreview }) => (
												<div key={file.name} className={`${styles.filePreviewCard} ${done ? styles.filePreviewCardDone : ""}`}>
													{/* Card Header */}
													<div className={styles.filePreviewHeader}>
														<div className={styles.filePreviewTitleGroup}>
															<span className={styles.filePreviewBadge}>
																<ScanSearch size={13} color="#00a69d" strokeWidth={2.2} /> {t("Preview")}
															</span>
															<span className={styles.filePreviewFileName}>{file.name}</span>
														</div>
														<div className={styles.filePreviewHeaderActions}>
															{done ? (
																<span className={styles.fileReadyChip}>
																	<CheckCircle size={12} color="#10b981" strokeWidth={2.2} /> {t("Ready")}
																</span>
															) : (
																<span className={styles.fileUploadingChip}>
																	<Loader2 size={12} className={styles.spinner} color="#00a69d" /> {t("Uploading")}
																</span>
															)}
															<button 
																type="button" 
																className={styles.fileActionBtn} 
																onClick={(e) => { e.stopPropagation(); removeFile(file); }}
																title="Remove document"
																aria-label="Remove document"
															>
																<svg 
																	width="14" 
																	height="14" 
																	viewBox="0 0 24 24" 
																	fill="none" 
																	stroke="#ef4444" 
																	strokeWidth="2.5" 
																	strokeLinecap="round" 
																	strokeLinejoin="round"
																	style={{ display: 'block', width: 14, height: 14, stroke: '#ef4444' }}
																>
																	<line x1="18" y1="6" x2="6" y2="18" style={{ stroke: '#ef4444', strokeWidth: 2.5 }} />
																	<line x1="6" y1="6" x2="18" y2="18" style={{ stroke: '#ef4444', strokeWidth: 2.5 }} />
																</svg>
															</button>
														</div>
													</div>

													{/* Image Frame with Floating Toolbar */}
													{previewUrl && !hidePreview ? (
														<div className={styles.previewImageFrame}>
															<img src={previewUrl} alt="Lab Report Preview" className={styles.previewImg} />
															
															{/* Floating Hover Controls */}
															<div className={styles.previewFloatingToolbar}>
																<button 
																	type="button" 
																	className={styles.previewToolbarBtn}
																	onClick={() => setZoomModalUrl(previewUrl)}
																	title="Zoom image"
																>
																	<ZoomIn size={14} color="#ffffff" strokeWidth={2.2} /> {t("Zoom")}
																</button>
																<button 
																	type="button" 
																	className={styles.previewToolbarBtn}
																	onClick={(e) => togglePreview(file, e)}
																	title="Hide preview"
																>
																	<EyeOff size={14} color="#ffffff" strokeWidth={2.2} /> {t("Hide")}
																</button>
															</div>
														</div>
													) : (
														<div className={styles.previewHiddenNotice}>
															<span><FileText size={15} color="var(--iou-muted)" /> {t("Document attached")}</span>
															{previewUrl && (
																<button 
																	type="button" 
																	className={styles.showPreviewLinkBtn}
																	onClick={(e) => togglePreview(file, e)}
																>
																	<Eye size={13} color="#00a69d" strokeWidth={2.2} /> {t("Show preview")}
																</button>
															)}
														</div>
													)}

													{/* Footer Details Row */}
													<div className={styles.filePreviewFooter}>
														<div className={styles.fileMetaDetails}>
															<span className={styles.fileSizeText}>{(file.size / 1024).toFixed(0)} KB</span>
														</div>
														{!done && (
															<div className={styles.fileProgressWrapper}>
																<div className={styles.fileProgressBar}>
																	<div className={styles.fileProgressFill} style={{ width: `${progress}%` }} />
																</div>
																<span className={styles.fileProgressPct}>{progress}%</span>
															</div>
														)}
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
												{t("Paste lab results")} 
											</label>
											<p className={styles.uploadLabTextSubtitle}>
												{t("Use this if your photo is unclear or if you only have text.")}
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
											<span className={styles.uploadPresetEmoji}>{preset.icon}</span>
											<div className={styles.uploadPresetText}>
												<span className={styles.uploadPresetTitle}>{t(preset.title)}</span>
												<span className={styles.uploadPresetDesc}>{t(preset.desc)}</span>
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
								<Brain size={18} />
								{canAnalyze
									? hasLabText && !allDone && !selectedPreset
										? t("Analyse pasted results")
										: t(`Analyse with ${gemmaOnline ? "Genetiq AI" : "AI"}`)
									: allDone
										? t("Analyse my results")
										: files.length > 0
											? t("Uploading…")
											: t("Add results to analyse")
								}
							</button>
							<button className={styles.uploadHubBtnGhost} onClick={() => navigate(paths.dashboard.root)}>
								{t("Skip for now")}
							</button>
						</div>
					</div>

					{/* Trust Footer */}
					<div className={styles.uploadHubTrustFooter}>
						<div className={styles.uploadHubTrustItem}>
							<ShieldCheck size={14} /> {t("Encrypted & Private")}
						</div>
						<div className={styles.uploadHubTrustItem}>
							<Zap size={14} /> {t("Instant Analysis")}
						</div>
						<div className={styles.uploadHubTrustItem}>
							<Brain size={14} /> {t("Local Genetiq AI")}
						</div>
						<div className={styles.uploadHubTrustItem}>
							<Globe size={14} /> {t("Ghanaian Languages")}
						</div>
					</div>
				</div>
			)}
			</>
			)}

			{/* ── Zoom Lightbox Modal ─────────────────── */}
			{zoomModalUrl && (
				<div className={styles.zoomModalOverlay} onClick={() => setZoomModalUrl(null)}>
					<div className={styles.zoomModalContent} onClick={(e) => e.stopPropagation()}>
						<button className={styles.zoomModalCloseBtn} onClick={() => setZoomModalUrl(null)} aria-label="Close zoomed report">
							<svg 
								width="18" 
								height="18" 
								viewBox="0 0 24 24" 
								fill="none" 
								stroke="#ffffff" 
								strokeWidth="2.5" 
								strokeLinecap="round" 
								strokeLinejoin="round"
								style={{ display: 'block', width: 18, height: 18, stroke: '#ffffff' }}
							>
								<line x1="18" y1="6" x2="6" y2="18" style={{ stroke: '#ffffff', strokeWidth: 2.5 }} />
								<line x1="6" y1="6" x2="18" y2="18" style={{ stroke: '#ffffff', strokeWidth: 2.5 }} />
							</svg>
						</button>
						<img src={zoomModalUrl} alt="Zoomed Lab Report" className={styles.zoomModalImg} />
					</div>
				</div>
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
	const [findingFilter, setFindingFilter] = useState<"all" | "attention" | "normal">("all");

	const scoreTier = useMemo(() => {
		const score = analysisResult?.healthScore ?? 0;
		if (score <= 50) {
			return {
				key: "attention" as const,
				label: "Needs attention",
				range: "0 – 50",
				plain: "Some test markers fall outside standard reference ranges.",
				explanation: "A score in the 0–50 range means 1 or more lab markers are outside normal limits. This is a prompt for a routine medical review—not a cause for panic. Everyday factors like hydration, minor infections, or sample timing can affect lab numbers.",
			};
		}
		if (score <= 74) {
			return {
				key: "improve" as const,
				label: "Room to improve",
				range: "51 – 74",
				plain: "Most values are stable, but a few markers show minor variations.",
				explanation: "A score in the 51–74 range indicates mostly steady health with a couple of values to monitor over time.",
			};
		}
		if (score <= 89) {
			return {
				key: "good" as const,
				label: "Looking good",
				range: "75 – 89",
				plain: "Your lab results fall mostly within standard healthy reference ranges.",
				explanation: "A score in the 75–89 range reflects healthy baseline values. Maintain your routine wellness habits.",
			};
		}
		return {
			key: "excellent" as const,
			label: "Optimal",
			range: "90 – 100",
			plain: "All extracted lab values fall cleanly within expected healthy reference ranges.",
			explanation: "A score in the 90–100 range means all analyzed test markers are within standard optimal limits.",
		};
	}, [analysisResult?.healthScore]);

	const normalCount = useMemo(() => {
		return (analysisResult?.findings || []).filter((f) => f.status === "normal").length;
	}, [analysisResult?.findings]);

	const attentionCount = useMemo(() => {
		return (analysisResult?.findings || []).filter((f) => f.status !== "normal").length;
	}, [analysisResult?.findings]);

	const filteredFindings = useMemo(() => {
		const findings = analysisResult?.findings || [];
		if (findingFilter === "attention") {
			return findings.filter((f) => f.status !== "normal");
		}
		if (findingFilter === "normal") {
			return findings.filter((f) => f.status === "normal");
		}
		return findings;
	}, [analysisResult?.findings, findingFilter]);

	const scoreBands = useMemo(
		() => [
			{
				key: "attention" as const,
				range: "0 – 50",
				label: "Needs attention",
				hint: "1 or more markers outside reference range",
				active: (analysisResult?.healthScore ?? 0) <= 50,
			},
			{
				key: "improve" as const,
				range: "51 – 74",
				label: "Room to improve",
				hint: "Minor variations from baseline",
				active: (analysisResult?.healthScore ?? 0) > 50 && (analysisResult?.healthScore ?? 0) <= 74,
			},
			{
				key: "good" as const,
				range: "75 – 89",
				label: "Looking good",
				hint: "Mostly within healthy limits",
				active: (analysisResult?.healthScore ?? 0) > 74 && (analysisResult?.healthScore ?? 0) <= 89,
			},
			{
				key: "excellent" as const,
				range: "90 – 100",
				label: "Optimal",
				hint: "All markers in standard optimal range",
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
									{renderRecommendationIcon(rec.icon, 20)}
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

				{/* Quick snapshot chips */}
				<div className={styles.scoreSnapshotBar}>
					<span className={styles.scoreSnapshotChipGood}>
						<CheckCircle size={12} /> {normalCount} {t("Normal")}
					</span>
					{attentionCount > 0 && (
						<span className={styles.scoreSnapshotChipAttention}>
							<Info size={12} /> {attentionCount} {t("Need Attention")}
						</span>
					)}
				</div>
				
				<div className={styles.miniScale}>
					<div className={`${styles.miniScaleSeg} ${styles.seg1}`}></div>
					<div className={`${styles.miniScaleSeg} ${styles.seg2}`}></div>
					<div className={`${styles.miniScaleSeg} ${styles.seg3}`}></div>
					<div className={`${styles.miniScaleSeg} ${styles.seg4}`}></div>
					<div className={styles.miniScaleMarker} style={{ left: `${Math.min(100, Math.max(0, analysisResult.healthScore))}%` }}></div>
				</div>

				{/* Score explanation box */}
				<div className={styles.scoreExplanationBox}>
					<div className={styles.scoreExplanationHeader}>
						<Info size={14} />
						<span>{t("What this score range means")} ({scoreTier.range})</span>
					</div>
					<p className={styles.scoreExplanationText}>
						{t(scoreTier.explanation)}
					</p>
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

				{/* HCD Finding Filter Tabs */}
				<div className={styles.findingFilterBar}>
					<button
						type="button"
						className={`${styles.findingFilterTab} ${findingFilter === "all" ? styles.findingFilterTabActive : ""}`}
						onClick={() => setFindingFilter("all")}
					>
						{t("All Results")} ({analysisResult.findings.length})
					</button>
					<button
						type="button"
						className={`${styles.findingFilterTab} ${findingFilter === "attention" ? styles.findingFilterTabActive : ""}`}
						onClick={() => setFindingFilter("attention")}
					>
						{t("Needs Attention")} ({attentionCount})
					</button>
					<button
						type="button"
						className={`${styles.findingFilterTab} ${findingFilter === "normal" ? styles.findingFilterTabActive : ""}`}
						onClick={() => setFindingFilter("normal")}
					>
						{t("Normal")} ({normalCount})
					</button>
				</div>

				<div className={styles.findingsListNative}>
					{filteredFindings.map((f) => {
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
							<span className={styles.recIcon} data-step={idx + 1}>
								{renderRecommendationIcon(r.icon, 20)}
							</span>
							<div className={styles.recContent}>
								<div className={styles.recTitle}>{t(r.title) || r.body ? t(r.title) : r.title}</div>
								<div className={styles.recBody}>{t(r.body) || r.body}</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* ── Empathetic HCD Disclaimer Footer ──────────────── */}
			<div className={styles.hcdDisclaimerCard}>
				<div className={styles.hcdDisclaimerHeader}>
					<ShieldCheck size={18} />
					<span>{t("This analysis is for information only")}</span>
				</div>
				<p className={styles.hcdDisclaimerText}>
					{t("Always speak to a qualified doctor or pediatrician about your health. Visit your nearest CHPS compound or health center for clinical evaluation.")}
				</p>
			</div>
		</>
	);
}

export default ImportOrUpload;
