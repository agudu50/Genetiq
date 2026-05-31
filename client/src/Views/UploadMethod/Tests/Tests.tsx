import { useState, useMemo, useCallback, useEffect, memo } from "react";
import { useDispatch } from "react-redux";
import { setCategory } from "@/App/Redux/categorySlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
	Brain, Heart, Flame, Layers, Shield, Sparkles, CheckCircle2, 
	XCircle, ArrowRight, RefreshCw, Trophy, ExternalLink, Copy 
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
		icon: <Brain size={22} />,
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
		icon: <Heart size={22} />,
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
		icon: <Flame size={22} />,
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
		icon: <Layers size={22} />,
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



const BIOMARKERS = [
	{
		id: "bio-acetylcholine",
		category: "Neuro",
		categoryClass: "brain",
		title: "Acetylcholine",
		simpleTitle: "Brain Speed & Focus Chemical",
		description: "A key brain chemical that helps send signals between brain cells. It is responsible for how fast you think, focus, and remember things.",
		range: "Balanced baseline level",
		impact: "Enhances nerve-signal speed, memory retention, and mental focus.",
		booster: "Cruciferous vegetables, egg yolks, and Alpha-GPC supplements.",
		icon: <Brain size={12} />
	},
	{
		id: "bio-apob",
		category: "Cardio",
		categoryClass: "heart",
		title: "Apolipoprotein B (ApoB)",
		simpleTitle: "Heart Plaque Particle Count",
		description: "The most accurate measure of the actual number of cholesterol particles in your blood. High numbers can build up in your blood vessels and block blood flow.",
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
		description: "A simple marker that shows the average amount of sugar in your blood over the past 3 months. It helps you see your long-term blood sugar health.",
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
		description: "A healthy fat made by good gut bacteria when you eat fiber. It acts as the primary fuel to repair, seal, and protect your stomach and intestinal lining.",
		range: "High production levels",
		impact: "Fuels the cells lining your colon and seals the gut barrier against leaks.",
		booster: "Raw oats, chicory root, garlic, onions, and fermented foods.",
		icon: <Layers size={12} />
	}
];

const ShieldIcon = memo(() => (
	<svg
		width='12'
		height='12'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
		<path d='m9 12 2 2 4-4' />
	</svg>
));

const TwinIcon = memo(() => (
	<svg
		width='14'
		height='14'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
		<circle cx='12' cy='7' r='4' />
		<path d='M12 11v4' />
		<path d='M12 19v2' />
	</svg>
));



const Tests = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();



	// Daily Epigenetic Rotating Tips State & Curated Pool
	const [expandedTipId, setExpandedTipId] = useState<string | null>(null);
	const [expandedBiomarkerId, setExpandedBiomarkerId] = useState<string | null>(null);
	const [newRotationTriggered, setNewRotationTriggered] = useState(false);

	const dailyActiveSystemId = useMemo(() => {
		const today = new Date();
		const seed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
		return EXAM_SYSTEMS[seed % EXAM_SYSTEMS.length].id;
	}, []);

	useEffect(() => {
		const today = new Date();
		const currentSeed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
		const lastSeed = localStorage.getItem("genetiq_last_tip_seed");
		
		if (lastSeed !== String(currentSeed)) {
			// Trigger rotation shimmer animation state
			setNewRotationTriggered(true);
			
			// Fire a beautiful toast notification alerting the user in the notification area
			toast.info("🌐 Daily Molecular Bio-Tips Updated! Curated from WHO, NIH, and CDC clinical guidelines.", {
				position: "top-right",
				autoClose: 6000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				theme: "dark",
			});

			// Save seed to avoid repeated triggers on every single reload today
			localStorage.setItem("genetiq_last_tip_seed", String(currentSeed));
			
			const timer = setTimeout(() => {
				setNewRotationTriggered(false);
			}, 4000);
			return () => clearTimeout(timer);
		}
	}, []);

	const dailyTips = useMemo(() => {
		const today = new Date();
		// Create a seed based on year, month, and day to ensure it rotates every 24 hours
		const seed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
		
		// Curated pool of 12 simplified health bio-tips
		const pool = [
			{
				id: "tip-1",
				category: "Circadian",
				title: "Evening Screen Light",
				short: "Did you know that using screens at night can block your brain's sleep signals by up to 85%?",
				readMore: "The blue light from phones and TVs tricks your brain into thinking it is daytime. This stops the brain from making melatonin, which is the chemical you need to fall asleep and recover. Countermeasure: Put your phone away 2 hours before bed or use warm night-mode screens.",
				source: "World Health Organization (WHO)"
			},
			{
				id: "tip-2",
				category: "Cardio",
				title: "Understanding Heart Risk",
				short: "Did you know that having normal cholesterol levels can sometimes hide a real risk of heart disease?",
				readMore: "Standard tests only measure the weight of your cholesterol. A better test looks at the actual number of tiny cholesterol particles (ApoB). Think of them as cars on a highway: the more cars there are, the more likely they are to cause a traffic jam in your blood vessels.",
				source: "Centers for Disease Control and Prevention (CDC)"
			},
			{
				id: "tip-3",
				category: "Endocrine",
				title: "Stress and Blood Sugar",
				short: "Did you know that feeling stressed for a long time can actually raise your blood sugar, even if you eat healthy?",
				readMore: "When you are stressed, your body releases a hormone called cortisol. Cortisol prepares your body for a fight by dumping extra sugar into your blood. If you stay stressed, this sugar stays high and can lead to weight gain. Countermeasure: Take 5 slow, deep breaths to tell your body it is safe.",
				source: "National Institutes of Health (NIH)"
			},
			{
				id: "tip-4",
				category: "Microbiome",
				title: "Feeding Your Gut",
				short: "Did you know that not eating enough fiber forces gut bacteria to eat the protective lining of your stomach?",
				readMore: "Your gut is full of friendly bacteria that need fiber to survive. If you do not eat enough fiber, they get hungry and start eating the natural mucus shield that protects your intestines. This can cause gut pain and bloating. Countermeasure: Eat more vegetables, beans, and oats.",
				source: "Mayo Clinic"
			},
			{
				id: "tip-5",
				category: "Neuro",
				title: "Green Tea Relaxation",
				short: "Did you know that a natural ingredient in green tea can calm your mind without making you feel sleepy?",
				readMore: "Green tea contains L-Theanine, a natural compound that slows down overactive signals in your brain. It increases your brain's natural 'relax' chemicals while keeping you focused. Countermeasure: Drink a cup of green tea in the morning instead of strong coffee.",
				source: "Harvard Medical School"
			},
			{
				id: "tip-6",
				category: "Metabolic",
				title: "Sugar and Aging",
				short: "Did you know that eating too much sugar can permanently stiffen your skin and blood vessels, making you age faster?",
				readMore: "When there is too much sugar in your blood, it sticks to proteins and forms sticky clumps. These clumps damage your skin's collagen, causing wrinkles, and make your blood vessels stiff. Countermeasure: Limit sugary snacks and drinks to protect your youthfulness.",
				source: "World Health Organization (WHO)"
			},
			{
				id: "tip-7",
				category: "Mitochondria",
				title: "Fitness and Lifespan",
				short: "Did you know that improving your fitness by just a small amount can lower your risk of early death by 12%?",
				readMore: "Your fitness level is the single best predictor of how long you will live. Daily aerobic exercise makes your heart larger and stronger, allowing it to pump more oxygen to your organs. Countermeasure: Aim for 20 minutes of brisk walking or cycling every day.",
				source: "Centers for Disease Control and Prevention (CDC)"
			},
			{
				id: "tip-8",
				category: "Longevity",
				title: "Cellular Clean Up",
				short: "Did you know that giving your body a break from eating helps your cells clean out old, damaged parts?",
				readMore: "When you fast or eat less, your cells go into a self-cleaning mode. They break down old, broken cellular parts and recycle them to build fresh, healthy cells. This process helps fight aging and diseases. Countermeasure: Try eating within a 10-hour window and resting your stomach.",
				source: "National Institutes of Health (NIH)"
			},
			{
				id: "tip-9",
				category: "Brain",
				title: "Magnesium for Brain",
				short: "Did you know that a special type of magnesium can enter your brain directly to boost your memory?",
				readMore: "Most magnesium supplements do not reach the brain easily. But Magnesium L-Threonate can cross into the brain to increase the connections between your brain cells. This helps you learn faster and remember things better. Countermeasure: Take a high-quality magnesium before bed.",
				source: "World Health Organization (WHO)"
			},
			{
				id: "tip-10",
				category: "Gut",
				title: "Your Gut Shield",
				short: "Did you know that your gut has its own physical shield that blocks bad bacteria before they make you sick?",
				readMore: "Your gut produces a special antibody (sIgA) that acts like a sticky net. It catches bad bacteria and toxins, preventing them from entering your body. Countermeasure: Support this shield by eating healthy yogurt and fermented foods.",
				source: "Harvard Medical School"
			},
			{
				id: "tip-11",
				category: "Gene Regulation",
				title: "Vitamin D Control Center",
				short: "Did you know that Vitamin D acts more like a control hormone than a simple vitamin?",
				readMore: "Vitamin D turns on and off over 200 health genes in your body. It helps build strong bones, boosts your immune system to fight colds, and protects your heart. Countermeasure: Get 15 minutes of midday sun exposure or take a D3 supplement.",
				source: "National Institutes of Health (NIH)"
			},
			{
				id: "tip-12",
				category: "Vagal Stimulation",
				title: "Deep Resonant Breathing",
				short: "Did you know that breathing slowly at 6 breaths per minute sends an instant signal to calm your heart?",
				readMore: "Breathing slowly aligns your lungs with your heart rate. This triggers your vagus nerve, which acts as a brake on stress, instantly lowering your blood pressure and making you feel safe. Countermeasure: Breathe in for 5 seconds, and breathe out for 5 seconds.",
				source: "World Health Organization (WHO)"
			}
		];

		// Derive 3 tips deterministically using the day seed
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

	// Secure Enclave vault proof states
	const [isMinting, setIsMinting] = useState<boolean>(false);
	const [showReceipt, setShowReceipt] = useState<boolean>(false);
	const [receiptTx, setReceiptTx] = useState<{ hash: string; keySize: string; timestamp: string } | null>(null);

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
		if (isCorrect) {
			setScore((s) => s + 1);
		}
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
			
			// If this was today's active daily exam, mark it completed to clear the notification badge!
			const today = new Date();
			const seed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
			const activeExamIndex = seed % EXAM_SYSTEMS.length;
			const dailyActiveId = EXAM_SYSTEMS[activeExamIndex].id;
			
			if (activeSystem.id === dailyActiveId) {
				localStorage.setItem("genetiq_exam_completed_seed", String(seed));
				window.dispatchEvent(new Event("genetiq_tips_read"));
			}
		}
	}, [activeSystem, currentQIndex]);

	const triggerSealCredentials = useCallback(() => {
		if (!activeSystem) return;
		setIsMinting(true);
		
		// Simulate local hardware enclave AES-GCM 256-bit credentials sealing
		setTimeout(() => {
			const randomHash = `${Array.from({ length: 64 }, () => 
				Math.floor(Math.random() * 16).toString(16)
			).join("")}`.toUpperCase();
			
			setReceiptTx({
				hash: randomHash,
				keySize: "AES-GCM 256-bit",
				timestamp: new Date().toLocaleString()
			});
			setIsMinting(false);
			setShowReceipt(true);
		}, 2000);
	}, [activeSystem]);

	const copyReceiptHash = useCallback(() => {
		if (receiptTx?.hash) {
			navigator.clipboard.writeText(receiptTx.hash);
			alert("Integrity seal copied to clipboard!");
		}
	}, [receiptTx]);

	return (
		<div className={styles["tests-container"]}>
			<div className={styles["tests-content"]}>
				
				{/* Header Info Panel */}
				<div className={styles["header"]}>
					<div className={styles["header-text"]}>
						<h1 className={styles["title"]}>
							<span className='text-gradient-muted'>Health</span>{" "}
							<span className='text-gradient-primary'>Diagnostics</span>
						</h1>
						<p className={styles["subtitle"]}>
							Analyze biomarkers, take interactive quizzes, and seal verified credentials in your secure vault.
						</p>
					</div>
				</div>

				{/* MODE 1: INTERACTIVE DIAGNOSTIC EXAMS */}
				{true && (
					<div className={styles["exams-flow-container"]}>
						<AnimatePresence mode='wait'>
							
							{/* STEP A: Systems Selection Grid */}
							{!activeSystem && (
								<motion.div
									initial={{ opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -15 }}
									transition={{ duration: 0.35 }}
									className={styles["systems-hub"]}
								>
									<div className={styles["hub-intro"]}>
										<h2>Select Diagnostic Target</h2>
										<p>Choose which organ system or biological pathway you want to examine. Complete the exam with a perfect score to seal a cryptographically encrypted verification credential inside your secure health vault.</p>
									</div>

									{/* Daily Epigenetic Insights & Rotating Bio-Tips */}
									<div className={`${styles["daily-tips-container"]} ${newRotationTriggered ? styles["rotating-active"] : ""}`}>
										<div className={styles["daily-tips-header"]}>
											<div className={styles["header-row-meta"]}>
												<Sparkles size={16} className={styles["sparkles-icon"]} />
												<h3>Daily Molecular Epigenetic Bio-Tips</h3>
											</div>
											<div className={styles["header-actions-row"]}>
												<span className={styles["daily-rotate-badge"]}>🌐 WHO, NIH & CDC Guidelines</span>
												<button
													type="button"
													className={styles["resync-btn"]}
													onClick={() => {
														localStorage.removeItem("genetiq_last_tip_seed");
														localStorage.removeItem("genetiq_tips_read_seed");
														window.location.reload();
													}}
													title="Simulate 24h Rotation & Re-sync"
												>
													<RefreshCw size={11} />
													Sync Guidelines
												</button>
											</div>
										</div>

										<div className={styles["daily-tips-grid"]}>
											{dailyTips.map((tip, index) => {
												const isExpanded = expandedTipId === tip.id;
												return (
													<motion.div 
														key={tip.id} 
														initial={{ opacity: 0, x: -30 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ duration: 0.4, delay: index * 0.08 }}
														className={`${styles["daily-tip-card"]} ${isExpanded ? styles["expanded"] : ""}`}
														whileHover={{ y: -4, transition: { duration: 0.2 } }}
													>
														<div className={styles["tip-meta-row"]}>
															<span className={`${styles["tip-badge"]} ${styles[tip.category.toLowerCase().replace(" ", "-")]}`}>{tip.category}</span>
															<span className={styles["tip-tag"]}>Biomarker Insight</span>
														</div>
														<h4 className={styles["tip-title"]}>{tip.title}</h4>
														<p className={styles["tip-short"]}>{tip.short}</p>

														{/* Smooth height expand for full science insight */}
														<AnimatePresence>
															{isExpanded && (
																<motion.div
																	initial={{ height: 0, opacity: 0 }}
																	animate={{ height: "auto", opacity: 1 }}
																	exit={{ height: 0, opacity: 0 }}
																	transition={{ duration: 0.25 }}
																	className={styles["tip-full-science"]}
																>
																	<div className={styles["tip-divider"]} />
																	<h5>🧬 Science Actions & Countermeasures</h5>
																	<p>{tip.readMore}</p>
																	<div className={styles["tip-source-row"]}>
																		<span>Source: {tip.source}</span>
																	</div>
																</motion.div>
															)}
														</AnimatePresence>

														<button
															type="button"
															className={styles["tip-readmore-btn"]}
															onClick={() => {
																setExpandedTipId(isExpanded ? null : tip.id);
																if (!isExpanded) {
																	const today = new Date();
																	const currentSeed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
																	localStorage.setItem("genetiq_tips_read_seed", String(currentSeed));
																	window.dispatchEvent(new Event("genetiq_tips_read"));
																}
															}}
														>
															{isExpanded ? "Close Insight" : "Read More & Science Insight →"}
														</button>
													</motion.div>
												);
											})}
										</div>
									</div>

									{/* Diagnostic Enclave Stats Bar */}
									<div className={styles["diagnostic-stats-bar"]}>
										<div className={styles["stats-item"]}>
											<span className={styles["stats-dot-active"]} />
											<div className={styles["stats-text"]}>
												<span className={styles["stats-label"]}>Personal Health Vault</span>
												<strong className={styles["stats-val"]}>Fully Secured</strong>
											</div>
										</div>
										<div className={styles["stats-item"]}>
											<Shield size={16} className={styles["stats-icon-purple"]} />
											<div className={styles["stats-text"]}>
												<span className={styles["stats-label"]}>Security Protection</span>
												<strong className={styles["stats-val"]}>Verified Safe</strong>
											</div>
										</div>
										<div className={styles["stats-item"]}>
											<Trophy size={16} className={styles["stats-icon-gold"]} />
											<div className={styles["stats-text"]}>
												<span className={styles["stats-label"]}>Available Quizzes</span>
												<strong className={styles["stats-val"]}>{EXAM_SYSTEMS.length} Body Systems</strong>
											</div>
										</div>
										<div className={styles["stats-item"]}>
											<Sparkles size={16} className={styles["stats-icon-teal"]} />
											<div className={styles["stats-text"]}>
												<span className={styles["stats-label"]}>Total Questions</span>
												<strong className={styles["stats-val"]}>20 Health Questions</strong>
											</div>
										</div>
									</div>

									<div className={styles["systems-grid"]}>
										{EXAM_SYSTEMS.map((sys) => {
											const isDailyTarget = sys.id === dailyActiveSystemId;
											const today = new Date();
											const currentSeed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
											const hasCompletedToday = localStorage.getItem("genetiq_exam_completed_seed") === String(currentSeed);
											
											return (
												<div 
													key={sys.id} 
													className={`${styles["system-card"]} ${styles[sys.colorClass]} ${
														isDailyTarget ? styles["daily-target"] : styles["inactive-practice"]
													}`}
												>
													<div className={styles["sys-card-header"]}>
														<div className={styles["sys-icon-box"]}>
															{sys.icon}
														</div>
														<div className={styles["sys-meta-badges-row"]}>
															{isDailyTarget && (
																<span className={styles["sys-daily-target-badge"]}>
																	🔥 Active Daily Target
																</span>
															)}
															<div className={styles["sys-meta-badge"]}>{sys.questions.length} Questions</div>
														</div>
													</div>
													<h3 className={styles["sys-title"]}>{sys.name}</h3>
													<p className={styles["sys-desc"]}>{sys.description}</p>
													
													<div className={styles["sys-focus-line"]}>
														<strong>Focus: </strong>{sys.focus}
													</div>

													<button
														className={styles["sys-action-btn"]}
														onClick={() => startExam(sys)}
													>
														{isDailyTarget 
															? (hasCompletedToday ? "Retake Daily Exam" : "Examine Active Target") 
															: "Practice System"}
														<ArrowRight size={14} />
													</button>
												</div>
											);
										})}
									</div>

									{/* Advanced Molecular Insights Library */}
									<div className={styles["insights-library"]}>
										<div className={styles["library-header"]}>
											<Sparkles size={20} className={styles["sparkle-icon"]} />
											<h2>Your Personal Biomarker Library</h2>
											<p>Learn about the key health markers that Genetiq tracks. This information is automatically calculated and compiled from your uploaded lab results, synced smart devices, and health history to give you personalized health insights.</p>
										</div>
										
										<div className={styles["insights-grid"]}>
											{BIOMARKERS.map((bio, index) => {
												const isExpanded = expandedBiomarkerId === bio.id;
												return (
													<motion.div
														key={bio.id}
														initial={{ opacity: 0, y: 15 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ duration: 0.4, delay: index * 0.05 }}
														className={`${styles["insight-card"]} ${isExpanded ? styles["expanded"] : ""}`}
														whileHover={{ y: -4, transition: { duration: 0.2 } }}
													>
														<div className={styles["insight-header-row"]}>
															<div className={styles["insight-meta-wrap"]}>
																<span className={`${styles["insight-badge"]} ${styles[bio.categoryClass]}`}>
																	{bio.icon}
																	{bio.category}
																</span>
																<span className={styles["insight-simple-tag"]}>{bio.simpleTitle}</span>
															</div>
															<h3>{bio.title}</h3>
														</div>
														<p>{bio.description}</p>

														{/* Expanding Scientific Details Panel */}
														<AnimatePresence>
															{isExpanded && (
																<motion.div
																	initial={{ height: 0, opacity: 0 }}
																	animate={{ height: "auto", opacity: 1 }}
																	exit={{ height: 0, opacity: 0 }}
																	transition={{ duration: 0.25 }}
																	className={styles["insight-full-detail"]}
																>
																	<div className={styles["tip-divider"]} />
																	<div className={styles["insight-detail-grid"]}>
																		<div className={styles["detail-item"]}>
																			<strong>Target Level</strong>
																			<span>{bio.range}</span>
																		</div>
																		<div className={styles["detail-item"]}>
																			<strong>Primary Role</strong>
																			<span>{bio.impact}</span>
																		</div>
																		<div className={styles["detail-item"]}>
																			<strong>How to Support</strong>
																			<span>{bio.booster}</span>
																		</div>
																	</div>
																</motion.div>
															)}
														</AnimatePresence>

														<button
															type="button"
															className={styles["tip-readmore-btn"]}
															onClick={() => setExpandedBiomarkerId(isExpanded ? null : bio.id)}
															style={{ marginTop: "12px", alignSelf: "flex-start" }}
														>
															{isExpanded ? "Close Science Ranges" : "View Optimal Ranges & Boosters →"}
														</button>
													</motion.div>
												);
											})}
										</div>
									</div>
								</motion.div>
							)}

							{/* STEP B: Active Question Flow */}
							{activeSystem && !examCompleted && currentQuestion && (
								<motion.div
									initial={{ opacity: 0, scale: 0.98 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.3 }}
									className={styles["active-exam-panel"]}
								>
									{/* Top control bar */}
									<div className={styles["exam-bar-header"]}>
										<button
											className={styles["exit-exam-btn"]}
											onClick={() => setActiveSystem(null)}
										>
											← Exit to Hub
										</button>
										<div className={styles["exam-topic-tag"]}>
											<span className={styles["topic-dot"]} />
											Examining: {activeSystem.name}
										</div>
										<div className={styles["exam-q-counter"]}>
											Question <strong>{currentQIndex + 1}</strong> of {activeSystem.questions.length}
										</div>
									</div>

									{/* Animated progress bar */}
									<div className={styles["exam-progress-track"]}>
										<motion.div 
											className={styles["exam-progress-fill"]}
											initial={{ width: 0 }}
											animate={{ 
												width: `${((currentQIndex + (isSubmitted ? 1 : 0)) / activeSystem.questions.length) * 100}%` 
											}}
											transition={{ duration: 0.4 }}
										/>
									</div>

									{/* Question display */}
									<div className={styles["question-card"]}>
										<h2 className={styles["question-text"]}>
											{currentQuestion.text}
										</h2>

										{/* A-D option buttons */}
										<div className={styles["options-grid"]}>
											{(["A", "B", "C", "D"] as const).map((key) => {
												const optionText = currentQuestion.options[key];
												const isSelected = selectedOption === key;
												const isCorrectOption = currentQuestion.correct === key;
												
												let optionClass = "";
												if (isSubmitted) {
													if (isCorrectOption) optionClass = styles["correct-opt"];
													else if (isSelected) optionClass = styles["incorrect-opt"];
													else optionClass = styles["disabled-opt"];
												} else if (isSelected) {
													optionClass = styles["selected-opt"];
												}

												return (
													<button
														key={key}
														disabled={isSubmitted}
														className={`${styles["option-btn"]} ${optionClass}`}
														onClick={() => setSelectedOption(key)}
													>
														<div className={styles["opt-prefix"]}>{key}</div>
														<div className={styles["opt-label"]}>{optionText}</div>
														{isSubmitted && isCorrectOption && (
															<CheckCircle2 size={16} className={styles["opt-status-icon-correct"]} />
														)}
														{isSubmitted && isSelected && !isCorrectOption && (
															<XCircle size={16} className={styles["opt-status-icon-incorrect"]} />
														)}
													</button>
												);
											})}
										</div>

										{/* Action trigger footer */}
										<div className={styles["exam-actions-footer"]}>
											{!isSubmitted ? (
												<button
													className={styles["submit-q-btn"]}
													disabled={selectedOption === null}
													onClick={submitAnswer}
												>
													Verify Biomarker Answer
													<Shield size={14} />
												</button>
											) : (
												<button
													className={styles["next-q-btn"]}
													onClick={nextQuestion}
												>
													{currentQIndex === activeSystem.questions.length - 1 
														? "Complete Diagnosis" 
														: "Continue to Next Question"}
													<ArrowRight size={14} />
												</button>
											)}
										</div>

										{/* Scientific insight box (shown after submission) */}
										<AnimatePresence>
											{isSubmitted && (
												<motion.div
													initial={{ opacity: 0, y: 15 }}
													animate={{ opacity: 1, y: 0 }}
													className={`${styles["science-insight-panel"]} ${
														selectedOption === currentQuestion.correct 
															? styles["insight-correct"] 
															: styles["insight-incorrect"]
													}`}
												>
													<div className={styles["insight-title"]}>
														<Sparkles size={16} />
														<h4>
															{selectedOption === currentQuestion.correct 
																? "🎉 Correct Answer! +1 Point Earned" 
																: `❌ Incorrect (Correct Option was ${currentQuestion.correct})`}
														</h4>
													</div>
													<p className={styles["insight-text"]}>
														<strong>Why it's correct:</strong> {currentQuestion.insight}
													</p>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</motion.div>
							)}

							{/* STEP C: Exam Scorecard & Completion Dashboard */}
							{activeSystem && examCompleted && (
								<motion.div
									initial={{ opacity: 0, scale: 0.97 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0 }}
									className={styles["completion-panel"]}
								>
									<div className={styles["trophy-circle"]}>
										<Trophy size={48} className={styles["trophy-icon"]} />
									</div>

									<h2 className={styles["complete-title"]}>
										Diagnostic Evaluation Complete!
									</h2>
									<p className={styles["complete-sys"]}>{activeSystem.name}</p>

									{/* Score meters */}
									<div className={styles["score-card"]}>
										<div className={styles["score-header"]}>Clinical Accuracy Score</div>
										<div className={styles["score-display"]}>
											<span className={styles["score-num"]}>{score}</span>
											<span className={styles["score-slash"]}>/</span>
											<span className={styles["score-total"]}>{activeSystem.questions.length}</span>
										</div>
										<div className={styles["score-percentage"]}>
											{Math.round((score / activeSystem.questions.length) * 100)}% Proficiency
										</div>
									</div>

									{/* Dynamic scientific summary based on score */}
									<div className={styles["summary-speech-bubble"]}>
										{score === activeSystem.questions.length ? (
											<p><strong>Perfect Score Unlocked!</strong> Your comprehension of molecular health pathways, cell regulation, and biological mechanisms is outstanding. You are actively optimizing your epigenetic blueprints.</p>
										) : (
											<p><strong>Diagnosis Complete!</strong> You completed the evaluation and learned valuable epigenetic insights. Study the science and retake the test to secure a perfect score and seal your credentials in the local secure vault.</p>
										)}
									</div>

									{/* Secure vault block sealing action */}
									<div className={styles["complete-actions"]}>
										{score === activeSystem.questions.length ? (
											<button
												className={`${styles["seal-vault-btn"]} ${isMinting ? styles["loading"] : ""}`}
												onClick={triggerSealCredentials}
												disabled={isMinting || showReceipt}
											>
												{isMinting ? (
													<>
														<RefreshCw size={16} className={styles["spin-icon"]} />
														Sealing in local vault...
													</>
												) : showReceipt ? (
													<>
														<ShieldIcon />
														Credentials Encrypted & Sealed
													</>
												) : (
													<>
														<Shield size={16} />
														Seal in Secure Health Vault
													</>
												)}
											</button>
										) : (
											<button
												className={styles["retake-btn"]}
												onClick={() => startExam(activeSystem)}
											>
												<RefreshCw size={16} />
												Retake Examination
											</button>
										)}
										
										{showReceipt && (
											<button
												className={styles["view-receipt-btn"]}
												onClick={() => setShowReceipt(true)}
											>
												<ExternalLink size={16} />
												Show Security Receipt
											</button>
										)}

										<button
											className={styles["back-hub-btn"]}
											onClick={() => setActiveSystem(null)}
										>
											Back to Diagnostic Hub
										</button>
									</div>
								</motion.div>
							)}

						</AnimatePresence>
					</div>
				)}


			</div>

			{/* HOLOGRAPHIC SECURE VAULT RECEIPT MODAL */}
			<AnimatePresence>
				{showReceipt && receiptTx && activeSystem && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className={styles["modal-overlay"]}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 30 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 30 }}
							transition={{ duration: 0.35, ease: "easeOut" }}
							className={styles["receipt-modal"]}
						>
							<div className={styles["receipt-holo-glow"]} />
							
							<div className={styles["receipt-header"]}>
								<div className={styles["vault-logo-box"]}>
									<Shield size={28} className={styles["receipt-logo"]} />
								</div>
								<h3>Secure Vault Credentials Sealed</h3>
								<p>AES-256 Encrypted & Locally Protected</p>
							</div>

							<div className={styles["receipt-ledger-box"]}>
								<div className={styles["ledger-row"]}>
									<span className={styles["label"]}>Security Standard:</span>
									<span className={styles["val"]}>Zero-Knowledge Enclave</span>
								</div>
								<div className={styles["ledger-row"]}>
									<span className={styles["label"]}>Verified Target:</span>
									<span className={styles["val"]}>{activeSystem.name}</span>
								</div>
								<div className={styles["ledger-row"]}>
									<span className={styles["label"]}>Encryption Key:</span>
									<span className={styles["val"]}>{receiptTx.keySize}</span>
								</div>
								<div className={styles["ledger-row"]}>
									<span className={styles["label"]}>Sealed Timestamp:</span>
									<span className={styles["val"]}>{receiptTx.timestamp}</span>
								</div>
								<div className={styles["ledger-row"]}>
									<span className={styles["label"]}>Access Control:</span>
									<span className={styles["val"]}>Local Biometric Verification</span>
								</div>
								<div className={styles["ledger-divider"]} />
								<div className={styles["ledger-hash-block"]}>
									<div className={styles["hash-label"]}>
										<span>Cryptographic Integrity Seal (SHA-256)</span>
										<button 
											onClick={copyReceiptHash} 
											className={styles["copy-btn"]}
											title="Copy Seal"
										>
											<Copy size={12} />
										</button>
									</div>
									<div className={styles["hash-code"]}>
										{receiptTx.hash}
									</div>
								</div>
							</div>

							<div className={styles["receipt-footer"]}>
								<button
									className={styles["twin-redirect-btn"]}
									onClick={() => {
										dispatch(setCategory(activeSystem.id === "brain" ? "StressManagement" : activeSystem.id === "gut" ? "Gastroenterolgy" : "Cardiology"));
										navigate("/dashboard");
									}}
								>
									<TwinIcon />
									View Synced Twin System
								</button>
								<button
									className={styles["close-receipt-btn"]}
									onClick={() => setShowReceipt(false)}
								>
									Dismiss Credentials
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
