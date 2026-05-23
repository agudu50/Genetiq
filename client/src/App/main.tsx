import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./Styles/Global.scss";
import App from "./App";
import { Provider } from "react-redux";
import store from "./Redux/store";
import { ToastContainer } from "react-toastify";
import { LanguageProvider } from "./i18n/LanguageContext";
import { SuiProviders } from "./Providers/SuiProviders";

createRoot(document.getElementById("root")!).render(
	<Provider store={store}>
		<StrictMode>
			<SuiProviders>
				<LanguageProvider>
					<App />
					<ToastContainer />
				</LanguageProvider>
			</SuiProviders>
		</StrictMode>
	</Provider>,
);
