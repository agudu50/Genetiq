import { useState } from "react";
import styles from "./ReasonsTable.module.scss";

import Chevron from "@assets/ConcernWidget/Chevron.svg?react";
import {
	Reason,
	Symptoms,
} from "@/Features/Dashboard/ConcernsWidget/helpers/detailedSystemConcerns";
import { ReasonRow } from "@/Features/Dashboard/ConcernsWidget/Components/ReasonRow/ReasonRow";

interface ReasonsTableProps {
	reasons: Reason[];
	symptoms?: Symptoms;
}

export const ReasonsTable: React.FC<ReasonsTableProps> = ({
	reasons,
	symptoms,
}) => {
	const [isShowMore, setIsShowMore] = useState(false);

	const reasonsToShow = isShowMore ? reasons : reasons.slice(0, 3);

	return (
		<div className={styles["ReasonsTable-container"]}>
			<div className={styles["ReasonsTable-head"]}>
				<div className={styles["header"]}>
					<div className={styles["ReasonsTable-title"]}>
						How we know this <span>8</span>
					</div>
					<div
						className={styles["ReasonsTable-more"]}
						onClick={() => setIsShowMore((prev) => !prev)}
					>
						<p className={styles["ReasonsTable-more-text"]}>
							{isShowMore ? "Show less" : `Show ${reasons.length - 3} more`}
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
				<div className={styles["ReasonsTable-desc"]}>
					{symptoms?.description}
				</div>
			</div>
			<div className={styles["ReasonsTable-table"]}>
				{reasonsToShow.map((reason) => (
					<ReasonRow reason={reason} key={reason.id} />
				))}
			</div>
		</div>
	);
};
