import beetroot from "@assets/PlanWidget/Supplements/beetroot.svg";
import tumeric from "@assets/PlanWidget/Supplements/tumeric.svg";
import omega from "@assets/PlanWidget/Supplements/omega.svg";
import coenzyme from "@assets/PlanWidget/Supplements/coenzyme.svg";
import ashwagandha from "@assets/PlanWidget/Supplements/ashwagandha.svg";

import train from "@assets/PlanWidget/Lifestyle/train.svg";
import quitSmoking from "@assets/PlanWidget/Lifestyle/quitSmoking.svg";
import apple from "@assets/PlanWidget/Lifestyle/apple.svg";

import gene from "@assets/PlanWidget/FollowUpCare/gene.svg";
import microscope from "@assets/PlanWidget/FollowUpCare/microscope.svg";
import scale from "@assets/PlanWidget/FollowUpCare/scale.svg";

import heart from "@assets/ConcernsWidget/Heart.svg";
import diab from "@assets/ConcernsWidget/Diab.svg";

export type PlanSection = {
	title: string;
	cta?: Supplements;
	type?: string;
	data: PlanItem[];
};

export type Supplements = {
	title: string;
	description: string;
	types: {
		name: string;
		icon: string;
		supplements: {
			amount: number;
			supplement: string;
		}[];
	}[];
};

export type PlanItem = {
	name: string;
	description: string;
	group?: string;
	dosage?: string;
	frequency?: string;
	count?: number;
	link?: string;
	icon: string;
};

export const planMockData: PlanSection[] = [
	{
		title: "Action Plan",
		type: "aggregated",
		data: [],
	},
	{
		title: "Follow-up Care",
		data: [
			{
				name: "Take Genetic Health Risk Tests",
				description: "Improved lung function",
				icon: gene,
			},
			{
				name: "Monitoring blood pressure 3 times a week",
				description: "Early detection of hypertension",
				icon: scale,
			},
			{
				name: "Adopt a low-glycemic index and heart healthy diets",
				description: "Helps widen blood vessels +6",
				icon: microscope,
			},
			{
				name: "Keep in range your Body Mass Index",
				description: "Lowers your blood pressure +3",
				icon: scale,
			},
			{
				name: "Take a cholesterol laboratory test",
				description: "Assessment of insulin resistance +7",
				icon: microscope,
			},
			{
				name: "Consider taking your avg. blood sugar (glucose) level",
				description: "Early detection of diabetes or prediabetes +5",
				icon: microscope,
			},
			{
				name: "Monitoring blood pressure 1 time a day",
				description: "Detect respiratory or cardiovascular issues +5",
				icon: scale,
			},
		],
	},
	{
		title: "Supplements",
		cta: {
			title: "Your Personal Supplements Mix",
			description:
				"This combination helps reduce inflammation, regulate blood pressure, and improve heart function, aiding in the prevention of diseases such as hypertension, atrial fibrillation, and coronary artery disease.",
			types: [
				{
					name: "Cardiovascular",
					icon: heart,
					supplements: [
						{
							amount: 4,
							supplement: "Vitamins",
						},
						{
							amount: 3,
							supplement: "Minerals",
						},
						{
							amount: 1,
							supplement: "amino acid",
						},
						{
							amount: 2,
							supplement: "antixidants",
						},
					],
				},
				{
					name: "Digestive",
					icon: diab,
					supplements: [
						{
							amount: 3,
							supplement: "Vitamins",
						},
						{
							amount: 3,
							supplement: "amino acid",
						},
						{
							amount: 3,
							supplement: "Minerals",
						},
						{
							amount: 1,
							supplement: "antixidants",
						},
					],
				},
				{
					name: "My personal formula",
					icon: heart,
					supplements: [
						{
							amount: 7,
							supplement: "Vitamins",
						},
						{
							amount: 6,
							supplement: "Minerals",
						},
						{
							amount: 4,
							supplement: "amino acid",
						},
						{
							amount: 3,
							supplement: "antixidants",
						},
					],
				},
			],
		},
		type: "grouped",
		data: [
			{
				name: "Beetroot powder / titrate supplements",
				description: "Increases nitric oxide levels",
				dosage: "1 pill",
				frequency: "Once",
				group: "peptides",
				icon: beetroot,
			},
			{
				name: "Take turmeric extract to reduce inflammation (CPR)",
				description: "Supports vascular health",
				dosage: "1 pill",
				frequency: "Once",
				group: "peptides",
				icon: tumeric,
			},
			{
				name: "Take Omega-3 Fatty Acids",
				description: "Helps widen blood vessels +8",
				dosage: "1 pill",
				frequency: "Once",
				group: "other",
				icon: omega,
			},
			{
				name: "Coenzyme Q10 (CoQ10)",
				description: "Include Coenzyme Q10 (CoQ10)",
				dosage: "1 pill",
				frequency: "Once",
				group: "other",
				icon: coenzyme,
			},
			{
				name: "Add Ashwagandha (Withania somnifera)",
				description: "Supports vascular health",
				dosage: "1 pill",
				frequency: "Once",
				group: "other",
				icon: ashwagandha,
			},
		],
	},
	{
		title: "Lifestyle",
		data: [
			{
				name: "Quit smoking & limit alcohol",
				description: "Improved lung function +5",
				icon: quitSmoking,
			},
			{
				name: "Train in zone 2 & monitor regularly VO2 max",
				description: "Supports vascular health +4",
				icon: train,
			},
			{
				name: "Adopt a low-glycemic index and heart healthy diets",
				description: "Helps widen blood vessels +6",
				icon: apple,
			},
			{
				name: "Manage your stress",
				description: "Helps widen blood vessels +8",
				icon: quitSmoking,
			},
			{
				name: "Fill your plate with fruits and veggies",
				description: "Lowers your blood pressure +3",
				icon: apple,
			},
			{
				name: "Reduce sugar and salt",
				description: "Improved lung function +5",
				icon: apple,
			},
			{
				name: "Practice flexibility and balance",
				description: "Enhances joint health +8",
				icon: train,
			},
		],
	},
];
