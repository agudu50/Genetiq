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
	const spanWidth = Math.max(1.5, Math.abs(chronoPct - bioPct));
	const tooltipLeft = Math.min(88, Math.max(12, spanLeft + spanWidth / 2));

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
				<span className={styles.gaugeTitle}>{t("age_timeline")}</span>
				<div className={styles.legendGroup}>
					<span className={styles.legendBio}>
						<span className={styles.dotBio} /> Bio ({ageData.biologicalAge})
					</span>
					<span className={styles.legendChrono}>
						<span className={styles.dotChrono} /> Chrono ({ageData.chronoAge})
					</span>
				</div>
			</div>

			<div className={styles.trackCard}>
				{/* Unified Floating Floating Badge Callout */}
				<div
					className={styles.unifiedCallout}
					style={{ left: `${tooltipLeft}%` }}
				>
					<span className={styles.calloutBio}>Bio {ageData.biologicalAge}</span>
					<span className={styles.calloutSep}>•</span>
					<span className={styles.calloutChrono}>Chrono {ageData.chronoAge}</span>
				</div>

				<div className={styles.trackBar}>
					<div className={styles.trackBackground} />

					{/* Active Reversal Span */}
					<div
						className={styles.activeSpan}
						style={{ left: `${spanLeft}%`, width: `${spanWidth}%` }}
					/>

					{/* Bio Pointer Dot */}
					<div
						className={`${styles.pointer} ${styles.pointerBio}`}
						style={{ left: `${bioPct}%` }}
					/>

					{/* Chrono Pointer Dot */}
					<div
						className={`${styles.pointer} ${styles.pointerChrono}`}
						style={{ left: `${chronoPct}%` }}
					/>
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
