import React, {useMemo} from "react";
import {Composition, Sequence, useCurrentFrame, registerRoot} from "remotion";
import {ThreeCanvas} from "@remotion/three";
import * as THREE from "three";

// 🖼️ Scenes with both images and depth maps in public/
const scenes = [
  { image: "/1.jpg", depth: "/1.png" },
  { image: "/2.jpg", depth: "/2.png" },
  { image: "/3.jpg", depth: "/3.png" },
  { image: "/4.jpeg", depth: "/4.png" },
  { image: "/5.jpeg", depth: "/5.png" },
  { image: "/6.jpeg", depth: "/6.png" },
  { image: "/7.jpeg", depth: "/7.png" },
  { image: "/8.jpeg", depth: "/8.png" },
  { image: "/9.jpeg", depth: "/9.png" },
  { image: "/10.jpeg", depth: "/10.png" },
  { image: "/11.jpeg", depth: "/11.png" },
];

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

export const RemotionVideo: React.FC = () => {
  const fps = 30;
  const durationPerImage = 300; // 10 seconds per image
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

const MainVideo: React.FC = () => {
  const durationPerImage = 300;

  return (
    <>
      {scenes.map((s, i) => (
        <Sequence
          key={i}
          from={i * durationPerImage}
          durationInFrames={durationPerImage}
        >
          <DepthScene image={s.image} depth={s.depth} />
        </Sequence>
      ))}
    </>
  );
};

// ✅ Self-contained registerRoot
registerRoot(RemotionVideo);

export default RemotionVideo;
