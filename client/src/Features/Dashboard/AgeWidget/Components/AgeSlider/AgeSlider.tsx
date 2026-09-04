import React, { useMemo } from "react";
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
	const spanWidth = Math.max(2, Math.abs(chronoPct - bioPct));

	const axisLabels = useMemo(() => {
		const labels: number[] = [];
		for (let age = rangeStart; age <= rangeEnd; age += 10) {
			labels.push(age);
		}
		return labels;
	}, [rangeStart, rangeEnd]);

	return (
		<div className={styles.gaugeContainer}>
			<div className={styles.gaugeHeader}>
				<div className={styles.titleGroup}>
					<span className={styles.gaugeTitle}>{t("age_timeline")}</span>
				</div>
				<div className={styles.legendGroup}>
					<span className={styles.legendBio}>
						<span className={styles.dotBio} /> Body Age ({ageData.biologicalAge})
					</span>
					<span className={styles.legendChrono}>
						<span className={styles.dotChrono} /> Actual Age ({ageData.chronoAge})
					</span>
				</div>
			</div>

			<div className={styles.trackCard}>
				<div className={styles.trackBar}>
					<div className={styles.trackBackground} />

					{/* Active Span between Bio and Chrono */}
					<div
						className={styles.activeSpan}
						style={{ left: `${spanLeft}%`, width: `${spanWidth}%` }}
					/>

					{/* Bio Pointer */}
					<div
						className={`${styles.pointer} ${styles.pointerBio}`}
						style={{ left: `${bioPct}%` }}
						title={`Body Age: ${ageData.biologicalAge}`}
					>
						<span className={styles.pointerInner} />
					</div>

					{/* Chrono Pointer */}
					<div
						className={`${styles.pointer} ${styles.pointerChrono}`}
						style={{ left: `${chronoPct}%` }}
						title={`Actual Age: ${ageData.chronoAge}`}
					>
						<span className={styles.pointerInner} />
					</div>
				</div>

				{/* Axis Ticks & Labels */}
				<div className={styles.axisContainer}>
					{axisLabels.map((val) => (
						<div key={val} className={styles.axisCol}>
							<div className={styles.tick} />
							<span className={styles.axisVal}>{val}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
