import { AlertTriangle, Droplets, Leaf, Apple, Stethoscope, HelpCircle, Activity } from "lucide-react";

export const renderRecommendationIcon = (iconStr: string, size = 18) => {
	const text = (iconStr || "").trim();
	const props = { size, strokeWidth: 2.25 };

	// 1. Check for specific emojis
	if (text.includes("🚨")) {
		return <AlertTriangle {...props} style={{ color: "#f87171" }} />;
	}
	if (text.includes("💧")) {
		return <Droplets {...props} style={{ color: "#60a5fa" }} />;
	}
	if (text.includes("🌿") || text.includes("🌱")) {
		return <Leaf {...props} style={{ color: "#34d399" }} />;
	}
	if (text.includes("🍎") || text.includes("🥗")) {
		return <Apple {...props} style={{ color: "#fbbf24" }} />;
	}
	if (text.includes("🩺")) {
		return <Stethoscope {...props} style={{ color: "#818cf8" }} />;
	}

	// 2. Check for keywords if no emoji is matched
	const lowercaseText = text.toLowerCase();
	if (/alert|warning|urgent|danger|emergency|critical|attention/i.test(lowercaseText)) {
		return <AlertTriangle {...props} style={{ color: "#f87171" }} />;
	}
	if (/water|hydration|droplet|drink|fluid/i.test(lowercaseText)) {
		return <Droplets {...props} style={{ color: "#60a5fa" }} />;
	}
	if (/leaf|herb|nature|moringa|kontomire|vegetable/i.test(lowercaseText)) {
		return <Leaf {...props} style={{ color: "#34d399" }} />;
	}
	if (/diet|food|fruit|nutrition|meal|eat|staples/i.test(lowercaseText)) {
		return <Apple {...props} style={{ color: "#fbbf24" }} />;
	}
	if (/stethoscope|doctor|clinic|hospital|physician|investigation|follow/i.test(lowercaseText)) {
		return <Stethoscope {...props} style={{ color: "#818cf8" }} />;
	}

	// 3. Fallback for seed mock data emojis
	if (text.includes("🥗")) return <Apple {...props} style={{ color: "#34d399" }} />;
	if (text.includes("☀️")) return <Leaf {...props} style={{ color: "#fbbf24" }} />;
	if (text.includes("🐟")) return <Activity {...props} style={{ color: "#60a5fa" }} />;

	// Default fallback icon
	return <HelpCircle {...props} style={{ color: "#94a3b8" }} />;
};
