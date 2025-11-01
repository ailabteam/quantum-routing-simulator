# solvers/routing_problem.py
import networkx as nx
import random
import matplotlib.pyplot as plt

def create_random_network(num_nodes=8, edge_probability=0.5):
    """
    Tạo một đồ thị mạng lưới ngẫu nhiên.
    Mỗi cạnh sẽ có một 'weight' (chi phí) ngẫu nhiên.
    """
    # Tạo một đồ thị ngẫu nhiên, đảm bảo nó luôn được kết nối
    while True:
        G = nx.erdos_renyi_graph(num_nodes, edge_probability, seed=random.randint(0, 1000))
        if nx.is_connected(G):
            break
    
    # Gán trọng số (chi phí) ngẫu nhiên cho mỗi cạnh
    for (u, v) in G.edges():
        G.edges[u, v]['weight'] = random.randint(1, 10)
        
    return G

def visualize_network(G, path=None):
    """Vẽ đồ thị và tô màu đường đi (nếu có)."""
    pos = nx.spring_layout(G, seed=42)
    plt.figure(figsize=(10, 7))
    
    nx.draw_networkx_nodes(G, pos, node_color='skyblue', node_size=700)
    nx.draw_networkx_labels(G, pos, font_color='black')
    
    edge_colors = ['gray'] * len(G.edges())
    if path:
        path_edges = list(zip(path, path[1:]))
        for i, edge in enumerate(list(G.edges())):
            if edge in path_edges or (edge[1], edge[0]) in path_edges:
                edge_colors[i] = 'red'

    nx.draw_networkx_edges(G, pos, edge_color=edge_colors, width=2)
    
    edge_labels = nx.get_edge_attributes(G, 'weight')
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)
    
    plt.title("Network Routing Problem")
    plt.savefig("network_visualization.png")
    print("Saved network visualization to network_visualization.png")

if __name__ == '__main__':
    print("--- Testing Problem Definition ---")
    network_graph = create_random_network()
    print(f"Generated a random network with {network_graph.number_of_nodes()} nodes and {network_graph.number_of_edges()} edges.")
    
    # Lấy một vài thông tin để xem
    start_node = 0
    end_node = len(network_graph.nodes) - 1
    print(f"Sample problem: Find path from node {start_node} to {end_node}")
    
    visualize_network(network_graph)
