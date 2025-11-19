import math

from server.data import get_adj, get_cost, get_length


def dfs_algo(start, end, graph):
    visited = set()
    path = [] # chứa id các node
    length = 0
    cost = 0
    def dfs(u):
        nonlocal length
        nonlocal cost
        path.append(u)
        visited.add(u)

        if u == end:
            return True

        for v in get_adj(u):
            if v not in visited:
                if get_cost(u, v) == math.inf:
                    visited.add(v)
                    continue
                length += get_length(u, v)
                cost += get_cost(u,v)
                if dfs(v):
                    return True
                length -= get_length(u, v)
                cost -= get_cost(u, v)
        path.pop()  # backtrack
        return False

    found = dfs(start)
    if found:
        return path, round(length,2), round(cost, 2)
    else:
        return [], 0, -1

# print(dfs_algo(1, 4, graph))