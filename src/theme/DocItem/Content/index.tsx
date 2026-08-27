/**
 * Conteúdo do documento, envolvido para pôr o progresso da seção no topo.
 *
 * Só índices de seção recebem o painel. "Quanto falta nesta seção?" é a
 * pergunta que se faz ao chegar no índice — no rodapé, ela chegava tarde.
 *
 * O controle de marcar como lido dos demais documentos fica no rodapé
 * (`DocItem/Footer`), que é onde ele faz sentido: depois de ler.
 */

import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type {WrapperProps} from '@docusaurus/types';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import SectionProgress from '@site/src/components/ReadingProgress/SectionProgress';

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): React.ReactElement {
  const {frontMatter} = useDoc();
  const isIndex = (frontMatter as {doc_type?: string}).doc_type === 'index';

  return (
    <>
      {isIndex && <SectionProgress />}
      <Content {...props} />
    </>
  );
}
