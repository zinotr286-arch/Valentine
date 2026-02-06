from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image


@dataclass(frozen=True)
class CropJob:
    src: Path
    dst: Path
    roi: tuple[int, int, int, int]  # left, top, right, bottom
    pad: int = 8
    threshold: int = 26


def _bbox_from_bg(
    img: Image.Image, *, roi: tuple[int, int, int, int], threshold: int
) -> tuple[int, int, int, int] | None:
    """Return bounding box of pixels differing from background.

    Background color is sampled from the top-left pixel of ROI.
    """

    crop = img.crop(roi).convert("RGBA")
    px = crop.load()
    if px is None:
        return None

    bg = px[0, 0]

    def far(p: tuple[int, int, int, int]) -> bool:
        return (
            abs(p[0] - bg[0]) + abs(p[1] - bg[1]) + abs(p[2] - bg[2])
        ) > threshold

    min_x, min_y = crop.width, crop.height
    max_x, max_y = -1, -1
    for y in range(crop.height):
        for x in range(crop.width):
            if far(px[x, y]):
                if x < min_x:
                    min_x = x
                if y < min_y:
                    min_y = y
                if x > max_x:
                    max_x = x
                if y > max_y:
                    max_y = y

    if max_x < 0:
        return None

    # Convert bbox back to full-image coords.
    left, top, _, _ = roi
    return (left + min_x, top + min_y, left + max_x + 1, top + max_y + 1)


def _pad_bbox(
    bbox: tuple[int, int, int, int], *, pad: int, width: int, height: int
) -> tuple[int, int, int, int]:
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(width, r + pad)
    b = min(height, b + pad)
    return (l, t, r, b)


def run_job(job: CropJob) -> None:
    img = Image.open(job.src)
    bbox = _bbox_from_bg(img, roi=job.roi, threshold=job.threshold)
    if bbox is None:
        raise RuntimeError(f"No bbox detected for {job.src}")

    bbox = _pad_bbox(bbox, pad=job.pad, width=img.width, height=img.height)
    out = img.crop(bbox)
    job.dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(job.dst)


def main() -> None:
    assets = Path(__file__).resolve().parent / "assets"

    # Source frames extracted from the MP4.
    src_happy = assets / "src-0_5.png"
    src_sad = assets / "src-3.png"
    src_hug = assets / "src-17_5.png"

    # ROI focuses on the characters only (excludes the top title/buttons
    # and the bottom code editor). Video is 576x576.
    jobs = [
        CropJob(src=src_happy, dst=assets / "cat-happy.png", roi=(60, 155, 516, 360)),
        CropJob(src=src_sad, dst=assets / "cat-sad.png", roi=(60, 155, 516, 360)),
        CropJob(src=src_hug, dst=assets / "hug.png", roi=(70, 120, 506, 360)),
    ]

    for job in jobs:
        run_job(job)

    print("Wrote:")
    for p in [assets / "cat-happy.png", assets / "cat-sad.png", assets / "hug.png"]:
        print(f"- {p}")


if __name__ == "__main__":
    main()
