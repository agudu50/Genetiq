import React from "react";
import styles from "./UploadProcesser.module.scss";
import CheckMarkIcon from "@assets/General/CheckMark.svg?react";
import ProcessingIcon from "@assets/General/Processing.svg?react";

interface UploadProcesserProps {
	fileName: string;
	status: string;
}

export const UploadProcesser: React.FC<UploadProcesserProps> = ({
	fileName,
	status,
}) => {
	return (
		<div className={styles["processer"]}>
			<div className={styles["file"]}>{fileName}</div>
			<div className={styles["icon"]}>
				{status === "done" ? <CheckMarkIcon /> : <ProcessingIcon />}
			</div>
		</div>
	);
};
