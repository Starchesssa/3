
import os
import re
import requests

API_KEY = 'YOUTUBE_API'
BASE_DIR = 'Unuusual_memory'
RELEVANT_DIR = os.path.join(BASE_DIR, 'Relevant')
LINKS_DIR = os.path.join(BASE_DIR, 'Links')
DURATION_DIR = os.path.join(BASE_DIR, 'DURATION')

# Create DURATION_DIR if it doesn't exist
os.makedirs(DURATION_DIR, exist_ok=True)

def get_video_id_from_url(url):
    # Extract video id from url like https://www.youtube.com/watch?v=VIDEO_ID
    match = re.search(r'v=([a-zA-Z0-9_-]{11})', url)
    return match.group(1) if match else None

def get_duration(video_id):
    url = f"https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id={video_id}&key={API_KEY}"
    response = requests.get(url).json()
    items = response.get('items')
    if not items:
        return None
    duration = items[0]['contentDetails']['duration']
    return duration

def parse_duration(iso_duration):
    # Convert ISO 8601 duration (e.g. PT1H2M10S) to seconds
    import isodate
    td = isodate.parse_duration(iso_duration)
    return int(td.total_seconds())

def main():
    relevant_files = sorted(os.listdir(RELEVANT_DIR))
    link_files = sorted(os.listdir(LINKS_DIR))

    for relevant_file in relevant_files:
        # Example: 1(a)_robot_window_cleaner.txt
        match = re.match(r'(\d+)(\w)_.*\.txt', relevant_file)
        if not match:
            print(f"Skipping unmatched file: {relevant_file}")
            continue

        number = int(match.group(1))  # e.g., 1 or 10
        letter = match.group(2)       # e.g., a, b, c...

        # Calculate link index (a=1, b=2, ...)
        link_index = ord(letter.lower()) - ord('a')

        # Match the links file name: e.g. 1_robot_window_cleaner.txt or 10_smart_mirror_display.txt
        # We'll look for a file in LINKS_DIR starting with f"{number}_"
        link_file = None
        for lf in link_files:
            if lf.startswith(f"{number}_"):
                link_file = lf
                break

        if not link_file:
            print(f"No matching link file for {relevant_file}")
            continue

        # Read all links from the link file
        with open(os.path.join(LINKS_DIR, link_file), 'r') as f:
            links = [line.strip() for line in f if line.strip()]

        # Check if link_index is valid for the links file
        if link_index >= len(links):
            print(f"Link index {link_index} out of range in {link_file} for {relevant_file}")
            continue

        video_url = links[link_index]
        video_id = get_video_id_from_url(video_url)
        if not video_id:
            print(f"Invalid video URL in {link_file}: {video_url}")
            continue

        duration_iso = get_duration(video_id)
        if not duration_iso:
            print(f"Could not get duration for video id {video_id}")
            continue

        duration_seconds = parse_duration(duration_iso)

        # Write to DURATION_DIR
        out_path = os.path.join(DURATION_DIR, relevant_file)
        with open(out_path, 'w') as out_f:
            out_f.write(f"{video_url}\nDuration (ISO 8601): {duration_iso}\nDuration (seconds): {duration_seconds}\n")

        print(f"Processed {relevant_file}: duration {duration_seconds} seconds")

if __name__ == "__main__":
    main()
