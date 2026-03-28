import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";
import { describe, it, expect, vi, beforeEach } from "vitest";
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

describe("Navbar Component (Mobile)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Simulate mobile window width
		global.innerWidth = 375;
		global.dispatchEvent(new Event("resize"));
	});

	it("navigates to the correct path when a bottom tab is clicked", () => {
		render(
			<MemoryRouter>
				<Navbar />
			</MemoryRouter>,
		);

		// Bottom tabs have labels
		fireEvent.click(screen.getByText("goals_nav"));
		expect(mockNavigate).toHaveBeenCalledWith(paths.config.goals);

		fireEvent.click(screen.getByText("reports_nav"));
		expect(mockNavigate).toHaveBeenCalledWith(paths.config.reports);

		fireEvent.click(screen.getByText("tests_nav"));
		expect(mockNavigate).toHaveBeenCalledWith(paths.config.tests);
	});
});
