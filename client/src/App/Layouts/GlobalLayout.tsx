import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ChevronUp } from "lucide-react";
import styles from "./GlobalLayout.module.scss";

const ScrollToTopButton = () => {
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
		<button
			className={`${styles.scrollToTop} ${isVisible ? styles.visible : ""}`}
			onClick={scrollToTop}
			aria-label="Scroll to top"
		>
			<ChevronUp size={28} strokeWidth={3} />
		</button>
	);
};

const GlobalLayout = () => {
	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout>;

		const handleScroll = () => {
			if (!document.body.classList.contains("is-scrolling")) {
				document.body.classList.add("is-scrolling");
			}
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				document.body.classList.remove("is-scrolling");
			}, 120);
		};

		window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
		return () => {
			window.removeEventListener("scroll", handleScroll, { capture: true });
			clearTimeout(timeout);
		};
	}, []);

	return (
		<>
			<Outlet />
			<ScrollToTopButton />
		</>
	);
};

export default GlobalLayout;
