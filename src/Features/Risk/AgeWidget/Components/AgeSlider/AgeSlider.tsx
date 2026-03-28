import Thumb from "@assets/AgeWidget/Thumb.svg?react";
import Circle from "@assets/AgeWidget/Circle.svg?react";
import styles from "./AgeSlider.module.scss";

interface AgeSliderProps {
	ageData: {
		biologicalAge: number;
		chronoAge: number;
	};
}

export const AgeSlider: React.FC<AgeSliderProps> = ({ ageData }) => {
	const minAge = Math.min(ageData.biologicalAge, ageData.chronoAge);
	const maxAge = Math.max(ageData.biologicalAge, ageData.chronoAge);
	const rangeStart = Math.min(ageData.biologicalAge, ageData.chronoAge) - 1;
	const range = 16;

	const bioAgePercentage = ((minAge - rangeStart) * 100) / range + 1;

	const chronoAgePercentage = ((maxAge - rangeStart) * 100) / range;

	const axisLabels = Array.from(
		{ length: range + 2 },
		(_, i) => rangeStart + i,
	);

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
							index === Math.floor(range / 2)
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
