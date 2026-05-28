export const paths = {
	landing: "/",
	auth: {
		login: "/login",
		register: "/register",
	},
	dashboard: {
		root: "/dashboard",
		system: "/dashboard/:systemName",
		detailedRisk: "/dashboard/:systemName/:riskName",
	},
	config: {
		root: "/config",
		importOrUpload: "/config/import-or-upload",
		connectApp: "/config/connect-app",
		goals: "/config/goals",
		reports: "/config/reports",
		tests: "/config/tests",
		genomics: "/config/genomics",
	},
	log: {
		vitals: "/log/vitals",
		meal: "/log/meal",
		exercise: "/log/exercise",
	},
	aiAssistant: "/ai-assistant",
	clinicalHistory: "/clinical-history",
	terms: "/terms",
	privacy: "/privacy",
};
