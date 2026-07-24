import { useState, useMemo, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { HealthGoal, toggleGoal, updateGoalProgress, addGoal, setGoals } from "@/App/Redux/goalSlice";
import { LocalVault } from "@/App/Services/LocalVault";
import { motion, AnimatePresence } from "framer-motion";
import { 
	Check, 
	Sparkles, 
	LayoutGrid, 
	Apple, 
	Activity, 
	Moon, 
	Brain, 
	Flame, 
	Zap, 
	Plus,
	Minus,
	Heart,
	TrendingUp,
	Target,
	Scale,
	Utensils,
	Sun,
	X,
	Lock,
	Award
} from "lucide-react";
import styles from "./Goals.module.scss";

const DIET_TEMPLATES = {
	lose: {
		default: {
			name: "Healthy Fat Burning Diet",
			macro: { protein: 30, fat: 55, carbs: 15 },
			desc: "Helps you burn fat for energy using healthy oils and fresh foods. Keeps your heart healthy and protects your muscles.",
			habits: [
				{ title: "Eat less sugar and starch", description: "Eat less bread, rice, and sweets to help your body burn fat.", target_value: "50", unit: "g", session: "Morning" },
				{ title: "Use healthy olive oil", description: "Have 2 spoons of olive oil every day.", target_value: "2", unit: "tbsp", session: "Afternoon" },
				{ title: "Eat green vegetables", description: "Eat at least 3 cups of green veggies like spinach or salad.", target_value: "3", unit: "cups", session: "Evening" }
			]
		},
		respiratory: {
			name: "Lung-Friendly Fat Burning Diet",
			macro: { protein: 25, fat: 60, carbs: 15 },
			desc: "Full of healthy fats and clean foods that help lower swelling in your lungs. Helps you breathe easier.",
			habits: [
				{ title: "Eat healthy fish and nuts", description: "Eat foods like salmon, walnuts, or seeds that fight swelling.", target_value: "3", unit: "servings", session: "Afternoon" },
				{ title: "Drink green tea", description: "Drink 2 cups of green tea to protect your body's cells.", target_value: "2", unit: "cups", session: "Morning" },
				{ title: "Eat less sugar", description: "Keep sugar under 20 grams a day to prevent swelling.", target_value: "20", unit: "g", session: "Evening" }
			]
		},
		cardio: {
			name: "Heart-Healthy Fat Burning Diet",
			macro: { protein: 30, fat: 45, carbs: 25 },
			desc: "A low-salt food plan that is great for your blood flow, blood pressure, and heart health.",
			habits: [
				{ title: "Eat red beets and greens", description: "Eat foods like beets and salad greens to help your blood flow better.", target_value: "2", unit: "servings", session: "Afternoon" },
				{ title: "Eat less salt", description: "Keep total salt intake below 1500mg daily.", target_value: "1500", unit: "mg", session: "Evening" },
				{ title: "Take healthy fish oil", description: "Get enough healthy oils from fish or soft gels.", target_value: "2000", unit: "mg", session: "Morning" }
			]
		}
	},
	maintain: {
		default: {
			name: "Simple Whole Foods Diet",
			macro: { protein: 30, fat: 35, carbs: 35 },
			desc: "A simple food plan made of real, unprocessed foods. Keeps your energy steady and your body in balance.",
			habits: [
				{ title: "Drink enough water", description: "Drink water through the day to stay hydrated.", target_value: "3000", unit: "ml", session: "Morning" },
				{ title: "Eat high fiber foods", description: "Eat 35 grams of fiber from vegetables and oats to help your stomach.", target_value: "35", unit: "g", session: "Afternoon" },
				{ title: "Choose real foods", description: "Make sure almost all your food comes from real, natural ingredients.", target_value: "90", unit: "%", session: "Evening" }
			]
		},
		respiratory: {
			name: "Lung-Protecting Whole Food Diet",
			macro: { protein: 30, fat: 35, carbs: 35 },
			desc: "Protects your throat and lungs using clean, natural foods that support your immune system.",
			habits: [
				{ title: "Eat berries and nuts", description: "Eat oranges, berries, and almonds to protect your cells.", target_value: "4", unit: "servings", session: "Afternoon" },
				{ title: "Drink warm broth", description: "Have a cup of bone broth or collagen to keep your body walls strong.", target_value: "1", unit: "cup", session: "Evening" },
				{ title: "Drink water for lungs", description: "Drink plenty of water to keep your airways clear and clean.", target_value: "3500", unit: "ml", session: "Morning" }
			]
		},
		cardio: {
			name: "Heart-Protecting Whole Food Diet",
			macro: { protein: 25, fat: 40, carbs: 35 },
			desc: "Helps your heart heal and work well. Uses clean proteins and fats that are good for your blood vessels.",
			habits: [
				{ title: "Eat fresh garlic", description: "Eat a clove of fresh garlic to help keep your cholesterol healthy.", target_value: "1", unit: "clove", session: "Morning" },
				{ title: "Eat bananas and avocados", description: "Eat foods like bananas, spinach, and avocados to support your heart.", target_value: "3", unit: "servings", session: "Afternoon" },
				{ title: "Eat heart-friendly foods", description: "Eat foods like spinach, meat, or sesame seeds for cellular energy.", target_value: "2", unit: "servings", session: "Evening" }
			]
		}
	},
	gain: {
		default: {
			name: "Clean Muscle Building Diet",
			macro: { protein: 35, fat: 25, carbs: 40 },
			desc: "A high-protein plan to help you build clean muscle and store energy without gaining bad fat.",
			habits: [
				{ title: "Eat enough protein", description: "Eat 140 grams of clean protein from meat, eggs, or plants daily.", target_value: "140", unit: "g", session: "Afternoon" },
				{ title: "Eat extra clean calories", description: "Eat about 300 extra calories of healthy food each day.", target_value: "300", unit: "kcal", session: "Evening" },
				{ title: "Eat carbs before exercise", description: "Eat foods like oats or rice 90 minutes before you work out.", target_value: "75", unit: "g", session: "Morning" }
			]
		},
		respiratory: {
			name: "Lung-Supporting Muscle Diet",
			macro: { protein: 35, fat: 30, carbs: 35 },
			desc: "Helps you gain clean weight and build muscle while giving your cells and lungs the energy to recover.",
			habits: [
				{ title: "Eat lean protein", description: "Eat 150 grams of chicken, fish, or eggs to build muscle.", target_value: "150", unit: "g", session: "Afternoon" },
				{ title: "Eat vitamin rich foods", description: "Eat foods with vitamins, iron, and magnesium to boost your cell energy.", target_value: "3", unit: "servings", session: "Morning" },
				{ title: "Take healthy fish oils", description: "Take healthy oils to help your body and lungs heal after heavy exercise.", target_value: "2000", unit: "mg", session: "Evening" }
			]
		},
		cardio: {
			name: "Heart-Safe Muscle Diet",
			macro: { protein: 35, fat: 30, carbs: 35 },
			desc: "Helps you build strong muscles while keeping your heart and blood vessels safe from heavy lifting strain.",
			habits: [
				{ title: "Eat clean protein", description: "Eat fish, egg whites, and clean protein powders.", target_value: "160", unit: "g", session: "Afternoon" },
				{ title: "Eat seeds and poultry", description: "Eat seeds and chicken to help your blood vessels relax and open up.", target_value: "2", unit: "servings", session: "Evening" },
				{ title: "Drink water while lifting", description: "Drink plenty of water while you exercise to keep your blood flowing smoothly.", target_value: "4000", unit: "ml", session: "Morning" }
			]
		}
	}
};

const getRealTimeSession = () => {
	const hour = new Date().getHours();
	if (hour >= 5 && hour < 12) return "Morning";
	if (hour >= 12 && hour < 17) return "Afternoon";
	return "Evening";
};

const Goals = () => {
	const dispatch = useDispatch();
	const {
		items: goals,
		streakCount,
		totalHealthScore,
	} = useSelector((state: RootState) => state.goals);
	const activeAlerts = useSelector((state: RootState) => state.triage.activeAlerts);
	
	const [activeCategory, setActiveCategory] = useState<string>("All");
	const [activeSession, setActiveSession] = useState<"All" | "Morning" | "Afternoon" | "Evening">("All");

	// Weight goal state
	const [weightGoal, setWeightGoal] = useState<"lose" | "gain" | "maintain">(() => {
		return (localStorage.getItem("genetiq_weight_goal") as "lose" | "gain" | "maintain") || "maintain";
	});

	// Custom habit form state
	const [isCustomOpen, setIsCustomOpen] = useState(false);
	const [customTitle, setCustomTitle] = useState("");
	const [customCategory, setCustomCategory] = useState<HealthGoal["category"]>("Activity");
	const [customSession, setCustomSession] = useState<"Morning" | "Afternoon" | "Evening">(getRealTimeSession);
	const [customTarget, setCustomTarget] = useState("");
	const [customUnit, setCustomUnit] = useState("min");
	const [customDesc, setCustomDesc] = useState("");

	const handleWeightGoalChange = useCallback((goal: "lose" | "gain" | "maintain") => {
		setWeightGoal(goal);
		localStorage.setItem("genetiq_weight_goal", goal);
	}, []);

	const activeDietPlan = useMemo(() => {
		const isRespiratory = activeAlerts.some((a) => a.system.includes("Respiratory"));
		const isCardio = activeAlerts.some((a) => a.system.includes("Cardio") || a.system.includes("Cardiac"));
		
		const category = isRespiratory ? "respiratory" : isCardio ? "cardio" : "default";
		const template = DIET_TEMPLATES[weightGoal][category];
		
		const habitsAdded = template.habits.every((th) => 
			goals.some((g) => g.title === th.title)
		);

		return {
			...template,
			habitsAdded,
			categoryText: isRespiratory ? "Lung Health Warning" : isCardio ? "Heart Health Warning" : "Healthy Body Guide",
		};
	}, [weightGoal, activeAlerts, goals]);

	const handleActivateDietHabits = useCallback(async () => {
		let updatedGoals = [...goals];
		activeDietPlan.habits.forEach((th) => {
			if (!goals.some((g) => g.title === th.title)) {
				const newGoal: HealthGoal = {
					id: `diet-goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
					category: "Nutrition",
					title: th.title,
					description: th.description,
					target_value: th.target_value,
					current_value: "0",
					unit: th.unit,
					progress: 0,
					status: "In Progress",
					trend: "stable",
					streak: 0,
					completed: false,
					session: th.session as "Morning" | "Afternoon" | "Evening",
				};
				dispatch(addGoal(newGoal));
				updatedGoals.push(newGoal);
			}
		});
		await LocalVault.save("user_goals", updatedGoals);
	}, [dispatch, goals, activeDietPlan]);

	useEffect(() => {
		const loadSavedGoals = async () => {
			const saved = await LocalVault.get<HealthGoal[]>("user_goals");
			if (saved && Array.isArray(saved) && saved.length > 0) {
				dispatch(setGoals(saved));
			} else {
				await LocalVault.save("user_goals", goals);
			}
		};
		loadSavedGoals();
	}, [dispatch]);

	const getGoalSession = useCallback((goal: HealthGoal): "Morning" | "Afternoon" | "Evening" => {
		if (goal.session) return goal.session;
		const title = goal.title.toLowerCase();
		const desc = goal.description.toLowerCase();

		if (
			title.includes("morning") || title.includes("sun") || title.includes("wake") ||
			title.includes("am") || title.includes("hydration") || title.includes("water") ||
			desc.includes("morning") || desc.includes("wake")
		) {
			return "Morning";
		}
		if (
			title.includes("sleep") || title.includes("night") || title.includes("evening") ||
			title.includes("pm") || title.includes("breath") || title.includes("calm") ||
			desc.includes("sleep") || desc.includes("night")
		) {
			return "Evening";
		}
		return "Afternoon";
	}, []);

	const filteredGoals = useMemo(() => {
		return goals.filter((g: HealthGoal) => {
			const matchCategory = activeCategory === "All" || g.category === activeCategory;
			const matchSession = activeSession === "All" || getGoalSession(g) === activeSession;
			return matchCategory && matchSession;
		});
	}, [goals, activeCategory, activeSession, getGoalSession]);

	const handleProgressChange = useCallback(
		async (id: string, change: number) => {
			const goal = goals.find((g) => g.id === id);
			if (!goal) return;

			const targetVal = parseFloat(goal.target_value) || 1;
			const currentVal = parseFloat(goal.current_value) || 0;
			const newVal = Math.max(0, Math.min(targetVal, currentVal + change));
			const progress = Math.min(100, Math.round((newVal / targetVal) * 100));

			dispatch(updateGoalProgress({ id, current: newVal.toString(), progress }));
			
			let isCompleted = goal.completed;
			if (newVal === targetVal && !goal.completed) {
				dispatch(toggleGoal(id));
				isCompleted = true;
			} else if (newVal < targetVal && goal.completed) {
				dispatch(toggleGoal(id));
				isCompleted = false;
			}

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
			const updatedGoals = goals.map((g: HealthGoal) =>
				g.id === id ? { ...g, completed: !g.completed, current_value: !g.completed ? g.target_value : "0", progress: !g.completed ? 100 : 0 } : g,
			);
			await LocalVault.save("user_goals", updatedGoals);
		},
		[dispatch, goals],
	);

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
				session: customSession,
			};

			dispatch(addGoal(newGoal));

			const updatedGoals = [...goals, newGoal];
			await LocalVault.save("user_goals", updatedGoals);

			setCustomTitle("");
			setCustomTarget("");
			setCustomDesc("");
			setIsCustomOpen(false);
		},
		[dispatch, goals, customTitle, customCategory, customTarget, customUnit, customDesc, customSession]
	);

	const suggestedGoals = useMemo(() => {
		return [
			{
				category: "Nutrition" as const,
				title: "Cell Protection",
				description: "Eat foods with 1500mg of antioxidants (berries, nuts, greens) daily.",
				target_value: "1500",
				unit: "mg",
				session: "Afternoon",
			},
			{
				category: "Activity" as const,
				title: "Fast Heart Exercise",
				description: "Get 20 minutes of fast-paced exercise that makes you breathe hard.",
				target_value: "20",
				unit: "min",
				session: "Afternoon",
			},
			{
				category: "Sleep" as const,
				title: "Morning Sunlight",
				description: "Get 15 minutes of natural sunlight outside by 8 AM.",
				target_value: "15",
				unit: "min",
				session: "Morning",
			},
			{
				category: "Mind" as const,
				title: "Deep Breathing Reset",
				description: "Take deep, slow breaths for 15 minutes to calm your body.",
				target_value: "15",
				unit: "min",
				session: "Evening",
			},
		].filter((s) => !goals.some((g) => g.title === s.title));
	}, [goals]);

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
				session: suggested.session as "Morning" | "Afternoon" | "Evening",
			};

			dispatch(addGoal(newGoal));

			const updatedGoals = [...goals, newGoal];
			await LocalVault.save("user_goals", updatedGoals);
		},
		[dispatch, goals]
	);

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case "Nutrition":
				return <Apple size={13} />;
			case "Activity":
				return <Activity size={13} />;
			case "Sleep":
				return <Moon size={13} />;
			case "Mind":
				return <Brain size={13} />;
			default:
				return <LayoutGrid size={13} />;
		}
	};

	const categories = [
		{ name: "All", icon: <LayoutGrid size={13} /> },
		{ name: "Nutrition", icon: <Apple size={13} /> },
		{ name: "Activity", icon: <Activity size={13} /> },
		{ name: "Sleep", icon: <Moon size={13} /> },
		{ name: "Mind", icon: <Brain size={13} /> },
	] as const;

	const totalGoalsCount = goals.length;
	const completedGoalsCount = goals.filter((g) => g.completed).length;
	const totalBioPoints = completedGoalsCount * 10;
	const dailyProgressPercent = totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;

	return (
		<div className={styles.pageWrapper}>
			<div className={styles.goalsContainer}>
			{/* Hero Header Section */}
			<section className={styles.heroSection}>
				<div className={styles.heroGlowBg} aria-hidden />
				<div className={styles.heroInner}>
					<div className={styles.heroTitleGroup}>
						<span className={styles.eyebrowTag}>
							<Target size={12} />
							Daily Wellness Plan
						</span>
						<h1 className={styles.heroTitle}>
							Action <span className={styles.accentText}>Plan</span>
						</h1>
						<p className={styles.heroSubtitle}>
							Turn your health reports into simple daily routines. Track progress and earn health points.
						</p>
					</div>

					{/* Top Dashboard Analytics Card */}
					<div className={styles.heroMetricsGrid}>
						<div className={styles.metricWidget}>
							<div className={styles.ringWrapper}>
								<svg viewBox="0 0 36 36" className={styles.circularChart}>
									<path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
									<path className={styles.circleProgress} strokeDasharray={`${dailyProgressPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
								</svg>
								<span className={styles.ringText}>{dailyProgressPercent}%</span>
							</div>
							<div className={styles.metricText}>
								<span className={styles.metricLabel}>Daily Progress</span>
								<span className={styles.metricVal}>{completedGoalsCount} of {totalGoalsCount} Done</span>
							</div>
						</div>

						<div className={styles.metricWidget}>
							<div className={styles.iconCircle}>
								<Flame size={18} className={styles.flameIcon} />
							</div>
							<div className={styles.metricText}>
								<span className={styles.metricLabel}>Streak Score</span>
								<span className={styles.metricVal}>{streakCount} Days Active</span>
							</div>
						</div>

						<div className={styles.metricWidget}>
							<div className={styles.iconCircle}>
								<Zap size={18} className={styles.zapIcon} />
							</div>
							<div className={styles.metricText}>
								<span className={styles.metricLabel}>Health Points</span>
								<span className={styles.metricVal}>{totalBioPoints} Points</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Unified Two-Column Main Layout */}
			<div className={styles.mainLayout}>
				{/* Left Primary Column: Daily Habits Workspace */}
				<div className={styles.primaryColumn}>
					{/* Toolbar Header: Session Switcher & Add Habit Trigger */}
					<div className={styles.workspaceHeader}>
						<div className={styles.sessionPills}>
							{(["All", "Morning", "Afternoon", "Evening"] as const).map((sess) => {
								const isReal = getRealTimeSession() === sess;
								const isActive = activeSession === sess;
								return (
									<button
										type="button"
										key={sess}
										className={`${styles.sessionBtn} ${isActive ? styles.active : ""}`}
										onClick={() => setActiveSession(sess)}
									>
										{sess === "Morning" && <Sun size={12} />}
										{sess === "Afternoon" && <Activity size={12} />}
										{sess === "Evening" && <Moon size={12} />}
										{sess === "All" && <LayoutGrid size={12} />}
										<span>{sess === "All" ? "All Times" : sess}</span>
										{isReal && <span className={styles.liveTag}>Now</span>}
									</button>
								);
							})}
						</div>

						<button
							className={styles.addHabitBtn}
							onClick={() => setIsCustomOpen(!isCustomOpen)}
						>
							{isCustomOpen ? <X size={14} /> : <Plus size={14} />}
							<span>{isCustomOpen ? "Close Form" : "Custom Habit"}</span>
						</button>
					</div>

					{/* Category Filters */}
					<div className={styles.categoryFilters}>
						{categories.map((cat) => (
							<button
								key={cat.name}
								className={`${styles.catBtn} ${activeCategory === cat.name ? styles.active : ""}`}
								onClick={() => setActiveCategory(cat.name)}
							>
								{cat.icon}
								<span>{cat.name}</span>
							</button>
						))}
					</div>

					{/* Collapsible Inline Add Custom Habit Drawer */}
					<AnimatePresence>
						{isCustomOpen && (
							<motion.form
								onSubmit={handleCreateGoal}
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.25 }}
								className={styles.customHabitCard}
							>
								<div className={styles.customFormHeader}>
									<Sparkles size={16} className={styles.sparkleIcon} />
									<h3>Create Custom Healthy Habit</h3>
								</div>

								<div className={styles.formRow}>
									<div className={styles.inputBox}>
										<label>Habit Name</label>
										<input
											type="text"
											placeholder="e.g. Morning Hydration"
											value={customTitle}
											onChange={(e) => setCustomTitle(e.target.value)}
											required
										/>
									</div>
									<div className={styles.inputBox}>
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
								</div>

								<div className={styles.formRow3}>
									<div className={styles.inputBox}>
										<label>Session</label>
										<select
											value={customSession}
											onChange={(e) => setCustomSession(e.target.value as "Morning" | "Afternoon" | "Evening")}
										>
											<option value="Morning">Morning</option>
											<option value="Afternoon">Afternoon</option>
											<option value="Evening">Evening</option>
										</select>
									</div>
									<div className={styles.inputBox}>
										<label>Target Value</label>
										<input
											type="number"
											placeholder="e.g. 2000"
											value={customTarget}
											onChange={(e) => setCustomTarget(e.target.value)}
											min="1"
											required
										/>
									</div>
									<div className={styles.inputBox}>
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

								<div className={styles.inputBox}>
									<label>Details (Optional)</label>
									<input
										type="text"
										placeholder="e.g. Drink 2 liters of fresh clean water every day"
										value={customDesc}
										onChange={(e) => setCustomDesc(e.target.value)}
									/>
								</div>

								<div className={styles.formActions}>
									<button type="submit" className={styles.submitHabitBtn}>
										<Plus size={14} />
										<span>Save Habit</span>
									</button>
								</div>
							</motion.form>
						)}
					</AnimatePresence>

					{/* Active Habits Feed */}
					<div className={styles.habitsFeed}>
						{filteredGoals.length === 0 ? (
							<div className={styles.emptyFeed}>
								<Target size={32} />
								<h3>No Habits Found</h3>
								<p>No active habits match your current session or category filter.</p>
							</div>
						) : (
							<div className={styles.habitsGrid}>
								<AnimatePresence mode="popLayout">
									{filteredGoals.map((goal, index) => {
										const targetVal = parseFloat(goal.target_value) || 1;
										return (
											<motion.div
												key={goal.id}
												layout
												initial={{ opacity: 0, y: 12 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, scale: 0.95 }}
												transition={{ duration: 0.2, delay: index * 0.03 }}
												className={`${styles.habitCard} ${goal.completed ? styles.completed : ""}`}
											>
												<div className={styles.cardHeader}>
													<div className={styles.categoryIconBadge}>
														{getCategoryIcon(goal.category)}
													</div>
													<div className={styles.titleArea}>
														<h3 className={styles.habitTitle}>{goal.title}</h3>
														<p className={styles.habitDesc}>{goal.description}</p>
													</div>
													<button
														type="button"
														className={`${styles.checkBtn} ${goal.completed ? styles.checked : ""}`}
														onClick={() => handleToggle(goal.id)}
														title={goal.completed ? "Mark as in progress" : "Mark as complete"}
													>
														{goal.completed ? <Check size={15} strokeWidth={3} /> : <div className={styles.checkDot} />}
													</button>
												</div>

												{/* Card Body Progress */}
												<div className={styles.cardBody}>
													<div className={styles.progressRow}>
														<span className={styles.progressValue}>
															<strong>{goal.current_value}</strong> / {goal.target_value} {goal.unit}
														</span>
														<span className={styles.progressPct}>{goal.progress}% Done</span>
													</div>
													<div className={styles.progressBarTrack}>
														<div
															className={styles.progressBarFill}
															style={{ width: `${goal.progress}%` }}
														/>
													</div>

													<div className={styles.stepperRow}>
														<span className={styles.stepperLabel}>Update Progress</span>
														<div className={styles.stepperControls}>
															<button
																type="button"
																className={styles.stepBtn}
																onClick={() => handleProgressChange(goal.id, -(targetVal * 0.1))}
																disabled={goal.completed}
																title="Decrease progress"
															>
																<Minus size={14} strokeWidth={2.5} />
															</button>
															<button
																type="button"
																className={styles.stepBtn}
																onClick={() => handleProgressChange(goal.id, targetVal * 0.1)}
																disabled={goal.completed}
																title="Increase progress"
															>
																<Plus size={14} strokeWidth={2.5} />
															</button>
														</div>
													</div>
												</div>

												{/* Card Footer */}
												<div className={styles.cardFooter}>
													<span className={styles.categoryTag}>{goal.category}</span>
													<span className={styles.sessionTag}>{getGoalSession(goal)}</span>
													<span className={styles.pointsTag}>
														<Zap size={10} /> +10 Pts
													</span>
												</div>
											</motion.div>
										);
									})}
								</AnimatePresence>
							</div>
						)}
					</div>
				</div>

				{/* Right Sidebar Column: Food Plan, AI Suggestions & Bio Grade */}
				<aside className={styles.sidebarColumn}>
					{/* Food & Weight Target Card */}
					<div className={styles.sidebarCard}>
						<div className={styles.cardTitleRow}>
							<Apple size={16} className={styles.cardIcon} />
							<h3>Food & Weight Goal</h3>
						</div>

						<div className={styles.weightToggleGrid}>
							<button
								type="button"
								className={`${styles.weightOption} ${weightGoal === "lose" ? styles.active : ""}`}
								onClick={() => handleWeightGoalChange("lose")}
							>
								<Scale size={14} />
								<span>Lose</span>
							</button>
							<button
								type="button"
								className={`${styles.weightOption} ${weightGoal === "maintain" ? styles.active : ""}`}
								onClick={() => handleWeightGoalChange("maintain")}
							>
								<Utensils size={14} />
								<span>Maintain</span>
							</button>
							<button
								type="button"
								className={`${styles.weightOption} ${weightGoal === "gain" ? styles.active : ""}`}
								onClick={() => handleWeightGoalChange("gain")}
							>
								<TrendingUp size={14} />
								<span>Gain</span>
							</button>
						</div>

						<div className={styles.dietPlanSummary}>
							<h4>{activeDietPlan.name}</h4>
							<p>{activeDietPlan.desc}</p>
						</div>

						{/* Macro Breakdown */}
						<div className={styles.macroDistribution}>
							<div className={styles.macroBar}>
								<div className={`${styles.macroSegment} ${styles.carbs}`} style={{ width: `${activeDietPlan.macro.carbs}%` }} />
								<div className={`${styles.macroSegment} ${styles.protein}`} style={{ width: `${activeDietPlan.macro.protein}%` }} />
								<div className={`${styles.macroSegment} ${styles.fat}`} style={{ width: `${activeDietPlan.macro.fat}%` }} />
							</div>
							<div className={styles.macroLegend}>
								<span><span className={`${styles.dot} ${styles.carbs}`} /> Carbs {activeDietPlan.macro.carbs}%</span>
								<span><span className={`${styles.dot} ${styles.protein}`} /> Protein {activeDietPlan.macro.protein}%</span>
								<span><span className={`${styles.dot} ${styles.fat}`} /> Fats {activeDietPlan.macro.fat}%</span>
							</div>
						</div>

						<button
							type="button"
							className={styles.addDietHabitsBtn}
							onClick={handleActivateDietHabits}
							disabled={activeDietPlan.habitsAdded}
						>
							<Plus size={13} />
							<span>{activeDietPlan.habitsAdded ? "Food Habits Added" : "Add Food Habits"}</span>
						</button>
					</div>

					{/* Recommended Bio-Habits Sidebar Card */}
					{suggestedGoals.length > 0 && (
						<div className={styles.sidebarCard}>
							<div className={styles.cardTitleRow}>
								<Heart size={16} className={styles.cardIconAlert} />
								<h3>Recommended Bio-Habits</h3>
							</div>
							<div className={styles.suggestedList}>
								{suggestedGoals.map((s) => (
									<div key={s.title} className={styles.suggestedItem}>
										<div className={styles.suggestedText}>
											<h4>{s.title}</h4>
											<p>{s.description}</p>
										</div>
										<button
											type="button"
											className={styles.addSuggestedBtn}
											onClick={() => handleAddSuggestedGoal(s)}
										>
											<Plus size={12} />
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Health Score & Device Vault Security Card */}
					<div className={styles.sidebarCard}>
						<div className={styles.cardTitleRow}>
							<Award size={16} className={styles.cardIconGold} />
							<h3>Health Grade & Privacy</h3>
						</div>

						<div className={styles.scoreDisplay}>
							<div className={styles.scoreBigNum}>
								<span>{totalHealthScore}</span>
								<small>%</small>
							</div>
							<p className={styles.scoreSubtext}>Calculated live from your habits and recent lab logs.</p>
						</div>

						<div className={styles.privacyBanner}>
							<Lock size={13} />
							<span>Your health data is safe, private, and saved locally on this device.</span>
						</div>
					</div>
				</aside>
			</div>
		</div>
		</div>
	);
};

export default Goals;
