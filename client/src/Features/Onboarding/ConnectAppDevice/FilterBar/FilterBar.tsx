import { useState } from "react";
import styles from "./FilterBar.module.scss";
import PlusIcon from "@assets/General/Plus.svg?react";

export const FilterBar = () => {
	const [selectedFilter, setSelectedFilter] = useState<string>("All");
	const filterItems = [
		"All",
		"Glucose Monitors",
		"Wearables",
		"Smart Scales",
		"Blood Pressure Monitors",
		"Sleep Trackers",
	];

	return (
		<div className={styles["filter-bar-container"]}>
			{filterItems.map((item) => (
				<div
					key={item}
					className={`${styles["filter-item"]} ${item === selectedFilter ? styles["selected-filter-item"] : ""}`}
					onClick={() => setSelectedFilter(item)}
				>
					{item === "All" ? (
						<span className={styles["plus-icon-wrapper"]}>
							<PlusIcon /> All
						</span>
					) : (
						item
					)}
				</div>
			))}
		</div>
	);
};
