export default function Sparkline({ volumes }: { volumes: number[] }) {
  if (volumes.length < 2) {
    return (
      <span className="text-sm text-zinc-400 dark:text-zinc-500" aria-hidden="true">
        —
      </span>
    );
  }
  const W = 96;
  const H = 24;
  const PAD = 2;
  const max = Math.max(...volumes);
  const min = Math.min(...volumes);
  const range = max - min || 1;
  const points = volumes
    .map((v, i) => {
      const x = PAD + (i / (volumes.length - 1)) * (W - PAD * 2);
      const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = volumes.length - 1;
  const lastX = PAD + (last / last) * (W - PAD * 2);
  const lastY = H - PAD - ((volumes[last] - min) / range) * (H - PAD * 2);
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="inline-block align-middle"
      role="img"
      aria-label="12-month search volume trend"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-blue-600 dark:text-blue-400"
      />
      <circle cx={lastX} cy={lastY} r="2" className="fill-blue-600 dark:fill-blue-400" />
    </svg>
  );
}
