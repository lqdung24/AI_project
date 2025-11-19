import heapq
import math

from server.data import get_adj, get_cost, get_length


def dijkstra(start, end):
    pq = [(0, start)]
    came_from = {}
    dist = {node: float('inf') for node in range(4000)}
    dist[start] = 0

    while pq:
        d, current = heapq.heappop(pq)

        if current == end:
            path = [current]
            length = 0
            while current in came_from:
                length += get_length(came_from[current], current)
                current = came_from[current]
                path.append(current)
            return path[::-1], round(length, 2), round(dist[end], 2)

        for neighbor in get_adj(current):
            if get_cost(came_from[current], current) == math.inf:
                continue
            nd = d + get_cost(current, neighbor)
            if nd < dist[neighbor]:
                dist[neighbor] = nd
                came_from[neighbor] = current
                heapq.heappush(pq, (nd, neighbor))

    return [], 0, -1
