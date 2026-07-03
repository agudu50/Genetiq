import {
	useState,
	useEffect,
	useCallback,
	useTransition,
	useRef,
	lazy,
	Suspense,
} from "react";
import styles from "./Dashboard.module.scss";
import { TrackerWidget } from "@/Features/Dashboard/TrackerWidget/TrackerWidget";
import { AgeWidget } from "@/Features/Dashboard/AgeWidget/AgeWidget";
import { CameraProvider } from "@/Features/DigitalTwin/Context/CameraContext";
import { WelcomeHeader } from "@/Features/Dashboard/WelcomeHeader/WelcomeHeader";
import { QuickActions } from "@/Features/Dashboard/QuickActions/QuickActions";
import { TriageWidget } from "@/Features/Dashboard/TriageWidget/TriageWidget";
import { DeferredMount } from "./DeferredMount";
import { ViewportMount } from "./ViewportMount";
import { WidgetFallback } from "./WidgetFallback";
import { usePanelScrollPerf } from "./usePanelScrollPerf";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";

const MainScene = lazy(
	() => import("@/Features/DigitalTwin/Components/Three/Scene/MainScene"),
);
const CtaModal = lazy(() => import("@/Features/Dashboard/CtaModal/CtaModal"));
const ConcernsWidget = lazy(() =>
	import("@/Features/Dashboard/ConcernsWidget/ConcernsWidget").then((m) => ({
		default: m.ConcernsWidget,
	})),
);
const SystemDetailWidget = lazy(() =>
	import("@/Features/Dashboard/SystemDetailWidget/SystemDetailWidget").then(
		(m) => ({ default: m.SystemDetailWidget }),
	),
);
const ActivityChart = lazy(() =>
	import("@/Features/Dashboard/ActivityChart/ActivityChart").then((m) => ({
		default: m.ActivityChart,
	})),
);
const HealthHistoryWidget = lazy(() =>
	import("@/Features/Dashboard/HealthHistoryWidget/HealthHistoryWidget").then(
		(m) => ({ default: m.HealthHistoryWidget }),
	),
);

const Dashboard = () => {
	const [, startTransition] = useTransition();
	const [isChatbotOpen, setIsChatbotOpen] = useState(false);
	const [isNotFirstAnimation, setIsNotFirstAnimation] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [mobileWidgetsReady, setMobileWidgetsReady] = useState(false);
	const panelScrollRef = useRef<HTMLDivElement | null>(null);
	const leftColumnRef = useRef<HTMLDivElement | null>(null);
	const { attachPanelScroll } = usePanelScrollPerf();
	const setPanelRef = useCallback(
		(el: HTMLDivElement | null) => {
			panelScrollRef.current = el;
			attachPanelScroll(el);
		},
		[attachPanelScroll],
	);

	const setDrawerBodyRef = useCallback(
		(el: HTMLDivElement | null) => {
			attachPanelScroll(el);
		},
		[attachPanelScroll],
	);
	const selectedCategory = useSelector(
		(state: RootState) => state.category.selectedCategory,
	);
	const [category, setCategory] = useState(selectedCategory || "total");

	const [isModelVisible, setIsModelVisible] = useState(true);
	const [pageIn, setPageIn] = useState(false);

	useEffect(() => {
		let frame2 = 0;
		const frame1 = requestAnimationFrame(() => {
			frame2 = requestAnimationFrame(() => setPageIn(true));
		});
		return () => {
			cancelAnimationFrame(frame1);
			cancelAnimationFrame(frame2);
		};
	}, []);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 1024);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);

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

	useEffect(() => {
		if (!isMobile) return;

		const root = document.documentElement;
		if (isDrawerOpen) {
			root.classList.add("dashboard-drawer-open");
		} else {
			root.classList.remove("dashboard-drawer-open");
		}

		return () => {
			root.classList.remove("dashboard-drawer-open");
		};
	}, [isDrawerOpen, isMobile]);

	useEffect(() => {
		if (isMobile) {
			setMobileWidgetsReady(true);
		}
	}, [isMobile]);

	const toggleDrawer = useCallback(() => {
		startTransition(() => {
			setIsDrawerOpen((prev) => !prev);
			if (!isDrawerOpen) setIsSidebarOpen(false);
		});
	}, [isDrawerOpen]);

	const toggleSidebar = useCallback(() => {
		startTransition(() => {
			setIsSidebarOpen((prev) => !prev);
			if (!isSidebarOpen) setIsDrawerOpen(false);
		});
	}, [isSidebarOpen]);

	useEffect(() => {
		if (selectedCategory !== "total") {
			setIsNotFirstAnimation(true);
		}
	}, [selectedCategory]);

	// Forward mouse wheel over the 3D model column into the widgets scroll panel.
	useEffect(() => {
		if (isMobile) return;

		const leftColumn = leftColumnRef.current;
		const scrollPanel = panelScrollRef.current;
		if (!leftColumn || !scrollPanel) return;

		const onWheel = (event: WheelEvent) => {
			if (scrollPanel.scrollHeight <= scrollPanel.clientHeight) return;

			const target = event.target as HTMLElement | null;
			if (target?.closest("button, a, input, select, textarea, [role='button']")) {
				return;
			}

			const delta =
				Math.abs(event.deltaY) >= Math.abs(event.deltaX)
					? event.deltaY
					: event.deltaX;
			if (delta === 0) return;

			const maxScroll = scrollPanel.scrollHeight - scrollPanel.clientHeight;
			const nextScroll = Math.min(
				maxScroll,
				Math.max(0, scrollPanel.scrollTop + delta),
			);

			if (nextScroll === scrollPanel.scrollTop) return;

			event.preventDefault();
			scrollPanel.scrollTop = nextScroll;
		};

		leftColumn.addEventListener("wheel", onWheel, { passive: false });
		return () => leftColumn.removeEventListener("wheel", onWheel);
	}, [isMobile, pageIn]);

	useEffect(() => {
		const delay = isNotFirstAnimation ? 80 : 200;
		const timeout = setTimeout(() => {
			setCategory(selectedCategory || "total");
		}, delay);
		return () => clearTimeout(timeout);
	}, [selectedCategory, isNotFirstAnimation]);

	const widgetsContent = (
		<div
			key={selectedCategory}
			ref={setPanelRef}
			className={`${styles["Dashboard-right"]} ${
				isNotFirstAnimation ? styles["loopAnimation"] : styles["firstAnimation"]
			}`}
		>
			<div className={styles["span-2"]}>
				<WelcomeHeader />
			</div>
			<div className={styles["span-2"]}>
				<AgeWidget />
			</div>
			<div className={styles["span-2"]}>
				<TrackerWidget />
			</div>

			<div className={styles["span-1"]}>
				<Suspense fallback={<WidgetFallback minHeight={220} />}>
					<ActivityChart />
				</Suspense>
			</div>
			<div className={styles["span-1"]}>
				<QuickActions onToggleChatbot={() => setIsChatbotOpen((prev) => !prev)} />
			</div>

			<ViewportMount className={styles["span-2"]} minHeight={280}>
				<Suspense fallback={<WidgetFallback minHeight={280} />}>
					<HealthHistoryWidget />
				</Suspense>
			</ViewportMount>

			<ViewportMount className={styles["span-2"]} minHeight={360}>
				<Suspense fallback={<WidgetFallback minHeight={360} />}>
					<ConcernsWidget category={category || "total"} />
				</Suspense>
			</ViewportMount>

			<ViewportMount className={styles["span-2"]} minHeight={280}>
				<Suspense fallback={<WidgetFallback minHeight={280} />}>
					<SystemDetailWidget category={category} />
				</Suspense>
			</ViewportMount>
		</div>
	);

	return (
		<div
			data-dashboard
			className={`${styles["Dashboard-layout"]} ${pageIn ? styles.pageIn : ""}`}
		>
			<CameraProvider>
				<div className={styles["Dashboard-content"]}>
					<div className={styles.bgLayer} aria-hidden>
						<div className={styles.bgGrid} />
						<div className={styles.bgGlow} />
					</div>

					<div ref={leftColumnRef} className={styles["Dashboard-left"]}>
						<div className={styles["Dashboard-dt-container"]}>
							<div className={styles["Dashboard-model"]}>
								<Suspense fallback={<WidgetFallback minHeight={400} />}>
									<MainScene
										selectedCategory={selectedCategory || "total"}
										sidebarCollapsed={isMobile ? !isSidebarOpen : undefined}
										onSidebarToggle={isMobile ? toggleSidebar : undefined}
										onSidebarSelectionMade={
											isMobile ? () => setIsSidebarOpen(false) : undefined
										}
										isPaused={
											!isModelVisible || (isMobile && isDrawerOpen)
										}
									/>
								</Suspense>
							</div>
						</div>
					</div>

					{!isMobile && widgetsContent}
				</div>

				{isMobile && (
					<div className={styles["floating-dock"]}>
						<button
							type="button"
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
								<circle cx='12' cy='4' r='2.5' />
								<path d='M12 6.5V14' />
								<path d='M8 9.5L12 8L16 9.5' />
								<path d='M12 14L9 21' />
								<path d='M12 14L15 21' />
							</svg>
							<span className={styles["dock-label"]}>Body</span>
						</button>

						<div className={styles["dock-divider"]} />

						<button
							type="button"
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
								<rect x='3' y='3' width='7' height='7' rx='1.5' />
								<rect x='14' y='3' width='7' height='7' rx='1.5' />
								<rect x='3' y='14' width='7' height='7' rx='1.5' />
								<rect x='14' y='14' width='7' height='7' rx='1.5' />
							</svg>
							<span className={styles["dock-label"]}>Insights</span>
						</button>
					</div>
				)}

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
									type="button"
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
							<div ref={setDrawerBodyRef} className={styles["drawer-body"]}>
								{mobileWidgetsReady ? widgetsContent : null}
							</div>
						</div>
					</>
				)}
			</CameraProvider>

			<DeferredMount minHeight={0} timeout={1200}>
				<Suspense fallback={null}>
					<CtaModal />
				</Suspense>
			</DeferredMount>

			{isChatbotOpen && (
				<div
					className={styles["chatbot-modal-overlay"]}
					onClick={() => setIsChatbotOpen(false)}
				>
					<div
						className={styles["chatbot-modal-content"]}
						onClick={(e) => e.stopPropagation()}
					>
						<TriageWidget onClose={() => setIsChatbotOpen(false)} />
					</div>
				</div>
			)}
		</div>
	);
};

export default Dashboard;
