import styles from "./RouteLoadingFallback.module.scss";

type RouteLoadingFallbackProps = {
	overlay?: boolean;
	label?: string;
};

export function RouteLoadingFallback({
	overlay = false,
	label = "Loading page…",
}: RouteLoadingFallbackProps) {
	return (
		<div
			className={overlay ? styles.overlay : styles.container}
			role="status"
			aria-live="polite"
			aria-busy="true"
		>
			<div className={styles.spinner} aria-hidden />
			<p className={styles.label}>{label}</p>
		</div>
	);
}
