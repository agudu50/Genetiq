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

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	const activeCount = 4 - dismissedIds.length;

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
