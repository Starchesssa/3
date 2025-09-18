```tsx
import { Audio, Sequence, useCurrentFrame, useVideoConfig, AbsoluteFill, Img, staticFile } from 'remotion';
import React from 'react';
import { interpolate, Easing } from 'remotion';

// --- Configuration ---
const audioSrc = staticFile('BOOKS/Temp/TTS/Lesson_3.wav');
const videoDurationInSeconds = 53;
const videoFps = 30;

// --- Transcript Data ---
const words = [
	{ "start": 0.00, "end": 0.44, "text": "Key" },
	{ "start": 0.44, "end": 0.80, "text": "lesson." },
	{ "start": 1.66, "end": 2.28, "text": "Profitability" },
	{ "start": 2.28, "end": 2.58, "text": "is" },
	{ "start": 2.58, "end": 2.68, "text": "a" },
	{ "start": 2.68, "end": 3.02, "text": "weapon," },
	{ "start": 3.40, "end": 3.64, "text": "not" },
	{ "start": 3.64, "end": 3.92, "text": "just" },
	{ "start": 3.92, "end": 4.08, "text": "a" },
	{ "start": 4.08, "end": 4.30, "text": "goal." },
	{ "start": 5.38, "end": 5.64, "text": "Now" },
	{ "start": 5.64, "end": 5.90, "text": "is" },
	{ "start": 5.90, "end": 6.76, "text": "2003." },
	{ "start": 7.38, "end": 7.46, "text": "The" },
	{ "start": 7.46, "end": 8.04, "text": ".com" },
	{ "start": 8.04, "end": 8.50, "text": "graveyard" },
	{ "start": 8.50, "end": 8.90, "text": "is" },
	{ "start": 8.90, "end": 9.24, "text": "full." },
	{ "start": 9.90, "end": 10.24, "text": "Amazon" },
	{ "start": 10.24, "end": 10.56, "text": "is" },
	{ "start": 10.56, "end": 10.82, "text": "still" },
	{ "start": 10.82, "end": 11.28, "text": "standing," },
	{ "start": 11.66, "end": 11.78, "text": "but" },
	{ "start": 11.78, "end": 11.88, "text": "it" },
	{ "start": 11.88, "end": 12.06, "text": "is" },
	{ "start": 12.06, "end": 12.44, "text": "wounded." },
	{ "start": 12.92, "end": 13.08, "text": "The" },
	{ "start": 13.08, "end": 13.50, "text": "pressure" },
	{ "start": 13.50, "end": 13.80, "text": "is" },
	{ "start": 13.80, "end": 14.18, "text": "immense." },
	{ "start": 14.96, "end": 15.16, "text": "They" },
	{ "start": 15.16, "end": 15.46, "text": "had" },
	{ "start": 15.46, "end": 15.66, "text": "to" },
	{ "start": 15.66, "end": 15.96, "text": "prove" },
	{ "start": 15.96, "end": 16.20, "text": "the" },
	{ "start": 16.20, "end": 16.40, "text": "model" },
	{ "start": 16.40, "end": 16.82, "text": "worked." },
	{ "start": 17.28, "end": 17.46, "text": "They" },
	{ "start": 17.46, "end": 17.70, "text": "had" },
	{ "start": 17.70, "end": 17.90, "text": "to" },
	{ "start": 17.90, "end": 18.16, "text": "show" },
	{ "start": 18.16, "end": 18.34, "text": "they" },
	{ "start": 18.34, "end": 18.50, "text": "could" },
	{ "start": 18.50, "end": 19.00, "text": "actually" },
	{ "start": 19.00, "end": 19.28, "text": "make" },
	{ "start": 19.28, "end": 19.66, "text": "money." },
	{ "start": 19.66, "end": 20.48, "text": "And" },
	{ "start": 20.48, "end": 20.60, "text": "the" },
	{ "start": 20.60, "end": 20.92, "text": "fourth" },
	{ "start": 20.92, "end": 21.20, "text": "quarter" },
	{ "start": 21.20, "end": 21.40, "text": "of" },
	{ "start": 21.40, "end": 22.06, "text": "2001," },
	{ "start": 22.46, "end": 22.54, "text": "they" },
	{ "start": 22.54, "end": 22.98, "text": "posted" },
	{ "start": 22.98, "end": 23.20, "text": "their" },
	{ "start": 23.20, "end": 23.68, "text": "first" },
	{ "start": 23.68, "end": 24.00, "text": "ever" },
	{ "start": 24.00, "end": 24.40, "text": "profit." },
	{ "start": 24.92, "end": 25.16, "text": "It" },
	{ "start": 25.16, "end": 25.32, "text": "was" },
	{ "start": 25.32, "end": 25.74, "text": "tiny," },
	{ "start": 26.14, "end": 26.44, "text": "just" },
	{ "start": 26.44, "end": 26.94, "text": "$5" },
	{ "start": 26.94, "end": 27.20, "text": "million" },
	{ "start": 27.20, "end": 27.84, "text": "on" },
	{ "start": 27.84, "end": 28.14, "text": "over" },
	{ "start": 28.14, "end": 28.60, "text": "$1" },
	{ "start": 28.60, "end": 28.90, "text": "billion" },
	{ "start": 28.90, "end": 29.40, "text": "in" },
	{ "start": 29.40, "end": 29.78, "text": "sales." },
	{ "start": 30.48, "end": 30.58, "text": "By" },
	{ "start": 30.58, "end": 31.40, "text": "2003," },
	{ "start": 31.82, "end": 31.92, "text": "they" },
	{ "start": 31.92, "end": 32.04, "text": "were" },
	{ "start": 32.04, "end": 32.70, "text": "consistently" },
	{ "start": 32.70, "end": 33.38, "text": "profitable." },
	{ "start": 33.82, "end": 34.22, "text": "This" },
	{ "start": 34.22, "end": 34.58, "text": "wasn't" },
	{ "start": 34.58, "end": 34.76, "text": "about" },
	{ "start": 34.76, "end": 35.14, "text": "pleasing" },
	{ "start": 35.14, "end": 35.42, "text": "Wall" },
	{ "start": 35.42, "end": 35.64, "text": "Street" },
	{ "start": 35.64, "end": 36.02, "text": "anymore." },
	{ "start": 36.56, "end": 36.68, "text": "It" },
	{ "start": 36.68, "end": 36.80, "text": "was" },
	{ "start": 36.80, "end": 37.06, "text": "about" },
	{ "start": 37.06, "end": 37.58, "text": "generating" },
	{ "start": 37.58, "end": 37.88, "text": "their" },
	{ "start": 37.88, "end": 38.22, "text": "own" },
	{ "start": 38.22, "end": 38.62, "text": "fuel." },
	{ "start": 39.22, "end": 39.70, "text": "Profit" },
	{ "start": 39.70, "end": 40.16, "text": "wasn't" },
	{ "start": 40.16, "end": 40.30, "text": "the" },
	{ "start": 40.30, "end": 40.46, "text": "end" },
	{ "start": 40.46, "end": 40.68, "text": "goal." },
	{ "start": 41.16, "end": 41.54, "text": "Profit" },
	{ "start": 41.54, "end": 41.66, "text": "was" },
	{ "start": 41.66, "end": 41.86, "text": "the" },
	{ "start": 41.86, "end": 42.16, "text": "cash" },
	{ "start": 42.16, "end": 42.46, "text": "that" },
	{ "start": 42.46, "end": 42.72, "text": "allowed" },
	{ "start": 42.72, "end": 43.02, "text": "them" },
	{ "start": 43.02, "end": 43.20, "text": "to" },
	{ "start": 43.20, "end": 43.50, "text": "build" },
	{ "start": 43.50, "end": 43.84, "text": "more," },
	{ "start": 44.20, "end": 44.38, "text": "to" },
	{ "start": 44.38, "end": 44.88, "text": "experiment" },
	{ "start": 44.88, "end": 45.22, "text": "more," },
	{ "start": 45.54, "end": 45.70, "text": "to" },
	{ "start": 45.70, "end": 45.96, "text": "take" },
	{ "start": 45.96, "end": 46.38, "text": "bigger" },
	{ "start": 46.38, "end": 46.78, "text": "risks" },
	{ "start": 46.78, "end": 47.18, "text": "without" },
	{ "start": 47.18, "end": 47.68, "text": "asking" },
	{ "start": 47.68, "end": 47.86, "text": "for" },
	{ "start": 47.86, "end": 48.24, "text": "permission." },
	{ "start": 49.08, "end": 49.24, "text": "It" },
	{ "start": 49.24, "end": 49.40, "text": "was" },
	{ "start": 49.40, "end": 49.98, "text": "the" },
	{ "start": 49.98, "end": 50.26, "text": "foundation" },
	{ "start": 50.26, "end": 50.42, "text": "for" },
	{ "start": 50.42, "end": 50.82, "text": "the" },
	{ "start": 50.82, "end": 51.32, "text": "next" },
	{ "start": 51.32, "end": 51.52, "text": "decade" },
	{ "start": 51.52, "end": 51.78, "text": "of" },
	{ "start": 51.78, "end": 52.18, "text": "war." } // Adjusted end time for last word
];

// --- Helper Components ---

const toFrames = (seconds: number) => Math.floor(seconds * videoFps);

// Dust Particles Effect
const DustParticles: React.FC<{ count: number }> = ({ count }) => {
	const frame = useCurrentFrame();
	const { width, height } = useVideoConfig();

	return (
		<>
			{Array.from({ length: count }).map((_, i) => {
				const x = (Math.sin(i * 2 + frame / 10) + 1) / 2 * width;
				const y = (Math.cos(i * 3 + frame / 15) + 1) / 2 * height;
				const size = (Math.sin(i) + 1) * 2 + 1;
				const opacity = Math.max(0, Math.sin(i * 10 + frame / 20));

				const particleStyle: React.CSSProperties = {
					position: 'absolute',
					left: x,
					top: y,
					width: size,
					height: size,
					borderRadius: '50%',
					backgroundColor: 'rgba(255, 255, 255, 0.5)',
					opacity: opacity,
				};
				return <div key={i} style={particleStyle} />;
			})}
		</>
	);
};


// Word-level subtitle animation
const Word: React.FC<{ word: { start: number; end: number; text: string } }> = ({ word }) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(
		frame,
		[toFrames(word.start), toFrames(word.start) + 5, toFrames(word.end), toFrames(word.end) + 5],
		[0, 1, 1, 0]
	);

	const textGlow = `0 0 10px rgba(255, 255, 255, ${opacity * 0.7})`;

	const wordStyle: React.CSSProperties = {
		display: 'inline-block',
		opacity,
		textShadow: textGlow,
		marginLeft: '0.5em',
	};

	return <span style={wordStyle}>{word.text}</span>;
};


// Main container for subtitles
const Subtitles: React.FC = () => {
	const textContainerStyle: React.CSSProperties = {
		position: 'absolute',
		bottom: '15%',
		width: '100%',
		textAlign: 'center',
		fontSize: '72px',
		fontWeight: 'bold',
		color: 'white',
		fontFamily: 'Arial, sans-serif',
	};

	return (
		<div style={textContainerStyle}>
			{words.map((word, i) => (
				<Word key={i} word={word} />
			))}
		</div>
	);
};

// --- Scene Components ---

const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
	return (
		<Sequence from={toFrames(from)} durationInFrames={toFrames(to - from)}>
			{children}
		</Sequence>
	);
};

const Scene01_KeyLesson: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(1.66);

	const keyScale = interpolate(frame, [0, duration], [1, 1.2], { easing: Easing.ease('in-out') });
	const keyOpacity = interpolate(frame, [0, 5, duration - 5, duration], [0, 1, 1, 0]);
	const glowOpacity = interpolate(frame, [0, duration/2, duration], [0, 0.7, 0], { easing: Easing.inOut(Easing.ease) });

	const keyStyle: React.CSSProperties = {
		position: 'absolute',
		height: '40%',
		top: '30%',
		left: '50%',
		transform: `translateX(-50%) scale(${keyScale})`,
		opacity: keyOpacity,
		filter: `drop-shadow(0 0 30px rgba(255, 215, 0, ${glowOpacity}))`
	};
	
	return (
		<AbsoluteFill style={{ backgroundColor: '#111' }}>
			<DustParticles count={50} />
			<Img src={staticFile('assets/images/key.png')} style={keyStyle} />
		</AbsoluteFill>
	);
};

const Scene02_Weapon: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(5.38 - 1.66);

	const bgScale = interpolate(frame, [0, duration], [1.2, 1], { easing: Easing.bezier(0.5, 0, 0.5, 1) });
	const bgOpacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 1, 1, 0]);
	const weaponOpacity = interpolate(frame, [10, 25, duration - 15, duration], [0, 1, 1, 0]);
	const weaponScale = interpolate(frame, [10, duration], [1.3, 1]);
	const glowOpacity = interpolate(frame, [10, duration], [0.8, 0.3]);

	const backgroundStyle: React.CSSProperties = {
		transform: `scale(${bgScale})`,
		opacity: bgOpacity,
		filter: 'brightness(0.6)'
	};
	const weaponStyle: React.CSSProperties = {
		position: 'absolute',
		height: '80%',
		top: '10%',
		left: '50%',
		transform: `translateX(-50%) scale(${weaponScale})`,
		opacity: weaponOpacity,
		filter: `drop-shadow(0 0 50px rgba(255, 100, 0, ${glowOpacity}))`
	};
	
	return (
		<AbsoluteFill style={{ backgroundColor: '#111' }}>
			<Img src={staticFile('assets/images/forge.jpg')} style={backgroundStyle} />
			<Img src={staticFile('assets/images/sword.png')} style={weaponStyle} />
		</AbsoluteFill>
	);
};

const Scene03_2003: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(7.38 - 5.38);

	const bgOpacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 1, 1, 0]);
	const bgScale = interpolate(frame, [0, duration], [1, 1.1]);
	const textOpacity = interpolate(frame, [5, 20, duration - 15, duration], [0, 1, 1, 0]);
	const textY = interpolate(frame, [5, 20], [20, 0], { extrapolateRight: 'clamp' });
	
	const backgroundStyle: React.CSSProperties = {
		opacity: bgOpacity,
		transform: `scale(${bgScale})`,
		filter: 'blur(5px) brightness(0.7)'
	};

	const yearTextStyle: React.CSSProperties = {
		fontSize: 300,
		fontFamily: 'Courier New, monospace',
		color: '#0f0',
		textShadow: '0 0 20px #0f0, 0 0 40px #0f0',
		opacity: textOpacity,
		transform: `translateY(${textY}px)`
	};

	return (
		<AbsoluteFill style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
			<Img src={staticFile('assets/images/office_2003.jpg')} style={backgroundStyle} />
			<div style={yearTextStyle}>2003</div>
		</AbsoluteFill>
	);
};

const Scene04_Graveyard: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(9.90 - 7.38);

	const bgOpacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 1, 1, 0]);
	const bgX = interpolate(frame, [0, duration], [0, -100]);
	const bgScale = interpolate(frame, [0, duration], [1.1, 1.2]);
	const fogOpacity = interpolate(frame, [0, duration/2, duration], [0, 0.4, 0]);

	const backgroundStyle: React.CSSProperties = {
		opacity: bgOpacity,
		transform: `translateX(${bgX}px) scale(${bgScale})`,
		filter: 'saturate(0.2) brightness(0.5)'
	};
	const fogStyle: React.CSSProperties = {
		backgroundColor: 'grey',
		opacity: fogOpacity,
		mixBlendMode: 'screen',
	};
	
	return (
		<AbsoluteFill>
			<Img src={staticFile('assets/images/monitor_graveyard.jpg')} style={backgroundStyle} />
			<AbsoluteFill style={fogStyle} />
		</AbsoluteFill>
	);
};

const Scene05_Wounded: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(12.92 - 9.90);
	
	const bgOpacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 0.3, 0.3, 0]);
	const skyscraperOpacity = interpolate(frame, [5, 20, duration - 15, duration], [0, 1, 1, 0]);
	const skyscraperY = interpolate(frame, [0, duration], [100, -50]);
	const skyscraperScale = interpolate(frame, [0, duration], [1, 1.1]);

	const backgroundStyle: React.CSSProperties = {
		opacity: bgOpacity,
		filter: 'saturate(0)'
	};
	const skyscraperStyle: React.CSSProperties = {
		height: '150%',
		position: 'absolute',
		bottom: 0,
		left: '50%',
		transform: `translateX(-50%) translateY(${skyscraperY}px) scale(${skyscraperScale})`,
		opacity: skyscraperOpacity,
	};
	
	return (
		<AbsoluteFill style={{ backgroundColor: '#232a3b' }}>
			<Img src={staticFile('assets/images/dark_city.jpg')} style={backgroundStyle} />
			<Img src={staticFile('assets/images/battered_skyscraper.png')} style={skyscraperStyle} />
			<DustParticles count={100} />
		</AbsoluteFill>
	);
};

const Scene06_Pressure: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(14.96 - 12.92);

	const dollyZoom = interpolate(frame, [0, duration], [1, 1.5]);
	const fovEffect = interpolate(frame, [0, duration], [0, -150]);
	const opacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 1, 1, 0]);

	const containerStyle: React.CSSProperties = {
		perspective: '800px',
		opacity: opacity
	};
	const imageStyle: React.CSSProperties = {
		transform: `scale(${dollyZoom}) translateZ(${fovEffect}px)`,
		filter: 'brightness(0.4)'
	};

	return (
		<AbsoluteFill style={containerStyle}>
			<Img src={staticFile('assets/images/pressure_walls.jpg')} style={imageStyle} />
		</AbsoluteFill>
	);
};

const Scene07_ProveModel: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(17.28 - 14.96);

	const bgOpacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 1, 1, 0]);
	const blueprintOpacity = interpolate(frame, [10, 25, duration - 15, duration], [0, 1, 1, 0]);
	const blueprintScale = interpolate(frame, [10, duration], [1.3, 1]);
	const blueprintX = interpolate(frame, [0, duration], [-50, 50]);

	const backgroundStyle: React.CSSProperties = {
		opacity: bgOpacity,
		backgroundColor: '#050a1a',
	};
	const blueprintStyle: React.CSSProperties = {
		opacity: blueprintOpacity,
		transform: `scale(${blueprintScale}) translateX(${blueprintX}px)`,
		mixBlendMode: 'screen'
	};
	
	return (
		<AbsoluteFill style={backgroundStyle}>
			<Img src={staticFile('assets/images/blueprint.png')} style={blueprintStyle} />
		</AbsoluteFill>
	);
};

const Scene08_MakeMoney: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(19.66 - 17.28);
	const opacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 1, 1, 0]);
	
	const coin1Y = interpolate(frame, [0, duration], [-200, 2160]);
	const coin2Y = interpolate(frame, [10, duration], [-200, 2160]);
	const coin3Y = interpolate(frame, [5, duration], [-200, 2160]);
	const coin1X = interpolate(frame, [0, duration], [0, 50]);
	const coin2R = interpolate(frame, [0, duration], [0, 360]);

	const backgroundStyle: React.CSSProperties = {
		backgroundColor: '#050a1a',
		opacity: opacity,
	};
	const coinBaseStyle: React.CSSProperties = {
		position: 'absolute',
		height: '10%',
		opacity: opacity * 0.8,
		filter: 'drop-shadow(0 0 15px gold)'
	};

	return (
		<AbsoluteFill style={backgroundStyle}>
			<Img src={staticFile('assets/images/coin.png')} style={{...coinBaseStyle, top: coin1Y, left: '20%', transform: `translateX(${coin1X}px)` }} />
			<Img src={staticFile('assets/images/coin.png')} style={{...coinBaseStyle, top: coin2Y, left: '50%', transform: `rotate(${coin2R}deg)` }} />
			<Img src={staticFile('assets/images/coin.png')} style={{...coinBaseStyle, top: coin3Y, left: '75%'}} />
		</AbsoluteFill>
	);
};

const Scene09_FirstProfit: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(24.92 - 19.66);

	const opacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 1, 1, 0]);
	const reportScale = interpolate(frame, [0, duration], [1.5, 1]);
	const reportY = interpolate(frame, [0, duration], [100, -100]);
	const highlightOpacity = interpolate(frame, [duration/2, duration/2 + 15], [0, 1]);
	
	const reportStyle: React.CSSProperties = {
		opacity: opacity,
		transform: `scale(${reportScale}) translateY(${reportY}px)`,
		filter: 'brightness(0.9)'
	};
	const highlightStyle: React.CSSProperties = {
		position: 'absolute',
		width: '40%',
		height: '5%',
		backgroundColor: 'rgba(0, 255, 100, 0.4)',
		top: '52%',
		left: '30%',
		opacity: highlightOpacity,
		boxShadow: '0 0 20px rgba(0, 255, 100, 0.7)'
	};

	return (
		<AbsoluteFill style={{backgroundColor: '#222'}}>
			<Img src={staticFile('assets/images/report.png')} style={reportStyle} />
			<div style={highlightStyle}/>
		</AbsoluteFill>
	);
};

const Scene10_Tiny: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(30.48 - 24.92);
	
	const bgOpacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 1, 1, 0]);
	const bgScale = interpolate(frame, [0, duration], [1.3, 1]);
	const sparkOpacity = interpolate(frame, [10, 25], [0, 1]);
	const sparkScale = interpolate(frame, [10, duration], [0.5, 1.2], { easing: Easing.elastic(1)});

	const backgroundStyle: React.CSSProperties = {
		opacity: bgOpacity,
		transform: `scale(${bgScale})`,
		filter: 'brightness(0.4)'
	};
	const sparkStyle: React.CSSProperties = {
		position: 'absolute',
		height: '10%',
		top: '45%',
		left: '45%',
		opacity: sparkOpacity,
		transform: `scale(${sparkScale})`,
		filter: 'drop-shadow(0 0 30px #0f0)'
	};
	
	return (
		<AbsoluteFill>
			<Img src={staticFile('assets/images/revenue_pile.jpg')} style={backgroundStyle} />
			<Img src={staticFile('assets/images/profit_spark.png')} style={sparkStyle} />
		</AbsoluteFill>
	);
};

const Scene11_ConsistentProfit: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(33.82 - 30.48);
	const opacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 1, 1, 0]);

	const bgScale = interpolate(frame, [0, duration], [1.1, 1]);
	const chartScale = interpolate(frame, [10, duration], [1.2, 1]);
	const chartX = interpolate(frame, [0, duration], [-50, 0]);

	const backgroundStyle: React.CSSProperties = {
		transform: `scale(${bgScale})`,
		filter: 'blur(4px) brightness(0.6)',
		opacity: opacity
	};
	const chartStyle: React.CSSProperties = {
		transform: `scale(${chartScale}) translateX(${chartX}px)`,
		opacity: opacity
	};
	
	return (
		<AbsoluteFill>
			<Img src={staticFile('assets/images/modern_office_background.jpg')} style={backgroundStyle} />
			<Img src={staticFile('assets/images/green_line_chart.png')} style={chartStyle} />
		</AbsoluteFill>
	);
};

const Scene12_NotWallStreet: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(36.56 - 33.82);
	const opacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 1, 1, 0]);

	const bgScale = interpolate(frame, [0, duration], [1, 1.2]);
	const bgBlur = interpolate(frame, [0, duration], [0, 10]);
	const bgOpacity = interpolate(frame, [duration - 15, duration], [1, 0]);

	const wallStreetStyle: React.CSSProperties = {
		opacity: opacity * bgOpacity,
		transform: `scale(${bgScale})`,
		filter: `blur(${bgBlur}px) brightness(0.7)`
	};

	return (
		<AbsoluteFill>
			<Img src={staticFile('assets/images/wall_street.jpg')} style={wallStreetStyle} />
		</AbsoluteFill>
	);
};

const Scene13_OwnFuel: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(39.22 - 36.56);
	const opacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 1, 1, 0]);
	
	const bgScale = interpolate(frame, [0, duration], [1.2, 1]);
	const fuelOpacity = interpolate(frame, [10, 25], [0, 0.8]);

	const backgroundStyle: React.CSSProperties = {
		opacity: opacity,
		transform: `scale(${bgScale})`
	};
	const fuelStyle: React.CSSProperties = {
		opacity: fuelOpacity,
		mixBlendMode: 'screen'
	};
	
	return (
		<AbsoluteFill>
			<Img src={staticFile('assets/images/futuristic_engine.jpg')} style={backgroundStyle} />
			<Img src={staticFile('assets/images/energy_stream.png')} style={fuelStyle} />
		</AbsoluteFill>
	);
};

const Scene14_PastTheGoal: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(41.16 - 39.22);
	
	const opacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 1, 1, 0]);
	const lineX = interpolate(frame, [0, duration], [3840, -1920]);
	const lineOpacity = interpolate(frame, [duration / 2, duration / 2 + 5], [1, 0]);

	const backgroundStyle: React.CSSProperties = {
		backgroundColor: '#111',
		opacity: opacity
	};
	const lineStyle: React.CSSProperties = {
		transform: `translateX(${lineX}px)`,
		opacity: lineOpacity * opacity
	};

	return (
		<AbsoluteFill style={backgroundStyle}>
			<Img src={staticFile('assets/images/finish_line.png')} style={lineStyle} />
		</AbsoluteFill>
	);
};

const Scene15_Montage: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(49.08 - 41.16);
	const partDuration = duration / 3;

	const buildOpacity = interpolate(frame, [0, 5, partDuration - 5, partDuration], [0, 1, 1, 0]);
	const buildScale = interpolate(frame, [0, partDuration], [1, 1.1]);
	
	const experimentOpacity = interpolate(frame, [partDuration, partDuration + 5, 2 * partDuration - 5, 2 * partDuration], [0, 1, 1, 0]);
	const experimentScale = interpolate(frame, [partDuration, 2 * partDuration], [1, 1.1]);

	const risksOpacity = interpolate(frame, [2 * partDuration, 2 * partDuration + 5, 3 * partDuration - 5, 3 * partDuration], [0, 1, 1, 0]);
	const risksScale = interpolate(frame, [2 * partDuration, 3 * partDuration], [1, 1.1]);
	
	const buildStyle: React.CSSProperties = { opacity: buildOpacity, transform: `scale(${buildScale})` };
	const experimentStyle: React.CSSProperties = { opacity: experimentOpacity, transform: `scale(${experimentScale})` };
	const risksStyle: React.CSSProperties = { opacity: risksOpacity, transform: `scale(${risksScale})` };

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<Img src={staticFile('assets/images/warehouse_construction.jpg')} style={buildStyle} />
			<Img src={staticFile('assets/images/lab.png')} style={experimentStyle} />
			<Img src={staticFile('assets/images/rocket_launch.jpg')} style={risksStyle} />
		</AbsoluteFill>
	);
};

const Scene16_Foundation: React.FC = () => {
	const frame = useCurrentFrame();
	const duration = toFrames(53.0 - 49.08);

	const bgOpacity = interpolate(frame, [0, 15], [0, 1]);
	const bgY = interpolate(frame, [0, duration], [-100, 0]);
	const foundationOpacity = interpolate(frame, [5, 25], [0, 1]);
	const foundationY = interpolate(frame, [0, duration], [100, 0]);
	const foundationScale = interpolate(frame, [0, duration], [1.2, 1]);

	const backgroundStyle: React.CSSProperties = {
		opacity: bgOpacity,
		transform: `translateY(${bgY}px)`,
		filter: 'blur(3px) brightness(0.5)'
	};
	const foundationStyle: React.CSSProperties = {
		opacity: foundationOpacity,
		transform: `translateY(${foundationY}px) scale(${foundationScale})`,
		mixBlendMode: 'lighten'
	};
	
	return (
		<AbsoluteFill>
			<Img src={staticFile('assets/images/chessboard.jpg')} style={backgroundStyle} />
			<Img src={staticFile('assets/images/glowing_foundation.png')} style={foundationStyle} />
		</AbsoluteFill>
	);
};

// --- Main Video Component ---
export const RemotionVideo: React.FC = () => {
	const totalDurationInFrames = videoDurationInSeconds * videoFps;
	
	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<Scene from={0.00} to={1.66}><Scene01_KeyLesson /></Scene>
			<Scene from={1.66} to={5.38}><Scene02_Weapon /></Scene>
			<Scene from={5.38} to={7.38}><Scene03_2003 /></Scene>
			<Scene from={7.38} to={9.90}><Scene04_Graveyard /></Scene>
			<Scene from={9.90} to={12.92}><Scene05_Wounded /></Scene>
			<Scene from={12.92} to={14.96}><Scene06_Pressure /></Scene>
			<Scene from={14.96} to={17.28}><Scene07_ProveModel /></Scene>
			<Scene from={17.28} to={19.66}><Scene08_MakeMoney /></Scene>
			<Scene from={19.66} to={24.92}><Scene09_FirstProfit /></Scene>
			<Scene from={24.92} to={30.48}><Scene10_Tiny /></Scene>
			<Scene from={30.48} to={33.82}><Scene11_ConsistentProfit /></Scene>
			<Scene from={33.82} to={36.56}><Scene12_NotWallStreet /></Scene>
			<Scene from={36.56} to={39.22}><Scene13_OwnFuel /></Scene>
			<Scene from={39.22} to={41.16}><Scene14_PastTheGoal /></Scene>
			<Scene from={41.16} to={49.08}><Scene15_Montage /></Scene>
			<Scene from={49.08} to={53.0}><Scene16_Foundation /></Scene>
			
			<AbsoluteFill>
				<Subtitles />
			</AbsoluteFill>

			<Audio src={audioSrc} />
		</AbsoluteFill>
	);
};
```