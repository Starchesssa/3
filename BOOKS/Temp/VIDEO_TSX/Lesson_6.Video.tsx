```typescript
import {
	AbsoluteFill,
	Audio,
	Composition,
	Img,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {interpolate, spring} from 'remotion';
import React from 'react';

const sentences = [
	{text: 'Key lesson.', start: 0, end: 1.5, keywords: ['lesson']},
	{text: 'Use your cash cow to invade new territories.', start: 1.5, end: 5.0, keywords: ['cash', 'cow', 'invade', 'territories']},
	{text: 'It is now 2017.', start: 5.0, end: 7.1, keywords: ['2017']},
	{text: 'AWS is a monster.', start: 7.1, end: 9.3, keywords: ['AWS', 'monster']},
	{text: 'It is a money printing machine.', start: 9.3, end: 11.8, keywords: ['money', 'printing', 'machine']},
	{text: 'In 2017 alone, AWS would generate over $17 billion in revenue.', start: 11.8, end: 17.9, keywords: ['AWS', '$17', 'billion', 'revenue']},
	{text: 'And unlike the low margin retail business, AWS was incredibly profitable.', start: 17.9, end: 23.0, keywords: ['incredibly', 'profitable']},
	{text: 'It was a cash cow.', start: 23.0, end: 24.7, keywords: ['cash', 'cow']},
	{text: 'So what do you do with all that cash?', start: 24.7, end: 27.1, keywords: ['cash']},
	{text: 'You could give it back to shareholders. You could play it safe,', start: 27.1, end: 30.7, keywords: ['shareholders']},
	{text: 'or you could use it as a war chest to attack a completely new industry.', start: 30.7, end: 35.6, keywords: ['war', 'chest', 'attack']},
	{text: 'On June 16, 2017, Amazon announced it was buying Whole Foods for $13.7 billion.', start: 35.6, end: 43.1, keywords: ['Amazon', 'announced', 'buying', '$13.7', 'billion']},
	{text: 'In cash, the world was stunned.', start: 43.1, end: 46.1, keywords: ['cash', 'stunned']},
	{text: 'The king of e-commerce was buying a brick and mortar grocery chain.', start: 46.1, end: 50.0, keywords: ['king', 'e-commerce', 'brick', 'mortar']},
	{text: 'On the day of the announcement, the stocks of competing grocery stores like Kroger and Costco plummeted.', start: 50.0, end: 56.0, keywords: ['stocks', 'plummeted']},
	{text: 'They lost more in market value that day than the $13.7 billion Amazon paid.', start: 56.0, end: 62.1, keywords: ['lost', 'market', 'value', '$13.7', 'billion']},
	{text: 'Amazon was using the high-tech, high-profit engine of AWS to fund an invasion into the old-world business of selling milk and eggs.', start: 62.1, end: 70.8, keywords: ['high-profit', 'AWS', 'invasion', 'old-world']},
	{text: 'They were playing a different game.', start: 70.8, end: 73.0, keywords: ['different', 'game']},
];

const VideoComponent: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const time = frame / fps;

	// --- Animation Calculations ---
	const progress = frame / durationInFrames;
	const bgTranslateX = interpolate(progress, [0, 1], [0, -300]);
	const midTranslateX = interpolate(progress, [0, 1], [0, -600]);
	const fgTranslateX = interpolate(progress, [0, 1], [0, -1200]);

	const currentSentence = sentences.find((s) => time >= s.start && time < s.end);
	const sentenceStartFrame = currentSentence ? currentSentence.start * fps : 0;
	const textOpacity = currentSentence ? interpolate(frame, [sentenceStartFrame, sentenceStartFrame + 15], [0, 1]) : 0;

	// Switch images halfway to add visual variety
	const sceneChangeFrame = 36 * fps; // Corresponds to the Amazon/Whole Foods announcement
	const bgImage = frame < sceneChangeFrame ? 'tech_city_background.jpg' : 'city-background.jpg';
	const midImage = frame < sceneChangeFrame ? 'server-racks-midground.png' : 'amazon_warehouse_midground.png';
	const fgImage = frame < sceneChangeFrame ? 'data_stream_foreground.png' : 'glowing_particles.png';

	// --- JSX Styles (Computed) ---
	const containerStyle: React.CSSProperties = { position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' };
	const textStyle: React.CSSProperties = { opacity: textOpacity, color: 'white', fontSize: 120, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Arial, Helvetica, sans-serif', textShadow: '0 0 20px black', padding: '0 10%' };

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_6.wav')} />
			<Img src={staticFile(bgImage)} style={{...containerStyle, transform: `translateX(${bgTranslateX}px)`, opacity: 0.5}} />
			<Img src={staticFile(midImage)} style={{...containerStyle, transform: `translateX(${midTranslateX}px)`}} />
			<Img src={staticFile(fgImage)} style={{...containerStyle, transform: `translateX(${fgTranslateX}px)`, opacity: 0.6, mixBlendMode: 'screen'}} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<p style={textStyle}>
					{currentSentence?.text.split(' ').map((word, i) => {
						const isKeyword = currentSentence.keywords.includes(word.replace(/[.,]/g, ''));
						const wordSpring = spring({frame: frame - sentenceStartFrame - i * 3, fps, config: {stiffness: 100, damping: 10}});
						
						const scale = isKeyword ? interpolate(wordSpring, [0, 1], [1.4, 1]) : 1;
						const translateY = isKeyword ? interpolate(wordSpring, [0, 1], [-15, 0]) : 0;
						const color = isKeyword ? '#FFFF00' : '#FFFFFF';
						const textShadow = isKeyword ? '0 0 15px #FFFF00' : '0 0 20px black';
						
						const wordStyle: React.CSSProperties = { display: 'inline-block', transform: `scale(${scale}) translateY(${translateY}px)`, color, textShadow, marginRight: '20px' };
						return (<span key={i} style={wordStyle}>{word}</span>);
					})}
				</p>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const RemotionVideo: React.FC = () => (
	<Composition
		id="RemotionVideo"
		component={VideoComponent}
		durationInFrames={2190} // 73 seconds at 30fps
		fps={30}
		width={3840}
		height={2160}
	/>
);
```