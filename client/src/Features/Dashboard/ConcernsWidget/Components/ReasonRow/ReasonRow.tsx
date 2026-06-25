import styles from "./ReasonRow.module.scss";
import { Reason } from "../../helpers/detailedSystemConcerns";

import Chevron from "@assets/ConcernWidget/Chevron.svg?react";
import { useState } from "react";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface ReasonRowProps {
	reason: Reason;
}

export const ReasonRow: React.FC<ReasonRowProps> = ({ reason }) => {
	const { t } = useLanguage();
	const [isOpen, setIsOpen] = useState(false);

	const getStatusClass = (status: string) => {
		if (status === "High") return styles["ReasonRow-status-red"];
		if (status === "Medium") return styles["ReasonRow-status-orange"];
		return styles["ReasonRow-status-green"];
	};

	const getStatusColor = (status: string) => {
		if (status === "High") return "#ef4444";
		if (status === "Medium") return "#f59e0b";
		return "#10b981";
	};

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", stiffness: 300, damping: 25 }}
			className={`${styles["ReasonRow-container"]} ${
				isOpen ? styles["ReasonRow-container-open"] : ""
			}`}
			onClick={() => setIsOpen((prev) => !prev)}
		>
			<div className={styles["ReasonRow-row"]}>
				<div className={styles["ReasonRow-chevron-container"]}>
					<motion.div
						animate={{ rotate: isOpen ? 180 : 0 }}
						transition={{ duration: 0.25, ease: "easeInOut" }}
					>
						<Chevron className={styles["ReasonRow-chevron"]} />
					</motion.div>
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
							<div className={styles["ReasonRow-thumb-pulse"]} />
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
						className={`${styles["ReasonRow-status"]} ${getStatusClass(reason.status)}`}
					>
						<span 
							className={styles["ReasonRow-status-dot"]}
							style={{ backgroundColor: getStatusColor(reason.status) }}
						/>
						{t(reason.statusText)}
					</div>
				</div>
				<div className={styles["ReasonRow-date"]}>{reason.date}</div>
			</div>
			
			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0, marginTop: 0 }}
						animate={{ height: "auto", opacity: 1, marginTop: 12 }}
						exit={{ height: 0, opacity: 0, marginTop: 0 }}
						transition={{ duration: 0.25, ease: "easeInOut" }}
						className={styles["ReasonRow-description-wrapper"]}
					>
						<div className={styles["ReasonRow-description"]}>
							{t(reason.description)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};
