import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import styles from "./PlanWidget.module.scss";
import { Tabs } from "./Components/Tabs/Tabs";
import { PlanTable } from "./Components/PlanTable/PlanTable";
import { PlanAggregate } from "./Components/PlanAggregate/PlanAggregate";
import { PlanItemDetailModal } from "./Components/PlanItemDetailModal/PlanItemDetailModal";
import { PlanSection, PlanItem } from "./helpers/planMockData";
import { PlanItemSelection } from "./helpers/planItemHelpers";
import { useActionPlan } from "./hooks/useActionPlan";
import { useLanguage } from "@/App/i18n/LanguageContext";

interface PlanWidgetProps {
	backgroundColor?: string;
	planData?: PlanSection[];
}

export const PlanWidget = ({
	backgroundColor = "",
	planData: propsPlanData,
}: PlanWidgetProps) => {
	const { t } = useLanguage();
	const {
		planData: generatedPlan,
		isLoading,
		isGemmaPowered,
	} = useActionPlan({ enabled: !propsPlanData });

	const planData = propsPlanData ?? generatedPlan;
	const [activeTab, setActiveTab] = useState(planData[0]?.title ?? "Action Plan");
	const [transitioning, setTransitioning] = useState(false);
	const [selectedItem, setSelectedItem] = useState<PlanItemSelection | null>(
		null,
	);

	useEffect(() => {
		if (planData[0]?.title) {
			setActiveTab(planData[0].title);
		}
	}, [planData]);

	const getActionPlanData = () => {
		return planData
			.filter((section) => section.title !== "Action Plan")
			.flatMap((section) =>
				section.data.map((item: PlanItem) => ({
					...item,
					group: section.title,
				})),
			);
	};

	const enrichedPlanData = planData.map((section) =>
		section.title === "Action Plan"
			? { ...section, data: getActionPlanData() }
			: section,
	);

	const activeSection = enrichedPlanData.find(
		(section) => section.title === activeTab,
	);

	const handleTabChange = (newTab: string) => {
		setTransitioning(true);
		setActiveTab(newTab);
	};

	const handleItemSelect = (selection: PlanItemSelection) => {
		setSelectedItem(selection);
	};

	const showGemmaBadge = !propsPlanData && isGemmaPowered;

	return (
		<div
			className={`${styles["PlanWidget-wrapper"]} ${backgroundColor === "blue" && styles["PlanWidget-wrapper-blue"]}`}
		>
			<Tabs
				sections={enrichedPlanData}
				activeTab={activeTab}
				setActiveTab={handleTabChange}
				backgroundColor={backgroundColor}
			/>
			<div className={styles["PlanWidget-content"]}>
				{!propsPlanData && isLoading && (
					<div className={styles.loadingBanner}>
						<Sparkles size={14} strokeWidth={2.25} />
						<span>{t("plan_generating")}</span>
					</div>
				)}

				{showGemmaBadge && !isLoading && (
					<div className={styles.gemmaBadge}>
						<Sparkles size={12} strokeWidth={2.25} />
						<span>{t("plan_gemma_powered")}</span>
					</div>
				)}

				{activeTab === "Action Plan" && activeSection ? (
					<PlanAggregate
						section={activeSection}
						setActiveTab={setActiveTab}
						onItemSelect={handleItemSelect}
						backgroundColor={backgroundColor}
					/>
				) : (
					activeSection && (
						<PlanTable
							section={activeSection}
							setActiveTab={setActiveTab}
							transitioning={transitioning}
							setTransitioning={setTransitioning}
							onItemSelect={handleItemSelect}
						/>
					)
				)}
			</div>

			<PlanItemDetailModal
				selection={selectedItem}
				onClose={() => setSelectedItem(null)}
				onViewSection={(category) => {
					setTransitioning(true);
					setActiveTab(category);
				}}
			/>
		</div>
	);
};
