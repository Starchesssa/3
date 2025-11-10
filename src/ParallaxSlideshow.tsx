
// FILE: src/ParallaxSlideshow.tsx
import React, {useRef, useMemo} from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
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
interface SceneProps { imageSrc: string }

const Scene: React.FC<SceneProps> = ({imageSrc}) => {
	const frame = useCurrentFrame();
	const groupRef = useRef<THREE.Group>(null!);

	useFrame(() => {
		groupRef.current.position.z = -frame * (sliceDepth / framesPerImage);
	});

	const textures = useMemo(() => {
		return Array.from({ length: slicesPerImage }, () => {
			const tex = new THREE.TextureLoader().load(imageSrc);
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
						<meshBasicMaterial map={texture} transparent />
					</mesh>
				);
			})}
		</group>
	);
};

// --- Slideshow Component ---
interface SlideshowProps { images: string[] }

const Slideshow: React.FC<SlideshowProps> = ({images}) => {
	const frame = useCurrentFrame();
	const currentImageIndex = Math.floor(frame / framesPerImage) % images.length;

	return (
		<ThreeCanvas width={width} height={height} camera={{position: [0, 0, 6]}}>
			<Scene imageSrc={images[currentImageIndex]} />
		</ThreeCanvas>
	);
};

// --- Import all images ---
import img1 from '../public/Generated Image July 30, 2025 - 12_20PM.jpeg';
import img2 from '../public/Generated Image September 01, 2025 - 6_36AM.jpeg';
import img3 from '../public/Generated Image September 02, 2025 - 7_47AM.jpeg';
import img4 from '../public/download (23).jpeg';
import img5 from '../public/make-a-kazgergt-anination-of-solar-system-make-the-animation-colourfull.jpg';
import img6 from '../public/then-the-crash-begins-billions-of-dollars-vanish-in-days-companies-that-were-worth-millions-becom (1).jpg';

const imageFiles = [img1, img2, img3, img4, img5, img6];

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
