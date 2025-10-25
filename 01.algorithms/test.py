from server.service import adj


def dfs_path(graph, start, end):
    visited = set()
    path = []

    def dfs(u):
        path.append(u)
        visited.add(u)

        if u == end:
            return True  # tìm thấy
        for v in graph[u].keys():  # dict of dict, hoặc list
            if v not in visited:
                if dfs(v):
                    return True

        path.pop()  # backtrack
        return False

    found = dfs(start)
    if found:
        return path
    else:
        return None


graph = {
    1: {2: 1, 3: 1},
    2: {4: 1},
    3: {4: 1},
    4: {}
}

print(dfs_path(adj, 1, 4))
