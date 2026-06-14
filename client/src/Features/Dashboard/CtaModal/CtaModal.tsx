import ReactDOM from "react-dom";
import { useState } from "react";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";
import Cross from "@assets/CtaModal/Cross.svg?react";
import ChevronHollow from "@assets/CtaModal/ChevronHollow.svg?react";
import styles from "./CtaModal.module.scss";

const CtaModal = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const [isClosed, setIsClosed] = useState(false);

	return ReactDOM.createPortal(
		<div
			className={`${styles.container} ${isClosed ? styles.containerClosed : ""}`}
		>
			<div className={styles.header}>
				<div className={styles.headline}>
					<span className={styles.count}>6</span>
					<h3 className={styles.title}>{t("cta_new_insights")}</h3>
				</div>
				<button
					type="button"
					className={styles.closeBtn}
					onClick={() => setIsClosed(true)}
					aria-label="Dismiss"
				>
					<Cross />
				</button>
			</div>

			<p className={styles.description}>{t("cta_description")}</p>

			<button
				type="button"
				className={styles.ctaBtn}
				onClick={() => navigate(paths.config.tests)}
			>
				{t("cta_order_dna_test")}
			</button>

			<button
				type="button"
				className={`${styles.reopenTab} ${isClosed ? styles.reopenTabVisible : ""}`}
				onClick={() => setIsClosed(false)}
				aria-label="Show insights"
			>
				<ChevronHollow />
			</button>
		</div>,
		document.body,
	);
};

export default CtaModal;
