import { loadPortfolio, imageUrl, fallbackCategories, fallbackPhrases, defaultMenuPositions } from './supabase.js';
import { openAdmin } from './admin.js';

const state = { data: null, currentCategory: null, cardIndexes: {}, modalWork: null, modalIndex: 0, typingTimer: null, bubbleTimer: null, hoverSlug: null };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const views = { home: $('#home-view'), catalog: $('#catalog-view'), contacts: $('#contacts-view') };

function showView(name) { Object.entries(views).forEach(([key, view]) => { const active = key === name; view.hidden = !active; view.classList.toggle('is-active', active); }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function category(slug) { return state.data.categories.find(item => item.slug === slug) || fallbackCategories.find(item => item.slug === slug); }
function randomPhrase(slug) { const pool = state.data.phrases?.[slug] || fallbackPhrases[slug] || ['Система готова.']; return pool[Math.floor(Math.random() * pool.length)]; }
function setHover(slug, active) { const cat = category(slug); const label = $('#scene-label'); const bubble = $('#speech-bubble'); const character = $('#character-trigger'); clearInterval(state.typingTimer); clearInterval(state.bubbleTimer); if (active) { state.hoverSlug = slug; const text = cat?.title || slug; const phrase = randomPhrase(slug); let index = 0; let phraseIndex = 0; label.textContent = ''; bubble.textContent = ''; label.classList.add('is-visible'); bubble.classList.add('is-visible'); character.classList.add('is-reacting'); state.typingTimer = setInterval(() => { label.textContent = text.slice(0, ++index); if (index >= text.length) clearInterval(state.typingTimer); }, 55); state.bubbleTimer = setInterval(() => { bubble.textContent = phrase.slice(0, ++phraseIndex); if (phraseIndex >= phrase.length) clearInterval(state.bubbleTimer); }, 38); } else { state.hoverSlug = null; label.classList.remove('is-visible'); bubble.classList.remove('is-visible'); character.classList.remove('is-reacting'); } }
function renderContacts() { const list = $('#contacts-list'); const contacts = state.data.contacts || []; list.innerHTML = contacts.length ? contacts.map(contact => `<a class="contact-link" href="${escapeAttr(contact.href || contact.value)}" target="_blank" rel="noreferrer"><span>${escapeHtml(contact.label)}</span><span>${escapeHtml(contact.value)}</span></a>`).join('') : '<div class="empty-state">Контакты пока не добавлены.<br>Откройте админ-консоль тройным кликом по персонажу.</div>'; }
function renderCatalog(slug) { const cat = category(slug); state.currentCategory = slug; $('#catalog-title').textContent = cat?.title || slug; $('#category-number').textContent = String(cat?.sort_order || 1).padStart(2, '0'); const works = state.data.works?.[slug] || []; const grid = $('#works-grid'); grid.innerHTML = works.length ? works.map(workCard).join('') : '<div class="empty-state">В этой вкладке пока нет работ.<br>Добавьте первую работу через админ-консоль.</div>'; showView('catalog'); }
function workCard(work) { const images = (work.images || []).sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0)); const index = Number.isInteger(state.cardIndexes[work.id]) ? state.cardIndexes[work.id] : 0; const src = imageUrl(images[index]?.storage_path || ''); return `<article class="work-card" data-work-id="${escapeAttr(work.id)}"><div class="work-image-wrap">${src ? `<img class="work-image" src="${escapeAttr(src)}" alt="${escapeAttr(work.title)}" loading="lazy">` : '<div class="empty-state">NO IMAGE</div>'}${images.length > 1 ? `<button class="work-arrow prev" data-card-prev aria-label="Предыдущее фото">‹</button><button class="work-arrow next" data-card-next aria-label="Следующее фото">›</button>` : ''}</div><div class="work-copy"><h3>${escapeHtml(work.title)}</h3><p>${escapeHtml(work.description || '')}</p></div></article>`; }
function openWork(work) { state.modalWork = work; state.modalIndex = 0; renderModal(); $('#work-modal').hidden = false; document.body.style.overflow = 'hidden'; }
function renderModal() { const work = state.modalWork; if (!work) return; const images = work.images || []; const current = images[state.modalIndex] || images[0]; $('#modal-gallery').innerHTML = current ? `<img src="${escapeAttr(imageUrl(current.storage_path))}" alt="Работа портфолио">${images.length > 1 ? '<button class="modal-close gallery-nav prev" data-modal-prev>‹</button><button class="modal-close gallery-nav next" data-modal-next>›</button>' : ''}` : '<div class="empty-state">NO IMAGE</div>'; }
function closeModal() { $('#work-modal').hidden = true; state.modalWork = null; document.body.style.overflow = ''; }
function escapeHtml(value='') { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); }
const escapeAttr = escapeHtml;

function applyMenuPositions(positions = defaultMenuPositions) {
  Object.entries(positions).forEach(([slug, position]) => {
    const button = slug === 'character' ? $('#character-trigger') : $(`.hotspot[data-category="${slug}"]`);
    if (!button || !position) return;
    if (Number.isFinite(Number(position.left))) button.style.left = `${Number(position.left)}%`;
    if (Number.isFinite(Number(position.top))) button.style.top = `${Number(position.top)}%`;
  });
}

$$('.hotspot').forEach(button => { const slug = button.dataset.category; button.addEventListener('mouseenter', () => setHover(slug, true)); button.addEventListener('focus', () => setHover(slug, true)); button.addEventListener('mouseleave', () => setHover(slug, false)); button.addEventListener('blur', () => setHover(slug, false)); button.addEventListener('click', () => slug === 'contacts' ? (renderContacts(), showView('contacts')) : renderCatalog(slug)); });
$('#character-trigger').addEventListener('click', event => { if (event.detail === 3) openAdmin(); });
$$('[data-back]').forEach(button => button.addEventListener('click', () => showView('home')));
$('[data-close-modal]').addEventListener('click', closeModal);
$('#work-modal').addEventListener('click', event => { if (event.target.id === 'work-modal') closeModal(); if (event.target.matches('[data-modal-prev],[data-modal-next]')) { const images = state.modalWork?.images || []; state.modalIndex = (state.modalIndex + (event.target.matches('[data-modal-next]') ? 1 : -1) + images.length) % images.length; renderModal(); } });
$('#works-grid').addEventListener('click', event => { const card = event.target.closest('.work-card'); if (!card) return; const work = (state.data.works[state.currentCategory] || []).find(item => item.id === card.dataset.workId); if (!work) return; if (event.target.matches('[data-card-prev],[data-card-next]')) { const count = work.images?.length || 1; const currentIndex = Number.isInteger(state.cardIndexes[work.id]) ? state.cardIndexes[work.id] : 0; state.cardIndexes[work.id] = (currentIndex + (event.target.matches('[data-card-next]') ? 1 : -1) + count) % count; renderCatalog(state.currentCategory); return; } openWork(work); });
window.addEventListener('keydown', event => { if (event.key === 'Escape') { closeModal(); $('#admin-modal').hidden = true; document.body.style.overflow = ''; } });

async function init() { try { state.data = await loadPortfolio(); } catch (error) { console.warn('Supabase load failed; using fallback data.', error); state.data = { categories: fallbackCategories, works: {}, phrases: fallbackPhrases, contacts: [], menuPositions: defaultMenuPositions }; } applyMenuPositions(state.data.menuPositions); renderContacts(); }
init();
