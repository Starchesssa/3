from manim import *
import numpy as np
from pydub import AudioSegment

class CompanyBioScene(Scene):
    def construct(self):

        audio_path = "BOOKS/Temp/TTS/3_PART_TWO:_THE_UNLIKELY_CHOICE.wav"

        # 🎵 Load audio
        audio = AudioSegment.from_wav(audio_path)
        samples = np.array(audio.get_array_of_samples())

        # Convert stereo → mono
        if audio.channels == 2:
            samples = samples.reshape((-1, 2)).mean(axis=1)

        samples = samples / np.max(np.abs(samples))
        duration = audio.duration_seconds

        # 🎨 Background panel (UI card)
        panel = RoundedRectangle(
            corner_radius=0.3,
            width=10,
            height=5,
            fill_opacity=0.15,
            stroke_opacity=0.3
        )
        self.add(panel)

        # 📝 Title
        title = Text(
            "THE UNLIKELY CHOICE",
            font_size=46,
            weight=BOLD
        ).to_edge(UP)

        self.play(FadeIn(title, shift=DOWN))

        # 📊 Audio Bars
        num_bars = 40
        bars = VGroup()

        for _ in range(num_bars):
            bar = Rectangle(
                width=0.15,
                height=0.3,          # ✅ Visible base height
                fill_opacity=1
            )
            bars.add(bar)

        bars.arrange(RIGHT, buff=0.05)
        bars.move_to(DOWN * 0.8)

        self.add(bars)

        # ▶ Play button
        play_button = Triangle(fill_opacity=1).scale(0.25)
        play_button.rotate(-PI/2)
        play_button.next_to(bars, LEFT, buff=0.6)

        self.play(FadeIn(play_button, scale=0.5))

        # ⏱ Progress bar
        progress_bg = Line(LEFT * 4, RIGHT * 4).next_to(bars, DOWN, buff=0.8)
        progress_line = Line(progress_bg.get_start(), progress_bg.get_start())

        self.add(progress_bg, progress_line)

        # 🎵 Start audio
        self.add_sound(audio_path)

        # 📈 Bars animation
        def update_bars(bars, alpha):
            t = alpha * duration
            index = int(t * audio.frame_rate)

            chunk_size = 800
            chunk = samples[index:index + chunk_size]

            if len(chunk) == 0:
                return

            level = np.abs(chunk).mean()

            for bar in bars:
                new_height = max(0.15, 0.2 + level * 2.8)  # ✅ Prevent collapse
                bar.stretch_to_fit_height(new_height)
                bar.align_to(bars, DOWN)

        # ⏱ Progress animation
        def update_progress(line, alpha):
            new_x = interpolate(
                progress_bg.get_start()[0],
                progress_bg.get_end()[0],
                alpha
            )
            line.put_start_and_end_on(
                progress_bg.get_start(),
                [new_x, progress_bg.get_start()[1], 0]
            )

        self.play(
            UpdateFromAlphaFunc(bars, update_bars),
            UpdateFromAlphaFunc(progress_line, update_progress),
            run_time=duration,
            rate_func=linear
        )

        # ✅ Bars remain visible at end
        self.wait(0.5)
