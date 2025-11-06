// src/ParallaxThree.tsx
import React, { useRef, useEffect } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import nyImage from "../BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg";

// Component for a single plane layer
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

    const progress = frame < splitStartFrame
      ? 0
      : interpolate(frame, [splitStartFrame, totalFrames], [0, 1]);

    const zStart = -400 + (index / (totalLayers - 1)) * 400; // spread layers in Z
    const z = zStart + progress * 500; // move towards camera

    meshRef.current.position.set(
      (index - totalLayers / 2) * 2, // X offset
      (index - totalLayers / 2) * 1, // Y offset
      z
    );

    // optional scale effect
    const scale = interpolate(z + 100, [-400, 100], [0.8, 1.2]);
    meshRef.current.scale.set(scale, scale, 1);
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

  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);

  // Load image as texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(nyImage, (tex) => {
      setTexture(tex);
    });
  }, []);

  if (!texture) return <AbsoluteFill style={{ background: "#000" }} />;

  return (
    <AbsoluteFill>
      <Canvas
        style={{ background: "#000" }}
        camera={{ position: [0, 0, -600], fov: 60 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 5, -5]} intensity={0.7} />
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
      </Canvas>
    </AbsoluteFill>
  );
};
