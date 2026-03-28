import styles from "./SuccessModal.module.scss";
import ArrowRightIcon from "@assets/General/ArrowRight.svg?react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";

interface SuccessModalProps {
	onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ onClose }) => {
	const navigate = useNavigate();

	const handleEnterTwin = () => {
		navigate(paths.dashboard.root);
		onClose();
	};

	return (
		<div className={styles["success-modal-overlay"]}>
			<div className={styles["modal-body"]}>
				<div className={styles["visual-section"]}>
					<div className={styles["glow-orb"]} />
					<div className={styles["model-representation"]}>
						{/* High-end visual representing the 3D model */}
						<div className={styles["avatar-3d"]} />
					</div>
				</div>
				<div className={styles["content-section"]}>
					<div className={styles["badge"]}>✨ Analysis complete</div>
					<h2 className={styles["title"]}>
						Your Digital Twin is{" "}
						<span className={styles["highlight"]}>Ready</span>
					</h2>
					<p className={styles["description"]}>
						We've successfully processed your health data and generated a
						comprehensive digital representation. Your personalized health
						journey starts now.
					</p>

					<div className={styles["features-grid"]}>
						<div className={styles["feature-item"]}>
							<span className={styles["feature-icon"]}>🧬</span>
							<span>Genetic Insights</span>
						</div>
						<div className={styles["feature-item"]}>
							<span className={styles["feature-icon"]}>📊</span>
							<span>Biomarker Trends</span>
						</div>
					</div>

					<button className={styles["action-btn"]} onClick={handleEnterTwin}>
						Enter Digital Twin <ArrowRightIcon />
					</button>
				</div>
			</div>
		</div>
	);
};
