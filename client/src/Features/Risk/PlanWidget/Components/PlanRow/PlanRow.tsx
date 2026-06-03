import QuestionMark from "@assets/PlanWidget/QuestionMark.svg?react";
import ChevronHollow from "@assets/CtaModal/ChevronHollow.svg?react";
import Cart from "@assets/CtaModal/Cart.svg?react";
import styles from "./PlanRow.module.scss";
import { PlanItem } from "../../helpers/planMockData";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { addToCart, removeFromCart } from "@/App/Redux/cartSlice";
import { useLanguage } from "@/App/i18n/LanguageContext";

export const PlanRow = ({
	item,
	setActiveTab,
}: {
	item: PlanItem;
	setActiveTab: (tab: string) => void;
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
			<div className={styles["PlanRow-icon"]}>
				<img src={item.icon} alt={`${item.name} icon`} />
			</div>
			<div className={styles["PlanRow-body"]}>
				<div className={styles["PlanRow-name"]}>
					{item.count && (
						<span className={styles["PlanRow-count"]}>{item.count} </span>
					)}
					{item.name}
				</div>
				<div className={styles["PlanRow-desc"]}>{item.description}</div>
			</div>
			<div className={styles["PlanRow-misc"]}>
				{item.dosage && (
					<div className={styles["PlanRow-dosage"]}>{item.dosage}</div>
				)}
				{item.frequency && (
					<div className={styles["PlanRow-frequency"]}>{item.frequency}</div>
				)}
			</div>
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
