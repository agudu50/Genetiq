import { useState, useEffect, useCallback, useMemo } from "react";
import {
	Activity,
	Beaker,
	Brain,
	ClipboardList,
	ShieldCheck,
	QrCode,
	X,
	Share2,
	ChevronRight,
	Clock,
	Watch,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { paths } from "@/App/Routes/Paths";
import { useLanguage } from "@/App/i18n/LanguageContext";
import styles from "./HealthHistoryWidget.module.scss";

type HistoryItem = {
	id: string;
	type: string;
	title: string;
	date: string;
	status: string;
	icon: string;
	color: string;
};

const formatRelativeTime = (
	isoString: string,
	t: (key: string) => string,
	lang: string,
) => {
	try {
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();

		if (diffMs < 30000) return t("just_now") || "Just now";

		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 60) {
			const label = diffMins === 1 ? t("min_ago") || "min ago" : t("mins_ago") || "mins ago";
			return label.includes("{n}")
				? label.replace("{n}", String(diffMins))
				: `${diffMins} ${label}`;
		}

		const diffHours = Math.floor(diffMs / 3600000);
		if (diffHours < 24) {
			const label = diffHours === 1 ? t("hour_ago") || "hour ago" : t("hours_ago") || "hours ago";
			return label.includes("{n}")
				? label.replace("{n}", String(diffHours))
				: `${diffHours} ${label}`;
		}

		const diffDays = Math.floor(diffMs / 86400000);
		if (diffDays === 1) return t("yesterday") || "Yesterday";
		if (diffDays < 7) {
			const label = diffDays === 1 ? t("day_ago") || "day ago" : t("days_ago") || "days ago";
			return label.includes("{n}")
				? label.replace("{n}", String(diffDays))
				: `${diffDays} ${label}`;
		}

		return date.toLocaleDateString(
			lang === "en" ? "en-US" : lang === "es" ? "es-ES" : lang,
			{ month: "short", day: "numeric", year: "numeric" },
		);
	} catch {
		return t("recent") || "Recent";
	}
};

const getStatusTone = (status: string) => {
	const key = status.toLowerCase();
	if (key.includes("verified") || key.includes("completed")) return "success";
	if (key.includes("review") || key.includes("alert")) return "warning";
	if (key.includes("stable") || key.includes("active")) return "info";
	return "neutral";
};

const DEFAULT_MOCK_ITEMS: HistoryItem[] = [
	{
		id: "mock-1",
		type: "Lab Results",
		title: "90-Day ApoB & Lipid Subfraction",
		date: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
		status: "Verified",
		icon: "beaker",
		color: "#00a896",
	},
	{
		id: "mock-2",
		type: "AI Insights",
		title: "Inflammation hs-CRP & ApoB Alert",
		date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		status: "Review Needed",
		icon: "brain",
		color: "#f59e0b",
	},
	{
		id: "mock-3",
		type: "Lab Results",
		title: "Comprehensive Metabolic & Renal Panel",
		date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
		status: "Verified",
		icon: "beaker",
		color: "#10b981",
	},
	{
		id: "mock-4",
		type: "Lab Results",
		title: "Baseline Lipid Panel",
		date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
		status: "Verified",
		icon: "beaker",
		color: "#00a896",
	},
];

export const HealthHistoryWidget = () => {
	const navigate = useNavigate();
	const { t, lang } = useLanguage();
	const [showQR, setShowQR] = useState(false);
	const [quizHistory, setQuizHistory] = useState<
		{ id: string; title: string; date: string; status?: string; color?: string }[]
	>([]);

	const uploadRecords = useSelector(
		(state: RootState) => state.uploadHistory.records,
	);

	const loadQuizHistory = useCallback(() => {
		try {
			const saved = localStorage.getItem("genetiq_quiz_history");
			if (saved) setQuizHistory(JSON.parse(saved));
		} catch (e) {
			console.error("Failed to read quiz history from localStorage", e);
		}
	}, []);

	useEffect(() => {
		loadQuizHistory();
		window.addEventListener("genetiq_history_updated", loadQuizHistory);
		return () =>
			window.removeEventListener("genetiq_history_updated", loadQuizHistory);
	}, [loadQuizHistory]);

	const mappedUploads = useMemo<HistoryItem[]>(() => {
		return uploadRecords.map((rec) => {
			const displayTitle =
				rec.fileName && rec.fileName !== "blood_panel_report.pdf"
					? rec.fileName.replace(/\.pdf$/i, "")
					: "90-Day ApoB & Comprehensive Lipid Subfraction";
			const hasElevated = rec.findings?.some((f) => f.status === "elevated" || f.status === "action");
			return {
				id: rec.id,
				type: "Lab Results",
				title: displayTitle,
				date: rec.uploadedAt,
				status: "Verified",
				icon: "beaker",
				color: hasElevated ? "#f59e0b" : "#00a896",
			};
		});
	}, [uploadRecords]);

	const combinedItems = useMemo(() => {
		const mappedQuizzes: HistoryItem[] = quizHistory.map((q) => ({
			id: q.id,
			type: "AI Insights",
			title: q.title || "Inflammation Risk Alert",
			date: q.date,
			status: q.status || "Review Needed",
			icon: "brain",
			color: q.color || "#f59e0b",
		}));

		const realItems = [...mappedQuizzes, ...mappedUploads];

		// Combine real items and fill remaining slots up to 4 items from DEFAULT_MOCK_ITEMS
		const allItems = [...realItems];
		for (const mockItem of DEFAULT_MOCK_ITEMS) {
			if (allItems.length >= 4) break;
			if (!allItems.some(item => item.id === mockItem.id || item.title === mockItem.title)) {
				allItems.push(mockItem);
			}
		}

		return allItems.slice(0, 4);
	}, [mappedUploads, quizHistory]);

	const renderIcon = (iconName: string) => {
		switch (iconName) {
			case "beaker":
				return <Beaker size={16} strokeWidth={2.2} />;
			case "brain":
				return <Brain size={16} strokeWidth={2.2} />;
			case "shield":
				return <ShieldCheck size={16} strokeWidth={2.2} />;
			case "wearable":
				return <Watch size={16} strokeWidth={2.2} />;
			default:
				return <Activity size={16} strokeWidth={2.2} />;
		}
	};

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<div className={styles.titleBlock}>
					<div className={styles.titleIconWrap}>
						<ClipboardList size={16} strokeWidth={2.4} />
					</div>
					<div className={styles.titleText}>
						<h3 className={styles.title}>{t("clinical_history") || "Clinical History"}</h3>
						<div className={styles.titleMeta}>
							<span className={styles.recordsPill}>
								{combinedItems.length}{" "}
								{t("clinical_records") || "records"}
							</span>
						</div>
					</div>
				</div>

				<div className={styles.headerActions}>
					<button
						type="button"
						className={styles.handoverBtn}
						onClick={() => setShowQR(true)}
					>
						<QrCode size={14} strokeWidth={2.2} />
						<span>{t("clinical_handover") || "Clinical Handover"}</span>
					</button>
					<button
						type="button"
						className={styles.viewAll}
						onClick={() => navigate(paths.clinicalHistory)}
					>
						<span>{t("view_all") || "View All"}</span>
						<ChevronRight size={14} strokeWidth={2.5} />
					</button>
				</div>
			</header>

			{/* Record Cards Grid / Stack */}
			<div className={styles.cardsStack}>
				{combinedItems.map((item) => {
					const statusTone = getStatusTone(item.status);

					return (
						<button
							type="button"
							key={item.id}
							className={styles.recordCard}
							style={{ "--accent-color": item.color } as React.CSSProperties}
							onClick={() => navigate(paths.clinicalHistory)}
						>
							<div className={styles.recordIconBox}>
								{renderIcon(item.icon)}
							</div>

							<div className={styles.recordContent}>
								<div className={styles.recordTopRow}>
									<span className={styles.recordType}>
										{t(item.type) || item.type}
									</span>
									<span className={styles.recordDate}>
										<Clock size={11} strokeWidth={2.2} />
										{formatRelativeTime(item.date, t, lang)}
									</span>
								</div>

								<h4 className={styles.recordTitle}>{item.title}</h4>

								<div className={styles.statusRow}>
									<span
										className={`${styles.statusBadge} ${styles[`statusBadge--${statusTone}`]}`}
									>
										<span className={styles.statusDot} />
										{t(item.status) || item.status}
									</span>
								</div>
							</div>

							<div className={styles.recordArrow}>
								<ChevronRight size={16} strokeWidth={2.5} />
							</div>
						</button>
					);
				})}
			</div>

			{showQR && (
				<div
					className={styles.modalOverlay}
					onClick={() => setShowQR(false)}
				>
					<div
						className={styles.qrModal}
						onClick={(e) => e.stopPropagation()}
					>
						<div className={styles.modalHeader}>
							<h3>{t("clinical_handover") || "Clinical Handover"}</h3>
							<button
								type="button"
								onClick={() => setShowQR(false)}
								aria-label={t("close") || "Close"}
							>
								<X size={20} strokeWidth={2.5} aria-hidden />
							</button>
						</div>
						<div className={styles.qrContent}>
							<div className={styles.qrPlaceholder}>
								<QrCode size={160} strokeWidth={1.5} color="#10b981" />
							</div>
							<p className={styles.qrInstructions}>
								{t("clinical_handover_instructions") || "Scan this QR code with any mobile device to securely view the verified clinical handover summary."}
							</p>
							<div className={styles.accessLevel}>
								<ShieldCheck size={16} />
								<span>{t("clinical_access_level") || "End-to-End Encrypted Handover"}</span>
							</div>
						</div>
						<div className={styles.modalFooter}>
							<button type="button" className={styles.btnShare}>
								<Share2 size={18} /> {t("share_secure_link") || "Share Secure Link"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
