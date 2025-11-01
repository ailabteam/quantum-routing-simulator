// src/components/ResultAnalysis.tsx

interface SolverResult {
  solver: string;
  path: number[] | null;
  cost: number | string;
  execution_time: number;
}

interface ResultAnalysisProps {
  result: SolverResult;
}

const ResultAnalysis = ({ result }: ResultAnalysisProps) => {
  // Style dùng chung
  const boxStyle: React.CSSProperties = {
    marginTop: '10px',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '0.85em',
    lineHeight: '1.5',
  };

  if (result.solver === 'classical') {
    return (
      <div style={{ ...boxStyle, backgroundColor: '#e7f7ec', border: '1px solid #c8e6c9' }}>
        <strong>Analysis:</strong> Dijkstra's algorithm is deterministic and guarantees finding the optimal path. Its performance is exceptionally fast for graphs of this size, making it the superior choice for this specific problem.
      </div>
    );
  }

  if (result.solver === 'quantum_qaoa') {
    if (result.path) {
      return (
        <div style={{ ...boxStyle, backgroundColor: '#e8eaf6', border: '1px solid #c5cae9' }}>
          <strong>Analysis:</strong> The QAOA simulation found a valid path. However, as an approximate algorithm, it does not guarantee optimality. The significantly longer execution time reflects the immense computational cost of simulating a quantum system on classical hardware.
        </div>
      );
    } else {
      // Trường hợp thất bại
      return (
        <div style={{ ...boxStyle, backgroundColor: '#ffebf4', border: '1px solid #f8bbd0' }}>
          <strong>Analysis:</strong> The QAOA simulation, with its current parameters (e.g., `reps=2`), failed to find a valid path within the solution space it explored. This is a common outcome for heuristic quantum algorithms and highlights a key area of research: finding the right parameters (hyper-tuning) to guide the algorithm towards a good solution. It demonstrates that quantum algorithms are not a "magic bullet" and require significant tuning.
        </div>
      );
    }
  }

  return null;
};

export default ResultAnalysis;
