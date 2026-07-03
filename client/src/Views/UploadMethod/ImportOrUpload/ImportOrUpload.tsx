import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { updateUserInfo } from "@/App/Redux/userSlice";
import { addUploadRecord } from "@/App/Redux/uploadHistorySlice";
import type { LabFinding, Recommendation } from "@/App/Redux/uploadHistorySlice";
import { paths } from "@/App/Routes/Paths";
import {
	Upload, FileText, ShieldCheck, Zap, ChevronRight,
	X, CheckCircle, ArrowLeft, Loader2, Sparkles, ChevronDown,
	Wifi, WifiOff, Brain, Stethoscope,
} from "lucide-react";
import {
	analyzeLabResults,
	checkGemmaHealth,
	getTranslation,
} from "@/App/Services/GemmaService";
import type { GemmaLanguage, GemmaAnalysisResult } from "@/App/Services/GemmaService";
import styles from "./ImportOrUpload.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "personal" | "upload" | "analyzing" | "done";

interface UploadedFile {
	file: File;
	progress: number;
	done: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_OPTIONS  = ["Male", "Female", "Non-binary", "Prefer not to say"];
const BLOOD_OPTIONS   = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−", "Unknown"];

const LANGUAGES: { id: GemmaLanguage; label: string; flag: string; code: string }[] = [
	{ id: "english", label: "English", flag: "🇬🇧", code: "EN" },
	{ id: "twi", label: "Twi", flag: "🇬🇭", code: "TW" },
	{ id: "ga", label: "Ga", flag: "🇬🇭", code: "GA" },
	{ id: "ewe", label: "Ewe", flag: "🇬🇭", code: "EW" },
	{ id: "fante", label: "Fante", flag: "🇬🇭", code: "FT" },
];

const PRESETS = [
	{ id: "malaria_rdt", emoji: "🦟", title: "Malaria RDT Strip", desc: "Positive for P. falciparum malaria" },
	{ id: "cbc_anemia", emoji: "🩸", title: "CBC — Severe Anemia", desc: "Critically low hemoglobin levels" },
	{ id: "typhoid", emoji: "📝", title: "Typhoid Lab Result", desc: "Widal test positive for S. typhi" },
	{ id: "urinalysis", emoji: "🧪", title: "Urinalysis Report", desc: "Dehydration and urinary infection" },
];

// ─── Component ────────────────────────────────────────────────────────────────

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
	const [selectedLanguage, setSelectedLanguage] = useState<GemmaLanguage>("english");
	const [gemmaOnline, setGemmaOnline] = useState(false);
	const [analysisResult, setAnalysisResult] = useState<GemmaAnalysisResult | null>(null);

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

	// Check Gemma server on mount
	useEffect(() => {
		checkGemmaHealth().then((h) => setGemmaOnline(h.available && h.modelLoaded));
	}, []);

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
			file, progress: 0, done: false,
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
		setFiles((p) => p.filter((f) => f.file !== file));

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
		setFiles([]); // Clear files if preset selected
	};

	// ── Step 2: Analyze with Gemma ────────────────────────────────────────────

	const handleAnalyze = async () => {
		setStep("analyzing");
		dispatch(updateUserInfo({ ...info, uploadStatus: "processing" }));

		try {
			// Convert first uploaded file to base64 if present
			let imageBase64: string | undefined;
			if (files.length > 0 && !selectedPreset) {
				const file = files[0].file;
				if (file.type.startsWith("image/")) {
					imageBase64 = await fileToBase64(file);
				}
			}

			const result = await analyzeLabResults({
				imageBase64,
				presetId: selectedPreset || undefined,
				patientAge: info.age || "35",
				patientGender: info.gender || "unknown",
				language: selectedLanguage,
			});

			setAnalysisResult(result);

			// Convert Gemma findings to Redux format
			const findings: LabFinding[] = result.findings.map((f) => ({
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

			dispatch(updateUserInfo({ uploadStatus: "completed" }));
			dispatch(addUploadRecord({
				id: crypto.randomUUID(),
				uploadedAt: new Date().toISOString(),
				fileName: selectedPreset
					? PRESETS.find((p) => p.id === selectedPreset)?.title || "Preset Analysis"
					: files.map((f) => f.file.name).join(", "),
				healthScore: result.healthScore,
				findings,
				recommendations,
				firstName: info.firstName,
				lastName: info.lastName,
				age: info.age,
				gender: info.gender,
				bloodType: info.bloodType,
			}));
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
	const canAnalyze = allDone || !!selectedPreset;

	// Helper to translate status labels
	const t = (text: string) => getTranslation(text, selectedLanguage);

	// ─────────────────────────────────────────────────────────────────────────

	return (
		<div className={styles.page}>

			{/* ── Analyzing overlay ───────────────────────────────────── */}
			{step === "analyzing" && (
				<div className={styles.overlay}>
					<div className={styles.overlayCard}>
						<div className={styles.spinnerRing} />
						<h2>
							{gemmaOnline ? "Gemma 4 is analysing your results…" : "Analysing your results…"}
						</h2>
						<p>
							{gemmaOnline
								? "Gemma 4 AI is processing your lab data with multimodal vision."
								: "Our AI is reading every value and building your personalised plan."
							}
						</p>
						<div className={styles.gemmaStatusBadge}>
							{gemmaOnline ? (
								<><Wifi size={12} /> Powered by Gemma 4 Local</>
							) : (
								<><Brain size={12} /> Smart Offline Mode</>
							)}
						</div>
					</div>
				</div>
			)}

			{/* ── AI Results screen ─────────────────────────────────── */}
			{step === "done" && analysisResult && (
				<div className={styles.resultsPage}>

					{/* ── Score hero ─────────────────────────────────── */}
					<div className={styles.resultsHero}>
						<div className={styles.scoreMobileWrapper}>
							<div className={styles.scoreRing}>
								<svg viewBox="0 0 120 120" className={styles.ringsvg}>
									<circle cx="60" cy="60" r="52" fill="none" className={styles.ringTrack} strokeWidth="8"/>
									<circle cx="60" cy="60" r="52" fill="none" className={styles.ringProgress} strokeWidth="8"
										strokeDasharray="326.7"
										strokeDashoffset={326.7 - (326.7 * analysisResult.healthScore / 100)}
										strokeLinecap="round" transform="rotate(-90 60 60)"/>
								</svg>
								<div className={styles.scoreInner}>
									<span className={styles.scoreNum}>{analysisResult.healthScore}</span>
									<span className={styles.scoreLabel}>{t("Health Score")}</span>
								</div>
							</div>
							<span className={styles.scoreLabelMobile}>{t("Health Score")}</span>
						</div>

						<div className={styles.heroText}>
							<div className={styles.resultsBadge}>
								<CheckCircle size={13}/> {t("Your results are ready")}
							</div>
							<h1>{t("Your results are ready")}</h1>
							<p>{analysisResult.summary}</p>

							{/* Language selector */}
							<div className={styles.langRow}>
								{LANGUAGES.map((lang) => (
									<button
										key={lang.id}
										className={`${styles.langPill} ${lang.id === selectedLanguage ? styles.langPillActive : ""}`}
										onClick={() => setSelectedLanguage(lang.id)}
									>
										{lang.flag} {lang.label}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* ── Score breakdown ────────────────────────────── */}
					<div className={styles.scoreBreakdown}>
						<div className={`${styles.scoreBar} ${analysisResult.healthScore <= 50 ? styles.active : ""} ${styles.good}`}>
							<span>0 – 50</span><span>{t("Needs attention")}</span>
						</div>
						<div className={`${styles.scoreBar} ${analysisResult.healthScore > 50 && analysisResult.healthScore <= 74 ? styles.active : ""} ${styles.warning}`}>
							<span>51 – 74</span><span>{t("Room to improve")}</span>
						</div>
						<div className={`${styles.scoreBar} ${analysisResult.healthScore > 74 && analysisResult.healthScore <= 89 ? styles.active : ""} ${styles.great}`}>
							<span>75 – 89</span><span>{t("Good")}</span>
						</div>
						<div className={`${styles.scoreBar} ${analysisResult.healthScore > 89 ? styles.active : ""}`}>
							<span>90 – 100</span><span>{t("Excellent")}</span>
						</div>
					</div>

					{/* ── Key findings ───────────────────────────────── */}
					<div className={styles.section}>
						<div className={styles.sectionHead}>
							<h2 className={styles.sectionTitle}>{t("What we found")}</h2>
							<p className={styles.sectionSub}>{t("Each result explained in plain English — no medical jargon.")}</p>
						</div>

						<div className={styles.findingsGrid}>
							{analysisResult.findings.map((f) => {
								const statusClass = f.status === "normal" ? "good"
									: f.status === "action" ? "critical"
									: "warning";
								return (
									<div key={f.id} className={`${styles.findingCard} ${styles[`card-${statusClass}`]}`}>
										<div className={styles.cardBody}>
											<div className={styles.cardTop}>
												<div className={styles.cardNames}>
													<span className={styles.cardMarker}>{t(f.name) || f.name}</span>
													<span className={styles.cardSub}>{t(f.marker) || f.marker}</span>
												</div>
												<span className={`${styles.cardBadge} ${styles[`badge-${statusClass}`]}`}>
													{t(f.statusLabel) || f.statusLabel}
												</span>
											</div>
											<div className={styles.cardValue}>
												<span className={styles.cardNum}>{f.value}</span>
											</div>
											<div className={styles.cardDivider} />
											<p className={styles.cardNote}>{t(f.note) || f.note}</p>
										</div>
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
							{analysisResult.recommendations.map((r) => (
								<div key={r.title} className={styles.recCard}>
									<span className={styles.recIcon}>{r.icon}</span>
									<div>
										<div className={styles.recTitle}>{t(r.title) || r.title}</div>
										<div className={styles.recBody}>{t(r.body) || r.body}</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* ── Disclaimer ─────────────────────────────────── */}
					<div className={styles.disclaimer}>
						<ShieldCheck size={14} />
						<span>
							{t("This analysis is for information only") ||
								"This analysis is for information only and does not replace professional medical advice."}{" "}
							{t("Always speak to a qualified doctor about your health.")}
							{" "}{t("Visit your nearest CHPS compound") || ""}
						</span>
					</div>

					{/* ── CTAs ───────────────────────────────────────── */}
					<div className={styles.resultsCtas}>
						<button className={styles.primaryBtn} onClick={() => navigate(paths.dashboard.root)}>
							<Sparkles size={16} /> {t("Go to my dashboard")}
						</button>
						<button className={styles.outlineBtn} onClick={() => navigate(paths.clinicalHistory)}>
							<FileText size={16} /> {t("View clinical history")}
						</button>
						<button
							className={styles.ghostBtn}
							onClick={() => {
								setFiles([]);
								setSelectedPreset(null);
								setAnalysisResult(null);
								setStep("upload");
								window.scrollTo({ top: 0, behavior: "smooth" });
							}}
						>
							<Upload size={14} /> {t("Upload more results")}
						</button>
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
					<div className={styles.content}>
						<div className={styles.titleBlock}>
							<h1>Tell us about <span className={styles.teal}>yourself</span></h1>
							<p>We use this to personalise your health insights. Takes 30 seconds.</p>
						</div>

						<form className={styles.card} onSubmit={handlePersonalSubmit}>
							<div className={styles.formGrid}>
								<div className={styles.field}>
									<label>First name</label>
									<input placeholder="e.g. Kwame" value={info.firstName} onChange={set("firstName")} required />
								</div>
								<div className={styles.field}>
									<label>Last name</label>
									<input placeholder="e.g. Mensah" value={info.lastName} onChange={set("lastName")} required />
								</div>
								<div className={styles.field}>
									<label>Age</label>
									<input type="number" min="1" max="120" placeholder="e.g. 34" value={info.age} onChange={set("age")} required />
								</div>
								<div className={styles.field}>
									<label>Gender</label>
									<div className={styles.selectWrap}>
										<select value={info.gender} onChange={set("gender")}>
											<option value="" disabled>Select gender</option>
											{GENDER_OPTIONS.map((g) => <option key={g}>{g}</option>)}
										</select>
										<ChevronDown size={16} className={styles.selectChevron} />
									</div>
								</div>
								<div className={styles.field}>
									<label>Blood type <span className={styles.optional}>(optional)</span></label>
									<div className={styles.selectWrap}>
										<select value={info.bloodType} onChange={set("bloodType")}>
											<option value="">Unknown</option>
											{BLOOD_OPTIONS.map((b) => <option key={b}>{b}</option>)}
										</select>
										<ChevronDown size={16} className={styles.selectChevron} />
									</div>
								</div>
								<div className={styles.field}>
									<label>Height <span className={styles.optional}>(optional)</span></label>
									<div className={styles.unitInput}>
										<input
											type="number" min="50" max="300"
											placeholder="e.g. 175"
											value={info.height}
											onChange={set("height")}
										/>
										<span className={styles.unitLabel}>cm</span>
									</div>
								</div>
								<div className={styles.field}>
									<label>Weight <span className={styles.optional}>(optional)</span></label>
									<div className={styles.unitInput}>
										<input
											type="number" min="10" max="500"
											placeholder="e.g. 72"
											value={info.weight}
											onChange={set("weight")}
										/>
										<span className={styles.unitLabel}>kg</span>
									</div>
								</div>
							</div>

							{/* Live BMI preview */}
							{(() => {
								const h = Number(info.height);
								const w = Number(info.weight);
								if (!h || !w) return null;
								const bmi = w / ((h / 100) * (h / 100));
								const cat =
									bmi < 18.5 ? { label: "Underweight", color: "#60a5fa" } :
									bmi < 25   ? { label: "Normal",      color: "#00A69D" } :
									bmi < 30   ? { label: "Overweight",  color: "#fbbf24" } :
									             { label: "Obese",       color: "#ef4444" };
								return (
									<div className={styles.bmiPreview}>
										<span className={styles.bmiPreviewLabel}>BMI</span>
										<span className={styles.bmiPreviewValue} style={{ color: cat.color }}>{bmi.toFixed(1)}</span>
										<span className={styles.bmiPreviewCat} style={{ color: cat.color }}>— {cat.label}</span>
									</div>
								);
							})()}

							<button type="submit" className={styles.primaryBtn}>
								Continue <ChevronRight size={16} />
							</button>
						</form>
					</div>
				)}

				{/* Step 2 — Upload */}
			{step === "upload" && (
				<div className={styles.content}>
					<div className={styles.titleBlock}>
						<h1>Upload your <span className={styles.teal}>lab results</span></h1>
						<p>PDF, image, or CSV — our AI reads every format and explains it all in plain English.</p>
					</div>

					{/* Gemma Status + Language Row */}
					<div className={styles.gemmaBar}>
						<div className={styles.gemmaStatus}>
							{gemmaOnline ? (
								<><Wifi size={13} className={styles.gemmaOnlineIcon} /> <span>Gemma 4 Local — Running</span></>
							) : (
								<><WifiOff size={13} className={styles.gemmaOfflineIcon} /> <span>Offline Mode — No Internet Required</span></>
							)}
						</div>
						<div className={styles.langRowCompact}>
							{LANGUAGES.map((lang) => (
								<button
									key={lang.id}
									className={`${styles.langPillSmall} ${lang.id === selectedLanguage ? styles.langPillSmallActive : ""}`}
									onClick={() => setSelectedLanguage(lang.id)}
									title={`View results in ${lang.label}`}
								>
									<span>{lang.flag}</span>
									<span className={styles.langCode}>{lang.code}</span>
								</button>
							))}
						</div>
					</div>

					{/* Ghanaian Medical Presets */}
					<div className={styles.presetsSection}>
						<div className={styles.presetsHeader}>
							<Stethoscope size={16} />
							<span>🇬🇭 Ghanaian Medical Case Presets</span>
						</div>
						<p className={styles.presetsSub}>Don't have a file? Try one of these common Ghanaian medical cases:</p>
						<div className={styles.presetsGrid}>
							{PRESETS.map((preset) => (
								<button
									key={preset.id}
									className={`${styles.presetCard} ${selectedPreset === preset.id ? styles.presetCardActive : ""}`}
									onClick={() => handlePresetClick(preset.id)}
								>
									<span className={styles.presetEmoji}>{preset.emoji}</span>
									<div className={styles.presetText}>
										<span className={styles.presetTitle}>{preset.title}</span>
										<span className={styles.presetDesc}>{preset.desc}</span>
									</div>
									{selectedPreset === preset.id && (
										<CheckCircle size={16} className={styles.presetCheck} />
									)}
								</button>
							))}
						</div>
					</div>

					{/* Divider */}
					<div className={styles.orDivider}>
						<span>or upload your own file</span>
					</div>

					{/* Trust row */}
					<div className={styles.trustRow}>
						{[
							{ icon: <ShieldCheck size={14}/>, text: "256-bit encrypted" },
							{ icon: <FileText size={14}/>,    text: "PDF · CSV · JPG · PNG" },
							{ icon: <Zap size={14}/>,         text: "Analysed in seconds" },
						].map((t) => (
							<span key={t.text} className={styles.trustPill}>
								{t.icon} {t.text}
							</span>
						))}
					</div>

					{/* Drop zone */}
					<div
						className={`${styles.dropZone} ${dragging ? styles.dropActive : ""}`}
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
						<div className={styles.dropIcon}><Upload size={32} /></div>
						<p className={styles.dropTitle}>Drop files here or <span>click to browse</span></p>
						<p className={styles.dropSub}>PDF, JPG, PNG, CSV · Max 25 MB per file</p>
					</div>

					{/* File list */}
					{files.length > 0 && (
						<div className={styles.fileList}>
							{files.map(({ file, progress, done }) => (
								<div key={file.name} className={styles.fileRow}>
									<div className={styles.fileIcon}>
										{done ? <CheckCircle size={18} /> : <FileText size={18} />}
									</div>
									<div className={styles.fileMeta}>
										<span className={styles.fileName}>{file.name}</span>
										<span className={styles.fileSize}>{(file.size / 1024).toFixed(0)} KB</span>
										{!done && (
											<div className={styles.progressBar}>
												<div className={styles.progressFill} style={{ width: `${progress}%` }} />
											</div>
										)}
									</div>
									{done && (
										<button className={styles.removeBtn} onClick={() => removeFile(file)}>
											<X size={14} />
										</button>
									)}
									{!done && <Loader2 size={16} className={styles.spinner} />}
								</div>
							))}
						</div>
					)}

					{/* CTA */}
					<div className={styles.ctaRow}>
						<button
							className={styles.primaryBtn}
							disabled={!canAnalyze}
							onClick={handleAnalyze}
						>
							<Sparkles size={16} />
							{canAnalyze
								? `Analyse with ${gemmaOnline ? "Gemma 4" : "AI"}`
								: allDone
									? "Analyse my results"
									: files.length > 0
										? "Uploading…"
										: "Select a preset or upload files"
							}
						</button>
						<button className={styles.ghostBtn} onClick={() => navigate(paths.dashboard.root)}>
							Skip for now
						</button>
					</div>
				</div>
			)}
			</>
			)}
		</div>
	);
};

export default ImportOrUpload;
