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
	Scale,
	Utensils,
	AlertCircle,
	Sun,
} from "lucide-react";
import styles from "./Goals.module.scss";

const DIET_TEMPLATES = {
	lose: {
		default: {
			name: "Healthy Fat Burning Diet",
			macro: { protein: 30, fat: 55, carbs: 15 },
			desc: "Helps you burn fat for energy using healthy oils and fresh foods. This keeps your heart healthy and protects your muscles.",
			habits: [
				{ title: "Eat less sugar and starch", description: "Eat less bread, rice, and sweets to help your body burn fat.", target_value: "50", unit: "g", session: "Morning" },
				{ title: "Use healthy olive oil", description: "Have 2 spoons of olive oil every day.", target_value: "2", unit: "tbsp", session: "Afternoon" },
				{ title: "Eat green vegetables", description: "Eat at least 3 cups of green veggies like spinach or salad.", target_value: "3", unit: "cups", session: "Evening" }
			]
		},
		respiratory: {
			name: "Lung-Friendly Fat Burning Diet",
			macro: { protein: 25, fat: 60, carbs: 15 },
			desc: "Full of healthy fats and clean foods that help lower swelling in your lungs. This helps you breathe easier.",
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
			desc: "A simple food plan made of real, unprocessed foods. It keeps your energy steady and your body in balance.",
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
	const [activeTab, setActiveTab] = useState<"routine" | "discovery" | "diet" | "insights">("routine");

	// State for weight goal (persisted locally)
	const [weightGoal, setWeightGoal] = useState<"lose" | "gain" | "maintain">(() => {
		return (localStorage.getItem("genetiq_weight_goal") as "lose" | "gain" | "maintain") || "maintain";
	});

	// State for custom goal form (default open on discovery tab)
	const [isCustomOpen, setIsCustomOpen] = useState(true);
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
		alert(`Added the ${activeDietPlan.name} habits to your Action Plan!`);
		setActiveTab("routine");
	}, [dispatch, goals, activeDietPlan]);

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

	const getGoalSession = useCallback((goal: HealthGoal): "Morning" | "Afternoon" | "Evening" => {
		if (goal.session) return goal.session;

		const title = goal.title.toLowerCase();
		const desc = goal.description.toLowerCase();

		if (
			title.includes("morning") ||
			title.includes("sun") ||
			title.includes("wake") ||
			title.includes("am") ||
			title.includes("hydration") ||
			title.includes("water") ||
			desc.includes("morning") ||
			desc.includes("wake") ||
			desc.includes("am")
		) {
			return "Morning";
		}

		if (
			title.includes("sleep") ||
			title.includes("night") ||
			title.includes("evening") ||
			title.includes("pm") ||
			title.includes("breath") ||
			title.includes("meditat") ||
			title.includes("calm") ||
			desc.includes("sleep") ||
			desc.includes("night") ||
			desc.includes("pm") ||
			desc.includes("calm")
		) {
			return "Evening";
		}

		return "Afternoon";
	}, []);

	// State for time-of-day session filter (Morning, Afternoon, Evening)
	const [activeSession, setActiveSession] = useState<"Morning" | "Afternoon" | "Evening">(getRealTimeSession);

	const filteredGoals = useMemo(() => {
		return goals.filter(
			(g: HealthGoal) =>
				(activeCategory === "All" || g.category === activeCategory) &&
				getGoalSession(g) === activeSession,
		);
	}, [goals, activeCategory, activeSession, getGoalSession]);

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
			const updatedGoals = goals.map((g: HealthGoal) =>
				g.id === id ? { ...g, completed: !g.completed, current_value: !g.completed ? g.target_value : "0", progress: !g.completed ? 100 : 0 } : g,
			);
			await LocalVault.save("user_goals", updatedGoals);
		},
		[dispatch, goals],
	);

	const handleSealMilestone = useCallback((_id: string) => {
		alert(
			`Saving your progress securely on your device...`,
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
				session: customSession,
			};

			dispatch(addGoal(newGoal));

			// Sync back to LocalVault
			const updatedGoals = [...goals, newGoal];
			await LocalVault.save("user_goals", updatedGoals);

			// Reset form
			setCustomTitle("");
			setCustomTarget("");
			setCustomDesc("");
			setActiveTab("routine"); // Switch back to see the new goal in routine!
		},
		[dispatch, goals, customTitle, customCategory, customTarget, customUnit, customDesc]
	);

	// Recommended AI Bio-Goals
	const suggestedGoals = useMemo(() => {
		return [
			{
				category: "Nutrition" as const,
				title: "Cell Protection",
				description: "Eat foods with 1500mg of antioxidants (like berries or nuts) daily.",
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
				session: suggested.session as "Morning" | "Afternoon" | "Evening",
			};

			dispatch(addGoal(newGoal));

			// Sync back to LocalVault
			const updatedGoals = [...goals, newGoal];
			await LocalVault.save("user_goals", updatedGoals);
			setActiveTab("routine"); // Switch back to see the newly added goal!
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
	const sealedMilestonesCount = goals.filter((g) => g.vaultSealHash).length;
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
							Turn your body reports into easy daily steps. Update your progress and build your own healthy habits.
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
							<span className={styles["streak-label"]}>Day Streak</span>
						</div>
					</div>
				</div>

				{/* Top-Level Navigation Tabs */}
				<div className={styles["main-tabs-row"]}>
					<button 
						className={`${styles["main-tab-btn"]} ${activeTab === "routine" ? styles["active"] : ""}`}
						onClick={() => setActiveTab("routine")}
					>
						<Target size={15} />
						<span>Daily Habits</span>
					</button>
					<button 
						className={`${styles["main-tab-btn"]} ${activeTab === "discovery" ? styles["active"] : ""}`}
						onClick={() => setActiveTab("discovery")}
					>
						<Plus size={15} />
						<span>Find Habits</span>
					</button>
					<button 
						className={`${styles["main-tab-btn"]} ${activeTab === "diet" ? styles["active"] : ""}`}
						onClick={() => setActiveTab("diet")}
					>
						<Apple size={15} />
						<span>Food & Weight</span>
					</button>
					<button 
						className={`${styles["main-tab-btn"]} ${activeTab === "insights" ? styles["active"] : ""}`}
						onClick={() => setActiveTab("insights")}
					>
						<Sparkles size={15} />
						<span>Tips & Science</span>
					</button>
				</div>

				{/* Tab Content Panel */}
				<AnimatePresence mode='wait'>
					{activeTab === "routine" && (
						<motion.div
							key="routine-tab"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className={styles["goals-content"]}
							style={{ gap: "24px" }}
						>
							{/* Weekly Progress Analytics Dashboard Row */}
							<div className={styles["analytics-row"]}>
								<div className={styles["analytic-card"]}>
									<div className={styles["analytic-icon-wrapper"]}>
										<Target size={16} />
									</div>
									<div className={styles["analytic-info"]}>
										<span className={styles["analytic-label"]}>Active Habits</span>
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
										<span className={styles["analytic-label"]}>Health Points</span>
										<span className={styles["analytic-value"]}>{totalBioPoints} pts</span>
									</div>
								</div>

								<div className={styles["analytic-card"]}>
									<div className={styles["analytic-icon-wrapper"]}>
										<Trophy size={16} />
									</div>
									<div className={styles["analytic-info"]}>
										<span className={styles["analytic-label"]}>Saved Steps</span>
										<span className={styles["analytic-value"]}>{sealedMilestonesCount} Saved</span>
									</div>
								</div>
							</div>

							{/* Session Selector Row */}
							{goals.length > 0 && (
								<div className={styles["session-row"]}>
									{(["Morning", "Afternoon", "Evening"] as const).map((sess) => {
										const isCurrent = getRealTimeSession() === sess;
										const isActive = activeSession === sess;
										
										return (
											<button
												type="button"
												key={sess}
												className={`${styles["session-btn"]} ${isActive ? styles["active"] : ""}`}
												onClick={() => setActiveSession(sess)}
											>
												<span className={styles["session-icon"]}>
													{sess === "Morning" ? <Sun size={14} /> : sess === "Afternoon" ? <Activity size={14} /> : <Moon size={14} />}
												</span>
												<span>{sess} Session</span>
												{isCurrent && <span className={styles["current-badge"]}>Active Now</span>}
											</button>
										);
									})}
								</div>
							)}

							{/* Navigation/Category Filter Row */}
							{goals.length > 0 && (
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
							)}

							{/* Active Goals Grid or Empty State */}
							{goals.length === 0 ? (
								<div className={styles["empty-state"]}>
									<Target size={36} style={{ color: "var(--accent)" }} />
									<h3>No Active Habits</h3>
									<p>You do not have any active habits. Pick a suggested goal or write your own custom habit below.</p>
									<button 
										className={styles["empty-state-btn"]}
										onClick={() => setActiveTab("discovery")}
									>
										<Plus size={14} />
										<span>Find Healthy Habits</span>
									</button>
								</div>
							) : filteredGoals.length === 0 ? (
								<div className={styles["empty-state"]}>
									<Target size={36} style={{ color: "var(--text-secondary)" }} />
									<h3>No Goals Found</h3>
									<p>No habits are currently active in the "{activeCategory}" category.</p>
								</div>
							) : (
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
															<span className={styles["stepper-label"]}>Your Progress</span>
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
																<span>+10 Health Points</span>
															</span>
														</div>
													</div>

													{/* Enclave Vault Milestone Sealing */}
													{goal.completed && goal.streak >= 7 && (
														<button
															className={styles["mint-btn"]}
															onClick={() => handleSealMilestone(goal.id)}
															title='Save safely on this device'
														>
															<Trophy size={14} />
														</button>
													)}
												</motion.div>
											);
										})}
									</AnimatePresence>
								</div>
							)}
						</motion.div>
					)}

					{activeTab === "discovery" && (
						<motion.div
							key="discovery-tab"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className={styles["goals-content"]}
							style={{ gap: "32px" }}
						>
							{/* Collapsible Custom Goal Builder Form */}
							<div className={styles["custom-goal-builder"]}>
								<button 
									className={styles["toggle-custom-btn"]} 
									onClick={() => setIsCustomOpen(!isCustomOpen)}
								>
									<div className={styles["btn-label"]}>
										<Settings size={15} />
										<span>Create Your Own Custom Habit</span>
									</div>
									{isCustomOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
								</button>

								<AnimatePresence initial={false}>
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
													<label>Habit Name</label>
													<input 
														type="text" 
														placeholder="e.g. Drink Water in the Morning" 
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

													<div className={styles["input-group"]}>
														<label>Daily Goal</label>
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
													<label>Details (Optional)</label>
													<input 
														type="text" 
														placeholder="e.g. Drink 3 liters of fresh water every day." 
														value={customDesc} 
														onChange={(e) => setCustomDesc(e.target.value)} 
													/>
												</div>

												<button type="submit" className={styles["submit-btn"]}>
													<Plus size={14} />
													<span>Start Habit</span>
												</button>
											</div>
										</motion.form>
									)}
								</AnimatePresence>
							</div>

							{/* Suggested AI Bio-Goals Panel */}
							{suggestedGoals.length > 0 ? (
								<div className={styles["suggested-panel"]} style={{ marginTop: 0 }}>
									<div className={styles["suggested-header"]}>
										<Heart size={16} className={styles["heart-icon"]} />
										<h3>Recommended Habits for Your Body</h3>
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
														<span>{s.category} • Suggested for You</span>
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
													<span>Add Habit</span>
												</button>
											</div>
										))}
									</div>
								</div>
							) : (
								<div className={styles["empty-state"]}>
									<Check size={36} style={{ color: "#10b981" }} />
									<h3>All Suggested Habits Added</h3>
									<p>You have added all suggested habits. Check back tomorrow for more suggestions based on your body reports!</p>
								</div>
							)}
						</motion.div>
					)}

					{activeTab === "diet" && (
						<motion.div
							key="diet-tab"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className={styles["diet-section"]}
						>
							{/* Weight Goal Selector Card Row */}
							<div className={styles["weight-goal-selector"]}>
								<div 
									className={`${styles["weight-goal-card"]} ${weightGoal === "lose" ? styles["active"] : ""}`}
									onClick={() => handleWeightGoalChange("lose")}
								>
									<div className={styles["icon-wrapper"]}>
										<Scale size={20} />
									</div>
									<h4>Lose Weight</h4>
									<p>Burn body fat, balance blood sugar, and lower stress on your body.</p>
								</div>

								<div 
									className={`${styles["weight-goal-card"]} ${weightGoal === "maintain" ? styles["active"] : ""}`}
									onClick={() => handleWeightGoalChange("maintain")}
								>
									<div className={styles["icon-wrapper"]}>
										<Utensils size={20} />
									</div>
									<h4>Maintain / Balance</h4>
									<p>Keep your body balanced and maintain steady daily energy.</p>
								</div>

								<div 
									className={`${styles["weight-goal-card"]} ${weightGoal === "gain" ? styles["active"] : ""}`}
									onClick={() => handleWeightGoalChange("gain")}
								>
									<div className={styles["icon-wrapper"]}>
										<TrendingUp size={20} />
									</div>
									<h4>Gain Weight</h4>
									<p>Build strong muscles and clean body mass.</p>
								</div>
							</div>

							{/* Report-Aligned Diet Plan Description */}
							<div className={styles["diet-presc-card"]}>
								<div className={styles["diet-header"]}>
									<h3>{activeDietPlan.name}</h3>
									<p>{activeDietPlan.desc}</p>
								</div>

								{/* Macro visualizer */}
								<div className={styles["macro-box"]}>
									<h4>Your Daily Food Mix Target</h4>
									<div className={styles["macro-bar"]}>
										<div className={`${styles["macro-segment"]} ${styles["carbs"]}`} style={{ width: `${activeDietPlan.macro.carbs}%` }} />
										<div className={`${styles["macro-segment"]} ${styles["protein"]}`} style={{ width: `${activeDietPlan.macro.protein}%` }} />
										<div className={`${styles["macro-segment"]} ${styles["fat"]}`} style={{ width: `${activeDietPlan.macro.fat}%` }} />
									</div>
									<div className={styles["macro-labels"]}>
										<div className={styles["macro-label-item"]}>
											<span className={`${styles["dot"]} ${styles["carbs"]}`} />
											<span>Sugar and Bread (Carbs): {activeDietPlan.macro.carbs}%</span>
										</div>
										<div className={styles["macro-label-item"]}>
											<span className={`${styles["dot"]} ${styles["protein"]}`} />
											<span>Eggs, Fish, and Meat (Protein): {activeDietPlan.macro.protein}%</span>
										</div>
										<div className={styles["macro-label-item"]}>
											<span className={`${styles["dot"]} ${styles["fat"]}`} />
											<span>Healthy Oils and Fats: {activeDietPlan.macro.fat}%</span>
										</div>
									</div>
								</div>

								{/* Report alignment notice */}
								<div className={styles["report-alert-box"]}>
									<AlertCircle size={16} className={styles["alert-icon"]} />
									<p>
										<strong>Suggested for You:</strong> This diet is built for you based on the <strong>{activeDietPlan.categoryText}</strong> found in your health reports.
									</p>
								</div>

								{/* Recommended nutrition habits checklist */}
								<div className={styles["suggested-panel"]} style={{ marginTop: 8 }}>
									<div className={styles["suggested-header"]} style={{ color: "var(--accent)" }}>
										<Apple size={16} />
										<h3 style={{ fontSize: "14px", fontWeight: 700 }}>Suggested Daily Food Habits</h3>
									</div>
									<div className={styles["suggested-grid"]}>
										{activeDietPlan.habits.map((th) => {
											const isAdded = goals.some((g) => g.title === th.title);
											return (
												<div key={th.title} className={`${styles["suggested-card"]} nutrition`}>
													<div className={styles["suggested-info"]} style={{ marginBottom: 0 }}>
														<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "8px" }}>
															<h4 className={styles["suggested-title"]} style={{ fontSize: "13.5px", margin: 0 }}>{th.title}</h4>
															{isAdded && <Check size={14} style={{ color: "#10b981", flexShrink: 0 }} />}
														</div>
														<p className={styles["suggested-desc"]} style={{ fontSize: "12px", marginTop: "6px", marginBottom: 0 }}>{th.description}</p>
														<span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent)", display: "inline-block", marginTop: "8px" }}>
															Goal: {th.target_value} {th.unit}
														</span>
													</div>
												</div>
											);
										})}
									</div>
								</div>

								{/* Activation button */}
								<button 
									className={styles["activate-diet-btn"]}
									onClick={handleActivateDietHabits}
									disabled={activeDietPlan.habitsAdded}
								>
									<Plus size={14} />
									<span>{activeDietPlan.habitsAdded ? "All Food Habits Active" : "Add Suggested Food Habits"}</span>
								</button>
							</div>
						</motion.div>
					)}

					{activeTab === "insights" && (
						<motion.div
							key="insights-tab"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className={styles["goals-content"]}
							style={{ gap: "28px" }}
						>
							{/* AI Assistant Insight Suggestion */}
							<div className={styles["ai-suggestions"]}>
								<div className={styles["suggestion-card"]}>
									<div className={styles["suggestion-sparkle-bg"]} />
									<div className={styles["suggestion-icon-wrapper"]}>
										<Sparkles size={16} className={styles["sparkles-icon"]} />
									</div>
									<div className={styles["suggestion-text"]}>
										<p>
											<strong className={styles["ai-tag"]}>AI Tip:</strong> Your body is showing slightly more stress than usual today. Try spending 15 minutes on deep breathing to help calm your body and restore balance.
										</p>
									</div>
								</div>
							</div>

							{/* Diagnostic Health Grade Widget */}
							<div className={styles["health-score-widget"]}>
								<div className={styles["score-mesh"]} />
								<div className={styles["score-glow"]} />
								<div className={styles["score-info"]}>
									<div className={styles["score-header-row"]}>
										<Award size={18} className={styles["award-icon"]} />
										<h3>Your Health Score</h3>
									</div>
									<p>This score is calculated from your activity, habits, and how you feel today.</p>
									
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

							{/* Science-backed Habits FAQ/Guide */}
							<div className={styles["faq-panel"]}>
								<div className={styles["faq-header"]}>
									<Sparkles size={16} className={styles["faq-icon"]} />
									<h3>Why These Habits Help You</h3>
								</div>
								<div className={styles["faq-content"]}>
									<div className={styles["faq-item"]}>
										<h4>🧬 How Your Habits Change Your Body</h4>
										<p>Your body is not set in stone. Your daily choices—like eating well, getting sun, and lowering stress—act like switches. By doing these habits, you help your body repair itself, stay young, and gain more energy.</p>
									</div>
									<div className={styles["faq-item"]}>
										<h4>🔒 Fully Private and Safe on Your Device</h4>
										<p>When you finish your habits, your progress is saved safely right on your own device. It is completely private. Your personal health details are never shared with anyone else.</p>
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Vault Sync Status Footer */}
				<div className={styles["offline-notice"]}>
					<div className={styles["status-indicator"]}>
						<div className={styles["status-dot"]} />
						<div className={styles["status-pulse"]} />
					</div>
					<span>Your health data is safe, private, and saved on this device.</span>
				</div>
			</div>
		</div>
	);
};

export default Goals;
