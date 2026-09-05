import { useEffect, useState } from "react";
import { useRouteError } from "react-router-dom";
import { isChunkLoadError, reloadForStaleAssets } from "./lazyWithRetry";

const RouteErrorFallback = () => {
	const error = useRouteError();
	const isStale = isChunkLoadError(error);
	const [secondsLeft, setSecondsLeft] = useState(2);

	useEffect(() => {
		console.error("Genetiq Route caught error:", error);

		if (isStale) {
			reloadForStaleAssets();
			return;
		}

		// Auto-recovery countdown to dashboard
		const timer = setInterval(() => {
			setSecondsLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					sessionStorage.removeItem("genetiq:chunk-reload");
					window.location.href = "/dashboard";
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [error, isStale]);

	const handleGoDashboard = () => {
		sessionStorage.removeItem("genetiq:chunk-reload");
		window.location.href = "/dashboard";
	};

	const handleHardReload = () => {
		sessionStorage.removeItem("genetiq:chunk-reload");
		window.location.reload();
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "2rem",
				background: "#0d0d0d",
				color: "#f8fafc",
				fontFamily: "Inter, system-ui, sans-serif",
			}}
		>
			<div
				style={{
					maxWidth: "440px",
					width: "100%",
					padding: "2.2rem 2rem",
					borderRadius: "14px",
					background: "#141414",
					border: "1px solid rgba(255, 255, 255, 0.12)",
					textAlign: "center",
					boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
				}}
			>
				<div
					style={{
						width: "48px",
						height: "48px",
						borderRadius: "12px",
						background: "rgba(0, 168, 150, 0.12)",
						border: "1px solid rgba(0, 168, 150, 0.35)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						margin: "0 auto 1.25rem",
						color: "#00a896",
					}}
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
					</svg>
				</div>

				<h1 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", fontWeight: 700, color: "#ffffff" }}>
					Restoring Genetiq Session
				</h1>
				<p style={{ margin: "0 0 1.5rem", fontSize: "0.85rem", lineHeight: 1.5, color: "rgba(255, 255, 255, 0.6)" }}>
					Refreshing telemetry and reconnecting to clinical workspace ({secondsLeft}s)...
				</p>

				<div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
					<button
						type="button"
						onClick={handleGoDashboard}
						style={{
							border: "none",
							borderRadius: "8px",
							padding: "0.65rem 1.25rem",
							background: "#00a896",
							color: "#ffffff",
							fontSize: "0.82rem",
							fontWeight: 600,
							cursor: "pointer",
							transition: "background 0.2s",
						}}
					>
						Return to Dashboard
					</button>

					<button
						type="button"
						onClick={handleHardReload}
						style={{
							border: "1px solid rgba(255, 255, 255, 0.14)",
							borderRadius: "8px",
							padding: "0.65rem 1.1rem",
							background: "rgba(255, 255, 255, 0.05)",
							color: "rgba(255, 255, 255, 0.8)",
							fontSize: "0.82rem",
							fontWeight: 600,
							cursor: "pointer",
						}}
					>
						Refresh
					</button>
				</div>
			</div>
		</div>
	);
};

export default RouteErrorFallback;

