# N.O.M.A.D. 8e Current-State Audit

Audit date: 2026-07-24  
Baseline: 8e master consolidation plus the June 17 frontend snapshots  
Purpose: establish a trustworthy Codex workspace and define the 8f entry point

## Executive result

The recovered frontend is a coherent 8e MVP and passes JavaScript syntax and HTML/JavaScript ID-contract checks. The PTZ pivot architecture, corrected projection direction, live viewports, camera database integration, guarded FBX import, browser-side project JSON, and transform undo/redo are present.

The workspace is not yet a production-ready application. The first verified correctness defect was PTZ project restoration. Release 8e.1 restores nested and legacy PTZ fields and reapplies the pivot rig before projection refresh. Server validation and owner visual acceptance passed; saved cameras, camera models, and PTZ settings restored successfully.

## Provenance

| Artifact | Workspace location | Source state |
| --- | --- | --- |
| Flask backend | `app.py` | Synchronized from live host `192.168.2.208:/home/vmuser/nomad-cctv-simulator/app.py` on 2026-07-24; live file dated 2026-05-06 |
| Frontend shell | `templates/index.html` | Top-level NAS snapshot dated 2026-06-17 |
| Three.js application | `static/viewer.js` | Top-level NAS snapshot dated 2026-06-17 |
| Camera database | `data/camera_database/camera_database.csv` | Current NAS database dated 2026-07-07 |
| Master handoff | `docs/reference/NOMAD_8e_CCTV_Digital_Twin_Simulator_Master_Consolidation.docx` | Consolidated 8e requirements and history |

The initial recovered backend was older than the frontend. SSH verification established the live May 6 backend as authoritative; it uses the current camera database, strips UTF-8 BOMs, normalizes CSV fields, and returns a controlled 404 when the database is absent.

## Verification completed

- `viewer.js` parses successfully as an ES module with `node --check`.
- `app.py` compiles successfully with `python -m py_compile`.
- Static frontend contract:
  - 64 unique HTML IDs.
  - 58 `getElementById()` references.
  - 0 missing referenced IDs.
  - 0 duplicate HTML IDs.
  - All audited 8e feature markers are present.
- Camera database:
  - 221 records.
  - 49 columns.
  - Includes manufacturer, model/part number, resolution, focal range, HFOV, PTZ capability, thermal, and radiometric fields used by the frontend.
- A Flask test-client smoke test was prepared but could not run in the bundled analysis runtime because Flask was not installed there. The recovered, exact dependency versions are now recorded in `requirements.txt`.

## Requirements-to-code assessment

| Area | Audit status | Evidence and limits |
| --- | --- | --- |
| Three.js scene and controls | Present | Three.js 0.160.0, OrbitControls, TransformControls, lighting, grid, axes, selection registry |
| PTZ pivot rig | Present | `cameraRoot > panPivot > tiltPivot > rollPivot`; `applyCameraPtzRig()` applies independent axes |
| Projection direction | Present | Cone rotates on X and is positioned along negative Z under the roll pivot |
| Camera viewports | Present | Open/close, drag, minimize/maximize, capture, PTZ toggle, roll controls |
| Viewport capture isolation | Present in code | Transform helper is hidden for capture; requires browser regression test |
| Camera database | Present | `/api/cameras` fetch, search/index mapping, generic fallback |
| GLB/glTF import | Present | GLTFLoader path and model registration |
| FBX import | Present | File-size guardrails, triangle counting, orientation/scale heuristics |
| Reference image import | Present | Browser-local texture plane; no durable asset persistence |
| Pixel-density analytics | Present | HFOV, scene width, and px/m calculations |
| Project save/load | Partial | Cameras and model transforms serialize; local imported assets are not recreated |
| PTZ persistence | Accepted and complete in 8e.1 | Nested and legacy PTZ fields restore and `applyCameraPtzRig()` runs before projection refresh |
| Undo/redo | Partial | Captures only position, rotation, and scale |
| Theme/preferences | Accepted through 8e.4 | CSS-variable light/dark engine plus persistent customer preferences passed owner acceptance |
| Backend persistence | Not implemented | No project, upload, conversion, or report endpoints |
| Production packaging | Not implemented | CDN ESM imports, Flask dev server, no service/container/reverse proxy configuration |
| Lay Face Flat | Diagnostic only | Triangle-plane analysis exists; production face selection/worker path does not |

## Findings

### P1 - PTZ state is not visually restored after project load

Original 8e behavior merged saved camera data without reapplying the PTZ pivots. Release 8e.1 restores pan, tilt, roll, and zoom from nested or legacy fields, calls `applyCameraPtzRig()` before projection refresh, and adds a regression guard. Live server-side checks and owner visual confirmation passed.

### P1 - No durable asset recreation during load

The project JSON stores model transforms and a top-level model file/path, but loading only applies transforms to models that are already in `sceneObjects`. Browser-local GLB, FBX, and reference-image imports cannot be reconstructed after a new session. This is consistent with prototype scope but is a data-loss risk if users interpret project save as complete persistence.

### P1 - Backend source and deployment state are not authoritative

The authoritative live `app.py` has now been synchronized into this repository. The frontend files match the live host by SHA-256. Future backend changes should originate in Git and deploy to the host, avoiding further source drift.

### P2 - Undo/redo covers transforms only

Snapshots include position, rotation, and scale. Add/delete/import, PTZ, projection distance/color, focal/zoom changes, property edits, and project load are outside the history model.

### P2 - Theme engine and customer preferences implemented

Release 8e.3 established the accepted CSS-variable light/dark engine. Release 8e.4 adds a validated browser-local preference model and UI for theme, reverse pan/tilt, invert zoom, renderer quality, grid/axes visibility, cone opacity, and FBX auto-scale. Live server validation and 8e.4 owner acceptance passed, including viewport drag verification for Reverse Pan and Reverse Tilt.

### P2 - Runtime dependencies remain externally coupled

Three.js and loaders are imported from `https://esm.sh`. Startup can serve the page without internet, but the simulator cannot initialize in an offline browser unless dependencies are vendored or otherwise hosted locally.

### P2 - Project schema and asset warnings implemented in 8e.2

Release 8e.2 adds numeric schema version 2, application version, save timestamp, structured asset manifest, backward compatibility for unversioned files, future-schema rejection, and cancellable save/load warnings for non-embedded browser-local models and reference images. Deployment, server checks, and owner acceptance passed. The owner confirmed the legacy schema-1 compatibility warning, successful restoration, and schema-2 output after saving and reopening. Project identity, preferences, and full migration/persistence remain deferred to their approved roadmap releases.

### P2 - CSS-variable theme foundation and dark mode implemented in 8e.3

Release 8e.3 converts primary interface surfaces to shared light/dark CSS variables and adds a theme toggle under Operations > View. The main Three.js scene background follows the selected theme. Automated regression, live server validation, and owner visual acceptance passed. Theme persistence is implemented in 8e.4.
### Deferred final persistence reconciliation - owner directive

After the numbered roadmap feature work, perform a dedicated project-save/load reconciliation. Project JSON must persist each camera viewport palette/mode (Visible, IR White, IR Black, IR Rainbow, and other supported modes) and all applicable tool state. External model and reference-image binaries remain outside the JSON; save only their resolvable reference path/file plus complete position, rotation, scale, and applicable display metadata so load can recreate the referenced element exactly. This is an expansion of persistence coverage, not a redo of the accepted 8e.1 PTZ fix.

### Dark default implemented in 8e.5

Dark theme is now the default for new browsers and after Reset Preferences. Existing users with an explicitly saved theme choice retain that choice unless they reset preferences.

### Planned camera presets and thermography pixel-density requirements - owner directive

Camera presets must be named, editable, recallable, and fully persisted. Each preset stores the preset label/name, notes or descriptive information, camera identity and optical state, complete PTZ state, camera transform, projection/depth state, selected viewport palette/mode, and calculated pixel-density context.

Each preset exposes a collapsible details panel showing at minimum:

- preset name and notes;
- camera make, model, lens, and zoom/focal state;
- camera position plus pan, tilt, roll, and zoom;
- camera depth/projection-distance setting;
- horizontal and vertical scene footprint at that depth;
- horizontal and vertical pixel density in pixels per configured unit;
- estimated horizontal-by-vertical pixel coverage across the configured thermography target/ROI.

Add a compact **Select Depth Surface** control. Activating it enters a clearly indicated pick mode; the next valid model-surface click uses a raycast hit point to calculate camera-to-surface distance and update projection depth. Ignore helpers, camera geometry, viewport overlays, and empty-space clicks. Store a stable reference to the target object/surface where possible, the world-space hit point, the calculated distance, and the calculation timestamp. Recalculate derived density whenever lens/zoom, resolution, camera pose, depth, target point, units, or ROI dimensions change.

Thermography/thermometry scenarios require target or ROI width and height. The tool must convert pixel density into estimated pixels across that ROI and classify at least:

- below minimum: either dimension is below 3 pixels;
- minimum detection: at least 3 x 3 pixels;
- preferred baseline: at least 9 x 9 pixels;
- enhanced: exceeds 9 x 9, reporting the actual estimated coverage rather than imposing an upper limit.

These are planning estimates, not a guarantee of thermographic measurement performance. Show the inputs and calculation basis so results remain auditable.

Preset persistence must include calculation inputs, derived results, scenario classification, selected depth target reference, and viewport palette. On load, restore the complete preset and recalculate when referenced geometry is available; otherwise retain the saved values and display a clear stale/missing-target warning. This work is part of the final comprehensive persistence reconciliation and must use explicit schema versioning/migration.

### P2 - Viewport renderer parity and Preferences collapse correction implemented in 8e.5

Camera viewport renderers now inherit the main renderer's color space, tone mapping, exposure, shadow-map type, high-performance preference, and quality-controlled pixel ratio/shadow setting. The owner-reported Preferences collapse defect is corrected by hiding preference rows when their menu group is collapsed. Automated and live server validation passed; owner visual/performance acceptance is pending.
### P3 - Legacy and placeholder UI remains

Numerous Operations commands remain disabled, and legacy `.camera-viewport-ptz` styles are still present. Cleanup should follow regression coverage so unused markup/styles are not removed speculatively.

## Recommended 8f execution order

1. **8e.1 complete:** PTZ save/load restoration passed owner acceptance.
2. **Baseline complete:** live `app.py` synchronized and authoritative Git history established.
3. **8e.2 complete:** schema versioning and non-persistent asset warnings passed owner acceptance.
4. **8e.3 complete:** CSS-variable theme foundation and dark mode passed owner acceptance.
5. **8e.4 complete:** customer preferences model, UI, validation, and browser-local persistence passed owner acceptance.
6. **8e.5 deployed:** viewport renderer parity, Dark default, and Preferences collapse correction implemented; owner acceptance pending.
7. Expand undo/redo into command-based history.
8. Add NAS-backed project and asset persistence before reporting or advanced analysis features.

## Definition of done for the first 8f change

- Baseline backup or Git commit exists.
- JavaScript and Python syntax checks pass.
- Static frontend contract audit passes.
- A browser test proves pan, tilt, roll, zoom, cone direction, and viewport orientation survive a save/reload round trip.
- Existing GLB/FBX import, viewport capture, selection, and transform behavior are regression-tested.
- The audit and change notes identify exact modified files and deferred risks.

## Workspace filesystem constraint

Git could not create object files reliably in the original NAS workspace. This local NTFS working copy was created to provide the authoritative Git-backed development baseline. Use the NAS as a backup or deployment source rather than the live Git object database.


