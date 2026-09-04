import { useState } from "react";
import styles from "./ReasonsTable.module.scss";

import Chevron from "@assets/ConcernWidget/Chevron.svg?react";
import { Reason } from "@/Features/Dashboard/ConcernsWidget/helpers/detailedSystemConcerns";
import { ReasonRow } from "@/Features/Dashboard/ConcernsWidget/Components/ReasonRow/ReasonRow";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { Activity } from "lucide-react";

interface ReasonsTableProps {
	reasons: Reason[];
	title?: string;
	subtitle?: string;
}

export const ReasonsTable: React.FC<ReasonsTableProps> = ({
	reasons,
	title,
	subtitle,
}) => {
	const { t } = useLanguage();
	const [isShowMore, setIsShowMore] = useState(false);

	const reasonsToShow = isShowMore ? reasons : reasons.slice(0, 3);
	const hasMore = reasons.length > 3;

	return (
		<div className={styles["ReasonsTable-container"]}>
			<div className={styles["ReasonsTable-head"]}>
				<div className={styles["header"]}>
					<div className={styles["ReasonsTable-title"]}>
						<Activity size={18} strokeWidth={2.25} style={{ color: "var(--accent-primary, #3b82f6)" }} />
						{title || t("how_we_know_this")} <span>{reasons.length}</span>
					</div>
					{hasMore && (
						<div
							className={styles["ReasonsTable-more"]}
							onClick={() => setIsShowMore((prev) => !prev)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => e.key === "Enter" && setIsShowMore((prev) => !prev)}
						>
							<p className={styles["ReasonsTable-more-text"]}>
								{isShowMore
									? t("show_less")
									: `${t("show")} ${Math.max(0, reasons.length - 3)} ${t("more")}`}
							</p>
							<div className={styles["ReasonsTable-chevron-container"]}>
								<Chevron
									className={`${styles["ReasonsTable-chevron"]} ${
										isShowMore ? styles["rotate-chevron"] : ""
									}`}
								/>
							</div>
						</div>
					)}
				</div>
				{subtitle && (
					<div className={styles["ReasonsTable-desc"]}>
						{subtitle}
					</div>
				)}
			</div>
			<div className={styles["ReasonsTable-table"]}>
				{reasonsToShow.map((reason) => (
					<ReasonRow reason={reason} key={reason.id} />
				))}
			</div>
		</div>
	);
};
