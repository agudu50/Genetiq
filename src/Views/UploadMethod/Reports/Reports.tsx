import { useMemo, useCallback, memo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { motion } from "framer-motion";
import styles from "./Reports.module.scss";

const DownloadIcon = memo(() => (
	<svg
		width='18'
		height='18'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
		<polyline points='7 10 12 15 17 10' />
		<line x1='12' y1='15' x2='12' y2='3' />
	</svg>
));

const ShieldCheckIcon = memo(() => (
	<svg
		width='18'
		height='18'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
		<path d='m9 12 2 2 4-4' />
	</svg>
));

const SparklesIcon = memo(() => (
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
		<path d='m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1-1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' />
		<path d='M5 3v4' />
		<path d='M3 5h4' />
		<path d='M19 17v4' />
		<path d='M17 19h4' />
	</svg>
));

const Reports = () => {
	const activeAlerts = useSelector(
		(state: RootState) => state.triage.activeAlerts,
	);

	const systems = useMemo(
		() => [
			{ name: "Respiratory", risk: "Low", color: "#00ffff" },
			{
				name: "Cardiac",
				risk: activeAlerts.some((a) => a.system.includes("Cardio"))
					? "Medium"
					: "Low",
				color: "#6366f1",
			},
			{ name: "Digestive", risk: "Low", color: "#ff8800" },
			{
				name: "Neuro",
				risk: activeAlerts.some((a) => a.system.includes("Neuro"))
					? "High"
					: "Low",
				color: "#ff00ff",
			},
			{ name: "Endocrine", risk: "Medium", color: "#ff00ff" },
			{ name: "Renal", risk: "Low", color: "#ffff00" },
		],
		[activeAlerts],
	);

	const handleGeneratePDF = useCallback(() => {
		alert(
			"Synthesizing encrypted health report...\nPDF will be generated and secured with your public key.",
		);
	}, []);

	return (
		<div className={styles["reports-container"]}>
			<div className={styles["reports-content"]}>
				<div className={styles["header"]}>
					<div className={styles["header-text"]}>
						<h1 className={styles["title"]}>
							<span className='text-gradient-muted'>Smart</span>{" "}
							<span className='text-gradient-primary'>Reports</span>
						</h1>
						<p className={styles["subtitle"]}>
							AI-synthesized clinical summaries secured on the Sui Blockchain.
						</p>
					</div>
					<button className={styles["export-btn"]} onClick={handleGeneratePDF}>
						<DownloadIcon />
						Generate PDF
					</button>
				</div>

				<motion.div
					initial={{ opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					className={styles["ai-summary-box"]}
				>
					<div className={styles["summary-header"]}>
						<SparklesIcon />
						<h2>
							AI Health Grade: <span className={styles["grade"]}>Optimal-</span>
						</h2>
					</div>
					<ul className={styles["summary-list"]}>
						<li>
							Recent blood work shows a 12% improvement in metabolic efficiency.
						</li>
						<li>
							Neuro-cognitive baseline remains stable; slight recovery delay
							detected in REM sleep.
						</li>
						<li>
							Respiratory alert: Mild restriction detected (correlated with high
							local pollen count).
						</li>
						<li>
							Recommendation: Increase Vitamin D3 intake by 1000IU daily for the
							next 3 weeks.
						</li>
					</ul>
				</motion.div>

				<section className={styles["risk-heatmap-section"]}>
					<h3 className={styles["section-title"]}>System Risk Heatmap</h3>
					<div className={styles["heatmap-grid"]}>
						{systems.map((s, index) => (
							<motion.div
								key={s.name}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
								className={styles["heatmap-card"]}
								style={{ "--system-color": s.color } as React.CSSProperties}
							>
								<span className={styles["system-name"]}>{s.name}</span>
								<span
									className={`${styles["risk-level"]} ${styles[s.risk.toLowerCase()]}`}
								>
									{s.risk}
								</span>
							</motion.div>
						))}
					</div>
				</section>

				<section className={styles["provenance-section"]}>
					<h3 className={styles["section-title"]}>Data Provenance & Trust</h3>
					<div className={styles["provenance-list"]}>
						<div className={styles["provenance-item"]}>
							<ShieldCheckIcon />
							<div className={styles["item-info"]}>
								<p className={styles["item-title"]}>Chain of Custody</p>
								<p className={styles["item-detail"]}>
									All reports are signed by Clinical Lab: 0x92f...A21 on Sui
									Mainnet.
								</p>
							</div>
							<span className={styles["timestamp"]}>Verified 2m ago</span>
						</div>
					</div>
				</section>

				<footer className={styles["report-footer"]}>
					<p>
						This report is generated by Genetiq AI Agent (v2.4.0) using
						Zero-Knowledge proofs for data privacy.
					</p>
					<div className={styles["blockchain-info"]}>
						<span>Network: Sui Blockchain</span>
						<span>•</span>
						<span>Status: Secured by zkLogin</span>
					</div>
				</footer>
			</div>
		</div>
	);
};

export default Reports;
