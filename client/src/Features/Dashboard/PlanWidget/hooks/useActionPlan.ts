import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { generateActionPlan } from "@/App/Services/GemmaService";
import { useLanguage } from "@/App/i18n/LanguageContext";
import type { PlanSection } from "../helpers/planMockData";
import {
	buildActionPlanContextHash,
	buildActionPlanFromHealth,
} from "../helpers/buildActionPlanFromHealth";

const CACHE_PREFIX = "genetiq.actionPlan.v1";

export type ActionPlanStatus = "idle" | "loading" | "ready" | "error";

export function useActionPlan(options?: { enabled?: boolean }) {
	const enabled = options?.enabled !== false;
	const { lang } = useLanguage();
	const user = useSelector((state: RootState) => state.user);
	const uploadRecords = useSelector(
		(state: RootState) => state.uploadHistory.records,
	);

	const latestRecord = uploadRecords[0] ?? null;

	const contextHash = useMemo(
		() => buildActionPlanContextHash(latestRecord, user),
		[latestRecord, user],
	);

	const cacheKey = `${CACHE_PREFIX}.${latestRecord?.id ?? "profile"}.${contextHash}`;

	const fallbackPlan = useMemo(
		() => buildActionPlanFromHealth(latestRecord, user),
		[latestRecord, user],
	);

	const [planData, setPlanData] = useState<PlanSection[]>(fallbackPlan);
	const [status, setStatus] = useState<ActionPlanStatus>("idle");
	const [isGemmaPowered, setIsGemmaPowered] = useState(false);

	useEffect(() => {
		if (!enabled) return;

		let cancelled = false;

		const loadPlan = async () => {
			if (typeof window !== "undefined") {
				try {
					const cached = localStorage.getItem(cacheKey);
					if (cached) {
						const parsed = JSON.parse(cached) as {
							sections: PlanSection[];
							source: string;
						};
						if (parsed.sections?.length) {
							setPlanData(parsed.sections);
							setIsGemmaPowered(parsed.source === "gemma");
							setStatus("ready");
							return;
						}
					}
				} catch {
					// ignore bad cache
				}
			}

			setPlanData(fallbackPlan);
			setStatus("loading");

			const h = Number(user.height);
			const w = Number(user.weight);
			const bmi = h && w ? w / ((h / 100) * (h / 100)) : undefined;

			try {
				const result = await generateActionPlan({
					patientAge: latestRecord?.age || user.age,
					patientGender: latestRecord?.gender || user.gender,
					healthScore: latestRecord?.healthScore ?? 0,
					summary: latestRecord
						? `Latest upload: ${latestRecord.fileName}`
						: "",
					findings: latestRecord?.findings ?? [],
					recommendations: latestRecord?.recommendations ?? [],
					symptoms: user.symptoms,
					medicalConditions: user.medicalConditions,
					medications: user.medications.filter((m) => m.name),
					lifestyle: user.lifestyle,
					bmi,
					language: lang === "en" ? "english" : lang,
				});

				if (cancelled) return;

				if (result) {
					setPlanData(result.sections);
					setIsGemmaPowered(result.source === "gemma");
					setStatus("ready");

					if (typeof window !== "undefined") {
						try {
							localStorage.setItem(
								cacheKey,
								JSON.stringify({
									sections: result.sections,
									source: result.source,
									cachedAt: new Date().toISOString(),
								}),
							);
						} catch {
							// storage full
						}
					}
				} else {
					setPlanData(fallbackPlan);
					setIsGemmaPowered(false);
					setStatus("ready");
				}
			} catch (e) {
				console.warn("Action plan generation failed:", e);
				if (!cancelled) {
					setPlanData(fallbackPlan);
					setIsGemmaPowered(false);
					setStatus("error");
				}
			}
		};

		loadPlan();

		return () => {
			cancelled = true;
		};
	}, [enabled, cacheKey, fallbackPlan, latestRecord, user, lang]);

	if (!enabled) {
		return {
			planData: fallbackPlan,
			status: "idle" as ActionPlanStatus,
			isGemmaPowered: false,
			isLoading: false,
		};
	}

	return {
		planData,
		status,
		isGemmaPowered,
		isLoading: status === "loading",
	};
}
