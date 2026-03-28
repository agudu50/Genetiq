import { useState } from "react";
import styles from "./HealthInsights.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";

interface Insight {
	id: number;
	type: "warning" | "success" | "info" | "tip";
	title: string;
	description: string;
	action?: string;
	actionLabel?: string;
}

export const HealthInsights = () => {
	const { t } = useLanguage();
	const [dismissedIds, setDismissedIds] = useState<number[]>([]);
	const [showAll, setShowAll] = useState(false);

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
				t("tip_desc") || "A 10-min walk after meals improves digestion.",
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
		setDismissedIds((prev) => [...prev, id]);
	};

	const getIcon = (type: string) => {
		switch (type) {
			case "warning":
				return (
					<svg width='20' height='20' viewBox='0 0 20 20' fill='currentColor'>
						<path
							fillRule='evenodd'
							d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
							clipRule='evenodd'
						/>
					</svg>
				);
			case "success":
				return (
					<svg width='20' height='20' viewBox='0 0 20 20' fill='currentColor'>
						<path
							fillRule='evenodd'
							d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
							clipRule='evenodd'
						/>
					</svg>
				);
			case "tip":
				return (
					<svg width='20' height='20' viewBox='0 0 20 20' fill='currentColor'>
						<path d='M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z' />
					</svg>
				);
			default:
				return (
					<svg width='20' height='20' viewBox='0 0 20 20' fill='currentColor'>
						<path
							fillRule='evenodd'
							d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
							clipRule='evenodd'
						/>
					</svg>
				);
		}
	};

	if (activeInsights.length === 0) return null;

	return (
		<div className={styles.insightsContainer}>
			<div className={styles.header}>
				<h3 className={styles.title}>
					{t("health_insights") || "Health Insights"}
				</h3>
				<span className={styles.badge}>{activeInsights.length} new</span>
			</div>
			<div className={styles.insightsList}>
				{visibleInsights.map((insight, index) => (
					<div
						key={insight.id}
						className={`${styles.insightCard} ${styles[insight.type]}`}
						style={{ animationDelay: `${index * 0.1}s` }}
					>
						<div className={styles.iconWrapper}>{getIcon(insight.type)}</div>
						<div className={styles.content}>
							<h4 className={styles.insightTitle}>{insight.title}</h4>
							<p className={styles.insightDesc}>{insight.description}</p>
							{insight.actionLabel && (
								<button className={styles.actionBtn}>
									{insight.actionLabel}
								</button>
							)}
						</div>
						<button
							className={styles.dismissBtn}
							onClick={() => dismissInsight(insight.id)}
							aria-label='Dismiss'
						>
							<svg
								width='16'
								height='16'
								viewBox='0 0 16 16'
								fill='currentColor'
							>
								<path d='M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z' />
							</svg>
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
