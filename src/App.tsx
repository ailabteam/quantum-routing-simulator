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

// --- Component Chính ---
function App() {
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({ status: 'idle' });
  const [taskId, setTaskId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startSolving = () => {
    setTaskId(null);
    setTaskStatus({ status: 'pending' });
    // Dọn dẹp interval cũ nếu có
    if (intervalRef.current) clearInterval(intervalRef.current);

    fetch('/api/solve-routing', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num_nodes: 5, start_node: 0, end_node: 4 })
    })
    .then(res => res.json())
    .then(data => {
        setTaskId(data.task_id);
        // Ngay khi có task_id, bắt đầu vòng lặp kiểm tra trạng thái
        setTaskStatus(prev => ({ ...prev, status: 'running' }));
    })
    .catch(() => setTaskStatus({ status: 'failed', error_message: "Failed to start task." }));
  };

  // Hook để kiểm tra trạng thái
  useEffect(() => {
    // Chỉ chạy khi status là 'running' và đã có task_id
    if (taskStatus.status !== 'running' || !taskId) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
    }
    
    // Đặt một interval mới
    intervalRef.current = window.setInterval(() => {
        console.log(`Polling status for task: ${taskId}`);
        fetch(`/api/get-status/${taskId}`)
        .then(res => res.json())
        .then((data: TaskStatus) => {
            console.log("Received status update:", data);
            setTaskStatus(data); // Cập nhật toàn bộ trạng thái
            
            // Nếu task đã kết thúc, dừng vòng lặp
            if (data.status === 'finished' || data.status === 'failed') {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        });
    }, 2500); // 2.5 giây một lần

    // Dọn dẹp khi component unmount hoặc khi các dependency thay đổi
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [taskStatus.status, taskId]); // Chạy lại khi status hoặc taskId thay đổi

  const getStatusText = (solverType: 'classical' | 'quantum') => {
    if (taskStatus.status === 'idle') return 'Waiting to start...';
    if (taskStatus.status === 'pending') return 'Initializing task...';
    if (taskStatus.status === 'failed') return `Task Failed: ${taskStatus.error_message}`;
    
    if (solverType === 'classical') {
        return taskStatus.classical_result ? 'Completed!' : 'Solving...';
    }
    
    if (solverType === 'quantum') {
        if (taskStatus.quantum_result) return 'Completed!';
        if (taskStatus.current_step === 'RUNNING_QUANTUM') return 'Running Simulation (~5-6 mins)...';
        if (taskStatus.current_step === 'RUNNING_CLASSICAL') return 'Waiting for Classical Solver...';
        return 'Solving...';
    }
    return 'Loading...';
  }

  const SolverCard = ({ title, result, isLoading, statusText }: { title: string, result?: SolverResult, isLoading: boolean, statusText: string }) => (
    <div className="solver-panel">
      <h2>{title}</h2>
      <div className="graph-container">
        {taskStatus.network && <NetworkDisplay network={taskStatus.network} path={result?.path || null} />}
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
    </div>
  );

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Quantum vs. Classical Routing</h1>
        <button onClick={startSolving} disabled={taskStatus.status === 'running' || taskStatus.status === 'pending'}>
          {(taskStatus.status === 'running' || taskStatus.status === 'pending') ? 'Solving in Background...' : 'Generate New Problem & Solve'}
        </button>
      </header>
      <div className="comparison-container">
        <SolverCard 
            title="Classical Solver (Dijkstra)" 
            result={taskStatus.classical_result} 
            isLoading={!taskStatus.classical_result && taskStatus.status !== 'idle'}
            statusText={getStatusText('classical')}
        />
        <SolverCard 
            title="Quantum Solver (QAOA)" 
            result={taskStatus.quantum_result} 
            isLoading={!taskStatus.quantum_result && taskStatus.status !== 'idle'}
            statusText={getStatusText('quantum')}
        />
      </div>
    </div>
  );
}
export default App;
