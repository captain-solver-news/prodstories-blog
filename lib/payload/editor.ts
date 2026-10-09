import { BlocksFeature, EXPERIMENTAL_TableFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical';
import { CodeBlock } from '@/lib/payload/blocks/code-block';
import { GaussianChartBlock } from '@/lib/payload/blocks/gaussian-chart';
import { InlineMathBlock, MathBlock } from '@/lib/payload/blocks/math';

export const richTextEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((feature) => feature.key !== 'heading'),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BlocksFeature({ blocks: [CodeBlock, MathBlock, GaussianChartBlock], inlineBlocks: [InlineMathBlock] }),
    EXPERIMENTAL_TableFeature(),
  ],
});
