import React from "react";
import styles from "./ProgressBar.module.scss";

interface CircleProgressBarProps {
	progress: number;
}

export const CircleProgressBar: React.FC<CircleProgressBarProps> = ({
	progress,
}) => {
	const r = 77;
	const circumstance = 2 * Math.PI * r;
	const strokeDashoffset = circumstance - (progress / 100) * circumstance;
	return (
		<div>
			<svg
				width='106'
				height='106'
				viewBox='0 0 160 160'
				version='1.1'
				xmlns='http://www.w3.org/2000/svg'
				style={{ transform: "rotate(-90deg)" }}
			>
				<circle
					r='72'
					cx='80'
					cy='80'
					fill='transparent'
					stroke='rgba(255, 255, 255, 0.1)'
					stroke-width='10'
				></circle>
				<circle
					r='72'
					cx='80'
					cy='80'
					stroke='#818cf8'
					stroke-width='10'
					stroke-linecap='round'
					stroke-dashoffset={strokeDashoffset}
					fill='transparent'
					stroke-dasharray={circumstance}
				></circle>
				<text
					x='82'
					y='55'
					fill='white'
					fontSize='24px'
					fontWeight='800'
					textAnchor='middle'
					dominantBaseline='middle'
					className={styles["percentage"]}
					style={{ transform: "rotate(90deg) translate(0px, -135px)" }}
				>
					{progress}%
				</text>
			</svg>
		</div>
	);
};
