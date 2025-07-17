


name: Run Unusual Download on

on:
  workflow_dispatch:
  schedule:
    - cron: '0 */6 * * *'  # every 6 hours

jobs:
  unusual-download:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Set up Python 3.11
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install Python packages
        run: |
          pip install --upgrade pip
          pip install google-genai

      - name: Install yt-dlp
        run: |
          sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
          sudo chmod a+rx /usr/local/bin/yt-dlp

      - name: Install ffmpeg
        run: sudo apt-get update && sudo apt-get install -y ffmpeg

      - name: Run Unusual_download.py
        run: python Unusual_download2.py

      - name: Upload downloaded videos as artifact
        uses: actions/upload-artifact@v4
        with:
          name: downloaded-videos
          path: Vid/
