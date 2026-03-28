import Heart from "@assets/ConcernsWidget/Heart.svg";
import Diab from "@assets/ConcernsWidget/Diab.svg";

export interface Concern {
	id: number;
	title: string;
	factors: string[];
	icon: string;
	status: "High" | "Medium" | "Low";
	link?: string;
}

export const concernsMockData: Concern[] = [
	{
		id: 1,
		title: "Atrial Fibrillation",
		factors: ["High cholesterol", "Smoking", "Hypertension"],
		icon: Heart,
		status: "High",
		link: "cardiovascular",
	},
	{
		id: 2,
		title: "Stroke",
		factors: ["Low oral glucose", "Family history"],
		icon: Diab,
		status: "High",
		link: "cardiovascular",
	},
	{
		id: 3,
		title: "Coronary Artery Disease",
		factors: [
			"High coronary artery calcium level",
			"High coronary artery calcium level",
		],
		icon: Heart,
		status: "Medium",
	},
	{
		id: 4,
		title: "Hypertension",
		factors: ["High blood pressure", "Stress", "High sodium diet"],
		icon: Heart,
		status: "Medium",
	},
	{
		id: 5,
		title: "Chronic Kidney Disease",
		factors: ["Elevated creatinine levels", "Diabetes", "Hypertension"],
		icon: Diab,
		status: "High",
	},
	{
		id: 6,
		title: "Obesity",
		factors: ["High BMI", "Low physical activity", "Unhealthy eating habits"],
		icon: Heart,
		status: "Low",
	},
];
