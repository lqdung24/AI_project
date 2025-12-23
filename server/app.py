import os
from flask import Flask, request, send_from_directory, json
from flask_cors import CORS, cross_origin

from server import service
from server.respone import make_response
from server.service import node_input, find_path, refresh_guest_service, data, find_inside_edge, delete_zone, \
    update_zone_coeff, delete_all_zones, update_oneway_service, get_crossed_edge

app = Flask(__name__)
CORS(app)

###   DATA ROUTE   ###
DATA_DIR = os.path.join(os.path.dirname(__file__), "../00.data/data")

if not os.path.exists(DATA_DIR):
    print(f"Data directory ${DATA_DIR} not found.")

@app.route('/data', methods=['POST'])
def get_data():
    # print(service.data)
    return make_response(data=service.data)

@app.route("/data/nodes", methods=["GET"])
def get_nodes():
    #print(service.data)
    return send_from_directory(DATA_DIR, "nodes_filtered.csv")

@app.route("/data/edges", methods=["GET"])
def get_edges():
    return send_from_directory(DATA_DIR, "edges_filtered.csv")

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

    path, length, cost = find_path()

    if path is None:
        return make_response(message='Cannot find path', code=404)

    return make_response(message='Path found', data={'path': path, 'length': length, 'cost': cost/25000})

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

@app.route("/admin/zones/inside", methods=['POST'])
def get_inside_nodes():
    req = request.get_json()
    result = find_inside_edge(req.get('data'))
    if result is None and req.get('data')['type'] == 'oneway':
        return make_response('error',message='path is branching', code=400)

    return make_response(data=result)

@app.route('/admin/zones/cross', methods=['POST'])
def create_zones():
    req = request.get_json()
    if req.get('data')['type'] == 'oneway' not in ['block', 'flood']:
        return make_response('error',message='not available for' + req.get('data')['type'], code=400)
    result = get_crossed_edge(req.get('data'))

    return make_response(data=result)

@app.route('/admin/zones', methods=['DELETE'])
@cross_origin()
def delete_zones():
    req = request.get_json()
    id = req.get('data')['id']
    type = req.get('data')['type']
    result = delete_zone(id, type)

    if result is None:
        return make_response(message="zone not found", code=404)
    return make_response(data=result)



@app.route('/admin/zones/coeff', methods=['POST'])
def update_coeff():
    req = request.get_json()
    id = req.get('data')['id']
    type = req.get('data')['type']
    service.data = req.get('data')['data']
    update_zone_coeff(type, id)
    return make_response()

@app.route('/admin/zones/oneway', methods=['POST'])
def update_oneway():
    req = request.get_json()
    id = req.get('data')['id']
    type = req.get('data')['type']
    service.data = req.get('data')['data']
    update_oneway_service(type, id)
    return make_response(data=service.data)

@app.route('/admin/reset', methods=["DELETE"])
def reset_admin():
    delete_all_zones()
    return make_response(data=service.data)


if __name__ == "__main__":
    app.run(debug=True, port=8000)
