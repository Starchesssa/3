
from manim import *
import cv2 as cv
import numpy as np
import os

# === Parameters ===
IMAGE_PATH = "BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg"
OUTPUT_PATH = "BOOK_CODE/PARALLAX/output_cv2_parallax.mp4"
NUM_LAYERS = 5
FRAME_SCALE = 6
LAYER_SPACING = 1.2
SCENE_DURATION = 6

class ShatteredMirrorParallax(ThreeDScene):
    def construct(self):
        # === Load and preprocess image ===
        img = cv.imread(IMAGE_PATH)
        if img is None:
            raise FileNotFoundError(f"Image not found: {IMAGE_PATH}")
        img = cv.cvtColor(img, cv.COLOR_BGR2RGB)
        h, w = img.shape[:2]
        min_dim = min(h, w)
        img = img[(h - min_dim)//2:(h + min_dim)//2, (w - min_dim)//2:(w + min_dim)//2]
        img = cv.resize(img, (512, 512))

        # === Create circular slices ===
        slices = []
        center = (256, 256)
        max_radius = 256
        for i in range(NUM_LAYERS):
            mask = np.zeros((512, 512), dtype=np.uint8)
            outer_r = int(max_radius * (i + 1) / NUM_LAYERS)
            inner_r = int(max_radius * i / NUM_LAYERS)
            cv.circle(mask, center, outer_r, 255, -1)
            if inner_r > 0:
                cv.circle(mask, center, inner_r, 0, -1)
            slice_img = cv.bitwise_and(img, img, mask=mask)
            slices.append(slice_img)

        # === Convert slices to ImageMobjects and stack in 3D ===
        image_mobs = []
        for i, layer in enumerate(slices):
            mob = ImageMobject(layer)
            mob.scale(FRAME_SCALE / 6)
            mob.move_to(ORIGIN + OUT * (LAYER_SPACING * i))
            image_mobs.append(mob)

        # === Add layers to scene ===
        self.set_camera_orientation(phi=75 * DEGREES, theta=0 * DEGREES)
        for mob in image_mobs:
            self.add(mob)

        # === Animate camera fly-through ===
        final_z = image_mobs[-1].get_center()[2] + LAYER_SPACING
        self.play(
            self.camera.frame.animate.move_to([0, 0, final_z]),
            run_time=SCENE_DURATION,
            rate_func=linear
        )

# === Save output to custom path ===
config.output_file = OUTPUT_PATH
config.verbosity = "WARNING"
config.format = "mp4"
config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
