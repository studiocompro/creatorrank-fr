(() => {
  const KEY='creatorrank-consent-v1';
  const defaults={necessary:true,analytics:false,ads:false,updatedAt:null};
  const read=()=>{try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...defaults}}};
  const write=(v)=>{const next={...defaults,...v,necessary:true,updatedAt:new Date().toISOString()};localStorage.setItem(KEY,JSON.stringify(next));window.CreatorRankConsent=next;apply(next);return next};
  const apply=(consent)=>{
    document.documentElement.dataset.consentAds=consent.ads?'yes':'no';
    document.querySelectorAll('[data-ad-slot]').forEach(slot=>{
      slot.classList.toggle('ad-consented',!!consent.ads);
      const small=slot.querySelector('small');
      if(small && !consent.ads) small.textContent='Aucun traceur publicitaire chargé sans votre consentement.';
      if(small && consent.ads) small.textContent='Consentement publicité actif · régie à connecter avant publication.';
    });
    // Les scripts réels de régie/analytics devront être injectés ici uniquement lorsque consent.ads/analytics est true.
  };
  const existing=localStorage.getItem(KEY);
  const consent=read(); window.CreatorRankConsent=consent;
  const banner=document.querySelector('#consentBanner');
  const modal=document.querySelector('#consentModal');
  const syncModal=()=>{if(!modal)return;const c=read();const a=modal.querySelector('#consentAnalytics'),ad=modal.querySelector('#consentAds');if(a)a.checked=!!c.analytics;if(ad)ad.checked=!!c.ads;};
  if(!existing && banner) banner.hidden=false;
  document.querySelectorAll('[data-consent-all]').forEach(b=>b.addEventListener('click',()=>{write({analytics:true,ads:true});if(banner)banner.hidden=true}));
  document.querySelectorAll('[data-consent-reject]').forEach(b=>b.addEventListener('click',()=>{write({analytics:false,ads:false});if(banner)banner.hidden=true}));
  document.querySelectorAll('[data-open-consent]').forEach(b=>b.addEventListener('click',()=>{syncModal();modal?.showModal()}));
  document.querySelectorAll('[data-save-consent]').forEach(b=>b.addEventListener('click',()=>{write({analytics:!!modal?.querySelector('#consentAnalytics')?.checked,ads:!!modal?.querySelector('#consentAds')?.checked});if(banner)banner.hidden=true;modal?.close()}));
  apply(consent);

  const bait=document.createElement('div');bait.className='adsbox ad-banner ad-placement ad-unit';bait.setAttribute('aria-hidden','true');bait.style.cssText='position:absolute;left:-10000px;top:-10000px;width:1px;height:1px;pointer-events:none;';document.body.appendChild(bait);
  setTimeout(()=>{
    const blocked=bait.offsetHeight===0||bait.offsetWidth===0||getComputedStyle(bait).display==='none'||getComputedStyle(bait).visibility==='hidden';
    bait.remove();
    const notice=document.querySelector('#adblockNotice'); if(blocked && notice) notice.hidden=false;
  },500);
  document.querySelectorAll('[data-dismiss-adblock]').forEach(b=>b.addEventListener('click',()=>{const n=document.querySelector('#adblockNotice');if(n)n.hidden=true}));
})();
