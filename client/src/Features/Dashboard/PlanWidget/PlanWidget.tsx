import { useState } from "react";
import styles from "./PlanWidget.module.scss";
import { Tabs } from "./Components/Tabs/Tabs";
import { PlanTable } from "./Components/PlanTable/PlanTable";
import { PlanAggregate } from "./Components/PlanAggregate/PlanAggregate";
import { PlanItemDetailModal } from "./Components/PlanItemDetailModal/PlanItemDetailModal";
import { PlanSection } from "./helpers/planMockData";
import { PlanItemSelection } from "./helpers/planItemHelpers";
import dashboardData from "@/App/Data/dashboard_data.json";

interface PlanWidgetProps {
	backgroundColor?: string;
	planData: PlanSection[];
}

export const PlanWidget = ({
	backgroundColor = "",
	planData: propsPlanData,
}: PlanWidgetProps) => {
	const planData =
		propsPlanData ||
		(dashboardData.action_plan.default as unknown as PlanSection[]);
	const [activeTab, setActiveTab] = useState(planData[0].title);
	const [transitioning, setTransitioning] = useState(false);
	const [selectedItem, setSelectedItem] = useState<PlanItemSelection | null>(
		null,
	);

	const getActionPlanData = () => {
		return planData
			.filter((section) => section.title !== "Action Plan")
			.flatMap((section) =>
				section.data.map((item) => ({
					...item,
					group: section.title,
				})),
			);
	};

	const enrichedPlanMockData = planData.map((section) =>
		section.title === "Action Plan"
			? { ...section, data: getActionPlanData() }
			: section,
	);

	const activeSection = enrichedPlanMockData.find(
		(section) => section.title === activeTab,
	);

	const handleTabChange = (newTab: string) => {
		setTransitioning(true);
		setActiveTab(newTab);
	};

	const handleItemSelect = (selection: PlanItemSelection) => {
		setSelectedItem(selection);
	};

	return (
		<div
			className={`${styles["PlanWidget-wrapper"]} ${backgroundColor === "blue" && styles["PlanWidget-wrapper-blue"]}`}
		>
			<Tabs
				sections={enrichedPlanMockData}
				activeTab={activeTab}
				setActiveTab={handleTabChange}
				backgroundColor={backgroundColor}
			/>
			<div className={styles["PlanWidget-content"]}>
				<div className={styles.cardMeshBg} aria-hidden />
				<div className={styles.cardGlowBlob} aria-hidden />
				<div className={styles.cardAccentLine} aria-hidden />
				{activeTab === "Action Plan" && activeSection ? (
					<PlanAggregate
						section={activeSection}
						setActiveTab={setActiveTab}
						onItemSelect={handleItemSelect}
						backgroundColor={backgroundColor}
					/>
				) : (
					<>
						{activeSection && (
							<PlanTable
								section={activeSection}
								setActiveTab={setActiveTab}
								transitioning={transitioning}
								setTransitioning={setTransitioning}
								onItemSelect={handleItemSelect}
							/>
						)}
					</>
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
