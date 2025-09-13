```tsx
import {
	AbsoluteFill,
	Sequence,
	Audio,
	Img,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	Easing,
	random,
} from 'remotion';
import React, {useMemo} from 'react';

// --- Data Structure for Transcript ---
type Word = {
	text: string;
	start: number;
	end: number;
};

const script: Word[] = [
	{text: 'Key', start: 0.0, end: 0.42},
	{text: 'lesson.', start: 0.42, end: 0.86},
	{text: 'Your', start: 1.38, end: 1.56},
	{text: 'system', start: 1.56, end: 2.06},
	{text: 'is', start: 2.06, end: 2.32},
	{text: 'only', start: 2.32, end: 2.76},
	{text: 'tested', start: 2.76, end: 3.26},
	{text: 'in', start: 3.26, end: 3.52},
	{text: 'a', start: 3.52, end: 3.62},
	{text: 'true', start: 3.62, end: 3.9},
	{text: 'crisis.', start: 3.9, end: 4.42},
	{text: 'Late', start: 5.26, end: 5.52},
	{text: '2019', start: 5.52, end: 6.26},
	{text: 'rolled', start: 6.26, end: 6.78},
	{text: 'into', start: 6.78, end: 7.12},
	{text: '2020,', start: 7.12, end: 7.72},
	{text: 'and', start: 7.92, end: 8.4},
	{text: 'the', start: 8.4, end: 8.66},
	{text: 'world', start: 8.66, end: 8.92},
	{text: 'stopped.', start: 8.92, end: 9.52},
	{text: 'A', start: 9.98, end: 10.14},
	{text: 'global', start: 10.14, end: 10.52},
	{text: 'pandemic', start: 10.52, end: 11.12},
	{text: 'called', start: 11.12, end: 11.46},
	{text: 'COVID-19', start: 11.46, end: 12.36},
	{text: 'shut', start: 12.36, end: 12.78},
	{text: 'down', start: 12.78, end: 13.04},
	{text: 'everything.', start: 13.04, end: 13.76},
	{text: 'Stores', start: 14.28, end: 14.68},
	{text: 'closed,', start: 14.68, end: 15.02},
	{text: 'offices', start: 15.44, end: 15.82},
	{text: 'closed,', start: 15.82, end: 16.24},
	{text: 'people', start: 16.58, end: 16.9},
	{text: 'were', start: 16.9, end: 17.1},
	{text: 'locked', start: 17.1, end: 17.42},
	{text: 'in', start: 17.42, end: 17.66},
	{text: 'their', start: 17.66, end: 17.82},
	{text: 'homes.', start: 17.82, end: 18.16},
	{text: 'And', start: 18.68, end: 18.8},
	{text: 'suddenly,', start: 18.8, end: 19.28},
	{text: 'the', start: 19.62, end: 19.7},
	{text: 'machine', start: 19.7, end: 20.1},
	{text: 'that', start: 20.1, end: 20.4},
	{text: 'Amazon', start: 20.4, end: 20.7},
	{text: 'had', start: 20.7, end: 21.04},
	{text: 'been', start: 21.04, end: 21.2},
	{text: 'building', start: 21.2, end: 21.54},
	{text: 'for', start: 21.54, end: 21.78},
	{text: '25', start: 21.78, end: 22.38},
	{text: 'years', start: 22.38, end: 22.88},
	{text: 'was', start: 22.88, end: 23.26},
	{text: 'not', start: 23.26, end: 23.54},
	{text: 'just', start: 23.54, end: 23.86},
	{text: 'a', start: 23.86, end: 24.02},
	{text: 'convenience.', start: 24.02, end: 24.52},
	{text: 'It', start: 24.98, end: 25.12},
	{text: 'became', start: 25.12, end: 25.48},
	{text: 'essential', start: 25.48, end: 26.26},
	{text: 'infrastructure.', start: 26.26, end: 27.06},
	{text: 'The', start: 27.06, end: 27.7},
	{text: 'warehouses,', start: 27.7, end: 28.28},
	{text: 'the', start: 28.6, end: 28.64},
	{text: 'delivery', start: 28.64, end: 28.94},
	{text: 'trucks,', start: 28.94, end: 29.38},
	{text: 'the', start: 29.7, end: 29.78},
	{text: 'website,', start: 29.78, end: 30.24},
	{text: 'the', start: 30.52, end: 30.6},
	{text: 'cloud', start: 30.6, end: 30.9},
	{text: 'servers,', start: 30.9, end: 31.34},
	{text: 'powering', start: 31.58, end: 31.92},
	{text: 'Netflix', start: 31.92, end: 32.14},
	{text: 'and', start: 32.14, end: 32.58},
	{text: 'Zoom,', start: 32.58, end: 32.82},
	{text: 'it', start: 33.16, end: 33.36},
	{text: 'was', start: 33.36, end: 33.48},
	{text: 'all', start: 33.48, end: 33.84},
	{text: 'put', start: 33.84, end: 34.12},
	{text: 'to', start: 34.12, end: 34.38},
	{text: 'the', start: 34.38, end: 34.5},
	{text: 'ultimate', start: 34.5, end: 34.94},
	{text: 'test.', start: 34.94, end: 35.48},
	{text: 'The', start: 35.84, end: 36.08},
	{text: 'system', start: 36.08, end: 36.5},
	{text: 'strained,', start: 36.5, end: 37.14},
	{text: 'delivery', start: 37.44, end: 37.74},
	{text: 'time', start: 37.74, end: 38.04},
	{text: 'slipped,', start: 38.04, end: 38.44},
	{text: 'but', start: 38.8, end: 38.94},
	{text: 'it', start: 38.94, end: 39.08},
	{text: 'did', start: 39.08, end: 39.24},
	{text: 'not', start: 39.24, end: 39.56},
	{text: 'break.', start: 39.56, end: 39.92},
	{text: 'While', start: 40.48, end: 40.7},
	{text: 'other', start: 40.7, end: 41.0},
	{text: 'businesses', start: 41.0, end: 41.5},
	{text: 'collapsed,', start: 41.5, end: 42.02},
	{text: 'Amazon', start: 42.48, end: 42.72},
	{text: 'hired.', start: 42.72, end: 43.24},
	{text: 'They', start: 43.62, end: 43.86},
	{text: 'hired', start: 43.86, end: 44.14},
	{text: '175,000', start: 44.14, end: 46.02},
	{text: 'new', start: 46.02, end: 46.26},
	{text: 'workers', start: 46.26, end: 46.58},
	{text: 'in', start: 46.58, end: 46.84},
	{text: 'just', start: 46.84, end: 47.12},
	{text: 'a', start: 47.12, end: 47.36},
	{text: 'few', start: 47.36, end: 47.48},
	{text: 'months.', start: 47.48, end: 47.82},
	{text: 'Their', start: 48.38, end: 48.56},
	{text: 'revenue', start: 48.56, end: 48.98},
	{text: 'for', start: 48.98, end: 49.22},
	{text: 'the', start: 49.22, end: 49.32},
	{text: 'second', start: 49.32, end: 49.64},
	{text: 'quarter', start: 49.64, end: 50.02},
	{text: 'of', start: 50.02, end: 50.18},
	{text: '2020', start: 50.18, end: 50.7},
	{text: 'exploded,', start: 50.7, end: 51.78},
	{text: 'up', start: 52.08, end: 52.28},
	{text: '40%', start: 52.28, end: 53.1},
	{text: 'to', start: 53.1, end: 53.44},
	{text: '$88.9', start: 53.44, end: 54.6},
	{text: 'billion.', start: 54.6, end: 55.08},
	{text: 'The', start: 55.84, end: 56.36},
	{text: 'pandemic', start: 56.36, end: 56.88},
	{text: 'was', start: 56.88, end: 57.18},
	{text: 'a', start: 57.18, end: 57.3},
	{text: 'tragedy', start: 57.3, end: 57.74},
	{text: 'for', start: 57.74, end: 58.0},
	{text: 'the', start: 58.0, end: 58.12},
	{text: 'world,', start: 58.12, end: 58.42},
	{text: 'but', start: 58.66, end: 58.88},
	{text: 'for', start: 58.88, end: 59.06},
	{text: "Amazon's", start: 59.06, end: 59.68},
	{text: 'business', start: 59.68, end: 59.94},
	{text: 'model,', start: 59.94, end: 60.32},
	{text: 'it', start: 60.52, end: 60.7},
	{text: 'was', start: 60.7, end: 60.84},
	{text: 'the', start: 60.84, end: 61.02},
	{text: 'ultimate', start: 61.02, end: 61.52},
	{text: 'validation.', start: 61.52, end: 62.22},
	{text: 'Every', start: 62.8, end: 63.2},
	{text: 'bet', start: 63.2, end: 63.46},
	{text: 'they', start: 63.46, end: 63.66},
	{text: 'had', start: 63.66, end: 63.82},
	{text: 'ever', start: 63.82, end: 64.18},
	{text: 'made', start: 64.18, end: 64.44},
	{text: 'on', start: 64.44, end: 64.6},
	{text: 'logistics,', start: 64.6, end: 65.1},
	{text: 'on', start: 65.42, end: 65.52},
	{text: 'infrastructure,', start: 65.52, end: 66.08},
	{text: 'on', start: 66.5, end: 66.62},
	{text: 'long-term', start: 66.62, end: 67.12},
	{text: 'thinking,', start: 67.12, end: 67.58},
	{text: 'paid', start: 67.98, end: 68.12},
	{text: 'off', start: 68.12, end: 68.46},
	{text: 'in', start: 68.46, end: 68.68},
	{text: 'the', start: 68.68, end: 68.78},
	{text: 'moment', start: 68.78, end: 69.1},
	{text: 'the', start: 69.1, end: 69.32},
	{text: 'world', start: 69.32, end: 69.6},
	{text: 'needed', start: 69.6, end: 69.96},
	{text: 'it', start: 69.96, end: 70.14},
	{text: 'most.', start: 70.14, end: 70.4},
];

const sceneScripts = {
	scene1: script.slice(0, 11),
	scene2: script.slice(11, 28),
	scene3: script.slice(28, 38),
	scene4: script.slice(38, 59),
	scene5: script.slice(59, 81),
	scene6: script.slice(81, 92),
	scene7: script.slice(92, 105),
	scene8: script.slice(105, 116),
	scene9: script.slice(116),
};

// --- Helper Components ---

// Word-by-word text animation
const AnimatedText: React.FC<{words: Word[]; textStyle?: React.CSSProperties}> = ({
	words,
	textStyle,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const defaultStyle: React.CSSProperties = {
		fontFamily: 'Helvetica, Arial, sans-serif',
		fontSize: '64px',
		fontWeight: 'bold',
		color: 'white',
		textAlign: 'center',
		lineHeight: 1.3,
		textShadow: '0 0 10px rgba(255,255,255,0.7)',
	};

	return (
		<p style={{...defaultStyle, ...textStyle}}>
			{words.map((word, i) => {
				const startFrame = word.start * fps;
				const FADE_IN_DURATION = 8;

				const opacity = interpolate(
					frame,
					[startFrame, startFrame + FADE_IN_DURATION],
					[0, 1],
					{
						extrapolateRight: 'clamp',
					}
				);

				const translateY = interpolate(
					frame,
					[startFrame, startFrame + FADE_IN_DURATION],
					[20, 0],
					{
						extrapolateRight: 'clamp',
						easing: Easing.out(Easing.ease),
					}
				);

				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							opacity,
							transform: `translateY(${translateY}px)`,
						}}
					>
						{word.text}&nbsp;
					</span>
				);
			})}
		</p>
	);
};

// Parallax image scene
const ParallaxScene: React.FC<{
	bg: string;
	mg: string;
	fg: string;
	children?: React.ReactNode;
}> = ({bg, mg, fg, children}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	// Global cinematic camera movement
	const cameraZoom = interpolate(frame, [0, durationInFrames], [1.1, 1.4], {
		easing: Easing.bezier(0.42, 0, 0.58, 1),
	});
	const cameraPanX = interpolate(frame, [0, durationInFrames], [-50, 150], {
		easing: Easing.bezier(0.42, 0, 0.58, 1),
	});
	const cameraPanY = interpolate(frame, [0, durationInFrames], [20, -80], {
		easing: Easing.bezier(0.42, 0, 0.58, 1),
	});

	const imageStyle: React.CSSProperties = {
		position: 'absolute',
		width: '120%',
		height: '120%',
		top: '-10%',
		left: '-10%',
		objectFit: 'cover',
	};

	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					transform: `scale(${cameraZoom})`,
				}}
			>
				<Img
					src={staticFile(bg)}
					style={{
						...imageStyle,
						transform: `translate(${cameraPanX * 0.2}px, ${cameraPanY * 0.2}px)`,
					}}
				/>
				<Img
					src={staticFile(mg)}
					style={{
						...imageStyle,
						transform: `translate(${cameraPanX * 0.6}px, ${cameraPanY * 0.6}px)`,
					}}
				/>
				<Img
					src={staticFile(fg)}
					style={{
						...imageStyle,
						transform: `translate(${cameraPanX}px, ${cameraPanY}px)`,
					}}
				/>
			</div>
			<AbsoluteFill
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<div style={{width: '80%'}}>{children}</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// Artistic overlay for dust and lighting effects
const EffectsOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();

	const dustParticles = useMemo(() => {
		return Array.from({length: 150}).map((_, i) => ({
			x: random(`x-${i}`) * width,
			y: random(`y-${i}`) * height,
			size: random(`size-${i}`) * 2.5 + 1,
			opacity: random(`opacity-${i}`) * 0.4,
			phase: random(`phase-${i}`) * Math.PI * 2,
		}));
	}, [width, height]);

	return (
		<AbsoluteFill>
			{/* Vignette & Glow */}
			<div
				style={{
					width: '100%',
					height: '100%',
					background:
						'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)',
				}}
			/>
			{/* Dust Particles */}
			{dustParticles.map((p, i) => {
				const yOffset = Math.sin(frame / 30 + p.phase) * 30;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: p.x,
							top: p.y + yOffset,
							width: p.size,
							height: p.size,
							borderRadius: '50%',
							backgroundColor: `rgba(255, 255, 255, ${p.opacity})`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
	const {fps} = useVideoConfig();
	const sec = (seconds: number) => Math.ceil(seconds * fps);
	
	const sceneTransition = 15; // frames

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_8.wav')} />

			<Sequence from={0} durationInFrames={sec(5.26)}>
				<ParallaxScene
					bg="images/bg-crisis.jpg"
					mg="images/mg-lock.png"
					fg="images/fg-keyhole.png"
				>
					<AnimatedText words={sceneScripts.scene1} />
				</ParallaxScene>
			</Sequence>

			<Sequence from={sec(5.26) - sceneTransition} durationInFrames={sec(9.02) + sceneTransition}>
				<ParallaxScene
					bg="images/bg-city.jpg"
					mg="images/mg-empty-streets.png"
					fg="images/fg-closed-sign.png"
				>
					<AnimatedText words={sceneScripts.scene2} />
				</ParallaxScene>
			</Sequence>

			<Sequence from={sec(14.28) - sceneTransition} durationInFrames={sec(4.4) + sceneTransition}>
				<ParallaxScene
					bg="images/bg-interior.jpg"
					mg="images/mg-window-view.png"
					fg="images/fg-locked-door.png"
				>
					<AnimatedText words={sceneScripts.scene3} />
				</ParallaxScene>
			</Sequence>

			<Sequence from={sec(18.68) - sceneTransition} durationInFrames={sec(8.4) + sceneTransition}>
				<ParallaxScene
					bg="images/bg-tech-grid.jpg"
					mg="images/mg-warehouse.png"
					fg="images/fg-conveyor.png"
				>
					<AnimatedText words={sceneScripts.scene4} />
				</ParallaxScene>
			</Sequence>

			<Sequence from={sec(27.06) - sceneTransition} durationInFrames={sec(8.42) + sceneTransition}>
				<ParallaxScene
					bg="images/bg-server-racks.jpg"
					mg="images/mg-delivery-trucks.png"
					fg="images/fg-logos.png" // (Netflix, Zoom, etc.)
				>
					<AnimatedText words={sceneScripts.scene5} />
				</ParallaxScene>
			</Sequence>

			<Sequence from={sec(35.84) - sceneTransition} durationInFrames={sec(4.64) + sceneTransition}>
				<ParallaxScene
					bg="images/bg-metal.jpg"
					mg="images/mg-stressed-chain.png"
					fg="images/fg-sparks.png"
				>
					<AnimatedText words={sceneScripts.scene6} />
				</ParallaxScene>
			</Sequence>

			<Sequence from={sec(40.48) - sceneTransition} durationInFrames={sec(7.82) + sceneTransition}>
				<ParallaxScene
					bg="images/bg-contrast.jpg"
					mg="images/mg-hiring-sign.png"
					fg="images/fg-workers.png"
				>
					<AnimatedText words={sceneScripts.scene7} />
				</ParallaxScene>
			</Sequence>

			<Sequence from={sec(48.38) - sceneTransition} durationInFrames={sec(7.46) + sceneTransition}>
				<ParallaxScene
					bg="images/bg-stock-market.jpg"
					mg="images/mg-growth-chart.png"
					fg="images/fg-dollar-signs.png"
				>
					<AnimatedText words={sceneScripts.scene8} />
				</ParallaxScene>
			</Sequence>

			<Sequence from={sec(55.84) - sceneTransition}>
				<ParallaxScene
					bg="images/bg-globe.jpg"
					mg="images/mg-network-lines.png"
					fg="images/fg-amazon-logo.png"
				>
					<AnimatedText words={sceneScripts.scene9} />
				</ParallaxScene>
			</Sequence>

			<EffectsOverlay />
		</AbsoluteFill>
	);
};
```