import React from "react";

interface ArrowRightIcon {
	fill: string;
}

export const ArrowRightIcon: React.FC<ArrowRightIcon> = ({ fill }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='20'
		height='20'
		viewBox='0 0 20 20'
		fill='none'
	>
		<path
			d='M13.75 10L7.5 16.25L6.625 15.375L12 10L6.625 4.625L7.5 3.75L13.75 10Z'
			fill={fill}
		/>
	</svg>
);
