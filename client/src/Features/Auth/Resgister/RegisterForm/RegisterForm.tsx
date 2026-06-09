import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { paths } from "@/App/Routes/Paths";
import { toast } from "react-toastify";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import styles from "./RegisterForm.module.scss";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
	hidden: { opacity: 0, y: 20 },
	visible: (delay: number) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: EASE, delay },
	}),
};

const fieldReveal = {
	hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
	visible: (delay: number) => ({
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 0.45, ease: EASE, delay },
	}),
};

const oauthReveal = {
	hidden: { opacity: 0, scale: 0.85 },
	visible: (delay: number) => ({
		opacity: 1,
		scale: 1,
		transition: { type: "spring", stiffness: 320, damping: 22, delay },
	}),
};

// ─── OAuth icons ──────────────────────────────────────────────────────────────

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

// ─── Password strength ────────────────────────────────────────────────────────

const getStrength = (pw: string) => {
	if (pw.length === 0) return { width: "0%", color: "transparent", label: "" };
	if (pw.length < 6)   return { width: "33%", color: "#ef4444", label: "Weak" };
	if (pw.length < 10)  return { width: "66%", color: "#f59e0b", label: "Fair" };
	return { width: "100%", color: "#10b981", label: "Strong" };
};

type RegisterFormProps = {
	reduceMotion?: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const RegisterForm = ({ reduceMotion = false }: RegisterFormProps) => {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [agreeTerms, setAgreeTerms] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const strength = getStrength(password);
	const motionProps = reduceMotion
		? { initial: false as const, animate: undefined }
		: { initial: "hidden" as const, animate: "visible" as const };

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			toast.error("Passwords don't match");
			return;
		}
		setIsLoading(true);
		await new Promise((r) => setTimeout(r, 1500));
		setIsLoading(false);
		navigate(paths.config.root);
		toast.success("Welcome to Genetiq!");
	};

	const handleOAuth = (provider: string) => {
		toast.info(`${provider} coming soon!`);
	};

	const fieldDelays = [0.18, 0.26, 0.34, 0.42];

	return (
		<div className={styles.formWrap}>
			<motion.div
				className={styles.heading}
				variants={fadeUp}
				custom={0.12}
				{...motionProps}
			>
				<h1 className={styles.title}>Create your account</h1>
				<p className={styles.subtitle}>Free forever · No credit card needed</p>
			</motion.div>

			<form className={styles.form} onSubmit={handleRegister}>
				<motion.div className={styles.field} variants={fieldReveal} custom={fieldDelays[0]} {...motionProps}>
					<label htmlFor='reg-name'>Full name</label>
					<div className={styles.inputWrap}>
						<User size={16} className={styles.inputIcon} />
						<input
							id='reg-name'
							type='text'
							placeholder='Your name'
							value={name}
							onChange={(e) => setName(e.target.value)}
							autoComplete='name'
							required
						/>
					</div>
				</motion.div>

				<motion.div className={styles.field} variants={fieldReveal} custom={fieldDelays[1]} {...motionProps}>
					<label htmlFor='reg-email'>Email address</label>
					<div className={styles.inputWrap}>
						<Mail size={16} className={styles.inputIcon} />
						<input
							id='reg-email'
							type='email'
							placeholder='name@example.com'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							autoComplete='email'
							required
						/>
					</div>
				</motion.div>

				<motion.div className={styles.field} variants={fieldReveal} custom={fieldDelays[2]} {...motionProps}>
					<label htmlFor='reg-password'>Password</label>
					<div className={styles.inputWrap}>
						<Lock size={16} className={styles.inputIcon} />
						<input
							id='reg-password'
							type={showPassword ? "text" : "password"}
							placeholder='Min. 8 characters'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							autoComplete='new-password'
							required
						/>
						<button type='button' className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
							{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
						</button>
					</div>
					<AnimatePresence>
						{password.length > 0 && (
							<motion.div
								className={styles.strengthRow}
								initial={reduceMotion ? false : { opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
								transition={{ duration: 0.25, ease: EASE }}
							>
								<div className={styles.strengthBar}>
									<motion.div
										className={styles.strengthFill}
										animate={{ width: strength.width, background: strength.color }}
										transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: EASE }}
									/>
								</div>
								<motion.span
									className={styles.strengthLabel}
									key={strength.label}
									initial={reduceMotion ? false : { opacity: 0, y: 4 }}
									animate={{ opacity: 1, y: 0, color: strength.color }}
									transition={{ duration: 0.2 }}
								>
									{strength.label}
								</motion.span>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>

				<motion.div className={styles.field} variants={fieldReveal} custom={fieldDelays[3]} {...motionProps}>
					<label htmlFor='reg-confirm'>Confirm password</label>
					<div className={styles.inputWrap}>
						<Lock size={16} className={styles.inputIcon} />
						<input
							id='reg-confirm'
							type={showConfirm ? "text" : "password"}
							placeholder='Repeat your password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							autoComplete='new-password'
							required
						/>
						<button type='button' className={styles.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
							{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
						</button>
					</div>
					<AnimatePresence>
						{confirmPassword.length > 0 && password !== confirmPassword && (
							<motion.span
								className={styles.errorMsg}
								initial={reduceMotion ? false : { opacity: 0, y: -4 }}
								animate={{ opacity: 1, y: 0 }}
								exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
								transition={{ duration: 0.2 }}
							>
								Passwords don't match
							</motion.span>
						)}
					</AnimatePresence>
				</motion.div>

				<motion.label
					className={styles.checkRow}
					variants={fieldReveal}
					custom={0.5}
					{...motionProps}
				>
					<input type='checkbox' checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} required />
					<span className={styles.checkBox} />
					<span className={styles.checkLabel}>
						I agree to the{" "}
						<a
							href={paths.terms}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
						>
							Terms of Service
						</a>
						{" "}and{" "}
						<a
							href={paths.privacy}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
						>
							Privacy Policy
						</a>
					</span>
				</motion.label>

				<motion.button
					type='submit'
					className={styles.submitBtn}
					disabled={isLoading}
					variants={fieldReveal}
					custom={0.58}
					{...motionProps}
					whileHover={reduceMotion || isLoading ? undefined : { scale: 1.01, y: -1 }}
					whileTap={reduceMotion || isLoading ? undefined : { scale: 0.99 }}
				>
					{isLoading ? (
						<span className={styles.spinner} />
					) : (
						<>
							Create Free Account
							<motion.span
								animate={reduceMotion ? undefined : { x: [0, 4, 0] }}
								transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
							>
								<ArrowRight size={16} />
							</motion.span>
						</>
					)}
				</motion.button>
			</form>

			<motion.div
				className={styles.oauthDivider}
				variants={fadeUp}
				custom={0.66}
				{...motionProps}
			>
				<span>or continue with</span>
			</motion.div>

			<div className={styles.oauthIcons}>
				{[
					{ label: "Sign up with Google", icon: <GoogleIcon />, provider: "Google" },
					{ label: "Sign up with Apple", icon: <AppleIcon />, provider: "Apple" },
				].map((item, i) => (
					<motion.button
						key={item.provider}
						className={styles.oauthIcon}
						onClick={() => handleOAuth(item.provider)}
						type='button'
						aria-label={item.label}
						variants={oauthReveal}
						custom={0.72 + i * 0.08}
						{...motionProps}
						whileHover={reduceMotion ? undefined : { y: -3, scale: 1.04 }}
						whileTap={reduceMotion ? undefined : { scale: 0.96 }}
					>
						{item.icon}
					</motion.button>
				))}
			</div>

			<motion.p
				className={styles.switchPrompt}
				variants={fadeUp}
				custom={0.82}
				{...motionProps}
			>
				Already have an account?{" "}
				<button type='button' onClick={() => navigate(paths.auth.login)}>Sign in</button>
			</motion.p>
		</div>
	);
};
