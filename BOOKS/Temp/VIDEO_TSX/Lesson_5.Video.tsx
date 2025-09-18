```tsx
import {
	AbsoluteFill,
	Audio,
	Composition,
	Img,
	Sequence,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import React from 'react';

const FPS = 30;

// Helper to convert seconds to frames
const timeToFrames = (seconds: number) => Math.round(seconds * FPS);

// Transcript data with timings converted to frames
const words = [
	{start: timeToFrames(0.0), end: timeToFrames(0.42), text: 'Key'},
	{start: timeToFrames(0.42), end: timeToFrames(0.82), text: 'lesson,'},
	{start: timeToFrames(1.26), end: timeToFrames(1.46), text: 'while'},
	{start: timeToFrames(1.46), end: timeToFrames(1.82), text: 'others'},
	{start: timeToFrames(1.82), end: timeToFrames(2.3), text: 'retreat,'},
	{start: timeToFrames(2.78), end: timeToFrames(2.9), text: 'you'},
	{start: timeToFrames(2.9), end: timeToFrames(3.4), text: 'attack.'},
	{start: timeToFrames(4.06), end: timeToFrames(4.34), text: 'The'},
	{start: timeToFrames(4.34), end: timeToFrames(4.64), text: 'year'},
	{start: timeToFrames(4.64), end: timeToFrames(4.86), text: 'is'},
	{start: timeToFrames(4.86), end: timeToFrames(5.66), text: '2008.'},
	{start: timeToFrames(6.16), end: timeToFrames(6.22), text: 'The'},
	{start: timeToFrames(6.22), end: timeToFrames(6.54), text: 'global'},
	{start: timeToFrames(6.54), end: timeToFrames(6.98), text: 'financial'},
	{start: timeToFrames(6.98), end: timeToFrames(7.56), text: 'system'},
	{start: timeToFrames(7.56), end: timeToFrames(7.78), text: 'is'},
	{start: timeToFrames(7.78), end: timeToFrames(8.4), text: 'collapsing.'},
	{start: timeToFrames(9.02), end: timeToFrames(9.26), text: 'Lehman'},
	{start: timeToFrames(9.26), end: timeToFrames(9.52), text: 'Brothers'},
	{start: timeToFrames(9.52), end: timeToFrames(9.82), text: 'is'},
	{start: timeToFrames(9.82), end: timeToFrames(10.12), text: 'gone.'},
	{start: timeToFrames(10.74), end: timeToFrames(10.84), text: 'The'},
	{start: timeToFrames(10.84), end: timeToFrames(11.32), text: 'entire'},
	{start: timeToFrames(11.32), end: timeToFrames(11.88), text: 'economy'},
	{start: timeToFrames(11.88), end: timeToFrames(12.26), text: 'is in a'},
	{start: timeToFrames(12.26), end: timeToFrames(12.76), text: 'free fall.'},
	{start: timeToFrames(13.36), end: timeToFrames(13.86), text: 'Businesses'},
	{start: timeToFrames(13.86), end: timeToFrames(14.0), text: 'are'},
	{start: timeToFrames(14.0), end: timeToFrames(14.22), text: 'laying'},
	{start: timeToFrames(14.22), end: timeToFrames(14.56), text: 'people'},
	{start: timeToFrames(14.56), end: timeToFrames(14.84), text: 'off.'},
	{start: timeToFrames(15.2), end: timeToFrames(15.3), text: 'They'},
	{start: timeToFrames(15.3), end: timeToFrames(15.4), text: 'are'},
	{start: timeToFrames(15.4), end: timeToFrames(15.94), text: 'canceling'},
	{start: timeToFrames(15.94), end: timeToFrames(16.36), text: 'projects.'},
	{start: timeToFrames(16.76), end: timeToFrames(16.88), text: 'They'},
	{start: timeToFrames(16.88), end: timeToFrames(17.0), text: 'are'},
	{start: timeToFrames(17.0), end: timeToFrames(17.52), text: 'hoarding'},
	{start: timeToFrames(17.52), end: timeToFrames(17.78), text: 'cash.'},
	{start: timeToFrames(18.26), end: timeToFrames(18.82), text: 'Survival'},
	{start: timeToFrames(18.82), end: timeToFrames(19.06), text: 'mode.'},
	{start: timeToFrames(19.6), end: timeToFrames(19.84), text: 'What'},
	{start: timeToFrames(19.84), end: timeToFrames(20.04), text: 'does'},
	{start: timeToFrames(20.04), end: timeToFrames(20.26), text: 'Amazon'},
	{start: timeToFrames(20.26), end: timeToFrames(20.66), text: 'do?'},
	{start: timeToFrames(21.1), end: timeToFrames(21.24), text: 'They'},
	{start: timeToFrames(21.24), end: timeToFrames(21.46), text: 'push'},
	{start: timeToFrames(21.46), end: timeToFrames(21.92), text: 'forward'},
	{start: timeToFrames(21.92), end: timeToFrames(22.12), text: 'with'},
	{start: timeToFrames(22.12), end: timeToFrames(22.3), text: 'one'},
	{start: timeToFrames(22.3), end: timeToFrames(22.4), text: 'of'},
	{start: timeToFrames(22.4), end: timeToFrames(22.54), text: 'their'},
	{start: timeToFrames(22.54), end: timeToFrames(23.22), text: 'strangest'},
	{start: timeToFrames(23.22), end: timeToFrames(23.42), text: 'and'},
	{start: timeToFrames(23.42), end: timeToFrames(23.7), text: 'most'},
	{start: timeToFrames(23.7), end: timeToFrames(24.16), text: 'ambitious'},
	{start: timeToFrames(24.16), end: timeToFrames(24.62), text: 'products'},
	{start: timeToFrames(24.62), end: timeToFrames(24.96), text: 'yet.'},
	{start: timeToFrames(25.4), end: timeToFrames(25.52), text: 'The'},
	{start: timeToFrames(25.52), end: timeToFrames(26.0), text: 'Kindle,'},
	{start: timeToFrames(26.32), end: timeToFrames(26.46), text: 'an'},
	{start: timeToFrames(26.46), end: timeToFrames(26.92), text: 'electronic'},
	{start: timeToFrames(26.92), end: timeToFrames(27.28), text: 'book'},
	{start: timeToFrames(27.28), end: timeToFrames(27.6), text: 'reader.'},
	{
		start: timeToFrames(27.94),
		end: timeToFrames(30.06),
		text: 'In the middle of a historic recession,',
	},
	{
		start: timeToFrames(30.48),
		end: timeToFrames(34.62),
		text: 'they were trying to change how humanity had read books for over 500 years.',
	},
	{
		start: timeToFrames(34.94),
		end: timeToFrames(36.34),
		text: 'They were building new hardware.',
	},
	{
		start: timeToFrames(36.78),
		end: timeToFrames(37.98),
		text: 'They were fighting with publishers.',
	},
	{
		start: timeToFrames(38.46),
		end: timeToFrames(43.38),
		text: 'They were investing hundreds of millions of dollars while other companies were fighting for their lives.',
	},
	{
		start: timeToFrames(44.02),
		end: timeToFrames(45.62),
		text: 'Recessions are a clearing event.',
	},
	{
		start: timeToFrames(46.02),
		end: timeToFrames(47.18),
		text: 'The weak get wiped out.',
	},
	{
		start: timeToFrames(47.52),
		end: timeToFrames(48.84),
		text: 'The strong get stronger.',
	},
	{
		start: timeToFrames(49.46),
		end: timeToFrames(55.88),
		text: 'Amazon used the 2008 crisis to grab market share and create a brand new ecosystem around digital books.',
	},
	{
		start: timeToFrames(56.29),
		end: timeToFrames(58.32),
		text: 'While everyone else was looking at their feet,',
	},
	{
		start: timeToFrames(58.74),
		end: timeToFrames(60.1),
		text: 'they were looking at the horizon.',
	},
];

// Reusable component for word-by-word animation
const AnimatedWord: React.FC<{word: {start: number; end: number; text: string}}> = ({word}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(
		frame,
		[word.start, word.start + 5],
		[0, 1],
		{
			extrapolateRight: 'clamp',
		}
	);

	return (
		<span style={{opacity, transition: 'opacity 0.1s ease-out'}}>
			{word.text}{' '}
		</span>
	);
};

// --- SCENE COMPONENTS ---

const Scene1: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	// Animate camera zoom and pan
	const cameraScale = spring({
		frame,
		fps: FPS,
		from: 1,
		to: 1.2,
		durationInFrames,
	});
	const cameraX = interpolate(frame, [0, durationInFrames], [0, -100]);
	const cameraY = interpolate(frame, [0, durationInFrames], [0, 50]);
	const cameraTransform = `scale(${cameraScale}) translateX(${cameraX}px) translateY(${cameraY}px)`;

	// Parallax effect for layers
	const kingParallaxX = interpolate(frame, [0, durationInFrames], [0, 50]);
	const kingTransform = `translateX(${kingParallaxX}px) translateZ(0)`;
	
	const glowOpacity = interpolate(frame, [timeToFrames(2.7), timeToFrames(3.4)], [0, 0.8]);
	const attackGlowStyle = {
		textShadow: `0 0 30px rgba(255, 200, 200, ${glowOpacity})`,
	};

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<div style={{transform: cameraTransform, width: '100%', height: '100%'}}>
				<Img
					// assets/images/chess-background.jpg: A moody, dramatic shot of a chessboard, out of focus.
					src="assets/images/chess-background.jpg"
					style={{width: '100%', height: '100%', objectFit: 'cover'}}
				/>
				<AbsoluteFill
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Img
						// assets/images/king.png: A single, heroic chess king piece with a transparent background.
						src="assets/images/king.png"
						style={{
							width: '30%',
							transform: kingTransform,
							filter: 'drop-shadow(0 30px 20px rgba(0,0,0,0.5))',
						}}
					/>
				</AbsoluteFill>
			</div>
			<AbsoluteFill style={styles.textContainer}>
				<p style={{...styles.text, ...attackGlowStyle}}>
					{words
						.filter((w) => w.start < timeToFrames(4))
						.map((word, i) => (
							<AnimatedWord key={i} word={word} />
						))}
				</p>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene2: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	// Dolly zoom effect
	const cameraScale = spring({frame, fps: FPS, from: 1.5, to: 1, durationInFrames});
	const backgroundScale = spring({frame, fps: FPS, from: 1, to: 1.5, durationInFrames});

	const cameraTransform = `scale(${cameraScale})`;
	const backgroundTransform = `scale(${backgroundScale})`;

	const crackOpacity = interpolate(
		frame,
		[durationInFrames - 30, durationInFrames],
		[0, 1]
	);

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<div style={{transform: cameraTransform, width: '100%', height: '100%'}}>
				<div style={{transform: backgroundTransform, width: '100%', height: '100%'}}>
					<Img
						// assets/images/stock-ticker.jpg: A blurry, chaotic image of a stock market screen with red, falling numbers.
						src="assets/images/stock-ticker.jpg"
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							filter: 'saturate(1.5)',
						}}
					/>
				</div>
				<AbsoluteFill style={{backgroundColor: 'rgba(100,0,0,0.2)'}} />
				<Img
					// assets/images/cracked-glass.png: An overlay of shattered glass with a transparent background.
					src="assets/images/cracked-glass.png"
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						opacity: crackOpacity,
					}}
				/>
			</div>
			<AbsoluteFill style={styles.textContainer}>
				<p style={styles.text}>
					{words
						.filter(
							(w) => w.start >= timeToFrames(4) && w.start < timeToFrames(9)
						)
						.map((word, i) => (
							<AnimatedWord key={i} word={word} />
						))}
				</p>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};


const Scene3: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Downward "free fall" parallax motion
	const cameraY = interpolate(frame, [0, durationInFrames], [0, 200]);
	const cameraTransform = `translateY(${cameraY}px)`;

	const buildingOpacity = interpolate(frame, [timeToFrames(9.8) - 90, timeToFrames(9.8) - 30], [1, 0], {extrapolateLeft: 'clamp'});
	const buildingBlur = interpolate(frame, [timeToFrames(9.8) - 90, timeToFrames(9.8) - 30], [0, 20], {extrapolateLeft: 'clamp'});
	const buildingFilter = `blur(${buildingBlur}px)`;

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<div style={{ transform: cameraTransform, width: '100%', height: '100%'}}>
				<Img
					// assets/images/wall-street-night.jpg: Background image of NYC's financial district at night.
					src="assets/images/wall-street-night.jpg"
					style={{ width: '110%', height: '110%', objectFit: 'cover', left: '-5%', top: '-5%'}}
				/>
				<AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<Img
						// assets/images/lehman-building.png: Cutout of a single, iconic office building with a transparent background.
						src="assets/images/lehman-building.png"
						style={{ 
							width: '40%',
							opacity: buildingOpacity,
							filter: buildingFilter,
							transition: 'opacity 1s, filter 1s'
						}}
					/>
				</AbsoluteFill>
			</div>
			<AbsoluteFill style={styles.textContainer}>
				<p style={styles.text}>
					{words.filter((w) => w.start >= timeToFrames(9) && w.start < timeToFrames(13)).map((word, i) => (
						<AnimatedWord key={i} word={word} />
					))}
				</p>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene4: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Slow pull-back reveal
	const cameraScale = interpolate(frame, [0, durationInFrames], [1.3, 1]);
	const cameraTransform = `scale(${cameraScale})`;
	
	// Paper animation
	const paper1Y = interpolate(frame, [0, durationInFrames], [-200, 2500]);
	const paper1X = interpolate(frame, [0, durationInFrames], [200, 400]);
	const paper1Rot = interpolate(frame, [0, durationInFrames], [0, 720]);
	const paper1Transform = `translateY(${paper1Y}px) translateX(${paper1X}px) rotate(${paper1Rot}deg)`;

	const paper2Y = interpolate(frame, [0, durationInFrames], [-400, 2300]);
	const paper2X = interpolate(frame, [0, durationInFrames], [1800, 1600]);
	const paper2Rot = interpolate(frame, [0, durationInFrames], [45, -600]);
	const paper2Transform = `translateY(${paper2Y}px) translateX(${paper2X}px) rotate(${paper2Rot}deg)`;

	return (
		<AbsoluteFill style={{ backgroundColor: '#111' }}>
			<div style={{ transform: cameraTransform, width: '100%', height: '100%'}}>
				<Img
					// assets/images/empty-office.jpg: A dimly lit, modern but deserted office interior.
					src="assets/images/empty-office.jpg"
					style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.5) brightness(0.7)'}}
				/>
				<Img
					// assets/images/flying-papers.png: A few scattered paper sheets with transparent backgrounds to be animated.
					src="assets/images/flying-papers.png"
					style={{ position: 'absolute', width: '150px', opacity: 0.8, transform: paper1Transform }}
				/>
				<Img
					src="assets/images/flying-papers.png"
					style={{ position: 'absolute', width: '200px', opacity: 0.9, transform: paper2Transform }}
				/>
			</div>
			<AbsoluteFill style={styles.textContainer}>
				<p style={styles.text}>
					{words.filter((w) => w.start >= timeToFrames(13) && w.start < timeToFrames(19.5)).map((word, i) => (
						<AnimatedWord key={i} word={word} />
					))}
				</p>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene5: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Reveal shot
	const kindleOpacity = spring({ frame: frame - 30, fps: FPS, from: 0, to: 1, durationInFrames: 60 });
	const kindleScale = spring({ frame: frame - 30, fps: FPS, from: 0.5, to: 1, durationInFrames });
	const kindleTransform = `scale(${kindleScale})`;
	
	const lightbeamOpacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 0.5, 0.5, 0]);
	const lightbeamTransform = `perspective(1000px) rotateX(20deg) scale(2, 3)`;

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
				<Img
					// assets/images/abstract-background.jpg: A dark, tech-focused background with subtle blue/purple light patterns.
					src="assets/images/abstract-background.jpg"
					style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
				/>
				<AbsoluteFill style={{
					background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
					opacity: lightbeamOpacity,
					transform: lightbeamTransform,
				}} />

				<AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<Img
						// assets/images/kindle-silhouette.png: A crisp silhouette of the original Kindle, transparent background.
						src="assets/images/kindle-silhouette.png"
						style={{ 
							width: '35%',
							opacity: kindleOpacity,
							transform: kindleTransform,
							filter: 'drop-shadow(0 0 50px rgba(173, 216, 230, 0.7))',
						}}
					/>
				</AbsoluteFill>
			<AbsoluteFill style={styles.textContainer}>
				<p style={styles.text}>
					{words.filter((w) => w.start >= timeToFrames(19.5) && w.start < timeToFrames(27.8)).map((word, i) => (
						<AnimatedWord key={i} word={word} />
					))}
				</p>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene6: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Slow zoom into the scene
	const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.1]);
	const cameraTransform = `scale(${cameraScale})`;

	// Cross-fade effect
	const kindleOpacity = interpolate(frame, [durationInFrames / 2, durationInFrames], [0, 1]);
	const oldBookOpacity = interpolate(frame, [0, durationInFrames / 2], [1, 0]);


	return (
		<AbsoluteFill style={{ backgroundColor: '#2d2a26' }}>
			<div style={{ transform: cameraTransform, width: '100%', height: '100%'}}>
				<Img
					// assets/images/old-library.jpg: A grand, dusty library background.
					src="assets/images/old-library.jpg"
					style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
				/>
				<AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
						<Img
							// assets/images/kindle-product.png: A clean product shot of the Kindle on a transparent background.
							src="assets/images/kindle-product.png"
							style={{ 
								width: '40%',
								opacity: kindleOpacity,
								position: 'absolute',
							}}
						/>
						<Img
							// assets/images/old-book.png: An old, leather-bound book on a transparent background.
							src="assets/images/old-book.png"
							style={{ 
								width: '40%',
								opacity: oldBookOpacity,
								position: 'absolute'
							}}
						/>
				</AbsoluteFill>
			</div>
			<AbsoluteFill style={styles.textContainer}>
				<p style={styles.text}>
					{words.filter((w) => w.start >= timeToFrames(27.8) && w.start < timeToFrames(34.8)).map((word, i) => (
						<AnimatedWord key={i} word={word} />
					))}
				</p>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene7: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Pan across a busy scene
	const cameraX = interpolate(frame, [0, durationInFrames], [200, -200]);
	const cameraTransform = `translateX(${cameraX}px) scale(1.2)`;

	return (
		<AbsoluteFill style={{ backgroundColor: '#051923' }}>
			<div style={{ transform: cameraTransform, width: '100%', height: '100%'}}>
				<Img
					// assets/images/blueprints.jpg: A background of technical drawings and hardware schematics.
					src="assets/images/blueprints.jpg"
					style={{ width: '120%', height: '120%', left: '-10%', top: '-10%', objectFit: 'cover', opacity: 0.5 }}
				/>
			</div>
			<AbsoluteFill style={styles.textContainer}>
				<p style={styles.text}>
					{words.filter((w) => w.start >= timeToFrames(34.8) && w.start < timeToFrames(43.9)).map((word, i) => (
						<AnimatedWord key={i} word={word} />
					))}
				</p>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};


const Scene8: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Slow zoom out to reveal the strong tree
	const cameraScale = interpolate(frame, [0, durationInFrames], [1.5, 1]);
	const cameraY = interpolate(frame, [0, durationInFrames], [150, 0]);
	const cameraTransform = `scale(${cameraScale}) translateY(${cameraY}px)`;
	
	const treeParallaxY = interpolate(frame, [0, durationInFrames], [-50, 0]);
	const treeTransform = `translateY(${treeParallaxY}px)`;

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<div style={{ transform: cameraTransform, width: '100%', height: '100%'}}>
				<Img
					// assets/images/storm-clearing.jpg: A dramatic sky with dark storm clouds on one side and clear, sunny sky on the other.
					src="assets/images/storm-clearing.jpg"
					style={{ width: '100%', height: '100%', objectFit: 'cover' }}
				/>
				<AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '5%' }}>
					<Img
						// assets/images/solitary-tree.png: A silhouette of a single, resilient tree with a transparent background.
						src="assets/images/solitary-tree.png"
						style={{ width: '40%', transform: treeTransform }}
					/>
				</AbsoluteFill>
			</div>
			<AbsoluteFill style={styles.textContainer}>
				<p style={styles.text}>
					{words.filter((w) => w.start >= timeToFrames(43.9) && w.start < timeToFrames(49)).map((word, i) => (
						<AnimatedWord key={i} word={word} />
					))}
				</p>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene9: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Forward push towards the horizon
	const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.2]);
	const cameraY = interpolate(frame, [0, durationInFrames], [0, -100]);
	const cameraTransform = `scale(${cameraScale}) translateY(${cameraY}px)`;
	
	const logoOpacity = interpolate(frame, [durationInFrames - 60, durationInFrames], [0, 0.6]);

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<div style={{ transform: cameraTransform, width: '100%', height: '100%'}}>
				<Img
					// assets/images/mountain-horizon.jpg: A breathtaking sunrise view from a mountain peak.
					src="assets/images/mountain-horizon.jpg"
					style={{ width: '100%', height: '100%', objectFit: 'cover' }}
				/>
				<AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<Img
						// assets/images/amazon-logo.png: The Amazon smile logo, semi-transparent.
						src="assets/images/amazon-logo.png"
						style={{ width: '20%', opacity: logoOpacity }}
					/>
				</AbsoluteFill>
			</div>
			<AbsoluteFill style={styles.textContainer}>
				<p style={styles.text}>
					{words.filter((w) => w.start >= timeToFrames(49)).map((word, i) => (
						<AnimatedWord key={i} word={word} />
					))}
				</p>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// --- MAIN COMPONENT ---

export const RemotionVideo: React.FC = () => {
	const videoDuration = 1830; // 61 seconds at 30fps

	return (
		<>
			<Audio src={'BOOKS/Temp/TTS/Lesson_5.wav'} />

			<Sequence from={0} durationInFrames={timeToFrames(4)}>
				<Scene1 />
			</Sequence>

			<Sequence from={timeToFrames(4)} durationInFrames={timeToFrames(5)}>
				<Scene2 />
			</Sequence>

			<Sequence from={timeToFrames(9)} durationInFrames={timeToFrames(4.5)}>
				<Scene3 />
			</Sequence>
			
			<Sequence from={timeToFrames(13.5)} durationInFrames={timeToFrames(6)}>
				<Scene4 />
			</Sequence>

			<Sequence from={timeToFrames(19.5)} durationInFrames={timeToFrames(8.3)}>
				<Scene5 />
			</Sequence>

			<Sequence from={timeToFrames(27.8)} durationInFrames={timeToFrames(7)}>
				<Scene6 />
			</Sequence>
			
			<Sequence from={timeToFrames(34.8)} durationInFrames={timeToFrames(9.1)}>
				<Scene7 />
			</Sequence>

			<Sequence from={timeToFrames(43.9)} durationInFrames={timeToFrames(5.1)}>
				<Scene8 />
			</Sequence>

			<Sequence from={timeToFrames(49)} durationInFrames={videoDuration - timeToFrames(49)}>
				<Scene9 />
			</Sequence>
		</>
	);
};

const styles: {[key: string]: React.CSSProperties} = {
	textContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		padding: '0 10%',
	},
	text: {
		fontFamily: "'Helvetica Neue', Arial, sans-serif",
		fontSize: '110px',
		lineHeight: '1.2',
		fontWeight: 'bold',
		textAlign: 'center',
		color: 'white',
		textShadow: '0 0 20px rgba(0,0,0,0.8)',
	},
};

```