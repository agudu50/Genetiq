import { useCallback, useEffect, useRef, useState } from "react";

const SCROLL_END_MS = 100;

export function usePanelScrollPerf() {
	const [isPanelScrolling, setIsPanelScrolling] = useState(false);
	const cleanupRef = useRef<(() => void) | null>(null);

	const detach = useCallback(() => {
		cleanupRef.current?.();
		cleanupRef.current = null;
	}, []);

	const attach = useCallback((el: HTMLElement | null) => {
		detach();
		if (!el) return;

		let timeout: ReturnType<typeof setTimeout>;

		const onScroll = () => {
			document.body.classList.add("is-scrolling");
			setIsPanelScrolling(true);
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				document.body.classList.remove("is-scrolling");
				setIsPanelScrolling(false);
			}, SCROLL_END_MS);
		};

		el.addEventListener("scroll", onScroll, { passive: true });
		cleanupRef.current = () => {
			el.removeEventListener("scroll", onScroll);
			clearTimeout(timeout);
		};
	}, [detach]);

	useEffect(() => detach, [detach]);

	return { isPanelScrolling, attachPanelScroll: attach };
}
