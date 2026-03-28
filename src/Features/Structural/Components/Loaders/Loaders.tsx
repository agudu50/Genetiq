import React from "react";
import styles from "./Loaders.module.scss";

export const DNALoader: React.FC = () => {
	return (
		<div className={styles.dnaLoader}>
			{[...Array(10)].map((_, i) => (
				<div
					key={i}
					className={styles.strand}
					style={{ animationDelay: `${i * 0.15}s` }}
				>
					<div className={styles.nodeLeft}></div>
					<div className={styles.link}></div>
					<div className={styles.nodeRight}></div>
				</div>
			))}
		</div>
	);
};

export const HeartRateLoader: React.FC = () => {
	return (
		<div className={styles.ecgLoader}>
			<svg viewBox='0 0 100 20' className={styles.ecgLine}>
				<polyline points='0,10 20,10 25,2 30,18 35,6 40,10 100,10' />
			</svg>
		</div>
	);
};
