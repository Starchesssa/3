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
	interpolate,
	Easing,
} from 'remotion';
import React from 'react';

// --- Constants ---
const VIDEO_WIDTH = 3840;
const VIDEO_HEIGHT = 2160;
const VIDEO_FPS = 30;

// The last word ends at 67.22s. Add a 1-second buffer.
const DURATION_IN_SECONDS = 68.22;
const DURATION_IN_FRAMES = Math.round(DURATION_IN_SECONDS * VIDEO_FPS);

// --- Data ---
// Sentences grouped from the transcript for animation
const sentences = [
	{text: 'Key lesson.', start: 0.0, end: 0.88},
	{
		text: 'Ignore short-term reality for a long-term vision.',
		start: 1.48,
		end: 4.84,
	},
	{text: 'The year is 1999.', start: 5.76, end: 7.22},
	{
		text: 'The world is high on the dot-com bubble.',
		start: 7.9,
		end: 10.28,
	},
	{text: 'Everyone is a genius.', start: 10.8, end: 11.8},
	{text: 'Stocks only go up.', start: 12.38, end: 13.66},
	{
		text: 'Amazon is the poster child of this new internet economy.',
		start: 14.28,
		end: 17.56,
	},
	{text: 'It sells books online.', start: 18.02, end: 19.1},
	{
		text: 'But Jeff Bezos is telling Wall Street something they do not want to hear.',
		start: 19.78,
		end: 23.66,
	},
	{
		text: 'He is telling them he is going to lose money.',
		start: 24.16,
		end: 26.68,
	},
	{
		text: 'He is telling them he is going to spend every dollar they give him and more.',
		start: 27.16,
		end: 31.2,
	},
	{text: 'He is not building a bookstore.', start: 31.86, end: 33.36},
	{text: 'He is building the everything store.', start: 34.06, end: 35.82},
	{
		text: 'In his 1997 letter to shareholders, he said it was all about the long-term.',
		start: 36.5,
		end: 41.72,
	},
	{
		text: 'In 1999, the market loved him for it.',
		start: 42.54,
		end: 45.32,
	},
	{
		text: 'Amazon stocks soared to over $100 a share.',
		start: 45.8,
		end: 49.18,
	},
	{text: 'But the company was not profitable.', start: 49.52, end: 51.56},
	{text: 'Not even close.', start: 51.96, end: 52.72},
	{text: 'It was a promise.', start: 53.28, end: 54.48},
	{text: 'A bet on a distant future.', start: 55.02, end: 56.66},
	{
		text: 'Most people saw a company selling books at a loss.',
		start: 57.3,
		end: 59.96,
	},
	{
		text: 'Bezos saw a global logistics and data empire.',
		start: 60.6,
		end: 63.76,
	},
	{
		text: 'The vision was so big, it looked like insanity.',
		start: 64.28,
		end: 67.22,
	},
];

// --- Helper Components ---

// Component for Animated Dust Particles
const DustParticles: React.FC<{count: number}> = ({count}) => {
	const {width, height} = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill>
			{Array.from({length: count}).map((_, i) => {
				const seed = i * 123;
				const x = (((seed * 17) % 100) / 100) * width;
				const y = (((seed * 23) % 100) / 100) * height;
				const size = 2 + (((seed * 31) % 100) / 100) * 4;
				const speed = 0.5 + (((seed * 37) % 100) / 100);

				const movementY = interpolate(
					frame,
					[0, DURATION_IN_FRAMES],
					[0, -height * speed],
					{
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}
				);

				const opacityValue = interpolate(
					Math.sin(frame / 20 + seed),
					[-1, 1],
					[0.1, 0.4]
				);

				const particleStyle: React.CSSProperties = {
					position: 'absolute',
					left: x,
					top: (y + movementY) % height,
					width: size,
					height: size,
					backgroundColor: 'rgba(255, 255, 255, 0.5)',
					borderRadius: '50%',
					filter: 'blur(3px)',
					opacity: opacityValue,
				};

				return <div key={i} style={particleStyle} />;
			})}
		</AbsoluteFill>
	);
};

// Component for Animated Text
const AnimatedText: React.FC<{text: string; start: number; end: number}> = ({
	text,
	start,
	end,
}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const startFrame = start * fps;
	const endFrame = end * fps;
	const FADE_DURATION = 10; // in frames

	const opacity = interpolate(
		frame,
		[startFrame, startFrame + FADE_DURATION, endFrame - FADE_DURATION, endFrame],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	const blur = interpolate(opacity, [0, 1], [10, 0]);
	const scale = interpolate(opacity, [0, 1], [1.1, 1]);

	const textStyle: React.CSSProperties = {
		fontFamily: 'Georgia, serif',
		fontSize: '120px',
		fontWeight: 'bold',
		color: 'rgba(255, 255, 240, 0.95)',
		textAlign: 'center',
		padding: '0 10%',
		textShadow: '0 0 25px rgba(255, 215, 0, 0.6)',
		opacity,
		transform: `scale(${scale})`,
		filter: `blur(${blur}px)`,
	};

	return <p style={textStyle}>{text}</p>;
};

// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// --- Scene Timing and Animation Calculations ---

	// Scene 1: The Vision (0.0s - 5.0s)
	const scene1Start = 0;
	const scene1End = 5 * fps;
	const scene1Progress = interpolate(
		frame,
		[scene1Start, scene1End],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);
	const scene1CameraZoom = interpolate(scene1Progress, [0, 1], [1, 1.2]);
	const scene1BgParallax = interpolate(scene1Progress, [0, 1], [0, -50]);
	const scene1FgParallax = interpolate(scene1Progress, [0, 1], [0, -150]);

	// Scene 2: The Dot-Com Bubble (5.0s - 14.0s)
	const scene2Start = 5 * fps;
	const scene2End = 14 * fps;
	const scene2Progress = interpolate(
		frame,
		[scene2Start, scene2End],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);
	const scene2CameraPan = interpolate(scene2Progress, [0, 1], [-100, 100]);

	// Scene 3: Early Amazon (14.0s - 19.5s)
	const scene3Start = 14 * fps;
	const scene3End = 19.5 * fps;
	const scene3Progress = interpolate(
		frame,
		[scene3Start, scene3End],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.bezier(0.42, 0, 0.58, 1),
		}
	);
	const scene3DollyZoomBg = interpolate(scene3Progress, [0, 1], [1.5, 1]);
	const scene3DollyZoomFg = interpolate(scene3Progress, [0, 1], [1, 1.5]);

	// Scene 4: The Unpopular Plan (19.5s - 31.5s)
	const scene4Start = 19.5 * fps;
	const scene4End = 31.5 * fps;
	const scene4Progress = interpolate(
		frame,
		[scene4Start, scene4End],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);
	const scene4CameraPush = interpolate(scene4Progress, [0, 1], [1, 1.1]);

	// Scene 5: The Everything Store (31.5s - 36.0s)
	const scene5Start = 31.5 * fps;
	const scene5End = 36 * fps;
	const scene5Progress = interpolate(
		frame,
		[scene5Start, scene5End],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.exp,
		}
	);
	const scene5RevealZoom = interpolate(scene5Progress, [0, 1], [4, 1]);

	// Scene 6: Market Reaction (36.0s - 49.5s)
	const scene6Start = 36 * fps;
	const scene6End = 49.5 * fps;
	const scene6Progress = interpolate(
		frame,
		[scene6Start, scene6End],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);
	const scene6RocketY = interpolate(scene6Progress, [0.3, 1], [
		VIDEO_HEIGHT,
		-VIDEO_HEIGHT / 2,
	]);
	const scene6RocketX = Math.sin(scene6Progress * Math.PI * 2) * 50;

	// Scene 7: Sobering Reality (49.5s - 57.0s)
	const scene7Start = 49.5 * fps;
	const scene7End = 57 * fps;
	const scene7Progress = interpolate(
		frame,
		[scene7Start, scene7End],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);
	const scene7Pan = interpolate(scene7Progress, [0, 1], [-200, 200]);

	// Scene 8: Final Vision (57.0s - 68.22s)
	const scene8Start = 57 * fps;
	const scene8End = DURATION_IN_FRAMES;
	const scene8Progress = interpolate(
		frame,
		[scene8Start, scene8End],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);
	const scene8FinalZoom = interpolate(scene8Progress, [0, 1], [1.2, 1]);
	const scene8OverlayOpacity = interpolate(scene8Progress, [0.7, 1], [0, 1]);

	// --- Style Objects ---
	const containerStyle: React.CSSProperties = {
		backgroundColor: 'black',
	};

	const imageStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	};

	const vignetteStyle: React.CSSProperties = {
		boxShadow: 'inset 0 0 250px 100px rgba(0,0,0,0.6)',
	};

	// --- Component Render ---

	return (
		<AbsoluteFill style={containerStyle}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_1.wav')} />
			<DustParticles count={50} />

			{/* Scene 1: The Vision */}
			<Sequence from={scene1Start} durationInFrames={scene1End - scene1Start}>
				<AbsoluteFill style={{transform: `scale(${scene1CameraZoom})`}}>
					{/* Image Asset: A dark, starry nebula background. Should be a high-res jpg. */}
					<Img
						src={staticFile('assets/images/vision_bg.jpg')}
						style={{...imageStyle, transform: `translateX(${scene1BgParallax}px)`}}
					/>
					{/* Image Asset: A bright, glowing galaxy in the distance. Should be a png with transparent background. */}
					<Img
						src={staticFile('assets/images/distant_galaxy.png')}
						style={{
							...imageStyle,
							transform: `translateX(${scene1FgParallax}px) scale(0.8)`,
						}}
					/>
					{/* Image Asset: Silhouette of a person on a cliff. Should be a png with transparent background. */}
					<Img
						src={staticFile('assets/images/person_silhouette.png')}
						style={{
							...imageStyle,
							objectFit: 'contain',
							objectPosition: 'bottom center',
						}}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Scene 2: The Dot-Com Bubble */}
			<Sequence from={scene2Start} durationInFrames={scene2End - scene2Start}>
				<AbsoluteFill
					style={{transform: `translateX(${scene2CameraPan}px) scale(1.3)`}}
				>
					{/* Image Asset: A bustling 90s cityscape at night. High-res jpg. */}
					<Img
						src={staticFile('assets/images/city_1999_bg.jpg')}
						style={imageStyle}
					/>
					{/* Image Asset: A semi-transparent overlay of green, upward-trending stock tickers. Full-screen png with transparency. */}
					<Img
						src={staticFile('assets/images/stock_overlay.png')}
						style={{
							...imageStyle,
							opacity: 0.3,
							transform: `translateX(${-scene2CameraPan * 1.5}px)`,
						}}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Scene 3: Early Amazon */}
			<Sequence from={scene3Start} durationInFrames={scene3End - scene3Start}>
				<AbsoluteFill>
					{/* Image Asset: A massive library/bookstore background, slightly out of focus. jpg. */}
					<Img
						src={staticFile('assets/images/library_bg.jpg')}
						style={{...imageStyle, transform: `scale(${scene3DollyZoomBg})`}}
					/>
					{/* Image Asset: A vintage CRT monitor frame. png with transparent center. */}
					<Img
						src={staticFile('assets/images/old_monitor.png')}
						style={{...imageStyle, transform: `scale(${scene3DollyZoomFg})`}}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Scene 4: The Unpopular Plan */}
			<Sequence from={scene4Start} durationInFrames={scene4End - scene4Start}>
				<AbsoluteFill style={{transform: `scale(${scene4CameraPush})`}}>
					{/* Image Asset: Dark, moody shot of Wall Street buildings. jpg. */}
					<Img
						src={staticFile('assets/images/wall_street_bg.jpg')}
						style={imageStyle}
					/>
					{/* Image Asset: A semi-transparent portrait of a young Jeff Bezos. png with transparent background. */}
					<Img
						src={staticFile('assets/images/bezos_portrait.png')}
						style={{
							...imageStyle,
							opacity: 0.4,
							objectFit: 'contain',
							objectPosition: 'center right',
						}}
					/>
					{/* Image Asset: A glowing red line graph pointing downwards. png with transparent background. */}
					<Img
						src={staticFile('assets/images/red_chart_down.png')}
						style={{...imageStyle, opacity: 0.8}}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Scene 5: The Everything Store */}
			<Sequence from={scene5Start} durationInFrames={scene5End - scene5Start}>
				<AbsoluteFill style={{transform: `scale(${scene5RevealZoom})`}}>
					{/* Image Asset: Massive, modern warehouse aisle. High-res jpg. */}
					<Img
						src={staticFile('assets/images/warehouse_aisle.jpg')}
						style={imageStyle}
					/>
					{/* Image Asset: Icons of various products (TV, clothes, etc). png with transparent background. */}
					<Img
						src={staticFile('assets/images/product_icons.png')}
						style={{...imageStyle, opacity: 0.3}}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Scene 6: Market Reaction */}
			<Sequence from={scene6Start} durationInFrames={scene6End - scene6Start}>
				{/* Image Asset: A night sky background. jpg. */}
				<Img
					src={staticFile('assets/images/sky_rocket_bg.jpg')}
					style={imageStyle}
				/>
				{/* Image Asset: A rocket with a stock chart trail. png with transparent background. */}
				<AbsoluteFill
					style={{justifyContent: 'center', alignItems: 'center'}}
				>
					<Img
						src={staticFile('assets/images/stock_rocket.png')}
						style={{
							transform: `translateY(${scene6RocketY}px) translateX(${scene6RocketX}px) rotate(-45deg)`,
							height: '50%',
						}}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Scene 7: Sobering Reality */}
			<Sequence from={scene7Start} durationInFrames={scene7End - scene7Start}>
				<AbsoluteFill style={{transform: `scale(1.2)`}}>
					{/* Image Asset: A dark, empty warehouse or factory floor. jpg. */}
					<Img
						src={staticFile('assets/images/empty_factory_bg.jpg')}
						style={{...imageStyle, transform: `translateX(${scene7Pan}px)`}}
					/>
					{/* Image Asset: A faint, glowing city on the far horizon. png with transparent background. */}
					<Img
						src={staticFile('assets/images/distant_city_glow.png')}
						style={{...imageStyle, transform: `translateX(${scene7Pan * 0.5}px)`}}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Scene 8: Final Vision */}
			<Sequence from={scene8Start} durationInFrames={scene8End - scene8Start}>
				<AbsoluteFill style={{transform: `scale(${scene8FinalZoom})`}}>
					{/* Image Asset: Background showing a futuristic globe with data networks, trucks, planes. jpg. */}
					<Img
						src={staticFile('assets/images/global_network.jpg')}
						style={imageStyle}
					/>
					{/* Image Asset: Complex, brain-like neural network overlay. png with transparency. */}
					<Img
						src={staticFile('assets/images/neural_network_overlay.png')}
						style={{...imageStyle, opacity: scene8OverlayOpacity}}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Vignette Overlay */}
			<AbsoluteFill style={vignetteStyle} />

			{/* Text Layer */}
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				{sentences.map((sentence, index) => (
					<Sequence
						key={index}
						from={sentence.start * fps}
						durationInFrames={(sentence.end - sentence.start) * fps + 20}
					>
						<AbsoluteFill
							style={{justifyContent: 'center', alignItems: 'center'}}
						>
							<AnimatedText
								text={sentence.text}
								start={sentence.start}
								end={sentence.end}
							/>
						</AbsoluteFill>
					</Sequence>
				))}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
```