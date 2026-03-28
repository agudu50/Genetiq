import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import path from "path";
import { fileURLToPath } from "url";

// Resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	base: "/", // Adjust if deploying to a subdirectory
	plugins: [react(), svgr()],
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
		port: 3000,
		strictPort: true,
		host: true,
		origin: "http://localhost:3000",
	},
	preview: {
		port: 3000,
		strictPort: true,
	},
});
