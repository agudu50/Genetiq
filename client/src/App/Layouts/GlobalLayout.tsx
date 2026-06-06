import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ChevronUp } from "lucide-react";
import styles from "./GlobalLayout.module.scss";

const GlobalLayout = () => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout>;

		const handleScroll = () => {
			if (window.scrollY > 300) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}

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
