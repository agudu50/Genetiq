// materialUtils.ts
import * as THREE from "three";
import { ModelTextures, BodyModelTextures } from "../Types/modelTypes";

export const createCardioMaterial = (
	meshName: string,
	textures: ModelTextures,
): THREE.Material => {
	const name = meshName.toLowerCase();

	const baseProperties = {
		roughness: 0.5,
		metalness: 0.1,
		side: THREE.DoubleSide,
		transparent: true,
	};

	if (
		name.includes("arteries") ||
		name.includes("aorta") ||
		name.includes("aortic")
	) {
		return new THREE.MeshStandardMaterial({
			...baseProperties,
			normalMap: textures.arteries.normal,
		});
	}

	if (
		name.includes("heart") ||
		name.includes("valve") ||
		name.includes("back_heart") ||
		name.includes("Capslice") ||
		name.includes("mitral") ||
		name.includes("tricuspic")
	) {
		return new THREE.MeshStandardMaterial({
			...baseProperties,
			normalMap: textures.heart.normal,
			displacementMap: textures.heart.height,
			displacementScale: 0.1,
		});
	}

	if (
		name.includes("vein") ||
		name.includes("vena") ||
		name.includes("Pulmoneryartery") ||
		name.includes("Pulmonary_vein") ||
		name.includes("pulmonary")
	) {
		return new THREE.MeshStandardMaterial({
			...baseProperties,
			normalMap: textures.veins.normal,
		});
	}

	return new THREE.MeshStandardMaterial({
		...baseProperties,
		normalMap: textures.heart.normal,
		displacementMap: textures.heart.height,
		displacementScale: 0.5,
	});
};

// ─── Body material ────────────────────────────────────────────────────────────
// Accepts Partial<BodyModelTextures> so it works before textures have loaded.
// The model renders immediately with a warm skin tone; maps are patched in-place
// as each texture resolves (see updateBodyMaterial below).
export const createBodyMaterial = (
	textures: Partial<BodyModelTextures>,
): THREE.MeshStandardMaterial => {
	return new THREE.MeshStandardMaterial({
		color: new THREE.Color(0xf0f0f0),
		map: textures.baseColor ?? null,
		normalMap: textures.normal ?? null,
		metalnessMap: textures.metallic ?? null,
		roughnessMap: textures.roughness ?? null,
		roughness: 0.9,
		metalness: 0.1,
		side: THREE.DoubleSide,
		transparent: true,
		envMapIntensity: 0.8,
	});
};

// Patch an existing body material in-place when a new texture arrives.
// This avoids creating a new material (and recompiling shaders) on every update.
export const updateBodyMaterial = (
	mat: THREE.MeshStandardMaterial,
	textures: Partial<BodyModelTextures>,
): void => {
	let changed = false;
	if (textures.baseColor && mat.map !== textures.baseColor) {
		mat.map = textures.baseColor;
		changed = true;
	}
	if (textures.normal && mat.normalMap !== textures.normal) {
		mat.normalMap = textures.normal;
		changed = true;
	}
	if (textures.metallic && mat.metalnessMap !== textures.metallic) {
		mat.metalnessMap = textures.metallic;
		changed = true;
	}
	if (textures.roughness && mat.roughnessMap !== textures.roughness) {
		mat.roughnessMap = textures.roughness;
		changed = true;
	}
	if (changed) mat.needsUpdate = true;
};
