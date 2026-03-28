import * as THREE from "three";

export interface ModelProps {
	position?: [number, number, number];
	rotation?: [number, number, number];
	scale?: [number, number, number];
	color?: string;
	modelType?: "body" | "cardio";
}

export interface TextureSet {
	diffuse: THREE.Texture;
	normal: THREE.Texture;
	height?: THREE.Texture;
}

export interface ModelTextures {
	arteries: TextureSet;
	heart: TextureSet;
	veins: TextureSet;
}

export interface BodyModelTextures {
	base?: THREE.Texture;
	baseColor: THREE.Texture;
	metallic: THREE.Texture;
	normal: THREE.Texture;
	roughness: THREE.Texture;
}
