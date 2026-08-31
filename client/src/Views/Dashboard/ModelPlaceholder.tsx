import styles from "./ModelPlaceholder.module.scss";

export function ModelPlaceholder() {
	return (
		<div className={styles.placeholder} aria-hidden>
			<div className={styles.loaderCenter}>
				<div className={styles.pulseRing} />
				<div className={styles.pulseDot} />
			</div>
		</div>
	);
}
