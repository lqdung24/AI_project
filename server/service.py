import pickle
import pandas as pd

# Load KDTree
with open("../00.data/data/kdtree.pkl", "rb") as f:
    kdtree = pickle.load(f)

# Giả sử bạn cũng load DataFrame chứa tọa độ gốc
nodes = pd.read_csv("../00.data/data/nodes_filterd.csv")  # chứa cột lat, lng, id, ...

def find_nearest_node(lat, lng):
    dist, idx = kdtree.query([lat, lng])

    nearest_node = nodes.iloc[int(idx)].to_dict()

    nearest_node = {k: (float(v) if hasattr(v, "item") else v) for k, v in nearest_node.items()}

    return nearest_node