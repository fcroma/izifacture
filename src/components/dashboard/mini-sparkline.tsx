"use client";

interface MiniSparklineProps {
  data: number[];
  positive?: boolean;
  width?: number;
  height?: number;
}

export function MiniSparkline({ data, positive = true, width = 56, height = 24 }: MiniSparklineProps) {
  if (!data.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + h - ((v - min) / range) * h;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const lastX = parseFloat(points[points.length - 1].split(",")[0]);
  const lastY = parseFloat(points[points.length - 1].split(",")[1]);

  const color = positive ? "#10B981" : "#EF4444";
  const fillColor = positive ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)";

  // Create closed fill path
  const firstX = parseFloat(points[0].split(",")[0]);
  const fillPath = `M ${firstX},${pad + h} L ${points.join(" L ")} L ${lastX},${pad + h} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={fillPath} fill={fillColor} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="2" fill={color} />
    </svg>
  );
}
