# solvers/quantum_solver.py
import networkx as nx
import numpy as np
import time
import random # Import thêm random

# Import các thành phần Qiskit
from qiskit_optimization.applications import Tsp
from qiskit_optimization.converters import QuadraticProgramToQubo
from qiskit_algorithms.minimum_eigensolvers import SamplingVQE
from qiskit_algorithms.optimizers import COBYLA
from qiskit.circuit.library import QAOAAnsatz
from qiskit_aer.primitives import SamplerV2 as Sampler
from qiskit.compiler import transpile
from qiskit_aer import Aer

def solve_quantum_qaoa(graph, start_node, end_node):
    print("\n--- Solving with Quantum QAOA Algorithm (Simulated with V2 Primitives) ---")
    start_time = time.time()

    num_nodes = graph.number_of_nodes()

    # --- 1. Chuyển đổi bài toán thành dạng TSP/QUBO ---
    inf = np.max([d.get('weight', 1) for u, v, d in graph.edges(data=True)]) * num_nodes + 1
    adj_matrix = nx.to_numpy_array(graph, nonedge=inf, weight='weight')
    tsp = Tsp(adj_matrix)
    qp = tsp.to_quadratic_program()
    qubo_converter = QuadraticProgramToQubo()
    qubo = qubo_converter.convert(qp)

    # --- 2. Thiết lập và Chạy QAOA ---
    sampler = Sampler()
    optimizer = COBYLA(maxiter=50)
    operator, offset = qubo.to_ising()
    qaoa_ansatz = QAOAAnsatz(cost_operator=operator, reps=2)

    aer_simulator = Aer.get_backend('aer_simulator')
    transpiled_ansatz = transpile(qaoa_ansatz, backend=aer_simulator, optimization_level=1)

    sampling_vqe = SamplingVQE(sampler=sampler, ansatz=transpiled_ansatz, optimizer=optimizer)
    result = sampling_vqe.compute_minimum_eigenvalue(operator)

    eigenstate_probabilities = result.eigenstate
    bitstring = max(eigenstate_probabilities, key=eigenstate_probabilities.get)

    # === SỬA LỖI Ở ĐÂY: TRUYỀN THẲNG MẢNG NUMPY VÀO INTERPRET ===
    # Chuyển chuỗi bit thành một mảng numpy
    x_solution = np.array([int(bit) for bit in bitstring])

    end_time = time.time()

    # --- 3. Diễn giải Kết quả ---
    # tsp.interpret chấp nhận mảng numpy làm đầu vào
    path = tsp.interpret(x_solution)
    try:
        start_idx = path.index(start_node)
        end_idx = path.index(end_node)
        if end_idx < start_idx: path = path[::-1]; start_idx = path.index(start_node); end_idx = path.index(end_node)
        final_path = path[start_idx : end_idx + 1]
        cost = sum(graph[final_path[i]][final_path[i+1]]['weight'] for i in range(len(final_path) - 1)) if final_path else float('inf')
    except (ValueError, IndexError):
        final_path = None; cost = float('inf')

    quantum_result = {
        "solver": "quantum_qaoa", "path": final_path,
        "cost": cost, "execution_time": end_time - start_time
    }

    print(f"Path found: {quantum_result['path']}")
    print(f"Total cost: {quantum_result['cost']}")
    print(f"Execution time: {quantum_result['execution_time']:.6f} seconds")

    return quantum_result

# === PHẦN TEST ĐÃ ĐƯỢỢC CẬP NHẬT ===
if __name__ == '__main__':
    from routing_problem import create_random_network, visualize_network
    
    print("--- Testing Quantum Solver ---")

    # --- 1. Định nghĩa bài toán phức tạp và cố định ---
    NUM_NODES = 5
    START_NODE = 0
    END_NODE = 4
    
    # Đặt seed để đảm bảo tạo ra cùng một đồ thị như classical_solver
    random.seed(123)
    
    # Tạo bài toán
    network = create_random_network(num_nodes=NUM_NODES, edge_probability=0.7)
    print(f"Problem: Find path from {START_NODE} to {END_NODE} in a network with {network.number_of_nodes()} nodes.")
    # Không cần vẽ lại bài toán gốc ở đây nữa
    
    # --- 2. Giải bài toán ---
    q_result = solve_quantum_qaoa(network, START_NODE, END_NODE)

    # --- 3. Trực quan hóa kết quả ---
    if q_result.get("path"):
        visualize_network(network, path=q_result["path"])
        import os
        if os.path.exists("quantum_solution.png"):
            os.remove("quantum_solution.png")
        os.rename("network_visualization.png", "quantum_solution.png")
        print("Saved quantum solution to quantum_solution.png")

