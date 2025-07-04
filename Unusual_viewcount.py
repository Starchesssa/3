
import os
import re
import requests
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

load_dotenv()  # Load .env file

API_KEY = os.getenv('YOUTUBE_API')
INPUT_DIR = 'Unuusual_memory/Relevant_links'
OUTPUT_DIR = 'Unuusual_memory/VIEW_COUNT'

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

def extract_video_id(link):
    """Extract YouTube video ID from URL."""
    parsed_url = urlparse(link.strip())
    if 'youtu.be' in parsed_url.netloc:
        return parsed_url.path.lstrip('/')
    elif 'youtube.com' in parsed_url.netloc:
        qs = parse_qs(parsed_url.query)
        return qs.get('v', [None])[0]
    return None

def fetch_view_counts(video_ids):
    """Fetch view counts for up to 50 video IDs."""
    url = 'https://www.googleapis.com/youtube/v3/videos'
    params = {
        'part': 'statistics',
        'id': ','.join(video_ids),
        'key': API_KEY
    }
    response = requests.get(url, params=params)
    if response.ok:
        data = response.json()
        return {item['id']: item['statistics'].get('viewCount', '0') for item in data.get('items', [])}
    else:
        print(f"API Error: {response.text}")
        return {}

# Process each valid file
for filename in os.listdir(INPUT_DIR):
    if filename.endswith('.txt') and re.match(r'^\d', filename):
        input_path = os.path.join(INPUT_DIR, filename)
        output_path = os.path.join(OUTPUT_DIR, filename)
        print(f"Processing {filename}...")

        with open(input_path, 'r') as f:
            links = [line.strip() for line in f if line.strip()]

        video_id_map = {}  # Map of link → video_id
        for link in links:
            video_id = extract_video_id(link)
            if video_id:
                video_id_map[link] = video_id

        # Batch query view counts
        view_counts = {}
        video_ids = list(video_id_map.values())
        for i in range(0, len(video_ids), 50):
            batch = video_ids[i:i+50]
            batch_counts = fetch_view_counts(batch)
            view_counts.update(batch_counts)

        # Write output
        with open(output_path, 'w') as out_f:
            for link in links:
                video_id = video_id_map.get(link)
                count = view_counts.get(video_id, '0') if video_id else 'N/A'
                out_f.write(f"{count} - {link}\n")

        print(f"Done: {output_path}")

print("✅ All files processed.")
