import styles from "./ConnectAppDevice.module.scss";
import { AppDevice } from "@/Features/Onboarding/ConnectAppDevice/AppDevice/AppDevice";
import { FilterBar } from "@/Features/Onboarding/ConnectAppDevice/FilterBar/FilterBar";
import { SyncPowerGauge } from "@/Features/Onboarding/ConnectAppDevice/SyncPowerGauge/SyncPowerGauge";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ConnectAppDevice = () => {
	const [syncedDevices, setSyncedDevices] = useState<Set<string>>(new Set());
	const [isEmergencyAccess, setIsEmergencyAccess] = useState(false);

	const toggleDevice = (title: string) => {
		setSyncedDevices((prev) => {
			const next = new Set(prev);
			if (next.has(title)) next.delete(title);
			else next.add(title);
			return next;
		});
	};

	return (
		<div className={styles["connect-app-device-container"]}>
			<div className={styles["connect-app-header"]}>
				<div className={styles["header-content"]}>
					<div className={styles["badge-wrapper"]}>
						<span className={styles["header-badge"]}>
							<span className={styles["badge-dot"]} />
							Integrations
						</span>
					</div>
					<h1 className={styles["header-title"]}>
						<span className='text-gradient-muted'>Connect Your</span>
						<span className='text-gradient-primary'> Devices</span>
					</h1>
					<p className={styles["header-subtitle"]}>
						Sync your wearables and health apps to get real-time insights. All
						data is encrypted and stored securely for your privacy.
					</p>
				</div>
			</div>

			<div className={styles["connect-app-body-wrapper"]}>
				<div className={styles["connect-app-body"]}>
					<SyncPowerGauge syncedCount={syncedDevices.size} totalCount={8} />
					<FilterBar />
					<AppDevice
						syncedDevices={syncedDevices}
						toggleDevice={toggleDevice}
					/>
				</div>

				<div className={styles["coming-soon-overlay"]}>
					<div className={styles["overlay-content"]}>
						<div className={styles["lock-icon"]}>🧬</div>
						<h2 className={styles["overlay-title"]}>Precision Data Sync</h2>
						<p className={styles["overlay-text"]}>
							We are currently finalizing the encrypted Sui blockchain
							integration. Real-time device syncing will be available in the
							next release.
						</p>
						<div className={styles["request-access-btn"]}>
							Status: <span>Building in Progress</span>
						</div>
					</div>
				</div>
			</div>

			<div className={styles["connect-footer"]}>
				<div className={styles["footer-info-glass"]}>
					<span className={styles["footer-icon"]}>🔗</span>
					<div className={styles["footer-text-group"]}>
						<div className={styles["footer-title"]}>Don't see your device?</div>
						<div className={styles["footer-text"]}>
							We're adding new integrations regularly. Request a device.
						</div>
					</div>
				</div>

				{/* Specialized Emergency QR Access Toggle */}
				<div className={styles["emergency-access-wrapper"]}>
					<div className={styles["emergency-content"]}>
						<div className={styles["emergency-info"]}>
							<div className={styles["emergency-icon"]}>🛡️</div>
							<div className={styles["emergency-text"]}>
								<div className={styles["label"]}>Emergency QR Access</div>
								<div className={styles["subtext"]}>
									Enable doctor-scan visibility for specific streams
								</div>
							</div>
						</div>
						<button
							className={`${styles["emergency-toggle"]} ${isEmergencyAccess ? styles["active"] : ""}`}
							onClick={() => setIsEmergencyAccess(!isEmergencyAccess)}
						>
							<motion.div
								className={styles["toggle-thumb"]}
								animate={{ x: isEmergencyAccess ? 24 : 0 }}
							/>
						</button>
					</div>
					<AnimatePresence>
						{isEmergencyAccess && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className={styles["emergency-banner"]}
							>
								<div className={styles["banner-dot"]} />
								Secure Doctor Access Protocol Active (Scan-to-View Enabled)
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
};

export default ConnectAppDevice;
