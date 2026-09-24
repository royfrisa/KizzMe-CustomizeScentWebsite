const BAG_KEY = 'kizzme-demo-bag';
const TEAM_SEEN_KEY = 'kizzme-team-intro-seen';
const money = amount => `฿${Number(amount).toLocaleString('en-US')}`;
let memoryBag = [];

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const getBag = () => { try { const saved = JSON.parse(localStorage.getItem(BAG_KEY) || '[]'); if (Array.isArray(saved)) memoryBag = saved; } catch {} return memoryBag; };
function updateBagCount() {
  const count = getBag().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  document.querySelectorAll('.bag-count').forEach(el => { el.textContent = count; });
}
function saveBag(bag) { memoryBag = bag; try { localStorage.setItem(BAG_KEY, JSON.stringify(bag)); } catch {} updateBagCount(); }
let toastTimer;
function showToast(message) {
  const toast = document.querySelector('.toast'); if (!toast) return;
  toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}
function buildCompletionDialog() {
  let overlay = document.querySelector('#completion-dialog');
  if (overlay) return overlay;
  overlay = document.createElement('div'); overlay.id = 'completion-dialog'; overlay.className = 'modal-overlay';
  overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-labelledby','completion-title');
  overlay.innerHTML = '<section class="dialog"><span class="dialog-ornament">✳</span><p class="eyebrow">KIZZME · JOURNEY COMPLETE</p><h2 id="completion-title"></h2><p class="dialog-copy" id="completion-copy"></p><div class="completion-details" id="completion-details"></div><div class="dialog-actions"><a class="button button-light" id="completion-primary"></a><button class="button button-outline" type="button" data-dialog-close>Continue exploring</button></div></section>';
  document.body.append(overlay); return overlay;
}
function openDialog(overlay) { overlay.classList.add('active'); document.body.classList.add('modal-open'); overlay.querySelector('button, a')?.focus(); }
function closeDialog(overlay) { overlay.classList.remove('active'); document.body.classList.remove('modal-open'); }
function showCompletion({title, message, details = '', href = 'index.html', action = 'Return home'}) {
  const overlay = buildCompletionDialog();
  overlay.querySelector('#completion-title').textContent = title;
  overlay.querySelector('#completion-copy').textContent = message;
  overlay.querySelector('#completion-details').textContent = details;
  const primary = overlay.querySelector('#completion-primary'); primary.href = href; primary.innerHTML = `${escapeHTML(action)} <span>↗</span>`;
  openDialog(overlay);
}
const teamModal = document.querySelector('#team-intro');
function closeTeamModal() {
  if (!teamModal) return;
  closeDialog(teamModal);
  try { sessionStorage.setItem(TEAM_SEEN_KEY, '1'); } catch {}
}
if (teamModal) {
  let hasSeenTeam = false;
  try { hasSeenTeam = sessionStorage.getItem(TEAM_SEEN_KEY) === '1'; } catch {}
  if (!hasSeenTeam) requestAnimationFrame(() => openDialog(teamModal));
  document.querySelector('#enter-site')?.addEventListener('click', closeTeamModal);
  teamModal.addEventListener('click', event => { if (event.target === teamModal) closeTeamModal(); });
}
document.addEventListener('click', event => {
  if (event.target.classList?.contains('modal-overlay') && event.target.id !== 'team-intro') closeDialog(event.target);
  const closeButton = event.target.closest('[data-dialog-close]');
  if (closeButton) closeDialog(closeButton.closest('.modal-overlay'));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    const active = document.querySelector('.modal-overlay.active');
    if (active?.id === 'team-intro') closeTeamModal();
    else if (active) closeDialog(active);
  }
});
document.querySelector('#completion-dialog')?.addEventListener('click', event => { if (event.target.id === 'completion-dialog') closeDialog(event.target); });

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
  nav?.classList.toggle('open', !expanded);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false'); menuButton?.setAttribute('aria-label', 'Open menu');
}));

function addBagItem(item) {
  const bag = getBag(); const existing = bag.find(entry => entry.name === item.name && entry.detail === item.detail);
  if (existing) existing.quantity += 1;
  else bag.push({...item, quantity: 1});
  saveBag(bag);
}
document.querySelectorAll('.add-to-bag').forEach(button => button.addEventListener('click', () => {
  addBagItem({name: button.dataset.product, price: Number(button.dataset.price), image: button.dataset.image, kind: 'product'});
  showCompletion({title: 'A lovely choice.', message: `${button.dataset.product} has been added to your bag.`, details: 'Your fragrance is waiting whenever you are.', href: 'bag.html', action: 'View your bag'});
}));

document.querySelector('.newsletter-form')?.addEventListener('submit', event => {
  event.preventDefault(); event.currentTarget.reset();
  showCompletion({title: 'You’re on the list.', message: 'A little note from the fragrance house will find its way to you soon.', href: 'collections.html', action: 'Discover fragrance'});
});
document.querySelector('.demo-form')?.addEventListener('submit', event => {
  event.preventDefault(); event.currentTarget.reset();
  showCompletion({title: 'A moment, reserved.', message: 'Your consultation request is ready. This demo keeps your details on this device and does not send them to a service.', details: 'Our fragrance team would follow up to confirm a time.', href: 'index.html', action: 'Back to the home page'});
});

const productGrid = document.querySelector('#product-grid');
document.querySelector('#sort-products')?.addEventListener('change', event => {
  const cards = [...productGrid.querySelectorAll('.product-card')];
  if (event.target.value === 'low') cards.sort((a,b) => Number(a.dataset.price) - Number(b.dataset.price));
  if (event.target.value === 'high') cards.sort((a,b) => Number(b.dataset.price) - Number(a.dataset.price));
  if (event.target.value === 'featured') cards.sort((a,b) => ['Rose No. 01','Santal No. 04','Amber No. 07','Noir No. 09'].indexOf(a.dataset.name) - ['Rose No. 01','Santal No. 04','Amber No. 07','Noir No. 09'].indexOf(b.dataset.name));
  cards.forEach(card => productGrid.append(card));
});

const FAMILY_DATA = {
  Floral: {emoji:'✿', desc:'Petals, softness, and the quiet romance of skin.', notes:['Rose','Jasmine','Peony','Iris']},
  Woody: {emoji:'⌁', desc:'Warm woods, grounded texture, and lingering depth.', notes:['Sandalwood','Cedar','Vetiver','Oud']},
  Citrus: {emoji:'☼', desc:'Bright citrus, fresh air, and an effortless lift.', notes:['Bergamot','Lemon','Neroli','Grapefruit']},
  Oriental: {emoji:'✧', desc:'Rich amber, spice, and a sensual, golden warmth.', notes:['Amber','Vanilla','Cardamom','Tonka']}
};
const SIZE_DATA = [
  {label:'Small', ml:'30 ml', price:199},
  {label:'Medium', ml:'50 ml', price:399},
  {label:'Full', ml:'100 ml', price:600}
];
const PACK_DATA = [{label:'Classic',price:0,desc:'Included'},{label:'Luxury Box',price:150,desc:'Gift-ready · +฿150'}];
let wizardStep = 1;
const blend = {family:'',top:'',heart:'',base:'',size:'',packaging:'',engraving:''};
const wizard = document.querySelector('#wizard-content');
function calcBlendPrice() {
  const size = SIZE_DATA.find(item => item.label === blend.size);
  const pack = PACK_DATA.find(item => item.label === blend.packaging);
  return (size?.price || 199) + (pack?.price || 0) + (blend.engraving.trim() ? 50 : 0);
}
function optionCard({group,value,description='',selected=false,mark=''}) {
  return `<button type="button" class="option-card ${selected?'selected':''}" data-group="${group}" data-value="${escapeHTML(value)}" aria-pressed="${selected}"><span class="option-mark">${mark}</span><span class="option-name">${escapeHTML(value)}</span>${description?`<span class="option-desc">${escapeHTML(description)}</span>`:''}</button>`;
}
function renderWizard() {
  if (!wizard) return;
  const family = FAMILY_DATA[blend.family];
  document.querySelectorAll('.step-dot').forEach((dot,index) => { dot.classList.toggle('active',index + 1 === wizardStep); dot.classList.toggle('done',index + 1 < wizardStep); });
  document.querySelector('#step-dots').setAttribute('aria-label',`Step ${wizardStep} of 3`);
  if (wizardStep === 1) {
    wizard.innerHTML = `<h3 class="wizard-step-title">Choose your fragrance family</h3><p class="wizard-instruction">Begin with the mood you want to wear. You can refine the notes next.</p><div class="wizard-options">${Object.entries(FAMILY_DATA).map(([name,data]) => optionCard({group:'family',value:name,description:data.desc,selected:blend.family===name,mark:data.emoji})).join('')}</div><div class="wizard-nav"><span></span><button class="button button-light" type="button" data-next ${!blend.family?'disabled':''}>Choose your notes <span>→</span></button></div>`;
  } else if (wizardStep === 2) {
    const notes = family.notes;
    wizard.innerHTML = `<h3 class="wizard-step-title">Build your fragrance pyramid</h3><p class="wizard-instruction">Choose one note for each layer—from first impression to the warmth that lingers.</p>${[['top','Top note','The first impression'],['heart','Heart note','The character at its center'],['base','Base note','The lasting impression']].map(([key,label,description])=>`<div class="wizard-note-group"><span class="caption">${label} <span>· ${description}</span></span><div class="wizard-options notes">${notes.map(note=>optionCard({group:key,value:note,selected:blend[key]===note})).join('')}</div></div>`).join('')}<div class="wizard-nav"><button class="button button-outline" type="button" data-back>← Previous</button><button class="button button-light" type="button" data-next ${!(blend.top&&blend.heart&&blend.base)?'disabled':''}>Choose your finishing touches <span>→</span></button></div>`;
  } else {
    wizard.innerHTML = `<h3 class="wizard-step-title">The finishing touches</h3><p class="wizard-instruction">Choose your bottle size, packaging, and a personal engraving if you wish.</p><span class="caption">Bottle size</span><div class="wizard-options sizes">${SIZE_DATA.map(size=>optionCard({group:'size',value:size.label,description:`${size.ml} · ${money(size.price)}`,selected:blend.size===size.label})).join('')}</div><span class="caption">Packaging</span><div class="wizard-options packages">${PACK_DATA.map(pack=>optionCard({group:'packaging',value:pack.label,description:pack.desc,selected:blend.packaging===pack.label})).join('')}</div><label class="engraving-label" for="engraving">Optional engraving · +฿50</label><input class="engraving-input" id="engraving" maxlength="12" value="${escapeHTML(blend.engraving)}" placeholder="A name or a few meaningful letters"><div class="wizard-nav"><button class="button button-outline" type="button" data-back>← Back to notes</button><button class="button button-light" type="button" data-order ${!(blend.size&&blend.packaging)?'disabled':''}>Add bespoke scent · ${money(calcBlendPrice())} <span>↗</span></button></div>`;
  }
  updateBlendSummary();
}
function updateBlendSummary() {
  const family = FAMILY_DATA[blend.family];
  document.querySelector('#p-scent').textContent = blend.family || '—';
  document.querySelector('#p-top').textContent = blend.top || '—';
  document.querySelector('#p-heart').textContent = blend.heart || '—';
  document.querySelector('#p-base').textContent = blend.base || '—';
  document.querySelector('#p-size').textContent = blend.size ? `${blend.size} (${SIZE_DATA.find(item=>item.label===blend.size).ml})` : '—';
  document.querySelector('#p-pkg').textContent = blend.packaging || '—';
  document.querySelector('#p-price').textContent = money(calcBlendPrice());
  document.querySelector('#preview-name').textContent = family ? `${blend.family} Blend` : 'Your fragrance';
  document.querySelector('#preview-desc').textContent = family ? family.desc : 'Begin by choosing the fragrance family that draws you in.';
  const art = document.querySelector('#preview-art');
  const darkPack = ['Woody','Oriental'].includes(blend.family);
  art.src = darkPack ? 'imgs/perfume_another_color_cutout.webp' : 'imgs/perfume_hero_cutout.webp';
  art.alt = `KIZZME ${blend.family || 'bespoke'} fragrance presentation`;
}
if (wizard) {
  renderWizard();
  wizard.addEventListener('click', event => {
    const option = event.target.closest('[data-group]');
    if (option) {
      const group = option.dataset.group, value = option.dataset.value;
      blend[group] = value;
      if (group === 'family') { blend.top=''; blend.heart=''; blend.base=''; }
      renderWizard(); return;
    }
    if (event.target.closest('[data-next]')) { wizardStep = Math.min(3,wizardStep + 1); renderWizard(); return; }
    if (event.target.closest('[data-back]')) { wizardStep = Math.max(1,wizardStep - 1); renderWizard(); return; }
    if (event.target.closest('[data-order]')) {
      if (!(blend.family && blend.top && blend.heart && blend.base && blend.size && blend.packaging)) return;
      const details = `${blend.family} · ${blend.top} / ${blend.heart} / ${blend.base} · ${SIZE_DATA.find(item=>item.label===blend.size).ml} · ${blend.packaging}${blend.engraving.trim()?` · Engraved “${blend.engraving.trim()}”`:''}`;
      const productName = `${blend.family} Bespoke Blend`;
      addBagItem({name:productName,price:calcBlendPrice(),kind:'bespoke',mood:blend.family,detail:details,image:['Woody','Oriental'].includes(blend.family)?'imgs/perfume_another_color_cutout.webp':'imgs/perfume_hero_cutout.webp'});
      showCompletion({title:'Your scent is taking shape.',message:'Your bespoke composition has been added to your bag. This demo does not process an order or payment.',details,href:'bag.html',action:'Review your bag'});
    }
  });
  wizard.addEventListener('input', event => {
    if (event.target.id === 'engraving') { blend.engraving = event.target.value; updateBlendSummary(); const button=wizard.querySelector('[data-order]'); if (button) button.innerHTML=`Add bespoke scent · ${money(calcBlendPrice())} <span>↗</span>`; }
  });
}

const bagItems = document.querySelector('#bag-items');
function renderBag() {
  if (!bagItems) return;
  const bag = getBag(), summary = document.querySelector('#bag-summary');
  if (!bag.length) {
    bagItems.innerHTML = '<div class="empty-bag"><span class="empty-mark">✳</span><p class="eyebrow">A little room for discovery</p><h2>Your bag is waiting.</h2><p>When a fragrance feels like yours, you’ll find it here.</p><a class="button button-light" href="collections.html">Explore the collection <span>↗</span></a></div>';
    summary.hidden = true; return;
  }
  summary.hidden = false;
  bagItems.innerHTML = bag.map((item,index) => `<article class="bag-item"><div class="placeholder bag-product-image"><img class="real-photo bag-photo" src="${escapeHTML(item.image||'imgs/perfume_hero_cutout.webp')}" alt="KIZZME perfume bottle and gift box" loading="lazy"></div><div class="bag-item-info"><p class="eyebrow">${item.kind==='bespoke'?`Bespoke · ${escapeHTML(item.mood||'Personal')}`:'Eau de parfum · 50 ml'}</p><h2>${escapeHTML(item.name)}</h2><p>${escapeHTML(item.detail||'Hand-finished fragrance')}</p><div class="quantity-control"><button type="button" data-action="decrease" data-index="${index}" aria-label="Decrease quantity">−</button><span>${Number(item.quantity)||1}</span><button type="button" data-action="increase" data-index="${index}" aria-label="Increase quantity">+</button><button type="button" class="remove-item" data-action="remove" data-index="${index}">Remove</button></div></div><strong class="bag-item-price">${money(item.price*item.quantity)}</strong></article>`).join('');
  const total=bag.reduce((sum,item)=>sum+Number(item.price)*Number(item.quantity),0);
  document.querySelector('#bag-subtotal').textContent=money(total); document.querySelector('#bag-total').textContent=money(total);
}
bagItems?.addEventListener('click', event => {
  const button=event.target.closest('[data-action]'); if (!button) return;
  const bag=getBag(),index=Number(button.dataset.index),item=bag[index]; if (!item) return;
  if (button.dataset.action==='increase') item.quantity+=1;
  if (button.dataset.action==='decrease') item.quantity-=1;
  if (button.dataset.action==='remove'||item.quantity<=0) bag.splice(index,1);
  saveBag(bag); renderBag();
});
document.querySelector('.checkout-button')?.addEventListener('click', () => {
  saveBag([]); renderBag();
  showCompletion({title:'Consider it yours.',message:'Your demo order is complete. No payment was collected and no order was sent to a store.',details:'Thank you for discovering KIZZME.',href:'collections.html',action:'Explore more scents'});
});
updateBagCount(); renderBag();
