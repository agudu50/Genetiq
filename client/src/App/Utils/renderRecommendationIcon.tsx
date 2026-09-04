import {
	AlertTriangle,
	Droplets,
	Leaf,
	Apple,
	Stethoscope,
	Pill,
	Building2,
	Bed,
	Users,
	RotateCw,
	ShieldCheck,
	HeartPulse,
} from "lucide-react";

export const renderRecommendationIcon = (iconStr: string, size = 18) => {
	const text = (iconStr || "").trim();
	const props = { size, strokeWidth: 2.25 };

	// 1. Emoji / Symbol pattern recognition
	if (text.includes("🚨") || text.includes("⚠️") || text.includes("🚫")) {
		return <AlertTriangle {...props} style={{ color: "#f87171" }} />;
	}
	if (text.includes("💧") || text.includes("💦")) {
		return <Droplets {...props} style={{ color: "#60a5fa" }} />;
	}
	if (text.includes("🌿") || text.includes("🌱") || text.includes("🥬") || text.includes("🌳")) {
		return <Leaf {...props} style={{ color: "#34d399" }} />;
	}
	if (text.includes("🍎") || text.includes("🥗") || text.includes("🍊") || text.includes("🍚") || text.includes("🍈") || text.includes("🍲")) {
		return <Apple {...props} style={{ color: "#fbbf24" }} />;
	}
	if (text.includes("🩺") || text.includes("👨‍⚕️") || text.includes("👩‍⚕️")) {
		return <Stethoscope {...props} style={{ color: "#818cf8" }} />;
	}
	if (text.includes("🏥") || text.includes("🚑")) {
		return <Building2 {...props} style={{ color: "#ef4444" }} />;
	}
	if (text.includes("💊")) {
		return <Pill {...props} style={{ color: "#a855f7" }} />;
	}
	if (text.includes("🛏️") || text.includes("😴")) {
		return <Bed {...props} style={{ color: "#38bdf8" }} />;
	}
	if (text.includes("👨‍👩‍👧‍👦") || text.includes("👥")) {
		return <Users {...props} style={{ color: "#6366f1" }} />;
	}
	if (text.includes("🔄")) {
		return <RotateCw {...props} style={{ color: "#10b981" }} />;
	}

	// 2. Keyword matching
	const lowercaseText = text.toLowerCase();
	if (/alert|warning|urgent|danger|emergency|critical|attention|avoid/i.test(lowercaseText)) {
		return <AlertTriangle {...props} style={{ color: "#f87171" }} />;
	}
	if (/water|hydration|droplet|drink|fluid/i.test(lowercaseText)) {
		return <Droplets {...props} style={{ color: "#60a5fa" }} />;
	}
	if (/leaf|herb|nature|moringa|kontomire|vegetable|plant|green/i.test(lowercaseText)) {
		return <Leaf {...props} style={{ color: "#34d399" }} />;
	}
	if (/diet|food|fruit|nutrition|meal|eat|staples|rice|vitamin/i.test(lowercaseText)) {
		return <Apple {...props} style={{ color: "#fbbf24" }} />;
	}
	if (/medication|supplement|tablet|antibiotic|pill|capsule/i.test(lowercaseText)) {
		return <Pill {...props} style={{ color: "#a855f7" }} />;
	}
	if (/hospital|clinic|emergency|ambulance/i.test(lowercaseText)) {
		return <Building2 {...props} style={{ color: "#ef4444" }} />;
	}
	if (/rest|sleep|bed|mosquito/i.test(lowercaseText)) {
		return <Bed {...props} style={{ color: "#38bdf8" }} />;
	}
	if (/family|planning|partner/i.test(lowercaseText)) {
		return <Users {...props} style={{ color: "#6366f1" }} />;
	}
	if (/retest|follow|repeat|confirm/i.test(lowercaseText)) {
		return <RotateCw {...props} style={{ color: "#10b981" }} />;
	}
	if (/stethoscope|doctor|physician|investigation|checkup/i.test(lowercaseText)) {
		return <Stethoscope {...props} style={{ color: "#818cf8" }} />;
	}
	if (/heart|cardio|pulse|blood/i.test(lowercaseText)) {
		return <HeartPulse {...props} style={{ color: "#ec4899" }} />;
	}

	// Default fallback icon
	return <ShieldCheck {...props} style={{ color: "#3b82f6" }} />;
};
