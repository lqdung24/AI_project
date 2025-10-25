from server.data import graph

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

        for v in graph[u].keys():
            if v not in visited:
                length += graph[u][v]
                if dfs(v):
                    return True
                length -= graph[u][v]
        path.pop()  # backtrack
        return False

    found = dfs(start)
    if found:
        return path, round(length,0)
    else:
        return None

# print(dfs_algo(1, 4, graph))