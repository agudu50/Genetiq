import styles from "./SideBar.module.scss";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { setCategory } from "@/App/Redux/categorySlice";
import { ZOOM_CONFIGS } from "../Three/Scene/Constants/SceneConstants";

// React Icons
import {
	MdBloodtype,
	MdSecurity,
	MdAccessibility,
	MdMonitorHeart,
} from "react-icons/md";
import {
	GiHeartOrgan,
	GiBrain,
	GiLungs,
	GiStomach,
	GiInternalOrgan,
	GiKidneys,
	GiSkeleton,
	GiApothecary,
	GiBubbles,
	GiEnergise,
	GiMicroscope,
} from "react-icons/gi";

import IconButton from "./Components/IconButton/IconButton";
import Dropdown from "../../Dropdown/Dropdown";

type DropdownValue = "total" | "cardio";
type SegmentType = "vitals" | "internal" | "physical" | "systems";

interface SideBarProps {
	onModelChange: (
		type: "body" | "cardio",
		cameraConfig: {
			position: [number, number, number];
			zoom: number;
		},
	) => void;
	modelType?: "body" | "cardio";
	externalCollapsed?: boolean;
	onExternalToggle?: () => void;
	onSelectionMade?: () => void;
}

const SideBar = ({
	onModelChange,
	modelType = "body",
	externalCollapsed,
	onSelectionMade,
}: SideBarProps) => {
	const dispatch = useDispatch();
	const [isMobile, setIsMobile] = useState(false);
	const [activeButton, setActiveButton] = useState<string>("total");
	const [dropdownValue, setDropdownValue] = useState<DropdownValue>("total");
	const [activeSegment, setActiveSegment] = useState<SegmentType>("vitals");

	const isCollapsed = externalCollapsed;

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 1024);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		if (modelType === "cardio") {
			setActiveButton("CardioLoad");
			setDropdownValue("cardio");
			setActiveSegment("vitals");
			dispatch(setCategory("cardiovascular"));
		}
	}, [modelType, dispatch]);

	const handleCategoryChange = (category: string) => {
		dispatch(setCategory(category));
	};

	const handleZoom = (bodyPart: string) => {
		if (activeButton === bodyPart) return;
		setActiveButton(bodyPart);
		const config = ZOOM_CONFIGS[bodyPart];
		if (config) {
			if (bodyPart === "CardioLoad") {
				handleCategoryChange("cardiovascular");
				onModelChange("cardio", config);
			} else {
				handleCategoryChange(bodyPart);
				onModelChange("body", config);
			}
		}

		if (isMobile && onSelectionMade) {
			onSelectionMade();
		}
	};

	const handleDropdownChange = (value: DropdownValue) => {
		if (value === dropdownValue) return;
		setDropdownValue(value);
		if (value === "total") {
			handleZoom("total");
		} else if (value === "cardio") {
			handleZoom("CardioLoad");
		}
	};

	const allButtons = [
		// Vitals Segment
		{
			text: "ClinicalNotes",
			icon: <MdMonitorHeart />,
			label: "Health Overview",
			segment: "vitals",
		},
		{
			text: "CardioLoad",
			icon: <GiHeartOrgan />,
			label: "Cardiovascular",
			count: 3,
			segment: "vitals",
		},
		{
			text: "StressManagement",
			icon: <GiBrain />,
			label: "Neurological",
			segment: "vitals",
		},
		{
			text: "Pulmonology",
			icon: <GiLungs />,
			label: "Respiratory",
			segment: "vitals",
		},

		// Internal Segment
		{
			text: "Gastroenterolgy",
			icon: <GiStomach />,
			label: "Digestive",
			segment: "internal",
		},
		{
			text: "Endocrinology",
			icon: <GiInternalOrgan />,
			label: "Endocrine",
			segment: "internal",
		},
		{
			text: "Pulmonology1",
			icon: <GiKidneys />,
			label: "Renal",
			segment: "internal",
		},
		{
			text: "Urology",
			icon: <GiMicroscope />,
			label: "Urological",
			segment: "internal",
		},

		// Physical Segment
		{
			text: "UlnaRadiusAlt",
			icon: <GiSkeleton />,
			label: "Musculoskeletal",
			segment: "physical",
		},
		{
			text: "Gynecology",
			icon: <GiApothecary />,
			label: "Reproductive",
			segment: "physical",
		},
		{
			text: "Hematology",
			icon: <MdBloodtype />,
			label: "Hematology",
			segment: "physical",
		},

		// Systems Segment
		{
			text: "Nephrology",
			icon: <MdSecurity />,
			label: "Immune System",
			segment: "systems",
		},
		{
			text: "Alergy",
			icon: <GiBubbles />,
			label: "Allergy/Skin",
			segment: "systems",
		},
		{
			text: "OxygenSaturation",
			icon: <GiEnergise />,
			label: "Metabolic",
			segment: "systems",
		},
	];

	const filteredButtons = allButtons.filter((b) => b.segment === activeSegment);

	const segments: { id: SegmentType; label: string }[] = [
		{ id: "vitals", label: "Vitals" },
		{ id: "internal", label: "Internal" },
		{ id: "physical", label: "Physical" },
		{ id: "systems", label: "Systems" },
	];

	const sidebarContent = (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={isCollapsed ? { opacity: 0, x: -100 } : { opacity: 1, x: 0 }}
			className={styles["SideBar-container"]}
		>
			<div className={styles["sidebar-inner"]}>
				<Dropdown
					value={dropdownValue}
					onChange={handleDropdownChange}
					onModelChange={onModelChange}
				/>

				<div className={styles["separator"]} />

				{/* Segment Control (Tabs) */}
				<div className={styles["segment-control"]}>
					{segments.map((s) => (
						<button
							key={s.id}
							className={`${styles["segment-tab"]} ${activeSegment === s.id ? styles["active"] : ""}`}
							onClick={() => setActiveSegment(s.id)}
						>
							{s.label.charAt(0)}
						</button>
					))}
				</div>

				<div className={styles["icons-grid"]}>
					<IconButton
						active={activeButton === "total"}
						tooltip='Total Body'
						onClick={() => handleZoom("total")}
					>
						<MdAccessibility
							style={{
								color: activeButton === "total" ? "#ffffff" : "inherit",
							}}
						/>
					</IconButton>

					<div className={styles["group-separator"]} />

					<AnimatePresence mode='wait'>
						<motion.div
							key={activeSegment}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							transition={{ duration: 0.2 }}
							className={styles["segmented-icons"]}
						>
							{filteredButtons.map((data) => (
								<IconButton
									key={data.text}
									onClick={() => handleZoom(data.text)}
									active={activeButton === data.text}
									tooltip={data.label}
								>
									{data.count && (
										<span className={styles["SideBar-count"]}>
											{data.count}
										</span>
									)}
									{data.icon}
								</IconButton>
							))}
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</motion.div>
	);

	if (isMobile) {
		return createPortal(sidebarContent, document.body);
	}

	return sidebarContent;
};

export default SideBar;
