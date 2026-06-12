import { useState, useEffect, useRef, type ReactNode } from "react";

type ViewportMountProps = {
	children: ReactNode;
	minHeight?: number;
	className?: string;
	/** Intersection root margin — mount before fully in view */
	rootMargin?: string;
};

export function ViewportMount({
	children,
	minHeight = 160,
	className,
	rootMargin = "180px 0px 180px 0px",
}: ViewportMountProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el || mounted) return;

		const rect = el.getBoundingClientRect();
		if (rect.top < window.innerHeight + 180 && rect.bottom > -180) {
			setMounted(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setMounted(true);
					observer.disconnect();
				}
			},
			{ rootMargin, threshold: 0.01 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [mounted, rootMargin]);

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
