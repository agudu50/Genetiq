import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Eye, EyeOff, Shield, X } from "lucide-react";
import { toast } from "react-toastify";
import { AUTH_KEYS, AuthCredentials } from "@/App/Services/AuthCredentials";
import styles from "./PasswordSecurityModal.module.scss";

const getStrength = (password: string) => {
	if (password.length === 0) return { width: "0%", color: "transparent", label: "" };
	if (password.length < 6) return { width: "33%", color: "#ef4444", label: "Weak" };
	if (password.length < 10) return { width: "66%", color: "#f59e0b", label: "Fair" };
	return { width: "100%", color: "#10b981", label: "Strong" };
};

interface PasswordSecurityModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const PasswordSecurityModal = ({ isOpen, onClose }: PasswordSecurityModalProps) => {
	const [accountEmail, setAccountEmail] = useState("");
	const [hasPassword, setHasPassword] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

	const passwordStrength = getStrength(newPassword);

	useEffect(() => {
		if (!isOpen) return;

		const loadCredentials = async () => {
			const stored = await AuthCredentials.get();
			const rememberedEmail = localStorage.getItem(AUTH_KEYS.EMAIL) ?? "";
			setAccountEmail(stored?.email ?? rememberedEmail);
			setHasPassword(Boolean(stored?.passwordHash));
		};

		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setShowCurrentPassword(false);
		setShowNewPassword(false);
		loadCredentials();
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const handlePasswordUpdate = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword.length < 6) {
			toast.error("New password must be at least 6 characters.");
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error("New passwords do not match.");
			return;
		}

		setIsUpdatingPassword(true);

		const isUpdatingExisting = hasPassword;
		const result = isUpdatingExisting
			? await AuthCredentials.updatePassword(currentPassword, newPassword)
			: await AuthCredentials.createPassword(accountEmail, newPassword);

		setIsUpdatingPassword(false);

		if (!result.ok) {
			toast.error(result.error);
			return;
		}

		setHasPassword(true);
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		toast.success(
			isUpdatingExisting
				? "Password updated successfully."
				: "Password created successfully.",
		);
		onClose();
	};

	return ReactDOM.createPortal(
		<div className={styles.overlay} onClick={onClose} role="presentation">
			<div
				className={styles.modal}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="password-security-title"
			>
				<div className={styles.accentStripe} />

				<header className={styles.header}>
					<div className={styles.headerText}>
						<div className={styles.iconBadge}>
							<Shield size={18} />
						</div>
						<div>
							<p className={styles.eyebrow}>Security</p>
							<h2 id="password-security-title" className={styles.title}>
								Password &amp; security
							</h2>
							<p className={styles.subtitle}>
								{hasPassword
									? "Update your sign-in password. It is stored securely on this device."
									: "Create a password to protect your account on this device."}
							</p>
						</div>
					</div>
					<button
						type="button"
						className={styles.closeBtn}
						onClick={onClose}
						aria-label="Close password settings"
					>
						<X size={18} />
					</button>
				</header>

				<form className={styles.form} onSubmit={handlePasswordUpdate}>
					<label className={styles.field}>
						<span>Account email</span>
						<input
							type="email"
							value={accountEmail}
							onChange={(e) => setAccountEmail(e.target.value)}
							placeholder="name@example.com"
							autoComplete="email"
							readOnly={hasPassword}
							className={hasPassword ? styles.readOnlyInput : undefined}
						/>
					</label>

					{hasPassword && (
						<label className={styles.field}>
							<span>Current password</span>
							<div className={styles.passwordWrap}>
								<input
									type={showCurrentPassword ? "text" : "password"}
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									placeholder="Enter current password"
									autoComplete="current-password"
									required
								/>
								<button
									type="button"
									className={styles.eyeBtn}
									onClick={() => setShowCurrentPassword((v) => !v)}
									aria-label={showCurrentPassword ? "Hide password" : "Show password"}
								>
									{showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>
						</label>
					)}

					<label className={styles.field}>
						<span>{hasPassword ? "New password" : "Password"}</span>
						<div className={styles.passwordWrap}>
							<input
								type={showNewPassword ? "text" : "password"}
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder="At least 6 characters"
								autoComplete="new-password"
								required
							/>
							<button
								type="button"
								className={styles.eyeBtn}
								onClick={() => setShowNewPassword((v) => !v)}
								aria-label={showNewPassword ? "Hide password" : "Show password"}
							>
								{showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
					</label>

					{newPassword.length > 0 && (
						<div className={styles.strengthRow}>
							<div className={styles.strengthTrack}>
								<div
									className={styles.strengthFill}
									style={{
										width: passwordStrength.width,
										backgroundColor: passwordStrength.color,
									}}
								/>
							</div>
							<span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
						</div>
					)}

					<label className={styles.field}>
						<span>Confirm password</span>
						<input
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Repeat new password"
							autoComplete="new-password"
							required
						/>
					</label>

					<div className={styles.actions}>
						<button type="button" className={styles.cancelBtn} onClick={onClose}>
							Cancel
						</button>
						<button type="submit" className={styles.saveBtn} disabled={isUpdatingPassword}>
							{isUpdatingPassword
								? "Saving..."
								: hasPassword
									? "Update password"
									: "Create password"}
						</button>
					</div>
				</form>
			</div>
		</div>,
		document.body,
	);
};
