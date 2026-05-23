import { useLocation, useNavigate } from "react-router-dom";
import styles from "./NavigationBar.module.scss";
import ArrowRightIcon from "@assets/General/ArrowRight.svg?react";
import LeftIcon from "@assets/General/Left.svg?react";
import { paths } from "@/App/Routes/Paths";

interface NavigationBarProps {
	disabled?: boolean;
	done?: boolean;
	setIsOpenedConfirmModal: (open: boolean) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
	disabled,
	done,
	setIsOpenedConfirmModal,
}) => {
	const navigate = useNavigate();
	const location = useLocation();
	return (
		<div className={styles["navigation-bar-container"]}>
			<button
				className={styles["back"]}
				onClick={() => {
					navigate(paths.config.root);
				}}
			>
				<LeftIcon /> Back
			</button>
			<button
				disabled={disabled}
				className={`${styles["submit"]} ${disabled ? styles["disabled-submit"] : ""}`}
				onClick={() => {
					if (location.pathname === paths.config.connectApp) {
						navigate(paths.config.importOrUpload);
					}
					if (!done) {
						setIsOpenedConfirmModal(true);
					} else {
						navigate(paths.dashboard.root);
					}
				}}
			>
				{done ? "Proceed to Digital twin" : "Submit My Health Data"}{" "}
				<ArrowRightIcon />
			</button>
		</div>
	);
};
