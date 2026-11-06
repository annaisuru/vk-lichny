const pages=[...document.querySelectorAll('.page')],nav=[...document.querySelectorAll('.nav-item')];
const titles={feedPage:'Лента',notificationsPage:'Уведомления',messagesPage:'Сообщения',menuPage:'Меню',conversationPage:'Сообщения'};
let currentPage='feedPage', previousPage='menuPage', kind='post', contactMode='friends';
function showPage(id){if(!document.getElementById(id))return;pages.forEach(p=>p.classList.toggle('active',p.id===id));nav.forEach(n=>n.classList.toggle('selected',n.dataset.page===id));currentPage=id;document.getElementById('topTitle').textContent=titles[id]||document.querySelector('#'+id+' .back-row b')?.textContent||'VK Личный';document.getElementById('composeTop').style.visibility=['feedPage','notificationsPage','messagesPage','menuPage'].includes(id)?'visible':'hidden';}
nav.forEach(n=>n.addEventListener('click',()=>showPage(n.dataset.page)));
document.getElementById('goFeed').onclick=()=>showPage('feedPage');
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{previousPage=currentPage;showPage(b.dataset.open)}));
document.querySelectorAll('.back').forEach(b=>b.addEventListener('click',()=>showPage(b.id==='backContacts'?'messagesPage':(currentPage==='editProfilePage'?'profilePage':'menuPage'))));
const dlg=document.getElementById('composer'),postText=document.getElementById('postText');
function openComposer(k='post'){kind=k;document.querySelectorAll('.seg[data-kind]').forEach(b=>b.classList.toggle('active',b.dataset.kind===k));document.getElementById('composerTitle').textContent=k==='story'?'Новая история':'Новая запись';postText.placeholder=k==='story'?'Добавьте подпись к истории…':'Что у вас нового?';document.getElementById('storyOptions').hidden=k!=='story';dlg.showModal();}
document.getElementById('composeTop').onclick=()=>openComposer();document.getElementById('addStory').onclick=()=>openComposer('story');document.getElementById('quickCompose').onclick=()=>openComposer();
document.querySelectorAll('.seg[data-kind]').forEach(b=>b.onclick=()=>openComposer(b.dataset.kind));
document.getElementById('addPhoto').onclick=()=>document.getElementById('mediaInput').click();
document.getElementById('mediaInput').addEventListener('change',e=>{const box=document.getElementById('mediaPreview');box.innerHTML='';[...e.target.files].forEach((f,i)=>{if(f.type.startsWith('image/')){const wrap=document.createElement('div');wrap.className='preview-item';const img=document.createElement('img');img.src=URL.createObjectURL(f);img.alt=f.name;const label=document.createElement('small');label.textContent=(i+1)+'. '+f.name;wrap.append(img,label);box.append(wrap)}else{const s=document.createElement('span');s.textContent='Видео: '+f.name;box.append(s)}})});
function insertText(t){postText.value+=(postText.value?' ':'')+t;postText.focus();}
document.getElementById('addLocation').onclick=()=>insertText('📍 [Место — выбор будет подключён]');
document.getElementById('addMention').onclick=()=>insertText('@[Имя пользователя]');
document.getElementById('addTag').onclick=()=>insertText('#тег');
document.getElementById('addSticker').onclick=()=>alert('Панель стикеров будет подключена на следующем этапе.');
document.getElementById('addPoll').onclick=()=>insertText('Опрос: [вопрос] — [вариант 1] / [вариант 2]');
document.getElementById('addMusic').onclick=()=>alert('Поиск музыки зависит от доступности методов VK API.');
document.getElementById('publishLocal').onclick=e=>{e.preventDefault();const val=postText.value.trim(),files=[...document.getElementById('mediaInput').files];if(!val&&!files.length){alert('Добавьте текст или медиафайл.');return;}if(kind==='post'){const a=document.createElement('article');a.className='post';const h=document.createElement('div');h.className='post-head';h.innerHTML='<div class="avatar a2">А</div><div><b>Ваша страница</b><small>Только что · Локальный макет</small></div>';a.append(h);if(val){const p=document.createElement('p');p.textContent=val;a.append(p)}if(files.length){const m=document.createElement('div');m.className='post-media';files.forEach(f=>{if(f.type.startsWith('image/')){const im=document.createElement('img');im.src=URL.createObjectURL(f);m.append(im)}});a.append(m)}const actions=document.createElement('div');actions.className='post-actions';actions.innerHTML='<button>♡ <span>Нравится</span></button><button>▢ <span>Комментарий</span></button><button>↗ <span>Поделиться</span></button>';a.append(actions);document.getElementById('posts').prepend(a);showPage('feedPage');}else alert('Черновик истории подготовлен в макете. Отправка в VK ещё не подключена.');dlg.close();postText.value='';document.getElementById('mediaInput').value='';document.getElementById('mediaPreview').innerHTML='';};
document.querySelectorAll('[data-notice]').forEach(n=>n.addEventListener('click',()=>{n.classList.add('viewed');n.querySelector('.unread')?.remove();const group=n.closest('.notice-group');const viewed=[...document.querySelectorAll('.notice-group')].find(g=>g.querySelector('h3')?.textContent==='Просмотренные');if(group!==viewed){n.remove();viewed.append(n)}}));
document.getElementById('showAllNotices').onclick=()=>alert('Все уведомления будут загружаться из VK после подключения API.');
document.getElementById('sortFeed').onclick=()=>{const b=document.getElementById('sortFeed');b.textContent=b.textContent.startsWith('Сначала новые')?'Сначала интересные⌄':'Сначала новые⌄';};
document.querySelectorAll('[data-contact-mode]').forEach(b=>b.onclick=()=>{contactMode=b.dataset.contactMode;document.querySelectorAll('[data-contact-mode]').forEach(x=>x.classList.toggle('active',x===b));filterContacts();});
function filterContacts(){const q=document.getElementById('contactSearch').value.toLowerCase();document.querySelectorAll('.contact').forEach((c,i)=>{c.hidden=!!stateFor(c).hidden||!!stateFor(c).deleted||!c.dataset.name.toLowerCase().includes(q)||(contactMode==='recent'&&i>1);});}
document.getElementById('contactSearch').oninput=filterContacts;
function openChat(name){document.getElementById('chatName').textContent=name;document.getElementById('chatStatus').textContent=name==='Митри'?'В сети':'Был недавно';document.getElementById('chatMessages').innerHTML='<div class="bubble incoming">Привет! Это демонстрационный диалог.</div>';showPage('conversationPage');}
document.querySelectorAll('.contact-main').forEach(b=>b.onclick=()=>openChat(b.closest('.contact').dataset.name));
let selectedContact=null;const contactActions=document.getElementById('contactActions');
const CONTACT_STORE='vk-lichny-v03-contact-state';
let contactState={};
try{contactState=JSON.parse(localStorage.getItem(CONTACT_STORE)||'{}')||{};}catch(_){contactState={};}
function saveContactState(){try{localStorage.setItem(CONTACT_STORE,JSON.stringify(contactState));}catch(_){/* Private browsing/storage disabled: current session still works. */}}
function stateFor(el){return contactState[el.dataset.name]||(contactState[el.dataset.name]={});}
function renderContact(el){const st=stateFor(el),info=el.querySelector('.contact-info');
 el.classList.toggle('pinned',!!st.pinned);el.classList.toggle('unread-contact',!!st.unread);el.classList.toggle('is-muted',!!st.muted);el.classList.toggle('is-archived',!!st.archived);el.classList.toggle('is-blocked',!!st.blocked);el.hidden=!!st.hidden||!!st.deleted;
 info.querySelectorAll('.contact-state,.contact-pin,.contact-archive,.contact-blocked').forEach(x=>x.remove());
 const add=(cls,label)=>{const x=document.createElement('small');x.className=cls;x.textContent=label;info.append(x);};
 if(st.pinned)add('contact-pin','Закреплён');if(st.muted)add('contact-state','Без звука');if(st.unread)add('contact-state','Непрочитанное');if(st.archived)add('contact-archive','В архиве');if(st.blocked)add('contact-blocked','Заблокирован в макете');
}
function renderContactActions(){if(!selectedContact)return;const st=stateFor(selectedContact);document.querySelectorAll('[data-contact-action]').forEach(b=>{const a=b.dataset.contactAction;const labels={mute:st.muted?'🔔　Включить звук':'🔕　Отключить звук',pin:st.pinned?'📌　Открепить диалог':'📌　Закрепить диалог',unread:st.unread?'✉️　Снять отметку непрочитанного':'✉️　Пометить непрочитанным',archive:st.archived?'🗃️　Убрать из архива':'🗃️　В архив',hide:'🙈　Скрыть диалог',delete:'🗑️　Удалить диалог',block:st.blocked?'🚫　Разблокировать в макете':'🚫　Заблокировать в макете',clear:'🧹　Очистить историю',report:'⚑　Пожаловаться'};if(labels[a])b.textContent=labels[a];});}
function reorderPinned(){const list=document.getElementById('contacts');[...list.querySelectorAll('.contact')].sort((a,b)=>Number(stateFor(b).pinned)-Number(stateFor(a).pinned)).forEach(el=>list.append(el));}
document.querySelectorAll('.contact').forEach(el=>{renderContact(el);if(stateFor(el).hidden)el.hidden=true;});
reorderPinned();
document.querySelectorAll('.contact-more').forEach(b=>b.onclick=()=>{selectedContact=b.closest('.contact');document.getElementById('contactActionTitle').textContent=selectedContact.dataset.name;renderContactActions();contactActions.showModal();});
document.querySelectorAll('[data-contact-action]').forEach(b=>b.onclick=()=>{if(!selectedContact)return;const action=b.dataset.contactAction,name=selectedContact.dataset.name,st=stateFor(selectedContact);
 if(['mute','pin','unread','archive','block'].includes(action)){const key={mute:'muted',pin:'pinned',unread:'unread',archive:'archived',block:'blocked'}[action];st[key]=!st[key];renderContact(selectedContact);if(action==='pin')reorderPinned();saveContactState();renderContactActions();return;}
 if(action==='clear'){if(confirm('Очистить локальную демонстрационную историю диалога с «'+name+'»?')){if(document.getElementById('chatName').textContent===name)document.getElementById('chatMessages').replaceChildren();alert('Локальная история очищена. Данные VK не затронуты.');}}
 else if(action==='hide'){if(confirm('Скрыть контакт «'+name+'» только в этом макете?')){selectedContact.hidden=true;st.hidden=true;saveContactState();}}
 else if(action==='delete'){if(confirm('Удалить контакт «'+name+'» из демонстрационного списка? Это действие нельзя отменить.')){st.deleted=true;selectedContact.hidden=true;saveContactState();selectedContact=null;}}
 else if(action==='report'){alert('Жалоба не отправляется: функция доступна только после разрешённой интеграции VK.');}
 contactActions.close();});
document.getElementById('newChat').onclick=()=>{showPage('messagesPage');document.getElementById('contactSearch').focus();};
document.getElementById('backContacts').onclick=()=>showPage('messagesPage');
document.getElementById('sendMessage').onclick=()=>{const i=document.getElementById('messageInput'),v=i.value.trim();if(!v)return;const b=document.createElement('div');b.className='bubble outgoing';b.textContent=v;document.getElementById('chatMessages').append(b);i.value='';document.getElementById('chatMessages').scrollTop=99999;};
document.getElementById('messageInput').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('sendMessage').click()});
document.getElementById('emojiBtn').onclick=()=>document.getElementById('emojiPanel').classList.toggle('open');
document.querySelectorAll('#emojiPanel button').forEach(b=>b.onclick=()=>{document.getElementById('messageInput').value+=b.textContent;});
document.getElementById('attachBtn').onclick=()=>alert('Вложения будут доступны после подключения загрузки файлов.');
document.getElementById('themeSelect').onchange=e=>document.body.classList.toggle('dark',e.target.value==='dark');
