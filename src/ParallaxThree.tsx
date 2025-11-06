
// src/ParallaxThree.tsx
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

    // Animation progress
    const progress =
      frame < splitStartFrame
        ? 0
        : interpolate(frame, [splitStartFrame, totalFrames], [0, 1]);

    // Z-position for depth
    const zStart = -index * 300; // spread layers
    const z = zStart + progress * 300; // animate toward camera

    // X/Y offsets for parallax
    const offsetX = (index - totalLayers / 2) * 50;
    const offsetY = (index - totalLayers / 2) * 25;

    meshRef.current.position.set(offsetX, offsetY, z);

    // Scale based on Z
    const scale = interpolate(z + 300, [-500, 100], [1.5, 1]);
    meshRef.current.scale.set(scale, scale, 1);

    // Fade in
    if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
      meshRef.current.material.opacity = progress;
    }

    // 🔹 Debug log for first frame
    if (frame === 0) {
      console.log(
        `Layer ${index}: pos=(${offsetX}, ${offsetY}, ${z}), scale=${scale}, progress=${progress}`
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1920, 1080]} /> {/* match composition size */}
      <meshBasicMaterial map={texture} transparent opacity={0} />
    </mesh>
  );
};

export const ParallaxThree: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = 240;
  const layers = 5;
  const splitStartFrame = 40;

  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load image
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      nyImage as unknown as string,
      (tex) => {
        console.log("✅ Texture loaded!");
        setTexture(tex);
      },
      undefined,
      (err) => console.error("❌ Texture failed to load:", err)
    );
  }, []);

  if (!texture) return <AbsoluteFill style={{ background: "#000" }} />;

  return (
    <AbsoluteFill>
      <Canvas
        style={{ background: "#000" }}
        camera={{ position: [0, 0, 1000], fov: 50 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 500, 500]} intensity={0.7} />

        {[...Array(layers)].map((_, i) => (
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

        {/* Optional: add fog */}
        <fog attach="fog" args={["#000", 0, 2000]} />
      </Canvas>
    </AbsoluteFill>
  );
};
      
