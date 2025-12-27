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
    refine_landmarks=False,              # 🔧 turn OFF refinement
    min_detection_confidence=0.2          # 🔧 LOWER threshold
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

    print(file, "faces:", 0 if not results.multi_face_landmarks else len(results.multi_face_landmarks))

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            points = np.array(
                [[int(lm.x * w), int(lm.y * h)] for lm in face_landmarks.landmark],
                dtype=np.int32
            )

            mask = np.zeros((h, w), dtype=np.uint8)
            hull = cv2.convexHull(points)
            cv2.fillConvexPoly(mask, hull, 255)

            # 🔥 GUARANTEED VISIBLE BLACK MASK
            image[mask == 255] = (0, 0, 0)

            # DEBUG TEXT
            cv2.putText(image, "FACE MASK APPLIED", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    cv2.imwrite(os.path.join(OUTPUT_DIR, file), image)

face_mesh.close()
print("✅ Finished.")
