(() => {
  // Consentement : la CMP Google AdSense est la source de vérité.
  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];

  const openGooglePrivacy = () => {
    if (typeof window.googlefc.showRevocationMessage === 'function') {
      window.googlefc.showRevocationMessage();
      return;
    }
    window.googlefc.callbackQueue.push({
      CONSENT_API_READY: () => {
        if (typeof window.googlefc.showRevocationMessage === 'function') {
          window.googlefc.showRevocationMessage();
        }
      }
    });
  };

  // Désactive définitivement l'ancien bandeau maison pour éviter deux CMP concurrentes.
  const oldBanner = document.querySelector('#consentBanner');
  const oldModal = document.querySelector('#consentModal');
  if (oldBanner) oldBanner.hidden = true;
  if (oldModal?.open) oldModal.close();

  document.querySelectorAll('[data-open-consent]').forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openGooglePrivacy();
    });
  });

  // Détection légère d'un bloqueur : information uniquement, jamais de blocage du site.
  const bait=document.createElement('div');
  bait.className='adsbox ad-banner ad-placement ad-unit';
  bait.setAttribute('aria-hidden','true');
  bait.style.cssText='position:absolute;left:-10000px;top:-10000px;width:1px;height:1px;pointer-events:none;';
  document.body.appendChild(bait);
  setTimeout(()=>{
    const blocked=bait.offsetHeight===0||bait.offsetWidth===0||getComputedStyle(bait).display==='none'||getComputedStyle(bait).visibility==='hidden';
    bait.remove();
    const notice=document.querySelector('#adblockNotice');
    if(blocked && notice) notice.hidden=false;
  },500);
  document.querySelectorAll('[data-dismiss-adblock]').forEach(button=>button.addEventListener('click',()=>{
    const notice=document.querySelector('#adblockNotice');
    if(notice) notice.hidden=true;
  }));
})();
