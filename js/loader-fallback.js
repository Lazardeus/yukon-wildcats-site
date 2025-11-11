// Loader fallback: if main script bundle fails to remove loader, ensure it disappears
(function(){
  function removeLoader(skip){
    var l=document.getElementById('page-loader');
    if(!l) return;
    if(skip){ l.classList.add('skip-loaded'); }
    else { l.classList.add('loaded'); }
    setTimeout(function(){
      if(!l) return;
      try { l.remove(); } catch(e){ l.style.display='none'; }
    }, skip?300:1200);
  }
  // Safety timeout 7s
  window.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      if(typeof window.__pageLoaderFinalize === 'function') return; // main script took over
      removeLoader(false);
    }, 7000);
  });
  // Expose minimal global for emergency manual skip if needed
  window.__YW_LOADER_FALLBACK_REMOVE = removeLoader;
})();
