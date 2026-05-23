import styles from "./CarouselLogin.module.scss";
import { SlideA } from "./Slides/SlideA/SlideA";

export const CarouselLogin = () => {
	return (
		<div className={styles["Carousel-login-container"]}>
			<div className={styles["Carousel-slider-wrapper"]}>
				<SlideA />
			</div>
		</div>
	);
};
