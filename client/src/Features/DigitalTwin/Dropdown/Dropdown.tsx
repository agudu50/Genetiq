import { useState } from "react";
import styles from "./Dropdown.module.scss";

interface DropdownOption {
	label: string;
	value: "total" | "cardio";
}

const options: DropdownOption[] = [
	{ label: "Total Health", value: "total" },
	{ label: "Cardiovascular", value: "cardio" },
];

interface DropdownProps {
	value: "total" | "cardio";
	onChange: (value: "total" | "cardio") => void;
	onModelChange: (
		type: "body" | "cardio",
		cameraConfig: {
			position: [number, number, number];
			zoom: number;
		},
	) => void;
}

const Dropdown = ({ value, onChange, onModelChange }: DropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const selected =
		options.find((option) => option.value === value) || options[0];

	const zoomConfigs = {
		total: {
			position: [0, 6, 200] as [number, number, number],
			zoom: 10,
			modelType: "body" as const,
		},
		cardio: {
			position: [0, 15, 200] as [number, number, number],
			zoom: 20,
			modelType: "cardio" as const,
		},
	};

	const handleSelect = (option: DropdownOption) => {
		if (option.value === value) {
			setIsOpen(false);
			return;
		}

		onChange(option.value);
		setIsOpen(false);

		const config = zoomConfigs[option.value];
		if (config) {
			onModelChange(config.modelType, {
				position: config.position,
				zoom: config.zoom,
			});
		}
	};

	return (
		<div className={styles.dropdown}>
			<button
				className={`${styles.trigger} ${value === "cardio" ? styles.active : ""}`}
				onClick={() => setIsOpen(!isOpen)}
				type='button'
			>
				<div className={styles.labelContainer}>
					<div
						className={`${styles.label} ${value === "cardio" ? styles.activeLabel : ""}`}
					>
						{selected.label}
					</div>
					<div className={styles.divider} />
					<svg
						width='16'
						height='16'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className={`${styles.icon} ${isOpen ? styles.rotated : ""}`}
					>
						<polyline points='6 9 12 15 18 9'></polyline>
					</svg>
				</div>
			</button>

			{isOpen && (
				<div className={styles.menu}>
					{options.map((option) => (
						<button
							key={option.value}
							className={`${styles.option} ${option.value === value ? styles.activeOption : ""}`}
							onClick={() => handleSelect(option)}
							type='button'
						>
							{option.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default Dropdown;
