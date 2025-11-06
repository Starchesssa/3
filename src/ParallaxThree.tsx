
import React, { useRef, useEffect, useState } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import nyImage from "../BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg";

// Single plane layer component
const LayerPlane: React.FC<{
  texture: THREE.Texture;
  index: number;
  totalLayers: number;
  frame: number;
  splitStartFrame: number;
  totalFrames: number;
}> = ({ texture, index, totalLayers, frame, splitStartFrame, totalFrames }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    // Progress of slice animation (0 → 1)
    const progress =
      frame < splitStartFrame
        ? 0
        : interpolate(frame, [splitStartFrame, totalFrames], [0, 1]);

    // Spread layers in Z initially
    const zStart = -400 + (index / (totalLayers - 1)) * 400;
    const z = zStart + progress * 500; // Move toward camera

    // Offset X/Y for slight parallax spread
    const offsetX = (index - totalLayers / 2) * 2;
    const offsetY = (index - totalLayers / 2) * 1;

    meshRef.current.position.set(offsetX, offsetY, z);

    // Scale effect based on Z
    const scale = interpolate(z + 100, [-400, 100], [0.8, 1.2]);
    meshRef.current.scale.set(scale, scale, 1);

    // Optional: fade-in per layer
    if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
      meshRef.current.material.opacity = progress * (1 - index * 0.05);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[5, 3]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
};

export const ParallaxThree: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = 240;
  const layers = 5;
  const splitStartFrame = 40;

  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load image as texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(nyImage, (tex) => {
      setTexture(tex);
    });
  }, []);

  // Show black background until texture is loaded
  if (!texture) return <AbsoluteFill style={{ background: "#000" }} />;

  return (
    <AbsoluteFill>
      <Canvas
        style={{ background: "#000" }}
        camera={{ position: [0, 0, -600], fov: 60 }}
      >
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 5, -5]} intensity={0.7} />

        {/* Layers */}
        {Array.from({ length: layers }).map((_, i) => (
          <LayerPlane
            key={i}
            texture={texture}
            index={i}
            totalLayers={layers}
            frame={frame}
            splitStartFrame={splitStartFrame}
            totalFrames={totalFrames}
          />
        ))}

        {/* Optional: add more effects, like fog */}
        <fog attach="fog" args={["#000", 0, 2000]} />
      </Canvas>
    </AbsoluteFill>
  );
};
