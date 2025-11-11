
// src/DepthShowcase.tsx
import React, {useMemo} from "react";
import {Composition, Sequence, useCurrentFrame, registerRoot} from "remotion";
import {ThreeCanvas} from "@remotion/three";
import * as THREE from "three";

// ✅ Import all images and depth maps
import img1 from "./public/1.jpg";
import depth1 from "./public/1.png";
import img2 from "./public/2.jpg";
import depth2 from "./public/2.png";
import img3 from "./public/3.jpg";
import depth3 from "./public/3.png";
import img4 from "./public/4.jpeg";
import depth4 from "./public/4.png";
import img5 from "./public/5.jpeg";
import depth5 from "./public/5.png";
import img6 from "./public/6.jpeg";
import depth6 from "./public/6.png";
import img7 from "./public/7.jpeg";
import depth7 from "./public/7.png";
import img8 from "./public/8.jpeg";
import depth8 from "./public/8.png";
import img9 from "./public/9.jpeg";
import depth9 from "./public/9.png";
import img10 from "./public/10.jpeg";
import depth10 from "./public/10.png";
import img11 from "./public/11.jpeg";
import depth11 from "./public/11.png";

// 🖼️ Scenes array
const scenes = [
  { image: img1, depth: depth1 },
  { image: img2, depth: depth2 },
  { image: img3, depth: depth3 },
  { image: img4, depth: depth4 },
  { image: img5, depth: depth5 },
  { image: img6, depth: depth6 },
  { image: img7, depth: depth7 },
  { image: img8, depth: depth8 },
  { image: img9, depth: depth9 },
  { image: img10, depth: depth10 },
  { image: img11, depth: depth11 },
];

// DepthScene component
const DepthScene: React.FC<{image: string; depth: string}> = ({image, depth}) => {
  const frame = useCurrentFrame();

  const {geometry, material} = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(1.6, 0.9, 256, 256);
    const loader = new THREE.TextureLoader();
    const colorTex = loader.load(image);
    const depthTex = loader.load(depth);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: {value: colorTex},
        uDepth: {value: depthTex},
      },
      vertexShader: `
        varying vec2 vUv;
        uniform sampler2D uDepth;
        void main() {
          vUv = uv;
          vec4 depthData = texture2D(uDepth, uv);
          float depth = depthData.r;
          vec3 displaced = position + normal * (1.0 - depth) * 0.35;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D uTexture;
        void main() {
          gl_FragColor = texture2D(uTexture, vUv);
        }
      `,
    });

    return {geometry, material};
  }, [image, depth]);

  // Simple camera animation
  const cameraZ = 1.5 + Math.sin(frame / 150) * 0.3;
  const cameraX = Math.sin(frame / 250) * 0.2;
  const cameraY = Math.cos(frame / 250) * 0.1;

  return (
    <ThreeCanvas
      width={1920}
      height={1080}
      camera={{fov: 45, position: [cameraX, cameraY, cameraZ]}}
      style={{backgroundColor: "black"}}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[0.5, 1, 1]} intensity={0.8} />
      <mesh geometry={geometry} material={material} />
    </ThreeCanvas>
  );
};

// MainVideo component with all sequences
const MainVideo: React.FC = () => {
  const durationPerImage = 300; // 10 seconds per image

  return (
    <>
      {scenes.map((s, i) => (
        <Sequence key={i} from={i * durationPerImage} durationInFrames={durationPerImage}>
          <DepthScene image={s.image} depth={s.depth} />
        </Sequence>
      ))}
    </>
  );
};

// Composition
export const RemotionVideo: React.FC = () => {
  const fps = 30;
  const durationPerImage = 300;
  const totalDuration = scenes.length * durationPerImage;

  return (
    <Composition
      id="DepthSlideshow3D"
      component={MainVideo}
      durationInFrames={totalDuration}
      fps={fps}
      width={1920}
      height={1080}
    />
  );
};

// Register root
registerRoot(RemotionVideo);
export default RemotionVideo;
