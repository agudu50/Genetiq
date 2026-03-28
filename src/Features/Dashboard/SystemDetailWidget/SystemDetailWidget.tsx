import styles from "./SystemDetailWidget.module.scss";
import Report from "@assets/SystemDetailWidget/Report.svg?react";
import { systemDetailMockData } from "./helpers/systemDetailMockData";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { useLanguage } from "@/App/i18n/LanguageContext";

interface SystemDetailWidgetProps {
	category: string;
}

export const SystemDetailWidget: React.FC<SystemDetailWidgetProps> = ({
	category,
}) => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const [detail, setDetail] = useState({
		title: "",
		description: t("no_details"),
	});

	const selectedCategory = useSelector(
		(state: RootState) => state.category.selectedCategory,
	);

	useEffect(() => {
		if (category !== "total") {
			// Find matching data or default
			const found =
				systemDetailMockData.find((d) => String(d.id) === category) ||
				systemDetailMockData[0];
			setDetail(found);
		} else {
			setDetail({
				title: "Total Health Overview",
				description:
					"View a comprehensive synthesis of all system metrics and overall wellbeing scores.",
			});
		}
	}, [category, t]);

	const ViewReport = () => {
		navigate(`/dashboard/${selectedCategory}`);
	};

	return (
		<div
			className={`${styles["SystemDetailWidget-container"]} ${category === "total" && styles["SystemDetailWidget-container-hidden"]}`}
		>
			<div className={styles["SystemDetailWidget-head"]}>
				<h3 className={styles["SystemDetailWidget-title"]}>{detail.title}</h3>
				<div className={styles["SystemDetailWidget-report"]}>
					<button
						className={styles["SystemDetailWidget-report-text"]}
						onClick={ViewReport}
					>
						{t("view_report")}
						<Report />
					</button>
				</div>
			</div>
			<p className={styles["SystemDetailWidget-body"]}>{detail.description}</p>
		</div>
	);
};
