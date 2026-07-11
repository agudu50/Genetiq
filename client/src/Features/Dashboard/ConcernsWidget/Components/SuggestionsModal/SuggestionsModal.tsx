import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { HealthGoal, setGoals } from "@/App/Redux/goalSlice";
import { LocalVault } from "@/App/Services/LocalVault";
import { useLanguage } from "@/App/i18n/LanguageContext";
import {
	X,
	CheckCircle2,
	Sparkles,
	ClipboardList,
	Globe,
	Coins,
	Brain,
	Heart,
	HelpCircle,
	Check,
} from "lucide-react";
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
	const dispatch = useDispatch();
	const existingGoals = useSelector((state: RootState) => state.goals.items);

	const [isActivating, setIsActivating] = useState(false);
	const [activationSuccess, setActivationSuccess] = useState(false);
	const [selectedActions, setSelectedActions] = useState<string[]>([]);

	const planSections = useMemo(
		() => (concern ? getPlanSectionsForConcern(concern) : []),
		[concern],
	);

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

	useEffect(() => {
		if (concern) {
			setSelectedActions(allItems.map((item) => item.name));
			setActivationSuccess(false);
			setIsActivating(false);
		} else {
			setSelectedActions([]);
			setActivationSuccess(false);
			setIsActivating(false);
		}
	}, [concern, allItems]);

	if (!concern) return null;

	const handleActionToggle = (name: string) => {
		setSelectedActions((prev) =>
			prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
		);
	};

	const handleSelectAll = () => {
		setSelectedActions(allItems.map((item) => item.name));
	};

	const handleClearAll = () => {
		setSelectedActions([]);
	};

	const handleActivate = async () => {
		setIsActivating(true);

		const newGoalsToAdd: HealthGoal[] = [];
		selectedActions.forEach((actionName, idx) => {
			const item = allItems.find((i) => i.name === actionName);
			if (item) {
				const alreadyExists = existingGoals.some(
					(g) => g.title.toLowerCase() === item.name.toLowerCase(),
				);
				if (!alreadyExists) {
					const goalCategory =
						item.sectionTitle === "Lifestyle"
							? "Activity"
							: item.sectionTitle === "Supplements"
								? "Nutrition"
								: "Metabolic";

					newGoalsToAdd.push({
						id: `activated-goal-${Date.now()}-${idx}-${item.name.toLowerCase().replace(/\s+/g, "-")}`,
						category: goalCategory as HealthGoal["category"],
						title: item.name,
						description: item.description,
						target_value: "1",
						current_value: "0",
						unit: "times",
						progress: 0,
						status: "In Progress",
						trend: "stable",
						streak: 0,
						completed: false,
					});
				}
			}
		});

		if (newGoalsToAdd.length > 0) {
			const updatedGoals = [...existingGoals, ...newGoalsToAdd];
			await LocalVault.save("user_goals", updatedGoals);
			dispatch(setGoals(updatedGoals));
		}

		setTimeout(() => {
			setIsActivating(false);
			setActivationSuccess(true);
		}, 1500);
	};

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
		setActivationSuccess(false);
		setIsActivating(false);
		onClose();
	};

	const allSelected =
		allItems.length > 0 && selectedActions.length === allItems.length;

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
					{activationSuccess ? (
						<div className={styles.successState}>
							<div className={styles.successRing}>
								<CheckCircle2 size={44} className={styles.successIcon} />
							</div>
							<h3>{t("plan_activated") || "Plan Activated Successfully!"}</h3>
							<p>
								{t("concern_activation_success", {
									concern: t(concern.title),
								})}
							</p>
							<button
								type="button"
								className={styles.closeSuccessBtn}
								onClick={handleClose}
							>
								{t("close") || "Close"}
							</button>
						</div>
					) : isActivating ? (
						<div className={styles.processingState}>
							<div className={styles.spinner} />
							<h3>{t("activating_plan") || "Activating Action Plan..."}</h3>
							<p>
								{t("syncing_clinical") ||
									"Syncing selected items with your clinical profile..."}
							</p>
						</div>
					) : (
						<>
							<div className={styles.introRow}>
								<div className={styles.introIcon}>
									<ClipboardList size={16} strokeWidth={2.25} />
								</div>
								<p className={styles.intro}>
									{t("suggested_actions_intro") ||
										"Recommended target actions and therapeutic options tailored for your risk panel:"}
								</p>
								{allItems.length > 0 && (
									<button
										type="button"
										className={styles.selectAllBtn}
										onClick={allSelected ? handleClearAll : handleSelectAll}
									>
										{allSelected ? "Clear all" : "Select all"}
									</button>
								)}
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
												{items.map((item) => {
													const isSelected = selectedActions.includes(item.name);
													return (
														<button
															key={item.name}
															type="button"
															className={`${styles.itemRow} ${isSelected ? styles.itemRowSelected : ""}`}
															onClick={() => handleActionToggle(item.name)}
															aria-pressed={isSelected}
														>
															<div
																className={`${styles.itemCheck} ${isSelected ? styles.itemCheckSelected : ""}`}
																aria-hidden
															>
																{isSelected && (
																	<Check size={12} strokeWidth={3} />
																)}
															</div>
															<div className={styles.itemIconWrap}>
																<PlanItemIcon icon={item.icon} size={18} />
															</div>
															<div className={styles.itemMeta}>
																<h4>{t(item.name)}</h4>
																<p>{t(item.description)}</p>
															</div>
														</button>
													);
												})}
											</div>
										</div>
									))}
								</div>
							)}
						</>
					)}
				</div>

				{!activationSuccess && !isActivating && (
					<div className={styles.footer}>
						<div className={styles.footerSummary}>
							<span className={styles.countPill}>
								{selectedActions.length}
							</span>
							<span className={styles.countLabel}>
								{t("items_selected") || "Items Selected"}
							</span>
						</div>
						<button
							type="button"
							className={styles.checkoutBtn}
							disabled={selectedActions.length === 0}
							onClick={handleActivate}
						>
							<span>{t("confirm_actions") || "Activate Selected"}</span>
						</button>
					</div>
				)}
			</div>
		</div>,
		document.body,
	);
};
