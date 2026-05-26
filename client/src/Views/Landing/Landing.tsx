import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
	ShieldCheck,
	Activity,
	Brain,
	ArrowRight,
	Database,
	Lock,
	X,
} from "lucide-react";
import { paths } from "@/App/Routes/Paths";
import styles from "./Landing.module.scss";

// ─── Static data ─────────────────────────────────────────────────────────────

const PILLARS = [
	{
		title: "Your Health, Your Records",
		desc: "All your blood tests, doctor visits, and health checks are saved in one place. You own them — no one else can see or share them without your permission.",
		icon: <Activity size={32} />,
	},
	{
		title: "AI That Helps You Understand",
		desc: "Our AI reads your health data and explains what it means in plain language. It spots patterns, flags risks early, and suggests simple steps to feel better.",
		icon: <Brain size={32} />,
	},
	{
		title: "Kept Private & Safe",
		desc: "Your health information is locked with strong encryption — like a bank vault. Only you decide who can see it. We never sell or share your data.",
		icon: <ShieldCheck size={32} />,
	},
];

const ECOSYSTEM = [
	{
		number: "01",
		title: "See Your Full Health Picture",
		desc: "Get a clear breakdown of your genes, blood results, and body stats — all in one easy-to-read profile built just for you.",
	},
	{
		number: "02",
		title: "Connect Your Devices",
		desc: "Link your Apple Watch, Fitbit, Oura Ring, or any health app. Genetiq pulls it all together so you never miss a thing.",
	},
	{
		number: "03",
		title: "Share With Your Doctor Easily",
		desc: "Going to a clinic? Generate a one-time code so your doctor can see your records safely — and it expires the moment you close it.",
	},
];

const SUI_EDGE = [
	{
		title: "Works Across All Your Devices",
		desc: "Open Genetiq on your phone, tablet, or computer — your health data is always up to date, no matter which device you use.",
		icon: <Database size={24} />,
	},
	{
		title: "Meets the Highest Safety Standards",
		desc: "Genetiq follows the same privacy rules used by hospitals and health systems around the world, so your data is always handled with care.",
		icon: <Lock size={24} />,
	},
];

const STATS = [
	{ value: 1200000, display: "1.2M", label: "Health Records Stored" },
	{ value: 50, display: "50+", label: "Devices & Apps Supported" },
	{ value: 0, display: "ZERO", label: "Data Leaks. Ever." },
	{ value: 24, display: "24/7", label: "AI Always On" },
];

const MEDICAL_SOVEREIGNTY = [
	{
		title: "Your Complete Health Story",
		desc: "Every test result, symptom, and health reading is saved over time — so you and your doctor can see the full picture, not just a snapshot.",
		icon: <Activity size={24} />,
	},
	{
		title: "You Choose Who Sees What",
		desc: "Give a specific doctor access to your records for a set time, then take it back. You're always in control of who sees your health information.",
		icon: <Lock size={24} />,
	},
];

const HERO_WORDS = ["Private", "Safe", "Always There", "Yours"];

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
					<h2 className={styles.modalTitle}>Create Your Free Health Profile</h2>
				</div>
				<div className={styles.modalBody}>
					<p>Set up your personal health profile in minutes. Store your records, connect your devices, and let AI help you understand your health.</p>
					<p className={styles.securityNote}>🔒 Your data is private and belongs only to you.</p>
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
						<img src='/assets/digital_twin_preview.png' alt='Genetiq Logo' className={styles.logoImage} />
						<span className={styles.logoText}>Genetiq</span>
					</div>
					<div className={styles.navLinks}>
						<a href='#pillars' className={styles.navLink}>Technology</a>
						<a href='#ecosystem' className={styles.navLink}>Ecosystem</a>
						<a href='#stats' className={styles.navLink}>Impact</a>
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
						Your Personal Health Assistant, Powered by AI
					</div>
					<h1 className={styles.heroTitle}>
						All Your Health Records, <br />
						<Typewriter words={HERO_WORDS} />
					</h1>
					<p className={styles.heroSub}>
						Genetiq keeps all your health records in one safe place. See your blood tests, track your progress over time, and get simple AI advice — no medical degree needed.
					</p>
					<div className={styles.heroCtas}>
						<button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
							Get Started for Free <ArrowRight size={20} />
						</button>
					</div>

					{/* Data pulse lines */}
					<div className={styles.dataPulseRow}>
						{["Blood Tests", "Heart Rate", "Sleep", "Nutrition", "Genes"].map((tag, i) => (
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
						<Activity size={14} /> Live Health Tracking
					</div>
					<div className={`${styles.orbitBadge} ${styles.orbitBadge2}`}>
						<Brain size={14} /> Plain-English AI Advice
					</div>
					<div className={`${styles.orbitBadge} ${styles.orbitBadge3}`}>
						<ShieldCheck size={14} /> Private & Locked
					</div>
				</div>
			</section>

			{/* ── Three Pillars ─────────────────────────────────── */}
			<section id='pillars' className={styles.section}>
				<div ref={pillarsReveal.ref} className={`${styles.sectionHeader} ${pillarsReveal.visible ? styles.revealIn : styles.revealHidden}`}>
					<span className={styles.badge}>What Genetiq Does</span>
					<h2 className={styles.sectionTitle}>Everything You Need, Simply Done</h2>
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
					<span className={styles.badge}>You're in Charge</span>
					<h2 className={styles.sectionTitle}>Your Health Records, Your Rules</h2>
					<p className={styles.historySub}>
						Genetiq doesn't just keep your records — it puts you in complete control.
						Decide who sees your information and for how long. No surprises, no fine print.
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
						<div className={styles.badge} style={{ alignSelf: "flex-start" }}>How It Works</div>
						<h2 className={styles.sectionTitle} style={{ textAlign: "left" }}>Simple from Day One</h2>
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
					<span className={styles.badge}>Your Privacy Matters</span>
					<h2 className={styles.sectionTitle}>We Take Your Safety Seriously</h2>
					<p className={styles.sectionSub}>
						Your health records are some of the most personal things about you. We protect them the same way banks protect your money.
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

			{/* ── Final CTA ─────────────────────────────────────── */}
			<section className={styles.finalCta}>
				<div ref={ctaReveal.ref} className={`${styles.finalCtaContent} ${ctaReveal.visible ? styles.revealIn : styles.revealHidden}`}>
					<div className={styles.ctaGlowPulse} />
					<h2 className={styles.finalTitle}>Ready to take charge of your health?</h2>
					<button className={styles.btnLarge} onClick={() => setIsModalOpen(true)}>
						Create Your Free Profile <ArrowRight size={24} />
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
								One app for all your health records. Private, simple, and always with you.
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
						© 2026 Genetiq. Built to help you live healthier, longer, and with full peace of mind.
					</div>
				</div>
			</footer>
		</div>
	);
}
