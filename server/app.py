import os
from flask import Flask, request, send_from_directory
from flask_cors import CORS

from server import service
from server.respone import make_response
from server.service import node_input, find_path, refresh_guest_service, data

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
    req = request.get_json()
    node = req.get('node')
    # print(node)
    return node_input(node)

@app.route("/point")
def get_point():
    return make_response(data={'start': data['start'], 'end': data['end']})


@app.route("/guest/find-path", methods=["POST"])
def find():
    frontendData = request.get_json().get('data')
    if frontendData != service.data:
        service.data = frontendData

    if not service.data['start']['set'] or not service.data['end']['set']:
        return make_response(message='Start or end point not selected',data={'start': data['start'], 'end': data['end']}, code=400)

    path, length = find_path()

    if path is None:
        return make_response(message='Cannot find path', code=404)

    return make_response(message='Path found', data={'path': path, 'length': length})

@app.route("/guest/refresh", methods=['POST'])
def refresh_guest():
    req = request.get_json()
    return refresh_guest_service(req.get('data'))

@app.route("/guest/update-data", methods=['POST'])
def update_data():
    req = request.get_json()
    frontend_data = req.get('data')
    service.data = frontend_data
    return make_response(data=service.data)

if __name__ == "__main__":
    app.run(debug=True, port=8000)
