// Deterministic "career graph" decoration: fixed node/edge positions so
// server- and client-rendered markup match exactly (no hydration mismatch).
const NODES = [
  { id: "a", x: 60, y: 80, r: 3.5, delay: "0s" },
  { id: "b", x: 180, y: 40, r: 2.5, delay: "0.4s" },
  { id: "c", x: 260, y: 140, r: 4, delay: "0.8s" },
  { id: "d", x: 120, y: 190, r: 2.5, delay: "1.2s" },
  { id: "e", x: 320, y: 70, r: 3, delay: "0.2s" },
  { id: "f", x: 40, y: 260, r: 3, delay: "1.6s" },
  { id: "g", x: 220, y: 260, r: 2.5, delay: "0.6s" },
  { id: "h", x: 330, y: 230, r: 3.5, delay: "1s" },
  { id: "i", x: 150, y: 320, r: 2.5, delay: "1.4s" },
];

const EDGES: [string, string][] = [
  ["a", "b"],
  ["b", "e"],
  ["b", "c"],
  ["c", "e"],
  ["c", "h"],
  ["a", "d"],
  ["d", "g"],
  ["g", "c"],
  ["g", "h"],
  ["d", "f"],
  ["f", "i"],
  ["i", "g"],
];

function find(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export default function ConstellationBackground() {
  return (
    <svg
      viewBox="0 0 380 380"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="edgeFade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {EDGES.map(([from, to], i) => {
        const a = find(from);
        const b = find(to);
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="url(#edgeFade)"
            strokeWidth="1"
          />
        );
      })}
      {NODES.map((n) => (
        <circle
          key={n.id}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill="#A5B4FC"
          className="origin-center animate-node-pulse"
          style={{ animationDelay: n.delay }}
        />
      ))}
    </svg>
  );
}
