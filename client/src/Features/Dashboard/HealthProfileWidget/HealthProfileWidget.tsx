import { useMemo } from "react";
import styles from "./HealthProfileWidget.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/App/i18n/LanguageContext";

export const HealthProfileWidget = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.user);

	const bmi = useMemo(() => {
		const h = Number(user.height);
		const w = Number(user.weight);
		if (!h || !w) return null;
		return w / ((h / 100) * (h / 100));
	}, [user.height, user.weight]);

	const getBmiCategory = (val: number) => {
		if (val < 18.5)
			return { label: "Underweight", color: "#60a5fa", cls: "underweight" };
		if (val < 25) return { label: "Normal", color: "#00A69D", cls: "normal" };
		if (val < 30)
			return { label: "Overweight", color: "#fbbf24", cls: "overweight" };
		return { label: "Obese", color: "#ef4444", cls: "obese" };
	};

	const bmiInfo = bmi ? getBmiCategory(bmi) : null;

	// Profile completeness checking
	const fields = [
		user.firstName,
		user.lastName,
		user.age,
		user.gender,
		user.height,
		user.weight,
		user.medicalConditions.length > 0 ? "yes" : "",
		user.lifestyle.exercise,
		user.lifestyle.diet,
		user.bloodType,
		user.allergies.length > 0 ? "yes" : "",
		user.clinicalHistory,
	];
	const filled = fields.filter(Boolean).length;
	const total = fields.length;
	const completeness = Math.round((filled / total) * 100);

	const initials = useMemo(() => {
		if (user.firstName && user.lastName) {
			return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
		}
		if (user.firstName) {
			return user.firstName[0].toUpperCase();
		}
		return "?";
	}, [user.firstName, user.lastName]);

	return (
		<div className={styles.profileWidget}>
			<div className={styles.header}>
				<div
					className={styles.avatarRing}
					style={
						{ "--progress": `${completeness * 3.6}deg` } as React.CSSProperties
					}
				>
					<div className={styles.avatar}>
						{initials === "?" ? (
							<svg
								className={styles.silhouetteIcon}
								width='20'
								height='20'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2.2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
								<circle cx='12' cy='7' r='4' />
							</svg>
						) : (
							<span>{initials}</span>
						)}
					</div>
				</div>
				<div className={styles.headerInfo}>
					<h3 className={styles.name}>
						{user.firstName || "Genetiq"} {user.lastName || "Member"}
					</h3>
					<div className={styles.metaRow}>
						{user.age && <span className={styles.metaTag}>{user.age} yrs</span>}
						{user.gender && (
							<span className={styles.metaTag}>{user.gender}</span>
						)}
						{user.medicalConditions.length > 0 && (
							<span className={`${styles.metaTag} ${styles.conditionTag}`}>
								{user.medicalConditions.length} clinical alerts
							</span>
						)}
						<span className={styles.metaTag}>Bio Setup</span>
						{user.isWalletConnected && user.walletAddress && (
							<span className={`${styles.metaTag} ${styles.walletTag}`}>
								<svg
									width='14'
									height='14'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M21 12V7H5a2 2 0 0 1 0-4h14v4' />
									<path d='M3 5v14a2 2 0 0 0 2 2h16v-5' />
									<path d='M18 12h5v4h-5z' />
								</svg>
								{user.walletAddress.slice(0, 6)}...
								{user.walletAddress.slice(-4)}
							</span>
						)}
					</div>
				</div>
			</div>

			<div className={styles.vitalsGrid}>
				{/* Height Card */}
				{user.height ? (
					<div className={styles.vitalCard}>
						<div className={styles.vitalIcon}>
							<svg
								width='18'
								height='18'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M12 22V2M8 6l4-4 4 4M8 18l4 4 4-4' />
							</svg>
						</div>
						<div className={styles.vitalData}>
							<span className={styles.vitalValue}>{user.height}</span>
							<span className={styles.vitalUnit}>cm</span>
						</div>
						<span className={styles.vitalLabel}>{t("height") || "Height"}</span>
					</div>
				) : (
					<div className={`${styles.vitalCard} ${styles.isEmpty}`}>
						<div className={styles.vitalIcon}>
							<svg
								width='18'
								height='18'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M12 22V2M8 6l4-4 4 4M8 18l4 4 4-4' />
							</svg>
						</div>
						<div className={styles.vitalData}>
							<span className={styles.vitalPlaceholder}>--</span>
						</div>
						<span className={styles.vitalLabel}>{t("height") || "Height"}</span>
					</div>
				)}

				{/* Weight Card */}
				{user.weight ? (
					<div className={styles.vitalCard}>
						<div className={styles.vitalIcon}>
							<svg
								width='18'
								height='18'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<rect x='3' y='4' width='18' height='16' rx='3' />
								<path d='M12 4v4M12 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 12l2-3' />
							</svg>
						</div>
						<div className={styles.vitalData}>
							<span className={styles.vitalValue}>{user.weight}</span>
							<span className={styles.vitalUnit}>kg</span>
						</div>
						<span className={styles.vitalLabel}>{t("weight") || "Weight"}</span>
					</div>
				) : (
					<div className={`${styles.vitalCard} ${styles.isEmpty}`}>
						<div className={styles.vitalIcon}>
							<svg
								width='18'
								height='18'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<rect x='3' y='4' width='18' height='16' rx='3' />
								<path d='M12 4v4M12 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 12l2-3' />
							</svg>
						</div>
						<div className={styles.vitalData}>
							<span className={styles.vitalPlaceholder}>--</span>
						</div>
						<span className={styles.vitalLabel}>{t("weight") || "Weight"}</span>
					</div>
				)}

				{/* BMI Index Card */}
				{bmi !== null && bmiInfo ? (
					<div className={styles.vitalCard}>
						<div className={styles.vitalIcon} style={{ color: bmiInfo.color }}>
							<svg
								width='18'
								height='18'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M22 12h-4l-3 9L9 3l-3 9H2' />
							</svg>
						</div>
						<div className={styles.vitalData}>
							<span className={styles.vitalValue}>{bmi.toFixed(1)}</span>
							<span className={`${styles.bmiBadge} ${styles[bmiInfo.cls]}`}>
								{bmiInfo.label}
							</span>
						</div>
						<span className={styles.vitalLabel}>BMI</span>
					</div>
				) : (
					<div className={`${styles.vitalCard} ${styles.isEmpty}`}>
						<div className={styles.vitalIcon}>
							<svg
								width='18'
								height='18'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M22 12h-4l-3 9L9 3l-3 9H2' />
							</svg>
						</div>
						<div className={styles.vitalData}>
							<span className={styles.vitalPlaceholder}>--</span>
						</div>
						<span className={styles.vitalLabel}>BMI Index</span>
					</div>
				)}
			</div>

			<div className={styles.footer}>
				<div className={styles.completeness}>
					<div className={styles.completenessBar}>
						<div
							className={styles.completenessProgress}
							style={{ width: `${completeness}%` }}
						/>
					</div>
					<span className={styles.completenessText}>
						{completeness}% complete
					</span>
				</div>
				<button
					className={styles.updateBtn}
					onClick={() => navigate("/config/import")}
				>
					{t("update_profile") || "Update"}
				</button>
			</div>
		</div>
	);
};
