import React, { useState, useMemo } from "react";
import {
	Calendar,
	UserRound,
	Files,
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
	ArrowUpDown,
	Sparkles,
	ArrowRight,
	Shield,
	Zap,
	Heart,
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

function healthScoreLabel(score: number) {
	if (score >= 90) return "Excellent";
	if (score >= 75) return "Good";
	if (score >= 51) return "Fair";
	return "Needs attention";
}

function titleCase(value: string) {
	return value
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
		.join(" ");
}

function getInitials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ScoreRing = ({ score, compact = false }: { score: number; compact?: boolean }) => {
	const colour = healthScoreColour(score);
	const r = 40;
	const circ = 2 * Math.PI * r;
	const offset = circ - (score / 100) * circ;
	return (
		<div className={`${styles.scoreRing} ${compact ? styles.scoreRingCompact : ""}`}>
			<svg viewBox="0 0 96 96" width="96" height="96">
				<circle cx="48" cy="48" r={r} fill="none" stroke="var(--hh-ring-track)" strokeWidth="8" />
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
				{!compact && <span className={styles.scoreLabel}>/ 100</span>}
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


export const HealthHistory: React.FC = () => {
	const navigate = useNavigate();
	const records  = useSelector((state: RootState) => state.uploadHistory.records);
	const user     = useSelector((state: RootState) => state.user);

	const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
	// Derive display name — use the most recent upload's name if user slice is empty
	const userFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
	const recordFullName = records[0]
		? `${records[0].firstName || ""} ${records[0].lastName || ""}`.trim()
		: "";
	const displayName = userFullName || recordFullName || "Your";
	const formattedName =
		displayName === "Your" ? "Your Profile" : titleCase(displayName);
	const initials = displayName === "Your" ? "?" : getInitials(displayName);
	const latestScore = records[0]?.healthScore;
	const bloodType = user.bloodType || records[0]?.bloodType || "";
	const age       = user.age       || records[0]?.age       || "";
	const gender    = user.gender    || records[0]?.gender     || "";

	// Sort records based on uploadedAt time
	const sortedRecords = [...records].sort((a, b) => {
		const timeA = new Date(a.uploadedAt).getTime();
		const timeB = new Date(b.uploadedAt).getTime();
		return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
	});

	const latestRecord = sortedRecords[0] ?? records[0] ?? null;

	const attentionFindings = useMemo(
		() =>
			records.reduce(
				(acc, record) =>
					acc + record.findings.filter((f) => f.status !== "normal").length,
				0,
			),
		[records],
	);

	const normalFindings = useMemo(
		() =>
			records.reduce(
				(acc, record) =>
					acc + record.findings.filter((f) => f.status === "normal").length,
				0,
			),
		[records],
	);

	const scrollToHistory = () => {
		document.getElementById("upload-history")?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<div className={styles.page}>
			<div className={styles.pageContent}>
				{/* ── Page hero (matches Health Diagnostics) ─────────────── */}
				<section className={styles.pageHero}>
					<div className={styles.pageHeroBg} aria-hidden />
					<div className={styles.pageHeroMesh} aria-hidden />
					<div className={styles.pageHeroGlow} aria-hidden />

					<div className={styles.pageHeroInner}>
						<div className={styles.heroTop}>
							<div className={styles.heroCopy}>
								<span className={styles.pageEyebrow}>
									<Sparkles size={12} strokeWidth={2.5} />
									Clinical history
								</span>
								<h1 className={styles.pageTitle}>
									<span className={styles.titleMuted}>Clinical</span>{" "}
									<span className={styles.titleAccent}>History</span>
								</h1>
								<p className={styles.pageSubtitle}>
									Your personal health timeline — lab uploads, AI-explained findings,
									and scores secured privately on this device.
								</p>
								<div className={styles.heroFeaturePills}>
									<span className={styles.heroFeaturePill}>
										<Shield size={12} strokeWidth={2.5} />
										Encrypted vault
									</span>
									<span className={styles.heroFeaturePill}>
										<FileText size={12} strokeWidth={2.5} />
										AI lab insights
									</span>
									<span className={styles.heroFeaturePill}>
										<Clock size={12} strokeWidth={2.5} />
										Upload timeline
									</span>
								</div>
							</div>

							<div className={styles.heroAside} aria-hidden>
								<div className={styles.heroOrb}>
									<div className={styles.heroOrbRing} />
									<div className={`${styles.heroOrbIcon} ${styles.heroOrbFile}`}>
										<FileText size={18} />
									</div>
									<div className={`${styles.heroOrbIcon} ${styles.heroOrbHeart}`}>
										<Heart size={18} />
									</div>
									<div className={`${styles.heroOrbIcon} ${styles.heroOrbDrop}`}>
										<Droplets size={18} />
									</div>
									<div className={`${styles.heroOrbIcon} ${styles.heroOrbActivity}`}>
										<Activity size={18} />
									</div>
									<div className={styles.heroOrbCore}>
										<Zap size={20} strokeWidth={2.25} />
									</div>
								</div>
							</div>
						</div>

						<div
							className={`${styles.latestRecordBanner} ${
								records.length === 0 ? styles.latestRecordEmpty : ""
							}`}
						>
							<div className={styles.latestRecordCopy}>
								<span className={styles.latestRecordEyebrow}>
									{records.length === 0 ? "Get started" : "Latest upload"}
								</span>
								<strong className={styles.latestRecordTitle}>
									{records.length === 0
										? "No records yet"
										: latestRecord?.fileName || `Upload #${records.length}`}
								</strong>
								<p className={styles.latestRecordDesc}>
									{records.length === 0
										? "Upload lab results to build your clinical timeline and health score."
										: `Uploaded ${formatDate(latestRecord!.uploadedAt)} at ${formatTime(latestRecord!.uploadedAt)}${
												latestScore != null
													? ` · Health score ${latestScore}/100 (${healthScoreLabel(latestScore)})`
													: ""
											}`}
								</p>
							</div>
							{records.length === 0 ? (
								<button
									type="button"
									className={styles.latestRecordBtn}
									onClick={() => navigate(paths.config.importOrUpload)}
								>
									Upload results
									<ArrowRight size={16} />
								</button>
							) : (
								<div className={styles.latestRecordActions}>
									<button
										type="button"
										className={styles.latestRecordBtnSecondary}
										onClick={scrollToHistory}
									>
										View timeline
									</button>
									<button
										type="button"
										className={styles.latestRecordBtn}
										onClick={() =>
											navigate(paths.config.importOrUpload, {
												state: { skipToUpload: true },
											})
										}
									>
										New upload
										<Upload size={15} />
									</button>
								</div>
							)}
						</div>

						<div className={styles.heroStatsStrip}>
							<div className={styles.heroStat}>
								<span className={`${styles.heroStatIcon} ${styles.heroStatIconTeal}`}>
									<Files size={15} />
								</span>
								<div className={styles.heroStatCopy}>
									<span className={styles.heroStatLabel}>Uploads</span>
									<strong className={styles.heroStatValue}>
										{records.length} record{records.length !== 1 ? "s" : ""}
									</strong>
								</div>
							</div>
							<div className={styles.heroStat}>
								<span className={`${styles.heroStatIcon} ${styles.heroStatIconAmber}`}>
									<AlertTriangle size={15} />
								</span>
								<div className={styles.heroStatCopy}>
									<span className={styles.heroStatLabel}>Needs review</span>
									<strong className={styles.heroStatValue}>
										{attentionFindings} finding{attentionFindings !== 1 ? "s" : ""}
									</strong>
								</div>
							</div>
							<div className={styles.heroStat}>
								<span className={`${styles.heroStatIcon} ${styles.heroStatIconGreen}`}>
									<CheckCircle2 size={15} />
								</span>
								<div className={styles.heroStatCopy}>
									<span className={styles.heroStatLabel}>Normal markers</span>
									<strong className={styles.heroStatValue}>
										{normalFindings} in range
									</strong>
								</div>
							</div>
							<div className={styles.heroStat}>
								<span className={`${styles.heroStatIcon} ${styles.heroStatIconPurple}`}>
									<ShieldCheck size={15} />
								</span>
								<div className={styles.heroStatCopy}>
									<span className={styles.heroStatLabel}>Health score</span>
									<strong className={styles.heroStatValue}>
										{latestScore != null ? `${latestScore}/100` : "—"}
									</strong>
								</div>
							</div>
						</div>
					</div>
				</section>

			<main className={styles.mainContent}>
				{/* ── Patient profile banner ──────────────────────────────── */}
				<section className={styles.profileBanner}>
					<div className={styles.profileHero}>
						<div className={styles.profileHeroBg} aria-hidden />
						<div className={styles.profileHeroMesh} aria-hidden />
						<div className={styles.profileHeroGlow} aria-hidden />

						<div className={styles.profileHeroInner}>
							<div className={styles.profileAvatar} aria-hidden="true">
								<span className={styles.profileInitials}>{initials}</span>
							</div>

							<div className={styles.profileIdentity}>
								<span className={styles.profileEyebrow}>
									<ShieldCheck size={11} strokeWidth={2.5} />
									Patient profile
								</span>
								<h1 className={styles.profileName}>{formattedName}</h1>
								<p className={styles.profileSubtitle}>Health Record</p>
							</div>

							{latestScore != null && (
								<div className={styles.profileHeroScore}>
									<ScoreRing score={latestScore} compact />
									<div className={styles.profileScoreMeta}>
										<span className={styles.profileScoreLabel}>Health Score</span>
										<span
											className={styles.profileScoreStatus}
											style={{ color: healthScoreColour(latestScore) }}
										>
											{healthScoreLabel(latestScore)}
										</span>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className={styles.profileBody}>
						<div className={styles.profileChips}>
							{age && (
								<span className={styles.profileChip}>
									<Calendar size={13} />
									{age} yrs
								</span>
							)}
							{gender && (
								<span className={styles.profileChip}>
									<UserRound size={13} />
									{gender}
								</span>
							)}
							{bloodType && (
								<span className={`${styles.profileChip} ${styles.profileChipBlood}`}>
									<Droplets size={13} />
									{bloodType}
								</span>
							)}
							<span className={styles.profileChip}>
								<Files size={13} />
								{records.length} upload{records.length !== 1 ? "s" : ""}
							</span>
						</div>

						<button
							type="button"
							className={styles.newUploadBannerBtn}
							onClick={() =>
								navigate(paths.config.importOrUpload, { state: { skipToUpload: true } })
							}
						>
							<Upload size={16} />
							<span>New Upload</span>
						</button>
					</div>
				</section>

				{/* ── Upload history timeline ─────────────────────────────── */}
				<section className={styles.historySection} id="upload-history">
					<div className={styles.historyPanel}>
					<div className={styles.historyHeader}>
						<div className={styles.historyHeaderLeft}>
							<FileText size={18} />
							<h2>Upload History</h2>
							<span className={styles.historyCount}>
								{records.length} record{records.length !== 1 ? "s" : ""}
							</span>
						</div>
						{records.length > 1 && (
							<button
								className={styles.sortToggleBtn}
								onClick={() => setSortOrder((order) => (order === "desc" ? "asc" : "desc"))}
								title={sortOrder === "desc" ? "Showing latest first" : "Showing oldest first"}
							>
								<ArrowUpDown size={13} />
								<span>{sortOrder === "desc" ? "Latest first" : "Oldest first"}</span>
							</button>
						)}
					</div>

					{records.length === 0 ? (
						<EmptyState onUpload={() => navigate(paths.config.importOrUpload)} />
					) : (
						<div className={styles.timeline}>
							{sortedRecords.map((record, i) => (
								<div key={record.id} className={styles.timelineEntry}>
									<div className={styles.timelineLine}>
										<div className={styles.timelineDot} />
										{i < sortedRecords.length - 1 && <div className={styles.timelineConnector} />}
									</div>
									<RecordCard record={record} index={records.indexOf(record)} />
								</div>
							))}
						</div>
					)}
					</div>
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
		</div>
	);
};

export default HealthHistory;
