import heapq
import math
from server.data import getLatLng, get_adj, get_cost, get_length


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
            length = 0
            while current in came_from:
                length += get_length(came_from[current], current)
                current = came_from[current]
                path.append(current)
                #length += get_length(current, came_from[current])
            path.reverse()

            # Tổng độ dài đường đi
            total_cost = g_score[end]
            return path, round(length, 2), round(total_cost, 2)

        # Duyệt các node kề
        for neighbor in get_adj(current):
            if get_cost(current, neighbor) == math.inf:
                continue
            tentative_g = g_score[current] + get_cost(current, neighbor)
            if tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score = tentative_g + get_h(neighbor, end)
                heapq.heappush(open_set, (f_score, neighbor))

    # Không tìm được đường
    return [], 0, -1
