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
          
          // Smooth slow organic breathing cycle (calm 1.4 rad/s)
          float slowBreath = sin(time * 1.5) * 0.5 + 0.5;
          float gentlePulse = pow(sin(time * 1.5), 2.0) * 0.7 + pulse * 0.3;
          
          // Dynamic radiant radius expanding and contracting gently
          float coreRadius = 0.12 + gentlePulse * 0.05;
          float haloRadius = 0.42 + gentlePulse * 0.08;
          
          // Color ramp blending from intense radiant core -> mid tone -> soft outer aura
          vec3 finalColor;
          if (dist < coreRadius) {
              finalColor = mix(coreColor * 1.4, coreColor, dist / coreRadius);
          } else if (dist < haloRadius) {
              float t = (dist - coreRadius) / (haloRadius - coreRadius);
              finalColor = mix(coreColor, midColor, t);
          } else {
              float t = clamp((dist - haloRadius) / (0.5 - haloRadius), 0.0, 1.0);
              finalColor = mix(midColor, outerColor, t);
          }

          // Core brightness boost with pulsing intensity
          float coreBrightness = smoothstep(coreRadius * 1.8, 0.0, dist) * (1.2 + gentlePulse * 0.8);
          finalColor += coreColor * coreBrightness;

          // Smooth radial alpha fade to zero at border
          float alpha = smoothstep(0.5, 0.02, dist);
          
          // Apply slow breathing intensity modulation
          float breathingMultiplier = 0.75 + gentlePulse * 0.45;
          alpha *= breathingMultiplier * intensity;

          gl_FragColor = vec4(finalColor, alpha * 0.88);
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
