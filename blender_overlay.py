
import bpy
import os

# === CONFIG ===
input_video = "group_21.mp4"
output_path = "//overlayed_group_21.mp4"
text_to_write = "Group 21"
font_path = bpy.path.abspath("//FontsFree-Net-Proxima-Nova-Bold-It.otf.ttf")

# === CLEAN UP SCENE ===
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# === SETUP SCENE ===
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 200
scene.render.fps = 24
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.constant_rate_factor = 'HIGH'
scene.render.filepath = output_path

# === LOAD VIDEO ===
bpy.ops.import_movie.clip(filepath=input_video)
clip = bpy.data.movieclips[0]

# Add video as background in the compositor
scene.use_nodes = True
tree = scene.node_tree
tree.nodes.clear()

# Add nodes
movie_node = tree.nodes.new("CompositorNodeMovieClip")
movie_node.clip = clip

comp_scale = tree.nodes.new("CompositorNodeScale")
comp_scale.space = 'RENDER_SIZE'

alpha_over = tree.nodes.new("CompositorNodeAlphaOver")
output_node = tree.nodes.new("CompositorNodeComposite")

# Link nodes
tree.links.new(movie_node.outputs["Image"], comp_scale.inputs["Image"])
tree.links.new(comp_scale.outputs["Image"], alpha_over.inputs[1])
tree.links.new(alpha_over.outputs["Image"], output_node.inputs["Image"])

# === ADD TEXT ===
bpy.ops.object.text_add(location=(0, 0, 0))
text_obj = bpy.context.object
text_obj.data.body = ""
text_obj.data.font = bpy.data.fonts.load(font_path)
text_obj.data.size = 1.5
text_obj.location = (-5, 0, 0)
text_obj.data.align_x = 'CENTER'
text_obj.data.align_y = 'CENTER'

# CAMERA
cam = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
scene.collection.objects.link(cam)
scene.camera = cam
cam.location = (0, -10, 0)
cam.rotation_euler = (1.5708, 0, 0)

# LIGHT
light_data = bpy.data.lights.new(name="light", type='POINT')
light_object = bpy.data.objects.new(name="light", object_data=light_data)
scene.collection.objects.link(light_object)
light_object.location = (0, -6, 6)

# === TYPEWRITER ANIMATION ===
for i in range(1, len(text_to_write) + 1):
    text_obj.data.body = text_to_write[:i]
    text_obj.data.keyframe_insert(data_path="body", frame=1 + (i * 4))

# === ADD GLOW (optional) ===
mat = bpy.data.materials.new(name="GlowMat")
mat.use_nodes = True
nodes = mat.node_tree.nodes
emission = nodes.new(type='ShaderNodeEmission')
output = nodes['Material Output']
nodes.remove(nodes['Principled BSDF'])
mat.node_tree.links.new(emission.outputs['Emission'], output.inputs['Surface'])
emission.inputs['Color'].default_value = (0.3, 0.6, 1.0, 1)
emission.inputs['Strength'].default_value = 50
text_obj.data.materials.append(mat)

# === RENDER ===
bpy.ops.render.render(animation=True)
