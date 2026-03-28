import styles from "./ConfirmModal.module.scss";
import FrameIcon from "@assets/General/Frame.svg?react";
import ArrowRightIcon from "@assets/General/ArrowRight.svg?react";
import CloseIcon from "@assets/General/Close.svg?react";
import React, { useState } from "react";

interface ConfirmModalProps {
	onClose: () => void;
	onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
	onClose,
	onConfirm,
}) => {
	const [checked, setChecked] = useState(false);
	return (
		<div className={styles["process-modal-container"]}>
			<div className={styles["modal-body"]}>
				<div className={styles["modal-header"]}>
					<div className={styles["background-image"]} />
					<FrameIcon style={{ zIndex: 10 }} />
				</div>
				<div className={styles["modal-content"]}>
					<div className={styles["modal-title"]}>
						Ready to process your healthcare data and{" "}
						<span className={styles["modal-title-emphasize"]}>
							generate your GenetiQ Digital Twin
						</span>
					</div>
					<div className={styles["modal-description"]}>
						This process should only take a few minutes. We will notify you by
						email when the processing is complete.
					</div>
				</div>
				<div className={styles["modal-policy"]}>
					<input
						type='checkbox'
						className={styles["modal-policy-checkbox"]}
						onClick={() => setChecked(!checked)}
					/>
					<div className={styles["modal-policy-text"]}>
						I read and agree to{" "}
						<span className={styles["modal-policy-link"]}>
							Terms and Conditions
						</span>{" "}
						and{" "}
						<span className={styles["modal-policy-link"]}>Privacy Policy</span>.
					</div>
				</div>
				<div className={styles["modal-footer"]}>
					<button className={styles["cancel"]} onClick={onClose}>
						Cancel <CloseIcon />
					</button>
					<button
						className={`${styles["confirm"]} ${checked === false ? styles["confirm-disabled"] : ""}`}
						onClick={onConfirm}
					>
						Confirm <ArrowRightIcon />
					</button>
				</div>
			</div>
		</div>
	);
};
