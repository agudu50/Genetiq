import { useMemo, useCallback, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { setFilter } from "@/App/Redux/testSlice";
import { setCategory } from "@/App/Redux/categorySlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Tests.module.scss";

const DropletIcon = memo(() => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z' />
	</svg>
));

const BrainIcon = memo(() => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M9.5 2A5 5 0 0 1 12 4a5 5 0 0 1 2.5-2 4.96 4.96 0 0 1 4 1c1.2.9 1.8 2.4 1.5 4a5 5 0 0 1-1 2.4l-7 7-7-7a5 5 0 0 1-1-2.4c-.3-1.6.3-3.1 1.5-4a4.96 4.96 0 0 1 4-1z' />
		<path d='M12 4v4' />
		<path d='M10 4s-1-.5-1-1.5' />
		<path d='M14 4s1-.5 1-1.5' />
	</svg>
));

const ActivityIcon = memo(() => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<polyline points='22 12 18 12 15 21 9 3 6 12 2 12' />
	</svg>
));

const ShieldIcon = memo(() => (
	<svg
		width='14'
		height='14'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
		<path d='m9 12 2 2 4-4' />
	</svg>
));

const TwinIcon = memo(() => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
		<circle cx='12' cy='7' r='4' />
		<path d='M12 11v4' />
		<path d='M12 19v2' />
	</svg>
));

const CategoryIcon = memo(({ type }: { type: string }) => {
	switch (type) {
		case "Blood":
			return <DropletIcon />;
		case "Neuro":
			return <BrainIcon />;
		case "CGM":
			return <ActivityIcon />;
		default:
			return (
				<svg
					width='20'
					height='20'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<path d='M12 2v20M2 12h20' />
				</svg>
			);
	}
});

const Tests = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { items, filter } = useSelector((state: RootState) => state.tests);

	const filteredTests = useMemo(() => {
		if (filter === "All") return items;
		return items.filter((test) => test.status === filter);
	}, [items, filter]);

	const handleViewOnTwin = useCallback(
		(system: string) => {
			dispatch(setCategory(system));
			navigate("/dashboard");
		},
		[dispatch, navigate],
	);

	const showProof = useCallback((hash?: string) => {
		if (hash) {
			alert(
				`Sui Transaction Hash: ${hash}\nData verified on Genetiq Protocol.`,
			);
		}
	}, []);

	return (
		<div className={styles["tests-container"]}>
			<div className={styles["tests-content"]}>
				<div className={styles["header"]}>
					<div className={styles["header-text"]}>
						<h1 className={styles["title"]}>
							<span className='text-gradient-muted'>Health</span>{" "}
							<span className='text-gradient-primary'>Tests</span>
						</h1>
						<p className={styles["subtitle"]}>
							Scannable list of lab results and biomarkers secured on Sui.
						</p>
					</div>
				</div>

				<div className={styles["filter-tabs"]}>
					{(["All", "Pending", "Completed", "Flagged"] as const).map((t) => (
						<button
							key={t}
							className={`${styles["tab-btn"]} ${filter === t ? styles["active"] : ""}`}
							onClick={() => dispatch(setFilter(t))}
						>
							{t}
						</button>
					))}
				</div>

				<div className={styles["tests-grid"]}>
					<AnimatePresence mode='popLayout'>
						{filteredTests.map((test, index) => (
							<motion.div
								key={test.id}
								layout
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ duration: 0.3, delay: index * 0.05 }}
								className={styles["test-card"]}
							>
								<div className={styles["card-header"]}>
									<div
										className={`${styles["test-icon"]} ${styles[test.type.toLowerCase()]}`}
									>
										<CategoryIcon type={test.type} />
									</div>
									<div className={styles["header-right"]}>
										{test.suiHash && (
											<button
												className={styles["proof-badge"]}
												onClick={() => showProof(test.suiHash)}
												title='Verify on Blockchain'
											>
												<ShieldIcon />
												Sui Verified
											</button>
										)}
										<div
											className={`${styles["status-chip"]} ${styles[test.status.toLowerCase().replace(" ", "-")]}`}
										>
											{test.status}
										</div>
									</div>
								</div>

								<div className={styles["test-body"]}>
									<h3 className={styles["test-title"]}>{test.title}</h3>
									<p className={styles["test-description"]}>
										{test.description}
									</p>
								</div>

								<div className={styles["test-meta"]}>
									{test.price && (
										<div className={styles["price"]}>
											Price: <span>{test.price}</span>
										</div>
									)}
									{(test.date || test.order_date) && (
										<div className={styles["date"]}>
											{test.status === "Completed"
												? "Completed: "
												: "Ordered: "}
											<span>
												{new Date(
													test.date || test.order_date!,
												).toLocaleDateString()}
											</span>
										</div>
									)}
									{test.tracking && (
										<div className={styles["tracking"]}>
											<svg
												width='14'
												height='14'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2.5'
												strokeLinecap='round'
												strokeLinejoin='round'
												style={{ marginRight: 6 }}
											>
												<path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' />
												<polyline points='3.29 7 12 12 20.71 7' />
												<line x1='12' y1='22' x2='12' y2='12' />
											</svg>
											<span>{test.tracking}</span>
										</div>
									)}
								</div>

								<div className={styles["card-actions"]}>
									<button
										className={styles["twin-btn"]}
										onClick={() => handleViewOnTwin(test.system)}
									>
										<TwinIcon />
										View on Twin
									</button>
									{test.status === "Available to Order" && (
										<button className={styles["order-btn"]}>Order Kit</button>
									)}
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>

				<div className={styles["info-panel"]}>
					<div className={styles["info-badge"]}>At-Home Collection</div>
					<p className={styles["info-text"]}>
						Every test result is hashed and signed on the Sui Blockchain to
						ensure absolute data provenance and tampering protection.
					</p>
				</div>
			</div>
		</div>
	);
};

export default Tests;
