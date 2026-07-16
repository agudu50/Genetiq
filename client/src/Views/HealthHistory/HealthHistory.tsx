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
	TrendingUp,
	BarChart3,
	Filter,
	SortAsc,
	SortDesc,
	ChevronLeft,
	ChevronRight,
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

function formatShortDate(isoString: string) {
	return new Date(isoString).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
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

// ─── Sort & Filter types ──────────────────────────────────────────────────────

const RECORDS_PER_PAGE = 5;

type SortBy = "date" | "score" | "findings";
type SortDir = "desc" | "asc";
type FilterStatus = "all" | "abnormal" | "normal";

// ─── Health Score Trend Chart ─────────────────────────────────────────────────

const HealthScoreChart = ({ records }: { records: UploadRecord[] }) => {
	const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

	// Sort chronologically for the chart
	const chronoRecords = useMemo(
		() =>
			[...records].sort(
				(a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime(),
			),
		[records],
	);

	if (chronoRecords.length < 2) return null;

	const width = 600;
	const height = 200;
	const padX = 48;
	const padTop = 24;
	const padBot = 40;
	const chartW = width - padX * 2;
	const chartH = height - padTop - padBot;

	const points = chronoRecords.map((r, i) => ({
		x: padX + (i / (chronoRecords.length - 1)) * chartW,
		y: padTop + chartH - (r.healthScore / 100) * chartH,
		score: r.healthScore,
		date: formatShortDate(r.uploadedAt),
		fullDate: formatDate(r.uploadedAt),
	}));

	// Build smooth SVG path
	const linePath = points
		.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
		.join(" ");

	// Fill area path
	const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

	// Zone lines (horizontal)
	const zones = [
		{ value: 50, color: "#ef4444", label: "50" },
		{ value: 75, color: "#f59e0b", label: "75" },
		{ value: 90, color: "#10b981", label: "90" },
	];

	return (
		<section className={styles.trendSection}>
			<div className={styles.trendHeader}>
				<div className={styles.trendHeaderLeft}>
					<TrendingUp size={18} />
					<h2>Health Score Trend</h2>
				</div>
				<span className={styles.trendSubtitle}>
					Track your score across {chronoRecords.length} uploads
				</span>
			</div>
			<div className={styles.trendChartWrap}>
				<svg
					viewBox={`0 0 ${width} ${height}`}
					className={styles.trendSvg}
					preserveAspectRatio="xMidYMid meet"
				>
					<defs>
						<linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#00a69d" stopOpacity="0.35" />
							<stop offset="100%" stopColor="#00a69d" stopOpacity="0.02" />
						</linearGradient>
						<linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
							<stop offset="0%" stopColor="#00a69d" />
							<stop offset="100%" stopColor="#38bdf8" />
						</linearGradient>
					</defs>

					{/* Zone bands */}
					{zones.map((z) => {
						const y = padTop + chartH - (z.value / 100) * chartH;
						return (
							<g key={z.value}>
								<line
									x1={padX}
									y1={y}
									x2={width - padX}
									y2={y}
									stroke={z.color}
									strokeWidth="0.5"
									strokeDasharray="4 4"
									opacity="0.35"
								/>
								<text
									x={padX - 6}
									y={y + 3}
									textAnchor="end"
									fill={z.color}
									fontSize="9"
									fontWeight="700"
									opacity="0.7"
								>
									{z.label}
								</text>
							</g>
						);
					})}

					{/* Area fill */}
					<path d={areaPath} fill="url(#trendGrad)" />

					{/* Line */}
					<path
						d={linePath}
						fill="none"
						stroke="url(#lineGrad)"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* Data points */}
					{points.map((p, i) => (
						<g key={i}>
							{/* Hover area (invisible, wider) */}
							<circle
								cx={p.x}
								cy={p.y}
								r={16}
								fill="transparent"
								onMouseEnter={() => setHoveredIdx(i)}
								onMouseLeave={() => setHoveredIdx(null)}
								style={{ cursor: "pointer" }}
							/>
							{/* Outer glow */}
							<circle
								cx={p.x}
								cy={p.y}
								r={hoveredIdx === i ? 10 : 6}
								fill={healthScoreColour(p.score)}
								opacity={hoveredIdx === i ? 0.2 : 0.12}
								style={{ transition: "r 0.2s ease, opacity 0.2s ease" }}
							/>
							{/* Dot */}
							<circle
								cx={p.x}
								cy={p.y}
								r={hoveredIdx === i ? 5 : 3.5}
								fill={healthScoreColour(p.score)}
								stroke="#fff"
								strokeWidth="1.5"
								style={{ transition: "r 0.2s ease" }}
							/>
							{/* X-axis label */}
							<text
								x={p.x}
								y={height - 10}
								textAnchor="middle"
								fill="var(--hh-muted)"
								fontSize="9"
								fontWeight="600"
							>
								{p.date}
							</text>
							{/* Hover tooltip */}
							{hoveredIdx === i && (
								<g>
									<rect
										x={p.x - 36}
										y={p.y - 34}
										width={72}
										height={24}
										rx={6}
										fill="var(--hh-card-solid)"
										stroke="var(--hh-border)"
										strokeWidth="1"
									/>
									<text
										x={p.x}
										y={p.y - 18}
										textAnchor="middle"
										fill={healthScoreColour(p.score)}
										fontSize="12"
										fontWeight="800"
									>
										{p.score}/100
									</text>
								</g>
							)}
						</g>
					))}
				</svg>
			</div>
		</section>
	);
};

// ─── Findings Donut Chart ─────────────────────────────────────────────────────

const FindingsDonut = ({ records }: { records: UploadRecord[] }) => {
	const counts = useMemo(() => {
		let normal = 0;
		let elevated = 0;
		let low = 0;
		let action = 0;
		for (const r of records) {
			for (const f of r.findings) {
				if (f.status === "normal") normal++;
				else if (f.status === "elevated") elevated++;
				else if (f.status === "low") low++;
				else action++;
			}
		}
		return { normal, elevated, low, action, total: normal + elevated + low + action };
	}, [records]);

	if (counts.total === 0) return null;

	const r = 40;
	const circ = 2 * Math.PI * r;
	const segments = [
		{ key: "normal", count: counts.normal, color: "#10b981", label: "Normal" },
		{ key: "elevated", count: counts.elevated, color: "#f59e0b", label: "Elevated" },
		{ key: "low", count: counts.low, color: "#3b82f6", label: "Low" },
		{ key: "action", count: counts.action, color: "#ef4444", label: "Needs action" },
	].filter((s) => s.count > 0);

	let accumulated = 0;
	const arcs = segments.map((seg) => {
		const pct = seg.count / counts.total;
		const dash = pct * circ;
		const gap = circ - dash;
		const offset = -(accumulated * circ) + circ / 4; // rotate -90deg start
		accumulated += pct;
		return { ...seg, dash, gap, offset, pct };
	});

	return (
		<section className={styles.insightsSection}>
			<div className={styles.insightsHeader}>
				<div className={styles.insightsHeaderLeft}>
					<BarChart3 size={18} />
					<h2>Insights at a Glance</h2>
				</div>
				<span className={styles.insightsSubtitle}>
					{counts.total} total findings across {records.length} upload{records.length !== 1 ? "s" : ""}
				</span>
			</div>
			<div className={styles.insightsGrid}>
				<div className={styles.donutWrap}>
					<svg viewBox="0 0 96 96" width="140" height="140" className={styles.donutSvg}>
						<circle
							cx="48"
							cy="48"
							r={r}
							fill="none"
							stroke="var(--hh-ring-track)"
							strokeWidth="10"
						/>
						{arcs.map((arc) => (
							<circle
								key={arc.key}
								cx="48"
								cy="48"
								r={r}
								fill="none"
								stroke={arc.color}
								strokeWidth="10"
								strokeDasharray={`${arc.dash} ${arc.gap}`}
								strokeDashoffset={arc.offset}
								strokeLinecap="butt"
								style={{ transition: "stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease" }}
							/>
						))}
						<text
							x="48"
							y="45"
							textAnchor="middle"
							dominantBaseline="middle"
							fill="var(--hh-text)"
							fontSize="18"
							fontWeight="900"
						>
							{counts.total}
						</text>
						<text
							x="48"
							y="58"
							textAnchor="middle"
							dominantBaseline="middle"
							fill="var(--hh-muted)"
							fontSize="8"
							fontWeight="700"
						>
							findings
						</text>
					</svg>
				</div>
				<div className={styles.donutLegend}>
					{arcs.map((arc) => (
						<div key={arc.key} className={styles.donutLegendRow}>
							<span
								className={styles.donutLegendDot}
								style={{ background: arc.color }}
							/>
							<span className={styles.donutLegendLabel}>{arc.label}</span>
							<span className={styles.donutLegendCount}>{arc.count}</span>
							<span className={styles.donutLegendPct}>
								{Math.round(arc.pct * 100)}%
							</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

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

	const [sortBy, setSortBy] = useState<SortBy>("date");
	const [sortDir, setSortDir] = useState<SortDir>("desc");
	const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
	const [currentPage, setCurrentPage] = useState(1);

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

	// Filter records
	const filteredRecords = useMemo(() => {
		if (filterStatus === "all") return records;
		if (filterStatus === "abnormal") {
			return records.filter((r) => r.findings.some((f) => f.status !== "normal"));
		}
		return records.filter((r) => r.findings.every((f) => f.status === "normal"));
	}, [records, filterStatus]);

	// Sort records
	const sortedRecords = useMemo(() => {
		const arr = [...filteredRecords];
		arr.sort((a, b) => {
			let cmp = 0;
			if (sortBy === "date") {
				cmp = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
			} else if (sortBy === "score") {
				cmp = a.healthScore - b.healthScore;
			} else {
				cmp = a.findings.length - b.findings.length;
			}
			return sortDir === "desc" ? -cmp : cmp;
		});
		return arr;
	}, [filteredRecords, sortBy, sortDir]);

	// Pagination
	const totalPages = Math.max(1, Math.ceil(sortedRecords.length / RECORDS_PER_PAGE));
	const safePage = Math.min(currentPage, totalPages);
	const paginatedRecords = sortedRecords.slice(
		(safePage - 1) * RECORDS_PER_PAGE,
		safePage * RECORDS_PER_PAGE,
	);

	// Reset to page 1 when filter/sort changes
	const prevFilter = React.useRef(filterStatus);
	const prevSortBy = React.useRef(sortBy);
	const prevSortDir = React.useRef(sortDir);
	if (prevFilter.current !== filterStatus || prevSortBy.current !== sortBy || prevSortDir.current !== sortDir) {
		prevFilter.current = filterStatus;
		prevSortBy.current = sortBy;
		prevSortDir.current = sortDir;
		if (currentPage !== 1) setCurrentPage(1);
	}

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

	const toggleSort = (by: SortBy) => {
		if (sortBy === by) {
			setSortDir((d) => (d === "desc" ? "asc" : "desc"));
		} else {
			setSortBy(by);
			setSortDir("desc");
		}
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

					</div>
				</section>

				{/* ── Charts & History Column ───────────────────────────── */}
				<div className={styles.historyColumn}>
					
					{/* Charts Grid */}
					<div className={styles.chartsGrid}>
						{/* Health Score Trend Chart */}
						{records.length >= 2 && <HealthScoreChart records={records} />}

						{/* Findings Donut Chart */}
						{records.length > 0 && <FindingsDonut records={records} />}
					</div>

					{/* ── Upload history timeline ─────────────────────────────── */}
					<section className={styles.historySection} id="upload-history">
						<div className={styles.historyPanel}>
							<div className={styles.historyHeader}>
								<div className={styles.historyHeaderLeft}>
									<FileText size={18} />
									<h2>Upload History</h2>
									<span className={styles.historyCount}>
										{filteredRecords.length} of {records.length} record{records.length !== 1 ? "s" : ""}
									</span>
								</div>
							</div>

							{/* ── Sort & Filter toolbar ────────────────────────── */}
							{records.length > 0 && (
								<div className={styles.sortFilterBar}>
									<div className={styles.sortGroup}>
										<span className={styles.sortGroupLabel}>
											<ArrowUpDown size={12} />
											Sort
										</span>
										{(["date", "score", "findings"] as SortBy[]).map((by) => (
											<button
												key={by}
												className={`${styles.sortPill} ${sortBy === by ? styles.sortPillActive : ""}`}
												onClick={() => toggleSort(by)}
											>
												{by === "date" ? "Date" : by === "score" ? "Score" : "Findings"}
												{sortBy === by && (
													sortDir === "desc"
														? <SortDesc size={11} />
														: <SortAsc size={11} />
												)}
											</button>
										))}
									</div>
									<div className={styles.filterGroup}>
										<span className={styles.sortGroupLabel}>
											<Filter size={12} />
											Filter
										</span>
										{(["all", "abnormal", "normal"] as FilterStatus[]).map((f) => (
											<button
												key={f}
												className={`${styles.filterPill} ${filterStatus === f ? styles.filterPillActive : ""}`}
												onClick={() => setFilterStatus(f)}
											>
												{f === "all" ? "All" : f === "abnormal" ? "Abnormal" : "Normal"}
											</button>
										))}
									</div>
								</div>
							)}

							{filteredRecords.length === 0 && records.length > 0 ? (
								<div className={styles.emptyFilterState}>
									<Filter size={24} />
									<p>No records match this filter. Try a different filter.</p>
								</div>
							) : records.length === 0 ? (
								<EmptyState onUpload={() => navigate(paths.config.importOrUpload)} />
							) : (
								<>
									{/* Page info */}
									<div className={styles.pageInfo}>
										Showing {(safePage - 1) * RECORDS_PER_PAGE + 1}–{Math.min(safePage * RECORDS_PER_PAGE, sortedRecords.length)} of {sortedRecords.length}
									</div>

									<div className={styles.cardsList}>
										{paginatedRecords.map((record) => (
											<RecordCard key={record.id} record={record} index={records.indexOf(record)} />
										))}
									</div>

									{/* Pagination controls */}
									{totalPages > 1 && (
										<div className={styles.pagination}>
											<button
												className={styles.pageBtn}
												disabled={safePage <= 1}
												onClick={() => { setCurrentPage(safePage - 1); document.getElementById("upload-history")?.scrollIntoView({ behavior: "smooth" }); }}
											>
												<ChevronLeft size={14} />
											</button>

											{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
												// Show: first, last, current, and neighbors of current. Ellipsis for gaps.
												const showPage = page === 1 || page === totalPages || Math.abs(page - safePage) <= 1;
												const showEllipsisBefore = page === safePage - 2 && safePage > 4;
												const showEllipsisAfter = page === safePage + 2 && safePage < totalPages - 3;

												if (!showPage && !showEllipsisBefore && !showEllipsisAfter) return null;

												if (showEllipsisBefore || showEllipsisAfter) {
													return <span key={`e${page}`} className={styles.pageEllipsis}>…</span>;
												}

												return (
													<button
														key={page}
														className={`${styles.pageNumBtn} ${page === safePage ? styles.pageNumBtnActive : ""}`}
														onClick={() => { setCurrentPage(page); document.getElementById("upload-history")?.scrollIntoView({ behavior: "smooth" }); }}
													>
														{page}
													</button>
												);
											})}

											<button
												className={styles.pageBtn}
												disabled={safePage >= totalPages}
												onClick={() => { setCurrentPage(safePage + 1); document.getElementById("upload-history")?.scrollIntoView({ behavior: "smooth" }); }}
											>
												<ChevronRight size={14} />
											</button>
										</div>
									)}
								</>
						)}
					</div>
					</section>
				</div>

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
