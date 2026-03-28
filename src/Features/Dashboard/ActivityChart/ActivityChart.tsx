import { useState } from "react";
import styles from "./ActivityChart.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";

type TimeRange = "week" | "month" | "year";

interface ActivityData {
	day: string;
	steps: number;
	calories: number;
	activeMinutes: number;
}

export const ActivityChart = () => {
	const { t } = useLanguage();
	const [timeRange, setTimeRange] = useState<TimeRange>("week");
	const [activeMetric, setActiveMetric] = useState<
		"steps" | "calories" | "activeMinutes"
	>("steps");

	const weekData: ActivityData[] = [
		{ day: "Mon", steps: 8500, calories: 420, activeMinutes: 45 },
		{ day: "Tue", steps: 6200, calories: 320, activeMinutes: 30 },
		{ day: "Wed", steps: 9800, calories: 480, activeMinutes: 55 },
		{ day: "Thu", steps: 7400, calories: 380, activeMinutes: 40 },
		{ day: "Fri", steps: 11200, calories: 560, activeMinutes: 70 },
		{ day: "Sat", steps: 5600, calories: 280, activeMinutes: 25 },
		{ day: "Sun", steps: 8900, calories: 440, activeMinutes: 50 },
	];

	const getMaxValue = () => {
		const values = weekData.map((d) => d[activeMetric]);
		return Math.max(...values);
	};

	const maxValue = getMaxValue();

	const metrics = [
		{ key: "steps", label: t("steps") || "Steps", color: "#3b82f6" },
		{ key: "calories", label: t("calories") || "Calories", color: "#ef4444" },
		{
			key: "activeMinutes",
			label: t("active_minutes") || "Active Min",
			color: "#10b981",
		},
	] as const;

	const timeRanges = [
		{ key: "week", label: t("week") || "Week" },
		{ key: "month", label: t("month") || "Month" },
		{ key: "year", label: t("year") || "Year" },
	] as const;

	const totalValue = weekData.reduce((sum, d) => sum + d[activeMetric], 0);
	const avgValue = Math.round(totalValue / weekData.length);

	return (
		<div className={styles.chartContainer}>
			<div className={styles.header}>
				<div className={styles.titleSection}>
					<h3 className={styles.title}>
						{t("activity_overview") || "Activity Overview"}
					</h3>
					<div className={styles.stats}>
						<div className={styles.statItem}>
							<span className={styles.statLabel}>{t("total") || "Total"}</span>
							<span className={styles.statValue}>
								{totalValue.toLocaleString()}
							</span>
						</div>
						<div className={styles.statItem}>
							<span className={styles.statLabel}>{t("average") || "Avg"}</span>
							<span className={styles.statValue}>
								{avgValue.toLocaleString()}
							</span>
						</div>
					</div>
				</div>
				<div className={styles.timeRangeSelector}>
					{timeRanges.map((range) => (
						<button
							key={range.key}
							className={`${styles.rangeBtn} ${timeRange === range.key ? styles.active : ""}`}
							onClick={() => setTimeRange(range.key)}
						>
							{range.label}
						</button>
					))}
				</div>
			</div>

			<div className={styles.metricSelector}>
				{metrics.map((metric) => (
					<button
						key={metric.key}
						className={`${styles.metricBtn} ${activeMetric === metric.key ? styles.active : ""}`}
						style={{ "--metric-color": metric.color } as React.CSSProperties}
						onClick={() => setActiveMetric(metric.key)}
					>
						<span className={styles.metricDot}></span>
						{metric.label}
					</button>
				))}
			</div>

			<div className={styles.chartArea}>
				<div className={styles.yAxis}>
					<span>{maxValue.toLocaleString()}</span>
					<span>{Math.round(maxValue / 2).toLocaleString()}</span>
					<span>0</span>
				</div>
				<div className={styles.barsContainer}>
					{weekData.map((data, index) => {
						const height = (data[activeMetric] / maxValue) * 100;
						const isToday =
							index === new Date().getDay() - 1 ||
							(new Date().getDay() === 0 && index === 6);
						return (
							<div key={data.day} className={styles.barWrapper}>
								<div className={styles.barOuter}>
									<div
										className={`${styles.bar} ${isToday ? styles.today : ""}`}
										style={{
											height: `${height}%`,
											backgroundColor: metrics.find(
												(m) => m.key === activeMetric,
											)?.color,
											animationDelay: `${index * 0.05}s`,
										}}
									>
										<span className={styles.barTooltip}>
											{data[activeMetric].toLocaleString()}
										</span>
									</div>
								</div>
								<span
									className={`${styles.barLabel} ${isToday ? styles.today : ""}`}
								>
									{data.day}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
