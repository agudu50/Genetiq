import React from "react";
import styles from "./Symptoms.module.scss";
import { AlertCircle } from "lucide-react";

interface SymptomsProps {
	description?: string;
	symptomList?: string[];
}

export const Symptoms: React.FC<SymptomsProps> = ({
	description,
	symptomList,
}) => {
	return (
		<div className={styles["Symptoms-wrapper"]}>
			<div className={styles["Symptoms-header-wrapper"]}>
				<div className={styles["Symptoms-header-title"]}>Symptoms</div>
				{description && (
					<div className={styles["Symptoms-header-desc"]}>{description}</div>
				)}
			</div>
			<div className={styles["Symptoms-list"]}>
				{symptomList?.map((symptom) => (
					<div key={symptom} className={styles["Symptoms-list-item"]}>
						<AlertCircle size={13} className={styles["Symptoms-item-icon"]} />
						<span>{symptom}</span>
					</div>
				))}
			</div>
		</div>
	);
};
