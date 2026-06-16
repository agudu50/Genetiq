import { useMemo } from "react";
import styles from "./AgeWidget.module.scss";
import { AgeMetrics } from "./Components/AgeMetrics/AgeMetrics";
import { AgeSlider } from "./Components/AgeSlider/AgeSlider";
import { useSelector } from "react-redux";
import { RootState } from "@/App/Redux/store";
import { Dna, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useLanguage } from "@/App/i18n/LanguageContext";

export const AgeWidget = () => {
	const { t } = useLanguage();
	const user = useSelector((state: RootState) => state.user);

	const chronoAge = Number(user.age) || 32;
	const biologicalAge =
		Number(user.biologicalAge) || Number((chronoAge - 1.5).toFixed(1));

	const ageData = useMemo(
		() => ({
			biologicalAge,
			chronoAge,
			range: { start: 20, end: 80 },
		}),
		[biologicalAge, chronoAge],
	);

	const delta = chronoAge - biologicalAge;
	const deltaAbs = Math.abs(delta);

	const deltaInsight = useMemo(() => {
		if (deltaAbs < 0.05) {
			return {
				label: t("age_matches_chrono"),
				tone: "neutral" as const,
				icon: <Minus size={14} strokeWidth={2.5} />,
			};
		}
		if (delta > 0) {
			return {
				label: t("age_younger_by", { count: deltaAbs.toFixed(1) }),
				tone: "positive" as const,
				icon: <TrendingDown size={14} strokeWidth={2.5} />,
			};
		}
		return {
			label: t("age_older_by", { count: deltaAbs.toFixed(1) }),
			tone: "negative" as const,
			icon: <TrendingUp size={14} strokeWidth={2.5} />,
		};
	}, [delta, deltaAbs, t]);

	return (
		<div className={styles.container}>
			<div className={styles.heroBg} aria-hidden />
			<div className={styles.heroMesh} aria-hidden />
			<div className={styles.heroGlow} aria-hidden />

			<div className={styles.inner}>
				<div className={styles.header}>
					<div className={styles.headerRow}>
						<span className={styles.eyebrow}>
							<Dna size={12} strokeWidth={2.5} />
							{t("age_analysis")}
						</span>
						<div
							className={`${styles.deltaBanner} ${styles[`deltaBanner_${deltaInsight.tone}`]}`}
						>
							{deltaInsight.icon}
							<span>{deltaInsight.label}</span>
						</div>
					</div>
				</div>

				<div className={styles.body}>
					<AgeMetrics ageData={ageData} />
					<AgeSlider ageData={ageData} />
				</div>
			</div>
		</div>
	);
};
