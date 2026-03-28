import { useState, useMemo } from "react";
import styles from "./ImportOrUpload.module.scss";
import { ConfirmModal } from "@/Features/Onboarding/ConfirmModal/ConfirmModal";
import { UploadFiles } from "@/Features/Onboarding/Upload/Components/UploadFiles/UploadFiles";
import { UploadProcess } from "@/Features/Onboarding/Upload/Components/UploadProcess/UploadProcess";
import { SuccessModal } from "@/Features/Onboarding/SuccessModal/SuccessModal";
import { useDispatch } from "react-redux";
import { updateUserInfo } from "@/App/Redux/userSlice";

// Icons and Constants (moved from UploadFiles if needed)
const conditionOptions = [
	"Diabetes",
	"Hypertension",
	"Asthma",
	"Heart Disease",
	"Other",
];
const symptomOptions = [
	"Headache",
	"Fever",
	"Fatigue",
	"Chest Pain",
	"Shortness of Breath",
	"Other",
];
const alcoholOptions = [
	"None",
	"Occasional",
	"Weekly",
	"Daily",
	"Prefer not to say",
];
const exerciseOptions = [
	"None",
	"1-2 times/week",
	"3-4 times/week",
	"5+ times/week",
	"Prefer not to say",
];
const dietOptions = [
	"Balanced",
	"Vegetarian",
	"Vegan",
	"Keto",
	"Mediterranean",
	"Other",
];
const smokingOptions = [
	"Non-smoker",
	"Occasional",
	"Regular",
	"Former smoker",
	"Prefer not to say",
];

const FileTextIcon = () => (
	<svg
		width='22'
		height='22'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' />
		<polyline points='14 2 14 8 20 8' />
		<line x1='16' y1='13' x2='8' y2='13' />
		<line x1='16' y1='17' x2='8' y2='17' />
		<line x1='10' y1='9' x2='8' y2='9' />
	</svg>
);

const ShieldCheckIcon = () => (
	<svg
		width='22'
		height='22'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
		<path d='m9 12 2 2 4-4' />
	</svg>
);

const ZapIcon = () => (
	<svg
		width='22'
		height='22'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2' />
	</svg>
);

const LightbulbIcon = () => (
	<svg
		width='22'
		height='22'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5' />
		<path d='M9 18h6' />
		<path d='M10 22h4' />
	</svg>
);

const UploadCloudIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' />
		<path d='M12 12v9' />
		<path d='m16 16-4-4-4 4' />
	</svg>
);

const SearchIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<circle cx='11' cy='11' r='8' />
		<path d='m21 21-4.3-4.3' />
	</svg>
);

const SparklesIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' />
		<path d='M5 3v4' />
		<path d='M19 17v4' />
		<path d='M3 5h4' />
		<path d='M17 19h4' />
	</svg>
);

const UserIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
		<circle cx='12' cy='7' r='4' />
	</svg>
);

const GenderIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<circle cx='9' cy='12' r='1' />
		<circle cx='15' cy='12' r='1' />
		<path d='M10 20h4' />
		<path d='M12 18v2' />
		<circle cx='12' cy='12' r='10' />
	</svg>
);

const AlcoholIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M10 21h4' />
		<path d='M12 15v6' />
		<path d='M12 15c-3.3 0-6-2.7-6-6v-1h12v1c0 3.3-2.7 6-6 6z' />
		<path d='M8 4h8' />
	</svg>
);

const ExerciseIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<circle cx='12' cy='5' r='2' />
		<path d='M6 7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z' />
		<path d='m2 20 5-5' />
		<path d='m17 15 5 5' />
		<path d='m12 11 0 6' />
		<path d='m10 17h4' />
	</svg>
);

const DietIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2' />
		<path d='M7 2v11' />
		<path d='M17 2v18' />
		<path d='M21 2c0 2.2-1.8 4-4 4' />
	</svg>
);

const SmokingIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M18 12H2' />
		<path d='M22 12h-2' />
		<path d='M18 8v8' />
		<path d='M7 12V8' />
		<path d='M10 12V8' />
		<path d='M13 12V8' />
	</svg>
);

const TrashIcon = () => (
	<svg
		width='18'
		height='18'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
		style={{ display: "block" }}
	>
		<path d='M3 6h18' />
		<path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' />
		<path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' />
		<line x1='10' y1='11' x2='10' y2='17' />
		<line x1='14' y1='11' x2='14' y2='17' />
	</svg>
);

const PlusIcon = () => (
	<svg
		width='18'
		height='18'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M5 12h14' />
		<path d='M12 5v14' />
	</svg>
);

const ImportOrUpload = () => {
	const dispatch = useDispatch();
	const [step, setStep] = useState<
		"personal" | "upload" | "processing" | "success"
	>("personal");

	const [personalInfo, setPersonalInfo] = useState({
		firstName: "",
		lastName: "",
		age: "",
		gender: "",
		height: "",
		weight: "",
		medicalConditions: [] as string[],
		medicalOther: "",
		medications: [{ name: "", dosage: "", frequency: "" }],
		symptoms: [] as string[],
		symptomsOther: "",
		lifestyle: {
			smoking: "",
			alcohol: "",
			exercise: "",
			diet: "",
		},
		bloodType: "",
		allergies: [] as string[],
		clinicalHistory: "",
	});

	const [uploadedFiles, setUploadedFiles] = useState<
		{ file: File; isUploading: boolean; type: string; progress: number }[]
	>([]);
	const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [isOpenedConfirmModal, setIsOpenedConfirmModal] =
		useState<boolean>(false);
	const [isSuccess, setIsSuccess] = useState<boolean>(false);

	const isUploading = uploadedFiles.some((item) => item.isUploading);

	const bmiInfo = useMemo(() => {
		const h = Number(personalInfo.height);
		const w = Number(personalInfo.weight);
		if (!h || !w) return { value: "—", category: "", class: "" };
		const val = w / ((h / 100) * (h / 100));
		const value = val.toFixed(1);
		let category = "";
		let categoryClass = "";

		if (val < 18.5) {
			category = "Underweight";
			categoryClass = styles["bmi-underweight"];
		} else if (val < 25) {
			category = "Normal";
			categoryClass = styles["bmi-normal"];
		} else if (val < 30) {
			category = "Overweight";
			categoryClass = styles["bmi-overweight"];
		} else {
			category = "Obese";
			categoryClass = styles["bmi-obese"];
		}

		return { value, category, class: categoryClass };
	}, [personalInfo.height, personalInfo.weight]);

	const handleFileChange = (files: FileList, type: string) => {
		const newFiles = Array.from(files).map((file) => ({
			file,
			isUploading: false,
			progress: 0,
			type,
		}));
		setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);
	};

	const handleUploadStart = (file: File) => {
		setUploadedFiles((prevFiles) =>
			prevFiles.map((item) =>
				item.file === file ? { ...item, isUploading: true } : item,
			),
		);
		let progress = 0;
		const interval = setInterval(() => {
			progress += 10;
			setUploadedFiles((prevFiles) =>
				prevFiles.map((item) =>
					item.file === file
						? { ...item, progress: Math.min(progress, 100) }
						: item,
				),
			);
			if (progress >= 100) {
				clearInterval(interval);
				handleUploadComplete(file);
			}
		}, 500);
	};

	const handleUploadComplete = (file: File) => {
		setUploadedFiles((prevFiles) =>
			prevFiles.map((item) =>
				item.file === file ? { ...item, isUploading: false } : item,
			),
		);
	};

	const handleFileRemove = (file: File) => {
		setUploadedFiles((prevFiles) =>
			prevFiles.filter((item) => item.file !== file),
		);
	};

	const handleConfirm = () => {
		setIsConfirmed(true);
		setStep("processing");
		setIsProcessing(true);
		setIsOpenedConfirmModal(false);
		window.scrollTo({ top: 0, behavior: "instant" });

		// Derive biological age and update Redux
		const derivedBiologicalAge = (Number(personalInfo.age) - 1.5).toFixed(1);
		dispatch(
			updateUserInfo({
				...personalInfo,
				biologicalAge: derivedBiologicalAge,
				uploadStatus: "processing",
			}),
		);

		// Simulate completion
		setTimeout(() => {
			dispatch(updateUserInfo({ uploadStatus: "completed" }));
		}, 3000);
	};

	const handlePersonalSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (personalInfo.firstName && personalInfo.lastName) {
			dispatch(updateUserInfo(personalInfo));
			setStep("upload");
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const toggleCondition = (cond: string) => {
		setPersonalInfo((prev) => ({
			...prev,
			medicalConditions: prev.medicalConditions.includes(cond)
				? prev.medicalConditions.filter((c) => c !== cond)
				: [...prev.medicalConditions, cond],
		}));
	};

	const toggleSymptom = (sym: string) => {
		setPersonalInfo((prev) => ({
			...prev,
			symptoms: prev.symptoms.includes(sym)
				? prev.symptoms.filter((s) => s !== sym)
				: [...prev.symptoms, sym],
		}));
	};

	const addMedication = () => {
		setPersonalInfo((prev) => ({
			...prev,
			medications: [
				...prev.medications,
				{ name: "", dosage: "", frequency: "" },
			],
		}));
	};

	const removeMedication = (idx: number) => {
		setPersonalInfo((prev) => ({
			...prev,
			medications: prev.medications.filter((_, i) => i !== idx),
		}));
	};

	const updateMedication = (idx: number, field: string, val: string) => {
		setPersonalInfo((prev) => ({
			...prev,
			medications: prev.medications.map((m, i) =>
				i === idx ? { ...m, [field]: val } : m,
			),
		}));
	};

	return (
		<div
			className={`${styles["import-upload-container"]} ${step === "processing" ? styles["processing-state"] : ""}`}
		>
			{step !== "processing" && (
				<div className={styles["page-header"]}>
					<div className={styles["hero"]}>
						<div className={styles["hero-badge-wrapper"]}>
							<span className={styles["hero-badge"]}>
								<span className={styles["badge-dot"]} />
								{step === "personal" ? "Getting Started" : "Data Import"}
							</span>
						</div>
						<h1 className={styles["hero-title"]}>
							{step === "personal" ? (
								<>
									<span className='text-gradient-muted'>Tell us about</span>{" "}
									<span className='text-gradient-primary'>Yourself</span>
								</>
							) : (
								<>
									<span className='text-gradient-muted'>Welcome,</span>{" "}
									<span className='text-gradient-primary'>
										{personalInfo.firstName || "Friend"}
									</span>
								</>
							)}
						</h1>
						<p className={styles["hero-subtitle"]}>
							{step === "personal"
								? "To provide personalized health insights, we need a few basic details about you."
								: "Let's start by importing your health data. This will help us create your personalized longevity plan."}
						</p>
					</div>

					{step === "upload" && (
						<div className={styles["hero-meta"]}>
							<div className={styles["meta-card"]}>
								<div className={styles["meta-icon-box"]}>
									<FileTextIcon />
								</div>
								<div>
									<div className={styles["meta-title"]}>Supported formats</div>
									<div className={styles["meta-text"]}>
										PDF, CSV, JPG, PNG, and most lab exports
									</div>
								</div>
							</div>
							<div className={styles["meta-card"]}>
								<div
									className={`${styles["meta-icon-box"]} ${styles["meta-icon-green"]}`}
								>
									<ShieldCheckIcon />
								</div>
								<div>
									<div className={styles["meta-title"]}>Secure and private</div>
									<div className={styles["meta-text"]}>
										Encrypted in transit and at rest with strict access controls
									</div>
								</div>
							</div>
							<div className={styles["meta-card"]}>
								<div
									className={`${styles["meta-icon-box"]} ${styles["meta-icon-amber"]}`}
								>
									<ZapIcon />
								</div>
								<div>
									<div className={styles["meta-title"]}>Fast processing</div>
									<div className={styles["meta-text"]}>
										Most files are analyzed in a few minutes
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{step === "personal" && (
				<div className={styles["personal-form-container"]}>
					<form
						className={styles["personal-form-card"]}
						onSubmit={handlePersonalSubmit}
					>
						<div className={styles["form-section"]}>
							<div className={styles["section-header"]}>
								<div className={styles["section-title"]}>Basic Information</div>
								<div className={styles["section-subtitle"]}>
									We use this to personalize your insights.
								</div>
							</div>
							<div className={styles["form-grid"]}>
								<div className={styles["input-group"]}>
									<label>First Name</label>
									<div className={styles["input-wrapper"]}>
										<UserIcon />
										<input
											type='text'
											placeholder='Enter first name'
											value={personalInfo.firstName}
											onChange={(e) =>
												setPersonalInfo({
													...personalInfo,
													firstName: e.target.value,
												})
											}
											required
										/>
									</div>
								</div>
								<div className={styles["input-group"]}>
									<label>Last Name</label>
									<div className={styles["input-wrapper"]}>
										<UserIcon />
										<input
											type='text'
											placeholder='Enter last name'
											value={personalInfo.lastName}
											onChange={(e) =>
												setPersonalInfo({
													...personalInfo,
													lastName: e.target.value,
												})
											}
											required
										/>
									</div>
								</div>
								<div className={styles["input-group"]}>
									<label>Age</label>
									<div className={styles["input-wrapper"]}>
										<svg
											width='20'
											height='20'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<circle cx='12' cy='12' r='10' />
											<polyline points='12 6 12 12 16 14' />
										</svg>
										<input
											type='number'
											inputMode='numeric'
											pattern='[0-9]*'
											min='1'
											placeholder='Years'
											value={personalInfo.age}
											onChange={(e) => {
												const val = e.target.value;
												if (val === "" || Number(val) > 0) {
													setPersonalInfo({ ...personalInfo, age: val });
												}
											}}
										/>
									</div>
								</div>
								<div className={styles["input-group"]}>
									<label>Gender</label>
									<div className={styles["input-wrapper"]}>
										<GenderIcon />
										<select
											className={styles["form-select"]}
											value={personalInfo.gender}
											onChange={(e) =>
												setPersonalInfo({
													...personalInfo,
													gender: e.target.value,
												})
											}
										>
											<option value='' disabled hidden>
												Select Gender
											</option>
											<option value='male'>Male</option>
											<option value='female'>Female</option>
											<option value='other'>Other</option>
											<option value='prefer-not'>Prefer not to say</option>
										</select>
									</div>
								</div>
								<div className={styles["input-group"]}>
									<label>Height (cm)</label>
									<div className={styles["input-wrapper"]}>
										<svg
											width='20'
											height='20'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<path d='m21 21-4.3-4.3' />
											<path d='M9.5 7v10' />
											<path d='M5.5 9h8' />
											<path d='M5.5 15h8' />
										</svg>
										<input
											type='number'
											inputMode='numeric'
											pattern='[0-9]*'
											min='1'
											placeholder='e.g. 170'
											value={personalInfo.height}
											onChange={(e) => {
												const val = e.target.value;
												if (val === "" || Number(val) > 0) {
													setPersonalInfo({ ...personalInfo, height: val });
												}
											}}
										/>
									</div>
								</div>
								<div className={styles["input-group"]}>
									<label>Weight (kg)</label>
									<div className={styles["input-wrapper"]}>
										<svg
											width='20'
											height='20'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<path d='M7 20h10' />
											<path d='M10 4v16' />
											<path d='M14 4v16' />
											<path d='M2 8h20' />
											<path d='M2 12h20' />
											<path d='M2 16h20' />
										</svg>
										<input
											type='number'
											inputMode='numeric'
											pattern='[0-9]*'
											min='1'
											placeholder='e.g. 70'
											value={personalInfo.weight}
											onChange={(e) => {
												const val = e.target.value;
												if (val === "" || Number(val) > 0) {
													setPersonalInfo({ ...personalInfo, weight: val });
												}
											}}
										/>
									</div>
								</div>
								<div className={styles["input-group"]}>
									<label>BMI</label>
									<div className={styles["input-wrapper"]}>
										<input type='text' value={bmiInfo.value} readOnly />
										{bmiInfo.category && (
											<span
												className={`${styles["bmi-badge"]} ${bmiInfo.class}`}
											>
												{bmiInfo.category}
											</span>
										)}
									</div>
									<div className={styles["field-note"]}>
										Calculated from height & weight.
									</div>
								</div>
							</div>
						</div>

						<div className={styles["form-section"]}>
							<div className={styles["section-header"]}>
								<div className={styles["section-title"]}>
									Medical Conditions
								</div>
								<div className={styles["section-subtitle"]}>
									Select any medical conditions you have been diagnosed with.
								</div>
							</div>
							<div className={styles["checkbox-grid"]}>
								{conditionOptions.map((opt) => (
									<label
										key={opt}
										className={`${styles["checkbox-label"]} ${personalInfo.medicalConditions.includes(opt) ? styles["checked"] : ""}`}
									>
										<input
											type='checkbox'
											checked={personalInfo.medicalConditions.includes(opt)}
											onChange={() => toggleCondition(opt)}
										/>
										<div className={styles["checkbox-dot"]} />
										<span>{opt}</span>
									</label>
								))}
							</div>
						</div>

						<div className={styles["form-section"]}>
							<div className={styles["section-header"]}>
								<div className={styles["section-title"]}>Clinical Intake</div>
								<div className={styles["section-subtitle"]}>
									Standard doctor-relevant information.
								</div>
							</div>
							<div className={styles["form-grid"]}>
								<div className={styles["input-group"]}>
									<label>Blood Type</label>
									<div className={styles["input-wrapper"]}>
										<svg
											width='20'
											height='20'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
										</svg>
										<select
											className={styles["form-select"]}
											value={personalInfo.bloodType}
											onChange={(e) =>
												setPersonalInfo({
													...personalInfo,
													bloodType: e.target.value,
												})
											}
										>
											<option value='' disabled hidden>
												Select Type
											</option>
											<option value='A+'>A+</option>
											<option value='A-'>A-</option>
											<option value='B+'>B+</option>
											<option value='B-'>B-</option>
											<option value='AB+'>AB+</option>
											<option value='AB-'>AB-</option>
											<option value='O+'>O+</option>
											<option value='O-'>O-</option>
											<option value='Unknown'>I don't know</option>
										</select>
									</div>
								</div>
								<div className={styles["input-group"]}>
									<label>Known Allergies</label>
									<div className={styles["input-wrapper"]}>
										<svg
											width='20'
											height='20'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
										</svg>
										<input
											type='text'
											placeholder='e.g. Penicillin, Peanuts (comma separated)'
											value={personalInfo.allergies.join(", ")}
											onChange={(e) =>
												setPersonalInfo({
													...personalInfo,
													allergies: e.target.value
														.split(",")
														.map((s) => s.trim())
														.filter(Boolean),
												})
											}
										/>
									</div>
								</div>
							</div>
							<div className={styles["input-group"]} style={{ marginTop: 12 }}>
								<label>Past Surgeries & Family History</label>
								<textarea
									className={styles["form-textarea"]}
									placeholder='Any major surgeries, hospitalizations, or notable family history of diseases...'
									value={personalInfo.clinicalHistory}
									onChange={(e) =>
										setPersonalInfo({
											...personalInfo,
											clinicalHistory: e.target.value,
										})
									}
								/>
							</div>
						</div>

						<div className={styles["form-section"]}>
							<div className={styles["section-header"]}>
								<div className={styles["section-title"]}>Medications</div>
								<div className={styles["section-subtitle"]}>
									Add the medications you take regularly.
								</div>
							</div>
							<div className={styles["medications-list"]}>
								{personalInfo.medications.map((med, idx) => (
									<div key={idx} className={styles["medication-row"]}>
										<div className={styles["input-group"]}>
											<label>Drug name</label>
											<input
												type='text'
												placeholder='e.g. Metformin'
												value={med.name}
												onChange={(e) =>
													updateMedication(idx, "name", e.target.value)
												}
												className={styles["form-input-simple"]}
											/>
										</div>
										<div className={styles["input-group"]}>
											<label>Dosage</label>
											<input
												type='text'
												placeholder='e.g. 500mg'
												value={med.dosage}
												onChange={(e) =>
													updateMedication(idx, "dosage", e.target.value)
												}
												className={styles["form-input-simple"]}
											/>
										</div>
										<div className={styles["input-group"]}>
											<label>Frequency</label>
											<input
												type='text'
												placeholder='e.g. Twice daily'
												value={med.frequency}
												onChange={(e) =>
													updateMedication(idx, "frequency", e.target.value)
												}
												className={styles["form-input-simple"]}
											/>
										</div>
										{personalInfo.medications.length > 1 && (
											<button
												type='button'
												onClick={() => removeMedication(idx)}
												className={styles["remove-med-btn"]}
											>
												<TrashIcon />
											</button>
										)}
									</div>
								))}
								<button
									type='button'
									onClick={addMedication}
									className={styles["add-med-btn"]}
								>
									<PlusIcon /> Add another medication
								</button>
							</div>
						</div>

						<div className={styles["form-section"]}>
							<div className={styles["section-header"]}>
								<div className={styles["section-title"]}>Symptoms</div>
								<div className={styles["section-subtitle"]}>
									Select any symptoms you’re experiencing.
								</div>
							</div>
							<div className={styles["checkbox-grid"]}>
								{symptomOptions.map((opt) => (
									<label
										key={opt}
										className={`${styles["checkbox-label"]} ${personalInfo.symptoms.includes(opt) ? styles["checked"] : ""}`}
									>
										<input
											type='checkbox'
											checked={personalInfo.symptoms.includes(opt)}
											onChange={() => toggleSymptom(opt)}
										/>
										<div className={styles["checkbox-dot"]} />
										<span>{opt}</span>
									</label>
								))}
							</div>
						</div>

						<div className={styles["form-section"]}>
							<div className={styles["section-header"]}>
								<div className={styles["section-title"]}>Lifestyle</div>
								<div className={styles["section-subtitle"]}>
									Help us understand your daily habits.
								</div>
							</div>
							<div className={styles["form-grid"]}>
								<div className={styles["input-group"]}>
									<label>Smoking</label>
									<div className={styles["input-wrapper"]}>
										<SmokingIcon />
										<select
											className={styles["form-select"]}
											value={personalInfo.lifestyle.smoking}
											onChange={(e) =>
												setPersonalInfo({
													...personalInfo,
													lifestyle: {
														...personalInfo.lifestyle,
														smoking: e.target.value,
													},
												})
											}
										>
											<option value='' disabled hidden>
												Select
											</option>
											{smokingOptions.map((opt) => (
												<option key={opt} value={opt}>
													{opt}
												</option>
											))}
										</select>
									</div>
								</div>
								<div className={styles["input-group"]}>
									<label>Alcohol</label>
									<div className={styles["input-wrapper"]}>
										<AlcoholIcon />
										<select
											className={styles["form-select"]}
											value={personalInfo.lifestyle.alcohol}
											onChange={(e) =>
												setPersonalInfo({
													...personalInfo,
													lifestyle: {
														...personalInfo.lifestyle,
														alcohol: e.target.value,
													},
												})
											}
										>
											<option value='' disabled hidden>
												Select
											</option>
											{alcoholOptions.map((opt) => (
												<option key={opt} value={opt}>
													{opt}
												</option>
											))}
										</select>
									</div>
								</div>
								<div className={styles["input-group"]}>
									<label>Exercise</label>
									<div className={styles["input-wrapper"]}>
										<ExerciseIcon />
										<select
											className={styles["form-select"]}
											value={personalInfo.lifestyle.exercise}
											onChange={(e) =>
												setPersonalInfo({
													...personalInfo,
													lifestyle: {
														...personalInfo.lifestyle,
														exercise: e.target.value,
													},
												})
											}
										>
											<option value='' disabled hidden>
												Select
											</option>
											{exerciseOptions.map((opt) => (
												<option key={opt} value={opt}>
													{opt}
												</option>
											))}
										</select>
									</div>
								</div>
								<div className={styles["input-group"]}>
									<label>Diet</label>
									<div className={styles["input-wrapper"]}>
										<DietIcon />
										<select
											className={styles["form-select"]}
											value={personalInfo.lifestyle.diet}
											onChange={(e) =>
												setPersonalInfo({
													...personalInfo,
													lifestyle: {
														...personalInfo.lifestyle,
														diet: e.target.value,
													},
												})
											}
										>
											<option value='' disabled hidden>
												Select
											</option>
											{dietOptions.map((opt) => (
												<option key={opt} value={opt}>
													{opt}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
						</div>

						<button type='submit' className={styles["continue-btn"]}>
							Submit health data
							<ZapIcon />
						</button>
					</form>
				</div>
			)}

			{step === "upload" && (
				<div className={styles["steps"]}>
					<div className={styles["step-card"]}>
						<div className={styles["step-icon-wrapper"]}>
							<UploadCloudIcon />
						</div>
						<div className={styles["step-number"]}>01</div>
						<div className={styles["step-title"]}>Upload or import</div>
						<div className={styles["step-text"]}>
							Add lab results, medical records, or device exports.
						</div>
					</div>
					<div className={styles["step-card"]}>
						<div className={styles["step-icon-wrapper"]}>
							<SearchIcon />
						</div>
						<div className={styles["step-number"]}>02</div>
						<div className={styles["step-title"]}>We organize it</div>
						<div className={styles["step-text"]}>
							We detect key biomarkers and structure the data.
						</div>
					</div>
					<div className={styles["step-card"]}>
						<div className={styles["step-icon-wrapper"]}>
							<SparklesIcon />
						</div>
						<div className={styles["step-number"]}>03</div>
						<div className={styles["step-title"]}>Get insights</div>
						<div className={styles["step-text"]}>
							Receive personalized recommendations and next steps.
						</div>
					</div>
				</div>
			)}

			{step === "processing" ? (
				<UploadProcess
					setIsProcessing={setIsProcessing}
					onComplete={() => {
						setIsSuccess(true);
						setStep("success");
					}}
				/>
			) : (
				step === "upload" && (
					<UploadFiles
						uploadedFiles={uploadedFiles}
						isConfirmed={isConfirmed}
						isUploading={isUploading}
						isProcessing={isProcessing}
						setIsOpenedConfirmModal={setIsOpenedConfirmModal}
						onFileChange={handleFileChange}
						onUploadStart={handleUploadStart}
						onUploadComplete={handleUploadComplete}
						onFileRemove={handleFileRemove}
					/>
				)
			)}
			<div className={styles["help-panel"]}>
				<div className={styles["help-panel-inner"]}>
					<div className={styles["help-icon-box"]}>
						<LightbulbIcon />
					</div>
					<div>
						<div className={styles["help-title"]}>
							Need help choosing files?
						</div>
						<div className={styles["help-text"]}>
							Start with your latest lab report or a summary from your doctor.
							You can add more files later.
						</div>
					</div>
				</div>
			</div>
			{isOpenedConfirmModal && (
				<ConfirmModal
					onClose={() => setIsOpenedConfirmModal(false)}
					onConfirm={handleConfirm}
				/>
			)}
			{isSuccess && <SuccessModal onClose={() => setIsSuccess(false)} />}
		</div>
	);
};

export default ImportOrUpload;
