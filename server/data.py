import pickle

import pandas as pd

with open("../00.data/data/kdtree.pkl", "rb") as f:
    kdtree = pickle.load(f)

nodes = pd.read_csv("../00.data/data/nodes_filtered.csv")

with open("../00.data/data/adj.pkl", 'rb') as f:
    graph = pickle.load(f)