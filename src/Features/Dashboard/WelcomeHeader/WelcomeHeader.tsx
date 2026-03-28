import { useMemo } from "react";
import styles from "./WelcomeHeader.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";

interface QuickStat {
	label: string;
	value: string | number;
	trend?: "up" | "down" | "stable";
	trendValue?: string;
	icon: React.ReactNode;
	color: string;
}

export const WelcomeHeader = () => {
	const { t } = useLanguage();
	const currentHour = new Date().getHours();
	const user = useSelector((state: RootState) => state.user);

	const getGreeting = () => {
		if (currentHour < 12) return t("good_morning") || "Good morning";
		if (currentHour < 18) return t("good_afternoon") || "Good afternoon";
		return t("good_evening") || "Good evening";
	};

	const userName = user.firstName || "John";

	// Compute BMI from real user data
	const bmi = useMemo(() => {
		const h = Number(user.height);
		const w = Number(user.weight);
		if (!h || !w) return null;
		return w / ((h / 100) * (h / 100));
	}, [user.height, user.weight]);

	// Health score based on profile data
	const healthScore = useMemo(() => {
		let score = 60; // base
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

	const quickStats: QuickStat[] = [
		{
			label: t("health_score") || "Health Score",
			value: healthScore,
			trend: healthScore >= 80 ? "up" : healthScore >= 60 ? "stable" : "down",
			trendValue:
				healthScore >= 80 ? "Great" : healthScore >= 60 ? "Good" : "Improve",
			color:
				healthScore >= 80
					? "#10b981"
					: healthScore >= 60
						? "#f59e0b"
						: "#ef4444",
			icon: (
				<svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
					<path
						d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
						fill='currentColor'
					/>
				</svg>
			),
		},
		{
			label: "BMI",
			value: bmi ? bmi.toFixed(1) : "—",
			trend: bmi ? (bmi < 25 ? "up" : bmi < 30 ? "stable" : "down") : "stable",
			trendValue: bmi
				? bmi < 18.5
					? "Low"
					: bmi < 25
						? "Normal"
						: bmi < 30
							? "High"
							: "Obese"
				: "No data",
			color: bmi
				? bmi < 18.5
					? "#60a5fa"
					: bmi < 25
						? "#10b981"
						: bmi < 30
							? "#f59e0b"
							: "#ef4444"
				: "#6b7280",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
				>
					<path
						d='M22 12h-4l-3 9L9 3l-3 9H2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			),
		},
		{
			label: t("conditions") || "Conditions",
			value: user.medicalConditions.length,
			trend:
				user.medicalConditions.length === 0
					? "up"
					: user.medicalConditions.length <= 2
						? "stable"
						: "down",
			trendValue: user.medicalConditions.length === 0 ? "Clear" : `active`,
			color: user.medicalConditions.length === 0 ? "#10b981" : "#ef4444",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
				>
					<path
						d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			),
		},
		{
			label: t("medications") || "Medications",
			value: user.medications.filter((m) => m.name).length,
			trend: "stable",
			trendValue: "active",
			color: "#8b5cf6",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
				>
					<path
						d='m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path d='m8.5 8.5 7 7' strokeLinecap='round' strokeLinejoin='round' />
				</svg>
			),
		},
	];

	return (
		<div className={styles.welcomeHeader}>
			<div className={styles.greetingSection}>
				<div className={styles.greeting}>
					<h1 className={styles.greetingText}>
						<span className='text-gradient-muted'>{getGreeting()},</span>{" "}
						<span className='text-gradient-primary'>{userName}</span>
					</h1>
					<p className={styles.subtitle}>
						{t("dashboard_subtitle") ||
							"Navigating your care journey and overcoming healthcare gaps today"}
					</p>
				</div>
				<div className={styles.dateInfo}>
					<span className={styles.date}>
						{new Date().toLocaleDateString("en-US", {
							weekday: "long",
							month: "long",
							day: "numeric",
						})}
					</span>
				</div>
			</div>

			<div className={styles.quickStats}>
				{quickStats.map((stat, index) => (
					<div
						key={stat.label}
						className={styles.statCard}
						style={
							{
								"--stat-color": stat.color,
								"animationDelay": `${index * 0.1}s`,
							} as React.CSSProperties
						}
					>
						<div className={styles.statIcon} style={{ color: stat.color }}>
							{stat.icon}
						</div>
						<div className={styles.statContent}>
							<span className={styles.statValue}>{stat.value}</span>
							<span className={styles.statLabel}>{stat.label}</span>
						</div>
						<div
							className={`${styles.statTrend} ${styles[stat.trend || "stable"]}`}
						>
							{stat.trend === "up" && (
								<svg
									width='16'
									height='16'
									viewBox='0 0 16 16'
									fill='currentColor'
								>
									<path d='M8 4l4 4H4l4-4z' />
								</svg>
							)}
							{stat.trend === "down" && (
								<svg
									width='16'
									height='16'
									viewBox='0 0 16 16'
									fill='currentColor'
								>
									<path d='M8 12l-4-4h8l-4 4z' />
								</svg>
							)}
							<span>{stat.trendValue}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
