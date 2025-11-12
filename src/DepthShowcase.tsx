
import React, {useRef, useMemo} from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {useFrame, useLoader} from '@react-three/fiber';

// Load image + depth map into a displaced plane
const DepthImage: React.FC<{src: string; depth: string}> = ({src, depth}) => {
  const texture = useLoader(THREE.TextureLoader, src);
  const depthMap = useLoader(THREE.TextureLoader, depth);
  const mesh = useRef<THREE.Mesh>(null!);

  return (
    <mesh ref={mesh}>
      {/* Plane size depends on image proportions; use 16:9 standard */}
      <planeGeometry args={[16, 9, 256, 256]} />
      <meshStandardMaterial
        map={texture}
        displacementMap={depthMap}
        displacementScale={5}
        metalness={0.1}
        roughness={0.8}
      />
    </mesh>
  );
};

// Scene with camera motion
const DepthScene: React.FC<{src: string; depth: string}> = ({src, depth}) => {
  const frame = useCurrentFrame();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);

  // Animate camera along a gentle 3D path
  useFrame(() => {
    const t = frame / 200; // controls speed
    if (cameraRef.current) {
      cameraRef.current.position.x = Math.sin(t) * 2;
      cameraRef.current.position.y = Math.cos(t * 1.2) * 1.5;
      cameraRef.current.position.z = 6 + Math.sin(t * 0.5) * 1.5;
      cameraRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <ThreeCanvas>
      <perspectiveCamera ref={cameraRef} position={[0, 0, 6]} fov={50} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <DepthImage src={src} depth={depth} />
    </ThreeCanvas>
  );
};

// Main slideshow switching through 3 images
export const DepthSlideshow3D: React.FC = () => {
  const frame = useCurrentFrame();
  const duration = 300; // frames per image (~10s @ 30fps)
  const index = Math.floor(frame / duration) % 3;

  const images = useMemo(
    () => [
      {src: '1.jpg', depth: '1_depth.jpg'},
      {src: '2.jpg', depth: '2_depth.jpg'},
      {src: '3.jpg', depth: '3_depth.jpg'},
    ],
    []
  );

  const {src, depth} = images[index];

  return <DepthScene src={src} depth={depth} />;
};

// Register Remotion composition
registerRoot(() => (
  <>
    <Composition
      id="DepthSlideshow3D"
      component={DepthSlideshow3D}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
));
