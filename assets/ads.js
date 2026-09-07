(() => {
  const cfg = window.CREATORRANK_ADS;
  if (!cfg?.client) return;
  document.querySelectorAll('[data-ad-slot]').forEach(holder => {
    const key = holder.dataset.adSlot;
    const slot = cfg.slots?.[key];
    if (!slot) {
      holder.classList.add('ad-awaiting-id');
      const small = holder.querySelector('small');
      if (small) small.textContent = 'Emplacement prêt · activation après validation AdSense.';
      return;
    }
    const format = holder.dataset.adFormat === 'leaderboard' ? 'auto' : 'auto';
    holder.innerHTML = '<span class="ad-label">PUBLICITÉ</span>';
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.dataset.adClient = cfg.client;
    ins.dataset.adSlot = slot;
    ins.dataset.adFormat = format;
    ins.dataset.fullWidthResponsive = 'true';
    holder.appendChild(ins);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); }
    catch (error) { console.warn('CreatorRank AdSense:', error); }
  });
})();
