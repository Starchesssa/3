
import {Composition, registerRoot, useCurrentFrame, interpolate} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import React, {useRef} from 'react';
import {useFrame} from '@react-three/fiber';

// --- 3D Scene Component ---
const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const meshRef = useRef<THREE.Mesh>(null!);

  // Animate rotation over time
  const rotation = interpolate(frame, [0, 150], [0, Math.PI * 2]);

  useFrame(() => {
    meshRef.current.rotation.y = rotation;
  });

  const texture = new THREE.TextureLoader().load(
    staticFile('image-of-new-york-in-sunshine-without-people.jpg')
  );

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 2, 5]} />
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[4, 2.25]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </>
  );
};

// --- Composition Wrapper ---
export const ThreeDepthScene: React.FC = () => {
  return (
    <ThreeCanvas camera={{position: [0, 0, 6]}}>
      <Scene />
    </ThreeCanvas>
  );
};

// --- Register the Composition ---
registerRoot(() => (
  <Composition
    id="ThreeDepth"
    component={ThreeDepthScene}
    durationInFrames={150}
    fps={30}
    width={1080}
    height={1080}
  />
));
