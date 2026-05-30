import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navigation from "./Navigation";
import { describe, it, expect, vi } from "vitest";
import { paths } from "@/App/Routes/Paths";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useNavigate: () => mockNavigate,
		useLocation: () => ({
			pathname: "/dashboard",
		}),
	};
});

describe("Navigation Component", () => {
	it("renders all navigation buttons", () => {
		render(
			<MemoryRouter>
				<Navigation />
			</MemoryRouter>,
		);

		expect(screen.getByText("dashboard_nav")).toBeInTheDocument();
	});

	it("navigates to the correct path when a button is clicked", () => {
		render(
			<MemoryRouter>
				<Navigation />
			</MemoryRouter>,
		);

		fireEvent.click(screen.getByText("dashboard_nav"));
		expect(mockNavigate).toHaveBeenCalledWith(paths.dashboard.root);
	});
});
