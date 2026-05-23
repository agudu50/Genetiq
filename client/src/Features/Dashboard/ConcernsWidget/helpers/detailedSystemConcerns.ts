import Drop from "@assets/ConcernsWidget/Drop.svg";
import Graph from "@assets/ConcernsWidget/Graph.svg";
// import Gene from "@assets/ConcernsWidget/Gene.svg";
// import Vitals from "@assets/ConcernsWidget/Vitals.svg";
import {
	AtrialFibrillationPlanMockData,
	CoronaryArteryDiseasePlanMockData,
	HeartFailurePlanMockData,
	HypertensionPlanMockData,
	planMockData,
	PlanSection,
	StrokePlanMockData,
} from "../../PlanWidget/helpers/planMockData";

export interface Detail {
	id: number;
	title: string;
	factors: string[];
	reasons: Reason[];
	symptoms?: Symptoms;
	plan: PlanSection[];
	status: "High" | "Medium" | "Low";
	frame?: string;
	description?: string[];
}

export interface Reason {
	id: number;
	title: string;
	icon: string;
	test: string;
	level: { type: "progress"; src: number } | { type: "image"; src: string };
	value: string;
	unit: string;
	statusText: string;
	status: "High" | "Medium" | "Low";
	description: string;
	date: string;
}

export interface Symptoms {
	id: number;
	description: string;
	symptomsList: string[];
}

export interface SystemConcerns {
	id: number;
	title: string;
	details: Detail[];
	defaultPlan: PlanSection[];
}

export const detailedSystemConcerns: SystemConcerns[] = [
	{
		id: 1,
		title: "cardiovascular",
		defaultPlan: planMockData,
		details: [
			{
				id: 1,
				title: "Atrial Fibrillation",
				factors: ["High Cholesterol level", "Other influencing factors"],
				status: "High",
				reasons: [
					{
						id: 1,
						title: "LDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 55 },
						value: "112",
						unit: "mg/dL",
						statusText: "Above optimal",
						status: "High",
						description:
							'LDL stands for low-density lipoprotein, a type of cholesterol in your blood that is sometimes called "bad" cholesterol',
						date: "100-129",
					},
					{
						id: 2,
						title: "VLDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "image", src: Graph },
						value: "17",
						unit: "mg/dL",
						statusText: "Optimal",
						status: "Low",
						description:
							"VLDL stands for very low-density lipoprotein, a type of fat in your blood that can contribute to plaque buildup in your arteries.",
						date: "7-40",
					},
					{
						id: 3,
						title: "HDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 0 },
						value: "58",
						unit: "mg/dL",
						statusText: "Below Optimal",
						status: "High",
						description:
							" HDL helps remove cholesterol from the bloodstream and is linked to a lower risk of heart disease.",
						date: "60-null",
					},

					{
						id: 4,
						title: "Cholesterol",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 55 },
						value: "181",
						unit: "mg/dL",
						statusText: "Optimal",
						status: "Low",
						description:
							"Your body needs cholesterol to make hormones, digest food, and more. However, too much cholesterol can be a problem. ",
						date: "null-200",
					},
					{
						id: 4,
						title: "Cholesterol:HDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 50 },
						value: "3.1",
						unit: "Ratio",
						statusText: "Optimal",
						status: "Low",
						description:
							"Calculation that compares your total cholesterol to your high-density lipoprotein (HDL) cholesterol levels ",
						date: "null-4",
					},
					{
						id: 4,
						title: "HbA1C",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 55 },
						value: "5.3",
						unit: "Ratio",
						statusText: "Optimal",
						status: "Low",
						description:
							"Average level of blood sugar over the past two to three months ",
						date: "4-6",
					},
				],
				symptoms: {
					id: 1,
					description:
						"Symptoms of AFib can vary, and in some cases, individuals may not notice any symptoms at all. You may experience the following symptoms with AFib",
					symptomsList: [
						"Palpitations",
						"Shortness of breath",
						"Fatigue or weakness",
						"Chest pain",
						"Dizziness or lightheadedness",
						"Fatigue or weakness",
					],
				},
				plan: AtrialFibrillationPlanMockData,

				frame:
					"https://human.biodigital.com/viewer/?id=5v3G&ui-anatomy-descriptions=true&ui-anatomy-pronunciations=true&ui-anatomy-labels=false&ui-audio=true&ui-chapter-list=false&ui-fullscreen=false&ui-help=false&ui-info=false&ui-label-list=true&ui-layers=false&ui-skin-layers=false&ui-loader=circle&ui-media-controls=none&ui-menu=false&ui-nav=false&ui-search=false&ui-tools=false&ui-tutorial=false&ui-undo=false&ui-whiteboard=false&initial.none=true&disable-scroll=false&dk=57a9053995a029ade6a11d83c8a64a4fedef2b19&paid=o_27f525a0",
				description: [
					"AFib is a common heart rhythm disorder characterized by irregular and often rapid heartbeats, leading to an increased risk of stroke, heart failure, and other cardiovascular complications.",
					"Atrial fibrillation affects millions of people worldwide and is often influenced by a combination of genetic predisposition and environmental factors.",
					"Variations in genes encoding ion channels, structural proteins, and signaling molecules involved in cardiac electrical conduction and contractility contribute to the development of AFib. Common genetic risk factors include mutations in the KCNE1, KCNH2, and SCN5A genes, which regulate potassium and sodium channels crucial for maintaining normal heart rhythm.",
				],
			},
			{
				id: 2,
				title: "Stroke",
				factors: ["High heart rate level", "Other influencing factors"],
				status: "High",
				reasons: [
					{
						id: 1,
						title: "LDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 55 },
						value: "112",
						unit: "mg/dL",
						statusText: "Above optimal",
						status: "High",
						description:
							'LDL stands for low-density lipoprotein, a type of cholesterol in your blood that is sometimes called "bad" cholesterol',
						date: "100-129",
					},
					{
						id: 2,
						title: "VLDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 55 },
						value: "17",
						unit: "mg/dL",
						statusText: "Optimal",
						status: "Low",
						description:
							"VLDL stands for very low-density lipoprotein, a type of fat in your blood that can contribute to plaque buildup in your arteries.",
						date: "7-40",
					},
					{
						id: 3,
						title: "HDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "image", src: Graph },
						value: "58",
						unit: "mg/dL",
						statusText: "Below Optimal",
						status: "Medium",
						description:
							" HDL helps remove cholesterol from the bloodstream and is linked to a lower risk of heart disease.",
						date: "60-null",
					},

					{
						id: 4,
						title: "Cholesterol",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 35 },
						value: "181",
						unit: "mg/dL",
						statusText: "Optimal",
						status: "Low",
						description:
							"Your body needs cholesterol to make hormones, digest food, and more. However, too much cholesterol can be a problem. ",
						date: "null-200",
					},
					{
						id: 4,
						title: "Cholesterol:HDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 50 },
						value: "3.1",
						unit: "Ratio",
						statusText: "Optimal",
						status: "Low",
						description:
							"Calculation that compares your total cholesterol to your high-density lipoprotein (HDL) cholesterol levels ",
						date: "null-4",
					},
					{
						id: 4,
						title: "HbA1C",
						icon: Drop,
						test: "Blood test",
						level: { type: "image", src: Graph },
						value: "5.3",
						unit: "Ratio",
						statusText: "Optimal",
						status: "Low",
						description:
							"Average level of blood sugar over the past two to three months ",
						date: "4-6",
					},
				],
				symptoms: {
					id: 1,
					description:
						"Symptoms of an ischemic stroke can be sudden and life-threatening, requiring immediate medical attention. However, some individuals may experience mild symptoms that can be mistaken for other conditions. You may experience the following symptoms with an ischemic stroke:",
					symptomsList: [
						"Sudden numbness or weakness, especially on one side of the body",
						"Confusion or trouble speaking",
						"Vision problems in one or both eyes",
						"Difficulty walking, dizziness, or loss of balance",
						"Severe headache with no known cause",
					],
				},
				plan: StrokePlanMockData,

				frame:
					"https://human.biodigital.com/viewer/?id=5v3G&ui-anatomy-descriptions=true&ui-anatomy-pronunciations=true&ui-anatomy-labels=false&ui-audio=true&ui-chapter-list=false&ui-fullscreen=false&ui-help=false&ui-info=false&ui-label-list=true&ui-layers=false&ui-skin-layers=false&ui-loader=circle&ui-media-controls=none&ui-menu=false&ui-nav=false&ui-search=false&ui-tools=false&ui-tutorial=false&ui-undo=false&ui-whiteboard=false&initial.none=true&disable-scroll=false&dk=57a9053995a029ade6a11d83c8a64a4fedef2b19&paid=o_27f525a0",
			},
			{
				id: 3,
				title: "Coronary Artery Disease",
				factors: ["High heart rate level", "Other influencing factors"],
				status: "Medium",
				reasons: [
					{
						id: 1,
						title: "LDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 51 },
						value: "112",
						unit: "mg/dL",
						statusText: "Above optimal",
						status: "High",
						description:
							'LDL stands for low-density lipoprotein, a type of cholesterol in your blood that is sometimes called "bad" cholesterol',
						date: "100-129",
					},
					{
						id: 2,
						title: "VLDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 43 },
						value: "17",
						unit: "mg/dL",
						statusText: "Optimal",
						status: "Low",
						description:
							"VLDL stands for very low-density lipoprotein, a type of fat in your blood that can contribute to plaque buildup in your arteries.",
						date: "7-40",
					},
					{
						id: 3,
						title: "HDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 85 },
						value: "58",
						unit: "mg/dL",
						statusText: "Below Optimal",
						status: "Medium",
						description:
							" HDL helps remove cholesterol from the bloodstream and is linked to a lower risk of heart disease.",
						date: "60-null",
					},

					{
						id: 4,
						title: "Cholesterol",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 55 },
						value: "181",
						unit: "mg/dL",
						statusText: "Optimal",
						status: "Low",
						description:
							"Your body needs cholesterol to make hormones, digest food, and more. However, too much cholesterol can be a problem. ",
						date: "null-200",
					},
					{
						id: 4,
						title: "Cholesterol:HDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "image", src: Graph },
						value: "3.1",
						unit: "Ratio",
						statusText: "Optimal",
						status: "Low",
						description:
							"Calculation that compares your total cholesterol to your high-density lipoprotein (HDL) cholesterol levels ",
						date: "null-4",
					},
					{
						id: 4,
						title: "HbA1C",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 15 },
						value: "5.3",
						unit: "Ratio",
						statusText: "Optimal",
						status: "Low",
						description:
							"Average level of blood sugar over the past two to three months ",
						date: "4-6",
					},
				],
				symptoms: {
					id: 1,
					description:
						"Symptoms of CAD can vary, and in some cases, there may be no noticeable signs until the condition is advanced. You may experience the following symptoms with CAD:",
					symptomsList: [
						"Chest pain (angina)",
						"Shortness of breath",
						"Fatigue",
						"Heart palpitations",
						"Nausea",
					],
				},
				plan: CoronaryArteryDiseasePlanMockData,
				frame:
					"https://human.biodigital.com/viewer/?id=5v3G&ui-anatomy-descriptions=true&ui-anatomy-pronunciations=true&ui-anatomy-labels=false&ui-audio=true&ui-chapter-list=false&ui-fullscreen=false&ui-help=false&ui-info=false&ui-label-list=true&ui-layers=false&ui-skin-layers=false&ui-loader=circle&ui-media-controls=none&ui-menu=false&ui-nav=false&ui-search=false&ui-tools=false&ui-tutorial=false&ui-undo=false&ui-whiteboard=false&initial.none=true&disable-scroll=false&dk=57a9053995a029ade6a11d83c8a64a4fedef2b19&paid=o_27f525a0",
			},
			{
				id: 4,
				title: "Hypertension",
				factors: ["High Cholesterol level", "Other influencing factors"],
				status: "High",
				reasons: [
					{
						id: 1,
						title: "LDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 15 },
						value: "112",
						unit: "mg/dL",
						statusText: "Above optimal",
						status: "High",
						description:
							'LDL stands for low-density lipoprotein, a type of cholesterol in your blood that is sometimes called "bad" cholesterol',
						date: "100-129",
					},
					{
						id: 2,
						title: "VLDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 50 },
						value: "17",
						unit: "mg/dL",
						statusText: "Optimal",
						status: "Low",
						description:
							"VLDL stands for very low-density lipoprotein, a type of fat in your blood that can contribute to plaque buildup in your arteries.",
						date: "7-40",
					},
					{
						id: 3,
						title: "HDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 75 },
						value: "58",
						unit: "mg/dL",
						statusText: "Below Optimal",
						status: "Medium",
						description:
							" HDL helps remove cholesterol from the bloodstream and is linked to a lower risk of heart disease.",
						date: "60-null",
					},

					{
						id: 4,
						title: "Cholesterol",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 35 },
						value: "181",
						unit: "mg/dL",
						statusText: "Optimal",
						status: "Low",
						description:
							"Your body needs cholesterol to make hormones, digest food, and more. However, too much cholesterol can be a problem. ",
						date: "null-200",
					},
					{
						id: 4,
						title: "Cholesterol:HDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "image", src: Graph },
						value: "3.1",
						unit: "Ratio",
						statusText: "Optimal",
						status: "Low",
						description:
							"Calculation that compares your total cholesterol to your high-density lipoprotein (HDL) cholesterol levels ",
						date: "null-4",
					},
					{
						id: 4,
						title: "HbA1C",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 25 },
						value: "5.3",
						unit: "Ratio",
						statusText: "Optimal",
						status: "Low",
						description:
							"Average level of blood sugar over the past two to three months ",
						date: "4-6",
					},
				],
				symptoms: {
					id: 1,
					description:
						"Symptoms of hypertension are often not noticeable until they reach severe levels, which is why it is known as the -silent killer.- However, you may experience the following symptoms if hypertension becomes severe:",
					symptomsList: [
						"Headaches",
						"Shortness of breath",
						"Nosebleeds",
						"Fatigue or confusion",
						"Vision problems",
					],
				},
				plan: HypertensionPlanMockData,
				frame:
					"https://human.biodigital.com/viewer/?id=5v3G&ui-anatomy-descriptions=true&ui-anatomy-pronunciations=true&ui-anatomy-labels=false&ui-audio=true&ui-chapter-list=false&ui-fullscreen=false&ui-help=false&ui-info=false&ui-label-list=true&ui-layers=false&ui-skin-layers=false&ui-loader=circle&ui-media-controls=none&ui-menu=false&ui-nav=false&ui-search=false&ui-tools=false&ui-tutorial=false&ui-undo=false&ui-whiteboard=false&initial.none=true&disable-scroll=false&dk=57a9053995a029ade6a11d83c8a64a4fedef2b19&paid=o_27f525a0",
			},
			{
				id: 5,
				title: "Heart Failure",
				factors: ["High heart rate level", "Other influencing factors"],
				status: "Low",
				reasons: [
					{
						id: 1,
						title: "LDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 55 },
						value: "112",
						unit: "mg/dL",
						statusText: "Above optimal",
						status: "Medium",
						description:
							'LDL stands for low-density lipoprotein, a type of cholesterol in your blood that is sometimes called "bad" cholesterol',
						date: "100-129",
					},
					{
						id: 2,
						title: "VLDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 55 },
						value: "17",
						unit: "mg/dL",
						statusText: "Optimal",
						status: "Low",
						description:
							"VLDL stands for very low-density lipoprotein, a type of fat in your blood that can contribute to plaque buildup in your arteries.",
						date: "7-40",
					},
					{
						id: 3,
						title: "HDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 15 },
						value: "58",
						unit: "mg/dL",
						statusText: "Below Optimal",
						status: "High",
						description:
							" HDL helps remove cholesterol from the bloodstream and is linked to a lower risk of heart disease.",
						date: "60-null",
					},

					{
						id: 4,
						title: "Cholesterol",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 55 },
						value: "181",
						unit: "mg/dL",
						statusText: "Optimal",
						status: "Low",
						description:
							"Your body needs cholesterol to make hormones, digest food, and more. However, too much cholesterol can be a problem. ",
						date: "null-200",
					},
					{
						id: 4,
						title: "Cholesterol:HDL",
						icon: Drop,
						test: "Blood test",
						level: { type: "image", src: Graph },
						value: "3.1",
						unit: "Ratio",
						statusText: "Optimal",
						status: "Low",
						description:
							"Calculation that compares your total cholesterol to your high-density lipoprotein (HDL) cholesterol levels ",
						date: "null-4",
					},
					{
						id: 4,
						title: "HbA1C",
						icon: Drop,
						test: "Blood test",
						level: { type: "progress", src: 85 },
						value: "5.3",
						unit: "Ratio",
						statusText: "Optimal",
						status: "Low",
						description:
							"Average level of blood sugar over the past two to three months ",
						date: "4-6",
					},
				],
				symptoms: {
					id: 1,
					description:
						"Symptoms of sudden cardiac arrest are often immediate and life-threatening, requiring urgent medical intervention. However, in some cases, individuals may experience warning signs. You may experience the following symptoms prior to sudden cardiac arrest:",
					symptomsList: [
						"Sudden collapse",
						"No pulse",
						"No breathing",
						"Loss of consciousness",
						"Sometimes preceded by chest pain, shortness of breath, or dizziness",
					],
				},
				plan: HeartFailurePlanMockData,
				frame:
					"https://human.biodigital.com/viewer/?id=5v3G&ui-anatomy-descriptions=true&ui-anatomy-pronunciations=true&ui-anatomy-labels=false&ui-audio=true&ui-chapter-list=false&ui-fullscreen=false&ui-help=false&ui-info=false&ui-label-list=true&ui-layers=false&ui-skin-layers=false&ui-loader=circle&ui-media-controls=none&ui-menu=false&ui-nav=false&ui-search=false&ui-tools=false&ui-tutorial=false&ui-undo=false&ui-whiteboard=false&initial.none=true&disable-scroll=false&dk=57a9053995a029ade6a11d83c8a64a4fedef2b19&paid=o_27f525a0",
			},
		],
	},
];
