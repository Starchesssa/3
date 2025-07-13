
import bpy
import os

# Path to your input video
video_path = os.path.join(os.path.dirname(bpy.data.filepath), "input.mp4")

# Reset Blender to an empty scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Create a new scene
scene = bpy.context.scene
scene.sequence_editor_create()

# Add video strip to the sequencer
scene.sequence_editor.sequences.new_movie(
    name="MyVideo",
    filepath=video_path,
    channel=1,
    frame_start=1
)

# Set output render settings
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.audio_codec = 'AAC'
scene.render.filepath = os.path.join(os.path.dirname(bpy.data.filepath), "output.mp4")

# Set end frame (adjust this to match your video length if needed)
scene.frame_end = 250  # default; you may adjust this based on input.mp4 duration

# Render the animation
bpy.ops.render.render(animation=True)
