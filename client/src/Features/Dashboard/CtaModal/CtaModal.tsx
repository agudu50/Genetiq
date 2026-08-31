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
			<div className={styles.inner}>
				{/* Header */}
				<div className={styles.header}>
					<div className={styles.headline}>
						<div className={styles.countBadge}>
							<span className={styles.count}>6</span>
						</div>
						<div className={styles.titleGroup}>
							<p className={styles.label}>Health Insights</p>
							<h3 className={styles.title}>{t("cta_new_insights")}</h3>
						</div>
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

				<div className={styles.divider} />

				{/* Description */}
				<p className={styles.description}>{t("cta_description")}</p>

				{/* CTA Button */}
				<button
					type="button"
					className={styles.ctaBtn}
					onClick={() => navigate(paths.config.tests)}
				>
					<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path d="M12 2L12 12M12 12L8 8M12 12L16 8" strokeLinecap="round" strokeLinejoin="round" />
						<path d="M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4" strokeLinecap="round" />
					</svg>
					{t("cta_order_dna_test")}
				</button>
			</div>

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
