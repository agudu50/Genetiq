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

export const QuickActions = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();

	const actions: QuickAction[] = [
		{
			id: "take-quiz",
			label: t("take_quiz") || "Take Quiz",
			color: "#6366f1",
			path: "/config",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
				>
					<path d='M9 11l3 3L22 4' />
					<path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' />
				</svg>
			),
		},
		{
			id: "care-navigator",
			label: t("care_navigator") || "Care Navigator",
			color: "#8b5cf6",
			path: "/ai-assistant",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
				>
					<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
					<circle cx='12' cy='11' r='3' />
				</svg>
			),
		},
		{
			id: "log-vitals",
			label: t("log_vitals") || "Log Vitals",
			color: "#ef4444",
			path: "/log/vitals",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
				>
					<path
						d='M22 12h-4l-3 9L9 3l-3 9H2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			),
		},
		{
			id: "track-meal",
			label: t("track_meal") || "Track Meal",
			color: "#10b981",
			path: "/log/meal",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
				>
					<path
						d='M18 8h1a4 4 0 0 1 0 8h-1M8 8H7a4 4 0 0 0 0 8h1M8 8l3-4M16 8l-3-4M8 8v8M16 8v8M12 8v8'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			),
		},
		{
			id: "log-exercise",
			label: t("log_exercise") || "Log Exercise",
			color: "#3b82f6",
			path: "/log/exercise",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
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
			color: "#8b5cf6",
			path: "/reports",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
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
			color: "#f59e0b",
			path: "/config/connect-app",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
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
			color: "#667eea",
			path: "/ai-assistant",
			icon: (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
				>
					<path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
					<circle cx='9' cy='7' r='4' />
					<path d='M23 21v-2a4 4 0 0 0-3-3.87' />
					<path d='M16 3.13a4 4 0 0 1 0 7.75' />
				</svg>
			),
		},
	];

	const handleAction = (action: QuickAction) => {
		if (action.path) {
			navigate(action.path);
		} else if (action.onClick) {
			action.onClick();
		}
	};

	return (
		<div className={styles.quickActionsContainer}>
			<h3 className={styles.title}>{t("quick_actions") || "Quick Actions"}</h3>
			<div className={styles.actionsGrid}>
				{actions.map((action, index) => (
					<button
						key={action.id}
						className={styles.actionBtn}
						style={
							{
								"--action-color": action.color,
								"animationDelay": `${index * 0.05}s`,
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
