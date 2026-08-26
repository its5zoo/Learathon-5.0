import os
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from huggingface_hub import HfApi, create_repo, login

HF_TOKEN = os.environ.get("HF_TOKEN") or "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"

def main():
    print("=" * 65)
    print(">>> 3BrainCell Gemma GGUF -> Hugging Face Auto-Uploader")
    print("=" * 65)

    login(token=HF_TOKEN)
    api = HfApi(token=HF_TOKEN)

    user_info = api.whoami()
    username = user_info["name"]
    print(f"Logged in as Hugging Face User: {username}")

    model_repo_id = f"{username}/gemma-mentalhealth-3braincell"
    print(f"Target Model Repository: {model_repo_id}")

    print("\n[1/2] Creating/Verifying Model Repository on Hugging Face...")
    create_repo(repo_id=model_repo_id, repo_type="model", token=HF_TOKEN, exist_ok=True)
    print("Model repository is ready!")

    model_file_path = r"D:\LLM\gemma-mentalhealth-trained-by-three-brain-cell-2026-learathon.gguf"
    if not os.path.exists(model_file_path):
        print(f"ERROR: Model file not found at: {model_file_path}")
        sys.exit(1)

    file_size_gb = os.path.getsize(model_file_path) / (1024 ** 3)
    print(f"\n[2/2] Uploading {file_size_gb:.2f} GB GGUF Model...")
    print("Please wait while the 5GB file uploads to Hugging Face...")

    api.upload_file(
        path_or_fileobj=model_file_path,
        path_in_repo="gemma-mentalhealth-trained-by-three-brain-cell-2026-learathon.gguf",
        repo_id=model_repo_id,
        repo_type="model",
    )

    print("\n" + "=" * 65)
    print("SUCCESS: 5GB GGUF Model is uploaded and live on Hugging Face!")
    print(f"Model URL: https://huggingface.co/{model_repo_id}")
    print("=" * 65)

if __name__ == "__main__":
    main()
