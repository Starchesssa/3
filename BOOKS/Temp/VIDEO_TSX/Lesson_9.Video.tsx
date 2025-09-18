```tsx
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	Audio,
	Img,
	staticFile,
} from 'remotion';
import React from 'react';

const FADE_DURATION = 15; // in frames

const textStyle: React.CSSProperties = {
	fontFamily: 'Helvetica, Arial, sans-serif',
	fontSize: '80px',
	fontWeight: 'bold',
	textAlign: 'center',
	color: 'white',
	textShadow: '0 0 20px rgba(0,0,0,0.8)',
	padding: '0 100px',
};

// Helper component for animated text
const AnimatedText: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const opacity = interpolate(
		frame,
		[0, FADE_DURATION, durationInFrames - FADE_DURATION, durationInFrames],
		[0, 1, 1, 0]
	);

	const translateY = interpolate(
		frame,
		[0, FADE_DURATION],
		[20, 0],
		{extrapolateRight: 'clamp'}
	);

	const style = {
		...textStyle,
		opacity,
		transform: `translateY(${translateY}px)`,
	};

	return <h1 style={style}>{text}</h1>;
};

// Helper for scene transitions
const Scene: React.FC<{
	from: number;
	duration: number;
	children: React.ReactNode;
}> = ({from, duration, children}) => {
	return (
		<Sequence from={from} durationInFrames={duration}>
			{children}
		</Sequence>
	);
};

export const RemotionVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	const secToFrames = (sec: number) => Math.floor(sec * fps);

	// --- Scene 1: Growth is not a straight line (0s - 4.22s) ---
	const scene1Start = secToFrames(0);
	const scene1End = secToFrames(4.22);
	const scene1Progress = interpolate(
		frame,
		[scene1Start, scene1End],
		[0, 1],
		{extrapolateRight: 'clamp'}
	);
	const scene1Zoom = interpolate(scene1Progress, [0, 1], [1, 1.1]);
	const scene1PanX = interpolate(scene1Progress, [0, 1], [0, -100]);
	const scene1PanY = interpolate(scene1Progress, [0, 1], [0, 50]);

	// --- Scene 2: 2022 New Reality (4.22s - 10.82s) ---
	const scene2Start = secToFrames(4.22);
	const scene2End = secToFrames(10.82);
	const scene2Progress = interpolate(
		frame,
		[scene2Start, scene2End],
		[0, 1],
		{extrapolateRight: 'clamp'}
	);
	const scene2Zoom = interpolate(scene2Progress, [0, 1], [1.2, 1]);
	const scene2LightsOpacity = interpolate(scene2Progress, [0.4, 0.7], [0, 1], {
		extrapolateRight: 'clamp',
	});

	// --- Scene 3: Economic Hardship (10.82s - 17.60s) ---
	const scene3Start = secToFrames(10.82);
	const scene3End = secToFrames(17.60);
	const scene3Progress = interpolate(
		frame,
		[scene3Start, scene3End],
		[0, 1],
		{extrapolateRight: 'clamp'}
	);
	const scene3GraphY = interpolate(scene3Progress, [0.1, 0.8], [-1080, 0]);
	const scene3GraphOpacity = interpolate(scene3Progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
	const scene3BalloonScale = interpolate(scene3Progress, [0.7, 1], [1, 0.2]);
	const scene3BalloonOpacity = interpolate(scene3Progress, [0.7, 1], [1, 0]);

	// --- Scene 4: Amazon's Stock Drop (17.60s - 23.08s) ---
	const scene4Start = secToFrames(17.60);
	const scene4End = secToFrames(23.08);
	const scene4Progress = interpolate(
		frame,
		[scene4Start, scene4End],
		[0, 1],
		{extrapolateRight: 'clamp'}
	);
	const scene4DollyZoom = interpolate(scene4Progress, [0, 1], [2, 1]);
	const scene4ChartDrop = interpolate(scene4Progress, [0.2, 0.8], [0, -500]);
	const scene4TextOpacity = interpolate(scene4Progress, [0.4, 0.6], [0, 1]);


	// --- Scene 5: Overbuilt & Correction (23.08s - 29.98s) ---
	const scene5Start = secToFrames(23.08);
	const scene5End = secToFrames(29.98);
	const scene5Progress = interpolate(
		frame,
		[scene5Start, scene5End],
		[0, 1],
		{extrapolateRight: 'clamp'}
	);
	const scene5PanX = interpolate(scene5Progress, [0, 1], [-200, 200]);
	const scene5CrowdOpacity = interpolate(scene5Progress, [0.2, 0.4, 0.6, 0.8], [0, 1, 1, 0]);


	// --- Scene 6: Layoffs & Media (29.98s - 40.84s) ---
	const scene6Start = secToFrames(29.98);
	const scene6End = secToFrames(40.84);
	const scene6Progress = interpolate(
		frame,
		[scene6Start, scene6End],
		[0, 1],
		{extrapolateRight: 'clamp'}
	);
	const scene6NewspaperZ = interpolate(scene6Progress, [0, 0.7], [-1000, 2000]);
	const scene6NewspaperOpacity = interpolate(scene6Progress, [0, 0.1, 0.6, 0.7], [0, 1, 1, 0]);
	const scene6GearOpacity = interpolate(scene6Progress, [0.6, 0.9], [0, 0.5]);
	const scene6GearRotation = interpolate(scene6Progress, [0.6, 1], [0, 30]);

	// --- Scene 7: The Real Engine - AWS (40.84s - 53.42s) ---
	const scene7Start = secToFrames(40.84);
	const scene7End = secToFrames(53.42);
	const scene7Progress = interpolate(
		frame,
		[scene7Start, scene7End],
		[0, 1],
		{extrapolateRight: 'clamp'}
	);
	const scene7PanX = interpolate(scene7Progress, [0.2, 1], [0, -1920]);
	const scene7DataStreamOpacity = interpolate(scene7Progress, [0.6, 0.8], [0, 1]);


	// --- Scene 8: AWS Numbers (53.42s - 62.08s) ---
	const scene8Start = secToFrames(53.42);
	const scene8End = secToFrames(62.08);
	const scene8Progress = interpolate(
		frame,
		[scene8Start, scene8End],
		[0, 1],
		{extrapolateRight: 'clamp'}
	);
	const scene8Zoom = interpolate(scene8Progress, [0, 1], [1, 1.1]);


	// --- Scene 9: The Cash Cow (62.08s - 70.36s) ---
	const scene9Start = secToFrames(62.08);
	const scene9End = secToFrames(70.36);
	const scene9Progress = interpolate(
		frame,
		[scene9Start, scene9End],
		[0, 1],
		{extrapolateRight: 'clamp'}
	);
	const scene9LightOpacity = interpolate(scene9Progress, [0.5, 0.8], [0, 1]);
	const scene9Zoom = interpolate(scene9Progress, [0, 1], [1.15, 1]);


	// --- Scene 10: Resilience Machine (70.36s - 82.28s) ---
	const scene10Start = secToFrames(70.36);
	const scene10End = secToFrames(82.28);
	const scene10Progress = interpolate(
		frame,
		[scene10Start, scene10End],
		[0, 1],
		{extrapolateRight: 'clamp'}
	);
	const scene10AwsRotation = interpolate(scene10Progress, [0, 1], [0, 180]);
	const scene10RetailRotation = interpolate(scene10Progress, [0, 0.5, 1], [0, 20, 20]);
	const scene10AwsGlow = interpolate(scene10Progress, [0.5, 1], [0, 1]);
	const scene10RetailOpacity = interpolate(scene10Progress, [0.5, 0.8], [1, 0.3]);


	// --- Scene 11: The Battlefield (82.28s - end) ---
	const scene11Start = secToFrames(82.28);
	const scene11End = durationInFrames;
	const scene11Progress = interpolate(
		frame,
		[scene11Start, scene11End],
		[0, 1],
		{extrapolateRight: 'clamp'}
	);
	const scene11SunOpacity = interpolate(scene11Progress, [0.3, 0.6], [0, 1]);
	const scene11StormOpacity = interpolate(scene11Progress, [0.2, 0.5], [1, 0]);
	const scene11FortressZoom = interpolate(scene11Progress, [0, 1], [1, 1.15]);


	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_9.wav')} />

			{/* Scene 1: Growth is never a straight line */}
			<Scene from={scene1Start} duration={scene1End - scene1Start}>
				<AbsoluteFill
					style={{
						transform: `scale(${scene1Zoom}) translateX(${scene1PanX}px) translateY(${scene1PanY}px)`,
					}}
				>
					{/* assets/images/background-paper.jpg: A full-screen image of old, textured paper. */}
					<Img
						src={staticFile('assets/images/background-paper.jpg')}
						style={{width: '100%', height: '100%'}}
					/>
					{/* assets/images/winding-path.png: A transparent image of a dark, hand-drawn line that meanders across the screen. */}
					<Img
						src={staticFile('assets/images/winding-path.png')}
						style={{
							position: 'absolute',
							width: '80%',
							left: '10%',
							top: '40%',
							opacity: 0.7,
						}}
					/>
				</AbsoluteFill>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Sequence from={secToFrames(0.0)} durationInFrames={secToFrames(3.54)}>
						<AnimatedText text="Key lesson, growth is never a straight line." />
					</Sequence>
				</AbsoluteFill>
			</Scene>
			
			{/* Scene 2: 2022 New Reality */}
			<Scene from={scene2Start} duration={scene2End - scene2Start}>
				<AbsoluteFill
					style={{
						transform: `scale(${scene2Zoom})`,
					}}
				>
					{/* assets/images/city-skyline-dark.jpg: A moody, dark cityscape at dusk. */}
					<Img
						src={staticFile('assets/images/city-skyline-dark.jpg')}
						style={{width: '100%', height: '100%'}}
					/>
					{/* assets/images/city-lights-overlay.png: A transparent image with just bright window lights corresponding to the city skyline. */}
					<Img
						src={staticFile('assets/images/city-lights-overlay.png')}
						style={{
							position: 'absolute',
							width: '100%',
							height: '100%',
							opacity: scene2LightsOpacity,
						}}
					/>
				</AbsoluteFill>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Sequence from={0} durationInFrames={secToFrames(6.26 - 4.22)}>
						<AnimatedText text="Finally, we arrive at 2022." />
					</Sequence>
					<Sequence from={secToFrames(7.08 - 4.22)} durationInFrames={secToFrames(10.20 - 7.08)}>
						<AnimatedText text="The world is reopening, but there is a new reality." />
					</Sequence>
				</AbsoluteFill>
			</Scene>

			{/* Scene 3: Economic Hardship */}
			<Scene from={scene3Start} duration={scene3End - scene3Start}>
				{/* assets/images/dark-tech-background.jpg: A dark, abstract background with faint circuit board patterns. */}
				<Img src={staticFile('assets/images/dark-tech-background.jpg')} style={{width: '100%', height: '100%'}} />
				<AbsoluteFill>
					{/* assets/images/stock-graph-down.png: A transparent, glowing red line graph trending sharply downwards. */}
					<Img
						src={staticFile('assets/images/stock-graph-down.png')}
						style={{
							position: 'absolute',
							width: '100%',
							height: '100%',
							opacity: scene3GraphOpacity,
							transform: `translateY(${scene3GraphY}px)`,
						}}
					/>
					{/* assets/images/deflated-balloon.png: A transparent image of a single, sad, deflated party balloon. */}
					<Img
						src={staticFile('assets/images/deflated-balloon.png')}
						style={{
							position: 'absolute',
							width: '20%',
							left: '40%',
							top: '40%',
							opacity: scene3BalloonOpacity,
							transform: `scale(${scene3BalloonScale})`,
						}}
					/>
				</AbsoluteFill>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Sequence from={0} durationInFrames={secToFrames(14.62 - 10.82)}>
						<AnimatedText text="Inflation is high, the stock market is punishing tech companies." />
					</Sequence>
					<Sequence from={secToFrames(15.24 - 10.82)} durationInFrames={secToFrames(16.94 - 15.24)}>
						<AnimatedText text="The pandemic boom is over." />
					</Sequence>
				</AbsoluteFill>
			</Scene>
			
			{/* Scene 4: Amazon's Stock Drop */}
			<Scene from={scene4Start} duration={scene4End - scene4Start}>
				<AbsoluteFill
					style={{
						transform: `scale(${scene4DollyZoom})`,
					}}
				>
					{/* assets/images/office-building-generic.jpg: Photo of a modern, generic corporate office building exterior. */}
					<Img
						src={staticFile('assets/images/office-building-generic.jpg')}
						style={{width: '100%', height: '100%'}}
					/>
					{/* assets/images/amazon-stock-chart-2022.png: A simplified stock chart showing a 50% drop, on a transparent background. */}
					<Img
						src={staticFile('assets/images/amazon-stock-chart-2022.png')}
						style={{
							position: 'absolute',
							width: '80%',
							left: '10%',
							top: '50%',
							transform: `translateY(${scene4ChartDrop}px)`,
						}}
					/>
					<h1 style={{...textStyle, fontSize: 200, position: 'absolute', width: '100%', top: '25%', opacity: scene4TextOpacity, color: '#ff4136'}}>
						-50%
					</h1>
				</AbsoluteFill>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Sequence from={0} durationInFrames={secToFrames(22.56-17.60)}>
						<AnimatedText text="Amazon stock fell nearly 50% during 2022, a massive drop."/>
					</Sequence>
				</AbsoluteFill>
			</Scene>

			{/* Scene 5: Overbuilt & Correction */}
			<Scene from={scene5Start} duration={scene5End-scene5Start}>
				{/* assets/images/empty-warehouse-interior.jpg: A vast, empty, modern warehouse interior. */}
				<Img src={staticFile('assets/images/empty-warehouse-interior.jpg')} style={{
					width: '150%', 
					height: '100%',
					transform: `translateX(${scene5PanX}px)`
				}} />
				{/* assets/images/crowd-silhouettes.png: A transparent image with hundreds of black human silhouettes. */}
				<Img src={staticFile('assets/images/crowd-silhouettes.png')} style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					opacity: scene5CrowdOpacity
				}} />
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Sequence from={0} durationInFrames={secToFrames(27.56 - 23.08)}>
						<AnimatedText text="They had overbuilt, they had hired too many people during the pandemic frenzy." />
					</Sequence>
					<Sequence from={secToFrames(28.03-23.08)} durationInFrames={secToFrames(29.50 - 28.03)}>
						<AnimatedText text="Now they had to correct." />
					</Sequence>
				</AbsoluteFill>
			</Scene>
			
			{/* Scene 6: Layoffs & Media */}
			<Scene from={scene6Start} duration={scene6End-scene6Start}>
				{/* assets/images/dark-background.jpg: A simple, dark, textured background. */}
				<Img src={staticFile('assets/images/dark-background.jpg')} style={{width: '100%', height: '100%'}}/>
				<AbsoluteFill style={{perspective: 1000}}>
					{/* assets/images/glowing-gear.png: A single, large, subtly glowing gear on a transparent background. */}
					<Img src={staticFile('assets/images/glowing-gear.png')} style={{
						position: 'absolute',
						width: '50%',
						left: '25%',
						top: '25%',
						opacity: scene6GearOpacity,
						transform: `rotate(${scene6GearRotation}deg)`
					}}/>
					{/* assets/images/newspaper-headlines.png: A collage of newspaper clippings with negative headlines, on a transparent background. */}
					<Img src={staticFile('assets/images/newspaper-headlines.png')} style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						opacity: scene6NewspaperOpacity,
						transform: `translateZ(${scene6NewspaperZ}px)`
					}}/>
				</AbsoluteFill>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Sequence from={0} durationInFrames={secToFrames(35.00-29.98)}>
						<AnimatedText text="The company announced layoffs, eventually totalling over 27,000 employees." />
					</Sequence>
					<Sequence from={secToFrames(35.42-29.98)} durationInFrames={secToFrames(40.20-35.42)}>
						<AnimatedText text="The media wrote stories about Amazon's decline, but they were missing the point again." />
					</Sequence>
				</AbsoluteFill>
			</Scene>
			
			{/* Scene 7: The Real Engine - AWS */}
			<Scene from={scene7Start} duration={scene7End-scene7Start}>
				<AbsoluteFill style={{
					display: 'flex',
					flexDirection: 'row',
					width: '200%',
					transform: `translateX(${scene7PanX}px)`
				}}>
					{/* assets/images/stock-ticker-flicker.jpg: A blurry, chaotic image of a stock ticker screen. */}
					<Img src={staticFile('assets/images/stock-ticker-flicker.jpg')} style={{width: '50%', height: '100%'}}/>
					{/* assets/images/aws-server-network.jpg: A clean, bright, futuristic image of a server room with glowing blue lights. */}
					<Img src={staticFile('assets/images/aws-server-network.jpg')} style={{width: '50%', height: '100%'}}/>
				</AbsoluteFill>
				<AbsoluteFill>
					{/* assets/images/data-stream-overlay.png: Abstract animated lines/dots representing data flow, on a transparent background. */}
					<Img src={staticFile('assets/images/data-stream-overlay.png')} style={{width: '100%', height: '100%', opacity: scene7DataStreamOpacity}}/>
				</AbsoluteFill>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Sequence from={0} durationInFrames={secToFrames(43.56 - 40.84)}>
						<AnimatedText text="They were looking at the stock price, not the machine." />
					</Sequence>
					<Sequence from={secToFrames(44.26-40.84)} durationInFrames={secToFrames(48.84 - 44.26)}>
						<AnimatedText text="Yes, the e-commerce business was slowing down from its impossible pandemic highs." />
					</Sequence>
					<Sequence from={secToFrames(49.32-40.84)} durationInFrames={secToFrames(52.78-49.32)}>
						<AnimatedText text="But the real engine, AWS, was still growing." />
					</Sequence>
				</AbsoluteFill>
			</Scene>
			
			{/* Scene 8: AWS Numbers */}
			<Scene from={scene8Start} duration={scene8End-scene8Start}>
				{/* assets/images/blue-tech-background.jpg: A clean, abstract background with blue geometric shapes. */}
				<Img src={staticFile('assets/images/blue-tech-background.jpg')} style={{
					width: '100%', 
					height: '100%',
					transform: `scale(${scene8Zoom})`
				}}/>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Sequence from={0} durationInFrames={secToFrames(57.54 - 53.42)}>
						<AnimatedText text="AWS generated $80 billion in revenue in 2022." />
					</Sequence>
					<Sequence from={secToFrames(58.10 - 53.42)} durationInFrames={secToFrames(61.36-58.10)}>
						<AnimatedText text="Its operating income was $22.8 billion." />
					</Sequence>
				</AbsoluteFill>
			</Scene>
			
			{/* Scene 9: The Cash Cow */}
			<Scene from={scene9Start} duration={scene9End-scene9Start}>
				<AbsoluteFill style={{transform: `scale(${scene9Zoom})`}}>
					{/* assets/images/retail-warehouse-rain.jpg: A large retail warehouse under a dark, stormy, rainy sky. */}
					<Img src={staticFile('assets/images/retail-warehouse-rain.jpg')} style={{width: '100%', height: '100%'}}/>
					{/* assets/images/golden-light-beam.png: A transparent overlay of a golden beam of light shining down from above. */}
					<Img src={staticFile('assets/images/golden-light-beam.png')} style={{
						position: 'absolute',
						width: '100%', 
						height: '100%',
						opacity: scene9LightOpacity
					}}/>
				</AbsoluteFill>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Sequence from={0} durationInFrames={secToFrames(65.16-62.08)}>
						<AnimatedText text="The retail business actually lost money that year." />
					</Sequence>
					<Sequence from={secToFrames(65.74-62.08)} durationInFrames={secToFrames(69.70-65.74)}>
						<AnimatedText text="The cash cow was keeping the entire empire afloat during the storm." />
					</Sequence>
				</AbsoluteFill>
			</Scene>

			{/* Scene 10: Resilience Machine */}
			<Scene from={scene10Start} duration={scene10End-scene10Start}>
				{/* assets/images/machine-background.jpg: A background image of a machine blueprint or schematic. */}
				<Img src={staticFile('assets/images/machine-background.jpg')} style={{width: '100%', height: '100%', opacity: 0.5}}/>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					{/* assets/images/gear-aws.png: A single gear, brightly colored, on a transparent background. */}
					<Img src={staticFile('assets/images/gear-aws.png')} style={{
						position: 'absolute',
						width: '40%',
						left: '10%',
						transform: `rotate(${scene10AwsRotation}deg)`,
						filter: `drop-shadow(0 0 30px rgba(0, 150, 255, ${scene10AwsGlow}))`
					}}/>
					{/* assets/images/gear-retail.png: Another single gear, grayed out, on a transparent background. */}
					<Img src={staticFile('assets/images/gear-retail.png')} style={{
						position: 'absolute',
						width: '30%',
						left: '45%',
						top: '55%',
						transform: `rotate(-${scene10RetailRotation}deg)`,
						opacity: scene10RetailOpacity
					}}/>
				</AbsoluteFill>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Sequence from={secToFrames(70.36-scene10Start)} durationInFrames={secToFrames(71.84 - 70.36)}>
						<AnimatedText text="This is the final lesson." />
					</Sequence>
					<Sequence from={secToFrames(72.42-scene10Start)} durationInFrames={secToFrames(76.30 - 72.42)}>
						<AnimatedText text="The system is more resilient than any single year stock performance." />
					</Sequence>
					<Sequence from={secToFrames(76.86-scene10Start)} durationInFrames={secToFrames(81.68 - 76.86)}>
						<AnimatedText text="You build a diversified machine so that when one part is weak, another is strong." />
					</Sequence>
				</AbsoluteFill>
			</Scene>
			
			{/* Scene 11: The Battlefield */}
			<Scene from={scene11Start} duration={scene11End-scene11Start}>
				<AbsoluteFill style={{transform: `scale(${scene11FortressZoom})`}}>
					{/* assets/images/battlefield-sunny.jpg: A landscape after a battle, with a clear sky and rising sun. */}
					<Img src={staticFile('assets/images/battlefield-sunny.jpg')} style={{width: '100%', height: '100%'}}/>
					{/* assets/images/stormy-battlefield.jpg: The same battlefield but dark, rainy, and stormy. */}
					<Img src={staticFile('assets/images/stormy-battlefield.jpg')} style={{position: 'absolute', width: '100%', height: '100%', opacity: scene11StormOpacity}}/>
					{/* assets/images/fortress-amazon.png: A single, strong, modern fortress standing tall in the center, on a transparent background. */}
					<Img src={staticFile('assets/images/fortress-amazon.png')} style={{position: 'absolute', width: '100%', height: '100%'}}/>
					{/* assets/images/sun-rising-overlay.png: A lens flare/sun rising effect on a transparent background. */}
					<Img src={staticFile('assets/images/sun-rising-overlay.png')} style={{position: 'absolute', width: '100%', height: '100%', opacity: scene11SunOpacity}}/>
				</AbsoluteFill>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Sequence from={0} durationInFrames={secToFrames(87.30 - 82.28)}>
						<AnimatedText text="It is not about avoiding downturns. It is about building a business that can survive them." />
					</Sequence>
					<Sequence from={secToFrames(87.82-82.28)} durationInFrames={secToFrames(92.30-87.82)}>
						<AnimatedText text="And then, when the sun comes out again, you are the only one left on the battlefield." />
					</Sequence>
				</AbsoluteFill>
			</Scene>
			
		</AbsoluteFill>
	);
};
```