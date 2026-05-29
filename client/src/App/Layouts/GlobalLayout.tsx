import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ChevronUp } from "lucide-react";
import styles from "./GlobalLayout.module.scss";

const GlobalLayout = () => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			if (window.scrollY > 300) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}
		};

		window.addEventListener("scroll", toggleVisibility, { passive: true });
		return () => window.removeEventListener("scroll", toggleVisibility);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	return (
		<>
			<Outlet />
			<button
				className={`${styles.scrollToTop} ${isVisible ? styles.visible : ""}`}
				onClick={scrollToTop}
				aria-label="Scroll to top"
			>
			<ChevronUp size={28} strokeWidth={3} />
			</button>
		</>
	);
};

export default GlobalLayout;
