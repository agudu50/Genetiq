import styles from "./QuickActions.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";

interface QuickAction {
	id: string;
	label: string;
	icon: React.ReactNode;
	color: string;
	path?: string;
	onClick?: () => void;
}

export const QuickActions = ({
	onToggleChatbot,
}: {
	onToggleChatbot?: () => void;
}) => {
	const { t } = useLanguage();
	const navigate = useNavigate();

	const actions: QuickAction[] = [
		{
			id: "take-quiz",
			label: t("take_quiz") || "Take Quiz",
			color: "#a78bfa", // Vibrant Amethyst Purple
			path: "/config",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2.2'
				>
					<path d='M9 11l3 3L22 4' />
					<path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' />
				</svg>
			),
		},
		{
			id: "log-exercise",
			label: t("log_exercise") || "Log Exercise",
			color: "#3b82f6", // Electric Royal Blue
			path: "/log/exercise",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2.2'
				>
					<path
						d='M6.5 6.5l11 11M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'
						strokeLinecap='round'
					/>
					<path
						d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83'
						strokeLinecap='round'
					/>
				</svg>
			),
		},
		{
			id: "view-reports",
			label: t("view_reports") || "View Reports",
			color: "#06b6d4", // Cyber Cyan/Teal
			path: "/reports",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2.2'
				>
					<path
						d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<polyline
						points='14 2 14 8 20 8'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<line x1='16' y1='13' x2='8' y2='13' strokeLinecap='round' />
					<line x1='16' y1='17' x2='8' y2='17' strokeLinecap='round' />
					<polyline
						points='10 9 9 9 8 9'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			),
		},
		{
			id: "connect-device",
			label: t("connect_device") || "Connect Device",
			color: "#fbbf24", // Amber Gold
			path: "/config/connect-app",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2.2'
				>
					<rect
						x='5'
						y='2'
						width='14'
						height='20'
						rx='2'
						ry='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<line x1='12' y1='18' x2='12.01' y2='18' strokeLinecap='round' />
				</svg>
			),
		},
		{
			id: "specialist-access",
			label: t("specialist_access") || "Specialist Access",
			color: "#ec4899", // Magenta Pink
			path: "/ai-assistant",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2.2'
				>
					<path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
					<circle cx='9' cy='7' r='4' />
					<path d='M23 21v-2a4 4 0 0 0-3-3.87' />
					<path d='M16 3.13a4 4 0 0 1 0 7.75' />
				</svg>
			),
		},
		{
			id: "symptom-triage",
			label: t("ai_assistant") || "AI Assistant",
			color: "#00A69D", // Brand Teal
			onClick: onToggleChatbot,
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2.2'
				>
					<rect x='3' y='11' width='18' height='10' rx='2' />
					<circle cx='12' cy='5' r='2' />
					<path d='M12 7v4M8 15h.01M16 15h.01M9 18h6' />
				</svg>
			),
		},
	];

	const handleAction = (action: QuickAction) => {
		if (action.onClick) {
			action.onClick();
		} else if (action.path) {
			navigate(action.path);
		}
	};

	return (
		<div className={styles.quickActionsContainer}>
			<div className={styles.headerRow}>
				<h3 className={styles.title}>{t("quick_actions") || "Quick Actions"}</h3>
				<div className={styles.telemetryStatus}>
					<span className={styles.pulseBeacon} />
					<span className={styles.telemetryLabel}>Direct Telemetry</span>
				</div>
			</div>
			<div className={styles.actionsGrid}>
				{actions.map((action, index) => (
					<button
						key={action.id}
						className={styles.actionBtn}
						style={
							{
								"--action-color": action.color,
								"animationDelay": `${index * 0.04}s`,
							} as React.CSSProperties
						}
						onClick={() => handleAction(action)}
					>
						<div className={styles.iconWrapper}>{action.icon}</div>
						<span className={styles.label}>{action.label}</span>
					</button>
				))}
			</div>
		</div>
	);
};
