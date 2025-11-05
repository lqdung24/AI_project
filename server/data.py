import pickle
import pandas as pd

with open("../00.data/data/kdtree.pkl", "rb") as f:
    kdtree = pickle.load(f)

nodes = pd.read_csv("../00.data/data/nodes_filtered.csv")

with open("../00.data/data/adj.pkl", 'rb') as f:
    graph = pickle.load(f)

def getLatLng(id):
    node = nodes.iloc[id]
    return node['lat'], node['lng']

def get_adj(id_):
    return graph[id_].keys()

def get_cost(start, end):
    return graph[start][end]