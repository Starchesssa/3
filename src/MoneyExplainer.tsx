
// src/MoneyExplainer.tsx

import React, { useRef, useMemo } from "react";
import { Composition } from "remotion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Text, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";

// Firework particle component
const FireworkParticle = ({ delay = 0, color = "orange" }) => {
  const ref = useRef();
  const startFrame = delay;

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime * 60;
    const t = elapsed - startFrame;

    if (!ref.current) return;

    ref.current.visible = t >= 0;

    if (t < 0) return;

    const speed = 0.05;
    ref.current.position.x = speed * t * Math.cos(t * 0.7 + delay);
    ref.current.position.y = speed * t * Math.sin(t * 1.2 + delay) + t * 0.03;
    ref.current.position.z = speed * t * Math.sin(t * 1.7 + delay);
    ref.current.material.opacity = THREE.MathUtils.clamp(1 - t / 40, 0, 1);
  });

  return (
    <mesh ref={ref} visible position={[0, 0, 0]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={1} />
    </mesh>
  );
};

// Bank model
const BankModel = () => {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color="#004d40" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.75, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <coneGeometry args={[1.5, 1, 4]} />
        <meshStandardMaterial color="#00796b" metalness={0.9} roughness={0.2} />
      </mesh>
      {[ -0.7, 0, 0.7 ].map((x) => (
        <mesh key={x} position={[x, -0.5, 1]} scale={[0.2, 1.5, 0.2]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#b2dfdb" />
        </mesh>
      ))}
      <Text
        position={[0, 0.6, 1.01]}
        fontSize={0.3}
        color="#a7ffeb"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Roboto-Bold.ttf"
      >
        BANK
      </Text>
    </group>
  );
};

// Main scene
const Scene4_3DBankFireworks = () => {
  const groupRef = useRef();
  const fireworksData = useMemo(
    () => [
      { color: "#ff4081", delay: 0 },
      { color: "#448aff", delay: 15 },
      { color: "#ffff00", delay: 30 },
      { color: "#00e676", delay: 45 },
      { color: "#ff9100", delay: 60 },
      { color: "#e040fb", delay: 75 },
    ],
    []
  );

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 2, 5], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        castShadow
        intensity={0.7}
        position={[5, 5, 5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <group ref={groupRef}>
        <BankModel />
      </group>
      {fireworksData.map(({ color, delay }, i) => (
        <FireworkParticle key={i} color={color} delay={delay} />
      ))}
      <Sparkles
        size={4}
        scale={[6, 2, 6]}
        position={[0, 1, 0]}
        color="#ffea00"
        count={40}
        speed={0.3}
      />
      <Environment preset="sunset" />
    </Canvas>
  );
};

export const MoneyExplainer = () => {
  return <Scene4_3DBankFireworks />;
};

// This is what Remotion expects
export const RemotionVideo = () => {
  return (
    <Composition
      id="MoneyExplainer"
      component={MoneyExplainer}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
