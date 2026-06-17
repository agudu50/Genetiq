import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	X,
	Settings,
	User,
	Ruler,
	Activity,
	Droplets,
	Check,
	Sparkles,
	ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import { RootState } from "@/App/Redux/store";
import { updateUserInfo } from "@/App/Redux/userSlice";
import { LocalVault } from "@/App/Services/LocalVault";
import { useLanguage } from "@/App/i18n/LanguageContext";
import styles from "./AccountSettingsModal.module.scss";

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const BLOOD_OPTIONS = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−", "Unknown"];

type ProfileDraft = {
	firstName: string;
	lastName: string;
	age: string;
	gender: string;
	height: string;
	weight: string;
	bloodType: string;
};

interface AccountSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const AccountSettingsModal = ({ isOpen, onClose }: AccountSettingsModalProps) => {
	const dispatch = useDispatch();
	const { t } = useLanguage();
	const user = useSelector((state: RootState) => state.user);
	const [draft, setDraft] = useState<ProfileDraft>({
		firstName: "",
		lastName: "",
		age: "",
		gender: "",
		height: "",
		weight: "",
		bloodType: "",
	});

	useEffect(() => {
		if (!isOpen) return;

		setDraft({
			firstName: user.firstName || "",
			lastName: user.lastName || "",
			age: user.age || "",
			gender: user.gender || "",
			height: user.height || "",
			weight: user.weight || "",
			bloodType: user.bloodType || "",
		});
	}, [isOpen, user]);

	useEffect(() => {
		if (!isOpen) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [isOpen, onClose]);

	const draftBmi = useMemo(() => {
		const h = Number(draft.height);
		const w = Number(draft.weight);
		if (!h || !w) return null;
		return w / ((h / 100) * (h / 100));
	}, [draft.height, draft.weight]);

	const completeness = useMemo(() => {
		const fields = [
			draft.firstName,
			draft.lastName,
			draft.age,
			draft.gender,
			draft.height,
			draft.weight,
			draft.bloodType,
		];
		return Math.round((fields.filter(Boolean).length / fields.length) * 100);
	}, [draft]);

	const getBmiCategory = (val: number) => {
		if (val < 18.5) return { label: t("bmi_low"), cls: "underweight" };
		if (val < 25) return { label: t("bmi_normal"), cls: "normal" };
		if (val < 30) return { label: t("bmi_high"), cls: "overweight" };
		return { label: t("bmi_obese"), cls: "obese" };
	};

	const bmiInfo = draftBmi ? getBmiCategory(draftBmi) : null;

	if (!isOpen) return null;

	const setField =
		(field: keyof ProfileDraft) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			setDraft((prev) => ({ ...prev, [field]: e.target.value }));
		};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const trimmed = {
			firstName: draft.firstName.trim(),
			lastName: draft.lastName.trim(),
			age: draft.age.trim(),
			gender: draft.gender,
			height: draft.height.trim(),
			weight: draft.weight.trim(),
			bloodType: draft.bloodType,
		};

		dispatch(updateUserInfo(trimmed));
		await LocalVault.saveProfile(trimmed);
		toast.success(t("account_settings_saved"));
		onClose();
	};

	return ReactDOM.createPortal(
		<div className={styles.overlay} onClick={onClose} role="presentation">
			<div
				className={styles.modal}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="account-settings-title"
			>
				<div className={styles.heroBg} aria-hidden />
				<div className={styles.heroMesh} aria-hidden />
				<div className={styles.accentStripe} />

				<header className={styles.header}>
					<div className={styles.headerText}>
						<div className={styles.iconBadge}>
							<Settings size={18} strokeWidth={2.25} />
						</div>
						<div className={styles.headerCopy}>
							<div className={styles.headerTop}>
								<p className={styles.eyebrow}>{t("profile_eyebrow")}</p>
								<span className={styles.completenessPill}>
									<Sparkles size={11} strokeWidth={2.5} />
									{completeness}%
								</span>
							</div>
							<h2 id="account-settings-title" className={styles.title}>
								{t("account_settings_title")}
							</h2>
							<p className={styles.subtitle}>{t("account_settings_subtitle")}</p>
						</div>
					</div>
					<button
						type="button"
						className={styles.closeBtn}
						onClick={onClose}
						aria-label={t("close")}
					>
						<X size={18} />
					</button>
				</header>

				<form className={styles.form} onSubmit={handleSubmit}>
					<section className={styles.section}>
						<h3 className={styles.sectionTitle}>
							<User size={14} strokeWidth={2.25} />
							{t("account_section_personal")}
						</h3>
						<div className={styles.row}>
							<label className={styles.field}>
								<span>{t("first_name")}</span>
								<div className={styles.inputWrap}>
									<input
										type="text"
										value={draft.firstName}
										onChange={setField("firstName")}
										placeholder={t("first_name_placeholder")}
										autoComplete="given-name"
									/>
								</div>
							</label>
							<label className={styles.field}>
								<span>{t("last_name")}</span>
								<div className={styles.inputWrap}>
									<input
										type="text"
										value={draft.lastName}
										onChange={setField("lastName")}
										placeholder={t("last_name_placeholder")}
										autoComplete="family-name"
									/>
								</div>
							</label>
						</div>

						<div className={styles.row}>
							<label className={styles.field}>
								<span>{t("age_label")}</span>
								<div className={styles.inputWrap}>
									<input
										type="number"
										min="1"
										max="120"
										value={draft.age}
										onChange={setField("age")}
										placeholder={t("age_placeholder")}
									/>
									<span className={styles.inputSuffix}>{t("years_short")}</span>
								</div>
							</label>
							<label className={styles.field}>
								<span>{t("gender_label")}</span>
								<div className={`${styles.inputWrap} ${styles.selectWrap}`}>
									<select value={draft.gender} onChange={setField("gender")}>
										<option value="">{t("select_option")}</option>
										{GENDER_OPTIONS.map((option) => (
											<option key={option} value={option}>
												{option}
											</option>
										))}
									</select>
									<ChevronDown
										className={styles.selectChevron}
										size={16}
										strokeWidth={2.25}
										aria-hidden
									/>
								</div>
							</label>
						</div>
					</section>

					<section className={styles.section}>
						<h3 className={styles.sectionTitle}>
							<Ruler size={14} strokeWidth={2.25} />
							{t("profile_body_metrics")}
						</h3>
						<div className={styles.row}>
							<label className={styles.field}>
								<span>{t("height")}</span>
								<div className={styles.inputWrap}>
									<input
										type="number"
										min="50"
										max="300"
										value={draft.height}
										onChange={setField("height")}
										placeholder="175"
									/>
									<span className={styles.inputSuffix}>cm</span>
								</div>
							</label>
							<label className={styles.field}>
								<span>{t("weight")}</span>
								<div className={styles.inputWrap}>
									<input
										type="number"
										min="10"
										max="500"
										value={draft.weight}
										onChange={setField("weight")}
										placeholder="72"
									/>
									<span className={styles.inputSuffix}>kg</span>
								</div>
							</label>
						</div>

						{draftBmi !== null && bmiInfo && (
							<div className={styles.bmiPreview}>
								<Activity size={15} strokeWidth={2.25} />
								<span className={styles.bmiPreviewLabel}>{t("bmi_label")}</span>
								<span className={styles.bmiPreviewValue}>
									{draftBmi.toFixed(1)}
								</span>
								<span className={`${styles.bmiBadge} ${styles[bmiInfo.cls]}`}>
									{bmiInfo.label}
								</span>
							</div>
						)}
					</section>

					<section className={styles.section}>
						<h3 className={styles.sectionTitle}>
							<Droplets size={14} strokeWidth={2.25} />
							{t("account_section_health")}
						</h3>
						<label className={styles.field}>
							<span>{t("blood_type_label")}</span>
							<div className={`${styles.inputWrap} ${styles.selectWrap}`}>
								<select value={draft.bloodType} onChange={setField("bloodType")}>
									<option value="">{t("select_option")}</option>
									{BLOOD_OPTIONS.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
								<ChevronDown
									className={styles.selectChevron}
									size={16}
									strokeWidth={2.25}
									aria-hidden
								/>
							</div>
						</label>
					</section>

					<div className={styles.completenessBar}>
						<div
							className={styles.completenessProgress}
							style={{ width: `${completeness}%` }}
						/>
					</div>
					<p className={styles.completenessText}>
						{t("profile_complete", { n: completeness })}
					</p>

					<div className={styles.actions}>
						<button type="button" className={styles.cancelBtn} onClick={onClose}>
							{t("cancel")}
						</button>
						<button type="submit" className={styles.saveBtn}>
							<Check size={15} strokeWidth={2.75} />
							{t("save_changes")}
						</button>
					</div>
				</form>
			</div>
		</div>,
		document.body,
	);
};
