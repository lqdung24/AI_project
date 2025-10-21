import pandas as pd

# Đọc file CSV
edges_full = pd.read_csv("../00.data/data/edges.csv")
edges = edges_full[['u', 'v', 'length', 'oneway']]

nodes_full = pd.read_csv("../00.data/data/nodes.csv")
nodes = nodes_full[['osmid','x', 'y']]

print(edges.head())
print(nodes.head())
