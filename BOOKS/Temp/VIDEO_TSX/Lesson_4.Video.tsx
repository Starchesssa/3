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
import { interpolate, spring, useSpring } from 'remotion';
import React from 'react';

const toF = (seconds: number, fps: number) => Math.floor(seconds * fps);

const sentenceStyle: React.CSSProperties = {
	fontFamily: 'Helvetica, Arial, sans-serif',
	fontSize: 80,
	fontWeight: 'bold',
	textAlign: 'center',
	color: 'white',
	textShadow: '0 0 20px rgba(0,0,0,0.7)',
};

// Helper for displaying text sentences with fade in/out
const TextSequence: React.FC<{
	from: number;
	durationInFrames: number;
	text: string;
}> = ({ from, durationInFrames, text }) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(
		frame,
		[from, from + 15, from + durationInFrames - 15, from + durationInFrames],
		[0, 1, 1, 0],
		{ extrapolateRight: 'clamp' }
	);

	const textContainerStyle: React.CSSProperties = {
		...sentenceStyle,
		opacity,
		padding: '0 10%',
	};

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				width: '100%',
				height: '100%',
			}}
		>
			<p style={textContainerStyle}>{text}</p>
		</div>
	);
};

export const RemotionVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames, width, height } = useVideoConfig();

	// --- SCENE 1: The Core Idea (0.00s - 4.48s) ---
	const scene1Start = 0;
	const scene1End = toF(4.48, fps);
	const scene1Duration = scene1End - scene1Start;

	const s1Progress = interpolate(
		frame,
		[scene1Start, scene1End],
		[0, 1],
		{ extrapolateRight: 'clamp' }
	);

	const s1CamZoom = spring({ frame, fps, from: 1, to: 1.1, durationInFrames: scene1Duration });
	const s1ExpenseOpacity = interpolate(s1Progress, [0.3, 0.4], [1, 0]);
	const s1ProductOpacity = interpolate(s1Progress, [0.7, 0.8], [0, 1]);
	const s1ExpenseY = interpolate(s1Progress, [0.3, 0.5], [0, -100]);
	const s1ProductY = interpolate(s1Progress, [0.6, 0.8], [100, 0]);
	
	// --- SCENE 2: Setting the Stage - 2006 (4.84s - 9.76s) ---
	const scene2Start = toF(4.84, fps);
	const scene2End = toF(9.76, fps);
	const scene2Duration = scene2End - scene2Start;
	const s2Progress = interpolate(frame, [scene2Start, scene2End], [0, 1], { extrapolateRight: 'clamp' });
	
	const s2CamPanX = interpolate(s2Progress, [0, 1], [150, -150]);
	const s2BgParallaxX = s2CamPanX * 0.3;
	const s2UiParallaxX = s2CamPanX * 1.2;

	// --- SCENE 3: The Hidden Problem (10.20s - 20.50s) ---
	const scene3Start = toF(10.20, fps);
	const scene3End = toF(20.50, fps);
	const scene3Duration = scene3End - scene3Start;
	const s3Progress = interpolate(frame, [scene3Start, scene3End], [0, 1], { extrapolateRight: 'clamp' });
	
	const s3DollyZoom = spring({ frame: frame - scene3Start, fps, from: 3, to: 1, durationInFrames: scene3Duration });
	const s3ServerOpacity = interpolate(s3Progress, [0.1, 0.4], [0, 1]);
	const s3LinesParallaxScale = s3DollyZoom * 1.5;
	const s3ServersParallaxScale = s3DollyZoom * 1.2;

	// --- SCENE 4: The Beast (21.00s - 30.58s) ---
	const scene4Start = toF(21.00, fps);
	const scene4End = toF(30.58, fps);
	const scene4Duration = scene4End - scene4Start;
	const s4Progress = interpolate(frame, [scene4Start, scene4End], [0, 1], { extrapolateRight: 'clamp' });
	
	const s4CamPanZ = interpolate(s4Progress, [0, 1], [0, -1000]);
	const s4FgTranslateZ = s4CamPanZ * 1.5;
	const s4MgTranslateZ = s4CamPanZ * 1;
	const s4BgTranslateZ = s4CamPanZ * 0.5;
	const s4GlowIntensity = 0.5 + Math.sin(frame / 5) * 0.5; // Pulsating glow

	// --- SCENE 5: The Two Views (31.14s - 38.48s) ---
	const scene5Start = toF(31.14, fps);
	const scene5End = toF(38.48, fps);
	const scene5Duration = scene5End - scene5Start;
	const s5Progress = interpolate(frame, [scene5Start, scene5End], [0, 1], { extrapolateRight: 'clamp' });

	const s5CostOpacity = interpolate(s5Progress, [0, 0.1, 0.6, 0.7], [0, 1, 1, 0]);
	const s5OppOpacity = interpolate(s5Progress, [0.6, 0.75], [0, 1]);
	const s5OppScale = spring({ frame: frame - toF(37.06, fps), fps, from: 1, to: 1.2, durationInFrames: 45 });

	// --- SCENE 6: The Epiphany (39.02s - 47.02s) ---
	const scene6Start = toF(39.02, fps);
	const scene6End = toF(47.02, fps);
	const scene6Duration = scene6End - scene6Start;
	const s6Progress = interpolate(frame, [scene6Start, scene6End], [0, 1], { extrapolateRight: 'clamp' });

	const s6CamPullback = interpolate(s6Progress, [0, 1], [0.8, 1.2]);
	const s6IconsOpacity = interpolate(s6Progress, [0.3, 0.5], [0, 1]);
	const s6LightOpacity = interpolate(s6Progress, [0, 0.2], [0, 1]);
	
	// --- SCENE 7: The Launch of AWS (47.42s - 57.28s) ---
	const scene7Start = toF(47.42, fps);
	const scene7End = toF(57.28, fps);
	const scene7Duration = scene7End - scene7Start;
	const s7Progress = interpolate(frame, [scene7Start, scene7End], [0, 1], { extrapolateRight: 'clamp' });

	const s7LogoScale = useSpring(s7Progress, { damping: 20, stiffness: 100 });
	const s7GlobeRotation = interpolate(s7Progress, [0, 1], [-20, 20]);
	const s7LinesOpacity = interpolate(s7Progress, [0.3, 0.5], [0, 1]);

	// --- SCENE 8: The Confusion (58.06s - 64.42s) ---
	const scene8Start = toF(58.06, fps);
	const scene8End = toF(64.42, fps);
	const scene8Duration = scene8End - scene8Start;
	const s8Progress = interpolate(frame, [scene8Start, scene8End], [0, 1], { extrapolateRight: 'clamp' });

	const s8Rotation = interpolate(s8Progress, [0, 1], [-5, 5]);
	const s8BookOpacity = interpolate(s8Progress, [0, 0.2, 0.7, 0.8], [0, 1, 1, 0]);
	const s8ServerOpacity = interpolate(s8Progress, [0.7, 0.9], [0, 1]);

	// --- SCENE 9: The Revolution (64.90s - 73.82s) ---
	const scene9Start = toF(64.90, fps);
	const scene9End = durationInFrames;
	const scene9Duration = scene9End - scene9Start;
	const s9Progress = interpolate(frame, [scene9Start, scene9End], [0, 1], { extrapolateRight: 'clamp' });
	
	const s9CamZoomOut = interpolate(s9Progress, [0.2, 1], [1, 1.5]);
	const s9ReportOpacity = interpolate(s9Progress, [0.3, 0.6], [1, 0]);
	const s9ReportY = interpolate(s9Progress, [0.3, 0.6], [0, 200]);
	const s9CityOpacity = interpolate(s9Progress, [0.1, 0.4], [0, 1]);

	return (
		<AbsoluteFill style={{ backgroundColor: '#050515' }}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_4.wav')} />

			{/* Scene 1: Concept */}
			<Sequence from={scene1Start} durationInFrames={scene1Duration}>
				<AbsoluteFill
					style={{
						transform: `scale(${s1CamZoom})`,
					}}
				>
					{/* dark_tech_background.jpg: A dark, abstract background with faint circuit board lines or geometric patterns. */}
					<Img
						src={staticFile('assets/images/dark_tech_background.jpg')}
						style={{ width: '100%', height: '100%', opacity: 0.5 }}
					/>
					<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
						{/* expense_icon.png: A transparent PNG of a red downward arrow or a stack of coins with a minus sign. */}
						<Img
							src={staticFile('assets/images/expense_icon.png')}
							style={{
								width: 400,
								opacity: s1ExpenseOpacity,
								transform: `translateY(${s1ExpenseY}px)`,
							}}
						/>
						{/* product_box.png: A transparent PNG of a sleek, glowing, modern product box. */}
						<Img
							src={staticFile('assets/images/product_box.png')}
							style={{
								width: 450,
								opacity: s1ProductOpacity,
								transform: `translateY(${s1ProductY}px)`,
								position: 'absolute',
							}}
						/>
					</AbsoluteFill>
				</AbsoluteFill>
			</Sequence>

			{/* Scene 2: 2006 */}
			<Sequence from={scene2Start} durationInFrames={scene2Duration}>
				{/* warehouse_blur.jpg: A photograph of a warehouse interior, heavily blurred to act as a textured background. */}
				<Img
					src={staticFile('assets/images/warehouse_blur.jpg')}
					style={{
						width: '120%',
						height: '120%',
						left: '-10%',
						top: '-10%',
						transform: `translateX(${s2BgParallaxX}px)`,
					}}
				/>
				{/* amazon_2006_ui.png: A stylized screenshot/recreation of the Amazon website from 2006, with a transparent background. */}
				<Img
					src={staticFile('assets/images/amazon_2006_ui.png')}
					style={{
						width: '100%',
						position: 'absolute',
						transform: `translateX(${s2UiParallaxX}px) scale(1.1)`,
					}}
				/>
			</Sequence>

			{/* Scene 3: Hidden Problem */}
			<Sequence from={scene3Start} durationInFrames={scene3Duration}>
				{/* amazon_2006_ui_clean.png: A cleaner version of the UI from scene 2, just the frame, to transition from. */}
				<Img
					src={staticFile('assets/images/amazon_2006_ui_clean.png')}
					style={{
						width: '100%',
						height: '100%',
						opacity: 1 - s3Progress,
						transform: `scale(${s3DollyZoom})`,
					}}
				/>
				<AbsoluteFill
					style={{
						opacity: s3ServerOpacity,
					}}
				>
					{/* server_room_deep.jpg: A dark background image of a vast, almost infinite server room. */}
					<Img
						src={staticFile('assets/images/server_room_deep.jpg')}
						style={{ width: '100%', height: '100%', transform: `scale(${s3DollyZoom})` }}
					/>
					{/* tangled_data_lines.png: A transparent PNG with glowing, chaotic, tangled lines representing data flow. */}
					<Img
						src={staticFile('assets/images/tangled_data_lines.png')}
						style={{
							width: '100%',
							height: '100%',
							transform: `scale(${s3LinesParallaxScale})`,
							opacity: 0.7,
						}}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Scene 4: The Beast */}
			<Sequence from={scene4Start} durationInFrames={scene4Duration}>
				<AbsoluteFill style={{ perspective: '1000px' }}>
					{/* server_aisle_far.png: A transparent PNG of a row of servers, meant to be in the distance. */}
					<Img
						src={staticFile('assets/images/server_aisle_far.png')}
						style={{
							width: '100%',
							height: '100%',
							transform: `translateZ(${s4BgTranslateZ}px)`,
						}}
					/>
					{/* server_aisle_mid.png: A transparent PNG of a server row, for the midground. */}
					<Img
						src={staticFile('assets/images/server_aisle_mid.png')}
						style={{
							width: '100%',
							height: '100%',
							transform: `translateZ(${s4MgTranslateZ}px)`,
						}}
					/>
					{/* data_streaks.png: A transparent PNG with fast-moving horizontal light streaks. */}
					<Img
						src={staticFile('assets/images/data_streaks.png')}
						style={{
							width: '100%',
							height: '100%',
							transform: `translateZ(${s4FgTranslateZ}px)`,
							opacity: 0.8,
						}}
					/>
					<AbsoluteFill
						style={{
							background: `radial-gradient(circle, rgba(255,0,0,${s4GlowIntensity * 0.3}) 0%, rgba(255,0,0,0) 70%)`,
						}}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Scene 5: Two Views */}
			<Sequence from={scene5Start} durationInFrames={scene5Duration}>
				{/* grey_gradient_bg.jpg: A simple, clean, corporate-looking grey gradient background. */}
				<Img src={staticFile('assets/images/grey_gradient_bg.jpg')} style={{ width: '100%' }}/>
				<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
					{/* cost_center.png: A transparent PNG graphic showing a red box labeled 'COST'. */}
					<Img
						src={staticFile('assets/images/cost_center.png')}
						style={{ width: 500, opacity: s5CostOpacity }}
					/>
					{/* opportunity_door.png: A transparent PNG of a slightly ajar door with bright light pouring out. */}
					<Img
						src={staticFile('assets/images/opportunity_door.png')}
						style={{
							width: 600,
							opacity: s5OppOpacity,
							position: 'absolute',
							transform: `scale(${s5OppScale})`,
						}}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Scene 6: Epiphany */}
			<Sequence from={scene6Start} durationInFrames={scene6Duration}>
				<AbsoluteFill
					style={{
						transform: `scale(${s6CamPullback})`,
					}}
				>
					{/* clean_servers.png: A PNG of an organized, powerful-looking server bank against a transparent background. */}
					<Img
						src={staticFile('assets/images/clean_servers.png')}
						style={{ width: '100%', opacity: 0.8 }}
					/>
					{/* bright_light_bg.jpg: A background of pure, bright, ethereal light. */}
					<Img
						src={staticFile('assets/images/bright_light_bg.jpg')}
						style={{
							width: '100%',
							height: '100%',
							opacity: s6LightOpacity * 0.7,
							mixBlendMode: 'screen',
						}}
					/>
					{/* business_icons.png: A transparent PNG layer with various small, generic business icons floating in space. */}
					<Img
						src={staticFile('assets/images/business_icons.png')}
						style={{ width: '100%', height: '100%', opacity: s6IconsOpacity }}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Scene 7: AWS Launch */}
			<Sequence from={scene7Start} durationInFrames={scene7Duration}>
				{/* digital_globe.jpg: A background image of a dark earth with glowing blue grid lines and city lights. */}
				<Img
					src={staticFile('assets/images/digital_globe.jpg')}
					style={{
						width: '150%',
						height: '150%',
						left: '-25%',
						top: '-25%',
						transform: `rotate(${s7GlobeRotation}deg) scale(1.2)`,
					}}
				/>
				<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
					{/* aws_logo.png: The official AWS logo on a transparent background. */}
					<Img
						src={staticFile('assets/images/aws_logo.png')}
						style={{ width: 500, transform: `scale(${s7LogoScale})` }}
					/>
				</AbsoluteFill>
				{/* network_lines.png: A transparent PNG of lines connecting points, like a network grid, to overlay on the globe. */}
				<Img
					src={staticFile('assets/images/network_lines.png')}
					style={{
						width: '100%',
						height: '100%',
						opacity: s7LinesOpacity,
						mixBlendMode: 'screen',
					}}
				/>
			</Sequence>

			{/* Scene 8: Confusion */}
			<Sequence from={scene8Start} durationInFrames={scene8Duration}>
				{/* question_mark_bg.jpg: A background filled with faint, overlapping, grey question marks. */}
				<Img
					src={staticFile('assets/images/question_mark_bg.jpg')}
					style={{
						width: '100%',
						height: '100%',
						transform: `rotate(${s8Rotation}deg) scale(1.2)`,
						opacity: 0.4
					}}
				/>
				<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
					{/* book_icon.png: A simple icon of a book on a transparent background. */}
					<Img
						src={staticFile('assets/images/book_icon.png')}
						style={{ width: 300, opacity: s8BookOpacity, position: 'absolute' }}
					/>
					{/* server_icon.png: A simple icon of a server on a transparent background. */}
					<Img
						src={staticFile('assets/images/server_icon.png')}
						style={{ width: 300, opacity: s8ServerOpacity, position: 'absolute' }}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Scene 9: Revolution */}
			<Sequence from={scene9Start} durationInFrames={scene9Duration}>
				<AbsoluteFill
					style={{
						transform: `scale(${s9CamZoomOut})`,
					}}
				>
					{/* starry_sky.jpg: A beautiful, dark night sky filled with stars. */}
					<Img src={staticFile('assets/images/starry_sky.jpg')} style={{ width: '100%' }} />
					{/* cloud_city.png: A majestic, futuristic city floating in the clouds, made of light and data structures, on a transparent background. */}
					<Img
						src={staticFile('assets/images/cloud_city.png')}
						style={{ width: '100%', height: '100%', opacity: s9CityOpacity }}
					/>
					{/* expense_report.png: A stylized image of a financial document on a transparent background. */}
					<Img
						src={staticFile('assets/images/expense_report.png')}
						style={{
							width: '100%',
							opacity: s9ReportOpacity,
							transform: `translateY(${s9ReportY}px)`,
						}}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* --- ALL TEXT SEQUENCES --- */}
			<AbsoluteFill>
				<TextSequence from={toF(0.42, fps)} durationInFrames={toF(4.48 - 0.42, fps)} text="Key lesson, turn your biggest expense into your biggest product." />
				<TextSequence from={toF(5.50, fps)} durationInFrames={toF(6.84 - 5.50, fps)} text="The year is 2006." />
				<TextSequence from={toF(7.40, fps)} durationInFrames={toF(9.76 - 7.40, fps)} text="Amazon is a successful online retailer." />
				<TextSequence from={toF(10.20, fps)} durationInFrames={toF(11.62 - 10.20, fps)} text="That is what everyone sees." />
				<TextSequence from={toF(12.24, fps)} durationInFrames={toF(14.40 - 12.24, fps)} text="But inside, something else is happening." />
				<TextSequence from={toF(15.00, fps)} durationInFrames={toF(20.50 - 15.00, fps)} text="For years, the company's biggest headache and biggest expense was its own computing infrastructure." />
				<TextSequence from={toF(21.00, fps)} durationInFrames={toF(26.06 - 21.00, fps)} text="The servers, the databases, the network to run the massive Amazon.com website." />
				<TextSequence from={toF(26.74, fps)} durationInFrames={toF(27.62 - 26.74, fps)} text="It was a beast." />
				<TextSequence from={toF(28.04, fps)} durationInFrames={toF(30.58 - 28.04, fps)} text="It was complex and incredibly expensive." />
				<TextSequence from={toF(31.14, fps)} durationInFrames={toF(33.10 - 31.14, fps)} text="A normal company sees a cost center." />
				<TextSequence from={toF(33.54, fps)} durationInFrames={toF(36.40 - 33.54, fps)} text="They try to make it a little cheaper, a little more efficient." />
				<TextSequence from={toF(37.06, fps)} durationInFrames={toF(38.48 - 37.06, fps)} text="Amazon saw an opportunity." />
				<TextSequence from={toF(39.02, fps)} durationInFrames={toF(47.02 - 39.02, fps)} text="If we have gotten this good at running massive, reliable computer systems for ourselves, maybe other people would pay to use it." />
				<TextSequence from={toF(47.42, fps)} durationInFrames={toF(51.52 - 47.42, fps)} text="In 2006, they launched Amazon Web Services, or AWS." />
				<TextSequence from={toF(52.28, fps)} durationInFrames={toF(54.46 - 52.28, fps)} text="They started renting out their computer power." />
				<TextSequence from={toF(55.08, fps)} durationInFrames={toF(57.28 - 55.08, fps)} text="It was like a power company, but for computing." />
				<TextSequence from={toF(58.06, fps)} durationInFrames={toF(59.88 - 58.06, fps)} text="At first, no one understood it." />
				<TextSequence from={toF(60.20, fps)} durationInFrames={toF(62.98 - 60.20, fps)} text="An online bookstore was now selling server time." />
				<TextSequence from={toF(63.30, fps)} durationInFrames={toF(64.42 - 63.30, fps)} text="It made no sense." />
				<TextSequence from={toF(64.90, fps)} durationInFrames={toF(67.80 - 64.90, fps)} text="But it was the start of the cloud computing revolution." />
				<TextSequence from={toF(68.40, fps)} durationInFrames={toF(73.82 - 68.40, fps)} text="A multi-trillion dollar industry was born from what used to be a line item in their expense report." />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
```