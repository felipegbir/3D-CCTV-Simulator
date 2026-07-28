from flask import Flask, jsonify, render_template, send_from_directory
import csv
import os

app = Flask(__name__)

DATA_ROOT = os.environ.get("NOMAD_DATA_ROOT", "/mnt/nomad-nas/Share/CCTVSimulator")
CAMERA_DATABASE = os.environ.get(
    "CAMERA_DATABASE",
    os.path.join(DATA_ROOT, "camera_database", "camera_database.csv")
)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "nomad-cctv-simulator"
    })

@app.route("/models/<path:filename>")
def serve_model(filename):
    model_root = os.path.join(DATA_ROOT, "models", "optimized")
    return send_from_directory(model_root, filename)

@app.route("/api/models")
def models():
    model_root = os.path.join(DATA_ROOT, "models", "optimized")
    supported = {".glb", ".gltf"}

    records = []
    if os.path.isdir(model_root):
        for name in sorted(os.listdir(model_root)):
            full_path = os.path.join(model_root, name)
            if os.path.isfile(full_path) and os.path.splitext(name.lower())[1] in supported:
                records.append({
                    "name": name,
                    "path": full_path,
                    "size_bytes": os.path.getsize(full_path)
                })

    return jsonify({
        "count": len(records),
        "models": records
    })

@app.route("/api/cameras")
def cameras():
    records = []

    if not os.path.exists(CAMERA_DATABASE):
        return jsonify({
            "count": 0,
            "cameras": [],
            "error": f"Camera database not found: {CAMERA_DATABASE}"
        }), 404

    with open(CAMERA_DATABASE, newline="", encoding="utf-8-sig") as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            cleaned_row = {}
            for key, value in row.items():
                if key is None:
                    continue

                clean_key = key.strip()
                clean_value = value.strip() if isinstance(value, str) else value
                cleaned_row[clean_key] = clean_value

            records.append(cleaned_row)

    return jsonify({
        "count": len(records),
        "cameras": records
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5010)
