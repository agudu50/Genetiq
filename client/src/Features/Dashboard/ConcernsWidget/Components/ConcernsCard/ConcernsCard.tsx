import styles from "./ConcernsCard.module.scss";
import { Concern } from "../../helpers/concernsMockData";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCategory } from "@/App/Redux/categorySlice";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { ChevronRight } from "lucide-react";

interface ConcernsCardProps {
	concern: Concern;
	backgroundColor?: string;
	onClick?: () => void;
	isLast?: boolean;
	layout?: "list" | "grid";
}

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
				<span className={`${styles.severityLabel} ${getStatusClass(concern.status)}`}>
					{t(concern.status)}
				</span>
				<h4 className={styles.gridTitle}>{t(concern.title)}</h4>
				<p className={styles.factors}>
					<span className={styles.factorPrimary}>{t(concern.factors[0])}</span>
					{concern.factors.length > 1 && (
						<span className={styles.factorExtra}>
							+{concern.factors.length - 1} {t("factors")}
						</span>
					)}
				</p>
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
		>
			<div className={styles.severityRail} aria-hidden />

			<div className={styles.content}>
				<div className={styles.topLine}>
					<span className={`${styles.severityLabel} ${getStatusClass(concern.status)}`}>
						{t(concern.status)}
					</span>
					<h4 className={styles.title}>{t(concern.title)}</h4>
				</div>
				<p className={styles.factors}>
					<span className={styles.factorPrimary}>{t(concern.factors[0])}</span>
					{concern.factors.length > 1 && (
						<span className={styles.factorExtra}>
							+{concern.factors.length - 1} {t("factors")}
						</span>
					)}
				</p>
			</div>

			<ChevronRight className={styles.chevron} size={16} strokeWidth={2.25} aria-hidden />
		</button>
	);
};
