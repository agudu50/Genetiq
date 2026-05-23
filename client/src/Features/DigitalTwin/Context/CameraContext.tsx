import React, { createContext, useContext, useState } from "react";

interface CameraState {
	targetPosition: [number, number, number];
	targetZoom: number;
}

interface CameraContextType {
	cameraState: CameraState;
	setCameraState: (state: CameraState) => void;
	modelType: "body" | "cardio";
	setModelType: (type: "body" | "cardio") => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider = ({ children }: { children: React.ReactNode }) => {
	const [cameraState, setCameraState] = useState<CameraState>({
		targetPosition: [0, 9, 200],
		targetZoom: 11,
	});
	const [modelType, setModelType] = useState<"body" | "cardio">("body");

	return (
		<CameraContext.Provider
			value={{ cameraState, setCameraState, modelType, setModelType }}
		>
			{children}
		</CameraContext.Provider>
	);
};

export const useCamera = () => {
	const context = useContext(CameraContext);
	if (!context) {
		throw new Error("useCamera must be used within a CameraProvider");
	}
	return context;
};
