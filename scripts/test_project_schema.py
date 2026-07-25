"""Regression guard for the N.O.M.A.D. project schema-4 contract."""

import re
from pathlib import Path


root = Path(__file__).resolve().parents[1]
source = (root / "static" / "viewer.js").read_text(encoding="utf-8")

required_contract = (
    "const PROJECT_SCHEMA_VERSION = 4;",
    "const LEGACY_PROJECT_SCHEMA_VERSION = 1;",
    "function buildProjectAssetManifest()",
    "function validateProjectSchema(project)",
    "function showProjectAssetWarnings(project)",
    "schemaVersion: PROJECT_SCHEMA_VERSION",
    "appVersion: APP_VERSION",
    "savedAt: new Date().toISOString()",
    "assetManifest,",
    "LOCAL_MODEL_NOT_EMBEDDED",
    "REFERENCE_IMAGE_NOT_EMBEDDED",
)

assert re.search(r"const APP_VERSION = '8e\.\d+(?:\.\d+)?';", source), "Missing app version"

for marker in required_contract:
    assert marker in source, f"Missing schema-4 contract marker: {marker}"

load_start = source.index("loadProjectFile.addEventListener")
load_end = source.index("saveProjectButton.addEventListener", load_start)
load_block = source[load_start:load_end]

validate_call = load_block.index("validateProjectSchema(project)")
warning_call = load_block.index("if (!showProjectAssetWarnings(project)) return;")
apply_call = load_block.index("applyLoadedProject(project)")
assert validate_call < warning_call < apply_call, (
    "Load must validate schema, show asset warnings, then apply project state"
)

schema_start = source.index("function validateProjectSchema(project)")
schema_end = source.index("function showProjectAssetWarnings(project)", schema_start)
schema_block = source[schema_start:schema_end]
assert "project?.schemaVersion ?? LEGACY_PROJECT_SCHEMA_VERSION" in schema_block
assert "schemaVersion > PROJECT_SCHEMA_VERSION" in schema_block
assert "schemaVersion < PROJECT_SCHEMA_VERSION" in schema_block
assert "return false;" in schema_block

save_start = source.index("saveProjectButton.addEventListener")
save_block = source[save_start:]
manifest_build = save_block.index("buildProjectAssetManifest()")
warning_prompt = save_block.index("confirm(")
project_build = save_block.index("const project = {")
assert manifest_build < warning_prompt < project_build, (
    "Asset warnings must be evaluated before the project download is built"
)
assert "if (!shouldSave) return;" in save_block

print("8e.7 project schema and asset warning regression guard passed")