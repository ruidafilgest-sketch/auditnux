/* =========================================================================
   AuditNux · Processamento mensal — PROCDB
   Substitui as bases de dados antigas (Realtime Database com a chave no código)
   pela base do AuditNux (Firestore, com login e regras por espaço).
   Os módulos antigos continuam a funcionar sem alterações de lógica:
   - pedidos REST (fetch …firebasedatabase.app/caminho.json) são intercetados;
   - o SDK modular (ref/onValue/set/update/remove/get) é servido por procdb-rtdb.mjs.
   Segurança:
   - só funciona aberto dentro do AuditNux (sessão autenticada);
   - campos "senha…" são guardados cifrados (AES-GCM) com a chave do cofre;
   - se uma leitura falhar, as gravações ficam bloqueadas até recarregar (evita gravar por cima com dados incompletos);
   - PDFs/Excel grandes ficam em blocos próprios (o Firestore limita 1 MB por documento).
   ========================================================================= */
(function(){
'use strict';
if(window.PROCDB) return;
const SENT='🔒 cofre bloqueado';
const CH=300000, BLOB_MIN=60000;
const DEPTH={interno:{dafilgest:2},decl:{anos:2}};
function findHost(){ const tryW=w=>{ try{ return w&&w.PROC_HOST&&w.PROC_HOST.ok()?w.PROC_HOST:null; }catch(e){ return null; } };
  let h=null; try{ h=tryW(window.top); }catch(e){} if(h) return h;
  try{ let w=window; for(let i=0;i<8&&w;i++){ h=tryW(w); if(h) return h; if(w.parent===w) break; w=w.parent; } }catch(e){}
  try{ let o=window.opener; for(let i=0;i<4&&o;i++){ h=tryW(o)||tryW(o.top); if(h) return h; o=o.opener; } }catch(e){}
  return null; }
let HOST=findHost();
const host=()=>{ if(!HOST) HOST=findHost(); return HOST; };
const dbFromUrl=u=>/declaracoes/.test(String(u))?'decl':/interno/.test(String(u))?'interno':'outro';
const segsOf=p=>String(p||'').split('/').filter(Boolean);
const depth=(db,s)=>((DEPTH[db]||{})[s[0]])||1;
const pidOf=(db,ps)=>db+'~'+ps.map(x=>encodeURIComponent(x)).join('~');
let safeMode=false, avisado=false;
const isObj=v=>v&&typeof v==='object';
const clone=v=>Array.isArray(v)?v.map(clone):isObj(v)?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)])):v; // partilha as strings (rápido mesmo com PDFs)
function at(t,s){ for(const k of s){ if(!isObj(t)) return null; t=t[k]; if(t===undefined) return null; } return t===undefined?null:t; }
function prune(v){ if(Array.isArray(v)){ let a=v.map(x=>x===undefined?null:x); while(a.length&&a[a.length-1]==null) a.pop(); return a.length?a:null; } if(isObj(v)) return Object.keys(v).length?v:null; return v; }
function setAt(t,s,val){ if(!s.length) return val==null?null:val; const k=s[0];
  let n; if(Array.isArray(t)&&/^\d+$/.test(k)) n=t.slice(); else if(Array.isArray(t)) n=Object.assign({},t); else n=isObj(t)?Object.assign({},t):{};
  const c=setAt(isObj(t)?t[k]:undefined,s.slice(1),val);
  if(c==null){ if(Array.isArray(n)) n[+k]=null; else delete n[k]; } else { if(Array.isArray(n)){ const i=+k; while(n.length<i) n.push(null); n[i]=c; } else n[k]=c; }
  return prune(n); }

/* ---------- partições em cache, com escuta de alterações ---------- */
const parts=new Map(), listeners=new Set();
function col(){ const h=host(); if(!h) throw Object.assign(new Error('Abra este módulo dentro do AuditNux (sessão iniciada).'),{code:'host'}); return h.col(); }
async function assemble(d,pid,t){ if(!d) return null; let j=d.j||''; const n=d.n||1; for(let k=1;k<n;k++){ const r=col().doc(pid+'#'+k); const s=t?await t.get(r):await r.get(); if(!s.exists) throw new Error('Bloco em falta: '+pid+'#'+k); j+=s.data().j||''; } return j?JSON.parse(j):null; }
function load(db,ps){ const pid=pidOf(db,ps); let e=parts.get(pid); if(e) return e.ready;
  e={pid,db,ps,stored:null,v:-1,res:null}; parts.set(pid,e);
  const ref=col().doc(pid);
  e.ready=(async()=>{ const s=await ref.get(); const d=s.exists?s.data():null; e.stored=await assemble(d,pid); e.v=d?d.v||0:0;
    if(typeof ref.onSnapshot==='function') e.unsub=ref.onSnapshot(async sn=>{ try{ const d2=sn.exists?sn.data():null; const v2=d2?d2.v||0:0; if(v2===e.v) return; e.stored=await assemble(d2,pid); e.v=v2; e.res=null; notify(db,ps); }catch(er){ console.error(er); } },er=>console.error(er));
    else e.ttl=Date.now(); return e; })().catch(er=>{ parts.delete(pid); safeMode=true; throw er; });
  return e.ready; }
async function refreshIfPolling(e){ if(e.unsub||!e.ttl||Date.now()-e.ttl<4000) return; e.ttl=Date.now(); const s=await col().doc(e.pid).get(); const d=s.exists?s.data():null; const v=d?d.v||0:0; if(v!==e.v){ e.stored=await assemble(d,e.pid); e.v=v; e.res=null; } }
let listCache={};
async function listParts(db){ const c=listCache[db]; if(c&&Date.now()-c.t<8000) return c.l; const q=await col().where('db','==',db).get(); const l=q.docs.map(d=>d.data()).filter(d=>d&&d.p!=null).map(d=>segsOf(d.p)); listCache[db]={t:Date.now(),l}; return l; }
async function getStored(db,s){ const d=depth(db,s);
  if(s.length>=d){ const e=await load(db,s.slice(0,d)); await refreshIfPolling(e); return {v:at(e.stored,s.slice(d)),es:[e]}; }
  const L=(await listParts(db)).filter(ps=>s.every((k,i)=>ps[i]===k)); let out=null; const es=[];
  for(const ps of L){ const e=await load(db,ps); await refreshIfPolling(e); es.push(e); if(e.stored!=null) out=setAt(out,ps.slice(s.length),e.stored); }
  return {v:out,es}; }

/* ---------- blobs (PDF/Excel) e senhas cifradas ---------- */
const blobMem=new Map();
let idb=null; const idbOpen=()=>idb||(idb=new Promise(ok=>{ try{ const r=indexedDB.open('auditnux_procblobs',1); r.onupgradeneeded=()=>r.result.createObjectStore('b'); r.onsuccess=()=>ok(r.result); r.onerror=()=>ok(null); }catch(e){ ok(null); } }));
async function idbGet(k){ const d=await idbOpen(); if(!d) return null; return new Promise(ok=>{ try{ const r=d.transaction('b').objectStore('b').get(k); r.onsuccess=()=>ok(r.result||null); r.onerror=()=>ok(null); }catch(e){ ok(null); } }); }
async function idbPut(k,v){ const d=await idbOpen(); if(!d) return; try{ d.transaction('b','readwrite').objectStore('b').put(v,k); }catch(e){} }
async function blobGet(id){ if(blobMem.has(id)) return blobMem.get(id); let v=await idbGet(id);
  if(v==null){ const s=await col().doc(id).get(); if(!s.exists) throw new Error('Ficheiro em falta: '+id); const d=s.data(); v=d.j||''; for(let k=1;k<(d.n||1);k++){ const x=await col().doc(id+'#'+k).get(); v+=x.data().j||''; } idbPut(id,v); }
  blobMem.set(id,v); return v; }
async function sha(s){ const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''); }
const blobKnown=new Set();
async function blobPut(s){ const id='blob~'+(await sha(s)).slice(0,40); if(blobKnown.has(id)) return id; const ex=await col().doc(id).get(); if(!ex.exists){ const n=Math.ceil(s.length/CH); for(let k=n-1;k>=0;k--) await col().doc(k?id+'#'+k:id).set(k?{j:s.slice(k*CH,(k+1)*CH)}:{j:s.slice(0,CH),n,len:s.length,blob:1}); } blobKnown.add(id); blobMem.set(id,s); return id; }
const isSenha=k=>/^senha/i.test(k);
async function resolve(v,k){ if(Array.isArray(v)) return Promise.all(v.map(x=>resolve(x)));
  if(isObj(v)){ if(v.__blob__) return blobGet(v.__blob__); if(v.__enc__!==undefined){ const h=host(); if(!h||h.locked()) return SENT; try{ return await h.dec(v.__enc__); }catch(e){ return SENT; } }
    const o={}; for(const [kk,x] of Object.entries(v)) o[kk]=await resolve(x,kk); return o; }
  return v; }
async function prepare(v,k){ if(v===undefined) return null; if(Array.isArray(v)){ const a=await Promise.all(v.map(x=>prepare(x))); return a.some(x=>x!=null)?a:null; }
  if(isObj(v)){ const o={}; for(const [kk,x] of Object.entries(v)){ const y=await prepare(x,kk); if(y!=null) o[kk]=y; } return Object.keys(o).length?o:null; } // como no Realtime Database: nulos e objetos vazios não se guardam
  if(typeof v==='string'&&k&&isSenha(k)&&v!==''){ if(v===SENT) return {__keep__:1}; const h=host(); if(!h||h.locked()) throw Object.assign(new Error('Desbloqueie o cofre no AuditNux para gravar senhas.'),{code:'cofre'}); return {__enc__:await h.enc(v)}; }
  if(typeof v==='string'&&v.length>=BLOB_MIN) return {__blob__:await blobPut(v),len:v.length};
  return v; }
function keepFix(nv,old){ if(isObj(nv)&&nv.__keep__) return isObj(old)&&old.__enc__!==undefined?old:null;
  if(Array.isArray(nv)) return nv.map((x,i)=>keepFix(x,Array.isArray(old)||isObj(old)?old[i]:undefined));
  if(isObj(nv)){ const o={}; for(const [k,x] of Object.entries(nv)){ const y=keepFix(x,isObj(old)?old[k]:undefined); if(y!=null) o[k]=y; } return o; }
  return nv; }

/* ---------- leitura / escrita ---------- */
async function read(db,s){ const {v}=await getStored(db,s); return v==null?null:clone(await resolve(v)); }
let pushLast=0; function pushId(){ const c='-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'; let n=Math.max(Date.now(),pushLast+1); pushLast=n; let id=''; for(let i=0;i<8;i++){ id=c[n%64]+id; n=Math.floor(n/64); } for(let i=0;i<12;i++) id+=c[Math.floor(Math.random()*64)]; return id; }
async function writePart(db,ps,rel,op,prep){ const pid=pidOf(db,ps), ref=col().doc(pid); const h=host(); const fs=h.fs();
  const run=async t=>{ const m=t?await t.get(ref):await ref.get(); const d=m.exists?m.data():null; const old=await assemble(d,pid,t);
    let tree=old;
    if(op==='set') tree=setAt(tree,rel,prep==null?null:keepFix(prep,at(old,rel)));
    else if(op==='update') for(const [k,x] of Object.entries(prep||{})){ const sub=rel.concat(segsOf(k)); tree=setAt(tree,sub,x==null?null:keepFix(x,at(old,sub))); }
    else if(op==='remove') tree=setAt(tree,rel,null);
    const json=tree==null?'':JSON.stringify(tree); const n=Math.max(1,Math.ceil(json.length/CH)); const on=d?d.n||1:0; const v=(d?d.v||0:0)+1;
    const W=(r,x)=>t?t.set(r,x):r.set(x), D=r=>t?t.delete(r):r.delete();
    if(tree==null){ if(d){ await D(ref); for(let k=1;k<on;k++) await D(col().doc(pid+'#'+k)); } }
    else { await W(ref,{db,p:ps.join('/'),v,n,j:json.slice(0,CH),em:new Date().toISOString(),por:h.user()}); for(let k=1;k<n;k++) await W(col().doc(pid+'#'+k),{j:json.slice(k*CH,(k+1)*CH),pid}); for(let k=n;k<on;k++) await D(col().doc(pid+'#'+k)); }
    return {tree,v:tree==null?0:v}; };
  const r=typeof fs.runTransaction==='function'?await fs.runTransaction(t=>run(t)):await run(null);
  const e=parts.get(pid); if(e){ e.stored=r.tree; e.v=r.v; e.res=null; } delete listCache[db]; notify(db,ps); }
async function write(db,s,op,val){ if(safeMode) throw Object.assign(new Error('Gravação bloqueada: houve uma falha de leitura. Recarregue a página antes de continuar.'),{code:'safe'});
  if(!host()) throw Object.assign(new Error('Abra este módulo dentro do AuditNux.'),{code:'host'});
  let key=null; if(op==='push'){ key=pushId(); s=s.concat(key); op='set'; }
  const d=depth(db,s);
  if(s.length>=d){ const prep=op==='remove'?null:await prepare(val); await load(db,s.slice(0,d)); await writePart(db,s.slice(0,d),s.slice(d),op,prep); return key; }
  // acima do nível de partição: dividir
  if(op==='update'){ for(const [k,x] of Object.entries(val||{})) await write(db,s.concat(segsOf(k)),'set',x); return key; }
  const L=(await listParts(db)).filter(ps=>s.every((k,i)=>ps[i]===k));
  if(op==='remove'||val==null){ for(const ps of L) await write(db,ps,'remove'); return key; }
  for(const [k,x] of Object.entries(val)) await write(db,s.concat(k),'set',x);
  for(const ps of L){ if(!(ps[s.length] in val)) await write(db,ps,'remove'); }
  return key; }

/* ---------- avisos às páginas (onValue / polling) ---------- */
function notify(db,ps){ for(const l of listeners){ if(l.db!==db) continue; const a=l.s, b=ps; const n=Math.min(a.length,b.length); let ov=true; for(let i=0;i<n;i++) if(a[i]!==b[i]){ ov=false; break; } if(!ov) continue;
  clearTimeout(l.tm); l.tm=setTimeout(async()=>{ try{ l.cb(await read(db,l.s)); }catch(e){ l.err&&l.err(e); } },60); } }
function on(db,s,cb,err){ const l={db,s,cb,err}; listeners.add(l); read(db,s).then(v=>{ if(listeners.has(l)) cb(v); }).catch(e=>{ console.error(e); err&&err(e); }); return ()=>listeners.delete(l); }

/* ---------- intercetar os pedidos REST antigos ---------- */
const _fetch=window.fetch.bind(window);
const resp=(o,st)=>new Response(JSON.stringify(o===undefined?null:o),{status:st||200,headers:{'Content-Type':'application/json'}});
async function rest(url,init){ const u=new URL(url); const db=dbFromUrl(u.hostname); const s=segsOf(u.pathname.replace(/\.json$/,'')).map(x=>{ try{ return decodeURIComponent(x); }catch(e){ return x; } });
  const m=String((init&&init.method)||'GET').toUpperCase(); let body; try{ body=init&&init.body!=null?JSON.parse(init.body):undefined; }catch(e){ return resp({error:'JSON inválido'},400); }
  try{
    if(m==='GET'){ let v=await read(db,s); if(u.searchParams.get('shallow')==='true'&&isObj(v)) v=Object.fromEntries(Object.keys(v).map(k=>[k,true])); return resp(v); }
    if(m==='PUT'){ await write(db,s,'set',body); return resp(body); }
    if(m==='PATCH'){ await write(db,s,'update',body); return resp(body); }
    if(m==='DELETE'){ await write(db,s,'remove'); return resp(null); }
    if(m==='POST'){ const k=await write(db,s,'push',body); return resp({name:k}); }
    return resp({error:'método'},405);
  }catch(e){ console.error('[PROCDB]',e); if(m==='GET'){ safeMode=true; } aviso(e); return resp({error:e.message},e.code==='cofre'?403:e.code==='host'?401:500); } }
function aviso(e){ if(avisado&&e.code!=='cofre') return; avisado=true; try{ const h=host(); if(h&&h.toast) h.toast(e.message); else if(e.code!=='host') alert(e.message); }catch(x){} }
window.fetch=function(input,init){ const url=typeof input==='string'?input:(input&&input.url)||''; if(/firebasedatabase\.app|firebaseio\.com/.test(url)) return rest(url,init||{}); return _fetch(input,init); };

window.PROCDB={SENT,ligado:()=>!!host(),role:()=>{ const h=host(); return h?h.role():null; },recOk:()=>{ const h=host(); return !!(h&&h.recOk&&h.recOk()); },user:()=>{ const h=host(); return h?h.user():''; },dbFromUrl,segs:segsOf,read,write,on,
  _parts:parts,_reset:()=>{ for(const e of parts.values()) e.unsub&&e.unsub(); parts.clear(); listCache={}; safeMode=false; avisado=false; },_prepare:prepare,_resolve:resolve,_pidOf:pidOf,_depth:depth};

/* fora do AuditNux: aviso claro em vez de um ecrã vazio */
document.addEventListener('DOMContentLoaded',()=>{ if(host()) return; const d=document.createElement('div');
  d.setAttribute('style','position:fixed;inset:0;z-index:99999;background:#0B1F3A;color:#fff;display:flex;align-items:center;justify-content:center;font-family:Inter,Arial,sans-serif;text-align:center;padding:24px');
  d.innerHTML='<div><div style="font-size:40px">🔒</div><h2 style="margin:10px 0">Abra este módulo dentro do AuditNux</h2><p style="opacity:.8;max-width:520px">Por segurança, os dados do Processamento mensal só ficam acessíveis com a sessão do AuditNux iniciada.</p><a href="../index.html" style="display:inline-block;margin-top:14px;background:#B8892B;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700">Abrir o AuditNux</a></div>';
  document.body.appendChild(d); });
})();
