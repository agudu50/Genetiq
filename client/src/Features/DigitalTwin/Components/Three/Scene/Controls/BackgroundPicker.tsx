import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { Palette, Check } from "lucide-react";
import { useLanguage } from "@/App/i18n/LanguageContext";
import styles from "./BackgroundPicker.module.scss";
import {
	CANVAS_BACKGROUND_PRESETS,
	CanvasBackgroundId,
} from "../backgroundPresets";

const MOBILE_BREAKPOINT = 1024;
const NAVBAR_CLEARANCE = 76;

interface BackgroundPickerProps {
	value: CanvasBackgroundId;
	onChange: (id: CanvasBackgroundId) => void;
}

function useIsMobilePicker() {
	const [isMobile, setIsMobile] = useState(
		() =>
			typeof window !== "undefined" &&
			window.innerWidth <= MOBILE_BREAKPOINT,
	);

	useEffect(() => {
		const mediaQuery = window.matchMedia(
			`(max-width: ${MOBILE_BREAKPOINT}px)`,
		);
		const update = () => setIsMobile(mediaQuery.matches);

		update();
		mediaQuery.addEventListener("change", update);
		return () => mediaQuery.removeEventListener("change", update);
	}, []);

	return isMobile;
}

export const BackgroundPicker = ({ value, onChange }: BackgroundPickerProps) => {
	const { t } = useLanguage();
	const [open, setOpen] = useState(false);
	const [portalStyle, setPortalStyle] = useState<CSSProperties>({});
	const rootRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const isMobile = useIsMobilePicker();
	const activePreset =
		CANVAS_BACKGROUND_PRESETS.find((preset) => preset.id === value) ??
		CANVAS_BACKGROUND_PRESETS[0];

	useLayoutEffect(() => {
		if (!open || !isMobile || !triggerRef.current) return;

		const updatePosition = () => {
			const rect = triggerRef.current?.getBoundingClientRect();
			if (!rect) return;

			const right = Math.max(16, window.innerWidth - rect.right);
			const spaceAbove = rect.top - NAVBAR_CLEARANCE - 12;

			setPortalStyle({
				position: "fixed",
				right,
				bottom: window.innerHeight - rect.top + 12,
				maxHeight: Math.max(180, spaceAbove),
				zIndex: 100002,
			});
		};

		updatePosition();
		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);

		return () => {
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
		};
	}, [open, isMobile]);

	useEffect(() => {
		if (!open) return;

		const handlePointerDown = (event: MouseEvent) => {
			const target = event.target as Node;
			if (rootRef.current?.contains(target)) return;
			if (panelRef.current?.contains(target)) return;
			setOpen(false);
		};

		document.addEventListener("mousedown", handlePointerDown);
		return () => document.removeEventListener("mousedown", handlePointerDown);
	}, [open]);

	const panel = (
		<div
			ref={panelRef}
			className={`${styles.panel} ${isMobile ? styles.panelPortal : ""}`}
			style={isMobile ? portalStyle : undefined}
			role="dialog"
			aria-label={t("canvas_background")}
		>
			<div className={styles.panelHeader}>
				<span>{t("canvas_background") || "Background"}</span>
			</div>
			<div className={styles.swatches}>
				{CANVAS_BACKGROUND_PRESETS.map((preset) => {
					const isActive = preset.id === value;
					return (
						<button
							key={preset.id}
							type="button"
							className={`${styles.swatch} ${isActive ? styles.swatchActive : ""}`}
							onClick={() => {
								onChange(preset.id);
								setOpen(false);
							}}
							title={t(preset.labelKey)}
						>
							<span
								className={styles.swatchPreview}
								style={{ background: preset.preview }}
							/>
							<span className={styles.swatchLabel}>{t(preset.labelKey)}</span>
							{isActive && (
								<span className={styles.swatchCheck}>
									<Check size={12} strokeWidth={3} />
								</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);

	return (
		<div className={styles.root} ref={rootRef}>
			<button
				ref={triggerRef}
				type="button"
				className={`${styles.trigger} ${open ? styles.triggerActive : ""}`}
				onClick={() => setOpen((prev) => !prev)}
				aria-expanded={open}
				aria-label={t("canvas_background") || "Background"}
				title={t("canvas_background") || "Background"}
			>
				<span className={styles.triggerInner}>
					<Palette className={styles.triggerIcon} strokeWidth={2.25} />
					<span
						className={styles.triggerPreview}
						style={{ background: activePreset.preview }}
						aria-hidden
					/>
				</span>
			</button>

			{open &&
				(isMobile && typeof document !== "undefined"
					? createPortal(panel, document.body)
					: panel)}
		</div>
	);
};

export default BackgroundPicker;
