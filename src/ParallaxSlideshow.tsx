
// FILE: src/ParallaxSlideshow.tsx
import React, {useRef} from 'react';
import {Composition, registerRoot, useCurrentFrame, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {useFrame} from '@react-three/fiber';

// --- CONFIGURATION ---
const slicesPerImage = 6;       // Number of nested slices per image
const sliceDepth = 0.5;         // Z spacing between slices
const framesPerImage = 150;     // Duration per image in frames
const fps = 30;
const width = 1080;
const height = 1080;

// --- Scene Component ---
interface SceneProps {
  imageSrc: string;
}

const Scene: React.FC<SceneProps> = ({imageSrc}) => {
  const frame = useCurrentFrame();
  const groupRef = useRef<THREE.Group>(null!);

  // Camera animation: move forward along Z
  useFrame(() => {
    groupRef.current.position.z = -frame * (sliceDepth / framesPerImage);
  });

  const slices = [];
  for (let i = 0; i < slicesPerImage; i++) {
    const texture = new THREE.TextureLoader().load(staticFile(imageSrc));
    texture.center.set(0.5, 0.5);
    texture.repeat.set(1, 1);

    // Create slightly scaled plane to mimic circular slice effect
    const scaleFactor = 1 - (i * 0.08); // smaller for inner slices
    slices.push(
      <mesh key={i} position={[0, 0, -i * sliceDepth]}>
        <planeGeometry args={[4 * scaleFactor, 4 * scaleFactor]} />
        <meshBasicMaterial map={texture} transparent={true} />
      </mesh>
    );
  }

  return <group ref={groupRef}>{slices}</group>;
};

// --- Slideshow Component ---
interface SlideshowProps {
  images: string[];
}

const Slideshow: React.FC<SlideshowProps> = ({images}) => {
  const frame = useCurrentFrame();
  const totalFramesPerImage = framesPerImage;

  // Determine which image we are on
  const currentImageIndex = Math.floor(frame / totalFramesPerImage) % images.length;
  const frameInImage = frame % totalFramesPerImage;

  return (
    <ThreeCanvas camera={{position: [0, 0, 6]}}>
      <Scene imageSrc={images[currentImageIndex]} />
    </ThreeCanvas>
  );
};

// --- List your images here ---
const imageFiles = [
  'image1.jpg',
  'image2.jpg',
  'image3.jpg',
  // Add all your .jpg in public here
];

// --- Register Composition ---
registerRoot(() => (
  <Composition
    id="ParallaxSlideshow"
    component={() => <Slideshow images={imageFiles} />}
    durationInFrames={framesPerImage * imageFiles.length}
    fps={fps}
    width={width}
    height={height}
  />
));
