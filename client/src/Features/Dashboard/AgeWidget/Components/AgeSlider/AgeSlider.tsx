import { useMemo } from "react";
import styles from "./AgeSlider.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";

interface AgeSliderProps {
	ageData: {
		biologicalAge: number;
		chronoAge: number;
		range: { start: number; end: number };
	};
}

const toPercent = (age: number, start: number, end: number) =>
	Math.min(100, Math.max(0, ((age - start) / (end - start)) * 100));

export const AgeSlider: React.FC<AgeSliderProps> = ({ ageData }) => {
	const { t } = useLanguage();
	const rangeStart = ageData.range.start;
	const rangeEnd = ageData.range.end;

	const bioPct = toPercent(ageData.biologicalAge, rangeStart, rangeEnd);
	const chronoPct = toPercent(ageData.chronoAge, rangeStart, rangeEnd);
	const spanLeft = Math.min(bioPct, chronoPct);
	const spanWidth = Math.abs(chronoPct - bioPct);
	const isYounger = ageData.chronoAge > ageData.biologicalAge;

	const axisLabels = useMemo(() => {
		const labels: number[] = [];
		for (let age = rangeStart; age <= rangeEnd; age += 10) {
			labels.push(age);
		}
		return labels;
	}, [rangeStart, rangeEnd]);

	return (
		<div className={styles.slider}>
			<div className={styles.sliderHeader}>
				<span className={styles.sliderTitle}>{t("age_timeline")}</span>
				<div className={styles.legend}>
					<span className={styles.legendItem}>
						<span className={`${styles.legendDot} ${styles.legendDotBio}`} />
						{t("age_bio_short")}
					</span>
					<span className={styles.legendItem}>
						<span className={`${styles.legendDot} ${styles.legendDotChrono}`} />
						{t("age_chrono_short")}
					</span>
				</div>
			</div>

			<div className={styles.trackWrap}>
				<div className={styles.track}>
					<div className={styles.trackRail} />

					{spanWidth > 0.5 && (
						<div
							className={`${styles.trackSpan} ${isYounger ? styles.trackSpanGood : styles.trackSpanWarn}`}
							style={{ left: `${spanLeft}%`, width: `${spanWidth}%` }}
						/>
					)}

					<div
						className={`${styles.marker} ${styles.markerBio}`}
						style={{ left: `${bioPct}%` }}
					>
						<span className={styles.markerLabel}>{ageData.biologicalAge}</span>
						<span className={styles.markerDot} />
					</div>

					<div
						className={`${styles.marker} ${styles.markerChrono}`}
						style={{ left: `${chronoPct}%` }}
					>
						<span className={styles.markerLabel}>{ageData.chronoAge}</span>
						<span className={styles.markerDot} />
					</div>
				</div>
			</div>

			<div className={styles.axis}>
				{axisLabels.map((label) => (
					<span key={label} className={styles.axisLabel}>
						{label}
					</span>
				))}
			</div>
		</div>
	);
};
