// Публичная конфигурация фронтенда. Никогда не вставляйте сюда service_role key.
// 1. Создайте проект на https://supabase.com
// 2. Скопируйте Project URL и anon public key из Settings → API.
// 3. Замените значения ниже перед публикацией на GitHub Pages.
window.PORTFOLIO_CONFIG = {
  supabaseUrl: 'https://iwhkgrxshkopryomrsah.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aGtncnhzaGtvcHJ5b21yc2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NDMyODUsImV4cCI6MjEwOTExOTI4NX0.0qJAFXVbzzKCg9oD8yhrssXdjekqzdFiZJboV-vIx5w',
  // Email используется Supabase Auth внутри приложения и не показывается в форме входа.
  adminEmail: 'admin@example.com',
  adminPassword: '1965',
  fallbackContacts: [
    { label: 'EMAIL', value: 'hello@example.com', href: 'mailto:hello@example.com' },
    { label: 'TELEGRAM', value: '@your_handle', href: 'https://t.me/your_handle' },
    { label: 'BEHANCE', value: 'behance.net/yourname', href: 'https://behance.net/yourname' }
  ]
};
