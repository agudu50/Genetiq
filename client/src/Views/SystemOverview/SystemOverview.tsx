import { useParams } from "react-router-dom";
import styles from "./SystemOverview.module.scss";
import MainScene from "@/Features/DigitalTwin/Components/Three/MainScene";
import { CameraProvider } from "@/Features/DigitalTwin/Context/CameraContext";
import { Link } from "react-router-dom";
import { ReasonsTable } from "@/Features/Dashboard/ConcernsWidget/Components/ReasonsTable/ReasonsTable";
import { detailedSystemConcerns } from "@/Features/Dashboard/ConcernsWidget/helpers/detailedSystemConcerns";
import { PlanWidget } from "@/Features/Dashboard/PlanWidget/PlanWidget";
import { ConcernsCard } from "@/Features/Dashboard/ConcernsWidget/Components/ConcernsCard/ConcernsCard";
import Heart from "@assets/ConcernsWidget/Heart.svg?react";
import Home from "@assets/General/Home.svg?react";
import { AgeWidget } from "@/Features/Risk/AgeWidget/AgeWidget";
import { concernsMockData } from "@/Features/Dashboard/ConcernsWidget/helpers/concernsMockData";
import Slope from "@assets/ConcernsWidget/Slope.svg?react";
import GoalsProgressMenu from "@/Features/Risk/GoalProgressMenu/GoalProgressMenu";

const SystemOverview = () => {
	const { systemName } = useParams();

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
								{concernsMockData.map((concern) => (
									<ConcernsCard
										key={concern.id}
										concern={concern}
										backgroundColor='blue'
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
		</div>
	);
};
export default SystemOverview;
