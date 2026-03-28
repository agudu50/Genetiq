import { ConfigItemCard } from "./Components/ConfigItemCard/ConfirmItemCard";
import styles from "./UploadMethod.module.scss";
import React from "react";
import QueryIcon from "@assets/General/Query.svg?react";
import UploadCloudIcon from "@assets/General/UploadCloud.svg?react";
import ShoppingCartPlusIcon from "@assets/General/ShoppingCartPlus.svg?react";
import AppsIcon from "@assets/General/Apps.svg?react";
import { paths } from "@/App/Routes/Paths";

const TargetIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<circle cx='12' cy='12' r='10' />
		<circle cx='12' cy='12' r='6' />
		<circle cx='12' cy='12' r='2' />
	</svg>
);

const FileTextIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' />
		<polyline points='14 2 14 8 20 8' />
		<line x1='16' y1='13' x2='8' y2='13' />
		<line x1='16' y1='17' x2='8' y2='17' />
	</svg>
);

const FlaskIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M9 3h6' />
		<path d='M10 9V3' />
		<path d='M14 9V3' />
		<path d='M10 9a8.1 8.1 0 0 0-3.7 5.1L4 21h16l-2.3-6.9A8.1 8.1 0 0 0 14 9' />
	</svg>
);

const DnaIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M8 3c.5 0 .5.5 1 1s-.5 1-1 1-.5-.5-1-1 .5-1 1-1Z' />
		<path d='M16 3c.5 0 .5.5 1 1s-.5 1-1 1-.5-.5-1-1 .5-1 1-1Z' />
		<path d='M12 7c.5 0 .5.5 1 1s-.5 1-1 1-.5-.5-1-1 .5-1 1-1Z' />
		<path d='M8 11c.5 0 .5.5 1 1s-.5 1-1 1-.5-.5-1-1 .5-1 1-1Z' />
		<path d='M16 11c.5 0 .5.5 1 1s-.5 1-1 1-.5-.5-1-1 .5-1 1-1Z' />
		<path d='M12 15c.5 0 .5.5 1 1s-.5 1-1 1-.5-.5-1-1 .5-1 1-1Z' />
		<path d='M8 19c.5 0 .5.5 1 1s-.5 1-1 1-.5-.5-1-1 .5-1 1-1Z' />
		<path d='M16 19c.5 0 .5.5 1 1s-.5 1-1 1-.5-.5-1-1 .5-1 1-1Z' />
		<path d='M9 4.5c3 0 3 4 6 4s3-4 6-4' />
		<path d='M15 4.5c-3 0-3 4-6 4s-3-4-6-4' />
		<path d='M9 12.5c3 0 3 4 6 4s3-4 6-4' />
		<path d='M15 12.5c-3 0-3 4-6 4s-3-4-6-4' />
		<path d='M9 20.5c3 0 3 4 6 4' />
		<path d='M15 20.5c-3 0-3 4-6 4' />
	</svg>
);

export const UploadMethodSelect = () => {
	interface CardItem {
		icon: React.ReactNode;
		title: string;
		content: string;
		url?: string;
		disabled?: boolean;
		tag?: string;
	}
	const cardItems: CardItem[] = [
		{
			icon: <QueryIcon />,
			title: "Take quiz",
			content:
				"Answer a few quick questions to receive a personalised health plan tailored to your needs.",
			disabled: true,
			tag: "5 min",
		},
		{
			icon: <ShoppingCartPlusIcon />,
			title: "Buy Supplements, Peptides, & Diagnostic Tests",
			content:
				" Order custom-formulated supplements designed specifically for your health goals and genetic profile.",
			disabled: true,
			tag: "Shop",
		},
		{
			icon: <UploadCloudIcon />,
			title: "Upload files",
			content:
				"Securely upload your test results to get precise recommendations based on your medical history.",
			url: paths.config.importOrUpload,
			tag: "Recommended",
		},

		{
			icon: <AppsIcon />,
			title: "Connect a device app",
			content:
				"Sync your favorite health tracking apps and devices for real-time insights and better health monitoring.",
			url: paths.config.connectApp,
			tag: "Popular",
			disabled: true,
		},
		{
			icon: <TargetIcon />,
			title: "Health Goals",
			content:
				"Set personalized health goals and track your progress over time.",
			url: paths.config.goals,
			tag: "New",
		},
		{
			icon: <FileTextIcon />,
			title: "Health Reports",
			content:
				"View comprehensive reports based on your health data and analysis.",
			url: paths.config.reports,
			tag: "New",
		},
		{
			icon: <FlaskIcon />,
			title: "Health Tests",
			content:
				"Explore available health tests and order new ones to keep your profile up to date.",
			url: paths.config.tests,
			tag: "New",
		},
		{
			icon: <DnaIcon />,
			title: "DNA Analysis",
			content:
				"Explore your unique genetic blueprint, from nutrigenomics to fitness traits.",
			url: paths.config.genomics,
			tag: "Beta",
		},
	];

	return (
		<>
			<div className={styles["config-items-wrapper"]}>
				{cardItems.map((card, index) => (
					<ConfigItemCard
						key={card.title}
						{...card}
						style={{ animationDelay: `${index * 0.08}s` }}
					/>
				))}
			</div>
		</>
	);
};
