import os
from flask import Flask, request, send_from_directory
from flask_cors import CORS

from server.respone import make_response
from server.service import node_input, refresh, find_path, start, end

app = Flask(__name__)
CORS(app)

###   DATA ROUTE   ###
DATA_DIR = os.path.join(os.path.dirname(__file__), "../00.data/data")

if not os.path.exists(DATA_DIR):
    print(f"Data directory ${DATA_DIR} not found.")

@app.route("/data/nodes", methods=["GET"])
def get_nodes():
    return send_from_directory(DATA_DIR, "nodes.csv")

@app.route("/data/edges", methods=["GET"])
def get_edges():
    return send_from_directory(DATA_DIR, "edges.csv")

@app.route("/data/boundary", methods=["GET"])
def get_boundary():
    return send_from_directory(DATA_DIR, "phuong_kim_lien.geojson")
@app.route("/point", methods=["POST"])
def get_nearest_point():
    data = request.get_json()
    node = data.get('node')
    # print(node)
    return node_input(node)

@app.route("/point")
def get_point():
    return make_response(data={'start': start, 'end': end})

@app.route("/point/refresh", methods=["POST"])
def refresh_point():
    return refresh()

@app.route("/path", methods=["POST"])
def find():
    if not start['set'] or not end['set']:
        return make_response(message='Start or end point not selected',data={'start': start, 'end': end}, code=400)

    path, length = find_path()

    if path is None:
        return make_response(message='Cannot find path', code=404)

    return make_response(message='Path found', data={'path': path, 'length': length})


if __name__ == "__main__":
    app.run(debug=True, port=8000)
