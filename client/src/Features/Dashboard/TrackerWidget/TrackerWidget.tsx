import { ProgressBar } from "./Components/ProgressBar/ProgressBar";
import styles from "./TrackerWidget.module.scss";
import Logo from "@assets/TrackerWidget/logo.svg?react";
import { useLanguage } from "@/App/i18n/LanguageContext";
import dashboardData from "@/App/Data/dashboard_data.json";

import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";

export const TrackerWidget = () => {
	const { t } = useLanguage();
	const { uploadStatus } = useSelector((state: RootState) => state.user);
	const { tracker: mockTracker } = dashboardData;

	const tracker = {
		target:
			uploadStatus === "processing" || uploadStatus === "completed"
				? "analyzing_genetics"
				: mockTracker.target,
		progress:
			uploadStatus === "completed"
				? 100
				: uploadStatus === "processing"
					? 75
					: mockTracker.progress,
		expected_days: uploadStatus === "completed" ? 0 : mockTracker.expected_days,
	};

	const statusClass = 
		uploadStatus === "completed" 
			? "completed" 
			: uploadStatus === "processing" 
				? "processing" 
				: "idle";

	const statusLabel = 
		uploadStatus === "completed" 
			? t("completed") || "Completed" 
			: uploadStatus === "processing" 
				? t("processing") || "In Progress" 
				: t("pending") || "Checking";

	return (
		<div className={styles["TrackerWidget-container"]}>

			{/* Top Header Row: Info on left, Status badge capsule on right */}
			<div className={styles["TrackerWidget-Head"]}>
				<div className={styles["TrackerWidget-info"]}>
					<div className={styles["TrackerWidget-icon-container"]}>
						<Logo className={styles["TrackerWidget-icon"]} />
					</div>
					<p className={styles["TrackerWidget-text"]}>
						{uploadStatus === "completed"
							? t("analysis_complete") || "Analysis complete"
							: t("stay_tuned_checking") || "Stay tuned, we are checking your"}{" "}
						<span className={styles["TrackerWidget-target-badge"]}>
							{t(tracker.target) || "Cholesterol"}
						</span>
					</p>
				</div>

				<div className={`${styles["TrackerWidget-status-tag"]} ${styles[statusClass]}`}>
					<span className={`${styles["status-dot"]} ${styles[statusClass]}`} />
					{statusLabel}
				</div>
			</div>

			{/* Middle Row: Stretching Progress Bar */}
			<div className={styles["TrackerWidget-bar-wrapper"]}>
				<ProgressBar progress={tracker.progress} />
			</div>

			{/* Bottom Footer Row: Icon & Expected time details */}
			<div className={styles["TrackerWidget-footer"]}>
				<svg
					className={styles["calendar-icon"]}
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
					<line x1="16" y1="2" x2="16" y2="6" />
					<line x1="8" y1="2" x2="8" y2="6" />
					<line x1="3" y1="10" x2="21" y2="10" />
				</svg>
				<p className={styles["footer-text"]}>
					{uploadStatus === "completed" ? (
						t("insights_ready") || "Your personalized molecular health insights are compiled."
					) : (
						<>
							{t("results_expected_in") || "Results expected in"}{" "}
							<span className={styles["expected-badge"]}>
								<svg
									className={styles["clock-icon"]}
									width="11"
									height="11"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="3"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="12" cy="12" r="10" />
									<polyline points="12 6 12 12 16 14" />
								</svg>
								{tracker.expected_days} {t("days") || "days"}
							</span>
						</>
					)}
				</p>
			</div>
		</div>
	);
};
