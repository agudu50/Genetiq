import { useState, useMemo } from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import styles from "./ConcernsWidget.module.scss";
import { detailedSystemConcerns } from "./helpers/detailedSystemConcerns";
import { Concern } from "./helpers/concernsMockData";
import { ConcernsCard } from "./Components/ConcernsCard/ConcernsCard";
import { DetailsCard } from "./Components/DetailsCard/DetailsCard";
import { ReasonsTable } from "@/Features/Risk/ReasonsTable/ReasonsTable";
import { Symptoms } from "@/Features/Risk/Symptoms/Symptoms";
import { PlanWidget } from "../PlanWidget/PlanWidget";
import { useLanguage } from "@/App/i18n/LanguageContext";

import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { SuggestionsModal } from "./Components/SuggestionsModal/SuggestionsModal";
import {
	AtrialFibrillationPlanMockData,
	StrokePlanMockData,
	CoronaryArteryDiseasePlanMockData,
	HypertensionPlanMockData,
	HeartFailurePlanMockData,
	PlanSection,
} from "../PlanWidget/helpers/planMockData";

const getPlanForCondition = (title: string): PlanSection[] => {
	const t = title.toLowerCase();
	if (t.includes("atrial") || t.includes("irregular")) return AtrialFibrillationPlanMockData;
	if (t.includes("stroke")) return StrokePlanMockData;
	if (t.includes("coronary") || t.includes("heart disease") || t.includes("cad")) return CoronaryArteryDiseasePlanMockData;
	if (t.includes("hypertension") || t.includes("pressure")) return HypertensionPlanMockData;
	if (t.includes("heart failure")) return HeartFailurePlanMockData;
	return [];
};

interface ConcernsWidgetProps {
	category: string;
}

const CARDIO_DETAIL_CATEGORIES = new Set(["cardiovascular", "CardioLoad"]);

const isCardioDetailCategory = (category: string) =>
	CARDIO_DETAIL_CATEGORIES.has(category);

const DEFAULT_PATIENT_CONCERNS: Concern[] = [
	{
		id: 101,
		title: "Basophils %",
		factors: [
			"Basophils % (14%) is higher than the usual range",
			"Measured value: 14%"
		],
		icon: "Brain",
		status: "Medium",
		link: "cardiovascular"
	},
	{
		id: 102,
		title: "Packed Cell Volume (PCV)",
		factors: [
			"PCV (Packed Cell Volume) (percentage of red blood cells carrying oxygen)",
			"Measured value: 37.7%"
		],
		icon: "Heart",
		status: "Medium",
		link: "cardiovascular"
	}
];

export const ConcernsWidget: React.FC<ConcernsWidgetProps> = ({ category }) => {
	const { t, lang } = useLanguage();
	const isCardioDetailView = isCardioDetailCategory(category);
	const [isShowMore, setIsShowMore] = useState(false);
	const [detailIndex, setDetailIndex] = useState(1);
	const [selectedConcernForModal, setSelectedConcernForModal] = useState<Concern | null>(null);

	const uploadRecords = useSelector((state: RootState) => state.uploadHistory.records);
	const goals = useSelector((state: RootState) => state.goals.items);

	// Lab-upload concerns only apply in cardiovascular detail view
	const filteredConcerns = useMemo(() => {
		if (uploadRecords && uploadRecords.length > 0) {
			const latestRecord = uploadRecords[0];
			const abnormalFindings = latestRecord.findings.filter((f) => f.status !== "normal");

			if (abnormalFindings.length > 0) {
				if (isCardioDetailView) {
					const hasHighCholesterol = abnormalFindings.some(f => f.marker.toLowerCase().includes("cholesterol") || f.marker.toLowerCase().includes("ldl") || f.marker.toLowerCase().includes("lipid") || f.marker.toLowerCase().includes("vldl") || f.marker.toLowerCase().includes("hdl"));
					const hasHighGlucose = abnormalFindings.some(f => f.marker.toLowerCase().includes("glucose") || f.marker.toLowerCase().includes("sugar") || f.marker.toLowerCase().includes("fbs") || f.marker.toLowerCase().includes("diabetes") || f.marker.toLowerCase().includes("hba1c"));
					const hasLowFerritin = abnormalFindings.some(f => f.marker.toLowerCase().includes("ferritin") || f.marker.toLowerCase().includes("iron") || f.marker.toLowerCase().includes("hemoglobin") || f.marker.toLowerCase().includes("haemoglobin") || f.marker.toLowerCase().includes("mcv") || f.marker.toLowerCase().includes("mch") || f.marker.toLowerCase().includes("anemia") || f.marker.toLowerCase().includes("anaemia") || f.marker.toLowerCase().includes("blood cell") || f.marker.toLowerCase().includes("rbc"));
					const hasHighHeartRate = abnormalFindings.some(f => 
						f.marker.toLowerCase().includes("heart rate") || 
						f.marker.toLowerCase().includes("pulse") || 
						f.marker.toLowerCase().includes("bpm") || 
						f.marker.toLowerCase().includes("temp") || 
						f.marker.toLowerCase().includes("wbc") || 
						f.marker.toLowerCase().includes("fever") || 
						f.marker.toLowerCase().includes("malaria") || 
						f.marker.toLowerCase().includes("typhoid") || 
						f.marker.toLowerCase().includes("salmonella") ||
						f.marker.toLowerCase().includes("widal") ||
						f.marker.toLowerCase().includes("esr") ||
						f.marker.toLowerCase().includes("urine") ||
						f.marker.toLowerCase().includes("stool") ||
						f.marker.toLowerCase().includes("diarrhea") ||
						f.marker.toLowerCase().includes("cholera")
					);
					const hasHighBP = abnormalFindings.some(f => f.marker.toLowerCase().includes("blood pressure") || f.marker.toLowerCase().includes("bp") || f.marker.toLowerCase().includes("systolic") || f.marker.toLowerCase().includes("diastolic") || f.marker.toLowerCase().includes("hypertension"));

					return [
						{
							id: 1,
							title: "Atrial Fibrillation",
							factors: [
								hasHighCholesterol ? "High Cholesterol level" : hasHighHeartRate ? "High heart rate level" : "Normal Cholesterol level",
								"Other influencing factors"
							],
							icon: "Heart",
							status: hasHighCholesterol || hasHighHeartRate || hasHighBP ? "High" : "Low",
							link: "cardiovascular"
						},
						{
							id: 2,
							title: "Stroke",
							factors: [
								hasHighHeartRate ? "High heart rate level" : hasHighGlucose ? "High Glucose level" : "High heart rate level",
								"Other influencing factors"
							],
							icon: "Heart",
							status: hasHighHeartRate || hasHighGlucose || hasHighBP ? "High" : "Medium",
							link: "cardiovascular"
						},
						{
							id: 3,
							title: "Coronary Artery Disease",
							factors: [
								hasHighHeartRate ? "High heart rate level" : hasHighCholesterol ? "High Cholesterol level" : "High heart rate level",
								"Other influencing factors"
							],
							icon: "Heart",
							status: hasHighCholesterol || hasHighHeartRate || hasHighBP ? "Medium" : "Low",
							link: "cardiovascular"
						},
						{
							id: 4,
							title: "Hypertension",
							factors: [
								hasHighCholesterol ? "High Cholesterol level" : hasHighBP ? "High blood pressure" : "Normal Cholesterol level",
								"Other influencing factors"
							],
							icon: "Heart",
							status: hasHighBP || hasHighCholesterol ? "High" : "Medium",
							link: "cardiovascular"
						},
						{
							id: 5,
							title: "Heart Failure",
							factors: [
								hasHighHeartRate ? "High heart rate level" : hasLowFerritin ? "Low Ferritin level" : "High heart rate level",
								"Other influencing factors"
							],
							icon: "Heart",
							status: "Low",
							link: "cardiovascular"
						}
					] as Concern[];
				} else {
					return abnormalFindings.map((finding, idx) => {
						const isHigh = finding.status === "action";
						const isMedium = finding.status === "elevated" || finding.status === "low";
						
						const factor1 = finding.note ? (finding.note.split(/[.!]/)[0]?.trim().slice(0, 60) || finding.note.slice(0, 60)) : `Abnormal value: ${finding.value}`;
						
						return {
							id: idx + 1,
							title: finding.name || finding.marker,
							factors: [
								factor1,
								`Measured value: ${finding.value}`
							],
							icon: finding.marker.toLowerCase().includes("malaria") ? "Globe" : 
								  finding.marker.toLowerCase().includes("liver") || finding.marker.toLowerCase().includes("hepatitis") ? "Heart" : "Brain",
							status: isHigh ? "High" : isMedium ? "Medium" : "Low",
							link: "cardiovascular"
						};
					}) as Concern[];
				}
			}
		}

		return DEFAULT_PATIENT_CONCERNS;
	}, [uploadRecords, isCardioDetailView]);

	const visibleConcerns = useMemo(() => {
		return filteredConcerns.filter((concern) => {
			const planSections = getPlanForCondition(concern.title);
			const associatedNames = planSections
				.filter((sec) => sec.title !== "Action Plan")
				.flatMap((sec) => sec.data.map((item) => item.name));

			if (associatedNames.length === 0) return true;

			const activatedGoals = goals.filter((g) => associatedNames.includes(g.title));

			if (activatedGoals.length > 0) {
				const allCompleted = activatedGoals.every((g) => g.completed);
				if (allCompleted) {
					return false;
				}
			}
			return true;
		});
	}, [filteredConcerns, goals]);

	const concernsToShow = isShowMore
		? visibleConcerns
		: visibleConcerns.slice(0, 3);

	const severitySummary = useMemo(() => {
		const counts = { High: 0, Medium: 0, Low: 0 };
		visibleConcerns.forEach((c) => {
			if (c.status in counts) counts[c.status as keyof typeof counts] += 1;
		});
		return counts;
	}, [visibleConcerns]);

	const selectedSystem = detailedSystemConcerns[0];
	const selectedDetail = selectedSystem.details[detailIndex - 1] || selectedSystem.details[0];
	const reasons = selectedDetail?.reasons ?? [];
	const symptoms = selectedDetail?.symptoms;

	const handleShowMore = () => {
		setIsShowMore((prev) => !prev);
	};

	return (
		<div className={styles["ConcernWidget-wrapper"]}>
			{!isCardioDetailView && (
				<div className={styles.concernsSection}>
					<div className={styles.head}>
						<div className={styles.headCopy}>
							<h3 className={styles.headTitle}>{t("key_areas_of_concern")}</h3>
							<p className={styles.headSubtitle}>{t("concerns_subtitle")}</p>
						</div>
						{visibleConcerns.length > 3 && (
							<button
								type="button"
								className={styles.showAllBtn}
								onClick={handleShowMore}
								aria-expanded={isShowMore}
							>
								<span>{isShowMore ? t("show_less") : t("show_all")}</span>
								<ChevronDown
									size={14}
									strokeWidth={2.5}
									className={isShowMore ? styles.chevronUp : undefined}
								/>
							</button>
						)}
					</div>

					<div className={styles.listCard}>
						{(severitySummary.High > 0 ||
							severitySummary.Medium > 0 ||
							severitySummary.Low > 0) && (
							<div className={styles.summaryBar}>
								<AlertTriangle size={14} strokeWidth={2.25} aria-hidden />
								<div className={styles.summaryPills}>
									{severitySummary.High > 0 && (
										<span className={`${styles.summaryPill} ${styles.summaryHigh}`}>
											{severitySummary.High} {t("High")}
										</span>
									)}
									{severitySummary.Medium > 0 && (
										<span className={`${styles.summaryPill} ${styles.summaryMedium}`}>
											{severitySummary.Medium} {t("Medium")}
										</span>
									)}
									{severitySummary.Low > 0 && (
										<span className={`${styles.summaryPill} ${styles.summaryLow}`}>
											{severitySummary.Low} {t("Low")}
										</span>
									)}
								</div>
								<span className={styles.summaryTotal}>
									{visibleConcerns.length}{" "}
									{visibleConcerns.length === 1
										? t("concerns_item_singular")
										: t("concerns_item_plural")}
								</span>
							</div>
						)}

						{concernsToShow.map((concern: Concern, index: number) => (
							<ConcernsCard
								key={concern.id}
								concern={concern}
								onClick={() => setSelectedConcernForModal(concern)}
								isLast={index === concernsToShow.length - 1}
							/>
						))}
					</div>
				</div>
			)}

			<div className={styles["ConcernWidget-content"]}>
				<div className={styles["ConcernWidget-cards-layout"]}>
					<div
						className={`${styles["ConcernWidget-detail-cards"]} ${
							isCardioDetailView
								? styles["ConcernWidget-detail-cards-visible"]
								: styles["ConcernWidget-detail-cards-hidden"]
						}`}
					>
						{selectedSystem.details.map((detail) => (
							<DetailsCard
								key={`${detail.id}-${category}`}
								detail={detail}
								detailIndex={detailIndex}
								setDetailIndex={setDetailIndex}
							/>
						))}
					</div>
				</div>

				<div
					className={`${styles["ConcernWidget-reasons"]} ${
						isCardioDetailView
							? styles["ConcernWidget-reasons-visible"]
							: styles["ConcernWidget-reasons-hidden"]
					}`}
				>
					<ReasonsTable reasons={reasons} />
				</div>

				<div
					className={`${styles["ConcernWidget-symptoms"]} ${
						isCardioDetailView
							? styles["ConcernWidget-symptoms-visible"]
							: styles["ConcernWidget-symptoms-hidden"]
					}`}
				>
					{symptoms && (
						<Symptoms
							description={symptoms.description}
							symptomList={symptoms.symptomsList}
						/>
					)}
				</div>

				<PlanWidget key={lang} />
			</div>

			<SuggestionsModal
				concern={selectedConcernForModal}
				onClose={() => setSelectedConcernForModal(null)}
			/>
		</div>
	);
};
