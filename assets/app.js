const DB = window.CREATORRANK_DATA;
const sources = Object.fromEntries((DB.meta.sources||[]).map(s => [s.id, s]));
const youtube = (DB.youtube||[]).map(c => ({...c, platform:'youtube'}));
const twitch = (DB.twitch||[]).map(c => ({...c, platform:'twitch', creatorType:c.creatorType||'creator'}));
const kick = (DB.kick||[]).map(c => ({...c, platform:'kick', creatorType:c.creatorType||'creator'}));
const datasets = {youtube,twitch,kick};
const creators = [...youtube, ...twitch, ...kick];
const platformName = p => p==='youtube' ? 'YouTube' : p==='twitch' ? 'Twitch' : p==='kick' ? 'Kick' : p;

const rankingMeta = {
  subscribers:{dataset:'youtube',title:'YouTube · plus suivis',metric:'Abonnés',key:'subscribers',format:'compact',formula:'abonnés publics YouTube',hint:'Tri par nombre d’abonnés publics. Les valeurs YouTube peuvent être arrondies.',explain:'Popularité brute YouTube',text:'Mesure la taille publique de l’audience YouTube. Ce classement ne mesure ni la qualité, ni l’influence, ni la performance récente.'},
  views:{dataset:'youtube',title:'YouTube · vues cumulées',metric:'Vues totales',key:'totalViews',format:'compact',formula:'vues publiques cumulées de la chaîne',hint:'Tri par vues publiques cumulées de la chaîne.',explain:'Volume historique',text:'Une chaîne ancienne ou très productive peut être favorisée. Cette métrique est donc séparée du buzz et de la croissance.'},
  uploads:{dataset:'youtube',title:'YouTube · plus gros catalogues',metric:'Vidéos',key:'videoCount',format:'integer',formula:'nombre de vidéos publiques de la chaîne',hint:'Tri par nombre de vidéos publiques recensées.',explain:'Taille du catalogue',text:'Mesure le volume de vidéos publiques, pas la fréquence récente. Une future métrique séparera les publications des 30 derniers jours.'},
  growth:{dataset:'youtube',title:'YouTube · progression 30 jours',metric:'Croissance 30 j',key:'growth30dPct',format:'percent',formula:'variation publique de l’audience sur 30 jours',hint:'Tri par croissance 30 jours lorsque la source peut la mesurer au-dessus du bruit d’arrondi.',explain:'Vitesse de croissance',text:'Les abonnés YouTube étant arrondis à certains niveaux, une valeur nulle peut simplement signifier que la variation est sous le seuil détectable.'},
  avgViewers:{dataset:'twitch',title:'Twitch · viewers moyens',metric:'Viewers moyens · 30 j',key:'avgViewers30d',format:'integer',formula:'moyenne des viewers concurrents sur 30 jours',hint:'Classement Twitch francophone · fenêtre 30 jours.',explain:'Audience live moyenne',text:'Mesure l’audience simultanée moyenne pendant les streams sur les 30 derniers jours.'},
  watchHours:{dataset:'twitch',title:'Twitch · heures regardées',metric:'Heures regardées · 30 j',key:'hoursWatched30d',format:'compact',formula:'somme du temps de visionnage sur 30 jours',hint:'Classement Twitch francophone · fenêtre 30 jours.',explain:'Temps d’attention total',text:'Combine la taille d’audience et le temps de diffusion. Les très gros volumes de stream peuvent augmenter cette métrique.'},
  streamTime:{dataset:'twitch',title:'Twitch · temps diffusé',metric:'Heures streamées · 30 j',key:'timeStreamedHours30d',format:'hours',formula:'heures diffusées sur 30 jours',hint:'Classement Twitch francophone · fenêtre 30 jours.',explain:'Activité live',text:'Mesure le temps de diffusion, indépendamment du nombre de viewers.'},
  followers:{dataset:'twitch',title:'Twitch · plus suivis',metric:'Followers',key:'followers',format:'compact',formula:'followers publics Twitch recensés',hint:'Total de followers lorsqu’un relevé public récent est disponible.',explain:'Taille de communauté Twitch',text:'Mesure la taille du compte, pas son audience live actuelle. Les profils sans total récent vérifié sont laissés hors de ce classement.'},
  followerGrowth:{dataset:'twitch',title:'Twitch · plus forte croissance followers',metric:'Followers gagnés · 30 j',key:'followersGained30d',format:'integer',formula:'followers gagnés sur les 30 derniers jours',hint:'Fenêtre 30 jours lorsque disponible.',explain:'Vitesse d’acquisition',text:'Ce classement mesure le gain absolu de followers. La section Révélations ajoute une lecture relative et vérifie la cohérence avec les viewers.'},
  activeSubs:{dataset:'twitch',title:'Twitch · abonnements actifs',metric:'Subs actifs',key:'activeSubs',format:'integer',formula:'abonnements actifs recensés par la source',hint:'Snapshot septembre 2026 · TwitchTracker indique une possible marge d’erreur.',explain:'Soutien payant actif',text:'Cette métrique est distincte des followers et des viewers. Elle mesure les abonnements actifs recensés par la source à la date indiquée.'},
  peak:{dataset:'twitch',title:'Twitch · records de pic',metric:'Pic viewers historique',key:'peakViewersAllTime',format:'integer',formula:'plus haut pic public recensé',hint:'Pic historique recensé par la source.',explain:'Record historique',text:'Un pic historique peut provenir d’un événement exceptionnel et ne représente pas l’audience habituelle.'},
  kickFollowers:{dataset:'kick',title:'Kick · plus suivis francophones',metric:'Followers',key:'followers',format:'compact',formula:'followers publics Kick recensés',hint:'Seed V5 : fenêtre de classement Kick francophone observée en septembre 2026.',explain:'Taille de communauté Kick',text:'Cette métrique mesure le nombre de followers. Elle est séparée de l’audience live.'},
  kickAvg:{dataset:'kick',title:'Kick · viewers moyens',metric:'Viewers moyens · 7 j',key:'avgViewers7d',format:'integer',formula:'moyenne des viewers concurrents sur 7 jours',hint:'La V5 utilise une fenêtre homogène de 7 jours pour Kick.',explain:'Audience live moyenne Kick',text:'Kick est ajouté avec une fenêtre 7 jours clairement indiquée, sans mélanger ces chiffres avec Twitch 30 jours.'},
  kickWatch:{dataset:'kick',title:'Kick · heures regardées',metric:'Heures regardées · 7 j',key:'hoursWatched7d',format:'compact',formula:'somme du temps de visionnage sur 7 jours',hint:'Fenêtre homogène de 7 jours pour Kick.',explain:'Attention totale sur Kick',text:'Mesure le temps total regardé sur la fenêtre publique disponible.'},
  kickTime:{dataset:'kick',title:'Kick · temps diffusé',metric:'Heures streamées · 7 j',key:'timeStreamedHours7d',format:'hours',formula:'heures diffusées sur 7 jours',hint:'Fenêtre homogène de 7 jours pour Kick.',explain:'Activité Kick',text:'Mesure le temps de diffusion sur la période.'},
  kickGrowth:{dataset:'kick',title:'Kick · croissance followers',metric:'Followers gagnés · 7 j',key:'followersGained7d',format:'integer',formula:'followers gagnés sur 7 jours',hint:'Fenêtre 7 jours ; ne pas comparer directement à la croissance Twitch 30 jours.',explain:'Décollage récent Kick',text:'Une hausse relative forte chez un petit compte peut révéler une percée. Les anomalies restent marquées à surveiller.'},
  kickPeak:{dataset:'kick',title:'Kick · pics viewers',metric:'Pic viewers · 7 j',key:'peakViewers7d',format:'integer',formula:'plus haut pic observé sur 7 jours',hint:'Pic de la fenêtre 7 jours, pas record historique.',explain:'Pic récent Kick',text:'Montre l’intensité maximale récente sans la confondre avec l’audience habituelle.'}
};

const fmtInt = n => new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(n);
function fmtCompact(n){
  if(n == null) return '—';
  if(n >= 1e9) return (n/1e9).toLocaleString('fr-FR',{maximumFractionDigits:1})+' Md';
  if(n >= 1e6) return (n/1e6).toLocaleString('fr-FR',{maximumFractionDigits:1})+' M';
  if(n >= 1e3) return (n/1e3).toLocaleString('fr-FR',{maximumFractionDigits:1})+' k';
  return fmtInt(n);
}
function metricFormat(value, type){
  if(value == null) return '—';
  if(type==='compact') return fmtCompact(value);
  if(type==='percent') return `${value>0?'+':''}${value.toLocaleString('fr-FR',{maximumFractionDigits:2})} %`;
  if(type==='hours') return `${value.toLocaleString('fr-FR',{maximumFractionDigits:1})} h`;
  return fmtInt(value);
}
const initials = name => name.split(/[\s_-]+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
const sourceFor = c => sources[c.sourceId];
let currentRanking = 'subscribers';

function renderCoverage(){
  const y=document.querySelector('#youtubeCount'), t=document.querySelector('#twitchCount'), k=document.querySelector('#kickCount'), g=document.querySelector('#gameCount'), snap=document.querySelector('#snapshotLabel'), ribbon=document.querySelector('#dataRibbon');
  if(y) y.textContent=fmtInt(youtube.length);
  if(t) t.textContent=fmtInt(twitch.length);
  if(k) k.textContent=fmtInt(kick.length);
  if(g) g.textContent=fmtInt(DB.games.length);
  const dt=new Date(DB.meta.generatedAt);
  const dateLabel=Number.isNaN(dt.getTime()) ? 'date vérifiée sur chaque fiche' : dt.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'});
  if(snap) snap.textContent=`Sources visibles · catalogue ${dateLabel}`;
  if(ribbon) ribbon.innerHTML=`<span class="demo-dot"></span>Données réelles sourcées · YouTube + Twitch + Kick · catalogue ${dateLabel} · cadence ${DB.meta.updatePolicyHours||48} h`;
  const top=[...youtube].filter(c=>c.subscribers!=null&&c.creatorType!=='music').sort((a,b)=>b.subscribers-a.subscribers)[0] || [...youtube].filter(c=>c.subscribers!=null).sort((a,b)=>b.subscribers-a.subscribers)[0];
  if(top){
    const name=document.querySelector('#heroName'), subs=document.querySelector('#heroSubs'), obs=document.querySelector('#heroObserved'), vids=document.querySelector('#heroVideos'), views=document.querySelector('#heroViews'), avatar=document.querySelector('#heroAvatar');
    if(name) name.textContent=top.name;
    if(subs) subs.textContent=fmtCompact(top.subscribers);
    if(obs) obs.textContent=top.sourceObservedAt?`relevé le ${new Date(top.sourceObservedAt+'T12:00:00').toLocaleDateString('fr-FR')}`:'source datée sur fiche';
    if(vids) vids.textContent=top.videoCount==null?'—':fmtInt(top.videoCount);
    if(views) views.textContent=fmtCompact(top.totalViews);
    if(avatar) avatar.dataset.initials=initials(top.name);
  }
  const heroTw=document.querySelector('#heroTwitchCount'); if(heroTw) heroTw.textContent=fmtInt(twitch.length);
  const heroKick=document.querySelector('#heroKickCount'); if(heroKick) heroKick.textContent=fmtInt(kick.length);
  const regions=['France','Québec / Canada francophone','Belgique','Suisse romande','Autres francophones'];
  const regionBox=document.querySelector('#territoryCoverage');
  if(regionBox){
    regionBox.innerHTML=regions.map(r=>{
      const yc=youtube.filter(c=>c.francophoneRegion===r).length, tc=twitch.filter(c=>c.francophoneRegion===r).length, kc=kick.filter(c=>c.francophoneRegion===r).length;
      return `<article class="territory-card"><strong>${r}</strong><span>${yc} YouTube · ${tc} Twitch · ${kc} Kick</span></article>`;
    }).join('');
  }
}

function availableList(meta){
  let list = [...(datasets[meta.dataset]||[])];
  const territory = document.querySelector('#platformFilter').value;
  const type = document.querySelector('#periodFilter').value;
  if(territory !== 'all') list = list.filter(c => c.francophoneRegion === territory);
  if(type !== 'all'){
    if(meta.dataset === 'youtube'){
      if(type==='creator') list=list.filter(c=>!['channel','music','brand','media'].includes(c.creatorType));
      else if(type==='editorial') list=list.filter(c=>['channel','media'].includes(c.creatorType));
      else if(type==='music') list=list.filter(c=>c.creatorType==='music');
    } else if(type!=='creator') {
      list=[];
    }
  }
  return list.filter(c => c[meta.key] != null).sort((a,b)=>b[meta.key]-a[meta.key]);
}

function renderRanking(){
  const meta = rankingMeta[currentRanking];
  const list = availableList(meta).slice(0,30);
  document.querySelector('#rankingTitle').textContent = meta.title;
  document.querySelector('#metricHeader').textContent = meta.metric;
  document.querySelector('#formulaHint').textContent = meta.hint;
  document.querySelector('#explainTitle').textContent = meta.explain;
  document.querySelector('#explainText').textContent = meta.text;
  document.querySelector('#formulaText').textContent = meta.formula;
  document.querySelector('#rankingBody').innerHTML = list.length ? list.map((c,i)=>{
    const src=(currentRanking==='activeSubs' && c.activeSubsSourceId) ? sources[c.activeSubsSourceId] : sourceFor(c);
    let context='source publique';
    if(c.platform==='youtube') context = c.growth30dPct == null ? (c.recentSignalScore ? `signal récent ${c.recentSignalScore}/100` : c.francophoneRegion) : `${c.growth30dPct>0?'↗ +':c.growth30dPct<0?'↘ ':''}${c.growth30dPct.toLocaleString('fr-FR',{maximumFractionDigits:2})} % · 30 j`;
    else if(c.platform==='twitch'){
      if(currentRanking==='activeSubs') context = c.activeSubsObservedAt ? `relevé ${new Date(c.activeSubsObservedAt+'T12:00:00').toLocaleDateString('fr-FR')}` : 'snapshot tiers daté';
      else if(currentRanking==='followerGrowth') context = c.followers ? `${(c.growthShare30dPct??0).toLocaleString('fr-FR',{maximumFractionDigits:1})} % du total actuel` : 'total followers non consolidé';
      else if(currentRanking==='followers') context = c.followersGained30d!=null ? `↗ ${c.followersGained30d>=0?'+':''}${fmtInt(c.followersGained30d)} · 30 j` : c.francophoneRegion;
      else context = c.rankFrench ? `rang source #${c.rankFrench} FR` : c.francophoneRegion;
    } else if(c.platform==='kick'){
      if(currentRanking==='kickGrowth') context=c.followers?`${(c.growthShare7dPct??0).toLocaleString('fr-FR',{maximumFractionDigits:1})} % du total actuel · 7 j`:'fenêtre 7 j';
      else if(c.followersGained7d!=null) context=`↗ ${c.followersGained7d>=0?'+':''}${fmtInt(c.followersGained7d)} followers · 7 j`;
      else context=`${c.francophoneRegion} · fenêtre 7 j`;
    }
    const handle=c.platform==='youtube'?(c.handle||c.francophoneRegion):'@'+(c.login||c.name);
    return `<tr data-profile="${c.id}">
      <td class="rank-num">${i+1}</td>
      <td><div class="creator-cell"><div class="avatar" data-initials="${initials(c.name)}"></div><div class="creator-name"><strong>${c.name}</strong><small>${handle} · ${c.category}</small></div></div></td>
      <td><span class="platform-pill platform-${c.platform}">${platformName(c.platform)}</span></td>
      <td><span class="metric-main">${metricFormat(c[meta.key],meta.format)}</span></td>
      <td><span class="delta ${(c.growth30dPct||c.followersGained30d||c.followersGained7d||0)<0?'down':'up'}">${context}</span></td>
      <td class="row-arrow" title="Source : ${src?.name||'source publique'}">›</td>
    </tr>`;
  }).join('') : `<tr><td colspan="6" class="empty-state">Aucune donnée disponible pour ce filtre. CreatorRank préfère afficher « indisponible » plutôt qu’inventer un chiffre.</td></tr>`;
  document.querySelectorAll('[data-profile]').forEach(el=>el.addEventListener('click',()=>openProfile(el.dataset.profile)));
}

document.querySelectorAll('.rank-tab').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.rank-tab').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false')});
  btn.classList.add('active');btn.setAttribute('aria-selected','true');currentRanking=btn.dataset.ranking;renderRanking();
}));
document.querySelector('#platformFilter').addEventListener('change',renderRanking);
document.querySelector('#periodFilter').addEventListener('change',renderRanking);

function renderSelf(){
  const cards=[
    {icon:'⚡',title:'Buzz 7 jours',state:'EN COLLECTE',text:'Vues observées à J+7 ÷ médiane des vues à J+7 des 20 vidéos précédentes.',note:'Publication après historique suffisant'},
    {icon:'↗',title:'Contre soi-même',state:'EN COLLECTE',text:'Performance récente du créateur comparée à sa propre baseline, jamais à une chaîne plus grosse.',note:'Baseline glissante, robuste aux valeurs extrêmes'},
    {icon:'◷',title:'Historique daté',state:'48 H',text:'Un snapshot public est conservé à chaque cycle afin de mesurer les variations sans réécrire le passé.',note:'Première série à partir de la mise en ligne'}
  ];
  document.querySelector('#selfCards').innerHTML=cards.map((c,i)=>`<article class="self-card"><div class="self-top"><div class="data-icon">${c.icon}</div><div><strong>${c.title}</strong><small>Métrique CreatorRank</small></div><span class="self-rank">0${i+1}</span></div><div class="self-score">${c.state}</div><p class="history-copy">${c.text}</p><div class="self-note"><span>${c.note}</span></div></article>`).join('');
}

function renderGames(){
  document.querySelector('#gameGrid').innerHTML=DB.games.map(g=>`<article class="game-card" tabindex="0"><div class="game-icon">${g.abbr}</div><h3>${g.name}</h3><p>Collecte par vidéos + catégories live</p><span class="collect-badge">EN COLLECTE</span></article>`).join('');
}

function legalGroup(c){
  if(['dismissed','acquitted','relaxed','no_case','non_lieu'].includes(c.status)) return 'cleared';
  if(c.status.includes('conviction') || c.status==='conviction_crpc') return 'convictions';
  if(['complaint','complaint_filed'].includes(c.status)) return 'complaints';
  return 'proceedings';
}
function sentenceLabel(c){
  const bits=[];
  if((c.custodialTotalMonths||0)>0){
    bits.push(`${c.custodialTotalMonths} mois d’emprisonnement`);
    if((c.custodialFirmMonths||0)>0) bits.push(`${c.custodialFirmMonths} mois ferme`);
    if((c.suspendedMonths||0)>0) bits.push(`${c.suspendedMonths} mois avec sursis`);
  }
  if((c.fineEur||0)>0) bits.push(`${fmtInt(c.fineEur)} € d’amende${c.fineSuspended?' avec sursis':''}`);
  return bits.join(' · ') || 'Peine détaillée dans la source';
}
function renderSentenceRanking(){
  const root=document.querySelector('#sentenceRanking'); if(!root) return;
  const list=DB.legalCases.filter(c=>legalGroup(c)==='convictions').sort((a,b)=>
    (b.custodialTotalMonths||0)-(a.custodialTotalMonths||0) ||
    (b.custodialFirmMonths||0)-(a.custodialFirmMonths||0) ||
    (b.fineEur||0)-(a.fineEur||0)
  );
  root.innerHTML=list.slice(0,10).map((c,i)=>`<article class="sentence-item"><span>${i+1}</span><div><strong>${c.name}</strong><small>${sentenceLabel(c)}</small></div><em>${c.final===true?'décision consolidée':'statut à suivre'}</em></article>`).join('');
}
function renderCases(filter='all'){
  const list=DB.legalCases.filter(c=>filter==='all'||legalGroup(c)===filter);
  document.querySelector('#caseList').innerHTML=list.length ? list.map(c=>{
    const group=legalGroup(c);
    const statusClass=group==='cleared'?'cleared':group==='convictions'?(c.final===true?'final':'convicted'):group==='complaints'?'complaint':'pending';
    const links=c.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name}</a>`).join(' · ');
    const decision=c.decisionLevel?`<small>${c.decisionLevel}</small>`:'';
    const checked=c.recordCheckedAt||c.date;
    return `<article class="case-card real-case"><div class="avatar" data-initials="${initials(c.name)}"></div><div class="case-main"><small>Dossier documenté</small><strong>${c.name}</strong><span class="status ${statusClass}">${c.label}</span></div><div class="case-meta case-summary"><small>Faits en bref</small><strong>${c.briefFacts||c.summary}</strong></div><div class="case-meta"><small>Dossier contrôlé le</small><strong>${new Date(checked+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})}</strong><small>Événement judiciaire : ${new Date(c.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})}</small>${decision}</div><div class="source-count">${links}</div></article>`;
  }).join('') : '<p class="fineprint">Aucune entrée documentée dans cette catégorie pour le moment.</p>';
}
document.querySelectorAll('.case-filter').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.case-filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderCases(btn.dataset.case)}));


function renderBreakouts(filter='all'){
  const root=document.querySelector('#breakoutList'); if(!root) return;
  const all=DB.breakouts||[];
  let list=all;
  if(['twitch','youtube','kick'].includes(filter)) list=all.filter(x=>x.platform===filter);
  if(filter==='micro') list=all.filter(x=>x.platform==='youtube' ? (x.audience||Infinity)<250000 : (x.audience||Infinity)<100000);
  if(filter==='review') list=all.filter(x=>x.status==='review');
  const statusRank={confirmed:0,event:1,watch:2,review:3};
  list=[...list].sort((a,b)=>{
    if(filter==='all'){ const sr=(statusRank[a.status]??9)-(statusRank[b.status]??9); if(sr) return sr; }
    if(a.platform===b.platform && ['twitch','kick'].includes(a.platform)) return (b.growthSharePct||0)-(a.growthSharePct||0);
    return (b.outperformanceX||b.spikeViews||b.recentScore||b.growthSharePct||0)-(a.outperformanceX||a.spikeViews||a.recentScore||a.growthSharePct||0);
  });
  root.innerHTML=list.map((x,i)=>{
    const src=sources[x.sourceId];
    const isReview=x.status==='review';
    let metric,secondary;
    if(x.platform==='twitch'){
      metric=`<strong>${x.gain30d==null?'—':'+'+fmtInt(x.gain30d)}</strong><small>followers · 30 j</small><em>${x.growthSharePct==null?'—':x.growthSharePct.toLocaleString('fr-FR',{maximumFractionDigits:1})+' % du total'}</em>`;
      secondary=`<span><b>${fmtCompact(x.audience)}</b> followers</span><span><b>${x.avgViewers30d==null?'—':fmtInt(x.avgViewers30d)}</b> moy.</span><span><b>${x.peakViewers30d==null?'—':fmtInt(x.peakViewers30d)}</b> pic</span>`;
    }else if(x.platform==='kick'){
      metric=`<strong>${x.gain7d==null?'—':'+'+fmtInt(x.gain7d)}</strong><small>followers · 7 j</small><em>${x.growthSharePct==null?'—':x.growthSharePct.toLocaleString('fr-FR',{maximumFractionDigits:1})+' % du total'}</em>`;
      secondary=`<span><b>${fmtCompact(x.audience)}</b> followers</span><span><b>${x.avgViewers7d==null?'—':fmtInt(x.avgViewers7d)}</b> moy. 7 j</span><span><b>${x.peakViewers7d==null?'—':fmtInt(x.peakViewers7d)}</b> pic 7 j</span>`;
    }else{
      metric=x.outperformanceX ? `<strong>${x.outperformanceX.toLocaleString('fr-FR',{maximumFractionDigits:2})}×</strong><small>la médiane récente</small><em>${fmtCompact(x.spikeViews)} vues observées</em>` : `<strong>${fmtCompact(x.spikeViews||x.audience)}</strong><small>${x.spikeViews?'vues sur le contenu signal':'abonnés suivis'}</small><em>${x.recentRank?`#${x.recentRank} signal progression`:'dynamique récente'}</em>`;
      secondary=`<span><b>${fmtCompact(x.audience)}</b> abonnés</span><span><b>${x.spikeViews?fmtCompact(x.spikeViews):'—'}</b> pic vidéo</span><span><b>${x.category}</b></span>`;
    }
    return `<article class="breakout-card ${isReview?'is-review':''}">
      <div class="breakout-rank">#${i+1}</div><div class="avatar" data-initials="${initials(x.name)}"></div>
      <div class="breakout-main"><div class="breakout-name"><strong>${x.name}</strong><span class="platform-pill platform-${x.platform}">${platformName(x.platform)}</span><span class="signal-badge ${isReview?'review':''}">${x.statusLabel}</span></div><p>${x.note}</p><div class="breakout-secondary">${secondary}</div></div>
      <div class="breakout-metric">${metric}</div><div class="breakout-source"><a href="${src?.url||'#'}" target="_blank" rel="noopener noreferrer">Source ↗</a><small>${x.sourceObservedAt}</small></div>
    </article>`;
  }).join('') || '<div class="empty-state panel">Aucun signal dans ce filtre.</div>';
}
document.querySelectorAll('.breakout-filter').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.breakout-filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderBreakouts(btn.dataset.breakout)}));

function displayName(c){ return `${platformName(c.platform)} · ${c.name}` }
function fillCompareSelects(){
  const options=creators.map(c=>`<option value="${c.id}">${displayName(c)}</option>`).join('');
  document.querySelector('#creatorA').innerHTML=options;document.querySelector('#creatorB').innerHTML=options;
  if(creators.some(c=>c.id==='tibo-inshape')) document.querySelector('#creatorA').value='tibo-inshape';
  if(creators.some(c=>c.id==='squeezie')) document.querySelector('#creatorB').value='squeezie';
  renderCompare();
}
function renderCompare(){
  const a=creators.find(c=>c.id===document.querySelector('#creatorA').value),b=creators.find(c=>c.id===document.querySelector('#creatorB').value);
  if(!a||!b) return;
  if(a.platform!==b.platform){
    document.querySelector('#compareVisual').innerHTML=`<div class="compare-warning"><strong>Comparaison volontairement bloquée.</strong><p>${a.name} est ici mesuré sur ${platformName(a.platform)} et ${b.name} sur ${platformName(b.platform)}. CreatorRank ne transforme pas des métriques de plateformes différentes en un faux score commun.</p></div>`;return;
  }
  const defs=a.platform==='youtube'
    ? [['Abonnés','subscribers','compact'],['Vues cumulées','totalViews','compact'],['Vidéos','videoCount','integer'],['Croissance 30 j','growth30dPct','percent']]
    : a.platform==='twitch'
      ? [['Followers','followers','compact'],['Subs actifs','activeSubs','integer'],['Viewers moyens 30 j','avgViewers30d','integer'],['Heures regardées 30 j','hoursWatched30d','compact'],['Temps streamé 30 j','timeStreamedHours30d','hours'],['Pic historique','peakViewersAllTime','integer']]
      : [['Followers','followers','compact'],['Viewers moyens 7 j','avgViewers7d','integer'],['Heures regardées 7 j','hoursWatched7d','compact'],['Temps streamé 7 j','timeStreamedHours7d','hours'],['Pic 7 j','peakViewers7d','integer']];
  const rows=defs.filter(([,k])=>a[k]!=null&&b[k]!=null);
  document.querySelector('#compareVisual').innerHTML=rows.length ? rows.map(([label,key,type])=>{
    const av=a[key],bv=b[key],max=Math.max(Math.abs(av),Math.abs(bv),1);
    return `<div class="compare-row"><div class="compare-label">${label}</div><div class="bar-track left"><span class="bar-fill" style="width:${Math.abs(av)/max*100}%"></span></div><div class="compare-value">${metricFormat(av,type)}</div><div class="compare-value">${metricFormat(bv,type)}</div><div class="bar-track"><span class="bar-fill" style="width:${Math.abs(bv)/max*100}%"></span></div></div>`
  }).join('') : '<div class="compare-warning"><strong>Données comparables insuffisantes.</strong><p>CreatorRank attend davantage de mesures communes avant d’afficher cette comparaison.</p></div>';
}
document.querySelector('#creatorA').addEventListener('change',renderCompare);document.querySelector('#creatorB').addEventListener('change',renderCompare);

const profileModal=document.querySelector('#profileModal');
function openProfile(id){
  const c=creators.find(x=>x.id===id); if(!c)return;
  const src=sourceFor(c);
  const sourceLink=src?`<a class="source-link" href="${src.url}" target="_blank" rel="noopener noreferrer">${src.name} ↗</a>`:'Source publique';
  let stats=[];
  if(c.platform==='youtube'){
    stats=[['Abonnés',fmtCompact(c.subscribers)],['Vues totales',fmtCompact(c.totalViews)],['Vidéos',c.videoCount==null?'—':fmtInt(c.videoCount)],['Croissance 30 j',c.growth30dPct==null?'—':metricFormat(c.growth30dPct,'percent')],['Territoire',c.francophoneRegion||c.region],['Catégorie',c.category],['Relevé',c.sourceObservedAt],['Plateforme','YouTube']];
  }else if(c.platform==='twitch'){
    stats=[['Followers',c.followers==null?'—':fmtCompact(c.followers)],['Subs actifs',c.activeSubs==null?'—':fmtInt(c.activeSubs)],['Gain followers 30 j',c.followersGained30d==null?'—':`${c.followersGained30d>=0?'+':''}${fmtInt(c.followersGained30d)}`],['Viewers moyens 30 j',c.avgViewers30d==null?'—':fmtInt(c.avgViewers30d)],['Heures regardées 30 j',fmtCompact(c.hoursWatched30d)],['Temps streamé 30 j',metricFormat(c.timeStreamedHours30d,'hours')],['Pic viewers',c.peakViewersAllTime==null?(c.peakViewers30d==null?'—':fmtInt(c.peakViewers30d)):fmtInt(c.peakViewersAllTime)],['Territoire',c.francophoneRegion||c.region],['Catégorie',c.category],['Relevé',c.sourceObservedAt],['Plateforme','Twitch']];
  }else{
    stats=[['Followers',fmtCompact(c.followers)],['Gain followers 7 j',c.followersGained7d==null?'—':`${c.followersGained7d>=0?'+':''}${fmtInt(c.followersGained7d)}`],['Viewers moyens 7 j',c.avgViewers7d==null?'—':fmtInt(c.avgViewers7d)],['Heures regardées 7 j',fmtCompact(c.hoursWatched7d)],['Temps streamé 7 j',metricFormat(c.timeStreamedHours7d,'hours')],['Pic viewers 7 j',c.peakViewers7d==null?'—':fmtInt(c.peakViewers7d)],['Territoire',c.francophoneRegion||c.region],['Catégorie',c.category],['Relevé',c.sourceObservedAt],['Plateforme','Kick']];
  }
  let linked='';
  if(c.personId){
    const same=creators.filter(x=>x.personId===c.personId&&x.id!==c.id);
    if(same.length) linked=`<div class="profile-linked"><strong>Même créateur, autres plateformes :</strong> ${same.map(x=>`<button type="button" data-linked-profile="${x.id}">${platformName(x.platform)} · ${x.name}</button>`).join(' ')}</div>`;
  }
  const identity=c.platform==='youtube'?(c.handle||c.francophoneRegion):'@'+(c.login||c.name);
  document.querySelector('#profileContent').innerHTML=`<div class="profile-wrap"><div class="profile-hero"><div class="avatar" data-initials="${initials(c.name)}"></div><div><span class="badge badge-live">SOURCE VISIBLE</span><h2>${c.name}</h2><p>${identity} · ${c.category}</p></div></div><div class="profile-stats">${stats.map(([k,v])=>`<div class="profile-stat"><small>${k}</small><strong>${v??'—'}</strong></div>`).join('')}</div>${linked}<div class="profile-note"><strong>Provenance :</strong> ${sourceLink}<br>Valeurs observées le ${c.sourceObservedAt||'—'}. Les champs manquants sont laissés vides plutôt que reconstruits ou estimés.</div></div>`;
  document.querySelectorAll('[data-linked-profile]').forEach(btn=>btn.addEventListener('click',()=>openProfile(btn.dataset.linkedProfile)));
  profileModal.showModal();
}
document.querySelector('#closeProfile').addEventListener('click',()=>profileModal.close());

const searchModal=document.querySelector('#searchModal'),searchInput=document.querySelector('#globalSearch'),searchResults=document.querySelector('#searchResults');
function openSearch(){searchModal.showModal();setTimeout(()=>searchInput.focus(),20);renderSearch('')}
function renderSearch(q){
  const term=q.trim().toLowerCase();
  const found=creators.filter(c=>!term||`${c.name} ${c.handle||''} ${c.login||''} ${c.category} ${c.francophoneRegion||c.region||''} ${platformName(c.platform)}`.toLowerCase().includes(term)).slice(0,14);
  searchResults.innerHTML=found.map(c=>`<button class="search-result" data-search-profile="${c.id}"><div class="avatar" data-initials="${initials(c.name)}"></div><strong>${c.name}</strong><small>${platformName(c.platform)} · ${c.francophoneRegion||c.region||'Francophonie'}</small></button>`).join('') || `<div class="fineprint">Aucun résultat dans la base réelle actuelle.</div>`;
  document.querySelectorAll('[data-search-profile]').forEach(btn=>btn.addEventListener('click',()=>{searchModal.close();openProfile(btn.dataset.searchProfile)}));
}
document.querySelector('#openSearch').addEventListener('click',openSearch);document.querySelector('#closeSearch').addEventListener('click',()=>searchModal.close());searchInput.addEventListener('input',e=>renderSearch(e.target.value));
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape'){if(searchModal.open)searchModal.close();if(profileModal.open)profileModal.close()}});

const mobileToggle=document.querySelector('.mobile-nav-toggle'),menu=document.querySelector('.nav-links');mobileToggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');mobileToggle.setAttribute('aria-expanded',String(open))});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');mobileToggle.setAttribute('aria-expanded','false')}));

renderCoverage();renderRanking();renderBreakouts();renderSelf();renderGames();renderCases();renderSentenceRanking();fillCompareSelects();
