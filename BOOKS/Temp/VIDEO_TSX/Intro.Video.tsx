```tsx
import {
	AbsoluteFill,
	Audio,
	Composition,
	Sequence,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import React from 'react';

const ParallaxLayer: React.FC<{
	src: string;
	speed: number;
	z: number;
	isPng?: boolean;
}> = ({src, speed, z, isPng = false}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const progress = interpolate(frame, [0, durationInFrames], [0, 1]);
	const scale = 1 + progress * speed * 0.5;
	const translateY = progress * speed * -100;
	const imageStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		zIndex: z,
		transform: `scale(${scale}) translateY(${translateY}px)`,
	};

	return <img src={staticFile(src)} style={imageStyle} alt="" />;
};

const AnimatedWord: React.FC<{children: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, 15], [1, 1.15], {
		extrapolateRight: 'clamp',
	});
	const opacity = interpolate(frame, [0, 10], [0, 1]);

	const wordStyle: React.CSSProperties = {
		display: 'inline-block',
		transform: `scale(${scale})`,
		color: '#FFD700',
		opacity,
	};
	return <span style={wordStyle}>{children}</span>;
};

const textStyle: React.CSSProperties = {
	fontFamily: 'Helvetica, Arial, sans-serif',
	fontSize: '60px',
	fontWeight: 'bold',
	textAlign: 'center',
	color: 'white',
	textShadow: '0 0 10px rgba(0,0,0,0.7)',
	padding: '0 5%',
};

export const RemotionVideo: React.FC = () => {
	const {durationInFrames} = useVideoConfig();
	const opacity = interpolate(
		useCurrentFrame(),
		[0, 30, durationInFrames - 30, durationInFrames],
		[0, 1, 1, 0]
	);

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<ParallaxLayer src="images/sky-background.jpg" speed={0.1} z={1} />
			<ParallaxLayer src="images/gears-background.png" speed={0.2} z={2} isPng />
			<ParallaxLayer src="images/gears-midground.png" speed={0.5} z={3} isPng />
			<ParallaxLayer src="images/gears-foreground.png" speed={1} z={5} isPng />

			<AbsoluteFill style={{opacity, zIndex: 4}}>
				<Sequence from={0} durationInFrames={2 * 30}>
					<p style={textStyle}>
						They tell you to follow the <AnimatedWord>rules.</AnimatedWord>
					</p>
				</Sequence>
				<Sequence from={2 * 30} durationInFrames={5 * 30}>
					<p style={textStyle}>
						They tell you to build a business that makes sense on a{' '}
						<AnimatedWord>spreadsheet</AnimatedWord> from day one.
					</p>
				</Sequence>
				<Sequence from={7 * 30} durationInFrames={2.5 * 30}>
					<p style={textStyle}>
						They tell you to be <AnimatedWord>profitable.</AnimatedWord>
					</p>
				</Sequence>
				<Sequence from={9.5 * 30} durationInFrames={4 * 30}>
					<p style={textStyle}>
						This is the advice that creates small,{' '}
						<AnimatedWord>forgettable companies.</AnimatedWord>
					</p>
				</Sequence>
				<Sequence from={14 * 30} durationInFrames={3 * 30}>
					<p style={textStyle}>This is not the story of one of those companies.</p>
				</Sequence>
				<Sequence from={17 * 30} durationInFrames={6 * 30}>
					<p style={textStyle}>
						This is the story of a <AnimatedWord>system,</AnimatedWord> a{' '}
						<AnimatedWord>machine</AnimatedWord> built on a completely{' '}
						<AnimatedWord>different set of rules.</AnimatedWord>
					</p>
				</Sequence>
				<Sequence from={23 * 30}>
					<p style={textStyle}>
						A machine that <AnimatedWord>ate the world.</AnimatedWord>
					</p>
				</Sequence>
			</AbsoluteFill>
			<Audio src={staticFile('BOOKS/Temp/TTS/Intro.wav')} />
		</AbsoluteFill>
	);
};
```