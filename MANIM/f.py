
import cv2
import os
import mediapipe as mp
import numpy as np

INPUT_DIR = "MANIM/Imag_samples"
OUTPUT_DIR = "MANIM/output"

os.makedirs(OUTPUT_DIR, exist_ok=True)

mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=10,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

for file in os.listdir(INPUT_DIR):
    if not file.lower().endswith((".jpg", ".jpeg", ".png")):
        continue

    path = os.path.join(INPUT_DIR, file)
    image = cv2.imread(path)
    if image is None:
        continue

    h, w = image.shape[:2]
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            points = []
            for lm in face_landmarks.landmark:
                x = int(lm.x * w)
                y = int(lm.y * h)
                points.append([x, y])

            points = np.array(points, dtype=np.int32)

            # Create real mask
            mask = np.zeros((h, w), dtype=np.uint8)
            hull = cv2.convexHull(points)
            cv2.fillConvexPoly(mask, hull, 255)

            # Apply mask (black face)
            image[mask == 255] = (0, 0, 0)

    cv2.imwrite(os.path.join(OUTPUT_DIR, file), image)

print("✅ Real face masks created.")
