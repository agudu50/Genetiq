import React, { useEffect, useState } from "react";
import styles from "./SyncPowerGauge.module.scss";
import { motion } from "framer-motion";

interface SyncPowerGaugeProps {
	syncedCount: number;
	totalCount: number;
}

export const SyncPowerGauge: React.FC<SyncPowerGaugeProps> = ({
	syncedCount,
	totalCount,
}) => {
	const percentage =
		totalCount > 0 ? Math.round((syncedCount / totalCount) * 100) : 0;
	const [displayPercent, setDisplayPercent] = useState(0);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDisplayPercent(percentage);
		}, 300);
		return () => clearTimeout(timer);
	}, [percentage]);

	// Calculate color intensity based on percentage
	const getGlowColor = () => {
		if (percentage < 30) return "rgba(129, 140, 248, 0.3)"; // Indigo dim
		if (percentage < 70) return "rgba(99, 102, 241, 0.6)"; // Indigo mid
		return "rgba(52, 211, 153, 0.8)"; // Emerald bright (Fully synced)
	};

	return (
		<div className={styles["gauge-container"]}>
			<div className={styles["gauge-card"]}>
				<div className={styles["gauge-info"]}>
					<div className={styles["label-group"]}>
						<span className={styles["label"]}>Sync Power Intensity</span>
						<span className={styles["status"]}>
							{percentage === 100 ? "Maximum Security" : "Optimizing Network"}
						</span>
					</div>
					<div className={styles["percent-display"]}>
						<span className={styles["value"]}>{displayPercent}</span>
						<span className={styles["symbol"]}>%</span>
					</div>
				</div>

				<div className={styles["progress-wrapper"]}>
					<div className={styles["progress-track"]}>
						<motion.div
							className={styles["progress-fill"]}
							initial={{ width: 0 }}
							animate={{ width: `${percentage}%` }}
							transition={{ duration: 1, ease: "easeOut" }}
							style={{
								boxShadow: `0 0 20px ${getGlowColor()}`,
								background:
									percentage === 100
										? "linear-gradient(90deg, #6366f1 0%, #10b981 100%)"
										: "linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)",
							}}
						/>
					</div>
					<div className={styles["gauge-metrics"]}>
						<span>0% Nodes</span>
						<span>
							{syncedCount} / {totalCount} Encrypted Streams
						</span>
						<span>100% Secure</span>
					</div>
				</div>
			</div>
		</div>
	);
};
