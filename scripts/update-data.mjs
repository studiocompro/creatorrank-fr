import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'data', 'catalog.json');
const catalogJsPath = path.join(root, 'data', 'catalog.js');
const historyPath = path.join(root, 'data', 'history.json');
const now = new Date();

const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
let history = {youtube:{}, twitch:{}, kick:{}, meta:{createdAt:now.toISOString()}};
try { history = JSON.parse(await fs.readFile(historyPath, 'utf8')); } catch {}
history.youtube ||= {}; history.twitch ||= {}; history.kick ||= {}; history.meta ||= {};

const minHours = Number(process.env.UPDATE_INTERVAL_HOURS || catalog.meta.updatePolicyHours || 48);
const forced = process.env.FORCE_UPDATE === '1';
const previous = catalog.meta.lastApiUpdateAt ? new Date(catalog.meta.lastApiUpdateAt) : null;
if (!forced && previous && (now - previous) < minHours * 3600_000 - 10 * 60_000) {
  console.log(`Pas de collecte : dernier cycle il y a ${((now-previous)/3600000).toFixed(1)} h (< ${minHours} h).`);
  process.exit(0);
}

const sleep = ms => new Promise(r=>setTimeout(r,ms));
const chunks = (arr,n) => Array.from({length:Math.ceil(arr.length/n)},(_,i)=>arr.slice(i*n,(i+1)*n));
const norm = s => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
async function getJson(url, options={}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}
function pushLimited(arr, item, max=90){ arr.push(item); if(arr.length>max) arr.splice(0,arr.length-max); }

async function updateYouTube(){
  const key = process.env.YOUTUBE_API_KEY;
  if(!key){ console.warn('YOUTUBE_API_KEY absent : YouTube non actualisé.'); return false; }
  let changed=false;
  console.log(`YouTube : ${catalog.youtube.length} profils.`);

  // Resolve channel IDs once. forHandle costs a cheap channels.list call; title search is fallback only.
  for(const c of catalog.youtube){
    if(c.youtubeChannelId) continue;
    let item=null;
    try{
      if(c.handle){
        const u=new URL('https://www.googleapis.com/youtube/v3/channels');
        u.search=new URLSearchParams({part:'id,snippet,contentDetails',forHandle:c.handle,key});
        const j=await getJson(u); item=j.items?.[0]||null;
      }
      if(!item){
        const u=new URL('https://www.googleapis.com/youtube/v3/search');
        u.search=new URLSearchParams({part:'snippet',type:'channel',maxResults:'5',q:c.name,key});
        const j=await getJson(u);
        item=j.items?.find(x=>norm(x.snippet?.channelTitle)===norm(c.name)) || j.items?.[0] || null;
        if(item) item={id:item.id.channelId,snippet:item.snippet};
      }
      if(item?.id){ c.youtubeChannelId=item.id; changed=true; console.log(`  ID résolu : ${c.name} -> ${item.id}`); }
    }catch(e){ console.warn(`  ID non résolu pour ${c.name}: ${e.message}`); }
    await sleep(40);
  }

  const withIds=catalog.youtube.filter(c=>c.youtubeChannelId);
  for(const batch of chunks(withIds,50)){
    const u=new URL('https://www.googleapis.com/youtube/v3/channels');
    u.search=new URLSearchParams({part:'snippet,statistics,contentDetails',id:batch.map(c=>c.youtubeChannelId).join(','),key});
    const j=await getJson(u);
    const byId=Object.fromEntries((j.items||[]).map(x=>[x.id,x]));
    for(const c of batch){
      const x=byId[c.youtubeChannelId]; if(!x) continue;
      c.name=x.snippet?.title || c.name;
      c.thumbnail=x.snippet?.thumbnails?.medium?.url || x.snippet?.thumbnails?.default?.url || c.thumbnail || null;
      c.subscribers=x.statistics?.hiddenSubscriberCount ? null : Number(x.statistics?.subscriberCount ?? c.subscribers);
      c.totalViews=Number(x.statistics?.viewCount ?? c.totalViews);
      c.videoCount=Number(x.statistics?.videoCount ?? c.videoCount);
      c.uploadsPlaylistId=x.contentDetails?.relatedPlaylists?.uploads || c.uploadsPlaylistId || null;
      c.primarySource='youtube-data-api'; c.sourceId='youtube-api'; c.sourceObservedAt=now.toISOString().slice(0,10);
      history.youtube[c.id] ||= {channelSnapshots:[], videos:{}};
      pushLimited(history.youtube[c.id].channelSnapshots,{at:now.toISOString(),subscribers:c.subscribers,totalViews:c.totalViews,videoCount:c.videoCount},190);
      const snaps=history.youtube[c.id].channelSnapshots;
      const target=now.getTime()-30*86400_000;
      let past=null, bestDist=Infinity;
      for(const snap of snaps){
        const dist=Math.abs(new Date(snap.at).getTime()-target);
        if(dist<bestDist){bestDist=dist;past=snap;}
      }
      if(past?.subscribers && bestDist<=36*3600_000){
        c.growth30dPct=(c.subscribers-past.subscribers)/past.subscribers*100;
        c.growth30dSource='creatorrank-history';
      }
      changed=true;
    }
  }

  // Recent videos: this starts CreatorRank's own age-normalized history for future buzz/self scores.
  const videoToCreator=new Map();
  const videoIds=[];
  for(const c of withIds){
    if(!c.uploadsPlaylistId) continue;
    try{
      const u=new URL('https://www.googleapis.com/youtube/v3/playlistItems');
      u.search=new URLSearchParams({part:'snippet,contentDetails',playlistId:c.uploadsPlaylistId,maxResults:'30',key});
      const j=await getJson(u);
      for(const it of j.items||[]){
        const vid=it.contentDetails?.videoId; if(!vid) continue;
        videoIds.push(vid); videoToCreator.set(vid,{creator:c,publishedAt:it.contentDetails?.videoPublishedAt||it.snippet?.publishedAt,title:it.snippet?.title||''});
      }
    }catch(e){ console.warn(`  Uploads ${c.name}: ${e.message}`); }
    await sleep(25);
  }
  for(const batch of chunks([...new Set(videoIds)],50)){
    const u=new URL('https://www.googleapis.com/youtube/v3/videos');
    u.search=new URLSearchParams({part:'statistics,snippet',id:batch.join(','),key});
    const j=await getJson(u);
    for(const v of j.items||[]){
      const ref=videoToCreator.get(v.id); if(!ref) continue;
      const c=ref.creator;
      const h=history.youtube[c.id] ||= {channelSnapshots:[],videos:{}};
      h.videos[v.id] ||= {id:v.id,title:v.snippet?.title||ref.title,publishedAt:v.snippet?.publishedAt||ref.publishedAt,snapshots:[]};
      const rec=h.videos[v.id]; rec.title=v.snippet?.title||rec.title; rec.publishedAt=v.snippet?.publishedAt||rec.publishedAt;
      pushLimited(rec.snapshots,{at:now.toISOString(),views:Number(v.statistics?.viewCount||0),likes:v.statistics?.likeCount?Number(v.statistics.likeCount):null,comments:v.statistics?.commentCount?Number(v.statistics.commentCount):null},45);
    }
  }

  function viewAtAge(rec, days=7){
    if(!rec?.publishedAt||!rec.snapshots?.length) return null;
    const target=new Date(rec.publishedAt).getTime()+days*86400_000;
    let best=null,dist=Infinity;
    for(const s of rec.snapshots){ const d=Math.abs(new Date(s.at).getTime()-target); if(d<dist){dist=d;best=s;} }
    return dist<=36*3600_000 ? best.views : null;
  }
  const median=a=>{const s=[...a].sort((x,y)=>x-y);if(!s.length)return null;const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2};
  for(const c of withIds){
    const h=history.youtube[c.id]; if(!h) continue;
    const vids=Object.values(h.videos||{}).map(v=>({...v,views7d:viewAtAge(v,7)})).filter(v=>v.views7d!=null).sort((a,b)=>new Date(a.publishedAt)-new Date(b.publishedAt));
    const scored=[];
    for(let i=20;i<vids.length;i++){
      const base=median(vids.slice(i-20,i).map(v=>v.views7d)); if(!base) continue;
      scored.push({...vids[i],buzz7d:vids[i].views7d/base});
    }
    if(scored.length){
      const recent=scored.slice(-5);
      c.buzz7dMax=Math.max(...recent.map(x=>x.buzz7d));
      c.buzz7dVideo=recent.sort((a,b)=>b.buzz7d-a.buzz7d)[0]?.title||null;
      const last3=vids.slice(-3).map(v=>v.views7d), prev20=vids.slice(-23,-3).map(v=>v.views7d);
      if(last3.length===3&&prev20.length>=10){ c.selfIndex=Math.round(median(last3)/median(prev20)*100); }
    }
  }
  return changed;
}

async function twitchToken(clientId, secret){
  const u=new URL('https://id.twitch.tv/oauth2/token');
  u.search=new URLSearchParams({client_id:clientId,client_secret:secret,grant_type:'client_credentials'});
  const j=await getJson(u,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'}}); return j.access_token;
}
async function updateTwitch(){
  const clientId=process.env.TWITCH_CLIENT_ID, secret=process.env.TWITCH_CLIENT_SECRET;
  if(!clientId||!secret){ console.warn('TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET absents : Twitch officiel non actualisé.'); return false; }
  let changed=false;
  const token=await twitchToken(clientId,secret);
  const headers={'Client-Id':clientId,'Authorization':`Bearer ${token}`};
  const logins=catalog.twitch.map(c=>c.login).filter(Boolean);
  for(const batch of chunks(logins,100)){
    const u=new URL('https://api.twitch.tv/helix/users'); batch.forEach(x=>u.searchParams.append('login',x));
    const j=await getJson(u,{headers}); const byLogin=Object.fromEntries((j.data||[]).map(x=>[x.login.toLowerCase(),x]));
    for(const c of catalog.twitch){
      const x=byLogin[c.login?.toLowerCase()]; if(!x) continue;
      c.twitchUserId=x.id; c.name=x.display_name||c.name; c.thumbnail=x.profile_image_url||c.thumbnail||null; c.primarySource='twitch-helix'; c.apiObservedAt=now.toISOString().slice(0,10); changed=true;
    }
  }
  // Followers totals. The endpoint exposes total even when individual follower details are not authorized.
  for(const c of catalog.twitch.filter(c=>c.twitchUserId)){
    try{
      const u=new URL('https://api.twitch.tv/helix/channels/followers'); u.search=new URLSearchParams({broadcaster_id:c.twitchUserId,first:'1'});
      const j=await getJson(u,{headers}); if(Number.isFinite(j.total)) c.followers=Number(j.total);
    }catch(e){ console.warn(`  Followers ${c.name}: ${e.message}`); }
    history.twitch[c.id] ||= {snapshots:[]};
    pushLimited(history.twitch[c.id].snapshots,{at:now.toISOString(),followers:c.followers??null},190);
    const snaps=history.twitch[c.id].snapshots;
    const target=now.getTime()-30*86400_000;
    let past=null, bestDist=Infinity;
    for(const snap of snaps){
      if(snap.followers==null) continue;
      const dist=Math.abs(new Date(snap.at).getTime()-target);
      if(dist<bestDist){bestDist=dist;past=snap;}
    }
    // Cadence publique 48 h : une tolérance de 60 h évite de perdre le calcul à cause d'un léger retard du cron.
    if(past?.followers!=null && c.followers!=null && bestDist<=60*3600_000){
      c.followersGained30d=c.followers-past.followers;
      c.growthShare30dPct=c.followers>0 ? c.followersGained30d/c.followers*100 : null;
      c.followerGrowthSource='creatorrank-history';
    }
    await sleep(35);
  }
  // Current live context (not used to fake 30-day averages).
  for(const batch of chunks(catalog.twitch.filter(c=>c.twitchUserId),100)){
    const u=new URL('https://api.twitch.tv/helix/streams'); batch.forEach(c=>u.searchParams.append('user_id',c.twitchUserId));
    try{
      const j=await getJson(u,{headers}); const live=Object.fromEntries((j.data||[]).map(x=>[x.user_id,x]));
      batch.forEach(c=>{const x=live[c.twitchUserId]; c.live=x?{isLive:true,viewers:x.viewer_count,game:x.game_name,title:x.title,startedAt:x.started_at}:{isLive:false};});
    }catch(e){ console.warn(`  Streams batch: ${e.message}`); }
  }
  return changed;
}

async function kickToken(clientId, secret){
  const u='https://id.kick.com/oauth/token';
  const body=new URLSearchParams({client_id:clientId,client_secret:secret,grant_type:'client_credentials'});
  const j=await getJson(u,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  return j.access_token;
}
async function updateKick(){
  const clientId=process.env.KICK_CLIENT_ID, secret=process.env.KICK_CLIENT_SECRET;
  if(!clientId||!secret){ console.warn('KICK_CLIENT_ID / KICK_CLIENT_SECRET absents : métadonnées Kick officielles non actualisées.'); return false; }
  if(!catalog.kick?.length) return false;
  let changed=false;
  const token=await kickToken(clientId,secret);
  const headers={'Authorization':`Bearer ${token}`,'Accept':'application/json'};
  // Des retours incohérents ont été signalés publiquement avec de très gros lots ; CreatorRank reste volontairement à 20 slugs.
  for(const batch of chunks(catalog.kick.filter(c=>c.login),20)){
    const u=new URL('https://api.kick.com/public/v1/channels');
    batch.forEach(c=>u.searchParams.append('slug',c.login));
    try{
      const j=await getJson(u,{headers});
      const bySlug=Object.fromEntries((j.data||[]).map(x=>[(x.slug||'').toLowerCase(),x]));
      for(const c of batch){
        const x=bySlug[(c.login||'').toLowerCase()]; if(!x) continue;
        c.kickBroadcasterUserId=x.broadcaster_user_id ?? c.kickBroadcasterUserId ?? null;
        c.channelDescription=x.channel_description ?? c.channelDescription ?? null;
        if(x.category?.name) c.currentCategory=x.category.name;
        if(x.active_subscribers_count!=null) c.activeSubscribers=Number(x.active_subscribers_count);
        if(x.active_gifted_subscribers_count!=null) c.activeGiftedSubscribers=Number(x.active_gifted_subscribers_count);
        const st=x.stream||{};
        c.live={isLive:Boolean(st.is_live),viewers:Number(st.viewer_count||0),startedAt:st.start_time||null,thumbnail:st.thumbnail||null,category:x.category?.name||c.currentCategory||null};
        c.kickApiObservedAt=now.toISOString().slice(0,10);
        history.kick[c.id] ||= {snapshots:[]};
        pushLimited(history.kick[c.id].snapshots,{at:now.toISOString(),followers:c.followers??null,isLive:c.live.isLive,liveViewers:c.live.viewers,category:c.live.category},190);
        changed=true;
      }
    }catch(e){ console.warn(`  Kick batch: ${e.message}`); }
    await sleep(80);
  }
  return changed;
}

function ensureSource(id, source){
  catalog.meta.sources ||= [];
  if(!catalog.meta.sources.some(s=>s.id===id)) catalog.meta.sources.push({id,...source});
}
function refreshBreakoutsFromHistory(){
  ensureSource('creatorrank-history',{
    name:'CreatorRank — historique propre',
    url:'./data/history.json',
    observedAt:now.toISOString().slice(0,10),
    kind:'calcul CreatorRank à partir des snapshots API'
  });
  catalog.breakouts ||= [];
  const byKey=new Map(catalog.breakouts.map((x,i)=>[`${x.platform}:${norm(x.name)}`,i]));

  // Twitch : un nouveau signal automatique est ajouté uniquement si la chaîne reste <250k followers,
  // gagne au moins 1 000 followers et que la hausse représente >=10 % de son audience actuelle.
  for(const c of catalog.twitch){
    if(c.followers==null||c.followersGained30d==null||c.followers>=250000||c.followersGained30d<1000) continue;
    const share=c.growthShare30dPct ?? (c.followersGained30d/c.followers*100);
    if(share<10) continue;
    const key=`twitch:${norm(c.name)}`;
    const base={platform:'twitch',name:c.name,audience:c.followers,gain30d:c.followersGained30d,growthSharePct:share,
      avgViewers30d:c.avgViewers30d??null,peakViewers30d:c.peakViewersAllTime??null,hoursLive30d:c.timeStreamedHours30d??null,
      category:c.category||'Twitch',sourceId:'creatorrank-history',sourceObservedAt:now.toISOString().slice(0,10)};
    if(byKey.has(key)){
      Object.assign(catalog.breakouts[byKey.get(key)],base);
    }else{
      catalog.breakouts.push({...base,status:'watch',statusLabel:'Signal automatique',
        note:'Hausse inhabituelle détectée par l’historique CreatorRank. Le statut reste « à surveiller » tant que l’audience live et la durée du signal ne sont pas consolidées.'});
      byKey.set(key,catalog.breakouts.length-1);
    }
  }

  // YouTube : la croissance seule ne suffit pas à confirmer un buzz. Elle crée uniquement un signal à surveiller.
  for(const c of catalog.youtube){
    if(c.subscribers==null||c.subscribers>=1000000||c.growth30dPct==null||c.growth30dPct<10) continue;
    const key=`youtube:${norm(c.name)}`;
    const base={platform:'youtube',name:c.name,audience:c.subscribers,recentScore:Math.round(c.growth30dPct),category:c.category||'YouTube',
      sourceId:'creatorrank-history',sourceObservedAt:now.toISOString().slice(0,10)};
    if(byKey.has(key)) Object.assign(catalog.breakouts[byKey.get(key)],base);
    else {
      catalog.breakouts.push({...base,status:'watch',statusLabel:'Croissance à surveiller',
        note:`+${c.growth30dPct.toFixed(1)} % d’abonnés sur 30 jours selon les snapshots CreatorRank. Une surperformance vidéo comparable à âge égal est nécessaire pour confirmer une percée.`});
      byKey.set(key,catalog.breakouts.length-1);
    }
  }
}

let changed=false;
try { changed = (await updateYouTube()) || changed; } catch(e){ console.error('YouTube fatal:',e); }
try { changed = (await updateTwitch()) || changed; } catch(e){ console.error('Twitch fatal:',e); }
try { changed = (await updateKick()) || changed; } catch(e){ console.error('Kick fatal:',e); }

if(changed){
  refreshBreakoutsFromHistory();
  catalog.meta.lastApiUpdateAt=now.toISOString();
  catalog.meta.generatedAt=now.toISOString();
  catalog.meta.status='api-updated';
  history.meta.lastUpdatedAt=now.toISOString();
  await fs.writeFile(catalogPath,JSON.stringify(catalog,null,2)+'\n');
  await fs.writeFile(catalogJsPath,`window.CREATORRANK_DATA = ${JSON.stringify(catalog,null,2)};\n`);
  await fs.writeFile(historyPath,JSON.stringify(history,null,2)+'\n');
  console.log('Données CreatorRank mises à jour.');
}else{
  console.log('Aucune source API actualisée (clés absentes ou aucun changement).');
}
