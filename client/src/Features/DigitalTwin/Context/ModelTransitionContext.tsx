// ModelTransitionContext.tsx
import React, { createContext, useContext, useState } from "react";

interface TransitionConfig {
	position: [number, number, number];
	zoom: number;
	modelType: "body" | "cardio";
}

interface ModelTransitionContextType {
	isTransitioning: boolean;
	previousModelType: "body" | "cardio" | null;
	currentModelType: "body" | "cardio";
	startNewModelFade: boolean;
	isModelHidden: boolean;
	pendingConfig: TransitionConfig | null;
	handleModelTransition: (
		newModel: "body" | "cardio",
		config: TransitionConfig,
	) => void;
	onTransitionComplete: () => void;
}

const ModelTransitionContext = createContext<
	ModelTransitionContextType | undefined
>(undefined);

export const ModelTransitionProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [previousModelType, setPreviousModelType] = useState<
		"body" | "cardio" | null
	>(null);
	const [currentModelType, setCurrentModelType] = useState<"body" | "cardio">(
		"body",
	);
	const [startNewModelFade, setStartNewModelFade] = useState(true);
	const [isModelHidden, setIsModelHidden] = useState(false);
	const [pendingConfig, setPendingConfig] = useState<TransitionConfig | null>(
		null,
	);

	const handleModelTransition = (
		newModel: "body" | "cardio",
		config: TransitionConfig,
	) => {
		if (newModel === currentModelType) return;

		setIsTransitioning(true);
		setStartNewModelFade(false);
		setPreviousModelType(currentModelType);
		setCurrentModelType(newModel);
		setPendingConfig(config);
		setIsModelHidden(true);
	};

	const onTransitionComplete = () => {
		setIsTransitioning(false);
		setPreviousModelType(null);
		setStartNewModelFade(true);
		setIsModelHidden(false);
		setPendingConfig(null);
	};

	return (
		<ModelTransitionContext.Provider
			value={{
				isTransitioning,
				previousModelType,
				currentModelType,
				startNewModelFade,
				isModelHidden,
				pendingConfig,
				handleModelTransition,
				onTransitionComplete,
			}}
		>
			{children}
		</ModelTransitionContext.Provider>
	);
};

export const useModelTransition = () => {
	const context = useContext(ModelTransitionContext);
	if (!context) {
		throw new Error(
			"useModelTransition must be used within a ModelTransitionProvider",
		);
	}
	return context;
};
