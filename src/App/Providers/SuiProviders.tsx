import { DAppKitProvider } from "@mysten/dapp-kit-react";
import { createDAppKit } from "@mysten/dapp-kit-core";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const queryClient = new QueryClient();

const NETWORKS = ["testnet", "mainnet"] as const;

const GRPC_URLS: Record<string, string> = {
	testnet: "https://fullnode.testnet.sui.io:443",
	mainnet: "https://fullnode.mainnet.sui.io:443",
};

const dAppKit = createDAppKit({
	networks: [...NETWORKS],
	createClient: (network) => {
		return new SuiGrpcClient({
			network,
			baseUrl: GRPC_URLS[network] || GRPC_URLS.testnet,
		});
	},
	defaultNetwork: "testnet",
	autoConnect: true,
});

interface SuiProvidersProps {
	children: React.ReactNode;
}

export const SuiProviders: React.FC<SuiProvidersProps> = ({ children }) => {
	return (
		<QueryClientProvider client={queryClient}>
			<DAppKitProvider dAppKit={dAppKit}>{children}</DAppKitProvider>
		</QueryClientProvider>
	);
};
