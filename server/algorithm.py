from collections import deque
import heapq
import math

from server.data import get_length, get_cost, get_adj, getLatLng


def get_h(id, end_id):
    cur = getLatLng(id)
    end = getLatLng(end_id)
    return math.sqrt( (cur[0] - end[0])**2 + (cur[1] - end[1])**2 )
# -------------------------------------
# Tính tổng length và cost của một path hehe
# -------------------------------------
def evaluate_path(path):
    total_len = 0
    total_cost = 0
    for i in range(len(path) - 1):
        u, v = path[i], path[i+1]
        total_len += get_length(u, v)
        total_cost += get_cost(u, v)
    return round(total_len, 2), round(total_cost, 2)


# ===============================
# 1. DEPTH-FIRST SEARCH (DFS)
# ===============================
def dfs(start, goal):
    stack = [(start, [start])]
    visited = set()

    while stack:
        node, path = stack.pop()
        if node in visited:
            continue
        visited.add(node)

        if node == goal:
            total_len, total_cost = evaluate_path(path)
            return path, total_len, total_cost

        for neighbor in get_adj(node):
            if get_cost(node, neighbor) == math.inf:
                continue
            stack.append((neighbor, path + [neighbor]))

    return [], 0, 0


# ===============================
# 2. BREADTH-FIRST SEARCH (BFS)
# ===============================
def bfs(start, goal):
    queue = deque([(start, [start])])
    visited = set()

    while queue:
        node, path = queue.popleft()
        if node in visited:
            continue
        visited.add(node)

        if node == goal:
            total_len, total_cost = evaluate_path(path)
            return path, total_len, total_cost

        for neighbor in get_adj(node):
            if get_cost(node, neighbor) == math.inf:
                continue
            queue.append((neighbor, path + [neighbor]))

    return [], 0, 0


# ===============================
# 3. ITERATIVE DEEPENING SEARCH (IDS)
# ===============================
def dls(node, goal, limit, path, visited):
    if node == goal:
        return path
    if limit == 0:
        return None

    visited.add(node)

    for neighbor in get_adj(node):
        if get_cost(node, neighbor) == math.inf:
            continue
        if neighbor not in visited:
            result = dls(neighbor, goal, limit - 1, path + [neighbor], visited)
            if result:
                return result
    return None


def ids(start, goal, max_depth=10000):
    for depth in range(max_depth):
        visited = set()
        result = dls(start, goal, depth, [start], visited)
        if result:
            total_len, total_cost = evaluate_path(result)
            return result, total_len, total_cost
    return [], 0, 0


# ===============================
# 4. GREEDY BEST-FIRST SEARCH (GBFS)
# ===============================
def gbfs(start, goal):
    pq = []
    heapq.heappush(pq, (get_h(start, goal), start, [start]))
    visited = set()

    while pq:
        h, node, path = heapq.heappop(pq)
        if node in visited:
            continue
        visited.add(node)

        if node == goal:
            total_len, total_cost = evaluate_path(path)
            return path, total_len, total_cost

        for neighbor in get_adj(node):
            if get_cost(node, neighbor) == math.inf:
                continue
            heapq.heappush(pq, (get_h(neighbor, goal), neighbor, path + [neighbor]))

    return [], 0, 0


# ===============================
# 5. UNIFORM COST SEARCH (UCS)
# ===============================
def ucs(start, goal):
    pq = []
    heapq.heappush(pq, (0, start, [start]))   # (total_cost, node, path)
    visited = {}

    while pq:
        cost, node, path = heapq.heappop(pq)

        # Nếu đã đến node này với cost thấp hơn → bỏ
        if node in visited and visited[node] <= cost:
            continue
        visited[node] = cost

        if node == goal:
            total_len, total_cost = evaluate_path(path)
            return path, total_len, total_cost

        for neighbor in get_adj(node):
            if get_cost(node, neighbor) == math.inf:
                continue
            new_cost = cost + get_cost(node, neighbor)
            heapq.heappush(pq, (new_cost, neighbor, path + [neighbor]))

    return [], 0, 0

def astar(start, goal):
    # priority queue: (f = g + h, g, node, path)
    pq = []
    heapq.heappush(pq, (get_h(start, goal), 0, start, [start]))

    g_cost = {start: 0}   # chi phí thực đi đến mỗi node

    while pq:
        f, g, node, path = heapq.heappop(pq)

        if node == goal:
            total_len, total_cost = evaluate_path(path)
            return path, total_len, total_cost

        for neighbor in get_adj(node):
            if get_cost(node, neighbor) == math.inf:
                continue
            new_g = g + get_cost(node, neighbor)

            # Nếu tìm được đường tốt hơn đến neighbor → cập nhật
            if neighbor not in g_cost or new_g < g_cost[neighbor]:
                g_cost[neighbor] = new_g
                h = get_h(neighbor, goal)
                new_f = new_g + h
                heapq.heappush(pq, (new_f, new_g, neighbor, path + [neighbor]))

    return [], 0, 0
