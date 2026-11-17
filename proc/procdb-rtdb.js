/* AuditNux · Processamento mensal — o mesmo "contrato" do SDK firebase-database (ref, onValue, get, set, update, remove),
   servido pelo PROCDB (base do AuditNux). Usado pelo módulo Declarações Fiscais sem mudar a lógica. */
const P = () => { if (!window.PROCDB) throw new Error('PROCDB não carregado'); return window.PROCDB; };
export function initializeApp(cfg) { return { cfg: cfg || {} }; }
export function getDatabase(app) { return { db: P().dbFromUrl((app && app.cfg && app.cfg.databaseURL) || '') }; }
export function ref(db, path) { const s = P().segs(path || ''); return { db: db.db, s, key: s.length ? s[s.length - 1] : null }; }
const snap = (r, v) => ({ val: () => (v == null ? null : v), exists: () => v != null, key: r.key });
export function onValue(r, cb, err) { return P().on(r.db, r.s, v => cb(snap(r, v)), err); }
export async function get(r) { return snap(r, await P().read(r.db, r.s)); }
export async function set(r, v) { await P().write(r.db, r.s, 'set', v); }
export async function update(r, v) { await P().write(r.db, r.s, 'update', v); }
export async function remove(r) { await P().write(r.db, r.s, 'remove'); }
