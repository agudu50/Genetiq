import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock LanguageContext
vi.mock("@/App/i18n/LanguageContext", () => ({
	useLanguage: () => ({
		lang: "en",
		setLang: vi.fn(),
		t: (key: string) => key,
	}),
}));

// Mock ThemeContext
vi.mock("@/App/theme/ThemeContext", () => ({
	useTheme: () => ({
		theme: "light",
		setTheme: vi.fn(),
		toggleTheme: vi.fn(),
	}),
}));

// Mock Search (used in Navbar)
vi.mock("@/Features/Dashboard/Search/Search", () => ({
	default: () => "SearchBox",
}));

// Mock Assets
vi.mock("@assets/Navbar/Icons/Dashboard.svg?react", () => ({
	default: () => "DashboardIcon",
}));
vi.mock("@assets/Navbar/Icons/Reports.svg?react", () => ({
	default: () => "ReportsIcon",
}));
vi.mock("@assets/Navbar/Icons/History.svg?react", () => ({
	default: () => "HistoryIcon",
}));
vi.mock("@assets/Navbar/Icons/Goals.svg?react", () => ({
	default: () => "GoalsIcon",
}));
vi.mock("@assets/Navbar/Icons/Test.svg?react", () => ({
	default: () => "TestIcon",
}));
vi.mock("@assets/General/LogoGenetiq.svg?react", () => ({
	default: () => "Logo",
}));
vi.mock("@assets/Navbar/Icons/Notification.svg?react", () => ({
	default: () => "Notification",
}));
