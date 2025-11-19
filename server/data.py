import math
import pickle
from pprint import pprint
import pandas as pd
from rtree import index

with open("../00.data/data/kdtree.pkl", "rb") as f:
    kdtree = pickle.load(f)

nodes = pd.read_csv("../00.data/data/nodes_filtered.csv")

with open("../00.data/data/adj.pkl", 'rb') as f:
    graph = pickle.load(f)

rtree = index.Index("../00.data/data/rtree")

coeff_value = [1<<p for p in range(6)]
print(coeff_value)
def getLatLng(id):
    node = nodes.iloc[id]
    return node['lat'], node['lng']

def get_edge_id(u, v):
    return graph[u][v][6]

def get_adj(id_):
    return graph[id_].keys()

def get_cost(start, end):
    if graph[start][end][1] or graph[start][end][4]:
        return math.inf
    return graph[start][end][0]

def get_block_value(u, v):
    return graph[u][v][1]
def get_traffic_coeff(u, v):
    return graph[u][v][2]
def get_flood_coeff(u, v):
    return graph[u][v][3]

def get_oneway_value(u, v):
    return graph[u][v][4]
def get_length(u, v):
    return graph[u][v][5]
def set_block_value(start, end, value):
    graph[start][end][1] = value

def set_traffic_value(start, end, value):
    graph[start][end][2] = value
    graph[start][end][0] = (get_length(start, end)
                            * coeff_value[get_traffic_coeff(start, end)]
                            * coeff_value[get_flood_coeff(start, end)])

def set_flood_value(start, end, value):
    graph[start][end][3] = value
    graph[start][end][0] = (get_length(start, end)
                            * coeff_value[get_traffic_coeff(start, end)]
                            * coeff_value[get_flood_coeff(start, end)])

def set_oneway_value(start, end, value):
    graph[start][end][4] = value

def reset_edge(start, end):
    graph[start][end][0] = graph[start][end][5]
    graph[start][end][1] = False
    graph[start][end][2] = 0
    graph[start][end][3] = 0
    graph[start][end][4] = False
