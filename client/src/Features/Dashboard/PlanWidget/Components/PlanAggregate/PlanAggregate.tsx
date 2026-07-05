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

const PREVIEW_LIMIT = 3;

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
			return <Pill size={15} strokeWidth={2.25} />;
		case "activity":
			return <Activity size={15} strokeWidth={2.25} />;
		default:
			return <ClipboardList size={15} strokeWidth={2.25} />;
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
					</div>
				</div>
				<span className={styles.actionsPill}>
					{totalActions} {t("plan_actions") || "actions"}
				</span>
			</header>

			<div className={styles.categoryRow}>
				{groupKeys.map((groupKey) => {
					const config = groupConfig[groupKey] || {
						color: "#8b5cf6",
						icon: "clipboard" as const,
					};
					const count = groupedData[groupKey].length;

					return (
						<button
							key={groupKey}
							type="button"
							className={styles.categoryChip}
							style={{ "--chip-color": config.color } as React.CSSProperties}
							onClick={() => setActiveTab(groupKey)}
						>
							<span className={styles.categoryChipIcon}>
								{renderGroupIcon(config.icon)}
							</span>
							<span className={styles.categoryChipLabel}>{t(groupKey)}</span>
							<span className={styles.categoryChipCount}>{count}</span>
						</button>
					);
				})}
			</div>

			<div className={styles.sections}>
				{groupKeys.map((groupKey) => {
					const config = groupConfig[groupKey] || {
						color: "#8b5cf6",
						icon: "clipboard" as const,
					};
					const items = groupedData[groupKey];
					const previewItems = items.slice(0, PREVIEW_LIMIT);
					const remaining = items.length - previewItems.length;

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

							<div className={styles.itemList}>
								{previewItems.map((item, i) => {
									const { text: benefitPreview } = parseImpact(
										t(item.description),
									);
									return (
										<button
											type="button"
											key={`${groupKey}-${i}`}
											className={styles.itemRow}
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
											<div className={styles.itemIcon}>
												<PlanItemIcon
													icon={item.icon}
													itemName={item.name}
													size={16}
												/>
											</div>
											<div className={styles.itemBody}>
												<p className={styles.itemName}>{t(item.name)}</p>
												<p className={styles.itemPreview}>{benefitPreview}</p>
											</div>
											<div className={styles.itemArrow}>
												<ChevronRight size={15} strokeWidth={2.5} />
											</div>
										</button>
									);
								})}

								{remaining > 0 && (
									<button
										type="button"
										className={styles.moreRow}
										onClick={() => setActiveTab(groupKey)}
									>
										<span>
											+{remaining} {t("plan_more_items") || "more items"}
										</span>
										<ChevronRight size={14} strokeWidth={2.5} />
									</button>
								)}
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
