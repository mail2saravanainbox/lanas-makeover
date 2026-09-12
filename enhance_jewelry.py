#!/usr/bin/env python3
"""
Batch jewellery photo enhancement — black velvet bust -> emerald showroom.

Reads  : content/rental-incoming/*.png   (READ-ONLY, never modified)
Writes : work/   (masks, backdrop, contact sheets)
         output/ (final JPEG + PNG, qa_report.csv)

Nothing here is generative. Every pixel of jewellery in the output derives
from the corresponding pixel of the source by tonal, colour and sharpness
operations only. The background is replaced; the product is not redrawn.

Usage
-----
    python enhance_jewelry.py --test              # the 3 chosen test images
    python enhance_jewelry.py --only a.png b.png  # named images
    python enhance_jewelry.py                     # full batch (skips existing)
    python enhance_jewelry.py --force             # reprocess everything
    python enhance_jewelry.py --contact-sheet     # rebuild grid from output/
"""

from __future__ import annotations

import argparse
import csv
import math
import sys
import traceback
from dataclasses import dataclass, asdict, field
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ═══════════════════════════════════════════════════════════════════════════
#  CONFIG — every tunable lives here. Nothing below this block hard-codes a
#  magic number; functions read from CFG.
# ═══════════════════════════════════════════════════════════════════════════


@dataclass
class Config:
    # ── Paths ──────────────────────────────────────────────────────────────
    source_dir: Path = Path("content/rental-incoming")
    work_dir: Path = Path("work")
    output_dir: Path = Path("output")

    # ── Which images the emerald treatment applies to ──────────────────────
    # Decided at Step 0 by inspection, not by assumption:
    #   worn-*        9 photographs of real brides in real rooms. Cutting a
    #                 client out of her own wedding and compositing her onto a
    #                 synthetic backdrop fabricates a setting. Excluded.
    #   landscape     14 flat-lays shot wider than tall. Forcing them into a
    #                 4:5 portrait at 80% height means upscaling as much as
    #                 1.6x. Excluded; they need a reshoot, not a filter.
    #   choker-s4031  shot on a blue stand in a room, not on the black bust.
    # worn-s5004 is in two of those sets, so the union is 23 and not 24.
    #   ad-s2011      shot on BLUE velvet, not black. Measured border chroma
    #                 (LAB, which accounts for brightness — HSV saturation does
    #                 not, and reported 84 false positives before it was
    #                 corrected) is 25.5; the next highest of the 110 is under
    #                 10, which reads as black. This one reads as a blue tile in
    #                 a grid of dark ones. Reshoot rather than recolour: the
    #                 velvet is not the product, but repainting it is a change
    #                 nobody asked for.
    exclude_prefixes: tuple[str, ...] = ("worn-",)
    exclude_names: tuple[str, ...] = ("choker-s4031.png", "ad-s2011.png")
    exclude_landscape: bool = True

    # ── Canvas / framing ───────────────────────────────────────────────────
    # 4:5 portrait. 2160x2700 from the brief is unreachable: the largest
    # source in this set is 1500x2000, so every image would be upscaled.
    # 1440x1800 sits well above the 1080x1350 floor; the largest canvas that
    # upscales nothing at all is 1566x1958 (measured).
    canvas_w: int = 1440
    canvas_h: int = 1800
    subject_height_frac: float = 0.82  # of canvas height
    subject_max_width_frac: float = 0.86  # hard cap so earrings never clip
    subject_center_y_frac: float = 0.50  # vertical centre of the subject bbox
    safe_margin_frac: float = 0.05  # QA: bbox must stay inside this margin

    # ── Subject mode ───────────────────────────────────────────────────────
    #   "cutout" : hard mask, jewellery only, composited on emerald.
    #   "blend"  : keep the photograph's own bust / base / velvet inside a
    #              feathered oval and let it fall off into the emerald.
    # The spec asks for the bust to be KEPT, reading as "slightly lifted black
    # with a soft edge against the green" — which describes a blend. A cutout
    # cannot do it: separating a black velvet bust from a black velvet ground
    # is not reliably decidable, and the attempt leaves a ragged dark smudge.
    subject_mode: str = "blend"
    blend_pad_x_frac: float = 0.16  # oval margin beyond the jewellery bbox
    # Vertical padding is ASYMMETRIC, and that is the whole fix for the cloth.
    # The maroon and blue cloth the sets are shot on sits just below the gold
    # base, i.e. just below the bottom of the jewellery bbox. A symmetric oval
    # that clears the neck block at the top necessarily reaches down into that
    # cloth, which is why the first pass kept a red band on some images and a
    # blue one on others. Holding the bottom tight excludes it without
    # cropping the base.
    blend_pad_top_frac: float = 0.085
    blend_pad_bottom_frac: float = 0.012
    blend_feather_frac: float = 0.26  # softness; reads as falloff, not porthole
    blend_corner_bias: float = 0.85  # extra falloff at the photo's corners

    # ── Subject extraction ─────────────────────────────────────────────────
    # Classical beat rembg on every metric on every test image (bright_kept
    # 0.99 vs 0.42-0.78), and blend mode only needs the bbox, not a matte.
    # Leaving rembg on costs ~12 minutes across the batch for a mask that is
    # then discarded. On by default is the wrong default here.
    use_rembg: bool = False
    rembg_models: tuple[str, ...] = ("isnet-general-use", "u2net")
    alpha_matting: bool = True
    am_foreground_threshold: int = 240
    am_background_threshold: int = 10
    am_erode_size: int = 10
    # Classical fallback: the background is near-black velvet, so distance
    # from black separates subject from ground better than any single channel.
    classical_luma_threshold: int = 34  # 0-255
    classical_sat_threshold: int = 38  # rescues dark-but-coloured maroon cloth
    classical_close_px: int = 9
    classical_open_px: int = 3
    grabcut_iterations: int = 4
    grabcut_border_frac: float = 0.02  # certain-background frame
    mask_feather_px: int = 2
    # Reject a mask that keeps almost nothing or almost everything.
    mask_min_coverage: float = 0.06
    mask_max_coverage: float = 0.92

    # ── Jewellery enhancement (subject only) ───────────────────────────────
    clahe_clip: float = 2.4
    clahe_tile: int = 8
    midtone_gamma: float = 0.88  # <1 lifts midtones
    highlight_ceiling: int = 245  # nothing may exceed this on any channel
    highlight_knee: int = 205  # roll-off starts here
    gold_hue_lo_deg: float = 18.0
    gold_hue_hi_deg: float = 48.0
    gold_sat_gain: float = 1.18
    gold_sat_cap: int = 205  # keeps gold off the orange/brass edge
    gold_min_sat: int = 28  # don't saturate near-greys into gold
    denoise_h_luma: float = 3.0
    denoise_h_chroma: float = 5.0
    unsharp_radius: float = 1.3
    unsharp_amount: float = 0.85
    shadow_lift: int = 6  # adds to deep shadows so velvet isn't crushed
    shadow_lift_knee: int = 64  # only below this luminance

    # ── Emerald backdrop ───────────────────────────────────────────────────
    bg_center: tuple[int, int, int] = (0x1A, 0x7A, 0x4F)  # #1A7A4F
    bg_mid: tuple[int, int, int] = (0x14, 0x6B, 0x45)  # #146B45
    bg_edge: tuple[int, int, int] = (0x05, 0x2A, 0x1D)  # between #04261A/#062F21
    bg_hotspot_y_frac: float = 0.42  # gradient centre sits behind the jewellery
    bg_gradient_power: float = 1.35
    bg_fold_strength: float = 0.075  # satin streaks, low contrast on purpose
    bg_fold_blur_px: int = 121  # large + soft, never noisy
    # Satin folds are DIRECTIONAL. Isotropic noise blurs into cloud, which is
    # what the first pass produced and what satin is not.
    #
    # The generator is fed a deliberately FLAT array: many columns, very few
    # rows. Stretched to the canvas, the columns become vertical bands and the
    # handful of rows interpolate into near-constant vertical variation — so
    # the structure runs down the frame, and is then sheared into a diagonal.
    # (Getting these two the wrong way round yields horizontal banding.)
    bg_fold_bands: int = 26  # how many folds across the width
    bg_fold_rows: int = 4  # vertical variation; keep small or folds break up
    bg_fold_angle_deg: float = 24.0
    bg_fold_seed: int = 20260912
    bg_vignette_strength: float = 0.34
    bg_grain: float = 1.4  # a whisper, to stop gradient banding

    # ── Compositing ────────────────────────────────────────────────────────
    shadow_offset_frac: float = 0.018  # of canvas height, downward
    shadow_blur_px: int = 55
    shadow_opacity: float = 0.46
    shadow_squash: float = 0.22  # shadow is cast on the surface, so flattened
    glow_blur_px: int = 85
    glow_opacity: float = 0.22
    glow_tint: tuple[int, int, int] = (255, 206, 130)  # warm, not orange

    # ── Brand text ─────────────────────────────────────────────────────────
    brand_name: str = "Lana's Makeover"
    brand_font_candidates: tuple[str, ...] = (
        "/System/Library/Fonts/Supplemental/Didot.ttc",
        "/System/Library/Fonts/Supplemental/Baskerville.ttc",
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
    )
    brand_size_frac: float = 0.030  # of canvas height
    brand_top_frac: float = 0.043
    brand_colour: tuple[int, int, int] = (214, 178, 110)
    brand_opacity: int = 225
    brand_tracking_px: int = 5
    # The text must never touch the jewellery. If the subject would reach into
    # this band the subject is nudged down rather than the text moved.
    brand_reserved_frac: float = 0.105

    # ── Export ─────────────────────────────────────────────────────────────
    jpeg_quality: int = 92
    write_png: bool = True

    # ── QA ─────────────────────────────────────────────────────────────────
    qa_max_clipped_pct: float = 0.5  # pixels > 250 on any channel
    qa_clip_level: int = 250

    # ── Test set: deliberately unalike (long haram / heavy stones / white CZ)
    test_images: tuple[str, ...] = (
        "temple-s1001.png",
        "temple-s3020.png",
        "ad-s2008.png",
    )


CFG = Config()

# ═══════════════════════════════════════════════════════════════════════════
#  Helpers
# ═══════════════════════════════════════════════════════════════════════════


def log(msg: str) -> None:
    print(msg, flush=True)


def odd(n: int) -> int:
    """OpenCV kernels must be odd."""
    n = int(n)
    return n if n % 2 == 1 else n + 1


def source_images(cfg: Config = CFG) -> list[Path]:
    """The images the emerald treatment applies to. See Config for the why."""
    out: list[Path] = []
    for p in sorted(cfg.source_dir.glob("*.png")):
        if any(p.name.startswith(pre) for pre in cfg.exclude_prefixes):
            continue
        if p.name in cfg.exclude_names:
            continue
        if cfg.exclude_landscape:
            with Image.open(p) as im:
                if im.width > im.height:
                    continue
        out.append(p)
    return out


def excluded_images(cfg: Config = CFG) -> list[Path]:
    keep = {p.name for p in source_images(cfg)}
    return [p for p in sorted(cfg.source_dir.glob("*.png")) if p.name not in keep]


# ═══════════════════════════════════════════════════════════════════════════
#  2a. Subject extraction
# ═══════════════════════════════════════════════════════════════════════════

_SESSION_CACHE: dict[str, object] = {}


def get_rembg_session(cfg: Config = CFG):
    """First model that actually loads. Returns (name, session) or (None, None)."""
    from rembg import new_session

    for name in cfg.rembg_models:
        if name in _SESSION_CACHE:
            return name, _SESSION_CACHE[name]
        try:
            s = new_session(name)
            _SESSION_CACHE[name] = s
            return name, s
        except Exception as e:  # noqa: BLE001
            log(f"    rembg model {name!r} unavailable: {type(e).__name__}: {e}")
    return None, None


def mask_rembg(bgr: np.ndarray, cfg: Config = CFG) -> np.ndarray | None:
    """Alpha from rembg, with alpha matting so chains and beads keep soft edges."""
    from rembg import remove

    name, session = get_rembg_session(cfg)
    if session is None:
        return None
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    try:
        out = remove(
            Image.fromarray(rgb),
            session=session,
            alpha_matting=cfg.alpha_matting,
            alpha_matting_foreground_threshold=cfg.am_foreground_threshold,
            alpha_matting_background_threshold=cfg.am_background_threshold,
            alpha_matting_erode_size=cfg.am_erode_size,
        )
    except Exception as e:  # noqa: BLE001
        log(f"    rembg failed: {type(e).__name__}: {e}")
        return None
    arr = np.array(out)
    if arr.ndim != 3 or arr.shape[2] != 4:
        return None
    return arr[:, :, 3]


def mask_classical(bgr: np.ndarray, cfg: Config = CFG) -> np.ndarray:
    """
    Distance-from-black mask, refined with GrabCut.

    The velvet ground is near-black and the product is bright gold or bright
    white stone, so luminance alone separates most of it. Saturation is OR-ed
    in to rescue the dark maroon cloth and the deep-red kemp stones, which are
    dark but strongly coloured.
    """
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    v = hsv[:, :, 2]
    s = hsv[:, :, 1]

    seed = ((v > cfg.classical_luma_threshold) | (s > cfg.classical_sat_threshold)).astype(np.uint8)
    seed = cv2.morphologyEx(
        seed, cv2.MORPH_CLOSE, np.ones((odd(cfg.classical_close_px),) * 2, np.uint8)
    )
    seed = cv2.morphologyEx(
        seed, cv2.MORPH_OPEN, np.ones((odd(cfg.classical_open_px),) * 2, np.uint8)
    )

    # Keep only components touching the central mass, so stray specks on the
    # backdrop are dropped but the side earring stands are not.
    n, labels, stats, _ = cv2.connectedComponentsWithStats(seed, 8)
    if n > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        biggest = int(np.argmax(areas)) + 1
        keep = {biggest}
        big_area = stats[biggest, cv2.CC_STAT_AREA]
        for i in range(1, n):
            # Earrings are small but real; dust is small and isolated.
            if stats[i, cv2.CC_STAT_AREA] > max(400, big_area * 0.004):
                keep.add(i)
        seed = np.isin(labels, list(keep)).astype(np.uint8)

    gc = np.where(seed > 0, cv2.GC_PR_FGD, cv2.GC_PR_BGD).astype(np.uint8)
    h, w = gc.shape
    b = max(1, int(min(h, w) * cfg.grabcut_border_frac))
    gc[:b, :] = cv2.GC_BGD
    gc[-b:, :] = cv2.GC_BGD
    gc[:, :b] = cv2.GC_BGD
    gc[:, -b:] = cv2.GC_BGD
    # Very bright pixels are certainly the product.
    gc[v > 200] = cv2.GC_FGD

    try:
        bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
        cv2.grabCut(bgr, gc, None, bgd, fgd, cfg.grabcut_iterations, cv2.GC_INIT_WITH_MASK)
        alpha = np.where((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    except Exception as e:  # noqa: BLE001
        log(f"    grabCut failed ({type(e).__name__}: {e}); using seed mask")
        alpha = (seed * 255).astype(np.uint8)

    k = odd(cfg.mask_feather_px * 2 + 1)
    return cv2.GaussianBlur(alpha, (k, k), 0)


def score_mask(alpha: np.ndarray, bgr: np.ndarray, cfg: Config = CFG) -> tuple[float, dict]:
    """
    Higher is better. Penalises masks that drop bright product or that are
    ragged. Returns (score, metrics) so the choice is inspectable rather than
    a black box.
    """
    a = alpha.astype(np.float32) / 255.0
    coverage = float(a.mean())

    v = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)[:, :, 2]
    bright = v > 150
    bright_kept = float(a[bright].mean()) if bright.any() else 0.0

    # Edge raggedness: perimeter against the perimeter of a disc of equal area.
    binm = (alpha > 127).astype(np.uint8)
    area = float(binm.sum()) + 1e-6
    per = float(cv2.Canny(binm * 255, 50, 150).sum() / 255.0)
    ideal = 2.0 * math.sqrt(math.pi * area)
    raggedness = per / ideal if ideal > 0 else 99.0

    ok = cfg.mask_min_coverage <= coverage <= cfg.mask_max_coverage
    score = (bright_kept * 2.0) - (raggedness * 0.25) + (0.5 if ok else -5.0)
    return score, {
        "coverage": round(coverage, 4),
        "bright_kept": round(bright_kept, 4),
        "raggedness": round(raggedness, 3),
        "in_range": ok,
    }


def extract_subject(bgr: np.ndarray, name: str, cfg: Config = CFG) -> tuple[np.ndarray, dict]:
    """Build both masks, keep the better one, save it for inspection."""
    candidates: list[tuple[str, np.ndarray]] = []

    if cfg.use_rembg:
        a = mask_rembg(bgr, cfg)
        if a is not None:
            candidates.append(("rembg", a))
    candidates.append(("classical", mask_classical(bgr, cfg)))

    md = cfg.work_dir / "masks"
    md.mkdir(parents=True, exist_ok=True)

    scored = []
    for label, m in candidates:
        s, metrics = score_mask(m, bgr, cfg)
        scored.append((s, label, m, metrics))
        log(f"    mask {label:10} score {s:6.3f}  {metrics}")
        # Every candidate is written, not only the winner — a mask you cannot
        # see is a mask you cannot argue with.
        cv2.imwrite(str(md / f"{Path(name).stem}__{label}.png"), m)

    scored.sort(key=lambda t: t[0], reverse=True)
    best_score, best_label, best_mask, best_metrics = scored[0]
    cv2.imwrite(str(md / f"{Path(name).stem}__CHOSEN-{best_label}.png"), best_mask)

    return best_mask, {"mask_source": best_label, "mask_score": round(best_score, 3), **best_metrics}


# ═══════════════════════════════════════════════════════════════════════════
#  2b. Jewellery enhancement — subject pixels only
# ═══════════════════════════════════════════════════════════════════════════


def _highlight_rolloff(bgr: np.ndarray, cfg: Config) -> np.ndarray:
    """Compress above the knee so highlights approach the ceiling, never clip."""
    x = bgr.astype(np.float32)
    knee, ceil_ = float(cfg.highlight_knee), float(cfg.highlight_ceiling)
    if ceil_ <= knee:
        return np.clip(x, 0, ceil_).astype(np.uint8)
    over = x > knee
    t = (x - knee) / (255.0 - knee)
    x[over] = (knee + (ceil_ - knee) * (1.0 - np.exp(-2.2 * t)))[over]
    return np.clip(x, 0, ceil_).astype(np.uint8)


def enhance_jewellery(bgr: np.ndarray, alpha: np.ndarray, cfg: Config = CFG) -> np.ndarray:
    """
    Tonal / colour / sharpness only. No pixel is invented, moved or redrawn —
    a customer rents the exact item in the frame.
    """
    work = bgr.copy()

    # ── micro-contrast on L, so filigree and beads read ────────────────────
    lab = cv2.cvtColor(work, cv2.COLOR_BGR2LAB)
    l, a_, b_ = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=cfg.clahe_clip, tileGridSize=(cfg.clahe_tile, cfg.clahe_tile))
    l = clahe.apply(l)
    work = cv2.cvtColor(cv2.merge([l, a_, b_]), cv2.COLOR_LAB2BGR)

    # ── midtone lift ───────────────────────────────────────────────────────
    lut = np.array(
        [np.clip(((i / 255.0) ** cfg.midtone_gamma) * 255.0, 0, 255) for i in range(256)],
        dtype=np.uint8,
    )
    work = cv2.LUT(work, lut)

    # ── deep-shadow lift, so the black velvet reads as velvet not as a hole ─
    lift_lut = np.arange(256, dtype=np.float32)
    knee = float(cfg.shadow_lift_knee)
    below = lift_lut < knee
    lift_lut[below] += cfg.shadow_lift * (1.0 - lift_lut[below] / knee)
    work = cv2.LUT(work, np.clip(lift_lut, 0, 255).astype(np.uint8))

    # ── gold-only vibrance ─────────────────────────────────────────────────
    # OpenCV hue is 0-179 for 0-360 degrees.
    hsv = cv2.cvtColor(work, cv2.COLOR_BGR2HSV).astype(np.float32)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    lo, hi = cfg.gold_hue_lo_deg / 2.0, cfg.gold_hue_hi_deg / 2.0
    gold = (h >= lo) & (h <= hi) & (s >= cfg.gold_min_sat)
    s[gold] = np.minimum(s[gold] * cfg.gold_sat_gain, cfg.gold_sat_cap)
    hsv[:, :, 1] = s
    work = cv2.cvtColor(np.clip(hsv, 0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR)

    # ── light denoise, then unsharp ────────────────────────────────────────
    work = cv2.fastNlMeansDenoisingColored(
        work, None, cfg.denoise_h_luma, cfg.denoise_h_chroma, 7, 21
    )
    k = odd(int(cfg.unsharp_radius * 4) + 1)
    blur = cv2.GaussianBlur(work, (k, k), cfg.unsharp_radius)
    work = cv2.addWeighted(work, 1.0 + cfg.unsharp_amount, blur, -cfg.unsharp_amount, 0)

    # ── ceiling ────────────────────────────────────────────────────────────
    work = _highlight_rolloff(work, cfg)

    # Only inside the subject. The backdrop is generated, not adjusted.
    a3 = (alpha.astype(np.float32) / 255.0)[:, :, None]
    return (work.astype(np.float32) * a3 + bgr.astype(np.float32) * (1 - a3)).astype(np.uint8)


# ═══════════════════════════════════════════════════════════════════════════
#  2c. Emerald backdrop — generated once, cached, reused
# ═══════════════════════════════════════════════════════════════════════════

_BACKDROP: np.ndarray | None = None


def make_backdrop(w: int, h: int, cfg: Config = CFG) -> np.ndarray:
    """Radial gradient + soft satin folds + vignette. Never flat, never noisy."""
    rng = np.random.default_rng(cfg.bg_fold_seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy = w * 0.5, h * cfg.bg_hotspot_y_frac
    r = np.sqrt(((xx - cx) / (w * 0.72)) ** 2 + ((yy - cy) / (h * 0.72)) ** 2)
    t = np.clip(r, 0, 1) ** cfg.bg_gradient_power

    c = np.array(cfg.bg_center, np.float32)
    m = np.array(cfg.bg_mid, np.float32)
    e = np.array(cfg.bg_edge, np.float32)
    # centre -> mid over the first half, mid -> edge over the second
    t2 = t[:, :, None]
    inner = c + (m - c) * np.clip(t2 / 0.5, 0, 1)
    outer = m + (e - m) * np.clip((t2 - 0.5) / 0.5, 0, 1)
    rgb = np.where(t2 < 0.5, inner, outer)

    # satin folds: narrow noise -> long bands -> sheared diagonal -> blurred
    small = rng.normal(0, 1, (max(2, cfg.bg_fold_rows), max(4, cfg.bg_fold_bands))).astype(
        np.float32
    )
    # Oversize the canvas so the shear does not drag a reflected edge inward.
    pad = int(h * math.tan(math.radians(cfg.bg_fold_angle_deg))) + 2
    folds = cv2.resize(small, (w + pad * 2, h), interpolation=cv2.INTER_CUBIC)
    ang = math.radians(cfg.bg_fold_angle_deg)
    M = np.float32([[1, math.tan(ang), -math.tan(ang) * h * 0.5], [0, 1, 0]])
    folds = cv2.warpAffine(
        folds, M, (w + pad * 2, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT
    )
    folds = folds[:, pad : pad + w]
    k = odd(cfg.bg_fold_blur_px)
    folds = cv2.GaussianBlur(folds, (k, k), 0)
    folds /= (np.abs(folds).max() + 1e-6)
    rgb *= (1.0 + folds[:, :, None] * cfg.bg_fold_strength)

    # vignette
    vr = np.sqrt(((xx - w * 0.5) / (w * 0.78)) ** 2 + ((yy - h * 0.5) / (h * 0.78)) ** 2)
    rgb *= (1.0 - np.clip(vr, 0, 1) ** 2 * cfg.bg_vignette_strength)[:, :, None]

    if cfg.bg_grain > 0:
        rgb += rng.normal(0, cfg.bg_grain, rgb.shape).astype(np.float32)

    rgb = np.clip(rgb, 0, 255).astype(np.uint8)
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def backdrop(cfg: Config = CFG) -> np.ndarray:
    global _BACKDROP
    if _BACKDROP is None:
        _BACKDROP = make_backdrop(cfg.canvas_w, cfg.canvas_h, cfg)
    return _BACKDROP


# ═══════════════════════════════════════════════════════════════════════════
#  2d. Compositing
# ═══════════════════════════════════════════════════════════════════════════


def _bbox(alpha: np.ndarray) -> tuple[int, int, int, int] | None:
    ys, xs = np.where(alpha > 16)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def _load_font(cfg: Config, px: int):
    for path in cfg.brand_font_candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, px), path
            except Exception:  # noqa: BLE001
                continue
    return None, None


def blend_alpha(shape: tuple[int, int], jewel_alpha: np.ndarray, cfg: Config) -> np.ndarray:
    """
    A feathered oval around the jewellery, used in "blend" mode.

    Everything inside is the photograph as shot — bust, gold base, earring
    stands, the velvet between the strands. Everything outside fades to the
    emerald. No boundary is drawn through the product, which is the failure a
    hard mask cannot avoid on black-on-black.
    """
    h, w = shape
    bb = _bbox(jewel_alpha)
    if bb is None:
        bb = (0, 0, w, h)
    x0, y0, x1, y1 = bb
    bw, bh = x1 - x0, y1 - y0

    top = y0 - bh * cfg.blend_pad_top_frac
    bot = y1 + bh * cfg.blend_pad_bottom_frac
    cx, cy = (x0 + x1) / 2.0, (top + bot) / 2.0
    rx = (bw / 2.0) * (1.0 + cfg.blend_pad_x_frac * 2)
    ry = max((bot - top) / 2.0, 1.0)

    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx - cx) / max(rx, 1)) ** 2 + ((yy - cy) / max(ry, 1)) ** 2)

    feather = max(cfg.blend_feather_frac, 1e-3)
    a = np.clip((1.0 + feather - d) / feather, 0.0, 1.0)
    a = a * a * (3 - 2 * a)  # smoothstep

    # The photo's own corners (maroon / blue cloth, stray edges) fade harder.
    corner = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    a *= np.clip(1.0 - (corner - 1.0) * cfg.blend_corner_bias, 0.0, 1.0)

    # Never fade the jewellery itself, whatever the geometry says.
    a = np.maximum(a, jewel_alpha.astype(np.float32) / 255.0)
    return np.clip(a * 255.0, 0, 255).astype(np.uint8)


def compose(
    enhanced: np.ndarray, alpha: np.ndarray, cfg: Config = CFG
) -> tuple[np.ndarray, dict]:
    bb = _bbox(alpha)
    if bb is None:
        raise ValueError("empty mask — no subject found")
    x0, y0, x1, y1 = bb
    sub = enhanced[y0:y1, x0:x1]
    sa = alpha[y0:y1, x0:x1]
    sh, sw = sa.shape

    # ── scale to the framing rule, width-capped so earrings never clip ─────
    target_h = cfg.canvas_h * cfg.subject_height_frac
    scale = target_h / sh
    if sw * scale > cfg.canvas_w * cfg.subject_max_width_frac:
        scale = (cfg.canvas_w * cfg.subject_max_width_frac) / sw
    nw, nh = max(1, int(round(sw * scale))), max(1, int(round(sh * scale)))
    interp = cv2.INTER_AREA if scale < 1 else cv2.INTER_LANCZOS4
    sub = cv2.resize(sub, (nw, nh), interpolation=interp)
    sa = cv2.resize(sa, (nw, nh), interpolation=interp)

    # ── place: centred, nudged down if it would reach the brand band ───────
    cx = (cfg.canvas_w - nw) // 2
    cy = int(cfg.canvas_h * cfg.subject_center_y_frac - nh / 2)
    if cfg.brand_name:
        floor_y = int(cfg.canvas_h * cfg.brand_reserved_frac)
        cy = max(cy, floor_y)
    cy = max(0, min(cy, cfg.canvas_h - nh))

    canvas = backdrop(cfg).copy().astype(np.float32)

    full_a = np.zeros((cfg.canvas_h, cfg.canvas_w), np.uint8)
    full_s = np.zeros((cfg.canvas_h, cfg.canvas_w, 3), np.uint8)
    full_a[cy : cy + nh, cx : cx + nw] = sa
    full_s[cy : cy + nh, cx : cx + nw] = sub

    # ── drop shadow: cast on the surface, so squashed and offset down ──────
    sh_a = cv2.resize(full_a, (cfg.canvas_w, max(1, int(cfg.canvas_h * cfg.shadow_squash))))
    pad = np.zeros((cfg.canvas_h, cfg.canvas_w), np.uint8)
    top = cy + nh - sh_a.shape[0] // 2 + int(cfg.canvas_h * cfg.shadow_offset_frac)
    top = max(0, min(top, cfg.canvas_h - 1))
    # Clamping `top` alone is not enough: the slab can still overhang the
    # bottom edge, and numpy will not broadcast a short destination. Crop the
    # source to whatever room is actually left.
    room = min(sh_a.shape[0], cfg.canvas_h - top)
    pad[top : top + room, :] = sh_a[:room]
    k = odd(cfg.shadow_blur_px)
    pad = cv2.GaussianBlur(pad, (k, k), 0)
    canvas *= (1.0 - (pad.astype(np.float32) / 255.0 * cfg.shadow_opacity))[:, :, None]

    # ── warm glow behind the silhouette ────────────────────────────────────
    k = odd(cfg.glow_blur_px)
    glow = cv2.GaussianBlur(full_a, (k, k), 0).astype(np.float32) / 255.0
    tint = np.array(cfg.glow_tint[::-1], np.float32)  # BGR
    canvas += glow[:, :, None] * tint * cfg.glow_opacity

    # ── the subject itself ─────────────────────────────────────────────────
    a3 = (full_a.astype(np.float32) / 255.0)[:, :, None]
    canvas = canvas * (1 - a3) + full_s.astype(np.float32) * a3
    out = np.clip(canvas, 0, 255).astype(np.uint8)

    # ── brand text ─────────────────────────────────────────────────────────
    font_used = None
    if cfg.brand_name:
        px = max(10, int(cfg.canvas_h * cfg.brand_size_frac))
        font, font_used = _load_font(cfg, px)
        if font is not None:
            pil = Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB)).convert("RGBA")
            layer = Image.new("RGBA", pil.size, (0, 0, 0, 0))
            d = ImageDraw.Draw(layer)
            letters = list(cfg.brand_name)
            widths = [d.textlength(ch, font=font) for ch in letters]
            total = sum(widths) + cfg.brand_tracking_px * (len(letters) - 1)
            x = (cfg.canvas_w - total) / 2
            y = cfg.canvas_h * cfg.brand_top_frac
            for ch, wdt in zip(letters, widths):
                d.text((x, y), ch, font=font, fill=(*cfg.brand_colour, cfg.brand_opacity))
                x += wdt + cfg.brand_tracking_px
            pil = Image.alpha_composite(pil, layer)
            out = cv2.cvtColor(np.array(pil.convert("RGB")), cv2.COLOR_RGB2BGR)

    meta = {
        "subject_scale": round(float(scale), 4),
        "subject_w": nw,
        "subject_h": nh,
        "subject_x": cx,
        "subject_y": cy,
        "font": Path(font_used).name if font_used else "",
    }
    return out, meta


# ═══════════════════════════════════════════════════════════════════════════
#  2e. QA
# ═══════════════════════════════════════════════════════════════════════════


def qa_check(out: np.ndarray, src: np.ndarray, meta: dict, cfg: Config = CFG) -> dict:
    h, w = out.shape[:2]
    checks: dict[str, object] = {}

    checks["dims_ok"] = (w == cfg.canvas_w and h == cfg.canvas_h)

    m = cfg.safe_margin_frac
    checks["bbox_in_safe_area"] = (
        meta["subject_x"] >= w * m * 0.5
        and meta["subject_y"] >= 0
        and meta["subject_x"] + meta["subject_w"] <= w - w * m * 0.5
        and meta["subject_y"] + meta["subject_h"] <= h
    )

    clipped = float((out > cfg.qa_clip_level).any(axis=2).mean() * 100.0)
    checks["clipped_pct"] = round(clipped, 4)
    checks["clipping_ok"] = clipped < cfg.qa_max_clipped_pct

    frac = meta["subject_h"] / h
    checks["subject_height_frac"] = round(frac, 3)
    checks["framing_ok"] = 0.70 <= frac <= 0.90

    # An output identical to its input means nothing happened.
    sm = cv2.resize(src, (64, 80), interpolation=cv2.INTER_AREA)
    om = cv2.resize(out, (64, 80), interpolation=cv2.INTER_AREA)
    checks["differs_from_source"] = bool(
        np.abs(sm.astype(np.int16) - om.astype(np.int16)).mean() > 2.0
    )

    checks["upscaled"] = meta["subject_scale"] > 1.0
    checks["passed"] = bool(
        checks["dims_ok"]
        and checks["bbox_in_safe_area"]
        and checks["clipping_ok"]
        and checks["framing_ok"]
        and checks["differs_from_source"]
    )
    return checks


# ═══════════════════════════════════════════════════════════════════════════
#  Pipeline
# ═══════════════════════════════════════════════════════════════════════════


def process_one(path: Path, cfg: Config = CFG) -> dict:
    bgr = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("unreadable by cv2.imread")

    jewel_alpha, mask_meta = extract_subject(bgr, path.name, cfg)

    if cfg.subject_mode == "blend":
        # Enhance the whole frame: in blend mode the velvet and the gold base
        # are part of the presentation, so they get the shadow lift too.
        enhanced = enhance_jewellery(bgr, np.full(bgr.shape[:2], 255, np.uint8), cfg)
        alpha = blend_alpha(bgr.shape[:2], jewel_alpha, cfg)
        cv2.imwrite(
            str(cfg.work_dir / "masks" / f"{path.stem}__CHOSEN-blend.png"), alpha
        )
    else:
        enhanced = enhance_jewellery(bgr, jewel_alpha, cfg)
        alpha = jewel_alpha

    out, comp_meta = compose(enhanced, alpha, cfg)

    cfg.output_dir.mkdir(parents=True, exist_ok=True)
    jpg = cfg.output_dir / f"{path.stem}.jpg"
    cv2.imwrite(str(jpg), out, [int(cv2.IMWRITE_JPEG_QUALITY), cfg.jpeg_quality])
    if cfg.write_png:
        cv2.imwrite(str(cfg.output_dir / f"{path.stem}.png"), out)

    qa = qa_check(out, bgr, comp_meta, cfg)
    return {"file": path.name, **mask_meta, **comp_meta, **qa}


def contact_sheet_test(rows: list[Path], cfg: Config = CFG) -> Path:
    """BEFORE | AFTER per test image, stacked."""
    tiles = []
    for p in rows:
        before = cv2.imread(str(p), cv2.IMREAD_COLOR)
        after = cv2.imread(str(cfg.output_dir / f"{p.stem}.jpg"), cv2.IMREAD_COLOR)
        if before is None or after is None:
            continue
        th = 900
        b = cv2.resize(before, (int(before.shape[1] * th / before.shape[0]), th))
        a = cv2.resize(after, (int(after.shape[1] * th / after.shape[0]), th))
        gap = np.full((th, 24, 3), 24, np.uint8)
        row = np.hstack([b, gap, a])
        label = np.full((46, row.shape[1], 3), 24, np.uint8)
        cv2.putText(
            label, f"{p.name}      BEFORE  |  AFTER", (12, 32),
            cv2.FONT_HERSHEY_SIMPLEX, 0.72, (235, 235, 235), 1, cv2.LINE_AA,
        )
        tiles.append(np.vstack([label, row]))
    if not tiles:
        raise ValueError("no tiles to draw")
    width = max(t.shape[1] for t in tiles)
    padded = [
        np.hstack([t, np.full((t.shape[0], width - t.shape[1], 3), 24, np.uint8)])
        if t.shape[1] < width else t
        for t in tiles
    ]
    sheet = np.vstack(padded)
    cfg.work_dir.mkdir(parents=True, exist_ok=True)
    out = cfg.work_dir / "contact_sheet_test.jpg"
    cv2.imwrite(str(out), sheet, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    return out


def contact_sheet_all(cfg: Config = CFG, cols: int = 10) -> Path:
    # The sheet is written into output/, so an unfiltered glob tiles the
    # previous sheet as if it were a product photograph — one green-and-black
    # thumbnail of a grid sitting in the middle of the grid.
    sheet_name = "contact_sheet_all.jpg"
    files = [p for p in sorted(cfg.output_dir.glob("*.jpg")) if p.name != sheet_name]
    if not files:
        raise ValueError("nothing in output/")
    tw = 216
    th = int(tw * cfg.canvas_h / cfg.canvas_w)
    tiles = []
    skipped = 0
    for f in files:
        im = cv2.imread(str(f), cv2.IMREAD_COLOR)
        if im is None:
            # A file the batch is still writing. Skip it rather than crash the
            # sheet — this runs against a live output directory.
            skipped += 1
            continue
        tiles.append(cv2.resize(im, (tw, th), interpolation=cv2.INTER_AREA))
    if skipped:
        log(f"  {skipped} file(s) not yet readable, skipped")
    if not tiles:
        raise ValueError("nothing readable in output/")
    rows = []
    for i in range(0, len(tiles), cols):
        chunk = tiles[i : i + cols]
        while len(chunk) < cols:
            chunk.append(np.full((th, tw, 3), 18, np.uint8))
        rows.append(np.hstack(chunk))
    sheet = np.vstack(rows)
    out = cfg.output_dir / sheet_name
    cv2.imwrite(str(out), sheet, [int(cv2.IMWRITE_JPEG_QUALITY), 88])
    return out


def write_qa(results: list[dict], cfg: Config = CFG) -> Path:
    cfg.output_dir.mkdir(parents=True, exist_ok=True)
    p = cfg.output_dir / "qa_report.csv"
    if not results:
        return p
    keys = list({k for r in results for k in r})
    order = ["file", "passed"] + [k for k in keys if k not in ("file", "passed")]
    with p.open("w", newline="") as fh:
        wr = csv.DictWriter(fh, fieldnames=order)
        wr.writeheader()
        for r in results:
            wr.writerow(r)
    return p


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--test", action="store_true", help="process the 3 test images")
    ap.add_argument("--only", nargs="+", help="process these filenames")
    ap.add_argument("--force", action="store_true", help="reprocess existing outputs")
    ap.add_argument("--contact-sheet", action="store_true", help="rebuild grid only")
    ap.add_argument("--backdrop-only", action="store_true", help="write backdrop preview")
    args = ap.parse_args()

    CFG.work_dir.mkdir(parents=True, exist_ok=True)
    CFG.output_dir.mkdir(parents=True, exist_ok=True)

    if args.backdrop_only:
        p = CFG.work_dir / "backdrop_preview.png"
        cv2.imwrite(str(p), backdrop(CFG))
        log(f"backdrop -> {p}")
        return 0

    if args.contact_sheet:
        log(f"contact sheet -> {contact_sheet_all(CFG)}")
        return 0

    if args.test:
        targets = [CFG.source_dir / n for n in CFG.test_images]
    elif args.only:
        targets = [CFG.source_dir / n for n in args.only]
    else:
        targets = source_images(CFG)

    missing = [p for p in targets if not p.exists()]
    if missing:
        log("ERROR: not found: " + ", ".join(p.name for p in missing))
        return 2

    if not args.force:
        skipped = [p for p in targets if (CFG.output_dir / f"{p.stem}.jpg").exists()]
        targets = [p for p in targets if not (CFG.output_dir / f"{p.stem}.jpg").exists()]
        if skipped:
            log(f"skipping {len(skipped)} already in output/ (use --force to redo)")

    log(f"processing {len(targets)} image(s)")
    p = CFG.work_dir / "backdrop_preview.png"
    cv2.imwrite(str(p), backdrop(CFG))
    log(f"backdrop -> {p}")

    results, failures = [], []
    for i, path in enumerate(targets, 1):
        log(f"[{i}/{len(targets)}] {path.name}")
        try:
            results.append(process_one(path, CFG))
        except Exception as e:  # noqa: BLE001
            failures.append((path.name, f"{type(e).__name__}: {e}"))
            log(f"    FAILED: {type(e).__name__}: {e}")
            traceback.print_exc()

    qa_path = write_qa(results, CFG)
    passed = sum(1 for r in results if r.get("passed"))
    flagged = [r["file"] for r in results if not r.get("passed")]

    log("")
    log(f"processed : {len(results)}")
    log(f"failed    : {len(failures)}")
    log(f"QA passed : {passed}")
    log(f"QA flagged: {len(flagged)}" + (f" -> {', '.join(flagged)}" if flagged else ""))
    for n, e in failures:
        log(f"  FAIL {n}: {e}")
    log(f"qa report -> {qa_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
