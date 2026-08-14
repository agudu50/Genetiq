import React, { useState } from "react";
import ReactDOM from "react-dom";
import {
	X,
	Stethoscope,
	Video,
	Phone,
	MessageSquare,
	ShieldCheck,
	CheckCircle2,
	Calendar as CalendarIcon,
	Sparkles,
} from "lucide-react";
import { useLanguage } from "@/App/i18n/LanguageContext";
import styles from "./PhysicianConsultModal.module.scss";

interface PhysicianConsultModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const SPECIALISTS = [
	{
		id: "gp",
		name: "Dr. Kwame Mensah",
		role: "General Physician & Telehealth",
		initials: "KM",
	},
	{
		id: "hematology",
		name: "Dr. Abena Osei",
		role: "Clinical Hematologist",
		initials: "AO",
	},
	{
		id: "genetics",
		name: "Dr. Kofi Annan",
		role: "Geneticist & Bio-consultant",
		initials: "KA",
	},
	{
		id: "nutrition",
		name: "Akosua Addo, MSc",
		role: "Clinical Dietitian & Nutritionist",
		initials: "AA",
	},
];

const MODES = [
	{ id: "video", label: "Video Call", icon: Video },
	{ id: "audio", label: "Audio Phone", icon: Phone },
	{ id: "chat", label: "AI Consultation", icon: MessageSquare },
];

const TIME_SLOTS = [
	"Today, 3:00 PM",
	"Today, 5:30 PM",
	"Tomorrow, 10:00 AM",
	"Tomorrow, 2:15 PM",
];

export const PhysicianConsultModal: React.FC<PhysicianConsultModalProps> = ({
	isOpen,
	onClose,
}) => {
	const { t } = useLanguage();
	const [selectedSpecialist, setSelectedSpecialist] = useState(SPECIALISTS[0].id);
	const [selectedMode, setSelectedMode] = useState(MODES[0].id);
	const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
	const [notes, setNotes] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [bookingRef, setBookingRef] = useState("");

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const ref = "PHY-" + Math.floor(100000 + Math.random() * 900000);
		setBookingRef(ref);
		setIsSubmitted(true);
	};

	const handleResetAndClose = () => {
		setIsSubmitted(false);
		onClose();
	};

	const selectedDoc = SPECIALISTS.find((s) => s.id === selectedSpecialist);

	return ReactDOM.createPortal(
		<div className={styles.backdrop} onClick={onClose}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<header className={styles.header}>
					<div className={styles.headerTitleGroup}>
						<div className={styles.headerIcon}>
							<Stethoscope size={22} />
						</div>
						<div>
							<h3 className={styles.title}>{t("physician_checkin_title")}</h3>
							<p className={styles.subtitle}>{t("physician_checkin_desc")}</p>
						</div>
					</div>
					<button
						type="button"
						className={styles.closeButton}
						onClick={onClose}
						aria-label="Close"
					>
						<X size={18} />
					</button>
				</header>

				{!isSubmitted ? (
					<form onSubmit={handleSubmit} className={styles.body}>
						<div>
							<div className={styles.sectionTitle}>Select Specialist</div>
							<div className={styles.specialistGrid}>
								{SPECIALISTS.map((doc) => (
									<button
										key={doc.id}
										type="button"
										className={`${styles.specialistCard} ${
											selectedSpecialist === doc.id ? styles.selected : ""
										}`}
										onClick={() => setSelectedSpecialist(doc.id)}
									>
										<div className={styles.specialistAvatar}>{doc.initials}</div>
										<div>
											<p className={styles.specialistName}>{doc.name}</p>
											<p className={styles.specialistRole}>{doc.role}</p>
										</div>
									</button>
								))}
							</div>
						</div>

						<div>
							<div className={styles.sectionTitle}>Consultation Type</div>
							<div className={styles.modeGrid}>
								{MODES.map((m) => {
									const IconComp = m.icon;
									return (
										<button
											key={m.id}
											type="button"
											className={`${styles.modeCard} ${
												selectedMode === m.id ? styles.selected : ""
											}`}
											onClick={() => setSelectedMode(m.id)}
										>
											<IconComp size={20} />
											<span>{m.label}</span>
										</button>
									);
								})}
							</div>
						</div>

						<div>
							<div className={styles.sectionTitle}>Preferred Time Slot</div>
							<div className={styles.slotGrid}>
								{TIME_SLOTS.map((slot) => (
									<button
										key={slot}
										type="button"
										className={`${styles.slotCard} ${
											selectedSlot === slot ? styles.selected : ""
										}`}
										onClick={() => setSelectedSlot(slot)}
									>
										{slot}
									</button>
								))}
							</div>
						</div>

						<div>
							<div className={styles.sectionTitle}>Notes for Physician (Optional)</div>
							<textarea
								className={styles.textarea}
								placeholder="Mention any symptoms, specific questions, or lab results you'd like the doctor to review..."
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
							/>
						</div>

						<footer className={styles.footer}>
							<div className={styles.trustBadge}>
								<ShieldCheck size={16} />
								<span>HIPAA Compliant & Confidential</span>
							</div>
							<button type="submit" className={styles.submitButton}>
								<CalendarIcon size={16} />
								<span>Confirm & Schedule</span>
							</button>
						</footer>
					</form>
				) : (
					<div className={styles.successView}>
						<div className={styles.successIcon}>
							<CheckCircle2 size={36} />
						</div>
						<h3 className={styles.successTitle}>Consultation Confirmed!</h3>
						<p className={styles.successDesc}>
							Your session with <strong>{selectedDoc?.name}</strong> has been booked for{" "}
							<strong>{selectedSlot}</strong>. You will receive an SMS and email notification with your room link.
						</p>

						<div className={styles.bookingRefCard}>
							<span className={styles.refLabel}>Booking Reference</span>
							<span className={styles.refCode}>{bookingRef}</span>
						</div>

						<button
							type="button"
							className={styles.submitButton}
							style={{ marginTop: "1rem" }}
							onClick={handleResetAndClose}
						>
							<Sparkles size={16} />
							<span>Done</span>
						</button>
					</div>
				)}
			</div>
		</div>,
		document.body,
	);
};

export default PhysicianConsultModal;
