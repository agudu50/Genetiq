import { useRouteError } from "react-router-dom";
import { isChunkLoadError, reloadForStaleAssets } from "./lazyWithRetry";

const RouteErrorFallback = () => {
	const error = useRouteError();
	const isStaleAssets = isChunkLoadError(error);

	const handleReload = () => {
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
				background: "#0b0f19",
				color: "#e8ecf4",
				fontFamily: "Inter, system-ui, sans-serif",
			}}
		>
			<div
				style={{
					maxWidth: "420px",
					width: "100%",
					padding: "2rem",
					borderRadius: "16px",
					background: "rgba(255, 255, 255, 0.04)",
					border: "1px solid rgba(255, 255, 255, 0.08)",
					textAlign: "center",
				}}
			>
				<h1 style={{ margin: "0 0 0.75rem", fontSize: "1.35rem" }}>
					{isStaleAssets ? "Update available" : "Something went wrong"}
				</h1>
				<p style={{ margin: "0 0 1.5rem", lineHeight: 1.6, opacity: 0.8 }}>
					{isStaleAssets
						? "A newer version of Genetiq was deployed. Reload to fetch the latest app files."
						: "The page failed to load. Try refreshing, or return to the dashboard."}
				</p>
				<button
					type="button"
					onClick={isStaleAssets ? reloadForStaleAssets : handleReload}
					style={{
						border: "none",
						borderRadius: "999px",
						padding: "0.75rem 1.25rem",
						background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
						color: "#fff",
						fontWeight: 600,
						cursor: "pointer",
					}}
				>
					Reload Genetiq
				</button>
			</div>
		</div>
	);
};

export default RouteErrorFallback;
