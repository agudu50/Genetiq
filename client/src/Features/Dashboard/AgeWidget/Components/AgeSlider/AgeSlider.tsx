import { useMemo } from "react";
import Thumb from "@assets/AgeWidget/Thumb.svg?react";
import Circle from "@assets/AgeWidget/Circle.svg?react";
import styles from "./AgeSlider.module.scss";

interface AgeSliderProps {
	ageData: {
		biologicalAge: number;
		chronoAge: number;
		range: { start: number; end: number };
	};
}

export const AgeSlider: React.FC<AgeSliderProps> = ({ ageData }) => {
	const minAge = Math.min(ageData.biologicalAge, ageData.chronoAge);
	const maxAge = Math.max(ageData.biologicalAge, ageData.chronoAge);
	const rangeStart = ageData.range?.start ?? 46;
	const rangeEnd = ageData.range?.end ?? 62;
	const rangeLength = rangeEnd - rangeStart;

	const bioAgePercentage = ((minAge - rangeStart) * 100) / rangeLength + 1;
	const chronoAgePercentage = ((maxAge - rangeStart) * 100) / rangeLength;

	const axisLabels = useMemo(() => {
		const labels = [];
		const step = 10;
		for (let age = rangeStart; age <= rangeEnd; age += step) {
			labels.push(age);
		}
		return labels;
	}, [rangeStart, rangeEnd]);

	return (
		<div className={styles["AgeSlider-container"]}>
			<div className={styles["AgeSlider-title"]}>You</div>
			<div className={styles["AgeSlider-bar-wrapper"]}>
				<div className={styles["AgeSlider-bar"]}>
					<Circle className={styles["AgeSlider-circle-start"]} />
					<div
						className={styles["AgeSlider-bar-fill"]}
						style={
							{
								"width": `calc(${chronoAgePercentage}%)`,
								"--chronoAgePercentage": `${chronoAgePercentage}%`,
							} as React.CSSProperties
						}
					></div>

					<div className={styles["AgeSlider-horizontal-line"]}></div>
					<Circle className={styles["AgeSlider-circle-end"]} />
					<Thumb
						className={styles["AgeSlider-thumb"]}
						style={
							{
								"left": `${bioAgePercentage}%`,
								"--bioAgePercentage": `${bioAgePercentage}%`,
							} as React.CSSProperties
						}
					/>
				</div>
			</div>
			<div className={styles["AgeSlider-axis"]}>
				{axisLabels.map((label, index) => (
					<div
						key={index}
						className={`${styles["AgeSlider-axis-label"]} ${
							index === Math.floor(rangeLength / 2)
								? styles["AgeSlider-axis-label-median"]
								: ""
						}`}
					>
						{label}
					</div>
				))}
			</div>
		</div>
	);
};
