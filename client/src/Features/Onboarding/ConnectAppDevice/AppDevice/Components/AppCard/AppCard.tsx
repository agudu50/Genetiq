import React from "react";
import styles from "./AppCard.module.scss";
import { FuselabIcon } from "@/assets/Icons/Fuselab";
import { DataConsole } from "../DataConsole/DataConsole";
import { motion, AnimatePresence } from "framer-motion";

interface AppCardProps {
	img: string;
	title: string;
	description: string;
	tags?: string[];
	isSynced?: boolean;
	onToggle?: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({
	img,
	title,
	description,
	tags = [],
	isSynced = false,
	onToggle,
}) => {
	return (
		<div
			className={`${styles["app-card-container"]} ${isSynced ? styles["is-connected"] : ""}`}
		>
			<div className={styles["header-wrapper"]}>
				<div className={styles["image-wrapper"]}>
					<img src={img} alt={title} />
				</div>
				<button
					className={`${styles["connect-btn"]} ${isSynced ? styles["connected"] : ""}`}
					onClick={onToggle}
				>
					{isSynced ? "Synced" : "Connect"}
				</button>
			</div>

			<div className={styles["info"]}>
				<div className={styles["title-row"]}>
					<div className={styles["title"]}>{title}</div>
					{isSynced && (
						<motion.div
							animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
							transition={{ duration: 2, repeat: Infinity }}
							className={styles["sync-dot"]}
						/>
					)}
				</div>
				<div className={styles["description"]}>{description}</div>
			</div>

			{tags.length > 0 && (
				<div className={styles["tags-container"]}>
					{tags.map((tag, idx) => (
						<span key={idx} className={styles["mapping-tag"]}>
							{tag}
						</span>
					))}
				</div>
			)}

			<AnimatePresence>
				{isSynced && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className={styles["console-wrapper"]}
					>
						<DataConsole isActive={isSynced} deviceName={title} />
					</motion.div>
				)}
			</AnimatePresence>

			<div className={styles["card-footer"]}>
				<div className={styles["favorite"]}>
					<motion.div
						animate={
							isSynced
								? {
										scale: [1, 1.1, 1],
										filter: [
											"drop-shadow(0 0 0px #6366f1)",
											"drop-shadow(0 0 8px #6366f1)",
											"drop-shadow(0 0 0px #6366f1)",
										],
									}
								: {}
						}
						transition={{ duration: 3, repeat: Infinity }}
					>
						<FuselabIcon fill={isSynced ? "#6366f1" : "#818cf8"} />
					</motion.div>
				</div>
				<span
					className={`${styles["status-label"]} ${isSynced ? styles["live"] : ""}`}
				>
					{isSynced ? "Real-time Sync" : "Available"}
				</span>
			</div>
		</div>
	);
};
