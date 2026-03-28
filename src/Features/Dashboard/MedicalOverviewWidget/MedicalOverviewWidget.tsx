import { useState } from "react";
import styles from "./MedicalOverviewWidget.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/App/i18n/LanguageContext";

type Tab = "conditions" | "medications" | "symptoms";

export const MedicalOverviewWidget = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.user);
	const [activeTab, setActiveTab] = useState<Tab>("conditions");

	const tabs: { key: Tab; label: string; count: number }[] = [
		{
			key: "conditions",
			label: t("conditions") || "Conditions",
			count: user.medicalConditions.length,
		},
		{
			key: "medications",
			label: t("medications") || "Medications",
			count: user.medications.filter((m) => m.name).length,
		},
		{
			key: "symptoms",
			label: t("symptoms") || "Symptoms",
			count: user.symptoms.length,
		},
	];

	const conditionColors: Record<string, string> = {
		"Diabetes": "#f59e0b",
		"Hypertension": "#ef4444",
		"Asthma": "#3b82f6",
		"Heart Disease": "#ec4899",
		"Other": "#8b5cf6",
	};

	const hasAnyData =
		user.medicalConditions.length > 0 ||
		user.medications.some((m) => m.name) ||
		user.symptoms.length > 0;

	return (
		<div className={styles.medicalWidget}>
			<div className={styles.header}>
				<h3 className={styles.title}>
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
						<path d='M22 12h-4l-3 9L9 3l-3 9H2' />
					</svg>
					{t("medical_overview") || "Medical Overview"}
				</h3>
			</div>

			<div className={styles.tabBar}>
				{tabs.map((tab) => (
					<button
						key={tab.key}
						className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ""}`}
						onClick={() => setActiveTab(tab.key)}
					>
						{tab.label}
						{tab.count > 0 && (
							<span className={styles.tabCount}>{tab.count}</span>
						)}
					</button>
				))}
			</div>

			<div className={styles.tabContent}>
				{activeTab === "conditions" && (
					<div className={styles.conditionsGrid}>
						{user.medicalConditions.length > 0 ? (
							user.medicalConditions.map((cond) => (
								<div
									key={cond}
									className={styles.conditionPill}
									style={
										{
											"--pill-color": conditionColors[cond] || "#8b5cf6",
										} as React.CSSProperties
									}
								>
									<span className={styles.pillDot} />
									{cond}
								</div>
							))
						) : (
							<EmptyTabState
								text={t("no_conditions") || "No conditions recorded"}
								onImport={() => navigate("/config/import")}
							/>
						)}
					</div>
				)}

				{activeTab === "medications" && (
					<div className={styles.medList}>
						{user.medications.filter((m) => m.name).length > 0 ? (
							user.medications
								.filter((m) => m.name)
								.map((med, i) => (
									<div key={i} className={styles.medItem}>
										<div className={styles.medIcon}>
											<svg
												width='16'
												height='16'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<path d='m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z' />
												<path d='m8.5 8.5 7 7' />
											</svg>
										</div>
										<div className={styles.medInfo}>
											<span className={styles.medName}>{med.name}</span>
											<span className={styles.medDetails}>
												{med.dosage && `${med.dosage}`}
												{med.frequency && ` · ${med.frequency}`}
											</span>
										</div>
									</div>
								))
						) : (
							<EmptyTabState
								text={t("no_medications") || "No medications recorded"}
								onImport={() => navigate("/config/import")}
							/>
						)}
					</div>
				)}

				{activeTab === "symptoms" && (
					<div className={styles.symptomsGrid}>
						{user.symptoms.length > 0 ? (
							user.symptoms.map((sym) => (
								<div key={sym} className={styles.symptomChip}>
									<svg
										width='14'
										height='14'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<circle cx='12' cy='12' r='10' />
										<path d='M12 8v4M12 16h.01' />
									</svg>
									{sym}
								</div>
							))
						) : (
							<EmptyTabState
								text={t("no_symptoms") || "No symptoms recorded"}
								onImport={() => navigate("/config/import")}
							/>
						)}
					</div>
				)}
			</div>

			{!hasAnyData && (
				<div className={styles.globalEmpty}>
					<button
						className={styles.importBtn}
						onClick={() => navigate("/config/import")}
					>
						{t("import_health_data") || "Import Health Data"}
					</button>
				</div>
			)}
		</div>
	);
};

const EmptyTabState = ({
	text,
	onImport,
}: {
	text: string;
	onImport: () => void;
}) => (
	<div className={styles.emptyTab}>
		<p>{text}</p>
		<button className={styles.emptyImportBtn} onClick={onImport}>
			Add Data
		</button>
	</div>
);
