import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { paths } from "@/App/Routes/Paths";
import { RegisterForm } from "@/Features/Auth/Resgister/RegisterForm/RegisterForm";
import styles from "./Register.module.scss";
import { ShieldCheck, Upload, Brain } from "lucide-react";

const FEATURES = [
	{ icon: <Upload size={18} />, text: "Upload any lab result — paper or PDF" },
	{ icon: <Brain size={18} />, text: "AI explains every value in plain English" },
	{ icon: <ShieldCheck size={18} />, text: "Your data is private and encrypted" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const leftPanelVariants = {
	hidden: { opacity: 0, x: -48 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.75, ease: EASE },
	},
};

const rightPanelVariants = {
	hidden: { opacity: 0, x: 48 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.75, ease: EASE, delay: 0.08 },
	},
};

const fadeUpVariants = {
	hidden: { opacity: 0, y: 28 },
	visible: (delay = 0) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: EASE, delay },
	}),
};

const featureVariants = {
	hidden: { opacity: 0, x: -28 },
	visible: (i: number) => ({
		opacity: 1,
		x: 0,
		transition: { duration: 0.55, ease: EASE, delay: 0.38 + i * 0.11 },
	}),
};

const badgeVariants = {
	hidden: { opacity: 0, scale: 0.88, y: 12 },
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: { type: "spring", stiffness: 260, damping: 22, delay: 0.72 },
	},
};

const Register = () => {
	const navigate = useNavigate();
	const reduceMotion = useReducedMotion();

	const instant = reduceMotion
		? { duration: 0 }
		: undefined;

	return (
		<div className={styles.page}>
			<div className={styles.bgLayer} aria-hidden>
				<div className={styles.bgGrid} />
				<div className={styles.bgGlow} />
			</div>

			{/* ── Left panel ── */}
			<motion.div
				className={styles.leftPanel}
				initial={reduceMotion ? false : "hidden"}
				animate="visible"
				variants={leftPanelVariants}
				transition={instant}
			>
				<div className={styles.leftInner}>
					<motion.div
						className={styles.brand}
						onClick={() => navigate(paths.landing)}
						variants={fadeUpVariants}
						custom={0.12}
						initial={reduceMotion ? false : "hidden"}
						animate="visible"
						whileHover={reduceMotion ? undefined : { scale: 1.02 }}
						whileTap={reduceMotion ? undefined : { scale: 0.98 }}
					>
						<img src='/assets/genetiq_logo_v2.png' alt='Genetiq' className={styles.brandLogo} />
						<span className={styles.brandName}>Genetiq</span>
					</motion.div>

					<div className={styles.leftContent}>
						<motion.h2
							className={styles.leftHeading}
							variants={fadeUpVariants}
							custom={0.22}
							initial={reduceMotion ? false : "hidden"}
							animate="visible"
						>
							Finally understand what your test results mean.
						</motion.h2>

						<motion.p
							className={styles.leftSub}
							variants={fadeUpVariants}
							custom={0.32}
							initial={reduceMotion ? false : "hidden"}
							animate="visible"
						>
							Join thousands of people who use Genetiq to make sense of their health data — and take real action on it.
						</motion.p>

						<ul className={styles.featureList}>
							{FEATURES.map((f, i) => (
								<motion.li
									key={i}
									className={styles.featureItem}
									custom={i}
									variants={featureVariants}
									initial={reduceMotion ? false : "hidden"}
									animate="visible"
									whileHover={reduceMotion ? undefined : { x: 6 }}
								>
									<motion.span
										className={styles.featureIcon}
										whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: -4 }}
										transition={{ type: "spring", stiffness: 400, damping: 18 }}
									>
										{f.icon}
									</motion.span>
									<span>{f.text}</span>
								</motion.li>
							))}
						</ul>

						<motion.div
							className={styles.trustBadge}
							variants={badgeVariants}
							initial={reduceMotion ? false : "hidden"}
							animate="visible"
						>
							<ShieldCheck size={14} />
							<span>Free to start · No credit card needed</span>
						</motion.div>
					</div>

					<motion.p
						className={styles.leftFooter}
						variants={fadeUpVariants}
						custom={0.85}
						initial={reduceMotion ? false : "hidden"}
						animate="visible"
					>
						© 2026 Genetiq · <a href='/privacy'>Privacy</a> · <a href='/terms'>Terms</a>
					</motion.p>
				</div>
			</motion.div>

			{/* ── Right panel ── */}
			<motion.div
				className={styles.rightPanel}
				initial={reduceMotion ? false : "hidden"}
				animate="visible"
				variants={rightPanelVariants}
				transition={instant}
			>
				<div className={styles.rightInner}>
					<motion.div
						className={styles.mobileHeader}
						onClick={() => navigate(paths.landing)}
						initial={reduceMotion ? false : { opacity: 0, y: -16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: 0.15 }}
						whileTap={reduceMotion ? undefined : { scale: 0.98 }}
					>
						<img src='/assets/genetiq_logo_v2.png' alt='Genetiq' className={styles.brandLogo} />
						<span className={styles.brandName}>Genetiq</span>
					</motion.div>

					<RegisterForm reduceMotion={!!reduceMotion} />
				</div>
			</motion.div>
		</div>
	);
};

export default Register;
