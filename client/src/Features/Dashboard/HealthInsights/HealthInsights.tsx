import { useState, useEffect, useMemo } from "react";
import styles from "./HealthInsights.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Bell, X, ArrowRight, Dna, Target, Users, PiggyBank, Lightbulb, Calendar, ChevronDown, Brain } from "lucide-react";

type InsightType = "warning" | "success" | "info" | "tip";

interface Insight {
	id: number;
	type: InsightType;
	title: string;
	description: string;
	action?: string;
	actionLabel?: string;
	priority?: boolean;
}

interface HealthInsightsProps {
	dismissedIds?: number[];
	onDismiss?: (id: number) => void;
}

const TYPE_ICONS: Record<InsightType, React.ReactNode> = {
	warning: <Users size={15} strokeWidth={2.25} />,
	success: <PiggyBank size={15} strokeWidth={2.25} />,
	tip: <Lightbulb size={15} strokeWidth={2.25} />,
	info: <Calendar size={15} strokeWidth={2.25} />,
};

export const HealthInsights = ({
	dismissedIds: propDismissedIds,
	onDismiss,
}: HealthInsightsProps) => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const [localDismissedIds, setLocalDismissedIds] = useState<number[]>([]);
	const [showAll, setShowAll] = useState(false);
	const [unreadTips, setUnreadTips] = useState(false);
	const [uncompleteExam, setUncompleteExam] = useState(false);

	const dismissedIds =
		propDismissedIds !== undefined ? propDismissedIds : localDismissedIds;

	useEffect(() => {
		const checkSeeds = () => {
			const today = new Date();
			const currentSeed =
				today.getFullYear() * 1000 +
				(today.getMonth() + 1) * 100 +
				today.getDate();

			const tipsReadSeed = localStorage.getItem("genetiq_tips_read_seed");
			const examCompletedSeed = localStorage.getItem(
				"genetiq_exam_completed_seed",
			);

			setUnreadTips(tipsReadSeed !== String(currentSeed));
			setUncompleteExam(examCompletedSeed !== String(currentSeed));
		};

		checkSeeds();
		window.addEventListener("genetiq_tips_read", checkSeeds);
		window.addEventListener("storage", checkSeeds);

		return () => {
			window.removeEventListener("genetiq_tips_read", checkSeeds);
			window.removeEventListener("storage", checkSeeds);
		};
	}, []);

	const insights: Insight[] = useMemo(() => {
		const list: Insight[] = [];

		if (unreadTips) {
			list.push({
				id: 101,
				type: "tip",
				title: t("insight_bio_tips_title"),
				description: t("insight_bio_tips_desc"),
				action: "/config/tests",
				actionLabel: t("insight_bio_tips_action"),
				priority: true,
			});
		}

		if (uncompleteExam) {
			list.push({
				id: 102,
				type: "warning",
				title: t("insight_quiz_title"),
				description: t("insight_quiz_desc"),
				action: "/config/tests",
				actionLabel: t("insight_quiz_action"),
				priority: true,
			});
		}

		list.push(
			{
				id: 1,
				type: "warning",
				title: t("specialist_access") || "Specialist Access",
				description: t("specialist_desc"),
				action: "/ai-assistant",
				actionLabel: t("ask_navigator") || "Ask Navigator",
			},
			{
				id: 2,
				type: "success",
				title: t("cost_optimized") || "Cost Optimized",
				description: t("cost_desc") || "Generic alternatives could save up to 40%.",
				action: "/ai-assistant",
				actionLabel: t("save_now") || "Save Now",
			},
			{
				id: 3,
				type: "tip",
				title: t("daily_tip") || "Daily Health Tip",
				description:
					t("tip_desc") ||
					"Taking a 10-minute walk after meals can help improve digestion and blood sugar levels.",
			},
			{
				id: 4,
				type: "info",
				title: t("upcoming_checkup") || "Upcoming Check-up",
				description: t("checkup_desc") || "Annual screening due in 2 weeks.",
				action: "/schedule",
				actionLabel: t("schedule_now") || "Schedule Now",
			},
		);

		return list;
	}, [t, unreadTips, uncompleteExam]);

	const activeInsights = insights.filter((i) => !dismissedIds.includes(i.id));
	const visibleInsights = showAll
		? activeInsights
		: activeInsights.slice(0, 3);
	const hasMore = activeInsights.length > 3 && !showAll;
	const priorityCount = activeInsights.filter((i) => i.priority).length;

	const dismissInsight = (id: number) => {
		if (onDismiss) {
			onDismiss(id);
		} else {
			setLocalDismissedIds((prev) => [...prev, id]);
		}
	};

	const handleNavigate = (path?: string) => {
		if (path) navigate(path);
	};

	if (activeInsights.length === 0) return null;

	return (
		<div className={styles.container}>
			<div className={styles.heroBg} aria-hidden />
			<div className={styles.heroMesh} aria-hidden />

			<div className={styles.inner}>
				<header className={styles.header}>
					<div className={styles.headerTop}>
						<span className={styles.eyebrow}>
							<Brain size={11} strokeWidth={2.5} />
							{t("insights_eyebrow")}
						</span>
						<span className={styles.countBadge}>
							{t("insights_new_count", { count: activeInsights.length })}
						</span>
					</div>
					<div className={styles.headerMain}>
						<h3 className={styles.title}>
							<Bell size={16} strokeWidth={2.25} />
							{t("health_insights") || "Health Insights"}
						</h3>
					</div>
					{(unreadTips || uncompleteExam) && (
						<div className={styles.summaryStrip}>
							{unreadTips && !dismissedIds.includes(101) && (
								<span className={styles.summaryChip}>
									<Dna size={12} strokeWidth={2.25} />
									{t("insight_bio_tips_short")}
								</span>
							)}
							{uncompleteExam && !dismissedIds.includes(102) && (
								<span className={`${styles.summaryChip} ${styles.summaryChipWarn}`}>
									<Target size={12} strokeWidth={2.25} />
									{t("insight_quiz_short")}
								</span>
							)}
							{priorityCount > 0 && (
								<span className={styles.summaryMeta}>
									{t("insights_today_count", { count: priorityCount })}
								</span>
							)}
						</div>
					)}
				</header>

				<div className={styles.insightsList}>
					{visibleInsights.map((insight) => (
						<article
							key={insight.id}
							className={`${styles.insightCard} ${styles[insight.type]} ${
								insight.priority ? styles.priority : ""
							} ${insight.action ? styles.clickable : ""}`}
							onClick={() => handleNavigate(insight.action)}
							onKeyDown={(e) => {
								if (insight.action && (e.key === "Enter" || e.key === " ")) {
									e.preventDefault();
									handleNavigate(insight.action);
								}
							}}
							role={insight.action ? "button" : undefined}
							tabIndex={insight.action ? 0 : undefined}
						>
							<span className={styles.accentRail} aria-hidden />

							<span className={styles.iconWrapper}>
								{insight.id === 101 ? (
									<Dna size={15} strokeWidth={2.25} />
								) : insight.id === 102 ? (
									<Target size={15} strokeWidth={2.25} />
								) : (
									TYPE_ICONS[insight.type]
								)}
							</span>

							<div className={styles.content}>
								<div className={styles.titleRow}>
									<h4 className={styles.insightTitle}>{insight.title}</h4>
									{insight.priority && (
										<span className={styles.priorityPill}>
											{t("insights_today")}
										</span>
									)}
								</div>
								<p className={styles.insightDesc}>{insight.description}</p>
								{insight.actionLabel && (
									<span className={styles.actionLink}>
										{insight.actionLabel}
										<ArrowRight size={13} strokeWidth={2.5} />
									</span>
								)}
							</div>

							<button
								type="button"
								className={styles.dismissBtn}
								onClick={(e) => {
									e.stopPropagation();
									dismissInsight(insight.id);
								}}
								aria-label={t("dismiss") || "Dismiss"}
							>
								<X size={13} strokeWidth={2.5} />
							</button>
						</article>
					))}

					{hasMore && (
						<button
							type="button"
							className={styles.showMoreBtn}
							onClick={() => setShowAll(true)}
						>
							<span>
								{t("show_n_more", {
									count: activeInsights.length - 3,
								})}
							</span>
							<ChevronDown size={14} strokeWidth={2.5} />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
