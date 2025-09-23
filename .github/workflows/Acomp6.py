
name: Run comp6a.py

on:
  workflow_dispatch:   # run manually
  push:
    paths:
      - "BOOK_CODE/COMPANY_BIO/comp6a.py"
      - ".github/workflows/comp6a.yml"

jobs:
  run-script:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install google-genai

      - name: Run comp6a.py
        env:
          GEMINI_API: ${{ secrets.GEMINI_API }}
          GEMINI_API2: ${{ secrets.GEMINI_API2 }}
          GEMINI_API3: ${{ secrets.GEMINI_API3 }}
          GEMINI_API4: ${{ secrets.GEMINI_API4 }}
          GEMINI_API5: ${{ secrets.GEMINI_API5 }}
        run: |
          python BOOK_CODE/COMPANY_BIO/comp6a.py
