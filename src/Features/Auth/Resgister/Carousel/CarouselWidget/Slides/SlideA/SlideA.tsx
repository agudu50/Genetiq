import styles from "./SlideA.module.scss";
import DigitalTwinPreview from "@assets/Auth/DigitalTwinPreview.png";

export const SlideA = () => {
	return (
		<div className={styles["Carousel-login-wrapper"]}>
			<div className={styles["New-branded-card"]}>
				<div className={styles["Card-header"]}>
					<span className={styles["Brand-badge"]}>Care Navigator</span>
					<span className={styles["AI-badge"]}>MISSION DRIVEN</span>
				</div>
				<div className={styles["Card-visual"]}>
					<img src={DigitalTwinPreview} alt='Genetiq Digital Twin Preview' />
				</div>
				<div className={styles["Feature-grid"]}>
					<div className={styles["Feature-item"]}>
						<span className={styles["Dot"]} /> Remote Care Bridge
					</div>
					<div className={styles["Feature-item"]}>
						<span className={styles["Dot"]} /> Specialist Access
					</div>
					<div className={styles["Feature-item"]}>
						<span className={styles["Dot"]} /> System Navigation
					</div>
					<div className={styles["Feature-item"]}>
						<span className={styles["Dot"]} /> Reduced Care Costs
					</div>
				</div>
				<div className={styles["Card-footer"]}>
					<h3>Genetiq</h3>
					<p className={styles["Footer-tagline"]}>Bridging the Gap in Africa</p>
					<div className={styles["Mission-text"]}>
						<strong>Transforming African healthcare with AI.</strong> Elite
						medical expertise, now accessible and personalized for every
						individual on the continent.
					</div>
				</div>
			</div>
		</div>
	);
};
