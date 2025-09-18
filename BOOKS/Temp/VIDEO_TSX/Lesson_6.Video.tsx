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
import { interpolate, spring, Easing } from 'remotion';

type Word = {
  start: number;
  end: number;
  text: string;
};

const transcript: Word[] = [
	{ text: 'Key', start: 0, end: 50 },
	{ text: 'lesson.', start: 50, end: 94 },
	{ text: 'Use', start: 150, end: 178 },
	{ text: 'your', start: 178, end: 200 },
	{ text: 'cash', start: 200, end: 228 },
	{ text: 'cow', start: 228, end: 256 },
	{ text: 'to', start: 256, end: 292 },
	{ text: 'invade', start: 292, end: 330 },
	{ text: 'new', start: 330, end: 372 },
	{ text: 'territories.', start: 372, end: 430 },
	{ text: 'It', start: 502, end: 522 },
	{ text: 'is', start: 522, end: 534 },
	{ text: 'now', start: 534, end: 554 },
	{ text: '2017.', start: 554, end: 636 },
	{ text: 'AWS', start: 718, end: 762 },
	{ text: 'is', start: 762, end: 814 },
	{ text: 'a', start: 814, end: 826 },
	{ text: 'monster.', start: 826, end: 882 },
	{ text: 'It', start: 938, end: 950 },
	{ text: 'is', start: 950, end: 958 },
	{ text: 'a', start: 958, end: 968 },
	{ text: 'money', start: 968, end: 1008 },
	{ text: 'printing', start: 1008, end: 1056 },
	{ text: 'machine.', start: 1056, end: 1108 },
	{ text: 'In', start: 1182, end: 1188 },
	{ text: '2017', start: 1188, end: 1248 },
	{ text: 'alone,', start: 1248, end: 1296 },
	{ text: 'AWS', start: 1352, end: 1380 },
	{ text: 'would', start: 1380, end: 1428 },
	{ text: 'generate', start: 1428, end: 1462 },
	{ text: 'over', start: 1462, end: 1492 },
	{ text: '$17', start: 1492, end: 1564 },
	{ text: 'billion', start: 1564, end: 1636 },
	{ text: 'in', start: 1636, end: 1702 },
	{ text: 'revenue.', start: 1702, end: 1742 },
	{ text: 'And', start: 1794, end: 1812 },
	{ text: 'unlike', start: 1812, end: 1848 },
	{ text: 'the', start: 1848, end: 1870 },
	{ text: 'low', start: 1870, end: 1888 },
	{ text: 'margin', start: 1888, end: 1924 },
	{ text: 'retail', start: 1924, end: 1958 },
	{ text: 'business,', start: 1958, end: 2006 },
	{ text: 'AWS', start: 2056, end: 2084 },
	{ text: 'was', start: 2084, end: 2130 },
	{ text: 'incredibly', start: 2130, end: 2196 },
	{ text: 'profitable.', start: 2196, end: 2264 },
	{ text: 'It', start: 2306, end: 2332 },
	{ text: 'was', start: 2332, end: 2344 },
	{ text: 'a', start: 2344, end: 2358 },
	{ text: 'cash', start: 2358, end: 2394 },
	{ text: 'cow.', start: 2394, end: 2422 },
	{ text: 'So', start: 2474, end: 2510 },
	{ text: 'what', start: 2510, end: 2546 },
	{ text: 'do', start: 2546, end: 2556 },
	{ text: 'you', start: 2556, end: 2568 },
	{ text: 'do', start: 2568, end: 2588 },
	{ text: 'with', start: 2588, end: 2612 },
	{ text: 'all', start: 2612, end: 2622 },
	{ text: 'that', start: 2622, end: 2638 },
	{ text: 'cash?', start: 2638, end: 2670 },
	{ text: 'You', start: 2718, end: 2742 },
	{ text: 'could', start: 2742, end: 2758 },
	{ text: 'give', start: 2758, end: 2784 },
	{ text: 'it', start: 2784, end: 2796 },
	{ text: 'back', start: 2796, end: 2812 },
	{ text: 'to', start: 2812, end: 2830 },
	{ text: 'shareholders.', start: 2830, end: 2874 },
	{ text: 'You', start: 2874, end: 2946 },
	{ text: 'could', start: 2946, end: 2964 },
	{ text: 'play', start: 2964, end: 2994 },
	{ text: 'it', start: 2994, end: 3004 },
	{ text: 'safe,', start: 3004, end: 3036 },
	{ text: 'or', start: 3076, end: 3114 },
	{ text: 'you', start: 3114, end: 3142 },
	{ text: 'could', start: 3142, end: 3154 },
	{ text: 'use', start: 3154, end: 3180 },
	{ text: 'it', start: 3180, end: 3196 },
	{ text: 'as', start: 3196, end: 3210 },
	{ text: 'a', start: 3210, end: 3222 },
	{ text: 'war', start: 3222, end: 3248 },
	{ text: 'chest', start: 3248, end: 3292 },
	{ text: 'to', start: 3292, end: 3314 },
	{ text: 'attack', start: 3314, end: 3352 },
	{ text: 'a', start: 3352, end: 3368 },
	{ text: 'completely', start: 3368, end: 3416 },
	{ text: 'new', start: 3416, end: 3458 },
	{ text: 'industry.', start: 3458, end: 3508 },
	{ text: 'On', start: 3568, end: 3586 },
	{ text: 'June', start: 3586, end: 3606 },
	{ text: '16,', start: 3606, end: 3656 },
	{ text: '2017,', start: 3664, end: 3750 },
	{ text: 'Amazon', start: 3790, end: 3828 },
	{ text: 'announced', start: 3828, end: 3884 },
	{ text: 'it', start: 3884, end: 3900 },
	{ text: 'was', start: 3900, end: 3912 },
	{ text: 'buying', start: 3912, end: 3938 },
	{ text: 'whole', start: 3938, end: 3968 },
	{ text: 'foods', start: 3968, end: 4010 },
	{ text: 'for', start: 4010, end: 4034 },
	{ text: '$13', start: 4034, end: 4086 },
	{ text: '.7', start: 4086, end: 4174 },
	{ text: 'billion.', start: 4174, end: 4230 },
	{ text: 'In', start: 4312, end: 4350 },
	{ text: 'cash,', start: 4350, end: 4380 },
	{ text: 'the', start: 4442, end: 4464 },
	{ text: 'world', start: 4464, end: 4488 },
	{ text: 'was', start: 4488, end: 4512 },
	{ text: 'stunned.', start: 4512, end: 4566 },
	{ text: 'The', start: 4616, end: 4626 },
	{ text: 'king', start: 4626, end: 4652 },
	{ text: 'of', start: 4652, end: 4674 },
	{ text: 'e', start: 4674, end: 4696 },
	{ text: '-commerce', start: 4696, end: 4722 },
	{ text: 'was', start: 4722, end: 4758 },
	{ text: 'buying', start: 4758, end: 4786 },
	{ text: 'a', start: 4786, end: 4802 },
	{ text: 'brick', start: 4802, end: 4830 },
	{ text: 'and', start: 4830, end: 4850 },
	{ text: 'mortar', start: 4850, end: 4878 },
	{ text: 'grocery', start: 4878, end: 4920 },
	{ text: 'chain.', start: 4920, end: 4968 },
	{ text: 'On', start: 5004, end: 5042 },
	{ text: 'the', start: 5042, end: 5052 },
	{ text: 'day', start: 5052, end: 5070 },
	{ text: 'of', start: 5070, end: 5084 },
	{ text: 'the', start: 5084, end: 5096 },
	{ text: 'announcement,', start: 5096, end: 5138 },
	{ text: 'the', start: 5180, end: 5186 },
	{ text: 'stocks', start: 5186, end: 5212 },
	{ text: 'of', start: 5212, end: 5236 },
	{ text: 'competing', start: 5236, end: 5276 },
	{ text: 'grocery', start: 5276, end: 5316 },
	{ text: 'stores', start: 5316, end: 5362 },
	{ text: 'like', start: 5362, end: 5386 },
	{ text: 'Kroger', start: 5386, end: 5428 },
	{ text: 'and', start: 5428, end: 5450 },
	{ text: 'Costco', start: 5450, end: 5490 },
	{ text: 'plummeted.', start: 5490, end: 5576 },
	{ text: 'They', start: 5608, end: 5636 },
	{ text: 'lost', start: 5636, end: 5658 },
	{ text: 'more', start: 5658, end: 5696 },
	{ text: 'in', start: 5696, end: 5714 },
	{ text: 'market', start: 5714, end: 5744 },
	{ text: 'value', start: 5744, end: 5778 },
	{ text: 'that', start: 5778, end: 5796 },
	{ text: 'day', start: 5796, end: 5824 },
	{ text: 'than', start: 5824, end: 5860 },
	{ text: 'the', start: 5860, end: 5872 },
	{ text: '$13', start: 5872, end: 5912 },
	{ text: '.7', start: 5912, end: 5980 },
	{ text: 'billion', start: 5980, end: 6030 },
	{ text: 'Amazon', start: 6030, end: 6114 },
	{ text: 'paid.', start: 6114, end: 6152 },
	{ text: 'Amazon', start: 6210, end: 6260 },
	{ text: 'was', start: 6260, end: 6284 },
	{ text: 'using', start: 6284, end: 6310 },
	{ text: 'the', start: 6310, end: 6330 },
	{ text: 'high', start: 6330, end: 6360 },
	{ text: '-tech,', start: 6360, end: 6386 },
	{ text: 'high', start: 6426, end: 6448 },
	{ text: '-profit', start: 6448, end: 6490 },
	{ text: 'engine', start: 6490, end: 6524 },
	{ text: 'of', start: 6524, end: 6544 },
	{ text: 'AWS', start: 6544, end: 6594 },
	{ text: 'to', start: 6594, end: 6648 },
	{ text: 'fund', start: 6648, end: 6672 },
	{ text: 'an', start: 6672, end: 6692 },
	{ text: 'invasion', start: 6692, end: 6744 },
	{ text: 'into', start: 6744, end: 6780 },
	{ text: 'the', start: 6780, end: 6796 },
	{ text: 'old', start: 6796, end: 6830 },
	{ text: '-world', start: 6830, end: 6854 },
	{ text: 'business', start: 6854, end: 6896 },
	{ text: 'of', start: 6896, end: 6922 },
	{ text: 'selling', start: 6922, end: 6950 },
	{ text: 'milk', start: 6950, end: 6982 },
	{ text: 'and', start: 6982, end: 7010 },
	{ text: 'eggs.', start: 7010, end: 7048 },
	{ text: 'They', start: 7084, end: 7120 },
	{ text: 'were', start: 7120, end: 7136 },
	{ text: 'playing', start: 7136, end: 7168 },
	{ text: 'a', start: 7168, end: 7194 },
	{ text: 'different', start: 7194, end: 7236 },
	{ text: 'game.', start: 7236, end: 7272 },
];
const audioUrl = staticFile('BOOKS/Temp/TTS/Lesson_6.wav');
const videoDurationInFrames = 2200; // 73.33 seconds at 30fps
const videoWidth = 3840;
const videoHeight = 2160;

// Helper component for individual word animations
const WordComponent: React.FC<{ word: Word }> = ({ word }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const startFrame = (word.start / 100) * fps;
	const endFrame = (word.end / 100) * fps;

	const opacity = interpolate(
		frame,
		[startFrame, startFrame + 10, endFrame, endFrame + 10],
		[0, 1, 1, 0]
	);

	return (
		<span style={{ opacity, transition: 'opacity 0.1s linear' }}>
			{word.text}{' '}
		</span>
	);
};

// Helper component to render a sentence
const Subtitles: React.FC<{ words: Word[] }> = ({ words }) => {
	const textStyle: React.CSSProperties = {
		fontFamily: 'Arial, Helvetica, sans-serif',
		fontSize: 80,
		fontWeight: 'bold',
		color: 'white',
		textAlign: 'center',
		position: 'absolute',
		bottom: 200,
		width: '100%',
		textShadow: '0px 0px 20px rgba(0,0,0,0.7)',
		padding: '0 5%',
	};

	return (
		<div style={textStyle}>
			{words.map((word, i) => (
				<WordComponent key={i} word={word} />
			))}
		</div>
	);
};

// Parallax Image Component
const ParallaxImage: React.FC<{
	src: string;
	speed: number;
	zoom: number;
	panX?: number;
	panY?: number;
	opacity?: number;
	rotate?: number;
}> = ({ src, speed, zoom, panX = 0, panY = 0, opacity = 1, rotate=0 }) => {
	const frame = useCurrentFrame();
	const moveY = frame * speed;
	const transform = `scale(${zoom}) translateX(${panX}px) translateY(${moveY + panY}px) rotate(${rotate}deg)`;
	const imageStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform,
		opacity,
	};
	return <Img src={staticFile(src)} style={imageStyle} />;
};

// --- SCENES ---

const Scene1: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	
	const cameraZoom = interpolate(frame, [0, durationInFrames], [1.1, 1.3]);
	const cashCowOpacity = interpolate(frame, [60, 90], [0, 1]);
	const mapOpacity = interpolate(frame, [90, 120], [0, 1]);

	return (
		<AbsoluteFill>
			<ParallaxImage src="images/old-paper-texture.jpg" speed={-0.1} zoom={cameraZoom} />
			<AbsoluteFill style={{opacity: cashCowOpacity}}>
				<ParallaxImage src="images/golden-cow.png" speed={0.2} zoom={cameraZoom * 1.2} panY={100} />
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: mapOpacity}}>
				<ParallaxImage src="images/old-map.jpg" speed={0.1} zoom={cameraZoom * 1.1} />
				<ParallaxImage src="images/army-pieces.png" speed={0.3} zoom={cameraZoom * 1.3} panY={-50} />
			</AbsoluteFill>
			<Subtitles words={transcript.slice(0, 10)} />
		</AbsoluteFill>
	);
};

const Scene2: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const progress = frame / durationInFrames;
	const springProgress = spring({ frame, fps: 30, config: { damping: 100 } });

	const cameraZoom = interpolate(progress, [0, 1], [1.5, 1]);
	const textOpacity = springProgress;
	const textScale = interpolate(springProgress, [0, 1], [0.5, 1]);

	const textStyle: React.CSSProperties = {
		fontSize: 400,
		fontWeight: 'bold',
		color: '#00d9ff',
		textShadow: '0 0 50px #00d9ff, 0 0 20px white',
		opacity: textOpacity,
		transform: `scale(${textScale})`,
	};

	return (
		<AbsoluteFill style={{ backgroundColor: '#050a14' }}>
			<ParallaxImage src="images/tech-background.jpg" speed={0.1} zoom={cameraZoom} opacity={0.5}/>
			<AbsoluteFill className="items-center justify-center">
				<h1 style={textStyle}>2017</h1>
			</AbsoluteFill>
			<Subtitles words={transcript.slice(10, 14)} />
		</AbsoluteFill>
	);
};

const Scene3: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	
	const cameraZoom = interpolate(frame, [0, durationInFrames], [1.3, 1]);
	const monsterOpacity = interpolate(frame, [15, durationInFrames], [0, 0.8]);
	const monsterScale = interpolate(frame, [0, durationInFrames], [1, 1.2]);

	return (
		<AbsoluteFill>
			<ParallaxImage src="images/stormy-sky.jpg" speed={-0.1} zoom={cameraZoom} />
			<AbsoluteFill className="items-center justify-center">
				<div style={{transform: `scale(${monsterScale})`, opacity: monsterOpacity}}>
					<ParallaxImage src="images/monster-silhouette.png" speed={0.1} zoom={1.5} />
				</div>
				<ParallaxImage src="images/aws-logo.png" speed={0.2} zoom={0.8} />
			</AbsoluteFill>
			<Subtitles words={transcript.slice(14, 18)} />
		</AbsoluteFill>
	);
};

const Scene4: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const cameraPanX = interpolate(frame, [0, durationInFrames], [-100, 100]);
	const billTranslateY = interpolate(frame, [0, durationInFrames], [0, -200]);
	const billOpacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0]);

	return (
		<AbsoluteFill>
			<ParallaxImage src="images/factory-interior.jpg" speed={0} zoom={1.2} panX={cameraPanX} />
			<AbsoluteFill className="items-center justify-center">
				<ParallaxImage src="images/printing-press.png" speed={0.1} zoom={1.3} panX={cameraPanX / 2} />
				<div style={{ transform: `translateY(${billTranslateY}px)`, opacity: billOpacity }}>
					<ParallaxImage src="images/aws-dollar-bills.png" speed={0.3} zoom={1.3} panX={cameraPanX / 2} />
				</div>
			</AbsoluteFill>
			<Subtitles words={transcript.slice(18, 24)} />
		</AbsoluteFill>
	);
};

const Scene5: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const progress = interpolate(frame, [0, durationInFrames - 30], [0, 1], { extrapolateRight: 'clamp' });
	
	const counter = Math.floor(interpolate(progress, [0, 1], [0, 17]));
	const counterDecimal = interpolate(progress, [0.8, 1], [0, 9]);

	const numberStyle: React.CSSProperties = {
		fontSize: 400,
		fontWeight: 'bold',
		color: 'white',
		fontFamily: 'monospace'
	};
	const textStyle: React.CSSProperties = { ...numberStyle, fontSize: 200 };

	return (
		<AbsoluteFill style={{ backgroundColor: '#111' }}>
			<ParallaxImage src="images/corporate-background.jpg" speed={-0.05} zoom={1.1} opacity={0.3} />
			<AbsoluteFill className="items-center justify-center">
				<div style={{textAlign: 'center'}}>
					<p style={numberStyle}>${counter}<span style={{opacity: counter > 16 ? 1 : 0}}>.{Math.floor(counterDecimal)}</span> Billion</p>
					<p style={textStyle}>Revenue</p>
				</div>
			</AbsoluteFill>
			<Subtitles words={transcript.slice(24, 35)} />
		</AbsoluteFill>
	);
};

const Scene6: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const progress = spring({ frame, fps: 30, config: { stiffness: 50 }});

	const rotate = interpolate(progress, [0, 1], [-5, 5]);
	const awsScale = interpolate(progress, [0, 1], [0.5, 1]);
	const retailScale = interpolate(progress, [0, 1], [1, 0.5]);

	const containerStyle: React.CSSProperties = {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		width: '100%',
		transform: `rotate(${rotate}deg) scale(1.1)`
	};

	return (
		<AbsoluteFill style={{backgroundColor: '#1a1a1a'}}>
			<AbsoluteFill className="items-center justify-center">
				<div style={containerStyle}>
					<div style={{textAlign: 'center', transform: `scale(${retailScale})`}}>
						<Img src={staticFile('images/coins.png')} style={{height: 300}} />
						<h2 style={{color: 'grey', fontSize: 80}}>Low Margin Retail</h2>
					</div>
					<div style={{textAlign: 'center', transform: `scale(${awsScale})`}}>
						<Img src={staticFile('images/gold-bars.png')} style={{height: 600, filter: 'drop-shadow(0 0 30px yellow)'}} />
						<h2 style={{color: 'white', fontSize: 100}}>AWS Profit</h2>
					</div>
				</div>
			</AbsoluteFill>
			<Subtitles words={transcript.slice(35, 47)} />
		</AbsoluteFill>
	);
};

const Scene7: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const zoom = interpolate(frame, [0, durationInFrames], [1, 1.1]);
	const lightRayRotation = frame * 0.1;

	return (
		<AbsoluteFill>
			<ParallaxImage src="images/heavenly-light-background.jpg" speed={0.05} zoom={zoom} />
			<ParallaxImage src="images/light-rays.png" speed={0} zoom={1.5} opacity={0.5} rotate={lightRayRotation} />
			<AbsoluteFill className="items-center justify-center">
				<Img src={staticFile('images/golden-cow.png')} style={{ transform: `scale(${zoom * 1.1})`, filter: 'drop-shadow(0 0 50px #fff700)'}} />
			</AbsoluteFill>
			<Subtitles words={transcript.slice(47, 52)} />
		</AbsoluteFill>
	);
};

const Scene8: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const zoom = interpolate(frame, [0, durationInFrames], [1.2, 1]);

	return (
		<AbsoluteFill>
			<ParallaxImage src="images/city-at-night.jpg" speed={-0.1} zoom={zoom} opacity={0.8} />
			<AbsoluteFill className="items-center justify-center">
				<Img src={staticFile('images/ceo-silhouette.png')} style={{height: '90%', filter: 'drop-shadow(0 0 30px black)'}}/>
			</AbsoluteFill>
			<Subtitles words={transcript.slice(52, 61)} />
		</AbsoluteFill>
	);
};

const Scene9: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	
	const panX = interpolate(frame, [0, durationInFrames], [videoWidth / 3, -videoWidth / 3]);
	const highlightWarchest = interpolate(frame, [durationInFrames * 0.6, durationInFrames], [1, 1.2]);

	const sceneContainerStyle: React.CSSProperties = {
		display: 'flex',
		width: `${300}%`,
		height: '100%',
		transform: `translateX(${panX}px)`,
	};

	const panelStyle: React.CSSProperties = {
		width: `${100/3}%`,
		height: '100%',
		position: 'relative',
		overflow: 'hidden',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
		color: 'white',
		fontSize: 100,
		textAlign: 'center'
	};

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<div style={sceneContainerStyle}>
				<div style={panelStyle}><Img src={staticFile('images/shareholders.jpg')} style={{position: 'absolute', width:'100%', height: '100%', objectFit: 'cover', opacity: 0.5}}/>Shareholders</div>
				<div style={panelStyle}><Img src={staticFile('images/vault.jpg')} style={{position: 'absolute', width:'100%', height: '100%', objectFit: 'cover', opacity: 0.5}}/>Play It Safe</div>
				<div style={panelStyle}><Img src={staticFile('images/war-chest.png')} style={{position: 'absolute', width:'100%', height: '100%', objectFit: 'cover', opacity: 0.8, transform: `scale(${highlightWarchest})`}}/>Invade</div>
			</div>
			<Subtitles words={transcript.slice(61, 84)} />
		</AbsoluteFill>
	);
};

const Scene10: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const springIn = spring({ frame, fps: 30, config: { stiffness: 100 } });
	const scale = interpolate(springIn, [0, 1], [3, 1]);
	const rotate = interpolate(springIn, [0, 1], [10, 0]);

	const containerTransform = `scale(${scale}) rotate(${rotate}deg)`;

	return (
		<AbsoluteFill>
			<ParallaxImage src="images/newspaper-background.jpg" speed={0} zoom={1.5} opacity={0.5} />
			<AbsoluteFill className="items-center justify-center" style={{transform: containerTransform}}>
				<Img src={staticFile('images/amazon-logo.png')} style={{ width: 600, marginBottom: 20 }} />
				<Img src={staticFile('images/whole-foods-logo.png')} style={{ width: 800, marginBottom: 20 }} />
				<h1 style={{fontFamily: 'Times New Roman', fontSize: 200, color: '#232323'}}>ACQUIRED FOR $13.7 BILLION</h1>
			</AbsoluteFill>
			<Subtitles words={transcript.slice(84, 99)} />
		</AbsoluteFill>
	);
};

const Scene11: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	
	const zoom = interpolate(frame, [0, durationInFrames], [1, 1.3]);
	const rotation = frame * 0.1;

	return (
		<AbsoluteFill>
			<ParallaxImage src="images/starburst-background.jpg" speed={0} zoom={1.5} rotate={-rotation} />
			<AbsoluteFill className="items-center justify-center">
				<Img src={staticFile('images/earth.png')} style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}/>
			</AbsoluteFill>
			<Subtitles words={transcript.slice(99, 105)} />
		</AbsoluteFill>
	);
};

const Scene12: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const progress = frame / durationInFrames;

	const cartX = interpolate(progress, [0, 1], [-videoWidth / 2, videoWidth / 2]);
	const zoom = interpolate(progress, [0.8, 1], [1, 1.1]);
	const shake = Math.sin(frame * 2) * interpolate(progress, [0.8, 1], [0, 10]);

	const cameraTransform = `scale(${zoom}) translateX(${shake}px)`;

	return (
		<AbsoluteFill>
			<div style={{transform: cameraTransform}}>
				<ParallaxImage src="images/grocery-store-front.jpg" speed={0} zoom={1.2} />
				<AbsoluteFill className="items-center justify-center">
					<div style={{ transform: `translateX(${cartX}px)`}}>
						<Img src={staticFile('images/ecommerce-crown.png')} style={{position: 'absolute', top: -150, left: 50, width: 200, transform: 'rotate(-20deg)'}}/>
						<Img src={staticFile('images/shopping-cart.png')} style={{width: 400}}/>
					</div>
				</AbsoluteFill>
			</div>
			<Subtitles words={transcript.slice(105, 118)} />
		</AbsoluteFill>
	);
};

const Scene13: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const progress = interpolate(frame, [15, durationInFrames], [0, 1], { extrapolateLeft: 'clamp' });

	const line1Y = interpolate(progress, [0, 1], [0, 400], { easing: Easing.bezier(.14,.84,.44,1) });
	const line2Y = interpolate(progress, [0.2, 1], [0, 450], { easing: Easing.bezier(.14,.84,.44,1) });

	const lineStyle: React.CSSProperties = {
		position: 'absolute',
		left: '50%',
		width: 8,
		backgroundColor: '#ff4136'
	};

	return (
		<AbsoluteFill>
			<ParallaxImage src="images/stock-market-background.jpg" speed={-0.1} zoom={1.1} opacity={0.7}/>
			<AbsoluteFill className="items-center justify-center flex-row" style={{gap: 300}}>
				<Img src={staticFile('images/kroger-logo.png')} style={{width: 400, position: 'absolute', top: 300, left: '20%'}} />
				<Img src={staticFile('images/costco-logo.png')} style={{width: 400, position: 'absolute', top: 300, right: '20%'}} />
			</AbsoluteFill>
			<div style={{...lineStyle, height: line1Y, transform: 'translateX(-600px)', top: 500}}></div>
			<div style={{...lineStyle, height: line2Y, transform: 'translateX(600px)', top: 500}}></div>
			<Subtitles words={transcript.slice(118, 134)} />
		</AbsoluteFill>
	);
};

const Scene14: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const progress = spring({ frame, fps: 30, config: { stiffness: 40 }});

	const lostScale = interpolate(progress, [0, 1], [0.5, 1.2]);
	const paidScale = interpolate(progress, [0, 1], [1.5, 1]);

	return (
		<AbsoluteFill style={{backgroundColor: '#111'}} className="items-center justify-center flex-row" >
			<div style={{textAlign: 'center', margin: 100}}>
				<h2 style={{fontSize: 100, color: '#ccc'}}>Amazon Paid</h2>
				<Img src={staticFile('images/money-bags.png')} style={{width: 500, transform: `scale(${paidScale})`}}/>
				<h3 style={{fontSize: 120, color: 'white'}}>$13.7 Billion</h3>
			</div>
			<div style={{textAlign: 'center', margin: 100}}>
				<h2 style={{fontSize: 100, color: '#ff4136'}}>Market Value Lost</h2>
				<Img src={staticFile('images/money-bags.png')} style={{width: 500, transform: `scale(${lostScale})`}}/>
				<h3 style={{fontSize: 120, color: '#ff4136'}}>&gt; $13.7 Billion</h3>
			</div>
			<Subtitles words={transcript.slice(134, 147)} />
		</AbsoluteFill>
	);
};

const Scene15: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const panX = interpolate(frame, [0, durationInFrames], [0, -videoWidth]);
	const glowProgress = Math.sin(frame * 0.1) * 0.5 + 0.5;

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<div style={{display: 'flex', width: '200%', height: '100%', transform: `translateX(${panX}px)`}}>
				<AbsoluteFill style={{left: 0, width: '50%'}} className="items-center justify-center">
					<Img src={staticFile('images/futuristic-engine.png')} style={{width: '80%', filter: `drop-shadow(0 0 ${glowProgress * 50}px #00d9ff)`}} />
				</AbsoluteFill>
				<AbsoluteFill style={{left: '50%', width: '50%'}} className="items-center justify-center">
					<ParallaxImage src="images/old-farm-store.jpg" speed={0} zoom={1.1} />
					<Img src={staticFile('images/milk-and-eggs.png')} style={{width: 400, position: 'absolute'}}/>
				</AbsoluteFill>
			</div>
			<Subtitles words={transcript.slice(147, 169)} />
		</AbsoluteFill>
	);
};

const Scene16: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const progress = spring({ frame, fps: 30, config: { stiffness: 100, damping: 20 }});

	const rocketY = interpolate(progress, [0, 1], [-200, 100]);
	const rocketScale = interpolate(progress, [0, 1], [0.5, 1]);
	const rocketOpacity = progress;
	const kingRotate = interpolate(progress, [0.5, 1], [0, -90], {extrapolateLeft: 'clamp'});

	return (
		<AbsoluteFill>
			<ParallaxImage src="images/chessboard.jpg" speed={-0.05} zoom={1.3} />
			<AbsoluteFill className="items-center justify-center">
				<div style={{position: 'absolute', transform: 'translateX(200px)'}}>
					<Img src={staticFile('images/king-piece.png')} style={{height: 400, transform: `rotate(${kingRotate}deg)`, transformOrigin: 'bottom center'}}/>
				</div>
				<div style={{transform: `translateY(${rocketY}px) scale(${rocketScale})`, opacity: rocketOpacity, transformOrigin: 'bottom center'}}>
					<Img src={staticFile('images/rocket-piece.png')} style={{height: 500}}/>
				</div>
			</AbsoluteFill>
			<Subtitles words={transcript.slice(169, 175)} />
		</AbsoluteFill>
	);
};

// --- MAIN COMPONENT ---

export const RemotionVideo: React.FC = () => {
	return (
		<>
			<Sequence from={0} durationInFrames={140}>
				<Scene1 />
			</Sequence>
			<Sequence from={140} durationInFrames={70}>
				<Scene2 />
			</Sequence>
			<Sequence from={210} durationInFrames={70}>
				<Scene3 />
			</Sequence>
			<Sequence from={280} durationInFrames={60}>
				<Scene4 />
			</Sequence>
			<Sequence from={340} durationInFrames={180}>
				<Scene5 />
			</Sequence>
			<Sequence from={520} durationInFrames={160}>
				<Scene6 />
			</Sequence>
			<Sequence from={680} durationInFrames={60}>
				<Scene7 />
			</Sequence>
			<Sequence from={740} durationInFrames={70}>
				<Scene8 />
			</Sequence>
			<Sequence from={810} durationInFrames={240}>
				<Scene9 />
			</Sequence>
			<Sequence from={1050} durationInFrames={220}>
				<Scene10 />
			</Sequence>
			<Sequence from={1270} durationInFrames={100}>
				<Scene11 />
			</Sequence>
			<Sequence from={1370} durationInFrames={130}>
				<Scene12 />
			</Sequence>
			<Sequence from={1500} durationInFrames={180}>
				<Scene13 />
			</Sequence>
			<Sequence from={1680} durationInFrames={180}>
				<Scene14 />
			</Sequence>
			<Sequence from={1860} durationInFrames={270}>
				<Scene15 />
			</Sequence>
			<Sequence from={2130} durationInFrames={70}>
				<Scene16 />
			</Sequence>
			<Audio src={audioUrl} />
		</>
	);
};

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="StorytellingVideo"
			component={RemotionVideo}
			durationInFrames={videoDurationInFrames}
			fps={30}
			width={videoWidth}
			height={videoHeight}
		/>
	);
};
```