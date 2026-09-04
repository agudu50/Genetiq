import React from "react";
import { Detail } from "../../helpers/detailedSystemConcerns";
import styles from "./DetailsCard.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import {
	Heart,
	Brain,
	Activity,
	TrendingUp,
	HeartOff,
	Check,
	ChevronRight,
} from "lucide-react";

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
	if (
		t.includes("fibrillation") ||
		t.includes("heartbeat") ||
		t.includes("afib") ||
		t.includes("irregular")
	) {
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
		if (status === "High") return styles.statusHigh;
		if (status === "Medium") return styles.statusMedium;
		return styles.statusLow;
	};

	const getAccentColor = (status: string) => {
		if (status === "High") return "#ef4444";
		if (status === "Medium") return "#f59e0b";
		return "#10b981";
	};

	const handleClick = () => {
		setDetailIndex(detail.id);
	};

	const displayTitle = t(detail.title) || detail.title;

	return (
		<button
			type="button"
			className={`${styles.card} ${getStatusClass(detail.status)} ${
				isActive ? styles.cardActive : ""
			}`}
			style={
				{
					"--concern-accent": getAccentColor(detail.status),
				} as React.CSSProperties
			}
			onClick={handleClick}
		>
			{/* Header */}
			<div className={styles.header}>
				<div className={styles.iconBox}>
					{renderDetailIcon(detail.title)}
				</div>

				<div className={styles.headerRight}>
					<span className={`${styles.severityBadge} ${getStatusClass(detail.status)}`}>
						<span className={styles.statusDot} />
						{t(detail.status) || detail.status}
					</span>

					<div className={`${styles.checkbox} ${isActive ? styles.checkboxChecked : ""}`}>
						{isActive && <Check size={11} strokeWidth={3} />}
					</div>
				</div>
			</div>

			{/* Body */}
			<div className={styles.body}>
				<h4 className={styles.title}>{displayTitle}</h4>

				<div className={styles.factorsContainer}>
					<span className={styles.factorsLabel}>
						{t("factors") || "Contributing Factors"}
					</span>
					<div className={styles.factorChips}>
						{detail.factors.map((factor) => (
							<div key={factor} className={styles.factorChip}>
								<span className={styles.factorDot} />
								<span className={styles.factorText}>{t(factor) || factor}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className={styles.footer}>
				<span className={styles.footerText}>
					{isActive ? (t("active_assessment") || "Selected View") : (t("view_details") || "View Details")}
				</span>
				<ChevronRight size={13} strokeWidth={2.5} className={styles.footerIcon} />
			</div>
		</button>
	);
};

