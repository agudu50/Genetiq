import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import path from "path";
import { fileURLToPath } from "url";

// Resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	base: "/",
	plugins: [react(), svgr()],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (!id.includes("node_modules")) return;

					if (
						id.includes("three") ||
						id.includes("@react-three") ||
						id.includes("postprocessing")
					) {
						return "three-vendor";
					}
					if (id.includes("framer-motion")) {
						return "motion-vendor";
					}
					if (
						id.includes("react-dom") ||
						id.includes("react-router") ||
						id.includes("/react/")
					) {
						return "react-vendor";
					}
					if (id.includes("@reduxjs") || id.includes("react-redux")) {
						return "redux-vendor";
					}
				},
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@assets": path.resolve(__dirname, "src/assets"),
			"@features": path.resolve(__dirname, "src/Features"),
			"@services": path.resolve(__dirname, "src/Services"),
			"@views": path.resolve(__dirname, "src/Views"),
			"@utils": path.resolve(__dirname, "src/Utils"),
			"@variables": path.resolve(__dirname, "src/App/Styles/_variables.scss"),
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use "@variables" as *;`,
			},
		},
	},
	server: {
		port: 5174,
		strictPort: false,
		host: true,
		proxy: {
			"/api": {
				target: process.env.VITE_API_URL || "https://genetiq-server.onrender.com",
				changeOrigin: true,
				secure: false,
				configure: (proxy) => {
					proxy.on("error", (err, req, res) => {
						console.warn(`[vite proxy error] ${req.url}: ${err.message}`);
						if (res && !res.headersSent) {
							res.writeHead(502, { "Content-Type": "application/json" });
							res.end(
								JSON.stringify({
									error: "Backend server is currently restarting or unreachable. Please try again.",
								})
							);
						}
					});
				},
			},
		},
	},
	preview: {
		port: 4173,
		strictPort: false,
	},
});
