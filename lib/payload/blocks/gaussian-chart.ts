import type { Block, NumberFieldSingleValidation } from 'payload';
import { describeGaussianChart, type GaussianChartData } from '@/lib/utils/gaussian';

const validateStdDev: NumberFieldSingleValidation = (value) => {
  if (value == null) return 'Standard deviation is required';

  return value > 0 ? true : 'Standard deviation must be greater than 0';
};

function validateGreaterThan(field: string, label: string, isPair: boolean): NumberFieldSingleValidation {
  return (value, { siblingData }) => {
    const other = (siblingData as Record<string, unknown>)[field];
    const hasOther = typeof other === 'number';

    if (value == null) return isPair && hasOther ? `Required when "${label}" is set` : true;
    if (!hasOther) return isPair ? `Set "${label}" too` : true;

    return value > other ? true : `Must be greater than "${label}"`;
  };
}

export const GaussianChartBlock: Block = {
  slug: 'gaussianChart',
  interfaceName: 'GaussianChartBlock',
  labels: {
    singular: 'Gaussian chart',
    plural: 'Gaussian charts',
  },
  jsx: {
    export: ({ fields }) => describeGaussianChart(fields as GaussianChartData),
    import: () => false,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'curves',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 4,
      labels: {
        singular: 'Curve',
        plural: 'Curves',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              admin: {
                width: '40%',
                description: 'Defaults to "μ = …, σ = …"',
              },
            },
            {
              name: 'mean',
              type: 'number',
              label: 'Mean (μ)',
              required: true,
              defaultValue: 0,
              admin: {
                width: '30%',
              },
            },
            {
              name: 'stdDev',
              type: 'number',
              label: 'Standard deviation (σ)',
              required: true,
              defaultValue: 1,
              validate: validateStdDev,
              admin: {
                width: '30%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'shadeFrom',
              type: 'number',
              label: 'Shade from',
              admin: {
                width: '40%',
                description: 'Optional interval to shade under the curve',
              },
            },
            {
              name: 'shadeTo',
              type: 'number',
              label: 'Shade to',
              validate: validateGreaterThan('shadeFrom', 'Shade from', true),
              admin: {
                width: '30%',
              },
            },
            {
              name: 'showMean',
              type: 'checkbox',
              label: 'Show mean line',
              defaultValue: true,
              admin: {
                width: '30%',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'xMin',
          type: 'number',
          label: 'X from',
          admin: {
            width: '50%',
            description: 'Empty: smallest μ − 4σ',
          },
        },
        {
          name: 'xMax',
          type: 'number',
          label: 'X to',
          validate: validateGreaterThan('xMin', 'X from', false),
          admin: {
            width: '50%',
            description: 'Empty: largest μ + 4σ',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'xLabel',
          type: 'text',
          label: 'X axis label',
          defaultValue: 'x',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'yLabel',
          type: 'text',
          label: 'Y axis label',
          defaultValue: 'Density',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
};
