import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { RootState } from "@/App/Redux/store";
import { updateUserInfo } from "@/App/Redux/userSlice";
import { LocalVault } from "@/App/Services/LocalVault";
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
		toast.success("Account settings saved");
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
				<div className={styles.accentStripe} />

				<header className={styles.header}>
					<div>
						<p className={styles.eyebrow}>Profile</p>
						<h2 id="account-settings-title" className={styles.title}>
							Account Settings
						</h2>
					</div>
					<button
						type="button"
						className={styles.closeBtn}
						onClick={onClose}
						aria-label="Close account settings"
					>
						<X size={18} />
					</button>
				</header>

				<form className={styles.form} onSubmit={handleSubmit}>
					<div className={styles.row}>
						<label className={styles.field}>
							<span>First name</span>
							<input
								type="text"
								value={draft.firstName}
								onChange={setField("firstName")}
								placeholder="First name"
								autoComplete="given-name"
							/>
						</label>
						<label className={styles.field}>
							<span>Last name</span>
							<input
								type="text"
								value={draft.lastName}
								onChange={setField("lastName")}
								placeholder="Last name"
								autoComplete="family-name"
							/>
						</label>
					</div>

					<div className={styles.row}>
						<label className={styles.field}>
							<span>Age</span>
							<input
								type="number"
								min="1"
								max="120"
								value={draft.age}
								onChange={setField("age")}
								placeholder="e.g. 34"
							/>
						</label>
						<label className={styles.field}>
							<span>Gender</span>
							<select value={draft.gender} onChange={setField("gender")}>
								<option value="">Select</option>
								{GENDER_OPTIONS.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</label>
					</div>

					<div className={styles.row}>
						<label className={styles.field}>
							<span>Height (cm)</span>
							<input
								type="number"
								min="50"
								max="300"
								value={draft.height}
								onChange={setField("height")}
								placeholder="e.g. 175"
							/>
						</label>
						<label className={styles.field}>
							<span>Weight (kg)</span>
							<input
								type="number"
								min="10"
								max="500"
								value={draft.weight}
								onChange={setField("weight")}
								placeholder="e.g. 72"
							/>
						</label>
					</div>

					<label className={styles.field}>
						<span>Blood type</span>
						<select value={draft.bloodType} onChange={setField("bloodType")}>
							<option value="">Select</option>
							{BLOOD_OPTIONS.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</label>

					<div className={styles.actions}>
						<button type="button" className={styles.cancelBtn} onClick={onClose}>
							Cancel
						</button>
						<button type="submit" className={styles.saveBtn}>
							Save changes
						</button>
					</div>
				</form>
			</div>
		</div>,
		document.body,
	);
};
