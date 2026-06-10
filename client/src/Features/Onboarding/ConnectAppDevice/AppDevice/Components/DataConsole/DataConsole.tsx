import React, { useEffect, useState, useRef } from "react";
import styles from "./DataConsole.module.scss";
import { motion, AnimatePresence } from "framer-motion";

interface DataConsoleProps {
	isActive: boolean;
	deviceName: string;
}

export const DataConsole: React.FC<DataConsoleProps> = ({
	isActive,
	deviceName,
}) => {
	const [logs, setLogs] = useState<string[]>([]);
	const scrollRef = useRef<HTMLDivElement>(null);

	const generatePacket = () => {
		const hex = Math.floor(Math.random() * 0xffffff)
			.toString(16)
			.toUpperCase()
			.padStart(6, "0");
		const suffix = [
			"Hashed & Verified",
			"Synced to Sui",
			"Encrypted Channel",
			"Vault Secured",
		];
		const randomSuffix = suffix[Math.floor(Math.random() * suffix.length)];
		return `PKT-${hex}: ${randomSuffix}`;
	};

	useEffect(() => {
		if (!isActive) {
			setLogs([]);
			return;
		}

		setLogs([
			`Establishing protocol for ${deviceName}...`,
			"Connection Secured.",
			generatePacket(),
		]);

		const interval = setInterval(() => {
			setLogs((prev) => {
				const nextLogs = [...prev, generatePacket()];
				return nextLogs.slice(-4);
			});
		}, 2500);

		return () => clearInterval(interval);
	}, [isActive, deviceName]);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [logs]);

	if (!isActive) return null;

	return (
		<div className={styles["console-container"]}>
			<div className={styles["console-header"]}>
				<div className={styles["dot"]} />
				<span>Live Stream: Encrypted</span>
			</div>
			<div className={styles["log-viewport"]} ref={scrollRef}>
				<AnimatePresence>
					{logs.map((log, i) => (
						<motion.div
							key={`${log}-${i}`}
							initial={{ opacity: 0, x: -5 }}
							animate={{ opacity: 1, x: 0 }}
							className={styles["log-entry"]}
						>
							<span className={styles["timestamp"]}>
								[
								{new Date().toLocaleTimeString([], {
									hour12: false,
									hour: "2-digit",
									minute: "2-digit",
									second: "2-digit",
								})}
								]
							</span>
							{log}
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
};
