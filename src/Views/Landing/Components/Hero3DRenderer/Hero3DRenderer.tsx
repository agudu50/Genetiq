import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, Sphere } from "@react-three/drei";
import * as THREE from "three";
import styles from "./Hero3DRenderer.module.scss";

// Lightweight biometric core using simple primitives instead of an OBJ model
const BiometricCore = () => {
	const groupRef = useRef<THREE.Group>(null);

	// Create a stable hexagonal/orb structure
	const points = useMemo(() => {
		const temp = [];
		for (let i = 0; i < 40; i++) {
			const phi = Math.acos(-1 + (2 * i) / 40);
			const theta = Math.sqrt(40 * Math.PI) * phi;
			temp.push(new THREE.Vector3().setFromSphericalCoords(25, phi, theta));
		}
		return temp;
	}, []);

	useFrame((state) => {
		if (groupRef.current) {
			groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
			groupRef.current.rotation.x =
				Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
		}
	});

	return (
		<group ref={groupRef}>
			{/* Central Brain/Core Sphere */}
			<Sphere args={[2, 32, 32]}>
				<meshBasicMaterial color='#a855f7' transparent opacity={0.8} />
			</Sphere>

			{/* Biometric node points */}
			{points.map((pos, i) => (
				<mesh key={i} position={pos}>
					<sphereGeometry args={[0.4, 8, 8]} />
					<meshBasicMaterial
						color={i % 2 === 0 ? "#a855f7" : "#c084fc"}
						transparent
						opacity={0.6}
					/>
				</mesh>
			))}

			{/* Connection lines (simplified) */}
			<lineSegments>
				<edgesGeometry args={[new THREE.IcosahedronGeometry(25, 1)]} />
				<lineBasicMaterial color='#a855f7' transparent opacity={0.1} />
			</lineSegments>
		</group>
	);
};

// Optimized low-count particles
const FloatingDust = ({ count }: { count: number }) => {
	const points = useRef<THREE.Points>(null);

	const particlesPosition = useMemo(() => {
		const positions = new Float32Array(count * 3);
		for (let i = 0; i < count; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 150;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
		}
		return positions;
	}, [count]);

	useFrame((state) => {
		if (points.current) {
			points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
		}
	});

	return (
		<points ref={points}>
			<bufferGeometry>
				<bufferAttribute
					attach='attributes-position'
					count={particlesPosition.length / 3}
					array={particlesPosition}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial
				size={0.5}
				color='#c084fc'
				transparent
				opacity={0.4}
				sizeAttenuation
			/>
		</points>
	);
};

export const Hero3DRenderer = () => {
	return (
		<div className={styles.container}>
			<Canvas
				dpr={[1, 2]} // Limit DPR for performance
				gl={{ antialias: false, powerPreference: "high-performance" }}
			>
				<PerspectiveCamera makeDefault position={[0, 0, 80]} fov={45} />
				<ambientLight intensity={0.5} />

				<Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
					<BiometricCore />
				</Float>

				<FloatingDust count={150} />
			</Canvas>

			{/* CSS-based Background Pulse for depth without Three.js overhead */}
			<div className={styles.cssOverlay}>
				<div className={styles.pulseScanner} />
			</div>
		</div>
	);
};
