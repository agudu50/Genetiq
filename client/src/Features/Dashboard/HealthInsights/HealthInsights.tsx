import { useState, useEffect } from "react";
import styles from "./HealthInsights.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
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
	const navigate = useNavigate();
	const [localDismissedIds, setLocalDismissedIds] = useState<number[]>([]);
	const [showAll, setShowAll] = useState(false);
	
	// Live tracking of Tests page daily unread/uncomplete seeds
	const [unreadTips, setUnreadTips] = useState(false);
	const [uncompleteExam, setUncompleteExam] = useState(false);

	const dismissedIds = propDismissedIds !== undefined ? propDismissedIds : localDismissedIds;

	useEffect(() => {
		const checkSeeds = () => {
			const today = new Date();
			const currentSeed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
			
			const tipsReadSeed = localStorage.getItem("genetiq_tips_read_seed");
			const examCompletedSeed = localStorage.getItem("genetiq_exam_completed_seed");
			
			setUnreadTips(tipsReadSeed !== String(currentSeed));
			setUncompleteExam(examCompletedSeed !== String(currentSeed));
		};

		// Check on mount
		checkSeeds();
		
		// Event listeners to sync instantly when the user completes exams or reads tips
		window.addEventListener("genetiq_tips_read", checkSeeds);
		window.addEventListener("storage", checkSeeds);
		
		return () => {
			window.removeEventListener("genetiq_tips_read", checkSeeds);
			window.removeEventListener("storage", checkSeeds);
		};
	}, []);

	const insights: Insight[] = [];

	// 1. Prepend dynamic Daily Bio-Tips notification if unread today
	if (unreadTips) {
		insights.push({
			id: 101,
			type: "tip",
			title: "🧬 Daily Bio-Tips Ready",
			description: "Your personalized molecular daily health tips are ready. Read them to clear this alert.",
			action: "/config/tests",
			actionLabel: "Read Bio-Tips"
		});
	}

	// 2. Prepend dynamic Active Target Exam notification if incomplete today
	if (uncompleteExam) {
		insights.push({
			id: 102,
			type: "warning",
			title: "🎯 Active Target Quiz",
			description: "Today's personalized biological exam is waiting. Challenge yourself to seal your credentials!",
			action: "/config/tests",
			actionLabel: "Start Exam"
		});
	}

	// 3. Append static diagnostic/assistant insights
	insights.push(
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
		}
	);

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
						className={`${styles.insightCard} ${styles[insight.type]} ${insight.action ? styles.clickable : ""}`}
						style={{ 
							animationDelay: `${index * 0.08}s`,
							cursor: insight.action ? "pointer" : "default"
						}}
						onClick={() => {
							if (insight.action) {
								navigate(insight.action);
							}
						}}
					>
						<div className={styles.cardGlow} />
						<div className={styles.iconWrapper}>{getIcon(insight.type)}</div>
						<div className={styles.content}>
							<h4 className={styles.insightTitle}>{insight.title}</h4>
							<p className={styles.insightDesc}>{insight.description}</p>
							{insight.actionLabel && (
								<button 
									className={styles.actionBtn}
									onClick={(e) => {
										e.stopPropagation();
										if (insight.action) {
											navigate(insight.action);
										}
									}}
								>
									<span>{insight.actionLabel}</span>
									<ArrowRight size={12} className={styles.arrowIcon} />
								</button>
							)}
						</div>
						<button
							className={styles.dismissBtn}
							onClick={(e) => {
								e.stopPropagation();
								dismissInsight(insight.id);
							}}
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
