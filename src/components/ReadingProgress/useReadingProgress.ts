/**
 * Hooks de progresso de leitura.
 *
 * `useSyncExternalStore` é a ferramenta certa aqui: ela tem um argumento
 * separado para o valor no servidor, o que resolve o problema de renderização
 * estática sem `useEffect` nem estado duplicado. Na pré-renderização o valor é
 * sempre "não lido"; na hidratação o React troca pelo valor real do
 * `localStorage`, sem descompasso entre o HTML gerado e o cliente.
 */

import {useCallback, useSyncExternalStore} from 'react';
import {countRead, isRead, readIds, subscribe} from '@site/src/lib/readingProgress';

export function useIsRead(id: string): boolean {
  return useSyncExternalStore(
    subscribe,
    useCallback(() => isRead(id), [id]),
    () => false, // valor durante a pré-renderização
  );
}

export function useReadCount(ids: readonly string[]): number {
  // `ids` costuma ser um literal recriado a cada render; a chave estável evita
  // reassinar o store a cada ciclo.
  const key = ids.join(' ');
  return useSyncExternalStore(
    subscribe,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(() => countRead(ids), [key]),
    () => 0,
  );
}

/**
 * Total de documentos marcados, sem recorte de seção.
 *
 * O instantâneo devolve `.size` — um número — e não o conjunto: `readIds()`
 * cria um `Set` novo a cada chamada, e devolvê-lo faria `useSyncExternalStore`
 * ver uma identidade diferente a cada verificação e renderizar em laço.
 */
export function useTotalRead(): number {
  return useSyncExternalStore(
    subscribe,
    () => readIds().size,
    () => 0,
  );
}
