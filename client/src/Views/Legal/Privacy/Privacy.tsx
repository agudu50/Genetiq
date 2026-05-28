import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { paths } from "@/App/Routes/Paths";
import {
	ArrowLeft,
	Calendar,
	Clock,
	Lock,
	Info,
} from "lucide-react";
import styles from "../Legal.module.scss";

const TOC = [
	{ id: "overview", label: "Overview" },
	{ id: "data-collect", label: "Data We Collect" },
	{ id: "how-we-use", label: "How We Use Your Data" },
	{ id: "ai-processing", label: "AI Processing" },
	{ id: "data-sharing", label: "Data Sharing" },
	{ id: "data-security", label: "Data Security" },
	{ id: "retention", label: "Data Retention" },
	{ id: "your-rights", label: "Your Rights" },
	{ id: "cookies", label: "Cookies" },
	{ id: "children", label: "Children's Privacy" },
	{ id: "changes", label: "Changes to Policy" },
	{ id: "contact", label: "Contact Us" },
];

const Privacy = () => {
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
					<Lock size={12} /> Legal Document
				</div>
				<h1 className={styles.heroTitle}>Privacy Policy</h1>
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
							<strong>Your privacy is our priority.</strong> Genetiq handles your health data with the same care you would expect from a trusted healthcare provider. We are committed to full transparency about what we collect, why we collect it, and how we protect it.
						</p>
					</div>

					<br />

					<section id="overview" className={styles.section}>
						<h2 className={styles.sectionTitle}>Overview</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								This Privacy Policy explains how Genetiq Ltd ("Genetiq", "we", "our", or "us") collects, uses, stores, and protects your personal information when you use our platform. It applies to all users of <a href="https://genetiq.app">genetiq.app</a> and our associated mobile applications.
							</p>
							<p className={styles.para}>
								By using Genetiq, you consent to the practices described in this policy. If you have concerns about how your data is handled, please contact us at <a href="mailto:privacy@genetiq.app">privacy@genetiq.app</a> before using the Service.
							</p>
						</div>
					</section>

					<section id="data-collect" className={styles.section}>
						<h2 className={styles.sectionTitle}>Data We Collect</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>We collect the following categories of information:</p>

							<p className={styles.para}><strong>Account Information</strong></p>
							<ul className={styles.list}>
								<li>Full name and email address provided at registration</li>
								<li>Authentication credentials (securely hashed — never stored in plaintext)</li>
								<li>Profile preferences and app settings</li>
							</ul>

							<p className={styles.para}><strong>Health Data</strong></p>
							<ul className={styles.list}>
								<li>Lab result documents you upload (PDFs, images, or photos)</li>
								<li>Extracted biomarker values (e.g. cholesterol, glucose, haemoglobin)</li>
								<li>AI-generated explanations and recommendations associated with your results</li>
								<li>Health history and trend data over time</li>
							</ul>

							<p className={styles.para}><strong>Technical Data</strong></p>
							<ul className={styles.list}>
								<li>Device type, browser, and operating system</li>
								<li>IP address and approximate location (country/region)</li>
								<li>Session logs, page views, and feature usage (anonymised)</li>
								<li>Error reports and crash logs for platform improvement</li>
							</ul>
						</div>
					</section>

					<section id="how-we-use" className={styles.section}>
						<h2 className={styles.sectionTitle}>How We Use Your Data</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>We use your data to:</p>
							<ul className={styles.list}>
								<li>Provide, operate, and maintain the Genetiq platform</li>
								<li>Process your uploaded lab results and generate AI explanations</li>
								<li>Build and display your personalised health history dashboard</li>
								<li>Send you important account notifications (e.g. security alerts)</li>
								<li>Improve AI accuracy using anonymised and aggregated data</li>
								<li>Detect and prevent fraud, abuse, and security incidents</li>
								<li>Comply with applicable legal obligations</li>
							</ul>
							<p className={styles.para}>
								We will <strong>never</strong> use your personal health data for advertising, sell it to insurance companies, employers, or any third-party data brokers.
							</p>
						</div>
					</section>

					<section id="ai-processing" className={styles.section}>
						<h2 className={styles.sectionTitle}>AI Processing</h2>
						<div className={styles.sectionBody}>
							<div className={styles.callout}>
								<Info size={18} />
								<p>
									<strong>How our AI works with your data:</strong> When you upload a lab result, the document is processed by our AI to extract biomarker values and generate explanations. This processing happens on secure, encrypted servers.
								</p>
							</div>
							<br />
							<ul className={styles.list}>
								<li>Your raw documents are processed in isolated, encrypted environments</li>
								<li>Extracted data is linked only to your account — never shared externally</li>
								<li>For model improvement, we may use <strong>de-identified, aggregated</strong> data (no names, emails, or identifiable information)</li>
								<li>You can opt out of contributing to model training at any time in Settings → Privacy</li>
							</ul>
						</div>
					</section>

					<section id="data-sharing" className={styles.section}>
						<h2 className={styles.sectionTitle}>Data Sharing</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								We do not sell your personal data. We only share data in the following limited circumstances:
							</p>
							<ul className={styles.list}>
								<li><strong>Service providers:</strong> Trusted vendors who help operate our platform (e.g. cloud hosting, email delivery) under strict data processing agreements</li>
								<li><strong>Legal requirements:</strong> When required by law, court order, or to protect the safety of users</li>
								<li><strong>Business transfers:</strong> In the event of a merger or acquisition, with advance notice to you</li>
								<li><strong>With your consent:</strong> Any other sharing only with your explicit, informed consent</li>
							</ul>
							<p className={styles.para}>
								All third-party service providers are bound by confidentiality agreements and may only process your data as directed by us.
							</p>
						</div>
					</section>

					<section id="data-security" className={styles.section}>
						<h2 className={styles.sectionTitle}>Data Security</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								We implement industry-leading security measures to protect your health data:
							</p>
							<ul className={styles.list}>
								<li>All data is encrypted at rest using AES-256 encryption</li>
								<li>All data in transit is encrypted using TLS 1.3</li>
								<li>Access to your health data is strictly limited to authorised systems</li>
								<li>We conduct regular third-party security audits and penetration tests</li>
								<li>Our infrastructure is SOC 2 compliant and HIPAA-aligned</li>
							</ul>
							<p className={styles.para}>
								Despite these measures, no system is completely invulnerable. If we become aware of a data breach that affects your personal information, we will notify you within <strong>72 hours</strong> as required by applicable law.
							</p>
						</div>
					</section>

					<section id="retention" className={styles.section}>
						<h2 className={styles.sectionTitle}>Data Retention</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								We retain your personal data for as long as your account is active or as necessary to provide the Service. Specifically:
							</p>
							<ul className={styles.list}>
								<li>Account data is retained until you delete your account</li>
								<li>Health records and lab results are retained until you delete them or close your account</li>
								<li>Anonymised usage logs may be retained for up to 24 months for analytics</li>
								<li>Legal compliance records may be retained for up to 7 years</li>
							</ul>
							<p className={styles.para}>
								You can delete individual records or your entire account at any time. Account deletion triggers full removal of your identifiable data within <strong>30 days</strong>.
							</p>
						</div>
					</section>

					<section id="your-rights" className={styles.section}>
						<h2 className={styles.sectionTitle}>Your Rights</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								Depending on your location, you may have the following rights regarding your personal data:
							</p>
							<ul className={styles.list}>
								<li><strong>Right of access:</strong> Request a copy of all personal data we hold about you</li>
								<li><strong>Right to rectification:</strong> Correct inaccurate or incomplete information</li>
								<li><strong>Right to erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
								<li><strong>Right to portability:</strong> Receive your data in a structured, machine-readable format</li>
								<li><strong>Right to restrict processing:</strong> Limit how we use your data</li>
								<li><strong>Right to object:</strong> Object to processing based on legitimate interests</li>
								<li><strong>Right to withdraw consent:</strong> Withdraw previously given consent at any time</li>
							</ul>
							<p className={styles.para}>
								To exercise any of these rights, contact us at <a href="mailto:privacy@genetiq.app">privacy@genetiq.app</a>. We will respond within <strong>30 days</strong>.
							</p>
						</div>
					</section>

					<section id="cookies" className={styles.section}>
						<h2 className={styles.sectionTitle}>Cookies</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								We use a minimal number of cookies strictly necessary for the platform to function:
							</p>
							<ul className={styles.list}>
								<li><strong>Session cookies:</strong> To keep you logged in during your session</li>
								<li><strong>Preference cookies:</strong> To remember your app settings and language</li>
								<li><strong>Security cookies:</strong> To protect against cross-site request forgery (CSRF)</li>
							</ul>
							<p className={styles.para}>
								We do <strong>not</strong> use third-party advertising cookies or cross-site tracking. You can clear cookies at any time through your browser settings.
							</p>
						</div>
					</section>

					<section id="children" className={styles.section}>
						<h2 className={styles.sectionTitle}>Children's Privacy</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								Genetiq is not directed at children under the age of 18. We do not knowingly collect personal data from anyone under 18. If we become aware that a child has provided us with personal information, we will delete it immediately.
							</p>
							<p className={styles.para}>
								If you believe a minor has created an account, please contact us at <a href="mailto:privacy@genetiq.app">privacy@genetiq.app</a>.
							</p>
						</div>
					</section>

					<section id="changes" className={styles.section}>
						<h2 className={styles.sectionTitle}>Changes to Policy</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								We may update this Privacy Policy periodically to reflect changes in our practices or applicable law. When we make significant changes, we will:
							</p>
							<ul className={styles.list}>
								<li>Notify you by email at least 14 days before changes take effect</li>
								<li>Display a prominent notice within the app</li>
								<li>Update the "Last updated" date at the top of this page</li>
							</ul>
						</div>
					</section>

					<section id="contact" className={styles.section}>
						<h2 className={styles.sectionTitle}>Contact Us</h2>
						<div className={styles.sectionBody}>
							<p className={styles.para}>
								If you have any questions, concerns, or requests related to your privacy, please contact our Data Protection team:
							</p>
							<ul className={styles.list}>
								<li>Privacy enquiries: <a href="mailto:privacy@genetiq.app">privacy@genetiq.app</a></li>
								<li>General support: <a href="mailto:support@genetiq.app">support@genetiq.app</a></li>
								<li>Security issues: <a href="mailto:security@genetiq.app">security@genetiq.app</a></li>
							</ul>
							<p className={styles.para}>
								We take all privacy concerns seriously and aim to respond within 30 days.
							</p>
						</div>
					</section>
				</main>
			</div>

			{/* Footer */}
			<footer className={styles.footer}>
				<div className={styles.footerLinks}>
					<a onClick={() => navigate(paths.landing)}>Home</a>
					<a onClick={() => navigate(paths.terms)}>Terms of Service</a>
					<a href="mailto:privacy@genetiq.app">Contact Privacy</a>
					<a onClick={() => navigate(paths.auth.login)}>Sign In</a>
				</div>
				<p className={styles.footerCopy}>© 2026 Genetiq Ltd. All rights reserved.</p>
			</footer>
		</div>
	);
};

export default Privacy;
