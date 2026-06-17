import styles from "./ModelPlaceholder.module.scss";

export function ModelPlaceholder() {
	return (
		<div className={styles.placeholder} aria-hidden>
			<img
				className={styles.image}
				src="/assets/digital_twin_hero.png"
				alt=""
				loading="eager"
				decoding="async"
			/>
			<div className={styles.overlay} />
			<div className={styles.shimmer} />
		</div>
	);
}
