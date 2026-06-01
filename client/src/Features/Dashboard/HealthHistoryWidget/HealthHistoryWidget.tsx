import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Activity,
	Beaker,
	Brain,
	Clipboard,
	ShieldCheck,
	QrCode,
	X,
	Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";
import styles from "./HealthHistoryWidget.module.scss";

const HISTORY_ITEMS = [
	{
		id: 1,
		type: "Lab Results",
		title: "Blood Marker Analysis",
		date: "2 hours ago",
		status: "Verified",
		icon: <Beaker size={18} />,
		color: "#a855f7",
	},
	{
		id: 2,
		type: "AI Insights",
		title: "Inflammation Risk Alert",
		date: "Yesterday",
		status: "Review Needed",
		icon: <Brain size={18} />,
		color: "#f59e0b",
	},
	{
		id: 3,
		type: "Clinical",
		title: "Doctor Access Granted",
		date: "Mar 21, 2026",
		status: "Active",
		icon: <ShieldCheck size={18} />,
		color: "#10b981",
	},
	{
		id: 4,
		type: "Wearables",
		title: "Telehealth Vitals Sync",
		date: "Mar 20, 2026",
		status: "Stable",
		icon: <Activity size={18} />,
		color: "#34d399",
	},
];

export const HealthHistoryWidget = () => {
	const navigate = useNavigate();
	const [showQR, setShowQR] = useState(false);

	return (
		<div className={styles.container}>
			{/* High-fidelity background mesh and drifts */}
			<div className={styles["cardMeshBg"]} />
			<div className={styles["cardGlowBlob"]} />

			<div className={styles.header}>
				<div className={styles.titleGroup}>
					<Clipboard className={styles.titleIcon} size={20} />
					<h3 className={styles.title}>Clinical History</h3>
				</div>
				<div className={styles.headerActions}>
					<button
						className={styles.handoverBtn}
						onClick={() => setShowQR(true)}
					>
						<QrCode size={14} /> Clinical Handover
					</button>
					<button
						className={styles.viewAll}
						onClick={() => navigate(paths.clinicalHistory)}
					>
						View All
					</button>
				</div>
			</div>

			<div className={styles.timeline}>
				{HISTORY_ITEMS.map((item, i) => (
					<motion.div
						key={item.id}
						className={styles.historyItem}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: i * 0.1 }}
					>
						<div
							className={styles.iconContainer}
							style={{ "--accent-color": item.color } as React.CSSProperties}
						>
							{item.icon}
						</div>
						<div className={styles.content}>
							<div className={styles.row}>
								<span className={styles.itemType}>{item.type}</span>
								<span className={styles.itemDate}>{item.date}</span>
							</div>
							<h4 className={styles.itemTitle}>{item.title}</h4>
							<div className={styles.statusRow}>
								<span
									className={styles.statusBadge}
									style={
										{ "--status-color": item.color } as React.CSSProperties
									}
								>
									<span className={styles["status-dot"]} style={{ "--dot-color": item.color } as React.CSSProperties} />
									{item.status}
								</span>
							</div>
						</div>
					</motion.div>
				))}
			</div>

			<AnimatePresence>
				{showQR && (
					<motion.div
						className={styles.modalOverlay}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setShowQR(false)}
					>
						<motion.div
							className={styles.qrModal}
							initial={{ scale: 0.9, y: 20 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.9, y: 20 }}
							onClick={(e) => e.stopPropagation()}
						>
							<div className={styles.modalHeader}>
								<h3>Clinical Handover</h3>
								<button onClick={() => setShowQR(false)}>
									<X size={20} />
								</button>
							</div>
							<div className={styles.qrContent}>
								<div className={styles.qrPlaceholder}>
									<QrCode size={160} strokeWidth={1.5} color='#a855f7' />
									<div className={styles.qrScanLine} />
								</div>
								<p className={styles.qrInstructions}>
									Have your healthcare provider scan this code to grant
									<strong> temporary read-only access</strong> to your encrypted
									health records in your local secure enclave.
								</p>
								<div className={styles.accessLevel}>
									<ShieldCheck size={16} />
									<span>Level 2: Comprehensive Background Access</span>
								</div>
							</div>
							<div className={styles.modalFooter}>
								<button className={styles.btnShare}>
									<Share2 size={18} /> Share Secure Link
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
