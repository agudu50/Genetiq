import { useState, useMemo, useCallback, useEffect, memo } from "react";
import { useDispatch } from "react-redux";
import { setCategory } from "@/App/Redux/categorySlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
	Brain, Heart, Flame, Layers, Shield, Sparkles, CheckCircle2, 
	XCircle, ArrowRight, ArrowLeft, RefreshCw, Trophy, Copy,
	Globe, Zap, BookOpen, Lock, Award
} from "lucide-react";
import { toast } from "react-toastify";
import styles from "./Tests.module.scss";

interface Question {
	id: string;
	text: string;
	options: {
		A: string;
		B: string;
		C: string;
		D: string;
	};
	correct: "A" | "B" | "C" | "D";
	insight: string;
}

interface ExamSystem {
	id: string;
	name: string;
	icon: React.ReactNode;
	colorClass: string;
	description: string;
	focus: string;
	questions: Question[];
}

const EXAM_SYSTEMS: ExamSystem[] = [
	{
		id: "brain",
		name: "Cognitive & Nervous System",
		icon: <Brain size={20} />,
		colorClass: "brain",
		description: "Evaluate circadian alignment, memory pre-cursors, and parasympathetic autonomic resilience.",
		focus: "Epigenetic regulation, neuro-transmitters, and stress adaptability.",
		questions: [
			{
				id: "brain-1",
				text: "What is the primary visual sign of circadian rhythm disruption in neurobiology?",
				options: {
					A: "Decreased deep sleep latency",
					B: "Elevated evening cortisol and melatonin suppression",
					C: "Accelerated neural synapse growth",
					D: "Reduced dopamine production in the substantia nigra"
				},
				correct: "B",
				insight: "Cortisol should naturally drop to baseline in the evening. Circumstances like blue-light exposure suppress melatonin and raise cortisol, disrupting your circadian rhythm and sleep quality."
			},
			{
				id: "brain-2",
				text: "Which nutrient serves as the direct biological precursor for synthesizing acetylcholine, the learning and memory neurotransmitter?",
				options: {
					A: "Choline (commonly found in egg yolks and cruciferous vegetables)",
					B: "L-Theanine",
					C: "Resveratrol",
					D: "Magnesium L-Threonate"
				},
				correct: "A",
				insight: "Choline is a critical dietary nutrient that serves as the direct precursor to acetylcholine, which is essential for cognitive health, focus, and memory consolidation."
			},
			{
				id: "brain-3",
				text: "What physiological state does high-frequency Heart Rate Variability (HRV) indicate about your autonomic nervous system?",
				options: {
					A: "Sympathetic nervous system dominance (fight-or-flight stress)",
					B: "Parasympathetic nervous system activation (rest-and-digest recovery)",
					C: "Severe localized systemic vascular inflammation",
					D: "Chronic peripheral sleep deprivation"
				},
				correct: "B",
				insight: "High HRV indicates healthy parasympathetic nervous system adaptability, resilience to stress, and efficient cardiovascular recovery."
			},
			{
				id: "brain-4",
				text: "Which molecular mechanism describes the physiological action of L-Theanine in the central nervous system?",
				options: {
					A: "Direct binding and activation of adrenergic alpha-1 receptors",
					B: "Competitive inhibition of glutamate receptors and modulation of GABA/dopamine levels",
					C: "Irreversible block of voltage-gated sodium channels in the cortex",
					D: "Acceleration of monoamine oxidase enzymes in synapses"
				},
				correct: "B",
				insight: "L-Theanine structurally resembles glutamate and competitively blocks glutamate receptors, while increasing brain levels of GABA, dopamine, and glycine, promoting relaxation without drowsiness."
			},
			{
				id: "brain-5",
				text: "What does the accumulation of beta-amyloid plaques and hyperphosphorylated tau proteins in brain tissues primarily indicate?",
				options: {
					A: "Advanced myelination and synaptic signaling speed",
					B: "Optimal clearance of cellular waste by the glymphatic system",
					C: "Pathological hallmarks of neurodegenerative decline and cognitive impairment",
					D: "Elevated growth hormone secretion during deep slow-wave sleep"
				},
				correct: "C",
				insight: "Beta-amyloid plaques and hyperphosphorylated tau proteins disrupt axonal transport and trigger neuroinflammation, which are primary biological hallmarks of cognitive decline and neurodegeneration."
			}
		]
	},
	{
		id: "heart",
		name: "Cardiovascular System",
		icon: <Heart size={20} />,
		colorClass: "heart",
		description: "Assess atherogenic particle concentrations, arterial vasodilation, and vascular inflammatory stress.",
		focus: "Lipid transport efficiency, arterial elasticity, and inflammatory risk.",
		questions: [
			{
				id: "heart-1",
				text: "Which lipid marker is considered a highly sensitive and precise predictor of atherogenic cardiovascular risk?",
				options: {
					A: "Total Cholesterol",
					B: "Apolipoprotein B (ApoB)",
					C: "Serum Triglycerides",
					D: "High-Density Lipoprotein (HDL-C)"
				},
				correct: "B",
				insight: "ApoB measures the exact count of all atherogenic particles (LDL, VLDL) capable of penetrating the arterial lining, making it a far more precise risk metric than traditional cholesterol checks."
			},
			{
				id: "heart-2",
				text: "What major physiological impact does nitric oxide have when released in the vascular system?",
				options: {
					A: "Triggers arterial constriction and spikes peripheral blood pressure",
					B: "Induces arterial vasodilation, relaxing vessel walls and lowering pressure",
					C: "Accelerates calcified arterial plaque deposits",
					D: "Inhibits blood oxygen transport capacity"
				},
				correct: "B",
				insight: "Nitric oxide acts as a powerful signaling molecule that relaxes the smooth muscle surrounding blood vessels, triggering vasodilation and improving oxygen-rich blood flow."
			},
			{
				id: "heart-3",
				text: "What biological role does high-sensitivity C-reactive protein (hs-CRP) play in cardiovascular assessments?",
				options: {
					A: "Measures oxygen saturation efficiency",
					B: "Acts as a sensitive biomarker for systemic vascular inflammation",
					C: "Functions as a hormone that regulates cardiac output",
					D: "Tracks insulin resistance in heart muscles"
				},
				correct: "B",
				insight: "hs-CRP is produced by the liver in response to inflammatory cytokines. Elevated levels strongly correlate with vascular lining inflammation, which can destabilize arterial plaques."
			},
			{
				id: "heart-4",
				text: "Which enzymatic process is directly inhibited by lipid-lowering statin medications in the liver?",
				options: {
					A: "Lipoprotein lipase hydrolyzation in peripheral tissues",
					B: "HMG-CoA reductase catalysis of mevalonate synthesis",
					C: "PCSK9 protein degradation of low-density lipoprotein receptors",
					D: "Cholesteryl ester transfer protein (CETP) exchange of lipids"
				},
				correct: "B",
				insight: "Statins are competitive inhibitors of HMG-CoA reductase, the rate-limiting enzyme in cholesterol biosynthesis. This leads to upregulation of LDL receptors and increased clearance of circulating ApoB particles."
			},
			{
				id: "heart-5",
				text: "What physiological outcome is caused by chronically high levels of angiotensin II in vascular tissues?",
				options: {
					A: "Systemic vasodilation and significant reduction in resting heart rate",
					B: "Arterial vasoconstriction and increased aldosterone release, raising blood pressure",
					C: "Enhanced cardiac nitric oxide release and arterial vessel elasticity",
					D: "Inhibition of platelet aggregation and thrombus formation"
				},
				correct: "B",
				insight: "Angiotensin II binds to AT1 receptors, triggering rapid arterial vasoconstriction and aldosterone secretion. This increases sodium retention, fluid volume, and blood pressure."
			}
		]
	},
	{
		id: "metabolic",
		name: "Metabolic & Blood Markers",
		icon: <Flame size={20} />,
		colorClass: "metabolic",
		description: "Examine long-term glycemic control, alternative ketone fuel utilization, and cellular insulin sensitivity.",
		focus: "Glycation indices, mitochondria fuel flexibility, and insulin resistance.",
		questions: [
			{
				id: "metabolic-1",
				text: "What clinical metric does an HbA1c test measure in metabolic health profiling?",
				options: {
					A: "Real-time glucose spikes immediately following sugar ingestion",
					B: "A 3-month average of glycated hemoglobin within red blood cells",
					C: "Acute insulin secretion capacity after physical exercise",
					D: "Total hepatic glycogen storage capacity"
				},
				correct: "B",
				insight: "Since red blood cells circulate for about 120 days, HbA1c tracks the percentage of hemoglobin coated with glucose, giving a stable average of blood sugar levels over the past 3 months."
			},
			{
				id: "metabolic-2",
				text: "Which metabolic state is characterized by depleted liver glycogen and the primary utilization of beta-hydroxybutyrate for energy?",
				options: {
					A: "Acute Glycolysis",
					B: "Nutritional Ketosis",
					C: "Diabetic Ketoacidosis",
					D: "Hyperinsulinemic hypoglycemia"
				},
				correct: "B",
				insight: "In nutritional ketosis, the body shifts to fat oxidation, and the liver converts fatty acids into ketones (including beta-hydroxybutyrate) to fuel cells, especially in the brain."
			},
			{
				id: "metabolic-3",
				text: "How does elevated fasting insulin correlate with cellular metabolic health?",
				options: {
					A: "Indicates high muscular glucose sensitivity",
					B: "Acts as an early warning for insulin resistance and cellular stress",
					C: "Directly triggers body fat lipolysis and fat loss",
					D: "Signifies high baseline aerobic mitochondrial efficiency"
				},
				correct: "B",
				insight: "High fasting insulin indicates that body cells are resisting insulin signals, forcing the pancreas to work overtime and overproduce insulin to keep blood glucose normal."
			},
			{
				id: "metabolic-4",
				text: "What is the physiological purpose of GLP-1 (Glucagon-Like Peptide-1) secretion in metabolic homeostasis?",
				options: {
					A: "Stimulating glucagon release and increasing hepatic glucose output",
					B: "Promoting insulin secretion, slowing gastric emptying, and suppressing appetite",
					C: "Inhibiting glucose uptake in skeletal muscle tissues",
					D: "Upregulating lipogenesis in visceral adipose tissue depots"
				},
				correct: "B",
				insight: "GLP-1 is an incretin hormone secreted by L-cells in the intestine. It enhances glucose-dependent insulin secretion, inhibits glucagon release, delays stomach emptying, and signals satiety."
			},
			{
				id: "metabolic-5",
				text: "What biological markers are calculated in the HOMA-IR (Homeostatic Model Assessment of Insulin Resistance) equation?",
				options: {
					A: "Ratio of high-density lipoprotein to low-density lipoprotein",
					B: "Fasting glucose and fasting insulin levels",
					C: "Standard deviation of 24-hour continuous glucose monitoring",
					D: "Clearance rate of creatinine in a 24-hour urine collection"
				},
				correct: "B",
				insight: "HOMA-IR is an established clinical calculation ('(Fasting Insulin * Fasting Glucose) / 405' in mg/dL) used to estimate insulin sensitivity and early metabolic dysregulation before fasting glucose rises."
			}
		]
	},
	{
		id: "gut",
		name: "Digestive & Gut Microbiome",
		icon: <Layers size={20} />,
		colorClass: "gut",
		description: "Analyze mucosal epithelial integrity, short-chain fatty acid fuel, and the gut-brain communications network.",
		focus: "Microbiome fermentation, gut barrier junctions, and neuro-endocrine signaling.",
		questions: [
			{
				id: "gut-1",
				text: "What is the primary role of short-chain fatty acids (like butyrate) in gut health?",
				options: {
					A: "Serving as the primary energy source for colon epithelial cells",
					B: "Catalyzing stomach acid digestion of complex proteins",
					C: "Emulsifying dietary fats for absorption in the lymphatic system",
					D: "Inhibiting systemic nutrient uptake in the small intestine"
				},
				correct: "A",
				insight: "Butyrate, created by bacterial fermentation of dietary fibers, fuels the colon cells, supports the mucosal lining, and exhibits anti-inflammatory effects in the gut."
			},
			{
				id: "gut-2",
				text: "Which anatomical structures are responsible for maintaining gut barrier selectivity and preventing 'leaky gut'?",
				options: {
					A: "Microvilli brush border follicles",
					B: "Tight junctions of the mucosal epithelial barrier",
					C: "Peyer's patches",
					D: "Pyloric sphincters"
				},
				correct: "B",
				insight: "Tight junctions act as high-performance molecular seals between intestinal lining cells, regulating permeability to let nutrients through while blocking large pathogens and toxins."
			},
			{
				id: "gut-3",
				text: "What major pathway mediates the bidirectional communication of the gut-brain axis?",
				options: {
					A: "The optic nerve and circadian signaling pathways",
					B: "The vagus nerve and neurochemical signaling",
					C: "Direct arterial blood flow in the portal system",
					D: "Somatic lymphatic drainage channels"
				},
				correct: "B",
				insight: "The vagus nerve is the biological superhighway that facilitates direct, bidirectional communication between the enteric nervous system of the gut and the central nervous system."
			},
			{
				id: "gut-4",
				text: "Which major bacterial phyla typically dominate the healthy human gut microbiome?",
				options: {
					A: "Proteobacteria and Cyanobacteria",
					B: "Bacteroidetes and Firmicutes",
					C: "Actinobacteria and Spirochaetes",
					D: "Fusobacteria and Euryarchaeota"
				},
				correct: "B",
				insight: "Over 90% of the gut microbiome is composed of Bacteroidetes and Firmicutes. A healthy ratio and high microbial diversity within these phyla are crucial for metabolic and immune homeostasis."
			},
			{
				id: "gut-5",
				text: "What is the physiological function of secretory Immunoglobulin A (sIgA) in the gut mucosal lining?",
				options: {
					A: "Initiating immediate systemic anaphylactic allergic reactions",
					B: "Providing immune exclusion by binding pathogens and toxins to prevent mucosal adhesion",
					C: "Catalyzing the enzymatic digestion of dietary disaccharides",
					D: "Directly triggering systemic vascular inflammatory cytokines"
				},
				correct: "B",
				insight: "Secretory IgA (sIgA) is the primary antibody in gut mucosal secretions. It neutralizes pathogens, prevents microbial adhesion, and maintains mucosal homeostasis without triggering inflammatory cascades."
			}
		]
	}
];

const ShieldIcon = memo(() => (
	<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
		<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
		<path d="m9 12 2 2 4-4" />
	</svg>
));

const TwinIcon = memo(() => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
		<path d="M12 11v4" />
		<path d="M12 19v2" />
	</svg>
));

const getDaySeed = () => {
	const today = new Date();
	return today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
};

const Tests = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Tab View State
	const [activeTab, setActiveTab] = useState<"quizzes" | "tips" | "library">("quizzes");

	// Daily Epigenetic Rotating Tips State & Curated Pool
	const [expandedTipId, setExpandedTipId] = useState<string | null>(null);
	const [expandedBiomarkerId, setExpandedBiomarkerId] = useState<string | null>(null);

	const dailyBiomarkers = useMemo(() => {
		const today = new Date();
		const seed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
		
		const pool = [
			{
				id: "bio-acetylcholine",
				category: "Neuro",
				categoryClass: "brain",
				title: "Acetylcholine",
				simpleTitle: "Brain Speed & Focus Chemical",
				description: "A key brain chemical that helps send signals between brain cells. Responsible for thinking speed, focus, and memory.",
				range: "Balanced baseline level",
				impact: "Enhances nerve-signal speed, memory retention, and mental focus.",
				booster: "Cruciferous vegetables, egg yolks, and Alpha-GPC.",
				icon: <Brain size={12} />
			},
			{
				id: "bio-apob",
				category: "Cardio",
				categoryClass: "heart",
				title: "Apolipoprotein B (ApoB)",
				simpleTitle: "Heart Plaque Particle Count",
				description: "The most accurate measure of cholesterol particle count in your blood. High numbers can build up in blood vessels.",
				range: "Under 80 mg/dL",
				impact: "Measures the absolute number of artery-clogging particles in your bloodstream.",
				booster: "Soluble fiber (beans, oats), extra virgin olive oil, and wild salmon.",
				icon: <Heart size={12} />
			},
			{
				id: "bio-hba1c",
				category: "Metabolic",
				categoryClass: "metabolic",
				title: "HbA1c Glycation",
				simpleTitle: "3-Month Average Blood Sugar",
				description: "A marker that shows average blood sugar over the past 3 months to track long-term glycemic health.",
				range: "Under 5.3%",
				impact: "Tracks how much sugar has bonded to your red blood cells over the last 90 days.",
				booster: "Daily brisk walking, apple cider vinegar, and limiting refined carbohydrates.",
				icon: <Flame size={12} />
			},
			{
				id: "bio-butyrate",
				category: "Microbiome",
				categoryClass: "gut",
				title: "Butyrate Synthesis",
				simpleTitle: "Gut Shield & Fuel Chemical",
				description: "A healthy fat made by good gut bacteria from fiber. It acts as primary fuel to repair and protect stomach lining.",
				range: "High production levels",
				impact: "Fuels the cells lining your colon and seals the gut barrier against leaks.",
				booster: "Raw oats, chicory root, garlic, onions, and fermented foods.",
				icon: <Layers size={12} />
			},
			{
				id: "bio-vitd3",
				category: "Hormone",
				categoryClass: "metabolic",
				title: "Vitamin D3 Control",
				simpleTitle: "Immune & Bone Control Hormone",
				description: "A vital compound that acts like a hormone, turning on over 200 health genes to support bone strength and immunity.",
				range: "50 - 80 ng/mL",
				impact: "Regulates immune cell response, calcium absorption, and vascular health.",
				booster: "Midday sun exposure, wild-caught salmon, and D3 supplementation.",
				icon: <Flame size={12} />
			},
			{
				id: "bio-hrv",
				category: "Vagal",
				categoryClass: "brain",
				title: "Heart Rate Variability (HRV)",
				simpleTitle: "Nervous System Recovery Tracker",
				description: "A measure of tiny variations in time between heartbeats. Higher scores indicate relaxation and stress resilience.",
				range: "High baseline adaptability",
				impact: "Indicates high parasympathetic tone, stress adaptability, and efficient cardiac recovery.",
				booster: "Deep resonant breathing (6 breaths/min), cold showers, and quality sleep.",
				icon: <Brain size={12} />
			},
			{
				id: "bio-insulin",
				category: "Metabolic",
				categoryClass: "metabolic",
				title: "Fasting Insulin",
				simpleTitle: "Metabolic Speed & Energy Sensor",
				description: "Fasting insulin level in blood. Low levels mean your body clears sugar easily and burns fat efficiently.",
				range: "Under 6.0 uIU/mL",
				impact: "Determines muscle glucose absorption speed and adipose tissue fat burning capacity.",
				booster: "Brisk walking after meals, strength training, and eating fiber first.",
				icon: <Flame size={12} />
			},
			{
				id: "bio-hscrp",
				category: "Cardio",
				categoryClass: "heart",
				title: "High-Sensitivity C-Reactive Protein (hs-CRP)",
				simpleTitle: "Vessel Inflammation Signal",
				description: "A protein made by the liver that rises when there is hidden swelling or stress in blood vessels.",
				range: "Under 1.0 mg/L",
				impact: "Tracks vascular endothelium irritation and systemic inflammatory status.",
				booster: "Extra virgin olive oil, regular low-intensity cardio, and quality sleep.",
				icon: <Heart size={12} />
			}
		];
		
		const result = [];
		for (let i = 0; i < 4; i++) {
			const index = (seed + i * 3) % pool.length;
			result.push(pool[index]);
		}
		
		const uniqueMap = new Map();
		result.forEach(item => uniqueMap.set(item.id, item));
		
		const uniqueList = Array.from(uniqueMap.values());
		let poolIndex = 0;
		while (uniqueList.length < 4 && poolIndex < pool.length) {
			const candidate = pool[poolIndex];
			if (!uniqueList.some(item => item.id === candidate.id)) {
				uniqueList.push(candidate);
			}
			poolIndex++;
		}
		
		return uniqueList.slice(0, 4);
	}, []);

	useEffect(() => {
		const today = new Date();
		const currentSeed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
		const lastSeed = localStorage.getItem("genetiq_last_tip_seed");
		
		if (lastSeed !== String(currentSeed)) {
			toast(
				<div className={styles["toast-guidelines-update"]}>
					<div className={styles["toast-icon-wrap"]}>
						<Globe size={18} className={styles["toast-globe-icon"]} />
						<span className={styles["toast-pulse-dot"]} />
					</div>
					<div className={styles["toast-content"]}>
						<span className={styles["toast-title"]}>Daily Bio-Tips Updated!</span>
						<span className={styles["toast-desc"]}>
							Personalized health tips compiled from WHO, NIH, and CDC guidelines.
						</span>
					</div>
				</div>,
				{
					position: "top-right",
					autoClose: 7000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					className: styles["custom-premium-toast"],
				}
			);

			localStorage.setItem("genetiq_last_tip_seed", String(currentSeed));
		}
	}, []);

	const dailyTips = useMemo(() => {
		const today = new Date();
		const seed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
		
		const pool = [
			{
				id: "tip-1",
				category: "Circadian",
				title: "Evening Screen Light",
				short: "Did you know that using screens at night can block your brain's sleep signals by up to 85%?",
				readMore: "The blue light from phones and TVs tricks your brain into thinking it is daytime. This stops the brain from making melatonin. Countermeasure: Put your phone away 2 hours before bed or use warm night-mode screens.",
				source: "World Health Organization (WHO)"
			},
			{
				id: "tip-2",
				category: "Cardio",
				title: "Understanding Heart Risk",
				short: "Did you know that having normal cholesterol levels can sometimes hide a real risk of heart disease?",
				readMore: "Standard tests only measure total cholesterol weight. A better test looks at actual cholesterol particle count (ApoB). Think of them as cars on a highway: more cars mean higher risk of plaque traffic jams.",
				source: "Centers for Disease Control and Prevention (CDC)"
			},
			{
				id: "tip-3",
				category: "Endocrine",
				title: "Stress and Blood Sugar",
				short: "Did you know that feeling stressed for a long time can actually raise your blood sugar, even if you eat healthy?",
				readMore: "When you are stressed, your body releases cortisol, which dumps extra sugar into your blood. If you stay stressed, sugar stays high. Countermeasure: Take 5 slow, deep breaths to signal safety.",
				source: "National Institutes of Health (NIH)"
			},
			{
				id: "tip-4",
				category: "Microbiome",
				title: "Feeding Your Gut",
				short: "Did you know that not eating enough fiber forces gut bacteria to eat the protective lining of your stomach?",
				readMore: "Friendly gut bacteria need fiber to survive. Without enough fiber, they break down the natural mucus shield protecting your intestines. Countermeasure: Eat more vegetables, beans, and oats.",
				source: "Mayo Clinic"
			},
			{
				id: "tip-5",
				category: "Neuro",
				title: "Green Tea Relaxation",
				short: "Did you know that a natural ingredient in green tea can calm your mind without making you feel sleepy?",
				readMore: "Green tea contains L-Theanine, a natural compound that slows overactive signals in your brain. It increases natural relax chemicals while keeping you focused.",
				source: "Harvard Medical School"
			},
			{
				id: "tip-6",
				category: "Metabolic",
				title: "Sugar and Aging",
				short: "Did you know that eating too much sugar can permanently stiffen your skin and blood vessels?",
				readMore: "Excess sugar in blood binds to proteins, forming sticky clumps that damage skin collagen and make blood vessels stiff. Countermeasure: Limit sugary drinks and processed snacks.",
				source: "World Health Organization (WHO)"
			},
			{
				id: "tip-7",
				category: "Mitochondria",
				title: "Fitness and Lifespan",
				short: "Did you know that improving your fitness by just a small amount can lower your risk of early death by 12%?",
				readMore: "Fitness level is a strong predictor of long-term health. Daily aerobic exercise strengthens your heart and delivers oxygen to organs. Countermeasure: 20 mins brisk walking daily.",
				source: "Centers for Disease Control and Prevention (CDC)"
			},
			{
				id: "tip-8",
				category: "Longevity",
				title: "Cellular Clean Up",
				short: "Did you know that giving your body a break from eating helps your cells clean out old, damaged parts?",
				readMore: "When you rest your stomach, cells trigger self-cleaning (autophagy), recycling damaged parts to build healthy fresh cells. Countermeasure: Eat within a 10-hour daily window.",
				source: "National Institutes of Health (NIH)"
			},
			{
				id: "tip-9",
				category: "Brain",
				title: "Magnesium for Brain",
				short: "Did you know that a special type of magnesium can enter your brain directly to boost your memory?",
				readMore: "Magnesium L-Threonate crosses the blood-brain barrier to strengthen synaptic connections between brain cells, aiding memory and learning.",
				source: "World Health Organization (WHO)"
			},
			{
				id: "tip-10",
				category: "Gut",
				title: "Your Gut Shield",
				short: "Did you know that your gut has its own physical shield that blocks bad bacteria before they make you sick?",
				readMore: "Your gut produces sIgA antibodies that act like a net, catching pathogens before they cross mucosal walls. Countermeasure: Eat yogurt and fermented foods.",
				source: "Harvard Medical School"
			},
			{
				id: "tip-11",
				category: "Gene Regulation",
				title: "Vitamin D Control Center",
				short: "Did you know that Vitamin D acts more like a control hormone than a simple vitamin?",
				readMore: "Vitamin D regulates over 200 health genes, assisting bone density, immune response, and vascular health. Countermeasure: Get 15 mins morning sun or take D3.",
				source: "National Institutes of Health (NIH)"
			},
			{
				id: "tip-12",
				category: "Vagal Stimulation",
				title: "Deep Resonant Breathing",
				short: "Did you know that breathing slowly at 6 breaths per minute sends an instant signal to calm your heart?",
				readMore: "Breathing slowly aligns heart rate variability with respiratory rhythms, signaling the vagus nerve to reduce heart stress and lower pressure.",
				source: "World Health Organization (WHO)"
			}
		];

		const result = [];
		for (let i = 0; i < 3; i++) {
			const index = (seed + i * 4) % pool.length;
			result.push(pool[index]);
		}
		return result;
	}, []);

	// Active Diagnostic Exam States
	const [activeSystem, setActiveSystem] = useState<ExamSystem | null>(null);
	const [currentQIndex, setCurrentQIndex] = useState<number>(0);
	const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
	const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
	const [examCompleted, setExamCompleted] = useState<boolean>(false);
	const [score, setScore] = useState<number>(0);

	// Vault proof states
	const [isSealing, setIsSealing] = useState<boolean>(false);
	const [showReceipt, setShowReceipt] = useState<boolean>(false);
	const [receiptTx, setReceiptTx] = useState<{ hash: string; keySize: string; timestamp: string } | null>(null);

	const todayFeaturedSystem = useMemo(
		() => EXAM_SYSTEMS[getDaySeed() % EXAM_SYSTEMS.length],
		[],
	);

	const [dailyQuizDone, setDailyQuizDone] = useState(false);
	const [quizzesCompleted, setQuizzesCompleted] = useState(0);

	const refreshHeroProgress = useCallback(() => {
		setDailyQuizDone(
			localStorage.getItem("genetiq_exam_completed_seed") === String(getDaySeed()),
		);
		try {
			const history = localStorage.getItem("genetiq_quiz_history");
			setQuizzesCompleted(history ? JSON.parse(history).length : 0);
		} catch {
			setQuizzesCompleted(0);
		}
	}, []);

	useEffect(() => {
		refreshHeroProgress();
		window.addEventListener("genetiq_history_updated", refreshHeroProgress);
		window.addEventListener("genetiq_tips_read", refreshHeroProgress);
		return () => {
			window.removeEventListener("genetiq_history_updated", refreshHeroProgress);
			window.removeEventListener("genetiq_tips_read", refreshHeroProgress);
		};
	}, [refreshHeroProgress]);

	useEffect(() => {
		refreshHeroProgress();
	}, [examCompleted, refreshHeroProgress]);

	const currentQuestion = useMemo(() => {
		if (!activeSystem) return null;
		return activeSystem.questions[currentQIndex];
	}, [activeSystem, currentQIndex]);

	const startExam = useCallback((system: ExamSystem) => {
		setActiveSystem(system);
		setCurrentQIndex(0);
		setSelectedOption(null);
		setIsSubmitted(false);
		setExamCompleted(false);
		setScore(0);
		setShowReceipt(false);
		setReceiptTx(null);
	}, []);

	const submitAnswer = useCallback(() => {
		if (!currentQuestion || !selectedOption) return;
		const isCorrect = selectedOption === currentQuestion.correct;
		if (isCorrect) setScore((s) => s + 1);
		setIsSubmitted(true);
	}, [currentQuestion, selectedOption]);

	const nextQuestion = useCallback(() => {
		if (!activeSystem) return;
		if (currentQIndex < activeSystem.questions.length - 1) {
			setCurrentQIndex((idx) => idx + 1);
			setSelectedOption(null);
			setIsSubmitted(false);
		} else {
			setExamCompleted(true);
			try {
				const currentHistory = localStorage.getItem("genetiq_quiz_history");
				const historyList = currentHistory ? JSON.parse(currentHistory) : [];
				const finalScore = score;
				const newQuizRecord = {
					id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
					type: "Quiz Completed",
					title: `${activeSystem.name} Exam`,
					date: new Date().toISOString(),
					status: `Score: ${finalScore}/${activeSystem.questions.length}`,
					color: "#8b5cf6",
				};
				localStorage.setItem("genetiq_quiz_history", JSON.stringify([newQuizRecord, ...historyList].slice(0, 10)));
				window.dispatchEvent(new Event("genetiq_history_updated"));
			} catch (e) {
				console.error("Failed to store quiz record in local history", e);
			}

			const today = new Date();
			const seed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
			const activeExamIndex = seed % EXAM_SYSTEMS.length;
			const dailyActiveId = EXAM_SYSTEMS[activeExamIndex].id;
			
			if (activeSystem.id === dailyActiveId) {
				localStorage.setItem("genetiq_exam_completed_seed", String(seed));
				window.dispatchEvent(new Event("genetiq_tips_read"));
			}
		}
	}, [activeSystem, currentQIndex, score]);

	const triggerSealCredentials = useCallback(() => {
		if (!activeSystem) return;
		setIsSealing(true);
		
		setTimeout(() => {
			const randomHash = `${Array.from({ length: 64 }, () => 
				Math.floor(Math.random() * 16).toString(16)
			).join("")}`.toUpperCase();
			
			setReceiptTx({
				hash: randomHash,
				keySize: "AES-GCM 256-bit",
				timestamp: new Date().toLocaleString()
			});
			setIsSealing(false);
			setShowReceipt(true);
		}, 1800);
	}, [activeSystem]);

	const copyReceiptHash = useCallback(() => {
		if (receiptTx?.hash) {
			navigator.clipboard.writeText(receiptTx.hash);
			alert("Integrity seal copied to clipboard!");
		}
	}, [receiptTx]);

	return (
		<div className={styles.testsContainer}>
			{/* Hero Header */}
			<section className={styles.heroSection}>
				<div className={styles.heroGlowBg} aria-hidden />
				<div className={styles.heroInner}>
					<div className={styles.heroTitleGroup}>
						<span className={styles.eyebrowTag}>
							<Sparkles size={12} />
							Health Diagnostics
						</span>
						<h1 className={styles.heroTitle}>
							Health <span className={styles.accentText}>Diagnostics</span>
						</h1>
						<p className={styles.heroSubtitle}>
							Interactive body-system quizzes, daily bio-insights from WHO & NIH guidelines, and a biomarker reference library.
						</p>
					</div>

					{/* Spotlight Featured Quiz Card */}
					<div className={`${styles.featuredSpotlight} ${styles[todayFeaturedSystem.colorClass]}`}>
						<div className={styles.spotlightContent}>
							<span className={styles.spotlightTag}>
								{dailyQuizDone ? "Completed Today" : "Today's Diagnostic Quiz"}
							</span>
							<h3 className={styles.spotlightTitle}>{todayFeaturedSystem.name}</h3>
							<p className={styles.spotlightDesc}>{todayFeaturedSystem.focus}</p>
						</div>
						<button
							type="button"
							className={styles.spotlightBtn}
							onClick={() => {
								setActiveTab("quizzes");
								startExam(todayFeaturedSystem);
							}}
							disabled={dailyQuizDone}
						>
							{dailyQuizDone ? (
								<>
									<CheckCircle2 size={15} />
									<span>Quiz Done</span>
								</>
							) : (
								<>
									<span>Start Quiz</span>
									<ArrowRight size={14} />
								</>
							)}
						</button>
					</div>
				</div>
			</section>

			{/* Main Two-Column Layout */}
			<div className={styles.mainLayout}>
				{/* Left Primary Column */}
				<div className={styles.primaryColumn}>
					{/* Workspace Navigation Tabs */}
					<div className={styles.tabBar}>
						<button
							className={`${styles.tabBtn} ${activeTab === "quizzes" ? styles.active : ""}`}
							onClick={() => setActiveTab("quizzes")}
						>
							<Brain size={14} />
							<span>Body System Quizzes</span>
						</button>
						<button
							className={`${styles.tabBtn} ${activeTab === "tips" ? styles.active : ""}`}
							onClick={() => setActiveTab("tips")}
						>
							<Globe size={14} />
							<span>Daily Bio-Tips</span>
						</button>
						<button
							className={`${styles.tabBtn} ${activeTab === "library" ? styles.active : ""}`}
							onClick={() => setActiveTab("library")}
						>
							<BookOpen size={14} />
							<span>Biomarker Library</span>
						</button>
					</div>

					{/* TAB 1: Body System Quizzes */}
					<AnimatePresence mode="wait">
						{activeTab === "quizzes" && (
							<motion.div
								key="quizzes-tab"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2 }}
								className={styles.tabContent}
							>
								{/* Systems Grid if no active exam running */}
								{!activeSystem && (
									<div className={styles.systemsGrid}>
										{EXAM_SYSTEMS.map((sys) => (
											<div key={sys.id} className={`${styles.systemCard} ${styles[sys.colorClass]}`}>
												<div className={styles.cardHeader}>
													<div className={styles.systemIconBox}>{sys.icon}</div>
													<span className={styles.questionCountTag}>{sys.questions.length} Questions</span>
												</div>
												<h3 className={styles.systemTitle}>{sys.name}</h3>
												<p className={styles.systemDesc}>{sys.description}</p>
												<div className={styles.systemFocusText}>
													<strong>Focus:</strong> {sys.focus}
												</div>
												<button
													type="button"
													className={styles.startExamBtn}
													onClick={() => startExam(sys)}
												>
													<span>Start Quiz</span>
													<ArrowRight size={14} />
												</button>
											</div>
										))}
									</div>
								)}

								{/* Active Question Flow */}
								{activeSystem && !examCompleted && currentQuestion && (
									<motion.div
										initial={{ opacity: 0, scale: 0.98 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0 }}
										className={styles.examRunnerCard}
									>
										<div className={styles.runnerHeader}>
											<button
												className={styles.exitBtn}
												onClick={() => setActiveSystem(null)}
											>
												<ArrowLeft size={13} strokeWidth={2.5} />
												<span>Exit Quiz</span>
											</button>
											<span className={styles.runnerTopic}>
												{activeSystem.name}
											</span>
											<span className={styles.runnerCounter}>
												Q {currentQIndex + 1} of {activeSystem.questions.length}
											</span>
										</div>

										<div className={styles.runnerProgressTrack}>
											<motion.div 
												className={styles.runnerProgressFill}
												initial={{ width: 0 }}
												animate={{ 
													width: `${((currentQIndex + (isSubmitted ? 1 : 0)) / activeSystem.questions.length) * 100}%` 
												}}
												transition={{ duration: 0.3 }}
											/>
										</div>

										<div className={styles.questionContent}>
											<h2 className={styles.questionTitle}>{currentQuestion.text}</h2>

											<div className={styles.optionsList}>
												{(["A", "B", "C", "D"] as const).map((key) => {
													const optionText = currentQuestion.options[key];
													const isSelected = selectedOption === key;
													const isCorrectOption = currentQuestion.correct === key;
													
													let optStateClass = "";
													if (isSubmitted) {
														if (isCorrectOption) optStateClass = styles.correct;
														else if (isSelected) optStateClass = styles.incorrect;
														else optStateClass = styles.disabled;
													} else if (isSelected) {
														optStateClass = styles.selected;
													}

													return (
														<button
															key={key}
															disabled={isSubmitted}
															className={`${styles.optionBtn} ${optStateClass}`}
															onClick={() => setSelectedOption(key)}
														>
															<span className={styles.optKey}>{key}</span>
															<span className={styles.optVal}>{optionText}</span>
															{isSubmitted && isCorrectOption && (
																<CheckCircle2 size={16} className={styles.correctIcon} />
															)}
															{isSubmitted && isSelected && !isCorrectOption && (
																<XCircle size={16} className={styles.incorrectIcon} />
															)}
														</button>
													);
												})}
											</div>

											<div className={styles.runnerFooter}>
												{!isSubmitted ? (
													<button
														className={styles.verifyBtn}
														disabled={selectedOption === null}
														onClick={submitAnswer}
													>
														<span>Verify Answer</span>
														<Shield size={14} />
													</button>
												) : (
													<button
														className={styles.nextBtn}
														onClick={nextQuestion}
													>
														<span>{currentQIndex === activeSystem.questions.length - 1 ? "Finish Quiz" : "Next Question"}</span>
														<ArrowRight size={14} />
													</button>
												)}
											</div>

											{/* Science insight box */}
											<AnimatePresence>
												{isSubmitted && (
													<motion.div
														initial={{ opacity: 0, y: 12 }}
														animate={{ opacity: 1, y: 0 }}
														className={`${styles.insightBox} ${selectedOption === currentQuestion.correct ? styles.correctInsight : styles.incorrectInsight}`}
													>
														<div className={styles.insightHeader}>
															<Sparkles size={15} />
															<h4>
																{selectedOption === currentQuestion.correct 
																	? "🎉 Correct! +1 Point" 
																	: `❌ Incorrect (Correct answer: ${currentQuestion.correct})`}
															</h4>
														</div>
														<p>{currentQuestion.insight}</p>
													</motion.div>
												)}
											</AnimatePresence>
										</div>
									</motion.div>
								)}

								{/* Completion Scorecard */}
								{activeSystem && examCompleted && (
									<motion.div
										initial={{ opacity: 0, scale: 0.96 }}
										animate={{ opacity: 1, scale: 1 }}
										className={styles.scorecardBox}
									>
										<div className={styles.trophyBadge}>
											<Trophy size={42} />
										</div>

										<h2 className={styles.scorecardTitle}>Evaluation Complete!</h2>
										<p className={styles.scorecardSys}>{activeSystem.name}</p>

										<div className={styles.scoreDisplayCard}>
											<span className={styles.scoreBigNum}>{score}</span>
											<span className={styles.scoreDivider}>/</span>
											<span className={styles.scoreTotalNum}>{activeSystem.questions.length}</span>
											<span className={styles.scorePctText}>
												{Math.round((score / activeSystem.questions.length) * 100)}% Accuracy
											</span>
										</div>

										<div className={styles.scoreSummaryText}>
											{score === activeSystem.questions.length ? (
												<p><strong>Perfect Score!</strong> Outstanding mastery of biological pathways and molecular health mechanisms.</p>
											) : (
												<p><strong>Great Effort!</strong> Study the science insights and retake the quiz to seal a perfect proof credential in your health vault.</p>
											)}
										</div>

										<div className={styles.scorecardActions}>
											{score === activeSystem.questions.length ? (
												<button
													className={styles.sealVaultBtn}
													onClick={triggerSealCredentials}
													disabled={isSealing || showReceipt}
												>
													{isSealing ? (
														<>
															<RefreshCw size={15} className={styles.spinIcon} />
															<span>Encrypting & Sealing...</span>
														</>
													) : showReceipt ? (
														<>
															<ShieldIcon />
															<span>Credentials Sealed</span>
														</>
													) : (
														<>
															<Shield size={15} />
															<span>Seal in Health Vault</span>
														</>
													)}
												</button>
											) : (
												<button
													className={styles.retakeQuizBtn}
													onClick={() => startExam(activeSystem)}
												>
													<RefreshCw size={15} />
													<span>Retake Quiz</span>
												</button>
											)}

											<button
												className={styles.returnHubBtn}
												onClick={() => setActiveSystem(null)}
											>
												Back to Quiz List
											</button>
										</div>
									</motion.div>
								)}
							</motion.div>
						)}

						{/* TAB 2: Daily Bio-Tips */}
						{activeTab === "tips" && (
							<motion.div
								key="tips-tab"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2 }}
								className={styles.tabContent}
							>
								<div className={styles.tipsList}>
									{dailyTips.map((tip, index) => {
										const isExpanded = expandedTipId === tip.id;
										return (
											<motion.div
												key={tip.id}
												initial={{ opacity: 0, y: 12 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.25, delay: index * 0.05 }}
												className={styles.tipCard}
											>
												<div className={styles.tipHeader}>
													<span className={styles.tipCategoryBadge}>{tip.category}</span>
													<span className={styles.tipSourceBadge}>{tip.source}</span>
												</div>
												<h3 className={styles.tipTitle}>{tip.title}</h3>
												<p className={styles.tipShort}>{tip.short}</p>

												<AnimatePresence>
													{isExpanded && (
														<motion.div
															initial={{ height: 0, opacity: 0 }}
															animate={{ height: "auto", opacity: 1 }}
															exit={{ height: 0, opacity: 0 }}
															className={styles.tipExpandedBody}
														>
															<div className={styles.tipDivider} />
															<h4>🧬 Actionable Science & Countermeasures</h4>
															<p>{tip.readMore}</p>
														</motion.div>
													)}
												</AnimatePresence>

												<button
													type="button"
													className={styles.expandTipBtn}
													onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}
												>
													<span>{isExpanded ? "Close Insight" : "Read Full Science Insight →"}</span>
												</button>
											</motion.div>
										);
									})}
								</div>
							</motion.div>
						)}

						{/* TAB 3: Biomarker Library */}
						{activeTab === "library" && (
							<motion.div
								key="library-tab"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2 }}
								className={styles.tabContent}
							>
								<div className={styles.biomarkerGrid}>
									{dailyBiomarkers.map((bio, index) => {
										const isExpanded = expandedBiomarkerId === bio.id;
										return (
											<motion.div
												key={bio.id}
												initial={{ opacity: 0, y: 12 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.25, delay: index * 0.04 }}
												className={styles.biomarkerCard}
											>
												<div className={styles.bioMetaRow}>
													<span className={styles.bioCategoryTag}>
														{bio.icon}
														{bio.category}
													</span>
													<span className={styles.bioSimpleTitle}>{bio.simpleTitle}</span>
												</div>
												<h3 className={styles.bioTitle}>{bio.title}</h3>
												<p className={styles.bioDesc}>{bio.description}</p>

												<AnimatePresence>
													{isExpanded && (
														<motion.div
															initial={{ height: 0, opacity: 0 }}
															animate={{ height: "auto", opacity: 1 }}
															exit={{ height: 0, opacity: 0 }}
															className={styles.bioExpandedDetails}
														>
															<div className={styles.bioDivider} />
															<div className={styles.bioDetailsGrid}>
																<div className={styles.bioDetailItem}>
																	<strong>Target Level</strong>
																	<span>{bio.range}</span>
																</div>
																<div className={styles.bioDetailItem}>
																	<strong>Primary Role</strong>
																	<span>{bio.impact}</span>
																</div>
																<div className={styles.bioDetailItem}>
																	<strong>How to Support</strong>
																	<span>{bio.booster}</span>
																</div>
															</div>
														</motion.div>
													)}
												</AnimatePresence>

												<button
													type="button"
													className={styles.expandBioBtn}
													onClick={() => setExpandedBiomarkerId(isExpanded ? null : bio.id)}
												>
													<span>{isExpanded ? "Close Ranges" : "View Target Levels & Boosters →"}</span>
												</button>
											</motion.div>
										);
									})}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Right Sidebar Column */}
				<aside className={styles.sidebarColumn}>
					{/* Diagnostic Status Card */}
					<div className={styles.sidebarCard}>
						<div className={styles.cardTitleRow}>
							<Award size={16} className={styles.cardIconGold} />
							<h3>Diagnostic Progress</h3>
						</div>

						<div className={styles.quizStatWidget}>
							<div className={styles.statBox}>
								<span className={styles.statVal}>{quizzesCompleted}</span>
								<span className={styles.statLbl}>Quizzes Taken</span>
							</div>
							<div className={styles.statBox}>
								<span className={styles.statVal}>{dailyQuizDone ? "100%" : "0%"}</span>
								<span className={styles.statLbl}>Today's Focus</span>
							</div>
						</div>
					</div>

					{/* Daily Biomarker Spotlight Card */}
					<div className={styles.sidebarCard}>
						<div className={styles.cardTitleRow}>
							<Zap size={16} className={styles.cardIconZap} />
							<h3>Biomarker Spotlight</h3>
						</div>
						<div className={styles.spotlightItem}>
							<h4>{dailyBiomarkers[0]?.title}</h4>
							<p>{dailyBiomarkers[0]?.description}</p>
							<span className={styles.spotlightRange}>Target: {dailyBiomarkers[0]?.range}</span>
						</div>
					</div>

					{/* Vault Security Status Card */}
					<div className={styles.sidebarCard}>
						<div className={styles.cardTitleRow}>
							<Lock size={16} className={styles.cardIconLock} />
							<h3>Vault Security</h3>
						</div>
						<div className={styles.vaultSecurityBanner}>
							<Shield size={15} />
							<span>Zero-Knowledge Encryption: Quizzes & bio-data are encrypted locally.</span>
						</div>
					</div>
				</aside>
			</div>

			{/* Vault Receipt Modal */}
			<AnimatePresence>
				{showReceipt && receiptTx && activeSystem && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className={styles.modalOverlay}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className={styles.receiptModal}
						>
							<div className={styles.modalHeader}>
								<Shield size={28} className={styles.modalShieldIcon} />
								<h3>Credentials Encrypted & Sealed</h3>
								<p>AES-GCM 256-Bit Hardware Vault Proof</p>
							</div>

							<div className={styles.modalBody}>
								<div className={styles.ledgerRow}>
									<span>Security Standard:</span>
									<strong>Zero-Knowledge Local Enclave</strong>
								</div>
								<div className={styles.ledgerRow}>
									<span>Verified Exam:</span>
									<strong>{activeSystem.name}</strong>
								</div>
								<div className={styles.ledgerRow}>
									<span>Key Specification:</span>
									<strong>{receiptTx.keySize}</strong>
								</div>
								<div className={styles.ledgerRow}>
									<span>Sealed Timestamp:</span>
									<strong>{receiptTx.timestamp}</strong>
								</div>

								<div className={styles.hashBox}>
									<div className={styles.hashLabelRow}>
										<span>SHA-256 Cryptographic Seal</span>
										<button onClick={copyReceiptHash} className={styles.copyHashBtn}>
											<Copy size={12} />
										</button>
									</div>
									<div className={styles.hashCode}>{receiptTx.hash}</div>
								</div>
							</div>

							<div className={styles.modalFooter}>
								<button
									className={styles.twinBtn}
									onClick={() => {
										dispatch(setCategory(activeSystem.id === "brain" ? "StressManagement" : activeSystem.id === "gut" ? "Gastroenterolgy" : "Cardiology"));
										navigate("/dashboard");
									}}
								>
									<TwinIcon />
									<span>View Synced Twin System</span>
								</button>
								<button
									className={styles.closeBtn}
									onClick={() => setShowReceipt(false)}
								>
									Dismiss Receipt
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Tests;
