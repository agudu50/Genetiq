import {
	Activity,
	ClipboardList,
	Pill,
	ChevronRight,
	Sparkles,
	Calendar,
} from "lucide-react";
import { PlanItem, PlanSection } from "../../helpers/planMockData";
import {
	PlanItemSelection,
	parseImpact,
} from "../../helpers/planItemHelpers";
import styles from "./PlanAggregate.module.scss";
import doctor from "@assets/PlanWidget/doctor.png";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { PlanItemIcon } from "../../helpers/planItemIcons";

type PlanAggregateProps = {
	section: PlanSection;
	setActiveTab: (title: string) => void;
	onItemSelect: (selection: PlanItemSelection) => void;
	backgroundColor: string;
};

const groupConfig: Record<
	string,
	{ color: string; icon: "clipboard" | "pill" | "activity" }
> = {
	"Follow-up Care": { color: "#3b82f6", icon: "clipboard" },
	Supplements: { color: "#f59e0b", icon: "pill" },
	Lifestyle: { color: "#10b981", icon: "activity" },
};

const renderGroupIcon = (type: "clipboard" | "pill" | "activity") => {
	switch (type) {
		case "pill":
			return <Pill size={16} strokeWidth={2.25} />;
		case "activity":
			return <Activity size={16} strokeWidth={2.25} />;
		default:
			return <ClipboardList size={16} strokeWidth={2.25} />;
	}
};

export const PlanAggregate = ({
	section,
	setActiveTab,
	onItemSelect,
}: PlanAggregateProps) => {
	const { t } = useLanguage();

	const groupedData = section.data.reduce(
		(acc: { [key: string]: PlanItem[] }, item: PlanItem) => {
			const group = item.group || "default";
			if (!acc[group]) acc[group] = [];
			acc[group].push(item);
			return acc;
		},
		{},
	);

	const groupKeys = Object.keys(groupedData).slice(0, 3);
	const totalActions = section.data.length;

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<div className={styles.titleBlock}>
					<div className={styles.titleIconWrap}>
						<Sparkles size={18} strokeWidth={2.25} />
					</div>
					<div className={styles.titleText}>
						<h3 className={styles.title}>{t("plan_recommended_steps")}</h3>
						<p className={styles.subtitle}>{t("plan_based_on_data")}</p>
						<span className={styles.actionsPill}>
							{totalActions} {t("plan_actions") || "actions"}
						</span>
					</div>
				</div>
			</header>

			<div className={styles.sections}>
				{groupKeys.map((groupKey) => {
					const config = groupConfig[groupKey] || {
						color: "#8b5cf6",
						icon: "clipboard" as const,
					};
					const items = groupedData[groupKey];

					return (
						<section
							key={groupKey}
							className={styles.section}
							style={{ "--group-color": config.color } as React.CSSProperties}
						>
							<div className={styles.sectionHead}>
								<div className={styles.sectionTitleWrap}>
									<div className={styles.sectionIcon}>
										{renderGroupIcon(config.icon)}
									</div>
									<div>
										<h4 className={styles.sectionTitle}>{t(groupKey)}</h4>
										<span className={styles.sectionMeta}>
											{items.length} {t("plan_items") || "items"}
										</span>
									</div>
								</div>
								<button
									type="button"
									className={styles.sectionViewAll}
									onClick={() => setActiveTab(groupKey)}
								>
									<span>{t("view_all")}</span>
									<ChevronRight size={14} strokeWidth={2.5} />
								</button>
							</div>

							<div className={styles.timeline}>
								<div className={styles.timelineSpine} aria-hidden />

								{items.map((item, i) => {
									const isLast = i === items.length - 1;
									const { text: benefitPreview } = parseImpact(
										t(item.description),
									);
									return (
										<button
											type="button"
											key={`${groupKey}-${i}`}
											className={`${styles.timelineItem} ${isLast ? styles.timelineItemLast : ""}`}
											style={
												{ "--accent-color": config.color } as React.CSSProperties
											}
											onClick={() =>
												onItemSelect({
													item,
													category: groupKey,
													accentColor: config.color,
												})
											}
										>
											<div className={styles.timelineNode}>
												<div className={styles.itemIcon}>
													<PlanItemIcon
														icon={item.icon}
														itemName={item.name}
														size={16}
													/>
												</div>
											</div>

											<div className={styles.itemCard}>
												<div className={styles.itemAccent} aria-hidden />
												<div className={styles.itemIconMobile} aria-hidden>
													<PlanItemIcon
														icon={item.icon}
														itemName={item.name}
														size={16}
													/>
												</div>
												<div className={styles.itemBody}>
													<p className={styles.itemName}>{t(item.name)}</p>
													<p className={styles.itemPreview}>
														{benefitPreview}
													</p>
													<span className={styles.itemType}>
														{t("plan_item_activity")}
													</span>
												</div>
												<div className={styles.itemArrow}>
													<ChevronRight size={15} strokeWidth={2.5} />
												</div>
											</div>
										</button>
									);
								})}
							</div>
						</section>
					);
				})}
			</div>

			<div className={styles.orDivider}>
				<span>{t("or")}</span>
			</div>

			<div className={styles.cta}>
				<div className={styles.ctaContent}>
					<div className={styles.ctaAvatar}>
						<img src={doctor} alt="" />
					</div>
					<div className={styles.ctaBody}>
						<div className={styles.ctaTitleRow}>
							<h4 className={styles.ctaTitle}>
								{t("physician_checkin_title")}
							</h4>
							<span className={styles.ctaBadge}>{t("coming_soon")}</span>
						</div>
						<p className={styles.ctaDesc}>{t("physician_checkin_desc")}</p>
					</div>
				</div>
				<button type="button" className={styles.ctaButton} disabled>
					<span>{t("coming_soon")}</span>
					<Calendar size={16} strokeWidth={2.25} />
				</button>
			</div>
		</div>
	);
};
