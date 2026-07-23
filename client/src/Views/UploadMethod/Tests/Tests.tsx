import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
	Sparkles, Home, Flame, Shield, RefreshCw, 
	Globe, BookOpen, Search, Bookmark, Check, ArrowRight,
	Sun, Wind, Droplets, Utensils, Smile, Activity
} from "lucide-react";
import { toast } from "react-toastify";
import { generateAiLifestyleTip, type AiLifestyleTipResult, GHANAIAN_REMEDIES } from "@/App/Services/GemmaService";
import styles from "./Tests.module.scss";

type LifestyleCategory = "All" | "Fitness" | "Nutrition" | "Hygiene" | "Sleep" | "Mind" | "Environment";

const CURATED_LIFESTYLE_TIPS: AiLifestyleTipResult[] = [
	{
		id: "tip-fitness-1",
		title: "30-Minute Daily Brisk Movement",
		category: "Fitness",
		categoryLabel: "General Fitness & Vitality",
		shortSummary: "Engaging in 30 minutes of moderate aerobic movement daily lowers all-cause mortality risk by 27% and boosts mitochondrial energy output.",
		whyItMatters: "Exercise stimulates vascular nitric oxide release, relaxing blood vessels, improving heart health, and delivering oxygen to tissues.",
		actionableSteps: [
			"Take a 30-minute brisk walk in the morning or early evening.",
			"Incorporate bodyweight squats, lunges, or climbing stairs.",
			"Maintain an upright posture to prevent neck and back strain.",
			"Drink clean water before and after physical activity."
		],
		safetyRule: "Warm up with gentle stretches before engaging in vigorous exercise.",
		source: "World Health Organization (WHO) & CDC Guidelines"
	},
	{
		id: "tip-nutrition-1",
		title: "Moringa & Kontomire Iron Uptake",
		category: "Nutrition",
		categoryLabel: "Nutrition & Local Bio-Foods",
		shortSummary: "Pairing local iron-rich greens (Kontomire, Moringa) with natural Vitamin C (lime or lemon) triples iron absorption in your bloodstream.",
		whyItMatters: "Plant-based iron requires Vitamin C to dissolve into a soluble form that your stomach and intestine can absorb efficiently.",
		actionableSteps: [
			"Squeeze fresh lime or lemon juice over cooked Kontomire or Moringa soup.",
			"Avoid drinking tea or coffee within 1 hour of meals to prevent iron blocking.",
			"Steam or lightly boil greens to preserve natural folates.",
			"Enjoy fresh oranges or papaya as a healthy post-meal dessert."
		],
		safetyRule: "Cook Kontomire leaves thoroughly to break down natural calcium oxalates.",
		source: "Ghana Health Service & NIH Nutrition Science"
	},
	{
		id: "tip-hygiene-1",
		title: "20-Second Hand Hygiene Protocol",
		category: "Hygiene",
		categoryLabel: "Personal Hygiene & Care",
		shortSummary: "Proper 20-second handwashing with soap breaks down viral and bacterial outer membranes, preventing common infections.",
		whyItMatters: "Soap molecules latch onto pathogen lipid membranes, neutralizing virus and bacterial particles before they enter mouth, eyes, or food.",
		actionableSteps: [
			"Wet hands with clean running water and apply soap.",
			"Lather palm to palm, interlace fingers, and scrub back of hands.",
			"Clean under fingernails and wrists for 20 seconds.",
			"Rinse and dry with a clean towel or air dry."
		],
		safetyRule: "Always wash hands before eating, preparing food, and after handling money.",
		source: "World Health Organization (WHO)"
	},
	{
		id: "tip-sleep-1",
		title: "Circadian Light & Restful Sleep",
		category: "Sleep",
		categoryLabel: "Sleep & Recovery",
		shortSummary: "Getting 10–15 minutes of morning sunlight while turning off phone screens 90 minutes before bed restores natural melatonin repair.",
		whyItMatters: "Blue light from phone screens tricks the brain into suppressing melatonin, disrupting deep slow-wave sleep and cellular recovery.",
		actionableSteps: [
			"Get natural outdoor sunlight shortly after waking up.",
			"Enable night-mode screen filters 2 hours before bed.",
			"Keep your sleeping area dark, cool, and quiet.",
			"Maintain a consistent sleep-wake schedule."
		],
		safetyRule: "Avoid heavy caffeine or large late-night meals near bedtime.",
		source: "National Institutes of Health (NIH)"
	},
	{
		id: "tip-mind-1",
		title: "Vagus Nerve Diaphragmatic Breathing",
		category: "Mind",
		categoryLabel: "Mind & Stress Resilience",
		shortSummary: "5 minutes of slow resonant breathing (6s in, 6s out) triggers the vagus nerve to calm your heart and reduce stress hormone output.",
		whyItMatters: "Rhythmic breathing increases parasympathetic nervous activity, rapidly lowering elevated cortisol and blood pressure.",
		actionableSteps: [
			"Sit comfortably with shoulders relaxed and spine straight.",
			"Inhale slowly through your nose for 5–6 seconds.",
			"Exhale smoothly through your mouth for 5–6 seconds.",
			"Repeat for 5 minutes during stressful moments or before sleep."
		],
		safetyRule: "Return to natural breathing immediately if you feel lightheaded.",
		source: "Harvard Medical School Mind/Body Institute"
	},
	{
		id: "tip-env-1",
		title: "Indoor Air Circulation & Freshness",
		category: "Environment",
		categoryLabel: "Clean Living Environment",
		shortSummary: "Opening windows for 15 minutes twice daily replaces indoor dust, trapped moisture, and carbon dioxide with fresh outdoor air.",
		whyItMatters: "Enclosed living spaces accumulate airborne dust, humidity, and volatile compounds that irritate lung linings and trigger fatigue.",
		actionableSteps: [
			"Open cross-ventilating windows every morning and late afternoon.",
			"Damp-wipe surfaces instead of dry sweeping to avoid raising dust.",
			"Ensure laundry and damp towels dry outdoors in sunlight.",
			"Keep fan blades and window sills clean."
		],
		safetyRule: "Avoid burning garbage or plastic near living spaces to protect lung health.",
		source: "Centers for Disease Control and Prevention (CDC)"
	}
];

const Tests = () => {
	const [activeCategory, setActiveCategory] = useState<LifestyleCategory>("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedTipId, setExpandedTipId] = useState<string | null>(null);
	
	// AI Tip Generation State
	const [aiTips, setAiTips] = useState<AiLifestyleTipResult[]>(CURATED_LIFESTYLE_TIPS);
	const [isGenerating, setIsGenerating] = useState(false);
	const [customPrompt, setCustomPrompt] = useState("");
	const [showGenerator, setShowGenerator] = useState(false);

	// Saved Habits in Local Storage
	const [savedHabitIds, setSavedHabitIds] = useState<string[]>(() => {
		try {
			const stored = localStorage.getItem("genetiq_saved_lifestyle_habits");
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	});

	const toggleSaveHabit = useCallback((id: string) => {
		setSavedHabitIds((prev) => {
			const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
			localStorage.setItem("genetiq_saved_lifestyle_habits", JSON.stringify(updated));
			toast.success(prev.includes(id) ? "Removed from saved habits" : "Saved to your habits list!", { autoClose: 2000 });
			return updated;
		});
	}, []);

	// Generate AI Tip Handler
	const handleGenerateAiTip = useCallback(async (cat: LifestyleCategory, topic?: string) => {
		setIsGenerating(true);
		try {
			const newTip = await generateAiLifestyleTip(cat === "All" ? "Fitness" : cat, topic || customPrompt);
			setAiTips((prev) => [newTip, ...prev]);
			setExpandedTipId(newTip.id);
			setCustomPrompt("");
			setShowGenerator(false);
			toast.success("Fresh AI healthy lifestyle tip suggested by model!", { autoClose: 3500 });
		} catch (e) {
			console.error("Failed to generate AI tip", e);
			toast.error("Could not generate tip. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	}, [customPrompt]);

	// Filtered Tips List
	const filteredTips = useMemo(() => {
		return aiTips.filter((tip) => {
			const matchesCategory = activeCategory === "All" || tip.category === activeCategory;
			const query = searchQuery.toLowerCase().trim();
			const matchesSearch = !query || 
				tip.title.toLowerCase().includes(query) ||
				tip.shortSummary.toLowerCase().includes(query) ||
				tip.categoryLabel.toLowerCase().includes(query) ||
				tip.whyItMatters.toLowerCase().includes(query);

			return matchesCategory && matchesSearch;
		});
	}, [aiTips, activeCategory, searchQuery]);

	// Today's Spotlight Tip
	const spotlightTip = useMemo(() => aiTips[0] || CURATED_LIFESTYLE_TIPS[0], [aiTips]);

	return (
		<div className={styles.testsContainer}>
			{/* Hero Header */}
			<section className={styles.heroSection}>
				<div className={styles.heroGlowBg} aria-hidden />
				<div className={styles.heroInner}>
					<div className={styles.heroTitleGroup}>
						<span className={styles.eyebrowTag}>
							<Sparkles size={12} />
							Healthy Lifestyle & Wellness Hub
						</span>
						<h1 className={styles.heroTitle}>
							General Healthy Living <span className={styles.accentText}>& Bio-Habits</span>
						</h1>
						<p className={styles.heroSubtitle}>
							Comprehensive guidance for daily fitness, balanced nutrition, restorative sleep, mental clarity, personal hygiene, and clean living — suggested by the AI Model.
						</p>
					</div>

					{/* AI Model Spotlight Card */}
					<div className={styles.spotlightCard}>
						<div className={styles.spotlightHeader}>
							<span className={styles.spotlightBadge}>
								<Sparkles size={11} /> AI Suggested Daily Habit
							</span>
							<span className={styles.spotlightCategory}>{spotlightTip.categoryLabel}</span>
						</div>
						<h3 className={styles.spotlightTitle}>{spotlightTip.title}</h3>
						<p className={styles.spotlightSummary}>{spotlightTip.shortSummary}</p>
						<div className={styles.spotlightFooter}>
							<button
								type="button"
								className={styles.spotlightActionBtn}
								onClick={() => handleGenerateAiTip(activeCategory)}
								disabled={isGenerating}
							>
								{isGenerating ? (
									<>
										<RefreshCw size={13} className={styles.spinIcon} />
										<span>Generating AI Tip...</span>
									</>
								) : (
									<>
										<Sparkles size={13} />
										<span>Generate Fresh AI Tip</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* Main Two-Column Layout */}
			<div className={styles.mainLayout}>
				{/* Left Primary Column */}
				<div className={styles.primaryColumn}>
					{/* Category Filters Bar */}
					<div className={styles.categoryBar}>
						<button
							className={`${styles.catBtn} ${activeCategory === "All" ? styles.active : ""}`}
							onClick={() => setActiveCategory("All")}
						>
							<Globe size={13} />
							<span>All Pillars</span>
						</button>
						<button
							className={`${styles.catBtn} ${activeCategory === "Fitness" ? styles.active : ""}`}
							onClick={() => setActiveCategory("Fitness")}
						>
							<Activity size={13} />
							<span>Fitness & Movement</span>
						</button>
						<button
							className={`${styles.catBtn} ${activeCategory === "Nutrition" ? styles.active : ""}`}
							onClick={() => setActiveCategory("Nutrition")}
						>
							<Utensils size={13} />
							<span>Nutrition & Bio-Foods</span>
						</button>
						<button
							className={`${styles.catBtn} ${activeCategory === "Hygiene" ? styles.active : ""}`}
							onClick={() => setActiveCategory("Hygiene")}
						>
							<Sparkles size={13} />
							<span>Personal Hygiene</span>
						</button>
						<button
							className={`${styles.catBtn} ${activeCategory === "Sleep" ? styles.active : ""}`}
							onClick={() => setActiveCategory("Sleep")}
						>
							<Sun size={13} />
							<span>Sleep & Recovery</span>
						</button>
						<button
							className={`${styles.catBtn} ${activeCategory === "Mind" ? styles.active : ""}`}
							onClick={() => setActiveCategory("Mind")}
						>
							<Smile size={13} />
							<span>Mind & Calm</span>
						</button>
						<button
							className={`${styles.catBtn} ${activeCategory === "Environment" ? styles.active : ""}`}
							onClick={() => setActiveCategory("Environment")}
						>
							<Home size={13} />
							<span>Clean Environment</span>
						</button>
					</div>

					{/* Search Bar & AI Generator Trigger Header */}
					<div className={styles.searchHeader}>
						<div className={styles.searchBox}>
							<Search size={14} className={styles.searchIcon} />
							<input
								type="text"
								placeholder="Search exercise, posture, water, moringa, sleep, hygiene..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						<button
							type="button"
							className={styles.openGenBtn}
							onClick={() => setShowGenerator(!showGenerator)}
						>
							<Sparkles size={14} />
							<span>{showGenerator ? "Close AI Custom Generator" : "Ask AI Model Custom Tip"}</span>
						</button>
					</div>

					{/* Collapsible AI Custom Tip Generator Drawer */}
					<AnimatePresence>
						{showGenerator && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.25 }}
								className={styles.generatorDrawer}
							>
								<div className={styles.drawerTitleRow}>
									<Sparkles size={16} className={styles.drawerSparkle} />
									<h3>Ask Gemma AI Model for Custom Healthy Lifestyle Advice</h3>
								</div>
								<p className={styles.drawerDesc}>
									Type any healthy lifestyle topic (e.g. "30-minute workout routine for home", "Healthy snacks for blood sugar control", "Stretches for back posture", "Deep sleep routine") and let the model generate customized science advice.
								</p>

								<div className={styles.drawerForm}>
									<input
										type="text"
										placeholder="e.g. Daily habits for high morning energy and mental focus"
										value={customPrompt}
										onChange={(e) => setCustomPrompt(e.target.value)}
									/>
									<button
										type="button"
										className={styles.submitGenBtn}
										onClick={() => handleGenerateAiTip(activeCategory, customPrompt)}
										disabled={isGenerating || !customPrompt.trim()}
									>
										{isGenerating ? (
											<>
												<RefreshCw size={14} className={styles.spinIcon} />
												<span>Model Suggesting...</span>
											</>
										) : (
											<>
												<span>Suggest AI Guide</span>
												<ArrowRight size={14} />
											</>
										)}
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Tips Feed */}
					<div className={styles.tipsFeed}>
						<AnimatePresence mode="popLayout">
							{filteredTips.map((tip, index) => {
								const isExpanded = expandedTipId === tip.id;
								const isSaved = savedHabitIds.includes(tip.id);

								return (
									<motion.div
										key={tip.id}
										layout
										initial={{ opacity: 0, y: 14 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ duration: 0.25, delay: index * 0.03 }}
										className={styles.tipCard}
									>
										<div className={styles.tipCardTop}>
											<div className={styles.tipCategoryBadgeGroup}>
												<span className={styles.tipCatTag}>{tip.categoryLabel}</span>
												<span className={styles.tipSourceTag}>{tip.source}</span>
											</div>
											<button
												type="button"
												className={`${styles.bookmarkBtn} ${isSaved ? styles.saved : ""}`}
												onClick={() => toggleSaveHabit(tip.id)}
												title={isSaved ? "Remove from saved habits" : "Save to my habits list"}
											>
												<Bookmark size={15} strokeWidth={2.5} />
											</button>
										</div>

										<h3 className={styles.tipCardTitle}>{tip.title}</h3>
										<p className={styles.tipCardSummary}>{tip.shortSummary}</p>

										{/* Expandable Science & Practical Steps Panel */}
										<AnimatePresence>
											{isExpanded && (
												<motion.div
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: "auto", opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													transition={{ duration: 0.25 }}
													className={styles.tipExpandedPanel}
												>
													<div className={styles.panelDivider} />
													
													<div className={styles.panelBlock}>
														<h4>🧬 Why It Matters (Biological Reason)</h4>
														<p>{tip.whyItMatters}</p>
													</div>

													<div className={styles.panelBlock}>
														<h4>📋 Practical Step-by-Step Actions</h4>
														<ul>
															{tip.actionableSteps
																.map((step) => step.replace(/^[\{\}\[\]"'\s,]+|[\{\}\[\]"'\s,]+$/g, "").replace(/^safety\s*rule:\s*/i, "").trim())
																.filter((step) => step.length > 0 && step !== "[" && step !== "]")
																.map((step, sIdx) => (
																	<li key={sIdx}>
																		<Check size={13} className={styles.stepCheckIcon} />
																		<span>{step}</span>
																	</li>
																))}
														</ul>
													</div>

													<div className={styles.safetyBox}>
														<Shield size={14} className={styles.safetyIcon} />
														<span><strong>Safety Rule:</strong> {tip.safetyRule}</span>
													</div>
												</motion.div>
											)}
										</AnimatePresence>

										<div className={styles.tipCardFooter}>
											<button
												type="button"
												className={styles.expandToggleBtn}
												onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}
											>
												<span>{isExpanded ? "Collapse Guide" : "Read Full Science & Action Steps →"}</span>
											</button>
										</div>
									</motion.div>
								);
							})}
						</AnimatePresence>

						{filteredTips.length === 0 && (
							<div className={styles.emptyState}>
								<BookOpen size={36} />
								<h3>No Tips Found</h3>
								<p>No lifestyle guidance matched your search or category filter. Try tapping "Ask AI Model Custom Tip" to generate one!</p>
							</div>
						)}
					</div>
				</div>

				{/* Right Sidebar Column */}
				<aside className={styles.sidebarColumn}>
					{/* Daily Health & Vitality Checklist */}
					<div className={styles.sidebarCard}>
						<div className={styles.cardHeaderRow}>
							<Shield size={16} className={styles.iconShield} />
							<h3>Daily Health & Vitality Rules</h3>
						</div>
						<ul className={styles.essentialChecklist}>
							<li>
								<Activity size={13} />
								<span>30 mins brisk movement or walking daily</span>
							</li>
							<li>
								<Droplets size={13} />
								<span>Drink at least 2 liters of clean water</span>
							</li>
							<li>
								<Utensils size={13} />
								<span>Eat nutrient-dense local foods & fiber</span>
							</li>
							<li>
								<Sun size={13} />
								<span>Aim for 7–8 hours of uninterrupted sleep</span>
							</li>
							<li>
								<Wind size={13} />
								<span>Maintain personal hygiene & clean air flow</span>
							</li>
						</ul>
					</div>

					{/* Saved Habits Vault Card */}
					<div className={styles.sidebarCard}>
						<div className={styles.cardHeaderRow}>
							<Bookmark size={16} className={styles.iconBookmark} />
							<h3>Saved Lifestyle Habits</h3>
						</div>
						<div className={styles.savedStatRow}>
							<span className={styles.savedCountNum}>{savedHabitIds.length}</span>
							<span className={styles.savedCountText}>Habits saved in your personal library</span>
						</div>
					</div>

					{/* Ghanaian Bio-Remedies & Local Nutrition Card */}
					<div className={styles.sidebarCard}>
						<div className={styles.cardHeaderRow}>
							<Flame size={16} className={styles.iconFlame} />
							<h3>Ghanaian Bio-Foods</h3>
						</div>
						<div className={styles.remedyList}>
							{GHANAIAN_REMEDIES.slice(0, 4).map((remedy, idx) => (
								<div key={idx} className={styles.remedyItem}>
									<span className={styles.remedyEmoji}>{remedy.emoji}</span>
									<div className={styles.remedyInfo}>
										<strong className={styles.remedyName}>{remedy.name}</strong>
										<span className={styles.remedyBenefits}>{remedy.benefits}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
};

export default Tests;
