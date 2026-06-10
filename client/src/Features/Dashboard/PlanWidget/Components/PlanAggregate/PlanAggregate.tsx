import { motion } from "framer-motion";
import {
	Activity,
	ClipboardList,
	Pill,
	ChevronRight,
	Sparkles,
	Calendar,
} from "lucide-react";
import { PlanItem, PlanSection } from "../../helpers/planMockData";
import styles from "./PlanAggregate.module.scss";
import doctor from "@assets/PlanWidget/doctor.png";
import { useLanguage } from "@/App/i18n/LanguageContext";

type PlanAggregateProps = {
	section: PlanSection;
	setActiveTab: (title: string) => void;
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
				<div className={styles.actionCount}>
					{totalActions} {t("plan_actions") || "actions"}
				</div>
			</header>

			<div className={styles.sections}>
				{groupKeys.map((groupKey, sectionIdx) => {
					const config = groupConfig[groupKey] || {
						color: "#8b5cf6",
						icon: "clipboard" as const,
					};
					const items = groupedData[groupKey];

					return (
						<motion.section
							key={groupKey}
							className={styles.section}
							style={{ "--group-color": config.color } as React.CSSProperties}
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								delay: sectionIdx * 0.1,
								duration: 0.45,
								ease: [0.22, 1, 0.36, 1],
							}}
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
									return (
										<motion.button
											type="button"
											key={`${groupKey}-${i}`}
											className={`${styles.timelineItem} ${isLast ? styles.timelineItemLast : ""}`}
											style={
												{ "--accent-color": config.color } as React.CSSProperties
											}
											initial={{ opacity: 0, x: -8 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{
												delay: sectionIdx * 0.1 + i * 0.05,
												duration: 0.4,
											}}
											onClick={() => setActiveTab(groupKey)}
										>
											<div className={styles.timelineNode}>
												<div className={styles.itemIcon}>
													<img src={item.icon} alt="" />
												</div>
											</div>

											<div className={styles.itemCard}>
												<div className={styles.itemAccent} aria-hidden />
												<div className={styles.itemBody}>
													<p className={styles.itemName}>{t(item.name)}</p>
													<span className={styles.itemType}>
														{t("plan_item_activity")}
													</span>
												</div>
												<div className={styles.itemArrow}>
													<ChevronRight size={15} strokeWidth={2.5} />
												</div>
											</div>
										</motion.button>
									);
								})}
							</div>
						</motion.section>
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
				<button
					type="button"
					className={styles.ctaButton}
					disabled
				>
					<span>{t("coming_soon")}</span>
					<Calendar size={16} strokeWidth={2.25} />
				</button>
			</div>
		</div>
	);
};
