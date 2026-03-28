import { useState, useEffect, useRef } from "react";
import { Symptoms } from "../../helpers/detailedSystemConcerns";
import styles from "./SymptomsList.module.scss";

interface SymptomsProps {
	symptoms?: Symptoms;
}

export const SymptomsList: React.FC<SymptomsProps> = ({ symptoms }) => {
	const [numberOfVisibleSymptoms, setNumberOfVisibleSymptoms] = useState(0);
	const symptomsListRef = useRef<HTMLDivElement>(null);
	const symptomItemsRef = useRef<(HTMLDivElement | null)[]>([]);
	const overflowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const calculateSymptoms = () => {
			if (symptomsListRef.current) {
				const containerWidth = symptomsListRef.current.offsetWidth;

				const containerStyle = window.getComputedStyle(symptomsListRef.current);
				const gapWidth = parseInt(containerStyle.gap, 10);

				const itemWidths: number[] = symptomItemsRef.current.map(
					(item) => item?.offsetWidth || 0,
				);

				const overflowDivWidth = overflowRef.current
					? overflowRef.current.offsetWidth
					: 0;

				let itemsPerRow = 0;
				let currentWidth = 0;
				const totalSymptoms = symptoms?.symptomsList || [];

				for (let i = 0; i < totalSymptoms.length; i++) {
					currentWidth += itemWidths[i] + gapWidth;
					if (currentWidth + overflowDivWidth > containerWidth) {
						break;
					}
					itemsPerRow++;

					setNumberOfVisibleSymptoms(itemsPerRow);
				}
			}
		};

		calculateSymptoms();
		window.addEventListener("resize", calculateSymptoms);

		return () => {
			window.removeEventListener("resize", calculateSymptoms);
		};
	}, [symptoms?.symptomsList]);

	const numberOfOverflowSymptoms =
		(symptoms?.symptomsList?.length || 0) - numberOfVisibleSymptoms;

	return (
		<div className={styles["SymptomsList-container"]}>
			<div className={styles["SymptomsList-head"]}>Symptoms</div>
			<div className={styles["SymptomsList-description"]}>
				{symptoms?.description}
			</div>
			<div className={styles["SymptomsList-list"]} ref={symptomsListRef}>
				{symptoms?.symptomsList.map((symptom, index) => (
					<div
						key={index}
						ref={(el) => (symptomItemsRef.current[index] = el)}
						className={`${styles["SymptomsList-symptom"]} ${
							numberOfVisibleSymptoms < index + 1 &&
							styles["SymptomsList-symptom-hidden"]
						}`}
					>
						{symptom}
					</div>
				))}
				{numberOfOverflowSymptoms > 0 && (
					<div
						className={styles["SymptomsList-symptom-overflow"]}
						ref={overflowRef}
					>
						+{numberOfOverflowSymptoms}
					</div>
				)}
			</div>
		</div>
	);
};
