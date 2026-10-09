export type GaussianCurve = {
  label?: string | null;
  mean: number;
  stdDev: number;
  shadeFrom?: number | null;
  shadeTo?: number | null;
  showMean?: boolean | null;
};

export type GaussianChartData = {
  title?: string | null;
  caption?: string | null;
  curves?: GaussianCurve[] | null;
};

const MINUS = '−';

export function normalPdf(x: number, mean: number, stdDev: number): number {
  const z = (x - mean) / stdDev;

  return Math.exp(-0.5 * z * z) / (stdDev * Math.sqrt(2 * Math.PI));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function xDomain(curves: GaussianCurve[], xMin?: number | null, xMax?: number | null): [number, number] {
  const autoMin = Math.min(...curves.map((curve) => curve.mean - 4 * curve.stdDev));
  const autoMax = Math.max(...curves.map((curve) => curve.mean + 4 * curve.stdDev));
  const min = xMin ?? autoMin;
  const max = xMax ?? autoMax;

  return min < max ? [min, max] : [autoMin, autoMax];
}

export function niceStep(span: number, targetCount: number): number {
  const rawStep = span / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));

  return [1, 2, 2.5, 5, 10].map((multiplier) => multiplier * magnitude).find((step) => step >= rawStep) ?? rawStep;
}

export function ticksBetween(min: number, max: number, step: number): number[] {
  const ticks: number[] = [];
  const epsilon = step * 1e-9;

  for (let index = Math.ceil((min - epsilon) / step); index * step <= max + epsilon; index++) {
    ticks.push(index * step);
  }

  return ticks;
}

function stepDecimals(step: number): number {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  const mantissa = step / 10 ** Math.floor(Math.log10(step));

  return Math.abs(mantissa - 2.5) < 1e-9 ? decimals + 1 : decimals;
}

export function formatNumber(value: number, step?: number): string {
  const text =
    step === undefined
      ? String(Number(value.toFixed(4)))
      : (Math.abs(value) < step * 1e-9 ? 0 : value).toFixed(stepDecimals(step));

  return text.replace('-', MINUS);
}

export function curveLabel(curve: GaussianCurve): string {
  return curve.label?.trim() || `μ = ${formatNumber(curve.mean)}, σ = ${formatNumber(curve.stdDev)}`;
}

export function describeCurve(curve: GaussianCurve): string {
  const params = `normal distribution, μ = ${formatNumber(curve.mean)}, σ = ${formatNumber(curve.stdDev)}`;
  const shade =
    curve.shadeFrom != null && curve.shadeTo != null
      ? `, shaded from ${formatNumber(curve.shadeFrom)} to ${formatNumber(curve.shadeTo)}`
      : '';

  return `${curve.label?.trim() ? `${curve.label.trim()}: ` : ''}${params}${shade}`;
}

export function describeGaussianChart({ title, caption, curves }: GaussianChartData): string {
  return [
    `Chart${title ? `: ${title}` : ''}`,
    ...(curves ?? []).map((curve) => `- ${describeCurve(curve)}`),
    ...(caption ? ['', caption] : []),
  ].join('\n');
}
