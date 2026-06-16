import styles from "./AgeMetrics.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { Activity, CalendarDays } from "lucide-react";

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
		<div className={styles.metrics}>
			<div className={`${styles.ageCard} ${styles.ageCardBio}`}>
				<span className={styles.ageCardIcon}>
					<Activity size={15} strokeWidth={2.25} />
				</span>
				<div className={styles.ageCardCopy}>
					<span className={styles.ageCardLabel}>{t("biological_age")}</span>
					<strong className={styles.ageCardValue}>
						{ageData.biologicalAge}
						<span className={styles.ageCardUnit}>{t("years_short")}</span>
					</strong>
				</div>
			</div>

			<div className={`${styles.ageCard} ${styles.ageCardChrono}`}>
				<span className={styles.ageCardIcon}>
					<CalendarDays size={15} strokeWidth={2.25} />
				</span>
				<div className={styles.ageCardCopy}>
					<span className={styles.ageCardLabel}>{t("chronological_age")}</span>
					<strong className={styles.ageCardValue}>
						{ageData.chronoAge}
						<span className={styles.ageCardUnit}>{t("years_short")}</span>
					</strong>
				</div>
			</div>
		</div>
	);
};
