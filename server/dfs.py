from server.data import get_adj, get_cost


def dfs_algo(start, end, graph):
    visited = set()
    path = [] # chứa id các node
    length = 0

    def dfs(u):
        nonlocal length
        path.append(u)
        visited.add(u)

        if u == end:
            return True

        for v in get_adj(u):
            if v not in visited:
                length += get_cost(u, v)
                if dfs(v):
                    return True
                length -= get_cost(u, v)
        path.pop()  # backtrack
        return False

    found = dfs(start)
    if found:
        return path, round(length,0)
    else:
        return [], 0

# print(dfs_algo(1, 4, graph))