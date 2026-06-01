import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";

export default function LogVitals() {
	const user = useSelector((state: RootState) => state.user);
	const { firstName, lastName, walletAddress, isWalletConnected } = user;

	// Get display name
	const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || "User";
	
	// Get user identifier: wallet if connected, otherwise name
	const userIdentifier = isWalletConnected && walletAddress ? walletAddress : displayName;

	return (
		<div>
			<h1>Log Vitals</h1>
			<div>
				<p><strong>User:</strong> {displayName}</p>
				<p><strong>ID:</strong> {userIdentifier}</p>
				{isWalletConnected && walletAddress && (
					<p><strong>Wallet:</strong> {walletAddress}</p>
				)}
			</div>
			<p>Log your vital signs here.</p>
		</div>
	);
}

