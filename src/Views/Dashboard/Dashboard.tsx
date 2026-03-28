import { useState, useEffect, useCallback } from "react";
import styles from "./Dashboard.module.scss";
import { TrackerWidget } from "@/Features/Dashboard/TrackerWidget/TrackerWidget";
import { AgeWidget } from "@/Features/Dashboard/AgeWidget/AgeWidget";
import MainScene from "@/Features/DigitalTwin/Components/Three/Scene/MainScene";
import { CameraProvider } from "@/Features/DigitalTwin/Context/CameraContext";
import CtaModal from "@/Features/Dashboard/CtaModal/CtaModal";
import { ConcernsWidget } from "@/Features/Dashboard/ConcernsWidget/ConcernsWidget";
import { SystemDetailWidget } from "@/Features/Dashboard/SystemDetailWidget/SystemDetailWidget";
import { WelcomeHeader } from "@/Features/Dashboard/WelcomeHeader/WelcomeHeader";
import { QuickActions } from "@/Features/Dashboard/QuickActions/QuickActions";
import { ActivityChart } from "@/Features/Dashboard/ActivityChart/ActivityChart";
import { TriageWidget } from "@/Features/Dashboard/TriageWidget/TriageWidget";
import { motion, useDragControls } from "framer-motion";
import { HealthHistoryWidget } from "@/Features/Dashboard/HealthHistoryWidget/HealthHistoryWidget";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";

const Dashboard = () => {
	const [isChatbotOpen, setIsChatbotOpen] = useState(false);
	const [isNotFirstAnimation, setIsNotFirstAnimation] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const dragControls = useDragControls();
	const selectedCategory = useSelector(
		(state: RootState) => state.category.selectedCategory,
	);
	const [category, setCategory] = useState(selectedCategory || "total");

	const [isModelVisible, setIsModelVisible] = useState(true);

	// Detect mobile viewport
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 1024);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);

		// Intersection Observer for 3D performance
		const observer = new IntersectionObserver(
			([entry]) => {
				setIsModelVisible(entry.isIntersecting);
			},
			{ threshold: 0.1 },
		);

		const modelElem = document.querySelector(`.${styles["Dashboard-left"]}`);
		if (modelElem) observer.observe(modelElem);

		return () => {
			window.removeEventListener("resize", checkMobile);
			observer.disconnect();
		};
	}, []);

	// Close drawer/sidebar on escape key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (isDrawerOpen) setIsDrawerOpen(false);
				if (isSidebarOpen) setIsSidebarOpen(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isDrawerOpen, isSidebarOpen]);

	// Prevent body scroll when drawer is open
	useEffect(() => {
		if (isDrawerOpen && isMobile) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isDrawerOpen, isMobile]);

	const toggleDrawer = useCallback(() => {
		setIsDrawerOpen((prev) => !prev);
		// Close sidebar when opening drawer
		if (!isDrawerOpen) setIsSidebarOpen(false);
	}, [isDrawerOpen]);

	const toggleSidebar = useCallback(() => {
		setIsSidebarOpen((prev) => !prev);
		// Close drawer when opening sidebar
		if (!isSidebarOpen) setIsDrawerOpen(false);
	}, [isSidebarOpen]);

	useEffect(() => {
		if (selectedCategory !== "total") {
			setIsNotFirstAnimation(true);
		}
	}, [selectedCategory]);

	const handleAnimationStart = () => {
		const timeout = setTimeout(() => {
			setCategory(selectedCategory || "total");
		}, 800);
		return () => clearTimeout(timeout);
	};

	const widgetsContent = (
		<div
			key={selectedCategory}
			className={`${styles["Dashboard-right"]} ${
				isNotFirstAnimation ? styles["loopAnimation"] : styles["firstAnimation"]
			}`}
			onAnimationStart={handleAnimationStart}
		>
			{/* Imported Content - At the Top */}
			<div className={styles["span-2"]}>
				<WelcomeHeader />
			</div>
			<div className={styles["span-2"]}>
				<AgeWidget />
			</div>
			<div className={styles["span-2"]}>
				<TrackerWidget />
			</div>

			{/* Actionable Health Analytics */}
			<div className={styles["span-1"]}>
				<ActivityChart />
			</div>
			<div className={styles["span-1"]}>
				<QuickActions />
			</div>

			{/* Tertiary Analytics & Risk Models */}
			<div className={styles["span-2"]}>
				<HealthHistoryWidget />
			</div>
			<div className={styles["span-2"]}>
				<ConcernsWidget category={category || "total"} />
			</div>
			<div className={styles["span-2"]}>
				<SystemDetailWidget category={category} />
			</div>
		</div>
	);

	return (
		<div className={styles["Dashboard-layout"]}>
			<CameraProvider>
				<div className={styles["Dashboard-content"]}>
					{/* 3D Model - fullscreen on mobile */}
					<div className={styles["Dashboard-left"]}>
						<div className={styles["Dashboard-dt-container"]}>
							<div className={styles["Dashboard-model"]}>
								<MainScene
									selectedCategory={selectedCategory || "total"}
									sidebarCollapsed={isMobile ? !isSidebarOpen : undefined}
									onSidebarToggle={isMobile ? toggleSidebar : undefined}
									onSidebarSelectionMade={
										isMobile ? () => setIsSidebarOpen(false) : undefined
									}
									isPaused={!isModelVisible || (isMobile && isDrawerOpen)}
								/>
								{/* Chatbot Action Button over the 3D twin */}
								<motion.div
									className={styles["chatbot-wrapper"]}
									drag
									dragControls={dragControls}
									dragListener={false}
									dragMomentum={false}
									style={{ touchAction: "none" }}
								>
									<div
										className={`${styles["chatbot-popup"]} ${isChatbotOpen ? styles["popup-open"] : ""}`}
									>
										<TriageWidget />
									</div>

									<button
										className={`${styles["chatbot-fab"]} ${isChatbotOpen ? styles["active"] : ""}`}
										onPointerDown={(e) => dragControls.start(e)}
										onClick={() => setIsChatbotOpen(!isChatbotOpen)}
										aria-label='Toggle AI Triage Chatbot'
										style={{ cursor: "grab" }}
									>
										{isChatbotOpen ? (
											<svg
												width='24'
												height='24'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2.5'
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<line x1='18' y1='6' x2='6' y2='18'></line>
												<line x1='6' y1='6' x2='18' y2='18'></line>
											</svg>
										) : (
											<span style={{ fontSize: "28px" }}>🤖</span>
										)}
									</button>
								</motion.div>
							</div>
						</div>
					</div>

					{/* Desktop: widgets inline | Mobile: hidden (in drawer) */}
					{!isMobile && widgetsContent}
				</div>

				{/* Mobile floating dock with two action buttons */}
				{isMobile && (
					<div className={styles["floating-dock"]}>
						{/* Body/Anatomy button - toggles sidebar */}
						<button
							className={`${styles["dock-btn"]} ${isSidebarOpen ? styles["dock-btn-active"] : ""}`}
							onClick={toggleSidebar}
							aria-label={
								isSidebarOpen ? "Close body navigation" : "Open body navigation"
							}
						>
							<svg
								width='22'
								height='22'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='1.8'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								{/* Human body silhouette */}
								<circle cx='12' cy='4' r='2.5' />
								<path d='M12 6.5V14' />
								<path d='M8 9.5L12 8L16 9.5' />
								<path d='M12 14L9 21' />
								<path d='M12 14L15 21' />
							</svg>
							<span className={styles["dock-label"]}>Body</span>
						</button>

						{/* Divider */}
						<div className={styles["dock-divider"]} />

						{/* Dashboard/Widgets button - toggles drawer */}
						<button
							className={`${styles["dock-btn"]} ${isDrawerOpen ? styles["dock-btn-active"] : ""}`}
							onClick={toggleDrawer}
							aria-label={isDrawerOpen ? "Close dashboard" : "Open dashboard"}
						>
							<svg
								width='20'
								height='20'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								{/* Grid/dashboard icon */}
								<rect x='3' y='3' width='7' height='7' rx='1.5' />
								<rect x='14' y='3' width='7' height='7' rx='1.5' />
								<rect x='3' y='14' width='7' height='7' rx='1.5' />
								<rect x='14' y='14' width='7' height='7' rx='1.5' />
							</svg>
							<span className={styles["dock-label"]}>Insights</span>
						</button>
					</div>
				)}

				{/* Mobile drawer overlay */}
				{isMobile && (
					<>
						<div
							className={`${styles["drawer-overlay"]} ${isDrawerOpen ? styles["drawer-overlay-visible"] : ""}`}
							onClick={toggleDrawer}
						/>
						<div
							className={`${styles["drawer"]} ${isDrawerOpen ? styles["drawer-open"] : ""}`}
						>
							<div className={styles["drawer-header"]}>
								<h3 className={styles["drawer-title"]}>Dashboard</h3>
								<button
									className={styles["drawer-close"]}
									onClick={toggleDrawer}
									aria-label='Close menu'
								>
									<svg
										width='20'
										height='20'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2.5'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<line x1='18' y1='6' x2='6' y2='18' />
										<line x1='6' y1='6' x2='18' y2='18' />
									</svg>
								</button>
							</div>
							<div className={styles["drawer-body"]}>{widgetsContent}</div>
						</div>
					</>
				)}
			</CameraProvider>
			<CtaModal />
		</div>
	);
};

export default Dashboard;
