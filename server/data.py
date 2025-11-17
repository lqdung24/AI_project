import pickle
import pandas as pd
from rtree import index

with open("../00.data/data/kdtree.pkl", "rb") as f:
    kdtree = pickle.load(f)

nodes = pd.read_csv("../00.data/data/nodes_filtered.csv")

with open("../00.data/data/adj.pkl", 'rb') as f:
    graph = pickle.load(f)

rtree = index.Index("../00.data/data/rtree")

def getLatLng(id):
    node = nodes.iloc[id]
    return node['lat'], node['lng']


def get_adj(id_):
    return graph[id_].keys()


def get_cost(start, end):
    return graph[start][end][0]
