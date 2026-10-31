insert into public.categories (slug, title, icon_file, sort_order) values
  ('posters', 'Плакаты', 'icon2.png', 1),
  ('clothes', 'Одежда', 'icon3.png', 2),
  ('design', 'Оформление и инфографика', 'icon4.png', 3),
  ('contacts', 'Контакты', 'icon1.png', 4)
on conflict (slug) do update set title = excluded.title, icon_file = excluded.icon_file, sort_order = excluded.sort_order;

insert into public.phrases (icon_slug, text) values
  ('posters', 'Свежая печать — прямо с витрины.'),
  ('posters', 'Каждый пиксель знает, куда смотреть.'),
  ('clothes', 'Ткань тоже умеет рассказывать истории.'),
  ('clothes', 'Надень идею — и выходи в город.'),
  ('design', 'Система собрана. Можно нажимать.'),
  ('design', 'Красиво, понятно, без лишнего шума.'),
  ('contacts', 'Линия открыта. Пиши, я на связи.'),
  ('contacts', 'Здесь начинается следующий квест.');
