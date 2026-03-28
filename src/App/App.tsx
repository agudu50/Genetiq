import { RouterProvider } from "react-router-dom";
import "./Styles/Global.scss";
import Router from "./Routes/Router";
import { ThemeProvider } from "@/App/theme/ThemeContext";

function App() {
	return (
		<ThemeProvider>
			<RouterProvider router={Router} />
		</ThemeProvider>
	);
}

export default App;
