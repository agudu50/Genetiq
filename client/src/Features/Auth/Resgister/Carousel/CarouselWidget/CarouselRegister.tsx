import styles from "./CarouselRegister.module.scss";
import { SlideA } from "./Slides/SlideA/SlideA";

export const CarouselRegister = () => {
	return (
		<div className={styles["Carousel-register-container"]}>
			<div className={styles["Carousel-slider-wrapper"]}>
				<SlideA />
			</div>
		</div>
	);
};
