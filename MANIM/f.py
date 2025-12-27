import cv2
import os
import mediapipe as mp
import numpy as np

INPUT_DIR = "MANIM/Imag_samples"
OUTPUT_DIR = "MANIM/output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("🔹 Starting script...")
print("🔹 Input dir:", INPUT_DIR)
print("🔹 Output dir:", OUTPUT_DIR)

# ---- MediaPipe setup ----
print("🔹 Initializing MediaPipe FaceMesh...")
mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=10,
    refine_landmarks=False,
    min_detection_confidence=0.2
)

print("✅ FaceMesh initialized\n")

# ---- Process images ----
for file in sorted(os.listdir(INPUT_DIR)):

    print("--------------------------------------------------")
    print("📂 Processing file:", file)

    if not file.lower().endswith((".jpg", ".jpeg", ".png")):
        print("⚠️ Skipped (not an image)")
        continue

    path = os.path.join(INPUT_DIR, file)
    image = cv2.imread(path)

    if image is None:
        print("❌ Failed to read image")
        continue

    h, w = image.shape[:2]
    print(f"✅ Image loaded | Size: {w}x{h}")

    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    print("🔹 Running FaceMesh...")
    results = face_mesh.process(rgb)

    if not results.multi_face_landmarks:
        print("❌ NO faces detected")
    else:
        print(f"✅ Faces detected: {len(results.multi_face_landmarks)}")

        for i, face_landmarks in enumerate(results.multi_face_landmarks):
            print(f"🔸 Processing face #{i+1}")

            # ---- Draw FACE MESH (visible proof) ----
            for lm in face_landmarks.landmark:
                x = int(lm.x * w)
                y = int(lm.y * h)
                cv2.circle(image, (x, y), 1, (0, 255, 0), -1)

            print("   ✔ Face mesh drawn")

            # ---- Build mask ----
            points = np.array(
                [[int(lm.x * w), int(lm.y * h)] for lm in face_landmarks.landmark],
                dtype=np.int32
            )

            mask = np.zeros((h, w), dtype=np.uint8)
            hull = cv2.convexHull(points)
            cv2.fillConvexPoly(mask, hull, 255)

            print("   ✔ Face mask created")

            # ---- Apply BLACK MASK ----
            image[mask == 255] = (0, 0, 0)
            print("   ✔ Black mask applied")

            cv2.putText(
                image,
                "FACE DETECTED & MASKED",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                2
            )

    out_path = os.path.join(OUTPUT_DIR, file)
    cv2.imwrite(out_path, image)
    print("💾 Saved:", out_path)

print("\n✅ Finished processing all images.")
face_mesh.close()
