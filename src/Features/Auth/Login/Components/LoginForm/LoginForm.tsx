import { useState } from "react";
import styles from "./LoginForm.module.scss";
import PasswordHidden from "@assets/Auth/PasswordHidden.svg?react";
import { useNavigate } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { WalletConnectButton } from "@/Features/Auth/Components/WalletConnectButton/WalletConnectButton";

export const LoginForm = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [hidePassword, setHidePassword] = useState(true);
	const [rememberMe, setRememberMe] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async () => {
		setIsLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setIsLoading(false);

		navigate(paths.config.root);
		toast.success("Welcome back to Genetiq!");
	};

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
						<span className='text-gradient-muted'>Welcome</span>{" "}
						<span className='text-gradient-primary'>back</span>
					</h1>
					<p className={styles.subtitle}>
						Connect your wallet or sign in to continue
					</p>
				</div>

				<WalletConnectButton mode='login' />

				<div className={styles.divider}>
					<span>or continue with email</span>
				</div>

				<form
					className={styles.form}
					onSubmit={(e) => {
						e.preventDefault();
						handleLogin();
					}}
				>
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
						<label htmlFor='password'>Password</label>
						<div className={styles.inputWrapper}>
							<Lock className={styles.inputIcon} size={20} />
							<input
								id='password'
								type={hidePassword ? "password" : "text"}
								placeholder='••••••••'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete='current-password'
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
					</div>

					<div className={styles.options}>
						<label className={styles.rememberMe}>
							<input
								type='checkbox'
								checked={rememberMe}
								onChange={(e) => setRememberMe(e.target.checked)}
							/>
							<span className={styles.checkmark}></span>
							<span>Remember me</span>
						</label>
						<a href='#' className={styles.forgotPassword}>
							Forgot password?
						</a>
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
								<span>Sign In to Genetiq</span>
								<ArrowRight size={20} />
							</>
						)}
					</button>
				</form>

				<p className={styles.signupPrompt}>
					New to Genetiq?
					<button type='button' onClick={() => navigate(paths.auth.register)}>
						Create an account
					</button>
				</p>
			</motion.div>
		</div>
	);
};
