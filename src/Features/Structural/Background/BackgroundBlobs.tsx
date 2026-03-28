import { motion } from "framer-motion";
import styles from "./BackgroundBlobs.module.scss";

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
			x: [0, 60, 0],
			y: [0, 30, 0],
			scale: [1, 1.1, 1],
		}}
		transition={{
			duration: 15 + Math.random() * 10,
			repeat: Infinity,
			ease: "easeInOut",
		}}
		style={{
			...style,
			background: color,
		}}
	/>
);

export const BackgroundBlobs = () => {
	return (
		<div className={styles.blobContainer}>
			<Blob
				color='#312e81'
				style={{ top: "10%", left: "5%", width: "500px", height: "500px" }}
			/>
			<Blob
				color='#4c1d95'
				style={{ bottom: "10%", right: "5%", width: "600px", height: "600px" }}
			/>
			<Blob
				color='#020617'
				style={{ top: "40%", left: "45%", width: "400px", height: "400px" }}
			/>
		</div>
	);
};
