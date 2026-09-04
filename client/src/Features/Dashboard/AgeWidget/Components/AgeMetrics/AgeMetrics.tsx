import React from "react";
import styles from "./AgeMetrics.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { HeartPulse, Calendar } from "lucide-react";

interface AgeMetricsProps {
	ageData: {
		biologicalAge: number;
		chronoAge: number;
		range: { start: number; end: number };
	};
}

export const AgeMetrics: React.FC<AgeMetricsProps> = ({ ageData }) => {
	const { t } = useLanguage();
	const diff = Math.abs(ageData.chronoAge - ageData.biologicalAge).toFixed(1);
	const isYounger = ageData.chronoAge > ageData.biologicalAge;
	const isOlder = ageData.biologicalAge > ageData.chronoAge;

	return (
		<div className={styles.splitCardContainer}>
			{/* Biological (Body) Age Metric Card */}
			<div className={`${styles.compactCard} ${styles.compactCardBio}`}>
				<div className={styles.cardHeader}>
					<div className={styles.iconBio}>
						<HeartPulse size={15} strokeWidth={2.2} />
					</div>
					<div className={styles.labelGroup}>
						<span className={styles.cardLabel}>Body Age</span>
						<span className={styles.bioSubtext}>
							{isYounger
								? `${diff} yrs younger than actual`
								: isOlder
									? `${diff} yrs older than actual`
									: "Matches actual age"}
						</span>
					</div>
				</div>
				<div className={styles.valueRow}>
					<span className={styles.valBio}>{ageData.biologicalAge}</span>
					<span className={styles.unit}>{t("years_short")}</span>
				</div>
			</div>

			{/* Chronological (Actual) Age Metric Card */}
			<div className={`${styles.compactCard} ${styles.compactCardChrono}`}>
				<div className={styles.cardHeader}>
					<div className={styles.iconChrono}>
						<Calendar size={15} strokeWidth={2.2} />
					</div>
					<div className={styles.labelGroup}>
						<span className={styles.cardLabel}>Actual Age</span>
						<span className={styles.chronoSubtext}>From your birthday</span>
					</div>
				</div>
				<div className={styles.valueRow}>
					<span className={styles.valChrono}>{ageData.chronoAge}</span>
					<span className={styles.unit}>{t("years_short")}</span>
				</div>
			</div>
		</div>
	);
};
