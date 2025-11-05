from server.astar import astar
from server.data import kdtree, nodes, graph
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
    'selecting': 'start'
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
        print(data['start'])
        return make_response(data=data['start'])
    else:
        data['end'] = nearest
        data['end']['start'] = False
        print(data['end'])
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
    print(data)
    if data['algorithm'] == 'dfs':
        path, length = dfs_algo(data['start']['id'], data['end']['id'], graph)
    else:
        if data['algorithm'] == 'astar':
            path, length = astar(data['start']['id'], data['end']['id'], graph)
        else:
            print(f'algorithm {data['algorithm']} not installed')

    if path is None:
        return None

    path2 = []
    for node_id in path:
        lat = nodes.iloc[node_id]['lat']
        lng = nodes.iloc[node_id]['lng']
        path2.append([float(lat), float(lng)])

    print(path2)

    return path2, length

# find_path()
