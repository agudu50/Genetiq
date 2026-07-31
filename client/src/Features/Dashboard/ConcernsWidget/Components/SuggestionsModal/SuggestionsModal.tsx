import React, { useMemo } from "react";
import ReactDOM from "react-dom";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { X, ClipboardList, Globe, Coins, Brain, Heart, HelpCircle } from "lucide-react";
import { Concern } from "../../helpers/concernsMockData";
import {
	AtrialFibrillationPlanMockData,
	StrokePlanMockData,
	CoronaryArteryDiseasePlanMockData,
	HypertensionPlanMockData,
	HeartFailurePlanMockData,
	PlanSection,
} from "../../../PlanWidget/helpers/planMockData";
import { PlanItemIcon } from "../../../PlanWidget/helpers/planItemIcons";
import dashboardData from "@/App/Data/dashboard_data.json";
import styles from "./SuggestionsModal.module.scss";

import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { categorizeAction } from "../../../PlanWidget/helpers/buildActionPlanFromHealth";

interface SuggestionsModalProps {
	concern: Concern | null;
	onClose: () => void;
}

const getConditionPlan = (title: string): PlanSection[] => {
	const key = title.toLowerCase();
	if (key.includes("atrial") || key.includes("irregular"))
		return AtrialFibrillationPlanMockData;
	if (key.includes("stroke")) return StrokePlanMockData;
	if (key.includes("coronary") || key.includes("heart disease") || key.includes("cad"))
		return CoronaryArteryDiseasePlanMockData;
	if (key.includes("hypertension") || key.includes("pressure"))
		return HypertensionPlanMockData;
	if (key.includes("heart failure")) return HeartFailurePlanMockData;
	return [];
};

const getPlanSectionsForConcern = (concern: Concern): PlanSection[] => {
	const specific = getConditionPlan(concern.title);
	if (specific.length > 0) return specific;

	const defaultPlan = (dashboardData as { action_plan: { default: PlanSection[] } })
		.action_plan.default;
	const title = concern.title.toLowerCase();

	if (title.includes("distance") || title.includes("specialist") || title.includes("clinic")) {
		const care = defaultPlan.filter((s) => s.title === "Care Navigation");
		if (care.length > 0) return care;
	}

	if (title.includes("cost") || title.includes("financial") || title.includes("diagnostic")) {
		const care = defaultPlan.filter((s) => s.title === "Care Navigation");
		if (care.length > 0) return care;
	}

	if (title.includes("information") || title.includes("gap") || title.includes("brain")) {
		return defaultPlan;
	}

	return defaultPlan;
};

const renderConcernIcon = (iconName: string) => {
	switch (iconName) {
		case "Globe":
			return <Globe size={20} strokeWidth={2.25} />;
		case "Financial":
			return <Coins size={20} strokeWidth={2.25} />;
		case "Brain":
			return <Brain size={20} strokeWidth={2.25} />;
		case "Heart":
			return <Heart size={20} strokeWidth={2.25} />;
		default:
			return <HelpCircle size={20} strokeWidth={2.25} />;
	}
};

export const SuggestionsModal: React.FC<SuggestionsModalProps> = ({
	concern,
	onClose,
}) => {
	const { t } = useLanguage();
	const uploadRecords = useSelector((state: RootState) => state.uploadHistory.records);

	const planSections = useMemo(() => {
		if (!concern) return [];

		if (uploadRecords && uploadRecords.length > 0) {
			const latestRecord = uploadRecords[0];
			if (latestRecord.recommendations && latestRecord.recommendations.length > 0) {
				const titleKeywords = concern.title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
				const factorKeywords = (concern.factors || []).flatMap(f => f.toLowerCase().split(/\s+/)).filter(w => w.length > 2);
				const keywords = [...titleKeywords, ...factorKeywords];

				const relevantRecs = latestRecord.recommendations.filter((r) => {
					const text = `${r.title} ${r.body}`.toLowerCase();
					return keywords.some(kw => text.includes(kw));
				});

				const recsToUse = relevantRecs.length > 0 ? relevantRecs : latestRecord.recommendations;

				const buckets = {
					"Follow-up Care": [] as any[],
					"Supplements": [] as any[],
					"Lifestyle": [] as any[]
				};

				recsToUse.forEach((r) => {
					const cat = categorizeAction(r.title, r.body);
					buckets[cat].push({
						name: r.title,
						description: r.body,
						icon: "pill",
						group: cat
					});
				});

				return [
					{ title: "Action Plan", type: "aggregated", data: [] },
					{ title: "Follow-up Care", data: buckets["Follow-up Care"] },
					{ title: "Supplements", data: buckets["Supplements"] },
					{ title: "Lifestyle", data: buckets["Lifestyle"] }
				].filter(sec => sec.title === "Action Plan" || sec.data.length > 0) as PlanSection[];
			}
		}

		return getPlanSectionsForConcern(concern);
	}, [concern, uploadRecords]);

	const allItems = useMemo(
		() =>
			planSections
				.filter((sec) => sec.title !== "Action Plan")
				.flatMap((sec) =>
					sec.data.map((item) => ({ ...item, sectionTitle: sec.title })),
				),
		[planSections],
	);

	const groupedItems = useMemo(() => {
		const groups = new Map<string, typeof allItems>();
		allItems.forEach((item) => {
			const list = groups.get(item.sectionTitle) ?? [];
			list.push(item);
			groups.set(item.sectionTitle, list);
		});
		return groups;
	}, [allItems]);

	if (!concern) return null;



	const getSeverityClass = (status: string) => {
		if (status === "High") return styles.severityHigh;
		if (status === "Medium") return styles.severityMedium;
		return styles.severityLow;
	};

	const getAccentColor = (status: string) => {
		if (status === "High") return "#ef4444";
		if (status === "Medium") return "#f59e0b";
		return "#10b981";
	};

	const handleClose = () => {
		onClose();
	};

	return ReactDOM.createPortal(
		<div className={styles.overlay} onClick={handleClose}>
			<div
				className={styles.modal}
				style={{ "--modal-accent": getAccentColor(concern.status) } as React.CSSProperties}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="suggestions-modal-title"
			>
				<div className={styles.cardMeshBg} aria-hidden />
				<div className={styles.cardGlowBlob} aria-hidden />

				<div className={styles.header}>
					<div className={styles.titleBlock}>
						<div className={styles.titleIconWrap}>
							{renderConcernIcon(concern.icon)}
						</div>
						<div className={styles.titleText}>
							<div className={styles.titleMeta}>
								<span
									className={`${styles.statusBadge} ${getSeverityClass(concern.status)}`}
								>
									<span className={styles.statusDot} />
									{t(concern.status)}
								</span>
							</div>
							<h2 id="suggestions-modal-title">{t(concern.title)}</h2>
							{concern.factors?.[0] && (
								<p className={styles.factorLine}>
									<span className={styles.factorPrimary}>
										{t(concern.factors[0])}
									</span>
									{concern.factors.length > 1 && (
										<span className={styles.factorExtra}>
											+{concern.factors.length - 1} {t("factors")}
										</span>
									)}
								</p>
							)}
						</div>
					</div>
					<button
						type="button"
						className={styles.closeBtn}
						onClick={handleClose}
						aria-label={t("close")}
					>
						<X size={18} strokeWidth={2.5} aria-hidden />
					</button>
				</div>

				<div className={styles.body}>
					<div className={styles.introRow}>
						<div className={styles.introIcon}>
							<ClipboardList size={16} strokeWidth={2.25} />
						</div>
						<p className={styles.intro}>
							{t("suggested_actions_intro") ||
								"Recommended target actions and therapeutic options tailored for your risk panel:"}
						</p>
					</div>

					{allItems.length === 0 ? (
						<div className={styles.emptyState}>
							<p>{t("no_details")}</p>
						</div>
					) : (
						<div className={styles.itemsList}>
							{Array.from(groupedItems.entries()).map(([section, items]) => (
								<div key={section} className={styles.sectionGroup}>
									<h3 className={styles.sectionHeading}>{t(section)}</h3>
									<div className={styles.sectionItems}>
										{items.map((item) => (
											<div
												key={item.name}
												className={styles.itemRow}
											>
												<div className={styles.itemIconWrap}>
													<PlanItemIcon icon={item.icon} size={18} />
												</div>
												<div className={styles.itemMeta}>
													<h4>{t(item.name)}</h4>
													<p>{t(item.description)}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>,
		document.body,
	);
};
