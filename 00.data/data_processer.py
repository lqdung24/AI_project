import os
from array import array
from collections import defaultdict
from pprint import pprint

from scipy.spatial import KDTree
import pickle
import pandas as pd
from rtree import index
from shapely.geometry import Point, Polygon

from server.data import graph

# Đọc CSV
nodes = pd.read_csv("data/nodes.csv")
edges = pd.read_csv("data/edges.csv")

# loại bỏ cột thừa, thêm cột id
if not os.path.exists('data/edges_filtered.csv') or not os.path.exists('data/nodes_filtered.csv'):
    osmid_to_id = dict(zip(nodes['osmid'], nodes['id']))

    # Chuyển u,v sang id
    edges['u'] = edges['u'].map(osmid_to_id)
    edges['v'] = edges['v'].map(osmid_to_id)

    edges = edges[['u', 'v', 'length', 'name', 'geometry']]
    edges['id'] =edges.index
    nodes = nodes[['id', 'y', 'x']] #name = tên phố
    nodes = nodes.rename(columns={"y": "lat", "x": "lng"})

    id_to_name = dict(zip(edges['u'], edges['name']))
    nodes['name'] = nodes['id'].map(id_to_name)
    nodes['name'] = nodes['name'].fillna('')
    nodes['name'] = nodes.apply(
        lambda row: f"{round(row['lat'],2)},{round(row['lng'],2)}" if row['name'] == '' else row['name'],
        axis=1
    )

    edges.to_csv("./data/edges_filtered.csv", index=False)
    nodes.to_csv("./data/nodes_filtered.csv", index=False)
else:
    edges = pd.read_csv("./data/edges_filtered.csv")
    nodes = pd.read_csv("./data/nodes_filtered.csv")

#tạo ma trận kề để thực hiện thuật toán tìm kiếm
if not os.path.exists('data/adj.pkl'):
    #mất 158 mili giây để tạo ma trận kề
    adj = defaultdict(dict)
    for idx, row in edges.iterrows():
        u, v, cur_w = int(row['u']), int(row['v']), row['length']
        default_w = cur_w
        block = False
        traffic_coeff = 0
        flood_coeff = 0
        oneway = False
        adj[u][v] = [cur_w, block, traffic_coeff, flood_coeff, oneway, default_w,idx]

    with open("data/adj.pkl", 'wb') as f:
        pickle.dump(adj, f)
else:
    print(graph)

# tạo kd tree để tìm điểm gần nhất với O(log n)
if not os.path.exists('./data/kdtree.pkl'):
    #tạo cây mất 1.8 mili giây
    points = nodes[["lat", "lng"]].values
    tree = KDTree(points)

    #write mất 600 micro giây
    with open("./data/kdtree.pkl", "wb") as f:
        pickle.dump(tree, f)

#read mất 100 micro giây
with open("./data/kdtree.pkl", "rb") as f:
    tree2 = pickle.load(f)
#   dữ liệu vào của hàm tìm đường: point (lat, lng), start_point, end_point
#   dữ liệu ra: chuỗi các id của các node sẽ đi qua (theo thứ tự từ start -> end)

# tạo r-tree để tìm tập các 'candidate' nằm trong polygon với O(log N)
if not os.path.exists('./data/rtree.idx'):
    p = index.Property()
    p.storage = index.RT_Disk  # dùng lưu file
    rtree = index.Index('./data/rtree', properties=p)
    for row in nodes.itertuples(index=False):
        rtree.insert(row.id, (row.lat, row.lng, row.lat, row.lng))

