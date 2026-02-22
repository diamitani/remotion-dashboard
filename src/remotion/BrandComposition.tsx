import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { area, curveMonotoneX } from 'd3-shape';

type Point = { x: number; y: number };

const points: Point[] = [
  { x: 120, y: 520 },
  { x: 250, y: 410 },
  { x: 420, y: 460 },
  { x: 580, y: 350 },
  { x: 760, y: 290 },
  { x: 940, y: 260 },
  { x: 1140, y: 180 },
];

const lineGen = area<Point>()
  .x((p) => p.x)
  .y0(620)
  .y1((p) => p.y)
  .curve(curveMonotoneX);

const pathData = lineGen(points) ?? '';

export const BrandComposition: React.FC<{ promptText: string }> = ({ promptText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgShift = interpolate(frame, [0, 6 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const chartIn = spring({
    frame,
    fps,
    config: { damping: 150, stiffness: 130 },
  });

  const traceProgress = interpolate(frame, [0.5 * fps, 3.5 * fps], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(frame, [0, 1.2 * fps], [40, 0], {
    extrapolateRight: 'clamp',
  });

  const { strokeDasharray, strokeDashoffset } = evolvePath(traceProgress, pathData);

  return (
    <div
      style={{
        flex: 1,
        background: `radial-gradient(circle at ${40 + bgShift * 40}% 20%, #6EDCFF 0%, #0A2240 52%, #06070A 100%)`,
        color: '#F5F8FF',
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
        padding: 80,
      }}
    >
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: chartIn,
        }}
      >
        <p style={{ margin: 0, letterSpacing: 3, textTransform: 'uppercase', fontSize: 22, color: '#A3E7FF' }}>
          Prompt To Motion
        </p>
        <h1 style={{ margin: '14px 0 18px', fontSize: 84, lineHeight: 1.02, maxWidth: 1040 }}>
          {promptText}
        </h1>
      </div>

      <svg width={1200} height={650} style={{ marginTop: 36, opacity: chartIn }}>
        <defs>
          <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(89, 224, 255, 0.55)" />
            <stop offset="100%" stopColor="rgba(89, 224, 255, 0.02)" />
          </linearGradient>
          <linearGradient id="stroke-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#89F7FE" />
            <stop offset="100%" stopColor="#66A6FF" />
          </linearGradient>
        </defs>
        <path d={pathData} fill="url(#area-gradient)" />
        <path
          d={pathData}
          fill="none"
          stroke="url(#stroke-gradient)"
          strokeWidth={6}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
    </div>
  );
};
