import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
	Sparkles, Home, Flame, Shield, RefreshCw, 
	Globe, BookOpen, Search, Bookmark, Check, ArrowRight,
	Sun, Wind, Droplets, Utensils, Smile
} from "lucide-react";
import { toast } from "react-toastify";
import { generateAiLifestyleTip, type AiLifestyleTipResult, GHANAIAN_REMEDIES } from "@/App/Services/GemmaService";
import styles from "./Tests.module.scss";

type LifestyleCategory = "All" | "Hygiene" | "Environment" | "Nutrition" | "Sleep" | "Mind";

const CURATED_LIFESTYLE_TIPS: AiLifestyleTipResult[] = [
	{
		id: "tip-hygiene-1",
		title: "20-Second Hand Hygiene Protocol",
		category: "Hygiene",
		categoryLabel: "Hygiene & Personal Care",
		shortSummary: "Washing hands with soap and water for 20 seconds breaks down viral and bacterial outer membranes, preventing infection.",
		whyItMatters: "Soap molecules dissolve lipid membranes on viruses and bacteria, washing pathogens away before they reach your eyes, nose, or mouth.",
		actionableSteps: [
			"Wet hands with clean running water and apply soap.",
			"Lather palm to palm, interlace fingers, and scrub back of hands.",
			"Clean under fingernails and wrists for 20 seconds.",
			"Rinse and dry with a clean towel or air dry."
		],
		safetyRule: "Always wash hands before meals, after using the washroom, and after handling money.",
		source: "World Health Organization (WHO) & Ghana Health Service"
	},
	{
		id: "tip-env-1",
		title: "Indoor Air Ventilation & Sanitation",
		category: "Environment",
		categoryLabel: "Neat Environment & Sanitation",
		shortSummary: "Opening windows for 15 minutes twice daily replaces trapped dust, carbon dioxide, and mold spores with fresh oxygenated air.",
		whyItMatters: "Enclosed rooms trap moisture, dust mites, and volatile compounds that irritate lung linings and trigger respiratory fatigue.",
		actionableSteps: [
			"Open cross-ventilating windows every morning and late afternoon.",
			"Damp-wipe surfaces instead of dry sweeping to avoid raising dust.",
			"Ensure laundry and damp mats dry thoroughly in outdoor sunlight.",
			"Clean ceiling fans and window sills weekly."
		],
		safetyRule: "Avoid burning plastics or garbage near living quarters to protect lung health.",
		source: "Centers for Disease Control and Prevention (CDC)"
	},
	{
		id: "tip-nutrition-1",
		title: "Moringa & Kontomire Iron Absorption",
		category: "Nutrition",
		categoryLabel: "Nutrition & Local Foods",
		shortSummary: "Pairing local iron-rich greens like Kontomire and Moringa with natural Vitamin C (lime or citrus) triples iron uptake in your blood.",
		whyItMatters: "Plant-based (non-heme) iron requires Vitamin C to dissolve into a form that your stomach and intestine can absorb easily.",
		actionableSteps: [
			"Squeeze fresh lime or lemon juice over cooked Kontomire or Moringa soup.",
			"Avoid drinking black tea or coffee within 1 hour of meals.",
			"Steam or lightly cook greens to preserve folic acid.",
			"Eat fresh orange or papaya after green meals."
		],
		safetyRule: "Cook Kontomire leaves thoroughly to break down naturally occurring oxalates.",
		source: "Ghana Health Service & NIH Nutrition"
	},
	{
		id: "tip-env-2",
		title: "Safe Household Water Storage",
		category: "Environment",
		categoryLabel: "Neat Environment & Sanitation",
		shortSummary: "Keeping drinking water in covered, narrow-necked vessels cleaned weekly prevents mosquito breeding and bacterial contamination.",
		whyItMatters: "Uncovered water containers serve as prime breeding grounds for mosquitoes and harbor bacterial biofilms.",
		actionableSteps: [
			"Boil drinking water for 1 full minute or use an approved filter.",
			"Store water in clean, covered containers with a narrow spout or tap.",
			"Scrub container walls with soap and clean water every 7 days.",
			"Never dip unwashed cups directly into storage buckets."
		],
		safetyRule: "Let boiled water cool naturally in a closed vessel before drinking.",
		source: "UNICEF & Ministry of Sanitation Ghana"
	},
	{
		id: "tip-hygiene-2",
		title: "Oral Microbiome & Gum Protection",
		category: "Hygiene",
		categoryLabel: "Hygiene & Personal Care",
		shortSummary: "Brushing twice daily with fluoride toothpaste and tongue cleaning eliminates plaque bacteria that trigger vascular inflammation.",
		whyItMatters: "Oral plaque bacteria can enter systemic circulation through microscopic gum bleeding, raising inflammatory markers.",
		actionableSteps: [
			"Brush for 2 full minutes morning and night.",
			"Use gentle circular motions along the gum line.",
			"Scrub your tongue gently from back to front.",
			"Replace toothbrush or chewing stick every 3 months."
		],
		safetyRule: "Spit out foam after brushing without immediate heavy water rinsing so fluoride protects enamel.",
		source: "Mayo Clinic & Ghana Dental Association"
	},
	{
		id: "tip-sleep-1",
		title: "Circadian Light & Sleep Hygiene",
		category: "Sleep",
		categoryLabel: "Sleep & Circadian Science",
		shortSummary: "Getting morning daylight exposure and putting away phone screens 90 minutes before bed restores natural melatonin production.",
		whyItMatters: "Blue light from screens tricks the brain into suppressing melatonin, leaving you tired and disrupting overnight cell repair.",
		actionableSteps: [
			"Get 10–15 minutes of outdoor daylight shortly after waking up.",
			"Turn on night-mode screen filters 2 hours before bed.",
			"Keep your sleeping area dark, cool, and quiet.",
			"Keep a consistent sleep schedule."
		],
		safetyRule: "Avoid heavy meals or caffeine late at night to ensure deep slow-wave sleep.",
		source: "National Institutes of Health (NIH)"
	},
	{
		id: "tip-mind-1",
		title: "Vagus Nerve Resonant Breathing",
		category: "Mind",
		categoryLabel: "Mind & Stress Resilience",
		shortSummary: "5 minutes of slow diaphragmatic breathing (6 seconds in, 6 seconds out) triggers the vagus nerve to calm your heart and reduce stress.",
		whyItMatters: "Slow rhythmic breathing increases parasympathetic nervous activity, lowering stress hormones like cortisol and adrenaline.",
		actionableSteps: [
			"Sit comfortably with a straight posture.",
			"Inhale deeply through your nose for 5–6 seconds.",
			"Exhale smoothly through your mouth for 5–6 seconds.",
			"Repeat for 5 minutes during stressful moments or before bed."
		],
		safetyRule: "Return to normal breathing immediately if feeling dizzy.",
		source: "Harvard Medical School Mind/Body Institute"
	}
];

const Tests = () => {
	const [activeCategory, setActiveCategory] = useState<LifestyleCategory>("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedTipId, setExpandedTipId] = useState<string | null>(null);
	
	// Custom AI Tip Generation State
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
			const newTip = await generateAiLifestyleTip(cat === "All" ? "Hygiene" : cat, topic || customPrompt);
			setAiTips((prev) => [newTip, ...prev]);
			setExpandedTipId(newTip.id);
			setCustomPrompt("");
			setShowGenerator(false);
			toast.success("Fresh AI lifestyle tip generated by model!", { autoClose: 3500 });
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
							Bio-Lifestyle & Health Hub
						</span>
						<h1 className={styles.heroTitle}>
							Healthy Living <span className={styles.accentText}>& Sanitation</span>
						</h1>
						<p className={styles.heroSubtitle}>
							Evidence-based hygiene practices, clean environmental sanitation, Ghanaian bio-nutrition, and real-time AI Model lifestyle recommendations.
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
							className={`${styles.catBtn} ${activeCategory === "Hygiene" ? styles.active : ""}`}
							onClick={() => setActiveCategory("Hygiene")}
						>
							<Sparkles size={13} />
							<span>Hygiene & Care</span>
						</button>
						<button
							className={`${styles.catBtn} ${activeCategory === "Environment" ? styles.active : ""}`}
							onClick={() => setActiveCategory("Environment")}
						>
							<Home size={13} />
							<span>Neat Environment</span>
						</button>
						<button
							className={`${styles.catBtn} ${activeCategory === "Nutrition" ? styles.active : ""}`}
							onClick={() => setActiveCategory("Nutrition")}
						>
							<Flame size={13} />
							<span>Bio-Nutrition</span>
						</button>
						<button
							className={`${styles.catBtn} ${activeCategory === "Sleep" ? styles.active : ""}`}
							onClick={() => setActiveCategory("Sleep")}
						>
							<Sun size={13} />
							<span>Sleep & Rest</span>
						</button>
						<button
							className={`${styles.catBtn} ${activeCategory === "Mind" ? styles.active : ""}`}
							onClick={() => setActiveCategory("Mind")}
						>
							<Smile size={13} />
							<span>Mind & Resilience</span>
						</button>
					</div>

					{/* Search Bar & AI Generator Trigger Header */}
					<div className={styles.searchHeader}>
						<div className={styles.searchBox}>
							<Search size={14} className={styles.searchIcon} />
							<input
								type="text"
								placeholder="Search hygiene, water, air, moringa, sleep..."
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
									<h3>Ask Gemma AI Model for Custom Lifestyle Guidance</h3>
								</div>
								<p className={styles.drawerDesc}>
									Type any topic (e.g. "How to clean water storage tanks", "Preventing mold in damp rooms", "Hand hygiene for kids") and let the model build a custom science guide.
								</p>

								<div className={styles.drawerForm}>
									<input
										type="text"
										placeholder="e.g. Natural ways to disinfect kitchen surfaces and food"
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
												<Bookmark size={14} />
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
															{tip.actionableSteps.map((step, sIdx) => (
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
					{/* Sanitation & Hygiene Essentials Card */}
					<div className={styles.sidebarCard}>
						<div className={styles.cardHeaderRow}>
							<Shield size={16} className={styles.iconShield} />
							<h3>Hygiene & Sanitation Rules</h3>
						</div>
						<ul className={styles.essentialChecklist}>
							<li>
								<Droplets size={13} />
								<span>Wash hands with soap for 20s before eating</span>
							</li>
							<li>
								<Wind size={13} />
								<span>Open windows twice daily for air circulation</span>
							</li>
							<li>
								<Utensils size={13} />
								<span>Boil drinking water & clean storage tanks</span>
							</li>
							<li>
								<Sun size={13} />
								<span>Sun-dry damp clothes to eliminate mold spores</span>
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
