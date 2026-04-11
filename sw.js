const CACHE = 'financas-pro-v9';
const ASSETS = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if(url.includes('googleapis.com')||url.includes('gstatic.com')||
     url.includes('firebaseio.com')||url.includes('firebaseapp.com')){
    e.respondWith(fetch(e.request).catch(()=>new Response('')));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached)return cached;
      return fetch(e.request).then(r=>{
        if(r&&r.status===200){
          const clone=r.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return r;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
