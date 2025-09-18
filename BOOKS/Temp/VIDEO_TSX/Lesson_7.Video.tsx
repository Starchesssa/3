```tsx
import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Composition,
	interpolate,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	Easing,
} from 'remotion';

// Helper function to convert time in seconds to frames
const timeToFrames = (time: number, fps: number): number => Math.floor(time * fps);

// Data structure for a single word in the transcript
type Word = {
	start: number;
	end: number;
	text: string;
};

// Data structure for a sentence, which is a collection of words
type Sentence = {
	words: Word[];
	start: number;
	end: number;
};

// Transcript data parsed into sentences
const sentences: Sentence[] = [
    { words: [ { start: 0.00, end: 0.44, text: "Key" }, { start: 0.44, end: 0.84, text: "lesson," }, { start: 1.28, end: 1.42, text: "the" }, { start: 1.42, end: 1.80, text: "price" }, { start: 1.80, end: 2.04, text: "of" }, { start: 2.04, end: 2.58, text: "innovation" }, { start: 2.58, end: 3.04, text: "is" }, { start: 3.04, end: 3.68, text: "expensive" }, { start: 3.68, end: 4.36, text: "public" }, { start: 4.36, end: 4.84, text: "failure." } ], start: 0.00, end: 4.84 },
    { words: [ { start: 5.53, end: 5.88, text: "We" }, { start: 5.88, end: 6.24, text: "need" }, { start: 6.24, end: 6.42, text: "to" }, { start: 6.42, end: 6.62, text: "talk" }, { start: 6.62, end: 6.84, text: "about" }, { start: 6.84, end: 7.46, text: "2019," } ], start: 5.53, end: 7.46 },
    { words: [ { start: 8.00, end: 8.26, text: "but" }, { start: 8.26, end: 8.48, text: "to" }, { start: 8.48, end: 9.02, text: "understand" }, { start: 9.02, end: 9.74, text: "2019," }, { start: 10.12, end: 10.30, text: "you" }, { start: 10.30, end: 10.52, text: "have" }, { start: 10.52, end: 10.68, text: "to" }, { start: 10.68, end: 11.12, text: "understand" }, { start: 11.12, end: 11.30, text: "the" }, { start: 11.30, end: 11.62, text: "ghosts" }, { start: 11.62, end: 11.96, text: "of" }, { start: 11.96, end: 12.28, text: "failures" }, { start: 12.28, end: 12.68, text: "passed." } ], start: 8.00, end: 12.68 },
    { words: [ { start: 13.34, end: 13.54, text: "The" }, { start: 13.54, end: 13.88, text: "biggest" }, { start: 13.88, end: 14.12, text: "one" }, { start: 14.12, end: 14.34, text: "was" }, { start: 14.34, end: 14.46, text: "the" }, { start: 14.46, end: 14.82, text: "fire" }, { start: 14.82, end: 15.12, text: "phone" }, { start: 15.12, end: 15.30, text: "from" }, { start: 15.30, end: 15.98, text: "2014." } ], start: 13.34, end: 15.98 },
    { words: [ { start: 16.64, end: 16.76, text: "It" }, { start: 16.76, end: 16.90, text: "was" }, { start: 16.90, end: 17.02, text: "a" }, { start: 17.02, end: 17.50, text: "complete" }, { start: 17.50, end: 17.94, text: "disaster," }, { start: 18.40, end: 18.50, text: "a" }, { start: 18.50, end: 18.90, text: "total" }, { start: 18.90, end: 19.26, text: "flop." } ], start: 16.64, end: 19.26 },
    { words: [ { start: 19.76, end: 19.92, text: "The" }, { start: 19.92, end: 20.24, text: "company" }, { start: 20.24, end: 20.50, text: "took" }, { start: 20.50, end: 20.72, text: "a" }, { start: 20.72, end: 21.78, text: "$170" }, { start: 21.78, end: 22.38, text: "million" }, { start: 22.38, end: 22.92, text: "write" }, { start: 22.92, end: 23.20, text: "down" }, { start: 23.20, end: 23.42, text: "on" }, { start: 23.42, end: 23.84, text: "Unsold" }, { start: 23.84, end: 24.44, text: "Inventory." } ], start: 19.76, end: 24.44 },
    { words: [ { start: 24.68, end: 24.98, text: "It" }, { start: 24.98, end: 25.10, text: "was" }, { start: 25.10, end: 25.24, text: "a" }, { start: 25.24, end: 25.66, text: "public" }, { start: 25.66, end: 26.32, text: "humiliation." } ], start: 24.68, end: 26.32 },
    { words: [ { start: 26.32, end: 27.18, text: "They" }, { start: 27.18, end: 27.42, text: "tried" }, { start: 27.42, end: 27.58, text: "to" }, { start: 27.58, end: 27.86, text: "compete" }, { start: 27.86, end: 28.14, text: "with" }, { start: 28.14, end: 28.42, text: "Apple" }, { start: 28.42, end: 28.62, text: "and" }, { start: 28.62, end: 28.90, text: "Google" }, { start: 28.90, end: 29.20, text: "and" }, { start: 29.20, end: 29.32, text: "they" }, { start: 29.32, end: 29.70, text: "failed" }, { start: 29.70, end: 30.78, text: "spectacularly." } ], start: 26.32, end: 30.78 },
    { words: [ { start: 31.14, end: 31.44, text: "A" }, { start: 31.44, end: 31.74, text: "normal" }, { start: 31.74, end: 32.18, text: "company" }, { start: 32.18, end: 32.38, text: "would" }, { start: 32.38, end: 32.70, text: "fire" }, { start: 32.70, end: 32.92, text: "the" }, { start: 32.92, end: 33.26, text: "entire" }, { start: 33.26, end: 33.76, text: "team." } ], start: 31.14, end: 33.76 },
    { words: [ { start: 34.12, end: 34.22, text: "They" }, { start: 34.22, end: 34.34, text: "would" }, { start: 34.34, end: 34.64, text: "never" }, { start: 34.64, end: 35.00, text: "mention" }, { start: 35.00, end: 35.12, text: "the" }, { start: 35.12, end: 35.46, text: "project" }, { start: 35.46, end: 35.82, text: "again." } ], start: 34.12, end: 35.82 },
    { words: [ { start: 36.30, end: 36.40, text: "They" }, { start: 36.40, end: 36.56, text: "would" }, { start: 36.56, end: 36.98, text: "conclude," }, { start: 37.30, end: 37.42, text: "we" }, { start: 37.42, end: 37.66, text: "are" }, { start: 37.66, end: 37.94, text: "not" }, { start: 37.94, end: 38.14, text: "a" }, { start: 38.14, end: 38.38, text: "hardware" }, { start: 38.38, end: 38.86, text: "company." } ], start: 36.30, end: 38.86 },
    { words: [ { start: 39.54, end: 39.84, text: "Amazon" }, { start: 39.84, end: 40.24, text: "did" }, { start: 40.24, end: 40.52, text: "not" }, { start: 40.52, end: 40.76, text: "do" }, { start: 40.76, end: 41.02, text: "that." } ], start: 39.54, end: 41.02 },
    { words: [ { start: 41.58, end: 41.82, text: "Bezos" }, { start: 41.82, end: 42.24, text: "said," }, { start: 42.42, end: 42.50, text: "if" }, { start: 42.50, end: 42.62, text: "you" }, { start: 42.62, end: 42.72, text: "are" }, { start: 42.72, end: 42.98, text: "not" }, { start: 42.98, end: 43.38, text: "failing," }, { start: 43.70, end: 43.80, text: "you" }, { start: 43.80, end: 43.90, text: "are" }, { start: 43.90, end: 44.18, text: "not" }, { start: 44.18, end: 44.76, text: "innovating." } ], start: 41.58, end: 44.76 },
    { words: [ { start: 45.28, end: 45.46, text: "The" }, { start: 45.46, end: 46.38, text: "$170" }, { start: 46.38, end: 46.92, text: "million" }, { start: 46.92, end: 47.54, text: "was" }, { start: 47.54, end: 47.72, text: "the" }, { start: 47.72, end: 48.10, text: "tuition" }, { start: 48.10, end: 48.46, text: "fee." } ], start: 45.28, end: 48.46 },
    { words: [ { start: 49.08, end: 49.28, text: "The" }, { start: 49.28, end: 49.58, text: "lessons" }, { start: 49.58, end: 49.86, text: "they" }, { start: 49.86, end: 50.12, text: "learned" }, { start: 50.12, end: 50.32, text: "from" }, { start: 50.32, end: 50.46, text: "the" }, { start: 50.46, end: 50.70, text: "fire" }, { start: 50.70, end: 51.12, text: "phone's" }, { start: 51.12, end: 51.40, text: "failure," }, { start: 51.70, end: 51.78, text: "the" }, { start: 51.78, end: 52.10, text: "engineers" }, { start: 52.10, end: 52.60, text: "they" }, { start: 52.60, end: 52.98, text: "trained," }, { start: 3.14, end: 53.20, text: "the" }, { start: 53.20, end: 53.60, text: "supply" }, { start: 53.60, end: 53.92, text: "chains" }, { start: 53.92, end: 54.14, text: "they" }, { start: 54.14, end: 54.36, text: "built" }, { start: 54.36, end: 54.64, text: "were" }, { start: 54.64, end: 54.90, text: "not" }, { start: 54.90, end: 55.16, text: "thrown" }, { start: 55.16, end: 55.46, text: "away." } ], start: 49.08, end: 55.46 },
    { words: [ { start: 55.46, end: 56.26, text: "They" }, { start: 56.26, end: 56.42, text: "were" }, { start: 56.42, end: 57.28, text: "repurposed." } ], start: 55.46, end: 57.28 },
    { words: [ { start: 57.82, end: 57.96, text: "That" }, { start: 57.96, end: 58.30, text: "same" }, { start: 58.30, end: 58.68, text: "team," }, { start: 58.90, end: 59.04, text: "that" }, { start: 59.04, end: 59.38, text: "same" }, { start: 59.38, end: 59.80, text: "knowledge" }, { start: 59.80, end: 60.22, text: "went" }, { start: 60.22, end: 60.38, text: "on" }, { start: 60.38, end: 60.52, text: "to" }, { start: 60.52, end: 60.82, text: "create" }, { start: 60.82, end: 61.02, text: "the" }, { start: 61.02, end: 61.34, text: "Amazon" }, { start: 61.34, end: 61.82, text: "Echo" }, { start: 61.82, end: 62.08, text: "and" }, { start: 62.08, end: 62.46, text: "Alexa," } ], start: 57.82, end: 62.46 },
    { words: [ { start: 63.00, end: 63.18, text: "a" }, { start: 63.18, end: 63.52, text: "product" }, { start: 63.52, end: 63.76, text: "that" }, { start: 63.76, end: 64.10, text: "created" }, { start: 64.10, end: 64.34, text: "an" }, { start: 64.34, end: 64.86, text: "entirely" }, { start: 64.86, end: 65.32, text: "new" }, { start: 65.32, end: 65.80, text: "category" }, { start: 65.80, end: 66.04, text: "of" }, { start: 66.04, end: 66.60, text: "technology." } ], start: 63.00, end: 66.60 },
    { words: [ { start: 67.12, end: 67.36, text: "By" }, { start: 67.36, end: 68.04, text: "2019," }, { start: 68.50, end: 68.80, text: "tens" }, { start: 68.80, end: 69.06, text: "of" }, { start: 69.06, end: 69.32, text: "millions" }, { start: 69.32, end: 69.58, text: "of" }, { start: 69.58, end: 69.86, text: "homes" }, { start: 69.86, end: 70.08, text: "had" }, { start: 70.08, end: 70.26, text: "an" }, { start: 70.26, end: 70.48, text: "Echo" }, { start: 70.48, end: 70.80, text: "device." } ], start: 67.12, end: 70.80 },
    { words: [ { start: 71.48, end: 71.62, text: "The" }, { start: 71.62, end: 71.96, text: "ashes" }, { start: 71.96, end: 72.18, text: "of" }, { start: 72.18, end: 72.32, text: "their" }, { start: 72.32, end: 72.66, text: "biggest" }, { start: 72.66, end: 73.08, text: "failure" }, { start: 73.08, end: 73.52, text: "became" }, { start: 73.52, end: 73.72, text: "the" }, { start: 73.72, end: 74.10, text: "soil" }, { start: 74.10, end: 74.36, text: "for" }, { start: 74.36, end: 74.52, text: "one" }, { start: 74.52, end: 74.60, text: "of" }, { start: 74.60, end: 74.74, text: "their" }, { start: 74.74, end: 75.08, text: "biggest" }, { start: 75.08, end: 75.68, text: "successes." } ], start: 71.48, end: 75.68 },
    { words: [ { start: 76.54, end: 76.96, text: "Failure" }, { start: 76.96, end: 77.16, text: "is" }, { start: 77.16, end: 77.60, text: "only" }, { start: 77.60, end: 78.04, text: "failure" }, { start: 78.04, end: 78.32, text: "if" }, { start: 78.32, end: 78.44, text: "you" }, { start: 78.44, end: 78.66, text: "learn" }, { start: 78.66, end: 79.10, text: "nothing" }, { start: 79.10, end: 79.40, text: "from" }, { start: 79.40, end: 79.60, text: "it." } ], start: 76.54, end: 79.60 },
];

// Component to render a single word with synchronized animation
const WordComponent: React.FC<{ word: Word }> = ({ word }) => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();

	const wordStartFrame = timeToFrames(word.start, fps);
	
	const opacity = interpolate(frame, [wordStartFrame - 2, wordStartFrame + 2], [0.3, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<span style={{ marginRight: '1.2rem', opacity }}>
			{word.text}
		</span>
	);
};

// Component to render a full sentence
const SentenceComponent: React.FC<{ sentence: Sentence }> = ({ sentence }) => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();

	const sentenceStartFrame = timeToFrames(sentence.start, fps);
	const sentenceEndFrame = timeToFrames(sentence.end, fps);

	const opacity = interpolate(
		frame,
		[sentenceStartFrame, sentenceStartFrame + 15, sentenceEndFrame, sentenceEndFrame + 15],
		[0, 1, 1, 0]
	);

	const translateY = interpolate(
		frame,
		[sentenceStartFrame, sentenceStartFrame + 15],
		[20, 0],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.out(Easing.ease),
		}
	);

	const textStyle: React.CSSProperties = {
		fontFamily: 'Helvetica, Arial, sans-serif',
		fontSize: '110px',
		fontWeight: 'bold',
		color: 'white',
		textAlign: 'center',
		lineHeight: 1.3,
		opacity,
		textShadow: '0 0 20px rgba(0,0,0,0.7)',
		transform: `translateY(${translateY}px)`,
	};

	return (
		<div style={textStyle}>
			{sentence.words.map((word, index) => (
				<WordComponent key={index} word={word} />
			))}
		</div>
	);
};

// Component for a parallax image layer
const ParallaxImage: React.FC<{ src: string; parallax: number; zoom?: number; opacity?: number }> = ({ src, parallax, zoom = 1, opacity = 1 }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    
    // Smooth cinematic pan across the entire video
    const panX = interpolate(frame, [0, durationInFrames], [0, -200]);
    const panY = interpolate(frame, [0, durationInFrames], [0, 50]);

    const finalX = panX * parallax;
    const finalY = panY * parallax;
    
    const imageStyle: React.CSSProperties = {
        width: '120%', // Slightly larger for panning
        height: '120%',
        objectFit: 'cover',
        position: 'absolute',
        left: '-10%',
        top: '-10%',
        transform: `scale(${zoom}) translateX(${finalX}px) translateY(${finalY}px)`,
        opacity,
    };

    return <img src={staticFile(src)} style={imageStyle} alt="" />;
};


// Main Video Component
export const RemotionVideo: React.FC = () => {
	const { fps } = useVideoConfig();

	// Calculate scene durations in frames
	const scene1End = timeToFrames(5.53, fps);
	const scene2End = timeToFrames(13.34, fps);
	const scene3End = timeToFrames(19.76, fps);
	const scene4End = timeToFrames(26.32, fps);
	const scene5End = timeToFrames(31.14, fps);
	const scene6End = timeToFrames(39.54, fps);
	const scene7End = timeToFrames(49.08, fps);
	const scene8End = timeToFrames(57.82, fps);
	const scene9End = timeToFrames(67.12, fps);
	const scene10End = timeToFrames(71.48, fps);
	const scene11End = timeToFrames(76.54, fps);
	const scene12End = timeToFrames(80, fps);

	return (
		<AbsoluteFill style={{ backgroundColor: '#111' }}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_7.wav')} />
			
			<AbsoluteFill>
				{/* Scene 1: The Price of Innovation */}
				<Sequence from={0} durationInFrames={scene1End}>
                    {/* assets/images/blueprint-background.jpg: A dark, moody, and detailed architectural blueprint, slightly out of focus. */}
					<ParallaxImage src="assets/images/blueprint-background.jpg" parallax={0.5} zoom={1.2}/>
                    {/* assets/images/glowing-key.png: A stylized, ornate key with a soft golden glow, on a transparent background. */}
					<ParallaxImage src="assets/images/glowing-key.png" parallax={1.5} zoom={0.8}/>
				</Sequence>

				{/* Scene 2: Ghosts of Failures Passed */}
				<Sequence from={scene1End} durationInFrames={scene2End - scene1End}>
                    {/* assets/images/tech-cemetery.jpg: A surreal landscape with broken circuit boards and discarded electronics under a dark, cloudy sky. */}
					<ParallaxImage src="assets/images/tech-cemetery.jpg" parallax={0.6} zoom={1.3} />
                    {/* assets/images/ghostly-overlays.png: Faint, semi-transparent images of charts and graphs with downward trends. */}
					<ParallaxImage src="assets/images/ghostly-overlays.png" parallax={1.8} opacity={0.5} />
				</Sequence>

				{/* Scene 3: The Fire Phone */}
				<Sequence from={scene2End} durationInFrames={scene3End - scene2End}>
                    {/* assets/images/dark-lab.jpg: A dimly lit, modern laboratory background with equipment and servers. */}
					<ParallaxImage src="assets/images/dark-lab.jpg" parallax={0.7} zoom={1.1} />
                    {/* assets/images/fire-phone.png: A sleek, modern smartphone with digital fire and smoke effects on its screen, on a transparent background. */}
					<ParallaxImage src="assets/images/fire-phone.png" parallax={1.6} zoom={0.9}/>
				</Sequence>
				
				{/* Scene 4: Public Humiliation */}
				<Sequence from={scene3End} durationInFrames={scene4End - scene3End}>
                    {/* assets/images/dusty-warehouse.jpg: A vast, dimly lit warehouse filled with rows of unmarked cardboard boxes covered in dust. */}
					<ParallaxImage src="assets/images/dusty-warehouse.jpg" parallax={0.5} zoom={1.4} />
                    {/* assets/images/news-clippings.png: An overlay of overlapping, semi-transparent newspaper headlines with words like "FLOP", "DISASTER", "$170M LOSS". */}
					<ParallaxImage src="assets/images/news-clippings.png" parallax={2.0} opacity={0.7}/>
				</Sequence>
				
				{/* Scene 5: Failed to Compete */}
				<Sequence from={scene4End} durationInFrames={scene5End - scene4End}>
                    {/* assets/images/abstract-arena.jpg: A dark, abstract background resembling a digital arena or stadium. */}
					<ParallaxImage src="assets/images/abstract-arena.jpg" parallax={0.4} zoom={1.2} />
                     {/* assets/images/shattered-glass.png: An overlay of cracked and shattering glass, transparent background. */}
                    <ParallaxImage src="assets/images/shattered-glass.png" parallax={2.2} opacity={0.6}/>
				</Sequence>
				
				{/* Scene 6: Normal Company Reaction */}
				<Sequence from={scene5End} durationInFrames={scene6End - scene5End}>
                    {/* assets/images/empty-office.jpg: A modern, but completely empty and dark office space at night. */}
					<ParallaxImage src="assets/images/empty-office.jpg" parallax={0.6} zoom={1.3} />
                    {/* assets/images/shredded-papers.png: An overlay of papers being shredded, with a transparent background to see the office behind. */}
					<ParallaxImage src="assets/images/shredded-papers.png" parallax={1.8} opacity={0.8}/>
				</Sequence>

				{/* Scene 7: The Tuition Fee */}
				<Sequence from={scene6End} durationInFrames={scene7End - scene6End}>
                    {/* assets/images/chalkboard.jpg: A dark, textured chalkboard background with faint mathematical formulas. */}
					<ParallaxImage src="assets/images/chalkboard.jpg" parallax={0.5} zoom={1.1} />
                    {/* assets/images/graduation-cap.png: A simple, elegant icon of a graduation cap, with a subtle glow. Transparent background. */}
					<ParallaxImage src="assets/images/graduation-cap.png" parallax={1.5} zoom={0.7}/>
				</Sequence>
				
				{/* Scene 8: Repurposed */}
				<Sequence from={scene7End} durationInFrames={scene8End - scene7End}>
                    {/* assets/images/flowchart-background.jpg: A complex, glowing digital flowchart with interconnected nodes and data streams. */}
					<ParallaxImage src="assets/images/flowchart-background.jpg" parallax={0.8} zoom={1.4} />
                    {/* assets/images/gears-and-cogs.png: A collection of interlocking gears and machine parts, semi-transparent, floating in the foreground. */}
					<ParallaxImage src="assets/images/gears-and-cogs.png" parallax={1.7} opacity={0.6}/>
				</Sequence>
				
				{/* Scene 9: Echo and Alexa */}
				<Sequence from={scene8End} durationInFrames={scene9End - scene8End}>
                    {/* assets/images/smart-home.jpg: A warm, inviting, and modern living room with subtle smart home elements integrated. */}
					<ParallaxImage src="assets/images/smart-home.jpg" parallax={0.6} zoom={1.2} />
                    {/* assets/images/echo-device.png: A stylized smart speaker, elegantly designed, on a transparent background. */}
					<ParallaxImage src="assets/images/echo-device.png" parallax={1.4} zoom={0.8}/>
                    {/* assets/images/alexa-orb.png: A soft, glowing blue orb representing the AI, with light rays emanating from it. Transparent background. */}
					<ParallaxImage src="assets/images/alexa-orb.png" parallax={2.0} opacity={0.8}/>
				</Sequence>
				
				{/* Scene 10: Tens of Millions */}
				<Sequence from={scene9End} durationInFrames={scene10End - scene9End}>
                    {/* assets/images/night-earth.jpg: A high-altitude view of the Earth at night, with city lights visible. */}
					<ParallaxImage src="assets/images/night-earth.jpg" parallax={0.5} zoom={1.5} />
                    {/* assets/images/connection-lines.png: A network of glowing lines and dots spreading across the screen, representing connections. Transparent background. */}
					<ParallaxImage src="assets/images/connection-lines.png" parallax={1.8} opacity={0.7}/>
				</Sequence>
				
				{/* Scene 11: Ashes to Success */}
				<Sequence from={scene10End} durationInFrames={scene11End - scene10End}>
                    {/* assets/images/barren-ashes.jpg: A dark, cracked ground covered in grey ash. */}
					<ParallaxImage src="assets/images/barren-ashes.jpg" parallax={0.7} zoom={1.1} />
                    {/* assets/images/tech-plant.png: A single, vibrant plant growing, with glowing circuit board patterns on its leaves. Transparent background. */}
					<ParallaxImage src="assets/images/tech-plant.png" parallax={1.5}/>
				</Sequence>

                {/* Scene 12: Final Quote */}
				<Sequence from={scene11End} durationInFrames={scene12End - scene11End}>
                    {/* assets/images/inspirational-sky.jpg: A beautiful, hopeful sky at sunrise with soft clouds. */}
					<ParallaxImage src="assets/images/inspirational-sky.jpg" parallax={0.6} zoom={1.2} />
				</Sequence>
			</AbsoluteFill>

			{/* Text layer on top of all scenes */}
			<AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 200px' }}>
				{sentences.map((sentence, index) => (
					<Sequence
						key={index}
						from={timeToFrames(sentence.start, fps)}
						durationInFrames={timeToFrames(sentence.end - sentence.start + 1, fps)} // Keep it for an extra second to fade out
					>
						<SentenceComponent sentence={sentence} />
					</Sequence>
				))}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const MyComposition = () => {
    const VIDEO_DURATION_SECONDS = 80;
    const VIDEO_FPS = 30;
    const VIDEO_WIDTH = 3840;
    const VIDEO_HEIGHT = 2160;

    return (
        <Composition
            id="RemotionVideo"
            component={RemotionVideo}
            durationInFrames={VIDEO_DURATION_SECONDS * VIDEO_FPS}
            fps={VIDEO_FPS}
            width={VIDEO_WIDTH}
            height={VIDEO_HEIGHT}
        />
    )
}
```