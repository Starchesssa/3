
// FILE: src/ParallaxSlideshow.tsx
import React, {useRef, useMemo} from 'react';
import {Composition, registerRoot, useCurrentFrame, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {useFrame} from '@react-three/fiber';

// --- CONFIGURATION ---
const slicesPerImage = 6;
const sliceDepth = 0.5;
const framesPerImage = 150;
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

  useFrame(() => {
    groupRef.current.position.z = -frame * (sliceDepth / framesPerImage);
  });

  const textures = useMemo(() => {
    return Array.from({length: slicesPerImage}, () => {
      const tex = new THREE.TextureLoader().load(staticFile(imageSrc));
      tex.center.set(0.5, 0.5);
      tex.repeat.set(1, 1);
      return tex;
    });
  }, [imageSrc]);

  return (
    <group ref={groupRef}>
      {textures.map((texture, i) => {
        const scaleFactor = 1 - i * 0.08;
        return (
          <mesh key={i} position={[0, 0, -i * sliceDepth]}>
            <planeGeometry args={[4 * scaleFactor, 4 * scaleFactor]} />
            <meshBasicMaterial map={texture} transparent={true} />
          </mesh>
        );
      })}
    </group>
  );
};

// --- Slideshow Component ---
interface SlideshowProps {
  images: string[];
}

const Slideshow: React.FC<SlideshowProps> = ({images}) => {
  const frame = useCurrentFrame();
  const totalFramesPerImage = framesPerImage;

  const currentImageIndex = Math.floor(frame / totalFramesPerImage) % images.length;

  return (
    <ThreeCanvas width={width} height={height} camera={{position: [0, 0, 6]}}>
      <Scene imageSrc={images[currentImageIndex]} />
    </ThreeCanvas>
  );
};

// --- List your images in public/ ---
const imageFiles = [
  'image1.jpg',
  'image2.jpg',
  'image3.jpg',
  // Add all .jpg files here
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
