import React from "react";

interface ProgressRingProps {
	progress: number;
	isActive: boolean;
	hasCheckedGoals: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
	progress,
	isActive,
	hasCheckedGoals,
}) => {
	return (
		<div
			style={{
				position: "relative",
				width: "19px",
				height: "19px",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{/* Outer Ring */}
			{progress > 0 && (
				<svg
					width='19'
					height='20'
					viewBox='0 0 19 20'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
					style={{
						position: "absolute",
						top: 0,
						left: 0,
					}}
				>
					<circle
						cx='9.5'
						cy='10'
						r='8'
						stroke={
							isActive
								? "url(#paint0_radial_active)"
								: "url(#paint0_radial_inactive)"
						}
						strokeWidth='2'
						strokeDasharray={`${(progress / 100) * 2 * Math.PI * 8} ${
							2 * Math.PI * 8
						}`}
						strokeDashoffset='0'
					/>
					<defs>
						<radialGradient
							id='paint0_radial_active'
							cx='0'
							cy='0'
							r='1'
							gradientUnits='userSpaceOnUse'
							gradientTransform='translate(9 0.9375) rotate(120.018) scale(16.241)'
						>
							<stop stopColor='white' stopOpacity='0.4' />
							<stop offset='1' stopColor='white' />
						</radialGradient>
						<radialGradient
							id='paint0_radial_inactive'
							cx='0'
							cy='0'
							r='1'
							gradientUnits='userSpaceOnUse'
							gradientTransform='translate(9 0.9375) rotate(120.018) scale(16.241)'
						>
							<stop stopColor='#B5D3F8' />
							<stop offset='1' stopColor='#5498EE' />
						</radialGradient>
					</defs>
				</svg>
			)}

			{/* Inner Circle */}
			<svg
				width='13'
				height='12'
				viewBox='0 0 13 12'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				style={{
					position: "relative",
					zIndex: 1,
				}}
			>
				<circle
					cx='6.71387'
					cy='6'
					r='6'
					fill={isActive ? "white" : hasCheckedGoals ? "#3B8DF5" : "white"}
				/>
			</svg>
		</div>
	);
};

export default ProgressRing;
