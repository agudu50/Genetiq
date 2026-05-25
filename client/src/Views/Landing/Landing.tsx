import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	ShieldCheck,
	Activity,
	Brain,
	ArrowRight,
	Database,
	Lock,
	X,
	Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { paths } from "@/App/Routes/Paths";
import styles from "./Landing.module.scss";

// ─── Types ─────────────────────────────────────────────────────────────

// Removed WalletBase interface - no longer needed after Sui removal

// ─── Static data ─────────────────────────────────────────────────────────────

const PILLARS = [
	{
		title: "Medical Sovereignty",
		desc: "Every blood test, biomarker, and clinical visit is stored securely. You own your complete health history with full control and transparency.",
		icon: <Activity size={32} />,
	},
	{
		title: "AI Triage & Insights",
		desc: "Our clinical-grade AI analyzes your symptoms and biomarkers to provide actionable longevity plans and health recommendations.",
		icon: <Brain size={32} />,
	},
	{
		title: "Enterprise Security",
		desc: "Your data is encrypted end-to-end with enterprise-grade security. Only you control who accesses your health information.",
		icon: <ShieldCheck size={32} />,
	},
];

const ECOSYSTEM = [
	{
		number: "01",
		title: "The Blueprint",
		desc: "Comprehensive genetic and biomarker breakdown, mapped to your individual biological profile.",
	},
	{
		number: "02",
		title: "The Connection",
		desc: "Seamlessly sync with Apple Health, Oura, and medical CGMs for a unified health stream.",
	},
	{
		number: "03",
		title: "The Doctor Handover",
		desc: "Generate a secure, temporary QR code for instant clinical consultations without data leaks.",
	},
];

const SUI_EDGE = [
	{
		title: "Multi-Device Sync",
		desc: "Seamlessly sync data across your phone, smartwatch, and other health devices. Your health data stays synchronized in real-time.",
		icon: <Database size={24} />,
	},
	{
		title: "HIPAA Compliant",
		desc: "Meet the highest healthcare compliance standards. Your data is protected with HIPAA and GDPR standards for absolute privacy.",
		icon: <Lock size={24} />,
	},
];

const STATS = [
	{ value: "1.2M", label: "Health Objects Secured" },
	{ value: "50+", label: "Wearable Integrations" },
	{ value: "ZERO", label: "Data Breaches" },
	{ value: "24/7", label: "AI Clinical Triage" },
];

const MEDICAL_SOVEREIGNTY = [
	{
		title: "Your Biological Timeline",
		desc: "Every biomarker, genetic trait, and health metric is securely stored and tracked over time for complete health insights.",
		icon: <Activity size={24} />,
	},
	{
		title: "Granular Doctor Access",
		desc: "Grant temporary, read-only access to specific doctors. Revoke it any time. Your data never leaves your control.",
		icon: <Lock size={24} />,
	},
];

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
					<h2 className={styles.modalTitle}>Initialize Your Digital Twin</h2>
				</div>

				<div className={styles.modalBody}>
					<p>
						Create your secure health vault and start tracking your biological timeline today.
					</p>

					<p className={styles.securityNote}>
						Your health data is encrypted and belongs entirely to you.
					</p>
				</div>

				<div className={styles.modalActions}>
					<button className={styles.btnModalOutline} onClick={onClose}>
						Cancel
					</button>
					<button className={styles.btnModalPrimary} onClick={onConfirm}>
						Get Started <ArrowRight size={18} />
					</button>
				</div>
			</div>
		</div>
	);
};

export default function Landing() {
	const navigate = useNavigate();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

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
			{/* ── Navbar ─────────────────────────────────────────────── */}
			<nav className={`${styles.nav} ${isScrolled ? styles.scrolled : ""}`}>
				<div className={styles.navInner}>
					<div className={styles.logo} onClick={() => navigate(paths.landing)}>
						<img
							src='/assets/digital_twin_preview.png'
							alt='Genetiq Logo'
							className={styles.logoImage}
						/>
						<span className={styles.logoText}>Genetiq</span>
					</div>
					<div className={styles.navLinks}>
						<a href='#pillars' className={styles.navLink}>
							Technology
						</a>
						<a href='#ecosystem' className={styles.navLink}>
							Ecosystem
						</a>
						<a href='#stats' className={styles.navLink}>
							Impact
						</a>
						<button
							className={styles.btnNavOutline}
							onClick={() => navigate(paths.auth.login)}
						>
							Log In
						</button>
						<button
							className={styles.btnNavPrimary}
							onClick={() => setIsModalOpen(true)}
						>
							Initialize Twin
						</button>
					</div>
				</div>
			</nav>

			{/* ── Hero ───────────────────────────────────────────────── */}
			<section className={styles.hero}>
				<div className={styles.heroContent}>
					<div>
						<h1 className={styles.heroTitle}>
							Your Health History, <br />
							<span className={styles.titleAccent}>Sovereign & Secure.</span>
						</h1>
						<p className={styles.heroSub}>
							Meet Genetiq: Your personal AI-powered Digital Twin for precision health diagnostics.
							Secure your biological timeline and access comprehensive health insights whenever you need them.
						</p>
					</div>

					<div className={styles.heroCtas}>
						<button
							className={styles.btnPrimary}
							onClick={() => setIsModalOpen(true)}
						>
							Initialize Your Twin <ArrowRight size={20} />
						</button>
					</div>
				</div>

				<div className={styles.heroVisual}>
					<img
						src='/assets/digital_twin_preview.png'
						alt='Digital Twin 3D Preview'
						className={styles.heroImage}
					/>
				</div>
			</section>

			{/* ── Three Pillars ──────────────────────────────────────── */}
			<section id='pillars' className={styles.section}>
				<div className={styles.sectionHeader}>
					<span className={styles.badge}>The Three Pillars</span>
					<h2 className={styles.sectionTitle}>Precision at Scale</h2>
				</div>

				<div className={styles.pillarGrid}>
					{PILLARS.map((pillar) => (
						<div key={pillar.title} className={styles.pillarCard}>
							<div className={styles.pillarIconWrapper}>{pillar.icon}</div>
							<h3 className={styles.pillarTitle}>{pillar.title}</h3>
							<p className={styles.pillarDesc}>{pillar.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* ── Medical Sovereignty (History & Doctor Access) ────────── */}
			<section className={styles.historySection}>
				<div className={styles.sectionHeader}>
					<span className={styles.badge}>Medical Sovereignty</span>
					<h2 className={styles.sectionTitle}>Own Your Medical Legacy</h2>
					<p className={styles.historySub}>
						Genetiq doesn't just store data; it secures your biological history.
						Grant access to providers on your terms, with zero compromise on
						privacy.
					</p>
				</div>

				<div className={styles.historyGrid}>
					<div className={styles.historyContent}>
						{MEDICAL_SOVEREIGNTY.map((item) => (
							<div key={item.title} className={styles.historyDetailCard}>
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

			{/* ── Ecosystem ──────────────────────────────────────────── */}
			<section id='ecosystem' className={styles.section}>
				<div className={styles.ecosystemGrid}>
					<div className={styles.ecoVisual}>
						<img
							src='/assets/digital_twin_preview.png'
							alt='Ecosystem'
							className={styles.mockScreen}
						/>
					</div>

					<div className={styles.ecoList}>
						<div className={styles.badge} style={{ alignSelf: "flex-start" }}>
							The Ecosystem
						</div>
						<h2 className={styles.sectionTitle} style={{ textAlign: "left" }}>
							Integrated Longevity
						</h2>
						{ECOSYSTEM.map((feat) => (
							<div key={feat.title} className={styles.ecoItem}>
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

			{/* ── Security & Privacy ───────────────────────────────────────────── */}
			<section className={`${styles.section} ${styles.suiEdgeSection}`}>
				<div className={styles.sectionHeader}>
					<span className={styles.badge}>Security & Privacy</span>
					<h2 className={styles.sectionTitle}>Enterprise-Grade Protection</h2>
					<p className={styles.sectionSub}>
						Your health data deserves the highest level of security. We use industry-leading encryption and compliance standards.
					</p>
				</div>

				<div className={styles.techGrid}>
					{SUI_EDGE.map((tech) => (
						<div key={tech.title} className={styles.techCard}>
							<h3>
								{tech.icon} {tech.title}
							</h3>
							<p>{tech.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* ── Stats ──────────────────────────────────────────────── */}
			<section id='stats' className={styles.statsSection}>
				<div className={styles.statsGrid}>
					{STATS.map((stat) => (
						<div key={stat.label} className={styles.statItem}>
							<span className={`${styles.statValue} text-gradient-primary`}>
								{stat.value}
							</span>
							<span className={styles.statLabel}>{stat.label}</span>
						</div>
					))}
				</div>
			</section>

			{/* ── Final CTA ─────────────────────────────────────────── */}
			<section className={styles.finalCta}>
				<div className={styles.finalCtaContent}>
					<h2 className={styles.finalTitle}>
						Ready to meet your Digital Twin?
					</h2>
					<button
						className={styles.btnLarge}
						onClick={() => setIsModalOpen(true)}
					>
						Initialise Medical Vault <ArrowRight size={24} />
					</button>
				</div>
			</section>

			<InitializeModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onConfirm={handleProceed}
			/>

			{/* ── Footer ─────────────────────────────────────────────── */}
			<footer className={styles.footer}>
				<div className={styles.footerInner}>
					<div className={styles.footerTop}>
						<div>
							<span className={styles.footerLogo}>Genetiq</span>
							<p className={styles.footerDesc}>
								The world's first AI-powered Digital Health Twin secured by the
								Sui Blockchain.
							</p>
						</div>
						<div className={styles.footerLinksGrid}>
							<div className={styles.footerLinkCol}>
								<h4>Protocol</h4>
								<ul className={styles.footerLinkList}>
									<li>
										<a href='#'>Walrus Storage</a>
									</li>
									<li>
										<a href='#'>Sui zkLogin</a>
									</li>
								</ul>
							</div>
							<div className={styles.footerLinkCol}>
								<h4>Resources</h4>
								<ul className={styles.footerLinkList}>
									<li>
										<a href='#faq'>Documentation</a>
									</li>
									<li>
										<a href='#'>Whitepaper</a>
									</li>
								</ul>
							</div>
							<div className={styles.footerLinkCol}>
								<h4>Legal</h4>
								<ul className={styles.footerLinkList}>
									<li>
										<a href='#'>Privacy Policy</a>
									</li>
									<li>
										<a href='#'>Terms of Service</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div className={styles.footerBottom}>
						© 2026 Genetiq. Built for biological sovereignty and longevity.
					</div>
				</div>
			</footer>
		</div>
	);
}
