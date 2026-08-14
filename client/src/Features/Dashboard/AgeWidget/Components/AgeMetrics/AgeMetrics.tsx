import React from "react";
import styles from "./AgeMetrics.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { Sparkles, Calendar } from "lucide-react";

interface AgeMetricsProps {
	ageData: {
		biologicalAge: number;
		chronoAge: number;
		range: { start: number; end: number };
	};
}

export const AgeMetrics: React.FC<AgeMetricsProps> = ({ ageData }) => {
	const { t } = useLanguage();

	return (
		<div className={styles.splitCardContainer}>
			{/* Biological Age Metric Card */}
			<div className={`${styles.compactCard} ${styles.compactCardBio}`}>
				<div className={styles.cardLeft}>
					<span className={styles.iconBio}>
						<Sparkles size={14} />
					</span>
					<span className={styles.cardLabel}>{t("biological_age")}</span>
				</div>
				<strong className={styles.valBio}>
					{ageData.biologicalAge} <small className={styles.unit}>{t("years_short")}</small>
				</strong>
			</div>

			{/* Chronological Age Metric Card */}
			<div className={`${styles.compactCard} ${styles.compactCardChrono}`}>
				<div className={styles.cardLeft}>
					<span className={styles.iconChrono}>
						<Calendar size={14} />
					</span>
					<span className={styles.cardLabel}>{t("chronological_age")}</span>
				</div>
				<strong className={styles.valChrono}>
					{ageData.chronoAge} <small className={styles.unit}>{t("years_short")}</small>
				</strong>
			</div>
		</div>
	);
};
