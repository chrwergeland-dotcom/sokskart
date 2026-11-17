const C="nesevis-f8a0fc507a",FILES=["./","index.html","app.js","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","fonts/schibsted-grotesk-latin-400-normal.woff2","fonts/schibsted-grotesk-latin-500-normal.woff2","fonts/schibsted-grotesk-latin-600-normal.woff2","fonts/schibsted-grotesk-latin-700-normal.woff2","fonts/schibsted-grotesk-latin-900-italic.woff2"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==C&&n.indexOf("nesevis-")===0).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
  const u=new URL(r.url),base=new URL("./",location.href).href,rel=u.href.split(/[?#]/)[0].slice(base.length)||"./";
  if(u.href.indexOf(base)!==0||FILES.indexOf(rel)<0)return;
  /* Bare appens egne filer mellomlagres, og alltid under adressen uten spørrestreng */
  e.respondWith(caches.open(C).then(c=>c.match(rel==="./"?base:base+rel).then(hit=>{const net=fetch(r).then(res=>{if(res&&res.ok&&res.type==="basic"&&!u.search)c.put(rel==="./"?base:base+rel,res.clone());return res}).catch(()=>hit||Response.error());return hit||net})))});
