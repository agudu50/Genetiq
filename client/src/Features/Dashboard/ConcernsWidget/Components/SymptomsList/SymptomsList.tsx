import { useState, useEffect, useRef } from "react";
import { Symptoms } from "../../helpers/detailedSystemConcerns";
import styles from "./SymptomsList.module.scss";
import {
	HeartPulse,
	Wind,
	BatteryLow,
	Activity,
	EyeOff,
	Footprints,
	Brain,
	MessageSquareOff,
	Moon,
	Droplet,
	Flame,
	ZapOff,
	ShieldAlert,
	AlertCircle,
} from "lucide-react";

interface SymptomsProps {
	symptoms?: Symptoms;
}

const getSymptomIcon = (symptom: string) => {
	const lower = symptom.toLowerCase();
	if (lower.includes("palpitation")) return <HeartPulse size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	if (lower.includes("breath") || lower.includes("breathing")) return <Wind size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	if (lower.includes("fatigue") || lower.includes("weakness")) return <BatteryLow size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	if (lower.includes("chest pain") || lower.includes("angina")) return <Flame size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	if (lower.includes("dizziness") || lower.includes("balance") || lower.includes("lightheaded")) return <Activity size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	if (lower.includes("numbness")) return <ZapOff size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	if (lower.includes("speech") || lower.includes("speak") || lower.includes("confusion")) return <MessageSquareOff size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	if (lower.includes("vision") || lower.includes("eye")) return <EyeOff size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	if (lower.includes("walk") || lower.includes("gait")) return <Footprints size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	if (lower.includes("headache")) return <Brain size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	if (lower.includes("nosebleed")) return <Droplet size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	if (lower.includes("collapse")) return <ShieldAlert size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	if (lower.includes("pulse")) return <HeartPulse size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	if (lower.includes("consciousness") || lower.includes("unconscious")) return <Moon size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
	return <AlertCircle size={11} strokeWidth={2.5} className={styles["symptomIcon"]} />;
};

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
						{getSymptomIcon(symptom)}
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
