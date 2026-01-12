import { Product } from './types';

// Расширяем список категорий (добавили Комбо и Соусы, как у топов)
export const CATEGORIES = ['Все', 'Популярное', 'Бургеры', 'Комбо', 'Снэки', 'Напитки', 'Соусы'];

export const MOCK_MENU: Product[] = [
  // --- БУРГЕРЫ ---
  {
    id: 'p1',
    name: 'Гранд Биф "Маэстро"',
    category: 'Бургеры',
    price: 490,
    oldPrice: 550, // Скидка для привлечения внимания
    weight: '340 г',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 850,
    nutrients: { proteins: 45, fats: 30, carbs: 55 },
    description: 'Две сочные говяжьи котлеты Black Angus, тройной чеддер, маринованные огурчики, лук конфи и фирменный дымный соус.',
    badges: ['HIT', 'NEW']
  },
  {
    id: 'p2',
    name: 'Чизбургер Джуниор',
    category: 'Бургеры',
    price: 190,
    weight: '160 г',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 320,
    nutrients: { proteins: 18, fats: 14, carbs: 35 },
    description: 'Классика, которая не нуждается в представлении. Котлета из 100% говядины, сыр, горчица и кетчуп на мягкой булочке.'
  },
  {
    id: 'p3',
    name: 'Спайси Чикен Тауэр',
    category: 'Бургеры',
    price: 380,
    weight: '290 г',
    image: 'https://images.unsplash.com/photo-1619250907727-2eae8b9826d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 610,
    nutrients: { proteins: 28, fats: 25, carbs: 48 },
    description: 'Для тех, кто любит погорячее. Хрустящее куриное филе, халапеньо, салат айсберг и острый соус шрирача.',
    badges: ['HOT']
  },

  // --- РОЛЛЫ (Шаурма/Врапы) ---
  {
    id: 'p4',
    name: 'Цезарь Ролл XL',
    category: 'Роллы',
    price: 290,
    weight: '250 г',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 420,
    nutrients: { proteins: 22, fats: 18, carbs: 40 },
    description: 'Легендарный салат, завернутый в пшеничную лепешку. Курица гриль, пармезан, томаты и соус цезарь.'
  },

  // --- СНЭКИ ---
  {
    id: 'p5',
    name: 'Картофель Фри',
    category: 'Снэки',
    price: 150,
    weight: '120 г',
    image: 'https://images.unsplash.com/photo-1630384060421-a4323ce5663e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 380,
    nutrients: { proteins: 4, fats: 19, carbs: 45 },
    description: 'Золотистые брусочки картофеля, обжаренные до хруста. Идеально с сырным соусом.',
    badges: ['VEGAN']
  },
  {
    id: 'p6',
    name: 'Наггетсы (9 шт)',
    category: 'Снэки',
    price: 240,
    oldPrice: 300,
    weight: '180 г',
    image: 'https://images.unsplash.com/photo-1562967960-f0d6d538f654?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 410,
    nutrients: { proteins: 26, fats: 22, carbs: 20 },
    description: 'Нежнейшее куриное филе в воздушной панировке темпура.'
  },
  {
    id: 'p7',
    name: 'Сырные Палочки',
    category: 'Снэки',
    price: 210,
    weight: '150 г',
    image: 'https://images.unsplash.com/photo-1548340748-43807ac09904?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 390,
    nutrients: { proteins: 15, fats: 25, carbs: 28 },
    description: 'Тянущаяся моцарелла в хрустящей корочке с прованскими травами.',
    badges: ['NEW']
  },

  // --- НАПИТКИ ---
  {
    id: 'p8',
    name: 'Cola Zero',
    category: 'Напитки',
    price: 120,
    weight: '0.5 л',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 1,
    nutrients: { proteins: 0, fats: 0, carbs: 0 },
    description: 'Освежающий вкус колы без сахара и лишних калорий. Подается со льдом.'
  },
  {
    id: 'p9',
    name: 'Милкшейк "Berry Boom"',
    category: 'Напитки',
    price: 210,
    weight: '0.4 л',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 350,
    nutrients: { proteins: 8, fats: 12, carbs: 55 },
    description: 'Густой молочный коктейль с натуральным клубничным пюре и взбитыми сливками.',
    badges: ['KIDS']
  },
  {
    id: 'p10',
    name: 'Капучино Гранде',
    category: 'Напитки',
    price: 180,
    weight: '0.4 л',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 120,
    nutrients: { proteins: 6, fats: 5, carbs: 10 },
    description: '100% Арабика с мягкой молочной пенкой.'
  },

  // --- КОМБО (Самый маржинальный продукт) ---
  {
    id: 'p11',
    name: 'Комбо "Сытный Обед"',
    category: 'Комбо',
    price: 590,
    oldPrice: 750, // Показываем выгоду
    weight: '850 г',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 1200,
    nutrients: { proteins: 50, fats: 60, carbs: 120 },
    description: 'Выгодное предложение: Бургер Маэстро + Картофель Фри + Кола 0.5. Экономия 20%!',
    badges: ['PROMO']
  }
];