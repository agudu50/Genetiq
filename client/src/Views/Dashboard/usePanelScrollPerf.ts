import { useCallback, useEffect, useRef } from "react";

const SCROLL_END_MS = 140;

export function usePanelScrollPerf() {
	const cleanupRef = useRef<(() => void) | null>(null);

	const detach = useCallback(() => {
		cleanupRef.current?.();
		cleanupRef.current = null;
	}, []);

	const attach = useCallback(
		(el: HTMLElement | null) => {
			detach();
			if (!el) return;

			let endTimeout: ReturnType<typeof setTimeout>;
			let rafId = 0;
			let scrollActive = false;

			const endScroll = () => {
				scrollActive = false;
				document.body.classList.remove("is-scrolling");
			};

			const onScroll = () => {
				if (!scrollActive) {
					scrollActive = true;
					if (!rafId) {
						rafId = requestAnimationFrame(() => {
							rafId = 0;
							document.body.classList.add("is-scrolling");
						});
					}
				}

				clearTimeout(endTimeout);
				endTimeout = setTimeout(endScroll, SCROLL_END_MS);
			};

			el.addEventListener("scroll", onScroll, { passive: true });
			cleanupRef.current = () => {
				el.removeEventListener("scroll", onScroll);
				clearTimeout(endTimeout);
				if (rafId) cancelAnimationFrame(rafId);
				if (scrollActive) endScroll();
			};
		},
		[detach],
	);

	useEffect(() => detach, [detach]);

	return { attachPanelScroll: attach };
}
