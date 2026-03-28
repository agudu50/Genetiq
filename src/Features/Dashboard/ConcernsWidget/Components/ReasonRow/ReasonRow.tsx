import styles from "./ReasonRow.module.scss";
import { Reason } from "../../helpers/detailedSystemConcerns";

import Chevron from "@assets/ConcernWidget/Chevron.svg?react";
import { useState } from "react";
import { useLanguage } from "@/App/i18n/LanguageContext";

interface ReasonRowProps {
	reason: Reason;
}

export const ReasonRow: React.FC<ReasonRowProps> = ({ reason }) => {
	const { t } = useLanguage();
	const [isShowMore, setIsShowMore] = useState(false);

	return (
		<div
			className={`${styles["ReasonRow-container"]} ${
				isShowMore && styles["ReasonRow-container-open"]
			}`}
		>
			<div
				className={styles["ReasonRow-row"]}
				onClick={() => setIsShowMore((prev) => !prev)}
			>
				<div className={styles["ReasonRow-chevron-container"]}>
					<Chevron
						className={`${styles["ReasonRow-chevron"]} ${
							isShowMore ? styles["rotate-chevron"] : ""
						}`}
					/>
				</div>
				<div className={styles["ReasonRow-title"]}>{t(reason.title)}</div>
				<div className={styles["ReasonRow-test"]}>
					<div className={styles["ReasonRow-icon"]}>
						<img src={reason.icon} alt={`${reason.title} icon`} />
					</div>
					<div className={styles["ReasonRow-test-name"]}>{t(reason.test)}</div>
				</div>
				<div
					className={`${
						reason.level.type === "progress"
							? styles["ReasonRow-level"]
							: styles["ReasonRow-image"]
					} 
					${reason.level.src === 0 && styles["ReasonRow-level-hidden"]}`}
				>
					{reason.level.type === "progress" ? (
						<div
							className={styles["ReasonRow-thumb"]}
							style={
								{ "--level": `${reason.level.src}%` } as React.CSSProperties
							}
						>
							<div className={styles["ReasonRow-thumb-line"]} />
						</div>
					) : (
						<img
							src={reason.level.src}
							alt={`${t(reason.title)} graph`}
							className={styles["ReasonRow-level-image"]}
						/>
					)}
				</div>
				<div className={styles["ReasonRow-value"]}>
					<div className={styles["ReasonRow-value-number"]}>{reason.value}</div>
					<div className={styles["ReasonRow-value-unit"]}>{reason.unit}</div>
				</div>
				<div className={styles["ReasonRow-status-wrapper"]}>
					<div
						className={`${styles["ReasonRow-status"]} ${
							reason.status === "High"
								? styles["ReasonRow-status-red"]
								: reason.status === "Medium"
									? styles["ReasonRow-status-orange"]
									: styles["ReasonRow-status-green"]
						}`}
					>
						{t(reason.statusText)}
					</div>
				</div>
				<div className={styles["ReasonRow-date"]}>{reason.date}</div>
			</div>
			<div
				className={`${styles["ReasonRow-description"]} ${
					isShowMore && styles["ReasonRow-description-open"]
				}`}
			>
				{t(reason.description)}
			</div>
		</div>
	);
};
