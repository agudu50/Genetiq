import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { motion, AnimatePresence } from "framer-motion";
import { GeneticTrait } from "@/App/Redux/genomicsSlice";
import styles from "./Genomics.module.scss";

const Genomics = () => {
	const { traits, geneticResilience } = useSelector(
		(state: RootState) => state.genomics,
	);
	const [activeCategory, setActiveCategory] = useState<string>("All");

	const filteredTraits = useMemo(() => {
		return traits.filter(
			(t: GeneticTrait) =>
				activeCategory === "All" || t.category === activeCategory,
		);
	}, [traits, activeCategory]);

	return (
		<div className={styles["genomics-container"]}>
			<div className={styles["genomics-content"]}>
				<div className={styles["header"]}>
					<div className={styles["header-text"]}>
						<h1 className={styles["title"]}>
							<span className='text-gradient-muted'>Genetic</span>{" "}
							<span className='text-gradient-primary'>Analysis</span>
						</h1>
						<p className={styles["subtitle"]}>
							Your biological blueprint, encrypted on Sui. Interactive traits
							and risk scores.
						</p>
					</div>
					<div className={styles["resilience-score"]}>
						<div className={styles["score-circle"]}>
							<svg viewBox='0 0 36 36' className={styles["circular-chart"]}>
								<path
									className={styles["circle-bg"]}
									d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
								/>
								<path
									className={styles["circle"]}
									strokeDasharray={`${geneticResilience}, 100`}
									d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
								/>
							</svg>
							<span className={styles["score-number"]}>
								{geneticResilience}
							</span>
						</div>
						<div className={styles["score-info"]}>
							<span className={styles["label"]}>Resilience</span>
							<span className={styles["status"]}>High Alpha</span>
						</div>
					</div>
				</div>

				<div className={styles["privacy-banner"]}>
					<ShieldCheckIcon />
					<p>
						DNA data is hashed and stored as an{" "}
						<strong>Encrypted Object</strong> on the Sui Blockchain. Access
						requires your Private Key.
					</p>
				</div>

				<div className={styles["filter-row"]}>
					{["All", "Nutrigenomics", "Fitness", "HealthRisk"].map((cat) => (
						<button
							key={cat}
							className={`${styles["filter-btn"]} ${activeCategory === cat ? styles["active"] : ""}`}
							onClick={() => setActiveCategory(cat)}
						>
							{cat}
						</button>
					))}
				</div>

				<div className={styles["traits-grid"]}>
					<AnimatePresence mode='popLayout'>
						{filteredTraits.map((trait, index) => (
							<motion.div
								key={trait.id}
								layout
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ duration: 0.3, delay: index * 0.05 }}
								className={`${styles["trait-card"]} ${styles[trait.impact.toLowerCase()]}`}
							>
								<div className={styles["trait-header"]}>
									<div className={styles["trait-name-group"]}>
										<h3 className={styles["trait-name"]}>{trait.name}</h3>
										<span className={styles["trait-genotype"]}>
											{trait.genotype}
										</span>
									</div>
									<div
										className={`${styles["impact-badge"]} ${styles[trait.impact.toLowerCase()]}`}
									>
										{trait.outcome}
									</div>
								</div>

								<p className={styles["trait-desc"]}>{trait.description}</p>

								<div className={styles["trait-footer"]}>
									<div className={styles["evidence-group"]}>
										<span className={styles["evidence-label"]}>
											Confidence:
										</span>
										<div className={styles["evidence-dots"]}>
											{[1, 2, 3, 4].map((score) => (
												<div
													key={score}
													className={`${styles["dot"]} ${score <= trait.evidence_level ? styles["filled"] : ""}`}
												/>
											))}
										</div>
									</div>
									<span className={styles["trait-cat"]}>{trait.category}</span>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
};

const ShieldCheckIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='#10b981'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
		<path d='m9 12 2 2 4-4' />
	</svg>
);

export default Genomics;
