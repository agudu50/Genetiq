import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
	const [pageIn, setPageIn] = useState(false);

	useEffect(() => {
		let frame2 = 0;
		const frame1 = requestAnimationFrame(() => {
			frame2 = requestAnimationFrame(() => setPageIn(true));
		});
		return () => {
			cancelAnimationFrame(frame1);
			cancelAnimationFrame(frame2);
		};
	}, []);

	return (
		<div className={`${styles.page} ${pageIn ? styles.pageIn : ""}`}>
			<div className={styles.bgLayer} aria-hidden>
				<div className={styles.bgGrid} />
				<div className={styles.bgGlow} />
			</div>

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
								<li key={i} className={styles.featureItem}>
									<span className={styles.featureIcon}>{f.icon}</span>
									<span>{f.text}</span>
								</li>
							))}
						</ul>

						<div className={styles.trustBadge}>
							<ShieldCheck size={14} />
							<span>Free to start · No credit card needed</span>
						</div>
					</div>

					<p className={styles.leftFooter}>
						© 2026 Genetiq · <a href='/privacy'>Privacy</a> · <a href='/terms'>Terms</a>
					</p>
				</div>
			</div>

			<div className={styles.rightPanel}>
				<div className={styles.rightInner}>
					<div className={styles.mobileHeader} onClick={() => navigate(paths.landing)}>
						<img src='/assets/genetiq_logo_v2.png' alt='Genetiq' className={styles.brandLogo} />
						<span className={styles.brandName}>Genetiq</span>
					</div>

					<RegisterForm animate={pageIn} />
				</div>
			</div>
		</div>
	);
};

export default Register;
