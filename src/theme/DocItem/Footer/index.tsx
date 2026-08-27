/**
 * Rodapé do documento, envolvido para acrescentar o progresso de leitura.
 *
 * Envolver o rodapé é o que permite que o controle apareça em todos os
 * documentos sem tocar em nenhum arquivo Markdown — os 400+ documentos do
 * percurso continuam sendo Markdown puro (SPEC.md §10.1).
 *
 * O critério de quando mostrar o quê:
 *
 *   doc_type: index      → progresso agregado da seção
 *   demais tipos         → botão de marcar como lido
 *
 * Um índice é sumário, não conteúdo: marcá-lo como "lido" não significaria
 * nada, e ele contaria no próprio denominador.
 */

import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import type FooterType from '@theme/DocItem/Footer';
import type {WrapperProps} from '@docusaurus/types';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import ReadToggle from '@site/src/components/ReadingProgress/ReadToggle';
import SectionProgress from '@site/src/components/ReadingProgress/SectionProgress';

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): React.ReactElement {
  const {metadata, frontMatter} = useDoc();
  const isIndex = (frontMatter as {doc_type?: string}).doc_type === 'index';

  return (
    <>
      {isIndex ? <SectionProgress /> : <ReadToggle docId={metadata.id} />}
      <Footer {...props} />
    </>
  );
}
