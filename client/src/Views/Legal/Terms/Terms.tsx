import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { paths } from "@/App/Routes/Paths";
import {
	ArrowLeft,
	Calendar,
	Clock,
	ShieldCheck,
	Info,
} from "lucide-react";
import styles from "../Legal.module.scss";

const TOC = [
	{ id: "acceptance", label: "Acceptance of Terms" },
	{ id: "service", label: "Description of Service" },
	{ id: "eligibility", label: "Eligibility" },
	{ id: "account", label: "Your Account" },
	{ id: "health-data", label: "Health Data & AI" },
	{ id: "prohibited", label: "Prohibited Uses" },
	{ id: "ip", label: "Intellectual Property" },
	{ id: "disclaimers", label: "Disclaimers" },
	{ id: "limitation", label: "Limitation of Liability" },
	{ id: "termination", label: "Termination" },
	{ id: "changes", label: "Changes to Terms" },
	{ id: "contact", label: "Contact Us" },
];

const Terms = () => {
	const navigate = useNavigate();

	const goBack = () => {
		if (window.history.length > 1) {
			navigate(-1);
		} else {
			navigate(paths.landing);
		}
	};

	return (
		<div className={styles.page}>
			{/* Nav */}
			<nav className={styles.nav}>
				<a className={styles.navBrand} onClick={() => navigate(paths.landing)}>
					<img src="/assets/genetiq_logo_v2.png" alt="Genetiq" className={styles.navLogo} />
					<span className={styles.navName}>Genetiq</span>
				</a>
				<button className={styles.navBack} onClick={goBack}>
					<ArrowLeft size={16} /> Back
				</button>
			</nav>

			{/* Hero */}
			<motion.div
				className={styles.hero}
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<div className={styles.heroBadge}>
					<ShieldCheck size={12} /> Legal Document
				</div>
				<h1 className={styles.heroTitle}>Terms of Service</h1>
				<div className={styles.heroMeta}>
					<span className={styles.metaItem}><Calendar size={14} /> Effective: 1 June 2026</span>
					<span className={styles.metaItem}><Clock size={14} /> Last updated: 28 May 2026</span>
				</div>
			</motion.div>

			{/* Layout */}
			<div className={styles.layout}>
				{/* Sidebar TOC */}
				<aside className={styles.sidebar}>
					<p className={styles.tocTitle}>On this page</p>
					<ul className={styles.tocList}>
						{TOC.map((item) => (
							<li key={item.id} className={styles.tocItem}>
								<a href={`#${item.id}`}>{item.label}</a>
							</li>
						))}
					</ul>
				</aside>

				{/* Content */}
				<main className={styles.content}>
					{/* Intro callout */}
					<div className={styles.callout}>
						<Info size={18} />
						<p>
							<strong>Please read these terms carefully.</strong> By accessing or using Genetiq, you agree to be bound by these Terms of Service. If you do not agree, you may not use the platform.
						</p>
					</div>

					<br />

					<section id="acceptance" className={styles.section}>
						<h2 className={styles.sectionTitle}>Acceptance of Terms</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								By creating an account or using any part of Genetiq (the "Service"), you confirm that you have read, understood, and agree to these Terms of Service and our <a href={paths.privacy}>Privacy Policy</a>. These terms form a legally binding contract between you and Genetiq Ltd.
							</p>
							<p className={styles.para}>
								If you are using the Service on behalf of an organisation, you represent that you have authority to bind that organisation to these terms.
							</p>
						</div>
					</section>

					<section id="service" className={styles.section}>
						<h2 className={styles.sectionTitle}>Description of Service</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								Genetiq is an AI-powered health data platform that helps users understand their laboratory test results. Our core features include:
							</p>
							<ul className={styles.list}>
								<li>Uploading and digitising paper or digital lab result documents</li>
								<li>AI-powered plain-English explanations of test values and biomarkers</li>
								<li>Personalised dietary and lifestyle recommendations based on your results</li>
								<li>A health history dashboard to track changes in your biomarkers over time</li>
								<li>Secure, encrypted storage of your health records</li>
							</ul>
							<div className={styles.callout}>
								<Info size={18} />
								<p>
									<strong>Medical disclaimer:</strong> Genetiq is an informational tool only. It is <strong>not a substitute</strong> for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with questions about your health.
								</p>
							</div>
						</div>
					</section>

					<section id="eligibility" className={styles.section}>
						<h2 className={styles.sectionTitle}>Eligibility</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								You must be at least <strong>18 years old</strong> to use Genetiq. By using the Service, you represent and warrant that you meet this age requirement and that all information you provide is accurate and complete.
							</p>
							<p className={styles.para}>
								The Service is available to users globally, however certain features or regulatory requirements may vary by country. It is your responsibility to ensure your use of the Service complies with local laws.
							</p>
						</div>
					</section>

					<section id="account" className={styles.section}>
						<h2 className={styles.sectionTitle}>Your Account</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>You are responsible for:</p>
							<ul className={styles.list}>
								<li>Maintaining the confidentiality of your login credentials</li>
								<li>All activity that occurs under your account</li>
								<li>Notifying us immediately of any unauthorised access at <a href="mailto:security@genetiq.app">security@genetiq.app</a></li>
								<li>Keeping your account information accurate and up to date</li>
							</ul>
							<p className={styles.para}>
								We reserve the right to terminate or suspend your account if we believe these terms have been violated or if your account is used fraudulently.
							</p>
						</div>
					</section>

					<section id="health-data" className={styles.section}>
						<h2 className={styles.sectionTitle}>Health Data & AI</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								When you upload lab results or other health documents, you grant Genetiq a limited licence to process that data solely for the purpose of providing the Service to you. Specifically:
							</p>
							<ul className={styles.list}>
								<li>Your data is used to generate AI explanations and recommendations</li>
								<li>Your data is <strong>never sold</strong> to third parties</li>
								<li>Anonymised, aggregated data may be used to improve the AI model</li>
								<li>You can delete your data at any time from your account settings</li>
							</ul>
							<p className={styles.para}>
								AI-generated explanations are produced by machine learning models and may contain errors. They are provided for <strong>informational purposes only</strong> and should be verified with a qualified healthcare professional.
							</p>
						</div>
					</section>

					<section id="prohibited" className={styles.section}>
						<h2 className={styles.sectionTitle}>Prohibited Uses</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>You agree not to:</p>
							<ul className={styles.list}>
								<li>Use the Service for any unlawful purpose or in violation of these terms</li>
								<li>Upload false, misleading, or fabricated health documents</li>
								<li>Attempt to reverse-engineer, hack, or disrupt the platform</li>
								<li>Scrape or harvest any data from the Service</li>
								<li>Impersonate any person or entity</li>
								<li>Upload content that infringes any third-party intellectual property rights</li>
								<li>Use the Service to provide medical advice to other people as if it were your own professional opinion</li>
							</ul>
						</div>
					</section>

					<section id="ip" className={styles.section}>
						<h2 className={styles.sectionTitle}>Intellectual Property</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								All content, software, trademarks, and technology comprising the Genetiq platform are owned by or licensed to Genetiq Ltd and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
							</p>
							<p className={styles.para}>
								You retain full ownership of the health data you upload. By using the Service, you grant us only the limited rights necessary to deliver the Service as described above.
							</p>
						</div>
					</section>

					<section id="disclaimers" className={styles.section}>
						<h2 className={styles.sectionTitle}>Disclaimers</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								The Service is provided <strong>"as is"</strong> and <strong>"as available"</strong> without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or completely accurate.
							</p>
							<p className={styles.para}>
								Genetiq does not provide medical diagnoses. Any health insights generated by our AI are educational in nature and must not be treated as a clinical recommendation.
							</p>
						</div>
					</section>

					<section id="limitation" className={styles.section}>
						<h2 className={styles.sectionTitle}>Limitation of Liability</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								To the fullest extent permitted by applicable law, Genetiq Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, or health outcomes — arising from your use of or inability to use the Service.
							</p>
							<p className={styles.para}>
								Our total cumulative liability for any claims under these terms shall not exceed the amount you paid us in the 12 months preceding the claim, or USD $100, whichever is greater.
							</p>
						</div>
					</section>

					<section id="termination" className={styles.section}>
						<h2 className={styles.sectionTitle}>Termination</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								You may stop using the Service and delete your account at any time. We may suspend or terminate your access at any time if we believe you have violated these terms, without prior notice.
							</p>
							<p className={styles.para}>
								Upon termination, your right to use the Service ceases immediately. You may request a copy of your health data before account deletion by contacting <a href="mailto:support@genetiq.app">support@genetiq.app</a>.
							</p>
						</div>
					</section>

					<section id="changes" className={styles.section}>
						<h2 className={styles.sectionTitle}>Changes to Terms</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								We may update these Terms of Service from time to time. When we make material changes, we will notify you by email and display a notice within the app at least <strong>14 days</strong> before the changes take effect.
							</p>
							<p className={styles.para}>
								Your continued use of the Service after the effective date constitutes your acceptance of the revised terms.
							</p>
						</div>
					</section>

					<section id="contact" className={styles.section}>
						<h2 className={styles.sectionTitle}>Contact Us</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								If you have questions about these Terms, please reach out:
							</p>
							<ul className={styles.list}>
								<li>Email: <a href="mailto:legal@genetiq.app">legal@genetiq.app</a></li>
								<li>Support: <a href="mailto:support@genetiq.app">support@genetiq.app</a></li>
								<li>Security concerns: <a href="mailto:security@genetiq.app">security@genetiq.app</a></li>
							</ul>
						</div>
					</section>
				</main>
			</div>

			{/* Footer */}
			<footer className={styles.footer}>
				<div className={styles.footerLinks}>
					<a onClick={() => navigate(paths.landing)}>Home</a>
					<a onClick={() => navigate(paths.privacy)}>Privacy Policy</a>
					<a href="mailto:legal@genetiq.app">Contact Legal</a>
					<a onClick={() => navigate(paths.auth.login)}>Sign In</a>
				</div>
				<p className={styles.footerCopy}>© 2026 Genetiq Ltd. All rights reserved.</p>
			</footer>
		</div>
	);
};

export default Terms;
