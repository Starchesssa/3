
import os
import glob
import praw
import prawcore  # Needed for OAuth exceptions

# === Paths ===
POSTS_DIR = "REDDIT/THEMES/Company bio/BOOKS/POSTS"
IMG_DIR = "REDDIT/THEMES/Company bio/BOOKS/IMG"
AFF_AMAZON = "REDDIT/THEMES/Company bio/BOOKS/AFF/amazon.txt"
AFF_AUDIBLE = "REDDIT/THEMES/Company bio/BOOKS/AFF/audible.txt"

# === Load Affiliate Links ===
def load_aff_link(path):
    if not os.path.exists(path):
        return None
    with open(path, "r") as f:
        return f.read().strip()

amazon_link = load_aff_link(AFF_AMAZON)
audible_link = load_aff_link(AFF_AUDIBLE)

# === Select Post File ===
txt_files = glob.glob(os.path.join(POSTS_DIR, "*.txt"))
if not txt_files:
    raise FileNotFoundError("❌ No post .txt files found.")
post_file = txt_files[0]  # pick first
with open(post_file, "r", encoding="utf-8") as f:
    post_text = f.read()

# === Format Post ===
lines = post_text.split("\n")
if lines:
    # Convert headline (first line) to title case
    lines[0] = lines[0].title()
post_text = "\n".join(lines)

# Remove asterisks
post_text = post_text.replace("*", "")

# Replace placeholders with Markdown-shortened affiliate links
if amazon_link:
    post_text = post_text.replace("(AMAZON LINK)", f"[Amazon]({amazon_link})")
if audible_link:
    post_text = post_text.replace("(AUDIBLE LINK)", f"[Audible]({audible_link})")

# === Select Image ===
image_files = glob.glob(os.path.join(IMG_DIR, "*.*"))
image_file = image_files[0] if image_files else None

# === Reddit API credentials from environment ===
reddit = praw.Reddit(
    client_id=os.environ.get("REDDIT_CLIENT_ID"),
    client_secret=os.environ.get("REDDIT_CLIENT_SECRETE"),
    refresh_token=os.environ.get("REDDIT_REFRESH_TOKEN"),
    user_agent="CompanyBioBot/1.0"
)

# === Subreddit name ===
subreddit_name = "your_subreddit_name_here"  # Replace with your subreddit
title = lines[0] if lines else "New Book Post"

try:
    if image_file:
        print(f"📤 Posting with image: {image_file}")
        reddit.subreddit(subreddit_name).submit_image(title=title, image_path=image_file, body=post_text)
    else:
        print("📤 Posting text only")
        reddit.subreddit(subreddit_name).submit(title=title, selftext=post_text)
except praw.exceptions.APIException as e:
    print(f"❌ Reddit API error: {e}")
except prawcore.exceptions.OAuthException as e:
    print(f"❌ OAuth error: {e}")
except prawcore.exceptions.InsufficientScope:
    print("❌ Insufficient OAuth scope. Make sure your refresh token includes 'submit' scope and the account can post to the subreddit.")
except Exception as e:
    print(f"❌ Unexpected error: {e}")
else:
    print("✅ Post submitted successfully!")
