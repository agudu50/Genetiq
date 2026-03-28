import styles from "./RiskChart.module.scss";
import Ellipse1 from "@assets/RiskChart/Ellipse1.svg?react";
import Ellipse2 from "@assets/RiskChart/Ellipse2.svg?react";
import Ellipse3 from "@assets/RiskChart/Ellipse3.svg?react";
import Warning from "@assets/RiskChart/Warning.svg?react";

export const RiskChart = () => {
	return (
		<div className={styles["RiskChart-wrapper"]}>
			<Warning
				style={{
					width: "17px",
					height: "17px",
					position: "absolute",
					left: "47px",
					top: "15px",
				}}
			/>
			<Ellipse1 style={{ position: "absolute", bottom: "0px", left: "25px" }} />
			<Ellipse2 style={{ position: "absolute", top: "24px", right: "7px" }} />
			<Ellipse3 style={{ position: "absolute", top: "24px", left: "7px" }} />
			<div className={styles["RiskChart-status"]}>High</div>
			<div className={styles["RiskChart-concern"]}>Concern</div>
		</div>
	);
};
