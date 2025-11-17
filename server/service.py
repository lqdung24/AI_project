import math
from shapely import Polygon, Point
from server.astar import astar
from server.data import kdtree, nodes, graph, rtree
from server.dfs import dfs_algo
from server.respone import make_response

def find_nearest_node(lat, lng):
    dist, idx = kdtree.query([lat, lng])
    nearest_node = nodes.iloc[int(idx)].to_dict()
    nearest_node = {k: (float(v) if hasattr(v, "item") else v) for k, v in nearest_node.items()}
    return nearest_node

data = {
    'start':
        {
            'id': 0,
            'lat': 0,
            'lng': 0,
            'start': True,
            'name': 'undefine',
            'set': False
        },
    'end':
        {
            'id': 0,
            'lat': 0,
            'lng': 0,
            'start': False,
            'name': 'undefine',
            'set': False
        },
    'mode': 'guest',
    'algorithm': 'dijkstra',
    'selecting': '',
    'zones': {
        'block': {},
        'flood': {},
        'traffic': {},
        'oneway': {}
    }
}

def node_input(node):
    global data
    if not node:
        return make_response('error', 'Input is not valid', code=400)

    nearest = find_nearest_node(node['lat'], node['lng'])
    nearest['set'] = True
    if node is None:
        return make_response('error', 'Cannot find node', code=400)

    if node['start'] is True:
        data['start'] = nearest
        data['start']['start'] = True
        return make_response(data=data['start'])
    else:
        data['end'] = nearest
        data['end']['start'] = False
        return make_response(data=data['end'])

def refresh_guest_service(frontendData):
    global data
    if frontendData is not None:
        data = frontendData
    else:
        return make_response('error', 'cannot read refresh data', code=400)
    return make_response(message='Refresh successfully', data=data)

#output: mảng các điểm trên đuong đi
def find_path():
    path = []
    length = 0
    if data['algorithm'] == 'dfs':
        path, length = dfs_algo(data['start']['id'], data['end']['id'], graph)
    elif data['algorithm'] == 'astar':
        path, length = astar(data['start']['id'], data['end']['id'], graph)
    elif data['algorithm'] == 'bfs':
        print(f'algorithm {data['algorithm']} not installed')
    elif data['algorithm'] == 'dijkstra':
        print(f'algorithm {data['algorithm']} not installed')
    else:
        print(f'algorithm {data['algorithm']} not installed')

    if path is []:
        return None

    path2 = []
    for node_id in path:
        lat = nodes.iloc[node_id]['lat']
        lng = nodes.iloc[node_id]['lng']
        path2.append([float(lat), float(lng)])

    return path2, length

# find_path()

def find_inside_edge(poly):
    boundary = poly['boundary']
    type = poly['type']
    id = poly['id']
    polygon_coords = [(p['lat'], p['lng']) for p in boundary]
    poly = Polygon(polygon_coords)
    candidate_ids = rtree.intersection(poly.bounds)
    candidates = [nodes.iloc[p] for p in candidate_ids]
    inside_nodes = {p['id'] for p in candidates if poly.contains(Point(p['lat'], p['lng']))}
    selected_edges = []
    for u in inside_nodes:
        for v in graph[u]:
            if v in inside_nodes:
                selected_edges.append((int(u), int(v), graph[u][v][2]))
                graph[u][v][0] = math.inf # nhân tạm cho 2
    data['zones'][type][id] = (boundary, selected_edges)
    return selected_edges

def delete_zone(id, type):
    zone = data['zones'][type].pop(id, None)
    if zone is None:
        return None
    edges = zone[1]
    for edge in edges:
        u = edge[0]
        v = edge[1]
        graph[u][v][0] = graph[u][v][1]
    return data['zones']
