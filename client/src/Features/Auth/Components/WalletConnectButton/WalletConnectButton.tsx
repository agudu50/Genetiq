import { useDispatch } from "react-redux";
import { setWalletInfo } from "@/App/Redux/userSlice";
import { useNavigate } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";
import { toast } from "react-toastify";
import styles from "./WalletConnectButton.module.scss";
import React from "react";
import { ArrowRight } from "lucide-react";

interface WalletConnectButtonProps {
	mode?: "login" | "register";
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
	mode = "login",
}) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleConnect = () => {
		dispatch(
			setWalletInfo({
				walletAddress: "",
				isWalletConnected: true,
			}),
		);
		toast.success(
			mode === "login"
				? "Welcome back!"
				: "Account created successfully!",
		);
		navigate(paths.config.root);
	};

	return (
		<button
			type='button'
			className={styles.walletBtn}
			onClick={handleConnect}
		>
			<ArrowRight size={20} />
			<span>
				{mode === "login" ? "Sign In" : "Create Account"}
			</span>
		</button>
	);
};
