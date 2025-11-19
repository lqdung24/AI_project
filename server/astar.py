import heapq
import math
from server.data import getLatLng, get_adj, get_cost


def get_h(id, end_id):
    cur = getLatLng(id)
    end = getLatLng(end_id)
    return math.sqrt( (cur[0] - end[0])**2 + (cur[1] - end[1])**2 )

def astar(start, end):
    open_set = []  # hàng đợi ưu tiên (f, id)
    heapq.heappush(open_set, (0, start))

    came_from = {}  # lưu node cha
    g_score = {node: float('inf') for node in range(4000)}
    g_score[start] = 0

    while open_set:
        f, current = heapq.heappop(open_set)

        if current == end:
            path = [current]
            while current in came_from:
                current = came_from[current]
                path.append(current)
            path.reverse()

            # Tổng độ dài đường đi
            total_length = g_score[end]
            return path, round(total_length, 2)

        # Duyệt các node kề
        for neighbor, cost in get_adj(current):
            if cost[0] == math.inf:
                continue
            tentative_g = g_score[current] + get_cost(current, neighbor)
            if tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score = tentative_g + get_h(neighbor, end)
                heapq.heappush(open_set, (f_score, neighbor))

    # Không tìm được đường
    return [], 0
