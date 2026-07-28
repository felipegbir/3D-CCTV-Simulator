# Agent working agreement

- Treat `AUDIT_8E.md` and the master consolidation under `docs/reference/` as the handoff baseline.
- Treat the June 17 `templates/index.html` and `static/viewer.js` snapshots as authoritative when implementation details differ from the older document.
- Preserve the PTZ hierarchy: camera root, pan pivot, tilt pivot, roll pivot.
- Keep the projection cone and render camera aligned under the roll pivot.
- Use optimized GLB/glTF as the preferred runtime model format. Keep direct FBX loading guarded.
- Do not present Lay Face Flat as complete.
- Do not duplicate large model assets in this workspace.
- Before frontend changes, run `scripts/audit_static.py` and the JavaScript module syntax check documented in `README.md`.
- Record known defects and deferred work in `AUDIT_8E.md` or release notes.
