from collections import deque
import math
from server.data import get_adj, get_length, get_cost


def bfs(start, end):
    q = deque([start])
    came_from = {start: None}
    visited = {start}

    while q:
        cur = q.popleft()
        if cur == end:
            path = []
            length = 0
            cost = 0
            while cur is not None:
                path.append(cur)
                if came_from[cur] is not None:
                    length += get_length(cur, came_from[cur])
                    cost += get_cost(cur, came_from[cur])
                cur = came_from[cur]
            return path[::-1], round(length, 2), round(cost, 2)

        for neighbor in get_adj(cur):
            if get_cost(came_from[cur], cur) == math.inf:
                continue
            if neighbor not in visited:
                visited.add(neighbor)
                came_from[neighbor] = cur
                q.append(neighbor)

    return [], 0, -1
