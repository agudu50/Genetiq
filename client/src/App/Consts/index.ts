import { paths } from "../Routes/Paths";

export const ConfigControlItems = {
	TakeQuiz: {
		title: "Take Quiz",
		url: paths.config.root,
	},
	BuySupplements: {
		title: "Buy Supplements",
		url: paths.config.root,
	},
	UploadFiles: {
		title: "Upload Files",
		url: paths.config.importOrUpload,
	},
	ConnectApp: {
		title: "Connect App / Device",
		url: paths.config.connectApp,
	},
};

export const UploadFileTypes = {
	Microbiome: {
		title: "Microbiome",
		fileTypes: [".fastq"],
		fileSize: 25,
		showSwitch: true,
	},
	Blood: {
		title: "Blood Report",
		fileTypes: [".pdf"],
		extra: "PDF",
		fileSize: 25,
	},
	Genetic: {
		title: "Genetic Data",
		fileTypes: [".fastq", ".vcf"],
		fileSize: 25,
	},
};
