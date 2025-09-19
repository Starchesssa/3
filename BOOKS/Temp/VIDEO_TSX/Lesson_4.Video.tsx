```typescript
import React from 'react';
import {
	AbsoluteFill,
	Composition,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	staticFile,
	Audio,
	Img,
	registerRoot,
} from 'remotion';

const backgrounds = ['abstract_gears_background.jpg', 'bright_sky.jpg', 'city-background.jpg', 'rainy-city.jpg', 'city_background.jpg', 'tech_city_background.jpg', 'sunrise-field.jpg', 'tech_cityscape.jpg', 'blueprint_bg.jpg', 'data_center_background.jpg', 'dark_clouds.jpg', 'winding-path.jpg', 'sky-background.jpg', 'empty_city_street_background.jpg', 'data-center-background.jpg', 'server-room.jpg', 'gears-background.png'];
const midgrounds = ['mountains-far.png', 'gears-midground.png', 'stock-chart-midground.png', 'single-tree.png', 'falling-chart.png', 'city-skyline-mid.png', 'modern_city.png', 'amazon_warehouse_midground.png', 'cloud_servers_midground.png', 'fortress.png', 'server-racks-midground.png', 'buildings_midground.png', 'broken_gears.png', 'forest-midground.png'];
const foregrounds = ['data_overlay_foreground.png', 'buildings-foreground.png', 'glowing-data.png', 'soundwaves_overlay.png', 'delivery_drone_foreground.png', 'digital_grid.png', 'cracked_glass_overlay.png', 'biohazard_symbol_overlay.png', 'amazon_box_foreground.png', 'sad-people.png', 'glowing_particles.png', 'data_stream.png', 'rain_overlay.png', 'phoenix_from_ashes.png', 'gears-foreground.png', 'resilient-plant.png', 'data_stream_foreground.png', 'aws-logo.png', 'tech-overlay-foreground.png'];
const keywords = new Set(['expense', 'product', 'amazon', 'infrastructure', 'beast', 'opportunity', 'aws', 'revolution', 'industry', 'computing', 'servers']);

export const RemotionVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	// --- 1. PARALLAX & IMAGE CYCLING ---
	const framesPerScene = 150; // 5 seconds per image set
	const sceneIndex = Math.floor(frame / framesPerScene);
	const bgImage = staticFile(`images/${backgrounds[sceneIndex % backgrounds.length]}`);
	const mgImage = staticFile(`images/${midgrounds[sceneIndex % midgrounds.length]}`);
	const fgImage = staticFile(`images/${foregrounds[sceneIndex % foregrounds.length]}`);

	const pan = interpolate(frame, [0, durationInFrames], [150, -150]);
	const bgTranslateX = pan * 0.4;
	const mgTranslateX = pan * 0.8;
	const fgTranslateX = pan * 1.3;

	const bgStyle: React.CSSProperties = { transform: `scale(1.1) translateX(${bgTranslateX}px)`, opacity: 0.6 };
	const mgStyle: React.CSSProperties = { transform: `scale(1.1) translateX(${mgTranslateX}px)`, opacity: 0.7 };
	const fgStyle: React.CSSProperties = { transform: `scale(1.1) translateX(${fgTranslateX}px)`, opacity: 0.5 };

	// --- 2. TEXT ANIMATION ---
	const animatedWords = wordsData.map((word) => {
		const startFrame = word.start * fps;
		const isKeyword = keywords.has(word.text.replace(/[,.]/g, '').toLowerCase());
		const opacity = interpolate(frame, [startFrame - 15, startFrame], [0, 1], { extrapolateLeft: 'clamp' });
		const scale = isKeyword ? interpolate(frame, [startFrame, startFrame + 5], [1.2, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
		const color = isKeyword ? '#FF9900' : '#FFFFFF';
		const textShadow = '2px 2px 8px rgba(0,0,0,0.8)';
		const style: React.CSSProperties = { display: 'inline-block', opacity, color, textShadow, transform: `scale(${scale})`, margin: '0 8px' };
		return { ...word, style };
	});

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_4.wav')} />
			<AbsoluteFill style={bgStyle}><Img src={bgImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></AbsoluteFill>
			<AbsoluteFill style={mgStyle}><Img src={mgImage} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></AbsoluteFill>
			<AbsoluteFill style={fgStyle}><Img src={fgImage} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></AbsoluteFill>
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
				<div style={{ width: '85%', textAlign: 'center', fontSize: 90, fontWeight: 'bold', fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: '1.5em' }}>
					{animatedWords.map((word, i) => (<span key={i} style={word.style}>{word.text}</span>))}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// --- COMPOSITION REGISTRATION ---
registerRoot(() => (
	<Composition
		id="RemotionVideo"
		component={RemotionVideo}
		durationInFrames={2230} // 74.3 seconds
		fps={30}
		width={3840}
		height={2160}
	/>
));

// --- TIMELINE DATA ---
const wordsData = [
	{ start: 0.00, end: 0.42, text: 'Key' },{ start: 0.42, end: 0.82, text: 'lesson,' },{ start: 1.26, end: 1.54, text: 'turn' },{ start: 1.54, end: 1.78, text: 'your' },{ start: 1.78, end: 2.16, text: 'biggest' },{ start: 2.16, end: 2.64, text: 'expense' },{ start: 2.64, end: 3.20, text: 'into' },{ start: 3.20, end: 3.40, text: 'your' },{ start: 3.40, end: 3.80, text: 'biggest' },{ start: 3.80, end: 4.48, text: 'product.' },
	{ start: 4.84, end: 5.50, text: 'The' },{ start: 5.50, end: 5.78, text: 'year' },{ start: 5.78, end: 6.00, text: 'is' },{ start: 6.00, end: 6.84, text: '2006.' },{ start: 7.40, end: 7.74, text: 'Amazon' },{ start: 7.74, end: 8.08, text: 'is' },{ start: 8.08, end: 8.22, text: 'a' },{ start: 8.22, end: 8.62, text: 'successful' },{ start: 8.62, end: 9.22, text: 'online' },{ start: 9.22, end: 9.76, text: 'retailer.' },
	{ start: 10.20, end: 10.48, text: 'That' },{ start: 10.48, end: 10.66, text: 'is' },{ start: 10.66, end: 10.82, text: 'what' },{ start: 10.82, end: 11.22, text: 'everyone' },{ start: 11.22, end: 11.62, text: 'sees.' },{ start: 12.24, end: 12.42, text: 'But' },{ start: 12.42, end: 12.90, text: 'inside,' },{ start: 13.34, end: 13.54, text: 'something' },{ start: 13.54, end: 13.86, text: 'else' },
	{ start: 13.86, end: 14.06, text: 'is' },{ start: 14.06, end: 14.40, text: 'happening.' },{ start: 15.00, end: 15.20, text: 'For' },{ start: 15.20, end: 15.54, text: 'years,' },{ start: 15.88, end: 15.94, text: 'the' },{ start: 15.94, end: 16.46, text: "company's" },{ start: 16.46, end: 16.76, text: 'biggest' },{ start: 16.76, end: 17.18, text: 'headache' },{ start: 17.18, end: 17.52, text: 'and' },
	{ start: 17.52, end: 17.84, text: 'biggest' },{ start: 17.84, end: 18.34, text: 'expense' },{ start: 18.34, end: 18.78, text: 'was' },{ start: 18.78, end: 18.96, text: 'its' },{ start: 18.96, end: 19.28, text: 'own' },{ start: 19.28, end: 19.74, text: 'computing' },{ start: 19.74, end: 20.50, text: 'infrastructure.' },{ start: 21.00, end: 21.20, text: 'The' },{ start: 21.20, end: 21.58, text: 'servers,' },
	{ start: 21.96, end: 22.06, text: 'the' },{ start: 22.06, end: 22.56, text: 'databases,' },{ start: 22.98, end: 23.22, text: 'the' },{ start: 23.22, end: 23.56, text: 'network' },{ start: 23.56, end: 23.86, text: 'to' },{ start: 23.86, end: 24.04, text: 'run' },{ start: 24.04, end: 24.20, text: 'the' },{ start: 24.20, end: 24.64, text: 'massive' },{ start: 24.64, end: 25.10, text: 'Amazon' },
	{ start: 25.10, end: 25.58, text: '.com' },{ start: 25.58, end: 26.06, text: 'website.' },{ start: 26.06, end: 26.74, text: 'It' },{ start: 26.74, end: 26.92, text: 'was' },{ start: 26.92, end: 27.14, text: 'a' },{ start: 27.14, end: 27.62, text: 'beast.' },{ start: 28.04, end: 28.16, text: 'It' },{ start: 28.16, end: 28.32, text: 'was' },{ start: 28.32, end: 28.82, text: 'complex' },
	{ start: 28.82, end: 29.26, text: 'and' },{ start: 29.26, end: 29.90, text: 'incredibly' },{ start: 29.90, end: 30.58, text: 'expensive.' },{ start: 31.14, end: 31.34, text: 'A' },{ start: 31.34, end: 31.62, text: 'normal' },{ start: 31.62, end: 32.06, text: 'company' },{ start: 32.06, end: 32.38, text: 'sees' },{ start: 32.38, end: 32.56, text: 'a' },{ start: 32.56, end: 32.76, text: 'cost' },
	{ start: 32.76, end: 33.10, text: 'center.' },{ start: 33.54, end: 33.72, text: 'They' },{ start: 33.72, end: 33.96, text: 'try' },{ start: 33.96, end: 34.10, text: 'to' },{ start: 34.10, end: 34.24, text: 'make' },{ start: 34.24, end: 34.40, text: 'it' },{ start: 34.40, end: 34.54, text: 'a' },{ start: 34.54, end: 34.78, text: 'little' },{ start: 34.78, end: 35.14, text: 'cheaper,' },
	{ start: 35.50, end: 35.56, text: 'a' },{ start: 35.56, end: 35.80, text: 'little' },{ start: 35.80, end: 36.00, text: 'more' },{ start: 36.00, end: 36.40, text: 'efficient.' },{ start: 37.06, end: 37.42, text: 'Amazon' },{ start: 37.42, end: 37.78, text: 'saw' },{ start: 37.78, end: 37.90, text: 'an' },{ start: 37.90, end: 38.48, text: 'opportunity.' },{ start: 39.02, end: 39.24, text: 'They' },
	{ start: 39.24, end: 39.48, text: 'thought,' },{ start: 39.80, end: 40.00, text: 'if' },{ start: 40.00, end: 40.18, text: 'we' },{ start: 40.18, end: 40.34, text: 'have' },{ start: 40.34, end: 40.60, text: 'gotten' },{ start: 40.60, end: 40.86, text: 'this' },{ start: 40.86, end: 41.20, text: 'good' },{ start: 41.20, end: 41.40, text: 'at' },{ start: 41.40, end: 41.66, text: 'running' },
	{ start: 41.66, end: 42.20, text: 'massive,' },{ start: 42.48, end: 42.86, text: 'reliable' },{ start: 42.86, end: 43.32, text: 'computer' },{ start: 43.32, end: 43.80, text: 'systems' },{ start: 43.80, end: 44.04, text: 'for' },{ start: 44.04, end: 44.48, text: 'ourselves,' },{ start: 45.06, end: 45.22, text: 'maybe' },{ start: 45.22, end: 45.58, text: 'other' },
	{ start: 45.58, end: 45.92, text: 'people' },{ start: 45.92, end: 46.14, text: 'would' },{ start: 46.14, end: 46.36, text: 'pay' },{ start: 46.36, end: 46.50, text: 'to' },{ start: 46.50, end: 46.76, text: 'use' },{ start: 46.76, end: 47.02, text: 'it.' },{ start: 47.42, end: 47.70, text: 'In' },{ start: 47.70, end: 48.36, text: '2006,' },{ start: 48.76, end: 48.84, text: 'they' },
	{ start: 48.84, end: 49.12, text: 'launched' },{ start: 49.12, end: 49.58, text: 'Amazon' },{ start: 49.58, end: 49.94, text: 'Web' },{ start: 49.94, end: 50.46, text: 'Services,' },{ start: 50.78, end: 50.98, text: 'or' },{ start: 50.98, end: 51.52, text: 'AWS.' },{ start: 52.28, end: 52.54, text: 'They' },{ start: 52.54, end: 52.92, text: 'started' },{ start: 52.92, end: 53.28, text: 'renting' },
	{ start: 53.28, end: 53.58, text: 'out' },{ start: 53.58, end: 53.74, text: 'their' },{ start: 53.74, end: 54.12, text: 'computer' },{ start: 54.12, end: 54.46, text: 'power.' },{ start: 54.46, end: 55.08, text: 'It' },{ start: 55.08, end: 55.20, text: 'was' },{ start: 55.20, end: 55.38, text: 'like' },{ start: 55.38, end: 55.52, text: 'a' },{ start: 55.52, end: 55.82, text: 'power' },
	{ start: 55.82, end: 56.26, text: 'company,' },{ start: 56.48, end: 56.64, text: 'but' },{ start: 56.64, end: 56.84, text: 'for' },{ start: 56.84, end: 57.28, text: 'computing.' },{ start: 58.06, end: 58.20, text: 'At' },{ start: 58.20, end: 58.58, text: 'first,' },{ start: 58.86, end: 59.04, text: 'no' },{ start: 59.04, end: 59.18, text: 'one' },{ start: 59.18, end: 59.60, text: 'understood' },
	{ start: 59.60, end: 59.88, text: 'it.' },{ start: 60.20, end: 60.40, text: 'An' },{ start: 60.40, end: 60.78, text: 'online' },{ start: 60.78, end: 61.30, text: 'bookstore' },{ start: 61.30, end: 61.66, text: 'was' },{ start: 61.66, end: 61.84, text: 'now' },{ start: 61.84, end: 62.18, text: 'selling' },{ start: 62.18, end: 62.60, text: 'server' },{ start: 62.60, end: 62.98, text: 'time.' },
	{ start: 63.30, end: 63.42, text: 'It' },{ start: 63.42, end: 63.60, text: 'made' },{ start: 63.60, end: 63.98, text: 'no' },{ start: 63.98, end: 64.42, text: 'sense.' },{ start: 64.90, end: 65.10, text: 'But' },{ start: 65.10, end: 65.26, text: 'it' },{ start: 65.26, end: 65.40, text: 'was' },{ start: 65.40, end: 65.58, text: 'the' },{ start: 65.58, end: 65.96, text: 'start' },
	{ start: 65.96, end: 66.18, text: 'of' },{ start: 66.18, end: 66.30, text: 'the' },{ start: 66.30, end: 66.64, text: 'cloud' },{ start: 66.64, end: 67.16, text: 'computing' },{ start: 67.16, end: 67.80, text: 'revolution.' },{ start: 68.40, end: 68.50, text: 'A' },{ start: 68.50, end: 68.94, text: 'multi' },{ start: 68.94, end: 69.58, text: '-trillion' },
	{ start: 69.58, end: 69.94, text: 'dollar' },{ start: 69.94, end: 70.42, text: 'industry' },{ start: 70.42, end: 70.70, text: 'was' },{ start: 70.70, end: 71.00, text: 'born' },{ start: 71.00, end: 71.26, text: 'from' },{ start: 71.26, end: 71.46, text: 'what' },{ start: 71.46, end: 71.76, text: 'used' },{ start: 71.76, end: 71.96, text: 'to' },{ start: 71.96, end: 72.04, text: 'be' },
	{ start: 72.04, end: 72.20, text: 'a' },{ start: 72.20, end: 72.44, text: 'line' },{ start: 72.44, end: 72.76, text: 'item' },{ start: 72.76, end: 72.94, text: 'in' },{ start: 72.94, end: 73.12, text: 'their' },{ start: 73.12, end: 73.44, text: 'expense' },{ start: 73.44, end: 73.82, text: 'report.' },
];
```