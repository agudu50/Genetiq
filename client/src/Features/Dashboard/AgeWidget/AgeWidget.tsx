import styles from "./AgeWidget.module.scss";
import { AgeMetrics } from "./Components/AgeMetrics/AgeMetrics";
import { AgeSlider } from "./Components/AgeSlider/AgeSlider";

import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";

export const AgeWidget = () => {
	const user = useSelector((state: RootState) => state.user);

	const chronoAge = Number(user.age) || 32;
	const biologicalAge =
		Number(user.biologicalAge) || Number((chronoAge - 1.5).toFixed(1));

	const ageData = {
		biologicalAge: biologicalAge,
		chronoAge: chronoAge,
		range: { start: 20, end: 80 },
	};

	return (
		<div className={styles["AgeWidget-container"]}>
			<AgeMetrics ageData={ageData} />
			<AgeSlider ageData={ageData} />
		</div>
	);
};
