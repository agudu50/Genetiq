import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import styles from "./DetailedRisk.module.scss";
import { CameraProvider } from "@/Features/DigitalTwin/Context/CameraContext";
import RiskHeader from "@/Features/Risk/RiskHeader/RiskHeader";
import { RiskStatus } from "@/Features/Risk/RiskStatus/RiskStatus";
// import { AgeWidget } from "@/Features/Risk/AgeWidget/AgeWidget";
import { detailedSystemConcerns, Reason } from "@/Features/Dashboard/ConcernsWidget/helpers/detailedSystemConcerns";
import { PlanWidget } from "@/Features/Dashboard/PlanWidget/PlanWidget";
import GoalsProgressMenu from "@/Features/Risk/GoalProgressMenu/GoalProgressMenu";
import { ReasonsTable } from "@/Features/Risk/ReasonsTable/ReasonsTable";
import { Symptoms } from "@/Features/Risk/Symptoms/Symptoms";
import Logo from "@assets/General/IconGenetiq.svg?react";
import Drop from "@assets/ConcernsWidget/Drop.svg";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";

function toTitleCase(str: string): string {
	return str
		.split(" ")
		.map(
			(word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase(),
		)
		.join(" ");
}

const DetailedRisk = () => {
	const { systemName, riskName } = useParams();
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const uploadRecords = useSelector((state: RootState) => state.uploadHistory.records);
	const user = useSelector((state: RootState) => state.user);

	const formattedName = riskName ? toTitleCase(riskName) : "";

	const selectedSystemInfo = detailedSystemConcerns.find(
		(concern) => concern.title.toLowerCase() === (systemName || "").toLowerCase(),
	) || detailedSystemConcerns[0];

	const selectedConcern = selectedSystemInfo.details.find(
		(detail) => detail.title.toLowerCase() === (riskName || "").toLowerCase(),
	) || selectedSystemInfo.details[0];

	const selectedDetail = detailedSystemConcerns[0].details.find(
		(detail) => detail.title.toLowerCase() === formattedName.toLowerCase(),
	) || selectedConcern;

	const handleIframeLoad = () => {
		setInterval(() => {
			setIsLoading(false);
		}, 4000);
	};

	// Map uploaded lab findings into simple Reason items if user has uploaded reports in system
	const systemReceivedReasons: Reason[] = useMemo(() => {
		if (uploadRecords && uploadRecords.length > 0) {
			const latestRecord = uploadRecords[0];
			if (latestRecord.findings && latestRecord.findings.length > 0) {
				return latestRecord.findings.map((f, idx) => {
					const isHigh = f.status === "action";
					const isMed = f.status === "elevated" || f.status === "low";
					const numericVal = f.value.match(/[\d.]+/)?.[0] || f.value;
					const unitStr = f.value.replace(/[\d.\s]+/g, "") || "units";
					return {
						id: idx + 1,
						title: f.name || f.marker,
						icon: Drop,
						test: "Received Lab Test",
						level: { type: "progress", src: isHigh ? 85 : isMed ? 65 : 45 },
						value: numericVal,
						unit: unitStr,
						statusText: f.statusLabel || (f.status === "normal" ? "Optimal" : "Needs Review"),
						status: isHigh ? "High" : isMed ? "Medium" : "Low",
						description: f.note || "Received from your uploaded medical records in the system.",
						date: "Normal Ref",
					};
				});
			}
		}
		return selectedConcern?.reasons || detailedSystemConcerns[0].details[0].reasons;
	}, [uploadRecords, selectedConcern]);

	// Symptoms related to condition and user's profile
	const conditionSymptoms = useMemo(() => {
		const baseSymptoms = selectedConcern?.symptoms || detailedSystemConcerns[0].details[0].symptoms;
		if (user?.symptoms && user.symptoms.length > 0) {
			const combined = Array.from(new Set([...user.symptoms, ...(baseSymptoms?.symptomsList || [])]));
			return {
				description: baseSymptoms?.description || "Symptoms relating to results received in your health profile:",
				symptomsList: combined,
			};
		}
		return baseSymptoms;
	}, [user.symptoms, selectedConcern]);

	return (
		<div className={styles["DetailerRisk-layout"]}>
			<CameraProvider>
				<div className={styles["DetailerRisk-content"]}>
					<div
						className={`${styles["DetailerRisk-stats"]} ${styles["DetailerRisk-animate"]}`}
					>
						<RiskHeader
							title={formattedName || selectedConcern.title}
							descriptions={selectedConcern?.description}
						/>
						<RiskStatus status={selectedConcern?.status || "High"} />
						<div className={styles["DetailerRisk-age"]}>
							<div className={styles["DetailerRisk-age-content"]}>
								<div className={styles["DetailerRisk-age-content-title"]}>
									What your age tells about your health
								</div>
								<div className={styles["DetailerRisk-age-content-desc"]}>
									A younger cardiovascular age indicates better heart resilience
									and lower overall complication risks. Following lifestyle and care
									guidelines tailored to your results helps keep your cardiovascular system strong.
								</div>
							</div>
							{/* <AgeWidget /> remove for now */}
						</div>

						{conditionSymptoms && (
							<Symptoms
								description={conditionSymptoms.description}
								symptomList={conditionSymptoms.symptomsList}
							/>
						)}

						{systemReceivedReasons && systemReceivedReasons.length > 0 && (
							<ReasonsTable
								reasons={systemReceivedReasons}
							/>
						)}

						<div className={styles["DetailerRisk-plan"]}>
							<div className={styles["title"]}>What you can do</div>
							<PlanWidget
								backgroundColor='blue'
								planData={
									selectedDetail?.plan ?? detailedSystemConcerns[0].defaultPlan
								}
							/>
						</div>
					</div>
					<div className={styles["DetailerRisk-twin"]}>
						<GoalsProgressMenu />
						<div
							style={{
								position: "relative",
								width: "100%",
								aspectRatio: "4 / 3",
								overflow: "hidden",
								justifyContent: "center",
							}}
						>
							{isLoading && (
								<div className={styles["DetailerRisk-iframe-loading"]}>
									<Logo className={styles["DetailerRisk-iframe-logo"]} />
								</div>
							)}

							<iframe
								id='embedded-human'
								frameBorder='0'
								allowFullScreen
								style={{ aspectRatio: "4 / 3", width: "100%" }}
								loading='eager'
								onLoad={handleIframeLoad}
								src={selectedConcern?.frame}
							/>
						</div>
					</div>
				</div>
			</CameraProvider>
		</div>
	);
};

export default DetailedRisk;
