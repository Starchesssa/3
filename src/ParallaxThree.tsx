
import React, { useRef, useEffect, useState } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import nyImage from "../BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg";

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

    // Spread layers from 0 → 500 in front of camera
    const zStart = (index / (totalLayers - 1)) * 500;
    const z = zStart - progress * 200; // move layers slightly forward

    const offsetX = (index - totalLayers / 2) * 20;
    const offsetY = (index - totalLayers / 2) * 10;

    meshRef.current.position.set(offsetX, offsetY, z);

    const scale = interpolate(z, [0, 500], [1.0, 1.2]);
    meshRef.current.scale.set(scale, scale, 1);

    if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
      meshRef.current.material.opacity = progress * (1 - index * 0.05);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[50, 30]} />
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

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(nyImage as unknown as string, (tex) => setTexture(tex));
  }, []);

  if (!texture) return <AbsoluteFill style={{ background: "#000" }} />;

  return (
    <AbsoluteFill>
      <Canvas style={{ background: "#000" }} camera={{ position: [0, 0, -100], fov: 60 }}>
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

        <fog attach="fog" args={["#000", 0, 2000]} />
      </Canvas>
    </AbsoluteFill>
  );
};
