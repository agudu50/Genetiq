import { ChevronRight } from "lucide-react";
import styles from "./PlanRow.module.scss";
import { PlanItem } from "../../helpers/planMockData";
import { PlanItemSelection } from "../../helpers/planItemHelpers";
import { useLanguage } from "@/App/i18n/LanguageContext";

export const PlanRow = ({
	item,
	setActiveTab,
	index = 0,
	accentColor = "#00a69d",
	category = "",
	onItemSelect,
}: {
	item: PlanItem;
	setActiveTab: (tab: string) => void;
	index?: number;
	accentColor?: string;
	category?: string;
	onItemSelect?: (selection: PlanItemSelection) => void;
}) => {
	const { t } = useLanguage();

	const handleClick = () => {
		if (onItemSelect && category) {
			onItemSelect({ item, category, accentColor });
			return;
		}
		if (item.link) setActiveTab(item.link);
	};

	return (
		<div
			className={styles.row}
			style={{ "--accent-color": accentColor } as React.CSSProperties}
			onClick={handleClick}
		>
			<div className={styles.node}>
				<div className={styles.step}>{index + 1}</div>
			</div>

			<div className={styles.card}>
				<div className={styles.accent} aria-hidden />

				<div className={styles.iconWrap}>
					<img src={item.icon} alt="" />
				</div>

				<div className={styles.body}>
					<p className={styles.name}>
						{item.count && (
							<span className={styles.count}>{item.count} </span>
						)}
						{t(item.name)}
					</p>
					{item.description ? (
						<p className={styles.desc}>{t(item.description)}</p>
					) : (
						<span className={styles.typeChip}>
							{t("plan_item_activity")}
						</span>
					)}
				</div>

				<div className={styles.actions}>
					{item.dosage && (
						<span className={styles.metaChip}>{item.dosage}</span>
					)}
					{item.frequency && (
						<span className={styles.metaChip}>{item.frequency}</span>
					)}
					{item.description && (
						<span className={styles.typeChip}>{t("plan_item_activity")}</span>
					)}

					<div className={styles.arrow}>
						<ChevronRight size={15} strokeWidth={2.5} />
					</div>
				</div>
			</div>
		</div>
	);
};
