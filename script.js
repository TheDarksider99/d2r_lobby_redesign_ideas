// Reserve right-click for the lobby UI, including its custom action menus.
document.addEventListener('contextmenu', event => {
 event.preventDefault();
}, {capture:true, passive:false});

let openTradingShop = null;
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
const list=document.getElementById('game-list');const search=document.getElementById('search');const tzToggle=document.getElementById('tz-toggle');const activityFilter=document.getElementById('activity-filter');let selectedName=names[0];let detailTab='settings';let sortKey=null;let sortAsc=true;let playersSortMode=0;let tzMode='all';let lastRefresh=Date.now();const ageFilterToggle=document.getElementById('age-filter-toggle');const ageFilterPanel=document.getElementById('age-filter-panel');const ageFilterValue=document.getElementById('age-filter-value');const ageFilterUnit=document.getElementById('age-filter-unit');const ageFilterEnabled=document.getElementById('age-filter-enabled');
function formatTime(seconds){if(seconds<60)return `${seconds}s`;const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60);return `${h}:${String(m).padStart(2,'0')}`}
function formatDetailedTime(seconds){const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),sec=seconds%60;return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderDetails(){const g=games.find(x=>x.name===selectedName);const el=document.getElementById('game-details');if(!g){el.textContent='Select a game';return;}if(detailTab==='settings'){el.innerHTML=`<p>Elapsed Time</p><strong>${formatDetailedTime(g.elapsedSeconds)}</strong><p>Level Restrictions</p><strong>Any</strong><p>Item Spacing</p><strong>Resurrected</strong><p>Description</p><strong>${escapeHtml(g.description||'—')}</strong>`;}else{el.innerHTML=`<p>Players (${g.players}/${g.maxPlayers})</p>${Array.from({length:g.players},(_,i)=>`<strong style="margin:8px 0">${i===0?'Host':`Player ${i+1}`}</strong>`).join('')}`;}document.querySelectorAll('.detail-tab').forEach(b=>b.classList.toggle('active',b.dataset.detail===detailTab));}
document.querySelectorAll('.detail-tab').forEach(b=>b.addEventListener('click',()=>{detailTab=b.dataset.detail;renderDetails()}));
document.querySelectorAll('.game-header [data-sort]').forEach(h=>h.addEventListener('click',()=>{const key=h.dataset.sort;if(key==='players'){playersSortMode=sortKey==='players'?(playersSortMode+1)%3:0;sortKey=key;sortAsc=playersSortMode!==1}else{if(sortKey===key){sortAsc=!sortAsc}else{sortKey=key;sortAsc=true}}render()}));
function render(){const q=search.value.toLowerCase();list.innerHTML='';if(document.body.classList.contains('offline-character')){document.getElementById('game-details').innerHTML='';return;}document.querySelectorAll('.game-header [data-sort]').forEach(h=>{h.classList.toggle('sorted',h.dataset.sort===sortKey);h.title=h.dataset.sort===sortKey?(sortKey==='players'&&playersSortMode===2?'Ascending ▲ (full games last)':sortAsc?'Ascending ▲':'Descending ▼'):'Click to sort'});let visible=games.filter(g=>g.difficulty===selectedDifficulty&&g.name.toLowerCase().includes(q)&&(activityFilter.value==='all'||g.activity===activityFilter.value)&&(tzMode==='all'||(tzMode==='tz'&&g.tz)||(tzMode==='non-tz'&&!g.tz))&&(!ageFilterEnabled.checked||g.elapsedSeconds<Math.max(1,Number(ageFilterValue.value)||1)*(ageFilterUnit.value==='hours'?3600:60)));if(sortKey){visible.sort((a,b)=>{if(sortKey==='players'&&playersSortMode===2){const af=a.players>=a.maxPlayers,bf=b.players>=b.maxPlayers;if(af!==bf)return af?1:-1;}let av=a[sortKey],bv=b[sortKey];if(typeof av==='string'){return (sortAsc?1:-1)*av.localeCompare(bv)}return (sortAsc?1:-1)*(av-bv)})}visible.forEach(g=>{const row=document.createElement('div');row.className='game'+(g.name===selectedName?' selected':'');row.innerHTML=`<span class="activity-${g.activity.toLowerCase()}">${g.name}</span><span class="activity-${g.activity.toLowerCase()}">${g.activity}</span><span class="${g.players>=g.maxPlayers?'full-players':'gold'}">${g.players}/${g.maxPlayers}</span><span>${formatTime(g.elapsedSeconds)}</span><span title="${g.tz?'Terror Zone':'Normal game'}" class="${g.tz?'gold':''}">${g.tz?'✦':''}</span><span title="Ping indicator" class="${g.ping}">●</span>`;row.onclick=()=>{selectedName=g.name;document.querySelector('.fields input').value=g.name;render()};list.appendChild(row)});renderDetails()}
search.addEventListener('input',render);activityFilter.addEventListener('change',render);
tzToggle.addEventListener('click',()=>{tzMode=tzMode==='all'?'tz':tzMode==='tz'?'non-tz':'all';tzToggle.dataset.mode=tzMode;tzToggle.setAttribute('aria-pressed',String(tzMode!=='all'));tzToggle.textContent=tzMode==='all'?'TZ: All':tzMode==='tz'?'TZ: Only':'TZ: None';tzToggle.title=tzMode==='all'?'Show all games':tzMode==='tz'?'Show Terror Zone games only':'Show non-Terror Zone games only';render()});
function updateAgeFilter(){const active=ageFilterEnabled.checked;const n=Math.max(1,Number(ageFilterValue.value)||1);ageFilterToggle.textContent=active?`⏱ <${n}${ageFilterUnit.value==='hours'?'h':'m'}`:'⏱ Age: Off';ageFilterToggle.classList.toggle('age-active',active);ageFilterToggle.title=active?`Hide games open for ${n} ${ageFilterUnit.value} or longer`:'Hide games older than a selected age';render();}
ageFilterToggle.addEventListener('click',()=>{ageFilterPanel.hidden=!ageFilterPanel.hidden;ageFilterToggle.setAttribute('aria-expanded',String(!ageFilterPanel.hidden));});
[ageFilterValue,ageFilterUnit,ageFilterEnabled].forEach(el=>el.addEventListener('input',updateAgeFilter));
document.addEventListener('click',event=>{if(!event.target.closest('.age-filter-wrap')){ageFilterPanel.hidden=true;ageFilterToggle.setAttribute('aria-expanded','false');}});
document.getElementById('refresh').addEventListener('click',()=>{const now=Date.now();const delta=Math.floor((now-lastRefresh)/1000);if(delta>0){games.forEach(g=>{if(!g.demoShortTime)g.elapsedSeconds+=delta;});lastRefresh+=delta*1000;}render();const b=document.getElementById('refresh');b.textContent='✓';setTimeout(()=>b.textContent='⟳',550)});
document.getElementById('level-difference').addEventListener('change',e=>{document.getElementById('level-difference-value').disabled=!e.target.checked;});
let selectedDifficulty='Hell';
document.querySelectorAll('.difficulty-button').forEach(button=>button.addEventListener('click',()=>{selectedDifficulty=button.dataset.difficulty;document.querySelectorAll('.difficulty-button').forEach(b=>b.classList.toggle('active',b===button));selectedName=games.find(g=>g.difficulty===selectedDifficulty)?.name||null;render();}));
document.getElementById('create-game').addEventListener('click',()=>{const name=document.querySelector('.fields input').value.trim();if(!name){alert('Enter a game name first.');return;}const description=document.getElementById('game-description').value.trim();const existing=games.find(g=>g.name.toLowerCase()===name.toLowerCase());if(existing){alert('That game name already exists in the mock list.');return;}games.unshift({name,description,levelDifference:document.getElementById('level-difference').checked?Number(document.getElementById('level-difference-value').value):null,friendsJoining:document.getElementById('friends-joining').checked,itemSpacing:document.getElementById('item-spacing').checked,players:1,maxPlayers:Math.max(2,Math.min(8,Number(document.getElementById('max-players').value)||8)),elapsedSeconds:0,demoShortTime:true,tz:document.getElementById('terrorized').checked,ping:'green',activity:document.getElementById('create-activity').value,difficulty:selectedDifficulty});selectedName=name;render();});
document.getElementById('join-game').addEventListener('click',()=>{
 const name=document.getElementById('game-name').value.trim() || selectedName;
 const game=games.find(g=>g.name.toLowerCase()===name?.toLowerCase());
 if(game?.shopItem && openTradingShop){openTradingShop(game.shopItem);return;}
 if(name)playJoinGameLoading(()=>alert('Prototype: Join '+name));else alert('Select a game to join.');
});
render();

// Chat word filter: hide matching messages without deleting them; preserves system toggle behavior.
const chatFilterButton=document.getElementById('chat-filter-toggle');
const chatFilterPanel=document.getElementById('chat-filter-panel');
const chatFilterWords=document.getElementById('chat-filter-words');
chatFilterButton.addEventListener('click',()=>{const open=chatFilterPanel.classList.toggle('open');chatFilterPanel.hidden=!open;chatFilterButton.setAttribute('aria-expanded',String(open));chatFilterButton.setAttribute('aria-pressed',String(open));if(open)chatFilterWords.focus();});
function applyChatWordFilter(){const terms=chatFilterWords.value.split(',').map(word=>word.trim().toLocaleLowerCase()).filter(Boolean);document.querySelectorAll('#chat > p').forEach(p=>{p.classList.toggle('word-filtered',terms.some(term=>p.textContent.toLocaleLowerCase().includes(term)));});}
chatFilterWords.addEventListener('input',applyChatWordFilter);
document.getElementById('system-toggle').addEventListener('click',()=>{const chat=document.getElementById('chat');const hidden=chat.classList.toggle('hide-system');const btn=document.getElementById('system-toggle');btn.setAttribute('aria-pressed',String(hidden));btn.textContent=hidden?'Show System':'Hide System';});
const chatChannel=document.getElementById('chat-channel');
const chatLog=document.getElementById('chat');
const channelColors={All:'#e6e3de',Lobby:'#d5b968',Clan:'#70ce78',Trading:'#edb35e',PvP:'#f07171',Farming:'#70c7dd',Quest:'#bb99ee','NeonRaven#119404':'#e69ccc','PearlImp#12912':'#e69ccc'};
const channelIcons={Lobby:'\u25c6',Clan:'\u2663',Trading:'\u2696',PvP:'\u2694',Farming:'\u2660',Quest:'\u2726'};
function chatChannelLabel(channel){return channel.includes('#')?channel.split('#')[0]:channel;}
function decorateChatMessage(message,channel){
 message.dataset.channel=channel;
 message.style.setProperty('--channel-color',channelColors[channel]);
 const tag=document.createElement('span');tag.className='channel-tag';
 const label=channel.includes('#')?'Private message':channel;
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
 ['PearlImp#12912','PearlImp','PearlImp#12912','I saved that shield for you.']
];
const lobbyMessages=Array.from(chatLog.children);
const sampleMessages=[];
channelSamples.forEach(([channel,character,battletag,text])=>{
 const message=document.createElement('p'),sender=document.createElement('span');
 sender.className='player-name';sender.dataset.character=character;sender.dataset.battletag=battletag;sender.textContent=character+':';
 message.append(sender,document.createTextNode(' '+text));decorateChatMessage(message,channel);sampleMessages.push(message);
});
// Interleave the mock conversation in a stable chronological sequence.
const sampleOrder=[0,4,2,8,6,10,1,3,7,11,5,9];
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
Array.from(chatChannel.options).forEach(option=>{const channel=option.value;option.value=channel;option.textContent=chatChannelLabel(channel);option.style.color=channelColors[channel];option.style.backgroundColor='#111214';});
function applyChatChannel(){
 const channel=chatChannel.value;
 chatLog.classList.toggle('all-channels',channel==='All');chatChannel.style.color=channelColors[channel];
 document.getElementById('message').placeholder='['+chatChannelLabel(channel)+']';
 chatLog.querySelectorAll(':scope > p').forEach(message=>message.classList.toggle('channel-filtered',channel!=='All'&&message.dataset.channel!==channel));
}
chatChannel.addEventListener('change',applyChatChannel);applyChatChannel();
document.getElementById('chat-form').onsubmit=e=>{
 e.preventDefault();const input=document.getElementById('message');if(!input.value.trim())return;
 const message=document.createElement('p'),sender=document.createElement('span');sender.className='chat-self';sender.textContent='You:';
 message.append(sender,document.createTextNode(' '+input.value));decorateChatMessage(message,chatChannel.value==='All'?'Lobby':chatChannel.value);chatLog.append(message);
 applyChatWordFilter();applyChatChannel();input.value='';message.scrollIntoView({block:'nearest'});
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
  const input=document.getElementById('message');input.value='/w '+contextPlayer.battletag+' ';input.focus();
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
const characterData={online:[['Aldric','91','Barbarian'],['Seraphine','88','Sorceress'],['Kaelen','82','Paladin'],['Nyx','76','Assassin'],['Thorn','70','Druid'],['Elowen','65','Amazon'],['Mordren','58','Necromancer'],['Briar','42','Druid'],['Valen','29','Paladin']],offline:[['Ronan','73','Barbarian'],['Mira','61','Sorceress'],['Sylas','35','Necromancer']]};
const recentDeleted={online:[],offline:[]};
let characterMode='online',chosenCharacter='Aldric',characterSort='custom',characterSortAscending=true,draggedCharacter=null;
const classSymbols={Barbarian:'⚔',Sorceress:'✧',Paladin:'🛡',Assassin:'⚒',Druid:'🐺',Amazon:'🏹',Necromancer:'☠'};
function updateCenterCharacter(){
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
 const button=document.createElement('button');button.type='button';button.className='character-entry'+(chosenCharacter===name?' selected':'');button.dataset.character=name;
 const handle=document.createElement('span');handle.className='character-drag';handle.textContent='⠿';handle.title='Drag to reorder';handle.setAttribute('aria-label','Drag '+name+' to reorder');handle.draggable=true;
 const label=document.createElement('span');label.textContent=`${index+1}. ${name}`;const sub=document.createElement('small');sub.textContent=`Level ${level} ${cls}`;const portrait=document.createElement('img');portrait.className='character-portrait';portrait.src='img/'+cls.toLowerCase()+'.png';portrait.alt='';portrait.width=44;portrait.height=44;const info=document.createElement('span');info.className='character-info';info.append(label,sub);button.append(handle,portrait,info);
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
document.getElementById('refresh-characters').addEventListener('click',renderCharacters);
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
 if(action==='Whisper'){document.querySelector('[data-chat-view="lobby"]').click();const input=document.getElementById('message');input.value='/w '+(row.querySelector('.friend-name')?.dataset.battletag||name)+' ';input.focus();}
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
  lockedShopItem = null;
  visiting = item;
  document.getElementById('market-shop-title').textContent = `${item.seller}’s Shop`;
  document.getElementById('shop-trade-view').hidden = true;
  document.getElementById('shop-arrival').hidden = false;
  renderGameShop(); selectShopItem(item);
  dialog.showModal();
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
  if (!document.getElementById('shop-trade-view').hidden) {
   event.preventDefault(); document.querySelector('[data-close-trade]').click();
  }
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
 document.getElementById('market-leave').addEventListener('click', () => dialog.close());
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
const realmStates={America:{games, messages:Array.from(chatLog.children)}};
function buildRealm(server){
 const realmNames=realmGameNames[server];
 const realmGames=realmStates.America.games.slice(0,32).map((game,index)=>({...game,name:realmNames[index%realmNames.length]+(index>=realmNames.length?' '+(Math.floor(index/realmNames.length)+1):''),description:server==='Europe'?'Europe community runs, all welcome':'Asia community runs, all welcome',shopItem:undefined}));
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
 return {games:realmGames,messages};
}
let activeRealm='America';
let playServerConnection=null;
function switchRealm(server){
 realmStates[activeRealm]={games,messages:Array.from(chatLog.children)};
 activeRealm=server;
 const state=realmStates[activeRealm]||(realmStates[activeRealm]=buildRealm(activeRealm));
 games=state.games;chatLog.replaceChildren(...state.messages);
 selectedName=games.find(game=>game.difficulty===selectedDifficulty)?.name||null;
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
  const sound=control.matches('#create-game,#market-buy,#join-game')?1:control.matches(tabSelector)?3:2;
  playButtonSound(sound);
 },true);
 document.addEventListener('change',event=>{if(event.target.matches('select'))playButtonSound(2);},true);
})();

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
