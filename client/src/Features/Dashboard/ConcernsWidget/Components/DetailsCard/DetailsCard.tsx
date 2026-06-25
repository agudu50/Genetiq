import React from "react";
import { Detail } from "../../helpers/detailedSystemConcerns";
import styles from "./DetailsCard.module.scss";
import Check from "@assets/ConcernsWidget/Check.svg?react";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { Heart, Brain, Activity, TrendingUp, HeartOff } from "lucide-react";
import { motion } from "framer-motion";

interface DetailsCardProps {
	detail: Detail;
	detailIndex: number;
	setDetailIndex: (id: number) => void;
}

const renderDetailIcon = (title: string, size = 18) => {
	const props = { size, strokeWidth: 2.25 as const };
	const t = title.toLowerCase();
	if (t.includes("stroke")) {
		return <Brain {...props} />;
	}
	if (t.includes("fibrillation") || t.includes("heartbeat") || t.includes("afib")) {
		return <Activity {...props} />;
	}
	if (t.includes("hypertension") || t.includes("pressure")) {
		return <TrendingUp {...props} />;
	}
	if (t.includes("failure")) {
		return <HeartOff {...props} />;
	}
	return <Heart {...props} />;
};

export const DetailsCard: React.FC<DetailsCardProps> = ({
	detail,
	detailIndex,
	setDetailIndex,
}) => {
	const { t } = useLanguage();
	const isActive = detail.id === detailIndex;

	const getStatusClass = (status: string) => {
		if (status === "High") return styles["status-high"];
		if (status === "Medium") return styles["status-medium"];
		return styles["status-low"];
	};

	const getAccentColor = (status: string) => {
		if (status === "High") return "#ef4444";
		if (status === "Medium") return "#f59e0b";
		return "#10b981";
	};

	const getStatusGlowColor = (status: string) => {
		if (status === "High") return "rgba(239, 68, 68, 0.4)";
		if (status === "Medium") return "rgba(245, 158, 11, 0.4)";
		return "rgba(16, 185, 129, 0.4)";
	};

	const handleClick = () => {
		setDetailIndex(detail.id);
	};

	return (
		<motion.button
			type="button"
			layoutId={`card-${detail.id}`}
			whileHover={{ y: -4, scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
			className={`${styles["DetailsCard-card"]} ${getStatusClass(detail.status)} ${
				isActive ? styles["DetailsCard-card-active"] : ""
			}`}
			style={
				{
					"--concern-accent": getAccentColor(detail.status),
					"--concern-glow": getStatusGlowColor(detail.status),
				} as React.CSSProperties
			}
			onClick={handleClick}
		>
			{/* Top accent light glow strip */}
			<div className={styles["DetailsCard-glowStrip"]} />

			<div className={styles["DetailsCard-head"]}>
				<div className={styles["DetailsCard-iconWrapper"]}>
					{/* Pulsing indicator ring */}
					{isActive && (
						<motion.div
							animate={{ scale: [0.95, 1.15, 0.95], opacity: [0.4, 0.8, 0.4] }}
							transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
							className={styles["DetailsCard-pulseRing"]}
						/>
					)}
					<span className={styles["DetailsCard-iconBox"]}>
						{renderDetailIcon(detail.title)}
					</span>
				</div>
				
				<div className={styles["DetailsCard-headRight"]}>
					<span className={`${styles.severityBadge} ${getStatusClass(detail.status)}`}>
						{detail.status === "High" && (
							<span className={styles["live-pulse-dot"]} />
						)}
						{t(detail.status)}
					</span>
					
					<div className={styles["DetailsCard-checkbox-container"]}>
						<div className={`${styles["DetailsCard-custom-checkbox"]} ${isActive ? styles["checked"] : ""}`}>
							{isActive && (
								<motion.span
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", stiffness: 500, damping: 15 }}
								>
									<Check />
								</motion.span>
							)}
						</div>
					</div>
				</div>
			</div>
			
			<div className={styles["DetailsCard-body"]}>
				<h4 className={styles["DetailsCard-body-title"]}>{t(detail.title)}</h4>
				
				<div className={styles.factorChips}>
					{detail.factors.map((factor) => (
						<motion.span
							whileHover={{ scale: 1.05, filter: "brightness(1.15)" }}
							key={factor}
							className={styles.factorChip}
						>
							{t(factor)}
						</motion.span>
					))}
				</div>
			</div>

			{/* Soft visual glow background overlay when selected */}
			{isActive && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.15 }}
					transition={{ duration: 0.4 }}
					className={styles["DetailsCard-bgGlow"]}
				/>
			)}
		</motion.button>
	);
};
