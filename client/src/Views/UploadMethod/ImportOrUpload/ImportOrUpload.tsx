import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUserInfo } from "@/App/Redux/userSlice";
import { paths } from "@/App/Routes/Paths";
import {
	Upload, FileText, ShieldCheck, Zap, User, ChevronRight,
	X, CheckCircle, ArrowLeft, Loader2, Sparkles,
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
	const dispatch   = useDispatch();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [step, setStep] = useState<Step>("personal");
	const [files, setFiles] = useState<UploadedFile[]>([]);
	const [dragging, setDragging] = useState(false);

	const [info, setInfo] = useState({
		firstName: "", lastName: "", age: "",
		gender: "", bloodType: "",
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

	const handleAnalyze = () => {
		setStep("analyzing");
		dispatch(updateUserInfo({ ...info, uploadStatus: "processing" }));
		setTimeout(() => {
			dispatch(updateUserInfo({ uploadStatus: "completed" }));
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

			{/* ── Success screen ──────────────────────────────────────────── */}
			{step === "done" && (
				<div className={styles.successPage}>
					<div className={styles.successCard}>
						<div className={styles.successIcon}><CheckCircle size={40} /></div>
						<h2>Analysis complete!</h2>
						<p>Your health data has been processed. Your personalised plan is ready.</p>
						<button className={styles.primaryBtn} onClick={() => navigate(paths.dashboard.root)}>
							<Sparkles size={16} /> View my health plan
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
										<select value={info.gender} onChange={set("gender")}>
											<option value="" disabled>Select</option>
											{GENDER_OPTIONS.map((g) => <option key={g}>{g}</option>)}
										</select>
									</div>
									<div className={styles.field}>
										<label>Blood type <span className={styles.optional}>(optional)</span></label>
										<select value={info.bloodType} onChange={set("bloodType")}>
											<option value="">Unknown</option>
											{BLOOD_OPTIONS.map((b) => <option key={b}>{b}</option>)}
										</select>
									</div>
								</div>

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
