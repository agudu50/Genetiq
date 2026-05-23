import React from "react";
import {
	ShieldCheck,
	Activity,
	Clock,
	MapPin,
	User,
	CheckCircle2,
	AlertCircle,
	FileText,
	ExternalLink,
	ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./HealthHistory.module.scss";

// Mock Data for Prototype
const USER_INFO = {
	name: "John Doe",
	age: 20,
	bloodType: "O+",
	allergies: "PENICILLIN - HIGH ALERT",
	lastVisit: "Oct 24, 2025",
	location: "Korle-Bu Teaching Hospital",
};

const ENCOUNTER = {
	complaint:
		"Persistent chest tightness and shortness of breath during exercise.",
	findings: [
		"Slightly elevated resting heart rate (88 BPM).",
		"Lungs clear on auscultation.",
		"Blood pressure: 128/82 mmHg.",
		"Oxygen Saturation: 98% (Room Air).",
	],
	conclusion:
		"Likely Exercise-Induced Bronchospasm. Recommended follow-up with Pulmonary function test.",
};

const LAB_RESULTS = [
	{
		id: 1,
		name: "Full Blood Count",
		date: "Oct 24, 2025",
		result: "Normal",
		status: "Verified",
		txId: "0x7a8...92c",
	},
	{
		id: 2,
		name: "Chest X-Ray",
		date: "Oct 25, 2025",
		result: "Clear",
		status: "Verified",
		txId: "0xb3e...1f4",
	},
	{
		id: 3,
		name: "ECG (Resting)",
		date: "Oct 24, 2025",
		result: "Fast Heart Rate",
		status: "Flagged",
		txId: "0xd4c...8e2",
	},
];

export const HealthHistory: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className={styles.pageWrapper}>
			{/* 1. Identity & Vitals Banner */}
			<header className={styles.vitalsBanner}>
				<div className={styles.bannerContent}>
					<button className={styles.backBtn} onClick={() => navigate(-1)}>
						<ArrowLeft size={16} />
						<span>Back</span>
					</button>
					<div className={styles.userSection}>
						<div className={styles.avatar}>
							<User size={20} />
						</div>
						<div className={styles.userIdentity}>
							<h1 className={styles.userName}>{USER_INFO.name}</h1>
							<span className={styles.userMeta}>
								{USER_INFO.age} years • {USER_INFO.bloodType}
							</span>
						</div>
					</div>

					<div className={styles.vitalsGrid}>
						<div className={styles.vitalItem}>
							<span className={styles.vitalLabel}>Allergies</span>
							<span className={styles.allergyBadge}>{USER_INFO.allergies}</span>
						</div>
						<div className={styles.vitalItem}>
							<span className={styles.vitalLabel}>Last Visit</span>
							<div className={styles.lastVisitGroup}>
								<Clock size={12} />
								<span>{USER_INFO.lastVisit}</span>
								<MapPin size={12} />
								<span>{USER_INFO.location}</span>
							</div>
						</div>
					</div>

					<div className={styles.statusSection}>
						<div className={styles.suiBadge}>
							<div className={styles.pulseDot} />
							<ShieldCheck size={16} />
							<span>Sui Verified</span>
						</div>
					</div>
				</div>
			</header>

			<main className={styles.mainContent}>
				<div className={styles.topRow}>
					{/* 2. The "Last Clinical Encounter" Card */}
					<section className={styles.encounterSection}>
						<div className={styles.cardHeader}>
							<div className={styles.headerIcon}>
								<Activity size={20} />
							</div>
							<h2>Last Clinical Encounter</h2>
						</div>

						<div className={styles.timelineContent}>
							<div className={styles.timelineItem}>
								<span className={styles.timelineLabel}>Chief Complaint</span>
								<p className={styles.timelineText}>{ENCOUNTER.complaint}</p>
							</div>

							<div className={styles.timelineItem}>
								<span className={styles.timelineLabel}>Clinical Findings</span>
								<ul className={styles.findingsList}>
									{ENCOUNTER.findings.map((f, i) => (
										<li key={i}>{f}</li>
									))}
								</ul>
							</div>

							<div className={styles.timelineItem}>
								<span className={styles.timelineLabel}>Conclusion & Plan</span>
								<div className={styles.conclusionBox}>
									<p>{ENCOUNTER.conclusion}</p>
								</div>
							</div>
						</div>
					</section>

					{/* 4. The "3D Insight" Snapshot */}
					<aside className={styles.insightSection}>
						<div className={styles.snapshotCard}>
							<div className={styles.snapshotHeader}>
								<BrainIcon size={20} />
								<h3>3D System Heatmap</h3>
							</div>
							<div className={styles.modelContainer}>
								{/* Non-interactive 3D Placeholder with Respiratory Heatmap */}
								<div className={styles.modelPlaceholder}>
									<div className={styles.heatmapOverlay}>
										<div
											className={`${styles.heatPoint} ${styles.respiratory}`}
										/>
										<div className={`${styles.heatPoint} ${styles.cardio}`} />
									</div>
									<img
										src='/assets/digital_twin_preview.png'
										alt='Digital Twin Snapshot'
									/>
								</div>
							</div>
							<div className={styles.systemFocus}>
								<p>
									Active Heatmap: <span>Respiratory & Cardio</span>
								</p>
							</div>
						</div>
					</aside>
				</div>

				{/* 3. The "Diagnostics & Labs" Table */}
				<section className={styles.diagnosticsSection}>
					<div className={styles.cardHeader}>
						<div className={styles.headerIcon}>
							<FileText size={20} />
						</div>
						<h2>Diagnostics & Lab Results</h2>
					</div>

					<div className={styles.tableWrapper}>
						<table className={styles.labsTable}>
							<thead>
								<tr>
									<th>Test Name</th>
									<th>Date</th>
									<th>Result</th>
									<th>Status</th>
									<th>Identity Check</th>
								</tr>
							</thead>
							<tbody>
								{LAB_RESULTS.map((lab) => (
									<tr
										key={lab.id}
										className={
											lab.status === "Flagged" ? styles.flaggedRow : ""
										}
									>
										<td className={styles.testNameCell}>
											<span className={styles.testIcon}>
												<Activity size={14} />
											</span>
											{lab.name}
										</td>
										<td>{lab.date}</td>
										<td
											className={
												lab.status === "Flagged" ? styles.flaggedText : ""
											}
										>
											{lab.result}
										</td>
										<td>
											<span
												className={`${styles.statusBadge} ${styles[lab.status.toLowerCase()]}`}
											>
												{lab.status === "Verified" ? (
													<CheckCircle2 size={12} />
												) : (
													<AlertCircle size={12} />
												)}
												{lab.status}
											</span>
										</td>
										<td className={styles.txCell}>
											<code>{lab.txId}</code>
											<ExternalLink size={12} />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			</main>

			{/* 5. Share Status Footer */}
			<footer className={styles.shareFooter}>
				<div className={styles.footerContent}>
					<Clock size={16} />
					<p>
						This view is currently being shared via{" "}
						<strong>Secure QR Link</strong>. Access expires in{" "}
						<span className={styles.timer}>08:42</span>
					</p>
				</div>
				<button className={styles.revokeBtn}>Revoke Access Now</button>
			</footer>
		</div>
	);
};

// Simple Icon fallback for a prototype
const BrainIcon = ({ size }: { size: number }) => (
	<svg
		width={size}
		height={size}
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M9.5 2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1Z' />
		<path d='M14.5 2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1Z' />
		<path d='M21 15v-1a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v1ac2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z' />
		<path d='M7 15v2' />
		<path d='M12 15v2' />
		<path d='M17 15v2' />
	</svg>
);

export default HealthHistory;
