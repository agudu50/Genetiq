import React, { useState, useMemo } from "react";
import {
	Activity,
	Heart,
	Layers,
	ShieldAlert,
	CheckCircle2,
	AlertTriangle,
	PanelLeftClose,
} from "lucide-react";
import {
	Patient3DData,
	derivePatient3DGlowConfig,
} from "../../Model/Utils/patientModelMapping";
import { ModelType } from "../Types/ZoomTypes";
import styles from "./BiomarkerColorLegend.module.scss";

interface BiomarkerColorLegendProps {
	patientData?: Patient3DData;
	modelType: ModelType;
	selectedCategory: string | null;
	onSelectCategory?: (category: string) => void;
}

interface LegendItem {
	id: string;
	colorHex: string;
	title: string;
	system: string;
	depiction: string;
	value?: string;
	status: "elevated" | "low" | "optimal" | "critical" | "warning";
	positionLabel: string;
}

export const BiomarkerColorLegend: React.FC<BiomarkerColorLegendProps> = ({
	patientData,
	modelType,
	selectedCategory,
	onSelectCategory,
}) => {
	// Start hidden by default to keep the 3D twin completely unobstructed
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

	const glowConfig = useMemo(() => {
		if (patientData) {
			return derivePatient3DGlowConfig(patientData);
		}
		return null;
	}, [patientData]);

	// Derive legend items based on current 3D Model view (Heart vs Full Body)
	const legendItems: LegendItem[] = useMemo(() => {
		if (modelType === "cardio") {
			// Cardiovascular (Heart) 3D Model: derived directly from patient lab markers
			if (glowConfig && glowConfig.cardioHotspots.length > 0) {
				return glowConfig.cardioHotspots.map((spot, idx) => {
					let status: LegendItem["status"] = "warning";
					const lowerTitle = spot.title.toLowerCase();
					if (
						lowerTitle.includes("optimal") ||
						spot.coreColor.getHexString() === "34d399"
					) {
						status = "optimal";
					} else if (
						lowerTitle.includes("critical") ||
						lowerTitle.includes("urgent")
					) {
						status = "critical";
					} else if (lowerTitle.includes("elevated")) {
						status = "elevated";
					} else if (lowerTitle.includes("low")) {
						status = "low";
					}

					// Clean title extraction
					let title = spot.title.split(":")[0].trim();
					let value = spot.title.includes(":")
						? spot.title.split(":")[1].split("(")[0].trim()
						: undefined;

					// Specific Anatomical Position on Heart
					const ANATOMICAL_LABELS = [
						"LAD Coronary Artery",
						"Sinoatrial Node / Right Atrium",
						"Myocardial Micro-Vascular Bed",
						"Pulmonary Arterial Outflow",
						"Cardiac Autonomic Plexus",
						"Left Ventricular Myocardium",
					];
					const positionLabel =
						ANATOMICAL_LABELS[idx % ANATOMICAL_LABELS.length];

					// Concise clinical depiction
					let depiction =
						"Cardiovascular tissue perfusion & cellular telemetry";
					if (
						spot.id.includes("apob") ||
						lowerTitle.includes("apob") ||
						lowerTitle.includes("ldl")
					) {
						title = title || "Apolipoprotein B (ApoB)";
						depiction =
							"Atherogenic lipid penetration & coronary intima plaque vulnerability";
					} else if (
						spot.id.includes("afib") ||
						lowerTitle.includes("fibrillation") ||
						lowerTitle.includes("node")
					) {
						title = title || "Atrial Electrophysiology";
						depiction =
							"Sinoatrial conduction & paroxysmal arrhythmic focus";
					} else if (
						spot.id.includes("hscrp") ||
						lowerTitle.includes("crp") ||
						lowerTitle.includes("inflamm")
					) {
						title = title || "hs-CRP Vascular Inflammation";
						depiction =
							"Micro-vascular inflammatory stress & plaque destabilization risk";
					} else if (
						spot.id.includes("pulmonary") ||
						lowerTitle.includes("pulmonary") ||
						lowerTitle.includes("spo2")
					) {
						title = title || "Pulmonary Outflow Perfusion";
						depiction =
							"Arterial oxygenation transport & pulmonary resistance balance";
					} else if (
						spot.id.includes("autonomic") ||
						lowerTitle.includes("autonomic") ||
						lowerTitle.includes("plexus")
					) {
						title = title || "Autonomic Cardiac Tone";
						depiction =
							"Sympathetic-vagal balance & neuro-cardiac stress response";
					} else if (
						lowerTitle.includes("glucose") ||
						lowerTitle.includes("metabolic")
					) {
						title = title || "Fasting Blood Glucose";
						depiction =
							"Myocardial micro-circulation & cellular energy substrate balance";
					} else if (
						lowerTitle.includes("egfr") ||
						lowerTitle.includes("renal") ||
						lowerTitle.includes("kidney")
					) {
						title = title || "Cardio-Renal Hemodynamics (eGFR)";
						depiction =
							"Glomerular filtration clearance & fluid pressure regulation";
					} else if (
						lowerTitle.includes("hypertension") ||
						lowerTitle.includes("aorta")
					) {
						title = title || "Aortic Root Hypertensive Pressure";
						depiction =
							"Ascending aorta wall shear stress & pressure overload";
					}

					return {
						id: spot.id,
						colorHex: `#${spot.coreColor.getHexString()}`,
						title,
						system: "Cardiovascular",
						depiction,
						value,
						status,
						positionLabel,
					};
				});
			}

			// Fallback standard 5 cardio colors if patientData not present
			return [
				{
					id: "apob",
					colorHex: "#fbbf24",
					title: "Apolipoprotein B (ApoB)",
					system: "Cardiovascular",
					depiction:
						"Coronary LAD — Atherogenic lipid particle penetration & plaque vulnerability",
					value: "128 mg/dL",
					status: "elevated",
					positionLabel: "LAD Coronary Artery",
				},
				{
					id: "afib",
					colorHex: "#fb923c",
					title: "Atrial Electrophysiology",
					system: "Cardiovascular",
					depiction:
						"Sinoatrial Node / RA — Paroxysmal arrhythmic conductivity & sinus rhythm",
					value: "Paroxysmal AFib",
					status: "warning",
					positionLabel: "Sinoatrial Node / RA",
				},
				{
					id: "pulmonary",
					colorHex: "#38bdf8",
					title: "Pulmonary Arterial Outflow",
					system: "Cardiovascular",
					depiction:
						"Pulmonary Trunk — Deoxygenated to oxygenated gas exchange perfusion",
					value: "SpO2 96%",
					status: "optimal",
					positionLabel: "Pulmonary Trunk",
				},
				{
					id: "autonomic",
					colorHex: "#818cf8",
					title: "Cardiac Autonomic Plexus",
					system: "Cardiovascular",
					depiction:
						"Aortic Ganglia — Vagal & sympathetic hemodynamic stress balance",
					value: "Elevated Tone",
					status: "warning",
					positionLabel: "Cardiac Autonomic Plexus",
				},
				{
					id: "hscrp",
					colorHex: "#c084fc",
					title: "hs-CRP Inflammatory Stress",
					system: "Cardiovascular",
					depiction:
						"Micro-Vascular Bed — Vascular endothelial inflammatory stress",
					value: "3.4 mg/L",
					status: "elevated",
					positionLabel: "Myocardial Micro-Vascular Bed",
				},
			];
		} else {
			// Full Body (Overview) 3D Model: derived from patient lab markers & active systems
			const items: LegendItem[] = [];

			if (glowConfig && glowConfig.affectedSystems.size > 0) {
				Array.from(glowConfig.affectedSystems.values()).forEach((sys) => {
					let status: LegendItem["status"] = "warning";
					if (sys.urgency === "urgent") status = "critical";
					else if (sys.urgency === "optimal") status = "optimal";

					let depiction = "Anatomical Organ System Highlight";
					let positionLabel = sys.systemName;

					if (sys.systemKey === "cardiovascular") {
						positionLabel = "Thoracic Heart & Aorta";
						depiction =
							"Atheroma accumulation, myocardial workload & central perfusion";
					} else if (sys.systemKey === "Pulmonology1") {
						positionLabel = "Bilateral Retroperitoneal Kidneys";
						depiction =
							"Glomerular filtration rate, renal waste clearance & fluid balance";
					} else if (sys.systemKey === "Pulmonology") {
						positionLabel = "Bilateral Pulmonary Lobes";
						depiction =
							"Respiratory gas exchange, airway resistance & SpO2 oxygenation";
					} else if (sys.systemKey === "Endocrinology") {
						positionLabel = "Thyroid & Vascular Bed";
						depiction =
							"Endocrine metabolic rate, TSH control & systemic inflammatory tone";
					} else if (sys.systemKey === "StressManagement") {
						positionLabel = "Cranial Cerebral Cortex";
						depiction =
							"Cognitive load, central nervous system fatigue & autonomic stress";
					} else if (sys.systemKey === "Gastroenterolgy") {
						positionLabel = "Metabolic & Hepatic Axis";
						depiction =
							"Fasting blood glucose homeostasis & metabolic digestion";
					}

					items.push({
						id: sys.systemKey,
						colorHex: `#${sys.coreColor.getHexString()}`,
						title: sys.systemName,
						system: sys.systemName,
						depiction,
						value: sys.label,
						status,
						positionLabel,
					});
				});
				return items;
			}

			// Standard 5 organ colors for full body overview
			return [
				{
					id: "cardio_body",
					colorHex: "#fbbf24",
					title: "Cardiovascular (Heart)",
					system: "Cardiovascular",
					depiction:
						"Thoracic Heart — Atheroma accumulation & coronary perfusion",
					value: "ApoB 128 mg/dL",
					status: "elevated",
					positionLabel: "Thoracic Heart",
				},
				{
					id: "renal_body",
					colorHex: "#fb923c",
					title: "Renal (Kidneys)",
					system: "Renal",
					depiction:
						"Bilateral Kidneys — Glomerular filtration clearance & fluid regulation",
					value: "eGFR 78 mL/min",
					status: "low",
					positionLabel: "Bilateral Kidneys",
				},
				{
					id: "resp_body",
					colorHex: "#38bdf8",
					title: "Respiratory (Lungs)",
					system: "Respiratory",
					depiction:
						"Bilateral Lungs — Alveolar ventilation & blood oxygenation",
					value: "SpO2 96%",
					status: "optimal",
					positionLabel: "Bilateral Lungs",
				},
				{
					id: "neuro_body",
					colorHex: "#818cf8",
					title: "Neurological (Brain)",
					system: "Neurological",
					depiction:
						"Cerebral Cortex — Neuro-cognitive stress, sleep recovery & fatigue",
					value: "Vagal Stress",
					status: "warning",
					positionLabel: "Cerebral Cortex",
				},
				{
					id: "endo_body",
					colorHex: "#c084fc",
					title: "Endocrine & Metabolism",
					system: "Endocrine",
					depiction:
						"Thyroid & Endothelium — hs-CRP inflammation & metabolic baseline",
					value: "hs-CRP 3.4 mg/L",
					status: "elevated",
					positionLabel: "Thyroid & Vascular",
				},
			];
		}
	}, [modelType, glowConfig]);

	const getStatusIcon = (status: LegendItem["status"]) => {
		switch (status) {
			case "critical":
				return <ShieldAlert size={12} className={styles.statusIcon} />;
			case "elevated":
			case "warning":
				return <AlertTriangle size={12} className={styles.statusIcon} />;
			case "optimal":
			case "low":
			default:
				return <CheckCircle2 size={12} className={styles.statusIcon} />;
		}
	};

	const getStatusLabel = (status: LegendItem["status"]) => {
		switch (status) {
			case "critical":
				return "CRITICAL";
			case "elevated":
				return "ELEVATED";
			case "low":
				return "LOW";
			case "warning":
				return "ATTENTION";
			case "optimal":
				return "OPTIMAL";
		}
	};

	const statusCounts = useMemo(() => {
		let optimal = 0;
		let attention = 0;
		legendItems.forEach((item) => {
			if (item.status === "optimal") {
				optimal++;
			} else {
				attention++;
			}
		});
		return { optimal, attention, total: legendItems.length };
	}, [legendItems]);

	// When dismissed/hidden: render an unobtrusive left trigger pill
	if (!isVisible) {
		return (
			<button
				type='button'
				className={styles.drawerTriggerBtn}
				onClick={() => setIsVisible(true)}
				aria-label='Open 3D Biomarker Drawer'
				title='Open 3D Biomarker Color Legend Drawer'
			>
				<span className={styles.triggerIconWrapper}>
					<Activity className={styles.triggerIcon} />
				</span>
				<span className={styles.triggerText}>3D Color Legend</span>
				<span className={styles.triggerBadge}>{legendItems.length}</span>
			</button>
		);
	}

	return (
		<aside
			aria-label='3D Biomarker Telemetry Left Drawer'
			className={styles.leftDrawer}
		>
			{/* Medical-Grade Drawer Header */}
			<header className={styles.drawerHeader}>
				<div className={styles.headerLeft}>
					<div className={styles.headerIconWrapper}>
						{modelType === "cardio" ? (
							<Heart className={styles.headerIcon} />
						) : (
							<Layers className={styles.headerIcon} />
						)}
					</div>
					<div className={styles.headerText}>
						<div className={styles.headerTitleRow}>
							<span className={styles.headerTitle}>3D Biomarker Spectrum</span>
							<span
								className={styles.liveBadge}
								title='Live synchronization with patient clinical telemetry'
							>
								<span className={styles.livePulseDot} />
								LIVE
							</span>
							<span className={styles.indicatorBadge}>
								{legendItems.length}{" "}
								{modelType === "cardio" ? "Zones" : "Systems"}
							</span>
						</div>
						<div className={styles.headerSubtitleRow}>
							<span className={styles.headerSubtitle}>
								{modelType === "cardio"
									? "Cardiovascular Lab Mapping"
									: "Multi-System Anatomical Telemetry"}
							</span>
							{patientData?.name && (
								<span
									className={styles.patientTag}
									title={`Active patient: ${patientData.name}`}
								>
									• {patientData.name}
								</span>
							)}
						</div>
						<div className={styles.headerStatsRow}>
							{statusCounts.attention > 0 && (
								<span className={`${styles.miniStat} ${styles.attentionStat}`}>
									<span className={styles.statDot} />
									{statusCounts.attention} Attention
								</span>
							)}
							{statusCounts.optimal > 0 && (
								<span className={`${styles.miniStat} ${styles.optimalStat}`}>
									<span className={styles.statDot} />
									{statusCounts.optimal} Optimal
								</span>
							)}
						</div>
					</div>
				</div>

				<div className={styles.headerActions}>
					<button
						type='button'
						className={`${styles.actionBtn} ${styles.closeBtn}`}
						aria-label='Close 3D Drawer'
						onClick={() => setIsVisible(false)}
						title='Close Drawer'
					>
						<PanelLeftClose
							size={17}
							strokeWidth={2.2}
							className={styles.actionIcon}
						/>
					</button>
				</div>
			</header>

			{/* Drawer Scrollable Body */}
			<div className={styles.drawerBody}>
				<div className={styles.legendHelpBanner}>
					<Activity className={styles.bannerIcon} />
					<span>
						Each glowing color on the 3D model represents real-time lab
						biomarkers & physiological indicators.
					</span>
				</div>

				<div className={styles.itemsList}>
					{legendItems.map((item) => {
						const isHovered = activeHoverId === item.id;
						const isSelected =
							Boolean(selectedCategory) &&
							(selectedCategory?.toLowerCase() ===
								item.system.toLowerCase() ||
								selectedCategory?.toLowerCase() ===
									item.id.toLowerCase());
						return (
							<div
								key={item.id}
								className={`${styles.legendCard} ${isHovered || isSelected ? styles.cardActive : ""}`}
								onMouseEnter={() => setActiveHoverId(item.id)}
								onMouseLeave={() => setActiveHoverId(null)}
								onClick={() => {
									if (onSelectCategory && item.system) {
										onSelectCategory(item.system);
									}
								}}
							>
								{/* Solid Color Indicator Beacon */}
								<div className={styles.indicatorWrapper}>
									<div
										className={styles.solidBeacon}
										style={{ backgroundColor: item.colorHex }}
									/>
								</div>

								{/* Item Meta & Depiction */}
								<div className={styles.itemContent}>
									<div className={styles.itemHeader}>
										<span className={styles.itemTitle}>{item.title}</span>
										<span
											className={`${styles.statusBadge} ${styles[item.status]}`}
										>
											{getStatusIcon(item.status)}
											{getStatusLabel(item.status)}
										</span>
									</div>

									{/* What the color depicts on the 3D model */}
									<div className={styles.depictionRow}>
										<span className={styles.depictionLabel}>Depicts:</span>
										<span className={styles.depictionText}>
											{item.depiction}
										</span>
									</div>

									{/* Anatomical Placement & Value Badge */}
									<div className={styles.metaRow}>
										<span className={styles.positionBadge}>
											{item.positionLabel}
										</span>
										{item.value && (
											<span className={styles.valueBadge}>
												{item.value}
											</span>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</aside>
	);
};

export default BiomarkerColorLegend;
