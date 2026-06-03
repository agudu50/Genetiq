import { useState, useEffect, useCallback, useMemo } from "react";
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
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { paths } from "@/App/Routes/Paths";
import styles from "./HealthHistoryWidget.module.scss";

// Relative time formatting utility
const formatRelativeTime = (isoString: string) => {
	try {
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		
		if (diffMs < 30000) return "Just now";
		
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 60) {
			return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
		}
		
		const diffHours = Math.floor(diffMs / 3600000);
		if (diffHours < 24) {
			return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
		}
		
		const diffDays = Math.floor(diffMs / 86400000);
		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) {
			return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
		}
		
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch (e) {
		return "Recent";
	}
};

const now = new Date();

const DEFAULT_MOCK_ITEMS = [
	{
		id: "mock-1",
		type: "Lab Results",
		title: "Blood Marker Analysis",
		date: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
		status: "Verified",
		icon: "beaker",
		color: "#a855f7",
	},
	{
		id: "mock-2",
		type: "AI Insights",
		title: "Inflammation Risk Alert",
		date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
		status: "Review Needed",
		icon: "brain",
		color: "#f59e0b",
	},
	{
		id: "mock-3",
		type: "Clinical",
		title: "Doctor Access Granted",
		date: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
		status: "Active",
		icon: "shield",
		color: "#10b981",
	},
	{
		id: "mock-4",
		type: "Wearables",
		title: "Telehealth Vitals Sync",
		date: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(), // 4 days ago
		status: "Stable",
		icon: "activity",
		color: "#34d399",
	},
];

export const HealthHistoryWidget = () => {
	const navigate = useNavigate();
	const [showQR, setShowQR] = useState(false);
	const [quizHistory, setQuizHistory] = useState<any[]>([]);

	// Read PDF upload records from Redux state
	const uploadRecords = useSelector((state: RootState) => state.uploadHistory.records);

	const loadQuizHistory = useCallback(() => {
		try {
			const saved = localStorage.getItem("genetiq_quiz_history");
			if (saved) {
				setQuizHistory(JSON.parse(saved));
			}
		} catch (e) {
			console.error("Failed to read quiz history from localStorage", e);
		}
	}, []);

	useEffect(() => {
		loadQuizHistory();
		window.addEventListener("genetiq_history_updated", loadQuizHistory);
		return () => {
			window.removeEventListener("genetiq_history_updated", loadQuizHistory);
		};
	}, [loadQuizHistory]);

	// Map upload records from Redux
	const mappedUploads = useMemo(() => {
		return uploadRecords.map((rec) => ({
			id: rec.id,
			type: "Lab Results",
			title: rec.fileName || "Blood Marker Analysis",
			date: rec.uploadedAt,
			status: "Verified",
			icon: "beaker",
			color: "#a855f7",
		}));
	}, [uploadRecords]);

	// Combine upload history, quiz history, and fallback mocks
	const combinedItems = useMemo(() => {
		const mappedQuizzes = quizHistory.map((q) => ({
			id: q.id,
			type: "AI Insights",
			title: q.title,
			date: q.date,
			status: q.status || "Completed",
			icon: "brain",
			color: q.color || "#8b5cf6",
		}));

		const realItems = [...mappedUploads, ...mappedQuizzes];
		
		// Sort real items newest first
		realItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		
		// Combine with mock items
		const allItems = [...realItems, ...DEFAULT_MOCK_ITEMS];
		
		// Sort everything newest first
		allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		
		// Limit to top 4 items for display
		return allItems.slice(0, 4);
	}, [mappedUploads, quizHistory]);

	const renderIcon = (iconName: string) => {
		switch (iconName) {
			case "beaker":
				return <Beaker size={18} />;
			case "brain":
				return <Brain size={18} />;
			case "shield":
				return <ShieldCheck size={18} />;
			case "activity":
				return <Activity size={18} />;
			default:
				return <Activity size={18} />;
		}
	};

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
				{combinedItems.map((item, i) => (
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
							{renderIcon(item.icon)}
						</div>
						<div className={styles.content}>
							<div className={styles.row}>
								<span className={styles.itemType}>{item.type}</span>
								<span className={styles.itemDate}>{formatRelativeTime(item.date)}</span>
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
