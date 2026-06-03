import styles from "./ConcernsCard.module.scss";
import { Concern } from "../../helpers/concernsMockData";
import Question from "@assets/ConcernsWidget/Question.svg?react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCategory } from "@/App/Redux/categorySlice";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { Globe, Coins, Brain as BrainIcon, Heart as HeartIcon, HelpCircle } from "lucide-react";

interface ConcernsCardProps {
	concern: Concern;
	backgroundColor?: string;
	onClick?: () => void;
}

export const ConcernsCard: React.FC<ConcernsCardProps> = ({
	concern,
	backgroundColor,
	onClick,
}) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { t } = useLanguage();

	const renderConcernIcon = (iconName: string) => {
		switch (iconName) {
			case "Globe":
				return <Globe size={18} strokeWidth={2.5} />;
			case "Financial":
				return <Coins size={18} strokeWidth={2.5} />;
			case "Brain":
				return <BrainIcon size={18} strokeWidth={2.5} />;
			case "Heart":
				return <HeartIcon size={18} strokeWidth={2.5} />;
			default:
				return <HelpCircle size={18} strokeWidth={2.5} />;
		}
	};

	const getStatusClass = (status: string) => {
		if (status === "High") return styles["status-high"];
		if (status === "Medium") return styles["status-medium"];
		return styles["status-low"];
	};

	const getAccentColor = (status: string) => {
		if (status === "High") return "#ef4444"; // Red
		if (status === "Medium") return "#f59e0b"; // Orange/Amber
		return "#10b981"; // Green/Emerald
	};

	const handleClick = (concernName: string) => {
		if (onClick) {
			onClick();
		} else {
			dispatch(setCategory("cardiovascular"));
			setTimeout(() => {
				navigate(`/dashboard/cardiovascular/${concernName}`);
			}, 100);
		}
	};

	return (
		<div
			className={`${styles["ConcernsCard-card"]} ${
				concern.link ? styles["ConcernsCard-card-link"] : ""
			} ${backgroundColor === "blue" ? styles["ConcernsCard-card-blue"] : ""} ${
				concern.status === "High" ? styles["ConcernsCard-card-high"] : ""
			} ${concern.status === "Medium" ? styles["ConcernsCard-card-medium"] : ""}`}
			style={{ "--concern-accent": getAccentColor(concern.status) } as React.CSSProperties}
			onClick={() => handleClick(concern.title)}
		>
			{/* High fidelity card mesh overlay */}
			<div className={styles["cardMeshBg"]} />

			<div className={styles["ConcernsCard-head"]}>
				<div className={styles["ConcernsCard-icon-container"]}>
					{renderConcernIcon(concern.icon)}
				</div>
				<div className={`${styles["ConcernsCard-status"]} ${getStatusClass(concern.status)}`}>
					<div className={styles["ConcernsCard-status-exclamation"]}>!</div>
					<div className={styles["ConcernsCard-status-text"]}>
						{t(concern.status)}
					</div>
				</div>
			</div>
			<div className={styles["ConcernsCard-body"]}>
				<div className={styles["ConcernsCard-body-title"]}>
					{t(concern.title)}
				</div>
				<div className={styles["ConcernsCard-body-description"]}>
					<span className={`${styles["ConcernsCard-highlight"]} ${getStatusClass(concern.status)}`}>
						{t(concern.factors[0])}
					</span>
					{concern.factors.length > 1 && (
						<span className={styles["ConcernsCard-extra-factors"]}>
							+{concern.factors.length - 1} {t("factors")}
						</span>
					)}
				</div>
			</div>
			{concern.link && (
				<div className={styles["DetailsCard-question-container"]}>
					<Question className={styles["DetailsCard-question"]} />
				</div>
			)}
		</div>
	);
};
