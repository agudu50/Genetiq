import { useState, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ModelTextures, BodyModelTextures } from "../Types/modelTypes";

// Cardio texture imports (diffuse maps are unused by createCardioMaterial)
import arteriesNormalUrl from "@assets/models/cardio/Arteries_Normal.png?url";
import heartNormalUrl from "@assets/models/cardio/HeartAnatomy_Normal.png?url";
import heartHeightUrl from "@assets/models/cardio/HeartAnatomy_Height.png?url";
import veinsNormalUrl from "@assets/models/cardio/Veins_Normal.png?url";

// Body texture imports
import baseColorUrl from "@assets/models/normal/Body_2_baseColor.jpg?url";
import metallicUrl from "@assets/models/normal/Body_2_metallic.jpg?url";
import normalUrl from "@assets/models/normal/Body_2_normal.png?url";
import roughnessUrl from "@assets/models/normal/Body_2_roughness.jpg?url";

// ─── Module-level preloads ────────────────────────────────────────────────────
// Kick off all asset fetches the moment this module is imported (as the
// Dashboard lazy-chunk loads). By the time the Canvas mounts and components
// call useLoader() they find resources already cached — no Suspense waterfall.
useLoader.preload(OBJLoader, "/assets/models/normal/normal.obj");
useLoader.preload(THREE.TextureLoader, baseColorUrl);
useLoader.preload(THREE.TextureLoader, normalUrl);
useLoader.preload(THREE.TextureLoader, metallicUrl);
useLoader.preload(THREE.TextureLoader, roughnessUrl);

// ─── Async (non-suspending) body texture hook ─────────────────────────────────
// Loads each texture independently via useEffect. The mesh renders immediately
// with a simple skin-toned material and upgrades progressively as each texture
// resolves, so the 10.82 MB normal map no longer blocks the first frame.
export const useBodyTextures = (): Partial<BodyModelTextures> => {
	const [textures, setTextures] = useState<Partial<BodyModelTextures>>({});

	useEffect(() => {
		let mounted = true;
		const tl = new THREE.TextureLoader();

		// Load smallest first so the model looks decent ASAP
		tl.loadAsync(baseColorUrl).then((t) => {
			if (!mounted) return;
			t.colorSpace = THREE.SRGBColorSpace;
			setTextures((p) => ({ ...p, base: t, baseColor: t }));
		});
		tl.loadAsync(metallicUrl).then(
			(t) => mounted && setTextures((p) => ({ ...p, metallic: t })),
		);
		tl.loadAsync(roughnessUrl).then(
			(t) => mounted && setTextures((p) => ({ ...p, roughness: t })),
		);
		// Normal map is 10.82 MB — load last; model still looks good without it
		tl.loadAsync(normalUrl).then(
			(t) => mounted && setTextures((p) => ({ ...p, normal: t })),
		);

		return () => {
			mounted = false;
		};
	}, []);

	return textures;
};

// ─── Cardio textures — suspending (acceptable: cardio is not the default view)
export const useCardioTextures = (): ModelTextures => {
	const arteriesNormal = useLoader(THREE.TextureLoader, arteriesNormalUrl);
	const heartNormal = useLoader(THREE.TextureLoader, heartNormalUrl);
	const heartHeight = useLoader(THREE.TextureLoader, heartHeightUrl);
	const veinsNormal = useLoader(THREE.TextureLoader, veinsNormalUrl);

	return {
		arteries: { normal: arteriesNormal },
		heart: { normal: heartNormal, height: heartHeight },
		veins: { normal: veinsNormal },
	};
};

