import type { PlanIconId } from "./planItemIcons";

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
		icon: PlanIconId;
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
	icon: PlanIconId;
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
				icon: "dna",
			},
			{
				name: "Monitoring blood pressure 3 times a week",
				description: "Early detection of hypertension",
				icon: "heart-pulse",
			},
			{
				name: "Adopt a low-glycemic index and heart healthy diets",
				description: "Helps widen blood vessels +6",
				icon: "healthy-diet",
			},
			{
				name: "Keep in range your Body Mass Index",
				description: "Lowers your blood pressure +3",
				icon: "scale",
			},
			{
				name: "Take a cholesterol laboratory test",
				description: "Assessment of insulin resistance +7",
				icon: "lab-test",
			},
			{
				name: "Consider taking your avg. blood sugar (glucose) level",
				description: "Early detection of diabetes or prediabetes +5",
				icon: "glucose",
			},
			{
				name: "Monitoring blood pressure 1 time a day",
				description: "Detect respiratory or cardiovascular issues +5",
				icon: "stethoscope",
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
					icon: "heart",
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
					icon: "digestive",
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
					icon: "heart",
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
				icon: "beetroot",
			},
			{
				name: "Take turmeric extract to reduce inflammation (CPR)",
				description: "Supports vascular health",
				dosage: "1 pill",
				frequency: "Once",
				group: "peptides",
				icon: "turmeric",
			},
			{
				name: "Take Omega-3 Fatty Acids",
				description: "Helps widen blood vessels +8",
				dosage: "1 pill",
				frequency: "Once",
				group: "other",
				icon: "omega",
			},
			{
				name: "Coenzyme Q10 (CoQ10)",
				description: "Include Coenzyme Q10 (CoQ10)",
				dosage: "1 pill",
				frequency: "Once",
				group: "other",
				icon: "coq10",
			},
			{
				name: "Add Ashwagandha (Withania somnifera)",
				description: "Supports vascular health",
				dosage: "1 pill",
				frequency: "Once",
				group: "other",
				icon: "ashwagandha",
			},
		],
	},
	{
		title: "Lifestyle",
		data: [
			{
				name: "Quit smoking & limit alcohol",
				description: "Improved lung function +5",
				icon: "smoke-free",
			},
			{
				name: "Train in zone 2 & monitor regularly VO2 max",
				description: "Supports vascular health +4",
				icon: "cardio-training",
			},
			{
				name: "Adopt a low-glycemic index and heart healthy diets",
				description: "Helps widen blood vessels +6",
				icon: "healthy-diet",
			},
			{
				name: "Manage your stress",
				description: "Helps widen blood vessels +8",
				icon: "stress",
			},
			{
				name: "Fill your plate with fruits and veggies",
				description: "Lowers your blood pressure +3",
				icon: "produce",
			},
			{
				name: "Reduce sugar and salt",
				description: "Improved lung function +5",
				icon: "low-sodium",
			},
			{
				name: "Practice flexibility and balance",
				description: "Enhances joint health +8",
				icon: "flexibility",
			},
		],
	},
];

export const AtrialFibrillationPlanMockData: PlanSection[] = [
	{
		title: "Action Plan",
		type: "aggregated",
		data: [],
	},
	{
		title: "Follow-up Care",
		data: [
			{
				name: "EKG Monitoring",
				description: "Detects irregular heart rhythms",
				icon: "heart-pulse",
			},
			{
				name: "Blood Sugar Monitoring",
				description: "Reduces secondary health risks",
				icon: "glucose",
			},
		],
	},
	{
		title: "Supplements",
		cta: {
			title: "Atrial Fibrillation Supplement Mix",
			description: "Supports heart rhythm and vascular health.",
			types: [
				{
					name: "Heart Rhythm Support",
					icon: "heart",
					supplements: [
						{ amount: 3, supplement: "Vitamins" },
						{ amount: 2, supplement: "Minerals" },
					],
				},
			],
		},
		data: [
			{
				name: "Magnesium Citrate",
				description: "Supports heart muscle relaxation",
				icon: "pill",
			},
			{
				name: "Turmeric Extract",
				description: "Reduces inflammation",
				icon: "turmeric",
			},
		],
	},
	{
		title: "Lifestyle",
		data: [
			{
				name: "Quit Smoking",
				description: "Improves lung and heart health",
				icon: "smoke-free",
			},
			{
				name: "Adopt a Heart-Healthy Diet",
				description: "Reduces cholesterol levels",
				icon: "healthy-diet",
			},
		],
	},
];

export const StrokePlanMockData: PlanSection[] = [
	{
		title: "Action Plan",
		type: "aggregated",
		data: [],
	},
	{
		title: "Follow-up Care",
		data: [
			{
				name: "Blood Pressure Monitoring",
				description: "Helps prevent secondary strokes",
				icon: "heart-pulse",
			},
			{
				name: "Regular Neurological Exams",
				description: "Monitors post-stroke recovery",
				icon: "brain",
			},
		],
	},
	{
		title: "Supplements",
		cta: {
			title: "Stroke Recovery Supplement Mix",
			description: "Supports brain health and reduces inflammation.",
			types: [
				{
					name: "Brain Health",
					icon: "digestive",
					supplements: [
						{ amount: 4, supplement: "Antioxidants" },
						{ amount: 3, supplement: "Vitamins" },
					],
				},
			],
		},
		data: [
			{
				name: "Vitamin D",
				description: "Improves vascular function",
				icon: "pill",
			},
			{
				name: "Ashwagandha",
				description: "Reduces stress and inflammation",
				icon: "ashwagandha",
			},
		],
	},
	{
		title: "Lifestyle",
		data: [
			{
				name: "Engage in Physical Therapy",
				description: "Enhances motor recovery",
				icon: "flexibility",
			},
			{
				name: "Reduce Salt and Sugar",
				description: "Improves blood pressure control",
				icon: "low-sodium",
			},
		],
	},
];

export const CoronaryArteryDiseasePlanMockData: PlanSection[] = [
	{
		title: "Action Plan",
		type: "aggregated",
		data: [],
	},
	{
		title: "Follow-up Care",
		data: [
			{
				name: "Routine EKG Tests",
				description: "Monitors heart function",
				icon: "heart-pulse",
			},
			{
				name: "Cholesterol Panel Testing",
				description: "Tracks lipid levels",
				icon: "lab-test",
			},
		],
	},
	{
		title: "Supplements",
		cta: {
			title: "Heart Health Supplements",
			description: "Supports arterial health and reduces plaque buildup.",
			types: [
				{
					name: "Heart Health",
					icon: "heart",
					supplements: [
						{ amount: 3, supplement: "Minerals" },
						{ amount: 2, supplement: "Vitamins" },
					],
				},
			],
		},
		data: [
			{
				name: "Omega-3 Fatty Acids",
				description: "Lowers triglycerides",
				icon: "omega",
			},
			{
				name: "Turmeric Extract",
				description: "Reduces inflammation",
				icon: "turmeric",
			},
		],
	},
	{
		title: "Lifestyle",
		data: [
			{
				name: "Exercise Regularly",
				description: "Improves circulation",
				icon: "cardio-training",
			},
			{
				name: "Adopt a Mediterranean Diet",
				description: "Promotes heart health",
				icon: "healthy-diet",
			},
		],
	},
];

export const HypertensionPlanMockData: PlanSection[] = [
	{
		title: "Action Plan",
		type: "aggregated",
		data: [],
	},
	{
		title: "Follow-up Care",
		data: [
			{
				name: "Blood Pressure Monitoring",
				description: "Tracks daily changes",
				icon: "heart-pulse",
			},
			{
				name: "Renal Function Tests",
				description: "Assesses kidney health",
				icon: "lab-test",
			},
		],
	},
	{
		title: "Supplements",
		cta: {
			title: "Blood Pressure Supplements",
			description: "Helps regulate blood pressure naturally.",
			types: [
				{
					name: "Hypertension Support",
					icon: "digestive",
					supplements: [
						{ amount: 3, supplement: "Vitamins" },
						{ amount: 2, supplement: "Minerals" },
					],
				},
			],
		},
		data: [
			{
				name: "Beetroot Powder",
				description: "Increases nitric oxide",
				icon: "beetroot",
			},
			{
				name: "Ashwagandha",
				description: "Reduces stress",
				icon: "ashwagandha",
			},
		],
	},
	{
		title: "Lifestyle",
		data: [
			{
				name: "Quit Smoking",
				description: "Improves vascular health",
				icon: "smoke-free",
			},
			{
				name: "Engage in Zone 2 Training",
				description: "Lowers resting heart rate",
				icon: "cardio-training",
			},
		],
	},
];

export const HeartFailurePlanMockData: PlanSection[] = [
	{
		title: "Action Plan",
		type: "aggregated",
		data: [],
	},
	{
		title: "Follow-up Care",
		data: [
			{
				name: "Echocardiograms",
				description: "Monitors heart function",
				icon: "heart-pulse",
			},
			{
				name: "Blood Pressure Monitoring",
				description: "Prevents sudden changes",
				icon: "stethoscope",
			},
		],
	},
	{
		title: "Supplements",
		cta: {
			title: "Heart Failure Supplements",
			description: "Supports overall cardiac health.",
			types: [
				{
					name: "Cardiac Support",
					icon: "heart",
					supplements: [
						{ amount: 3, supplement: "Vitamins" },
						{ amount: 2, supplement: "Minerals" },
					],
				},
			],
		},
		data: [
			{
				name: "Coenzyme Q10",
				description: "Improves cellular energy",
				icon: "coq10",
			},
			{
				name: "Turmeric Extract",
				description: "Reduces inflammation",
				icon: "turmeric",
			},
		],
	},
	{
		title: "Lifestyle",
		data: [
			{
				name: "Reduce Salt Intake",
				description: "Lowers blood pressure",
				icon: "low-sodium",
			},
			{
				name: "Engage in Physical Therapy",
				description: "Improves endurance",
				icon: "flexibility",
			},
		],
	},
];
