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

export const createBodyMaterial = (
	textures: BodyModelTextures,
): THREE.Material => {
	return new THREE.MeshStandardMaterial({
		map: textures.baseColor,
		normalMap: textures.normal,
		metalnessMap: textures.metallic,
		roughnessMap: textures.roughness,
		roughness: 0.9,
		metalness: 0.1,
		side: THREE.DoubleSide,
		transparent: true,
		envMapIntensity: 0.8,
		color: new THREE.Color(0xf0f0f0),
	});
};
