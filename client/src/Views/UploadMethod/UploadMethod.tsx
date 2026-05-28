import { useNavigate } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";
import { motion } from "framer-motion";
import {
	Upload,
	Camera,
	FileText,
	LayoutDashboard,
	ArrowRight,
	CheckCircle2,
	ShieldCheck,
	Brain,
} from "lucide-react";
import styles from "./UploadMethod.module.scss";

// ─── Option cards ─────────────────────────────────────────────────────────────

const OPTIONS = [
	{
		id: "upload",
		icon: <Upload size={28} />,
		badge: "Recommended",
		badgeColor: "teal",
		title: "Upload Your Lab Results",
		desc: "Take a photo of your paper results or upload a PDF/image. Our AI reads it and explains everything in plain English — in under 30 seconds.",
		cta: "Upload Now",
		url: paths.config.importOrUpload,
		disabled: false,
		highlights: ["Snap a photo", "PDF or image", "Any lab format"],
	},
	{
		id: "history",
		icon: <FileText size={28} />,
		badge: "My Records",
		badgeColor: "neutral",
		title: "View My Health History",
		desc: "See all your past lab results, AI explanations, and health plans in one place. Track how your markers change over time.",
		cta: "View History",
		url: paths.clinicalHistory,
		disabled: false,
		highlights: ["Past results", "Progress tracking", "AI summaries"],
	},
	{
		id: "dashboard",
		icon: <LayoutDashboard size={28} />,
		badge: "Overview",
		badgeColor: "neutral",
		title: "Go to Dashboard",
		desc: "Jump to your personal health dashboard to see your AI-generated health score, recommendations, and diet plan.",
		cta: "Open Dashboard",
		url: paths.dashboard.root,
		disabled: false,
		highlights: ["Health score", "Diet plan", "AI insights"],
	},
];

// ─── Component ────────────────────────────────────────────────────────────────

const Config = () => {
	const navigate = useNavigate();

	return (
		<div className={styles.page}>
			{/* Header */}
			<motion.div
				className={styles.header}
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<span className={styles.badge}>
					<span className={styles.badgeDot} />
					What would you like to do?
				</span>
				<h1 className={styles.title}>
					You're in. Let's get started.
				</h1>
				<p className={styles.subtitle}>
					Upload your lab results and our AI will explain every value in plain English,
					then build you a personalised health and diet plan.
				</p>
			</motion.div>

			{/* Option cards */}
			<div className={styles.cards}>
				{OPTIONS.map((opt, i) => (
					<motion.div
						key={opt.id}
						className={`${styles.card} ${opt.disabled ? styles.cardDisabled : ""} ${opt.id === "upload" ? styles.cardFeatured : ""}`}
						initial={{ opacity: 0, y: 32 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.15 + i * 0.1, duration: 0.45 }}
						onClick={() => !opt.disabled && navigate(opt.url!)}
					>
						{/* Badge */}
						<div className={`${styles.cardBadge} ${styles[`badge-${opt.badgeColor}`]}`}>
							{opt.badge}
						</div>

						{/* Icon */}
						<div className={styles.cardIcon}>{opt.icon}</div>

						{/* Text */}
						<h2 className={styles.cardTitle}>{opt.title}</h2>
						<p className={styles.cardDesc}>{opt.desc}</p>

						{/* Highlights */}
						<ul className={styles.highlights}>
							{opt.highlights.map((h) => (
								<li key={h}>
									<CheckCircle2 size={13} />
									{h}
								</li>
							))}
						</ul>

						{/* CTA */}
						{!opt.disabled && (
							<button className={styles.cardCta}>
								{opt.cta}
								<ArrowRight size={16} />
							</button>
						)}

						{opt.disabled && (
							<span className={styles.comingSoon}>Coming soon</span>
						)}
					</motion.div>
				))}
			</div>

			{/* Footer */}
		<motion.div
			className={styles.configFooter}
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.6 }}
		>
			{/* Camera quick action */}
			<div className={styles.quickBar}>
				<Camera size={18} />
				<span>Got paper results in hand?</span>
				<button onClick={() => navigate(paths.config.importOrUpload)}>
					Snap a photo now <ArrowRight size={14} />
				</button>
			</div>

			{/* Help text */}
			<p className={styles.helpText}>
				Need help?{" "}
				<a href='#'>Contact our support team</a>
				{" "}or check out our{" "}
				<a href='#'>getting started guide</a>
			</p>

			{/* Trust badges */}
			<div className={styles.trustStrip}>
				{[
					{ icon: <ShieldCheck size={14} />, label: "256-bit encryption" },
					{ icon: <ShieldCheck size={14} />, label: "Bank-level security" },
					{ icon: <CheckCircle2 size={14} />, label: "HIPAA compliant" },
					{ icon: <CheckCircle2 size={14} />, label: "Healthcare standard" },
					{ icon: <Brain size={14} />, label: "Instant analysis" },
					{ icon: <Upload size={14} />, label: "Results in seconds" },
				].map((b) => (
					<div key={b.label} className={styles.trustBadge}>
						{b.icon}
						<span>{b.label}</span>
					</div>
				))}
			</div>
		</motion.div>
	</div>
	);
};

export default Config;
