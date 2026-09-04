import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { paths } from "@/App/Routes/Paths";
import { toast } from "react-toastify";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Stethoscope, Building2 } from "lucide-react";
import { AUTH_KEYS } from "@/App/Services/AuthCredentials";
import { setAccountType, setDoctorProfile, updateUserInfo } from "@/App/Redux/userSlice";
import styles from "./RegisterForm.module.scss";

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

const getStrength = (pw: string) => {
	if (pw.length === 0) return { width: "0%", color: "transparent", label: "" };
	if (pw.length < 6)   return { width: "33%", color: "#ef4444", label: "Weak" };
	if (pw.length < 10)  return { width: "66%", color: "#f59e0b", label: "Fair" };
	return { width: "100%", color: "#10b981", label: "Strong" };
};

export const RegisterForm = ({ animate = false }: { animate?: boolean }) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [role, setRole] = useState<"patient" | "doctor">("patient");
	const [name, setName] = useState("");
	const [hospitalName, setHospitalName] = useState("");
	const [department, setDepartment] = useState("Cardiology");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [agreeTerms, setAgreeTerms] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Ensure password state is never retained across mounts or unmounts
	useEffect(() => {
		setPassword("");
		setConfirmPassword("");
		setShowPassword(false);
		setShowConfirm(false);
		return () => {
			setPassword("");
			setConfirmPassword("");
			setShowPassword(false);
			setShowConfirm(false);
		};
	}, []);

	const strength = getStrength(password);

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			toast.error("Passwords don't match");
			return;
		}
		if (password.length < 6) {
			toast.error("Password must be at least 6 characters.");
			return;
		}

		setIsLoading(true);
		// Instantly wipe memory password state upon submission - no password is stored
		setPassword("");
		setConfirmPassword("");
		setShowPassword(false);
		setShowConfirm(false);
		localStorage.removeItem(AUTH_KEYS.CREDENTIALS);

		localStorage.setItem(AUTH_KEYS.EMAIL, email);
		localStorage.setItem("genetiq.accountType", role);

		dispatch(setAccountType(role));
		if (role === "doctor") {
			dispatch(
				setDoctorProfile({
					doctorName: name.startsWith("Dr.") ? name : `Dr. ${name}`,
					hospitalName: hospitalName.trim() || "Metropolitan Health Center",
					department: department || "Cardiology & Internal Medicine",
					title: "Attending Physician",
				}),
			);
		} else {
			const nameParts = name.trim().split(" ");
			dispatch(
				updateUserInfo({
					firstName: nameParts[0] || "",
					lastName: nameParts.slice(1).join(" ") || "",
				}),
			);
		}

		await new Promise((r) => setTimeout(r, 600));
		setIsLoading(false);

		if (role === "doctor") {
			toast.success("Welcome to Genetiq Clinical Portal!");
			navigate(paths.clinical);
		} else {
			toast.success("Welcome to Genetiq!");
			navigate(paths.config.root);
		}
	};

	const handleOAuth = (provider: string) => {
		toast.info(`${provider} coming soon!`);
	};

	return (
		<div className={`${styles.formWrap} ${animate ? styles.formIn : ""}`}>
			<div className={styles.heading}>
				<h1 className={styles.title}>Create your account</h1>
				<p className={styles.subtitle}>Choose your account type to get started</p>

				<div className={styles.roleSwitch}>
					<button
						type='button'
						className={`${styles.roleTab} ${role === "patient" ? styles.roleTabActive : ""}`}
						onClick={() => {
							setRole("patient");
							setPassword("");
							setConfirmPassword("");
							setShowPassword(false);
							setShowConfirm(false);
						}}
					>
						<User size={15} /> Patient / Individual
					</button>
					<button
						type='button'
						className={`${styles.roleTab} ${role === "doctor" ? styles.roleTabActive : ""}`}
						onClick={() => {
							setRole("doctor");
							setPassword("");
							setConfirmPassword("");
							setShowPassword(false);
							setShowConfirm(false);
						}}
					>
						<Stethoscope size={15} /> Doctor / Clinician
					</button>
				</div>
			</div>

			<form className={styles.form} onSubmit={handleRegister} autoComplete='off'>
				<div className={styles.field}>
					<label htmlFor='reg-name'>{role === "doctor" ? "Doctor full name" : "Full name"}</label>
					<div className={styles.inputWrap}>
						{role === "doctor" ? (
							<Stethoscope size={16} className={styles.inputIcon} />
						) : (
							<User size={16} className={styles.inputIcon} />
						)}
						<input
							id='reg-name'
							type='text'
							placeholder={role === "doctor" ? "e.g. Dr. Robert Chen, MD" : "Your name"}
							value={name}
							onChange={(e) => setName(e.target.value)}
							autoComplete='name'
							required
						/>
					</div>
				</div>

				{role === "doctor" && (
					<>
						<div className={styles.field}>
							<label htmlFor='reg-hospital'>Hospital / Clinic affiliation</label>
							<div className={styles.inputWrap}>
								<Building2 size={16} className={styles.inputIcon} />
								<input
									id='reg-hospital'
									type='text'
									placeholder='e.g. Metropolitan Medical Center'
									value={hospitalName}
									onChange={(e) => setHospitalName(e.target.value)}
									required
								/>
							</div>
						</div>

						<div className={styles.field}>
							<label htmlFor='reg-dept'>Specialty / Department</label>
							<div className={styles.inputWrap}>
								<Stethoscope size={16} className={styles.inputIcon} />
								<input
									id='reg-dept'
									type='text'
									placeholder='e.g. Cardiology & Internal Medicine'
									value={department}
									onChange={(e) => setDepartment(e.target.value)}
									required
								/>
							</div>
						</div>
					</>
				)}

				<div className={styles.field}>
					<label htmlFor='reg-email'>{role === "doctor" ? "Hospital / Work email" : "Email address"}</label>
					<div className={styles.inputWrap}>
						<Mail size={16} className={styles.inputIcon} />
						<input
							id='reg-email'
							type='email'
							placeholder={role === "doctor" ? "dr.name@hospital.org" : "name@example.com"}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							autoComplete='email'
							required
						/>
					</div>
				</div>

				<div className={styles.field}>
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
					{password.length > 0 && (
						<div className={styles.strengthRow}>
							<div className={styles.strengthBar}>
								<div
									className={styles.strengthFill}
									style={{ width: strength.width, background: strength.color }}
								/>
							</div>
							<span className={styles.strengthLabel} style={{ color: strength.color }}>
								{strength.label}
							</span>
						</div>
					)}
				</div>

				<div className={styles.field}>
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
					{confirmPassword.length > 0 && password !== confirmPassword && (
						<span className={styles.errorMsg}>Passwords don't match</span>
					)}
				</div>

				<label className={styles.checkRow}>
					<input type='checkbox' checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} required />
					<span className={styles.checkBox} />
					<span className={styles.checkLabel}>
						I agree to the{" "}
						<a href={paths.terms} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
							Terms of Service
						</a>
						{" "}and{" "}
						<a href={paths.privacy} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
							Privacy Policy
						</a>
					</span>
				</label>

				<button type='submit' className={styles.submitBtn} disabled={isLoading}>
					{isLoading ? (
						<span className={styles.spinner} />
					) : (
						<>
							Create Free Account <ArrowRight size={16} className={styles.submitArrow} />
						</>
					)}
				</button>
			</form>

			<div className={styles.oauthDivider}>
				<span>or continue with</span>
			</div>

			<div className={styles.oauthIcons}>
				<button className={styles.oauthIcon} onClick={() => handleOAuth("Google")} type='button' aria-label='Sign up with Google'>
					<GoogleIcon />
				</button>
				<button className={styles.oauthIcon} onClick={() => handleOAuth("Apple")} type='button' aria-label='Sign up with Apple'>
					<AppleIcon />
				</button>
			</div>

			<p className={styles.switchPrompt}>
				Already have an account?{" "}
				<button type='button' onClick={() => navigate(paths.auth.login)}>Sign in</button>
			</p>
		</div>
	);
};
