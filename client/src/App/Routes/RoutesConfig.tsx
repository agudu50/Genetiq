import { RouteObject } from "react-router-dom";
import { Suspense } from "react";
import { paths } from "./Paths";
import GlobalLayout from "../Layouts/GlobalLayout";
import MainLayout from "../Layouts/MainLayout";
import AuthLayout from "../Layouts/Auth/AuthLayout";
import { ConfigLayout } from "../Layouts/ConfigLayout";
import RouteErrorFallback from "./RouteErrorFallback";
import { lazyWithRetry } from "./lazyWithRetry";

const Landing = lazyWithRetry(() => import("@/Views/Landing/Landing"));
const Dashboard = lazyWithRetry(() => import("@/Views/Dashboard/Dashboard"));
const Login = lazyWithRetry(() => import("@/Views/Auth/Login/Login"));
const Register = lazyWithRetry(() => import("@/Views/Auth/Register/Register"));
const Config = lazyWithRetry(() => import("@/Views/UploadMethod/UploadMethod"));
const ImportOrUpload = lazyWithRetry(
	() => import("@/Views/UploadMethod/ImportOrUpload/ImportOrUpload"),
);
const ConnectAppDevice = lazyWithRetry(
	() => import("@/Views/UploadMethod/ConnectAppDevice/ConnectAppDevice"),
);
const Goals = lazyWithRetry(() => import("@/Views/UploadMethod/Goals/Goals"));
const Reports = lazyWithRetry(() => import("@/Views/UploadMethod/Reports/Reports"));
const Tests = lazyWithRetry(() => import("@/Views/UploadMethod/Tests/Tests"));
const Genomics = lazyWithRetry(() => import("@/Views/UploadMethod/Genomics/Genomics"));
const DetailedRisk = lazyWithRetry(() => import("@/Views/DetailedRisk/DetailedRisk"));
const SystemOverview = lazyWithRetry(
	() => import("@/Views/SystemOverview/SystemOverview"),
);
const LogVitals = lazyWithRetry(() => import("@/Views/Dashboard/Logs/LogVitals"));
const TrackMeal = lazyWithRetry(() => import("@/Views/Dashboard/Logs/TrackMeal"));
const LogExercise = lazyWithRetry(() => import("@/Views/Dashboard/Logs/LogExercise"));
const AIAssistant = lazyWithRetry(() => import("@/Views/Dashboard/Logs/AIAssistant"));
const HealthHistory = lazyWithRetry(() => import("@/Views/HealthHistory/HealthHistory"));
const Terms = lazyWithRetry(() => import("@/Views/Legal/Terms/Terms"));
const Privacy = lazyWithRetry(() => import("@/Views/Legal/Privacy/Privacy"));

const Lazy = ({ children }: { children: React.ReactNode }) => (
	<Suspense fallback={null}>{children}</Suspense>
);

const RoutesConfig: RouteObject[] = [
	{
		element: <GlobalLayout />,
		path: "",
		errorElement: <RouteErrorFallback />,
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
								<HealthHistory />
							</Lazy>
						),
						path: paths.clinicalHistory,
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
