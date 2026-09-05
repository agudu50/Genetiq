import * as THREE from "three";

export const createGlowingMaterial = (
	coreColor: THREE.Color,
	midColor: THREE.Color,
	outerColor: THREE.Color,
) => {
	return new THREE.ShaderMaterial({
		uniforms: {
			time: { value: 0 },
			intensity: { value: 1.0 },
			pulse: { value: 0 },
			coreColor: { value: coreColor },
			midColor: { value: midColor },
			outerColor: { value: outerColor },
		},
		vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
  `,
		fragmentShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      uniform float time;
      uniform float intensity;
      uniform float pulse;
      uniform vec3 coreColor;
      uniform vec3 midColor;
      uniform vec3 outerColor;

      void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = length(vUv - center);
          
          // Smooth pulsating indicator
          float gentlePulse = pow(sin(time * 2.0), 2.0) * 0.35 + pulse * 0.35;
          
          // Concentrated yet expansive clinical glow radii
          float coreRadius = 0.12 + gentlePulse * 0.04;
          float haloRadius = 0.34 + gentlePulse * 0.06;
          
          // Color blending from high-intensity core to crisp mid-tone
          vec3 finalColor;
          if (dist < coreRadius) {
              finalColor = mix(coreColor * 2.2, coreColor * 1.5, dist / coreRadius);
          } else if (dist < haloRadius) {
              float t = (dist - coreRadius) / (haloRadius - coreRadius);
              finalColor = mix(coreColor * 1.5, midColor, t);
          } else {
              float t = clamp((dist - haloRadius) / (0.48 - haloRadius), 0.0, 1.0);
              finalColor = mix(midColor, outerColor, t);
          }

          // Crisp center beacon
          float pointCore = smoothstep(coreRadius * 1.2, 0.0, dist) * (2.2 + gentlePulse * 1.0);
          finalColor += coreColor * pointCore;

          // Organic circular falloff
          float alpha = smoothstep(0.48, 0.03, dist);
          float breathingMultiplier = 0.85 + gentlePulse * 0.35;
          alpha *= breathingMultiplier * intensity;

          gl_FragColor = vec4(finalColor, alpha * 0.95);
      }
  `,
		transparent: true,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
		side: THREE.DoubleSide,
	});
};

// Keep backwards compatibility for the generic chest pain point
export const painAreaMaterial = createGlowingMaterial(
	new THREE.Color(1.0, 0.2, 0.0), // Core
	new THREE.Color(1.0, 0.3, 0.0), // Mid
	new THREE.Color(0.8, 0.1, 0.0), // Outer
);
