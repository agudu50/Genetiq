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

	return (
		<div className={styles["TrackerWidget-container"]}>
			<div className={styles["TrackerWidget-Head"]}>
				<div className={styles["TrackerWidget-icon-container"]}>
					<Logo className={styles["TrackerWidget-icon"]} />
				</div>
				<p className={styles["TrackerWidget-text"]}>
					{uploadStatus === "completed"
						? t("analysis_complete")
						: t("stay_tuned_checking")}{" "}
					<span className={styles["TrackerWidget-text-highlight"]}>
						{t(tracker.target)}
					</span>
				</p>
			</div>
			<ProgressBar progress={tracker.progress} />
			<p className={styles["TrackerWidget-text"]}>
				{uploadStatus === "completed" ? (
					t("insights_ready")
				) : (
					<>
						{t("results_expected_in")}{" "}
						<span className={styles["TrackerWidget-text-highlight"]}>
							{tracker.expected_days} {t("days")}
						</span>
					</>
				)}
			</p>
		</div>
	);
};
