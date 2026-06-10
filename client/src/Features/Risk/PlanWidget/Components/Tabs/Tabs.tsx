import styles from "./Tabs.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";

type Section = {
	title: string;
};

type TabsProps = {
	sections: Section[];
	activeTab: string;
	setActiveTab: (title: string) => void;
	backgroundColor?: string;
};

export const Tabs = ({
	sections,
	activeTab,
	setActiveTab,
	backgroundColor = "",
}: TabsProps) => {
	const { t } = useLanguage();

	return (
		<div className={`${styles.tabsWrapper}`}>
			<div
				className={`${styles.tabsContainer} ${backgroundColor === "blue" ? styles.blue : ""}`}
			>
				{sections.map((section, index) => (
					<button
						key={index}
						className={`${styles.tabBtn} ${activeTab === section.title ? styles.active : ""}`}
						onClick={() => setActiveTab(section.title)}
					>
						{t(section.title)}
					</button>
				))}
			</div>
		</div>
	);
};
