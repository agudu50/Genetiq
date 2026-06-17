import { useMemo, useState } from "react";
import {
	User,
	Crown,
	Ruler,
	Scale,
	Activity,
	Pencil,
	Check,
	Sparkles,
	Plus,
	Wallet,
	AlertCircle,
} from "lucide-react";
import styles from "./HealthProfileWidget.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { updateUserInfo } from "@/App/Redux/userSlice";
import { useLanguage } from "@/App/i18n/LanguageContext";

export const HealthProfileWidget = () => {
	const { t } = useLanguage();
	const dispatch = useDispatch();
	const user = useSelector((state: RootState) => state.user);

	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState({ height: "", weight: "" });

	const openEdit = () => {
		setDraft({ height: user.height, weight: user.weight });
		setEditing(true);
	};

	const cancelEdit = () => setEditing(false);

	const saveEdit = () => {
		dispatch(
			updateUserInfo({
				height: draft.height.trim(),
				weight: draft.weight.trim(),
			}),
		);
		setEditing(false);
	};

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
		if (val < 18.5)
			return { label: t("bmi_low"), color: "#60a5fa", cls: "underweight" };
		if (val < 25)
			return { label: t("bmi_normal"), color: "#00A69D", cls: "normal" };
		if (val < 30)
			return { label: t("bmi_high"), color: "#fbbf24", cls: "overweight" };
		return { label: t("bmi_obese"), color: "#ef4444", cls: "obese" };
	};

	const bmiInfo = bmi ? getBmiCategory(bmi) : null;
	const draftBmiInfo = draftBmi ? getBmiCategory(draftBmi) : null;

	const completeness = useMemo(() => {
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
		return Math.round((fields.filter(Boolean).length / fields.length) * 100);
	}, [user]);

	const completenessHint = useMemo(() => {
		if (!user.height || !user.weight) return t("profile_hint_body_metrics");
		if (!user.firstName || !user.lastName) return t("profile_hint_name");
		if (!user.age) return t("profile_hint_age");
		if (!user.clinicalHistory) return t("profile_hint_history");
		return t("profile_hint_complete");
	}, [user, t]);

	const initials = useMemo(() => {
		if (user.firstName && user.lastName)
			return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
		if (user.firstName) return user.firstName[0].toUpperCase();
		return "?";
	}, [user.firstName, user.lastName]);

	const displayName = useMemo(() => {
		const first = user.firstName?.trim();
		const last = user.lastName?.trim();
		if (first && last) return `${first} ${last}`;
		if (first) return first;
		return t("profile_member_fallback");
	}, [user.firstName, user.lastName, t]);

	const ringOffset = 2 * Math.PI * 22 - (completeness / 100) * (2 * Math.PI * 22);

	return (
		<div className={styles.profileWidget}>
			<div className={styles.heroBg} aria-hidden />
			<div className={styles.heroMesh} aria-hidden />
			<div className={styles.heroGlow} aria-hidden />

			<div className={styles.inner}>
				<div className={styles.topRow}>
					<span className={styles.eyebrow}>{t("profile_eyebrow")}</span>
					<span className={styles.completenessPill}>
						<Sparkles size={11} strokeWidth={2.5} />
						{completeness}%
					</span>
				</div>

				<div className={styles.identityCard}>
					<div
						className={styles.avatarRing}
						style={{ "--progress": `${completeness * 3.6}deg` } as React.CSSProperties}
					>
						<svg className={styles.avatarRingSvg} viewBox="0 0 52 52" aria-hidden>
							<circle
								className={styles.avatarRingTrack}
								cx="26"
								cy="26"
								r="22"
								fill="none"
							/>
							<circle
								className={styles.avatarRingProgress}
								cx="26"
								cy="26"
								r="22"
								fill="none"
								strokeDasharray={2 * Math.PI * 22}
								strokeDashoffset={ringOffset}
							/>
						</svg>
						<div className={styles.avatar}>
							{initials === "?" ? (
								<User size={20} strokeWidth={2.25} />
							) : (
								<span>{initials}</span>
							)}
						</div>
					</div>

					<div className={styles.identityInfo}>
						<h3 className={styles.displayName}>{displayName}</h3>
						<div className={styles.badgeRow}>
							<span
								className={`${styles.memberBadge} ${user.isPremium ? styles.premiumBadge : styles.freeBadge}`}
							>
								{user.isPremium ? (
									<>
										<Crown size={11} strokeWidth={2.5} />
										{t("premium_plan")}
									</>
								) : (
									<>
										<Sparkles size={11} strokeWidth={2.5} />
										{t("free_plan")}
									</>
								)}
							</span>
							{user.age && (
								<span className={styles.metaTag}>
									{user.age} {t("years_short")}
								</span>
							)}
							{user.gender && (
								<span className={styles.metaTag}>{user.gender}</span>
							)}
						</div>

						{(user.medicalConditions.length > 0 ||
							(user.isWalletConnected && user.walletAddress)) && (
							<div className={styles.metaRow}>
								{user.medicalConditions.length > 0 && (
									<span className={`${styles.metaTag} ${styles.conditionTag}`}>
										<AlertCircle size={10} strokeWidth={2.5} />
										{user.medicalConditions.length}{" "}
										{t("profile_alerts")}
									</span>
								)}
								{user.isWalletConnected && user.walletAddress && (
									<span className={`${styles.metaTag} ${styles.walletTag}`}>
										<Wallet size={10} strokeWidth={2.5} />
										{user.walletAddress.slice(0, 6)}...
										{user.walletAddress.slice(-4)}
									</span>
								)}
							</div>
						)}
					</div>
				</div>

				<div className={styles.sectionHeader}>
					<span>{t("profile_body_metrics")}</span>
					{!editing && (
						<button
							type="button"
							className={styles.sectionAction}
							onClick={openEdit}
						>
							<Pencil size={12} strokeWidth={2.5} />
							{t("update_profile")}
						</button>
					)}
				</div>

				{editing ? (
					<div className={styles.editPanel}>
						<p className={styles.editPanelTitle}>
							<Pencil size={14} strokeWidth={2.25} />
							{t("edit_metrics")}
						</p>

						<div className={styles.inputGroup}>
							<label className={styles.inputLabel}>
								<Ruler size={14} strokeWidth={2.25} />
								{t("height")}
							</label>
							<div className={styles.inputRow}>
								<input
									type="number"
									min="50"
									max="300"
									placeholder="175"
									className={styles.metricInput}
									value={draft.height}
									onChange={(e) =>
										setDraft((d) => ({ ...d, height: e.target.value }))
									}
								/>
								<span className={styles.inputUnit}>cm</span>
							</div>
						</div>

						<div className={styles.inputGroup}>
							<label className={styles.inputLabel}>
								<Scale size={14} strokeWidth={2.25} />
								{t("weight")}
							</label>
							<div className={styles.inputRow}>
								<input
									type="number"
									min="10"
									max="500"
									placeholder="72"
									className={styles.metricInput}
									value={draft.weight}
									onChange={(e) =>
										setDraft((d) => ({ ...d, weight: e.target.value }))
									}
								/>
								<span className={styles.inputUnit}>kg</span>
							</div>
						</div>

						{draftBmi !== null && draftBmiInfo && (
							<div
								className={styles.bmiPreview}
								style={{ borderColor: `${draftBmiInfo.color}30` }}
							>
								<Activity size={14} strokeWidth={2.25} color={draftBmiInfo.color} />
								<span className={styles.bmiPreviewLabel}>BMI</span>
								<span
									className={styles.bmiPreviewValue}
									style={{ color: draftBmiInfo.color }}
								>
									{draftBmi.toFixed(1)}
								</span>
								<span className={`${styles.bmiBadge} ${styles[draftBmiInfo.cls]}`}>
									{draftBmiInfo.label}
								</span>
							</div>
						)}

						<div className={styles.editActions}>
							<button
								type="button"
								className={styles.cancelBtn}
								onClick={cancelEdit}
							>
								{t("cancel")}
							</button>
							<button type="button" className={styles.saveBtn} onClick={saveEdit}>
								<Check size={14} strokeWidth={2.75} />
								{t("save")}
							</button>
						</div>
					</div>
				) : (
					<div className={styles.vitalsGrid}>
						<button
							type="button"
							className={`${styles.vitalCard} ${!user.height ? styles.isEmpty : ""}`}
							onClick={openEdit}
						>
							<div className={styles.vitalIcon}>
								<Ruler size={17} strokeWidth={2.25} />
							</div>
							<div className={styles.vitalData}>
								{user.height ? (
									<>
										<span className={styles.vitalValue}>{user.height}</span>
										<span className={styles.vitalUnit}>cm</span>
									</>
								) : (
									<span className={styles.vitalPlaceholder}>—</span>
								)}
							</div>
							<span className={styles.vitalLabel}>{t("height")}</span>
							{!user.height && (
								<span className={styles.addHint}>
									<Plus size={9} strokeWidth={3} />
									{t("add_metric")}
								</span>
							)}
						</button>

						<button
							type="button"
							className={`${styles.vitalCard} ${!user.weight ? styles.isEmpty : ""}`}
							onClick={openEdit}
						>
							<div className={styles.vitalIcon}>
								<Scale size={17} strokeWidth={2.25} />
							</div>
							<div className={styles.vitalData}>
								{user.weight ? (
									<>
										<span className={styles.vitalValue}>{user.weight}</span>
										<span className={styles.vitalUnit}>kg</span>
									</>
								) : (
									<span className={styles.vitalPlaceholder}>—</span>
								)}
							</div>
							<span className={styles.vitalLabel}>{t("weight")}</span>
							{!user.weight && (
								<span className={styles.addHint}>
									<Plus size={9} strokeWidth={3} />
									{t("add_metric")}
								</span>
							)}
						</button>

						<button
							type="button"
							className={`${styles.vitalCard} ${!bmi ? styles.isEmpty : ""}`}
							onClick={openEdit}
							title={
								bmi
									? t("bmi_auto_hint")
									: t("profile_hint_body_metrics")
							}
						>
							{bmi !== null && bmiInfo ? (
								<>
									<div
										className={styles.vitalIcon}
										style={{ color: bmiInfo.color }}
									>
										<Activity size={17} strokeWidth={2.25} />
									</div>
									<div className={styles.vitalData}>
										<span className={styles.vitalValue}>{bmi.toFixed(1)}</span>
										<span className={`${styles.bmiBadge} ${styles[bmiInfo.cls]}`}>
											{bmiInfo.label}
										</span>
									</div>
									<span className={styles.vitalLabel}>{t("bmi_label")}</span>
								</>
							) : (
								<>
									<div className={styles.vitalIcon}>
										<Activity size={17} strokeWidth={2.25} />
									</div>
									<div className={styles.vitalData}>
										<span className={styles.vitalPlaceholder}>—</span>
									</div>
									<span className={styles.vitalLabel}>{t("bmi_label")}</span>
									<span className={styles.addHint}>{t("bmi_auto")}</span>
								</>
							)}
						</button>
					</div>
				)}

				{!editing && (
					<div className={styles.completenessCard}>
						<div className={styles.completenessCopy}>
							<div className={styles.completenessBar}>
								<div
									className={styles.completenessProgress}
									style={{ width: `${completeness}%` }}
								/>
							</div>
							<p className={styles.completenessText}>
								{t("profile_complete", { n: completeness })}
							</p>
							<p className={styles.completenessHint}>{completenessHint}</p>
						</div>
						<button
							type="button"
							className={styles.updateBtn}
							onClick={openEdit}
						>
							<Pencil size={13} strokeWidth={2.5} />
							{t("update_profile")}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
