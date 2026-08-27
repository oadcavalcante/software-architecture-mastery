/**
 * Progresso de leitura — armazenamento e notificação.
 *
 * Camada única de acesso ao estado de "documento lido", conforme SPEC.md §10.1.
 * Os componentes nunca tocam `localStorage` diretamente: toda a superfície de
 * troca por um backend está aqui (ADR-R007).
 *
 * Três restrições moldam este arquivo:
 *
 * 1. O Docusaurus pré-renderiza no build, onde não existe `window`. Toda função
 *    precisa devolver algo sensato fora do navegador.
 * 2. Navegação privada e bloqueio de dados de site fazem o acesso *lançar*, não
 *    devolver vazio. Todo acesso é protegido.
 * 3. O valor guardado carrega versão de esquema, para que uma mudança futura de
 *    formato possa migrar em vez de descartar o progresso do leitor.
 */

const STORAGE_KEY = 'sam:reading-progress';
const SCHEMA_VERSION = 1;

/** Documentos lidos, por `id` do front matter — nunca por URL: o mesmo `id`
 *  vale nas duas locales, então o progresso atravessa a troca de idioma. */
type Payload = {
  version: number;
  read: Record<string, number>; // id → instante da marcação (epoch ms)
};

/**
 * Sempre um objeto novo. Os chamadores mutam o payload devolvido antes de
 * gravá-lo; devolver uma constante compartilhada faria o estado se acumular
 * nela — visível justamente quando o armazenamento falha e todo `readPayload`
 * cai no caminho de erro.
 */
const empty = (): Payload => ({version: SCHEMA_VERSION, read: {}});

const isBrowser = (): boolean => typeof window !== 'undefined';

function readPayload(): Payload {
  if (!isBrowser()) return empty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as unknown;
    return migrate(parsed);
  } catch {
    // Armazenamento indisponível ou conteúdo corrompido. O leitor vê tudo
    // desmarcado, que é degradação aceitável — nunca uma tela quebrada.
    return empty();
  }
}

/**
 * Traz um payload de qualquer versão conhecida para a atual.
 *
 * Hoje há uma versão só, então o trabalho é validar a forma. O ponto de
 * existir a função é que a versão 2 tenha onde ser tratada sem que o progresso
 * acumulado seja jogado fora.
 */
function migrate(parsed: unknown): Payload {
  if (!parsed || typeof parsed !== 'object') return empty();
  const p = parsed as Partial<Payload>;
  if (p.version !== SCHEMA_VERSION || !p.read || typeof p.read !== 'object') return empty();

  const read: Record<string, number> = {};
  for (const [id, at] of Object.entries(p.read)) {
    if (typeof id === 'string' && id && typeof at === 'number' && Number.isFinite(at)) {
      read[id] = at;
    }
  }
  return {version: SCHEMA_VERSION, read};
}

function writePayload(payload: Payload): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Cota estourada ou escrita bloqueada. A marcação não persiste; a interface
    // já foi atualizada em memória e o leitor não vê erro.
  }
}

/* ---------------------------------------------------------------- notificação */

/**
 * Componentes em pontos distintos da página — o rodapé do documento e o resumo
 * do índice — precisam reagir à mesma mudança. Um conjunto de ouvintes local
 * cobre isso; o evento `storage` cobre outras abas.
 */
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  if (isBrowser() && listeners.size === 1) {
    window.addEventListener('storage', onStorageEvent);
  }
  return () => {
    listeners.delete(listener);
    if (isBrowser() && listeners.size === 0) {
      window.removeEventListener('storage', onStorageEvent);
    }
  };
}

function onStorageEvent(event: StorageEvent): void {
  if (event.key === STORAGE_KEY || event.key === null) notify();
}

function notify(): void {
  for (const listener of listeners) listener();
}

/* -------------------------------------------------------------------- leitura */

export function isRead(id: string): boolean {
  return Boolean(readPayload().read[id]);
}

export function readIds(): ReadonlySet<string> {
  return new Set(Object.keys(readPayload().read));
}

/** Quantos dos `ids` estão marcados. Usado pelos resumos de seção. */
export function countRead(ids: readonly string[]): number {
  const read = readPayload().read;
  return ids.reduce((n, id) => n + (read[id] ? 1 : 0), 0);
}

/* --------------------------------------------------------------------- escrita */

export function setRead(id: string, value: boolean): void {
  const payload = readPayload();
  if (value) {
    if (payload.read[id]) return;
    payload.read[id] = Date.now();
  } else {
    if (!payload.read[id]) return;
    delete payload.read[id];
  }
  writePayload(payload);
  notify();
}

export function toggleRead(id: string): boolean {
  const next = !isRead(id);
  setRead(id, next);
  return next;
}

/** Marca ou desmarca vários de uma vez — usado pelo controle de seção. */
export function setManyRead(ids: readonly string[], value: boolean): void {
  const payload = readPayload();
  let changed = false;
  const now = Date.now();
  for (const id of ids) {
    if (value && !payload.read[id]) {
      payload.read[id] = now;
      changed = true;
    } else if (!value && payload.read[id]) {
      delete payload.read[id];
      changed = true;
    }
  }
  if (!changed) return;
  writePayload(payload);
  notify();
}

export function clearAll(): void {
  writePayload({version: SCHEMA_VERSION, read: {}});
  notify();
}

/* ------------------------------------------------------- exportar e importar */

/**
 * Sem backend, exportar é como o leitor leva o progresso para outra máquina —
 * e é também o caminho de migração quando a segunda fase existir (SPEC §10.1).
 */
export function exportProgress(): string {
  return JSON.stringify(readPayload(), null, 2);
}

/** Une o progresso importado ao existente; nada é apagado. Devolve quantos
 *  documentos foram acrescentados, ou `null` se o conteúdo for inválido. */
export function importProgress(raw: string): number | null {
  let incoming: Payload;
  try {
    incoming = migrate(JSON.parse(raw));
  } catch {
    return null;
  }
  const ids = Object.keys(incoming.read);
  if (ids.length === 0) return null;

  const current = readPayload();
  let added = 0;
  for (const [id, at] of Object.entries(incoming.read)) {
    if (!current.read[id]) {
      current.read[id] = at;
      added += 1;
    }
  }
  writePayload(current);
  notify();
  return added;
}
