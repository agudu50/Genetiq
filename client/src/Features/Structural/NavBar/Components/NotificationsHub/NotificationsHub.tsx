import { useState, useRef, useEffect } from "react";
import styles from "./NotificationHub.module.scss";
import { HealthInsights } from "@/Features/Dashboard/HealthInsights/HealthInsights";

interface NotificationHubProps {
	IsBadge: boolean;
	disabled?: boolean;
}

const NotificationHub: React.FC<NotificationHubProps> = ({
	IsBadge = false,
	disabled = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [dismissedIds, setDismissedIds] = useState<number[]>([]);
	const ref = useRef<HTMLDivElement>(null);
	
	// Live tracking of Tests page seeds for badge counting
	const [unreadTips, setUnreadTips] = useState(false);
	const [uncompleteExam, setUncompleteExam] = useState(false);

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	useEffect(() => {
		const checkSeeds = () => {
			const today = new Date();
			const currentSeed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
			
			const tipsReadSeed = localStorage.getItem("genetiq_tips_read_seed");
			const examCompletedSeed = localStorage.getItem("genetiq_exam_completed_seed");
			
			setUnreadTips(tipsReadSeed !== String(currentSeed));
			setUncompleteExam(examCompletedSeed !== String(currentSeed));
		};

		// Check on mount
		checkSeeds();
		
		// Listener for dynamic badge decrements/increments
		window.addEventListener("genetiq_tips_read", checkSeeds);
		window.addEventListener("storage", checkSeeds);
		
		return () => {
			window.removeEventListener("genetiq_tips_read", checkSeeds);
			window.removeEventListener("storage", checkSeeds);
		};
	}, []);

	// Determine overall active unread notification count
	let totalCount = 4;
	if (unreadTips && !dismissedIds.includes(101)) totalCount += 1;
	if (uncompleteExam && !dismissedIds.includes(102)) totalCount += 1;

	const dismissedStatic = dismissedIds.filter(id => id <= 4).length;
	const activeCount = totalCount - dismissedStatic;

	const handleDismiss = (id: number) => {
		setDismissedIds((prev) => [...prev, id]);
	};

	return (
		<div className={styles["notification-wrapper"]} ref={ref}>
			<button
				className={`${styles["notification-button"]} ${isOpen ? styles["active"] : ""}`}
				onClick={() => setIsOpen(!isOpen)}
				disabled={disabled}
				aria-label='Notifications'
			>
				{IsBadge && activeCount > 0 ? (
					<div className={styles["badge-number"]}>
						{activeCount}
					</div>
				) : null}
				<svg
					width='18'
					height='18'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='1.8'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
					<path d='M13.73 21a2 2 0 0 1-3.46 0' />
				</svg>
			</button>

			{isOpen && (
				<div className={styles["notification-dropdown"]}>
					<HealthInsights 
						dismissedIds={dismissedIds}
						onDismiss={handleDismiss}
					/>
				</div>
			)}
		</div>
	);
};

export default NotificationHub;
