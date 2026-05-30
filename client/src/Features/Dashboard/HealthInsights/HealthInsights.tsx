import { useState } from "react";
import styles from "./HealthInsights.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { 
	Sparkles, 
	CheckCircle2, 
	Lightbulb, 
	Calendar, 
	X, 
	ArrowRight 
} from "lucide-react";

interface Insight {
	id: number;
	type: "warning" | "success" | "info" | "tip";
	title: string;
	description: string;
	action?: string;
	actionLabel?: string;
}

interface HealthInsightsProps {
	dismissedIds?: number[];
	onDismiss?: (id: number) => void;
}

export const HealthInsights = ({ dismissedIds: propDismissedIds, onDismiss }: HealthInsightsProps) => {
	const { t } = useLanguage();
	const [localDismissedIds, setLocalDismissedIds] = useState<number[]>([]);
	const [showAll, setShowAll] = useState(false);

	const dismissedIds = propDismissedIds !== undefined ? propDismissedIds : localDismissedIds;

	const insights: Insight[] = [
		{
			id: 1,
			type: "warning",
			title: t("specialist_access") || "Specialist Access",
			description:
				t("specialist_desc") ||
				"AI can summarize records for remote specialist review.",
			action: "/ai-assistant",
			actionLabel: t("ask_navigator") || "Ask Navigator",
		},
		{
			id: 2,
			type: "success",
			title: t("cost_optimized") || "Cost Optimized",
			description:
				t("cost_desc") || "Generic alternatives could save up to 40%.",
			action: "/ai-assistant",
			actionLabel: t("save_now") || "Save Now",
		},
		{
			id: 3,
			type: "tip",
			title: t("daily_tip") || "Daily Health Tip",
			description:
				t("tip_desc") || "Taking a 10-minute walk after meals can help improve digestion and blood sugar levels.",
		},
		{
			id: 4,
			type: "info",
			title: t("upcoming_checkup") || "Upcoming Check-up",
			description: t("checkup_desc") || "Annual screening due in 2 weeks.",
			action: "/schedule",
			actionLabel: t("schedule_now") || "Schedule Now",
		},
	];

	const activeInsights = insights.filter((i) => !dismissedIds.includes(i.id));
	const visibleInsights = showAll ? activeInsights : activeInsights.slice(0, 3);
	const hasMore = activeInsights.length > 3 && !showAll;

	const dismissInsight = (id: number) => {
		if (onDismiss) {
			onDismiss(id);
		} else {
			setLocalDismissedIds((prev) => [...prev, id]);
		}
	};

	const getIcon = (type: string) => {
		switch (type) {
			case "warning":
				return <Sparkles className={styles.icon} size={16} />;
			case "success":
				return <CheckCircle2 className={styles.icon} size={16} />;
			case "tip":
				return <Lightbulb className={styles.icon} size={16} />;
			default:
				return <Calendar className={styles.icon} size={16} />;
		}
	};

	if (activeInsights.length === 0) return null;

	return (
		<div className={styles.insightsContainer}>
			<div className={styles.header}>
				<div className={styles.titleWrapper}>
					<h3 className={styles.title}>
						{t("health_insights") || "Health Insights"}
					</h3>
					<span className={styles.pulseDot} />
				</div>
				<span className={styles.badge}>{activeInsights.length} new</span>
			</div>
			<div className={styles.insightsList}>
				{visibleInsights.map((insight, index) => (
					<div
						key={insight.id}
						className={`${styles.insightCard} ${styles[insight.type]}`}
						style={{ animationDelay: `${index * 0.08}s` }}
					>
						<div className={styles.cardGlow} />
						<div className={styles.iconWrapper}>{getIcon(insight.type)}</div>
						<div className={styles.content}>
							<h4 className={styles.insightTitle}>{insight.title}</h4>
							<p className={styles.insightDesc}>{insight.description}</p>
							{insight.actionLabel && (
								<button className={styles.actionBtn}>
									<span>{insight.actionLabel}</span>
									<ArrowRight size={12} className={styles.arrowIcon} />
								</button>
							)}
						</div>
						<button
							className={styles.dismissBtn}
							onClick={() => dismissInsight(insight.id)}
							aria-label='Dismiss'
						>
							<X size={13} />
						</button>
					</div>
				))}
				{hasMore && (
					<button
						className={styles.showMoreBtn}
						onClick={() => setShowAll(true)}
					>
						Show {activeInsights.length - 3} more
					</button>
				)}
			</div>
		</div>
	);
};
