import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GeneticTrait {
	id: string;
	category: "Nutrigenomics" | "Fitness" | "Skin" | "HealthRisk";
	name: string;
	description: string;
	outcome: string; // e.g., "Fast Metabolizer"
	impact: "Positive" | "Neutral" | "Negative";
	genotype: string; // e.g., "CC", "AG"
	evidence_level: 1 | 2 | 3 | 4; // Confidence in the science
}

interface GenomicsState {
	traits: GeneticTrait[];
	geneticResilience: number;
	lastUpdated: string;
	suiObjectId?: string; // Reference to the encrypted DNA object on Sui
}

const initialState: GenomicsState = {
	traits: [
		{
			id: "dna-1",
			category: "Nutrigenomics",
			name: "Caffeine Metabolism (CYP1A2)",
			description: "How quickly your liver processes caffeine.",
			outcome: "Fast Metabolizer",
			impact: "Positive",
			genotype: "AA",
			evidence_level: 4,
		},
		{
			id: "dna-2",
			category: "Nutrigenomics",
			name: "Vitamin D Receptor (VDR)",
			description: "Efficiency in absorbing and using Vitamin D.",
			outcome: "Reduced Absorption",
			impact: "Negative",
			genotype: "GG",
			evidence_level: 4,
		},
		{
			id: "dna-3",
			category: "Fitness",
			name: "Muscle Fiber Type (ACTN3)",
			description: "The 'Sprint Gene' - presence of alpha-actinin-3.",
			outcome: "Power/Sprinting Advantage",
			impact: "Positive",
			genotype: "RR",
			evidence_level: 4,
		},
		{
			id: "dna-4",
			category: "HealthRisk",
			name: "Heart Health (PRS)",
			description: "Polygenic Risk Score for Cardiovascular health.",
			outcome: "Average Risk",
			impact: "Neutral",
			genotype: "N/A",
			evidence_level: 3,
		},
	],
	geneticResilience: 82,
	lastUpdated: "2024-03-10",
};

const genomicsSlice = createSlice({
	name: "genomics",
	initialState,
	reducers: {
		setTraits: (state, action: PayloadAction<GeneticTrait[]>) => {
			state.traits = action.payload;
		},
		updateResilience: (state, action: PayloadAction<number>) => {
			state.geneticResilience = action.payload;
		},
	},
});

export const { setTraits, updateResilience } = genomicsSlice.actions;
export default genomicsSlice.reducer;
