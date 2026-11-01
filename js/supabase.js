import '../config.js';

const cfg = window.PORTFOLIO_CONFIG || {};
let savedConfig = {};
try { savedConfig = JSON.parse(localStorage.getItem('portfolio.supabase') || '{}'); } catch { savedConfig = {}; }
export const runtimeConfig = { ...cfg, ...savedConfig };
const hasSupabase = Boolean(runtimeConfig.supabaseUrl && runtimeConfig.supabaseAnonKey && window.supabase);
export const client = hasSupabase ? window.supabase.createClient(runtimeConfig.supabaseUrl, runtimeConfig.supabaseAnonKey) : null;
export const isSupabaseConfigured = hasSupabase;

export const fallbackCategories = [
  { id: 'posters', slug: 'posters', title: 'Плакаты', icon_file: 'icon2.png', sort_order: 1 },
  { id: 'clothes', slug: 'clothes', title: 'Одежда', icon_file: 'icon3.png', sort_order: 2 },
  { id: 'design', slug: 'design', title: 'Оформление и инфографика', icon_file: 'icon4.png', sort_order: 3 },
  { id: 'contacts', slug: 'contacts', title: 'Контакты', icon_file: 'icon1.png', sort_order: 4 }
];
export const fallbackPhrases = {
  posters: ['Свежая печать — прямо с витрины.', 'Каждый пиксель знает, куда смотреть.'],
  clothes: ['Ткань тоже умеет рассказывать истории.', 'Надень идею — и выходи в город.'],
  design: ['Система собрана. Можно нажимать.', 'Красиво, понятно, без лишнего шума.'],
  contacts: ['Линия открыта. Пиши, я на связи.', 'Здесь начинается следующий квест.']
};
export const fallbackWorks = {
  posters: [{ id: 'demo-poster', category_id: 'posters', title: 'Ночная афиша', description: 'Демонстрационная карточка — добавьте реальные проекты через админ-панель.', images: [{ id: 'demo-poster-img', storage_path: 'assets/icon2.png', sort_order: 1 }] }],
  clothes: [{ id: 'demo-clothes', category_id: 'clothes', title: 'Pixel Uniform', description: 'Визуальный концепт одежды для ночной витрины.', images: [{ id: 'demo-clothes-img', storage_path: 'assets/icon3.png', sort_order: 1 }] }],
  design: [{ id: 'demo-design', category_id: 'design', title: 'Interface 01', description: 'Экранная композиция, где информация светится как вывеска.', images: [{ id: 'demo-design-img', storage_path: 'assets/icon4.png', sort_order: 1 }] }]
};
export const fallbackContacts = cfg.fallbackContacts || [];
export const defaultMenuPositions = {
  contacts: { left: 23.1, top: 35.8 },
  posters: { left: 46.5, top: 34 },
  clothes: { left: 18.8, top: 48.5 },
  design: { left: 35.4, top: 46.5 },
  character: { left: 60, top: 33 }
};

export async function loadPortfolio() {
  if (!client) return { categories: fallbackCategories, works: fallbackWorks, phrases: fallbackPhrases, contacts: fallbackContacts };
  const [categories, works, images, phrases, contacts, settings] = await Promise.all([
    client.from('categories').select('*').order('sort_order'),
    client.from('works').select('*').order('sort_order'),
    client.from('work_images').select('*').order('sort_order'),
    client.from('phrases').select('*'),
    client.from('contacts').select('*').order('sort_order'),
    client.from('settings').select('key,value').eq('key', 'menu_positions').maybeSingle()
  ]);
  if (categories.error) throw categories.error;
  const categorySlugs = Object.fromEntries((categories.data || []).map(item => [item.id, item.slug]));
  const groupedWorks = {};
  (works.data || []).forEach(work => { const slug = categorySlugs[work.category_id] || work.category_id; groupedWorks[slug] ||= []; groupedWorks[slug].push({ ...work, images: (images.data || []).filter(image => image.work_id === work.id) }); });
  const groupedPhrases = {};
  (phrases.data || []).forEach(phrase => { const key = phrase.icon_slug || phrase.category_id; groupedPhrases[key] ||= []; groupedPhrases[key].push(phrase.text); });
  return { categories: categories.data || [], works: groupedWorks, phrases: groupedPhrases, contacts: contacts.data || [], menuPositions: settings.data?.value || defaultMenuPositions };
}

export async function saveMenuPositions(positions) {
  if (!client) throw new Error('Supabase не настроен.');
  return client.from('settings').upsert({ key: 'menu_positions', value: positions });
}

export function imageUrl(path) {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/.test(path) || path.startsWith('./')) return path;
  if (client && !path.startsWith('assets/')) return client.storage.from('portfolio').getPublicUrl(path).data.publicUrl;
  return path.startsWith('assets/') ? `./${path}` : `./assets/${path}`;
}
export async function requireSession() { if (!client) throw new Error('Supabase не настроен. Заполните config.js.'); const { data, error } = await client.auth.getSession(); if (error) throw error; return data.session; }
export function saveSupabaseConfig(supabaseUrl, supabaseAnonKey) { localStorage.setItem('portfolio.supabase', JSON.stringify({ supabaseUrl: supabaseUrl.trim(), supabaseAnonKey: supabaseAnonKey.trim() })); }
export async function signIn(password) { if (!client) throw new Error('Supabase не настроен. Сохраните URL и anon key в форме настроек.'); return client.auth.signInWithPassword({ email: runtimeConfig.adminEmail || 'admin@example.com', password }); }
export async function signOut() { return client?.auth.signOut(); }
