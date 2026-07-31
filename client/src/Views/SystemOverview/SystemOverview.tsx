import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import styles from "./SystemOverview.module.scss";
import MainScene from "@/Features/DigitalTwin/Components/Three/MainScene";
import { CameraProvider } from "@/Features/DigitalTwin/Context/CameraContext";
import { ReasonsTable } from "@/Features/Dashboard/ConcernsWidget/Components/ReasonsTable/ReasonsTable";
import { detailedSystemConcerns } from "@/Features/Dashboard/ConcernsWidget/helpers/detailedSystemConcerns";
import { PlanWidget } from "@/Features/Dashboard/PlanWidget/PlanWidget";
import { ConcernsCard } from "@/Features/Dashboard/ConcernsWidget/Components/ConcernsCard/ConcernsCard";
import { SuggestionsModal } from "@/Features/Dashboard/ConcernsWidget/Components/SuggestionsModal/SuggestionsModal";
import { Concern } from "@/Features/Dashboard/ConcernsWidget/helpers/concernsMockData";
import {
	AtrialFibrillationPlanMockData,
	StrokePlanMockData,
	CoronaryArteryDiseasePlanMockData,
	HypertensionPlanMockData,
	HeartFailurePlanMockData,
	PlanSection,
} from "@/Features/Dashboard/PlanWidget/helpers/planMockData";
import Heart from "@assets/ConcernsWidget/Heart.svg?react";
import Home from "@assets/General/Home.svg?react";
import { AgeWidget } from "@/Features/Risk/AgeWidget/AgeWidget";
import Slope from "@assets/ConcernsWidget/Slope.svg?react";
import GoalsProgressMenu from "@/Features/Risk/GoalProgressMenu/GoalProgressMenu";

const getPlanForCondition = (title: string): PlanSection[] => {
	const t = title.toLowerCase();
	if (t.includes("atrial") || t.includes("irregular")) return AtrialFibrillationPlanMockData;
	if (t.includes("stroke")) return StrokePlanMockData;
	if (t.includes("coronary") || t.includes("heart disease") || t.includes("cad")) return CoronaryArteryDiseasePlanMockData;
	if (t.includes("hypertension") || t.includes("pressure")) return HypertensionPlanMockData;
	if (t.includes("heart failure")) return HeartFailurePlanMockData;
	return [];
};

const SystemOverview = () => {
	const { systemName } = useParams();
	const [selectedConcernForModal, setSelectedConcernForModal] = useState<Concern | null>(null);

	const uploadRecords = useSelector((state: RootState) => state.uploadHistory.records);
	const goals = useSelector((state: RootState) => state.goals.items);

	const filteredConcerns = useMemo(() => {
		if (uploadRecords && uploadRecords.length > 0) {
			const latestRecord = uploadRecords[0];
			const abnormalFindings = latestRecord.findings.filter((f) => f.status !== "normal");

			if (abnormalFindings.length > 0) {
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
			}
		}

		return [
			{
				id: 1,
				title: "Atrial Fibrillation",
				factors: ["High Cholesterol level", "Other influencing factors"],
				icon: "Heart",
				status: "High",
				link: "cardiovascular",
			},
			{
				id: 2,
				title: "Stroke",
				factors: ["High heart rate level", "Other influencing factors"],
				icon: "Heart",
				status: "High",
				link: "cardiovascular",
			},
			{
				id: 3,
				title: "Coronary Artery Disease",
				factors: ["High Cholesterol level", "Other influencing factors"],
				icon: "Heart",
				status: "Medium",
				link: "cardiovascular",
			},
			{
				id: 4,
				title: "Hypertension",
				factors: ["High Cholesterol level", "Other influencing factors"],
				icon: "Heart",
				status: "High",
				link: "cardiovascular",
			},
			{
				id: 5,
				title: "Heart Failure",
				factors: ["High heart rate level", "Other influencing factors"],
				icon: "Heart",
				status: "Low",
				link: "cardiovascular",
			}
		] as Concern[];
	}, [uploadRecords]);

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

	return (
		<div className={styles["SystemOverview-layout"]}>
			<CameraProvider>
				<div className={styles["SystemOverview-content"]}>
					<div
						className={`${styles["SystemOverview-stats"]}  ${styles["SystemOverview-animate"]}`}
					>
						<div className={styles["SystemOverview-head"]}>
							<div className={styles["SystemOverview-breadcrumbs"]}>
								<Link to='/dashboard' className={styles["SystemOverview-back"]}>
									<Home /> /
								</Link>
								System Report
							</div>
							<div className={styles["SystemOverview-system"]}>
								<div className={styles["SystemOverview-icon-container"]}>
									<Heart />
								</div>
								<h1 className={styles["SystemOverview-title"]}>
									{systemName}{" "}
									<span className='text-gradient-primary'>System Report</span>
								</h1>
							</div>
						</div>
						<div className={styles["SystemOverview-widget-wrapper"]}>
							<AgeWidget />
						</div>
						<div className={styles["SystemOverview-widget-wrapper"]}>
							<div className={styles["SystemOverview-widget-head"]}>
								<div className={styles["SystemOverview-widget-title-wrapper"]}>
									<h4 className={styles["SystemOverview-widget-title"]}>
										Key areas of concern
									</h4>
								</div>
								<p className={styles["SystemOverview-widget-desc"]}>
									Based on the provided data and individual disease
									recommendations, the patient is at risk for several
									cardiovascular conditions, including:
								</p>
							</div>
							<div className={styles["SystemOverview-concern-cards"]}>
								{visibleConcerns.map((concern) => (
									<ConcernsCard
										key={concern.id}
										concern={concern}
										layout="grid"
										backgroundColor='blue'
										onClick={() => setSelectedConcernForModal(concern)}
									/>
								))}
							</div>
						</div>
						<div className={styles["SystemOverview-widgets-container"]}>
							<div className={styles["SystemOverview-tab-container"]}>
								<div className={styles["SystemOverview-tab"]}>
									Health insights
								</div>
								<Slope className={styles["SystemOverview-slope"]} />
							</div>
							<div className={styles["SystemOverview-widgets-content"]}>
								<div className={styles["SystemOverview-widget-wrapper"]}>
									<div className={styles["SystemOverview-widget-head"]}>
										<div
											className={styles["SystemOverview-widget-title-wrapper"]}
										>
											<h4 className={styles["SystemOverview-widget-title"]}>
												Test results
											</h4>
											<div className={styles["SystemOverview-counter"]}>8</div>
										</div>
										<p className={styles["SystemOverview-widget-desc"]}>
											The primary concerns are elevated LDL cholesterol levels,
											slightly below optimal HDL cholesterol, and the need for
											improved cardiovascular fitness and stress management.
										</p>
									</div>
									<ReasonsTable
										reasons={detailedSystemConcerns[0].details[0].reasons}
										detailIndex={1}
									/>
								</div>
								<div className={styles["SystemOverview-line"]} />
								<div className={styles["SystemOverview-widget-wrapper"]}>
									<div className={styles["SystemOverview-widget-head"]}>
										<div
											className={styles["SystemOverview-widget-title-wrapper"]}
										>
											<h4 className={styles["SystemOverview-widget-title"]}>
												What you can do
											</h4>
											<div className={styles["SystemOverview-counter"]}>8</div>
										</div>
										<p className={styles["SystemOverview-widget-desc"]}>
											The following comprehensive action plan combines lifestyle
											changes, monitoring strategies, and supplement
											recommendations to support overall cardiovascular health.
										</p>
									</div>
									<PlanWidget
										backgroundColor=''
										planData={detailedSystemConcerns[0].defaultPlan}
									/>
								</div>
							</div>
						</div>
					</div>
					<div className={styles["SystemOverview-dt-container"]}>
						<GoalsProgressMenu />
						<div className={styles["SystemOverview-model"]}>
							<MainScene />
						</div>
					</div>
				</div>
			</CameraProvider>
			<SuggestionsModal
				concern={selectedConcernForModal}
				onClose={() => setSelectedConcernForModal(null)}
			/>
		</div>
	);
};
export default SystemOverview;
