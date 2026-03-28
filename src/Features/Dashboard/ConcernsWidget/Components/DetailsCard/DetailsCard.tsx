import React from "react";
import { Detail } from "../../helpers/detailedSystemConcerns";
import styles from "./DetailsCard.module.scss";
import Check from "@assets/ConcernsWidget/Check.svg?react";
import Question from "@assets/ConcernsWidget/Question.svg?react";

interface DetailsCardProps {
	detail: Detail;
	detailIndex: number;
	setDetailIndex: (id: number) => void;
}

export const DetailsCard: React.FC<DetailsCardProps> = ({
	detail,
	detailIndex,
	setDetailIndex,
}) => {
	return (
		<div
			className={`${styles["DetailsCard-card"]} ${detail.id === detailIndex && styles["DetailsCard-card-active"]}`}
			onClick={() => setDetailIndex(detail.id)}
		>
			<div className={styles["DetailsCard-head"]}>
				<div
					className={`${styles["DetailsCard-status"]} ${
						detail.status === "High"
							? styles["DetailsCard-status-red"]
							: detail.status === "Medium"
								? styles["DetailsCard-status-orange"]
								: styles["DetailsCard-status-green"]
					}`}
				>
					<div className={styles["DetailsCard-status-exclamation"]}>!</div>
					<div className={styles["DetailsCard-status-text"]}>
						{detail.status}
					</div>
				</div>
				<label className={styles["DetailsCard-checkbox-container"]}>
					<input
						type='checkbox'
						checked={detail.id === detailIndex}
						onChange={() => setDetailIndex(detail.id)}
						className={styles["DetailsCard-checkbox"]}
					/>
					<span className={styles["DetailsCard-custom-checkbox"]}>
						{detail.id === detailIndex && <Check />}
					</span>
				</label>
			</div>
			<div className={styles["DetailsCard-body"]}>
				<div className={styles["DetailsCard-body-title"]}>{detail.title}</div>
				<div className={styles["DetailsCard-body-description"]}>
					<>
						<span
							className={`${styles["DetailsCard-highlight"]} ${
								detail.status === "High"
									? styles["DetailsCard-highlight-red"]
									: detail.status === "Medium"
										? styles["DetailsCard-highlight-orange"]
										: styles["DetailsCard-highlight-green"]
							}`}
						>
							{detail.factors[0]}
						</span>
						{detail.factors.length > 1 && (
							<span> level and other {detail.factors.length - 1} factors</span>
						)}
					</>
				</div>
			</div>
			<div className={styles["DetailsCard-question-container"]}>
				<Question className={styles["DetailsCard-question"]} />
			</div>
		</div>
	);
};
