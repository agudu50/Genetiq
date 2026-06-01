import styles from "./ProgressBar.module.scss";

interface ProgressBarProps {
	progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
	const validProgress = Math.max(0, Math.min(100, progress));

	return (
		<div className={styles["ProgressBar-container"]}>
			{/* Segmented ticks for technical telemetry aesthetic */}
			<div className={styles["gauge-ticks"]}>
				<span className={styles["tick"]} />
				<span className={styles["tick"]} />
				<span className={styles["tick"]} />
				<span className={styles["tick"]} />
				<span className={styles["tick"]} />
			</div>

			<div
				className={`${styles["ProgressBar-fill"]} ${styles["animate-fill"]}`}
				style={{ "--progress": `${validProgress}%` } as React.CSSProperties}
			/>
			<div
				className={`${styles["ProgressBar-slider"]} ${styles["animate-slider"]}`}
				style={{ "--progress": `${validProgress}%` } as React.CSSProperties}
			>
				<span className={styles["slider-glow-bead"]} />
			</div>
		</div>
	);
};
