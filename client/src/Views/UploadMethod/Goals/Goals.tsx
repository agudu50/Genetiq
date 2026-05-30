import { useState, useMemo, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { HealthGoal, toggleGoal, updateGoalProgress, addGoal, setGoals } from "@/App/Redux/goalSlice";
import { LocalVault } from "@/App/Services/LocalVault";
import { motion, AnimatePresence } from "framer-motion";
import { 
	Check, 
	Sparkles, 
	Trophy, 
	LayoutGrid, 
	Apple, 
	Activity, 
	Moon, 
	Brain, 
	Flame, 
	Zap, 
	Award,
	Plus,
	Minus,
	Settings,
	ChevronDown,
	ChevronUp,
	Heart,
	TrendingUp,
	Target,
	ShieldAlert,
	ShieldCheck
} from "lucide-react";
import styles from "./Goals.module.scss";

const Goals = () => {
	const dispatch = useDispatch();
	const {
		items: goals,
		streakCount,
		totalHealthScore,
	} = useSelector((state: RootState) => state.goals);
	const [activeCategory, setActiveCategory] = useState<string>("All");

	// State for custom goal form
	const [isCustomOpen, setIsCustomOpen] = useState(false);
	const [customTitle, setCustomTitle] = useState("");
	const [customCategory, setCustomCategory] = useState<HealthGoal["category"]>("Activity");
	const [customTarget, setCustomTarget] = useState("");
	const [customUnit, setCustomUnit] = useState("min");
	const [customDesc, setCustomDesc] = useState("");

	// Load goals on mount from LocalVault (ensuring refresh works and no defaults are pre-checked unless saved)
	useEffect(() => {
		const loadSavedGoals = async () => {
			const saved = await LocalVault.get<HealthGoal[]>("user_goals");
			if (saved && Array.isArray(saved) && saved.length > 0) {
				dispatch(setGoals(saved));
			} else {
				// If nothing is saved, save the current unchecked state of goals
				await LocalVault.save("user_goals", goals);
			}
		};
		loadSavedGoals();
	}, [dispatch]);

	const filteredGoals = useMemo(() => {
		return goals.filter(
			(g: HealthGoal) =>
				activeCategory === "All" || g.category === activeCategory,
		);
	}, [goals, activeCategory]);

	// Interactive Progress Loggers (steppers)
	const handleProgressChange = useCallback(
		async (id: string, change: number) => {
			const goal = goals.find((g) => g.id === id);
			if (!goal) return;

			const targetVal = parseFloat(goal.target_value) || 1;
			const currentVal = parseFloat(goal.current_value) || 0;
			const newVal = Math.max(0, Math.min(targetVal, currentVal + change));
			const progress = Math.min(100, Math.round((newVal / targetVal) * 100));

			dispatch(updateGoalProgress({ id, current: newVal.toString(), progress }));
			
			// Mark as completed if hits 100%
			let isCompleted = goal.completed;
			if (newVal === targetVal && !goal.completed) {
				dispatch(toggleGoal(id));
				isCompleted = true;
			} else if (newVal < targetVal && goal.completed) {
				dispatch(toggleGoal(id));
				isCompleted = false;
			}

			// Sync back to LocalVault
			const updatedGoals = goals.map((g) =>
				g.id === id 
					? { ...g, current_value: newVal.toString(), progress, completed: isCompleted } 
					: g
			);
			await LocalVault.save("user_goals", updatedGoals);
		},
		[dispatch, goals]
	);

	const handleToggle = useCallback(
		async (id: string) => {
			dispatch(toggleGoal(id));
			const goal = goals.find((g) => g.id === id);
			const updatedGoals = goals.map((g: HealthGoal) =>
				g.id === id ? { ...g, completed: !g.completed, current_value: !g.completed ? g.target_value : "0", progress: !g.completed ? 100 : 0 } : g,
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

	// Create Custom Goal Handler
	const handleCreateGoal = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!customTitle || !customTarget) return;

			const newGoal: HealthGoal = {
				id: `custom-goal-${Date.now()}`,
				category: customCategory,
				title: customTitle,
				description: customDesc || `Daily target of ${customTarget} ${customUnit}`,
				target_value: customTarget,
				current_value: "0",
				unit: customUnit,
				progress: 0,
				status: "In Progress",
				trend: "stable",
				streak: 0,
				completed: false,
			};

			dispatch(addGoal(newGoal));

			// Sync back to LocalVault
			const updatedGoals = [...goals, newGoal];
			await LocalVault.save("user_goals", updatedGoals);

			// Reset form
			setCustomTitle("");
			setCustomTarget("");
			setCustomDesc("");
			setIsCustomOpen(false);
		},
		[dispatch, goals, customTitle, customCategory, customTarget, customUnit, customDesc]
	);

	// Recommended AI Bio-Goals
	const suggestedGoals = useMemo(() => {
		return [
			{
				category: "Nutrition" as const,
				title: "Oxidative Shield",
				description: "Intake 1500mg antioxidants daily.",
				target_value: "1500",
				unit: "mg",
			},
			{
				category: "Activity" as const,
				title: "VO2 Max Burst",
				description: "20 min of high-intensity cardio.",
				target_value: "20",
				unit: "min",
			},
			{
				category: "Sleep" as const,
				title: "Circadian Sun Align",
				description: "15 min natural sunlight by 8 AM.",
				target_value: "15",
				unit: "min",
			},
			{
				category: "Mind" as const,
				title: "HRV Breath Reset",
				description: "15 min deep diaphragmatic breaths.",
				target_value: "15",
				unit: "min",
			},
		].filter(
			(s) => !goals.some((g) => g.title === s.title)
		);
	}, [goals]);

	// Add Recommended Goal Handler
	const handleAddSuggestedGoal = useCallback(
		async (suggested: typeof suggestedGoals[0]) => {
			const newGoal: HealthGoal = {
				id: `suggested-goal-${Date.now()}`,
				category: suggested.category,
				title: suggested.title,
				description: suggested.description,
				target_value: suggested.target_value,
				current_value: "0",
				unit: suggested.unit,
				progress: 0,
				status: "In Progress",
				trend: "stable",
				streak: 0,
				completed: false,
			};

			dispatch(addGoal(newGoal));

			// Sync back to LocalVault
			const updatedGoals = [...goals, newGoal];
			await LocalVault.save("user_goals", updatedGoals);
		},
		[dispatch, goals]
	);

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case "Nutrition":
				return <Apple size={12} />;
			case "Activity":
				return <Activity size={12} />;
			case "Sleep":
				return <Moon size={12} />;
			case "Mind":
				return <Brain size={12} />;
			default:
				return <LayoutGrid size={12} />;
		}
	};

	const categories = [
		{ name: "All", icon: <LayoutGrid size={13} /> },
		{ name: "Nutrition", icon: <Apple size={13} /> },
		{ name: "Activity", icon: <Activity size={13} /> },
		{ name: "Sleep", icon: <Moon size={13} /> },
		{ name: "Mind", icon: <Brain size={13} /> },
	] as const;

	// Analytics computations for added rich content
	const totalGoalsCount = goals.length;
	const completedGoalsCount = goals.filter((g) => g.completed).length;
	const mintedNFTCount = goals.filter((g) => g.suiMilestoneHash).length;
	const totalBioPoints = completedGoalsCount * 10;

	return (
		<div className={styles["goals-container"]}>
			<div className={styles["goals-content"]}>
				{/* Top Header Row */}
				<div className={styles["header"]}>
					<div className={styles["header-text"]}>
						<h1 className={styles["title"]}>
							<span className={styles["gradient-muted"]}>Action</span>{" "}
							<span className={styles["gradient-primary"]}>Plan</span>
						</h1>
						<p className={styles["subtitle"]}>
							Translating AI bio-insights into daily health metrics. Adjust your progress and build custom routines.
						</p>
					</div>

					{/* Day Streak Widget */}
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
							<div className={styles["streak-icon-wrapper"]}>
								<Flame size={16} className={styles["flame-icon"]} />
							</div>
						</div>
						<div className={styles["streak-info"]}>
							<div className={styles["streak-count-row"]}>
								<span className={styles["streak-number"]}>{streakCount}</span>
								<span className={styles["streak-days"]}>Days</span>
							</div>
							<span className={styles["streak-label"]}>Active Streak</span>
						</div>
					</div>
				</div>

				{/* AI Assistant Insight Suggestion */}
				<div className={styles["ai-suggestions"]}>
					<div className={styles["suggestion-card"]}>
						<div className={styles["suggestion-sparkle-bg"]} />
						<div className={styles["suggestion-icon-wrapper"]}>
							<Sparkles size={16} className={styles["sparkles-icon"]} />
						</div>
						<div className={styles["suggestion-text"]}>
							<p>
								<strong className={styles["ai-tag"]}>AI Insight:</strong> Your Heart Rate Variability (HRV)
								is 15% lower than baseline. Consider prioritizing the "Deep Breath" mindfulness goal
								today to restore metabolic equilibrium.
							</p>
						</div>
					</div>
				</div>

				{/* NEW CONTENT SECTION: Weekly Progress Analytics Dashboard Row */}
				<div className={styles["analytics-row"]}>
					<div className={styles["analytic-card"]}>
						<div className={styles["analytic-icon-wrapper"]}>
							<Target size={16} />
						</div>
						<div className={styles["analytic-info"]}>
							<span className={styles["analytic-label"]}>Active Goals</span>
							<span className={styles["analytic-value"]}>{totalGoalsCount} Habits</span>
						</div>
					</div>

					<div className={styles["analytic-card"]}>
						<div className={styles["analytic-icon-wrapper"]}>
							<TrendingUp size={16} />
						</div>
						<div className={styles["analytic-info"]}>
							<span className={styles["analytic-label"]}>Completed Today</span>
							<span className={styles["analytic-value"]}>{completedGoalsCount} of {totalGoalsCount}</span>
						</div>
					</div>

					<div className={styles["analytic-card"]}>
						<div className={styles["analytic-icon-wrapper"]}>
							<Zap size={16} />
						</div>
						<div className={styles["analytic-info"]}>
							<span className={styles["analytic-label"]}>Earned Bio-Points</span>
							<span className={styles["analytic-value"]}>{totalBioPoints} pts</span>
						</div>
					</div>

					<div className={styles["analytic-card"]}>
						<div className={styles["analytic-icon-wrapper"]}>
							<Trophy size={16} />
						</div>
						<div className={styles["analytic-info"]}>
							<span className={styles["analytic-label"]}>Sui SBT Milestones</span>
							<span className={styles["analytic-value"]}>{mintedNFTCount} Minted</span>
						</div>
					</div>
				</div>

				{/* Collapsible Custom Goal Builder Form */}
				<div className={styles["custom-goal-builder"]}>
					<button 
						className={styles["toggle-custom-btn"]} 
						onClick={() => setIsCustomOpen(!isCustomOpen)}
					>
						<div className={styles["btn-label"]}>
							<Settings size={15} />
							<span>Configure Custom Bio-Habit</span>
						</div>
						{isCustomOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
					</button>

					<AnimatePresence>
						{isCustomOpen && (
							<motion.form
								onSubmit={handleCreateGoal}
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.3 }}
								className={styles["custom-form"]}
							>
								<div className={styles["form-grid"]}>
									<div className={styles["input-group"]}>
										<label>Goal Name</label>
										<input 
											type="text" 
											placeholder="e.g. Morning Hydration Boost" 
											value={customTitle} 
											onChange={(e) => setCustomTitle(e.target.value)} 
											required 
										/>
									</div>

									<div className={styles["input-row"]}>
										<div className={styles["input-group"]}>
											<label>Category</label>
											<select 
												value={customCategory} 
												onChange={(e) => setCustomCategory(e.target.value as HealthGoal["category"])}
											>
												<option value="Nutrition">Nutrition</option>
												<option value="Activity">Activity</option>
												<option value="Sleep">Sleep</option>
												<option value="Mind">Mind</option>
											</select>
										</div>

										<div className={styles["input-group"]}>
											<label>Daily Target</label>
											<input 
												type="number" 
												placeholder="e.g. 3000" 
												value={customTarget} 
												onChange={(e) => setCustomTarget(e.target.value)} 
												min="1" 
												required 
											/>
										</div>

										<div className={styles["input-group"]}>
											<label>Unit</label>
											<input 
												type="text" 
												placeholder="e.g. ml, min, steps" 
												value={customUnit} 
												onChange={(e) => setCustomUnit(e.target.value)} 
												required 
											/>
										</div>
									</div>

									<div className={styles["input-group"]}>
										<label>Description (Optional)</label>
										<input 
											type="text" 
											placeholder="e.g. Drink 3000ml of raw structured spring water daily." 
											value={customDesc} 
											onChange={(e) => setCustomDesc(e.target.value)} 
										/>
									</div>

									<button type="submit" className={styles["submit-btn"]}>
										<Plus size={14} />
										<span>Activate Goal</span>
									</button>
								</div>
							</motion.form>
						)}
					</AnimatePresence>
				</div>

				{/* Navigation/Category Filter Row */}
				<div className={styles["filter-row"]}>
					{categories.map((cat) => (
						<button
							key={cat.name}
							className={`${styles["filter-btn"]} ${activeCategory === cat.name ? styles["active"] : ""}`}
							onClick={() => setActiveCategory(cat.name)}
						>
							<span className={styles["filter-icon"]}>{cat.icon}</span>
							<span>{cat.name}</span>
						</button>
					))}
				</div>

				{/* Active Goals Grid */}
				<div className={styles["goals-grid"]}>
					<AnimatePresence mode='popLayout'>
						{filteredGoals.map((goal, index) => {
							const targetVal = parseFloat(goal.target_value) || 1;
							
							return (
								<motion.div
									key={goal.id}
									layout
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ duration: 0.25, delay: index * 0.04 }}
									className={`${styles["goal-card"]} ${goal.completed ? styles["completed"] : ""} ${styles[goal.category.toLowerCase()]}`}
								>
									<div className={styles["card-mesh-bg"]} />
									<div className={styles["card-outline-glow"]} />
									
									{/* Checkbox */}
									<div
										className={`${styles["checkbox"]} ${goal.completed ? styles["checked"] : ""}`}
										onClick={() => handleToggle(goal.id)}
									>
										{goal.completed && <Check size={12} strokeWidth={3.5} />}
									</div>

									<div className={styles["goal-info"]}>
										<h3 className={styles["goal-title"]}>{goal.title}</h3>
										<p className={styles["goal-desc"]}>{goal.description}</p>
										
										{/* Active Stepper Control */}
										<div className={styles["stepper-container"]}>
											<span className={styles["stepper-label"]}>Logged Progress</span>
											<div className={styles["stepper-controls"]}>
												<button 
													type="button" 
													className={styles["step-btn"]} 
													onClick={() => handleProgressChange(goal.id, -(targetVal * 0.1))}
													disabled={goal.completed}
												>
													<Minus size={11} />
												</button>
												<span className={styles["stepper-value"]}>
													<strong>{goal.current_value}</strong> / {goal.target_value} {goal.unit}
												</span>
												<button 
													type="button" 
													className={styles["step-btn"]} 
													onClick={() => handleProgressChange(goal.id, targetVal * 0.1)}
													disabled={goal.completed}
												>
													<Plus size={11} />
												</button>
											</div>
										</div>

										{/* Progress details */}
										<div className={styles["progress-bar-details"]}>
											<div className={styles["progress-track"]}>
												<div 
													className={styles["progress-fill"]} 
													style={{ width: `${goal.progress}%` }}
												/>
											</div>
											<span className={styles["progress-text"]}>{goal.progress}% Completed</span>
										</div>

										<div className={styles["goal-footer"]}>
											<span className={styles["category-tag"]}>
												{getCategoryIcon(goal.category)}
												<span>{goal.category}</span>
											</span>
											<span className={styles["reward"]}>
												<Zap size={11} className={styles["reward-icon"]} />
												<span>+10 Bio-Points</span>
											</span>
										</div>
									</div>

									{/* Web3 Milestone Minting */}
									{goal.completed && goal.streak >= 7 && (
										<button
											className={styles["mint-btn"]}
											onClick={() => handleMintNFT(goal.id)}
											title='Mint zkLogin Soul-Bound NFT'
										>
											<Trophy size={14} />
										</button>
									)}
								</motion.div>
							);
						})}
					</AnimatePresence>
				</div>

				{/* Suggested AI Bio-Goals Panel */}
				{suggestedGoals.length > 0 && (
					<div className={styles["suggested-panel"]}>
						<div className={styles["suggested-header"]}>
							<Heart size={16} className={styles["heart-icon"]} />
							<h3>Suggested DNA Bio-Goals</h3>
						</div>
						<div className={styles["suggested-grid"]}>
							{suggestedGoals.map((s) => (
								<div 
									key={s.title} 
									className={`${styles["suggested-card"]} ${s.category.toLowerCase()}`}
								>
									<div className={styles["suggested-spark"]} />
									<div className={styles["suggested-info"]}>
										<div className={styles["suggested-category"]}>
											{getCategoryIcon(s.category)}
											<span>{s.category} • Precision DNA Suggestion</span>
										</div>
										<h4 className={styles["suggested-title"]}>{s.title}</h4>
										<p className={styles["suggested-desc"]}>{s.description}</p>
									</div>
									<button 
										className={styles["add-suggested-btn"]}
										onClick={() => handleAddSuggestedGoal(s)}
										title="Add to Action Plan"
									>
										<Plus size={14} />
										<span>Add Goal</span>
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Diagnostic Health Grade Widget */}
				<div className={styles["health-score-widget"]}>
					<div className={styles["score-mesh"]} />
					<div className={styles["score-glow"]} />
					<div className={styles["score-info"]}>
						<div className={styles["score-header-row"]}>
							<Award size={18} className={styles["award-icon"]} />
							<h3>Current Health Score</h3>
						</div>
						<p>Dynamic assessment calculated from your last 24h biometrics, activity, and plan compliance.</p>
						
						{/* Progress bar visual indicator */}
						<div className={styles["progress-bar-container"]}>
							<div 
								className={styles["progress-bar-fill"]} 
								style={{ width: `${totalHealthScore}%` }}
							/>
						</div>
					</div>
					<div className={styles["score-value"]}>
						<span className={styles["number"]}>{totalHealthScore}</span>
						<span className={styles["unit"]}>%</span>
					</div>
				</div>

				{/* NEW CONTENT SECTION: Science-backed Habits FAQ/Guide */}
				<div className={styles["faq-panel"]}>
					<div className={styles["faq-header"]}>
						<Sparkles size={16} className={styles["faq-icon"]} />
						<h3>Why Gamified Genetic Habits Work</h3>
					</div>
					<div className={styles["faq-content"]}>
						<div className={styles["faq-item"]}>
							<h4>🧬 Gene-Environment Synergy (Epigenetics)</h4>
							<p>Your genes are not your destiny. They act as blueprints that respond dynamically to daily activities, light, nutrition, and stress management. By ticking off goals, you actively regulate gene expression to promote cellular longevity.</p>
						</div>
						<div className={styles["faq-item"]}>
							<h4>🔗 Soulbound NFTs & zkLogin Verification</h4>
							<p>Achieving a 7-day consistency streak validates your biological dedication. Genetiq secures these milestones by minting permanent, zero-knowledge verifiable health SBTs on SUI Blockchain, securing your credentials securely.</p>
						</div>
					</div>
				</div>

				{/* Vault Sync Status Footer */}
				<div className={styles["offline-notice"]}>
					<div className={styles["status-indicator"]}>
						<div className={styles["status-dot"]} />
						<div className={styles["status-pulse"]} />
					</div>
					<span>Vault Synced • Decentralized Health Record Protected</span>
				</div>
			</div>
		</div>
	);
};

export default Goals;
