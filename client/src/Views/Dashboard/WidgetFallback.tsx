import styles from "./Dashboard.module.scss";

type WidgetFallbackProps = {
	minHeight?: number;
};

export function WidgetFallback({ minHeight = 160 }: WidgetFallbackProps) {
	return (
		<div
			className={styles.widgetSkeleton}
			style={{ minHeight }}
			aria-hidden="true"
		/>
	);
}
