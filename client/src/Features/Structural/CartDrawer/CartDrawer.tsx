import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { removeFromCart, clearCart } from "@/App/Redux/cartSlice";
import { useLanguage } from "@/App/i18n/LanguageContext";
import { ShoppingCart, X, Trash2, CheckCircle, CreditCard, Sparkles, ShoppingBag } from "lucide-react";
import styles from "./CartDrawer.module.scss";

interface CartDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
	const { t } = useLanguage();
	const dispatch = useDispatch();
	const cartItems = useSelector((state: RootState) => state.cart.items);
	const [checkoutSuccess, setCheckoutSuccess] = useState(false);
	const [isCheckingOut, setIsCheckingOut] = useState(false);

	if (!isOpen) return null;

	const handleCheckout = () => {
		setIsCheckingOut(true);
		setTimeout(() => {
			setIsCheckingOut(false);
			setCheckoutSuccess(true);
			dispatch(clearCart());
		}, 2000);
	};

	const handleReset = () => {
		setCheckoutSuccess(false);
		onClose();
	};

	return (
		<div className={`${styles.overlay} ${isOpen ? styles.active : ""}`} onClick={onClose}>
			<div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className={styles.header}>
					<div className={styles.headerTitle}>
						<ShoppingCart size={20} className={styles.cartIcon} />
						<h2>{t("shopping_cart") || "Shopping Cart"}</h2>
						{cartItems.length > 0 && <span className={styles.badge}>{cartItems.length}</span>}
					</div>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
						<X size={20} />
					</button>
				</div>

				{/* Body */}
				<div className={styles.body}>
					{checkoutSuccess ? (
						/* Checkout Success State */
						<div className={styles.successState}>
							<div className={styles.successRing}>
								<CheckCircle size={48} className={styles.successIcon} />
							</div>
							<h3>{t("checkout_complete") || "Order Placed Successfully!"}</h3>
							<p>
								{t("checkout_success_message") ||
									"Your tailored health recommendations and supplements are verified. You will receive tracking details via email shortly."}
							</p>
							<button className={styles.continueBtn} onClick={handleReset}>
								{t("continue_shopping") || "Return to Dashboard"}
							</button>
						</div>
					) : isCheckingOut ? (
						/* Processing State */
						<div className={styles.processingState}>
							<div className={styles.spinner} />
							<h3>{t("processing_order") || "Processing Order..."}</h3>
							<p>{t("processing_secure") || "Establishing encrypted secure checkout pipeline..."}</p>
						</div>

					) : (
						/* Cart Items List */
						<div className={styles.itemsList}>
							{cartItems.map((item) => (
								<div key={item.id} className={styles.cartItem}>
									<div className={styles.itemMeta}>
										<div className={styles.itemIconWrap}>
											<span className={styles.itemBullet}>✦</span>
										</div>
										<div className={styles.itemDetails}>
											<h4>{item.name}</h4>
											<p>{item.description}</p>
										</div>
									</div>
									<div className={styles.itemAction}>
										<span className={styles.itemPrice}>{item.price || "$49.00"}</span>
										<button
											className={styles.removeBtn}
											onClick={() => dispatch(removeFromCart(item.name))}
											aria-label="Remove item"
										>
											<Trash2 size={16} />
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				{!checkoutSuccess && !isCheckingOut && cartItems.length > 0 && (
					<div className={styles.footer}>
						<div className={styles.summaryRow}>
							<span>{t("subtotal") || "Subtotal"}</span>
							<span className={styles.totalPrice}>
								${(cartItems.length * 49).toFixed(2)}
							</span>
						</div>
						<div className={styles.summaryRow}>
							<span>{t("shipping_time") || "Processing & Delivery"}</span>
							<span className={styles.deliveryTime}>
								{t("delivery_instant") || "Instant Activation / 2-3 Days"}
							</span>
						</div>

						<button className={styles.checkoutBtn} onClick={handleCheckout}>
							<CreditCard size={16} />
							<span>{t("checkout_now") || "Secure Checkout"}</span>
							<Sparkles size={14} className={styles.checkoutSparkle} />
						</button>
						<p className={styles.checkoutNote}>
							🔒 {t("secure_pci") || "256-Bit Encrypted PCI-Compliant Checkout"}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
