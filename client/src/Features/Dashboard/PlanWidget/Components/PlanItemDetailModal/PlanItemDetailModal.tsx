import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	X,
	Sparkles,
	TrendingUp,
	Pill,
	Calendar,
	CheckCircle,
	ShoppingCart,
	ClipboardList,
	Activity,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { HealthGoal, setGoals } from "@/App/Redux/goalSlice";
import { addToCart } from "@/App/Redux/cartSlice";
import { LocalVault } from "@/App/Services/LocalVault";
import { useLanguage } from "@/App/i18n/LanguageContext";
import {
	PlanItemSelection,
	parseImpact,
	goalCategoryForSection,
} from "../../helpers/planItemHelpers";
import styles from "./PlanItemDetailModal.module.scss";

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
	const cartItems = useSelector((state: RootState) => state.cart.items);

	const [scheduled, setScheduled] = useState(false);
	const [scheduling, setScheduling] = useState(false);

	useEffect(() => {
		setScheduled(false);
		setScheduling(false);
	}, [selection?.item.name]);

	const item = selection?.item;
	const category = selection?.category ?? "";
	const accentColor = selection?.accentColor ?? "#00a69d";
	const translatedDesc = item ? t(item.description) : "";
	const { text: benefitText, score: impactScore } = parseImpact(translatedDesc);
	const isInCart = item
		? cartItems.some((c) => c.name === item.name)
		: false;
	const isSupplement = category === "Supplements";
	const impactPercent = impactScore ? Math.min(impactScore * 10, 100) : null;

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

	const handleAddToCart = () => {
		if (!item || isInCart) return;
		dispatch(
			addToCart({
				id: item.name,
				name: item.name,
				description: item.description,
				icon: item.icon,
				price: "$49",
			}),
		);
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
						initial={{ opacity: 0, y: 28, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.96 }}
						transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
						onClick={(e) => e.stopPropagation()}
					>
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
								<X size={18} />
							</button>
						</header>

						<div className={styles.hero}>
							<div className={styles.heroIcon}>
								<img src={item.icon} alt="" />
							</div>
							<div className={styles.heroText}>
								<h2>{t(item.name)}</h2>
								<span className={styles.activityChip}>
									{t("plan_item_activity")}
								</span>
							</div>
						</div>

						<div className={styles.body}>
							<div className={styles.benefitCard}>
								<div className={styles.benefitHead}>
									<Sparkles size={16} strokeWidth={2.25} />
									<span>{t("plan_detail_benefit")}</span>
								</div>
								<p className={styles.benefitText}>{benefitText}</p>

								{impactPercent !== null && (
									<div className={styles.impactBlock}>
										<div className={styles.impactLabel}>
											<TrendingUp size={14} />
											<span>{t("plan_detail_impact")}</span>
											<strong>+{impactScore}</strong>
										</div>
										<div className={styles.impactTrack}>
											<motion.div
												className={styles.impactFill}
												initial={{ width: 0 }}
												animate={{ width: `${impactPercent}%` }}
												transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
											/>
										</div>
									</div>
								)}
							</div>

							{(item.dosage || item.frequency) && (
								<div className={styles.detailsGrid}>
									{item.dosage && (
										<div className={styles.detailCell}>
											<span className={styles.detailLabel}>
												{t("plan_detail_dosage")}
											</span>
											<span className={styles.detailValue}>{item.dosage}</span>
										</div>
									)}
									{item.frequency && (
										<div className={styles.detailCell}>
											<span className={styles.detailLabel}>
												{t("plan_detail_frequency")}
											</span>
											<span className={styles.detailValue}>
												{item.frequency}
											</span>
										</div>
									)}
								</div>
							)}

							<div className={styles.whyCard}>
								<p className={styles.whyLabel}>
									{t("plan_detail_why_recommended")}
								</p>
								<p className={styles.whyText}>
									{t("plan_detail_why_body", { category: t(category) })}
								</p>
							</div>

							<p className={styles.dataNote}>
								{t("plan_based_on_data")}
							</p>
						</div>

						<footer className={styles.footer}>
							{scheduled ? (
								<div className={styles.successRow}>
									<CheckCircle size={18} />
									<span>{t("plan_detail_scheduled")}</span>
								</div>
							) : (
								<>
									<button
										type="button"
										className={styles.scheduleBtn}
										onClick={handleSchedule}
										disabled={scheduling}
									>
										<Calendar size={16} />
										<span>
											{scheduling
												? t("activating_plan")
												: t("add_to_schedule")}
										</span>
									</button>
									{isSupplement && (
										<button
											type="button"
											className={`${styles.cartBtn} ${isInCart ? styles.cartAdded : ""}`}
											onClick={handleAddToCart}
											disabled={isInCart}
										>
											<ShoppingCart size={16} />
											<span>
												{isInCart ? t("added") : t("add_to_cart")}
											</span>
										</button>
									)}
								</>
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
