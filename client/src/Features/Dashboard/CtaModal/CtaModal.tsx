import ReactDOM from "react-dom";
import styles from "./CtaModal.module.scss";
import Cross from "@assets/CtaModal/Cross.svg?react";
import Shape from "@assets/CtaModal/Shape.svg?react";
import ChevronHollow from "@assets/CtaModal/ChevronHollow.svg?react";
import { useState } from "react";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";

const CtaModal = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const [isClosed, setIsClosed] = useState(false);

	return ReactDOM.createPortal(
		<div
			className={`${styles["CtaModal-container"]} ${
				isClosed && styles["CtaModal-container-closed"]
			}`}
		>
			<div className={styles["CtaModal-head"]}>
				<div className={styles["CtaModal-head-text"]}>
					<div className={styles["CtaModal-number"]}>6</div>
					<div className={styles["CtaModal-title"]}>
						{t("cta_new_insights")}
					</div>
				</div>
				<div
					className={`${styles["CtaModal-cross-container"]} ${
						isClosed && styles["CtaModal-cross-container-closed"]
					}`}
					onClick={() => setIsClosed(true)}
				>
					<Cross />
				</div>
			</div>
			<div className={styles["CtaModal-body"]}>
				<p className={styles["CtaModal-description"]}>{t("cta_description")}</p>
			</div>
			<button 
				className={styles["CtaModal-button"]}
				onClick={() => navigate(paths.config.tests)}
			>
				<p className={styles["CtaModal-button-text"]}>
					{t("cta_order_dna_test")}
				</p>
			</button>

			<div
				className={`${styles["CtaModal-chevron"]} ${
					isClosed && styles["CtaModal-chevron-closed"]
				}`}
				onClick={() => setIsClosed(false)}
			>
				<ChevronHollow />
			</div>
			<Shape className={styles["CtaModal-shape"]} />
		</div>,
		document.body,
	);
};

export default CtaModal;
