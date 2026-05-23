import styles from "./ManageData.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";

const ManageData = () => {
	const { t } = useLanguage();
	return (
		<button
			className={styles["manage-btn"]}
			title={t("manage_data") || "Manage Data"}
		>
			<svg
				width='18'
				height='18'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<path d='M12 5v14' />
				<path d='M5 12h14' />
			</svg>
			<span className={styles["manage-label"]}>
				{t("manage_data") || "Manage Data"}
			</span>
		</button>
	);
};

export default ManageData;
