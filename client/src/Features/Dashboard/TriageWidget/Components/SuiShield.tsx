import React, { useState } from "react";
import styles from "../TriageWidget.module.scss";

export const SuiShield: React.FC = () => {
	const [showHash, setShowHash] = useState(false);

	// Mock Transaction Hash
	const txHash = "0x9f...4a2b";

	return (
		<div
			className={styles.shieldContainer}
			onClick={() => setShowHash(!showHash)}
		>
			<div className={styles.shieldIconWrapper}>
				<svg
					width='16'
					height='16'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2.5'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'></path>
				</svg>
			</div>
			{showHash && (
				<div className={styles.hashPopup}>
					<span>Integrity: Verified</span>
					<span className={styles.txHash}>{txHash}</span>
				</div>
			)}
		</div>
	);
};
