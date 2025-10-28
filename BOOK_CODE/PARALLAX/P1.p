from manim import *
import cv2 as cv
import numpy as np

# === Input image path ===
IMAGE_PATH = "BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg"

# === Parameters ===
NUM_LAYERS = 8
FRAME_SCALE = 6
LAYER_SPACING = 1.5
SCENE_DURATION = 6
TARGET_WIDTH = 512
TARGET_HEIGHT = int(TARGET_WIDTH * 9 / 16)

class ShatteredMirrorParallax(ThreeDScene):
    def construct(self):
        # === Load and resize image to 16:9 ===
        img = cv.imread(IMAGE_PATH, cv.IMREAD_UNCHANGED)
        if img is None:
            raise FileNotFoundError(f"Image not found: {IMAGE_PATH}")
        img = cv.cvtColor(img, cv.COLOR_BGR2BGRA)
        img = cv.resize(img, (TARGET_WIDTH, TARGET_HEIGHT))

        # === Create concentric circular alpha masks ===
        slices = []
        center = (TARGET_WIDTH // 2, TARGET_HEIGHT // 2)
        max_radius = min(center)
        for i in range(NUM_LAYERS):
            mask = np.zeros((TARGET_HEIGHT, TARGET_WIDTH), dtype=np.uint8)
            outer_r = int(max_radius * (i + 1) / NUM_LAYERS)
            inner_r = int(max_radius * i / NUM_LAYERS)
            cv.circle(mask, center, outer_r, 255, -1)
            if inner_r > 0:
                cv.circle(mask, center, inner_r, 0, -1)

            rgba = img.copy()
            rgba[:, :, 3] = mask
            slices.append(rgba)

        # === Convert slices to ImageMobjects and stack in Z ===
        image_mobs = []
        for i, layer in enumerate(slices):
            mob = ImageMobject(layer)
            mob.scale(FRAME_SCALE / 6)
            mob.move_to([0, 0, -LAYER_SPACING * i])  # deeper into Z
            image_mobs.append(mob)

        # === Add layers to scene ===
        self.set_camera_orientation(phi=0 * DEGREES, theta=0 * DEGREES)
        for mob in image_mobs:
            self.add(mob)

        # === Animate camera fly-through ===
        final_z = image_mobs[-1].get_center()[2]
        self.move_camera(
            frame_center=[0, 0, final_z],
            run_time=SCENE_DURATION,
            rate_func=linear
        )
