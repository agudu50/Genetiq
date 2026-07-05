import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";
import {
	Upload,
	FileText,
	LayoutDashboard,
	ArrowRight,
	CheckCircle2,
	ShieldCheck,
	LifeBuoy,
} from "lucide-react";
import { useLanguage } from "@/App/i18n/LanguageContext";
import styles from "./UploadMethod.module.scss";

const OPTION_META = [
	{
		id: "upload",
		icon: <Upload size={28} />,
		badgeColor: "teal",
		url: paths.config.importOrUpload,
		disabled: false,
		badgeKey: "config_upload_badge",
		titleKey: "config_upload_title",
		descKey: "config_upload_desc",
		ctaKey: "config_upload_cta",
		highlightKeys: ["config_highlight_snap", "config_highlight_pdf", "config_highlight_format"],
	},
	{
		id: "history",
		icon: <FileText size={28} />,
		badgeColor: "neutral",
		url: paths.clinicalHistory,
		disabled: false,
		badgeKey: "config_history_badge",
		titleKey: "config_history_title",
		descKey: "config_history_desc",
		ctaKey: "config_history_cta",
		highlightKeys: ["config_highlight_past", "config_highlight_progress", "config_highlight_ai"],
	},
	{
		id: "dashboard",
		icon: <LayoutDashboard size={28} />,
		badgeColor: "neutral",
		url: paths.dashboard.root,
		disabled: false,
		badgeKey: "config_dashboard_badge",
		titleKey: "config_dashboard_title",
		descKey: "config_dashboard_desc",
		ctaKey: "config_dashboard_cta",
		highlightKeys: ["config_highlight_score", "config_highlight_diet", "config_highlight_insights"],
	},
] as const;

const FOOTER_LINKS = [
	{
		icon: ShieldCheck,
		title: "Privacy",
		desc: "How we protect your health data",
		href: paths.privacy,
	},
	{
		icon: FileText,
		title: "Terms",
		desc: "Usage agreement and your rights",
		href: paths.terms,
	},
	{
		icon: LifeBuoy,
		title: "Support",
		desc: "Get help from our team",
		href: "mailto:support@genetiq.ai",
		external: true,
	},
] as const;

const Config = () => {
	const navigate = useNavigate();
	const { t } = useLanguage();
	const [pageIn, setPageIn] = useState(false);

	useEffect(() => {
		let frame2 = 0;
		const frame1 = requestAnimationFrame(() => {
			frame2 = requestAnimationFrame(() => setPageIn(true));
		});
		return () => {
			cancelAnimationFrame(frame1);
			cancelAnimationFrame(frame2);
		};
	}, []);

	return (
		<div className={`${styles.page} ${pageIn ? styles.pageIn : ""}`}>
			<div className={styles.bgLayer} aria-hidden>
				<div className={styles.bgGrid} />
				<div className={styles.bgGlow} />
			</div>

			<header className={styles.header}>
				<span className={styles.badge}>
					<span className={styles.badgeDot} />
					{t("config_badge")}
				</span>
				<h1 className={styles.title}>{t("config_title")}</h1>
				<p className={styles.subtitle}>{t("config_subtitle")}</p>
			</header>

			<div className={styles.cards}>
				{OPTION_META.map((opt) => (
					<article
						key={opt.id}
						className={`${styles.card} ${opt.disabled ? styles.cardDisabled : ""} ${opt.id === "upload" ? styles.cardFeatured : ""}`}
						onClick={() => !opt.disabled && navigate(opt.url!)}
					>
						<div className={`${styles.cardBadge} ${styles[`badge-${opt.badgeColor}`]}`}>
							{t(opt.badgeKey)}
						</div>

						<div className={styles.cardIcon}>{opt.icon}</div>

						<h2 className={styles.cardTitle}>{t(opt.titleKey)}</h2>
						<p className={styles.cardDesc}>{t(opt.descKey)}</p>

						<ul className={styles.highlights}>
							{opt.highlightKeys.map((key) => (
								<li key={key}>
									<CheckCircle2 size={13} />
									{t(key)}
								</li>
							))}
						</ul>

						{!opt.disabled && (
							<button type="button" className={styles.cardCta}>
								{t(opt.ctaKey)}
								<ArrowRight size={16} className={styles.ctaArrow} />
							</button>
						)}

						{opt.disabled && (
							<span className={styles.comingSoon}>{t("coming_soon")}</span>
						)}
					</article>
				))}
			</div>

			<footer className={styles.configFooter}>
				<div className={styles.footerTop}>
					<div className={styles.footerBrand}>
						<div className={styles.footerLogo}>
							<img src="/assets/genetiq_logo_v2.png" alt="Genetiq" />
							<span>Genetiq</span>
						</div>
						<p className={styles.footerDesc}>
							Upload your lab results. Get plain-English explanations. Receive a personal diet and health plan — all powered by AI.
						</p>
						<div className={styles.trustStrip}>
							{[
								{ icon: <ShieldCheck size={13} />, label: "256-bit encryption" },
								{ icon: <ShieldCheck size={13} />, label: "Bank-level security" },
								{ icon: <CheckCircle2 size={13} />, label: "HIPAA compliant" },
							].map((b) => (
								<span key={b.label} className={styles.trustBadge}>
									{b.icon} {b.label}
								</span>
							))}
						</div>
					</div>

					<div className={styles.footerLinks}>
						{FOOTER_LINKS.map((link) => {
							const Icon = link.icon;
							return (
								<a
									key={link.title}
									href={link.href}
									className={styles.footerLinkCard}
									{...("external" in link && link.external
										? { target: "_blank", rel: "noopener noreferrer" }
										: {})}
								>
									<span className={styles.footerLinkIcon}>
										<Icon size={18} strokeWidth={2.25} />
									</span>
									<span className={styles.footerLinkCopy}>
										<span className={styles.footerLinkTitle}>{link.title}</span>
										<span className={styles.footerLinkDesc}>{link.desc}</span>
									</span>
									<ArrowRight size={15} className={styles.footerLinkArrow} />
								</a>
							);
						})}
					</div>
				</div>

				<div className={styles.footerBottom}>
					<span>© 2026 Genetiq. All rights reserved.</span>
				</div>
			</footer>
		</div>
	);
};

export default Config;
