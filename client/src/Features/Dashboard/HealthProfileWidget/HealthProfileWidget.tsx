import { useMemo, useState } from "react";
import styles from "./HealthProfileWidget.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { updateUserInfo } from "@/App/Redux/userSlice";
import { useLanguage } from "@/App/i18n/LanguageContext";

export const HealthProfileWidget = () => {
	const { t } = useLanguage();
	const dispatch = useDispatch();
	const user = useSelector((state: RootState) => state.user);

	// ── Local edit state ─────────────────────────────────────────────────────
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState({ height: "", weight: "" });

	const openEdit = () => {
		setDraft({ height: user.height, weight: user.weight });
		setEditing(true);
	};

	const cancelEdit = () => setEditing(false);

	const saveEdit = () => {
		dispatch(updateUserInfo({ height: draft.height.trim(), weight: draft.weight.trim() }));
		setEditing(false);
	};

	// ── BMI ─────────────────────────────────────────────────────────────────
	const bmi = useMemo(() => {
		const h = Number(user.height);
		const w = Number(user.weight);
		if (!h || !w) return null;
		return w / ((h / 100) * (h / 100));
	}, [user.height, user.weight]);

	const draftBmi = useMemo(() => {
		const h = Number(draft.height);
		const w = Number(draft.weight);
		if (!h || !w) return null;
		return w / ((h / 100) * (h / 100));
	}, [draft.height, draft.weight]);

	const getBmiCategory = (val: number) => {
		if (val < 18.5) return { label: "Underweight", color: "#60a5fa", cls: "underweight" };
		if (val < 25)   return { label: "Normal",      color: "#00A69D", cls: "normal"      };
		if (val < 30)   return { label: "Overweight",  color: "#fbbf24", cls: "overweight"  };
		return              { label: "Obese",       color: "#ef4444", cls: "obese"       };
	};

	const bmiInfo      = bmi      ? getBmiCategory(bmi)      : null;
	const draftBmiInfo = draftBmi ? getBmiCategory(draftBmi) : null;

	// ── Profile completeness ─────────────────────────────────────────────────
	const completeness = useMemo(() => {
		const fields = [
			user.firstName, user.lastName, user.age, user.gender,
			user.height, user.weight,
			user.medicalConditions.length > 0 ? "yes" : "",
			user.lifestyle.exercise, user.lifestyle.diet,
			user.bloodType,
			user.allergies.length > 0 ? "yes" : "",
			user.clinicalHistory,
		];
		return Math.round((fields.filter(Boolean).length / fields.length) * 100);
	}, [user]);

	// ── Derived display values ───────────────────────────────────────────────
	const initials = useMemo(() => {
		if (user.firstName && user.lastName)
			return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
		if (user.firstName) return user.firstName[0].toUpperCase();
		return "?";
	}, [user.firstName, user.lastName]);

	const displayName = useMemo(() => {
		const first = user.firstName?.trim();
		const last  = user.lastName?.trim();
		if (first && last) return `${first} ${last}`;
		if (first)         return first;
		return "Genetiq Member";
	}, [user.firstName, user.lastName]);

	// ── Render ───────────────────────────────────────────────────────────────
	return (
		<div className={styles.profileWidget}>

			{/* Identity banner */}
			<div className={styles.identityBanner}>
				<div
					className={styles.avatarRing}
					style={{ "--progress": `${completeness * 3.6}deg` } as React.CSSProperties}
				>
					<div className={styles.avatar}>
						{initials === "?" ? (
							<svg className={styles.silhouetteIcon} width='20' height='20' viewBox='0 0 24 24'
								fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
								<path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
								<circle cx='12' cy='7' r='4' />
							</svg>
						) : (
							<span>{initials}</span>
						)}
					</div>
				</div>

				<div className={styles.identityInfo}>
					<h3 className={styles.displayName}>{displayName}</h3>
					<div className={styles.badgeRow}>
						<span className={`${styles.memberBadge} ${user.isPremium ? styles.premiumBadge : styles.freeBadge}`}>
							{user.isPremium ? (
								<><svg width='10' height='10' viewBox='0 0 24 24' fill='currentColor'>
									<path d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z' />
								</svg>Premium</>
							) : (
								<><svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
									<circle cx='12' cy='12' r='10' /><line x1='12' y1='8' x2='12' y2='12' /><line x1='12' y1='16' x2='12.01' y2='16' />
								</svg>Free Plan</>
							)}
						</span>
						{user.age    && <span className={styles.metaTag}>{user.age} yrs</span>}
						{user.gender && <span className={styles.metaTag}>{user.gender}</span>}
						{user.medicalConditions.length > 0 && (
							<span className={`${styles.metaTag} ${styles.conditionTag}`}>
								{user.medicalConditions.length} alerts
							</span>
						)}
						{user.isWalletConnected && user.walletAddress && (
							<span className={`${styles.metaTag} ${styles.walletTag}`}>
								<svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
									<path d='M21 12V7H5a2 2 0 0 1 0-4h14v4' /><path d='M3 5v14a2 2 0 0 0 2 2h16v-5' /><path d='M18 12h5v4h-5z' />
								</svg>
								{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
							</span>
						)}
					</div>
				</div>
			</div>

			{/* ── Vitals section ── */}
			{editing ? (
				/* ─── Edit mode ─── */
				<div className={styles.editPanel}>
					<p className={styles.editPanelTitle}>
						<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
							<path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
							<path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
						</svg>
						Edit Body Metrics
					</p>

					<div className={styles.inputGroup}>
						<label className={styles.inputLabel}>
							<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
								<path d='M12 22V2M8 6l4-4 4 4M8 18l4 4 4-4' />
							</svg>
							Height
						</label>
						<div className={styles.inputRow}>
							<input
								type='number'
								min='50'
								max='300'
								placeholder='e.g. 175'
								className={styles.metricInput}
								value={draft.height}
								onChange={e => setDraft(d => ({ ...d, height: e.target.value }))}
							/>
							<span className={styles.inputUnit}>cm</span>
						</div>
					</div>

					<div className={styles.inputGroup}>
						<label className={styles.inputLabel}>
							<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
								<rect x='3' y='4' width='18' height='16' rx='3' />
								<path d='M12 4v4M12 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 12l2-3' />
							</svg>
							Weight
						</label>
						<div className={styles.inputRow}>
							<input
								type='number'
								min='10'
								max='500'
								placeholder='e.g. 72'
								className={styles.metricInput}
								value={draft.weight}
								onChange={e => setDraft(d => ({ ...d, weight: e.target.value }))}
							/>
							<span className={styles.inputUnit}>kg</span>
						</div>
					</div>

					{/* Live BMI preview */}
					{draftBmi !== null && draftBmiInfo && (
						<div className={styles.bmiPreview} style={{ borderColor: `${draftBmiInfo.color}30` }}>
							<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke={draftBmiInfo.color} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
								<path d='M22 12h-4l-3 9L9 3l-3 9H2' />
							</svg>
							<span className={styles.bmiPreviewLabel}>BMI</span>
							<span className={styles.bmiPreviewValue} style={{ color: draftBmiInfo.color }}>
								{draftBmi.toFixed(1)}
							</span>
							<span className={`${styles.bmiBadge} ${styles[draftBmiInfo.cls]}`}>
								{draftBmiInfo.label}
							</span>
						</div>
					)}

					<div className={styles.editActions}>
						<button className={styles.cancelBtn} onClick={cancelEdit}>Cancel</button>
						<button className={styles.saveBtn} onClick={saveEdit}>
							<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
								<polyline points='20 6 9 17 4 12' />
							</svg>
							Save
						</button>
					</div>
				</div>
			) : (
				/* ─── Display mode ─── */
				<div className={styles.vitalsGrid}>
					{/* Height */}
					<div
						className={`${styles.vitalCard} ${!user.height ? styles.isEmpty : ""}`}
						onClick={openEdit}
						title='Click to edit'
					>
						<div className={styles.vitalIcon}>
							<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
								<path d='M12 22V2M8 6l4-4 4 4M8 18l4 4 4-4' />
							</svg>
						</div>
						{user.height ? (
							<div className={styles.vitalData}>
								<span className={styles.vitalValue}>{user.height}</span>
								<span className={styles.vitalUnit}>cm</span>
							</div>
						) : (
							<div className={styles.vitalData}>
								<span className={styles.vitalPlaceholder}>--</span>
							</div>
						)}
						<span className={styles.vitalLabel}>{t("height") || "Height"}</span>
						{!user.height && <span className={styles.addHint}>+ Add</span>}
					</div>

					{/* Weight */}
					<div
						className={`${styles.vitalCard} ${!user.weight ? styles.isEmpty : ""}`}
						onClick={openEdit}
						title='Click to edit'
					>
						<div className={styles.vitalIcon}>
							<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
								<rect x='3' y='4' width='18' height='16' rx='3' />
								<path d='M12 4v4M12 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 12l2-3' />
							</svg>
						</div>
						{user.weight ? (
							<div className={styles.vitalData}>
								<span className={styles.vitalValue}>{user.weight}</span>
								<span className={styles.vitalUnit}>kg</span>
							</div>
						) : (
							<div className={styles.vitalData}>
								<span className={styles.vitalPlaceholder}>--</span>
							</div>
						)}
						<span className={styles.vitalLabel}>{t("weight") || "Weight"}</span>
						{!user.weight && <span className={styles.addHint}>+ Add</span>}
					</div>

					{/* BMI – read-only, calculated */}
					<div
						className={`${styles.vitalCard} ${!bmi ? styles.isEmpty : ""}`}
						onClick={openEdit}
						title={bmi ? "BMI is auto-calculated" : "Add height & weight to calculate"}
					>
						{bmi !== null && bmiInfo ? (
							<>
								<div className={styles.vitalIcon} style={{ color: bmiInfo.color }}>
									<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
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
							</>
						) : (
							<>
								<div className={styles.vitalIcon}>
									<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
										<path d='M22 12h-4l-3 9L9 3l-3 9H2' />
									</svg>
								</div>
								<div className={styles.vitalData}>
									<span className={styles.vitalPlaceholder}>--</span>
								</div>
								<span className={styles.vitalLabel}>BMI Index</span>
								<span className={styles.addHint}>Auto</span>
							</>
						)}
					</div>
				</div>
			)}

			{/* Footer */}
			{!editing && (
				<div className={styles.footer}>
					<div className={styles.completeness}>
						<div className={styles.completenessBar}>
							<div className={styles.completenessProgress} style={{ width: `${completeness}%` }} />
						</div>
						<span className={styles.completenessText}>{completeness}% profile complete</span>
					</div>
					<button className={styles.updateBtn} onClick={openEdit}>
						<svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
							<path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
							<path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
						</svg>
						{t("update_profile") || "Edit"}
					</button>
				</div>
			)}
		</div>
	);
};
