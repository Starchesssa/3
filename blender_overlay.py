
import bpy
import os

# Set up paths
script_dir = os.path.dirname(bpy.data.filepath)
video_path = os.path.join(script_dir, "group_21.mp4")
output_path = os.path.join(script_dir, "overlayed_group_21.mp4")

# Reset Blender to default scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.sequence_editor_create()

# Add video to channel 1
video = scene.sequence_editor.sequences.new_movie(
    name="Video",
    filepath=video_path,
    channel=1,
    frame_start=1
)

# Add text overlay to channel 2
text = scene.sequence_editor.sequences.new_effect(
    name="TextOverlay",
    type='TEXT',
    channel=2,
    frame_start=30,
    frame_end=150
)
text.text = "Welcome to Paradise"
text.font_size = 100
text.location = (0.5, 0.1)  # center-bottom
text.align_x = 'CENTER'
text.align_y = 'BOTTOM'
text.color = (1, 1, 1, 1)  # white
text.blend_type = 'ALPHA_OVER'

# Add fade-in to text using opacity keyframes
text.opacity = 0.0
text.keyframe_insert(data_path="opacity", frame=30)
text.opacity = 1.0
text.keyframe_insert(data_path="opacity", frame=60)

# Frame settings
scene.frame_start = 1
scene.frame_end = video.frame_final_duration

# Output settings
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.audio_codec = 'AAC'
scene.render.filepath = output_path

# Render video
bpy.ops.render.render(animation=True)
