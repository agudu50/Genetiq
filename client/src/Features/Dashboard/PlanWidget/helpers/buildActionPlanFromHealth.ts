import type { UploadRecord } from "@/App/Redux/uploadHistorySlice";
import type { UserState } from "@/App/Redux/userSlice";
import type { PlanIconId } from "./planItemIcons";
import { inferPlanIconId } from "./planItemIcons";
import type { PlanItem, PlanSection } from "./planMockData";

export type ActionPlanCategory = "Follow-up Care" | "Supplements" | "Lifestyle";

const SECTION_TITLES: ActionPlanCategory[] = [
	"Follow-up Care",
	"Supplements",
	"Lifestyle",
];

export function categorizeAction(title: string, body = ""): ActionPlanCategory {
	const text = `${title} ${body}`.toLowerCase();

	if (
		/supplement|vitamin|mineral|iron|omega|moringa|turmeric|coq10|ashwagandha|beetroot|magnesium|zinc|calcium|folate|ferritin|pill|capsule|powder|herb/.test(
			text,
		)
	) {
		return "Supplements";
	}

	if (
		/test|monitor|screen|lab|doctor|appointment|check|recheck|follow.?up|blood pressure|glucose|cholesterol|ekg|ecg|imaging|scan|visit|chps|hospital/.test(
			text,
		)
	) {
		return "Follow-up Care";
	}

	return "Lifestyle";
}

function makeItem(
	name: string,
	description: string,
	category: ActionPlanCategory,
	icon?: PlanIconId | string,
): PlanItem {
	return {
		name,
		description,
		icon: inferPlanIconId(icon ?? "pill", name),
		group: category,
	};
}

function buildFromFindings(record: UploadRecord): PlanItem[] {
	const items: PlanItem[] = [];

	for (const f of record.findings) {
		if (f.status === "normal") continue;

		const marker = f.marker || f.name;
		const urgency =
			f.status === "action"
				? "Book a doctor visit soon"
				: "Recheck on your next visit";

		items.push(
			makeItem(
				`Follow up on ${marker}`,
				f.statusLabel || urgency,
				"Follow-up Care",
				marker.toLowerCase().includes("glucose") ? "glucose" : "lab-test",
			),
		);
	}

	return items;
}

function buildFromRecommendations(
	recommendations: UploadRecord["recommendations"],
): PlanItem[] {
	return recommendations.map((r) => {
		const category = categorizeAction(r.title, r.body);
		const benefit =
			r.body.split(/[.!]/)[0]?.trim().slice(0, 80) || r.title;
		return makeItem(r.title, benefit, category);
	});
}

function buildFromProfile(user: UserState): PlanItem[] {
	const items: PlanItem[] = [];

	if (user.lifestyle.smoking && user.lifestyle.smoking !== "Non-smoker") {
		items.push(
			makeItem(
				"Quit smoking & limit alcohol",
				"Improved lung and heart function",
				"Lifestyle",
				"smoke-free",
			),
		);
	}

	if (
		user.lifestyle.exercise === "Sedentary" ||
		user.lifestyle.exercise === "Rarely"
	) {
		items.push(
			makeItem(
				"Add regular zone 2 cardio exercise",
				"Supports heart and metabolic health",
				"Lifestyle",
				"cardio-training",
			),
		);
	}

	if (user.lifestyle.diet === "High sugar/salt" || user.lifestyle.diet === "Processed") {
		items.push(
			makeItem(
				"Adopt a heart healthy, low salt diet",
				"Helps blood pressure and cholesterol",
				"Lifestyle",
				"healthy-diet",
			),
		);
	}

	const h = Number(user.height);
	const w = Number(user.weight);
	if (h && w) {
		const bmi = w / ((h / 100) * (h / 100));
		if (bmi >= 25) {
			items.push(
				makeItem(
					"Keep your Body Mass Index in range",
					"Lowers blood pressure and diabetes risk",
					"Lifestyle",
					"scale",
				),
			);
		}
	}

	for (const condition of user.medicalConditions) {
		if (!condition.trim()) continue;
		items.push(
			makeItem(
				`Monitor ${condition.toLowerCase()} regularly`,
				"Early detection prevents complications",
				"Follow-up Care",
				"stethoscope",
			),
		);
	}

	return items;
}

function dedupeItems(items: PlanItem[]): PlanItem[] {
	const seen = new Set<string>();
	return items.filter((item) => {
		const key = item.name.toLowerCase().trim();
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function groupIntoSections(items: PlanItem[]): PlanSection[] {
	const buckets: Record<ActionPlanCategory, PlanItem[]> = {
		"Follow-up Care": [],
		Supplements: [],
		Lifestyle: [],
	};

	for (const item of items) {
		const cat = (item.group as ActionPlanCategory) || categorizeAction(item.name, item.description);
		buckets[cat].push({ ...item, group: cat });
	}

	return [
		{ title: "Action Plan", type: "aggregated", data: [] },
		...SECTION_TITLES.map((title) => ({
			title,
			data: buckets[title],
		})),
	];
}

export function buildActionPlanFromHealth(
	record: UploadRecord | null,
	user: UserState,
): PlanSection[] {
	const items = dedupeItems([
		...(record ? buildFromRecommendations(record.recommendations) : []),
		...(record ? buildFromFindings(record) : []),
		...buildFromProfile(user),
	]);

	if (items.length === 0) {
		return groupIntoSections([
			makeItem(
				"Upload lab results for personalized steps",
				"Gemma AI builds your plan from your data",
				"Follow-up Care",
				"lab-test",
			),
			makeItem(
				"Complete your health profile",
				"Better data means better recommendations",
				"Lifestyle",
				"heart-pulse",
			),
		]);
	}

	return groupIntoSections(items);
}

export function buildActionPlanContextHash(
	record: UploadRecord | null,
	user: UserState,
): string {
	const payload = {
		recordId: record?.id ?? "",
		uploadedAt: record?.uploadedAt ?? "",
		healthScore: record?.healthScore ?? 0,
		findingsCount: record?.findings.length ?? 0,
		recsCount: record?.recommendations.length ?? 0,
		age: user.age,
		symptoms: user.symptoms,
		conditions: user.medicalConditions,
		lifestyle: user.lifestyle,
	};
	const str = JSON.stringify(payload);
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0;
	}
	return String(hash);
}
