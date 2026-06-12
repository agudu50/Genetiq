import { useState, useEffect, useRef, type ReactNode } from "react";

type ViewportMountProps = {
	children: ReactNode;
	minHeight?: number;
	className?: string;
	/** Intersection root margin — mount before fully in view */
	rootMargin?: string;
	/** Mount after idle even if not scrolled into view yet */
	idleTimeout?: number;
};

export function ViewportMount({
	children,
	minHeight = 160,
	className,
	rootMargin = "120px 0px 120px 0px",
	idleTimeout = 1800,
}: ViewportMountProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		if (mounted) return;

		let disconnected = false;

		const mount = () => {
			if (!disconnected) setMounted(true);
		};

		const el = ref.current;
		if (el) {
			const rect = el.getBoundingClientRect();
			if (rect.top < window.innerHeight + 120 && rect.bottom > -120) {
				mount();
				return;
			}

			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						mount();
						observer.disconnect();
					}
				},
				{ rootMargin, threshold: 0.01 },
			);

			observer.observe(el);

			let idleId: number | undefined;
			if (typeof requestIdleCallback !== "undefined") {
				idleId = requestIdleCallback(mount, { timeout: idleTimeout });
			} else {
				idleId = window.setTimeout(mount, idleTimeout) as unknown as number;
			}

			return () => {
				disconnected = true;
				observer.disconnect();
				if (typeof requestIdleCallback !== "undefined" && idleId) {
					cancelIdleCallback(idleId);
				} else if (idleId) {
					clearTimeout(idleId);
				}
			};
		}

		return () => {
			disconnected = true;
		};
	}, [mounted, rootMargin, idleTimeout]);

	return (
		<div
			ref={ref}
			className={className}
			style={mounted ? undefined : { minHeight }}
			aria-hidden={!mounted}
		>
			{mounted ? children : null}
		</div>
	);
}
