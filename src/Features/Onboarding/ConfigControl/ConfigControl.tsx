import React from "react";
import styles from "./ConfigControl.module.scss";
import { ConfigControlItems } from "@/App/Consts";
import { useNavigate } from "react-router-dom";

interface ConfigControlProps {
	selectedItem: {
		title: string;
		url: string;
	};
}

export const ConfigControl: React.FC<ConfigControlProps> = ({
	selectedItem,
}) => {
	const navigate = useNavigate();
	return (
		<div className={styles["config-control-bar"]}>
			<div className={styles["config-control-items"]}>
				{Object.keys(ConfigControlItems).map((itemKey: string) => (
					<button
						className={`${styles["config-control-item"]}  ${selectedItem.title === ConfigControlItems[itemKey as keyof typeof ConfigControlItems].title ? styles["selected-config-control-item"] : ""}`}
						onClick={() => {
							navigate(
								ConfigControlItems[itemKey as keyof typeof ConfigControlItems]
									.url,
							);
						}}
					>
						{
							ConfigControlItems[itemKey as keyof typeof ConfigControlItems]
								.title
						}
					</button>
				))}
			</div>
		</div>
	);
};
