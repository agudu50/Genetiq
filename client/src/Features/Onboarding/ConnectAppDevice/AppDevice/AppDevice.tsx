import styles from "./AppDevice.module.scss";
import { AppCard } from "./Components/AppCard/AppCard";
import OmronLogo from "@assets/AppDevice/OmronLogo.svg";
import AppleLogo from "@assets/AppDevice/AppleLogo.svg";
import QardioLogo from "@assets/AppDevice/QardioLogo.svg";
import HuaweiLogo from "@assets/AppDevice/HuaweiLogo.svg";
import OuraLogo from "@assets/AppDevice/OuraLogo.svg";
import FreeStyleLogo from "@assets/AppDevice/FreeStyleLogo.svg";
import WithingsLogo from "@assets/AppDevice/WithingsLogo.svg";
import EHRsDatabase from "@assets/General/EHRDatabase.svg";

export const AppDevice = ({
	syncedDevices,
	toggleDevice,
}: {
	syncedDevices: Set<string>;
	toggleDevice: (title: string) => void;
}) => {
	const apps = [
		{
			img: EHRsDatabase,
			title: "EHRs Database",
			description: "Digital health records",
			tags: ["Primary: Total Health", "Secondary: Medical History"],
		},
		{
			img: OmronLogo,
			title: "Omron",
			description: "Platinum / Evolv / Complete",
			tags: ["Primary: Cardiovascular", "Secondary: Vital Signs"],
		},
		{
			img: AppleLogo,
			title: "Apple",
			description: "Watch Series / Ultra / SE",
			tags: ["Primary: Multi-System", "Secondary: Activity"],
		},
		{
			img: QardioLogo,
			title: "Qardio",
			description: "QardioBase, QardioCore, QardioArm",
			tags: ["Primary: Cardiovascular", "Secondary: Heart Rate"],
		},
		{
			img: HuaweiLogo,
			title: "Huawei",
			description: "Watch GT 5, Band 8, Scale 3",
			tags: ["Primary: Activity", "Secondary: Sleep"],
		},
		{
			img: OuraLogo,
			title: "OURA",
			description: "Ring Gen 2, Ring Gen 3",
			tags: ["Primary: Recovery", "Secondary: Sleep"],
		},
		{
			img: FreeStyleLogo,
			title: "FreeStyle",
			description: "Libre2 / 3 (Glucose Monitor)",
			tags: ["Primary: Metabolic", "Secondary: Glucose"],
		},
		{
			img: WithingsLogo,
			title: "Withings E",
			description: "Body+, BPM Core, Sleep Analyzer",
			tags: ["Primary: Vital Signs", "Secondary: Sleep"],
		},
	];
	return (
		<div className={styles["app-container"]}>
			{apps.map((app) => (
				<AppCard
					key={app.title}
					{...app}
					isSynced={syncedDevices.has(app.title)}
					onToggle={() => toggleDevice(app.title)}
				/>
			))}
		</div>
	);
};
