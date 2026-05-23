import React from "react";
import styles from "./ConfirmCard.module.scss";
import ArrowUpRightIcon from "@assets/General/ArrowUpRight.svg?react";
import { useNavigate } from "react-router-dom";

interface CardItemProps {
	icon: React.ReactNode;
	title: string;
	content: string;
	url?: string;
	disabled?: boolean;
	style?: React.CSSProperties;
	tag?: string;
}

export const ConfigItemCard: React.FC<CardItemProps> = ({
	icon,
	title,
	content,
	url,
	disabled,
	style,
	tag,
}) => {
	const navigate = useNavigate();
	return (
		<div
			className={`${styles.configItemCard} ${disabled ? styles.configItemCardDisabled : ""}`}
			style={style}
			onClick={() => !disabled && url && navigate(url)}
		>
			<div className={styles.itemCardIconWrapper}>
				<div
					className={`${styles.itemCardIcon} ${disabled ? styles.itemCardIconDisabled : ""}`}
				>
					{icon}
				</div>
				<div className={styles.iconRight}>
					{!disabled && tag && (
						<span className={styles.cardTag} data-tag={tag}>
							{tag}
						</span>
					)}
					{!disabled && (
						<ArrowUpRightIcon
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
								if (url) navigate(url);
							}}
							style={{ cursor: "pointer" }}
						/>
					)}
				</div>
			</div>
			<div className={styles.itemCardInfo}>
				<div className={styles.itemCardTitle}>{title}</div>
				<div className={styles.itemCardContent}>{content}</div>
			</div>
			{disabled && (
				<div className={styles.comingSoonOverlay}>
					<div className={styles.comingSoonBadge}>Coming Soon</div>
				</div>
			)}
		</div>
	);
};
