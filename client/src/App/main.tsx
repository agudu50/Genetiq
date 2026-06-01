import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./Styles/Global.scss";
import App from "./App";
import { Provider } from "react-redux";
import store from "./Redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LanguageProvider } from "./i18n/LanguageContext";
import { reloadForStaleAssets } from "./Routes/lazyWithRetry";

window.addEventListener("vite:preloadError", (event) => {
	event.preventDefault();
	reloadForStaleAssets();
});

createRoot(document.getElementById("root")!).render(
	<Provider store={store}>
		<StrictMode>
			<LanguageProvider>
				<App />
				<ToastContainer />
			</LanguageProvider>
		</StrictMode>
	</Provider>,
);
