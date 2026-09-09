window.CREATORRANK_SUPPORT = {
  // Exemple : "https://ko-fi.com/toncompte" ou "https://paypal.me/toncompte"
  directUrl: "https://ko-fi.com/sourcestudio"
};

(() => {
  const button = document.querySelector('#directSupportButton');
  const note = document.querySelector('#directSupportNote');
  const url = window.CREATORRANK_SUPPORT?.directUrl?.trim();
  if (!button || !url) return;
  button.href = url;
  button.target = "_blank";
  button.rel = "noopener noreferrer";
  button.removeAttribute('aria-disabled');
  button.classList.remove('support-disabled');
  button.textContent = "Soutenir directement";
  if (note) note.textContent = "Le paiement est géré par la plateforme de soutien sélectionnée.";
})();
