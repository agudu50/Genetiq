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

		if (diffMs < 30000) return t("just_now");

		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 60) {
			const label = diffMins === 1 ? t("min_ago") : t("mins_ago");
			return label.includes("{n}")
				? label.replace("{n}", String(diffMins))
				: `${diffMins} ${label}`;
		}

		const diffHours = Math.floor(diffMs / 3600000);
		if (diffHours < 24) {
			const label = diffHours === 1 ? t("hour_ago") : t("hours_ago");
			return label.includes("{n}")
				? label.replace("{n}", String(diffHours))
				: `${diffHours} ${label}`;
		}

		const diffDays = Math.floor(diffMs / 86400000);
		if (diffDays === 1) return t("yesterday");
		if (diffDays < 7) {
			const label = diffDays === 1 ? t("day_ago") : t("days_ago");
			return label.includes("{n}")
				? label.replace("{n}", String(diffDays))
				: `${diffDays} ${label}`;
		}

		return date.toLocaleDateString(
			lang === "en" ? "en-US" : lang === "es" ? "es-ES" : lang,
			{ month: "short", day: "numeric", year: "numeric" },
		);
	} catch {
		return t("recent");
	}
};

const getStatusTone = (status: string) => {
	const key = status.toLowerCase();
	if (key.includes("verified") || key.includes("completed")) return "success";
	if (key.includes("review") || key.includes("alert")) return "warning";
	if (key.includes("stable") || key.includes("active")) return "info";
	return "neutral";
};

const now = new Date();

const DEFAULT_MOCK_ITEMS: HistoryItem[] = [
	{
		id: "mock-1",
		type: "Lab Results",
		title: "Blood Panel Report",
		date: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
		status: "Verified",
		icon: "beaker",
		color: "#8b5cf6",
	},
	{
		id: "mock-2",
		type: "AI Insights",
		title: "Inflammation Risk Alert",
		date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
		status: "Review Needed",
		icon: "brain",
		color: "#f59e0b",
	},
	{
		id: "mock-4",
		type: "Wearables",
		title: "Telehealth Vitals Sync",
		date: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(),
		status: "Stable",
		icon: "wearable",
		color: "#06b6d4",
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
			let displayTitle = "Blood Panel Report";
			if (rec.fileName) {
				const files = rec.fileName.split(",").map(f => f.trim());
				if (files.length > 2) {
					displayTitle = `${files.length} Lab Reports Uploaded`;
				} else {
					displayTitle = files.map(f => {
						const lastDot = f.lastIndexOf(".");
						const base = lastDot !== -1 ? f.substring(0, lastDot) : f;
						return base.replace(/[_-]/g, " ")
							.split(" ")
							.map(w => w.charAt(0).toUpperCase() + w.slice(1))
							.join(" ");
					}).join(" & ");
				}
			}
			return {
				id: rec.id,
				type: "Lab Results",
				title: displayTitle,
				date: rec.uploadedAt,
				status: "Verified",
				icon: "beaker",
				color: "#8b5cf6",
			};
		});
	}, [uploadRecords]);

	const combinedItems = useMemo(() => {
		const mappedQuizzes: HistoryItem[] = quizHistory.map((q) => ({
			id: q.id,
			type: "AI Insights",
			title: q.title,
			date: q.date,
			status: q.status || "Completed",
			icon: "brain",
			color: q.color || "#f59e0b",
		}));

		const realItems = [...mappedUploads, ...mappedQuizzes];
		realItems.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);

		const mockItems =
			mappedUploads.length > 0
				? DEFAULT_MOCK_ITEMS.filter((item) => item.id !== "mock-1")
				: DEFAULT_MOCK_ITEMS;

		const allItems = [...realItems, ...mockItems];
		allItems.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);
		return allItems.slice(0, 4);
	}, [mappedUploads, quizHistory]);

	const renderIcon = (iconName: string) => {
		switch (iconName) {
			case "beaker":
				return <Beaker size={16} strokeWidth={2.25} />;
			case "brain":
				return <Brain size={16} strokeWidth={2.25} />;
			case "shield":
				return <ShieldCheck size={16} strokeWidth={2.25} />;
			case "wearable":
				return <Watch size={16} strokeWidth={2.25} />;
			default:
				return <Activity size={16} strokeWidth={2.25} />;
		}
	};

	return (
		<div className={styles.container}>

			<header className={styles.header}>
				<div className={styles.titleBlock}>
					<div className={styles.titleIconWrap}>
						<ClipboardList size={18} strokeWidth={2.25} />
					</div>
					<div className={styles.titleText}>
						<h3 className={styles.title}>{t("clinical_history")}</h3>
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
						<QrCode size={14} strokeWidth={2.25} />
						<span>{t("clinical_handover")}</span>
					</button>
					<button
						type="button"
						className={styles.viewAll}
						onClick={() => navigate(paths.clinicalHistory)}
					>
						<span>{t("view_all")}</span>
						<ChevronRight size={14} strokeWidth={2.5} />
					</button>
				</div>
			</header>

			<div className={styles.timeline}>
				<div className={styles.timelineSpine} aria-hidden />

				{combinedItems.map((item, i) => {
					const statusTone = getStatusTone(item.status);
					const isLast = i === combinedItems.length - 1;

					return (
						<button
							type="button"
							key={item.id}
							className={`${styles.historyItem} ${isLast ? styles.historyItemLast : ""}`}
							style={{ "--accent-color": item.color } as React.CSSProperties}
							onClick={() => navigate(paths.clinicalHistory)}
						>
							<div className={styles.timelineNode}>
								<div className={styles.iconContainer}>
									{renderIcon(item.icon)}
								</div>
							</div>

							<div className={styles.itemCard}>
								<div className={styles.itemAccent} aria-hidden />

								<div className={styles.itemIconMobile} aria-hidden>
									{renderIcon(item.icon)}
								</div>

								<div className={styles.content}>
									<div className={styles.row}>
										<span className={styles.itemType}>
											{t(item.type)}
										</span>
										<span className={styles.itemDate}>
											<Clock size={11} strokeWidth={2.25} />
											{formatRelativeTime(item.date, t, lang)}
										</span>
									</div>

									<h4 className={styles.itemTitle}>{item.title}</h4>

									<div className={styles.statusRow}>
										<span
											className={`${styles.statusBadge} ${styles[`statusBadge--${statusTone}`]}`}
										>
											<span className={styles.statusDot} />
											{t(item.status)}
										</span>
									</div>
								</div>

								<div className={styles.itemArrow}>
									<ChevronRight size={16} strokeWidth={2.5} />
								</div>
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
								<h3>{t("clinical_handover")}</h3>
								<button
									type="button"
									onClick={() => setShowQR(false)}
									aria-label={t("close")}
								>
									<X size={20} strokeWidth={2.5} aria-hidden />
								</button>
							</div>
							<div className={styles.qrContent}>
								<div className={styles.qrPlaceholder}>
									<QrCode size={160} strokeWidth={1.5} color="#00A69D" />
									<div className={styles.qrScanLine} />
								</div>
								<p className={styles.qrInstructions}>
									{t("clinical_handover_instructions")}
								</p>
								<div className={styles.accessLevel}>
									<ShieldCheck size={16} />
									<span>{t("clinical_access_level")}</span>
								</div>
							</div>
							<div className={styles.modalFooter}>
								<button type="button" className={styles.btnShare}>
									<Share2 size={18} /> {t("share_secure_link")}
								</button>
							</div>
					</div>
				</div>
			)}
		</div>
	);
};
