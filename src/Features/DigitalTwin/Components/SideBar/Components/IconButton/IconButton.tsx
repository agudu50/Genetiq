import styles from "./IconButton.module.scss";

interface IconButtonProps {
	children: React.ReactNode;
	onClick?: () => void;
	active?: boolean;
	disabled?: boolean;
	tooltip?: string;
}

export const IconButton = ({
	children,
	onClick = () => null,
	active = false,
	disabled = false,
	tooltip,
}: IconButtonProps) => {
	return (
		<button
			onClick={disabled ? undefined : onClick}
			className={`${styles["icon-button"]} ${active ? styles["active"] : ""} ${disabled ? styles["disabled"] : ""}`}
			data-tooltip={tooltip}
		>
			{children}
		</button>
	);
};

export default IconButton;
