import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
	ShieldCheck,
	Activity,
	Brain,
	ArrowRight,
	Upload,
	ScanLine,
	Salad,
	Lock,
	X,
	ChevronDown,
	Github,
	Twitter,
	Linkedin,
	FlaskConical,
	HeartPulse,
} from "lucide-react";
import { paths } from "@/App/Routes/Paths";
import styles from "./Landing.module.scss";

// ─── Static data ─────────────────────────────────────────────────────────────

const PILLARS = [
	{
		title: "Snap or Upload Your Results",
		desc: "Got a paper copy of your lab results? Take a photo. Got a PDF from your clinic? Upload it. Genetiq reads any format no typing needed.",
		icon: <Upload size={32} />,
	},
	{
		title: "AI Explains It in Plain English",
		desc: "Your AI instantly reads your results and tells you exactly what each number means what's normal, what's not, and why it matters for your body.",
		icon: <Brain size={32} />,
	},
	{
		title: "Get a Personal Health Plan",
		desc: "Based on your results, the AI recommends foods to eat, foods to avoid, lifestyle habits to build, and when to follow up with a doctor.",
		icon: <Salad size={32} />,
	},
];

const ECOSYSTEM = [
	{
		number: "01",
		title: "Upload Your Test Results",
		desc: "Take a photo of your paper lab result or upload a PDF from your clinic or hospital. Our AI supports blood tests, urine tests, hormone panels, and more.",
	},
	{
		number: "02",
		title: "AI Reads & Explains Everything",
		desc: "In seconds, the AI breaks down every value on your results flagging what's high, what's low, and what it means for your health in words anyone can understand.",
	},
	{
		number: "03",
		title: "Get Your Personal Action Plan",
		desc: "Receive tailored diet tips, food recommendations, supplement suggestions, and lifestyle changes all built around your specific test results.",
	},
	{
		number: "04",
		title: "Track Progress Over Time",
		desc: "Upload results again weeks later and see what's improved, what needs attention, and how your body is responding to the changes you've made.",
	},
];

const SUI_EDGE = [
	{
		title: "Supports All Major Test Types",
		desc: "Blood count, liver function, kidney function, hormones, cholesterol, blood sugar, thyroid Genetiq's AI understands them all and explains each one clearly.",
		icon: <FlaskConical size={24} />,
	},
	{
		title: "Your Data Stays Private",
		desc: "Your test results are encrypted and stored securely. Only you can access them. We never sell or share your health information with anyone — ever.",
		icon: <Lock size={24} />,
	},
];

const STATS = [
	{ value: 15000, display: "15K+", label: "Test Results Explained" },
	{ value: 98, display: "98%", label: "Users Said It Was Easy to Understand" },
	{ value: 0, display: "ZERO", label: "Data Leaks. Ever." },
	{ value: 30, display: "<30s", label: "To Get Your AI Explanation" },
];

const MEDICAL_SOVEREIGNTY = [
	{
		title: "All Your Results, One Place",
		desc: "Every test you've ever uploaded is saved to your profile. See how your health has changed over months and years — not just from one appointment.",
		icon: <Activity size={24} />,
	},
	{
		title: "Share With Your Doctor Easily",
		desc: "Going to a consultation? Share your full history with your doctor using a secure one-time link. They get the context they need, you stay in control.",
		icon: <HeartPulse size={24} />,
	},
];

const HERO_WORDS = ["Finally Clear", "Explained", "In Plain English", "Yours"];

const FAQS = [
	{
		q: "What kind of test results can I upload?",
		a: "You can upload almost any lab result — blood tests (CBC, metabolic panels), urine tests, hormone panels, cholesterol checks, thyroid tests, liver and kidney function tests, and more. If it came from a lab, our AI can read it.",
	},
	{
		q: "Can I just take a photo of my paper result?",
		a: "Yes! Just open Genetiq, tap 'Upload Results', and take a photo of your paper lab sheet. Our AI will scan it, extract all the values, and explain them to you in seconds. No PDF needed.",
	},
	{
		q: "What does the AI actually tell me?",
		a: "For each value on your result (like Hemoglobin, Glucose, ALT, etc.), the AI tells you: what it measures, whether yours is normal or not, what it means for your health, and what you can do about it all in plain, everyday language.",
	},
	{
		q: "Does Genetiq recommend a diet based on my results?",
		a: "Yes. After reading your results, the AI gives you personalised food and lifestyle recommendations. For example, if your iron is low, it'll suggest iron-rich foods. If your cholesterol is high, it'll recommend what to eat less of — and why.",
	},
	{
		q: "Does Genetiq replace my doctor?",
		a: "No and it's not meant to. Genetiq helps you understand your results so you're not confused or worried after leaving the clinic. Think of it as a translator that turns medical jargon into clear advice, so your next doctor visit is much more productive.",
	},
	{
		q: "Is my health data kept private?",
		a: "Absolutely. Your test results and health data are encrypted and stored securely. We never share or sell your data. Only you can access it, and you decide if a doctor gets temporary access.",
	},
];

const BUILDER = {
	name: "Anthony Gudu",
	role: "Founder & Builder",
	bio: "I built Genetiq after watching my mum come home from a clinic visit confused and anxious she had a stack of lab results in her hand but no idea what any of the numbers meant. The doctor had 10 minutes and 20 patients. She had no one to ask. I realised millions of people face the same thing every day. Genetiq is my answer: upload your results, and within seconds, know exactly what they mean and what to do next.",
	tags: ["Full-Stack Engineer", "Health Tech", "AI & Accessibility"],
	github: "https://github.com",
	twitter: "https://twitter.com",
	linkedin: "https://linkedin.com",
};

// ─── Particle Canvas ──────────────────────────────────────────────────────────

function ParticleCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animId: number;
		let W = (canvas.width = window.innerWidth);
		let H = (canvas.height = window.innerHeight * 2.5);

		const NUM = 120;
		type Particle = {
			x: number; y: number; vx: number; vy: number;
			r: number; alpha: number; color: string;
		};

		const COLORS = ["#00A69D", "#06B6D4", "#34D399", "#00A69D", "#ffffff"];
		const particles: Particle[] = Array.from({ length: NUM }, () => ({
			x: Math.random() * W,
			y: Math.random() * H,
			vx: (Math.random() - 0.5) * 0.4,
			vy: (Math.random() - 0.5) * 0.4,
			r: Math.random() * 2 + 0.5,
			alpha: Math.random() * 0.5 + 0.1,
			color: COLORS[Math.floor(Math.random() * COLORS.length)],
		}));

		function draw() {
			if (!ctx) return;
			ctx.clearRect(0, 0, W, H);

			// draw connection lines
			for (let i = 0; i < particles.length; i++) {
				for (let j = i + 1; j < particles.length; j++) {
					const dx = particles[i].x - particles[j].x;
					const dy = particles[i].y - particles[j].y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < 140) {
						ctx.beginPath();
						ctx.moveTo(particles[i].x, particles[i].y);
						ctx.lineTo(particles[j].x, particles[j].y);
						ctx.strokeStyle = `rgba(0,166,157,${0.15 * (1 - dist / 140)})`;
						ctx.lineWidth = 0.5;
						ctx.stroke();
					}
				}
			}

			// draw particles
			particles.forEach((p) => {
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
				ctx.fillStyle = p.color.replace(")", `,${p.alpha})`).replace("rgb", "rgba").replace("#", "");
				// simpler approach:
				ctx.globalAlpha = p.alpha;
				ctx.fillStyle = p.color;
				ctx.fill();
				ctx.globalAlpha = 1;

				p.x += p.vx;
				p.y += p.vy;
				if (p.x < 0 || p.x > W) p.vx *= -1;
				if (p.y < 0 || p.y > H) p.vy *= -1;
			});

			animId = requestAnimationFrame(draw);
		}

		draw();

		const onResize = () => {
			W = canvas.width = window.innerWidth;
			H = canvas.height = window.innerHeight * 2.5;
		};
		window.addEventListener("resize", onResize);

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener("resize", onResize);
		};
	}, []);

	return <canvas ref={canvasRef} className={styles.particleCanvas} />;
}

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────

function useScrollReveal() {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
			{ threshold: 0.12 }
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

	return { ref, visible };
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedStat({ stat, visible }: { stat: typeof STATS[0]; visible: boolean }) {
	const [count, setCount] = useState(0);
	const started = useRef(false);

	useEffect(() => {
		if (!visible || started.current || typeof stat.value !== "number") return;
		if (stat.display === "ZERO" || stat.display === "24/7") return;
		started.current = true;
		const end = stat.value;
		const duration = 1800;
		const start = performance.now();
		function frame(now: number) {
			const t = Math.min((now - start) / duration, 1);
			const ease = 1 - Math.pow(1 - t, 4);
			setCount(Math.floor(ease * end));
			if (t < 1) requestAnimationFrame(frame);
		}
		requestAnimationFrame(frame);
	}, [visible, stat]);

	const display =
		stat.display === "ZERO" || stat.display === "24/7"
			? stat.display
			: stat.display.includes("M")
				? `${(count / 1_000_000).toFixed(1)}M`
				: `${count}+`;

	return <span className={styles.statValue}>{display}</span>;
}

// ─── Typewriter ───────────────────────────────────────────────────────────────

function Typewriter({ words }: { words: string[] }) {
	const [wordIdx, setWordIdx] = useState(0);
	const [text, setText] = useState("");
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		const current = words[wordIdx];
		let timeout: ReturnType<typeof setTimeout>;

		if (!deleting && text === current) {
			timeout = setTimeout(() => setDeleting(true), 1800);
		} else if (deleting && text === "") {
			setDeleting(false);
			setWordIdx((i) => (i + 1) % words.length);
		} else if (deleting) {
			timeout = setTimeout(() => setText((t) => t.slice(0, -1)), 55);
		} else {
			timeout = setTimeout(() => setText((t) => current.slice(0, t.length + 1)), 90);
		}

		return () => clearTimeout(timeout);
	}, [text, deleting, wordIdx, words]);

	return (
		<span className={styles.typewriter}>
			{text}
			<span className={styles.cursor} />
		</span>
	);
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const InitializeModal = ({
	isOpen,
	onClose,
	onConfirm,
}: {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
}) => {
	if (!isOpen) return null;
	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modalContent}>
				<button className={styles.modalClose} onClick={onClose}>
					<X size={20} />
				</button>
				<div className={styles.modalHeader}>
					<div className={styles.securityIcon}>
						<ShieldCheck size={32} />
					</div>
					<h2 className={styles.modalTitle}>Upload Your First Result — It's Free</h2>
				</div>
				<div className={styles.modalBody}>
					<p>Take a photo of your lab results or upload a PDF. Our AI will read it and explain every value to you in plain English plus give you a personalised diet and health plan.</p>
					<p className={styles.securityNote}>🔒 Your results are private and belong only to you. We never share them.</p>
				</div>
				<div className={styles.modalActions}>
					<button className={styles.btnModalOutline} onClick={onClose}>Cancel</button>
					<button className={styles.btnModalPrimary} onClick={onConfirm}>
						Get Started <ArrowRight size={18} />
					</button>
				</div>
			</div>
		</div>
	);
};

// ─── FAQ Section ─────────────────────────────────────────────────────────────

function FaqSection() {
	const [openIdx, setOpenIdx] = useState<number | null>(null);
	const reveal = useScrollReveal();

	return (
		<section id='faq' className={styles.faqSection}>
			<div
				ref={reveal.ref}
				className={`${styles.sectionHeader} ${reveal.visible ? styles.revealIn : styles.revealHidden}`}
			>
				<span className={styles.badge}>Got Questions?</span>
				<h2 className={styles.sectionTitle}>We've Got Answers</h2>
				<p className={styles.sectionSub}>
					Everything you need to know about Genetiq, explained simply.
				</p>
			</div>

			<div className={styles.faqList}>
				{FAQS.map((faq, i) => (
					<div
						key={i}
						className={`${styles.faqItem} ${openIdx === i ? styles.faqOpen : ""} ${reveal.visible ? styles.cardIn : styles.cardHidden}`}
						style={{ animationDelay: `${i * 0.08}s` }}
					>
						<button
							className={styles.faqQuestion}
							onClick={() => setOpenIdx(openIdx === i ? null : i)}
							aria-expanded={openIdx === i}
						>
							<span>{faq.q}</span>
							<ChevronDown size={20} className={styles.faqChevron} />
						</button>
						<div className={styles.faqAnswer}>
							<p>{faq.a}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

// ─── Builder Section ──────────────────────────────────────────────────────────

function BuilderSection() {
	const reveal = useScrollReveal();

	return (
		<section id='builder' className={styles.builderSection}>
			<div
				ref={reveal.ref}
				className={`${styles.sectionHeader} ${reveal.visible ? styles.revealIn : styles.revealHidden}`}
			>
				<span className={styles.badge}>The Person Behind It</span>
				<h2 className={styles.sectionTitle}>Built by Someone Who Needed It</h2>
			</div>

			<div className={`${styles.builderCard} ${reveal.visible ? styles.revealIn : styles.revealHidden}`}>
				<div className={styles.builderAvatar}>
					<img src='/assets/genetiq_logo_v2.png' alt={BUILDER.name} className={styles.builderAvatarImg} />
					<div className={styles.builderAvatarGlow} />
				</div>

				<div className={styles.builderInfo}>
					<div className={styles.builderMeta}>
						<h3 className={styles.builderName}>{BUILDER.name}</h3>
						<span className={styles.builderRole}>{BUILDER.role}</span>
					</div>

					<p className={styles.builderBio}>"{BUILDER.bio}"</p>

					<div className={styles.builderTags}>
						{BUILDER.tags.map((tag) => (
							<span key={tag} className={styles.builderTag}>{tag}</span>
						))}
					</div>

					<div className={styles.builderSocials}>
						<a href={BUILDER.github} target='_blank' rel='noopener noreferrer' className={styles.socialLink} aria-label='GitHub'>
							<Github size={20} />
						</a>
						<a href={BUILDER.twitter} target='_blank' rel='noopener noreferrer' className={styles.socialLink} aria-label='Twitter'>
							<Twitter size={20} />
						</a>
						<a href={BUILDER.linkedin} target='_blank' rel='noopener noreferrer' className={styles.socialLink} aria-label='LinkedIn'>
							<Linkedin size={20} />
						</a>
					</div>
				</div>

				<div className={styles.builderQuote}>
					<div className={styles.builderQuoteIcon}>"</div>
					<p>You shouldn't need a medical degree to understand your own test results.</p>
				</div>
			</div>
		</section>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────


export default function Landing() {
	const navigate = useNavigate();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [heroVisible, setHeroVisible] = useState(false);

	const pillarsReveal    = useScrollReveal();
	const sovereignReveal  = useScrollReveal();
	const ecosystemReveal  = useScrollReveal();
	const securityReveal   = useScrollReveal();
	const statsReveal      = useScrollReveal();
	const ctaReveal        = useScrollReveal();

	useEffect(() => {
		const t = setTimeout(() => setHeroVisible(true), 100);
		return () => clearTimeout(t);
	}, []);

	useEffect(() => {
		let ticking = false;
		const handleScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					setIsScrolled(window.scrollY > 50);
					ticking = false;
				});
				ticking = true;
			}
		};
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleProceed = () => {
		setIsModalOpen(false);
		navigate(paths.auth.register);
	};

	return (
		<div className={styles.page}>
			{/* ── Particle background ───────────────────────────── */}
			<ParticleCanvas />

			{/* ── Ambient orbs ─────────────────────────────────── */}
			<div className={styles.orb1} />
			<div className={styles.orb2} />
			<div className={styles.orb3} />

			{/* ── Navbar ───────────────────────────────────────── */}
			<nav className={`${styles.nav} ${isScrolled ? styles.scrolled : ""}`}>
				<div className={styles.navInner}>
					<div className={styles.logo} onClick={() => navigate(paths.landing)}>
						<img src='/assets/genetiq_logo_v2.png' alt='Genetiq Logo' className={styles.logoImage} />
						<span className={styles.logoText}>Genetiq</span>
					</div>
					<div className={styles.navLinks}>
						<a href='#pillars' className={styles.navLink}>How It Works</a>
						<a href='#ecosystem' className={styles.navLink}>Features</a>
						<a href='#stats' className={styles.navLink}>Impact</a>
						<a href='#faq' className={styles.navLink}>FAQ</a>
						<a href='#builder' className={styles.navLink}>About</a>
						<button className={styles.btnNavOutline} onClick={() => navigate(paths.auth.login)}>Log In</button>
						<button className={styles.btnNavPrimary} onClick={() => setIsModalOpen(true)}>Get Started Free</button>
					</div>
				</div>
			</nav>

			{/* ── Hero ─────────────────────────────────────────── */}
			<section className={`${styles.hero} ${heroVisible ? styles.heroIn : ""}`}>
				<div className={styles.heroContent}>
					<div className={styles.heroBadge}>
						<span className={styles.heroBadgeDot} />
						Upload Your Lab Results · AI Explains Everything
					</div>
					<h1 className={styles.heroTitle}>
						Your Test Results, <br />
						<Typewriter words={HERO_WORDS} />
					</h1>
					<p className={styles.heroSub}>
						Confused by your lab results? Just snap a photo or upload the PDF. Genetiq's AI reads every value and tells you exactly what it means plus what to eat, what to change, and what to watch out for.
					</p>
					<div className={styles.heroCtas}>
						<button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
							Upload Your First Result Free <ArrowRight size={20} />
						</button>
					</div>

					{/* Data pulse lines */}
					<div className={styles.dataPulseRow}>
						{["Blood Count", "Cholesterol", "Blood Sugar", "Hormones", "Liver", "Kidney"].map((tag, i) => (
							<span key={tag} className={styles.dataPulseTag} style={{ animationDelay: `${i * 0.3}s` }}>
								{tag}
							</span>
						))}
					</div>
				</div>

				<div className={styles.heroVisual}>
					<div className={styles.heroGlowRing} />
					<div className={styles.heroGlowRing2} />
					<img
						src='/assets/digital_twin_hero.png'
						alt='Digital Twin 3D Preview'
						className={styles.heroImage}
					/>
					{/* Orbiting badges */}
					<div className={`${styles.orbitBadge} ${styles.orbitBadge1}`}>
						<ScanLine size={14} /> AI Reads Your Results
					</div>
					<div className={`${styles.orbitBadge} ${styles.orbitBadge2}`}>
						<Salad size={14} /> Diet & Lifestyle Plan
					</div>
					<div className={`${styles.orbitBadge} ${styles.orbitBadge3}`}>
						<ShieldCheck size={14} /> Private & Secure
					</div>
				</div>
			</section>

			{/* ── Three Pillars ─────────────────────────────────── */}
			<section id='pillars' className={styles.section}>
				<div ref={pillarsReveal.ref} className={`${styles.sectionHeader} ${pillarsReveal.visible ? styles.revealIn : styles.revealHidden}`}>
					<span className={styles.badge}>How Genetiq Helps You</span>
					<h2 className={styles.sectionTitle}>From Confusing Numbers to Clear Answers</h2>
				</div>
				<div className={styles.pillarGrid}>
					{PILLARS.map((pillar, i) => (
						<div
							key={pillar.title}
							className={`${styles.pillarCard} ${pillarsReveal.visible ? styles.cardIn : styles.cardHidden}`}
							style={{ animationDelay: `${i * 0.15}s` }}
						>
							<div className={styles.pillarIconWrapper}>{pillar.icon}</div>
							<h3 className={styles.pillarTitle}>{pillar.title}</h3>
							<p className={styles.pillarDesc}>{pillar.desc}</p>
							<div className={styles.cardGlowLine} />
						</div>
					))}
				</div>
			</section>

			{/* ── Medical Sovereignty ───────────────────────────── */}
			<section className={styles.historySection}>
				<div ref={sovereignReveal.ref} className={`${styles.sectionHeader} ${sovereignReveal.visible ? styles.revealIn : styles.revealHidden}`}>
					<span className={styles.badge}>Your History, Always With You</span>
					<h2 className={styles.sectionTitle}>Every Result Saved, Every Change Tracked</h2>
					<p className={styles.historySub}>
						Every test you upload becomes part of your health story. See what's improved, what needs attention, and share your full history with any doctor — safely and on your terms.
					</p>
				</div>
				<div className={styles.historyGrid}>
					<div className={styles.historyContent}>
						{MEDICAL_SOVEREIGNTY.map((item, i) => (
							<div
								key={item.title}
								className={`${styles.historyDetailCard} ${sovereignReveal.visible ? styles.cardIn : styles.cardHidden}`}
								style={{ animationDelay: `${i * 0.2}s` }}
							>
								<div className={styles.hd_icon}>{item.icon}</div>
								<div className={styles.hd_text}>
									<h3>{item.title}</h3>
									<p>{item.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Ecosystem ─────────────────────────────────────── */}
			<section id='ecosystem' className={styles.section}>
				<div ref={ecosystemReveal.ref} className={styles.ecosystemGrid}>
					<div className={`${styles.ecoVisual} ${ecosystemReveal.visible ? styles.slideInLeft : styles.slideHidden}`}>
						<div className={styles.ecoImageWrap}>
							<img
								src='/assets/digital_twin_hero.png'
								alt='Ecosystem'
								className={styles.mockScreen}
							/>
							<div className={styles.ecoScanLine} />
						</div>
					</div>
					<div className={`${styles.ecoList} ${ecosystemReveal.visible ? styles.slideInRight : styles.slideHidden}`}>
						<div className={styles.badge} style={{ alignSelf: "flex-start" }}>Step by Step</div>
						<h2 className={styles.sectionTitle} style={{ textAlign: "left" }}>Upload Once, Understand Everything</h2>
						{ECOSYSTEM.map((feat, i) => (
							<div key={feat.title} className={styles.ecoItem} style={{ animationDelay: `${i * 0.15}s` }}>
								<span className={styles.ecoNumber}>{feat.number}</span>
								<div className={styles.ecoContent}>
									<h4>{feat.title}</h4>
									<p>{feat.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Security & Privacy ────────────────────────────── */}
			<section className={`${styles.section} ${styles.suiEdgeSection}`}>
				<div ref={securityReveal.ref} className={`${styles.sectionHeader} ${securityReveal.visible ? styles.revealIn : styles.revealHidden}`}>
					<span className={styles.badge}>What the AI Can Read</span>
					<h2 className={styles.sectionTitle}>Wide Coverage, Deep Understanding</h2>
					<p className={styles.sectionSub}>
						Whether it's a routine blood count or a specialist hormone panel, Genetiq's AI has been trained to understand and explain the results clearly.
					</p>
				</div>
				<div className={styles.techGrid}>
					{SUI_EDGE.map((tech, i) => (
						<div
							key={tech.title}
							className={`${styles.techCard} ${securityReveal.visible ? styles.cardIn : styles.cardHidden}`}
							style={{ animationDelay: `${i * 0.2}s` }}
						>
							<h3>{tech.icon} {tech.title}</h3>
							<p>{tech.desc}</p>
							<div className={styles.cardGlowLine} />
						</div>
					))}
				</div>
			</section>

			{/* ── Stats ─────────────────────────────────────────── */}
			<section id='stats' className={styles.statsSection}>
				<div ref={statsReveal.ref} className={styles.statsGrid}>
					{STATS.map((stat, i) => (
						<div
							key={stat.label}
							className={`${styles.statItem} ${statsReveal.visible ? styles.cardIn : styles.cardHidden}`}
							style={{ animationDelay: `${i * 0.12}s` }}
						>
							<AnimatedStat stat={stat} visible={statsReveal.visible} />
							<span className={styles.statLabel}>{stat.label}</span>
						</div>
					))}
				</div>
			</section>

			{/* ── FAQ ──────────────────────────────────────────── */}
			<FaqSection />

			{/* ── Builder ──────────────────────────────────────── */}
			<BuilderSection />

			{/* ── Final CTA ─────────────────────────────────────── */}
			<section className={styles.finalCta}>
				<div ref={ctaReveal.ref} className={`${styles.finalCtaContent} ${ctaReveal.visible ? styles.revealIn : styles.revealHidden}`}>
					<div className={styles.ctaGlowPulse} />
					<h2 className={styles.finalTitle}>Got test results you don't understand?</h2>
					<p className={styles.finalSub}>Upload them now. Our AI will explain every number in plain English — free, in under 30 seconds.</p>
					<button className={styles.btnLarge} onClick={() => setIsModalOpen(true)}>
						Upload My Results Free <ArrowRight size={24} />
					</button>
				</div>
			</section>

			<InitializeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleProceed} />

			{/* ── Footer ───────────────────────────────────────── */}
			<footer className={styles.footer}>
				<div className={styles.footerInner}>
					<div className={styles.footerTop}>
						<div>
							<span className={styles.footerLogo}>Genetiq</span>
							<p className={styles.footerDesc}>
								Upload your lab results. Get plain-English explanations. Receive a personal diet and health plan — all powered by AI.
							</p>
						</div>
						<div className={styles.footerLinksGrid}>
							<div className={styles.footerLinkCol}>
								<h4>Protocol</h4>
								<ul className={styles.footerLinkList}>
									<li><a href='#'>Walrus Storage</a></li>
									<li><a href='#'>Sui zkLogin</a></li>
								</ul>
							</div>
							<div className={styles.footerLinkCol}>
								<h4>Resources</h4>
								<ul className={styles.footerLinkList}>
									<li><a href='#faq'>Documentation</a></li>
									<li><a href='#'>Whitepaper</a></li>
								</ul>
							</div>
							<div className={styles.footerLinkCol}>
								<h4>Legal</h4>
								<ul className={styles.footerLinkList}>
									<li><a href='#'>Privacy Policy</a></li>
									<li><a href='#'>Terms of Service</a></li>
								</ul>
							</div>
						</div>
					</div>
					<div className={styles.footerBottom}>
						© 2026 Genetiq. Making health data simple, one result at a time.
					</div>
				</div>
			</footer>
		</div>
	);
}
