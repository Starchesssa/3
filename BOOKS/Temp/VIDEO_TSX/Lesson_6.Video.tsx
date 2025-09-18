```typescript
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

const audioSrc = staticFile('BOOKS/Temp/TTS/Lesson_6.wav');

const textStyle: React.CSSProperties = {
	fontFamily: 'Helvetica, Arial, sans-serif',
	fontSize: 120,
	fontWeight: 'bold',
	textAlign: 'center',
	color: 'white',
	textShadow: '0 0 30px rgba(0,0,0,0.8)',
};

const Keyword: React.FC<{children: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, 10, 20], [1, 1.2, 1]);
	const opacity = interpolate(frame, [0, 10], [0, 1]);
	const transform = `scale(${scale})`;
	return <span style={{transform, opacity, display: 'inline-block'}}>{children}</span>;
};

const Scene: React.FC<{from: number; duration: number; text: React.ReactNode}> = ({
	from,
	duration,
	text,
}) => {
	return (
		<Sequence from={from * 30} durationInFrames={duration * 30}>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div style={textStyle}>{text}</div>
			</AbsoluteFill>
		</Sequence>
	);
};

const Main = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const parallaxProgress = interpolate(frame, [0, durationInFrames], [0, 1]);
	const bgTranslate = parallaxProgress * -800;
	const mgTranslate = parallaxProgress * -1600;
	const fgTranslate = parallaxProgress * -3200;

	return (
		<AbsoluteFill style={{backgroundColor: '#111'}}>
			<AbsoluteFill>
				<img
					src={staticFile('images/tech_city_background.jpg')}
					style={{height: '100%', transform: `translateX(${bgTranslate}px)`}}
				/>
			</AbsoluteFill>
			<AbsoluteFill>
				<img
					src={staticFile('images/cloud_servers_midground.png')}
					style={{height: '100%', opacity: 0.7, transform: `translateX(${mgTranslate}px)`}}
				/>
			</AbsoluteFill>
			<AbsoluteFill>
				<img
					src={staticFile('images/data_stream_foreground.png')}
					style={{height: '100%', opacity: 0.5, transform: `translateX(${fgTranslate}px)`}}
				/>
			</AbsoluteFill>

			<Audio src={audioSrc} />

			<Scene from={1.5} duration={2.8} text={<>Use your <Keyword>cash cow</Keyword> to <Keyword>invade</Keyword></>} />
			<Scene from={7.1} duration={1.8} text={<><Keyword>AWS</Keyword> is a <Keyword>monster</Keyword></>} />
			<Scene from={9.6} duration={1.5} text={<><Keyword>money printing machine</Keyword></>} />
			<Scene from={14.6} duration={2.9} text={<>over <Keyword>$17 billion</Keyword></>} />
			<Scene from={31.5} duration={3.6} text={<>a <Keyword>war chest</Keyword> to <Keyword>attack</Keyword></>} />
			<Scene from={38.2} duration={4.1} text={<>buying <Keyword>Whole Foods</Keyword> for <Keyword>$13.7 billion</Keyword></>} />
			<Scene from={52.3} duration={3.5} text={<>competing grocery stores <Keyword>plummeted</Keyword></>} />
			<Scene from={66.7} duration={3.8} text={<><Keyword>invasion</Keyword> into selling <Keyword>milk and eggs</Keyword></>} />
		</AbsoluteFill>
	);
};

export const RemotionVideo: React.FC = () => (
	<Composition
		id="StorytellingVideo"
		component={Main}
		durationInFrames={2190}
		fps={30}
		width={3840}
		height={2160}
	/>
);
```