// Публичная конфигурация фронтенда. Никогда не вставляйте сюда service_role key.
// 1. Создайте проект на https://supabase.com
// 2. Скопируйте Project URL и anon public key из Settings → API.
// 3. Замените значения ниже перед публикацией на GitHub Pages.
window.PORTFOLIO_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  // Email используется Supabase Auth внутри приложения и не показывается в форме входа.
  adminEmail: 'admin@example.com',
  fallbackContacts: [
    { label: 'EMAIL', value: 'hello@example.com', href: 'mailto:hello@example.com' },
    { label: 'TELEGRAM', value: '@your_handle', href: 'https://t.me/your_handle' },
    { label: 'BEHANCE', value: 'behance.net/yourname', href: 'https://behance.net/yourname' }
  ]
};
