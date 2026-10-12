/**
 * Calculadora RENACYT · backend en Google Apps Script
 *
 * Recibe aportes ANÓNIMOS desde la calculadora y devuelve solo métricas agregadas.
 * Las filas individuales viven únicamente en tu hoja de cálculo (privada).
 * Instalación paso a paso: ver INSTALACION.md
 */

const SHEET_NAME = 'Registros';
const HEADERS = ['fecha_iso', 'client_id', 'nivel', 'total', 'formacion', 'produccion', 'asesoria',
                 'grado', 'indice_h', 'estudiante', 'activo', 'area', 'institucion', 'conteos_json', 'version',
                 'origen_institucion', 'pais_institucion'];

const LEVELS = ['Sin nivel', 'Nivel VII', 'Nivel VI', 'Nivel V', 'Nivel IV', 'Nivel III', 'Nivel II', 'Nivel I',
                'Investigador Distinguido'];
const DEGREES = ['doctor', 'master', 'title', 'bachelor', 'enrolled', 'none'];
const AREAS = ['', 'ing', 'nat', 'soc'];   // en desuso: la página ya no envía área; se acepta vacío por compatibilidad
const ORIGINS = ['', 'nacional', 'extranjera'];
// Países en español (sin Perú, que es la opción «nacional»). Misma lista que la página.
const COUNTRIES = [
  "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda", "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bangladés", "Barbados", "Baréin", "Bélgica", "Belice", "Benín", "Bielorrusia", "Birmania (Myanmar)", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre", "Colombia", "Comoras", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Esuatini", "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Granada", "Grecia", "Guatemala", "Guinea", "Guinea Ecuatorial", "Guinea-Bisáu", "Guyana", "Haití", "Honduras", "Hong Kong", "Hungría", "India", "Indonesia", "Irak", "Irán", "Irlanda", "Islandia", "Islas Marshall", "Islas Salomón", "Israel", "Italia", "Jamaica", "Japón", "Jordania", "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kosovo", "Kuwait", "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo", "Macedonia del Norte", "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí", "Malta", "Marruecos", "Mauricio", "Mauritania", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montenegro", "Mozambique", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Noruega", "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palaos", "Palestina", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Polonia", "Portugal", "Puerto Rico", "Reino Unido", "República Centroafricana", "República Checa", "República del Congo", "República Democrática del Congo", "República Dominicana", "Ruanda", "Rumania", "Rusia", "Samoa", "San Cristóbal y Nieves", "San Marino", "San Vicente y las Granadinas", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia", "Suiza", "Surinam", "Tailandia", "Taiwán", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Vaticano", "Venezuela", "Vietnam", "Yemen", "Yibuti", "Zambia", "Zimbabue"
];
const INST_MAX = 100;

const MIN_GROUP = 5;               // no se publica ningún grupo con menos personas que esto
const DEDUPE_MS = 10 * 60 * 1000;  // mismo navegador + mismo puntaje en 10 min = duplicado
const MAX_PER_DAY = 5;             // aportes por navegador por día
const MAX_ROWS = 50000;
const HIST_BINS = 31;              // tramos de 10 pts: 0-9, 10-19, ... 300+
const CACHE_SECONDS = 300;

/* ---------------- Entradas HTTP ---------------- */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = JSON.parse(e.postData.contents);
    if (p.hp) return json_({ ok: true });                     // honeypot: bots
    if (p.action === 'delete') return json_(deleteByClient_(p.clientId));
    if (p.action === 'feedback') return json_(saveFeedback_(p));
    if (p.action !== 'submit') return json_({ ok: false, error: 'bad_action' });

    const rec = cleanRecord_(p);
    if (!rec) return json_({ ok: false, error: 'invalid' });

    const sh = getSheet_();
    const last = sh.getLastRow();
    if (last - 1 >= MAX_ROWS) return json_({ ok: false, error: 'full' });

    if (last >= 2) {
      const rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
      const nowMs = Date.now(), dayAgo = nowMs - 24 * 3600 * 1000;
      let today = 0;
      for (let i = rows.length - 1; i >= 0; i--) {
        if (String(rows[i][1]) !== rec.clientId) continue;
        const t = new Date(rows[i][0]).getTime();
        if (nowMs - t < DEDUPE_MS && Number(rows[i][3]) === rec.total) return json_({ ok: true, dedup: true });
        if (t > dayAgo) today++;
      }
      if (today >= MAX_PER_DAY) return json_({ ok: false, error: 'rate' });
    }

    sh.appendRow([new Date().toISOString(), rec.clientId, rec.level, rec.total, rec.formation, rec.production,
                  rec.advising, rec.degree, rec.h, rec.student, rec.active, rec.area, rec.institution,
                  rec.counts, rec.version, rec.origin, rec.country]);
    CacheService.getScriptCache().remove('stats');
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'bad_request' });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';
  if (action === 'cti') return ctiFetch_(e.parameter.id);
  if (action === 'stats') {
    const cache = CacheService.getScriptCache();
    const hit = cache.get('stats');
    if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
    const sh = getSheet_();
    const last = sh.getLastRow();
    const rows = last >= 2 ? sh.getRange(2, 1, last - 1, HEADERS.length).getValues() : [];
    const out = JSON.stringify(aggregate_(rows));
    cache.put('stats', out, CACHE_SECONDS);
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
  }
  return json_({ ok: true, service: 'calculadora-renacyt' });
}

/* ---------------- Lectura de una ficha pública de CTI Vitae ---------------- */
// El navegador no puede leer CTI Vitae directamente (la página no permite CORS), así que este script
// hace la consulta puntual y devuelve el HTML de la ficha. NO guarda nada y SOLO acepta un id numérico:
// no es un proxy abierto. Es un servicio de consulta iniciada por la persona usuaria, no de recolección masiva.

const CTI_URL = 'https://ctivitae.concytec.gob.pe/appDirectorioCTI/VerDatosInvestigador.do?id_investigador=';
const CTI_MAX_PER_MIN = 20;       // tope global para no cargar el servidor del CONCYTEC

function ctiFetch_(id) {
  id = String(id == null ? '' : id);
  if (!/^\d{1,9}$/.test(id)) return json_({ ok: false, error: 'bad_id' });

  const cache = CacheService.getScriptCache();
  const key = 'cti_rate_' + Math.floor(Date.now() / 60000);
  const n = Number(cache.get(key) || 0);
  if (n >= CTI_MAX_PER_MIN) return json_({ ok: false, error: 'busy' });
  cache.put(key, String(n + 1), 90);

  try {
    const r = UrlFetchApp.fetch(CTI_URL + id, {
      muteHttpExceptions: true,
      followRedirects: false,                 // evita que una redirección nos lleve a otro dominio
      validateHttpsCertificates: true,
      headers: { 'Accept': 'text/html', 'User-Agent': 'CalculadoraRENACYT/1.0 (consulta puntual iniciada por la persona usuaria)' }
    });
    if (r.getResponseCode() !== 200) return json_({ ok: false, error: 'upstream_' + r.getResponseCode() });
    let html = r.getContentText('UTF-8');
    if (html.indexOf('titulo_fichas_dos') < 0) return json_({ ok: false, error: 'not_profile' });
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
               .replace(/<style[\s\S]*?<\/style>/gi, '')
               .replace(/<!--[\s\S]*?-->/g, '')
               .replace(/\s(src|href)="data:[^"]*"/gi, '');
    return json_({ ok: true, html: html });
  } catch (err) {
    return json_({ ok: false, error: 'fetch_failed' });
  }
}

/* ---------------- Utilidades ---------------- */

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet_(name, headers) {
  name = name || SHEET_NAME;
  headers = headers || HEADERS;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  } else if (sh.getLastColumn() < headers.length) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sh;
}

/* ---------------- Sugerencias de mejora ---------------- */
// Se guardan en la pestaña «Sugerencias» de tu hoja. El correo es opcional y solo se acepta con consentimiento.

const FB_SHEET = 'Sugerencias';
const FB_HEADERS = ['fecha_iso', 'client_id', 'tipo', 'mensaje', 'valoracion', 'correo', 'acepta_contacto', 'vista', 'version', 'estado'];
const FB_TYPES = ['error', 'mejora', 'idea', 'reglamento', 'otro'];
const FB_VIEWS = ['calc', 'cti', 'plan', 'hist', 'comm', 'feed', 'ref'];
const FB_MIN = 10, FB_MAX = 1500;
const FB_MAX_PER_DAY = 3;          // sugerencias por navegador al día
const FB_MAX_ROWS = 5000;

// Conserva saltos de línea (a diferencia de cleanText_) y neutraliza fórmulas.
function cleanMsg_(s, max) {
  s = String(s == null ? '' : s).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
        .replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function saveFeedback_(p) {
  if (!/^[a-z0-9]{12,40}$/.test(String(p.clientId))) return { ok: false, error: 'invalid' };
  if (FB_TYPES.indexOf(p.type) < 0) return { ok: false, error: 'invalid' };
  const msg = cleanMsg_(p.message, FB_MAX);
  if (msg.length < FB_MIN) return { ok: false, error: 'too_short' };

  let rating = '';
  if (p.rating !== '' && p.rating != null) {
    const r = num_(p.rating, 1, 5);
    if (r === null || Math.floor(r) !== r) return { ok: false, error: 'invalid' };
    rating = r;
  }
  let email = '', consent = false;
  const rawMail = String(p.email == null ? '' : p.email).trim();
  if (rawMail) {
    if (rawMail.length > 120 || !/^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/.test(rawMail)) return { ok: false, error: 'bad_email' };
    if (p.contactOk !== true) return { ok: false, error: 'no_consent' };       // sin consentimiento no se guarda el correo
    email = rawMail; consent = true;
  }
  const view = FB_VIEWS.indexOf(p.view) >= 0 ? p.view : '';

  const sh = getSheet_(FB_SHEET, FB_HEADERS);
  const last = sh.getLastRow();
  if (last - 1 >= FB_MAX_ROWS) return { ok: false, error: 'full' };
  if (last >= 2) {
    const rows = sh.getRange(2, 1, last - 1, FB_HEADERS.length).getValues();
    const dayAgo = Date.now() - 24 * 3600 * 1000;
    let today = 0;
    for (let i = rows.length - 1; i >= 0; i--) {
      if (String(rows[i][1]) !== String(p.clientId)) continue;
      if (String(rows[i][3]) === msg || String(rows[i][3]) === "'" + msg) return { ok: true, dedup: true };   // mismo texto: duplicado
      if (new Date(rows[i][0]).getTime() > dayAgo) today++;
    }
    if (today >= FB_MAX_PER_DAY) return { ok: false, error: 'rate' };
  }
  sh.appendRow([new Date().toISOString(), String(p.clientId), p.type, msg, rating, email, consent, view,
                num_(p.v, 0, 1000) || 1, 'nuevo']);
  return { ok: true };
}

function num_(v, min, max) {
  const n = Number(v);
  return (isFinite(n) && n >= min && n <= max) ? n : null;
}

// Evita que un texto escrito por un usuario se ejecute como fórmula en Sheets.
function cleanText_(s, max) {
  s = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function cleanRecord_(p) {
  if (!p || typeof p !== 'object') return null;
  if (!/^[a-z0-9]{12,40}$/.test(String(p.clientId))) return null;
  if (LEVELS.indexOf(p.level) < 0) return null;
  if (DEGREES.indexOf(p.degree) < 0) return null;
  const area = p.area == null ? '' : String(p.area);
  if (AREAS.indexOf(area) < 0) return null;
  const origin = p.instOrigin == null ? '' : String(p.instOrigin);
  if (ORIGINS.indexOf(origin) < 0) return null;
  let country = '';
  if (origin === 'extranjera') {                              // el país solo cuenta si la institución es extranjera y está en la lista
    const c = String(p.country == null ? '' : p.country).trim();
    country = COUNTRIES.indexOf(c) >= 0 ? c : '';
  }

  const total = num_(p.total, 0, 1000), formation = num_(p.formation, 0, 10),
        production = num_(p.production, 0, 2000), advising = num_(p.advising, 0, 10),
        h = num_(p.h, 0, 300);
  if ([total, formation, production, advising, h].some(function (x) { return x === null; })) return null;
  if (Math.abs(total - (formation + production + advising)) > 0.01) return null;   // coherencia interna

  let counts = {};
  if (p.counts && typeof p.counts === 'object') {
    Object.keys(p.counts).slice(0, 20).forEach(function (k) {
      const v = num_(p.counts[k], 0, 500);
      if (/^[a-z0-9_]{2,12}$/.test(k) && v !== null) counts[k] = v;
    });
  }
  return {
    clientId: String(p.clientId), level: p.level, total: total, formation: formation, production: production,
    advising: advising, degree: p.degree, h: Math.floor(h), student: p.student === true, active: p.active === true,
    area: area, institution: cleanText_(p.institution, INST_MAX), counts: JSON.stringify(counts).slice(0, 600),
    version: num_(p.v, 0, 1000) || 1, origin: origin, country: country
  };
}

function deleteByClient_(cid) {
  if (!/^[a-z0-9]{12,40}$/.test(String(cid))) return { ok: false, error: 'invalid' };
  let removed = removeRowsByClient_(getSheet_(), cid);
  const fb = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FB_SHEET);   // también sus sugerencias (pueden incluir correo)
  if (fb) removed += removeRowsByClient_(fb, cid);
  CacheService.getScriptCache().remove('stats');
  return { ok: true, removed: removed };
}

function removeRowsByClient_(sh, cid) {
  const last = sh.getLastRow();
  let removed = 0;
  if (last >= 2) {
    const ids = sh.getRange(2, 2, last - 1, 1).getValues();
    for (let i = ids.length - 1; i >= 0; i--) {
      if (String(ids[i][0]) === cid) { sh.deleteRow(i + 2); removed++; }
    }
  }
  return removed;
}

function normKey_(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
}

function mean_(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }
function round1_(x) { return Math.round(x * 10) / 10; }

/* ---------------- Métricas agregadas ---------------- */

function aggregate_(rows) {
  const recs = rows.map(function (r) {
    return {
      t: new Date(r[0]).getTime(), cid: String(r[1]), level: String(r[2]), total: Number(r[3]), deg: String(r[7]),
      active: r[10] === true || String(r[10]).toLowerCase() === 'true',
      inst: String(r[12] || ''), origin: String(r[15] || ''), country: String(r[16] || '')
    };
  }).filter(function (x) { return isFinite(x.t) && isFinite(x.total); });
  recs.sort(function (a, b) { return a.t - b.t; });

  const first = {}, last = {}, cnt = {};
  recs.forEach(function (x) {
    if (!first[x.cid]) first[x.cid] = x;
    last[x.cid] = x;
    cnt[x.cid] = (cnt[x.cid] || 0) + 1;
  });
  const cur = Object.keys(last).map(function (k) { return last[k]; });   // un registro por persona (el más reciente)
  const n = cur.length;
  const out = { ok: true, n: n, minGroup: MIN_GROUP, updated: new Date().toISOString() };
  if (n < MIN_GROUP) return out;                                          // muy pocos: no se detalla nada

  const totals = cur.map(function (x) { return x.total; }).sort(function (a, b) { return a - b; });
  out.avgTotal = round1_(mean_(totals));
  out.medianTotal = totals.length % 2 ? totals[(totals.length - 1) / 2]
                    : round1_((totals[totals.length / 2 - 1] + totals[totals.length / 2]) / 2);
  out.activePct = Math.round(100 * cur.filter(function (x) { return x.active; }).length / n);

  out.levels = {}; LEVELS.forEach(function (l) { out.levels[l] = 0; });
  out.degrees = {}; DEGREES.forEach(function (d) { out.degrees[d] = 0; });
  out.origins = { nacional: 0, extranjera: 0, none: 0 };
  const byCountry = {};
  out.hist = []; for (let i = 0; i < HIST_BINS; i++) out.hist.push(0);
  cur.forEach(function (x) {
    if (out.levels[x.level] !== undefined) out.levels[x.level]++;
    if (out.degrees[x.deg] !== undefined) out.degrees[x.deg]++;
    out.origins[x.origin === 'nacional' || x.origin === 'extranjera' ? x.origin : 'none']++;
    if (x.origin === 'extranjera' && x.country) byCountry[x.country] = (byCountry[x.country] || 0) + 1;
    out.hist[Math.min(HIST_BINS - 1, Math.floor(x.total / 10))]++;
  });

  // Países de las instituciones extranjeras: solo los que tienen al menos MIN_GROUP personas
  out.countries = Object.keys(byCountry).filter(function (c) { return byCountry[c] >= MIN_GROUP; })
    .map(function (c) { return { name: c, n: byCountry[c] }; }).sort(function (a, b) { return b.n - a.n; });

  // Instituciones: solo grupos con al menos MIN_GROUP personas
  const groups = {};
  cur.forEach(function (x) {
    if (!x.inst) return;
    const k = normKey_(x.inst);
    if (!k) return;
    (groups[k] = groups[k] || { names: {}, totals: [] });
    groups[k].names[x.inst] = (groups[k].names[x.inst] || 0) + 1;
    groups[k].totals.push(x.total);
  });
  out.institutions = Object.keys(groups).map(function (k) {
    const g = groups[k];
    const name = Object.keys(g.names).sort(function (a, b) { return g.names[b] - g.names[a]; })[0];
    return { name: name, n: g.totals.length, avgTotal: round1_(mean_(g.totals)) };
  }).filter(function (g) { return g.n >= MIN_GROUP; })
    .sort(function (a, b) { return b.n - a.n; }).slice(0, 15);

  // Personas nuevas por mes (últimos 12 meses)
  const byM = {};
  Object.keys(first).forEach(function (k) {
    const d = new Date(first[k].t);
    const key = d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2);
    byM[key] = (byM[key] || 0) + 1;
  });
  out.byMonth = Object.keys(byM).sort().slice(-12).map(function (k) { return { m: k, n: byM[k] }; });

  // Seguimiento: personas que aportaron 2 o más veces y cuánto avanzaron
  const rep = Object.keys(cnt).filter(function (k) { return cnt[k] >= 2; });
  out.repeaters = rep.length;
  out.avgGain = rep.length >= MIN_GROUP
    ? round1_(mean_(rep.map(function (k) { return last[k].total - first[k].total; }))) : null;
  return out;
}
