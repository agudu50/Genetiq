import React, { useEffect, useState } from "react";
import { CircleProgressBar } from "./Components/ProgressBar/ProgressBar";
import styles from "./UploadProcess.module.scss";

interface UploadProcessProps {
	setIsProcessing: (isProcessing: boolean) => void;
	onComplete: () => void;
}

export const UploadProcess: React.FC<UploadProcessProps> = ({
	setIsProcessing,
	onComplete,
}) => {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		setIsProcessing(true);
		const interval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval);
					onComplete();
					return 100;
				}
				// Slow down near the end
				const increment = prev < 75 ? 2 : prev < 95 ? 0.5 : 0.2;
				return Math.min(prev + increment, 100);
			});
		}, 100);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className={styles["upload-process-container"]}>
			<div className={styles["content-wrapper"]}>
				<div className={styles["progress-section"]}>
					<CircleProgressBar progress={Math.floor(progress)} />
				</div>

				<div className={styles["text-section"]}>
					<h2 className={styles["title"]}>Your files are being processed.</h2>
					<p className={styles["description"]}>
						Sit back and relax while we generate your GenetiQ Digital Twin. Most
						files are processed quickly, and we will notify you by email as soon
						as everything is ready.
					</p>

					<div className={styles["meta-grid"]}>
						<div className={styles["meta-item"]}>
							<span className={styles["meta-label"]}>Estimated time</span>
							<span className={styles["meta-value"]}>5 to 30 minutes</span>
						</div>
						<div className={styles["meta-item"]}>
							<span className={styles["meta-label"]}>Notification</span>
							<span className={styles["meta-value"]}>
								We will email the address on your profile
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
