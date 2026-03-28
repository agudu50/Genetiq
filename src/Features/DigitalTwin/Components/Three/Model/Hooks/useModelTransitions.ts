import { useState, useRef, useEffect } from "react";

export function useModelTransitions(initialOpacity = 1) {
	const [opacity, setOpacity] = useState(initialOpacity);
	const [targetOpacity, setTargetOpacity] = useState(initialOpacity);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const fadeRef = useRef<NodeJS.Timeout>();
	const callbackRef = useRef<(() => void) | null>(null);

	const startTransition = (onComplete?: () => void) => {
		if (fadeRef.current) {
			clearTimeout(fadeRef.current);
		}

		callbackRef.current = onComplete || null;
		setIsTransitioning(true);
		setTargetOpacity(0);

		const fadeOut = () => {
			setOpacity(0);
			if (callbackRef.current) {
				callbackRef.current();
			}
			setTargetOpacity(1);
			fadeIn();
		};

		const fadeIn = () => {
			setOpacity(1);
			setTimeout(() => {
				setIsTransitioning(false);
			}, 800);
		};

		fadeRef.current = setTimeout(fadeOut, 800);
	};

	useEffect(() => {
		return () => {
			if (fadeRef.current) {
				clearTimeout(fadeRef.current);
			}
		};
	}, []);

	return {
		opacity,
		setOpacity,
		targetOpacity,
		isTransitioning,
		startTransition,
	};
}
