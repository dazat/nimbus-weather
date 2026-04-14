var CACHE='tripweather-v1';
var ASSETS=['./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}));
  self.skipWaiting();
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }));
  self.clients.claim();
});

self.addEventListener('fetch',function(e){
  var url=e.request.url;
  // Always fetch API calls live — never cache them
  if(url.includes('openweathermap.org')||url.includes('open-meteo.com')){
    e.respondWith(fetch(e.request).catch(function(){
      return new Response(JSON.stringify({error:'Offline — no weather data available'}),{headers:{'Content-Type':'application/json'}});
    }));
    return;
  }
  // Cache-first for app shell
  e.respondWith(caches.match(e.request).then(function(cached){
    return cached||fetch(e.request).then(function(resp){
      return caches.open(CACHE).then(function(c){c.put(e.request,resp.clone());return resp;});
    });
  }));
});
