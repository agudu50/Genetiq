import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { HealthGoal, setGoals } from "@/App/Redux/goalSlice";
import { LocalVault } from "@/App/Services/LocalVault";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { X, CheckCircle, Sparkles, AlertTriangle } from "lucide-react";
import { Concern } from "../../helpers/concernsMockData";
import {
	AtrialFibrillationPlanMockData,
	StrokePlanMockData,
	CoronaryArteryDiseasePlanMockData,
	HypertensionPlanMockData,
	HeartFailurePlanMockData,
	PlanSection,
} from "../../../PlanWidget/helpers/planMockData";
import styles from "./SuggestionsModal.module.scss";

interface SuggestionsModalProps {
	concern: Concern | null;
	onClose: () => void;
}

const getPlanForCondition = (title: string): PlanSection[] => {
	const t = title.toLowerCase();
	if (t.includes("atrial") || t.includes("irregular")) return AtrialFibrillationPlanMockData;
	if (t.includes("stroke")) return StrokePlanMockData;
	if (t.includes("coronary") || t.includes("heart disease") || t.includes("cad")) return CoronaryArteryDiseasePlanMockData;
	if (t.includes("hypertension") || t.includes("pressure")) return HypertensionPlanMockData;
	if (t.includes("heart failure")) return HeartFailurePlanMockData;
	return [];
};

export const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ concern, onClose }) => {
	const { t } = useLanguage();
	const dispatch = useDispatch();
	const existingGoals = useSelector((state: RootState) => state.goals.items);

	const [isActivating, setIsActivating] = useState(false);
	const [activationSuccess, setActivationSuccess] = useState(false);
	const [selectedActions, setSelectedActions] = useState<string[]>([]);

	useEffect(() => {
		if (concern) {
			const planSections = getPlanForCondition(concern.title);
			const items = planSections
				.filter((sec) => sec.title !== "Action Plan")
				.flatMap((sec) => sec.data.map((item) => item.name));
			setSelectedActions(items);
			setActivationSuccess(false);
			setIsActivating(false);
		} else {
			setSelectedActions([]);
			setActivationSuccess(false);
			setIsActivating(false);
		}
	}, [concern]);

	if (!concern) return null;

	const planSections = getPlanForCondition(concern.title);
	const allItems = planSections
		.filter((sec) => sec.title !== "Action Plan")
		.flatMap((sec) => sec.data.map((item) => ({ ...item, sectionTitle: sec.title })));

	const handleActionToggle = (name: string) => {
		setSelectedActions((prev) =>
			prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
		);
	};

	const handleActivate = async () => {
		setIsActivating(true);

		// Create a list of new goals to add
		const newGoalsToAdd: HealthGoal[] = [];
		selectedActions.forEach((actionName, idx) => {
			const item = allItems.find((i) => i.name === actionName);
			if (item) {
				// Avoid adding duplicate goals
				const alreadyExists = existingGoals.some(
					(g) => g.title.toLowerCase() === item.name.toLowerCase()
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
			
			// 1. Save to LocalVault so the Goals view retains them on mount
			await LocalVault.save("user_goals", updatedGoals);
			
			// 2. Dispatch to Redux store
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

	const handleClose = () => {
		setActivationSuccess(false);
		setIsActivating(false);
		onClose();
	};

	return ReactDOM.createPortal(
		<div className={styles.overlay} onClick={handleClose}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className={styles.header}>
					<div className={styles.titleArea}>
						<div className={`${styles.statusBadge} ${getSeverityClass(concern.status)}`}>
							<AlertTriangle size={12} />
							<span>{t(concern.status)}</span>
						</div>
						<h2>{t(concern.title)}</h2>
					</div>
					<button className={styles.closeBtn} onClick={handleClose} aria-label="Close modal">
						<X size={20} />
					</button>
				</div>

				{/* Content */}
				<div className={styles.body}>
					{activationSuccess ? (
						/* Success State */
						<div className={styles.successState}>
							<div className={styles.successRing}>
								<CheckCircle size={44} className={styles.successIcon} />
							</div>
							<h3>{t("plan_activated") || "Plan Activated Successfully!"}</h3>
							<p>
								{t("concern_activation_success", {
									concern: t(concern.title),
								})}
							</p>
							<button className={styles.closeSuccessBtn} onClick={handleClose}>
								{t("close") || "Close"}
							</button>
						</div>
					) : isActivating ? (
						/* Activating State */
						<div className={styles.processingState}>
							<div className={styles.spinner} />
							<h3>{t("activating_plan") || "Activating Action Plan..."}</h3>
							<p>{t("syncing_clinical") || "Syncing selected items with your clinical profile..."}</p>
						</div>
					) : (
						/* List Items State */
						<>
							<div className={styles.intro}>
								{t("suggested_actions_intro") ||
									"Recommended target actions and therapeutic options tailored for your risk panel:"}
							</div>
							<div className={styles.itemsList}>
								{allItems.map((item, id) => {
									const isSelected = selectedActions.includes(item.name);
									return (
										<div key={id} className={styles.itemRow}>
											<div className={styles.itemMeta}>
												<span className={styles.sectionLabel}>{t(item.sectionTitle)}</span>
												<h4>{t(item.name)}</h4>
												<p>{t(item.description)}</p>
											</div>
											<button
												className={`${styles.scheduleBtn} ${isSelected ? styles.scheduleBtnActive : ""}`}
												onClick={() => handleActionToggle(item.name)}
											>
												<CheckCircle size={14} />
												<span>{isSelected ? `${t("scheduled") || "Scheduled"} ✓` : t("add_to_schedule") || "Schedule Action"}</span>
											</button>
										</div>
									);
								})}
							</div>
						</>
					)}
				</div>

				{/* Footer */}
				{!activationSuccess && !isActivating && (
					<div className={styles.footer}>
						<div className={styles.footerSummary}>
							<span>
								{selectedActions.length} {t("items_selected") || "Items Selected"}
							</span>
						</div>
						<button
							className={styles.checkoutBtn}
							disabled={selectedActions.length === 0}
							onClick={handleActivate}
						>
							<span>{t("confirm_actions") || "Activate Selected"}</span>
							<Sparkles size={13} />
						</button>
					</div>
				)}
			</div>
		</div>,
		document.body
	);
};
