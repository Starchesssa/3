
import bpy
import os

# === Configuration ===
input_video = "group_21.mp4"
output_path = "//rendered_output.mp4"
overlay_text = "Group 21"

# === Clear existing scene ===
bpy.ops.wm.read_factory_settings(use_empty=True)

# === Set scene to Video Editing ===
bpy.context.scene.sequence_editor_create()

# === Add video strip ===
video_path = os.path.abspath(input_video)
bpy.ops.sequencer.movie_strip_add(filepath=video_path, directory=os.path.dirname(video_path), files=[{"name": os.path.basename(video_path)}], relative_path=False, frame_start=1)

# === Add text overlay ===
bpy.ops.sequencer.effect_strip_add(type='TEXT', frame_start=1, frame_end=150, channel=2, seq1=bpy.context.scene.sequence_editor.sequences_all[0].name)
text_strip = bpy.context.scene.sequence_editor.sequences_all[-1]
text_strip.text = overlay_text
text_strip.font_size = 80
text_strip.location = (0.35, 0.05)  # Adjust position
text_strip.color = (1, 1, 1, 1)  # White text

# === Set render settings ===
scene = bpy.context.scene
scene.render.filepath = output_path
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.constant_rate_factor = 'HIGH'
scene.render.ffmpeg.ffmpeg_preset = 'GOOD'

# === Render the animation ===
bpy.ops.render.render(animation=True)
