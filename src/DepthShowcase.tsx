import React, {useMemo, useEffect, useState} from "react";
import {Composition, Sequence, useCurrentFrame, registerRoot} from "remotion";
import {ThreeCanvas} from "@remotion/three";
import * as THREE from "three";

// ✅ Import only 3 long images with depth maps
import img1 from "../public/1.jpg";
import depth1 from "../public/1.png";

import img2 from "../public/2.jpg";
import depth2 from "../public/2.png";

import img3 from "../public/3.jpg";
import depth3 from "../public/3.png";

// Define scenes
const scenes = [
  {image: img1, depth: depth1},
  {image: img2, depth: depth2},
  {image: img3, depth: depth3},
];

const DepthScene: React.FC<{image: string; depth: string; index: number}> = ({
  image,
  depth,
  index,
}) => {
  const frame = useCurrentFrame();
  const [aspect, setAspect] = useState(16 / 9);

  // 🧮 Auto-detect aspect ratio
  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => setAspect(img.width / img.height);
  }, [image]);

  const {geometry, material} = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const colorTex = loader.load(image);
    const depthTex = loader.load(depth);

    const width = 1.8 * (aspect > 1 ? 1 : aspect);
    const height = width / aspect;
    const geometry = new THREE.PlaneGeometry(width, height, 256, 256);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: {value: colorTex},
        uDepth: {value: depthTex},
        uTime: {value: 0},
      },
      vertexShader: `
        varying vec2 vUv;
        uniform sampler2D uDepth;
        uniform float uTime;
        void main() {
          vUv = uv;
          float depth = texture2D(uDepth, uv).r;
          float wave = sin(uTime * 0.02 + uv.y * 10.0) * 0.02;
          vec3 displaced = position + normal * (1.0 - depth) * (0.5 + wave);
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
  }, [image, depth, aspect]);

  // 🎥 Dynamic cinematic camera movement
  const progress = frame / 300;
  const direction = index % 2 === 0 ? 1 : -1; // alternate directions

  const cameraX = Math.sin(progress * Math.PI) * 0.4 * direction;
  const cameraY = Math.cos(progress * Math.PI * 0.5) * 0.2;
  const cameraZ = 1.4 + Math.sin(progress * Math.PI) * 0.3;

  material.uniforms.uTime.value = frame;

  return (
    <ThreeCanvas
      width={1920}
      height={1080}
      camera={{fov: 45, position: [cameraX, cameraY, cameraZ]}}
      style={{backgroundColor: "black"}}
    >
      <ambientLight intensity={1.0} />
      <directionalLight position={[1, 1, 1]} intensity={1.2} />
      <mesh geometry={geometry} material={material} />
    </ThreeCanvas>
  );
};

const MainVideo: React.FC = () => {
  const durationPerImage = 450; // each long image = 15 seconds
  return (
    <>
      {scenes.map((s, i) => (
        <Sequence key={i} from={i * durationPerImage} durationInFrames={durationPerImage}>
          <DepthScene image={s.image} depth={s.depth} index={i} />
        </Sequence>
      ))}
    </>
  );
};

export const RemotionVideo: React.FC = () => {
  const fps = 30;
  const totalDuration = scenes.length * 450;

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

registerRoot(RemotionVideo);
export default RemotionVideo;
