import { useMemo, useState } from "react";
import styles from "./ActivityChart.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import {
	Activity,
	Footprints,
	Flame,
	Timer,
	TrendingUp,
	BarChart3,
} from "lucide-react";

type TimeRange = "week" | "month" | "year";
type MetricKey = "steps" | "calories" | "activeMinutes";

interface ActivityData {
	day: string;
	steps: number;
	calories: number;
	activeMinutes: number;
}

const WEEK_DATA: ActivityData[] = [
	{ day: "Mon", steps: 8500, calories: 420, activeMinutes: 45 },
	{ day: "Tue", steps: 6200, calories: 320, activeMinutes: 30 },
	{ day: "Wed", steps: 9800, calories: 480, activeMinutes: 55 },
	{ day: "Thu", steps: 7400, calories: 380, activeMinutes: 40 },
	{ day: "Fri", steps: 11200, calories: 560, activeMinutes: 70 },
	{ day: "Sat", steps: 5600, calories: 280, activeMinutes: 25 },
	{ day: "Sun", steps: 8900, calories: 440, activeMinutes: 50 },
];

const METRIC_CONFIG: Record<
	MetricKey,
	{ color: string; icon: React.ReactNode }
> = {
	steps: { color: "#3b82f6", icon: <Footprints size={14} strokeWidth={2.25} /> },
	calories: { color: "#f59e0b", icon: <Flame size={14} strokeWidth={2.25} /> },
	activeMinutes: {
		color: "#10b981",
		icon: <Timer size={14} strokeWidth={2.25} />,
	},
};

export const ActivityChart = () => {
	const { t } = useLanguage();
	const [timeRange, setTimeRange] = useState<TimeRange>("week");
	const [activeMetric, setActiveMetric] = useState<MetricKey>("steps");

	const metrics = useMemo(
		() =>
			[
				{ key: "steps" as const, label: t("steps") || "Steps" },
				{ key: "calories" as const, label: t("calories") || "Calories" },
				{
					key: "activeMinutes" as const,
					label: t("active_minutes") || "Active Minutes",
				},
			] as const,
		[t],
	);

	const timeRanges = useMemo(
		() =>
			[
				{ key: "week" as const, label: t("week") || "Week" },
				{ key: "month" as const, label: t("month") || "Month" },
				{ key: "year" as const, label: t("year") || "Year" },
			] as const,
		[t],
	);

	const chartData = useMemo(() => {
		const multiplier =
			timeRange === "month" ? 4.2 : timeRange === "year" ? 52 : 1;
		return WEEK_DATA.map((d) => ({
			...d,
			steps: Math.round(d.steps * multiplier),
			calories: Math.round(d.calories * multiplier),
			activeMinutes: Math.round(d.activeMinutes * multiplier),
		}));
	}, [timeRange]);

	const activeColor = METRIC_CONFIG[activeMetric].color;

	const { totalValue, avgValue, maxValue, todayIndex } = useMemo(() => {
		const values = chartData.map((d) => d[activeMetric]);
		const total = values.reduce((sum, v) => sum + v, 0);
		const jsDay = new Date().getDay();
		const idx = jsDay === 0 ? 6 : jsDay - 1;
		return {
			totalValue: total,
			avgValue: Math.round(total / chartData.length),
			maxValue: Math.max(...values),
			todayIndex: idx,
		};
	}, [chartData, activeMetric]);

	return (
		<div
			className={styles.container}
			style={{ "--metric-color": activeColor } as React.CSSProperties}
		>
			<div className={styles.inner}>
				<header className={styles.header}>
					<div className={styles.headerTop}>
						<span className={styles.eyebrow}>
							<Activity size={11} strokeWidth={2.5} />
							{t("weekly_activity") || "Weekly Activity"}
						</span>
						<div className={styles.timeRangeSelector}>
							{timeRanges.map((range) => (
								<button
									key={range.key}
									type="button"
									className={`${styles.rangeBtn} ${
										timeRange === range.key ? styles.rangeBtnActive : ""
									}`}
									onClick={() => setTimeRange(range.key)}
								>
									{range.label}
								</button>
							))}
						</div>
					</div>
					<h3 className={styles.title}>
						<BarChart3 size={16} strokeWidth={2.25} />
						{t("activity_overview") || "Activity Overview"}
					</h3>
				</header>

				<div className={styles.statsStrip}>
					<div className={styles.statTile}>
						<span className={styles.statIcon}>
							<TrendingUp size={14} strokeWidth={2.25} />
						</span>
						<div className={styles.statCopy}>
							<span className={styles.statLabel}>{t("total") || "Total"}</span>
							<strong className={styles.statValue}>
								{totalValue.toLocaleString()}
							</strong>
						</div>
					</div>
					<div className={styles.statTile}>
						<span className={styles.statIcon}>
							{METRIC_CONFIG[activeMetric].icon}
						</span>
						<div className={styles.statCopy}>
							<span className={styles.statLabel}>
								{t("average") || "Average"}
							</span>
							<strong className={styles.statValue}>
								{avgValue.toLocaleString()}
							</strong>
						</div>
					</div>
				</div>

				<div className={styles.controlShell}>
					<div className={styles.metricSelector}>
						{metrics.map((metric) => (
							<button
								key={metric.key}
								type="button"
								className={`${styles.metricBtn} ${
									activeMetric === metric.key ? styles.metricBtnActive : ""
								}`}
								style={
									{
										"--btn-color": METRIC_CONFIG[metric.key].color,
									} as React.CSSProperties
								}
								onClick={() => setActiveMetric(metric.key)}
							>
								<span className={styles.metricBtnIcon}>
									{METRIC_CONFIG[metric.key].icon}
								</span>
								{metric.label}
							</button>
						))}
					</div>
				</div>

				<div className={styles.chartArea}>
					<div className={styles.yAxis}>
						<span>{maxValue.toLocaleString()}</span>
						<span>{Math.round(maxValue / 2).toLocaleString()}</span>
						<span>0</span>
					</div>
					<div className={styles.chartPanel}>
						<div className={styles.gridLines} aria-hidden>
							<span />
							<span />
							<span />
						</div>
						<div className={styles.barsContainer}>
							{chartData.map((data, index) => {
								const height = (data[activeMetric] / maxValue) * 100;
								const isToday = index === todayIndex;
								return (
									<div key={data.day} className={styles.barWrapper}>
										<div className={styles.barOuter}>
											<div
												className={`${styles.bar} ${isToday ? styles.barToday : ""}`}
												style={{ height: `${height}%` }}
											>
												<span className={styles.barValue}>
													{data[activeMetric].toLocaleString()}
												</span>
											</div>
										</div>
										<span
											className={`${styles.barLabel} ${
												isToday ? styles.barLabelToday : ""
											}`}
										>
											{data.day}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
