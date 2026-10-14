#!/usr/bin/env node
/**
 * Genera sjr-quartiles.json, el archivo con el cuartil más reciente de SCImago por revista.
 *
 * Uso (una vez al año, cuando SCImago publica la nueva edición):
 *   1. Entra a https://www.scimagojr.com/journalrank.php, elige el año y pulsa «Download data» (archivo .csv).
 *   2. Ejecuta:  node scripts/build-sjr.js ruta/al/scimagojr-2025.csv 2025
 *   3. Sube sjr-quartiles.json junto con index.html.
 *
 * El script no descarga nada: SCImago bloquea las descargas automáticas, así que el CSV se baja a mano.
 * Atribución: datos de SCImago Journal & Country Rank (https://www.scimagojr.com/).
 */
const fs = require('fs');
const path = require('path');

const [, , csvPath, yearArg, outArg] = process.argv;
if (!csvPath || !yearArg) { console.error('Uso: node scripts/build-sjr.js <archivo.csv> <año> [salida.json]'); process.exit(1); }

// Misma normalización que normJournal() en index.html: cualquier cambio debe hacerse en los dos lados.
const normJournal = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/^the /, '');

// CSV de SCImago: campos separados por «;» y, a veces, entre comillas dobles.
function parseCsv(text, sep = ';') {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.length > 1 || row[0] !== '') rows.push(row); row = []; }
    else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

const rows = parseCsv(fs.readFileSync(csvPath, 'utf8').replace(/^﻿/, ''));
const head = rows.shift().map(h => h.trim().toLowerCase());
const iTitle = head.indexOf('title'), iQ = head.findIndex(h => h === 'sjr best quartile'), iType = head.indexOf('type');
if (iTitle < 0 || iQ < 0) { console.error('No se encontraron las columnas «Title» y «SJR Best Quartile». Columnas leídas:', head.join(', ')); process.exit(1); }

const q = {}, ambiguos = new Set(); let total = 0, sinCuartil = 0;
for (const r of rows) {
  if (iType >= 0 && r[iType] && r[iType].trim().toLowerCase() !== 'journal') continue;     // solo revistas (no libros ni actas)
  total++;
  const m = /^Q([1-4])$/.exec((r[iQ] || '').trim());
  if (!m) { sinCuartil++; continue; }
  const key = normJournal(r[iTitle]); if (!key) continue;
  const n = Number(m[1]);
  if (q[key] && q[key] !== n) ambiguos.add(key);                                          // mismo nombre con cuartiles distintos: no se adivina
  if (!q[key] || n < q[key]) q[key] = n;
}

ambiguos.forEach(k => delete q[k]);
const out = outArg || path.join(__dirname, '..', 'sjr-quartiles.json');
fs.writeFileSync(out, JSON.stringify({ year: Number(yearArg), source: 'SCImago Journal & Country Rank', q }));
console.log(`Revistas leídas: ${total} · con cuartil: ${Object.keys(q).length} · sin cuartil: ${sinCuartil} · nombres ambiguos excluidos: ${ambiguos.size}`);
console.log(`Escrito ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
