import React, { useState } from "react";
import {
	ArrowLeft,
	User,
	Upload,
	ChevronDown,
	CheckCircle2,
	AlertTriangle,
	AlertCircle,
	Activity,
	FileText,
	Clock,
	Droplets,
	Lightbulb,
	InboxIcon,
	ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/App/Redux/store";
import type { UploadRecord, FindingStatus } from "@/App/Redux/uploadHistorySlice";
import { paths } from "@/App/Routes/Paths";
import styles from "./HealthHistory.module.scss";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoString: string) {
	return new Date(isoString).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function formatTime(isoString: string) {
	return new Date(isoString).toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function statusIcon(status: FindingStatus) {
	if (status === "normal")   return <CheckCircle2 size={14} />;
	if (status === "elevated") return <AlertTriangle size={14} />;
	if (status === "low")      return <AlertTriangle size={14} />;
	return <AlertCircle size={14} />;
}

function healthScoreColour(score: number) {
	if (score >= 90) return "#10b981";
	if (score >= 75) return "#00A69D";
	if (score >= 51) return "#f59e0b";
	return "#ef4444";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ScoreRing = ({ score }: { score: number }) => {
	const colour = healthScoreColour(score);
	const r = 40;
	const circ = 2 * Math.PI * r;
	const offset = circ - (score / 100) * circ;
	return (
		<div className={styles.scoreRing}>
			<svg viewBox="0 0 96 96" width="96" height="96">
				<circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
				<circle
					cx="48" cy="48" r={r} fill="none"
					stroke={colour} strokeWidth="8"
					strokeDasharray={circ} strokeDashoffset={offset}
					strokeLinecap="round"
					transform="rotate(-90 48 48)"
				/>
			</svg>
			<div className={styles.scoreInner}>
				<span className={styles.scoreNum} style={{ color: colour }}>{score}</span>
				<span className={styles.scoreLabel}>/ 100</span>
			</div>
		</div>
	);
};

// ─── Upload Record Card ───────────────────────────────────────────────────────

const RecordCard = ({ record, index }: { record: UploadRecord; index: number }) => {
	const [openFinding, setOpenFinding] = useState<string | null>(null);
	const [showRecs, setShowRecs] = useState(false);

	const toggleFinding = (id: string) =>
		setOpenFinding((prev) => (prev === id ? null : id));

	const normalCount   = record.findings.filter((f) => f.status === "normal").length;
	const attentionCount = record.findings.filter((f) => f.status !== "normal").length;

	return (
		<article className={styles.recordCard}>
			{/* Card header */}
			<div className={styles.recordHeader}>
				<div className={styles.recordMeta}>
					<div className={styles.uploadBadge}>
						<FileText size={13} />
						Upload #{index + 1}
					</div>
					<div className={styles.recordDateRow}>
						<Clock size={12} />
						<span>{formatDate(record.uploadedAt)} at {formatTime(record.uploadedAt)}</span>
					</div>
					{record.fileName && (
						<div className={styles.recordFileName}>
							<FileText size={11} />
							<span title={record.fileName}>{record.fileName}</span>
						</div>
					)}
				</div>

				{/* Health score */}
				<ScoreRing score={record.healthScore} />
			</div>

			{/* Quick stats */}
			<div className={styles.quickStats}>
				<div className={styles.statPill + " " + styles.statGood}>
					<CheckCircle2 size={12} />
					{normalCount} Normal
				</div>
				<div className={styles.statPill + " " + styles.statWarn}>
					<AlertTriangle size={12} />
					{attentionCount} Need attention
				</div>
				<div className={styles.statPill + " " + styles.statNeutral}>
					<Activity size={12} />
					{record.findings.length} markers
				</div>
			</div>

			{/* Findings list */}
			<section className={styles.findingsSection}>
				<div className={styles.sectionLabel}>
					<Activity size={14} />
					Lab Findings
				</div>
				<div className={styles.findingsList}>
					{record.findings.map((f) => {
						const isOpen = openFinding === f.id;
						return (
							<div
								key={f.id}
								className={`${styles.findingRow} ${styles[`status-${f.status}`]} ${isOpen ? styles.findingOpen : ""}`}
								onClick={() => toggleFinding(f.id)}
							>
								<div className={styles.findingSummary}>
									<div className={styles.findingLeft}>
										<span className={`${styles.statusDot} ${styles[`dot-${f.status}`]}`} />
										<div>
											<div className={styles.findingName}>{f.name}</div>
											<div className={styles.findingValue}>{f.value}</div>
										</div>
									</div>
									<div className={styles.findingRight}>
										<span className={`${styles.statusBadge} ${styles[`badge-${f.status}`]}`}>
											{statusIcon(f.status)}
											{f.statusLabel}
										</span>
										<ChevronDown
											size={14}
											className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
										/>
									</div>
								</div>

								{isOpen && (
									<div className={styles.findingNote}>
										<p>{f.note}</p>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</section>

			{/* Recommendations toggle */}
			{record.recommendations.length > 0 && (
				<section className={styles.recsSection}>
					<button
						className={styles.recsToggle}
						onClick={() => setShowRecs((v) => !v)}
					>
						<Lightbulb size={14} />
						<span>Recommendations ({record.recommendations.length})</span>
						<ChevronDown
							size={14}
							className={`${styles.chevron} ${showRecs ? styles.chevronOpen : ""}`}
						/>
					</button>

					{showRecs && (
						<div className={styles.recsList}>
							{record.recommendations.map((r) => (
								<div key={r.title} className={styles.recCard}>
									<span className={styles.recIcon}>{r.icon}</span>
									<div>
										<div className={styles.recTitle}>{r.title}</div>
										<div className={styles.recBody}>{r.body}</div>
									</div>
								</div>
							))}
						</div>
					)}
				</section>
			)}
		</article>
	);
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ onUpload }: { onUpload: () => void }) => (
	<div className={styles.emptyState}>
		<div className={styles.emptyIcon}>
			<InboxIcon size={40} />
		</div>
		<h2>No results yet</h2>
		<p>Upload your first lab results and our AI will analyse them and save everything here for your clinical history.</p>
		<button className={styles.uploadBtn} onClick={onUpload}>
			<Upload size={15} />
			Upload your first results
		</button>
	</div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export const HealthHistory: React.FC = () => {
	const navigate = useNavigate();
	const records  = useSelector((state: RootState) => state.uploadHistory.records);
	const user     = useSelector((state: RootState) => state.user);

	// Derive display name — use the most recent upload's name if user slice is empty
	const displayName = user.firstName
		? `${user.firstName} ${user.lastName}`.trim()
		: records[0]
			? `${records[0].firstName} ${records[0].lastName}`.trim()
			: "Your";

	const bloodType = user.bloodType || records[0]?.bloodType || "";
	const age       = user.age       || records[0]?.age       || "";
	const gender    = user.gender    || records[0]?.gender     || "";

	return (
		<div className={styles.page}>
			{/* ── Top navbar ────────────────────────────────────────────────── */}
			<header className={styles.topNav}>
				<button className={styles.backBtn} onClick={() => navigate(-1)}>
					<ArrowLeft size={16} />
					<span>Back</span>
				</button>

				<div className={styles.navCenter}>
					<ShieldCheck size={16} className={styles.navIcon} />
					<span>Clinical History</span>
				</div>

				<button
					className={styles.newUploadBtn}
					onClick={() => navigate(paths.config.importOrUpload, { state: { skipToUpload: true } })}
				>
					<Upload size={14} />
					New upload
				</button>
			</header>

			<main className={styles.mainContent}>
				{/* ── Patient profile banner ──────────────────────────────── */}
				<section className={styles.profileBanner}>
					<div className={styles.profileAvatar}>
						<User size={24} />
					</div>

					<div className={styles.profileInfo}>
						<h1 className={styles.profileName}>{displayName}'s Health Record</h1>
						<div className={styles.profilePills}>
							{age     && <span className={styles.profilePill}>{age} years old</span>}
							{gender  && <span className={styles.profilePill}>{gender}</span>}
							{bloodType && (
								<span className={`${styles.profilePill} ${styles.bloodPill}`}>
									<Droplets size={11} />
									{bloodType}
								</span>
							)}
							<span className={styles.profilePill}>
								{records.length} upload{records.length !== 1 ? "s" : ""}
							</span>
						</div>
					</div>

					{records.length > 0 && (
						<div className={styles.profileScore}>
							<div className={styles.profileScoreLabel}>Latest Health Score</div>
							<div
								className={styles.profileScoreNum}
								style={{ color: healthScoreColour(records[0].healthScore) }}
							>
								{records[0].healthScore}
							</div>
							<div className={styles.profileScoreSub}>out of 100</div>
						</div>
					)}
				</section>

				{/* ── Upload history timeline ─────────────────────────────── */}
				<section className={styles.historySection}>
					<div className={styles.historyHeader}>
						<div className={styles.historyHeaderLeft}>
							<FileText size={18} />
							<h2>Upload History</h2>
						</div>
						<span className={styles.historyCount}>
							{records.length} record{records.length !== 1 ? "s" : ""}
						</span>
					</div>

					{records.length === 0 ? (
						<EmptyState onUpload={() => navigate(paths.config.importOrUpload)} />
					) : (
						<div className={styles.timeline}>
							{records.map((record, i) => (
								<div key={record.id} className={styles.timelineEntry}>
									<div className={styles.timelineLine}>
										<div className={styles.timelineDot} />
										{i < records.length - 1 && <div className={styles.timelineConnector} />}
									</div>
									<RecordCard record={record} index={i} />
								</div>
							))}
						</div>
					)}
				</section>

				{/* ── Disclaimer ──────────────────────────────────────────── */}
				{records.length > 0 && (
					<div className={styles.disclaimer}>
						<ShieldCheck size={13} />
						<span>This record is for personal reference only and does not replace professional medical advice. Always consult a qualified doctor.</span>
					</div>
				)}
			</main>
		</div>
	);
};

export default HealthHistory;
