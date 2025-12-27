
import cv2
import os
import mediapipe as mp

INPUT_DIR = "MANIM/Imag_samples"
OUTPUT_DIR = "MANIM/output"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ✅ Correct access (works only with proper mediapipe build)
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_styles = mp.solutions.drawing_styles

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

    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            # Mask-like tessellation
            mp_drawing.draw_landmarks(
                image=image,
                landmark_list=face_landmarks,
                connections=mp_face_mesh.FACEMESH_TESSELATION,
                landmark_drawing_spec=None,
                connection_drawing_spec=mp_styles
                .get_default_face_mesh_tesselation_style()
            )

            # Strong edge (mask border)
            mp_drawing.draw_landmarks(
                image=image,
                landmark_list=face_landmarks,
                connections=mp_face_mesh.FACEMESH_CONTOURS,
                landmark_drawing_spec=None,
                connection_drawing_spec=mp_styles
                .get_default_face_mesh_contours_style()
            )

    cv2.imwrite(os.path.join(OUTPUT_DIR, file), image)

print("✅ Face mesh mask artifacts created.")
