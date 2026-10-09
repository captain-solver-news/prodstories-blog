import katex from 'katex';
import 'katex/dist/katex.min.css';
import styles from './math.module.scss';

type PropsType = {
  latex: string;
  display?: boolean;
};

export function MathFormula({ latex, display = false }: PropsType) {
  const html = katex.renderToString(latex, { displayMode: display, throwOnError: false });

  if (display) return <div className={styles.block} dangerouslySetInnerHTML={{ __html: html }} />;

  return <span className={styles.inline} dangerouslySetInnerHTML={{ __html: html }} />;
}
