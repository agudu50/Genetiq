import React, { useState } from "react";
import "./GoalProgressMenu.scss";
import ProgressRing from "@features/Risk/GoalProgressMenu/ProgressRing.tsx";
import initialGoals from "@features/Risk/GoalProgressMenu/InitialGoals.tsx";

const PyramidIcon = ({
	className,
	onClick,
}: {
	className?: string;
	onClick?: React.MouseEventHandler<SVGSVGElement>;
}) => {
	return (
		<svg
			onClick={onClick}
			className={className}
			width='16'
			height='16'
			viewBox='0 0 16 16'
			fill='rgba(0, 65, 196, 1)'
			xmlns='http://www.w3.org/2000/svg'
			style={{ cursor: "pointer" }}
		>
			<path d='M8 2 L2 14 L14 14 Z' />
		</svg>
	);
};
const GoalsProgressMenu = ({ totalGoals = 6, completedGoals = 1 }) => {
	const daysOfWeek = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];

	const [isOpen, setIsOpen] = useState(false);
	const [currentProgress, setCurrentProgress] = useState(completedGoals);
	const [goalsState] = useState<{
		[day: string]: boolean[];
	}>(
		daysOfWeek.reduce(
			(state, day) => {
				state[day] = initialGoals.map(() => false);
				return state;
			},
			{} as { [day: string]: boolean[] },
		),
	);

	const [activeDay, setActiveDay] = useState<string | null>(
		daysOfWeek[new Date().getDay() - 1] || "Monday",
	);

	// const handleCheckboxChange = (index: number) => {
	// 	if (!activeDay) return;
	//
	// 	setGoalsState((prevGoalsState) => {
	// 		const updatedGoalsState = {
	// 			...prevGoalsState,
	// 			[activeDay]: [...prevGoalsState[activeDay]],
	// 		};
	// 		updatedGoalsState[activeDay][index] =
	// 			!updatedGoalsState[activeDay][index];
	//
	// 		const completedCount = updatedGoalsState[activeDay].filter(
	// 			(goal) => goal,
	// 		).length;
	// 		setCurrentProgress(completedCount);
	//
	// 		return updatedGoalsState;
	// 	});
	// };
	const calculateProgressPercentage = (day: string) => {
		const completed = goalsState[day].filter((g) => g).length;
		const total = goalsState[day].length;
		return Math.round((completed / total) * 100);
	};

	return (
		<div className='container'>
			<div className={`button ${isOpen ? "open" : ""}`}>
				<svg
					width='16'
					height='16'
					viewBox='0 0 16 16'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						d='M11.25 13C10.9039 13 10.5655 12.8974 10.2778 12.7051C9.98996 12.5128 9.76566 12.2395 9.63321 11.9197C9.50076 11.5999 9.4661 11.2481 9.53362 10.9086C9.60115 10.5691 9.76782 10.2573 10.0126 10.0126C10.2573 9.76782 10.5691 9.60115 10.9086 9.53362C11.2481 9.4661 11.5999 9.50076 11.9197 9.63321C12.2395 9.76566 12.5128 9.98997 12.7051 10.2778C12.8974 10.5655 13 10.9039 13 11.25C12.9995 11.714 12.8149 12.1588 12.4868 12.4868C12.1588 12.8149 11.714 12.9995 11.25 13ZM11.25 10.5C11.1017 10.5 10.9567 10.544 10.8333 10.6264C10.71 10.7088 10.6139 10.8259 10.5571 10.963C10.5003 11.1 10.4855 11.2508 10.5144 11.3963C10.5433 11.5418 10.6148 11.6754 10.7197 11.7803C10.8246 11.8852 10.9582 11.9566 11.1037 11.9856C11.2492 12.0145 11.4 11.9997 11.537 11.9429C11.6741 11.8861 11.7912 11.79 11.8736 11.6667C11.956 11.5433 12 11.3983 12 11.25C11.9998 11.0512 11.9207 10.8605 11.7801 10.7199C11.6395 10.5793 11.4488 10.5002 11.25 10.5Z'
						fill='#515967'
					/>
					<path
						d='M11.25 15.5C10.4094 15.5 9.58773 15.2507 8.88882 14.7837C8.18992 14.3167 7.64518 13.653 7.32351 12.8764C7.00184 12.0998 6.91767 11.2453 7.08166 10.4209C7.24565 9.59645 7.65042 8.83917 8.24479 8.2448C8.83917 7.65042 9.59645 7.24565 10.4209 7.08166C11.2453 6.91768 12.0998 7.00184 12.8764 7.32351C13.653 7.64518 14.3167 8.18992 14.7837 8.88883C15.2507 9.58774 15.5 10.4094 15.5 11.25C15.4987 12.3768 15.0505 13.457 14.2537 14.2537C13.457 15.0505 12.3768 15.4987 11.25 15.5ZM11.25 8C10.6072 8 9.97885 8.19061 9.4444 8.54772C8.90994 8.90484 8.49337 9.41242 8.24739 10.0063C8.0014 10.6001 7.93704 11.2536 8.06245 11.884C8.18785 12.5145 8.49738 13.0936 8.9519 13.5481C9.40642 14.0026 9.98552 14.3122 10.616 14.4376C11.2464 14.563 11.8999 14.4986 12.4937 14.2526C13.0876 14.0066 13.5952 13.5901 13.9523 13.0556C14.3094 12.5211 14.5 11.8928 14.5 11.25C14.499 10.3883 14.1563 9.56227 13.547 8.95298C12.9377 8.3437 12.1117 8.00098 11.25 8Z'
						fill='#515967'
					/>
					<path
						d='M12.5 2.5H11V2C10.9992 1.73502 10.8936 1.48111 10.7063 1.29374C10.5189 1.10637 10.265 1.00077 10 1H6C5.73502 1.00077 5.48111 1.10637 5.29374 1.29374C5.10637 1.48111 5.00077 1.73502 5 2V2.5H3.5C3.23502 2.50077 2.98111 2.60637 2.79374 2.79374C2.60637 2.98111 2.50077 3.23502 2.5 3.5V14C2.50077 14.265 2.60637 14.5189 2.79374 14.7063C2.98111 14.8936 3.23502 14.9992 3.5 15H6V14H3.5V3.5H5V5H11V3.5H12.5V6H13.5V3.5C13.4992 3.23502 13.3936 2.98111 13.2063 2.79374C13.0189 2.60637 12.765 2.50077 12.5 2.5ZM10 4H6V2H10V4Z'
						fill='#515967'
					/>
				</svg>
				<span className='label'>Today's goals</span>
				<div className='progress-wrapper'>
					<div className='progress-container'>
						<div
							className='progress-bar'
							style={{ width: `${(currentProgress / totalGoals) * 100}%` }}
						>
							<div className='handle' />
						</div>
					</div>
				</div>
				<span className='counter'>
					<span className='current-progress'>{currentProgress}</span>
					<span className='divider'>/</span>
					<span className='total-goals'>{totalGoals}</span>
				</span>

				<PyramidIcon
					className={`chevron ${!isOpen ? "rotate" : ""}`}
					onClick={(e) => {
						e.stopPropagation();
						setIsOpen(!isOpen);
					}}
				/>
			</div>
			{isOpen && (
				<div className='dropdown'>
					<div className='days-wrapper'>
						{daysOfWeek.map((day) => {
							const hasCheckedGoals = goalsState[day].some((goal) => goal);

							return (
								<React.Fragment key={day}>
									<button
										key={day}
										className={`day-button ${activeDay === day ? "active" : ""}`}
										onClick={() => {
											setActiveDay(day);
											setCurrentProgress(
												goalsState[day].filter((goal) => goal).length,
											);
										}}
									>
										<div
											style={{ display: "flex", alignItems: "center", gap: 8 }}
										>
											<ProgressRing
												progress={calculateProgressPercentage(day)}
												hasCheckedGoals={hasCheckedGoals}
												isActive={activeDay === day}
											/>
											{day.slice(0, 3)}
										</div>
									</button>
									{day === "Sunday" && (
										<div className='sunday-icon-wrapper'>
											<svg
												width='16'
												height='16'
												viewBox='0 0 16 16'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path
													d='M13 2H11V1H10V2H6V1H5V2H3C2.45 2 2 2.45 2 3V13C2 13.55 2.45 14 3 14H13C13.55 14 14 13.55 14 13V3C14 2.45 13.55 2 13 2ZM13 13H3V6H13V13ZM13 5H3V3H5V4H6V3H10V4H11V3H13V5Z'
													fill='#0029AD'
												/>
											</svg>
										</div>
									)}
								</React.Fragment>
							);
						})}
					</div>
					{activeDay &&
						initialGoals.map((goal) => (
							<div key={goal.id} className='goal-item'>
								{/*<input*/}
								{/*	type='checkbox'*/}
								{/*	checked={goalsState[activeDay][index]}*/}
								{/*	onChange={() => handleCheckboxChange(index)}*/}
								{/*/>*/}
								<div className='goal-content'>
									{goal.icon}
									<span className='goal-text'>{goal.text}</span>

									{goal.id === 3 ? (
										goal.stats
									) : (
										<span className='stats-badge'>{goal.stats}</span>
									)}
								</div>
							</div>
						))}

					<div className='edit-goals'>
						<span>Edit goals</span>
						<svg
							width='16'
							height='16'
							viewBox='0 0 16 16'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path d='M15 13H1V14H15V13Z' fill='#0041C4' />
							<path
								d='M12.7 4.5C13.1 4.1 13.1 3.5 12.7 3.1L10.9 1.3C10.5 0.9 9.9 0.9 9.5 1.3L2 8.8V12H5.2L12.7 4.5ZM10.2 2L12 3.8L10.5 5.3L8.7 3.5L10.2 2ZM3 11V9.2L8 4.2L9.8 6L4.8 11H3Z'
								fill='#0041C4'
							/>
						</svg>
					</div>
				</div>
			)}
		</div>
	);
};

export default GoalsProgressMenu;
