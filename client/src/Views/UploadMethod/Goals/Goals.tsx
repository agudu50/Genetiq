import { useState, useMemo, useCallback, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { HealthGoal, toggleGoal } from "@/App/Redux/goalSlice";
import { LocalVault } from "@/App/Services/LocalVault";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Goals.module.scss";

const CheckIcon = memo(() => (
	<svg
		width='18'
		height='18'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='3'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<polyline points='20 6 9 17 4 12' />
	</svg>
));

const SparklesIcon = memo(() => (
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
		<path d='m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' />
	</svg>
));

const TrophyIcon = memo(() => (
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
		<path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6' />
		<path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18' />
		<path d='M4 22h16' />
		<path d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22' />
		<path d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22' />
		<circle cx='12' cy='8' r='7' />
	</svg>
));

const Goals = () => {
	const dispatch = useDispatch();
	const {
		items: goals,
		streakCount,
		totalHealthScore,
	} = useSelector((state: RootState) => state.goals);
	const [activeCategory, setActiveCategory] = useState<string>("All");

	const filteredGoals = useMemo(() => {
		return goals.filter(
			(g: HealthGoal) =>
				activeCategory === "All" || g.category === activeCategory,
		);
	}, [goals, activeCategory]);

	const handleToggle = useCallback(
		async (id: string) => {
			dispatch(toggleGoal(id));
			const updatedGoals = goals.map((g: HealthGoal) =>
				g.id === id ? { ...g, completed: !g.completed } : g,
			);
			await LocalVault.save("user_goals", updatedGoals);
		},
		[dispatch, goals],
	);

	const handleMintNFT = useCallback((id: string) => {
		alert(
			`Minting Soul-bound Health Milestone NFT for goal ${id} on Sui Blockchain...\nTransaction Hash pending approval from zkLogin.`,
		);
	}, []);

	return (
		<div className={styles["goals-container"]}>
			<div className={styles["goals-content"]}>
				<div className={styles["header"]}>
					<div className={styles["header-text"]}>
						<h1 className={styles["title"]}>
							<span className='text-gradient-muted'>Action</span>{" "}
							<span className='text-gradient-primary'>Plan</span>
						</h1>
						<p className={styles["subtitle"]}>
							Translating AI insights into daily habits. Gamified progress
							secured on Sui.
						</p>
					</div>
					<div className={styles["streak-badge"]}>
						<div className={styles["streak-ring"]}>
							<svg viewBox='0 0 36 36' className={styles["circular-chart"]}>
								<path
									className={styles["circle-bg"]}
									d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
								/>
								<path
									className={styles["circle"]}
									strokeDasharray={`${streakCount * 10}, 100`}
									d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
								/>
							</svg>
							<span className={styles["streak-number"]}>{streakCount}</span>
						</div>
						<div className={styles["streak-info"]}>
							<span className={styles["label"]}>Day Streak</span>
							<span className={styles["value"]}>Personal Best!</span>
						</div>
					</div>
				</div>

				<div className={styles["ai-suggestions"]}>
					<div className={styles["suggestion-card"]}>
						<SparklesIcon />
						<div className={styles["suggestion-text"]}>
							<p>
								<strong>AI Insight:</strong> Your Heart Rate Variability (HRV)
								is 15% lower than baseline. Consider the "Deep Breath" goal
								today.
							</p>
						</div>
					</div>
				</div>

				<div className={styles["filter-row"]}>
					{(["All", "Nutrition", "Activity", "Sleep", "Mind"] as const).map(
						(cat) => (
							<button
								key={cat}
								className={`${styles["filter-btn"]} ${activeCategory === cat ? styles["active"] : ""}`}
								onClick={() => setActiveCategory(cat)}
							>
								{cat}
							</button>
						),
					)}
				</div>

				<div className={styles["goals-grid"]}>
					<AnimatePresence mode='popLayout'>
						{filteredGoals.map((goal, index) => (
							<motion.div
								key={goal.id}
								layout
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, scale: 0.9 }}
								transition={{ duration: 0.2, delay: index * 0.05 }}
								className={`${styles["goal-card"]} ${goal.completed ? styles["completed"] : ""}`}
							>
								<div
									className={styles["checkbox"]}
									onClick={() => handleToggle(goal.id)}
								>
									{goal.completed && <CheckIcon />}
								</div>
								<div className={styles["goal-info"]}>
									<h3 className={styles["goal-title"]}>{goal.title}</h3>
									<div className={styles["goal-footer"]}>
										<span className={styles["category-tag"]}>
											{goal.category}
										</span>
										<span className={styles["reward"]}>+10 Health Points</span>
									</div>
								</div>
								{goal.completed && goal.streak >= 7 && (
									<button
										className={styles["mint-btn"]}
										onClick={() => handleMintNFT(goal.id)}
										title='Mint Milestone NFT'
									>
										<TrophyIcon />
									</button>
								)}
							</motion.div>
						))}
					</AnimatePresence>
				</div>

				<div className={styles["health-score-widget"]}>
					<div className={styles["score-info"]}>
						<h3>Current Health Grade</h3>
						<p>Reflecting your last 24h of activity and goal adherence.</p>
					</div>
					<div className={styles["score-value"]}>
						<span className={styles["number"]}>{totalHealthScore}</span>
						<span className={styles["unit"]}>%</span>
					</div>
				</div>

				<div className={styles["offline-notice"]}>
					<div className={styles["notice-dot"]}></div>
					<span>Offline Mode Active • Data syncing to Genetiq Vault</span>
				</div>
			</div>
		</div>
	);
};

export default Goals;
