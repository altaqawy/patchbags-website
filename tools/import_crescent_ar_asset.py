#!/usr/bin/env python3
"""One-time import of the user's real PBR bag GLB into Patch Bags.

The source archive is checked against its original SHA-256 and must contain the
specified Blender-exported GLB. Recompress only embedded texture images and set
an *approximate* unit scale for AR; actual dimensions are not provided.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import struct
import urllib.request
import zipfile
from pathlib import Path

from PIL import Image

EXPECTED_ZIP_SHA256 = "70015e2723fa647309ff74b8d84f01fc72a8c4dcb87ef62357284cf73f154566"
SOURCE_NAME = "base_basic_pbr.glb"
WEB_SCALE = 0.22  # Source bounding box ~1.90m x 1.78m => approx .42m x .39m
MAX_DOWNLOAD = 60 * 1024 * 1024


def fetch_source(url: str) -> bytes:
    if not url.startswith("https://"):
        raise ValueError("HTTPS source URL is required")
    request = urllib.request.Request(
        url, headers={"User-Agent": "PatchBags-Authorized-Asset-Importer/1.0"}
    )
    with urllib.request.urlopen(request, timeout=110) as response:
        archive = response.read(MAX_DOWNLOAD + 1)
    if len(archive) > MAX_DOWNLOAD:
        raise ValueError("Source archive exceeds maximum supported size")
    actual = hashlib.sha256(archive).hexdigest()
    if actual != EXPECTED_ZIP_SHA256:
        raise ValueError(f"Source checksum mismatch: {actual}")
    return archive


def compress(source: bytes) -> bytes:
    magic, version, total_size = struct.unpack_from("<4sII", source, 0)
    if magic != b"glTF" or version != 2 or total_size != len(source):
        raise ValueError("Not a valid standalone glTF 2 GLB")
    json_len, json_type = struct.unpack_from("<I4s", source, 12)
    if json_type != b"JSON":
        raise ValueError("Expected a JSON chunk")
    document = json.loads(source[20:20 + json_len])
    binary_chunk_at = 20 + json_len
    bin_len, bin_type = struct.unpack_from("<I4s", source, binary_chunk_at)
    if bin_type != b"BIN\0":
        raise ValueError("Expected an embedded BIN chunk")
    binary = source[binary_chunk_at + 8:binary_chunk_at + 8 + bin_len]
    if len(binary) != bin_len:
        raise ValueError("Truncated GLB payload")

    image_views = {image["bufferView"]: image for image in document["images"]}
    output = bytearray()
    for index, view in enumerate(document["bufferViews"]):
        start = view.get("byteOffset", 0)
        content = binary[start:start + view["byteLength"]]
        if index in image_views:
            image = image_views[index]
            with Image.open(io.BytesIO(content)) as pic:
                pic = pic.convert("RGB")
                cap = 2048 if "diffuse" in image.get("name", "") else 1024
                if max(pic.size) > cap:
                    pic.thumbnail((cap, cap), Image.Resampling.LANCZOS)
                buffer = io.BytesIO()
                pic.save(
                    buffer, format="JPEG",
                    quality=90 if cap == 2048 else 94,
                    subsampling=1 if cap == 2048 else 0,
                    optimize=True,
                )
                content = buffer.getvalue()
                image["mimeType"] = "image/jpeg"
        while len(output) % 4:
            output.append(0)
        view["byteOffset"] = len(output)
        view["byteLength"] = len(content)
        output.extend(content)

    # Source model units were not measured against the actual physical bag.
    # Reduce the original ~1.90m geometry to a reasonable approximate size.
    document["nodes"][5]["scale"] = [WEB_SCALE] * 3
    document["asset"]["extras"] = {
        "modelRole": "illustrative reference for crescent-style crossbody",
        "arScaleEstimate": True,
        "measurementVerified": False,
    }
    document["buffers"][0]["byteLength"] = len(output)
    json_bytes = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode("utf8")
    json_bytes += b" " * (-len(json_bytes) % 4)
    output.extend(b"\0" * (-len(output) % 4))
    result = (
        struct.pack("<4sII", b"glTF", 2, 12 + 8 + len(json_bytes) + 8 + len(output))
        + struct.pack("<I4s", len(json_bytes), b"JSON")
        + json_bytes
        + struct.pack("<I4s", len(output), b"BIN\0")
        + output
    )
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--output", default="assets/models/crescent-reference-ar.glb")
    args = parser.parse_args()
    zipbytes = fetch_source(args.source)
    with zipfile.ZipFile(io.BytesIO(zipbytes)) as archive:
        source = archive.read(SOURCE_NAME)
    result = compress(source)
    if len(result) > 10_000_000:
        raise ValueError("Optimized GLB is too large for efficient mobile AR")
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(result)
    print(f"Created {out}: {len(result):,} bytes, SHA256 {hashlib.sha256(result).hexdigest()}")


if __name__ == "__main__":
    main()
