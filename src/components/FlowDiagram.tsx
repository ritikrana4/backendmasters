export type NodeType =
  | "client"
  | "server"
  | "loadbalancer"
  | "database"
  | "cache"
  | "queue"
  | "cdn"
  | "proxy";

export interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  type: NodeType;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export interface DiagramConfig {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  width?: number;
  height?: number;
  caption?: string;
}

const COLORS: Record<NodeType, string> = {
  client:       "#58a6ff",
  server:       "#3fb950",
  loadbalancer: "#a371f7",
  database:     "#f79e1a",
  cache:        "#ff7b72",
  queue:        "#e3b341",
  cdn:          "#39d353",
  proxy:        "#d2a8ff",
};

const NODE_TYPES: NodeType[] = [
  "client", "server", "loadbalancer", "database",
  "cache", "queue", "cdn", "proxy",
];

const NW = 128; // node width
const NH = 44;  // node height
const NR = 8;   // corner radius

function edgePoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  margin = 10,
): [number, number] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return [from.x, from.y];
  const hw = NW / 2 + margin;
  const hh = NH / 2 + margin;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  if (absDx * hh > absDy * hw) {
    return [from.x + Math.sign(dx) * hw, from.y + dy * (hw / absDx)];
  }
  return [from.x + dx * (hh / absDy), from.y + Math.sign(dy) * hh];
}

export default function FlowDiagram({ config }: { config: DiagramConfig }) {
  const { nodes, edges, width = 760, height = 220, caption } = config;

  const nodeMap: Record<string, DiagramNode> = {};
  for (const n of nodes) nodeMap[n.id] = n;

  return (
    <div
      style={{
        margin: "16px 0 20px",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid #21262d",
        background: "#0d1117",
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", display: "block" }}
        aria-hidden="true"
      >
        <defs>
          {NODE_TYPES.map((type) => (
            <marker
              key={type}
              id={`ah-${type}`}
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <path d="M0,0.5 L0,6.5 L7,3.5 Z" fill={COLORS[type]} />
            </marker>
          ))}
          <marker
            id="ah-default"
            markerWidth="7"
            markerHeight="7"
            refX="5"
            refY="3.5"
            orient="auto"
          >
            <path d="M0,0.5 L0,6.5 L7,3.5 Z" fill="#484f58" />
          </marker>
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" />
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = nodeMap[edge.from];
          const toNode = nodeMap[edge.to];
          if (!fromNode || !toNode) return null;
          const [x1, y1] = edgePoint(fromNode, toNode);
          const [x2, y2] = edgePoint(toNode, fromNode);
          const color = COLORS[fromNode.type];
          const dur = 1.6 + (i % 3) * 0.25;
          const pathD = `M${x1},${y1} L${x2},${y2}`;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const lox = Math.sin(angle) * 10;
          const loy = -Math.cos(angle) * 10;

          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={edge.dashed ? "#30363d" : "#30363d"}
                strokeWidth={1.5}
                strokeDasharray={edge.dashed ? "5 4" : undefined}
                markerEnd={`url(#ah-${fromNode.type})`}
              />
              {/* Animated flow packets */}
              {[0, 0.33, 0.67].map((off, k) => (
                <circle key={k} r={3.5} fill={color} opacity={0.85}>
                  <animateMotion
                    path={pathD}
                    begin={`${(off * dur).toFixed(2)}s`}
                    dur={`${dur.toFixed(2)}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
              {/* Edge label */}
              {edge.label && (
                <text
                  x={mx + lox}
                  y={my + loy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#6e7681"
                  fontSize="9.5"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const color = COLORS[node.type];
          const nx = node.x - NW / 2;
          const ny = node.y - NH / 2;
          const hasSubLabel = !!node.sublabel;

          return (
            <g key={node.id}>
              {/* Outer glow ring */}
              <rect
                x={nx - 2}
                y={ny - 2}
                width={NW + 4}
                height={NH + 4}
                rx={NR + 2}
                fill="none"
                stroke={color}
                strokeWidth={1}
                opacity={0.25}
              />
              {/* Node body */}
              <rect
                x={nx}
                y={ny}
                width={NW}
                height={NH}
                rx={NR}
                fill="#0d1117"
                stroke={color}
                strokeWidth={1.5}
              />
              {/* Colored indicator bar on left edge */}
              <rect
                x={nx}
                y={ny + NR}
                width={3}
                height={NH - NR * 2}
                fill={color}
                rx={1.5}
              />
              {/* Primary label */}
              <text
                x={node.x + 4}
                y={hasSubLabel ? node.y - 5 : node.y + 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#e6edf3"
                fontSize="11.5"
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {node.label}
              </text>
              {/* Sublabel */}
              {node.sublabel && (
                <text
                  x={node.x + 4}
                  y={node.y + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#6e7681"
                  fontSize="9"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {node.sublabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {caption && (
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid #21262d",
            fontSize: "0.75rem",
            color: "#6e7681",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}
