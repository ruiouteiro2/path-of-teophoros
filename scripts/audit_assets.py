"""Read-only sprite integrity audit. Requires Pillow; never modifies artwork.

Run from any directory: python scripts/audit_assets.py
Optional JSON evidence: python scripts/audit_assets.py --report .expo/asset-audit.json
This checks technical integrity, not artistic consistency or animation quality.
"""
import argparse
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def audit():
    manifest = json.loads((ROOT / "docs/asset-manifest.json").read_text())
    errors, results = [], []
    for entry in manifest["atlases"]:
        name = entry["file"]
        try:
            with Image.open(ROOT / "assets/world" / name) as image:
                if "A" not in image.getbands():
                    raise ValueError("missing alpha channel")
                alpha = image.getchannel("A")
                width, height = image.size
                columns, rows = entry["columns"], entry["rows"]
                if abs(width / columns - height / rows) > 1:
                    raise ValueError("atlas cells are not square")
                anchors = None
                if "anchors" in entry:
                    anchors = json.loads((ROOT / "src" / entry["anchors"]).read_text())
                    if "key" in entry:
                        anchors = anchors[entry["key"]]
                    if len(anchors) != columns * rows:
                        raise ValueError("anchor count does not match frame count")
                cells = []
                for row in range(rows):
                    for column in range(columns):
                        index = row * columns + column
                        bounds = (round(column * width / columns), round(row * height / rows),
                                  round((column + 1) * width / columns), round((row + 1) * height / rows))
                        cell = alpha.crop(bounds)
                        box = cell.point(lambda v: 255 if v > manifest["alphaThreshold"] else 0).getbbox()
                        if box is None:
                            errors.append(f"{name} frame {index}: empty silhouette")
                            continue
                        cw, ch = cell.size
                        margin = min(box[0], box[1], cw - box[2], ch - box[3])
                        if margin < 1:
                            errors.append(f"{name} frame {index}: silhouette touches cell edge")
                        baseline = box[3] / ch
                        drift = None
                        if anchors is not None:
                            saved = anchors[index]
                            saved_y = saved["y"] if isinstance(saved, dict) else saved
                            drift = abs(baseline - saved_y)
                            if drift > manifest["anchorTolerance"]:
                                errors.append(f"{name} frame {index}: contact drift {drift:.4f}")
                        cells.append({"frame": index, "marginPixels": margin,
                                      "baseline": round(baseline, 5), "anchorDrift": drift})
                results.append({"file": name, "size": [width, height], "cells": cells})
        except (OSError, ValueError, KeyError, TypeError) as error:
            errors.append(f"{name}: {error}")
    return {"atlases": results, "errors": errors}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    result = audit()
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    frames = sum(len(a["cells"]) for a in result["atlases"])
    print(f"Checked {len(result['atlases'])} atlases / {frames} frames")
    for error in result["errors"]:
        print("FAIL:", error)
    if not result["errors"]:
        print("PASS: nonempty frames, transparent margins and current contact anchors")
    raise SystemExit(bool(result["errors"]))
