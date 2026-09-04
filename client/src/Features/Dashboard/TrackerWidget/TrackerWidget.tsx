import { useMemo } from "react";
import { ProgressBar } from "./Components/ProgressBar/ProgressBar";
import styles from "./TrackerWidget.module.scss";
import Logo from "@assets/TrackerWidget/logo.svg?react";
import { useLanguage } from "@/App/i18n/LanguageContext";
import dashboardData from "@/App/Data/dashboard_data.json";

import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";

const simplifyMarkerTerm = (term: string): string => {
	if (!term) return "Cholesterol";
	const lower = term.toLowerCase().trim();

	// Lymphocytes
	if (lower === "l sy" || lower === "lsy" || lower.includes("lymph")) {
		return "Immune Cells";
	}
	// Monocytes
	if (lower.includes("monocyte") || lower === "mono") {
		return "Immune Cells";
	}
	// Neutrophils, Eosinophils, Basophils, WBC
	if (lower.includes("basophil") || lower.includes("eosinophil") || lower.includes("neutrophil") || lower.includes("leukocyte") || lower.includes("wbc")) {
		return "White Blood Cells";
	}
	// Hemoglobin, RBC
	if (lower.includes("hemoglobin") || lower.includes("haemoglobin") || lower.includes("rbc") || lower.includes("erythrocyte") || lower.includes("hematocrit")) {
		return "Red Blood Cells";
	}
	// Platelets
	if (lower.includes("platelet") || lower.includes("plt")) {
		return "Blood Clotting";
	}
	// Blood sugar
	if (lower.includes("glucose") || lower.includes("sugar") || lower.includes("hba1c")) {
		return "Blood Sugar";
	}
	// Cholesterol / Lipids
	if (lower.includes("ldl") || lower.includes("hdl") || lower.includes("triglyceride") || lower.includes("lipid") || lower.includes("cholesterol")) {
		return "Cholesterol";
	}
	// Iron
	if (lower.includes("ferritin") || lower.includes("iron")) {
		return "Iron Levels";
	}
	// Thyroid
	if (lower.includes("tsh") || lower.includes("thyroid") || lower.includes("t3") || lower.includes("t4")) {
		return "Thyroid";
	}
	// Vitamin D
	if (lower.includes("vitamin d") || lower.includes("25-oh")) {
		return "Vitamin D";
	}
	// Liver
	if (lower.includes("alt") || lower.includes("ast") || lower.includes("bilirubin") || lower.includes("liver")) {
		return "Liver Health";
	}
	// Kidney
	if (lower.includes("creatinine") || lower.includes("egfr") || lower.includes("urea") || lower.includes("kidney")) {
		return "Kidney Health";
	}
	// Vitamin B12
	if (lower.includes("b12") || lower.includes("cobalamin")) {
		return "Vitamin B12";
	}
	// Blood pressure markers
	if (lower.includes("sodium") || lower.includes("potassium") || lower.includes("electrolyte")) {
		return "Electrolytes";
	}
	// Protein / Albumin
	if (lower.includes("albumin") || lower.includes("protein")) {
		return "Protein Levels";
	}

	// Clean up remaining raw lab abbreviations
	const cleaned = term
		.replace(/[%()]/g, "")
		.replace(/\b(absolute|count|ratio|level|panel|index)\b/gi, "")
		.trim();

	// If what's left is still very short or looks like a raw code, show a safe label
	if (!cleaned || cleaned.length <= 4) return "Health Markers";
	return cleaned || "Health Markers";
};

export const TrackerWidget = () => {
	const { t } = useLanguage();
	const { uploadStatus } = useSelector((state: RootState) => state.user);
	const records = useSelector((state: RootState) => state.uploadHistory?.records || []);
	const latestRecord = records[0];
	const { tracker: mockTracker } = dashboardData;

	const activeTarget = useMemo(() => {
		if (latestRecord && latestRecord.findings && latestRecord.findings.length > 0) {
			const priorityFinding = latestRecord.findings.find(
				(f) => f.status === "action" || f.status === "elevated" || f.status === "low"
			) || latestRecord.findings[0];
			return simplifyMarkerTerm(priorityFinding.marker || priorityFinding.name);
		}
		const raw = mockTracker.target ? t(mockTracker.target) || "Cholesterol" : "Cholesterol";
		return simplifyMarkerTerm(raw);
	}, [latestRecord, mockTracker.target, t]);

	const isCompleted = uploadStatus === "completed" || !uploadStatus;
	const isProcessing = uploadStatus === "processing";

	const tracker = {
		target: activeTarget,
		progress: isCompleted ? 100 : isProcessing ? 75 : mockTracker.progress,
		expected_days: isCompleted ? 0 : mockTracker.expected_days,
	};

	const statusClass = isCompleted ? "completed" : isProcessing ? "processing" : "idle";
	const statusLabel = isCompleted ? "Ready" : isProcessing ? "Analyzing" : "Pending";

	return (
		<div className={styles["TrackerWidget-container"]}>
			{/* Top Header Row: Info on left, Status badge capsule on right */}
			<div className={styles["TrackerWidget-Head"]}>
				<div className={styles["TrackerWidget-info"]}>
					<div className={styles["TrackerWidget-icon-container"]}>
						<Logo className={styles["TrackerWidget-icon"]} />
					</div>
					<p className={styles["TrackerWidget-text"]}>
						{isCompleted ? "Analysis complete for" : "Analyzing results for"}{" "}
						<span className={styles["TrackerWidget-target-badge"]}>
							{tracker.target}
						</span>
					</p>
				</div>

				<div className={`${styles["TrackerWidget-status-tag"]} ${styles[statusClass]}`}>
					<span className={`${styles["status-dot"]} ${styles[statusClass]}`} />
					{statusLabel}
				</div>
			</div>

			{/* Middle Row: Stretching Progress Bar */}
			<div className={styles["TrackerWidget-bar-wrapper"]}>
				<ProgressBar progress={tracker.progress} />
			</div>

			{/* Bottom Footer Row: Icon & Expected time details */}
			<div className={styles["TrackerWidget-footer"]}>
				<svg
					className={styles["calendar-icon"]}
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
					<line x1="16" y1="2" x2="16" y2="6" />
					<line x1="8" y1="2" x2="8" y2="6" />
					<line x1="3" y1="10" x2="21" y2="10" />
				</svg>
				<p className={styles["footer-text"]}>
					{isCompleted ? (
						"Your personalized health insights and next steps are ready."
					) : (
						<>
							Results expected in{" "}
							<span className={styles["expected-badge"]}>
								<svg
									className={styles["clock-icon"]}
									width="11"
									height="11"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="3"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="12" cy="12" r="10" />
									<polyline points="12 6 12 12 16 14" />
								</svg>
								{tracker.expected_days} days
							</span>
						</>
					)}
				</p>
			</div>
		</div>
	);
};
