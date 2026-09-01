/**
 * Progresso de leitura — exportar, importar e limpar.
 *
 * SPEC.md §10.1 exige que o progresso seja exportável, e dá a razão: sem
 * backend, exportar é como o leitor leva o percurso para outra máquina, e é o
 * caminho de migração quando a segunda fase existir. `src/lib/readingProgress`
 * já implementava as três operações; faltava onde acioná-las.
 *
 * A página é o lugar certo em vez de um controle no rodapé de cada documento:
 * são operações raras, e repeti-las em 446 páginas seria ruído. O caminho é
 * `/progress` nas duas locales — o Docusaurus deriva a rota do nome do arquivo
 * e não a traduz para páginas em TSX.
 */

import React from 'react';
import Layout from '@theme/Layout';
import Translate, {translate} from '@docusaurus/Translate';
import {
  clearAll,
  exportProgress,
  importProgress,
} from '@site/src/lib/readingProgress';
import {useTotalRead} from '@site/src/components/ReadingProgress/useReadingProgress';
import styles from './progress.module.css';

type Feedback = {tone: 'ok' | 'error'; text: string};

/** Nome do arquivo baixado. Sem data: o conteúdo já carrega o instante de cada marcação. */
const FILE_NAME = 'software-architecture-mastery-progresso.json';

export default function ProgressPage(): React.ReactElement {
  const total = useTotalRead();
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

  function handleExport() {
    const blob = new Blob([exportProgress()], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = FILE_NAME;
    anchor.click();
    // Revogar imediatamente cancelaria o download em alguns navegadores.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Permite reimportar o mesmo arquivo: sem isto, `change` não dispara de novo.
    event.target.value = '';
    if (!file) return;

    const added = importProgress(await file.text());
    if (added === null) {
      setFeedback({
        tone: 'error',
        text: translate({
          id: 'progressPage.import.invalid',
          message: 'Arquivo inválido ou sem nenhum documento marcado.',
          description: 'Erro exibido quando o arquivo importado não serve',
        }),
      });
      return;
    }
    setFeedback({
      tone: 'ok',
      text: translate(
        {
          id: 'progressPage.import.done',
          message: '{added} documento(s) acrescentado(s). Nada foi apagado.',
          description: 'Confirmação de importação bem-sucedida',
        },
        {added},
      ),
    });
  }

  function handleClear() {
    const confirmed = window.confirm(
      translate({
        id: 'progressPage.clear.confirm',
        message:
          'Isto apaga todo o seu progresso neste navegador. Não há como desfazer. Continuar?',
        description: 'Confirmação antes de apagar o progresso',
      }),
    );
    if (!confirmed) return;
    clearAll();
    setFeedback({
      tone: 'ok',
      text: translate({
        id: 'progressPage.clear.done',
        message: 'Progresso apagado.',
        description: 'Confirmação de que o progresso foi apagado',
      }),
    });
  }

  return (
    <Layout
      title={translate({
        id: 'progressPage.title',
        message: 'Progresso de leitura',
        description: 'Título da página de progresso',
      })}
      description={translate({
        id: 'progressPage.description',
        message:
          'Exporte, importe ou apague o progresso de leitura guardado neste navegador.',
        description: 'Descrição da página de progresso',
      })}>
      <main className={`container margin-vert--lg ${styles.page}`}>
        <h1>
          <Translate id="progressPage.heading" description="Cabeçalho da página de progresso">
            Progresso de leitura
          </Translate>
        </h1>

        <p className={styles.count}>
          <Translate
            id="progressPage.count"
            description="Quantos documentos estão marcados como lidos"
            values={{total}}>
            {'{total} documento(s) marcado(s) como lido(s) neste navegador.'}
          </Translate>
        </p>

        <p>
          <Translate
            id="progressPage.explanation"
            description="Por que a página existe">
            O progresso é guardado no armazenamento local deste navegador, sem conta e sem
            servidor — ele não atravessa máquinas nem sobrevive à limpeza dos dados do site.
            Exportar é como levá-lo para outro navegador.
          </Translate>
        </p>

        <div className={styles.actions}>
          <button type="button" className="button button--primary" onClick={handleExport}>
            <Translate id="progressPage.export" description="Botão de exportar">
              Exportar
            </Translate>
          </button>

          <button
            type="button"
            className="button button--secondary"
            onClick={() => fileInput.current?.click()}>
            <Translate id="progressPage.import" description="Botão de importar">
              Importar
            </Translate>
          </button>

          <button type="button" className={styles.danger} onClick={handleClear}>
            <Translate id="progressPage.clear" description="Botão de apagar o progresso">
              Apagar tudo
            </Translate>
          </button>

          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className={styles.fileInput}
            onChange={handleImport}
          />
        </div>

        {feedback && (
          <p
            className={feedback.tone === 'error' ? styles.error : styles.ok}
            role="status"
            aria-live="polite">
            {feedback.text}
          </p>
        )}

        <p className={styles.note}>
          <Translate
            id="progressPage.merge"
            description="Explica que importar não apaga nada">
            A importação é somatória: documentos já marcados continuam marcados, e os do
            arquivo são acrescentados.
          </Translate>
        </p>
      </main>
    </Layout>
  );
}
