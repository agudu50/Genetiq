import { ClipboardList, Pill, Activity } from "lucide-react";
import styles from "./PlanTable.module.scss";
import { CtaBlock } from "../CtaBlock/CtaBlock";
import { PlanRow } from "../PlanRow/PlanRow";
import { PlanItem, PlanSection } from "../../helpers/planMockData";
import { PlanItemSelection } from "../../helpers/planItemHelpers";
import { useLanguage } from "@/App/i18n/LanguageContext";

type PlanTableProps = {
	section: PlanSection;
	setActiveTab: (title: string) => void;
	transitioning: boolean;
	setTransitioning: (state: boolean) => void;
	onItemSelect: (selection: PlanItemSelection) => void;
};

const sectionIcons: Record<string, React.ReactNode> = {
	"Follow-up Care": <ClipboardList size={18} strokeWidth={2.25} />,
	Supplements: <Pill size={18} strokeWidth={2.25} />,
	Lifestyle: <Activity size={18} strokeWidth={2.25} />,
};

const sectionColors: Record<string, string> = {
	"Follow-up Care": "#3b82f6",
	Supplements: "#f59e0b",
	Lifestyle: "#10b981",
};

export const PlanTable = ({
	section,
	setActiveTab,
	transitioning,
	setTransitioning,
	onItemSelect,
}: PlanTableProps) => {
	const { t } = useLanguage();
	const accentColor = sectionColors[section.title] || "#00a69d";

	const groupedData = section.data.reduce(
		(acc: { [key: string]: PlanItem[] }, item: PlanItem) => {
			const group = item.group || "default";
			if (!acc[group]) acc[group] = [];
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
			className={`${styles.section} ${transitioning ? styles.sectionAnimate : ""}`}
			onAnimationEnd={handleTransitionEnd}
			style={{ "--section-color": accentColor } as React.CSSProperties}
		>
			<header className={styles.header}>
				<div className={styles.titleBlock}>
					<div className={styles.titleIcon}>
						{sectionIcons[section.title] || <ClipboardList size={18} />}
					</div>
					<div>
						<h3 className={styles.title}>{t(section.title)}</h3>
						<p className={styles.subtitle}>
							{section.data.length} {t("plan_items") || "items"}
						</p>
					</div>
				</div>
			</header>

			{section.cta && <CtaBlock cta={section.cta} />}

			<div className={styles.list}>
				{Object.keys(groupedData).map((groupKey) => (
					<div key={groupKey} className={styles.group}>
						{groupKey !== "default" && (
							<div className={styles.groupHeader}>
								<h4>{t(groupKey)}</h4>
							</div>
						)}
						<div className={styles.rows}>
							{groupedData[groupKey].map((item, id) => (
								<PlanRow
									key={id}
									index={id}
									item={item}
									setActiveTab={setActiveTab}
									accentColor={accentColor}
									category={section.title}
									onItemSelect={onItemSelect}
								/>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
