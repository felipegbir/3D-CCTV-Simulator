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

Camera viewport renderers now inherit the main renderer's color space, tone mapping, exposure, shadow-map type, high-performance preference, and quality-controlled pixel ratio/shadow setting. The owner-reported Preferences collapse defect is corrected by hiding preference rows when their menu group is collapsed. Automated, live server, and owner visual/performance acceptance passed.
### Owner-requested professional UI and viewport management implemented in 8e.6

Release 8e.6 adds runtime version display, professional Help / About content, verified open-source package links, focus-based viewport stacking, a 16-viewport limit, and capacity-based 1x1 through 4x4 video-wall arrangement. Minimized renderers are skipped and closed renderers are disposed. Automated, live server, and owner acceptance passed for the About UI, active viewport stacking, and wall arrangement. The owner-directed alternate Video Wall workflow is scheduled for 8e.7. The public source-repository URL remains intentionally pending until publication.
### P3 - Legacy and placeholder UI remains

Numerous Operations commands remain disabled, and legacy `.camera-viewport-ptz` styles are still present. Cleanup should follow regression coverage so unused markup/styles are not removed speculatively.

## Recommended 8f execution order

1. **8e.1 complete:** PTZ save/load restoration passed owner acceptance.
2. **Baseline complete:** live `app.py` synchronized and authoritative Git history established.
3. **8e.2 complete:** schema versioning and non-persistent asset warnings passed owner acceptance.
4. **8e.3 complete:** CSS-variable theme foundation and dark mode passed owner acceptance.
5. **8e.4 complete:** customer preferences model, UI, validation, and browser-local persistence passed owner acceptance.
6. **8e.5 complete:** viewport renderer parity, Dark default, and Preferences collapse correction passed owner acceptance.
7. **8e.6 complete:** professional About/version UI, viewport focus stacking, 16-view capacity, and initial wall arrangement passed owner acceptance.
8. Expand undo/redo into command-based history.
9. Add NAS-backed project and asset persistence before reporting or advanced analysis features.

## Definition of done for the first 8f change

- Baseline backup or Git commit exists.
- JavaScript and Python syntax checks pass.
- Static frontend contract audit passes.
- A browser test proves pan, tilt, roll, zoom, cone direction, and viewport orientation survive a save/reload round trip.
- Existing GLB/FBX import, viewport capture, selection, and transform behavior are regression-tested.
- The audit and change notes identify exact modified files and deferred risks.

## Workspace filesystem constraint

Git could not create object files reliably in the original NAS workspace. This local NTFS working copy was created to provide the authoritative Git-backed development baseline. Use the NAS as a backup or deployment source rather than the live Git object database.



### 8e.7 - Alternate Video Wall, scale calibration, and measurement

Release 8e.7 preserves the accepted floating camera-window workflow and moves wall organization into a separate Planning Workspace / Video Wall mode. The wall includes a Planning Scene tile, all current cameras (up to 16), Auto and 1x1 through 5x5 layouts, drag/drop ordering, and a linked pop-out window for a second monitor. The pop-out shares the originating browser's in-memory scene; it is not an independently loaded project session.

The redundant Operations > View theme control is removed, while Preferences remains authoritative. Help and About are separate collapsible groups. The default model-import preset now applies the owner-specified HVDC/mm transform (-90 degrees X, scale 0.01) to GLB/glTF and FBX; As Exported is available.

Two-point raycast measurement and selected-model scale calibration are implemented. Project schema 3 persists preferences, wall layout/order, model calibration metadata, measurement records, and external reference-image transforms. External binaries remain unembedded and must be available/re-imported in a new browser session. Calibration uses uniform scaling and is not yet included in command-based undo/redo. Deployment and server validation passed on port 5010 (PID 823566); owner visual acceptance is pending.
### 8e.7 owner correction pass - pending acceptance

Initial owner testing found corrupted encoding in the Measurement Tools, Help, and About headers; blank camera output in floating and wall views; missing camera controls on wall tiles; and insufficient measurement feedback. The correction pass repairs encoding, separates projection-depth analysis from the render camera far clip, hides camera apparatus during camera renders, and adds palette/Capture/PTZ/zoom controls to wall camera tiles. Measurement gains mesh-edge highlighting, near-edge snap assistance, immediate first-point display, live preview, and a Shift magnifier. Automated and live server checks pass on corrected PID 848398; owner visual and interaction acceptance is pending.
### 8e.7 owner correction pass 2 - pending acceptance

Owner follow-up found that measurement mode blocked scene navigation, the Shift lens did not contain a render, fixed Video Wall selections created columns rather than true square grids, and the measurement status panel remained exposed when collapsed. The second correction keeps orbit/pan/zoom active while suppressing placement after drag gestures, replaces the lens with a cursor-targeted WebGL camera, allocates true fixed grids with empty slots, and completes the Measurement Tools collapse selector. Automated and live server validation pass on corrected PID 865305; owner acceptance is pending.
### 8e.7 owner correction pass 3 - pending acceptance

Owner testing found completed measurement lines could disappear behind the measured surface, whole-model edge outlines were visually excessive, and returning from Video Wall could leave the Planning Scene and Camera Views blank. The third correction renders accepted measurements as non-depth-tested overlays, highlights only the hovered triangle's three local edges, and explicitly releases discarded wall/viewport WebGL contexts. Camera helper visibility restoration is exception-safe. Automated regression validation passes; deployment and owner acceptance remain pending.
Deployment validation passed on CCTV PID 878130 with health ok, cache key 927, and matching local/deployed frontend hashes. No container or unrelated service was restarted.

### 8e.7 owner correction pass 4 - pending acceptance

Measurement lines now carry persistent human-readable IDs and parallel 3D distance labels, the Shift precision lens uses explicit 2x zoom, and projection-cone depth once again defines the camera render far plane. This restores the expected depth-analysis relationship without undoing the camera-helper and renderer-lifecycle corrections. Automated regression validation passes; deployment and owner acceptance remain pending.
Deployment validation passed on CCTV PID 889552 with health status ok, cache key 928, and matching local/deployed frontend hashes. No container or unrelated service was restarted.


### 8e.7 owner correction pass 5 - pending acceptance

The loupe's zoom-property multiplier produced a visually reversed result in owner testing. It is replaced by an exact 2x half-angle field-of-view calculation. No other 8e.7 behavior changed; automated regression validation passes.

Deployment validation passed on CCTV PID 899654 with health status ok, cache key 929, and matching frontend hashes. Owner confirmation will seal 8e.7.


### 8e.7 owner correction pass 6 - pending acceptance

Correction pass 5 is rejected: its FOV approach still appeared as zoom-out in owner testing. Pass 6 defines MEASUREMENT_MAGNIFICATION = 3, moves the loupe camera to one third of the viewer-to-cursor distance, and displays a 3x badge. This gives an explicit geometric 3x ratio at the selected surface plane. Automated checks pass; browser automation could not initialize from the UNC workspace, so owner visual confirmation remains mandatory.

Deployment validation passed on CCTV PID 908253 with cache key 930, explicit deployed magnification constant 3, and matching frontend hashes. Owner visual confirmation remains required.


### 8e.7 owner correction pass 7 - pending acceptance

Correction pass 6 is rejected by owner visual testing. Pass 7 removes camera-position magnification and applies a configurable 2x-10x screen-space scale to the loupe canvas, defaulting to 3x. The Measurement Tools control updates live and persists through the preferences/project contract. Automated checks pass; owner confirmation remains mandatory.

Deployment validation passed on CCTV PID 917407 with cache 931 and matching frontend hashes. Owner should test several 2x-10x slider values before acceptance.


### 8e.7 owner correction pass 8 - pending acceptance

Correction pass 7 is rejected due raster-scaling blur. Pass 8 uses PerspectiveCamera.setViewOffset to render a cursor-centered sub-frustum at native/high-DPI loupe resolution. The existing 2x-10x preference now controls crop size, not CSS pixel enlargement. Automated checks pass; owner visual confirmation remains mandatory.

Deployment validation passed on CCTV PID 925413 with cache 932, deployed projection-crop marker, and matching frontend hashes. Owner should verify sharpness at 3x, 5x, and 10x.


### 8e.7 owner correction pass 9 - pending acceptance

The now-clear projection loupe is extended to a 2x-20x selectable range while retaining the 3x default and persisted preference contract. No rendering-method changes were made. Automated checks pass; owner confirmation remains pending.

Deployment validation passed on CCTV PID 929900 with cache 933, deployed 2x-20x range, and matching frontend hashes.


### 8e.7 owner correction pass 10 - pending acceptance

Measurement labels now honor point sequence in screen space: Point 1 left of Point 2 keeps normal text, while Point 1 right of Point 2 rotates text 180 degrees. Orientation is recalculated per rendering camera. Automated checks pass; final owner visual confirmation remains pending.

Deployment validation passed on CCTV PID 935864 with cache 934, deployed sequence-orientation marker, and matching frontend hashes.

### 8e.7 accepted and sealed

The owner confirmed all final QA issues resolved on 2026-07-24. Cache 934 is the accepted 8e.7 baseline. The sharp 2x-20x loupe, sequence-aware measurement labels, depth clipping, Video Wall lifecycle, camera rendering, measurement persistence, and all earlier 8e.7 scope are accepted. Future work must branch from this sealed baseline; PTZ preset management/animation, occlusion analysis, NAS persistence, coordinate-datum management, and formal reporting remain unimplemented.
## 8e.7.1 - PTZ Presets (implementation complete; acceptance pending)

Schema 4 adds fully persisted per-camera preset collections. The shared manager supports Add Current, metadata-only Save Details, Update Current, confirmed Delete, Recall, and Select Depth Surface from the inspector, floating Camera View, integrated Video Wall, and linked pop-out wall. Presets retain camera/lens identity, PTZ/optical/depth/palette state, installation transform, ROI inputs, footprint, pixel density, estimated ROI pixels, and 3x3/9x9 thermography classification.

Recall is animated with cubic easing, shortest-path pan/roll, and a persisted 1-60 degrees/second speed preference (default 10). Manual PTZ/roll/zoom cancels recall. Completion applies exact target values and synchronizes the saved palette. Automated schema, persistence, normalization, animation, cancellation, renderer, wall, measurement, and legacy tests pass. Owner visual/interaction acceptance remains required.
8e.7.1 deployment validation passed on CCTV PID 968533 with cache 940, schema 4, live preset recall marker, healthy API, and matching frontend hashes. The accepted 8e.7 frontend remains available as server rollback files. Owner interaction and save/load acceptance remain pending.
### 8e.7.1 owner QA blockers - correction pending

Owner testing found that project save is not completing and that the measurement target/cursor circle is enlarged by loupe magnification, obscuring fine selection. Save failure blocks schema-4 and PTZ preset persistence acceptance. The loupe target marker must be rendered as a constant-size screen-space overlay independent of the 2x-20x scene crop. Both are logged without code changes while the owner continues PTZ QA. Release candidate remains unaccepted.
### 8e.7.1 additional owner PTZ QA blockers - correction pending

Additional PTZ QA found that the preset manager is immovably centered instead of dockable/floatable, the active preset name is not cleared when manual camera movement invalidates the recalled pose, and Select Depth Surface produces no visible action or feedback. The PTZ movement-speed slider also appears disconnected from the actual recall speed. These are acceptance blockers. Depth selection must provide a clear armed state, raycast confirmation, and visible target/depth update; speed validation must demonstrate materially different recall durations at separated settings. No implementation or deployment changes were made while owner QA continues.
### 8e.7.1 camera-comparison QA blockers - correction pending

Owner testing confirms that changing camera make/model currently removes PTZ presets, which conflicts with the simulator's camera-comparison purpose. Presets must remain through camera substitution; replacement-camera limits and derived performance must be recalculated, and presets with limit problems must remain visible with red preset text. Preset metadata is also stale rather than updating in real time as relevant camera, optical, PTZ, depth, ROI, palette, and target inputs change. Both issues are logged without code or deployment changes.
### 8e.7.1 consolidated owner-QA correction - implementation complete

A recoverable `Pre-Menu Layout change` snapshot was created before source modification at `NOMAD_8e.7.1_PRE_MENU_LAYOUT_CHANGE_20260724_233935` / commit `a649053`. The correction converts Operations to a traditional auto-closing top menu, makes the Scene Tree collapsible, and docks the preset manager within its maximized Camera View without covering the image. It also repairs project download lifetime, loupe target sizing, active-preset invalidation, depth-surface selection and preset updates, movement-speed timing, preset retention/red limit warnings across camera swaps, and real-time metadata preview/recalculation.

Automated static, syntax, legacy, schema, PTZ, preferences, renderer, wall, measurement, save, menu, dock, surface-target, camera-limit, and speed tests pass. Browser visual automation was blocked by the current Windows/UNC browser-control initialization, so live owner interaction remains the acceptance gate. No deployment or service restart had occurred at the time of this entry.
8e.7.1 consolidated correction deployment validation passed on CCTV PID 1020971 with cache 941, health `ok`, responsive camera API, live top-menu/Scene Tree markers, and exact local/deployed frontend hashes. The pre-cache-941 server rollback is retained under `deploy_backups/pre_cache_941_20260725_0015`. Independent application PIDs 1458, 2912, and 2733584 retained their original start times and were not restarted. Owner visual/interaction and project save/load acceptance remain pending.
### 8e.7.1 cache-942 menu correction - deployment pending

Owner QA accepted Scene Tree collapse and top-menu styling but found cache 941 dropdown contents constrained within the 40-pixel flex row. Cache 942 introduces a dedicated absolutely positioned `.menu-dropdown` below each label while the label group remains fixed at menu-bar height. Automated static, syntax, layout, PTZ, measurement, and Video Wall checks pass. Owner visual confirmation remains required.Cache 942 true-dropdown deployment passed on CCTV PID 1028073 with health `ok`, exact deployed hashes, and live `.menu-dropdown`/cache-942 markers. Independent services were not restarted. Owner visual confirmation remains pending.
### 8e.7.1 cache-943 menu polish - deployment pending

Cache 943 corrects the owner-reported cache-942 dropdown gap and active-label width expansion. `.menu-dropdown` is excluded from the legacy in-flow selectors, its absolute placement is reinforced at open-state specificity, and menu groups use natural fit-content widths. Automated regressions pass; owner visual confirmation remains required.Cache 943 menu-polish deployment passed on CCTV PID 1036638 with health `ok`, exact deployed hashes, and live fit-content/selector-exclusion/cache-943 markers. Independent services were not restarted. Owner visual confirmation remains pending.
### 8e.7.1 cache-944 PTZ dock correction - deployment pending

Owner QA confirmed PTZ failed only while the preset dock was visible. The visible metadata callback referenced an undefined local `panel`, throwing during active-preset invalidation before manual movement applied. Cache 944 uses the valid global preset panel, preserves PTZ operation with the dock open, restores the original 68% maximized camera image, and expands/restores the containing window around the dock. Full targeted regressions pass; owner interaction confirmation remains required.Cache 944 PTZ-dock deployment passed on CCTV PID 1047019 with health `ok`, exact deployed hashes, and live corrected callback/dock-sizing/cache-944 markers. Independent services were not restarted. Owner PTZ-with-dock interaction confirmation remains pending.
### 8e.7.1 cache-945 Object Inspector sidebar - deployment pending

The Object Inspector is converted from a floating overlay to a right-side rail matching the Scene Tree. It reserves workspace width while expanded, collapses to a 38-pixel tab, preserves the existing inspector sections and selection lifecycle, and triggers renderer resize after layout transitions. Automated validation and owner QA remain pending.

Cache 945 deployment passed on CCTV PID 3764866 at port 5010 with health `ok`, camera API HTTP 200, matching local/deployed frontend hashes, and live Object Inspector/cache markers. The NAS recovery snapshot is `NOMAD_8e.7.1_CACHE945_OBJECT_INSPECTOR_20260727_085050`; the server rollback is `deploy_backups/pre_cache_945_20260727_0850`. No independent service or container was restarted. Owner visual/interaction confirmation remains pending.

### 8e.7.1 cache-946 Object Inspector tier correction - deployment pending

Owner QA accepted the right-side rail but found Camera, Projection / Pixel Density, and PTZ Controls structurally nested beneath the Camera tier, while collapsed-rail descendants could remain visible. Cache 946 creates four sibling collapsible sections inside a distinct Inspector rail and force-hides every non-header descendant when the entire rail is collapsed. Automated and owner validation remain pending.

Cache 946 deployment passed on CCTV PID 3785015 at port 5010 with health `ok`, exact local/deployed template hash, and live tier/collapse/cache markers. NAS recovery snapshot: `NOMAD_8e.7.1_CACHE946_INSPECTOR_TIERS_20260727_091523`; server rollback: `deploy_backups/pre_cache_946_20260727_0915`. No independent service or container was restarted. Owner interaction confirmation remains pending.

### 8e.7.1 cache-947 consolidated Video Wall / PTZ analysis UI - deployment pending

Scope:
- Raise traditional top-menu dropdowns above Camera Viewports and Video Wall content.
- Add selected-tile then selected-source assignment in integrated and pop-out Video Walls.
- Add a true 1 x 2 layout.
- Enable the full PTZ Preset dock in integrated 1 x 1 and 1 x 2 camera tiles using a 70/30 render/preset split.
- Add Camera View and Video Wall camera-tile surface picking for PTZ preset depth.
- Add live PTZ, zoom, footprint, pixel density, and thermography analysis.
- Convert the PTZ Preset dock to compact collapsible sections and normalize control sizing.

Remaining roadmap after cache 947:
- 8e.7 visibility/occlusion checks.
- 8e.8 NAS-backed persistence and reporting.
- Report coordinate-origin workflow, BOM, current camera captures, PTZ preset captures, and pixel-density pages.
- Final save/load consolidation for theme, camera visualization modes, Video Wall assignments, depth targets, external-asset transforms/references, and all accumulated UI state.

Cache 947 deployment passed on CCTV PID 3891423 at port 5010 with health `ok`, exact local/deployed frontend hashes, and live cache/source-selector/surface-raycast/live-analysis markers. NAS recovery snapshot: `NOMAD_8e.7.1_CACHE947_VIDEO_WALL_PTZ_UI_20260727_112701`; server rollback: `deploy_backups/pre_cache_947_20260727_1127`. No independent service or container was restarted. Owner visual and interaction QA remains pending.

### 8e.7.1 cache-948 UI QA correction - deployment pending

Owner QA found Camera Viewports still escaping above top-menu dropdowns, the integrated Video Wall preset dock splitting vertically, PTZ Preset sections out of the requested order, excessive depth display precision, and inconsistent Scene Tree section styling. Cache 948 bounds Camera Viewports in their own stacking context, promotes the traditional menu layer, changes Video Wall camera/preset tiles to a horizontal 70/30 top/bottom split, and reorganizes the dock into six Inspector-style collapsible sections in this order: Preset Management, Name, Target and Movement, Presets, Live Pixel Density, Notes. Depth displays are rounded to two decimals without reducing internal calculation precision. Scene Tree section headers now use the same accent treatment as the Inspector. Working camera-view surface selection is preserved. Static, syntax, and targeted marker/order checks pass; owner visual and interaction validation remains pending.


Cache 948 deployment passed on CCTV PID 3913479 at port 5010 with health status ok, camera API HTTP 200, exact local/deployed frontend hashes, and live cache/menu-layer/preset-management markers. NAS recovery snapshot: NOMAD_8e.7.1_CACHE948_UI_QA_20260727_115345; server rollback: deploy_backups/pre_cache_948_20260727_1155. Only the verified CCTV Simulator PID 3891423 was replaced; no independent service or container was restarted. Owner visual and interaction confirmation remains pending.


### 8e.7.1 cache-949 Video Wall/PTZ toggle QA correction - deployment pending

Cache 949 addresses owner UI and workflow QA after cache 948. The top-bar divider is continuous beneath menu labels, Scene Tree entries use subtle Inspector-consistent row dividers, and the PTZ Preset manager initially opens only Preset Management while the other five sections remain collapsed. Delete now sits beside Recall. The internal preset close button is removed: every Presets button is a true on/off toggle with an active visual state. Integrated Video Wall rebuild/source refresh now preserves per-camera PTZ enablement and restores an open preset dock when its camera remains visible in a supported 1 x 1 or 1 x 2 layout. Static, JavaScript syntax, targeted lifecycle/DOM assertions, and the full Python regression suite pass. Browser visual automation remains blocked by the current Windows process-launch restriction; owner visual/interaction validation remains pending.


Cache 949 deployment passed on CCTV PID 3942527 at port 5010 with health status ok, camera API HTTP 200, exact local/deployed frontend hashes, and live cache/PTZ-state/preset-toggle markers. NAS recovery snapshot: NOMAD_8e.7.1_CACHE949_VIDEO_WALL_PTZ_TOGGLE_20260727_122900; server rollback: deploy_backups/pre_cache_949_20260727_1230. Only the verified CCTV Simulator PID 3913479 was replaced; no independent service or container was restarted. Owner visual and interaction confirmation remains pending.


### 8e.7.1 cache-950 UI precision, preset naming, and schema-5 workspace persistence - deployment pending

Cache 950 makes the left Scene Tree rail use the same sidebar background as the right Inspector, changes the integrated Video Wall camera/preset split to 60/40, and replaces competing top-border declarations with one full-width pseudo-element line. The viewer is now an isolated base stacking context and the menu/dropdowns use stable higher layers so Camera Viewports cannot cover menus. Missing preset names are assigned the next per-camera padded sequential name (Preset 001, Preset 002, and so on) during add/capture, update, detail save, and depth selection.

Project schema 5 adds safe workspace persistence for selected object, Planning/Video Wall mode, Scene Tree rail collapse, Inspector collapse, individual Scene Tree group collapse, selected Video Wall tile, and per-camera Video Wall PTZ enablement. Existing camera/PTZ preset/palette/depth/model/reference/measurement/preferences persistence remains intact. The proposed future .nomad container is deferred pending a versioned package design; JSON remains readable and backward-compatible. Static, syntax, complete regression, and dedicated cache-950 workspace guards pass. Owner visual/save-load confirmation remains pending.

Menu population inventory: File still requires Close Project, Save As, Export Project, and Upload; Edit requires Copy, Cut, Paste, Delete, Clone, and Add; View requires Zoom Out, Fit Grid, Show/Hide Grid, and Show/Hide Axes; Object requires Add Object, Define Object, Object Properties, and Lock/Unlock; Help requires the published manual link; About requires the published source repository link. Preferences, Measurement Tools, current camera/PTZ controls, and current Video Wall controls are populated.


Cache 950 deployment passed on CCTV PID 3963296 at port 5010 with health status ok, camera API HTTP 200, exact local/deployed frontend hashes, and live cache/schema-5/sequential-name/single-line markers. NAS recovery snapshot: NOMAD_8e.7.1_CACHE950_SCHEMA5_UI_PERSISTENCE_20260727_125419; server rollback: deploy_backups/pre_cache_950_20260727_1255. Only the verified CCTV Simulator PID 3942527 was replaced; no independent service or container was restarted. Owner visual and schema-5 save/load confirmation remains pending.


### 8e.7.1 cache-951 .nmd projects, populated menus, and drawable preset ROI - deployment pending

Cache 951 hides the Camera View Presets button until the viewport is maximized, while retaining Presets in supported integrated Video Wall layouts. Project schema 6 uses the .nmd extension for the normal human-readable JSON project format and accepts both .nmd and legacy .json; Export JSON remains available for compatibility. ZIP packaging is intentionally deferred to a later container-format revision.

All formerly disabled top-menu commands are populated: File provides Close, Save As, JSON export, and Open Project File; Edit provides Copy, Cut, Paste, Delete, Clone, and Add Box; View provides Zoom Out, Fit Grid, and Grid/Axes toggles; Object provides Add Box Object, Rename/Define, Object Properties, and Lock/Unlock. Clipboard cloning preserves transforms and camera data; locked state persists in object data.

Preset depth selection is now followed by a drag-to-draw ROI inside the Camera View or supported Video Wall camera tile. The preset stores normalized ROI bounds, physical width/height, exact sensor-image pixel width/height, and the classification: below 3 x 3, minimum 3 x 3, or preferred 9 x 9 and greater. The result is shown explicitly as N x M pixels, so pixels per metre is no longer the sole metric. Static, JavaScript syntax, complete regression, and dedicated cache-951 workflow guards pass. Owner interaction and save/load confirmation remain pending.


Cache 951 deployment passed on CCTV PID 4029353 at port 5010 with health status ok, camera API HTTP 200, exact local/deployed frontend hashes, and live cache/schema-6/.nmd/ROI/menu markers. NAS recovery snapshot: NOMAD_8e.7.1_CACHE951_NMD_MENUS_ROI_20260727_141531; server rollback: deploy_backups/pre_cache_951_20260727_1416. Only the verified CCTV Simulator PID 3963296 was replaced; no independent service or container was restarted. Owner interaction, ROI accuracy, and .nmd save/load confirmation remain pending.


### 8e.7.1 cache-952 multi-ROI polygons and report foundation - deployment pending

Project schema 7 migrates each legacy single rectangular preset ROI to ROI 001 and stores multiple named ROI child entities per PTZ preset. Each ROI retains its selected surface/depth, normalized 3-15 node polygon, visibility, notes, physical bounds/area, pixel bounds/area, conservative minimum effective span, and 3 x 3 / 9 x 9 thermography classification. Persistent Camera View and supported Video Wall overlays can be shown/hidden; edit mode supports node drag, edge-click insertion, and right-click deletion with a three-node minimum and fifteen-node maximum. ROI metrics appear in Live Pixel Density and save inside the .nmd project.

The visible toolbar is simplified by hiding redundant Open/Save As/Add Box/Grid/Axes duplicates while retaining their underlying compatibility hooks. A Report menu now provides Generate Report, Report Settings, and Open Report Options. The generated print-ready letter report includes report metadata, camera BOM, PTZ preset records, and optional ROI depth/pixel-density analysis; report settings persist in schema 7.

Cache 952 deployment passed on CCTV PID 4059845 at port 5010 with health status ok, exact local/deployed frontend SHA-256 hashes, and live cache/schema-7/multi-ROI/report markers. NAS recovery snapshot: NOMAD_8e.7.1_CACHE952_MULTI_ROI_REPORT_20260727_145220; server rollback: deploy_backups/pre_cache_952_20260727_1454 (restored from the verified cache-951 snapshot). Only the verified CCTV Simulator PID 4029353 was replaced; no independent service or container was restarted. Owner interaction, polygon editing, report, and schema-7 save/load confirmation remain pending.

### 8e.7.1 cache-953 detached ROI workflow, adaptive Video Wall dock, and metric precision - deployment pending

Surface selection now ends after saving preset depth. Add ROI independently arms drawing and can be repeated for multiple ROI children; Edit ROI and Delete ROI operate on the selected child. Integrated Video Wall 1 x 1 uses a vertical Camera View-style preset dock, while 1 x 2 retains the horizontal 60/40 dock. A saved global Metric Decimals preference accepts 0-10 and defaults to 5; displayed engineering metrics use the shared formatter and the preference persists locally and in .nmd project preferences.

Cache 953 deployment passed on CCTV PID 4076820 at port 5010 with health status ok, exact local/deployed frontend SHA-256 hashes, and live cache/detached-ROI/metric-precision markers. NAS baseline: NOMAD_8e.7.1_CACHE952_PRE_953_20260727_150452; server rollback: deploy_backups/pre_cache_953_20260727_1515. Only verified CCTV PID 4059845 was replaced; no independent service or container was restarted. Owner QA remains pending.

### 8e.7.1 cache-954 stable ROI lifecycle, display-only precision refresh, and resizable 1 x 1 dock - deployment pending

Preset lookup now preserves object identity so Delete ROI mutates the stored preset instead of a stale normalized copy. Depth selection and ROI drawing keep the preset dock open, preserving camera canvas aspect ratio and aligning the drawn polygon with its persistent overlay. Metric Decimals defaults to 3 and uses a display-only refresh that does not resize renderers. The integrated Video Wall 1 x 1 preset panel defaults to 20% width and has a draggable divider clamped to 15-50%; the width persists in the .nmd workspace.

Cache 954 deployment passed on CCTV PID 4090556 at port 5010 with health ok, exact frontend hashes, and live stable-ROI/resizer/cache markers. NAS baseline: NOMAD_8e.7.1_CACHE953_PRE_954_20260727_152255; server rollback: deploy_backups/pre_cache_954_20260727_1530. Only CCTV PID 4076820 was replaced; unrelated services/containers were untouched. Owner QA pending.

### 8e.7.1 cache-955 continuous ROI editing and camera-image anchoring - deployment pending

ROI node dragging now uses window-level pointer capture semantics and updates the active polygon in place, avoiding the one-pixel/recreated-SVG restriction. Edit ROI toggles to Finish Editing and Escape exits editing. Manual camera/PTZ movement retains the selected preset and ROI children for comparison. PTZ ROI numeric inputs use the global precision formatter. Camera sources use their sensor resolution aspect ratio in Camera View and Video Wall so resizing the 1 x 1 dock does not reproject ROI geometry.

Cache 955 deployment passed on CCTV PID 4117245 at port 5010 with health ok and exact frontend hashes. NAS baseline: NOMAD_8e.7.1_CACHE954_PRE_955_20260727_155941; server rollback: deploy_backups/pre_cache_955_20260727_1610. Only CCTV PID 4090556 was replaced; unrelated services/containers untouched. Owner QA pending.

### 8e.7.1 cache-956 live ROI analysis, fixed sensor canvas, and report configuration - deployment pending

ROI analysis now updates continuously during polygon edits and is colocated with ROI Management. Camera/preset panel resizing overlays a fixed sensor-aspect render so it cannot reframe the camera or distort normalized ROIs. Typography and unintended question-mark separators are corrected. The new original N.O.M.A.D. Report Configuration dialog persists identity, content, page, image, and description settings; generated reports support two scene-context views, camera-to-target context, BOM, rendered PTZ preset images, metadata, and ROI density analysis. All static, syntax, regression, runtime, and cache-956 guards pass. Owner QA remains pending.