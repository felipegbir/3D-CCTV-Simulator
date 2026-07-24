"""Static consistency checks for the NOMAD CCTV Simulator frontend."""

from __future__ import annotations

import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path


class IdCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        for name, value in attrs:
            if name == "id" and value:
                self.ids.append(value)


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    html_path = root / "templates" / "index.html"
    js_path = root / "static" / "viewer.js"

    html = html_path.read_text(encoding="utf-8")
    js = js_path.read_text(encoding="utf-8")

    parser = IdCollector()
    parser.feed(html)
    id_counts = Counter(parser.ids)
    html_ids = set(parser.ids)

    js_id_refs = set(
        re.findall(
            r"""getElementById\(\s*['"]([^'"]+)['"]\s*\)""",
            js,
        )
    )
    missing_ids = sorted(js_id_refs - html_ids)
    duplicate_ids = sorted(name for name, count in id_counts.items() if count > 1)

    required_markers = {
        "Three.js 0.160.0": "three@0.160.0",
        "TransformControls": "TransformControls",
        "FBXLoader": "FBXLoader",
        "camera database": "/api/cameras",
        "PTZ rig": "applyCameraPtzRig",
        "camera creation": "createCameraObject",
        "GLTF import": "loadGltfModel",
        "FBX import": "loadFbxModel",
        "project save": "saveProject",
        "project load": "loadProject",
        "project schema": "PROJECT_SCHEMA_VERSION",
        "asset manifest": "buildProjectAssetManifest",
        "schema validation": "validateProjectSchema",
    }
    missing_markers = [
        label for label, marker in required_markers.items() if marker not in js
    ]

    legacy_color_literals = re.findall(r"#[0-9a-fA-F]{3,8}\b", html)
    css_variables = re.findall(r"--[a-zA-Z0-9_-]+\s*:", html)

    print(f"HTML IDs: {len(html_ids)}")
    print(f"JavaScript getElementById references: {len(js_id_refs)}")
    print(f"Missing referenced IDs: {len(missing_ids)}")
    for name in missing_ids:
        print(f"  MISSING_ID {name}")
    print(f"Duplicate HTML IDs: {len(duplicate_ids)}")
    for name in duplicate_ids:
        print(f"  DUPLICATE_ID {name}")
    print(f"Missing 8e implementation markers: {len(missing_markers)}")
    for label in missing_markers:
        print(f"  MISSING_MARKER {label}")
    print(f"CSS variable declarations: {len(css_variables)}")
    print(f"Hard-coded CSS color literals: {len(legacy_color_literals)}")

    return 1 if missing_ids or duplicate_ids or missing_markers else 0


if __name__ == "__main__":
    sys.exit(main())
