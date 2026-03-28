import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { ModelTextures, BodyModelTextures } from "../Types/modelTypes";

// Cardio texture imports
import arteriesDiffuseUrl from "@assets/models/cardio/Arteries_Diffuse.png?url";
import arteriesNormalUrl from "@assets/models/cardio/Arteries_Normal.png?url";
import heartDiffuseUrl from "@assets/models/cardio/HeartAnatomy_Diffuse.png?url";
import heartNormalUrl from "@assets/models/cardio/HeartAnatomy_Normal.png?url";
import heartHeightUrl from "@assets/models/cardio/HeartAnatomy_Height.png?url";
import veinsDiffuseUrl from "@assets/models/cardio/Veins_Diffuse.png?url";
import veinsNormalUrl from "@assets/models/cardio/Veins_Normal.png?url";

// Body texture imports
import baseColorUrl from "@assets/models/normal/Body_2_baseColor.jpg?url";
import metallicUrl from "@assets/models/normal/Body_2_metallic.jpg?url";
import normalUrl from "@assets/models/normal/Body_2_normal.png?url";
import roughnessUrl from "@assets/models/normal/Body_2_roughness.jpg?url";

export const useCardioTextures = (): ModelTextures => {
	const arteriesDiffuse = useLoader(THREE.TextureLoader, arteriesDiffuseUrl);
	const arteriesNormal = useLoader(THREE.TextureLoader, arteriesNormalUrl);
	const heartDiffuse = useLoader(THREE.TextureLoader, heartDiffuseUrl);
	const heartNormal = useLoader(THREE.TextureLoader, heartNormalUrl);
	const heartHeight = useLoader(THREE.TextureLoader, heartHeightUrl);
	const veinsDiffuse = useLoader(THREE.TextureLoader, veinsDiffuseUrl);
	const veinsNormal = useLoader(THREE.TextureLoader, veinsNormalUrl);

	return {
		arteries: { diffuse: arteriesDiffuse, normal: arteriesNormal },
		heart: { diffuse: heartDiffuse, normal: heartNormal, height: heartHeight },
		veins: { diffuse: veinsDiffuse, normal: veinsNormal },
	};
};

export const useBodyTextures = (): BodyModelTextures => {
	return {
		base: useLoader(THREE.TextureLoader, baseColorUrl),
		baseColor: useLoader(THREE.TextureLoader, baseColorUrl),
		metallic: useLoader(THREE.TextureLoader, metallicUrl),
		normal: useLoader(THREE.TextureLoader, normalUrl),
		roughness: useLoader(THREE.TextureLoader, roughnessUrl),
	};
};
