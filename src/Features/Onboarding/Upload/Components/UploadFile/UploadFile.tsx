import React, { useEffect } from "react";
import { CloseIcon } from "@/assets/Icons/Close";
import CheckMarkIcon from "@assets/General/CheckMark.svg?react";
import styles from "./UploadFile.module.scss";
// import { SettingIcon } from "@/assets/Icons/Setting";

interface UploadFileProps {
	file: File;
	progress: number;
	isUploading: boolean;
	onClose: (file: File) => void;
	onUploadStart: (file: File) => void;
	onUploadComplete: (file: File) => void;
}

export const UploadFile: React.FC<UploadFileProps> = ({
	file,
	isUploading,
	progress,
	onClose,
	onUploadStart,
	onUploadComplete,
}) => {
	useEffect(() => {
		if (!isUploading && progress === 0) {
			onUploadStart(file);
		}
	}, [isUploading, progress, file, onUploadStart, onUploadComplete]);

	return (
		<div className={styles["upload-file-container"]}>
			<div className={styles["info"]}>
				<div className={styles["file"]}>
					{progress === 100 && !isUploading && (
						<div className={styles["done"]}>
							<CheckMarkIcon />
						</div>
					)}
					{file.name}
				</div>
				<div className={styles["actions"]}>
					{/* <button className={styles["process-btn"]}>
						Process <SettingIcon fill='rgba(0, 41, 173, 1)' />
					</button> */}
					<div
						className={styles["close-icon"]}
						onClick={() => onClose(file)}
						title='Remove file'
					>
						<CloseIcon fill='rgba(255, 255, 255, 0.8)' />
					</div>
				</div>
				{isUploading && progress < 100 && (
					<div className={styles["progress-percent"]}>{progress}%</div>
				)}
			</div>

			{isUploading && (
				<div className={styles["progress-bar-container"]}>
					<div
						className={styles["progress-bar"]}
						style={{ width: `${progress}%` }}
					></div>
				</div>
			)}
		</div>
	);
};
