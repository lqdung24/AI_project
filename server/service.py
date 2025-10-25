from server.data import kdtree, nodes, graph
from server.dfs import dfs_algo
from server.respone import make_response

def find_nearest_node(lat, lng):
    dist, idx = kdtree.query([lat, lng])

    nearest_node = nodes.iloc[int(idx)].to_dict()

    nearest_node = {k: (float(v) if hasattr(v, "item") else v) for k, v in nearest_node.items()}

    return nearest_node

start = {
    'id': 0,
    'lat': 0,
    'lng': 0,
    'start': True,
    'name': 'undefine',
    'set': False
}

end = {
    'id': 0,
    'lat': 0,
    'lng': 0,
    'start': False,
    'name': 'undefine',
    'set': False
}

def node_input(node):
    if not node:
        return make_response('error', 'Input is not valid', code=400)

    nearest = find_nearest_node(node['lat'], node['lng'])
    nearest['set'] = True
    if node is None:
        return make_response('error', 'Cannot find node', code=400)

    if node['start'] is True:
        start = nearest
        start['start'] = True
        print(start)
        return make_response(data=start)
    else:
        end = nearest
        end['start'] = False
        print(end)
        return make_response(data=end)

def refresh():
    start['set'] = end['set'] = False
    return make_response()

#output: mảng các điểm trên đuong đi
def find_path():
    path, length = dfs_algo(start['id'], end['id'], graph)

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
