# 3D Inspection Simulator

> **License:** Noncommercial use is governed by the PolyForm Noncommercial
> License 1.0.0. Commercial use requires a separate paid license.
> See [LICENSE](LICENSE) and [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md).


This workspace is the recoverable N.O.M.A.D. 8e application baseline assembled for continued development.

## Included

- `app.py` - Flask backend synchronized from the live NOMAD host on 2026-07-24.
- `templates/index.html` - June 17, 2026 frontend snapshot.
- `static/viewer.js` - June 17, 2026 Three.js implementation snapshot.
- `data/camera_database/camera_database.csv` - July 7, 2026 camera database with 221 records.
- `data/cameras/camera_library.csv` - legacy fallback camera library.
- `docs/reference/` - the 8e master consolidation handoff.
- `AUDIT_8E.md` - verified current-state audit and 8f entry backlog.
- `scripts/audit_static.py` - repeatable HTML/JavaScript consistency check.

Large model files are intentionally not duplicated. Set `NOMAD_DATA_ROOT` to the NAS CCTVSimulator data root when testing with shared models and projects.

## Local setup

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5010/`.

## NAS-backed setup

```bash
export NOMAD_DATA_ROOT=/mnt/nomad-nas/Share/CCTVSimulator
export CAMERA_LIBRARY=/mnt/nomad-nas/Share/CCTVSimulator/camera_database/camera_database.csv
python app.py
```

The frontend imports Three.js modules from `esm.sh`, so the browser needs network access unless those dependencies are vendored in a future release.

## Verification

```powershell
python scripts/audit_static.py
python scripts/test_ptz_persistence.py
python scripts/test_project_schema.py
python scripts/test_8e7_5_project_restore.py
python scripts/test_theme_engine.py
python scripts/test_preferences.py
node scripts/test_preferences_runtime.mjs
python scripts/test_viewport_renderer_parity.py
python scripts/test_ui_viewport_management.py
node scripts/test_ui_viewport_management_runtime.mjs
node scripts/test_project_schema_runtime.mjs
node scripts/test_8e7_5_project_restore_runtime.mjs
Copy-Item static/viewer.js audit/viewer.mjs
node --check audit/viewer.mjs
python -m py_compile app.py
```

## Version-control note

The NAS share does not permit Git object-file operations reliably. Keep the working source here if needed, but initialize the repository on a local NTFS/Linux filesystem and synchronize reviewed releases back to the NAS.

