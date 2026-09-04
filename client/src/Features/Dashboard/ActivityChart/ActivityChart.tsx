import { useMemo, useState } from "react";
import styles from "./ActivityChart.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import {
	Activity,
	Footprints,
	Flame,
	Timer,
	TrendingUp,
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
	{ color: string; unit: string; icon: React.ReactNode }
> = {
	steps: {
		color: "#38bdf8",
		unit: "steps",
		icon: <Footprints size={15} strokeWidth={2.2} />,
	},
	calories: {
		color: "#f59e0b",
		unit: "kcal",
		icon: <Flame size={15} strokeWidth={2.2} />,
	},
	activeMinutes: {
		color: "#10b981",
		unit: "mins",
		icon: <Timer size={15} strokeWidth={2.2} />,
	},
};

export const ActivityChart = () => {
	const { t } = useLanguage();
	const [timeRange, setTimeRange] = useState<TimeRange>("week");
	const [activeMetric, setActiveMetric] = useState<MetricKey>("steps");
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	const metrics = useMemo(
		() =>
			[
				{ key: "steps" as const, label: t("steps") || "Steps" },
				{ key: "calories" as const, label: t("calories") || "Calories" },
				{
					key: "activeMinutes" as const,
					label: "Active Mins",
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

	const currentConfig = METRIC_CONFIG[activeMetric];
	const activeColor = currentConfig.color;

	const { totalValue, avgValue, maxValue, todayIndex } = useMemo(() => {
		const values = chartData.map((d) => d[activeMetric]);
		const total = values.reduce((sum, v) => sum + v, 0);
		const jsDay = new Date().getDay();
		const idx = jsDay === 0 ? 6 : jsDay - 1;
		return {
			totalValue: total,
			avgValue: Math.round(total / chartData.length),
			maxValue: Math.max(...values, 1),
			todayIndex: idx,
		};
	}, [chartData, activeMetric]);

	return (
		<div
			className={styles.container}
			style={{ "--metric-color": activeColor } as React.CSSProperties}
		>
			<div className={styles.inner}>
				{/* Top Header */}
				<header className={styles.header}>
					<div className={styles.headerTop}>
						<div className={styles.titleGroup}>
							<div className={styles.iconBadge}>
								<Activity size={15} strokeWidth={2.4} />
							</div>
							<div>
								<h3 className={styles.title}>
									{t("activity_overview") || "Activity Overview"}
								</h3>
								<span className={styles.subtitle}>
									{timeRange === "week"
										? "Last 7 days performance"
										: timeRange === "month"
											? "Monthly breakdown"
											: "Annual summary"}
								</span>
							</div>
						</div>

						{/* Time Range Selector */}
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
				</header>

				{/* Metric Selection Switcher */}
				<div className={styles.metricSelector}>
					{metrics.map((metric) => {
						const isSelected = activeMetric === metric.key;
						const cfg = METRIC_CONFIG[metric.key];
						return (
							<button
								key={metric.key}
								type="button"
								className={`${styles.metricBtn} ${
									isSelected ? styles.metricBtnActive : ""
								}`}
								style={
									{
										"--btn-color": cfg.color,
									} as React.CSSProperties
								}
								onClick={() => setActiveMetric(metric.key)}
							>
								<span className={styles.metricBtnIcon}>{cfg.icon}</span>
								<span className={styles.metricBtnLabel}>{metric.label}</span>
							</button>
						);
					})}
				</div>

				{/* Summary Stat Tiles */}
				<div className={styles.statsStrip}>
					<div className={styles.statTile}>
						<div className={styles.statIconWrap}>
							<TrendingUp size={15} strokeWidth={2.4} />
						</div>
						<div className={styles.statCopy}>
							<span className={styles.statLabel}>Total {currentConfig.unit}</span>
							<div className={styles.statValueRow}>
								<strong className={styles.statValue}>
									{totalValue.toLocaleString()}
								</strong>
							</div>
						</div>
					</div>

					<div className={styles.statTile}>
						<div className={styles.statIconWrap}>
							{currentConfig.icon}
						</div>
						<div className={styles.statCopy}>
							<span className={styles.statLabel}>Daily Average</span>
							<div className={styles.statValueRow}>
								<strong className={styles.statValue}>
									{avgValue.toLocaleString()}
								</strong>
								<span className={styles.statUnit}>/ day</span>
							</div>
						</div>
					</div>
				</div>

				{/* Chart Area with Dedicated X-Axis */}
				<div className={styles.chartArea}>
					{/* Y-Axis Labels */}
					<div className={styles.yAxis}>
						<span>{maxValue.toLocaleString()}</span>
						<span>{Math.round(maxValue / 2).toLocaleString()}</span>
						<span>0</span>
					</div>

					{/* Chart Panel */}
					<div className={styles.chartPanel}>
						<div className={styles.chartCanvas}>
							<div className={styles.gridLines} aria-hidden>
								<span />
								<span />
								<span />
							</div>

							<div className={styles.barsContainer}>
								{chartData.map((data, index) => {
									const heightPct = Math.max(
										8,
										(data[activeMetric] / maxValue) * 100,
									);
									const isToday = index === todayIndex;
									const isHovered = hoveredIndex === index;

									return (
										<div
											key={data.day}
											className={`${styles.barColumn} ${
												isToday ? styles.barColumnToday : ""
											}`}
											onMouseEnter={() => setHoveredIndex(index)}
											onMouseLeave={() => setHoveredIndex(null)}
										>
											{/* Background Track Rail */}
											<div className={styles.barTrackRail}>
												<div
													className={`${styles.bar} ${
														isToday ? styles.barToday : ""
													}`}
													style={{ height: `${heightPct}%` }}
												>
													{/* Floating Value Tooltip on Hover */}
													{isHovered && (
														<div className={styles.barTooltip}>
															<span className={styles.tooltipVal}>
																{data[activeMetric].toLocaleString()}
															</span>
															<span className={styles.tooltipUnit}>
																{currentConfig.unit}
															</span>
														</div>
													)}
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Dedicated Clean X-Axis */}
						<div className={styles.xAxis}>
							{chartData.map((data, index) => {
								const isToday = index === todayIndex;
								return (
									<div
										key={data.day}
										className={`${styles.xDayCol} ${
											isToday ? styles.xDayColToday : ""
										}`}
									>
										<span className={styles.dayName}>{data.day}</span>
										{isToday && <span className={styles.todayDot} />}
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
