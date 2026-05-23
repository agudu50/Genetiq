import React from "react";
import { RiskSlider } from "./Components/RiskSlider/RiskSlider";
import styles from "./RiskStatus.module.scss";

interface RiskStatusProps {
	status: string;
}

export const RiskStatus: React.FC<RiskStatusProps> = ({ status }) => {
	const highLevel = status === "High" ? 80 : status === "Medium" ? 50 : 25;
	return (
		<div className={styles["RiskStatus-wrapper"]}>
			<div className={styles["text"]}>
				You have a <span>high concern</span> of developing Atrial Fibrillation
			</div>
			<RiskSlider riskPercentage={highLevel} />
		</div>
	);
};
