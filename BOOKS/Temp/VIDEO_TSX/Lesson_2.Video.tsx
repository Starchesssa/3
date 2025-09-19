```typescript
import React from 'react';
import {
	AbsoluteFill,
	Composition,
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Audio,
	Img,
	staticFile,
} from 'remotion';

// --- Asset Imports ---
// Audio
import audioSrc from './assets/BOOKS/Temp/TTS/Lesson_2.wav';
// Backgrounds
import abstractGearsBg from './assets/images/abstract_gears_background.jpg';
import blueprintBg from './assets/images/blueprint_bg.jpg';
import cityBg from './assets/images/city-background.jpg';
import darkCloudsBg from './assets/images/dark_clouds.jpg';
import dataCenterBg from './assets/images/data_center_background.jpg';
import emptyCityBg from './assets/images/empty_city_street_background.jpg';
import rainyCityBg from './assets/images/rainy-city.jpg';
import serverRoomBg from './assets/images/server-room.jpg';
import sunriseFieldBg from './assets/images/sunrise-field.jpg';
import techCityBg from './assets/images/tech_city_background.jpg';
// Midgrounds
import amazonWarehouseMid from './assets/images/amazon_warehouse_midground.png';
import brokenGearsMid from './assets/images/broken_gears.png';
import citySkylineMid from './assets/images/city-skyline-mid.png';
import fallingChartMid from './assets/images/falling-chart.png';
import fortressMid from './assets/images/fortress.png';
import gearsMid from './assets/images/gears-midground.png';
import phoenixMid from './assets/images/phoenix_from_ashes.png';
import resilientPlantMid from './assets/images/resilient-plant.png';
import serverRacksMid from './assets/images/server-racks-midground.png';
import stockChartMid from './assets/images/stock-chart-midground.png';
// Foregrounds & Overlays
import amazonBoxFg from './assets/images/amazon_box_foreground.png';
import crackedGlassOverlay from './assets/images/cracked_glass_overlay.png';
import dataStreamFg from './assets/images/data_stream_foreground.png';
import deliveryDroneFg from './assets/images/delivery_drone_foreground.png';
import gearsFg from './assets/images/gears-foreground.png';
import rainOverlay from './assets/images/rain_overlay.png';
import techOverlayFg from './assets/images/tech-overlay-foreground.png';

// --- Data ---
const timeline: {text: string; t: [number, number]; k?: boolean}[] = [
	{text: 'Key', t: [0.0, 0.48]}, {text: 'lesson.', t: [0.48, 0.94]},
	{text: 'The', t: [1.34, 1.56]}, {text: 'market', t: [1.56, 1.96], k: true},
	{text: 'is', t: [1.96, 2.28]}, {text: 'a', t: [2.28, 2.36]},
	{text: 'mood', t: [2.36, 2.62], k: true}, {text: 'swing.', t: [2.62, 3.0], k: true},
	{text: 'Your', t: [3.42, 3.52]}, {text: 'strategy', t: [3.52, 4.12], k: true},
	{text: 'is', t: [4.12, 4.5]}, {text: 'a', t: [4.5, 4.56]}, {text: 'compass.', t: [4.56, 4.92], k: true},
	{text: 'The', t: [5.82, 5.88]}, {text: 'bubble', t: [5.88, 6.2], k: true}, {text: 'burst.', t: [6.2, 6.74], k: true},
	{text: 'From', t: [7.26, 7.36]}, {text: 'late', t: [7.36, 7.64]}, {text: '1999', t: [7.64, 8.22]},
	{text: '.com', t: [11.52, 11.9]}, {text: 'companies', t: [11.9, 12.44]}, {text: 'vanished', t: [12.44, 13.02], k: true},
	{text: 'Pets', t: [14.28, 14.48]}, {text: '.com.', t: [14.48, 14.98]}, {text: 'Webvan.', t: [15.34, 15.78]}, {text: 'Gone.', t: [16.22, 16.4]},
	{text: 'Wall', t: [16.92, 17.26]}, {text: 'Street', t: [17.26, 17.56]}, {text: 'on', t: [17.98, 18.3]}, {text: 'Amazon.', t: [18.3, 18.58]},
	{text: 'Amazon', t: [19.74, 20.24]}, {text: 'Bomb.', t: [20.24, 20.64], k: true},
	{text: 'stock', t: [21.46, 21.82]}, {text: 'peaked', t: [22.2, 22.58]}, {text: '$100', t: [22.94, 23.58]}, {text: 'crashed.', t: [23.58, 24.58], k: true},
	{text: 'fell', t: [25.44, 26.38]}, {text: 'less', t: [27.44, 27.72]}, {text: 'than', t: [27.72, 27.96]}, {text: '$6', t: [27.96, 28.5]},
	{text: 'over', t: [30.32, 30.58]}, {text: '90%.', t: [30.58, 31.8], k: true}, {text: 'Imagine', t: [31.8, 32.68]},
	{text: "life's", t: [33.6, 34.14]}, {text: 'work.', t: [34.14, 34.38]}, {text: 'evaporating', t: [35.96, 36.92], k: true}, {text: 'by', t: [36.92, 37.12]}, {text: '90%.', t: [37.12, 38.3]},
	{text: 'Most', t: [38.3, 39.0]}, {text: 'founders', t: [39.0, 39.42]}, {text: 'would', t: [39.42, 39.64]}, {text: 'panic.', t: [39.64, 40.02], k: true},
	{text: 'cut', t: [40.76, 40.98]}, {text: 'costs', t: [40.98, 41.44]}, {text: 'profit.', t: [43.3, 44.76]}, {text: 'calm', t: [45.2, 45.46]}, {text: 'investors.', t: [45.66, 46.2]},
	{text: 'Bezos', t: [46.84, 47.22]}, {text: 'did', t: [47.22, 47.5]}, {text: 'the', t: [47.5, 47.66]}, {text: 'opposite.', t: [47.66, 48.08], k: true},
	{text: 'He', t: [48.54, 48.66]}, {text: 'kept', t: [48.66, 49.02]}, {text: 'building.', t: [49.02, 49.44], k: true},
	{text: 'market', t: [50.68, 51.04]}, {text: 'was', t: [51.04, 51.3]}, {text: 'just', t: [51.3, 51.6]}, {text: 'noise.', t: [51.6, 52.0], k: true},
	{text: 'fear', t: [52.78, 53.08]}, {text: 'and', t: [53.08, 53.42]}, {text: 'greed.', t: [53.42, 53.66]},
	{text: 'His', t: [54.22, 54.42]}, {text: 'strategy', t: [54.42, 54.96], k: true}, {text: 'was', t: [54.96, 55.32]}, {text: 'the', t: [55.32, 55.5]}, {text: 'signal.', t: [55.5, 55.88], k: true},
	{text: 'survive', t: [57.1, 57.48], k: true}, {text: 'the', t: [57.48, 57.8]}, {text: 'storm.', t: [57.8, 58.22], k: true},
	{text: 'Not', t: [58.6, 58.76]}, {text: 'abandon', t: [58.76, 59.24]}, {text: 'the', t: [59.24, 59.46]}, {text: 'ship.', t: [59.46, 59.68]},
];

const LayeredImage: React.FC<{src: string; z: number; tX: number; scale: number}> = ({src, z, tX, scale}) => (
	<Img src={src} style={{
		position: 'absolute', width: '100%', height: '100%', objectFit: 'cover',
		zIndex: z, transform: `scale(${scale}) translateX(${tX}px)`,
	}}/>
);

export const RemotionVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();

	const scene = Math.floor(frame / (durationInFrames / 6));
	const scenes = [
		{bg: abstractGearsBg, mid: gearsMid, fg: techOverlayFg},
		{bg: darkCloudsBg, mid: fallingChartMid, fg: crackedGlassOverlay},
		{bg: rainyCityBg, mid: amazonWarehouseMid, fg: rainOverlay},
		{bg: serverRoomBg, mid: serverRacksMid, fg: dataStreamFg},
		{bg: sunriseFieldBg, mid: resilientPlantMid, fg: deliveryDroneFg},
		{bg: techCityBg, mid: phoenixMid, fg: amazonBoxFg},
	];
	const {bg, mid, fg} = scenes[scene % scenes.length];
	
	const pan = interpolate(frame, [0, durationInFrames], [0, -200]);
	const scale = interpolate(frame, [0, durationInFrames], [1.2, 1.5]);
	const bgTx = pan * 0.5;
	const midTx = pan * 1;
	const fgTx = pan * 2;
	
	const wordSpans = timeline.map((word, i) => {
		const start = word.t[0] * fps;
		const end = word.t[1] * fps;
		const opacity = interpolate(frame, [start, start + 5, end, end + 5], [0, 1, 1, 0]);
		const textScale = word.k ? spring({frame: frame - start, fps, from: 0.8, to: 1.1, stiffness: 100}) : 1;
		const wordStyle: React.CSSProperties = {
			display: 'inline-block', opacity,
			transform: `scale(${textScale})`,
			color: word.k ? '#FCD34D' : 'white',
		};
		return <span key={i} style={wordStyle}>{word.text}&nbsp;</span>;
	});

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_2.wav')} />
			<LayeredImage src={bg} z={1} tX={bgTx} scale={scale} />
			<LayeredImage src={mid} z={2} tX={midTx} scale={scale} />
			<LayeredImage src={fg} z={3} tX={fgTx} scale={scale} />
			<AbsoluteFill style={{zIndex: 10, justifyContent: 'center', alignItems: 'center'}}>
				<p style={{
					color: 'white', fontSize: 100, fontWeight: 'bold', textAlign: 'center',
					width: '80%', lineHeight: 1.5, textShadow: '0 0 20px black',
				}}>{wordSpans}</p>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const Root: React.FC = () => {
	return (
		<Composition
			id="RemotionVideo"
			component={RemotionVideo}
			durationInFrames={1800}
			fps={30}
			width={3840}
			height={2160}
		/>
	);
};
```