
import os
import subprocess
from datetime import datetime

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

def save_memory(updated_categories):
    os.makedirs(os.path.dirname(MEMORY_FILE), exist_ok=True)
    with open(MEMORY_FILE, 'w', encoding='utf-8') as f:
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

def main():
    categories = load_categories()
    memory = load_memory()

    next_cat = get_next_category(categories, memory)
    print(f"\n📌 Using category: {next_cat}")

    updated = mark_used_category(categories, next_cat)
    save_memory(updated)
    commit_changes(MEMORY_FILE)

    # Build the prompt for external use
    prompt = (
        f"Mention me most unusual gadgets in the world related to {next_cat}. "
        "Just mention the gadgets, don't explain anything, don't include anything in output other than the gadgets only, and number the gadgets please."
    )
    print(f"\n🧠 Prompt:\n{prompt}")

if __name__ == "__main__":
    main()
