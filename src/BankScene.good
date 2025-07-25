
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Text, Environment } from "@react-three/drei";
import * as THREE from "three";

const FireworkParticle = ({ delay = 0, color = "orange" }) => {
  const ref = useRef();
  const startFrame = delay;

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime * 60;
    const t = elapsed - startFrame;
    if (!ref.current) return;
    if (t < 0) {
      ref.current.visible = false;
      return;
    }
    ref.current.visible = true;
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

const BankModel = () => {
  return (
    <group position={[0, -1, 0]}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 0.5, 3]} />
        <meshStandardMaterial color="#888" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <coneGeometry args={[2.5, 1, 4]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* Pillars */}
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[-1.5 + i, 0.75, 1.4]}>
          <cylinderGeometry args={[0.1, 0.1, 1.5]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}

      {/* Bank Text */}
      <Text
        position={[0, 1.2, 1.6]}
        fontSize={0.3}
        color="gold"
        anchorX="center"
        anchorY="middle"
      >
        BANK
      </Text>
    </group>
  );
};

const BankScene = () => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

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

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight castShadow intensity={0.7} position={[5, 5, 5]} />
      <group ref={groupRef}>
        <BankModel />
      </group>
      {fireworksData.map((data, i) => (
        <FireworkParticle key={i} {...data} />
      ))}
      <Sparkles size={4} scale={[6, 2, 6]} position={[0, 1, 0]} />
      <Environment preset="sunset" />
    </>
  );
};

export default BankScene;
