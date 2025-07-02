
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

# ✅ Do NOT change these
CLIENT_ID = '60660374044-0s6mlj99gubn63vfuvbhgtkhuccbho7k.apps.googleusercontent.com'
CLIENT_SECRET = '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'
REFRESH_TOKEN = '1//03bK5bxFh2PuqCgYIARAAGAMSNwF-L9IrBjUHUd9ayrpNAlhsMyH027POZ-VlG_OfDsetYF0VJ9ZCcboYO4vxm0fzqhs0rQwPcbQ'

creds = Credentials(
    token=None,
    refresh_token=REFRESH_TOKEN,
    token_uri='https://oauth2.googleapis.com/token',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET
)

try:
    creds.refresh(Request())
    print("✅ Access token refreshed successfully!")
    print("🔑 New Access Token:", creds.token)

    # Save token to YT.txt as required
    with open("YT.txt", "w") as f:
        f.write(creds.token)

except Exception as e:
    print("❌ Failed to refresh access token.")
    print("Error:", e)
