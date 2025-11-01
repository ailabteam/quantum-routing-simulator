# Quantum Routing Simulator - PoC #4

[![Vercel Deployment](https://img.shields.io/vercel/deployment/ailabteam/quantum-routing-simulator?style=for-the-badge&logo=vercel)](https://quantum-routing-simulator.vercel.app/)
[![GitHub stars](https://img.shields.io/github/stars/ailabteam/quantum-routing-simulator?style=for-the-badge&logo=github)](https://github.com/ailabteam/quantum-routing-simulator/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/ailabteam/quantum-routing-simulator?style=for-the-badge&logo=github)](https://github.com/ailabteam/quantum-routing-simulator/issues)

**Live Demo: [quantum-routing-simulator.vercel.app](https://quantum-routing-simulator.vercel.app/)**

---

## ⚛️ About This Project

This project is the fourth and final Proof-of-Concept (PoC) in my research series, exploring the frontier of **Quantum Computing** for complex optimization problems in telecommunications.

The **Quantum Routing Simulator** provides a head-to-head comparison between a classical and a quantum algorithm for solving a network routing (shortest path) problem. The primary goal is not to prove quantum supremacy, but to **build a tangible platform for researching, benchmarking, and visualizing** the behavior and potential of quantum-inspired approaches.

### The "Race" Explained:
1.  **The Problem:** A random network graph is generated with weighted edges. The objective is to find the path with the minimum total cost between a designated start node (green) and an end node (pink).
2.  **The Classical Champion (Dijkstra's Algorithm):** An exact, efficient, and well-established algorithm that guarantees the optimal solution for this type of problem. It serves as our "gold standard" baseline.
3.  **The Quantum Challenger (QAOA):** The Quantum Approximate Optimization Algorithm is a hybrid quantum-classical heuristic. It maps the complex combinatorial problem onto a quantum circuit and leverages quantum principles to explore a vast solution space. This PoC runs a **simulation** of QAOA on a classical GPU server.

The demo visually highlights the stark differences in performance, execution time, and solution quality, offering a practical insight into the current state and future promise of quantum computing.

---

## 🎥 Video Demonstration

A detailed walkthrough of the comparison dashboard, an explanation of the underlying algorithms, and an analysis of the results is available on YouTube.

[![YouTube Demo Video Thumbnail](https://img.youtube.com/vi/YOUTUBE_VIDEO_ID_HERE/0.jpg)](https://www.youtube.com/watch?v=YOUTUBE_VIDEO_ID_HERE)

> **Note:** Please replace `YOUTUBE_VIDEO_ID_HERE` with the actual ID of your YouTube video.

---

## 🏛️ Architecture

This PoC employs a stateful, asynchronous hybrid architecture to manage the long-running quantum simulation task.

-   **Frontend (React on Vercel):** A side-by-side comparison dashboard built with React, TypeScript, and React Flow.
-   **Proxy Gateway (Vercel Serverless):** A lightweight FastAPI proxy with two key endpoints:
    -   `/api/solve-routing`: Initiates the solving process as a background task on the compute server and returns a unique `task_id`.
    -   `/api/get-status/{task_id}`: Allows the frontend to periodically poll for updates on the task's progress and results.
-   **Compute Server (Dedicated GPU Server):** The powerhouse of the system, responsible for:
    -   Running both the classical (NetworkX) and quantum (Qiskit) solvers in a background thread.
    -   Managing the state of each task (e.g., `RUNNING_CLASSICAL`, `RUNNING_QUANTUM`, `FINISHED`).
    -   Serving the results via a FastAPI API.

---

## ✨ Features

-   **Side-by-Side Comparison:** A clear, intuitive UI to compare the performance of the classical and quantum solvers.
-   **Dynamic Problem Generation:** A new, random network problem is created for each run.
-   **Asynchronous Task Management:** Utilizes background tasks and polling to handle the long execution time of the quantum simulation without freezing the UI.
-   **Real-time Status Updates:** The UI provides live feedback on what each solver is currently doing.
-   **Visual Path Highlighting:** The solution paths found by each algorithm are highlighted directly on their respective graphs.
-   **Detailed Results:** Displays the found path, total cost, and execution time for a clear quantitative comparison.

---

## 🚀 Getting Started

This project consists of the Vercel-deployable application and the offline Compute Server.

### Vercel Application (This Repository)
-   Contains the React frontend, the FastAPI proxy (`/api`), and all Vercel configurations.
-   Ready to be deployed directly from this repository.

### Compute Server (Offline Setup)
-   **Location:** The code for the compute server (`routing_problem.py`, `classical_solver.py`, `quantum_solver.py`, `main.py`) is managed locally and is not part of this repository.
-   **Key Steps:**
    1.  Create a dedicated Conda environment (`poc_quantum`).
    2.  Install dependencies: `pytorch`, `qiskit[all]`, `qiskit_optimization`, `qiskit_algorithms`, `qiskit_aer`, `networkx`, `fastapi[all]`.
    3.  Run the FastAPI inference server `main.py` on an open port (e.g., `8888`).

---

## 🤝 Collaboration

The field of quantum computing for real-world optimization is just beginning. I am keen to connect with researchers, developers, and enthusiasts. Please open an issue for any technical questions or reach out to discuss potential collaborations.

---
_This project is part of a personal R&D initiative by [Do Phuc Hao](https://github.com/ailabteam)._
