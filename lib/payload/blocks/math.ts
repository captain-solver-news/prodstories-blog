import type { Block, TextareaFieldValidation } from 'payload';
import katex from 'katex';

const validateLatex: TextareaFieldValidation = (value) => {
  if (!value?.trim()) return 'Formula is required';

  try {
    katex.renderToString(value, { throwOnError: true });
    return true;
  } catch (error) {
    return error instanceof Error ? error.message : 'Invalid LaTeX';
  }
};

export const MathBlock: Block = {
  slug: 'math',
  interfaceName: 'MathBlock',
  labels: {
    singular: 'Formula',
    plural: 'Formulas',
  },
  jsx: {
    export: ({ fields }) => `$$\n${String(fields.latex ?? '').trim()}\n$$`,
    import: () => false,
  },
  fields: [
    {
      name: 'latex',
      type: 'textarea',
      required: true,
      label: 'LaTeX',
      validate: validateLatex,
      admin: {
        description:
          'Rendered as a centered display formula, e.g. f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
      },
    },
  ],
};

export const InlineMathBlock: Block = {
  slug: 'inlineMath',
  interfaceName: 'InlineMathBlock',
  labels: {
    singular: 'Inline formula',
    plural: 'Inline formulas',
  },
  jsx: {
    export: ({ fields }) => `$${String(fields.latex ?? '').trim()}$`,
    import: () => false,
  },
  fields: [
    {
      name: 'latex',
      type: 'textarea',
      required: true,
      label: 'LaTeX',
      validate: validateLatex,
      admin: {
        description: 'Rendered inside the sentence, e.g. \\sigma^2',
      },
    },
  ],
};
