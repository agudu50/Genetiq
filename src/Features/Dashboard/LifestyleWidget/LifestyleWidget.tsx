import { useMemo } from "react";
import styles from "./LifestyleWidget.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/App/i18n/LanguageContext";

interface LifestyleMetric {
	key: string;
	label: string;
	value: string;
	score: number; // 0-100
	color: string;
	icon: React.ReactNode;
}

const scoreMap: Record<string, Record<string, number>> = {
	smoking: {
		"Non-smoker": 100,
		"Former smoker": 70,
		"Occasional": 40,
		"Regular": 10,
		"Prefer not to say": 50,
	},
	alcohol: {
		"None": 100,
		"Occasional": 80,
		"Weekly": 50,
		"Daily": 15,
		"Prefer not to say": 50,
	},
	exercise: {
		"5+ times/week": 100,
		"3-4 times/week": 75,
		"1-2 times/week": 45,
		"None": 10,
		"Prefer not to say": 50,
	},
	diet: {
		Mediterranean: 95,
		Balanced: 85,
		Vegetarian: 80,
		Vegan: 75,
		Keto: 65,
		Other: 50,
	},
};

export const LifestyleWidget = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const { lifestyle } = useSelector((state: RootState) => state.user);

	const metrics: LifestyleMetric[] = useMemo(() => {
		return [
			{
				key: "smoking",
				label: t("smoking") || "Smoking",
				value: lifestyle.smoking || "Not set",
				score: scoreMap.smoking[lifestyle.smoking] ?? 0,
				color: "#ef4444",
				icon: (
					<svg
						width='18'
						height='18'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<path d='M18 12H2M22 12h-2M18 8c0-2.5-2-2.5-2-5M22 8c0-2.5-2-2.5-2-5' />
						<rect x='2' y='12' width='16' height='4' rx='1' />
					</svg>
				),
			},
			{
				key: "alcohol",
				label: t("alcohol") || "Alcohol",
				value: lifestyle.alcohol || "Not set",
				score: scoreMap.alcohol[lifestyle.alcohol] ?? 0,
				color: "#f59e0b",
				icon: (
					<svg
						width='18'
						height='18'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<path d='M8 22h8M12 15v7M12 15c3.3 0 6-2.7 6-6V4H6v5c0 3.3 2.7 6 6 6z' />
					</svg>
				),
			},
			{
				key: "exercise",
				label: t("exercise") || "Exercise",
				value: lifestyle.exercise || "Not set",
				score: scoreMap.exercise[lifestyle.exercise] ?? 0,
				color: "#10b981",
				icon: (
					<svg
						width='18'
						height='18'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<circle cx='12' cy='5' r='3' />
						<path d='m6.5 8 3.5 3v6l-3 5M17.5 8l-3.5 3v6l3 5' />
					</svg>
				),
			},
			{
				key: "diet",
				label: t("diet") || "Diet",
				value: lifestyle.diet || "Not set",
				score: scoreMap.diet[lifestyle.diet] ?? 0,
				color: "#3b82f6",
				icon: (
					<svg
						width='18'
						height='18'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<path d='M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v11M17 2v18M21 2c0 2.2-1.8 4-4 4' />
					</svg>
				),
			},
		];
	}, [lifestyle, t]);

	const overallScore = useMemo(() => {
		const validMetrics = metrics.filter((m) => m.value !== "Not set");
		if (validMetrics.length === 0) return 0;
		return Math.round(
			validMetrics.reduce((sum, m) => sum + m.score, 0) / validMetrics.length,
		);
	}, [metrics]);

	const hasData =
		lifestyle.smoking ||
		lifestyle.alcohol ||
		lifestyle.exercise ||
		lifestyle.diet;

	const getScoreColor = (score: number) => {
		if (score >= 75) return "#34d399";
		if (score >= 50) return "#fbbf24";
		if (score >= 25) return "#f97316";
		return "#ef4444";
	};

	// SVG circle params for radial progress
	const radius = 36;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (overallScore / 100) * circumference;

	return (
		<div className={styles.lifestyleWidget}>
			<div className={styles.header}>
				<h3 className={styles.title}>
					<svg
						width='18'
						height='18'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
					</svg>
					{t("lifestyle_score") || "Lifestyle Score"}
				</h3>
			</div>

			{hasData ? (
				<div className={styles.content}>
					<div className={styles.scoreSection}>
						<div className={styles.radialContainer}>
							<svg
								className={styles.radialSvg}
								width='90'
								height='90'
								viewBox='0 0 90 90'
							>
								<circle
									cx='45'
									cy='45'
									r={radius}
									fill='none'
									stroke='rgba(255,255,255,0.06)'
									strokeWidth='6'
								/>
								<circle
									cx='45'
									cy='45'
									r={radius}
									fill='none'
									stroke={getScoreColor(overallScore)}
									strokeWidth='6'
									strokeLinecap='round'
									strokeDasharray={circumference}
									strokeDashoffset={offset}
									transform='rotate(-90 45 45)'
									className={styles.progressCircle}
								/>
							</svg>
							<div className={styles.scoreValue}>
								<span className={styles.scoreNumber}>{overallScore}</span>
								<span className={styles.scoreLabel}>/ 100</span>
							</div>
						</div>
					</div>

					<div className={styles.metricsGrid}>
						{metrics.map((metric) => (
							<div key={metric.key} className={styles.metricCard}>
								<div className={styles.metricHeader}>
									<div
										className={styles.metricIcon}
										style={{ color: metric.color }}
									>
										{metric.icon}
									</div>
									<span className={styles.metricLabel}>{metric.label}</span>
								</div>
								<div className={styles.metricValue}>{metric.value}</div>
								<div className={styles.metricBar}>
									<div
										className={styles.metricProgress}
										style={{
											width: `${metric.score}%`,
											background: metric.color,
										}}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className={styles.emptyState}>
					<div className={styles.emptyIcon}>
						<svg
							width='40'
							height='40'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='1.5'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
							<path d='m9 12 2 2 4-4' />
						</svg>
					</div>
					<p className={styles.emptyText}>
						Complete your lifestyle assessment to see your score
					</p>
					<button
						className={styles.importBtn}
						onClick={() => navigate("/config/import")}
					>
						{t("take_assessment") || "Take Assessment"}
					</button>
				</div>
			)}
		</div>
	);
};
