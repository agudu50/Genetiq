import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Activity,
	Beaker,
	Brain,
	Clipboard,
	ShieldCheck,
	QrCode,
	X,
	Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { paths } from "@/App/Routes/Paths";
import { useLanguage } from "@/App/i18n/LanguageContext";
import styles from "./HealthHistoryWidget.module.scss";

// Relative time formatting utility
const formatRelativeTime = (
	isoString: string,
	t: (key: string) => string,
	lang: string
) => {
	try {
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		
		if (diffMs < 30000) return t("just_now");
		
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 60) {
			const label = diffMins === 1 ? t("min_ago") : t("mins_ago");
			return label.includes("{n}") ? label.replace("{n}", String(diffMins)) : `${diffMins} ${label}`;
		}
		
		const diffHours = Math.floor(diffMs / 3600000);
		if (diffHours < 24) {
			const label = diffHours === 1 ? t("hour_ago") : t("hours_ago");
			return label.includes("{n}") ? label.replace("{n}", String(diffHours)) : `${diffHours} ${label}`;
		}
		
		const diffDays = Math.floor(diffMs / 86400000);
		if (diffDays === 1) return t("yesterday");
		if (diffDays < 7) {
			const label = diffDays === 1 ? t("day_ago") : t("days_ago");
			return label.includes("{n}") ? label.replace("{n}", String(diffDays)) : `${diffDays} ${label}`;
		}
		
		return date.toLocaleDateString(lang === "en" ? "en-US" : lang === "es" ? "es-ES" : lang, {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch (e) {
		return t("recent");
	}
};

const now = new Date();

const DEFAULT_MOCK_ITEMS = [
	{
		id: "mock-1",
		type: "Lab Results",
		title: "Blood Marker Analysis",
		date: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
		status: "Verified",
		icon: "beaker",
		color: "#a855f7",
	},
	{
		id: "mock-2",
		type: "AI Insights",
		title: "Inflammation Risk Alert",
		date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
		status: "Review Needed",
		icon: "brain",
		color: "#f59e0b",
	},
	{
		id: "mock-4",
		type: "Wearables",
		title: "Telehealth Vitals Sync",
		date: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(), // 4 days ago
		status: "Stable",
		icon: "activity",
		color: "#34d399",
	},
];

export const HealthHistoryWidget = () => {
	const navigate = useNavigate();
	const { t, lang } = useLanguage();
	const [showQR, setShowQR] = useState(false);
	const [quizHistory, setQuizHistory] = useState<any[]>([]);

	// Read PDF upload records from Redux state
	const uploadRecords = useSelector((state: RootState) => state.uploadHistory.records);

	const loadQuizHistory = useCallback(() => {
		try {
			const saved = localStorage.getItem("genetiq_quiz_history");
			if (saved) {
				setQuizHistory(JSON.parse(saved));
			}
		} catch (e) {
			console.error("Failed to read quiz history from localStorage", e);
		}
	}, []);

	useEffect(() => {
		loadQuizHistory();
		window.addEventListener("genetiq_history_updated", loadQuizHistory);
		return () => {
			window.removeEventListener("genetiq_history_updated", loadQuizHistory);
		};
	}, [loadQuizHistory]);

	// Map upload records from Redux
	const mappedUploads = useMemo(() => {
		return uploadRecords.map((rec) => {
			let displayTitle = "Blood Marker Analysis";
			if (rec.fileName) {
				const dotIdx = rec.fileName.lastIndexOf(".");
				const nameWithoutExt = dotIdx !== -1 ? rec.fileName.substring(0, dotIdx) : rec.fileName;
				displayTitle = nameWithoutExt
					.replace(/[_-]/g, " ")
					.split(" ")
					.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
					.join(" ");
			}
			return {
				id: rec.id,
				type: "Lab Results",
				title: displayTitle,
				date: rec.uploadedAt,
				status: "Verified",
				icon: "beaker",
				color: "#a855f7",
			};
		});
	}, [uploadRecords]);

	// Combine upload history, quiz history, and fallback mocks
	const combinedItems = useMemo(() => {
		const mappedQuizzes = quizHistory.map((q) => ({
			id: q.id,
			type: "AI Insights",
			title: q.title,
			date: q.date,
			status: q.status || "Completed",
			icon: "brain",
			color: q.color || "#8b5cf6",
		}));

		const realItems = [...mappedUploads, ...mappedQuizzes];
		
		// Sort real items newest first
		realItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		
		// Combine with mock items (filter out duplicate mock lab results if real uploads exist)
		const mockItems = mappedUploads.length > 0
			? DEFAULT_MOCK_ITEMS.filter((item) => item.id !== "mock-1")
			: DEFAULT_MOCK_ITEMS;

		const allItems = [...realItems, ...mockItems];
		
		// Sort everything newest first
		allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		
		// Limit to top 4 items for display
		return allItems.slice(0, 4);
	}, [mappedUploads, quizHistory]);

	const renderIcon = (iconName: string) => {
		switch (iconName) {
			case "beaker":
				return <Beaker size={18} />;
			case "brain":
				return <Brain size={18} />;
			case "shield":
				return <ShieldCheck size={18} />;
			case "activity":
				return <Activity size={18} />;
			default:
				return <Activity size={18} />;
		}
	};

	return (
		<div className={styles.container}>
			{/* High-fidelity background mesh and drifts */}
			<div className={styles["cardMeshBg"]} />
			<div className={styles["cardGlowBlob"]} />

			<div className={styles.header}>
				<div className={styles.titleGroup}>
					<Clipboard className={styles.titleIcon} size={20} />
					<h3 className={styles.title}>{t("clinical_history")}</h3>
				</div>
				<div className={styles.headerActions}>
					<button
						className={styles.handoverBtn}
						onClick={() => setShowQR(true)}
					>
						<QrCode size={14} /> {t("clinical_handover")}
					</button>
					<button
						className={styles.viewAll}
						onClick={() => navigate(paths.clinicalHistory)}
					>
						{t("view_all")}
					</button>
				</div>
			</div>

			<div className={styles.timeline}>
				{combinedItems.map((item, i) => (
					<motion.div
						key={item.id}
						className={styles.historyItem}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: i * 0.1 }}
					>
						<div
							className={styles.iconContainer}
							style={{ "--accent-color": item.color } as React.CSSProperties}
						>
							{renderIcon(item.icon)}
						</div>
						<div className={styles.content}>
							<div className={styles.row}>
								<span className={styles.itemType}>{t(item.type)}</span>
								<span className={styles.itemDate}>{formatRelativeTime(item.date, t, lang)}</span>
							</div>
							<h4 className={styles.itemTitle}>{t(item.title)}</h4>
							<div className={styles.statusRow}>
								<span
									className={styles.statusBadge}
									style={
										{ "--status-color": item.color } as React.CSSProperties
									}
								>
									<span className={styles["status-dot"]} style={{ "--dot-color": item.color } as React.CSSProperties} />
									{t(item.status)}
								</span>
							</div>
						</div>
					</motion.div>
				))}
			</div>

			<AnimatePresence>
				{showQR && (
					<motion.div
						className={styles.modalOverlay}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setShowQR(false)}
					>
						<motion.div
							className={styles.qrModal}
							initial={{ scale: 0.9, y: 20 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.9, y: 20 }}
							onClick={(e) => e.stopPropagation()}
						>
							<div className={styles.modalHeader}>
								<h3>{t("clinical_handover")}</h3>
								<button onClick={() => setShowQR(false)}>
									<X size={20} />
								</button>
							</div>
							<div className={styles.qrContent}>
								<div className={styles.qrPlaceholder}>
									<QrCode size={160} strokeWidth={1.5} color='#a855f7' />
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
								<button className={styles.btnShare}>
									<Share2 size={18} /> {t("share_secure_link")}
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
