#!/usr/bin/env node
/**
 * Relatório de paridade pt-BR ↔ traduções (SPEC.md §5.4).
 *
 * Estado derivado, nunca declarado à mão:
 *   ausente                                  → ⬜ não traduzido
 *   translated_from_version < content_version → 🟨 defasado
 *   translated_from_version = content_version → 🟩 em dia
 *   translated_from_version > content_version → ❌ erro de integridade
 *
 * Também avisa quando um canônico mudou num PR sem incremento de content_version.
 */

import {execSync} from 'node:child_process';
import {writeFileSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {loadCanonical, loadTranslations, translationLocales, Report, ROOT} from './lib/docs.mjs';

export const MARKERS = {missing: '⬜', outdated: '🟨', current: '🟩', invalid: '❌'};

export function buildParity() {
  const canonical = loadCanonical();
  const locales = translationLocales();
  const rows = [];

  for (const doc of canonical.sort((a, b) => a.docPath.localeCompare(b.docPath))) {
    const row = {docPath: doc.docPath, title: doc.frontmatter.title, states: {}};
    for (const locale of locales) {
      const translated = loadTranslations(locale).find((t) => t.docPath === doc.docPath);
      if (!translated) {
        row.states[locale] = {state: 'missing'};
        continue;
      }
      const from = translated.frontmatter.translated_from_version;
      const to = doc.frontmatter.content_version;
      const state =
        !Number.isInteger(from) || !Number.isInteger(to) ? 'invalid'
        : from > to ? 'invalid'
        : from < to ? 'outdated'
        : 'current';
      row.states[locale] = {state, from, to, repoPath: translated.repoPath};
    }
    rows.push(row);
  }

  return {rows, locales, canonicalCount: canonical.length};
}

function checkVersionBumps(report) {
  const base = process.env.BASE_REF ?? 'origin/main';
  let changed;
  try {
    execSync(`git rev-parse --verify ${base}`, {cwd: ROOT, stdio: 'ignore'});
    changed = execSync(`git diff --name-only ${base}...HEAD -- docs/`, {cwd: ROOT, encoding: 'utf8'})
      .split('\n').filter(Boolean);
  } catch {
    // Sem base de comparação (repositório novo, clone raso, execução local).
    // A verificação é um aviso, então ausência de base não é falha.
    return 0;
  }

  let flagged = 0;
  for (const file of changed) {
    if (!/\.mdx?$/.test(file)) continue;
    let oldVersion = null;
    try {
      const old = execSync(`git show ${base}:${file}`, {cwd: ROOT, encoding: 'utf8'});
      oldVersion = /^content_version:\s*(\d+)\s*$/m.exec(old)?.[1] ?? null;
    } catch {
      continue; // arquivo novo
    }
    const now = execSync(`git show HEAD:${file}`, {cwd: ROOT, encoding: 'utf8'});
    const newVersion = /^content_version:\s*(\d+)\s*$/m.exec(now)?.[1] ?? null;
    if (oldVersion !== null && oldVersion === newVersion) {
      report.warn(file, `alterado sem incrementar content_version (segue em ${newVersion}) — se a mudança foi substantiva, incremente`);
      flagged += 1;
    }
  }
  return flagged;
}

function main() {
  const report = new Report('parity');
  const {rows, locales, canonicalCount} = buildParity();

  for (const row of rows) {
    for (const [locale, info] of Object.entries(row.states)) {
      if (info.state === 'invalid') {
        report.error(
          info.repoPath ?? row.docPath,
          `translated_from_version (${info.from}) inconsistente com content_version (${info.to}) da locale canônica`,
        );
      }
    }
  }

  checkVersionBumps(report);

  // Traduções órfãs: existem sem canônico correspondente.
  const canonicalPaths = new Set(rows.map((r) => r.docPath));
  for (const locale of locales) {
    for (const t of loadTranslations(locale)) {
      if (!canonicalPaths.has(t.docPath)) {
        report.error(t.repoPath, 'tradução sem documento canônico correspondente em docs/');
      }
    }
  }

  const summary = locales.map((locale) => {
    const counts = {missing: 0, outdated: 0, current: 0, invalid: 0};
    for (const row of rows) counts[row.states[locale].state] += 1;
    return `${locale}: ${MARKERS.current}${counts.current} ${MARKERS.outdated}${counts.outdated} ${MARKERS.missing}${counts.missing}`;
  }).join(' | ');

  mkdirSync(join(ROOT, '.reports'), {recursive: true});
  writeFileSync(join(ROOT, '.reports', 'parity.json'), JSON.stringify({rows, locales}, null, 2));

  process.exit(report.finish(`${canonicalCount} canônico(s) — ${summary}`));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
