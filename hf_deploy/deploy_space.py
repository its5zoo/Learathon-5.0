import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from huggingface_hub import HfApi, create_repo, login

HF_TOKEN = os.environ.get("HF_TOKEN") or "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"

def main():
    print("=" * 65)
    print(">>> Hugging Face Space Auto-Deployer for SoulSpace AI API")
    print("=" * 65)

    login(token=HF_TOKEN)
    api = HfApi(token=HF_TOKEN)

    user_info = api.whoami()
    username = user_info["name"]
    print(f"Logged in as: {username}")

    space_name = "soulspace-gemma-api"
    space_repo_id = f"{username}/{space_name}"
    print(f"Target Space Repository: {space_repo_id}")

    print("\n[1/2] Creating/Verifying Space on Hugging Face...")
    create_repo(
        repo_id=space_repo_id,
        repo_type="space",
        space_sdk="docker",
        token=HF_TOKEN,
        exist_ok=True
    )
    print("Space repository initialized on Hugging Face!")

    space_dir = os.path.join(os.path.dirname(__file__), "space_app")

    print("\n[2/2] Uploading server files (app.py, Dockerfile, requirements.txt)...")
    api.upload_folder(
        folder_path=space_dir,
        repo_id=space_repo_id,
        repo_type="space",
    )

    print("\n" + "=" * 65)
    print("SUCCESS: Your Hugging Face Space is building!")
    print(f"View Space Dashboard: https://huggingface.co/spaces/{space_repo_id}")
    print(f"Direct API Endpoint URL: https://{username.lower()}-{space_name}.hf.space/v1/chat/completions")
    print("=" * 65)

if __name__ == "__main__":
    main()
