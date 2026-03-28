import { PlanItem, PlanSection } from "../../helpers/planMockData";
import styles from "./PlanAggregate.module.scss";
import Arrow from "@assets/PlanWidget/Arrow.svg?react";
import Calendar from "@assets/PlanWidget/Calendar.svg?react";
import Shape from "@assets/PlanWidget/Shape.svg?react";
import QuestionMark from "@assets/PlanWidget/QuestionMark.svg?react";
import Document from "@assets/PlanWidget/Document.svg?react";
import doctor from "@assets/PlanWidget/doctor.png";

type PlanAggregateProps = {
	section: PlanSection;
	setActiveTab: (title: string) => void;
};

export const PlanAggregate = ({
	section,
	setActiveTab,
}: PlanAggregateProps) => {
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

	return (
		<div className={styles["PlanAggregate-container"]}>
			<div className={styles["PlanAggregate-table"]}>
				<div className={styles["PlanAggregate-note"]}>
					Recommended next steps based on your health data:
				</div>
				{Object.keys(groupedData)
					.slice(0, 3)
					.map((groupKey) => (
						<div key={groupKey} className={styles["PlanAggregate-section"]}>
							<div className={styles["PlanAggregate-section-head"]}>
								<div className={styles["PlanAggregate-section-count"]}>
									{groupedData[groupKey].length}
								</div>
								<div className={styles["PlanAggregate-section-title"]}>
									{groupKey}
								</div>
								<button
									className={styles["PlanAggregate-section-arrow"]}
									onClick={() => setActiveTab(groupKey)}
								>
									<Arrow />
								</button>
							</div>

							<div className={styles["PlanAggregate-rows"]}>
								{groupedData[groupKey].slice(0, 3).map((item, id) => (
									<div key={id} className={styles["PlanAggregate-row"]}>
										<div className={styles["PlanAggregate-row-icon-container"]}>
											<img
												src={item.icon}
												alt={item.name}
												className={styles["PlanAggregate-row-icon"]}
											/>
										</div>
										<div className={styles["PlanAggregate-row-name"]}>
											{item.name}
										</div>
										<div className={styles["PlanAggregate-row-type"]}>
											Activity
										</div>
										<div className={styles["PlanAggregate-buttons"]}>
											<div className={styles["PlanAggregate-why"]}>
												<p>Why</p>
												<QuestionMark />
											</div>

											<button className={styles["PlanAggregate-cart"]}>
												<p>Add to Cart</p>
												<Document />
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
			</div>

			<div className={styles["PlanAggregate-or"]}>OR</div>
			<div className={styles["PlanAggregate-cta"]}>
				<div className={styles["PlanAggregate-cta-icon-container"]}>
					<img src={doctor} alt='Doctor icon' />
				</div>
				<div className={styles["PlanAggregate-cta-body"]}>
					<div className={styles["PlanAggregate-cta-title"]}>
						Check-in with our Physician first
						<Shape className={styles["PlanAggregate-cta-shape"]} />
					</div>
					<div className={styles["PlanAggregate-cta-desc"]}>
						Consult our specialist if you are not sure or concerned about your
						results.
					</div>
				</div>
				<button className={styles["PlanAggregate-cta-button"]}>
					<p className={styles["PlanAggregate-cta-schedule"]}>Schedule Call</p>
					<div className={styles["PlanAggregate-cta-schedule-icon"]}>
						<Calendar />
					</div>
				</button>
			</div>
		</div>
	);
};
