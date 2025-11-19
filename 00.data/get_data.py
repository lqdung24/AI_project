import geopandas as gpd
import osmnx as ox

boundary = gpd.read_file("data/phuong_kim_lien.geojson")

# Lấy hình đa giác đầu tiên (nếu có nhiều)
polygon = boundary.geometry.iloc[0]

# Tải dữ liệu mạng đường (dạng graph)
G = ox.graph_from_polygon(
    polygon,
    network_type="all",
    simplify=False,
    retain_all=True,
    truncate_by_edge=False
)

# Lấy node và edge dưới dạng DataFrame
nodes, edges = ox.graph_to_gdfs(G)

#vẽ thử main
ox.plot_graph(G, node_color='r', node_size=10, edge_color='gray')

# thêm cột id làm index cho mảng sau này
nodes.insert(0, "id", range(len(nodes)))

# lưu kết quả ra file csv
nodes.to_csv("nodes.csv")
edges.to_csv("edges.csv")
# thông báo
print(f"Saved {len(nodes)} nodes and {len(edges)} edges to CSV files.")