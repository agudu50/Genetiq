import { useState, useEffect, type ReactNode } from "react";

type DeferredMountProps = {
	children: ReactNode;
	minHeight?: number;
	/** Max wait before mounting (ms) */
	timeout?: number;
	className?: string;
};

export function DeferredMount({
	children,
	minHeight = 120,
	timeout = 400,
	className,
}: DeferredMountProps) {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (typeof requestIdleCallback !== "undefined") {
			const id = requestIdleCallback(() => setReady(true), { timeout });
			return () => cancelIdleCallback(id);
		}
		const id = window.setTimeout(() => setReady(true), Math.min(timeout, 150));
		return () => clearTimeout(id);
	}, [timeout]);

	return (
		<div
			className={className}
			style={ready ? undefined : { minHeight }}
			aria-hidden={!ready}
		>
			{ready ? children : null}
		</div>
	);
}
