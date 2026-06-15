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
		port: 5173,
		strictPort: false,
		host: true,
	},
	preview: {
		port: 4173,
		strictPort: false,
	},
});
