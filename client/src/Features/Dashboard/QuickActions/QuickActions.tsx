import styles from "./QuickActions.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import {
	ClipboardCheck,
	Activity,
	FileText,
	Smartphone,
	UserCheck,
	Target,
	Bot,
	Zap,
	ArrowRight,
	Radio,
} from "lucide-react";

interface QuickAction {
	id: string;
	label: string;
	icon: React.ReactNode;
	color: string;
	path?: string;
	onClick?: () => void;
	featured?: boolean;
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
			color: "#8b5cf6",
			path: "/config",
			icon: <ClipboardCheck size={18} strokeWidth={2.2} />,
		},
		{
			id: "log-exercise",
			label: t("log_exercise") || "Log Exercise",
			color: "#38bdf8",
			path: "/log/exercise",
			icon: <Activity size={18} strokeWidth={2.2} />,
		},
		{
			id: "view-reports",
			label: t("view_reports") || "View Reports",
			color: "#06b6d4",
			path: "/reports",
			icon: <FileText size={18} strokeWidth={2.2} />,
		},
		{
			id: "connect-device",
			label: t("connect_device") || "Connect Device",
			color: "#f59e0b",
			path: "/config/connect-app",
			icon: <Smartphone size={18} strokeWidth={2.2} />,
		},
		{
			id: "ask-doctor",
			label: "Ask Doctor",
			color: "#ec4899",
			path: "/ai-assistant",
			icon: <UserCheck size={18} strokeWidth={2.2} />,
		},
		{
			id: "health-goals",
			label: t("goals_nav") || "Health Goals",
			color: "#10b981",
			path: "/goals",
			icon: <Target size={18} strokeWidth={2.2} />,
		},
		{
			id: "symptom-triage",
			label: t("ai_assistant") || "AI Assistant",
			color: "#10b981",
			onClick: onToggleChatbot,
			featured: true,
			icon: <Bot size={19} strokeWidth={2.2} />,
		},
	];

	const handleAction = (action: QuickAction) => {
		if (action.onClick) {
			action.onClick();
		} else if (action.path) {
			navigate(action.path);
		}
	};

	const gridActions = actions.filter((a) => !a.featured);
	const featuredAction = actions.find((a) => a.featured);

	return (
		<div className={styles.container}>
			<div className={styles.inner}>
				{/* Top Header */}
				<div className={styles.header}>
					<div className={styles.headerTop}>
						<div className={styles.titleGroup}>
							<div className={styles.iconBadge}>
								<Zap size={15} strokeWidth={2.4} />
							</div>
							<h3 className={styles.title}>
								{t("quick_actions") || "Quick Actions"}
							</h3>
						</div>

						<div className={styles.telemetryStatus}>
							<span className={styles.pulseBeacon} />
							<Radio size={11} strokeWidth={2.5} />
							<span className={styles.telemetryLabel}>
								{t("direct_telemetry") || "Direct Telemetry"}
							</span>
						</div>
					</div>
				</div>

				{/* Action Tiles Grid */}
				<div className={styles.actionsGrid}>
					{gridActions.map((action) => (
						<button
							key={action.id}
							type="button"
							className={styles.actionBtn}
							style={{ "--action-color": action.color } as React.CSSProperties}
							onClick={() => handleAction(action)}
						>
							<div className={styles.actionIconBox}>{action.icon}</div>
							<span className={styles.label}>{action.label}</span>
						</button>
					))}
				</div>

				{/* Featured AI Assistant Card */}
				{featuredAction && (
					<button
						type="button"
						className={styles.featuredBtn}
						onClick={() => handleAction(featuredAction)}
					>
						<div className={styles.featuredLeft}>
							<div className={styles.featuredIconWrap}>
								<Bot size={19} strokeWidth={2.2} />
							</div>
							<div className={styles.featuredCopy}>
								<span className={styles.featuredLabel}>
									{featuredAction.label}
								</span>
								<span className={styles.featuredHint}>
									{t("ai_assistant_hint") || "Ask about symptoms & care"}
								</span>
							</div>
						</div>

						<ArrowRight
							size={16}
							className={styles.featuredArrow}
							strokeWidth={2.5}
						/>
					</button>
				)}
			</div>
		</div>
	);
};
