import React from "react";
import BellIcon from "@assets/Navbar/Icons/profile.svg?react";
import styles from "./Profile.module.scss";

interface ProfileProps {
	// onClick: () => void;
	disabled?: boolean;
}

const Profile: React.FC<ProfileProps> = ({
	// onClick,
	disabled = false,
}) => (
	<button
		className={styles["notification-button"]}
		onClick={() => console.log("open profile")}
		disabled={disabled}
	>
		<BellIcon />
	</button>
);

export default Profile;
