import { useState, useEffect, useRef } from "react";
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
}

const Dropdown = ({ value, onChange }: DropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selected =
		options.find((option) => option.value === value) || options[0];

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	const handleSelect = (option: DropdownOption) => {
		if (option.value === value) {
			setIsOpen(false);
			return;
		}

		onChange(option.value);
		setIsOpen(false);
	};

	const getOptionIcon = (optionValue: string) => {
		if (optionValue === "total") {
			return (
				<span
					className={`${styles.optionIcon} ${styles.optionIconTotal}`}
				>
					⬡
				</span>
			);
		}
		return (
			<span
				className={`${styles.optionIcon} ${styles.optionIconCardio}`}
			>
				♥
			</span>
		);
	};

	return (
		<div className={styles.dropdown} ref={dropdownRef}>
			<button
				className={`${styles.trigger} ${value === "cardio" ? styles.active : ""}`}
				onClick={() => setIsOpen(!isOpen)}
				type='button'
			>
				<div className={styles.labelContainer}>
					<span className={styles.statusDot} />
					<div
						className={`${styles.label} ${value === "cardio" ? styles.activeLabel : ""}`}
					>
						{selected.label}
					</div>
					<div className={styles.divider} />
					<svg
						width='14'
						height='14'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2.5'
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
							{getOptionIcon(option.value)}
							{option.label}
							<span
								className={`${styles.checkMark} ${option.value === value ? styles.visible : ""}`}
							>
								✓
							</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default Dropdown;
