import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { paths } from "@/App/Routes/Paths";
import { RegisterForm } from "@/Features/Auth/Resgister/RegisterForm/RegisterForm";
import styles from "./Register.module.scss";
import { ShieldCheck, Upload, Brain } from "lucide-react";

const FEATURES = [
	{ icon: <Upload size={18} />, text: "Upload any lab result — paper or PDF" },
	{ icon: <Brain size={18} />, text: "AI explains every value in plain English" },
	{ icon: <ShieldCheck size={18} />, text: "Your data is private and encrypted" },
];

const Register = () => {
	const navigate = useNavigate();

	return (
		<div className={styles.page}>
			{/* ── Left panel ── */}
			<div className={styles.leftPanel}>
				<div className={styles.leftInner}>
					<div className={styles.brand} onClick={() => navigate(paths.landing)}>
						<img src='/assets/genetiq_logo_v2.png' alt='Genetiq' className={styles.brandLogo} />
						<span className={styles.brandName}>Genetiq</span>
					</div>

					<div className={styles.leftContent}>
						<h2 className={styles.leftHeading}>
							Finally understand what your test results mean.
						</h2>
						<p className={styles.leftSub}>
							Join thousands of people who use Genetiq to make sense of their health data — and take real action on it.
						</p>

						<ul className={styles.featureList}>
							{FEATURES.map((f, i) => (
								<motion.li
									key={i}
									className={styles.featureItem}
									initial={{ opacity: 0, x: -16 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.2 + i * 0.12 }}
								>
									<span className={styles.featureIcon}>{f.icon}</span>
									<span>{f.text}</span>
								</motion.li>
							))}
						</ul>

						<div className={styles.trustBadge}>
							<ShieldCheck size={14} />
							<span>Free to start · No credit card needed</span>
						</div>
					</div>

					<p className={styles.leftFooter}>© 2026 Genetiq · <a href='/privacy'>Privacy</a> · <a href='/terms'>Terms</a></p>
				</div>
			</div>

			{/* ── Right panel ── */}
			<div className={styles.rightPanel}>
				<div className={styles.rightInner}>
					<div className={styles.mobileHeader} onClick={() => navigate(paths.landing)}>
						<img src='/assets/genetiq_logo_v2.png' alt='Genetiq' className={styles.brandLogo} />
						<span className={styles.brandName}>Genetiq</span>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						<RegisterForm />
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default Register;
