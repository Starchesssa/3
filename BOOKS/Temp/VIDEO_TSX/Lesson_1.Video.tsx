```tsx
import {
	AbsoluteFill,
	Audio,
	Composition,
	Img,
	Sequence,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

// Helper to convert time in seconds to frames
const sec = (seconds: number) => Math.round(seconds * 30);

const Title = ({text, style}: {text: string; style: React.CSSProperties}) => {
	return (
		<h1
			style={{
				fontFamily: 'Helvetica, Arial, sans-serif',
				fontSize: '120px',
				fontWeight: 'bold',
				textAlign: 'center',
				color: 'white',
				textShadow: '0 0 20px rgba(0,0,0,0.7)',
				...style,
			}}
		>
			{text}
		</h1>
	);
};

export const RemotionVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	// --- Parallax Calculations ---
	const bgParallax = interpolate(frame, [0, durationInFrames], [1, 1.15]);
	const mgParallax = interpolate(frame, [0, durationInFrames], [0, -250]);
	const fgParallax = interpolate(frame, [0, durationInFrames], [0, -500]);
	
	const bgStyle = {transform: `scale(${bgParallax})`};
	const mgStyle = {transform: `translateX(${mgParallax}px) scale(1.1)`};
	const fgStyle = {transform: `translateX(${fgParallax}px) scale(1.2)`, opacity: 0.6};

	// --- Keyword Animation ---
	const createAnimation = (startFrame: number) => {
		const progress = spring({
			frame: frame - startFrame,
			fps,
			config: {stiffness: 100, damping: 20},
		});
		const scale = interpolate(progress, [0, 1], [0.8, 1]);
		const opacity = interpolate(progress, [0, 0.5, 1], [0, 1, 1]);
		return {transform: `scale(${scale})`, opacity};
	};

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_1.wav')} />

			{/* Parallax Layers */}
			<AbsoluteFill>
				<Img style={bgStyle} src={staticFile('assets/images/city_background.jpg')} />
				<Img style={mgStyle} src={staticFile('assets/images/buildings_midground.png')} />
				<Img style={fgStyle} src={staticFile('assets/images/data_overlay_foreground.png')} />
			</AbsoluteFill>

			{/* Animated Keywords */}
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<Sequence from={sec(1.48)} durationInFrames={sec(3.36)}>
					<Title text="long-term vision" style={createAnimation(sec(1.48))} />
				</Sequence>
				<Sequence from={sec(6.54)} durationInFrames={sec(3.74)}>
					<Title text="dot-com bubble" style={createAnimation(sec(6.54))} />
				</Sequence>
				<Sequence from={sec(14.28)} durationInFrames={sec(3.28)}>
					<Title text="Amazon" style={createAnimation(sec(14.28))} />
				</Sequence>
				<Sequence from={sec(25.96)} durationInFrames={sec(1.0)}>
					<Title text="lose money" style={createAnimation(sec(25.96))} />
				</Sequence>
				<Sequence from={sec(34.54)} durationInFrames={sec(1.5)}>
					<Title text="the everything store" style={createAnimation(sec(34.54))} />
				</Sequence>
				<Sequence from={sec(46.68)} durationInFrames={sec(2.5)}>
					<Title text="$100 a share" style={createAnimation(sec(46.68))} />
				</Sequence>
				<Sequence from={sec(66.04)} durationInFrames={sec(1.5)}>
					<Title text="insanity" style={createAnimation(sec(66.04))} />
				</Sequence>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
```