
import os
import subprocess
from datetime import datetime
from google import genai
from google.genai import types

CATEGORY_FILE = "CATEGORY/categories.txt"
MEMORY_FILE = "Unuusual_memory/Category/Category.txt"
OUTPUT_FILE = "CATEGORY/Products_temp.txt"

def load_categories():
    with open(CATEGORY_FILE, 'r', encoding='utf-8') as f:
        return [line.rstrip(' \n') for line in f if line.strip()]

def load_memory():
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, 'r', encoding='utf-8') as f:
            return [line.rstrip(' \n') for line in f if line.strip()]
    return []

def get_next_category(categories, memory):
    clean_categories = [c.replace(' ■■■', '') for c in categories]
    used_clean = [m.replace(' ■■■', '') for m in memory]
    for category in clean_categories:
        if category not in used_clean:
            return category
    return clean_categories[0]  # restart if all used

def mark_used_category(categories, used_category):
    return [
        (cat + ' ■■■') if cat == used_category else cat
        for cat in [c.replace(' ■■■', '') for c in categories]
    ]

def save_categories(updated_categories):
    os.makedirs(os.path.dirname(CATEGORY_FILE), exist_ok=True)
    with open(CATEGORY_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(updated_categories) + '\n')

def commit_changes(file_to_commit):
    print(f"\n📦 Committing changes to GitHub: {file_to_commit}")
    try:
        subprocess.run(['git', 'config', '--global', 'user.name', 'category-bot'], check=True)
        subprocess.run(['git', 'config', '--global', 'user.email', 'bot@example.com'], check=True)
        subprocess.run(['git', 'add', file_to_commit], check=True)
        result = subprocess.run(['git', 'diff', '--cached', '--quiet'])
        if result.returncode != 0:
            msg = f"✅ Update {file_to_commit} - {datetime.utcnow().isoformat()}"
            subprocess.run(['git', 'commit', '-m', msg], check=True)
            subprocess.run(['git', 'push'], check=True)
            print("✅ Changes committed and pushed.")
        else:
            print("ℹ️ No changes to commit.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Git commit failed: {e}")

def call_gemini_api(prompt):
    try:
        client = genai.Client(api_key=os.environ.get("GEMINI_API"))
        model = "gemini-2.0-flash"
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
        config = types.GenerateContentConfig(response_mime_type="text/plain")
        full_response = ""
        for chunk in client.models.generate_content_stream(model=model, contents=contents, config=config):
            full_response += chunk.text
        return full_response.strip()
    except Exception as e:
        print(f"❌ Gemini API failed: {e}")
        return None

def save_output(content, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')

def main():
    categories = load_categories()
    memory = load_memory()
    next_cat = get_next_category(categories, memory)
    print(f"\n📌 Using category: {next_cat}")

    updated_categories = mark_used_category(categories, next_cat)
    save_categories(updated_categories)
    commit_changes(CATEGORY_FILE)

    prompt = (
        f"You are a world-renowned YouTube expert known for creating viral gadget compilation videos. "
        f"From the ({next_cat}) category, list 30 of the **most unusual, bizarre, and mind-blowing gadgets** currently available on Earth that would go viral in a YouTube compilation video.\n\n"
        "⚠️ Strict Rules:\n"
        "• Every item must mention its actual product name\n"
        "• Do NOT include any haram items (e.g., sex toys, alcohol-related devices, gadgets promoting nudity, or religiously inappropriate tools)\n"
        "• Only include gadgets that are real, purchasable, or recently announced by reputable companies — avoid fictional concepts or science-fiction-only inventions\n"
        "• Avoid obvious or common gadgets. Prioritize uniqueness and surprise factor\n"
        "• Your goal is to amaze the viewer and trigger curiosity, fascination, or obsession\n"
        "• Do not include any commentary or explanations — only the exact product names, one per line\n"
        "• Do not mention numbers (e.g., “top 10”), years (e.g., “2024”), or any personal perspectives (e.g., “I used…”)\n"
        "• Avoid anything inappropriate for a general global audience\n\n"
        "Emotion to trigger: curiosity, amazement, obsession\n\n"
        "Format: A numbered list (1 to 30) of the actual product names only. Do not include descriptions or extra text."
    )

    print(f"\n🧠 Prompt:\n{prompt}")
    result = call_gemini_api(prompt)

    if result:
        save_output(result, OUTPUT_FILE)
        print("\n💡 Gemini API Result saved to:", OUTPUT_FILE)
        commit_changes(OUTPUT_FILE)
    else:
        print("\n⚠️ No result from Gemini API.")

if __name__ == "__main__":
    main()
