import { PlanItem } from "./planMockData";

export type PlanItemSelection = {
	item: PlanItem;
	category: string;
	accentColor: string;
};

export const categoryColors: Record<string, string> = {
	"Follow-up Care": "#3b82f6",
	Supplements: "#f59e0b",
	Lifestyle: "#10b981",
};

export function parseImpact(description: string): {
	text: string;
	score: number | null;
} {
	const match = description.match(/\s*\+(\d+)\s*$/);
	if (match) {
		return {
			text: description.replace(/\s*\+\d+\s*$/, "").trim(),
			score: parseInt(match[1], 10),
		};
	}
	return { text: description, score: null };
}

export function goalCategoryForSection(
	sectionTitle: string,
): "Activity" | "Nutrition" | "Metabolic" {
	if (sectionTitle === "Lifestyle") return "Activity";
	if (sectionTitle === "Supplements") return "Nutrition";
	return "Metabolic";
}
