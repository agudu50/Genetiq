import styles from "./QuickActions.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import {
	ClipboardCheck,
	Activity,
	FileText,
	Smartphone,
	Users,
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
			color: "#a78bfa",
			path: "/config",
			icon: <ClipboardCheck size={17} strokeWidth={2.25} />,
		},
		{
			id: "log-exercise",
			label: t("log_exercise") || "Log Exercise",
			color: "#3b82f6",
			path: "/log/exercise",
			icon: <Activity size={17} strokeWidth={2.25} />,
		},
		{
			id: "view-reports",
			label: t("view_reports") || "View Reports",
			color: "#06b6d4",
			path: "/reports",
			icon: <FileText size={17} strokeWidth={2.25} />,
		},
		{
			id: "connect-device",
			label: t("connect_device") || "Connect Device",
			color: "#f59e0b",
			path: "/config/connect-app",
			icon: <Smartphone size={17} strokeWidth={2.25} />,
		},
		{
			id: "specialist-access",
			label: t("specialist_access") || "Specialist Access",
			color: "#ec4899",
			path: "/ai-assistant",
			icon: <Users size={17} strokeWidth={2.25} />,
		},
		{
			id: "symptom-triage",
			label: t("ai_assistant") || "AI Assistant",
			color: "#00a69d",
			onClick: onToggleChatbot,
			featured: true,
			icon: <Bot size={18} strokeWidth={2.25} />,
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
			<div className={styles.heroBg} aria-hidden />
			<div className={styles.heroMesh} aria-hidden />
			<div className={styles.heroGlow} aria-hidden />

			<div className={styles.inner}>
				<div className={styles.header}>
					<div className={styles.headerTop}>
						<span className={styles.eyebrow}>
							<Zap size={12} strokeWidth={2.5} />
							{t("quick_actions_short") || "Shortcuts"}
						</span>
						<div className={styles.telemetryStatus}>
							<span className={styles.pulseBeacon} />
							<Radio size={11} strokeWidth={2.5} />
							<span className={styles.telemetryLabel}>
								{t("direct_telemetry") || "Direct Telemetry"}
							</span>
						</div>
					</div>
					<h3 className={styles.title}>{t("quick_actions") || "Quick Actions"}</h3>
				</div>

				<div className={styles.actionsGrid}>
					{gridActions.map((action) => (
						<button
							key={action.id}
							type="button"
							className={styles.actionBtn}
							style={{ "--action-color": action.color } as React.CSSProperties}
							onClick={() => handleAction(action)}
						>
							<span className={styles.iconWrapper}>{action.icon}</span>
							<span className={styles.label}>{action.label}</span>
							<ArrowRight size={14} className={styles.actionArrow} strokeWidth={2.25} />
						</button>
					))}
				</div>

				{featuredAction && (
					<button
						type="button"
						className={styles.featuredBtn}
						style={
							{ "--action-color": featuredAction.color } as React.CSSProperties
						}
						onClick={() => handleAction(featuredAction)}
					>
						<span className={styles.featuredIcon}>{featuredAction.icon}</span>
						<span className={styles.featuredCopy}>
							<span className={styles.featuredLabel}>{featuredAction.label}</span>
							<span className={styles.featuredHint}>
								{t("ai_assistant_hint") || "Ask about symptoms & care"}
							</span>
						</span>
						<ArrowRight size={16} className={styles.featuredArrow} strokeWidth={2.5} />
					</button>
				)}
			</div>
		</div>
	);
};
