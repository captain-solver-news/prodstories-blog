import { useId } from 'react';
import styles from './gaussian-chart.module.scss';
import {
  clamp,
  curveLabel,
  describeCurve,
  formatNumber,
  type GaussianCurve,
  niceStep,
  normalPdf,
  ticksBetween,
  xDomain,
} from '@/lib/utils/gaussian';

type PropsType = {
  title?: string | null;
  caption?: string | null;
  xLabel?: string | null;
  yLabel?: string | null;
  xMin?: number | null;
  xMax?: number | null;
  curves: GaussianCurve[];
};

const WIDTH = 640;
const HEIGHT = 380;
const PADDING = { top: 20, right: 20, bottom: 64, left: 80 };
const SAMPLES = 200;
const COLORS = ['var(--accent)', 'var(--info)', 'var(--warning)', 'var(--danger)'];

export function GaussianChart({ title, caption, xLabel, yLabel, xMin, xMax, curves }: PropsType) {
  const id = useId();
  const [x0, x1] = xDomain(curves, xMin, xMax);
  const peak = Math.max(...curves.map((curve) => normalPdf(clamp(curve.mean, x0, x1), curve.mean, curve.stdDev)));
  const yStep = niceStep(peak, 4);
  const yTop = Math.ceil(peak / yStep) * yStep;
  const xStep = niceStep(x1 - x0, 8);
  const plotBottom = HEIGHT - PADDING.bottom;
  const plotRight = WIDTH - PADDING.right;

  const sx = (x: number) => PADDING.left + ((x - x0) / (x1 - x0)) * (plotRight - PADDING.left);
  const sy = (y: number) => plotBottom - (y / yTop) * (plotBottom - PADDING.top);

  const linePath = (curve: GaussianCurve, from: number, to: number) =>
    Array.from({ length: SAMPLES + 1 }, (_, index) => {
      const x = from + ((to - from) * index) / SAMPLES;

      return `${index ? 'L' : 'M'}${sx(x).toFixed(2)} ${sy(normalPdf(x, curve.mean, curve.stdDev)).toFixed(2)}`;
    }).join(' ');

  const areaPath = (curve: GaussianCurve, from: number, to: number) =>
    `${linePath(curve, from, to)} L${sx(to).toFixed(2)} ${plotBottom} L${sx(from).toFixed(2)} ${plotBottom} Z`;

  const hasLegend = curves.length > 1 || curves.some((curve) => curve.label?.trim());

  return (
    <figure className={styles.chart}>
      {title && <p className={styles.title}>{title}</p>}

      <svg className={styles.svg} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby={`${id}-desc`}>
        <title id={`${id}-desc`}>{[title, ...curves.map(describeCurve)].filter(Boolean).join('. ')}</title>

        <defs>
          {curves.map((_, index) => (
            <linearGradient key={index} id={`${id}-fill-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: COLORS[index], stopOpacity: 0.28 }} />
              <stop offset="100%" style={{ stopColor: COLORS[index], stopOpacity: 0.02 }} />
            </linearGradient>
          ))}
        </defs>

        {ticksBetween(0, yTop, yStep).map((tick) => (
          <g key={`y${tick}`}>
            <line
              className={tick ? styles.grid : styles.axis}
              x1={PADDING.left}
              x2={plotRight}
              y1={sy(tick)}
              y2={sy(tick)}
            />
            <text className={styles.tick} x={PADDING.left - 10} y={sy(tick)} textAnchor="end" dominantBaseline="middle">
              {formatNumber(tick, yStep)}
            </text>
          </g>
        ))}

        {ticksBetween(x0, x1, xStep).map((tick) => (
          <g key={`x${tick}`}>
            <line className={styles.axis} x1={sx(tick)} x2={sx(tick)} y1={plotBottom} y2={plotBottom + 6} />
            <text
              className={styles.tick}
              x={sx(tick)}
              y={plotBottom + 10}
              textAnchor="middle"
              dominantBaseline="hanging"
            >
              {formatNumber(tick, xStep)}
            </text>
          </g>
        ))}

        {curves.map((curve, index) => {
          const color = COLORS[index];
          const shadeFrom = curve.shadeFrom == null ? null : clamp(curve.shadeFrom, x0, x1);
          const shadeTo = curve.shadeTo == null ? null : clamp(curve.shadeTo, x0, x1);
          const hasShade = shadeFrom != null && shadeTo != null && shadeTo > shadeFrom;
          const hasMean = curve.showMean !== false && curve.mean >= x0 && curve.mean <= x1;

          return (
            <g key={index}>
              <path className={styles.area} d={areaPath(curve, x0, x1)} fill={`url(#${id}-fill-${index})`} />
              {hasShade && (
                <path className={styles.shade} d={areaPath(curve, shadeFrom, shadeTo)} style={{ fill: color }} />
              )}
              {hasMean && (
                <line
                  className={styles.mean}
                  x1={sx(curve.mean)}
                  x2={sx(curve.mean)}
                  y1={plotBottom}
                  y2={sy(normalPdf(curve.mean, curve.mean, curve.stdDev))}
                  style={{ stroke: color }}
                />
              )}
              <path className={styles.line} d={linePath(curve, x0, x1)} pathLength={1} style={{ stroke: color }} />
            </g>
          );
        })}

        {xLabel && (
          <text className={styles.label} x={(PADDING.left + plotRight) / 2} y={HEIGHT - 6} textAnchor="middle">
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text
            className={`${styles.label} ${styles.yLabel}`}
            x={-(PADDING.top + plotBottom) / 2}
            y={4}
            transform="rotate(-90)"
            dominantBaseline="hanging"
            textAnchor="middle"
          >
            {yLabel}
          </text>
        )}
      </svg>

      {hasLegend && (
        <ul className={styles.legend}>
          {curves.map((curve, index) => (
            <li key={index} className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: COLORS[index] }} aria-hidden="true" />
              {curveLabel(curve)}
            </li>
          ))}
        </ul>
      )}

      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
