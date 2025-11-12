import React, {useMemo} from 'react';
import {Composition, Sequence, useCurrentFrame, registerRoot} from 'remotion';
import {Canvas, useFrame} from '@react-three/fiber';
import * as THREE from 'three';

const scenes = [
  { image: '/1.jpg', depth: '/1.png' },
  { image: '/2.jpg', depth: '/2.png' },
  { image: '/3.jpg', depth: '/3.png' },
];

const DepthMesh: React.FC<{ image: string; depth: string }> = ({ image, depth }) => {
  const frame = useCurrentFrame();

  // Load textures once
  const { geometry, material } = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const colorTex = loader.load(image);
    const depthTex = loader.load(depth);

    const geometry = new THREE.PlaneGeometry(1.6, 0.9, 256, 256);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: colorTex },
        uDepth: { value: depthTex },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        uniform sampler2D uDepth;
        uniform float uTime;
        void main() {
          vUv = uv;
          float depthValue = texture2D(uDepth, uv).r;
          vec3 displaced = position + normal * (depthValue - 0.5) * 0.6;
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

    return { geometry, material };
  }, [image, depth]);

  // Animate camera
  const cameraRef = React.useRef<THREE.PerspectiveCamera>(null!);
  useFrame(() => {
    if (!cameraRef.current) return;
    const t = frame / 60; // time in seconds
    cameraRef.current.position.x = Math.sin(t * 0.5) * 0.3;
    cameraRef.current.position.y = Math.cos(t * 0.3) * 0.2;
    cameraRef.current.position.z = 1.5 + Math.sin(t * 0.2) * 0.2;
    cameraRef.current.lookAt(0, 0, 0);
  });

  return (
    <Canvas camera={{ fov: 45, position: [0, 0, 1.5] }} style={{ background: 'black' }}>
      <perspectiveCamera ref={cameraRef} fov={45} position={[0, 0, 1.5]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[0.5, 1, 1]} intensity={0.8} />
      <mesh geometry={geometry} material={material} />
    </Canvas>
  );
};

const DepthVideo: React.FC = () => {
  const durationPerImage = 300; // 10s per image
  const fps = 30;
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
        <Sequence key={i} from={i * durationPerImage} durationInFrames={durationPerImage}>
          <DepthMesh image={s.image} depth={s.depth} />
        </Sequence>
      ))}
    </>
  );
};

// Register Remotion root
registerRoot(DepthVideo);

export default DepthVideo;
