```tsx
import {
	AbsoluteFill,
	Audio,
	Composition,
	Img,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import { Spring, spring } from 'remotion';
import { linearTiming, TransitionSeries } from '@remotion/transitions';

// --- Asset Comments ---
// assets/images/digital_network.png: An intricate, glowing blue/white circuit or network pattern on a transparent background.
// assets/images/storm_clouds.jpg: A dark, moody, and cinematic image of storm clouds.
// assets/images/earth_globe.jpg: A high-resolution, realistic image of planet Earth from space.
// assets/images/virus_particle.png: A stylized 3D render of the COVID-19 virus, with a transparent background.
// assets/images/empty_city_street.jpg: A dramatic, wide-angle shot of a major city street (like NYC or London) completely deserted.
// assets/images/closed_sign.png: A "CLOSED" sign on a glass door, with the background transparent.
// assets/images/amazon_warehouse_interior.jpg: A vast, slightly futuristic shot of an Amazon fulfillment center, showing conveyor belts and robotics.
// assets/images/digital_map_routes.png: A dark map of a country (e.g., USA) with glowing orange lines representing delivery routes, on a transparent background.
// assets/images/data_center.jpg: A cinematic shot inside a server room with glowing server racks.
// assets/images/netflix_logo.png: The Netflix logo on a transparent background.
// assets/images/zoom_logo.png: The Zoom logo on a transparent background.
// assets/images/crumbling_building.png: A single building with visible cracks and dust, on a transparent background, to represent failing businesses.
// assets/images/amazon_workers_group.jpg: A wide, positive shot of a large, diverse group of Amazon workers.
// assets/images/earth_with_amazon_network.jpg: A composite image of the Earth from space, wrapped in glowing orange and blue lines representing Amazon's global network.

const audioUrl = staticFile('BOOKS/Temp/TTS/Lesson_8.wav');

const transcript = [
	{ start: 0.0, end: 0.42, text: 'Key' },
	{ start: 0.42, end: 0.86, text: 'lesson.' },
	{ start: 1.38, end: 1.56, text: 'Your' },
	{ start: 1.56, end: 2.06, text: 'system' },
	{ start: 2.06, end: 2.32, text: 'is' },
	{ start: 2.32, end: 2.76, text: 'only' },
	{ start: 2.76, end: 3.26, text: 'tested' },
	{ start: 3.26, end: 3.52, text: 'in' },
	{ start: 3.52, end: 3.62, text: 'a' },
	{ start: 3.62, end: 3.9, text: 'true' },
	{ start: 3.9, end: 4.42, text: 'crisis.' },
	{ start: 5.26, end: 5.52, text: 'Late' },
	{ start: 5.52, end: 6.26, text: '2019' },
	{ start: 6.26, end: 6.78, text: 'rolled' },
	{ start: 6.78, end: 7.12, text: 'into' },
	{ start: 7.12, end: 7.72, text: '2020,' },
	{ start: 7.92, end: 8.4, text: 'and' },
	{ start: 8.4, end: 8.66, text: 'the' },
	{ start: 8.66, end: 8.92, text: 'world' },
	{ start: 8.92, end: 9.52, text: 'stopped.' },
	{ start: 9.98, end: 10.14, text: 'A' },
	{ start: 10.14, end: 10.52, text: 'global' },
	{ start: 10.52, end: 11.12, text: 'pandemic' },
	{ start: 11.12, end: 11.46, text: 'called' },
	{ start: 11.46, end: 11.82, text: 'COVID' },
	{ start: 11.82, end: 12.36, text: '-19' },
	{ start: 12.36, end: 12.78, text: 'shut' },
	{ start: 12.78, end: 13.04, text: 'down' },
	{ start: 13.04, end: 13.76, text: 'everything.' },
	{ start: 14.28, end: 14.68, text: 'Stores' },
	{ start: 14.68, end: 15.02, text: 'closed,' },
	{ start: 15.44, end: 15.82, text: 'offices' },
	{ start: 15.82, end: 16.24, text: 'closed,' },
	{ start: 16.58, end: 16.9, text: 'people' },
	{ start: 16.9, end: 17.1, text: 'were' },
	{ start: 17.1, end: 17.42, text: 'locked' },
	{ start: 17.42, end: 17.66, text: 'in' },
	{ start: 17.66, end: 17.82, text: 'their' },
	{ start: 17.82, end: 18.16, text: 'homes.' },
	{ start: 18.68, end: 18.8, text: 'And' },
	{ start: 18.8, end: 19.28, text: 'suddenly,' },
	{ start: 19.62, end: 19.7, text: 'the' },
	{ start: 19.7, end: 20.1, text: 'machine' },
	{ start: 20.1, end: 20.4, text: 'that' },
	{ start: 20.4, end: 20.7, text: 'Amazon' },
	{ start: 20.7, end: 21.04, text: 'had' },
	{ start: 21.04, end: 21.2, text: 'been' },
	{ start: 21.2, end: 21.54, text: 'building' },
	{ start: 21.54, end: 21.78, text: 'for' },
	{ start: 21.78, end: 22.38, text: '25' },
	{ start: 22.38, end: 22.88, text: 'years' },
	{ start: 22.88, end: 23.26, text: 'was' },
	{ start: 23.26, end: 23.54, text: 'not' },
	{ start: 23.54, end: 23.86, text: 'just' },
	{ start: 23.86, end: 24.02, text: 'a' },
	{ start: 24.02, end: 24.52, text: 'convenience.' },
	{ start: 24.98, end: 25.12, text: 'It' },
	{ start: 25.12, end: 25.48, text: 'became' },
	{ start: 25.48, end: 26.26, text: 'essential' },
	{ start: 26.26, end: 27.06, text: 'infrastructure.' },
	{ start: 27.06, end: 27.7, text: 'The' },
	{ start: 27.7, end: 28.28, text: 'warehouses,' },
	{ start: 28.6, end: 28.64, text: 'the' },
	{ start: 28.64, end: 28.94, text: 'delivery' },
	{ start: 28.94, end: 29.38, text: 'trucks,' },
	{ start: 29.7, end: 29.78, text: 'the' },
	{ start: 29.78, end: 30.24, text: 'website,' },
	{ start: 30.52, end: 30.6, text: 'the' },
	{ start: 30.6, end: 30.9, text: 'cloud' },
	{ start: 30.9, end: 31.34, text: 'servers,' },
	{ start: 31.58, end: 31.92, text: 'powering' },
	{ start: 31.92, end: 32.14, text: 'Netflix' },
	{ start: 32.14, end: 32.58, text: 'and' },
	{ start: 32.58, end: 32.82, text: 'Zoom,' },
	{ start: 33.16, end: 33.36, text: 'it' },
	{ start: 33.36, end: 33.48, text: 'was' },
	{ start: 33.48, end: 33.84, text: 'all' },
	{ start: 33.84, end: 34.12, text: 'put' },
	{ start: 34.12, end: 34.38, text: 'to' },
	{ start: 34.38, end: 34.5, text: 'the' },
	{ start: 34.5, end: 34.94, text: 'ultimate' },
	{ start: 34.94, end: 35.48, text: 'test.' },
	{ start: 35.84, end: 36.08, text: 'The' },
	{ start: 36.08, end: 36.5, text: 'system' },
	{ start: 36.5, end: 37.14, text: 'strained,' },
	{ start: 37.44, end: 37.74, text: 'delivery' },
	{ start: 37.74, end: 38.04, text: 'time' },
	{ start: 38.04, end: 38.44, text: 'slipped,' },
	{ start: 38.8, end: 38.94, text: 'but' },
	{ start: 38.94, end: 39.08, text: 'it' },
	{ start: 39.08, end: 39.24, text: 'did' },
	{ start: 39.24, end: 39.56, text: 'not' },
	{ start: 39.56, end: 39.92, text: 'break.' },
	{ start: 40.48, end: 40.7, text: 'While' },
	{ start: 40.7, end: 41.0, text: 'other' },
	{ start: 41.0, end: 41.5, text: 'businesses' },
	{ start: 41.5, end: 42.02, text: 'collapsed,' },
	{ start: 42.48, end: 42.72, text: 'Amazon' },
	{ start: 42.72, end: 43.24, text: 'hired.' },
	{ start: 43.62, end: 43.86, text: 'They' },
	{ start: 43.86, end: 44.14, text: 'hired' },
	{ start: 44.14, end: 45.14, text: '175' },
	{ start: 45.14, end: 46.02, text: ',000' },
	{ start: 46.02, end: 46.26, text: 'new' },
	{ start: 46.26, end: 46.58, text: 'workers' },
	{ start: 46.58, end: 46.84, text: 'in' },
	{ start: 46.84, end: 47.12, text: 'just' },
	{ start: 47.12, end: 47.36, text: 'a' },
	{ start: 47.36, end: 47.48, text: 'few' },
	{ start: 47.48, end: 47.82, text: 'months.' },
	{ start: 48.38, end: 48.56, text: 'Their' },
	{ start: 48.56, end: 48.98, text: 'revenue' },
	{ start: 48.98, end: 49.22, text: 'for' },
	{ start: 49.22, end: 49.32, text: 'the' },
	{ start: 49.32, end: 49.64, text: 'second' },
	{ start: 49.64, end: 50.02, text: 'quarter' },
	{ start: 50.02, end: 50.18, text: 'of' },
	{ start: 50.18, end: 50.7, text: '2020' },
	{ start: 50.7, end: 51.78, text: 'exploded,' },
	{ start: 52.08, end: 52.28, text: 'up' },
	{ start: 52.28, end: 52.74, text: '40' },
	{ start: 52.74, end: 53.1, text: '%' },
	{ start: 53.1, end: 53.44, text: 'to' },
	{ start: 53.44, end: 53.96, text: '$88' },
	{ start: 53.96, end: 54.6, text: '.9' },
	{ start: 54.6, end: 55.08, text: 'billion.' },
	{ start: 55.84, end: 56.36, text: 'The' },
	{ start: 56.36, end: 56.88, text: 'pandemic' },
	{ start: 56.88, end: 57.18, text: 'was' },
	{ start: 57.18, end: 57.3, text: 'a' },
	{ start: 57.3, end: 57.74, text: 'tragedy' },
	{ start: 57.74, end: 58.0, text: 'for' },
	{ start: 58.0, end: 58.12, text: 'the' },
	{ start: 58.12, end: 58.42, text: 'world,' },
	{ start: 58.66, end: 58.88, text: 'but' },
	{ start: 58.88, end: 59.06, text: 'for' },
	{ start: 59.06, end: 59.68, text: "Amazon's" },
	{ start: 59.68, end: 59.94, text: 'business' },
	{ start: 59.94, end: 60.32, text: 'model,' },
	{ start: 60.52, end: 60.7, text: 'it' },
	{ start: 60.7, end: 60.84, text: 'was' },
	{ start: 60.84, end: 61.02, text: 'the' },
	{ start: 61.02, end: 61.52, text: 'ultimate' },
	{ start: 61.52, end: 62.22, text: 'validation.' },
	{ start: 62.8, end: 63.2, text: 'Every' },
	{ start: 63.2, end: 63.46, text: 'bet' },
	{ start: 63.46, end: 63.66, text: 'they' },
	{ start: 63.66, end: 63.82, text: 'had' },
	{ start: 63.82, end: 64.18, text: 'ever' },
	{ start: 64.18, end: 64.44, text: 'made' },
	{ start: 64.44, end: 64.6, text: 'on' },
	{ start: 64.6, end: 65.1, text: 'logistics,' },
	{ start: 65.42, end: 65.52, text: 'on' },
	{ start: 65.52, end: 66.08, text: 'infrastructure,' },
	{ start: 66.5, end: 66.62, text: 'on' },
	{ start: 66.62, end: 66.88, text: 'long' },
	{ start: 66.88, end: 67.12, text: '-term' },
	{ start: 67.12, end: 67.58, text: 'thinking,' },
	{ start: 67.98, end: 68.12, text: 'paid' },
	{ start: 68.12, end: 68.46, text: 'off' },
	{ start: 68.46, end: 68.68, text: 'in' },
	{ start: 68.68, end: 68.78, text: 'the' },
	{ start: 68.78, end: 69.1, text: 'moment' },
	{ start: 69.1, end: 69.32, text: 'the' },
	{ start: 69.32, end: 69.6, text: 'world' },
	{ start: 69.6, end: 69.96, text: 'needed' },
	{ start: 69.96, end: 70.14, text: 'it' },
	{ start: 70.14, end: 70.4, text: 'most.' },
];

const Word: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();

	const opacity = spring({
		frame,
		fps,
		from: 0,
		to: 1,
		durationInFrames: 15,
	});

	const scale = spring({
		frame,
		fps,
		from: 0.8,
		to: 1,
		stiffness: 100,
		damping: 20,
	});

	return (
		<span
			style={{
				display: 'inline-block',
				margin: '0 10px',
				opacity,
				transform: `scale(${scale})`,
			}}
		>
			{children}
		</span>
	);
};

const Scene1: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();
	const scale = spring({ frame, fps, from: 1, to: 1.1, durationInFrames });
	const networkOpacity = spring({ frame, fps, from: 0, to: 1, delay: 10 });
	const cloudParallax = interpolate(frame, [0, durationInFrames], [0, -100]);

	return (
		<AbsoluteFill style={{ backgroundColor: '#000' }}>
			<Img
				src={staticFile('assets/images/storm_clouds.jpg')}
				style={{
					position: 'absolute',
					width: '120%',
					height: '120%',
					objectFit: 'cover',
					opacity: 0.5,
					transform: `scale(${scale}) translateX(${cloudParallax}px)`,
				}}
			/>
			<Img
				src={staticFile('assets/images/digital_network.png')}
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					objectFit: 'contain',
					opacity: networkOpacity,
					transform: `scale(${scale * 0.95})`,
					filter: 'drop-shadow(0 0 20px #00aaff)',
				}}
			/>
		</AbsoluteFill>
	);
};

const Scene2: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	// Dolly zoom effect
	const camZoom = interpolate(frame, [0, durationInFrames], [1, 1.2]);
	const earthZoom = interpolate(frame, [0, durationInFrames], [1.5, 1]);

	const virusScale = spring({ frame, fps, from: 0, to: 1.2, delay: 30 });
	const virusOpacity = spring({ frame, fps, from: 0, to: 1, delay: 30 });

	return (
		<AbsoluteFill style={{ backgroundColor: '#050510' }}>
			<div
				style={{
					width: '100%',
					height: '100%',
					transform: `scale(${camZoom})`,
				}}
			>
				<Img
					src={staticFile('assets/images/earth_globe.jpg')}
					style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						transform: `scale(${earthZoom})`,
					}}
				/>
				<Img
					src={staticFile('assets/images/virus_particle.png')}
					style={{
						position: 'absolute',
						width: '50%',
						height: '50%',
						top: '25%',
						left: '25%',
						opacity: virusOpacity,
						transform: `scale(${virusScale})`,
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

const Scene3: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	const camPan = interpolate(frame, [0, durationInFrames], [-50, 50]);
	const signScale = spring({
		frame,
		fps,
		from: 0,
		to: 1,
		damping: 200,
		delay: 15,
	});

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<Img
				src={staticFile('assets/images/empty_city_street.jpg')}
				style={{
					position: 'absolute',
					width: '110%',
					height: '110%',
					objectFit: 'cover',
					top: '-5%',
					left: '-5%',
					transform: `translateX(${camPan}px) scale(1.1)`,
					filter: 'saturate(0.5) brightness(0.7)',
				}}
			/>
			<AbsoluteFill
				style={{ alignItems: 'center', justifyContent: 'center' }}
			>
				<Img
					src={staticFile('assets/images/closed_sign.png')}
					style={{
						width: '40%',
						opacity: signScale,
						transform: `scale(${signScale})`,
						filter: 'drop-shadow(0 0 15px rgba(255,153,0,0.5))',
					}}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene4: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();
	const zoom = interpolate(frame, [0, durationInFrames], [1, 1.15]);
	const mapOpacity = spring({ frame, fps, from: 0, to: 0.6, delay: 20 });
	const mapPan = interpolate(frame, [0, durationInFrames], [0, -80]);

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<Img
				src={staticFile('assets/images/amazon_warehouse_interior.jpg')}
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${zoom})`,
					filter: 'brightness(0.9)',
				}}
			/>
			<Img
				src={staticFile('assets/images/digital_map_routes.png')}
				style={{
					position: 'absolute',
					width: '120%',
					height: '120%',
					top: '-10%',
					left: '-10%',
					objectFit: 'contain',
					opacity: mapOpacity,
					transform: `scale(${zoom * 0.9}) translateY(${mapPan}px)`,
					filter: 'drop-shadow(0 0 10px #ff9900)',
				}}
			/>
		</AbsoluteFill>
	);
};

const Scene5: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	const camZoom = interpolate(frame, [0, durationInFrames], [1.3, 1]);
	const shake =
		Math.sin(frame * 0.5) *
		interpolate(frame, [0, 60, durationInFrames - 60, durationInFrames], [0, 5, 5, 0]);

	const netflixOpacity = spring({ frame, fps, from: 0, to: 1, delay: 40 });
	const zoomOpacity = spring({ frame, fps, from: 0, to: 1, delay: 60 });
	
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'black',
				transform: `translateX(${shake}px) scale(${camZoom})`,
			}}
		>
			<Img
				src={staticFile('assets/images/data_center.jpg')}
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					filter: 'brightness(0.8)',
				}}
			/>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					gap: '5%',
					flexDirection: 'row',
				}}
			>
				<Img
					src={staticFile('assets/images/netflix_logo.png')}
					style={{
						width: '20%',
						opacity: netflixOpacity,
						filter: 'drop-shadow(0 0 15px white)',
					}}
				/>
				<Img
					src={staticFile('assets/images/zoom_logo.png')}
					style={{
						width: '20%',
						opacity: zoomOpacity,
						filter: 'drop-shadow(0 0 15px white)',
					}}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene6: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	const buildingOpacity = interpolate(
		frame,
		[0, 30, 60],
		[0, 1, 0],
		{ extrapolateRight: 'clamp' }
	);
	const workersOpacity = spring({ frame, fps, from: 0, to: 1, delay: 90 });
	const camPan = interpolate(frame, [0, durationInFrames], [0, -100]);

	const revenueOpacity = spring({ frame, fps, from: 0, to: 1, delay: 240 });
	const revenueNum = interpolate(frame, [270, 330], [0, 88.9], { extrapolateLeft: 'clamp' });
	const percentNum = interpolate(frame, [250, 300], [0, 40], { extrapolateLeft: 'clamp' });

	return (
		<AbsoluteFill style={{ backgroundColor: '#111' }}>
			<Img
				src={staticFile('assets/images/amazon_workers_group.jpg')}
				style={{
					position: 'absolute',
					width: '120%',
					height: '120%',
					objectFit: 'cover',
					top: '-10%',
					left: '-10%',
					opacity: workersOpacity,
					transform: `translateX(${camPan}px) scale(1.1)`,
					filter: 'saturate(1.2)'
				}}
			/>
			<Img
				src={staticFile('assets/images/crumbling_building.png')}
				style={{
					position: 'absolute',
					left: '10%',
					bottom: 0,
					width: '30%',
					opacity: buildingOpacity,
					filter: 'drop-shadow(0 0 10px black)',
				}}
			/>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'flex-end',
					padding: '0 10%',
					opacity: revenueOpacity,
				}}
			>
				<div style={{color: 'white', fontSize: 100, fontFamily: 'Arial', textShadow: '0 0 10px black'}}>
					<div style={{fontSize: 200, fontWeight: 'bold'}}>+{Math.round(percentNum)}%</div>
					<div style={{fontSize: 150, fontWeight: 'bold', color: '#4CAF50'}}>${revenueNum.toFixed(1)} Billion</div>
					<div style={{fontSize: 80, opacity: 0.8}}>Q2 2020 Revenue</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene7: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	const pullBack = interpolate(frame, [0, durationInFrames], [1.5, 1]);
	const glowPulse = 0.8 + Math.sin(frame / 10) * 0.2;

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<Img
				src={staticFile('assets/images/earth_with_amazon_network.jpg')}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${pullBack})`,
					filter: `brightness(${glowPulse})`,
				}}
			/>
		</AbsoluteFill>
	);
};

export const RemotionVideo: React.FC = () => {
	const { fps } = useVideoConfig();
	const durationInFrames = 2130; // 71 seconds at 30fps

	const sentences = [
		[...transcript.slice(0, 2)],
		[...transcript.slice(2, 11)],
		[...transcript.slice(11, 20)],
		[...transcript.slice(20, 29)],
		[...transcript.slice(29, 39)],
		[...transcript.slice(39, 52)],
		[...transcript.slice(52, 63)],
		[...transcript.slice(63, 70)],
		[...transcript.slice(70, 81)],
		[...transcript.slice(81, 98)],
	];

	return (
		<>
			<Composition
				id="StorytellingVideo"
				component={() => (
					<AbsoluteFill style={{ backgroundColor: 'black' }}>
						<Audio src={audioUrl} />

						<TransitionSeries>
							<TransitionSeries.Sequence durationInFrames={158}>
								<Scene1 />
							</TransitionSeries.Sequence>
							<TransitionSeries.Transition
								timing={linearTiming({ durationInFrames: 30 })}
							/>
							<TransitionSeries.Sequence durationInFrames={261}>
								<Scene2 />
							</TransitionSeries.Sequence>
							<TransitionSeries.Transition
								timing={linearTiming({ durationInFrames: 30 })}
							/>
							<TransitionSeries.Sequence durationInFrames={163}>
								<Scene3 />
							</TransitionSeries.Sequence>
							<TransitionSeries.Transition
								timing={linearTiming({ durationInFrames: 30 })}
							/>
							<TransitionSeries.Sequence durationInFrames={341}>
								<Scene4 />
							</TransitionSeries.Sequence>
							<TransitionSeries.Transition
								timing={linearTiming({ durationInFrames: 30 })}
							/>
							<TransitionSeries.Sequence durationInFrames={182}>
								<Scene5 />
							</TransitionSeries.Sequence>
							<TransitionSeries.Transition
								timing={linearTiming({ durationInFrames: 30 })}
							/>
							<TransitionSeries.Sequence durationInFrames={481}>
								<Scene6 />
							</TransitionSeries.Sequence>
							<TransitionSeries.Transition
								timing={linearTiming({ durationInFrames: 30 })}
							/>
							<TransitionSeries.Sequence durationInFrames={494}>
								<Scene7 />
							</TransitionSeries.Sequence>
						</TransitionSeries>

						{/* Text Overlay */}
						<AbsoluteFill
							style={{
								alignItems: 'center',
								justifyContent: 'center',
								fontFamily: 'Helvetica, Arial, sans-serif',
								fontSize: '100px',
								fontWeight: 'bold',
								color: 'white',
								textAlign: 'center',
								padding: '0 5%',
								textShadow: '0 0 20px rgba(0,0,0,0.8)',
							}}
						>
							{sentences.map((sentence, index) => {
								const firstWord = sentence[0];
								const lastWord = sentence[sentence.length - 1];
								const startFrame = firstWord.start * fps;
								const endFrame = lastWord.end * fps;

								return (
									<Sequence
										key={index}
										from={startFrame}
										durationInFrames={endFrame - startFrame}
									>
										<p>
											{sentence.map((wordData) => (
												<Word key={wordData.start}>{wordData.text}</Word>
											))}
										</p>
									</Sequence>
								);
							})}
						</AbsoluteFill>
					</AbsoluteFill>
				)}
				durationInFrames={durationInFrames}
				fps={30}
				width={3840}
				height={2160}
			/>
		</>
	);
};
```