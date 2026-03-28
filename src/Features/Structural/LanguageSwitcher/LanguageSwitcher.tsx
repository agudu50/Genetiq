import { useEffect, useRef, useState } from "react";
import { useLanguage, LangCode } from "@/App/i18n/LanguageContext";
import { SUPPORTED_LANGUAGES } from "@/App/i18n/supportedLanguages";
import styles from "./LanguageSwitcher.module.scss";

export default function LanguageSwitcher() {
	const { lang, setLang, t } = useLanguage();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const current = SUPPORTED_LANGUAGES.find((l) => l.code === lang);

	const choose = (code: LangCode) => {
		setLang(code);
		setOpen(false);
	};

	useEffect(() => {
		const onDocClick = (e: MouseEvent) => {
			if (!ref.current) return;
			if (!ref.current.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("click", onDocClick);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("click", onDocClick);
			document.removeEventListener("keydown", onKey);
		};
	}, []);

	return (
		<div className={styles.wrapper} ref={ref}>
			<div className={styles.label}>
				<span>{t("language_label")}</span>
				<button
					type='button'
					className={styles.button}
					aria-haspopup='listbox'
					aria-expanded={open}
					onClick={() => setOpen((v) => !v)}
				>
					<span className={styles.icon} aria-hidden>
						<svg
							width='18'
							height='18'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
								stroke='currentColor'
								strokeWidth='1.8'
							/>
							<path d='M2 12H22' stroke='currentColor' strokeWidth='1.8' />
							<path
								d='M12 2C9 5.5 9 18.5 12 22C15 18.5 15 5.5 12 2Z'
								stroke='currentColor'
								strokeWidth='1.8'
							/>
						</svg>
					</span>
					<span className={styles.buttonText}>
						{current ? current.name : lang.toUpperCase()}
					</span>
					<span className={styles.caret} aria-hidden>
						▾
					</span>
				</button>
			</div>
			{open && (
				<div className={styles.menu} role='listbox' tabIndex={-1}>
					{SUPPORTED_LANGUAGES.map((l) => (
						<div
							key={l.code}
							role='option'
							aria-selected={l.code === lang}
							className={`${styles.option} ${
								l.code === lang ? styles.optionActive : ""
							}`}
							onClick={() => choose(l.code as LangCode)}
						>
							{l.name}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
