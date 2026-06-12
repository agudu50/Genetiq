import { PlanItem, PlanSection } from "../../helpers/planMockData";
import styles from "./PlanAggregate.module.scss";
import Arrow from "@assets/PlanWidget/Arrow.svg?react";
import Calendar from "@assets/PlanWidget/Calendar.svg?react";
import Shape from "@assets/PlanWidget/Shape.svg?react";
import QuestionMark from "@assets/PlanWidget/QuestionMark.svg?react";
import Document from "@assets/PlanWidget/Document.svg?react";
import doctor from "@assets/PlanWidget/doctor.png";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { PlanItemIcon } from "@/Features/Dashboard/PlanWidget/helpers/planItemIcons";

type PlanAggregateProps = {
	section: PlanSection;
	setActiveTab: (title: string) => void;
};

export const PlanAggregate = ({
	section,
	setActiveTab,
}: PlanAggregateProps) => {
	const { t } = useLanguage();
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
					{t("plan_recommended_steps")} — {t("plan_based_on_data")}
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
									{t(groupKey)}
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
											<PlanItemIcon
												icon={item.icon}
												itemName={item.name}
												size={16}
												className={styles["PlanAggregate-row-icon"]}
											/>
										</div>
										<div className={styles["PlanAggregate-row-name"]}>
											{t(item.name)}
										</div>
										<div className={styles["PlanAggregate-row-type"]}>
											{t("plan_item_activity")}
										</div>
										<div className={styles["PlanAggregate-buttons"]}>
											<div className={styles["PlanAggregate-why"]}>
												<p>{t("why")}</p>
												<QuestionMark />
											</div>

											<button className={styles["PlanAggregate-cart"]}>
												<p>{t("add_to_cart")}</p>
												<Document />
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
			</div>

			<div className={styles["PlanAggregate-or"]}>{t("or")}</div>
			<div className={styles["PlanAggregate-cta"]}>
				<div className={styles["PlanAggregate-cta-icon-container"]}>
					<img src={doctor} alt='Doctor icon' />
				</div>
				<div className={styles["PlanAggregate-cta-body"]}>
					<div className={styles["PlanAggregate-cta-title-wrap"]}>
						<div className={styles["PlanAggregate-cta-title"]}>
							{t("physician_checkin_title")}
							<Shape className={styles["PlanAggregate-cta-shape"]} />
						</div>
						<span className={styles["PlanAggregate-cta-badge"]}>
							{t("coming_soon")}
						</span>
					</div>
					<div className={styles["PlanAggregate-cta-desc"]}>
						{t("physician_checkin_desc")}
					</div>
				</div>
				<button className={`${styles["PlanAggregate-cta-button"]} ${styles["coming-soon"]}`} disabled>
					<p className={styles["PlanAggregate-cta-schedule"]}>{t("coming_soon")}</p>
					<div className={styles["PlanAggregate-cta-schedule-icon"]}>
						<Calendar />
					</div>
				</button>
			</div>
		</div>
	);
};
