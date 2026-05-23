import React, { useRef, useState } from "react";
import styles from "./UploadItem.module.scss";
import { UploadFile } from "../UploadFile/UploadFile";

export interface UploadItemProps {
	title: string;
	fileTypes: string[];
	extra?: string;
	fileSize: number;
	showSwitch?: boolean;
	uploadedFiles: { file: File; isUploading: boolean; progress: number }[];
	onFileChange: (files: FileList) => void;
	onUploadStart: (file: File) => void;
	onUploadComplete: (file: File) => void;
	onFileRemove: (file: File) => void;
}

export const UploadItem: React.FC<UploadItemProps> = ({
	title,
	fileTypes,
	extra,
	fileSize,
	showSwitch,
	uploadedFiles,
	onFileChange,
	onUploadStart,
	onUploadComplete,
	onFileRemove,
}) => {
	const [selectedSwitch, setSelectedSwitch] = useState(0);
	const ref = useRef<HTMLInputElement>(null);
	const [isDragOver, setIsDragOver] = useState(false);

	const handleBrowseClick = () => {
		ref.current!.click();
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setIsDragOver(true);
	};

	const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setIsDragOver(false);
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setIsDragOver(false);

		const files = event.dataTransfer.files;
		onFileChange(files);
	};

	return (
		<div className={styles["upload-item-container"]}>
			<div
				className={styles["header"]}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<div
					className={`${styles["drag-wrapper"]}  ${isDragOver ? styles["drag-over"] : ""}`}
				>
					<div className={styles["info"]}>
						<div className={styles["title"]}>{title}</div>
						<div className={styles["file-types-container"]}>
							{fileTypes.map((type) => (
								<div className={styles["file-type-container"]}>
									<span className={styles["file-type"]}>{type}</span>
								</div>
							))}
							{extra && <div className={styles["file-size"]}>{extra}</div>}
							<span className={styles["file-size"]}>(max. {fileSize}mb)</span>
						</div>
					</div>
					<div className={styles["actions"]}>
						{showSwitch && (
							<div className={styles["switch-container"]}>
								<div
									className={`${styles["switch-item"]} ${selectedSwitch === 0 ? styles["selected-switch-item"] : ""}`}
									onClick={() => setSelectedSwitch(0)}
								>
									<span>16S .fastQ</span>
								</div>
								<div
									className={`${styles["switch-item"]} ${selectedSwitch === 1 ? styles["selected-switch-item"] : ""}`}
									onClick={() => setSelectedSwitch(1)}
								>
									<span>shotgun .fastQ</span>
								</div>
							</div>
						)}
						<button
							className={styles["browse-files-btn"]}
							onClick={handleBrowseClick}
						>
							Upload
						</button>
					</div>
					<input
						type='file'
						ref={ref}
						multiple
						accept={fileTypes.join(",")}
						onChange={(e) => {
							onFileChange(e.target.files!);
						}}
						style={{ display: "none" }}
					/>
				</div>
			</div>
			{uploadedFiles.map((item) => (
				<UploadFile
					key={item.file.name}
					file={item.file}
					progress={item.progress}
					isUploading={item.isUploading}
					onClose={onFileRemove}
					onUploadStart={onUploadStart}
					onUploadComplete={onUploadComplete}
				/>
			))}

			{uploadedFiles.map((item) => (
				<UploadFile
					key={item.file.name}
					file={item.file}
					progress={item.progress}
					isUploading={item.isUploading}
					onClose={onFileRemove}
					onUploadStart={onUploadStart}
					onUploadComplete={onUploadComplete}
				/>
			))}
		</div>
	);
};
