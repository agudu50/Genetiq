import styles from "./ConcernsCard.module.scss";
import { Concern } from "../../helpers/concernsMockData";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCategory } from "@/App/Redux/categorySlice";
import { useLanguage } from "@/App/i18n/LanguageContext";
import {
	ChevronRight,
	Globe,
	Coins,
	Brain,
	Heart,
	HelpCircle,
	Sparkles,
} from "lucide-react";

interface ConcernsCardProps {
	concern: Concern;
	backgroundColor?: string;
	onClick?: () => void;
	isLast?: boolean;
	layout?: "list" | "grid";
}

const renderConcernIcon = (iconName: string, size = 18) => {
	const props = { size, strokeWidth: 2.25 as const };
	switch (iconName) {
		case "Globe":
			return <Globe {...props} />;
		case "Financial":
			return <Coins {...props} />;
		case "Brain":
			return <Brain {...props} />;
		case "Heart":
			return <Heart {...props} />;
		default:
			return <HelpCircle {...props} />;
	}
};

export const ConcernsCard: React.FC<ConcernsCardProps> = ({
	concern,
	backgroundColor,
	onClick,
	isLast = false,
	layout = "list",
}) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { t } = useLanguage();

	const getStatusClass = (status: string) => {
		if (status === "High") return styles["status-high"];
		if (status === "Medium") return styles["status-medium"];
		return styles["status-low"];
	};

	const getAccentColor = (status: string) => {
		if (status === "High") return "#ef4444";
		if (status === "Medium") return "#f59e0b";
		return "#10b981";
	};

	const handleClick = () => {
		if (onClick) {
			onClick();
		} else if (concern.link) {
			dispatch(setCategory("cardiovascular"));
			setTimeout(() => {
				navigate(`/dashboard/cardiovascular/${concern.title}`);
			}, 100);
		}
	};

	const visibleFactors = concern.factors.slice(0, 2);
	const hiddenFactorCount = Math.max(0, concern.factors.length - visibleFactors.length);

	if (layout === "grid") {
		return (
			<button
				type="button"
				className={`${styles.gridCard} ${getStatusClass(concern.status)} ${
					backgroundColor === "blue" ? styles.rowStatic : ""
				}`}
				style={
					{ "--concern-accent": getAccentColor(concern.status) } as React.CSSProperties
				}
				onClick={handleClick}
			>
				<div className={styles.gridTop}>
					<span className={styles.iconBox}>{renderConcernIcon(concern.icon)}</span>
					<span className={`${styles.severityBadge} ${getStatusClass(concern.status)}`}>
						{t(concern.status)}
					</span>
				</div>
				<h4 className={styles.gridTitle}>{t(concern.title)}</h4>
				<div className={styles.factorChips}>
					{visibleFactors.map((factor) => (
						<span key={factor} className={styles.factorChip}>
							{t(factor)}
						</span>
					))}
					{hiddenFactorCount > 0 && (
						<span className={styles.factorChipMuted}>
							+{hiddenFactorCount} {t("factors")}
						</span>
					)}
				</div>
			</button>
		);
	}

	return (
		<button
			type="button"
			className={`${styles.row} ${getStatusClass(concern.status)} ${
				isLast ? styles.rowLast : ""
			} ${backgroundColor === "blue" ? styles.rowStatic : ""}`}
			style={
				{ "--concern-accent": getAccentColor(concern.status) } as React.CSSProperties
			}
			onClick={handleClick}
			aria-label={`${t(concern.title)} — ${t(concern.status)} priority. ${t("concerns_view_actions")}`}
		>
			<div className={styles.severityRail} aria-hidden />

			<span className={styles.iconBox} aria-hidden>
				{renderConcernIcon(concern.icon)}
			</span>

			<div className={styles.content}>
				<div className={styles.titleRow}>
					<h4 className={styles.title}>{t(concern.title)}</h4>
					<span className={`${styles.severityBadge} ${getStatusClass(concern.status)}`}>
						{t(concern.status)}
					</span>
				</div>

				<div className={styles.factorChips}>
					{visibleFactors.map((factor) => (
						<span key={factor} className={styles.factorChip}>
							{t(factor)}
						</span>
					))}
					{hiddenFactorCount > 0 && (
						<span className={styles.factorChipMuted}>
							+{hiddenFactorCount} {t("factors")}
						</span>
					)}
				</div>

				<span className={styles.actionHint}>
					{t("concerns_view_actions")}
				</span>
			</div>

			<ChevronRight className={styles.chevron} size={16} strokeWidth={2.25} aria-hidden />
		</button>
	);
};
