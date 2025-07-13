
import bpy
import os

# Set file paths
script_dir = os.path.dirname(bpy.data.filepath)
video_path = os.path.join(script_dir, "group_21.mp4")

# Reset scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.sequence_editor_create()

# Load video
video_strip = scene.sequence_editor.sequences.new_movie(
    name="Video",
    filepath=video_path,
    channel=1,
    frame_start=1
)

# Text to show
text_content = "Welcome to Paradise"

# Set font size and position
text_strip = scene.sequence_editor.sequences.new_effect(
    name="Text",
    type='TEXT',
    channel=2,
    frame_start=1,
    frame_end=1 + len(text_content) * 5  # 5 frames per character
)

text_strip.text = ""  # Start empty
text_strip.location = (0.5, 0.5)  # Center (X: 0-1, Y: 0-1)
text_strip.font_size = 100
text_strip.color = (1, 1, 1, 1)  # White

# Animate text: typewriter effect
for i in range(len(text_content) + 1):
    text_strip.text = text_content[:i]
    text_strip.frame_start = 1
    text_strip.frame_final_duration = len(text_content) * 5
    text_strip.keyframe_insert(data_path="text", frame=i * 5)

# Match total length
scene.frame_end = max(video_strip.frame_final_duration, text_strip.frame_final_duration)

# Output settings
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.audio_codec = 'AAC'
scene.render.filepath = os.path.join(script_dir, "overlayed_group_21.mp4")

# Render final video
bpy.ops.render.render(animation=True)
