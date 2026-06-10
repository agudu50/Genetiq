import ChevronHollow from "@assets/CtaModal/ChevronHollow.svg?react";
import Cart from "@assets/CtaModal/Cart.svg?react";
import QuestionMark from "@assets/PlanWidget/QuestionMark.svg?react";
import styles from "./PlanRow.module.scss";
import { PlanItem } from "../../helpers/planMockData";
import { useLanguage } from "@/App/i18n/LanguageContext";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { addToCart, removeFromCart } from "@/App/Redux/cartSlice";

export const PlanRow = ({
	item,
	setActiveTab,
	index = 0,
}: {
	item: PlanItem;
	setActiveTab: (tab: string) => void;
	index?: number;
}) => {
	const { t } = useLanguage();
	const dispatch = useDispatch();
	const cartItems = useSelector((state: RootState) => state.cart.items);
	const isInCart = cartItems.some((c) => c.name === item.name);

	const handleClick = () => {
		if (item.link) {
			setActiveTab(item.link);
		}
	};

	const handleCartClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isInCart) {
			dispatch(removeFromCart(item.name));
		} else {
			dispatch(addToCart({
				id: item.name,
				name: item.name,
				description: item.description,
				icon: item.icon,
				price: "$49",
			}));
		}
	};

	return (
		<div className={styles["PlanRow-row"]} onClick={handleClick}>
			{/* ── Step index circle ── */}
			<div className={styles["PlanRow-step"]}>
				{index + 1}
			</div>

			{/* ── Body ── */}
			<div className={styles["PlanRow-body"]}>
				<div className={styles["PlanRow-name"]}>
					{item.count && (
						<span className={styles["PlanRow-count"]}>{item.count} </span>
					)}
					{t(item.name)}
				</div>
				{item.description && (
					<div className={styles["PlanRow-desc"]}>{t(item.description)}</div>
				)}
			</div>

			{/* ── Right: pills on idle, teal arrow on hover ── */}
			<div className={styles["PlanRow-misc-wrap"]}>
				<div className={styles["PlanRow-misc"]}>
					{item.dosage && (
						<div className={styles["PlanRow-dosage"]}>{item.dosage}</div>
					)}
					{item.frequency && (
						<div className={styles["PlanRow-frequency"]}>{item.frequency}</div>
					)}
					{!item.dosage && !item.frequency && (
						<span className={styles["PlanRow-type-chip"]}>
							{t("plan_item_activity") || "Activity"}
						</span>
					)}
				</div>

				{/* Hover-reveal arrow (navigate or cart) */}
				{item.link ? (
					<div className={styles["PlanRow-arrow"]}>
						<svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
							<path d="M5 12h14M13 6l6 6-6 6" />
						</svg>
					</div>
				) : (
					<button
						className={`${styles["PlanRow-arrow"]} ${isInCart ? styles["PlanRow-cart-added"] : ""}`}
						onClick={handleCartClick}
						style={{ background: isInCart ? "#10b981" : undefined }}
					>
						{isInCart ? (
							<svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
								<path d="m5 12 5 5L20 7" />
							</svg>
						) : (
							<Cart />
						)}
					</button>
				)}
			</div>

			{/* Legacy buttons (kept for compatibility, hidden by default) */}
			<div className={styles["PlanRow-buttons"]}>
				<div className={styles["PlanRow-why"]}>
					<p>{t("why")}</p>
					<QuestionMark />
				</div>
				{item.link ? (
					<div className={styles["PlanRow-chevron-container"]}>
						<ChevronHollow />
					</div>
				) : (
					<button
						className={`${styles["PlanRow-cart"]} ${isInCart ? styles["PlanRow-cart-added"] : ""}`}
						onClick={handleCartClick}
					>
						<p>{isInCart ? `${t("added") || "Added"} ✓` : t("add_to_cart")}</p>
						<Cart />
					</button>
				)}
			</div>
		</div>
	);
};
