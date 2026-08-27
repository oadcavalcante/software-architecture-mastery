/**
 * Rodapé do documento, envolvido para acrescentar o controle de leitura.
 *
 * Envolver o rodapé é o que permite que o controle apareça em todos os
 * documentos sem tocar em nenhum arquivo Markdown — os 400+ documentos do
 * percurso continuam sendo Markdown puro (SPEC.md §10.1).
 *
 * Índices não recebem o controle: um índice é sumário, não conteúdo, e marcá-lo
 * como "lido" não significaria nada. Eles recebem o painel de progresso da
 * seção, no topo, por `DocItem/Content`.
 */

import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import type FooterType from '@theme/DocItem/Footer';
import type {WrapperProps} from '@docusaurus/types';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import ReadToggle from '@site/src/components/ReadingProgress/ReadToggle';

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): React.ReactElement {
  const {metadata, frontMatter} = useDoc();
  const isIndex = (frontMatter as {doc_type?: string}).doc_type === 'index';

  return (
    <>
      {!isIndex && <ReadToggle docId={metadata.id} />}
      <Footer {...props} />
    </>
  );
}
