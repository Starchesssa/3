
import os
import subprocess
from datetime import datetime
from google import genai
from google.genai import types

CATEGORY_FILE = "CATEGORY/categories.txt"
MEMORY_FILE = "Unuusual_memory/Category/Category.txt"

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
    print("\n📦 Committing changes to GitHub...")
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

        # Build contents with text prompt only (no file part since you want just text)
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)]
            )
        ]
        generate_content_config = types.GenerateContentConfig(response_mime_type="text/plain")

        full_response = ""
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            # Accumulate streamed text chunks
            full_response += chunk.text

        return full_response.strip()

    except Exception as e:
        print(f"❌ Gemini API failed: {e}")
        return None

def main():
    categories = load_categories()
    memory = load_memory()

    next_cat = get_next_category(categories, memory)
    print(f"\n📌 Using category: {next_cat}")

    updated_categories = mark_used_category(categories, next_cat)
    save_categories(updated_categories)  # Save the category file updated with marks

    commit_changes(CATEGORY_FILE)  # Commit only the category file

    # Build your custom prompt as requested
    prompt = (
        f"Mention me most unusual gadgets in the world related to {next_cat}. "
        "Just mention the gadgets, don't explain anything, don't include anything in output other than the gadgets only, and number the gadgets please."
    )
    print(f"\n🧠 Prompt:\n{prompt}")

    # Call Gemini API with your prompt
    result = call_gemini_api(prompt)

    if result:
        print("\n💡 Gemini API Result:\n" + result)
    else:
        print("\n⚠️ No result from Gemini API.")

if __name__ == "__main__":
    main()
