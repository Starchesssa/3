```typescript
import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	spring,
	Img,
	staticFile,
	useAudioData,
} from 'remotion';

// Helper function to convert time in seconds to frames
const T = (seconds: number, fps: number) => seconds * fps;

// --- Helper Components ---

// Component for a single word with staggered fade-in
const AnimatedWord: React.FC<{
	text: string;
	startFrame: number;
	delay: number;
}> = ({text, startFrame, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const opacity = spring({
		frame: frame - delay,
		from: 0,
		to: 1,
		fps,
		durationInFrames: 30,
	});

	const y = interpolate(frame - delay, [0, 20], [10, 0], {
		extrapolateRight: 'clamp',
	});

	return (
		<span style={{opacity, transform: `translateY(${y}px)`, display: 'inline-block', marginLeft: '0.25em', marginRight: '0.25em'}}>
			{text}
		</span>
	);
};

// Component for a sentence that fades in/out word by word
const TextSequence: React.FC<{
	text: string;
	start: number;
	end: number;
}> = ({text, start, end}) => {
	const {fps} = useVideoConfig();
	const words = text.split(' ');

	const sequenceStartFrame = T(start, fps);
	const sequenceEndFrame = T(end, fps);

	const frame = useCurrentFrame();

	const overallOpacity = interpolate(
		frame,
		[sequenceStartFrame, sequenceStartFrame + fps, sequenceEndFrame - fps, sequenceEndFrame],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				textAlign: 'center',
				opacity: overallOpacity,
			}}
		>
			<h1
				style={{
					fontFamily: 'Helvetica, Arial, sans-serif',
					fontSize: '6rem',
					fontWeight: 'bold',
					color: 'white',
					textShadow: '0 0 20px rgba(255, 255, 255, 0.6)',
					padding: '0 5%',
				}}
			>
				{words.map((word, i) => (
					<AnimatedWord
						key={word + i}
						text={word}
						startFrame={sequenceStartFrame}
						delay={i * 5}
					/>
				))}
			</h1>
		</AbsoluteFill>
	);
};


// Component for a parallax image that fades in/out
const ParallaxImage: React.FC<{
	src: string;
	start: number;
	end: number;
	style?: React.CSSProperties;
}> = ({src, start, end, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const startFrame = T(start, fps);
	const endFrame = T(end, fps);

	const opacity = interpolate(
		frame,
		[startFrame, startFrame + fps, endFrame - fps, endFrame],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	return (
		<Img
			src={staticFile(src)}
			style={{
				position: 'absolute',
				width: '100%',
				height: '100%',
				objectFit: 'cover',
				opacity,
				...style,
			}}
		/>
	);
};


// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	
	const audioData = useAudioData(staticFile('BOOKS/Temp/TTS/Lesson_6.wav'));
    if (!audioData) {
        return null;
    }
	const durationInFrames = Math.floor(audioData.durationInSeconds * fps);

	// --- Cinematic Camera & Parallax ---
	const zoom = interpolate(frame, [0, durationInFrames], [1, 1.25]);
	const panX = interpolate(frame, [0, durationInFrames], [-100, 100]);

	const bgPanX = interpolate(frame, [0, durationInFrames], [20, -20]);
	const midPanX = interpolate(frame, [0, durationInFrames], [-50, 50]);
	const fgPanX = interpolate(frame, [0, durationInFrames], [-150, 150]);
	const fgOpacity = interpolate(frame, [0, fps*2, durationInFrames - fps*2, durationInFrames], [0, 0.2, 0.2, 0]);

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<AbsoluteFill
				style={{
					transform: `scale(${zoom}) translateX(${panX}px)`,
				}}
			>
				{/* Parallax Layers */}
				<AbsoluteFill style={{transform: `translateX(${bgPanX}px)`}}>
					<Sequence from={T(0, fps)} durationInFrames={T(12, fps)}>
						<ParallaxImage src="assets/images/data_center.jpg" start={0} end={12} style={{opacity: 0.3}}/>
					</Sequence>
					<Sequence from={T(12, fps)} durationInFrames={T(23, fps)}>
						<ParallaxImage src="assets/images/stock_chart_up.jpg" start={12} end={35} style={{opacity: 0.4}}/>
					</Sequence>
					<Sequence from={T(35, fps)} durationInFrames={T(26, fps)}>
						<ParallaxImage src="assets/images/newspaper_headlines.jpg" start={35} end={61} style={{opacity: 0.2}}/>
					</Sequence>
					<Sequence from={T(61, fps)}>
						<ParallaxImage src="assets/images/server_racks_glow.jpg" start={61} end={73} style={{opacity: 0.4}}/>
					</Sequence>
				</AbsoluteFill>

				<AbsoluteFill style={{transform: `translateX(${midPanX}px)`}}>
					<ParallaxImage src="assets/images/cash_cow.jpg" start={2} end={10} style={{opacity: 0.6, objectFit: 'contain', height: '80%', top: '10%'}} />
					<ParallaxImage src="assets/images/aws_logo.jpg" start={6} end={24} style={{opacity: 0.8, objectFit: 'contain', height: '50%', top: '25%'}} />
					<ParallaxImage src="assets/images/war_chest.jpg" start={28} end={38} style={{opacity: 0.7, objectFit: 'contain', height: '70%', top: '15%'}}/>
					<ParallaxImage src="assets/images/amazon_whole_foods.jpg" start={37} end={50} style={{opacity: 1, objectFit: 'contain', height: '60%', top: '20%'}}/>
					<ParallaxImage src="assets/images/stock_chart_down.jpg" start={50} end={62} style={{opacity: 0.9, objectFit: 'contain'}}/>
					<ParallaxImage src="assets/images/grocery_aisle.jpg" start={63} end={73} style={{opacity: 0.5}}/>
				</AbsoluteFill>

				{/* Text Layer */}
				<AbsoluteFill>
					<TextSequence text="Key lesson." start={0.0} end={1.5} />
					<TextSequence text="Use your cash cow to invade new territories." start={1.5} end={5.0} />
					<TextSequence text="It is now 2017." start={5.02} end={7.1} />
					<TextSequence text="AWS is a monster." start={7.18} end={9.3} />
					<TextSequence text="a money printing machine." start={9.38} end={11.8} />
					<TextSequence text="AWS would generate over $17 billion in revenue." start={11.82} end={17.9} />
					<TextSequence text="incredibly profitable." start={18.12} end={23.0} />
					<TextSequence text="It was a cash cow." start={23.06} end={24.7} />
					<TextSequence text="What do you do with all that cash?" start={24.74} end={27.1} />
					<TextSequence text="You could play it safe," start={27.18} end={31.1} />
					<TextSequence text="or use it as a war chest to attack a completely new industry." start={31.14} end={35.6} />
					<TextSequence text="Amazon announced it was buying Whole Foods for $13.7 billion." start={35.68} end={43.1} />
					<TextSequence text="In cash." start={43.12} end={44.4} />
					<TextSequence text="The world was stunned." start={44.42} end={46.1} />
					<TextSequence text="The king of e-commerce was buying a brick and mortar grocery chain." start={46.16} end={50.0} />
					<TextSequence text="Competing grocery stocks plummeted." start={50.04} end={56.0} />
					<TextSequence text="They lost more in market value than the $13.7 billion Amazon paid." start={56.08} end={62.0} />
					<TextSequence text="Using the high-profit engine of AWS to fund an invasion" start={62.10} end={67.9} />
					<TextSequence text="into the old-world business of selling milk and eggs." start={67.96} end={70.8} />
					<TextSequence text="They were playing a different game." start={70.84} end={73.0} />
				</AbsoluteFill>

				<AbsoluteFill style={{transform: `translateX(${fgPanX}px)`}}>
					<ParallaxImage src="assets/images/key.jpg" start={0.5} end={4.5} style={{opacity: 0.5, objectFit: 'contain', height: '60%', width: 'auto', left: '10%', top: '20%'}}/>
					<ParallaxImage src="assets/images/dollar_bills.jpg" start={9} end={20} style={{opacity: 0.3, mixBlendMode: 'screen'}}/>
					<ParallaxImage src="assets/images/chess_piece.jpg" start={68} end={73} style={{opacity: 0.8, objectFit: 'contain', height: '80%', left: '55%', top: '10%'}}/>
				</AbsoluteFill>
				
				{/* Artistic Overlays */}
				<AbsoluteFill
					style={{
						backgroundImage: `url(${staticFile('assets/images/dust_particles.png')})`,
						backgroundSize: 'cover',
						opacity: fgOpacity,
						mixBlendMode: 'screen',
					}}
				/>
			</AbsoluteFill>

			{/* Vignette */}
			<AbsoluteFill
				style={{
					boxShadow: 'inset 0 0 200px rgba(0,0,0,0.9)',
				}}
			/>

			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_6.wav')} />
		</AbsoluteFill>
	);
};
```