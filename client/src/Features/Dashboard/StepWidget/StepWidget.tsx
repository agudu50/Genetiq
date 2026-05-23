import React from "react";
import { StepItem } from "@/App/Types";
import styles from "./StepWidget.module.scss";

interface StepWidgetProps {
	items: StepItem[];
	current: number;
}

export const StepWidget: React.FC<StepWidgetProps> = ({ items, current }) => {
	return (
		<div className={styles["step-widget"]}>
			{items.map((item, index) => (
				<div key={index} className={styles["step-item"]}>
					<div className={styles["step-info"]}>
						<div
							className={`${styles["step-icon"]} ${current === index ? styles["selected-step-item"] : ""}`}
						>
							{item.icon}
						</div>
						<div className={styles["step-title"]}>
							<span>{item.title}</span>
							<div className={styles["step-description"]}>
								{item.description}
							</div>
						</div>
						<div className={styles["step-line"]}></div>
					</div>
				</div>
			))}
		</div>
	);
};
