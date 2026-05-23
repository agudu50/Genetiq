import Heart from "@/assets/ConnectWatchWidget/Heart.svg?react";
import ConnectIcon from "@/assets/ConnectWatchWidget/ConnectIcon.svg?react";
import styles from "./ConnectWatchWidget.module.scss";

export const ConnectWatchWidget = () => {
	return (
		<div className={styles["ConnectWatchWidget-container"]}>
			<div className={styles["ConnectWatchWidget-left"]}>
				<div className={styles["ConnectWatchWidget-heart-container"]}>
					<Heart />
				</div>
				<div className={styles["ConnectWatchWidget-title"]}>
					Find your health data in one place
				</div>
			</div>
			<button className={styles["ConnectWatchWidget-button"]}>
				<div className={styles["ConnectWatchWidget-button-text"]}>
					Connect to Apple Health
				</div>
				<div className={styles["ConnectWatchWidget-button-icon-container"]}>
					<ConnectIcon />
				</div>
			</button>
		</div>
	);
};
