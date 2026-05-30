import { useState, useCallback, useRef } from "react";
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
} from "lucide-react";
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
		const newFiles: UploadedFile[] = Array.from(list).map((file) => ({
			file, progress: 0, done: false,
		}));
		setFiles((p) => [...p, ...newFiles]);

		// Simulate upload progress for each file
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

	// ── Step 2: Analyze ───────────────────────────────────────────────────────

	// The mock AI findings — in production these come from the real AI API
	const MOCK_FINDINGS: LabFinding[] = [
		{ id: "1", name: "Blood Sugar (Glucose)", marker: "Blood Sugar (Glucose)", value: "5.2 mmol/L", status: "normal", statusLabel: "Normal ✓", note: "Your blood sugar is at a healthy level. This means your body is managing energy well. Keep eating balanced meals and staying active." },
		{ id: "2", name: "Bad Cholesterol (LDL)", marker: "Bad Cholesterol (LDL)", value: "3.8 mmol/L", status: "elevated", statusLabel: "A little high", note: "LDL is the type of cholesterol that can build up in your arteries over time. Yours is slightly above the ideal range. Try eating less fried food, butter, and red meat — and add more fish, nuts, and oats to your diet." },
		{ id: "3", name: "Red Blood Cells (Haemoglobin)", marker: "Red Blood Cells (Haemoglobin)", value: "14.2 g/dL", status: "normal", statusLabel: "Normal ✓", note: "Your red blood cells are healthy. They carry oxygen around your body, and yours are doing a great job. No signs of anaemia." },
		{ id: "4", name: "Vitamin D", marker: "Vitamin D", value: "38 nmol/L", status: "low", statusLabel: "Lower than ideal", note: "Most people don't get enough Vitamin D, especially in winter. It helps your bones, mood, and immune system. Try 15 minutes of sunlight daily and consider a Vitamin D supplement (1000–2000 IU)." },
		{ id: "5", name: "Thyroid (TSH)", marker: "Thyroid", value: "2.1 mIU/L", status: "normal", statusLabel: "Normal ✓", note: "Your thyroid gland — which controls your energy and metabolism — is working exactly as it should. Nothing to worry about here." },
		{ id: "6", name: "Iron Stores (Ferritin)", marker: "Iron Stores (Ferritin)", value: "8 µg/L", status: "action", statusLabel: "Low — see a doctor", note: "Ferritin measures how much iron your body has stored. Yours is very low, which can cause tiredness, weakness, and difficulty concentrating. Please speak to your doctor soon — you may need an iron supplement." },
	];

	const MOCK_RECS: Recommendation[] = [
		{ icon: "🥗", title: "Eat more iron-rich foods", body: "Add spinach, lentils, kidney beans, and lean red meat to your meals. Pair them with Vitamin C (like orange juice) to help your body absorb iron better." },
		{ icon: "☀️", title: "Get more Vitamin D", body: "Spend 15–20 minutes outside in sunlight each day. If that's hard, a daily Vitamin D3 supplement (1000–2000 IU) is a simple fix." },
		{ icon: "🐟", title: "Help your cholesterol", body: "Swap butter for olive oil, eat more oily fish (like salmon or mackerel) twice a week, and snack on nuts instead of crisps." },
		{ icon: "🩺", title: "Book a doctor's appointment", body: "Your iron level needs medical attention. Your GP can confirm the cause and recommend the right treatment — this is the most important step right now." },
	];

	const handleAnalyze = () => {
		setStep("analyzing");
		dispatch(updateUserInfo({ ...info, uploadStatus: "processing" }));
		setTimeout(() => {
			dispatch(updateUserInfo({ uploadStatus: "completed" }));
			// Save the full upload record into Redux for the Clinical History page
			dispatch(addUploadRecord({
				id: crypto.randomUUID(),
				uploadedAt: new Date().toISOString(),
				fileName: files.map((f) => f.file.name).join(", "),
				healthScore: 75,
				findings: MOCK_FINDINGS,
				recommendations: MOCK_RECS,
				firstName: info.firstName,
				lastName: info.lastName,
				age: info.age,
				gender: info.gender,
				bloodType: info.bloodType,
			}));
			setStep("done");
		}, 3000);
	};

	const allDone   = files.length > 0 && files.every((f) => f.done);
	const anyFile   = files.length > 0;

	// ─────────────────────────────────────────────────────────────────────────

	return (
		<div className={styles.page}>

			{/* ── Analyzing overlay ───────────────────────────────────────── */}
			{step === "analyzing" && (
				<div className={styles.overlay}>
					<div className={styles.overlayCard}>
						<div className={styles.spinnerRing} />
						<h2>Analysing your results…</h2>
						<p>Our AI is reading every value and building your personalised plan.</p>
					</div>
				</div>
			)}

			{/* ── AI Results screen ─────────────────────────────────────── */}
			{step === "done" && (
				<div className={styles.resultsPage}>

					{/* ── Score hero ─────────────────────────────────────── */}
					<div className={styles.resultsHero}>
						{/* On desktop: just the ring. On mobile: ring + label below */}
						<div className={styles.scoreMobileWrapper}>
							<div className={styles.scoreRing}>
								<svg viewBox="0 0 120 120" className={styles.ringsvg}>
									<circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
									<circle cx="60" cy="60" r="52" fill="none" stroke="#00A69D" strokeWidth="8"
										strokeDasharray="326.7" strokeDashoffset="81.7"
										strokeLinecap="round" transform="rotate(-90 60 60)"/>
								</svg>
								<div className={styles.scoreInner}>
									<span className={styles.scoreNum}>75</span>
									<span className={styles.scoreLabel}>Health Score</span>
								</div>
							</div>
							{/* Mobile-only label below ring */}
							<span className={styles.scoreLabelMobile}>Health Score</span>
						</div>

						<div className={styles.heroText}>
							<div className={styles.resultsBadge}>
								<CheckCircle size={13}/> Analysis complete
							</div>
							<h1>Your results are <span className={styles.teal}>ready</span></h1>
							<p>
								We looked at your lab results and put everything into simple, easy-to-understand language.
								Your score of <strong>75 out of 100</strong> means your health is generally good,
								with a couple of things worth keeping an eye on.
							</p>
						</div>
					</div>

					{/* ── Score breakdown ────────────────────────────────── */}
					<div className={styles.scoreBreakdown}>
						<div className={`${styles.scoreBar} ${styles.good}`}>
							<span>0 – 50</span><span>Needs attention</span>
						</div>
						<div className={`${styles.scoreBar} ${styles.warning}`}>
							<span>51 – 74</span><span>Room to improve</span>
						</div>
						<div className={`${styles.scoreBar} ${styles.great} ${styles.active}`}>
							<span>75 – 89</span><span>Good — you're here ✓</span>
						</div>
						<div className={styles.scoreBar}>
							<span>90 – 100</span><span>Excellent</span>
						</div>
					</div>

					{/* ── Key findings ───────────────────────────────────── */}
					<div className={styles.section}>
						<div className={styles.sectionHead}>
							<h2 className={styles.sectionTitle}>What we found</h2>
							<p className={styles.sectionSub}>Each result explained in plain English — no medical jargon.</p>
						</div>

						<div className={styles.findingsGrid}>
							{[
								{ status: "good", marker: "Blood Sugar", sub: "Glucose", value: "5.2", unit: "mmol/L", summary: "Normal ✓", note: "Your blood sugar is at a healthy level. This means your body is managing energy well. Keep eating balanced meals and staying active." },
								{ status: "warning", marker: "Bad Cholesterol", sub: "LDL", value: "3.8", unit: "mmol/L", summary: "A little high", note: "LDL is the type of cholesterol that can build up in your arteries over time. Yours is slightly above the ideal range. Try eating less fried food, butter, and red meat — and add more fish, nuts, and oats to your diet." },
								{ status: "good", marker: "Red Blood Cells", sub: "Haemoglobin", value: "14.2", unit: "g/dL", summary: "Normal ✓", note: "Your red blood cells are healthy. They carry oxygen around your body, and yours are doing a great job. No signs of anaemia." },
								{ status: "warning", marker: "Vitamin D", sub: "25-OH", value: "38", unit: "nmol/L", summary: "Lower than ideal", note: "Most people don’t get enough Vitamin D, especially in winter. It helps your bones, mood, and immune system. Try 15 minutes of sunlight daily and consider a Vitamin D supplement (1000–2000 IU)." },
								{ status: "good", marker: "Thyroid", sub: "TSH", value: "2.1", unit: "mIU/L", summary: "Normal ✓", note: "Your thyroid gland — which controls your energy and metabolism — is working exactly as it should. Nothing to worry about here." },
								{ status: "critical", marker: "Iron Stores", sub: "Ferritin", value: "8", unit: "µg/L", summary: "Low — see a doctor", note: "Ferritin measures how much iron your body has stored. Yours is very low, which can cause tiredness, weakness, and difficulty concentrating. Please speak to your doctor soon — you may need an iron supplement." },
							].map((f) => (
								<div key={f.marker} className={`${styles.findingCard} ${styles[`card-${f.status}`]}`}>
									<div className={styles.cardBody}>
										<div className={styles.cardTop}>
											<div className={styles.cardNames}>
												<span className={styles.cardMarker}>{f.marker}</span>
												<span className={styles.cardSub}>{f.sub}</span>
											</div>
											<span className={`${styles.cardBadge} ${styles[`badge-${f.status}`]}`}>{f.summary}</span>
										</div>
										<div className={styles.cardValue}>
											<span className={styles.cardNum}>{f.value}</span>
											<span className={styles.cardUnit}>{f.unit}</span>
										</div>
										<div className={styles.cardDivider} />
										<p className={styles.cardNote}>{f.note}</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* ── What to do next ────────────────────────────────── */}
					<div className={styles.section}>
						<div className={styles.sectionHead}>
							<h2 className={styles.sectionTitle}>What to do next</h2>
							<p className={styles.sectionSub}>Simple steps based on your results.</p>
						</div>
						<div className={styles.recsList}>
							{[
								{ icon: "🥗", title: "Eat more iron-rich foods", body: "Add spinach, lentils, kidney beans, and lean red meat to your meals. Pair them with Vitamin C (like orange juice) to help your body absorb iron better." },
								{ icon: "☀️", title: "Get more Vitamin D", body: "Spend 15–20 minutes outside in sunlight each day. If that's hard, a daily Vitamin D3 supplement (1000–2000 IU) is a simple fix." },
								{ icon: "🐟", title: "Help your cholesterol", body: "Swap butter for olive oil, eat more oily fish (like salmon or mackerel) twice a week, and snack on nuts instead of crisps." },
								{ icon: "🩺", title: "Book a doctor's appointment", body: "Your iron level needs medical attention. Your GP can confirm the cause and recommend the right treatment — this is the most important step right now." },
							].map((r) => (
								<div key={r.title} className={styles.recCard}>
									<span className={styles.recIcon}>{r.icon}</span>
									<div>
										<div className={styles.recTitle}>{r.title}</div>
										<div className={styles.recBody}>{r.body}</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* ── Disclaimer ─────────────────────────────────────── */}
					<div className={styles.disclaimer}>
						<ShieldCheck size={14} />
						<span>This analysis is for information only and does not replace professional medical advice. Always speak to a qualified doctor about your health.</span>
					</div>

					{/* ── CTAs ───────────────────────────────────────────── */}
					<div className={styles.resultsCtas}>
						<button className={styles.primaryBtn} onClick={() => navigate(paths.dashboard.root)}>
							<Sparkles size={16} /> Go to my dashboard
						</button>
						<button className={styles.outlineBtn} onClick={() => navigate(paths.clinicalHistory)}>
							<FileText size={16} /> View clinical history
						</button>
						<button
							className={styles.ghostBtn}
							onClick={() => {
								setFiles([]);
								setStep("upload");
								window.scrollTo({ top: 0, behavior: "smooth" });
							}}
						>
							<Upload size={14} /> Upload more results
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
										<input placeholder="e.g. James" value={info.firstName} onChange={set("firstName")} required />
									</div>
									<div className={styles.field}>
										<label>Last name</label>
										<input placeholder="e.g. Smith" value={info.lastName} onChange={set("lastName")} required />
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
							{anyFile && (
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
									disabled={!allDone}
									onClick={handleAnalyze}
								>
									<Sparkles size={16} />
									{allDone ? "Analyse my results" : anyFile ? "Uploading…" : "Add files to continue"}
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
