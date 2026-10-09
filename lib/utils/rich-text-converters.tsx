import Image from 'next/image';
import type { DefaultNodeTypes, SerializedBlockNode, SerializedInlineBlockNode } from '@payloadcms/richtext-lexical';
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react';
import type {
  CodeBlock as CodeBlockType,
  GaussianChartBlock as GaussianChartBlockType,
  InlineMathBlock as InlineMathBlockType,
  MathBlock as MathBlockType,
} from '@/lib/payload/generated-types';
import { CodeBlock } from '@/components/blocks/code-block/code-block';
import { GaussianChart } from '@/components/blocks/gaussian-chart/gaussian-chart';
import { MathFormula } from '@/components/blocks/math/math';
import { POST_CONTENT_IMAGE_SIZES } from '@/config';

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CodeBlockType | MathBlockType | GaussianChartBlockType>
  | SerializedInlineBlockNode<InlineMathBlockType>;

export const richTextConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: (args) => {
    const { node } = args;
    const doc = node.value;

    if (
      typeof doc !== 'object' ||
      !('mimeType' in doc) ||
      !doc.mimeType?.startsWith('image') ||
      !doc.url ||
      !doc.width ||
      !doc.height
    ) {
      return typeof defaultConverters.upload === 'function' ? defaultConverters.upload(args) : null;
    }

    const alt = (node.fields?.alt as string | undefined) || doc.alt || '';

    return <Image src={doc.url} alt={alt} width={doc.width} height={doc.height} sizes={POST_CONTENT_IMAGE_SIZES} />;
  },
  table: ({ node, nodesToJSX }) => (
    <table>
      <tbody>{nodesToJSX({ nodes: node.children })}</tbody>
    </table>
  ),
  tablecell: ({ node, nodesToJSX }) => {
    const Tag = node.headerState > 0 ? 'th' : 'td';

    return (
      <Tag
        colSpan={node.colSpan && node.colSpan > 1 ? node.colSpan : undefined}
        rowSpan={node.rowSpan && node.rowSpan > 1 ? node.rowSpan : undefined}
      >
        {nodesToJSX({ nodes: node.children })}
      </Tag>
    );
  },
  blocks: {
    codeBlock: ({ node }) => (
      <CodeBlock
        filename={node.fields.filename}
        note={node.fields.note}
        syntax={node.fields.syntax}
        code={node.fields.code}
      />
    ),
    math: ({ node }) => <MathFormula latex={node.fields.latex} display />,
    gaussianChart: ({ node }) => (
      <GaussianChart
        title={node.fields.title}
        caption={node.fields.caption}
        xLabel={node.fields.xLabel}
        yLabel={node.fields.yLabel}
        xMin={node.fields.xMin}
        xMax={node.fields.xMax}
        curves={node.fields.curves}
      />
    ),
  },
  inlineBlocks: {
    inlineMath: ({ node }) => <MathFormula latex={node.fields.latex} />,
  },
});
