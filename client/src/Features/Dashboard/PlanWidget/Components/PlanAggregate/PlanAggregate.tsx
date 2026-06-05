import { PlanItem, PlanSection } from "../../helpers/planMockData";
import styles from "./PlanAggregate.module.scss";
import Arrow from "@assets/PlanWidget/Arrow.svg?react";
import Calendar from "@assets/PlanWidget/Calendar.svg?react";
import doctor from "@assets/PlanWidget/doctor.png";
import { useLanguage } from "@/App/i18n/LanguageContext";

type PlanAggregateProps = {
	section: PlanSection;
	setActiveTab: (title: string) => void;
	backgroundColor: string;
};

export const PlanAggregate = ({
	section,
	setActiveTab,
	backgroundColor,
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

	// Map groups to specific icons, colors and gradients for the premium UI
	const groupConfig: Record<
		string,
		{ color: string; bg: string; icon: string }
	> = {
		"Follow-up Care": {
			color: "#3b82f6",
			bg: "rgba(59, 130, 246, 0.1)",
			icon: "clipboard-list",
		},
		"Supplements": {
			color: "#f59e0b",
			bg: "rgba(245, 158, 11, 0.1)",
			icon: "pill",
		},
		"Lifestyle": {
			color: "#10b981",
			bg: "rgba(16, 185, 129, 0.1)",
			icon: "activity",
		},
	};

	const renderGroupIcon = (type: string) => {
		if (type === "pill") {
			return (
				<svg
					width='20'
					height='20'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<path d='m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z' />
					<path d='m8.5 8.5 7 7' />
				</svg>
			);
		}
		if (type === "activity") {
			return (
				<svg
					width='20'
					height='20'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<path d='M22 12h-4l-3 9L9 3l-3 9H2' />
				</svg>
			);
		}
		return (
			<svg
				width='20'
				height='20'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<rect width='16' height='20' x='4' y='2' rx='2' />
				<path d='M9 22v-4h6v4' />
				<path d='M8 6h.01' />
				<path d='M16 6h.01' />
				<path d='M12 6h.01' />
				<path d='M12 10h.01' />
				<path d='M12 14h.01' />
				<path d='M16 10h.01' />
				<path d='M16 14h.01' />
				<path d='M8 10h.01' />
				<path d='M8 14h.01' />
			</svg>
		);
	};

	return (
		<div className={styles["PlanAggregate-container"]}>
			<div className={styles["PlanAggregate-header"]}>
				<h3 className={styles["PlanAggregate-title"]}>
					<svg
						width='20'
						height='20'
						viewBox='0 0 24 24'
						fill='none'
						stroke='#6366f1'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<path d='m9 12 2 2 4-4' />
						<path d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10 10-4.477 10-10z' />
					</svg>
					Recommended Next Steps
				</h3>
				<span className={styles["PlanAggregate-note"]}>
					Based on your health data
				</span>
			</div>

			<div
				className={`${styles["PlanAggregate-table"]} ${backgroundColor === "blue" ? styles["PlanAggregate-table-blue"] : ""}`}
			>
				{Object.keys(groupedData)
					.slice(0, 3)
					.map((groupKey) => {
						const config = groupConfig[groupKey] || {
							color: "#8b5cf6",
							bg: "rgba(139, 92, 246, 0.1)",
							icon: "clipboard-list",
						};
						return (
							<div
								key={groupKey}
								className={styles["PlanAggregate-section"]}
								style={
									{
										"--group-color": config.color,
										"--group-bg": config.bg,
									} as React.CSSProperties
								}
							>
								<div className={styles["PlanAggregate-section-head"]}>
									<div className={styles["PlanAggregate-section-title-wrap"]}>
										<div className={styles["PlanAggregate-section-icon"]}>
											{renderGroupIcon(config.icon)}
										</div>
										<div className={styles["PlanAggregate-section-title"]}>
											{groupKey}
										</div>
										<div className={styles["PlanAggregate-section-count"]}>
											{groupedData[groupKey].length}
										</div>
									</div>
									<button
										className={styles["PlanAggregate-section-arrow"]}
										onClick={() => setActiveTab(groupKey)}
										aria-label={`View all ${groupKey}`}
									>
										<Arrow />
									</button>
								</div>

								<div className={styles["PlanAggregate-rows"]}>
									{groupedData[groupKey].map((item, id) => (
										<div key={id} className={styles["PlanAggregate-row"]}>
											<div className={styles["PlanAggregate-row-info"]}>
												<div
													className={styles["PlanAggregate-row-icon-container"]}
												>
													<img
														src={item.icon}
														alt=''
														className={styles["PlanAggregate-row-icon"]}
													/>
												</div>
												<div className={styles["PlanAggregate-row-name"]}>
													{item.name}
												</div>
											</div>
											<div className={styles["PlanAggregate-row-type"]}>
												{t("plan_item_activity") || "Activity"}
											</div>
										</div>
									))}
								</div>
							</div>
						);
					})}
			</div>

			<div className={styles["PlanAggregate-or-divider"]}>
				<span className={styles["PlanAggregate-or"]}>{t("or") || "OR"}</span>
			</div>

			<div className={styles["PlanAggregate-cta"]}>
				<div className={styles["PlanAggregate-cta-content"]}>
					<div className={styles["PlanAggregate-cta-icon-container"]}>
						<img src={doctor} alt='Physician checking' />
					</div>
					<div className={styles["PlanAggregate-cta-body"]}>
						<div className={styles["PlanAggregate-cta-title-wrap"]}>
							<div className={styles["PlanAggregate-cta-title"]}>
								{t("physician_checkin_title") ||
									"Check-in with our Physician first"}
							</div>
							<span className={styles["PlanAggregate-cta-badge"]}>
								{t("coming_soon") || "Coming Soon"}
							</span>
						</div>
						<div className={styles["PlanAggregate-cta-desc"]}>
							{t("physician_checkin_desc") ||
								"Consult our specialist if you are not sure or concerned about your results."}
						</div>
					</div>
				</div>
				<button className={`${styles["PlanAggregate-cta-button"]} ${styles["coming-soon"]}`} disabled>
					<span className={styles["PlanAggregate-cta-schedule"]}>
						{t("coming_soon") || "Coming Soon"}
					</span>
					<Calendar className={styles["PlanAggregate-cta-schedule-icon"]} />
				</button>
			</div>
		</div>
	);
};
