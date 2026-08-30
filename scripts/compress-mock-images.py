#!/usr/bin/env python3
"""Recompress public/mock assets for the mobile H5 demo. Never enlarges a file."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "mock"
MAX_WIDTH = 860
JPEG_QUALITY = 82


def maybe_downscale(image: Image.Image) -> Image.Image:
    width, height = image.size
    if width <= MAX_WIDTH:
        return image

    ratio = MAX_WIDTH / width
    return image.resize((MAX_WIDTH, max(1, round(height * ratio))), Image.Resampling.LANCZOS)


def encode(path: Path, image: Image.Image) -> bytes:
    buffer = BytesIO()
    suffix = path.suffix.lower()

    if suffix in {".jpg", ".jpeg"}:
        maybe_downscale(image.convert("RGB")).save(
            buffer,
            format="JPEG",
            quality=JPEG_QUALITY,
            optimize=True,
            progressive=True,
        )
    else:
        image.save(buffer, format="PNG", optimize=True, compress_level=9)

    return buffer.getvalue()


def main() -> None:
    before = after = 0

    for path in sorted(ROOT.rglob("*")):
        if path.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
            continue

        original = path.read_bytes()
        before += len(original)
        compressed = encode(path, Image.open(path))

        if len(compressed) < len(original):
            path.write_bytes(compressed)
            after += len(compressed)
            print(f"saved {len(original) - len(compressed):7d}  {path.relative_to(ROOT)}")
        else:
            after += len(original)
            print(f"kept                  {path.relative_to(ROOT)}")

    print(f"total {before} -> {after} ({(after / before) if before else 1:.2%})")


if __name__ == "__main__":
    main()
