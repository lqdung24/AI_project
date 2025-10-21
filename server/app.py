import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from server.service import find_nearest_node

app = Flask(__name__)
CORS(app)

###   DATA ROUTE   ###
DATA_DIR = os.path.join(os.path.dirname(__file__), "../00.data/data")

if not os.path.exists(DATA_DIR):
    print(f"Data directory ${DATA_DIR} not found.")

@app.route("/nodes", methods=["GET"])
def get_nodes():
    return send_from_directory(DATA_DIR, "nodes.csv")

@app.route("/edges", methods=["GET"])
def get_edges():
    return send_from_directory(DATA_DIR, "edges.csv")

@app.route("/boundary", methods=["GET"])
def get_boundary():
    return send_from_directory(DATA_DIR, "phuong_kim_lien.geojson")
@app.route("/point", methods=["POST"])
def get_point():
    try:
        data = request.get_json()
        lat = data.get("lat")
        lng = data.get("lng")

        if lat is None or lng is None:
            return jsonify({
                "status": "error",
                "message": "Missing latitude or longitude",
                "data": None
            }), 400

        nearest_node = find_nearest_node(lat, lng)

        return jsonify({
            "status": "success",
            "message": "Nearest node found",
            "data": nearest_node
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Server error: {str(e)}",
            "data": None
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=8000)
