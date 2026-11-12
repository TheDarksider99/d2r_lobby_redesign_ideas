// Reserve right-click for the lobby UI, including its custom action menus.
document.addEventListener('contextmenu', event => {
 event.preventDefault();
}, {capture:true, passive:false});

let openTradingShop = null;
let currentCampGame = null;
let pendingGameInvite=null;
let gameChatMount=null;
let lobbyChatChannel='All';
const gameChatSeen=new Set();
const gameSystemStates=new Map();
const chatInvites=new Map();
let nextInviteId=0;
const names=['BØBECOW-15','7 PC8MB 4 LØ','DEADLYBAAL-30','ALL ACTS 96TZ-5','TZ ALL ID ALL','BRG 2 JAY GLØVE','BAALOS FOR GUL','BAALZI','PØØNBAALI','DUELS','PHØENIX MØN FT','NEEDTALSET','STAT RUN Ø2','96TZ ALL-Ø1'];
const descriptions=['Cow runs, stay together','Ist for Java skiller','Baal runs, throne open','Tomb reserved for host','96 TZ rotations, all welcome','Bring 2 Jah for gloves','Baal runs for Gul','Questing, need help with Act 2','Open Baal runs','PvP duels, no potions','Looking for Phoenix Monarch','Trade Tal set for runes','Act 5 quests, help welcome','TZ farm, split MF'];
let games=names.map((name,i)=>({name,description:descriptions[i],players:i%3+1,maxPlayers:2+(i*3)%7,elapsedSeconds:[3900,45,7320,540,4500,28,8460,120,2700,10200,420,5940,360,7860][i],demoShortTime:[1,5].includes(i),tz:/TZ/i.test(name)||[2,7,11].includes(i),ping:i%5===0?'green':'gold',activity:['Farming','Trading','Farming','Quest','Farming','Trading','Farming','Quest','Farming','PvP','Trading','Trading','Quest','Farming'][i]}));
// Additional mock lobby entries for layout, scrolling, filtering, and sorting previews.
const extraGames=[
 ['CHAOS RUN-08','Farming',5,8,1920,false,'green','Chaos sanctuary runs'],
 ['ACT 2 WALK','Quest',2,5,4380,false,'gold','Act 2 progression, all welcome'],
 ['ISO SHAKO','Trading',1,4,900,false,'green','Offer Ist + Mal for Shako'],
 ['TZ COWS-21','Farming',7,8,3600,true,'gold','Terror Zone cow runs'],
 ['GM DUELS 4','PvP',6,6,4680,false,'green','GM duels, no potions'],
 ['FREE ITEMS 7','Trading',3,8,120,false,'green','Free items in town'],
 ['ANCIENTS HELP','Quest',4,8,2700,false,'gold','Need help with Ancients'],
 ['BAAL XP-42','Farming',8,8,5400,false,'green','Fast Baal experience runs'],
 ['TZ TOMB RUN','Farming',3,7,8100,true,'gold','Split tomb farming'],
 ['SELLING TORCH','Trading',2,3,660,false,'green','Paladin torch for runes'],
 ['LOW LVL DUEL','PvP',2,8,4020,false,'gold','Low level PvP'],
 ['ACT 5 QUEST','Quest',1,6,7500,false,'green','Need rescue and Anya quests'],
 ['KEY FARM 12','Farming',4,4,2160,false,'gold','Keys from all three bosses'],
 ['TZ CHAOS 9','Farming',5,8,300,true,'green','Terror Zone Chaos runs'],
 ['RUNE TRADE','Trading',1,8,9600,false,'gold','Trading runes for gear'],
 ['NORM ACT 1','Quest',3,8,210,false,'green','Fresh start, quest together'],
 ['PVP ARENA','PvP',7,8,6720,false,'gold','Friendly duels'],
 ['MF SPLIT 06','Farming',2,6,8820,false,'green','Split magic finding areas']
];
extraGames.forEach(([name,activity,players,maxPlayers,elapsedSeconds,tz,ping,description])=>games.push({name,activity,players,maxPlayers,elapsedSeconds,tz,ping,description,demoShortTime:false}));
// v1.23: The difficulty buttons control which mock games appear in the browser.
// Preserve existing Hell games; provide separate Normal and Nightmare quest/Baal samples.
const lowerDifficultyGames = [
 ['NORMAL ACT 1 WALK','Normal','Quest',3,8,185,false,'green','Fresh characters, start at Den of Evil'],
 ['NORM ANDARIEL','Normal','Quest',5,8,1540,false,'gold','Act I boss quest, all welcome'],
 ['NORMAL TOMB RUN','Normal','Quest',6,8,3180,false,'green','Act II tomb quests and Duriel'],
 ['NORM ACT 3 HELP','Normal','Quest',2,6,4650,false,'gold','Collecting Khalim parts'],
 ['NORMAL BAAL-07','Normal','Farming',7,8,42,false,'green','Normal Baal experience runs'],
 ['NORM BAAL XP 8','Normal','Farming',8,8,3720,false,'gold','Fast Baal runs, game is full'],
 ['NM ACT 1 START','Nightmare','Quest',2,8,225,false,'green','Nightmare progression from Act I'],
 ['NM ACT 2 WALK','Nightmare','Quest',4,8,2700,false,'gold','Quest through the desert'],
 ['NM ANCIENTS','Nightmare','Quest',3,6,5610,false,'green','Help with Ancients quest'],
 ['NM ACT 5 QUEST','Nightmare','Quest',5,8,1920,false,'gold','Rescue Anya and reach Baal'],
 ['NM BAAL RUN-12','Nightmare','Farming',6,8,53,false,'green','Nightmare Baal XP runs'],
 ['NM BAAL XP-09','Nightmare','Farming',8,8,4200,false,'gold','Full Nightmare Baal game']
];
lowerDifficultyGames.forEach(([name,difficulty,activity,players,maxPlayers,elapsedSeconds,tz,ping,description])=>games.push({name,difficulty,activity,players,maxPlayers,elapsedSeconds,tz,ping,description,demoShortTime:elapsedSeconds<60}));
games.forEach(g=>{g.difficulty ||= 'Hell';g.players=Math.min(g.players,g.maxPlayers)});
// Show a few full games in the visual mock list.
games[2].maxPlayers=8;games[2].players=8;games[7].maxPlayers=6;games[7].players=6;games[11].maxPlayers=4;games[11].players=4;
// Sample separate mode populations from the existing demo pool, once per realm.
let activeCharacterGameMode='hc-ld';
function assignGameModes(pool){
 const modes=['hc-ld','sc-ld','hc-nl','sc-nl'];
 for(const difficulty of ['Normal','Nightmare','Hell']){
  const entries=pool.filter(game=>game.difficulty===difficulty);
  for(let i=entries.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[entries[i],entries[j]]=[entries[j],entries[i]];}
  entries.forEach((game,index)=>{game.characterGameMode=modes[index%modes.length];});
  // Standard (Softcore) Ladder is the busiest demo population.
  const ladderCount=entries.filter(game=>game.characterGameMode==='sc-ld').length;
  const usedNames=new Set(pool.map(game=>game.name));
  for(let i=ladderCount;entries.length&&i<30;i++){
   const source=entries[(i-ladderCount)%entries.length];
   let suffix=i+1,name=`${source.name}-${suffix}`;
   while(usedNames.has(name)){name=`${source.name}-${++suffix}`;}
   usedNames.add(name);
   pool.push({...source,name,characterGameMode:'sc-ld',shopItem:undefined});
  }
 }
}
function gamesForCharacter(){return games.filter(game=>game.characterGameMode===activeCharacterGameMode);}
assignGameModes(games);
const list=document.getElementById('game-list');const search=document.getElementById('search');const tzToggle=document.getElementById('tz-toggle');const activityFilter=document.getElementById('activity-filter');let selectedActivity='all';let selectedName=names[0];let sortKey=null;let sortAsc=true;let playersSortMode=0;let tzMode='all';let lastRefresh=Date.now();const ageFilterToggle=document.getElementById('age-filter-toggle');const ageFilterPanel=document.getElementById('age-filter-panel');const ageFilterValue=document.getElementById('age-filter-value');const ageFilterUnit=document.getElementById('age-filter-unit');const ageFilterEnabled=document.getElementById('age-filter-enabled');
function formatTime(seconds){if(seconds<60)return `${seconds}s`;const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60);return `${h}:${String(m).padStart(2,'0')}`}
function formatDetailedTime(seconds){const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),sec=seconds%60;return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderDetails(){
 const game=gamesForCharacter().find(entry=>entry.name===selectedName);
 const details=document.getElementById('game-details');
 if(!game){details.textContent='Select a game';return;}
 details.innerHTML=`<p>Elapsed Time</p><strong>${formatDetailedTime(game.elapsedSeconds)}</strong><p>Level Restrictions</p><strong>Any</strong><p>Description</p><strong>${escapeHtml(game.description||'—')}</strong><p>Players (${game.players}/${game.maxPlayers})</p><ul class="game-detail-players">${Array.from({length:game.players},(_,index)=>`<li>${index===0?'Host':`Player ${index+1}`}</li>`).join('')}</ul>`;
}
document.querySelectorAll('.game-header [data-sort]').forEach(h=>h.addEventListener('click',()=>{const key=h.dataset.sort;if(key==='players'){playersSortMode=sortKey==='players'?(playersSortMode+1)%3:0;sortKey=key;sortAsc=playersSortMode!==1}else{if(sortKey===key){sortAsc=!sortAsc}else{sortKey=key;sortAsc=true}}render()}));
function render(){const q=search.value.toLowerCase();list.innerHTML='';if(document.body.classList.contains('offline-character')){document.getElementById('game-details').innerHTML='';return;}document.querySelectorAll('.game-header [data-sort]').forEach(h=>{h.classList.toggle('sorted',h.dataset.sort===sortKey);h.title=h.dataset.sort===sortKey?(sortKey==='players'&&playersSortMode===2?'Ascending ▲ (full games last)':sortAsc?'Ascending ▲':'Descending ▼'):'Click to sort'});let visible=gamesForCharacter().filter(g=>g.difficulty===selectedDifficulty&&g.name.toLowerCase().includes(q)&&(selectedActivity==='all'||g.activity===selectedActivity)&&(tzMode==='all'||(tzMode==='tz'&&g.tz)||(tzMode==='non-tz'&&!g.tz))&&(!ageFilterEnabled.checked||g.elapsedSeconds<Math.max(1,Number(ageFilterValue.value)||1)*(ageFilterUnit.value==='hours'?3600:60)));if(sortKey){visible.sort((a,b)=>{if(sortKey==='players'&&playersSortMode===2){const af=a.players>=a.maxPlayers,bf=b.players>=b.maxPlayers;if(af!==bf)return af?1:-1;}let av=a[sortKey],bv=b[sortKey];if(typeof av==='string'){return (sortAsc?1:-1)*av.localeCompare(bv)}return (sortAsc?1:-1)*(av-bv)})}visible.forEach(g=>{const row=document.createElement('div');row.className='game'+(g.name===selectedName?' selected':'');row.innerHTML=`<span class="activity-${g.activity.toLowerCase()}">${g.name}</span><span class="activity-${g.activity.toLowerCase()}">${g.activity}</span><span class="${g.players>=g.maxPlayers?'full-players':'gold'}">${g.players}/${g.maxPlayers}</span><span>${formatTime(g.elapsedSeconds)}</span><span title="${g.tz?'Terror Zone':'Normal game'}" class="${g.tz?'gold':''}">${g.tz?'✦':''}</span><span title="Ping indicator" class="${g.ping}">●</span>`;row.onclick=()=>{selectedName=g.name;document.querySelector('.fields input').value=g.name;render()};list.appendChild(row)});renderDetails()}
search.addEventListener('input',render);
activityFilter.addEventListener('click',event=>{
 const tab=event.target.closest('[data-activity]');if(!tab)return;
 selectedActivity=tab.dataset.activity;
 activityFilter.querySelectorAll('[data-activity]').forEach(button=>{
  const active=button===tab;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
 });
 render();
});
activityFilter.addEventListener('keydown',event=>{
 const tabs=Array.from(activityFilter.querySelectorAll('[data-activity]'));
 const index=tabs.indexOf(document.activeElement);if(index<0)return;
 let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
 event.preventDefault();tabs[next].focus();tabs[next].click();
});
tzToggle.addEventListener('click',()=>{
 tzMode=tzMode==='all'?'tz':tzMode==='tz'?'non-tz':'all';
 tzToggle.dataset.mode=tzMode;tzToggle.setAttribute('aria-pressed',String(tzMode!=='all'));
 const labels={all:'All games (click for TZ only)',tz:'TZ only (click for no TZ)', 'non-tz':'No TZ (click for all games)'};
 tzToggle.title=labels[tzMode];tzToggle.setAttribute('aria-label','Terror Zone filter: '+labels[tzMode]);
 render();
});
function updateAgeFilter(){
 const active=ageFilterEnabled.checked;
 const n=Math.max(1,Number(ageFilterValue.value)||1);
 ageFilterToggle.classList.toggle('age-active',active);
 ageFilterToggle.setAttribute('aria-pressed',String(active));
 const label=active?`Age filter: Hide games open for ${n} ${ageFilterUnit.value} or longer`:'Age filter: Off';
 ageFilterToggle.title=label+' (click for settings)';
 ageFilterToggle.setAttribute('aria-label',label+'. Open age settings.');
 render();
}
ageFilterToggle.addEventListener('click',()=>{ageFilterPanel.hidden=!ageFilterPanel.hidden;ageFilterToggle.setAttribute('aria-expanded',String(!ageFilterPanel.hidden));});
[ageFilterValue,ageFilterUnit,ageFilterEnabled].forEach(el=>el.addEventListener('input',updateAgeFilter));
document.addEventListener('click',event=>{if(!event.target.closest('.age-filter-wrap')){ageFilterPanel.hidden=true;ageFilterToggle.setAttribute('aria-expanded','false');}});
document.getElementById('refresh').addEventListener('click',()=>{
 games=realmDefaultGames[activeRealm].map(game=>({...game}));
 realmStates[activeRealm].games=games;
 if(!gamesForCharacter().some(game=>game.name===selectedName&&game.difficulty===selectedDifficulty))selectedName=gamesForCharacter().find(game=>game.difficulty===selectedDifficulty)?.name||null;
 lastRefresh=Date.now();render();updateInviteButtons();const button=document.getElementById('refresh');button.textContent='\u2713';setTimeout(()=>button.textContent='\u27f3',550);
});
document.getElementById('level-difference').addEventListener('change',e=>{document.getElementById('level-difference-value').disabled=!e.target.checked;});
let selectedDifficulty='Hell';
document.querySelectorAll('.difficulty-button').forEach(button=>button.addEventListener('click',()=>{selectedDifficulty=button.dataset.difficulty;document.querySelectorAll('.difficulty-button').forEach(b=>b.classList.toggle('active',b===button));selectedName=gamesForCharacter().find(g=>g.difficulty===selectedDifficulty)?.name||null;render();}));
document.getElementById('create-game').addEventListener('click',()=>{
 const name=document.getElementById('game-name').value.trim();if(!name){alert('Enter a game name first.');return;}
 if(gamesForCharacter().some(game=>game.name.toLowerCase()===name.toLowerCase())){alert('That game name already exists in the mock list.');return;}
 const game={name,description:document.getElementById('game-description').value.trim(),characterGameMode:activeCharacterGameMode,realm:activeRealm,isPrivate:document.getElementById('game-password').value.length>0,levelDifference:document.getElementById('level-difference').checked?Number(document.getElementById('level-difference-value').value):null,friendsJoining:document.getElementById('friends-joining').checked,itemSpacing:document.getElementById('item-spacing').checked,players:1,maxPlayers:Math.max(2,Math.min(8,Number(document.getElementById('max-players').value)||8)),elapsedSeconds:0,demoShortTime:true,tz:document.getElementById('terrorized').checked,ping:'green',activity:document.getElementById('create-activity').value,difficulty:selectedDifficulty};
 playJoinGameLoading(()=>{
  if(characterMode==='online'&&!game.isPrivate)games.unshift(game);
  selectedName=name;render();showRegularCamp(game);
 });
});
document.getElementById('join-game').addEventListener('click',()=>{
 const name=document.getElementById('game-name').value.trim()||selectedName;
 const game=gamesForCharacter().find(entry=>entry.name.toLowerCase()===name?.toLowerCase());
 if(game){joinLobbyGame(game);return;}
 if(!name){alert('Select a game to join.');return;}
 // Named/password games can still enter the shared camp scene.
 playJoinGameLoading(()=>showRegularCamp({name,realm:activeRealm,characterGameMode:activeCharacterGameMode,difficulty:selectedDifficulty,activity:'Quest',isPrivate:document.getElementById('game-password').value.length>0}));
});
render();

// Chat word filter: hide matching messages without deleting them; preserves system toggle behavior.
const chatFilterButton=document.getElementById('chat-filter-toggle');
const chatFilterPanel=document.getElementById('chat-filter-panel');
const chatFilterWords=document.getElementById('chat-filter-words');
chatFilterButton.addEventListener('click',()=>{const open=chatFilterPanel.classList.toggle('open');chatFilterPanel.hidden=!open;chatFilterButton.setAttribute('aria-expanded',String(open));chatFilterButton.setAttribute('aria-pressed',String(open));if(open)chatFilterWords.focus();});
function applyChatWordFilter(){const terms=chatFilterWords.value.split(',').map(word=>word.trim().toLocaleLowerCase()).filter(Boolean);document.querySelectorAll('#chat > p').forEach(p=>{p.classList.toggle('word-filtered',terms.some(term=>p.textContent.toLocaleLowerCase().includes(term)));});}
chatFilterWords.addEventListener('input',applyChatWordFilter);
document.getElementById('system-toggle').addEventListener('click',()=>{const chat=document.getElementById('chat');const hidden=chat.classList.toggle('hide-system');const btn=document.getElementById('system-toggle');btn.setAttribute('aria-pressed',String(hidden));btn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'+(hidden?'<path d="M3 3l18 18"/>':'')+'</svg>';btn.title=hidden?'Show system notifications':'Hide system notifications';btn.setAttribute('aria-label',btn.title);});
const chatChannel=document.getElementById('chat-channel');
let selectedChatChannel='All';
let composerChannel='All';
let lobbyComposerChannel='All';
const chatLog=document.getElementById('chat');
const channelColors={Game:'#e9d09c',All:'#e6e3de',Lobby:'#d5b968',Clan:'#70ce78',Trading:'#d4a3f5',PvP:'#ed7777',Farming:'#e6e3de',Quest:'#69b8ff',Private:'#e69ccc'};
const channelIcons={Game:'G',Lobby:'\u25c6',Clan:'\u2663',Trading:'\u2696',PvP:'\u2694',Farming:'\u2660',Quest:'\u2726'};
let privateRecipient=null;
let privateRecipientName=null;
function selectPrivateRecipient(account,name){privateRecipient=account||null;privateRecipientName=privateRecipient?(name||privateRecipient.split('#')[0]):null;}
function chatChannelLabel(channel){return channel==='Private'?'Private':channel;}
function beginWhisper(battletag,name){
 selectPrivateRecipient(battletag,name);
 if(document.getElementById('market-shop').open){openInGameChat();}else{document.querySelector('[data-chat-view="lobby"]').click();}
 selectedChatChannel='Private';composerChannel='Private';applyChatChannel();jumpToLatestChat();document.getElementById('message').focus();
}
function decorateChatMessage(message,channel){
 if(channel.includes('#')){message.dataset.recipient=channel;channel='Private';}
 message.dataset.channel=channel;
 if(document.getElementById('market-shop').open&&currentCampGame){
  const participant=message.querySelector('.player-name')?.dataset.battletag||message.dataset.recipient;
  const relatedWhisper=channel==='Private'&&participant&&Array.from(chatLog.querySelectorAll('p[data-channel="Game"] .player-name')).some(sender=>sender.dataset.battletag===participant&&sender.closest('p').dataset.game===currentGameChatKey());
  if(channel==='Game'||relatedWhisper)message.dataset.game=currentGameChatKey();
 }
 message.style.setProperty('--channel-color',channelColors[channel]);
 const tag=document.createElement('span');tag.className='channel-tag';
 const label=channel==='Private'?'Private message':channel;
 tag.textContent=channelIcons[channel]||'\u2709';tag.title=label;tag.setAttribute('aria-label',label);tag.tabIndex=0;message.prepend(tag);
 const timestamp=document.createElement('time');timestamp.className='chat-timestamp';
 const sentAt=new Date();
 timestamp.dateTime=sentAt.toISOString();
 timestamp.textContent=String(sentAt.getHours()).padStart(2,'0')+':'+String(sentAt.getMinutes()).padStart(2,'0');
 message.prepend(timestamp);
}
chatLog.querySelectorAll(':scope > p').forEach(message=>decorateChatMessage(message,'Lobby'));
const channelSamples=[
 ['Clan','AshenBlade','AshenBlade#1200','Clan Baal runs tonight. Who is joining?'],
 ['Clan','MoonWarden','MoonWarden#1317','I can bring my sorceress. Meet in Act V.'],
 ['Trading','RuneSeeker','RuneHunter#1842','ISO Ber rune, offering 2 Sur.'],
 ['Trading','JavQueen','D2Trader#1458','FT Java skiller with life. Whisper offers.'],
 ['PvP','ShadowFang','NightOwl#1184','Friendly duels are up in Blood Moor.'],
 ['PvP','HolyHammer','HammerTime#1859','Looking for a 2v2 team. No potions.'],
 ['Farming','TravHorker','TravRunner#2470','Starting Trav runs. Split loot, all welcome.'],
 ['Farming','LightningFury','Javazon#1903','Cow level is open. Stay together for XP.'],
 ['Quest','LarzukPls','SocketQuest#1954','Need help with Ancients on Hell.'],
 ['Quest','BoneSpirit','NecroMain#1229','Act II quest walk, starting at the sewers.'],
 ['NeonRaven#119404','NeonRaven','NeonRaven#119404','Ready for another run?'],
 ['PearlImp#12912','PearlImp','PearlImp#12912','I saved that shield for you.'],
 ['Private','You','NeonRaven#119404','Yes, ready! Send me the game name.',true],
 ['Private','You','PearlImp#12912','Thanks! I will pick it up after this run.',true]
];
const lobbyMessages=Array.from(chatLog.children);
const sampleMessages=[];
channelSamples.forEach(([channel,character,battletag,text,outgoing])=>{
 const message=document.createElement('p'),sender=document.createElement('span');
 sender.className='player-name';sender.dataset.character=character;sender.dataset.battletag=battletag;sender.textContent=character+':';
 const body=document.createElement('span');body.className='message-body';body.textContent=' '+text;
 if(outgoing){sender.className='chat-self';sender.textContent='To '+battletag.split('#')[0]+':';message.classList.add('private-outgoing');message.dataset.recipient=battletag;}
 message.append(sender,body);decorateChatMessage(message,channel);sampleMessages.push(message);
});
// Interleave the mock conversation in a stable chronological sequence.
const sampleOrder=[0,4,2,8,6,10,12,1,3,7,11,13,5,9];
lobbyMessages.forEach((message,index)=>{
 if(index%2===0&&sampleOrder.length)chatLog.insertBefore(sampleMessages[sampleOrder.shift()],message);
});
sampleOrder.forEach(index=>chatLog.append(sampleMessages[index]));
const sampleTimeGaps=[2,7,4,13,3,9,6,17,5,11,1,8];
const initialMessages=Array.from(chatLog.children);
const sampleOffsets=initialMessages.map((_,index)=>index===0?0:sampleTimeGaps[(index-1)%sampleTimeGaps.length]*60000);
const initialMessageTime=Date.now()-sampleOffsets.reduce((total,gap)=>total+gap,0);
let sampleMessageTime=initialMessageTime;
initialMessages.forEach((message,index)=>{
 sampleMessageTime+=sampleOffsets[index];
 const sentAt=new Date(sampleMessageTime),timestamp=message.querySelector('.chat-timestamp');
 timestamp.dateTime=sentAt.toISOString();timestamp.textContent=String(sentAt.getHours()).padStart(2,'0')+':'+String(sentAt.getMinutes()).padStart(2,'0');
});
chatChannel.querySelectorAll('[data-channel]').forEach(tab=>tab.style.setProperty('--channel-color',channelColors[tab.dataset.channel]));
function currentGameChatKey(){
 return currentCampGame?(currentCampGame.realm||activeRealm)+'|'+currentCampGame.characterGameMode+'|'+currentCampGame.name:'';
}
function chatMessageInCurrentGameScope(message){
 return message.dataset.channel!=='Game'||(document.getElementById('market-shop').open&&message.dataset.game===currentGameChatKey());
}
function chatMessageVisibleInChannel(message,channel){
 if(!chatMessageInCurrentGameScope(message))return false;
 if(channel==='Game')return document.getElementById('market-shop').open&&message.dataset.game===currentGameChatKey();
 return channel==='All'||message.dataset.channel===channel;
}
function updateChannelBadges(){
 const counts={};
 chatLog.querySelectorAll('p[data-unread="true"]').forEach(message=>{if(!chatMessageInCurrentGameScope(message))return;const channel=message.dataset.channel;counts[channel]=(counts[channel]||0)+1;counts.GameView=(counts.GameView||0)+(message.dataset.game===currentGameChatKey()?1:0);});
 const chatTab=document.querySelector('[data-chat-view="lobby"]');
 let privateBadge=chatTab.querySelector('.chat-private-unread');
 if(!privateBadge){privateBadge=document.createElement('span');privateBadge.className='chat-private-unread';privateBadge.setAttribute('aria-hidden','true');chatTab.append(privateBadge);}
 const privateCount=counts.Private||0;privateBadge.textContent=privateCount>99?'99+':String(privateCount);privateBadge.hidden=privateCount===0;
 chatTab.setAttribute('aria-label','Chat'+(privateCount?', '+privateCount+' unread private messages':''));

 chatChannel.querySelectorAll('[data-channel]').forEach(tab=>{
  let badge=tab.querySelector('.channel-unread');
  if(!badge){badge=document.createElement('span');badge.className='channel-unread';badge.setAttribute('aria-hidden','true');tab.append(badge);}
  const count=tab.dataset.channel==='All'?Object.entries(counts).reduce((total,[channel,value])=>channel==='GameView'?total:total+value,0):tab.dataset.channel==='Game'?(counts.GameView||0):(counts[tab.dataset.channel]||0);badge.textContent=count>99?'99+':String(count);badge.hidden=count===0;
  tab.setAttribute('aria-label',tab.dataset.channel+(count?', '+count+' unread messages':''));
 });
}
function chatIsVisible(){
 const inGame=document.getElementById('market-shop').open;
 const blocked=Array.from(document.querySelectorAll('dialog[open]')).some(dialog=>!inGame||dialog.id!=='market-shop');
 return !chatLog.hidden&&(!inGame||!document.getElementById('in-game-chat').hidden)&&!document.body.classList.contains('intro-active')&&!document.hidden&&!blocked;
}
let chatScrollPosition=chatLog.scrollTop;
function markChatReadAtBottom(){
 if(!chatIsVisible()||chatLog.scrollHeight-chatLog.clientHeight-chatLog.scrollTop>2)return;
 chatLog.querySelectorAll('p[data-unread="true"]').forEach(message=>{
  if(chatMessageVisibleInChannel(message,selectedChatChannel))delete message.dataset.unread;
 });
 updateChannelBadges();
}
chatLog.addEventListener('scroll',()=>{
 const movedDown=chatLog.scrollTop>chatScrollPosition;
 chatScrollPosition=chatLog.scrollTop;
 if(movedDown)markChatReadAtBottom();
});
// A deliberate downward gesture also acknowledges messages when already at the bottom.
chatLog.addEventListener('wheel',event=>{if(event.deltaY>0)requestAnimationFrame(markChatReadAtBottom);},{passive:true});
chatLog.addEventListener('keydown',event=>{
 if(['End','PageDown','ArrowDown',' '].includes(event.key)&&!event.shiftKey)requestAnimationFrame(markChatReadAtBottom);
});
function jumpToLatestChat(){
 if(chatLog.hidden)return;
 chatLog.scrollTop=chatLog.scrollHeight;
 chatScrollPosition=chatLog.scrollTop;
 markChatReadAtBottom();
}
function updateComposerChannel(){
 const input=document.getElementById('message');
 const destination=composerChannel==='Private'&&privateRecipient?privateRecipientName:chatChannelLabel(composerChannel);
 document.getElementById('chat-composer-tag').textContent='['+destination+']';
 input.placeholder='';
 input.setAttribute('aria-label','Chat message to '+destination);
 const send=document.getElementById('chat-send');send.disabled=composerChannel==='All'||(composerChannel==='Private'&&!privateRecipient);
 send.title=send.disabled?(composerChannel==='Private'?'Ctrl-click a private message or choose Whisper to select a player.':'Choose a channel or Ctrl-click a message to reply.'):'Send to '+destination;
}
function applyChatChannel(){
 const channel=selectedChatChannel;
 chatLog.classList.toggle('all-channels',channel==='All'||channel==='Game');
 chatChannel.querySelectorAll('[data-channel]').forEach(tab=>{const selected=tab.dataset.channel===channel;tab.classList.toggle('active',selected);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
 updateComposerChannel();
 chatLog.querySelectorAll(':scope > p').forEach(message=>message.classList.toggle('channel-filtered',!chatMessageVisibleInChannel(message,channel)));
 chatScrollPosition=chatLog.scrollTop;
 updateInviteButtons();updateChannelBadges();
}
chatChannel.addEventListener('click',event=>{const tab=event.target.closest('[data-channel]');if(!tab)return;selectedChatChannel=tab.dataset.channel;composerChannel=tab.dataset.channel;if(composerChannel==='Private')selectPrivateRecipient(null);applyChatChannel();jumpToLatestChat();});
chatLog.addEventListener('click',event=>{
 if(!event.ctrlKey||!['All','Private'].includes(selectedChatChannel))return;
 const message=event.target.closest('p[data-channel]');if(!message||(selectedChatChannel==='Private'&&message.dataset.channel!=='Private'))return;
 event.preventDefault();event.stopImmediatePropagation();
 composerChannel=message.dataset.channel;
 if(composerChannel==='Private'){const sender=message.querySelector('.player-name');selectPrivateRecipient(message.dataset.recipient||sender?.dataset.battletag,message.dataset.recipientName||sender?.dataset.character);}
 updateComposerChannel();document.getElementById('message').focus();
},true);
chatChannel.addEventListener('keydown',event=>{
 const tabs=Array.from(chatChannel.querySelectorAll('[data-channel]')).filter(tab=>!tab.hidden);const index=tabs.indexOf(document.activeElement);if(index<0)return;
 let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
 event.preventDefault();tabs[next].focus();tabs[next].click();
});applyChatChannel();
document.getElementById('chat-form').onsubmit=e=>{
 e.preventDefault();if(composerChannel==='All'||(composerChannel==='Private'&&!privateRecipient))return;const input=document.getElementById('message');let text=input.value.trim();if(!text&&!pendingGameInvite)return;
 let channel=composerChannel;
 if(pendingGameInvite){
  const game=currentCampGame;
  const problem=game&&currentGameChatKey()===pendingGameInvite.key?gameEntryProblem(game):'This invitation no longer matches your game.';
  if(problem){document.getElementById('in-game-chat-status').textContent=problem;return;}
  postGameInvite(game,channel,{self:true,text,recipient:channel==='Private'?privateRecipient:null});
  input.value='';clearGameInviteDraft();document.getElementById('in-game-chat-status').textContent='';return;
 }
 const message=document.createElement('p'),sender=document.createElement('span'),body=document.createElement('span');
 sender.className='chat-self';sender.textContent=channel==='Private'?'To '+privateRecipientName+':':'You:';
 body.className='message-body';body.textContent=' '+text;
 if(channel==='Private'){message.classList.add('private-outgoing');message.dataset.recipient=privateRecipient;message.dataset.recipientName=privateRecipientName;}
 message.append(sender,body);decorateChatMessage(message,channel);chatLog.append(message);
 applyChatWordFilter();applyChatChannel();input.value='';
};
// Right-click a player chat message (including its text) to show account identity and actions.
const playerMenu=document.getElementById('player-context');
let contextPlayer=null;
function closePlayerMenu(){playerMenu.classList.remove('open');contextPlayer=null;}
document.getElementById('chat').addEventListener('contextmenu',event=>{
 const message=event.target.closest('p');
 const name=message?.querySelector('.player-name');
 if(!name)return;
 event.preventDefault();
 contextPlayer={character:name.dataset.character,battletag:name.dataset.battletag};
 document.getElementById('context-account').textContent=contextPlayer.battletag;
 playerMenu.classList.add('open');
 const rect=playerMenu.getBoundingClientRect();
 playerMenu.style.left=Math.max(4,Math.min(event.clientX,innerWidth-rect.width-4))+'px';
 playerMenu.style.top=Math.max(4,Math.min(event.clientY,innerHeight-rect.height-4))+'px';
});
playerMenu.addEventListener('click',event=>{
 const button=event.target.closest('[data-player-action]');if(!button||!contextPlayer)return;
 const action=button.dataset.playerAction;
 if(action==='Whisper'){
  beginWhisper(contextPlayer.battletag,contextPlayer.character);
 }else{
  // UI mock only: no Battle.net actions are performed.
  alert(action+' — '+contextPlayer.character+' ('+contextPlayer.battletag+')\nPrototype action only.');
 }
 closePlayerMenu();
});
document.addEventListener('click',event=>{if(!playerMenu.contains(event.target))closePlayerMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closePlayerMenu();});
window.addEventListener('scroll',closePlayerMenu,true);


// v1.30: Sort characters by name, level or class; drag handles allow custom order.
const characterData={online:[['Malachar','99','Warlock'],['Aldric','91','Barbarian'],['Seraphine','88','Sorceress'],['Kaelen','82','Paladin'],['Nyx','76','Assassin'],['Thorn','70','Druid'],['Elowen','65','Amazon'],['Mordren','58','Necromancer'],['Briar','42','Druid'],['Valen','29','Paladin']],offline:[['Ronan','73','Barbarian'],['Mira','61','Sorceress'],['Sylas','35','Necromancer']]};
const characterIcons={Malachar:['ld'],Aldric:['ld','hc'],Seraphine:['ld'],Kaelen:['hc'],Nyx:['ld','hc'],Elowen:['ld']};
const recentDeleted={online:[],offline:[]};
let characterMode='online',chosenCharacter='Malachar',characterSort='custom',characterSortAscending=true,draggedCharacter=null;
const classSymbols={Barbarian:'⚔',Sorceress:'✧',Paladin:'🛡',Assassin:'⚒',Druid:'🐺',Amazon:'🏹',Necromancer:'☠',Warlock:'✦'};
function syncCharacterGames(){
 updateInviteButtons();
 if(characterMode!=='online'){render();return;}
 const icons=characterIcons[chosenCharacter]||[];
 const mode=(icons.includes('hc')?'hc':'sc')+'-'+(icons.includes('ld')?'ld':'nl');
 if(mode!==activeCharacterGameMode){
  activeCharacterGameMode=mode;
  updateInviteButtons();
  selectedName=gamesForCharacter().find(game=>game.difficulty===selectedDifficulty)?.name||null;
  document.getElementById('game-name').value='';document.getElementById('game-password').value='';
 }
 render();
}
function updateCenterCharacter(){
 syncCharacterGames();
 const character=characterData[characterMode].find(c=>c[0]===chosenCharacter);
 if(!character){document.querySelector('.middle .char-name').textContent='No Character';document.querySelector('.middle .silhouette').textContent='—';return;}
 const [name,level,cls]=character;
 const display=document.querySelector('.middle .char-name');
 display.replaceChildren(document.createTextNode(name));
 const subtitle=document.createElement('small');subtitle.textContent=`LEVEL ${level} ${cls.toUpperCase()}`;display.appendChild(subtitle);
 const figure=document.querySelector('.middle .silhouette');figure.textContent=classSymbols[cls]||'⚔';
 figure.setAttribute('aria-label',`${cls} character placeholder`);
 figure.title=`${name} — Level ${level} ${cls}`;
}
const characterSortSelect=document.getElementById('character-sort'),characterSortDirection=document.getElementById('character-sort-direction');
function getSortedCharacters(){const entries=[...characterData[characterMode]];if(characterSort!=='custom'){const index={name:0,level:1,class:2}[characterSort];entries.sort((a,b)=>{const result=characterSort==='level'?Number(a[index])-Number(b[index]):a[index].localeCompare(b[index]);return (characterSortAscending?1:-1)*result});}return entries;}
function renderRecentDeleted(){
 const section=document.getElementById('recent-deleted');
 const list=document.getElementById('recent-deleted-list');
 const entries=recentDeleted[characterMode];
 section.hidden=entries.length===0;
 document.getElementById('recent-deleted-count').textContent=`(${entries.length})`;
 list.replaceChildren();
 for(const [name,level,cls] of entries){
  const row=document.createElement('div');row.className='deleted-character-entry';
  const nameEl=document.createElement('span');nameEl.textContent=name;
  const detail=document.createElement('small');detail.textContent=`Level ${level} ${cls}`;
  const info=document.createElement('div');info.className='deleted-info';info.append(nameEl,detail);
  const restore=document.createElement('button');restore.type='button';restore.className='restore-character';restore.textContent='Restore';restore.title=`Restore ${name}`;
  restore.addEventListener('click',()=>{
   const index=recentDeleted[characterMode].findIndex(c=>c[0]===name);
   if(index<0)return;
   const [restored]=recentDeleted[characterMode].splice(index,1);
   characterData[characterMode].push(restored);
   chosenCharacter=name;
   renderCharacters();updateCenterCharacter();
  });
  row.append(info,restore);list.append(row);
 }
}
function renderCharacters(){const root=document.getElementById('character-roster');root.replaceChildren();for(const [index,[name,level,cls]] of getSortedCharacters().entries()){
 const button=document.createElement('button');button.type='button';button.className='character-entry'+(chosenCharacter===name?' selected':'');button.dataset.character=name;if(Number(level)===99)button.classList.add('level-99');
 const handle=document.createElement('span');handle.className='character-drag';handle.textContent='⠿';handle.title='Drag to reorder';handle.setAttribute('aria-label','Drag '+name+' to reorder');handle.draggable=true;
 const label=document.createElement('span');if(characterMode==='online'&&characterIcons[name]?.includes('hc'))label.className='hardcore-character-name';label.textContent=`${index+1}. ${name}`;const sub=document.createElement('small');sub.textContent=`Level ${level} ${cls}`;const portrait=document.createElement('img');portrait.className='character-portrait';portrait.src='img/'+cls.toLowerCase()+'.png';portrait.alt='';portrait.width=44;portrait.height=44;const info=document.createElement('span');info.className='character-info';info.append(label,sub);
 if(Number(level)===99){
  label.classList.add('level-99-name');
  sub.className='level-99-honors';sub.replaceChildren();
  for(const [text,kind] of [[`Level ${level}`,'level'],[cls,'class']]){
   const badge=document.createElement('span');badge.className='level-99-honor level-99-honor-'+kind;badge.textContent=text;
   sub.append(badge);
  }
  const portraitFrame=document.createElement('span');portraitFrame.className='level-99-portrait';portraitFrame.append(portrait);button.append(handle,portraitFrame,info);
 }else{button.append(handle,portrait,info);}
 if(characterMode==='online'&&characterIcons[name]){
  const icons=document.createElement('span');icons.className='character-icons';
  for(const kind of characterIcons[name]){
   const icon=document.createElement('img');icon.src=`img/${kind}128.png`;icon.alt=kind==='hc'?'Hardcore':'Ladder';icon.title=icon.alt;icon.width=24;icon.height=24;icons.append(icon);
  }
  button.classList.add('has-character-icons');button.append(icons);
 }
 button.addEventListener('click',()=>{chosenCharacter=name;renderCharacters();updateCenterCharacter()});
 handle.addEventListener('dragstart',e=>{draggedCharacter=name;button.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',name);});
 handle.addEventListener('dragend',()=>{draggedCharacter=null;root.querySelectorAll('.character-entry').forEach(el=>el.classList.remove('dragging','drag-over'));});
 button.addEventListener('dragover',e=>{if(draggedCharacter&&draggedCharacter!==name){e.preventDefault();e.dataTransfer.dropEffect='move';button.classList.add('drag-over');}});
 button.addEventListener('dragleave',()=>button.classList.remove('drag-over'));
 button.addEventListener('drop',e=>{e.preventDefault();button.classList.remove('drag-over');if(!draggedCharacter||draggedCharacter===name)return;
 const order=getSortedCharacters();const from=order.findIndex(c=>c[0]===draggedCharacter),to=order.findIndex(c=>c[0]===name);const [moved]=order.splice(from,1);order.splice(to,0,moved);characterData[characterMode]=order;characterSort='custom';characterSortSelect.value='custom';renderCharacters();});
 root.append(button);
}renderRecentDeleted();}
characterSortSelect.addEventListener('change',()=>{characterSort=characterSortSelect.value;renderCharacters()});
characterSortDirection.addEventListener('click',()=>{characterSortAscending=!characterSortAscending;characterSortDirection.textContent=characterSortAscending?'↑':'↓';if(characterSort==='custom'){characterData[characterMode].reverse()}renderCharacters()});
document.querySelectorAll('[data-char-mode]').forEach(button=>button.addEventListener('click',()=>{characterMode=button.dataset.charMode;document.body.classList.toggle('offline-character',characterMode==='offline');render();chosenCharacter=characterData[characterMode][0]?.[0]||null;document.querySelectorAll('[data-char-mode]').forEach(b=>b.classList.toggle('active',b===button));renderCharacters();updateCenterCharacter()}));
document.getElementById('new-character').addEventListener('click',()=>alert('Create New Character — visual prototype'));
// v1.36: In-game-style confirmation first; browser notice only after typing DELETE. No deletion.
const deleteDialog=document.getElementById('delete-confirm-dialog');
const deleteInput=document.getElementById('delete-confirm-input');
const deleteSubmit=document.getElementById('delete-confirm-submit');
document.getElementById('delete-character').addEventListener('click',()=>{
 const selected=characterData[characterMode].find(c=>c[0]===chosenCharacter);
 if(!selected)return;
 document.getElementById('delete-confirm-name').textContent=selected[0];
 deleteInput.value='';deleteSubmit.disabled=true;
 deleteDialog.showModal();deleteInput.focus();
});
deleteInput.addEventListener('input',()=>{deleteSubmit.disabled=deleteInput.value.trim().toUpperCase()!=='DELETE'});
document.getElementById('delete-confirm-cancel').addEventListener('click',()=>deleteDialog.close());
deleteSubmit.addEventListener('click',()=>{
 if(deleteInput.value.trim().toUpperCase()!=='DELETE')return;
 deleteDialog.close();
 const index=characterData[characterMode].findIndex(c=>c[0]===chosenCharacter);
 if(index<0)return;
 const [removed]=characterData[characterMode].splice(index,1);
 recentDeleted[characterMode].unshift(removed);
 chosenCharacter=characterData[characterMode][0]?.[0]||null;
 renderCharacters();updateCenterCharacter();
 window.alert('UI/UX prototype: Character moved to Recent Delete. Reopen or refresh this page to reset the demo.');
});
document.getElementById('convert-character').addEventListener('click',()=>{
 const selected=characterData[characterMode].find(c=>c[0]===chosenCharacter);
 if(!selected)return;
 alert(`Convert Character — ${selected[0]}\nClassic / Expansion conversion — visual prototype only.`);
});
renderCharacters();
updateCenterCharacter();

// Chat section switching: preserves existing lobby messages and chat filters.
document.querySelectorAll('[data-chat-view]').forEach(button=>button.addEventListener('click',()=>{
 const view=button.dataset.chatView;const friends=view==='friends';const lobby=view==='lobby';
 document.getElementById('characters-panel').hidden=view!=='characters';
 document.querySelectorAll('[data-chat-view]').forEach(tab=>tab.classList.toggle('active',tab===button));
 document.getElementById('friends-panel').hidden=!friends;
 document.getElementById('chat').hidden=!lobby;
 document.querySelector('.chat-actions').hidden=!lobby;
 document.getElementById('chat-filter-panel').hidden=!lobby || document.getElementById('chat-filter-toggle').getAttribute('aria-expanded')!=='true';
 document.getElementById('chat-form').hidden=!lobby;
 if(lobby){applyChatChannel();jumpToLatestChat();}
}));
document.querySelectorAll('.friend-group-title').forEach(button=>button.addEventListener('click',()=>{
 const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));
 button.nextElementSibling.hidden=!open;button.querySelector('.triangle').textContent=open?'▾':'▸';
}));

// Friend actions are local UI prototype behaviors; no Battle.net requests are sent.
const friendMenu=document.getElementById('friend-context');let activeFriend=null;
function closeFriendMenu(){friendMenu.classList.remove('open');activeFriend=null;}
function friendName(el){return el.querySelector('.friend-name')?.childNodes[0]?.textContent.trim()||'Friend';}
function updateFriendGroups(){document.querySelectorAll('.friend-group').forEach(group=>{const title=group.querySelector('.friend-group-title');const count=group.querySelectorAll('.friend').length;title.innerHTML=title.innerHTML.replace(/- \d+\/\d+/, '- '+count+'/15');});}
document.getElementById('friends-panel').addEventListener('contextmenu',e=>{
 const row=e.target.closest('.friend');if(!row)return;e.preventDefault();closePlayerMenu();activeFriend=row;
 const name=friendName(row);document.getElementById('friend-context-name').textContent=row.querySelector('.friend-name')?.dataset.battletag||name;
 const favorite=!!row.closest('.friend-group:first-child') && row.closest('.friend-group')===document.querySelector('.friend-group');
 const favButton=friendMenu.querySelector('[data-friend-action="Add to Favorites"]');favButton.textContent=favorite?'Remove from Favorites':'Add to Favorites';
 friendMenu.classList.add('open');const r=friendMenu.getBoundingClientRect();friendMenu.style.left=Math.max(4,Math.min(e.clientX,innerWidth-r.width-4))+'px';friendMenu.style.top=Math.max(4,Math.min(e.clientY,innerHeight-r.height-4))+'px';
});
friendMenu.addEventListener('click',e=>{
 const btn=e.target.closest('[data-friend-action]');if(!btn||!activeFriend)return;
 const action=btn.dataset.friendAction;const name=friendName(activeFriend);const row=activeFriend;
 if(action==='Whisper'){beginWhisper(row.querySelector('.friend-name')?.dataset.battletag||name,name);}
 else if(action==='Add to Favorites'){
  const groups=document.querySelectorAll('.friend-group');const isFav=row.closest('.friend-group')===groups[0];const target=groups[isFav?1:0].querySelector('.friend-items');target.appendChild(row);
  const star=row.querySelector('.favorite-star');if(isFav){star?.remove();}else if(!star){const span=document.createElement('span');span.className='favorite-star';span.textContent=' ★';row.querySelector('.friend-name').appendChild(span);}
  updateFriendGroups();
 }else if(action==='Set Note'){
  const existing=row.querySelector('.friend-note');const note=prompt('Note for '+name+':',existing?.textContent||'');if(note!==null){if(note.trim()){const el=existing||document.createElement('small');el.className='friend-note';el.textContent=note.trim();if(!existing)row.querySelector('div:not(.friend-name)').appendChild(el);}else existing?.remove();}
 }else if(action==='Remove Friend'){
  if(confirm('Remove '+name+' from friends?')){row.remove();updateFriendGroups();}
 }else{alert(action+' — '+name+'\nPrototype action only.');}
 closeFriendMenu();
});
document.addEventListener('click',e=>{if(!friendMenu.contains(e.target))closeFriendMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeFriendMenu();});
window.addEventListener('scroll',closeFriendMenu,true);

// Restore the game-name focus whenever this lobby page is opened.
window.addEventListener('load', () => { const field = document.getElementById('game-name'); if (field) field.focus({preventScroll:true}); });

// v1.38: Main-menu actions are mock interactions in this UI prototype.
document.querySelectorAll('[data-main-menu]').forEach(button => {
  button.addEventListener('click', () => alert(button.dataset.mainMenu + ' — This is a UI/UX prototype.'));
});

// v1.44: In-memory item market concept; purchases happen at the seller's stash.
(() => {
 const wallet = {Ist: 6, Mal: 4};
 const offers = [
  {name: 'Harlequin Crest', stats: '+2 All Skills · 135 Defense · 50% Magic Find', price: 1, rune: 'Ist', symbol: '♜', tooltip: 'item9.png', rect: [86,207,185,185]},
  {name: 'Tal Rasha’s Guardianship', stats: '910 Defense · 88% Magic Find', price: 2, rune: 'Ist', symbol: '♜', tooltip: 'item2.png', rect: [86,395,185,278]},
  {name: 'Trang-Oul’s Claws', stats: '20% Faster Cast Rate · Cold Resist +30%', price: 1, rune: 'Mal', symbol: '✧', tooltip: 'item3.png', rect: [835,675,185,185]},
  {name: 'Magefist', stats: '+1 Fire Skills · 20% Faster Cast Rate', price: 1, rune: 'Mal', symbol: '✧', tooltip: 'item4.png', rect: [86,861,185,185]},
  {name: 'Chance Guards', stats: '40% Magic Find · 200% Extra Gold', price: 1, rune: 'Ist', symbol: '✧', tooltip: 'item5.png', rect: [86,675,185,185]},
  {name: 'Skullder’s Ire', stats: '+1 All Skills · 727 Defense', price: 2, rune: 'Mal', symbol: '♜', tooltip: 'item6.png', rect: [835,395,185,278]},
  {name: 'Guillaume’s Face', stats: '35% Crushing Blow · 15% Deadly Strike', price: 1, rune: 'Ist', symbol: '♛', tooltip: 'item1.png', rect: [835,207,185,185]},
  {name: 'Frostburn', stats: '+40% Maximum Mana · 49 Defense', price: 1, rune: 'Mal', symbol: '✧', tooltip: 'item8.png', rect: [835,861,185,185]}
 ];
 const shopSellers = ['AshenWolf', 'FrostVale', 'BoneMancer', 'EmberFox', 'LuckyHork', 'DuskRaven', 'IronThorn', 'ColdSnap'];
 const tradeDescriptions = ['135 def shako', 'tal armor here', 'trang gloves ft', 'magefist for mal', '40 mf chances', 'skullders ft', 'gface here', 'frostburn for mal'];
 offers.forEach((item, index) => {item.seller = shopSellers[index]; item.server = ['America', 'Europe', 'Asia'][index % 3];});
 // Sample sellers share the same scene artwork.
 const tradeLabels = ['SHAKO', 'TAL ARMOR', 'TRANG GLOVES', 'MAGEFIST', 'CHANCE GUARDS', 'SKULLDERS', 'GUILLAUMES', 'FROSTBURN'];
 games.filter(game => game.activity === 'Trading').forEach((game, index) => {
  const item = offers[index % offers.length];
  game.name = `${tradeLabels[index % offers.length]} 4 ${item.price} ${item.rune.toUpperCase()}`;
  game.description = tradeDescriptions[index % offers.length];
  game.shopItem = item.name;
 });
 const stash = [
  {name: 'War Traveler', stats: '40% Magic Find', symbol: '♟'},
  {name: 'The Oculus', stats: '+3 Sorceress Skills', symbol: '✧'}
 ];
 const panel = document.getElementById('market-panel');
 const search = document.getElementById('market-search');
 const dialog = document.getElementById('market-shop');
 const buy = document.getElementById('market-buy');
 const status = document.getElementById('market-status');
 const owned = [];
 let visiting = null;
 let lockedShopItem = null;

 function enterShop(item) {
  playJoinGameLoading(()=>showShop(item));
 }
 function showShop(item) {
  dialog.classList.remove('regular-game');
  currentCampGame=null;
  document.getElementById('shop-open-stash').hidden=false;
  document.getElementById('shop-arrival').textContent='You have arrived. Click the seller\'s shop to browse their items.';
  lockedShopItem = null;
  visiting = item;
  document.getElementById('market-shop-title').textContent = `${item.seller}’s Shop`;
  document.getElementById('shop-trade-view').hidden = true;
  document.getElementById('shop-arrival').hidden = false;
  renderGameShop(); selectShopItem(item);
  if(!dialog.open)dialog.showModal();
  const existing=gamesForCharacter().find(game=>game.shopItem===item.name);
  const shopGame=existing||{name:item.seller+' Shop',characterGameMode:activeCharacterGameMode,realm:activeRealm,players:1,maxPlayers:8,difficulty:selectedDifficulty,activity:'Trading',shopItem:item.name};
  if(!existing)games.push(shopGame);
  mountInGameChat(shopGame);
  document.getElementById('shop-open-stash').focus();
 }
 openTradingShop = itemName => {
  const item = offers.find(offer => !offer.mine && offer.name === itemName);
  if(item) enterShop(item);
 };

 function bindShopItem(button, item) {
  button.dataset.item = item.name;
  const preview = () => {if (!lockedShopItem) selectShopItem(item);};
  button.addEventListener('pointerenter', preview);
  button.addEventListener('focus', preview);
  button.addEventListener('click', () => {
   lockedShopItem = item;
   selectShopItem(item);
  });
 }
 dialog.addEventListener('click', event => {
  if (event.target.closest('.shop-item-hotspot, .shop-owned-item, .shop-inspection')) return;
  lockedShopItem = null;
  if (visiting) selectShopItem(visiting);
 });
 dialog.addEventListener('close', () => {lockedShopItem = null;});

 function itemSprite(item) {
  const [x, y, w, h] = item.rect;
  return `background-image:url('img/shop_full.png');background-size:${1108 / w * 100}% ${1430 / h * 100}%;background-position:${x / (1108 - w) * 100}% ${y / (1430 - h) * 100}%;aspect-ratio:${w}/${h}`;
 }
 function selectShopItem(item) {
  visiting = item;
  const isActive = lockedShopItem === item;
  document.getElementById('shop-selected-label').hidden = !isActive;
  document.getElementById('market-purchase-status').hidden = !isActive;
  document.getElementById('market-offer').replaceChildren();
  document.getElementById('market-offer').hidden = true;
  document.getElementById('shop-tooltip-price').textContent = item.sold ? 'Purchased' : `Price: ${item.price} ${item.rune}`;
  const tooltip = document.getElementById('shop-item-tooltip');
  tooltip.src = 'img/' + item.tooltip; tooltip.alt = `${item.name} statistics`;
  document.getElementById('market-purchase-status').textContent = item.sold ? 'Purchased — this item is now in your inventory.' : 'Select an item in the shop, then buy with your runes.';
  buy.hidden = !isActive || !!item.sold;
  buy.disabled = wallet[item.rune] < item.price;
  buy.textContent = buy.disabled ? `Not enough ${item.rune}` : 'Buy Item';
  document.querySelectorAll('.shop-item-hotspot, .shop-owned-item').forEach(button => {
   const active = button.dataset.item === lockedShopItem?.name;
   button.classList.toggle('selected', active);
   button.setAttribute('aria-pressed', String(active));
  });
 }
 function renderGameShop() {
  const hotspots = document.getElementById('shop-item-hotspots'); hotspots.replaceChildren();
  offers.filter(item => !item.mine).forEach(item => {
   const [x, y, w, h] = item.rect;
   const button = document.createElement('button'); button.type = 'button';
   button.className = 'shop-item-hotspot' + (item.sold ? ' sold' : '') + (item === lockedShopItem ? ' selected' : '');
   button.dataset.item = item.name;
   button.style.cssText = `left:${x/1108*100}%;top:${y/1430*100}%;width:${w/1108*100}%;height:${h/1430*100}%`;
   button.title = `${item.name}${item.sold ? ' · Purchased' : ''}`;
   button.setAttribute('aria-label', button.title);
   button.textContent = item.sold ? 'Sold' : '';
   bindShopItem(button, item); hotspots.append(button);
  });
  const inventory = document.getElementById('shop-inventory-items'); inventory.replaceChildren();
  const occupied = Array.from({length: 4}, () => Array(10).fill(false));
  let runeSlot = 39;
  Object.entries(wallet).forEach(([rune, count]) => {
   for (let index = 0; index < count; index++) {
    const x = runeSlot % 10, y = Math.floor(runeSlot / 10); runeSlot--;
    occupied[y][x] = true;
    const icon = document.createElement('img'); icon.className = 'shop-inventory-rune';
    icon.src = `img/${rune.toLowerCase()}_rune.png`; icon.alt = `${rune} Rune`; icon.title = `${rune} Rune`;
    icon.style.cssText = `left:${(80 + x * 93)/1096*100}%;top:${(857 + y * 93)/1468*100}%;width:${93/1096*100}%;height:${93/1468*100}%`;
    inventory.append(icon);
   }
  });
  [...owned].sort((a, b) => b.rect[3] - a.rect[3]).forEach(item => {
   const height = item.rect[3] > 200 ? 3 : 2;
   let slot = null;
   for (let y = 0; y <= 4 - height && !slot; y++) {
    for (let x = 0; x <= 8; x += 2) {
     if (Array.from({length: height}, (_, row) => !occupied[y + row][x] && !occupied[y + row][x + 1]).every(Boolean)) {slot = {x, y}; break;}
    }
   }
   if (!slot) return;
   for (let y = slot.y; y < slot.y + height; y++) {occupied[y][slot.x] = occupied[y][slot.x + 1] = true;}
   const icon = document.createElement('button'); icon.type = 'button'; icon.className = 'shop-owned-item';
   icon.style.cssText = itemSprite(item) + `;left:${(80 + slot.x * 93)/1096*100}%;top:${(857 + slot.y * 93)/1468*100}%;width:${186/1096*100}%`;
   icon.title = item.name; icon.setAttribute('aria-label', item.name + ' — purchased');
   bindShopItem(icon, item);
   icon.classList.toggle('selected', item === lockedShopItem);
   inventory.append(icon);
  });
 }
 document.getElementById('shop-open-stash').addEventListener('click', () => {
  lockedShopItem = null;
  closeInGameChat();
  document.getElementById('shop-trade-view').hidden = false;
  document.getElementById('shop-arrival').hidden = true;
  renderGameShop(); selectShopItem(visiting);
 });
 document.querySelectorAll('[data-close-trade]').forEach(button => button.addEventListener('click', () => {
  lockedShopItem = null;
  document.getElementById('shop-trade-view').hidden = true;
  document.getElementById('shop-arrival').hidden = false;
  document.getElementById('shop-open-stash').focus();
 }));
 dialog.addEventListener('cancel', event => {
  event.preventDefault();
  if (!document.getElementById('shop-trade-view').hidden) {
   document.querySelector('[data-close-trade]').click();
  }else{openGameMenu();}
 });

 function previewMarketItem(item) {
  let preview=document.getElementById('market-item-preview');
  if(!preview){
   preview=document.createElement('dialog');preview.id='market-item-preview';
   preview.innerHTML='<img alt=""><button type="button" class="mini-control">Close</button>';
   preview.querySelector('button').addEventListener('click',()=>preview.close());
   preview.addEventListener('click',event=>{if(event.target===preview)preview.close();});
   document.body.append(preview);
  }
  const picture=preview.querySelector('img');picture.src='img/'+item.tooltip;picture.alt=item.name+' statistics';
  preview.setAttribute('aria-label',item.name+' tooltip');preview.showModal();
 }
 function renderMarket() {
  const list = document.getElementById('market-list');
  list.replaceChildren();
  const query = search.value.trim().toLowerCase();
  offers.filter(item => !item.sold && `${item.name} ${item.seller} ${item.server}`.toLowerCase().includes(query)).forEach(item => {
   const row = document.createElement('article');
   row.className = 'market-item';
   row.innerHTML = `<div class="market-item-icon" aria-hidden="true">${item.symbol}</div><div class="market-item-copy"><h3>${escapeHtml(item.name)}</h3><small>${escapeHtml(item.stats)}</small><p>${item.mine ? 'Your listing' : 'Seller: ' + escapeHtml(item.seller)} <span class="market-server">&#183; ${escapeHtml(item.server)}</span></p><strong>${item.price} ${item.rune}</strong></div>`;
   if(item.tooltip){
    const heading=row.querySelector('h3'),nameButton=document.createElement('button');
    nameButton.type='button';nameButton.className='market-name-button';nameButton.textContent=item.name;
    nameButton.setAttribute('aria-label','View '+item.name+' tooltip');
    nameButton.addEventListener('click',()=>previewMarketItem(item));heading.replaceChildren(nameButton);
   }
   const action = document.createElement('button');
   action.type = 'button'; action.className = 'mini-control';
   action.textContent = item.mine ? 'Unlist' : 'Visit Shop';
   action.addEventListener('click', () => {
    if (item.mine) {
     offers.splice(offers.indexOf(item), 1);
     stash[item.stashIndex].listed = false;
     document.querySelector(`#market-stash option[value="${item.stashIndex}"]`).disabled = false;
     status.textContent = `${item.name} returned to your stash.`;
     renderMarket(); return;
    }
    enterShop(item);
   });
   row.append(action); list.append(row);
  });
  if (!list.children.length) list.textContent = 'No items found.';
  document.getElementById('market-owned-count').textContent = owned.length;
  const inventory = document.getElementById('market-owned'); inventory.replaceChildren();
  owned.forEach(item => {const li = document.createElement('li'); li.textContent = item.name; inventory.append(li);});
 }
 document.querySelectorAll('[data-chat-view]').forEach(tab => tab.addEventListener('click', () => {panel.hidden = tab.dataset.chatView !== 'market';}));
 search.addEventListener('input', renderMarket);

 buy.addEventListener('click', () => {
  if (!visiting || lockedShopItem !== visiting || visiting.sold || wallet[visiting.rune] < visiting.price) return;
  wallet[visiting.rune] -= visiting.price; visiting.sold = true; owned.push(visiting);
  document.getElementById('market-purchase-status').textContent = `${visiting.name} added to your inventory. ${visiting.price} ${visiting.rune} transferred to ${visiting.seller}.`;
  status.textContent = `Purchased ${visiting.name}. Find it in Your purchased items.`;
  buy.hidden = true; renderMarket(); renderGameShop();
 });
 document.getElementById('market-list-form').addEventListener('submit', event => {
  event.preventDefault();
  const select = document.getElementById('market-stash');
  const index = Number(select.value), item = stash[index];
  const price = Number(document.getElementById('market-price').value);
  if (!item || item.listed || !Number.isInteger(price) || price < 1 || price > 20) return;
  offers.unshift({...item, seller: 'You', server: document.getElementById('chat-server').value, price, rune: document.getElementById('market-rune').value, mine: true, stashIndex: index});
  item.listed = true; select.options[index].disabled = true;
  const available = Array.from(select.options).find(option => !option.disabled);
  if (available) select.value = available.value;
  status.textContent = `${item.name} listed in your shop’s trade stash.`;
  renderMarket();
 });
 renderMarket();
 render();
})();

// Each demo realm retains its own games and conversation, including local additions.
const realmGameNames={
 Europe:['EU BAAL EXPRESS','LONDON COWS','BER FOR TRADE','ACT 3 WALK EU','EU TZ CHAOS','FRIENDLY DUELS EU','NEED PAL TORCH','ANCIENTS HELP EU','EU KEY RUNS','RUNE EXCHANGE','EU UBER TEAM','EVENING MF'],
 Asia:['\u5730\u72f1\u5df4\u5c14-08','\ubc14\uc54c\ub7f0-12','Hoi Bo Viet','Asia Rune Trade','\u6df7\u6c8c\u907f\u96be\u6240','\uacb0\ud22c\uc7a5','Doi Ber lay Jah','\u4efb\u52a1\u4e92\u52a9','Seoul Key Runs','\u706b\u70ac\u4ea4\u6613','Di nhiem vu A5','Asia Split MF']
};
const realmChatSamples={
 Europe:[
 ['Lobby','OakKnight','Anyone up for an evening Baal run?'],['Clan','SilverOak','Our clan group starts in ten minutes.'],
 ['Trading','RuneBroker','Offering Jah for a good sorceress torch.'],['PvP','DuelWarden','Friendly duels in EU arena, all welcome.'],
 ['Farming','ChaosPilot','Chaos runs are open. Please stay behind the seals.'],['Quest','ActWalker','Could someone help with the Hell Ancients?'],
 ['Lobby','FrostWarden','Just found my first Shako this season!'],['Trading','AmberMage','ISO cold skiller, paying Ist.'],
 ['Clan','IronSentinel','I will bring my paladin for the clan runs.'],['Farming','CowShepherd','Cow portal is up, come join us.'],
 ['PvP','BladeDancer','Looking for a 2v2 partner.'],['Quest','DawnSeeker','Act III walk, starting at the docks.'],
 ['Lobby','RiverSorc','Good evening everyone!'],['Farming','KeyKeeper','Splitting keys, need someone for Summoner.'],
 ['Trading','TorchSmith','Unidentified torch for keys, whisper me.'],['Clan','WinterWolf','Saved some gear for our new members.']
 ],
 Asia:[
 ['Lobby','\u661f\u6cb3\u6cd5\u5e08','\u5927\u5bb6\u597d\uff01\u6709\u4eba\u4e00\u8d77\u6253\u5df4\u5c14\u5417\uff1f'],
 ['Clan','\ub2ec\ube5b\uae30\uc0ac','\ud074\ub79c \uc0ac\ub0e5 10\ubd84 \ub4a4\uc5d0 \uc2dc\uc791\ud574\uc694.'],
 ['Trading','Th\u1ee3S\u0103nRune','C\u1ea7n mua Ber, ai b\u00e1n th\u00ec nh\u1eafn m\u00ecnh nh\u00e9!'],
 ['PvP','SeoulBlade','Friendly duels up now. Looking for 2v2.'],
 ['Farming','\u6253\u5b9d\u5c0f\u968a','\u725b\u5173\u5df2\u5f00\uff0c\u6b22\u8fce\u4e00\u8d77\u5237\u5b9d\uff01'],
 ['Quest','\ud478\ub978\ubcc4','\uc9c0\uc625 \ubc14\ubc14\uc0bc\ud615\uc81c \ub3c4\uc640\uc8fc\uc2e4 \ubd84?'],
 ['Lobby','Ng\u01b0\u1eddiCh\u01a1iVi\u1ec7t','Ch\u00e0o m\u1ecdi ng\u01b0\u1eddi! C\u00f3 ai \u0111i Baal kh\u00f4ng?'],
 ['Trading','JadeTrader','Trading a sorceress torch for runes. PM offers.'],
 ['Clan','\u9f99\u9a91\u58eb','\u516c\u4f1a\u4eca\u665a\u4e00\u8d77\u6311\u6218\u8d85\u7ea7\u5730\u72f1\uff01'],
 ['Farming','\uc11c\ub9ac\ubc95\uc0ac','\uce74\uc6b0\ubc29 \uc5f4\uc5c8\uc5b4\uc694. \uac19\uc774 \ub3cc\uc544\uc694!'],
 ['PvP','Ki\u1ebfmS\u0129','T\u00ecm b\u1ea1n \u0111\u1ea5u PvP vui v\u1ebb, kh\u00f4ng d\u00f9ng b\u00ecnh m\u00e1u.'],
 ['Quest','LotusMage','Act V quest walk, everyone welcome.'],
 ['Lobby','\u5bfb\u5b9d\u4eba','\u521a\u51fa\u4e86\u4e00\u4e2a\u519b\u5e3d\uff0c\u8fd0\u6c14\u4e0d\u9519\uff01'],
 ['Trading','\ub8ec\uc0c1\uc778','\ubca0\ub974 \ub8ec \uad6c\ud569\ub2c8\ub2e4. \uade4\uc18d\ub9d0 \uc8fc\uc138\uc694.'],
 ['Clan','AnhH\u00f9ng','T\u1ed1i nay clan m\u00ecnh \u0111i farm chung nh\u00e9.'],
 ['Farming','PacificRunner','Split MF spots open: pits and tunnels available.']
 ]
};
const realmDefaultGames={America:games.map(game=>({...game}))};
const realmStates={America:{games, messages:Array.from(chatLog.children)}};
function buildRealm(server){
 const realmNames=realmGameNames[server];
 const realmGames=realmDefaultGames.America.slice(0,32).map((game,index)=>({...game,name:realmNames[index%realmNames.length]+(index>=realmNames.length?' '+(Math.floor(index/realmNames.length)+1):''),description:server==='Europe'?'Europe community runs, all welcome':'Asia community runs, all welcome',shopItem:undefined}));
 ['Normal','Nightmare'].forEach(difficulty=>realmGames.push(...realmGames.slice(0,6).map(game=>({...game,name:difficulty+' '+game.name,difficulty}))));
 const samples=realmChatSamples[server];
 const messages=samples.map(([channel,character,text],index)=>{
  const message=document.createElement('p'),sender=document.createElement('span');
  sender.className='player-name';sender.dataset.character=character;sender.dataset.battletag=character+'#'+(2100+index);sender.textContent=character+':';
  message.append(sender,document.createTextNode(' '+text));decorateChatMessage(message,channel);
  const sentAt=new Date(Date.now()-(samples.length-1-index)*11*60000-(index%3)*60000),timestamp=message.querySelector('time');
  timestamp.dateTime=sentAt.toISOString();timestamp.textContent=String(sentAt.getHours()).padStart(2,'0')+':'+String(sentAt.getMinutes()).padStart(2,'0');
  return message;
 });
 assignGameModes(realmGames);
 realmDefaultGames[server]=realmGames.map(game=>({...game}));
 return {games:realmGames,messages};
}
let activeRealm='America';
let playServerConnection=null;
function switchRealm(server){
 realmStates[activeRealm]={games,messages:Array.from(chatLog.children)};
 activeRealm=server;
 const state=realmStates[activeRealm]||(realmStates[activeRealm]=buildRealm(activeRealm));
 games=state.games;chatLog.replaceChildren(...state.messages);
 selectedName=gamesForCharacter().find(game=>game.difficulty===selectedDifficulty)?.name||null;
 document.getElementById('game-name').value='';document.getElementById('game-password').value='';
 lastRefresh=Date.now();closePlayerMenu();applyChatChannel();applyChatWordFilter();render();chatLog.scrollTop=0;
}
document.getElementById('chat-server').addEventListener('change',event=>{
 const requestedRealm=event.target.value;
 event.target.value=activeRealm;
 if(requestedRealm===activeRealm)return;
 playServerConnection(()=>{switchRealm(requestedRealm);event.target.value=requestedRealm;});
});

// Welcome plays twenty times; a deliberate hold starts the connection cinematic.
(()=>{
 const screen=document.getElementById('intro-screen'),welcome=document.getElementById('intro-welcome'),connecting=document.getElementById('intro-connecting'),enter=document.getElementById('intro-enter'),status=document.getElementById('intro-status');
 const lobby=document.querySelector('main.screen');
 let completedPlays=0,connectingStarted=false,holdStart=null,holdFrame=null,onConnected=null;
 function cancelHold(){holdStart=null;cancelAnimationFrame(holdFrame);enter.style.setProperty('--hold-progress','0%');}
 function showLobby(){cancelHold();welcome.pause();connecting.pause();const complete=onConnected;onConnected=null;if(complete)complete();connectingStarted=false;screen.hidden=true;lobby.inert=false;document.body.classList.remove('intro-active');document.getElementById('game-name').focus();}
 function startConnection(){
  if(connectingStarted)return;connectingStarted=true;cancelHold();screen.hidden=false;lobby.inert=true;document.body.classList.add('intro-active');welcome.pause();welcome.hidden=true;connecting.hidden=false;connecting.currentTime=0;enter.hidden=true;status.textContent='';
  connecting.play().catch(()=>{enter.hidden=false;enter.textContent='Play connecting video';});
 }
 function updateHold(now){if(holdStart===null)return;const progress=Math.min(1,(now-holdStart)/600);enter.style.setProperty('--hold-progress',progress*100+'%');if(progress===1){startConnection();return;}holdFrame=requestAnimationFrame(updateHold);}
 function beginHold(){if(connectingStarted)return;if(holdStart!==null)return;holdStart=performance.now();holdFrame=requestAnimationFrame(updateHold);}
 screen.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();beginHold();});
 window.addEventListener('pointerup',cancelHold);window.addEventListener('pointercancel',cancelHold);window.addEventListener('blur',cancelHold);
 enter.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();beginHold();}});
 enter.addEventListener('keyup',cancelHold);
 enter.addEventListener('click',()=>{if(connectingStarted)connecting.play().then(()=>{enter.hidden=true;}).catch(()=>{});});
 welcome.addEventListener('ended',()=>{completedPlays++;if(completedPlays<20&&!connectingStarted){welcome.currentTime=0;welcome.play().catch(()=>{});}});
 connecting.addEventListener('ended',showLobby);
 playServerConnection=callback=>{onConnected=callback;startConnection();};
 document.querySelector('.btn.exit').addEventListener('click',()=>{
  cancelHold();connecting.pause();connecting.currentTime=0;connecting.hidden=true;connectingStarted=false;onConnected=null;
  completedPlays=0;welcome.currentTime=0;welcome.hidden=false;screen.hidden=false;enter.hidden=false;enter.textContent='';status.textContent='';
  lobby.inert=true;document.body.classList.add('intro-active');closePlayerMenu();
  welcome.play().catch(()=>{});enter.focus();
 });
 connecting.addEventListener('error',()=>{if(connectingStarted){status.textContent='Connection video unavailable. Opening lobby.';showLobby();}});
 welcome.addEventListener('error',()=>{status.textContent='';});
 welcome.play().catch(()=>{status.textContent='';});
})();

// Global theme playlist survives welcome, connection, lobby and server changes.
(()=>{
 const tracks=['img/theme1.mp3','img/theme2.mp3'];
 const playlist=[];
 for(let pass=0;pass<5;pass++){
  const pair=Math.random()<0.5?[...tracks]:[...tracks].reverse();
  playlist.push(...pair);
 }
 const music=new Audio();music.preload='auto';music.autoplay=true;music.volume=1;
 let trackIndex=0,finished=false,starting=false;
 music.src=playlist[trackIndex];
 function clearUnlockListeners(){
  document.removeEventListener('pointerdown',tryPlay,true);
  document.removeEventListener('keydown',tryPlay,true);
 }
 function tryPlay(){
  if(finished||starting||!music.paused)return;
  starting=true;
  music.play().then(clearUnlockListeners).catch(()=>{}).finally(()=>{starting=false;});
 }
 music.addEventListener('ended',()=>{
  trackIndex++;
  if(trackIndex>=playlist.length){finished=true;clearUnlockListeners();return;}
  music.src=playlist[trackIndex];tryPlay();
 });
 // A blocked autoplay attempt resumes on the first mouse, touch or keyboard input.
 document.addEventListener('pointerdown',tryPlay,true);
 document.addEventListener('keydown',tryPlay,true);
 tryPlay();
})();

// Shared UI sounds also cover controls created after page load.
(()=>{
 const sounds=[null,...[1,2,3].map(index=>{const audio=new Audio('img/button'+index+'.mp3');audio.preload='auto';audio.volume=1;return audio;})];
 function playButtonSound(index){const audio=sounds[index];audio.currentTime=0;audio.play().catch(()=>{});}
 const tabSelector='.tab,.chat-section-tab,.character-mode,.detail-tab,[role="tab"]';
 document.addEventListener('click',event=>{
  const control=event.target.closest('button,[role="button"],summary,.game,.game-header [data-sort],input[type="checkbox"]');
  if(!control||control.disabled||control.closest('[inert]')||control.id==='intro-enter')return;
  const sound=control.matches('#create-game,#market-buy,#join-game,.escape-menu-hotspot')?1:control.matches(tabSelector)?3:2;
  playButtonSound(sound);
 },true);
 document.addEventListener('change',event=>{if(event.target.matches('select'))playButtonSound(2);},true);
})();

function postGameSystemNotice(kind,{character='',zone='Tal Rasha’s Tombs',unread=true}={}){
 if(!currentCampGame||!document.getElementById('market-shop').open)return;
 const message=document.createElement('p');message.className='system-notice';message.dataset.notice=kind;
 if(kind==='joined'||kind==='left'){
  message.classList.add('player-connection-notice');
  message.textContent=character+(kind==='joined'?" joined our world. Diablo's minions grow stronger.":" left our world. Diablo's minions weaken.");
 }else if(kind==='tz-start'||kind==='tz-end'){
  const location=document.createElement('span');location.className='purple';location.textContent=zone;
  message.append(document.createTextNode(kind==='tz-start'?'Corrupted tremors strike ':'The corrupted tremors fade from '),location,document.createTextNode(kind==='tz-start'?'!':'.'));
 }else{message.textContent='The tremors show signs of slowing.';}
 decorateChatMessage(message,'Game');if(unread)message.dataset.unread='true';
 const position=chatLog.scrollTop;chatLog.append(message);applyChatWordFilter();applyChatChannel();chatLog.scrollTop=position;chatScrollPosition=position;
 return message;
}
function nextGameSystemNotice(){
 const key=currentGameChatKey();if(!key)return;
 let state=gameSystemStates.get(key);
 if(!state){state={step:0,playerIndex:0,joined:false,tzPhase:1};gameSystemStates.set(key,state);}
 if(currentCampGame.tz&&++state.step%3===0){
  const kinds=['tz-start','tz-fading','tz-end'];postGameSystemNotice(kinds[state.tzPhase]);state.tzPhase=(state.tzPhase+1)%kinds.length;return;
 }
 const names=['AshenBlade','MoonWarden','RuneHunter','IronWolf'];const character=names[state.playerIndex%names.length];
 postGameSystemNotice(state.joined?'left':'joined',{character});
 state.joined=!state.joined;if(!state.joined)state.playerIndex++;
}

// Reparent the same chat controls so both surfaces use one message history and unread state.
function mountInGameChat(game){
 clearGameInviteDraft();
 const nodes=[document.querySelector('.chat-actions'),document.getElementById('chat-filter-panel'),chatLog,document.getElementById('chat-form'),playerMenu];
 if(!gameChatMount){
  lobbyChatChannel=selectedChatChannel;lobbyComposerChannel=composerChannel;
  gameChatMount=nodes.map(node=>{const anchor=document.createComment('lobby-chat-position');node.before(anchor);return {node,anchor,hidden:node.hidden};});
 }
 currentCampGame={players:1,maxPlayers:8,...game,realm:game.realm||activeRealm};
 if(characterMode==='online'&&!currentCampGame.isPrivate&&!games.some(entry=>entry.name===game.name&&entry.characterGameMode===game.characterGameMode))games.push(currentCampGame);
 const host=document.getElementById('in-game-chat-content');nodes.forEach(node=>{host.append(node);node.hidden=false;});
 chatFilterPanel.hidden=!chatFilterPanel.classList.contains('open');
 document.getElementById('game-chat-channel').hidden=false;
 document.getElementById('in-game-invite').hidden=false;
 document.getElementById('in-game-invite').disabled=!!gameEntryProblem(currentCampGame);
 document.getElementById('in-game-invite').title=gameEntryProblem(currentCampGame)||'Post this game to a chat channel';
 document.getElementById('in-game-chat-status').textContent='';
 const preview=document.getElementById('in-game-chat-preview');preview.replaceChildren();preview.dataset.game=currentGameChatKey();preview.hidden=true;
 document.getElementById('in-game-chat').hidden=true;
 selectedChatChannel='Game';composerChannel='Game';
 const key=currentGameChatKey();
 if(!gameChatSeen.has(key)){
  gameChatSeen.add(key);
  postGameSystemNotice('joined',{character:chosenCharacter,unread:false});
  if(game.tz)postGameSystemNotice('tz-start',{unread:false});
 }
 applyChatChannel();
}
function unmountInGameChat(){
 if(!gameChatMount)return;
 clearGameInviteDraft();
 closeInGameChat(false);
 gameChatMount.forEach(({node,anchor,hidden})=>{anchor.replaceWith(node);node.hidden=hidden;});
 gameChatMount=null;
 document.getElementById('game-chat-channel').hidden=true;
 document.getElementById('in-game-invite').hidden=true;
 if(selectedChatChannel==='Game')selectedChatChannel=lobbyChatChannel;
 if(composerChannel==='Game')composerChannel=lobbyComposerChannel;
 applyChatChannel();
 if(!chatLog.hidden)jumpToLatestChat();
}
function hideInGameMessagePreview(){
 document.getElementById('in-game-chat-preview').hidden=true;
}
function showInGameMessagePreview(message){
 if(!document.getElementById('market-shop').open||!document.getElementById('in-game-chat').hidden)return;
 if(message.dataset.channel!=='Private'&&(message.dataset.channel!=='Game'||message.dataset.game!==currentGameChatKey()))return;
 if(message.classList.contains('word-filtered')||(message.classList.contains('system-notice')&&chatLog.classList.contains('hide-system')))return;
 const preview=document.getElementById('in-game-chat-preview');
 const key=currentGameChatKey();if(preview.dataset.game!==key){preview.replaceChildren();preview.dataset.game=key;}
 const copy=message.cloneNode(true);copy.classList.remove('channel-filtered');copy.removeAttribute('data-unread');
 copy.querySelectorAll('[tabindex]').forEach(node=>node.removeAttribute('tabindex'));
 preview.append(copy);while(preview.children.length>6)preview.firstElementChild.remove();
 preview.hidden=false;preview.scrollTop=preview.scrollHeight;
}
// Watch the shared history so every incoming message path uses the same compact view.
new MutationObserver(records=>{
 for(const record of records)for(const node of record.addedNodes){
  if(node.nodeType===1&&node.matches('p[data-unread="true"]'))showInGameMessagePreview(node);
 }
}).observe(chatLog,{childList:true});
function openInGameChat(){
 if(!document.getElementById('market-shop').open||!gameChatMount)return;
 hideInGameMessagePreview();
 document.getElementById('in-game-chat').hidden=false;
 applyChatChannel();jumpToLatestChat();document.getElementById('message').focus();
}
function closeInGameChat(focusGame=true){
 hideInGameMessagePreview();
 document.getElementById('in-game-chat').hidden=true;
 if(focusGame&&document.getElementById('market-shop').open)document.getElementById('market-shop').focus();
}
document.getElementById('in-game-chat-close').addEventListener('click',()=>closeInGameChat());
document.getElementById('market-shop').addEventListener('click',event=>{
 const panel=document.getElementById('in-game-chat');
 const insideChat=event.composedPath().some(node=>node===panel||node===playerMenu);
 if(insideChat||(panel.hidden&&document.getElementById('in-game-chat-preview').hidden))return;
 closeInGameChat(false);
});
function handleInGameChatEnter(event){
 if(event.key!=='Enter'||event.repeat||!document.getElementById('market-shop').open)return;
 if(document.querySelector('dialog[open]:not(#market-shop)'))return;
 if(event.target.closest?.('button,input,textarea,select,[contenteditable="true"]'))return;
 event.preventDefault();openInGameChat();
}
document.addEventListener('keydown',handleInGameChatEnter,true);

// Escape opens the same in-game menu in regular and trading games.
let gameMenuReturnFocus=null;
function openGameMenu(){
 const game=document.getElementById('market-shop'),menu=document.getElementById('game-escape-menu');
 if(!game.open||menu.open)return;
 gameMenuReturnFocus=document.activeElement;
 menu.showModal();menu.focus();
}
function closeGameMenu(){
 document.getElementById('game-escape-menu').close();
 const game=document.getElementById('market-shop');
 if(gameMenuReturnFocus&&game.contains(gameMenuReturnFocus)&&!gameMenuReturnFocus.hidden)gameMenuReturnFocus.focus();else if(game.open)game.focus();
 gameMenuReturnFocus=null;
}
// Handle Escape directly so it never closes the camp dialog itself.
function handleGameEscape(event){
 if(event.key!=='Escape'||!document.getElementById('market-shop').open||document.getElementById('join-loading')?.open)return;
 event.preventDefault();event.stopPropagation();if(event.repeat)return;
 if(document.getElementById('game-escape-menu').open){closeGameMenu();return;}
 if(!document.getElementById('in-game-chat').hidden||!document.getElementById('in-game-chat-preview').hidden){closeInGameChat();return;}
 if(!document.getElementById('shop-trade-view').hidden){document.querySelector('[data-close-trade]').click();return;}
 openGameMenu();
}
document.addEventListener('keydown',handleGameEscape,true);
document.getElementById('game-resume').addEventListener('click',closeGameMenu);
document.getElementById('game-escape-menu').addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();closeGameMenu();});
document.getElementById('game-save-exit').addEventListener('click',()=>{
 closeGameMenu();document.getElementById('market-shop').close();currentCampGame=null;
});
document.getElementById('market-shop').addEventListener('close',()=>{
 const menu=document.getElementById('game-escape-menu');if(menu.open)menu.close();gameMenuReturnFocus=null;
 unmountInGameChat();currentCampGame=null;
});

// Regular games and chat invitations share the existing camp scene.
function showRegularCamp(game){
 currentCampGame={...game,realm:game.realm||activeRealm};
 const dialog=document.getElementById('market-shop');
 dialog.classList.add('regular-game');
 document.getElementById('market-shop-title').textContent=game.name;
 document.getElementById('shop-trade-view').hidden=true;
 document.getElementById('shop-open-stash').hidden=true;
 const arrival=document.getElementById('shop-arrival');arrival.hidden=true;
 arrival.textContent=game.difficulty+' - '+game.activity+' - Welcome to the Rogue Encampment.';
 if(!dialog.open)dialog.showModal();
 mountInGameChat(game);
 dialog.focus();
}
function gameEntryProblem(game,realm=activeRealm){
 if(realm!==activeRealm)return 'This invitation is for a different server.';
 if(characterMode!=='online')return 'Select an Online character to join.';
 if(game.characterGameMode!==activeCharacterGameMode)return 'Select a character with matching Hardcore and Ladder settings.';
 if(game.isPrivate)return 'Open invitations are available for public games only.';
 if(game.players>=game.maxPlayers)return 'This game is full.';
 return '';
}
function joinLobbyGame(game){
 const problem=gameEntryProblem(game);if(problem){alert(problem);return;}
 if(game.shopItem&&openTradingShop){openTradingShop(game.shopItem);return;}
 playJoinGameLoading(()=>showRegularCamp(game));
}
function resolveChatInvite(invite){
 if(invite.realm!==activeRealm)return null;
 return games.find(game=>game.name===invite.name&&game.characterGameMode===invite.characterGameMode);
}
function updateInviteButtons(){
 chatLog.querySelectorAll('[data-join-invite]').forEach(button=>{
  const invite=chatInvites.get(button.dataset.joinInvite);
  const game=invite&&resolveChatInvite(invite);
  const problem=game?gameEntryProblem(game,invite.realm):'This game is no longer available.';
  button.disabled=!!problem;button.title=problem||'Join '+game.name;
 });
}
function postGameInvite(game,channel,{self=false,character='PartyLeader',battletag='PartyLeader#2400',text='Come join us!',recipient=null}={}){
 const id=String(++nextInviteId);
 chatInvites.set(id,{name:game.name,realm:activeRealm,characterGameMode:game.characterGameMode});
 const message=document.createElement('p');message.className='chat-game-invite';
 const sender=document.createElement('span');sender.textContent=(self?chosenCharacter:character)+':';
 sender.className=self?'chat-self':'yellow player-name';
 if(self&&channel==='Private'&&recipient){message.classList.add('private-outgoing');message.dataset.recipient=recipient;message.dataset.recipientName=privateRecipientName;sender.textContent='To '+(privateRecipientName||recipient.split('#')[0])+':';}
 if(!self){sender.dataset.character=character;sender.dataset.battletag=battletag;}
 const body=document.createElement('span');body.className='message-body';body.textContent=' '+text+' ';
 const details=document.createElement('span');details.className='chat-invite-game';details.textContent=game.name;
 const join=document.createElement('button');join.type='button';join.className='mini-control chat-join-invite';join.dataset.joinInvite=id;join.textContent='Join Me';join.setAttribute('aria-label','Join '+game.name);
 const gameLine=document.createElement('span');gameLine.className='chat-invite-line';gameLine.append(join,details);
 message.append(sender,body,gameLine);decorateChatMessage(message,channel);
 if(!self)message.dataset.unread='true';
 const position=chatLog.scrollTop;chatLog.append(message);applyChatWordFilter();applyChatChannel();chatLog.scrollTop=position;chatScrollPosition=position;
 return message;
}
chatLog.addEventListener('click',event=>{
 const button=event.target.closest('[data-join-invite]');if(!button||button.disabled)return;
 const invite=chatInvites.get(button.dataset.joinInvite);const game=invite&&resolveChatInvite(invite);
 if(!game){updateInviteButtons();return;}
 joinLobbyGame(game);
});
function clearGameInviteDraft(){
 pendingGameInvite=null;document.getElementById('chat-invite-draft').hidden=true;
 document.getElementById('in-game-invite').setAttribute('aria-pressed','false');
}
function attachCurrentGameInvite(){
 const game=currentCampGame,status=document.getElementById('in-game-chat-status');
 const problem=game?gameEntryProblem(game):'Join a game first.';
 if(problem){status.textContent=problem;return;}
 pendingGameInvite={key:currentGameChatKey()};
 document.getElementById('chat-invite-draft-name').textContent=game.name;
 document.getElementById('chat-invite-draft').hidden=false;
 document.getElementById('in-game-invite').setAttribute('aria-pressed','true');
 status.textContent='';document.getElementById('message').focus();
}
document.getElementById('in-game-invite').addEventListener('click',attachCurrentGameInvite);
document.getElementById('chat-invite-draft-remove').addEventListener('click',clearGameInviteDraft);

// One loading cinematic is shared by Join Game and Visit Shop.
let joinLoadingActive=false;
function playJoinGameLoading(onReady){
 if(joinLoadingActive)return;
 joinLoadingActive=true;
 let overlay=document.getElementById('join-loading');
 if(!overlay){
  overlay=document.createElement('dialog');overlay.id='join-loading';overlay.setAttribute('aria-label','Loading game');
  const video=document.createElement('video');video.src='img/join_game.mp4';video.muted=true;video.playsInline=true;video.preload='auto';
  overlay.append(video);document.body.append(overlay);
  overlay.addEventListener('cancel',event=>event.preventDefault());
 }
 const video=overlay.querySelector('video');let completed=false;
 function finish(){
  if(completed)return;completed=true;video.pause();video.removeEventListener('ended',finish);video.removeEventListener('error',finish);
  overlay.close();joinLoadingActive=false;onReady();
 }
 video.currentTime=0;video.addEventListener('ended',finish);video.addEventListener('error',finish);overlay.showModal();
 video.play().catch(finish);
}

// Every ten seconds, deliver one realm-appropriate demo message.
(()=>{
 const privateMessageSound=new Audio('img/message.mp3');privateMessageSound.preload='auto';privateMessageSound.volume=1;
 const channels=['Lobby','Clan','Trading','PvP','Farming','Quest','Private'];
 const extraMessages={
  Game:['Anyone need a waypoint before we head out?','Ready when you are.','I will open a portal when I get there.'],
  Lobby:['Anyone starting a fresh character today?','Nice runs everyone, thanks for the party!','What is the current Terror Zone?','Back after a break. Good to see the lobby busy.','Looking for a relaxed group for a few runs.'],
  Clan:['Clan stash has spare leveling gear.','We still have two spots for tonight.','Meet in Act V when you are ready.','Great teamwork on that last run!','Who needs help gearing an alternate character?'],
  Trading:['FT 4os Monarch, looking for runes.','ISO lightning skiller, whisper your price.','Selling a keyset, open to offers.','Looking for a Raven Frost with good dexterity.','FT spare Spirit sword for a new player.'],
  PvP:['Duel arena is open, come warm up.','Anyone interested in low-level duels?','Looking for another team for 2v2.','Good duel! Want a rematch?','Meet outside town when both players are ready.'],
  Farming:['Next Chaos run starts in a minute.','Pits are taken, Ancient Tunnels still open.','Need a teleporter for Baal runs.','Found a rune! Staying for five more runs.','Cow portal is open. Please wait for the party.'],
  Quest:['Need help rescuing Anya on Hell.','Act II staff assembled. Ready for Duriel.','Anyone need the Diablo quest?','Starting a fresh Act I walk, all welcome.','Thanks for the waypoint! Moving to Act IV.'],
  Private:['Are you still looking for that item?','I have a spot open if you want to join.','Thanks for the trade!','Give me a minute, finishing this run.','Send me the game name when you are ready.','Found something that might help your build.']
 };
 const messagePools={},messageQueues={},lastMessages={};
 function nextDemoMessage(channel){
  const key=activeRealm+':'+channel+(channel==='Game'?':'+currentGameChatKey():'');
  if(!messagePools[key]){
   const existing=Array.from(chatLog.querySelectorAll('p')).filter(message=>message.dataset.channel===channel&&!message.classList.contains('private-outgoing')&&!message.classList.contains('chat-game-invite'));
   const pool=existing.map(message=>{
    const sender=message.querySelector('.player-name');if(!sender)return null;
    const copy=message.cloneNode(true);copy.querySelectorAll('.player-name,.channel-tag,time').forEach(node=>node.remove());
    return {character:sender.dataset.character,battletag:sender.dataset.battletag,text:copy.textContent.trim()};
   }).filter(Boolean);
   const people=pool.length?[...pool]:[{character:activeRealm==='Europe'?'OakKnight':activeRealm==='Asia'?'PacificRunner':'NeonRaven',battletag:'DemoPlayer#2400'}];
   extraMessages[channel].forEach((text,index)=>pool.push({...people[index%people.length],text}));
   messagePools[key]=pool;
  }
  if(!messageQueues[key]?.length){
   const queue=[...messagePools[key]];
   for(let index=queue.length-1;index>0;index--){const other=Math.floor(Math.random()*(index+1));[queue[index],queue[other]]=[queue[other],queue[index]];}
   if(queue.length>1&&queue[queue.length-1].text===lastMessages[key]){[queue[0],queue[queue.length-1]]=[queue[queue.length-1],queue[0]];}
   messageQueues[key]=queue;
  }
  const sample=messageQueues[key].pop();lastMessages[key]=sample.text;return sample;
 }

 function markVisibleRead(){if(chatIsVisible())applyChatChannel();}
 document.querySelector('[data-chat-view="lobby"]').addEventListener('click',markVisibleRead);
 document.addEventListener('visibilitychange',markVisibleRead);
 let demoMessageCount=0;
 let gameNoticeTicks=0;
 setInterval(()=>{
  if(document.hidden||document.body.classList.contains('intro-active')||document.body.classList.contains('offline-character')||joinLoadingActive||document.querySelector('dialog[open]:not(#market-shop)'))return;
  if(document.getElementById('market-shop').open&&++gameNoticeTicks%3===0){nextGameSystemNotice();return;}
  if(++demoMessageCount%4===0){
   const openGames=gamesForCharacter().filter(game=>!game.shopItem&&!gameEntryProblem(game));
   if(openGames.length){
    const game=openGames[Math.floor(Math.random()*openGames.length)];
    const inviteTexts={Farming:'Running a few more, got room if anyone wants in.',Quest:'Could use a hand with quests. Anyone up for it?',PvP:'Anyone up for some friendly duels?',Trading:'Trading in town if anyone wants to stop by.'};
    postGameInvite(game,game.activity,{character:'PartyLeader',text:inviteTexts[game.activity]});return;
   }
  }
  const availableChannels=document.getElementById('market-shop').open?[...channels,'Game']:channels;
  const channel=availableChannels[Math.floor(Math.random()*availableChannels.length)];
  const {character,battletag,text}=nextDemoMessage(channel);
  const message=document.createElement('p'),sender=document.createElement('span'),body=document.createElement('span');
  sender.className='player-name';sender.dataset.character=character;sender.dataset.battletag=battletag;sender.textContent=character+':';
  body.className='message-body';body.textContent=' '+text;message.append(sender,body);
  decorateChatMessage(message,channel);if(channel==='Private'){message.dataset.recipient=battletag;privateMessageSound.currentTime=0;privateMessageSound.play().catch(()=>{});}
  message.dataset.unread='true';
  const scrollPosition=chatLog.scrollTop;
  chatLog.append(message);applyChatWordFilter();applyChatChannel();
  chatLog.scrollTop=scrollPosition;chatScrollPosition=scrollPosition;
 },10000);
})();

// Open invitations from other players appear in the activity channels and All.
for(const activity of ['Farming','Quest','PvP']){
 const game=gamesForCharacter().find(entry=>entry.activity===activity&&!entry.shopItem&&!gameEntryProblem(entry));
 if(game)postGameInvite(game,activity,{character:activity==='Quest'?'ActWalker':activity==='PvP'?'DuelWarden':'ChaosRunner',text:activity==='Quest'?'Working through the acts. Anyone need the quests?':activity==='PvP'?'Got room for a few friendly duels.':'Doing a few runs, still got room.'});
}
