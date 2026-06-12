import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";
import { toast } from "react-toastify";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { AUTH_KEYS, AuthCredentials } from "@/App/Services/AuthCredentials";
import styles from "./LoginForm.module.scss";

// ─── OAuth provider icons (inline SVG) ───────────────────────────────────────

const GoogleIcon = () => (
	<svg width='22' height='22' viewBox='0 0 24 24' fill='none'>
		<path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4' />
		<path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853' />
		<path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z' fill='#FBBC05' />
		<path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335' />
	</svg>
);

const AppleIcon = () => (
	<svg width='22' height='22' viewBox='0 0 24 24' fill='currentColor'>
		<path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
	</svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const LoginForm = ({ animate = false }: { animate?: boolean }) => {
	const navigate = useNavigate();

	// Restore saved email & remember preference from a previous "keep me signed in"
	const savedEmail    = localStorage.getItem(AUTH_KEYS.EMAIL) ?? "";
	const savedRemember = localStorage.getItem(AUTH_KEYS.REMEMBER) === "true";

	const [email, setEmail]               = useState(savedEmail);
	const [password, setPassword]         = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe]     = useState(savedRemember);
	const [isLoading, setIsLoading]       = useState(false);

	// Auto-redirect if a persistent session already exists
	useEffect(() => {
		if (localStorage.getItem(AUTH_KEYS.SESSION) === "active") {
			navigate(paths.config.root, { replace: true });
		}
	}, []);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		const hasStoredPassword = await AuthCredentials.hasPassword();
		if (hasStoredPassword) {
			const isValid = await AuthCredentials.verify(email, password);
			if (!isValid) {
				setIsLoading(false);
				toast.error("Incorrect email or password.");
				return;
			}
		}

		await new Promise((r) => setTimeout(r, 1500));
		setIsLoading(false);

		if (rememberMe) {
			localStorage.setItem(AUTH_KEYS.SESSION, "active");
			localStorage.setItem(AUTH_KEYS.EMAIL, email);
			localStorage.setItem(AUTH_KEYS.REMEMBER, "true");
			toast.success("You'll stay signed in across sessions!");
		} else {
			localStorage.removeItem(AUTH_KEYS.SESSION);
			localStorage.removeItem(AUTH_KEYS.EMAIL);
			localStorage.removeItem(AUTH_KEYS.REMEMBER);
			sessionStorage.setItem(AUTH_KEYS.SESSION, "active");
			toast.success("Welcome back to Genetiq!");
		}

		navigate(paths.config.root);
	};

	const handleOAuth = (provider: string) => {
		toast.info(`${provider} coming soon!`);
	};

	return (
		<div className={`${styles.formWrap} ${animate ? styles.formIn : ""}`}>
			{/* Heading */}
			<div className={styles.heading}>
				<h1 className={styles.title}>Welcome back</h1>
				<p className={styles.subtitle}>Sign in to your Genetiq account</p>
			</div>

			{/* Email/Password form */}
			<form className={styles.form} onSubmit={handleLogin}>
				<div className={styles.field}>
					<label htmlFor='login-email'>Email address</label>
					<div className={styles.inputWrap}>
						<Mail size={16} className={styles.inputIcon} />
						<input
							id='login-email'
							type='email'
							placeholder='name@example.com'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							autoComplete='email'
							required
						/>
					</div>
				</div>

				<div className={styles.field}>
					<div className={styles.labelRow}>
						<label htmlFor='login-password'>Password</label>
						<a href='#' className={styles.forgotLink}>Forgot password?</a>
					</div>
					<div className={styles.inputWrap}>
						<Lock size={16} className={styles.inputIcon} />
						<input
							id='login-password'
							type={showPassword ? "text" : "password"}
							placeholder='••••••••'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							autoComplete='current-password'
							required
						/>
						<button
							type='button'
							className={styles.eyeBtn}
							onClick={() => setShowPassword(!showPassword)}
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
						</button>
					</div>
				</div>

				<label className={styles.checkRow}>
					<input
						type='checkbox'
						checked={rememberMe}
						onChange={(e) => setRememberMe(e.target.checked)}
					/>
					<span className={styles.checkBox} />
					<span className={styles.checkLabel}>Keep me signed in</span>
				</label>

				<button
					type='submit'
					className={styles.submitBtn}
					disabled={isLoading}
				>
					{isLoading ? (
						<span className={styles.spinner} />
					) : (
						<>Sign In <ArrowRight size={16} className={styles.submitArrow} /></>
					)}
				</button>
			</form>

			{/* OAuth icon-only buttons — bottom */}
			<div className={styles.oauthDivider}>
				<span>or continue with</span>
			</div>
			<div className={styles.oauthIcons}>
				<button className={styles.oauthIcon} onClick={() => handleOAuth("Google")} type='button' aria-label='Sign in with Google'>
					<GoogleIcon />
				</button>
				<button className={styles.oauthIcon} onClick={() => handleOAuth("Apple")} type='button' aria-label='Sign in with Apple'>
					<AppleIcon />
				</button>
			</div>

			<p className={styles.switchPrompt}>
				Don't have an account?{" "}
				<button type='button' onClick={() => navigate(paths.auth.register)}>
					Create one free
				</button>
			</p>
		</div>
	);
};
