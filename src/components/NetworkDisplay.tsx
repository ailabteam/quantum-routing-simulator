// src/components/NetworkDisplay.tsx
import { memo } from 'react';
import ReactFlow, { Background, Controls, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';

interface NetworkDisplayProps {
  network: { nodes: any[], edges: [number, number, { weight: number }][] };
  path: number[] | null;
}

const NetworkDisplay = ({ network, path }: NetworkDisplayProps) => {
  // Chuyển đổi dữ liệu từ NetworkX (dict) sang định dạng của React Flow
  const nodes: Node[] = network.nodes.map((node, i) => ({
    id: String(i),
    position: { x: (i % 4) * 150, y: Math.floor(i / 4) * 150 },
    data: { label: `Node ${i}` },
  }));

  const pathEdges = new Set();
  if (path) {
    for (let i = 0; i < path.length - 1; i++) {
      pathEdges.add(`${path[i]}-${path[i+1]}`);
      pathEdges.add(`${path[i+1]}-${path[i]}`);
    }
  }

  const edges: Edge[] = network.edges.map(([u, v, data]) => ({
    id: `e-${u}-${v}`,
    source: String(u),
    target: String(v),
    label: String(data.weight),
    animated: pathEdges.has(`${u}-${v}`),
    style: { 
        stroke: pathEdges.has(`${u}-${v}`) ? '#ff0072' : '#aaa',
        strokeWidth: pathEdges.has(`${u}-${v}`) ? 3 : 1,
    },
  }));

  return (
    <div style={{ width: '100%', height: '100%', border: '1px solid #eee' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable={false} nodesConnectable={false} >
        <Controls showInteractive={false} />
        <Background />
      </ReactFlow>
    </div>
  );
};
export default memo(NetworkDisplay);
