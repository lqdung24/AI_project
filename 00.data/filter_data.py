import os
import time
from collections import defaultdict
from scipy.spatial import KDTree
import pickle
import pandas as pd

# Đọc CSV
nodes = pd.read_csv("data/nodes.csv")
edges = pd.read_csv("data/edges.csv")

# loại bỏ cột thừa, thêm cột id
if(not os.path.exists('data/edges_filterd.csv') or not os.path.exists('data/nodes_filterd.csv')):
    osmid_to_id = dict(zip(nodes['osmid'], nodes['id']))

    # Chuyển u,v sang id
    edges['u'] = edges['u'].map(osmid_to_id)
    edges['v'] = edges['v'].map(osmid_to_id)

    edges = edges[['u', 'v', 'length', 'name', 'oneway']]
    nodes = nodes[['id', 'y', 'x', 'street_count']]
    nodes = nodes.rename(columns={"y": "lat", "x": "lng"})
    edges.to_csv("./data/edges_filterd.csv", index=False)
    nodes.to_csv("./data/nodes_filterd.csv", index=False)
else:
    edges = pd.read_csv("./data/edges_filterd.csv")
    nodes = pd.read_csv("./data/nodes_filterd.csv")

#tạo ma trận kề để thực hiện thuật toán tìm kiếm
if not os.path.exists('data/adj.pkl'):
    #mất 158 mili giây để tạo ma trận kề
    adj = defaultdict(dict)
    for _, row in edges.iterrows():
        u, v, w, oneway = row['u'], row['v'], row['length'], row['oneway']
        adj[u][v] = w
        if(not oneway):
            adj[v][u] = w
    # lưu ra file
    with open("data/adj.pkl", 'wb') as f:
        pickle.dump(adj, f)

with open("data/adj.pkl", 'rb') as f:
    adj2 = pickle.load(f)
from pprint import pprint
pprint(adj2)


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