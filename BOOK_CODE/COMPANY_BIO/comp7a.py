from manim import *
import numpy as np
from pydub import AudioSegment

class CompanyBioScene(Scene):
    def construct(self):

        audio_path = "BOOKS/Temp/TTS/3_PART_TWO:_THE_UNLIKELY_CHOICE.wav"

        # 🎵 Load audio
        audio = AudioSegment.from_wav(audio_path)
        samples = np.array(audio.get_array_of_samples())

        # Convert to mono if stereo
        if audio.channels == 2:
            samples = samples.reshape((-1, 2)).mean(axis=1)

        # Normalize samples
        samples = samples / np.max(np.abs(samples))

        duration = audio.duration_seconds

        # 📝 Title (bold, top)
        title = Text(
            "THE UNLIKELY CHOICE",
            font_size=48,
            weight=BOLD
        ).to_edge(UP)

        self.play(FadeIn(title, shift=DOWN))

        # 📊 Audio bars
        num_bars = 40
        bars = VGroup()

        for i in range(num_bars):
            bar = Rectangle(
                width=0.15,
                height=0.1,
                fill_opacity=1
            )
            bars.add(bar)

        bars.arrange(RIGHT, buff=0.05)
        bars.move_to(DOWN * 1.5)

        self.add(bars)

        # 🎵 Play audio
        self.add_sound(audio_path)

        # 📈 Animate bars based on waveform
        def update_bars(bars, alpha):
            t = alpha * duration
            index = int(t * audio.frame_rate)

            chunk_size = 500
            chunk = samples[index:index + chunk_size]

            if len(chunk) == 0:
                return

            level = np.abs(chunk).mean()

            for bar in bars:
                new_height = 0.1 + level * 3
                bar.stretch_to_fit_height(new_height)
                bar.align_to(bars, DOWN)

        self.play(
            UpdateFromAlphaFunc(bars, update_bars),
            run_time=duration,
            rate_func=linear
        )

        self.wait(0.3)
