from collections import defaultdict
from shapely import Polygon, Point
from server.algorithm import astar, dfs, ids, gbfs, ucs, bfs
from server.data import (kdtree, nodes, graph, rtree, get_edge_id, set_block_value, set_flood_value, set_traffic_value,
                         set_oneway_value)
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
    'algorithm': '',
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
    cost = 0
    u = data['start']['id']
    v = data['end']['id']
    if data['algorithm'] == 'dfs':
        path, length, cost = dfs(u, v)
    elif data['algorithm'] == 'bfs':
        path, length, cost = bfs(u, v)
    elif data['algorithm'] == 'ids':
        path, length, cost = ids(u, v)
    elif data['algorithm'] == 'gbfs':
        path, length, cost = gbfs(u, v)
    elif data['algorithm'] == 'ucs':
        path, length, cost = ucs(u, v)
    elif data['algorithm'] == 'astar':
        path, length, cost = astar(u, v)
    else:
        print(f'algorithm {data['algorithm']} not installed')

    if path is []:
        return None

    path2 = []
    for node_id in path:
        lat = nodes.iloc[node_id]['lat']
        lng = nodes.iloc[node_id]['lng']
        path2.append([float(lat), float(lng)])

    return path2, length, cost

# find_path()

def find_inside_edge(poly):
    boundary = poly['boundary']
    type = poly['type']
    id = poly['id']
    coeff = 1 if type in('flood', 'traffic') else 5
    polygon_coords = [(p['lat'], p['lng']) for p in boundary]
    poly = Polygon(polygon_coords)
    candidate_ids = rtree.intersection(poly.bounds)
    candidates = [nodes.iloc[p] for p in candidate_ids]
    inside_nodes = [int(p['id']) for p in candidates if poly.contains(Point(p['lat'], p['lng']))]

    if type == 'oneway':
        edges, invert_edges = set_one_way_road(inside_nodes)
        if edges is None:
            return None
        data['zones'][type][id] = (boundary, edges, False, invert_edges)
        return edges

    selected_edges = []
    for u in inside_nodes:
        for v in graph[u]:
            if v in inside_nodes:
                selected_edges.append((u, v, get_edge_id(u, v)))
                update_edge_cost(u, v, type, 1)
    data['zones'][type][id] = (boundary, selected_edges, coeff)
    return selected_edges

def set_one_way_road(nodes):
    count = defaultdict(set)
    for u in nodes:
        for v in graph[u]:
            if v in nodes:
                count[u].add(v)
                count[v].add(u)
    start = []

    for u in nodes:
        if len(count[u]) == 1:
            start.append(u)
        elif len(count[u]) > 2:
            return None, None

    vis = set()
    flow = [start[0]]
    cur = start[0]
    vis.add(cur)
    while True:
        for u in count[cur]:
            if u not in vis:
                vis.add(u)
                cur = u
                flow.append(u)
                break
        else:
            break

    edges = []
    invert_edges = []
    for i in range(len(flow)-1):
        u = flow[i]
        v = flow[i+1]
        update_edge_cost(u, v, 'oneway')
        edges.append((u, v, get_edge_id(u, v)))
        invert_edges.append((v, u, get_edge_id(v, u)))
    return edges, invert_edges
def update_edge_cost(u, v, type, coeff=1):
    if type == 'block':
        set_block_value(u, v, True)
    elif type == 'flood':
        set_flood_value(u, v, coeff)
    elif type == 'traffic':
        set_traffic_value(u, v, coeff)
    elif type == 'oneway':
        set_oneway_value(u, v, False)
        set_oneway_value(v, u, True)
def update_zone_coeff(type, id):
    selected_edges = data['zones'][type][id][1]
    coeff = data['zones'][type][id][2]
    for edge in selected_edges:
        update_edge_cost(edge[0], edge[1], type, coeff)
def delete_zone(id, type):
    zone = data['zones'][type].pop(id, None)
    if zone is None:
        return None
    if type == 'block':
        for edge in zone[1]:
            u = edge[0]
            v = edge[1]
            set_block_value(u, v, False)
    elif type == 'traffic':
        for edge in zone[1]:
            u = edge[0]
            v = edge[1]
            set_traffic_value(u, v, 0)
    elif type == 'flood':
        for edge in zone[1]:
            u = edge[0]
            v = edge[1]
            set_flood_value(u, v, 0)
    elif type == 'oneway':
        for edge in zone[1]:
            u = edge[0]
            v = edge[1]
            set_oneway_value(u, v, False)
            set_oneway_value(v, u, False)
    return data['zones']

def delete_all_zones():
    types = ['block', 'flood', 'traffic', 'oneway']
    for type in types:
        for id in list(data['zones'][type].keys()):
            delete_zone(id, type)

def update_oneway_service(type, id):
    check = data['zones'][type][id][2]
    if check:
        edges = data['zones'][type][id][3]
    else:
        edges = data['zones'][type][id][1]

    for edge in edges:
        update_edge_cost(edge[0], edge[1], type)