from huggingface_hub import login, upload_folder


def main():
    # This opens an interactive prompt for your Hugging Face access token.
    # Create a token with Write permission at:
    # https://huggingface.co/settings/tokens
    login()

    upload_folder(
        folder_path=".",
        repo_id="nutchayaporn/wifi-csi-har-lstm",
        repo_type="model",
        ignore_patterns=[
            ".git/*",
            "__pycache__/*",
            "*.pyc",
        ],
    )

    print("Uploaded to https://huggingface.co/nutchayaporn/wifi-csi-har-lstm")


if __name__ == "__main__":
    main()
