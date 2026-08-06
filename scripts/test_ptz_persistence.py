"""Regression guard for 8e.1 PTZ project restoration."""

from pathlib import Path


root = Path(__file__).resolve().parents[1]
source = (root / "static" / "viewer.js").read_text(encoding="utf-8-sig")

start = source.index("function applyLoadedProject(project)")
end = source.index("loadProjectFile.addEventListener", start)
load_block = source[start:end]

required_restore_lines = (
    "item.data.pan = cameraData.data?.pan ?? cameraData.pan ?? item.data.pan ?? 0;",
    "item.data.tilt = cameraData.data?.tilt ?? cameraData.tilt ?? item.data.tilt ?? 0;",
    "item.data.roll = cameraData.data?.roll ?? cameraData.roll ?? item.data.roll ?? 0;",
    "item.data.zoom = cameraData.data?.zoom ?? cameraData.zoom ?? item.data.zoom ?? 1;",
)

for line in required_restore_lines:
    assert line in load_block, f"Missing PTZ restoration: {line}"

rig_call = load_block.index("applyCameraPtzRig(item);")
projection_call = load_block.index("updateCameraProjection(item);")
assert rig_call < projection_call, "PTZ rig must be restored before projection refresh"

save_start = source.index("saveProjectButton.addEventListener")
save_block = source[save_start:]
assert "data: {\n          ...item.data\n        }" in save_block, (
    "Project save must preserve camera PTZ data"
)

print("8e.1 PTZ persistence regression guard passed")
