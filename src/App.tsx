// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import NetworkDisplay from './components/NetworkDisplay';
import './App.css';

// --- Định nghĩa các Kiểu dữ liệu ---
interface SolverResult {
  solver: string; path: number[] | null; cost: number; execution_time: number;
}
interface TaskStatus {
  status: 'idle' | 'pending' | 'running' | 'finished' | 'failed';
  current_step?: string;
  network?: any;
  classical_result?: SolverResult;
  quantum_result?: SolverResult;
  error_message?: string;
}

function App() {
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({ status: 'idle' });
  const [taskId, setTaskId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startSolving = () => {
    setTaskId(null);
    setTaskStatus({ status: 'pending' });
    fetch('/api/solve-routing', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num_nodes: 5, start_node: 0, end_node: 4 })
    })
    .then(res => res.json())
    .then(data => {
        setTaskId(data.task_id);
        setTaskStatus({ status: 'running' });
    })
    .catch(() => setTaskStatus({ status: 'failed', error_message: "Failed to start task." }));
  };

  useEffect(() => {
    if (status !== 'running' || !taskId) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
    }
    intervalRef.current = window.setInterval(() => {
        fetch(`/api/get-status/${taskId}`)
        .then(res => res.json())
        .then((data: TaskStatus) => {
            setTaskStatus(data);
            if (data.status === 'finished' || data.status === 'failed') {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        });
    }, 2000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status, taskId]);

  const SolverCard = ({ title, result, isLoading, statusText }: { title: string, result?: SolverResult, isLoading: boolean, statusText: string }) => (
    <div className="solver-panel">
      <h2>{title}</h2>
      <div className="graph-container" style={{position: 'relative'}}>
        {taskStatus.network && <NetworkDisplay network={taskStatus.network} path={result?.path || null} />}
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>{statusText}</p>
          </div>
        )}
      </div>
      <div className="results">
        <strong>Path:</strong> {result?.path ? result.path.join(' -> ') : 'N/A'}<br/>
        <strong>Cost:</strong> {result?.cost ?? 'N/A'}<br/>
        <strong>Time:</strong> {result?.execution_time ? `${result.execution_time.toFixed(4)}s` : 'N/A'}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Quantum vs. Classical Routing</h1>
        <button onClick={startSolving} disabled={taskStatus.status === 'running' || taskStatus.status === 'pending'}>
          Generate New Problem & Solve
        </button>
      </header>
      <div className="comparison-container">
        <SolverCard 
            title="Classical Solver (Dijkstra)" 
            result={taskStatus.classical_result} 
            isLoading={!taskStatus.classical_result}
            statusText={taskStatus.status === 'idle' || taskStatus.status === 'pending' ? 'Waiting to start...' : 'Solving...'}
        />
        <SolverCard 
            title="Quantum Solver (QAOA)" 
            result={taskStatus.quantum_result} 
            isLoading={!taskStatus.quantum_result}
            statusText={
                taskStatus.status === 'idle' || taskStatus.status === 'pending' ? 'Waiting to start...' :
                taskStatus.current_step === 'RUNNING_CLASSICAL' ? 'Waiting for Classical...' :
                taskStatus.current_step === 'RUNNING_QUANTUM' ? 'Running Simulation (~5-6 mins)...' : 'Solving...'
            }
        />
      </div>
    </div>
  );
}
export default App;
