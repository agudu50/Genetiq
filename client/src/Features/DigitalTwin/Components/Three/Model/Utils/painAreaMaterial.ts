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

      float rand(vec2 co) {
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u*u*(3.0-2.0*u);

          float res = mix(
              mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
              mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
          return res*res;
      }

      void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = length(vUv - center);
          
          float sharpPulse = pow(abs(sin(time * 2.0)), 3.0);
          float rapidPulse = pow(abs(sin(time * 8.0)), 2.0);
          
          float combinedPulse = mix(sharpPulse, rapidPulse, 0.3) * pulse * 0.05; 
          
          float noiseScale = 12.0;
          float noiseValue = noise(vUv * noiseScale + time * 0.5);
          
          float coreBrightness = smoothstep(0.25, 0.0, dist) * (1.5 + combinedPulse * 0.5);
          
          vec3 finalColor;
          if (dist < 0.15) {
              finalColor = mix(coreColor, midColor, dist * 6.67);
          } else if (dist < 0.35) {
              finalColor = mix(midColor, outerColor, (dist - 0.15) * 5.0);
          } else {
              finalColor = outerColor;
          }

          float pulseEffect = 1.0 + (combinedPulse * 0.3);
          float alpha = smoothstep(0.7, 0.0, dist);
          
          float distortion = noiseValue * (0.3 + combinedPulse * 0.2);
          alpha *= (0.9 + distortion) * pulseEffect;

          float hotSpots = pow(noiseValue, 3.0) * combinedPulse;
          finalColor += vec3(hotSpots * 0.3, hotSpots * 0.1, 0.0);
          
          finalColor += coreColor * coreBrightness * (1.0 + combinedPulse * 0.5);

          float edgeFade = smoothstep(0.5, 0.0, dist);
          alpha *= edgeFade * intensity;

          alpha *= 0.8 + combinedPulse * 0.2;

          gl_FragColor = vec4(finalColor, alpha * 0.9);
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
