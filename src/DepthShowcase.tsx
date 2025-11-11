
import React, {useMemo, useRef} from "react";
import {Composition, Sequence, useCurrentFrame} from "remotion";
import {ThreeCanvas} from "@remotion/three";
import * as THREE from "three";

// 🖼️ Manual image + depth map pairs
const scenes = [
  {
    image: "/Generated Image July 07, 2025 - 11_45PM.jpeg",
    depth: "/depth/depth-Generated Image July 07, 2025 - 11_45PM.png",
  },
  {
    image: "/Generated Image July 30, 2025 - 12_20PM.jpeg",
    depth: "/depth/depth-Generated Image July 30, 2025 - 12_20PM.png",
  },
  {
    image: "/Generated Image June 28, 2025 - 8_54AM.jpeg",
    depth: "/depth/depth-Generated Image June 28, 2025 - 8_54AM.png",
  },
  {
    image: "/Generated Image September 01, 2025 - 6_36AM.jpeg",
    depth: "/depth/depth-Generated Image September 01, 2025 - 6_36AM.png",
  },
  {
    image: "/Generated Image September 02, 2025 - 7_47AM.jpeg",
    depth: "/depth/depth-Generated Image September 02, 2025 - 7_47AM.png",
  },
  {
    image: "/copilot_image_1751920705398.jpeg",
    depth: "/depth/depth-copilot_image_1751920705398.png",
  },
  {
    image: "/download (23).jpeg",
    depth: "/depth/depth-download (23).png",
  },
  {
    image: "/image (1).webp",
    depth: "/depth/depth-image (1).png",
  },
  {
    image: "/image-of-new-york-in-sunshine-without-people.jpg",
    depth: "/depth/depth-image-of-new-york-in-sunshine-without-people.png",
  },
  {
    image: "/images (37).jpeg",
    depth: "/depth/depth-images (37).png",
  },
  {
    image: "/images (38).jpeg",
    depth: "/depth/depth-images (38).png",
  },
  {
    image: "/make-a-kazgergt-anination-of-solar-system-make-the-animation-colourfull.jpg",
    depth: "/depth/depth-make-a-kazgergt-anination-of-solar-system-make-the-animation-colourfull.png",
  },
  {
    image: "/then-the-crash-begins-billions-of-dollars-vanish-in-days-companies-that-were-worth-millions-becom (1).jpg",
    depth: "/depth/depth-then-the-crash-begins-billions-of-dollars-vanish-in-days-companies-that-were-worth-millions-becom (1).png",
  },
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

  // Camera animation
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
  const durationPerImage = 300; // 10 sec per image
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
  const fps = 30;
  const durationPerImage = 300;

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

export default RemotionVideo;
