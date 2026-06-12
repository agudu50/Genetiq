import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	X,
	Pill,
	Calendar,
	CheckCircle,
	Bell,
	ClipboardList,
	Activity,
	Sparkles,
	ChevronRight,
	Info,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { HealthGoal, setGoals } from "@/App/Redux/goalSlice";
import { LocalVault } from "@/App/Services/LocalVault";
import { useLanguage } from "@/App/i18n/LanguageContext";
import {
	PlanItemSelection,
	parseImpact,
	goalCategoryForSection,
} from "../../helpers/planItemHelpers";
import styles from "./PlanItemDetailModal.module.scss";
import { PlanItemIcon } from "../../helpers/planItemIcons";

type PlanItemDetailModalProps = {
	selection: PlanItemSelection | null;
	onClose: () => void;
	onViewSection?: (category: string) => void;
};

const categoryIcons: Record<string, React.ReactNode> = {
	"Follow-up Care": <ClipboardList size={14} strokeWidth={2.25} />,
	Supplements: <Pill size={14} strokeWidth={2.25} />,
	Lifestyle: <Activity size={14} strokeWidth={2.25} />,
};

export const PlanItemDetailModal = ({
	selection,
	onClose,
	onViewSection,
}: PlanItemDetailModalProps) => {
	const { t } = useLanguage();
	const dispatch = useDispatch();
	const existingGoals = useSelector((state: RootState) => state.goals.items);

	const [scheduled, setScheduled] = useState(false);
	const [scheduling, setScheduling] = useState(false);
	const [reminderSet, setReminderSet] = useState(false);

	useEffect(() => {
		setScheduled(false);
		setScheduling(false);
		if (!selection?.item.name) {
			setReminderSet(false);
			return;
		}
		try {
			const saved = localStorage.getItem("genetiq_plan_reminders");
			const reminders: string[] = saved ? JSON.parse(saved) : [];
			setReminderSet(reminders.includes(selection.item.name));
		} catch {
			setReminderSet(false);
		}
	}, [selection?.item.name]);

	const item = selection?.item;
	const category = selection?.category ?? "";
	const accentColor = selection?.accentColor ?? "#00a69d";
	const translatedDesc = item ? t(item.description) : "";
	const { text: benefitText } = parseImpact(translatedDesc);
	const isSupplement = category === "Supplements";

	const handleSchedule = async () => {
		if (!item) return;
		setScheduling(true);
		const alreadyExists = existingGoals.some(
			(g) => g.title.toLowerCase() === item.name.toLowerCase(),
		);

		if (!alreadyExists) {
			const newGoal: HealthGoal = {
				id: `plan-goal-${Date.now()}-${item.name.toLowerCase().replace(/\s+/g, "-")}`,
				category: goalCategoryForSection(category),
				title: item.name,
				description: item.description,
				target_value: "1",
				current_value: "0",
				unit: "times",
				progress: 0,
				status: "In Progress",
				trend: "stable",
				streak: 0,
				completed: false,
			};
			const updatedGoals = [...existingGoals, newGoal];
			await LocalVault.save("user_goals", updatedGoals);
			dispatch(setGoals(updatedGoals));
		}

		setTimeout(() => {
			setScheduling(false);
			setScheduled(true);
		}, 800);
	};

	const handleSetReminder = () => {
		if (!item || reminderSet) return;
		try {
			const saved = localStorage.getItem("genetiq_plan_reminders");
			const reminders: string[] = saved ? JSON.parse(saved) : [];
			if (!reminders.includes(item.name)) {
				localStorage.setItem(
					"genetiq_plan_reminders",
					JSON.stringify([...reminders, item.name]),
				);
			}
			setReminderSet(true);
		} catch {
			setReminderSet(true);
		}
	};

	const handleClose = () => {
		setScheduled(false);
		setScheduling(false);
		onClose();
	};

	return ReactDOM.createPortal(
		<AnimatePresence>
			{selection && item && (
				<motion.div
					className={styles.overlay}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={handleClose}
				>
					<motion.div
						className={styles.modal}
						style={{ "--accent": accentColor } as React.CSSProperties}
						initial={{ opacity: 0, y: 24, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 16, scale: 0.98 }}
						transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
						onClick={(e) => e.stopPropagation()}
					>
						<div className={styles.accentStripe} aria-hidden />
						<div className={styles.modalMesh} aria-hidden />
						<div className={styles.modalGlow} aria-hidden />

						<header className={styles.header}>
							<span className={styles.categoryBadge}>
								{categoryIcons[category]}
								{t(category)}
							</span>
							<button
								type="button"
								className={styles.closeBtn}
								onClick={handleClose}
								aria-label={t("close")}
							>
								<X size={18} strokeWidth={2.5} aria-hidden />
							</button>
						</header>

						<div className={styles.hero}>
							<div className={styles.productIcon}>
								<PlanItemIcon
									icon={item.icon}
									itemName={item.name}
									size={28}
								/>
							</div>
							<div className={styles.heroText}>
								<h2>{t(item.name)}</h2>
								<span className={styles.activityChip}>
									{t("plan_item_activity")}
								</span>
							</div>
						</div>

						<div className={styles.body}>
							<section className={styles.surfaceCard}>
								<div className={styles.surfaceHead}>
									<Sparkles size={15} strokeWidth={2.25} />
									<span>{t("plan_detail_benefit")}</span>
								</div>
								<p className={styles.benefitText}>{benefitText}</p>
							</section>

							{(item.dosage || item.frequency) && (
								<div className={styles.statGrid}>
									{item.dosage && (
										<div className={styles.statCell}>
											<span className={styles.statLabel}>
												{t("plan_detail_dosage")}
											</span>
											<span className={styles.statValue}>{item.dosage}</span>
										</div>
									)}
									{item.frequency && (
										<div className={styles.statCell}>
											<span className={styles.statLabel}>
												{t("plan_detail_frequency")}
											</span>
											<span className={styles.statValue}>
												{item.frequency}
											</span>
										</div>
									)}
								</div>
							)}

							<section className={styles.whyPanel}>
								<span className={styles.whyLabel}>
									{t("plan_detail_why_recommended")}
								</span>
								<p className={styles.whyText}>
									{t("plan_detail_why_body", { category: t(category) })}
								</p>
							</section>

							<div className={styles.dataRow}>
								<Info size={13} strokeWidth={2.25} />
								<span>{t("plan_based_on_data")}</span>
							</div>
						</div>

						<footer className={styles.footer}>
							{scheduled ? (
								<div className={styles.successBanner}>
									<CheckCircle size={18} />
									<span>{t("plan_detail_scheduled")}</span>
								</div>
							) : (
								<div className={styles.actionRow}>
									<button
										type="button"
										className={styles.scheduleBtn}
										onClick={handleSchedule}
										disabled={scheduling}
									>
										<Calendar size={16} strokeWidth={2.25} />
										<span>
											{scheduling
												? t("activating_plan")
												: t("add_to_schedule")}
										</span>
									</button>
									{isSupplement && (
										<button
											type="button"
											className={`${styles.secondaryBtn} ${reminderSet ? styles.secondaryDone : ""}`}
											onClick={handleSetReminder}
											disabled={reminderSet}
										>
											<Bell size={16} strokeWidth={2.25} />
											<span>
												{reminderSet
													? t("plan_detail_reminder_set")
													: t("plan_detail_set_reminder")}
											</span>
										</button>
									)}
								</div>
							)}
							{onViewSection && (
								<button
									type="button"
									className={styles.sectionLink}
									onClick={() => {
										onViewSection(category);
										handleClose();
									}}
								>
									{t("plan_detail_view_section", { category: t(category) })}
									<ChevronRight size={14} strokeWidth={2.5} />
								</button>
							)}
						</footer>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
};
