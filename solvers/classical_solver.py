# solvers/classical_solver.py
import networkx as nx
import time
import random # Import thêm random để đặt seed

def solve_classical(graph, start_node, end_node):
    """
    Giải bài toán định tuyến bằng thuật toán Dijkstra.
    """
    print("\n--- Solving with Classical Dijkstra Algorithm ---")

    start_time = time.time()

    try:
        # Sử dụng hàm dijkstra_path của networkx
        path = nx.dijkstra_path(graph, start_node, end_node, weight='weight')
        # Tính tổng chi phí của đường đi
        cost = nx.dijkstra_path_length(graph, start_node, end_node, weight='weight')

        end_time = time.time()

        result = {
            "solver": "classical",
            "path": path,
            "cost": cost,
            "execution_time": end_time - start_time
        }

        print(f"Path found: {result['path']}")
        print(f"Total cost: {result['cost']}")
        print(f"Execution time: {result['execution_time']:.6f} seconds")
        return result

    except nx.NetworkXNoPath:
        end_time = time.time()
        print("No path found between the nodes.")
        return {
            "solver": "classical",
            "path": None,
            "cost": float('inf'),
            "execution_time": end_time - start_time,
            "error": "No path found"
        }

# === PHẦN TEST ĐÃ ĐƯỢC CẬP NHẬT ===
if __name__ == '__main__':
    # Import hàm tạo đồ thị từ file kia để test
    from routing_problem import create_random_network, visualize_network

    print("--- Testing Classical Solver ---")
    
    # --- 1. Định nghĩa bài toán phức tạp và cố định ---
    NUM_NODES = 5
    START_NODE = 0
    END_NODE = 4
    
    # Đặt seed để đảm bảo luôn tạo ra cùng một đồ thị
    random.seed(123)
    
    # Tạo bài toán
    network = create_random_network(num_nodes=NUM_NODES, edge_probability=0.7)
    print(f"Problem: Find path from {START_NODE} to {END_NODE} in a network with {network.number_of_nodes()} nodes.")
    # Vẽ đồ thị bài toán ban đầu
    visualize_network(network)
    print("Saved initial problem graph to network_visualization.png")


    # --- 2. Giải bài toán ---
    classical_result = solve_classical(network, START_NODE, END_NODE)

    # --- 3. Trực quan hóa kết quả ---
    if classical_result.get("path"):
        # Đổi tên file ảnh để không ghi đè
        visualize_network(network, path=classical_result["path"])
        import os
        # Kiểm tra xem file có tồn tại không trước khi đổi tên
        if os.path.exists("classical_solution.png"):
            os.remove("classical_solution.png")
        os.rename("network_visualization.png", "classical_solution.png")
        print("Saved classical solution to classical_solution.png")
