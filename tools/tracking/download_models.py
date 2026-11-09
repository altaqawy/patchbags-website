#!/usr/bin/env python3
"""Download official MediaPipe model bundles for local Patch Bags tests.

Only downloads model weights; no webcam/video/landmark data is uploaded.
"""
from __future__ import annotations

import argparse
import hashlib
import urllib.request
from pathlib import Path

MODELS = {
    "hand_landmarker.task":
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/"
        "hand_landmarker/float16/1/hand_landmarker.task",
    "pose_landmarker_full.task":
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
        "pose_landmarker_full/float16/1/pose_landmarker_full.task",
    "pose_landmarker_lite.task":
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
        "pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
}
MAX_MODEL_BYTES = 40 * 1024 * 1024


def download_models(destination: Path, include_lite: bool = False, force: bool = False) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    targets = list(MODELS.items())
    if not include_lite:
        targets = [(name, url) for name, url in targets if "lite" not in name]
    for name, url in targets:
        path = destination / name
        if path.is_file() and path.stat().st_size >= 100_000 and not force:
            print(f"Already present: {path} ({path.stat().st_size:,} bytes)")
            continue
        request = urllib.request.Request(
            url, headers={"User-Agent": "PatchBags-Local-Model-Downloader/1.0"}
        )
        print(f"Downloading official model: {name}")
        digest = hashlib.sha256()
        received = 0
        temp = path.with_suffix(path.suffix + ".part")
        try:
            with urllib.request.urlopen(request, timeout=90) as response, temp.open("wb") as out:
                if response.geturl().split(":", 1)[0] != "https":
                    raise ValueError("Model download redirected to an insecure URL")
                while True:
                    chunk = response.read(1024 * 1024)
                    if not chunk:
                        break
                    received += len(chunk)
                    if received > MAX_MODEL_BYTES:
                        raise ValueError("Model too large")
                    digest.update(chunk)
                    out.write(chunk)
            if received < 100_000:
                raise ValueError(f"Suspiciously small model ({received} bytes)")
            temp.replace(path)
            print(f"Saved {path} | {received:,} bytes | SHA-256 {digest.hexdigest()}")
        except Exception:
            temp.unlink(missing_ok=True)
            raise


def main() -> None:
    parser = argparse.ArgumentParser(description="Download official MediaPipe hand and body models.")
    parser.add_argument("--output-dir", type=Path, default=Path(__file__).resolve().parent / "models")
    parser.add_argument("--include-lite", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    download_models(args.output_dir, args.include_lite, args.force)


if __name__ == "__main__":
    main()
