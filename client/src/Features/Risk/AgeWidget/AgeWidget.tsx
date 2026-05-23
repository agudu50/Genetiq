import styles from "./AgeWidget.module.scss";
import { AgeMetrics } from "./Components/AgeMetrics/AgeMetrics";
import { AgeSlider } from "./Components/AgeSlider/AgeSlider";

export const AgeWidget = () => {
	const ageData = { biologicalAge: 47, ageLastWeek: 49, chronoAge: 54 };

	return (
		<div className={styles["AgeWidget-container"]}>
			<AgeMetrics ageData={ageData} />
			<AgeSlider ageData={ageData} />
		</div>
	);
};
