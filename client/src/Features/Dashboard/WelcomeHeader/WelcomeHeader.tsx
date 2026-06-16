import { useMemo } from "react";
import {
	Heart,
	Activity,
	Shield,
	Pill,
	Sun,
	Sunset,
	Moon,
} from "lucide-react";
import styles from "./WelcomeHeader.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";

type TrendType = "up" | "down" | "stable" | "empty";

interface QuickStat {
	label: string;
	value: string | number;
	trend: TrendType;
	trendValue: string;
	color: string;
	icon: React.ReactNode;
}

const RING_RADIUS = 42;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

export const WelcomeHeader = () => {
	const { t, lang } = useLanguage();
	const currentHour = new Date().getHours();
	const user = useSelector((state: RootState) => state.user);

	const getGreeting = () => {
		if (currentHour < 12) return t("good_morning");
		if (currentHour < 18) return t("good_afternoon");
		return t("good_evening");
	};

	const GreetingIcon =
		currentHour < 12 ? Sun : currentHour < 18 ? Sunset : Moon;

	const userName = user.firstName || "John";

	const formattedDate = useMemo(
		() =>
			new Date().toLocaleDateString(lang, {
				weekday: "long",
				month: "long",
				day: "numeric",
			}),
		[lang],
	);

	const bmi = useMemo(() => {
		const h = Number(user.height);
		const w = Number(user.weight);
		if (!h || !w) return null;
		return w / ((h / 100) * (h / 100));
	}, [user.height, user.weight]);

	const healthScore = useMemo(() => {
		let score = 60;
		if (user.firstName) score += 5;
		if (user.age) score += 5;
		if (user.height && user.weight) score += 5;
		if (user.lifestyle.exercise === "5+ times/week") score += 10;
		else if (user.lifestyle.exercise === "3-4 times/week") score += 7;
		else if (user.lifestyle.exercise === "1-2 times/week") score += 3;
		if (user.lifestyle.smoking === "Non-smoker") score += 8;
		else if (user.lifestyle.smoking === "Former smoker") score += 4;
		if (
			user.lifestyle.diet === "Mediterranean" ||
			user.lifestyle.diet === "Balanced"
		)
			score += 5;
		if (user.medicalConditions.length === 0) score += 5;
		return Math.min(score, 100);
	}, [user]);

	const scoreColor =
		healthScore >= 80 ? "#10b981" : healthScore >= 60 ? "#f59e0b" : "#ef4444";

	const scoreLabel =
		healthScore >= 80
			? t("score_great")
			: healthScore >= 60
				? t("score_good")
				: t("score_improve");

	const ringOffset = RING_CIRC - (healthScore / 100) * RING_CIRC;

	const medicationCount = user.medications.filter((m) => m.name).length;

	const quickStats: QuickStat[] = useMemo(
		() => [
			{
				label: t("bmi_label"),
				value: bmi ? bmi.toFixed(1) : "—",
				trend: bmi
					? bmi < 25
						? "up"
						: bmi < 30
							? "stable"
							: "down"
					: "empty",
				trendValue: bmi
					? bmi < 18.5
						? t("bmi_low")
						: bmi < 25
							? t("bmi_normal")
							: bmi < 30
								? t("bmi_high")
								: t("bmi_obese")
					: t("no_data"),
				color: bmi
					? bmi < 18.5
						? "#60a5fa"
						: bmi < 25
							? "#10b981"
							: bmi < 30
								? "#f59e0b"
								: "#ef4444"
					: "#ef4444",
				icon: <Activity size={16} strokeWidth={2.25} />,
			},
			{
				label: t("conditions"),
				value: user.medicalConditions.length,
				trend:
					user.medicalConditions.length === 0
						? "up"
						: user.medicalConditions.length <= 2
							? "stable"
							: "down",
				trendValue:
					user.medicalConditions.length === 0
						? t("status_clear")
						: t("status_active"),
				color: user.medicalConditions.length === 0 ? "#10b981" : "#ef4444",
				icon: <Shield size={16} strokeWidth={2.25} />,
			},
			{
				label: t("medications"),
				value: medicationCount,
				trend: medicationCount === 0 ? "up" : "stable",
				trendValue:
					medicationCount === 0 ? t("status_clear") : t("status_active"),
				color: medicationCount === 0 ? "#10b981" : "#8b5cf6",
				icon: <Pill size={16} strokeWidth={2.25} />,
			},
		],
		[t, bmi, user.medicalConditions.length, medicationCount],
	);

	return (
		<div className={styles.welcomeHeader}>
			<div className={styles.heroBg} aria-hidden />
			<div className={styles.heroMesh} aria-hidden />
			<div className={styles.heroGlow} aria-hidden />

			<div className={styles.heroInner}>
				<div className={styles.heroTop}>
					<div className={styles.heroCopy}>
						<span className={styles.eyebrow}>
							<GreetingIcon size={12} strokeWidth={2.5} />
							{formattedDate}
						</span>
						<h1 className={styles.greetingText}>
							<span className={styles.greetingMuted}>{getGreeting()},</span>{" "}
							<span className={styles.greetingName}>{userName}</span>
						</h1>
						<p className={styles.subtitle}>{t("dashboard_subtitle")}</p>
					</div>

					<div
						className={styles.scoreRingCard}
						style={{ "--score-color": scoreColor } as React.CSSProperties}
					>
						<div className={styles.ringWrap}>
							<svg
								className={styles.scoreRingSvg}
								viewBox="0 0 100 100"
								aria-hidden
							>
								<circle
									className={styles.ringTrack}
									cx="50"
									cy="50"
									r={RING_RADIUS}
									fill="none"
								/>
								<circle
									className={styles.ringProgress}
									cx="50"
									cy="50"
									r={RING_RADIUS}
									fill="none"
									strokeDasharray={RING_CIRC}
									strokeDashoffset={ringOffset}
								/>
							</svg>
							<div className={styles.ringCenter}>
								<Heart size={18} strokeWidth={2.25} />
								<strong>{healthScore}</strong>
							</div>
						</div>
						<div className={styles.scoreRingMeta}>
							<span className={styles.scoreRingLabel}>{t("health_score")}</span>
							<span
								className={`${styles.scoreBadge} ${styles[`scoreBadge_${healthScore >= 80 ? "great" : healthScore >= 60 ? "good" : "low"}`]}`}
							>
								{scoreLabel}
							</span>
						</div>
					</div>
				</div>

				<div className={styles.statsStrip}>
					{quickStats.map((stat) => (
						<div
							key={stat.label}
							className={styles.statTile}
							style={{ "--stat-color": stat.color } as React.CSSProperties}
						>
							<span className={styles.statIcon}>{stat.icon}</span>
							<div className={styles.statCopy}>
								<strong className={styles.statValue}>{stat.value}</strong>
								<span className={styles.statLabel}>{stat.label}</span>
							</div>
							<span
								className={`${styles.statBadge} ${styles[`statBadge_${stat.trend}`]}`}
							>
								{stat.trendValue}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
