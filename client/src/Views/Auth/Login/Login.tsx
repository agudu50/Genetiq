import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";
import { LoginForm } from "@/Features/Auth/Login/Components/LoginForm/LoginForm";
import { useLanguage } from "@/App/i18n/LanguageContext";
import styles from "./Login.module.scss";
import { ShieldCheck, Upload, Brain } from "lucide-react";

const Login = () => {
	const navigate = useNavigate();
	const { t } = useLanguage();
	const [pageIn, setPageIn] = useState(false);

	const features = [
		{ icon: <Upload size={18} />, text: t("auth_feature_upload") },
		{ icon: <Brain size={18} />, text: t("auth_feature_ai") },
		{ icon: <ShieldCheck size={18} />, text: t("auth_feature_private") },
	];

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
							{t("auth_login_heading")}
						</h2>
						<p className={styles.leftSub}>
							{t("auth_login_sub")}
						</p>

						<ul className={styles.featureList}>
							{features.map((f, i) => (
								<li key={i} className={styles.featureItem}>
									<span className={styles.featureIcon}>{f.icon}</span>
									<span>{f.text}</span>
								</li>
							))}
						</ul>
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

					<LoginForm animate={pageIn} />
				</div>
			</div>
		</div>
	);
};

export default Login;
