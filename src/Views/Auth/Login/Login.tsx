import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { paths } from "@/App/Routes/Paths";
import { CarouselLogin } from "@/Features/Auth/Login/Components/Carousel/CarouselWidget/CarouselLogin";
import { LoginForm } from "@/Features/Auth/Login/Components/LoginForm/LoginForm";
import styles from "./Login.module.scss";

const Blob = ({
	color,
	style,
}: {
	color: string;
	style: React.CSSProperties;
}) => (
	<motion.div
		className={styles.blob}
		animate={{
			x: [0, 80, 0],
			y: [0, 40, 0],
			scale: [1, 1.1, 1],
		}}
		transition={{
			duration: 12 + Math.random() * 8,
			repeat: Infinity,
			ease: "easeInOut",
		}}
		style={{
			...style,
			background: color,
			width: "clamp(300px, 40vw, 500px)",
			height: "clamp(300px, 40vw, 500px)",
		}}
	/>
);

const Login = () => {
	const navigate = useNavigate();

	return (
		<div className={styles["Auth-layout"]}>
			<div className={styles.blobContainer}>
				<Blob color='#312e81' style={{ top: "5%", left: "5%" }} />
				<Blob color='#4c1d95' style={{ bottom: "10%", right: "5%" }} />
				<Blob color='#020617' style={{ top: "40%", left: "45%" }} />
			</div>

			<div className={styles.logo} onClick={() => navigate(paths.landing)}>
				<img
					src='/assets/digital_twin_preview.png'
					alt='Genetiq Logo'
					className={styles.logoImage}
				/>
				<span className={styles.logoText}>Genetiq</span>
			</div>

			<div className={styles["Auth-content"]}>
				<motion.div
					className={styles["Auth-content-left"]}
					initial={{ opacity: 0, x: -40 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<CarouselLogin />
				</motion.div>

				<motion.div
					className={styles["Auth-content-right"]}
					initial={{ opacity: 0, x: 40 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<LoginForm />
				</motion.div>
			</div>
		</div>
	);
};

export default Login;
