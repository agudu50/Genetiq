import { RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";
import { paths } from "./Paths";
import GlobalLayout from "../Layouts/GlobalLayout";
import MainLayout from "../Layouts/MainLayout";
import AuthLayout from "../Layouts/Auth/AuthLayout";
import { ConfigLayout } from "../Layouts/ConfigLayout";

const Landing = lazy(() => import("@/Views/Landing/Landing"));
const Dashboard = lazy(() => import("@/Views/Dashboard/Dashboard"));
const Login = lazy(() => import("@/Views/Auth/Login/Login"));
const Register = lazy(() => import("@/Views/Auth/Register/Register"));
const Config = lazy(() => import("@/Views/UploadMethod/UploadMethod"));
const ImportOrUpload = lazy(
	() => import("@/Views/UploadMethod/ImportOrUpload/ImportOrUpload"),
);
const ConnectAppDevice = lazy(
	() => import("@/Views/UploadMethod/ConnectAppDevice/ConnectAppDevice"),
);
const Goals = lazy(() => import("@/Views/UploadMethod/Goals/Goals"));
const Reports = lazy(() => import("@/Views/UploadMethod/Reports/Reports"));
const Tests = lazy(() => import("@/Views/UploadMethod/Tests/Tests"));
const Genomics = lazy(() => import("@/Views/UploadMethod/Genomics/Genomics"));
const DetailedRisk = lazy(() => import("@/Views/DetailedRisk/DetailedRisk"));
const SystemOverview = lazy(
	() => import("@/Views/SystemOverview/SystemOverview"),
);
const LogVitals = lazy(() => import("@/Views/Dashboard/Logs/LogVitals"));
const TrackMeal = lazy(() => import("@/Views/Dashboard/Logs/TrackMeal"));
const LogExercise = lazy(() => import("@/Views/Dashboard/Logs/LogExercise"));
const AIAssistant = lazy(() => import("@/Views/Dashboard/Logs/AIAssistant"));
const HealthHistory = lazy(() => import("@/Views/HealthHistory/HealthHistory"));
const Terms = lazy(() => import("@/Views/Legal/Terms/Terms"));
const Privacy = lazy(() => import("@/Views/Legal/Privacy/Privacy"));

const Lazy = ({ children }: { children: React.ReactNode }) => (
	<Suspense fallback={null}>{children}</Suspense>
);

const RoutesConfig: RouteObject[] = [
	{
		element: <GlobalLayout />,
		path: "",
		children: [
			// Standalone Landing page (no layout wrapper)
			{
				path: paths.landing,
				element: (
					<Lazy>
						<Landing />
					</Lazy>
				),
			},
			{
				path: paths.clinicalHistory,
				element: (
					<Lazy>
						<HealthHistory />
					</Lazy>
				),
			},
			{
				path: paths.terms,
				element: (
					<Lazy>
						<Terms />
					</Lazy>
				),
			},
			{
				path: paths.privacy,
				element: (
					<Lazy>
						<Privacy />
					</Lazy>
				),
			},
			// Auth routes
			{
				element: <AuthLayout />,
				path: "",
				children: [
					{
						element: (
							<Lazy>
								<Login />
							</Lazy>
						),
						path: paths.auth.login,
					},
					{
						element: (
							<Lazy>
								<Register />
							</Lazy>
						),
						path: paths.auth.register,
					},
				],
			},
			// Main application routes (Dashboard, logs, etc.)
			{
				element: <MainLayout />,
				path: "",
				children: [
					{
						element: (
							<Lazy>
								<Dashboard />
							</Lazy>
						),
						path: paths.dashboard.root,
					},
					{
						element: (
							<Lazy>
								<SystemOverview />
							</Lazy>
						),
						path: paths.dashboard.system,
					},
					{
						element: (
							<Lazy>
								<DetailedRisk />
							</Lazy>
						),
						path: paths.dashboard.detailedRisk,
					},
					{
						element: (
							<Lazy>
								<LogVitals />
							</Lazy>
						),
						path: paths.log.vitals,
					},
					{
						element: (
							<Lazy>
								<TrackMeal />
							</Lazy>
						),
						path: paths.log.meal,
					},
					{
						element: (
							<Lazy>
								<LogExercise />
							</Lazy>
						),
						path: paths.log.exercise,
					},
					{
						element: (
							<Lazy>
								<AIAssistant />
							</Lazy>
						),
						path: paths.aiAssistant,
					},
				],
			},
			// Config routes — own layout with its own navbar, no MainLayout
			{
				element: <ConfigLayout />,
				path: paths.config.root,
				children: [
					{
						element: (
							<Lazy>
								<Config />
							</Lazy>
						),
						path: paths.config.root,
					},
					{
						element: (
							<Lazy>
								<ImportOrUpload />
							</Lazy>
						),
						path: paths.config.importOrUpload,
					},
					{
						element: (
							<Lazy>
								<ConnectAppDevice />
							</Lazy>
						),
						path: paths.config.connectApp,
					},
					{
						element: (
							<Lazy>
								<Goals />
							</Lazy>
						),
						path: paths.config.goals,
					},
					{
						element: (
							<Lazy>
								<Reports />
							</Lazy>
						),
						path: paths.config.reports,
					},
					{
						element: (
							<Lazy>
								<Tests />
							</Lazy>
						),
						path: paths.config.tests,
					},
					{
						element: (
							<Lazy>
								<Genomics />
							</Lazy>
						),
						path: paths.config.genomics,
					},
				],
			},
		],
	},
];

export default RoutesConfig;
