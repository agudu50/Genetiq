import type { CSSProperties } from "react";
import {
	Dna,
	HeartPulse,
	Salad,
	Scale,
	FlaskConical,
	Droplets,
	Leaf,
	Sun,
	Fish,
	Zap,
	Sparkles,
	CigaretteOff,
	Activity,
	Brain,
	Apple,
	CandyOff,
	PersonStanding,
	Heart,
	UtensilsCrossed,
	Pill,
	Stethoscope,
	type LucideIcon,
} from "lucide-react";

export type PlanIconId =
	| "dna"
	| "heart-pulse"
	| "salad"
	| "scale"
	| "lab-test"
	| "glucose"
	| "beetroot"
	| "turmeric"
	| "omega"
	| "coq10"
	| "ashwagandha"
	| "smoke-free"
	| "cardio-training"
	| "healthy-diet"
	| "stress"
	| "produce"
	| "low-sodium"
	| "flexibility"
	| "heart"
	| "digestive"
	| "stethoscope"
	| "brain"
	| "pill";

const PLAN_ICONS: Record<PlanIconId, LucideIcon> = {
	dna: Dna,
	"heart-pulse": HeartPulse,
	salad: Salad,
	scale: Scale,
	"lab-test": FlaskConical,
	glucose: Droplets,
	beetroot: Leaf,
	turmeric: Sun,
	omega: Fish,
	coq10: Zap,
	ashwagandha: Sparkles,
	"smoke-free": CigaretteOff,
	"cardio-training": Activity,
	"healthy-diet": UtensilsCrossed,
	stress: Brain,
	produce: Apple,
	"low-sodium": CandyOff,
	flexibility: PersonStanding,
	heart: Heart,
	digestive: Salad,
	stethoscope: Stethoscope,
	brain: Brain,
	pill: Pill,
};

const PLAN_ITEM_ICON_BY_NAME: Record<string, PlanIconId> = {
	"Take Genetic Health Risk Tests": "dna",
	"Monitoring blood pressure 3 times a week": "heart-pulse",
	"Adopt a low-glycemic index and heart healthy diets": "healthy-diet",
	"Keep in range your Body Mass Index": "scale",
	"Take a cholesterol laboratory test": "lab-test",
	"Consider taking your avg. blood sugar (glucose) level": "glucose",
	"Monitoring blood pressure 1 time a day": "stethoscope",
	"Beetroot powder / titrate supplements": "beetroot",
	"Take turmeric extract to reduce inflammation (CPR)": "turmeric",
	"Take Omega-3 Fatty Acids": "omega",
	"Coenzyme Q10 (CoQ10)": "coq10",
	"Add Ashwagandha (Withania somnifera)": "ashwagandha",
	"Quit smoking & limit alcohol": "smoke-free",
	"Train in zone 2 & monitor regularly VO2 max": "cardio-training",
	"Manage your stress": "stress",
	"Fill your plate with fruits and veggies": "produce",
	"Reduce sugar and salt": "low-sodium",
	"Practice flexibility and balance": "flexibility",
	"EKG Monitoring": "heart-pulse",
	"Blood Sugar Monitoring": "glucose",
	"Magnesium Citrate": "pill",
	"Turmeric Extract": "turmeric",
	"Quit Smoking": "smoke-free",
	"Adopt a Heart-Healthy Diet": "healthy-diet",
};

export function resolvePlanIconId(
	icon: PlanIconId | string,
	itemName?: string,
): PlanIconId {
	if (icon in PLAN_ICONS) return icon as PlanIconId;
	if (itemName && PLAN_ITEM_ICON_BY_NAME[itemName]) {
		return PLAN_ITEM_ICON_BY_NAME[itemName];
	}
	return "pill";
}

type PlanItemIconProps = {
	icon: PlanIconId | string;
	itemName?: string;
	size?: number;
	className?: string;
	style?: CSSProperties;
};

export function PlanItemIcon({
	icon,
	itemName,
	size = 16,
	className,
	style,
}: PlanItemIconProps) {
	const iconId = resolvePlanIconId(icon, itemName);
	const Icon = PLAN_ICONS[iconId];

	return (
		<Icon
			size={size}
			strokeWidth={2.25}
			className={className}
			style={style}
			aria-hidden
		/>
	);
}
