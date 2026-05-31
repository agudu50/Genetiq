import React, { useState, useEffect } from "react";
import BellIcon from "@assets/Navbar/Icons/profile.svg?react";
import styles from "./Profile.module.scss";

interface ProfileProps {
	disabled?: boolean;
}

const Profile: React.FC<ProfileProps> = ({
	disabled = false,
}) => {
	const [hasUnreadTips, setHasUnreadTips] = useState(false);

	const checkUnreadStatus = () => {
		const today = new Date();
		const currentSeed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
		
		const tipsReadSeed = localStorage.getItem("genetiq_tips_read_seed");
		const examCompletedSeed = localStorage.getItem("genetiq_exam_completed_seed");
		
		const tipsUnread = tipsReadSeed !== String(currentSeed);
		const examUncomplete = examCompletedSeed !== String(currentSeed);
		
		setHasUnreadTips(tipsUnread || examUncomplete);
	};

	useEffect(() => {
		// Perform initial check on mount
		checkUnreadStatus();

		const handleTipsRead = () => {
			checkUnreadStatus();
		};

		// Listen for custom read event and storage synchronizations
		window.addEventListener("genetiq_tips_read", handleTipsRead);
		window.addEventListener("storage", handleTipsRead);

		return () => {
			window.removeEventListener("genetiq_tips_read", handleTipsRead);
			window.removeEventListener("storage", handleTipsRead);
		};
	}, []);

	const handleNotificationClick = () => {
		console.log("open profile");
		// Clear badge by marking both as completed today when clicking directly
		const today = new Date();
		const currentSeed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
		localStorage.setItem("genetiq_tips_read_seed", String(currentSeed));
		localStorage.setItem("genetiq_exam_completed_seed", String(currentSeed));
		setHasUnreadTips(false);
		window.dispatchEvent(new Event("genetiq_tips_read"));
	};

	return (
		<button
			className={styles["notification-button"]}
			onClick={handleNotificationClick}
			disabled={disabled}
			style={{ position: "relative" }}
		>
			<BellIcon />
			{hasUnreadTips && <div className={styles["badge"]} />}
		</button>
	);
};

export default Profile;
