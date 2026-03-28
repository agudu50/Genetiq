import {
	useCurrentAccount,
	useWalletConnection,
	useWallets,
	useDAppKit,
} from "@mysten/dapp-kit-react";
import { useDispatch } from "react-redux";
import { setWalletInfo } from "@/App/Redux/userSlice";
import { useNavigate } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";
import { toast } from "react-toastify";
import styles from "./WalletConnectButton.module.scss";
import React, { useEffect, useState } from "react";

interface WalletConnectButtonProps {
	mode?: "login" | "register";
}

const SuiLogo = () => (
	<svg width='20' height='20' viewBox='0 0 36 44' fill='none'>
		<path
			d='M24.625 22.596c1.307 1.842 2.089 4.089 2.089 6.52 0 4.95-3.198 9.148-7.637 10.655a11.072 11.072 0 0 1-1.077.312 11.126 11.126 0 0 1-2.399.264c-.833 0-1.644-.092-2.424-.267a11.058 11.058 0 0 1-1.051-.306C7.685 38.27 4.486 34.07 4.486 29.117c0-2.432.782-4.679 2.09-6.521L14.6 11.637a2.14 2.14 0 0 1 1.8-.988c.733 0 1.388.378 1.8.988l8.025 10.959z'
			fill='#6FBCF0'
		/>
		<path
			d='M28.977 14.357L18.2.644A2.14 2.14 0 0 0 16.4.003c-.733 0-1.388.256-1.8.641L3.822 14.357A17.94 17.94 0 0 0 0 25.42c0 7.163 4.178 13.34 10.224 16.242a18.096 18.096 0 0 0 3.377 1.27 18.108 18.108 0 0 0 4.8.644c1.66 0 3.272-.222 4.8-.644a18.096 18.096 0 0 0 3.376-1.27C32.622 38.76 36.8 32.583 36.8 25.42c0-4.16-1.415-7.991-3.823-11.063z'
			fill='#4DA2FF'
		/>
	</svg>
);

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
	mode = "login",
}) => {
	const dAppKit = useDAppKit();
	const wallets = useWallets();
	const connection = useWalletConnection();
	const account = useCurrentAccount();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [hasNavigated, setHasNavigated] = useState(false);
	const [isConnectingLocal, setIsConnectingLocal] = useState(false);

	useEffect(() => {
		if (account && isConnectingLocal && !hasNavigated) {
			setIsConnectingLocal(false);
			setHasNavigated(true);
			dispatch(
				setWalletInfo({
					walletAddress: account.address,
					isWalletConnected: true,
				}),
			);
			toast.success(
				mode === "login"
					? "Wallet connected! Welcome back."
					: "Wallet connected! Account created.",
			);
			navigate(paths.config.root);
		}
	}, [account, dispatch, navigate, mode, hasNavigated, isConnectingLocal]);

	const handleConnect = async () => {
		if (wallets.length === 0) {
			toast.error(
				"No Sui wallet detected. Please install a Sui wallet extension (e.g., Sui Wallet, Suiet).",
			);
			return;
		}

		setIsConnectingLocal(true);
		setHasNavigated(false);

		try {
			await dAppKit.connectWallet({ wallet: wallets[0] });
		} catch (err: unknown) {
			setIsConnectingLocal(false);
			const message = err instanceof Error ? err.message : "Unknown error";
			toast.error(`Connection failed: ${message}`);
		}
	};

	const handleDisconnect = async () => {
		try {
			await dAppKit.disconnectWallet();
			dispatch(setWalletInfo({ walletAddress: "", isWalletConnected: false }));
			setHasNavigated(false);
			toast.info("Wallet disconnected.");
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Unknown error";
			toast.error(`Disconnect failed: ${message}`);
		}
	};

	if (connection.isConnected && account) {
		const shortAddr = `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;
		return (
			<button
				type='button'
				className={`${styles.walletBtn} ${styles.connected}`}
				onClick={handleDisconnect}
			>
				<SuiLogo />
				<span>{shortAddr}</span>
				<span className={styles.disconnectHint}>Disconnect</span>
			</button>
		);
	}

	return (
		<button
			type='button'
			className={styles.walletBtn}
			onClick={handleConnect}
			disabled={connection.isConnecting}
		>
			<SuiLogo />
			<span>
				{connection.isConnecting ? "Connecting..." : "Connect Sui Wallet"}
			</span>
		</button>
	);
};
