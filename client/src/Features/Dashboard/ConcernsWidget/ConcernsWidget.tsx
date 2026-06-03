import { useState, useMemo } from "react";
import styles from "./ConcernsWidget.module.scss";
import Chevron from "@assets/ConcernWidget/Chevron.svg?react";
import Slope from "@assets/ConcernsWidget/Slope.svg?react";
import { detailedSystemConcerns } from "./helpers/detailedSystemConcerns";
import { Concern } from "./helpers/concernsMockData";
import { ConcernsCard } from "./Components/ConcernsCard/ConcernsCard";
import { DetailsCard } from "./Components/DetailsCard/DetailsCard";
import { ReasonsTable } from "./Components/ReasonsTable/ReasonsTable";
import { SymptomsList } from "./Components/SymptomsList/SymptomsList";
import { PlanWidget } from "../PlanWidget/PlanWidget";
import { useLanguage } from "@/App/i18n/LanguageContext";
import dashboardData from "@/App/Data/dashboard_data.json";

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

export const ConcernsWidget: React.FC<ConcernsWidgetProps> = ({ category }) => {
	const { t } = useLanguage();
	const [isShowMore, setIsShowMore] = useState(false);
	const [detailIndex, setDetailIndex] = useState(1);
	const [selectedConcernForModal, setSelectedConcernForModal] = useState<Concern | null>(null);
	const user = useSelector((state: RootState) => state.user);

	const { concerns } = dashboardData as unknown as { concerns: Concern[] };

	const uploadRecords = useSelector((state: RootState) => state.uploadHistory.records);
	const goals = useSelector((state: RootState) => state.goals.items);

	// Map user symptoms/conditions or latest uploaded lab results to relevant concerns
	const filteredConcerns = useMemo(() => {
		if (uploadRecords && uploadRecords.length > 0) {
			const latestRecord = uploadRecords[0];
			const abnormalFindings = latestRecord.findings.filter((f) => f.status !== "normal");

			if (abnormalFindings.length > 0) {
				const hasHighCholesterol = abnormalFindings.some(f => f.marker.toLowerCase().includes("cholesterol"));
				const hasHighGlucose = abnormalFindings.some(f => f.marker.toLowerCase().includes("glucose") || f.marker.toLowerCase().includes("sugar"));
				const hasLowFerritin = abnormalFindings.some(f => f.marker.toLowerCase().includes("ferritin") || f.marker.toLowerCase().includes("iron"));

				return [
					{
						id: 1,
						title: "Atrial Fibrillation",
						factors: [
							hasHighCholesterol ? "High Cholesterol level" : "Normal Cholesterol level",
							"Other influencing factors"
						],
						icon: "Heart",
						status: hasHighCholesterol ? "High" : "Low",
						link: "cardiovascular"
					},
					{
						id: 2,
						title: "Stroke",
						factors: [
							hasHighGlucose ? "High Glucose level" : "High heart rate level",
							"Other influencing factors"
						],
						icon: "Heart",
						status: "High",
						link: "cardiovascular"
					},
					{
						id: 3,
						title: "Coronary Artery Disease",
						factors: [
							hasHighCholesterol ? "High Cholesterol level" : "High heart rate level",
							"Other influencing factors"
						],
						icon: "Heart",
						status: "Medium",
						link: "cardiovascular"
					},
					{
						id: 4,
						title: "Hypertension",
						factors: [
							hasHighCholesterol ? "High Cholesterol level" : "Normal Cholesterol level",
							"Other influencing factors"
						],
						icon: "Heart",
						status: hasHighCholesterol ? "High" : "Medium",
						link: "cardiovascular"
					},
					{
						id: 5,
						title: "Heart Failure",
						factors: [
							hasLowFerritin ? "Low Ferritin level" : "High heart rate level",
							"Other influencing factors"
						],
						icon: "Heart",
						status: "Low",
						link: "cardiovascular"
					}
				] as Concern[];
			}
		}

		if (user.symptoms.length === 0 && user.medicalConditions.length === 0) {
			return concerns;
		}

		return concerns.filter((c) => {
			const text = (c.title + " " + (c.factors || []).join(" ")).toLowerCase();
			const matchesSymptom = user.symptoms.some((s) =>
				text.includes(s.toLowerCase()),
			);
			const matchesCondition = user.medicalConditions.some((mc) =>
				text.includes(mc.toLowerCase()),
			);
			return matchesSymptom || matchesCondition;
		});
	}, [uploadRecords, user.symptoms, user.medicalConditions, concerns]);

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

	const selectedSystem = detailedSystemConcerns[0];
	const reasons = selectedSystem.details[detailIndex - 1]?.reasons ?? [];
	const symptoms = selectedSystem?.details[detailIndex - 1]?.symptoms;
	const planData =
		category === "total"
			? selectedSystem.defaultPlan
			: (selectedSystem.details[detailIndex - 1]?.plan ??
				selectedSystem.defaultPlan);

	const handleShowMore = () => {
		setIsShowMore((prev) => !prev);
	};

	return (
		<div className={styles["ConcernWidget-wrapper"]}>
			<div className={styles["ConcernWidget-head"]}>
				<div className={styles["ConcernWidget-tab-container"]}>
					<div className={styles["ConcernWidget-tab"]}>
						{t("key_areas_of_concern")}
					</div>
					<Slope className={styles["ConcernWidget-slope"]} />
				</div>

				<div
					className={styles["ConcernWidget-more"]}
					onClick={() => handleShowMore()}
				>
					<p className={styles["ConcernWidget-more-text"]}>
						{isShowMore ? t("show_less") : t("show_all")}
					</p>
					<div className={styles["ConcernWidget-chevron-container"]}>
						<Chevron
							className={`${styles["ConcernWidget-chevron"]} ${
								isShowMore ? styles["rotate-chevron"] : ""
							}`}
						/>
					</div>
				</div>
			</div>
			<div className={styles["ConcernWidget-content"]}>
				<div className={styles["ConcernWidget-cards-layout"]}>
					<div
						className={`${styles["ConcernWidget-concern-cards"]} ${
							category !== "total"
								? styles["ConcernWidget-concern-cards-hidden"]
								: styles["ConcernWidget-concern-cards-visible"]
						}`}
					>
						{concernsToShow.map((concern: Concern) => (
							<ConcernsCard
								key={concern.id}
								concern={concern}
								onClick={() => setSelectedConcernForModal(concern)}
							/>
						))}
					</div>

					<div
						className={`${styles["ConcernWidget-detail-cards"]} ${
							category !== "total"
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
						category !== "total"
							? styles["ConcernWidget-reasons-visible"]
							: styles["ConcernWidget-reasons-hidden"]
					}`}
				>
					<ReasonsTable reasons={reasons} detailIndex={detailIndex} />
				</div>

				<div
					className={`${styles["ConcernWidget-symptoms"]} ${
						category !== "total"
							? styles["ConcernWidget-symptoms-visible"]
							: styles["ConcernWidget-symptoms-hidden"]
					}`}
				>
					<SymptomsList symptoms={symptoms} />
				</div>

				<PlanWidget planData={planData} />
			</div>

			<SuggestionsModal
				concern={selectedConcernForModal}
				onClose={() => setSelectedConcernForModal(null)}
			/>
		</div>
	);
};
