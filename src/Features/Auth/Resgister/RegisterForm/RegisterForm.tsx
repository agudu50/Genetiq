import { useState } from "react";
import styles from "./RegisterForm.module.scss";
import PasswordHidden from "@assets/Auth/PasswordHidden.svg?react";
import { useNavigate } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { WalletConnectButton } from "@/Features/Auth/Components/WalletConnectButton/WalletConnectButton";

export const RegisterForm = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [hidePassword, setHidePassword] = useState(true);
	const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
	const [agreeTerms, setAgreeTerms] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		setIsLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setIsLoading(false);

		navigate(paths.config.root);
		toast.success("Welcome to the longevity revolution!");
	};

	const passwordStrength = () => {
		if (password.length === 0)
			return { width: "0%", color: "#e5e7eb", text: "" };
		if (password.length < 6)
			return { width: "33%", color: "#ef4444", text: "Weak" };
		if (password.length < 10)
			return { width: "66%", color: "#f59e0b", text: "Medium" };
		return { width: "100%", color: "#10b981", text: "Strong" };
	};

	const strength = passwordStrength();

	return (
		<div className={styles.authContainer}>
			<motion.div
				className={styles.formCard}
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
			>
				<div className={styles.header}>
					<h1 className={styles.title}>
						<span className='text-gradient-muted'>Create</span>{" "}
						<span className='text-gradient-primary'>account</span>
					</h1>
					<p className={styles.subtitle}>
						Connect your wallet or sign up with email
					</p>
				</div>

				<WalletConnectButton mode='register' />

				<div className={styles.divider}>
					<span>or continue with email</span>
				</div>

				<form className={styles.form} onSubmit={handleRegister}>
					<div className={styles.inputGroup}>
						<label htmlFor='email'>Email Address</label>
						<div className={styles.inputWrapper}>
							<Mail className={styles.inputIcon} size={20} />
							<input
								id='email'
								type='email'
								placeholder='name@example.com'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								autoComplete='email'
								required
							/>
						</div>
					</div>

					<div className={styles.inputGroup}>
						<label htmlFor='password'>Create Password</label>
						<div className={styles.inputWrapper}>
							<Lock className={styles.inputIcon} size={20} />
							<input
								id='password'
								type={hidePassword ? "password" : "text"}
								placeholder='Min. 8 characters'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete='new-password'
								required
							/>
							<button
								type='button'
								className={styles.togglePassword}
								onClick={() => setHidePassword(!hidePassword)}
							>
								<PasswordHidden />
							</button>
						</div>
						{password.length > 0 && (
							<div className={styles.passwordStrength}>
								<div className={styles.strengthBar}>
									<div
										className={styles.strengthFill}
										style={{
											width: strength.width,
											backgroundColor: strength.color,
										}}
									></div>
								</div>
								<span style={{ color: strength.color }}>{strength.text}</span>
							</div>
						)}
					</div>

					<div className={styles.inputGroup}>
						<label htmlFor='confirmPassword'>Confirm Password</label>
						<div className={styles.inputWrapper}>
							<Lock className={styles.inputIcon} size={20} />
							<input
								id='confirmPassword'
								type={hideConfirmPassword ? "password" : "text"}
								placeholder='Verify your password'
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								autoComplete='new-password'
								required
							/>
							<button
								type='button'
								className={styles.togglePassword}
								onClick={() => setHideConfirmPassword(!hideConfirmPassword)}
							>
								<PasswordHidden />
							</button>
						</div>
						{confirmPassword.length > 0 && password !== confirmPassword && (
							<span className={styles.errorText}>Passwords do not match</span>
						)}
					</div>

					<div className={styles.termsWrapper}>
						<label className={styles.checkbox}>
							<input
								type='checkbox'
								checked={agreeTerms}
								onChange={(e) => setAgreeTerms(e.target.checked)}
								required
							/>
							<span className={styles.checkmark}></span>
							<span className={styles.termsText}>
								I agree to the <a href='#'>Terms of Service</a> and{" "}
								<a href='#'>Privacy Policy</a>
							</span>
						</label>
					</div>

					<button
						type='submit'
						className={`${styles.submitBtn} ${isLoading ? styles.loading : ""}`}
						disabled={isLoading}
					>
						{isLoading ? (
							<div className={styles.spinner}></div>
						) : (
							<>
								<span>Create Free Account</span>
								<ArrowRight size={20} />
							</>
						)}
					</button>
				</form>

				<p className={styles.loginPrompt}>
					Already using Genetiq?
					<button type='button' onClick={() => navigate(paths.auth.login)}>
						Sign in
					</button>
				</p>
			</motion.div>
		</div>
	);
};
