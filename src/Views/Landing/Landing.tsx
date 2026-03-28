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
import {
	useCurrentAccount,
	useWalletConnection,
	useDAppKit,
	useWallets,
} from "@mysten/dapp-kit-react";
import { toast } from "react-toastify";
import { paths } from "@/App/Routes/Paths";
import styles from "./Landing.module.scss";

// ─── Types ─────────────────────────────────────────────────────────────

interface WalletBase {
	name: string;
	icon: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const PILLARS = [
	{
		title: "Medical Sovereignty",
		desc: "Every blood test, biomarker, and clinical visit is stored as a permanent, encrypted object on Sui. You own the history.",
		icon: <Activity size={32} />,
	},
	{
		title: "AI Triage & Insights",
		desc: "Our clinical-grade AI analyzes your symptoms and biomarkers to provide actionable longevity plans.",
		icon: <Brain size={32} />,
	},
	{
		title: "Blockchain Privacy",
		desc: "Your data belongs to you. Period. Secured by Sui's object-centric encryption and accessible only by you.",
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
		title: "zkLogin",
		desc: "No seed phrases. No complexity. Log in with Google and let the blockchain handle the security.",
		icon: <ShieldCheck size={24} />,
	},
	{
		title: "Walrus Protocol",
		desc: "Large-scale genetic data stored decentrally, not on a vulnerable corporate server.",
		icon: <Database size={24} />,
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
		desc: "Every biomarker, every genetic trait, and every AI insight is stored as a permanent, encrypted object on Sui.",
		icon: <Activity size={24} />,
	},
	{
		title: "Granular Doctor Access",
		desc: "Grant temporary, read-only access to specific doctors. Revoke it any time. Your data never leaves your control.",
		icon: <Lock size={24} />,
	},
];

const SecurityModal = ({
	isOpen,
	onClose,
	onConfirm,
	isConnecting,
	wallets,
}: {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (wallet?: WalletBase) => void;
	isConnecting: boolean;
	wallets: readonly WalletBase[];
}) => {
	const [selectedWallet, setSelectedWallet] = useState<WalletBase | null>(null);

	if (!isOpen) return null;

	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modalContent}>
				<button
					className={styles.modalClose}
					onClick={onClose}
					disabled={isConnecting}
				>
					<X size={20} />
				</button>

				<div className={styles.modalHeader}>
					<div className={styles.securityIcon}>
						{isConnecting ? (
							<Loader2 size={32} className={styles.spinner} />
						) : (
							<Lock size={32} />
						)}
					</div>
					<h2 className={styles.modalTitle}>
						{isConnecting
							? "Waiting for Approval..."
							: "Secure Connection Required"}
					</h2>
				</div>

				<div className={styles.modalBody}>
					<p>
						{isConnecting
							? "Please approve the connection request in your Sui wallet extension to continue initializing your Digital Twin."
							: "To secure your Digital Twin on the Sui Blockchain, please select your preferred wallet to initialize your on-chain identity."}
					</p>

					{!isConnecting && wallets.length > 0 && (
						<div className={styles.walletPicker}>
							<span className={styles.pickerLabel}>Detected Wallets:</span>
							<div className={styles.walletList}>
								{wallets.map((w: WalletBase) => (
									<button
										key={w.name}
										className={`${styles.walletOption} ${selectedWallet?.name === w.name ? styles.selected : ""}`}
										onClick={() => setSelectedWallet(w)}
									>
										<div className={styles.walletInfo}>
											<img
												src={w.icon}
												alt={w.name}
												className={styles.walletIcon}
											/>
											<span>{w.name}</span>
										</div>
										{selectedWallet?.name === w.name && (
											<ShieldCheck size={16} />
										)}
									</button>
								))}
							</div>
						</div>
					)}

					{!isConnecting && wallets.length === 0 && (
						<div className={styles.warningBox}>
							<X size={18} />
							<span>
								No Sui wallet detected. Please install a Sui wallet extension.
							</span>
						</div>
					)}

					<p className={styles.securityNote}>
						{isConnecting
							? "Check your wallet extension for a popup."
							: "By connecting, you agree to secure your biological telemetry on-chain."}
					</p>
				</div>

				<div className={styles.modalActions}>
					<button
						className={styles.btnModalOutline}
						onClick={onClose}
						disabled={isConnecting}
					>
						Cancel
					</button>
					<button
						className={styles.btnModalPrimary}
						onClick={() => onConfirm(selectedWallet || wallets[0])}
						disabled={isConnecting || wallets.length === 0}
					>
						{isConnecting ? (
							<>
								Connecting... <Loader2 size={18} className={styles.spinner} />
							</>
						) : (
							<>
								Connect & Initialize <ArrowRight size={18} />
							</>
						)}
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
	const [isConnectingLocal, setIsConnectingLocal] = useState(false);

	const dAppKit = useDAppKit();
	const connection = useWalletConnection();
	const account = useCurrentAccount();
	const wallets = useWallets();

	type WalletType = (typeof wallets)[number];

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

	useEffect(() => {
		if (account && isConnectingLocal) {
			setIsConnectingLocal(false);
			setIsModalOpen(false);
			toast.success("Wallet connected successfully!");
			navigate(paths.auth.register);
		}
	}, [account, isConnectingLocal, navigate]);

	const handleProceed = async (targetWallet?: WalletBase) => {
		if (account) {
			navigate(paths.auth.register);
			return;
		}

		if (!targetWallet && wallets.length === 0) {
			toast.error(
				"No Sui wallet detected. Please install a Sui wallet extension.",
			);
			return;
		}

		const walletToConnect = (targetWallet || wallets[0]) as WalletType;
		setIsConnectingLocal(true);

		try {
			await dAppKit.connectWallet({ wallet: walletToConnect });
		} catch (err: unknown) {
			setIsConnectingLocal(false);
			const message = err instanceof Error ? err.message : "Connection failed";
			toast.error(message);
		}
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
							Meet Genetiq: The world's first AI-powered Medical Vault secured
							by the Sui Blockchain. Secure your biological timeline and grant
							instant doctor access via QR.
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

			{/* ── Sui Edge ───────────────────────────────────────────── */}
			<section className={`${styles.section} ${styles.suiEdgeSection}`}>
				<div className={styles.sectionHeader}>
					<span className={styles.badge}>Technical Trust</span>
					<h2 className={styles.sectionTitle}>The Sui Edge</h2>
					<p className={styles.sectionSub}>
						Architected for absolute data sovereignty on the Walrus Protocol.
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

			<SecurityModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onConfirm={handleProceed}
				isConnecting={connection.isConnecting}
				wallets={wallets}
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
