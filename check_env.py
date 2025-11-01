# check_env.py

import torch
import networkx as nx
import qiskit

print("--- Starting PoC #4 Environment Check ---")
try:
    # 1. Check PyTorch and CUDA
    print(f"PyTorch version: {torch.__version__}")
    cuda_ok = torch.cuda.is_available()
    print(f"CUDA available: {cuda_ok}")
    if cuda_ok: print(f"GPU Name: {torch.cuda.get_device_name(0)}")

    # 2. Check NetworkX
    print(f"NetworkX version: {nx.__version__}")

    # 3. Check Qiskit and its components (for Qiskit >= 2.0)
    print(f"Qiskit Core version: {qiskit.__version__}")

    # QAOA nằm trong gói độc lập `qiskit_algorithms`
    from qiskit_algorithms.minimum_eigensolvers import QAOA
    print("qiskit_algorithms (QAOA) imported successfully.")
    
    # Aer simulator nằm trong gói độc lập `qiskit_aer`
    from qiskit_aer import Aer
    print("qiskit_aer (Aer simulator) imported successfully.")
    
    # === SỬA LỖI IMPORT SAMPLER Ở ĐÂY ===
    # Sampler dùng cho mô phỏng bây giờ nằm trong `qiskit_aer.primitives`
    from qiskit_aer.primitives import Sampler
    print("qiskit_aer.primitives (Sampler) imported successfully.")

    print("\n--- ✅ All Checks Passed! Environment is ready for Quantum Simulation. ---")

except ImportError as e:
    print(f"\n--- ❌ Check Failed: An import error occurred. ---")
    print(f"Error message: {e}")
    print("This likely means a required Qiskit component package is missing.")
    print("Please try running: pip install qiskit_algorithms qiskit_aer")
except Exception as e:
    print(f"\n--- ❌ Check Failed: {e} ---")
