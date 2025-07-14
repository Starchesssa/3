
import cv2
import mediapipe as mp
import json

INPUT_VIDEO = "output.mp4"
OUTPUT_VIDEO = "output_person_detection.mp4"
TIMELINE_FILE = "timeline.json"
SEGMENT_DURATION = 5  # seconds per segment

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(
    static_image_mode=False,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)

cap = cv2.VideoCapture(INPUT_VIDEO)
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(OUTPUT_VIDEO, fourcc, fps, (width, height))

segments = []
current_segment = {"start": 0, "end": SEGMENT_DURATION, "person": False}
frame_idx = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    time_sec = frame_idx / fps

    # Update segment
    if time_sec >= current_segment["end"]:
        segments.append(current_segment.copy())
        current_segment["start"] = current_segment["end"]
        current_segment["end"] += SEGMENT_DURATION
        current_segment["person"] = False

    # Process frame
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(rgb)

    detected = False
    if results.pose_landmarks:
        mp_drawing.draw_landmarks(
            frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS
        )
        detected = True

    # If any person seen in segment, mark it
    if detected:
        current_segment["person"] = True

    text = "Person Detected" if detected else "No Person"
    cv2.putText(frame, text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if detected else (0, 0, 255), 2)

    out.write(frame)
    frame_idx += 1

# Append final segment
segments.append(current_segment)

# Write timeline
with open(TIMELINE_FILE, "w") as f:
    json.dump(segments, f, indent=2)

cap.release()
out.release()
pose.close()

print(f"✅ Saved annotated video: {OUTPUT_VIDEO}")
print(f"✅ Saved timeline file: {TIMELINE_FILE}")
