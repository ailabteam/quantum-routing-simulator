// src/components/NetworkDisplay.tsx
import { memo } from 'react';
import ReactFlow, { Background, Controls, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';

interface NetworkDisplayProps {
  // Định dạng dữ liệu networkX đã được serialize
  network: { nodes: any[], edges: [number, number, { weight: number }][] }; 
  path: number[] | null;
  startNode: number;
  endNode: number;
}

const NetworkDisplay = ({ network, path, startNode, endNode }: NetworkDisplayProps) => {

  // Chuyển đổi dữ liệu từ NetworkX sang định dạng của React Flow
  const nodes: Node[] = network.nodes.map((_, i) => {
    let backgroundColor = '#ADD8E6'; // Màu xanh nhạt mặc định (Light Blue)
    let borderColor = '#4682B4';   // Màu xanh thép (Steel Blue)
    
    // Tô màu đặc biệt cho nút Start và End
    if (i === startNode) {
      backgroundColor = '#90EE90'; // Màu xanh lá cây (Light Green)
      borderColor = '#2E8B57';   // Màu xanh rêu (Sea Green)
    } else if (i === endNode) {
      backgroundColor = '#FFB6C1'; // Màu hồng nhạt (Light Pink)
      borderColor = '#C71585';   // Màu đỏ tím vừa (Medium Violet Red)
    }

    return {
      id: String(i),
      // Cải thiện layout vị trí để trông đẹp hơn
      position: { x: (i % 3) * 200 + Math.random() * 20, y: Math.floor(i / 3) * 180 + Math.random() * 20 },
      data: { label: `Node ${i}` },
      // Style để có hình tròn
      style: {
        width: 60,
        height: 60,
        borderRadius: '50%',
        backgroundColor: backgroundColor,
        border: `3px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
      },
    };
  });

  // Tạo một Set chứa các cạnh thuộc đường đi để tra cứu nhanh
  const pathEdges = new Set<string>();
  if (path) {
    for (let i = 0; i < path.length - 1; i++) {
      // Thêm cả hai chiều để xử lý đồ thị vô hướng
      pathEdges.add(`${path[i]}-${path[i+1]}`);
      pathEdges.add(`${path[i+1]}-${path[i]}`);
    }
  }

  const edges: Edge[] = network.edges.map(([u, v, data]) => {
    const isPathEdge = pathEdges.has(`${u}-${v}`) || pathEdges.has(`${v}-${u}`);
    return {
      id: `e-${u}-${v}`,
      source: String(u),
      target: String(v),
      label: String(data.weight),
      animated: isPathEdge,
      style: { 
          stroke: isPathEdge ? '#ff0072' : '#b1b1b7',
          strokeWidth: isPathEdge ? 3 : 1.5,
      },
      labelStyle: { fill: '#333', fontWeight: 600 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      labelBgStyle: { fill: '#FFCC00', fillOpacity: 0.8 },
    };
  });

  return (
    <div style={{ width: '100%', height: '100%', border: '1px solid #eee', borderRadius: '5px' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        fitView 
        nodesDraggable={false} 
        nodesConnectable={false}
      >
        <Controls showInteractive={false} />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default memo(NetworkDisplay);
