import styles from "./UploadMethod.module.scss";

import { UploadMethodSelect } from "@/Features/Onboarding/UploadMethod/UploadMethodSelect";

const Config = () => {
	return (
		<div className={styles["UploadMethod-container-outter"]}>
			<div className={styles["config-header"]}>
				<div className={styles["config-header-content"]}>
					<div className={styles["config-badge-wrapper"]}>
						<span className={styles["config-badge"]}>
							<span className={styles["badge-dot"]} />
							Getting Started
						</span>
					</div>
					<h1 className={styles["config-title"]}>
						<span className='text-gradient-muted'>Empower Your</span>
						<span className='text-gradient-primary'> Health Access</span>
					</h1>
					<p className={styles["config-subtitle"]}>
						Choose how to begin digitizing your health records. We help you
						bridge the gap in specialist access and navigate care across Africa.
					</p>
				</div>
			</div>
			<UploadMethodSelect />
		</div>
	);
};

export default Config;
