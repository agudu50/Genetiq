import { useState } from "react";
import styles from "./ReasonsTable.module.scss";

import Chevron from "@assets/ConcernWidget/Chevron.svg?react";
import { Reason } from "../../helpers/detailedSystemConcerns";
import { ReasonRow } from "../ReasonRow/ReasonRow";
import { useLanguage } from "@/App/i18n/LanguageContext";

interface ReasonsTableProps {
	reasons: Reason[];
	detailIndex: number;
}

export const ReasonsTable: React.FC<ReasonsTableProps> = ({
	reasons,
	detailIndex,
}) => {
	const { t } = useLanguage();
	const [isShowMore, setIsShowMore] = useState(false);

	const reasonsToShow = isShowMore ? reasons : reasons.slice(0, 3);

	return (
		<div className={styles["ReasonsTable-container"]}>
			<div className={styles["ReasonsTable-head"]}>
				<div className={styles["ReasonsTable-title"]}>
					{t("how_we_know_this")}
				</div>
				<div
					className={styles["ReasonsTable-more"]}
					onClick={() => setIsShowMore((prev) => !prev)}
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
			</div>
			<div className={styles["ReasonsTable-table"]} key={detailIndex}>
				{reasonsToShow.map((reason) => (
					<ReasonRow reason={reason} key={reason.id} />
				))}
			</div>
		</div>
	);
};
