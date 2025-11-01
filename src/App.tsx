// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import NetworkDisplay from './components/NetworkDisplay';
import './App.css';

// --- Định nghĩa các Kiểu dữ liệu ---
interface SolverResult {
  solver: string;
  path: number[] | null;
  cost: number;
  execution_time: number;
}
interface TaskStatus {
  status: 'idle' | 'pending' | 'running' | 'finished' | 'failed';
  current_step?: string;
  network?: { nodes: any[], edges: [number, number, { weight: number }][] };
  classical_result?: SolverResult;
  quantum_result?: SolverResult;
  error_message?: string;
}

interface ProblemSpec {
    num_nodes: number;
    start_node: number;
    end_node: number;
}

// --- Component Chính ---
function App() {
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({ status: 'idle' });
  const [taskId, setTaskId] = useState<string | null>(null);
  // Lưu trữ thông tin bài toán để truyền xuống component con
  const [problem, setProblem] = useState<ProblemSpec>({ num_nodes: 5, start_node: 0, end_node: 4 });
  const intervalRef = useRef<number | null>(null);

  const startSolving = () => {
    setTaskId(null);
    setTaskStatus({ status: 'pending' });
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Có thể thêm logic để thay đổi bài toán ở đây trong tương lai
    const currentProblem = { num_nodes: 5, start_node: 0, end_node: 4 };
    setProblem(currentProblem);

    fetch('/api/solve-routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProblem)
    })
    .then(res => res.json())
    .then(data => {
        if(data.task_id) {
            setTaskId(data.task_id);
            setTaskStatus(prev => ({ ...prev, status: 'running' }));
        } else {
            throw new Error("Failed to get task_id from server.");
        }
    })
    .catch((err) => {
        console.error(err);
        setTaskStatus({ status: 'failed', error_message: "Failed to start task." });
    });
  };

  // Hook để kiểm tra trạng thái
  useEffect(() => {
    if (taskStatus.status !== 'running' || !taskId) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
    }

    intervalRef.current = window.setInterval(() => {
        console.log(`Polling status for task: ${taskId}`);
        fetch(`/api/get-status/${taskId}`)
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch status");
            return res.json();
        })
        .then((data: TaskStatus) => {
            console.log("Received status update:", data);
            setTaskStatus(data);

            if (data.status === 'finished' || data.status === 'failed') {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        })
        .catch(err => {
            console.error("Polling error:", err);
            // Có thể dừng polling nếu có lỗi liên tục
        });
    }, 2500);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [taskStatus.status, taskId]);

  // Hàm tiện ích để hiển thị text trạng thái
  const getStatusText = (solverType: 'classical' | 'quantum') => {
    if (taskStatus.status === 'idle') return 'Waiting to start...';
    if (taskStatus.status === 'pending') return 'Initializing task...';
    if (taskStatus.status === 'failed') return `Task Failed: ${taskStatus.error_message || 'Unknown Error'}`;

    if (solverType === 'classical') {
        return taskStatus.classical_result ? 'Completed!' : 'Solving...';
    }

    if (solverType === 'quantum') {
        if (taskStatus.quantum_result) return 'Completed!';
        if (taskStatus.current_step === 'RUNNING_QUANTUM') return 'Running Quantum Simulation (~6 mins)...';
        if (taskStatus.current_step === 'RUNNING_CLASSICAL') return 'Waiting for Classical Solver...';
        return 'Solving...';
    }
    return 'Loading...';
  }

  // Component con để render mỗi card so sánh
  const SolverCard = ({ title, result, isLoading, statusText }: { title: string, result?: SolverResult, isLoading: boolean, statusText: string }) => (
    <div className="solver-panel">
      <h2>{title}</h2>
      <div className="graph-container">
        {taskStatus.network ? (
            <NetworkDisplay
                network={taskStatus.network}
                path={result?.path || null}
                startNode={problem.start_node}
                endNode={problem.end_node}
            />
        ) : (
            <div className="placeholder-graph">Generate a problem to see the network.</div>
        )}
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>{statusText}</p>
          </div>
        )}
      </div>
      <div className="results">
        <strong>Path:</strong> {result?.path ? result.path.join(' → ') : 'N/A'}<br/>
        <strong>Cost:</strong> {result?.cost ?? 'N/A'}<br/>
        <strong>Time:</strong> {result?.execution_time ? `${result.execution_time.toFixed(4)}s` : 'N/A'}
      </div>
      {result && <ResultAnalysis result={result} />}
    </div>
  );

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Quantum vs. Classical Routing</h1>
        <button onClick={startSolving} disabled={taskStatus.status === 'running' || taskStatus.status === 'pending'}>
          {(taskStatus.status === 'running' || taskStatus.status === 'pending') ? 'Solving in Background...' : 'Generate 5-Node Problem & Solve'}
        </button>
      </header>
      <main className="comparison-container">
        <div className="side-panel">
          <div className="explanation-box">
            <h3>About This PoC</h3>
            <p>This demo provides a side-by-side comparison of a **Classical** and a **Quantum** algorithm for solving a network routing problem (Shortest Path).</p>
            <h4>The Race:</h4>
            <ol>
              <li><strong>The Problem:</strong> A random network graph is generated. The goal is to find the lowest-cost path between the <span style={{color: '#2E8B57', fontWeight: 'bold'}}>green (start)</span> and <span style={{color: '#C71585', fontWeight: 'bold'}}>pink (end)</span> nodes.</li>
              <li><strong>Classical Solver (Dijkstra):</strong> An exact, greedy algorithm that guarantees the optimal solution very quickly for this scale.</li>
              <li><strong>Quantum Solver (QAOA):</strong> An approximate, heuristic algorithm simulated on a classical computer. It explores a vast solution space using quantum principles but is computationally expensive and doesn't guarantee the optimal solution.</li>
            </ol>
            <p>This PoC highlights the current state of quantum computing: while classical algorithms are superior for many current problems, this platform allows us to research and benchmark quantum approaches for the massive, complex optimization problems of the future.</p>
          </div>
        </div>
        <SolverCard
            title="Classical Solver (Dijkstra)"
            result={taskStatus.classical_result}
            isLoading={!taskStatus.classical_result && (taskStatus.status === 'running' || taskStatus.status === 'pending')}
            statusText={getStatusText('classical')}
        />
        <SolverCard
            title="Quantum Solver (QAOA)"
            result={taskStatus.quantum_result}
            isLoading={!taskStatus.quantum_result && (taskStatus.status === 'running' || taskStatus.status === 'pending')}
            statusText={getStatusText('quantum')}
        />
      </main>
    </div>
  );
}

export default App;
