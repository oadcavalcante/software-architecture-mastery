/**
 * Atalhos de teclado para a busca.
 *
 * O plugin de busca já registra um atalho, configurado como `mod+k` — que ele
 * resolve para ⌘ no macOS e Ctrl no resto. Na prática o ⌘K não estava
 * abrindo a busca no Mac, e só o Ctrl+K funcionava.
 *
 * Este módulo não substitui o atalho do plugin: ele acrescenta um segundo
 * ouvinte que aceita **as duas** teclas modificadoras, em qualquer sistema.
 * Registrar o mesmo atalho duas vezes é inofensivo — os dois focam o mesmo
 * campo —, e a redundância cobre o caso em que a detecção de plataforma do
 * plugin discorda da máquina do leitor.
 *
 * Acrescenta também `/`, convenção de sites de documentação, ativa só quando o
 * foco não está num campo de texto — senão digitar uma barra no formulário de
 * busca reabriria a busca.
 */

import type {ClientModule} from '@docusaurus/types';

const SELETOR = '.navbar__search-input';

/** Campo de texto, área de texto ou elemento editável recebendo a tecla. */
function digitandoEmCampo(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof HTMLElement)) return false;
  const tag = alvo.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    alvo.isContentEditable
  );
}

function focarBusca(evento: KeyboardEvent): void {
  const campo = document.querySelector<HTMLInputElement>(SELETOR);
  if (!campo) return;
  evento.preventDefault();
  campo.focus();
}

const modulo: ClientModule = {
  onRouteDidUpdate() {
    // Registro único: o ouvinte é no documento e sobrevive à navegação.
    if (window.__samSearchShortcut) return;
    window.__samSearchShortcut = true;

    document.addEventListener('keydown', (evento: KeyboardEvent) => {
      if (evento.defaultPrevented) return;

      const k = evento.key?.toLowerCase();

      if (k === 'k' && (evento.metaKey || evento.ctrlKey) && !evento.altKey) {
        focarBusca(evento);
        return;
      }

      if (
        k === '/' &&
        !evento.metaKey &&
        !evento.ctrlKey &&
        !evento.altKey &&
        !digitandoEmCampo(evento.target)
      ) {
        focarBusca(evento);
      }
    });
  },
};

declare global {
  interface Window {
    __samSearchShortcut?: boolean;
  }
}

export default modulo;
