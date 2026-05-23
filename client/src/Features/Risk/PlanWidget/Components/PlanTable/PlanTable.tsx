import styles from "./PlanTable.module.scss";
import { CtaBlock } from "../CtaBlock/CtaBlock";
import { PlanRow } from "../PlanRow/PlanRow";
import { PlanItem, PlanSection } from "../../helpers/planMockData";

type PlanTableProps = {
	section: PlanSection;
	setActiveTab: (title: string) => void;
	transitioning: boolean;
	setTransitioning: (state: boolean) => void;
};

export const PlanTable = ({
	section,
	setActiveTab,
	transitioning,
	setTransitioning,
}: PlanTableProps) => {
	const groupedData = section.data.reduce(
		(acc: { [key: string]: PlanItem[] }, item: PlanItem) => {
			const group = item.group || "default";
			if (!acc[group]) {
				acc[group] = [];
			}
			acc[group].push(item);
			return acc;
		},
		{},
	);

	const handleTransitionEnd = () => {
		setTransitioning(false);
	};

	return (
		<div
			className={`${styles["PlanTable-section"]} ${
				transitioning && styles["PlanTable-section-animate"]
			}`}
			onAnimationEnd={handleTransitionEnd}
		>
			{section.cta && <CtaBlock cta={section.cta} />}

			<div className={styles["PlanTable-list"]}>
				{Object.keys(groupedData).map((groupKey) => (
					<div key={groupKey}>
						{groupKey !== "default" && (
							<div className={styles["PlanTable-group-header"]}>
								<h3>{groupKey}</h3>
							</div>
						)}
						<div className={styles["PlanTable-rows"]}>
							{groupedData[groupKey].map((item, id) => (
								<PlanRow key={id} item={item} setActiveTab={setActiveTab} />
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
