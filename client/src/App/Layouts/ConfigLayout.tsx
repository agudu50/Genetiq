import { Outlet } from "react-router-dom";
import styles from "./ConfigLayout.module.scss";

const ShieldIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
	</svg>
);

const HeartPulseIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' />
		<path d='M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27' />
	</svg>
);

const ZapIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2' />
	</svg>
);

export const ConfigLayout = () => {
	return (
		<div className={styles["Config-container"]}>
			<Outlet />

			<footer className={styles["config-footer"]}>
				<div className={styles["footer-inner"]}>
					<p className={styles["footer-help"]}>
						Need help?{" "}
						<a href='#' className={styles["footer-link"]}>
							Contact our support team
						</a>{" "}
						or check out our{" "}
						<a href='#' className={styles["footer-link"]}>
							getting started guide
						</a>
					</p>
					<div className={styles["footer-badges"]}>
						<div className={styles["footer-badge"]}>
							<ShieldIcon />
							<div className={styles["footer-badge-text"]}>
								<span className={styles["footer-badge-label"]}>
									256-bit encryption
								</span>
								<span className={styles["footer-badge-sub"]}>
									Bank-level security
								</span>
							</div>
						</div>
						<div className={styles["footer-badge-divider"]} />
						<div className={styles["footer-badge"]}>
							<HeartPulseIcon />
							<div className={styles["footer-badge-text"]}>
								<span className={styles["footer-badge-label"]}>
									HIPAA compliant
								</span>
								<span className={styles["footer-badge-sub"]}>
									Healthcare standard
								</span>
							</div>
						</div>
						<div className={styles["footer-badge-divider"]} />
						<div className={styles["footer-badge"]}>
							<ZapIcon />
							<div className={styles["footer-badge-text"]}>
								<span className={styles["footer-badge-label"]}>
									Instant analysis
								</span>
								<span className={styles["footer-badge-sub"]}>
									Results in seconds
								</span>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};
