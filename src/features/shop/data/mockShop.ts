import type {
  CatalogFilterState,
  CatalogMetaResponse,
  Product,
  ProductCategory,
  ProductReview,
  ProductSort,
} from '../model/types';

export const SHOP_CATEGORIES_MOCK: ProductCategory[] = [
  {
    id: '1',
    slug: 'food',
    title: 'Корм',
  },
  {
    id: '2',
    slug: 'toys',
    title: 'Игрушки',
  },
  {
    id: '3',
    slug: 'care',
    title: 'Уход',
  },
  {
    id: '4',
    slug: 'accessories',
    title: 'Аксессуары',
  },
  {
    id: '5',
    slug: 'medicine',
    title: 'Здоровье',
  },
];

function calculateRating(reviews: ProductReview[]): number {
  if (reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  return Number((total / reviews.length).toFixed(1));
}

type ProductMockInput = Omit<Product, 'rating' | 'reviewsCount'>;

function createProduct(input: ProductMockInput): Product {
  const reviewsCount = input.reviews.length;
  const rating = calculateRating(input.reviews);

  return {
    ...input,
    rating,
    reviewsCount,
  };
}

export const SHOP_PRODUCTS_MOCK: Product[] = [
  createProduct({
    id: 'product-1',
    slug: 'cat-food-premium-salmon',
    title: 'Премиум-корм для кошек с лососем',
    categoryId: '1',
    categoryTitle: 'Корм',
    shortDescription: 'Сухой корм для взрослых кошек, 1.5 кг.',
    description:
      'Сбалансированный корм для ежедневного питания взрослых кошек.\nСодержит белок, омега-3, витамины и полезные микроэлементы.',
    descriptionContent: {
      summary:
        'Сухой корм для взрослых кошек весом 1.5 кг для ежедневного сбалансированного питания.',
      suitableFor: [
        'Взрослых кошек',
        'Ежедневного кормления',
        'Поддержания активности и хорошего самочувствия',
      ],
      benefits: [
        'Содержит белок для полноценного рациона',
        'Обогащён омега-3 для здоровья шерсти',
        'Подходит для регулярного использования',
      ],
      composition:
        'Содержит белок, омега-3, витамины и полезные микроэлементы, необходимые для полноценного питания.',
      usage:
        'Используйте как основной рацион, подбирая порцию с учётом веса, активности и особенностей питомца.',
    },
    price: 1890,
    oldPrice: 2190,
    isAvailable: true,
    stockQuantity: 18,
    images: [
      {
        id: 'product-1-image-1',
        url: '/images/shop/product-cat-food-1.jpg',
        alt: 'Премиум-корм для кошек с лососем',
      },
      {
        id: 'product-1-image-2',
        url: '/images/shop/product-cat-food-2.jpg',
        alt: 'Упаковка корма для кошек',
      },
    ],
    reviews: [
      {
        id: 'review-product-1-1',
        authorName: 'Анна',
        rating: 5,
        text: 'Кошке очень понравился корм, ест с удовольствием.',
        createdAt: '2026-03-01T10:00:00.000Z',
      },
      {
        id: 'review-product-1-2',
        authorName: 'Мария',
        rating: 5,
        text: 'Хороший состав, шерсть стала мягче уже через пару недель.',
        createdAt: '2026-03-02T12:40:00.000Z',
      },
      {
        id: 'review-product-1-3',
        authorName: 'Олег',
        rating: 4,
        text: 'Корм подошёл, но упаковка для нас маловата — берём сразу несколько.',
        createdAt: '2026-03-03T09:15:00.000Z',
      },
      {
        id: 'review-product-1-4',
        authorName: 'Екатерина',
        rating: 5,
        text: 'У кошки чувствительное пищеварение, этот вариант подошёл отлично.',
        createdAt: '2026-03-04T15:20:00.000Z',
      },
      {
        id: 'review-product-1-5',
        authorName: 'Ирина',
        rating: 4,
        text: 'Запах нейтральный, гранулы удобного размера, питомец ест спокойно.',
        createdAt: '2026-03-05T08:30:00.000Z',
      },
      {
        id: 'review-product-1-6',
        authorName: 'Дмитрий',
        rating: 5,
        text: 'Беру уже второй раз, качество стабильное.',
        createdAt: '2026-03-06T14:10:00.000Z',
      },
      {
        id: 'review-product-1-7',
        authorName: 'Светлана',
        rating: 5,
        text: 'Отличный корм для ежедневного рациона, кошка активная и довольная.',
        createdAt: '2026-03-07T11:50:00.000Z',
      },
      {
        id: 'review-product-1-8',
        authorName: 'Татьяна',
        rating: 4,
        text: 'В целом понравился, хотелось бы ещё упаковку большего объёма.',
        createdAt: '2026-03-08T17:05:00.000Z',
      },
      {
        id: 'review-product-1-9',
        authorName: 'Виктория',
        rating: 5,
        text: 'Питомец ест с аппетитом, проблем после перехода на этот корм не было.',
        createdAt: '2026-03-09T13:25:00.000Z',
      },
      {
        id: 'review-product-1-10',
        authorName: 'Никита',
        rating: 5,
        text: 'Состав и цена устроили, будем брать ещё.',
        createdAt: '2026-03-10T10:45:00.000Z',
      },
      {
        id: 'review-product-1-11',
        authorName: 'Ксения',
        rating: 5,
        text: 'Хорошее соотношение цены и качества.',
        createdAt: '2026-03-11T16:00:00.000Z',
      },
      {
        id: 'review-product-1-12',
        authorName: 'Алексей',
        rating: 5,
        text: 'Кот ест с удовольствием, проблем с пищеварением нет.',
        createdAt: '2026-03-12T09:35:00.000Z',
      },
    ],
    createdAt: '2026-02-10T12:00:00.000Z',
    updatedAt: '2026-03-12T09:35:00.000Z',
  }),

  createProduct({
    id: 'product-2',
    slug: 'dog-toy-rope-ball',
    title: 'Игрушка для собак: канат с мячом',
    categoryId: '2',
    categoryTitle: 'Игрушки',
    shortDescription: 'Прочная игрушка для активных игр.',
    description:
      'Подходит для игр дома и на улице.\nПомогает снизить тревожность, поддерживать активность и отвлекать питомца.',
    descriptionContent: {
      summary:
        'Прочная игрушка для активных игр с собакой дома и на прогулке.',
      suitableFor: [
        'Активных собак',
        'Совместных игр с хозяином',
        'Домашнего и уличного использования',
      ],
      benefits: [
        'Помогает разнообразить досуг питомца',
        'Поддерживает двигательную активность',
        'Подходит для игр на перетягивание и апорт',
      ],
      features: [
        'Рассчитана на регулярное использование',
        'Помогает переключать внимание питомца на игру',
        'Подходит для активных игр дома и на улице',
      ],
      usage:
        'Используйте для совместных активных игр и следите за состоянием игрушки при регулярной нагрузке.',
    },
    price: 890,
    oldPrice: 990,
    isAvailable: true,
    stockQuantity: 24,
    images: [
      {
        id: 'product-2-image-1',
        url: '/images/shop/product-dog-toy-1.jpg',
        alt: 'Игрушка для собак: канат с мячом',
      },
    ],
    reviews: [
      {
        id: 'review-product-2-1',
        authorName: 'Илья',
        rating: 5,
        text: 'Пёс сразу увлёкся, игрушка выдерживает активные игры.',
        createdAt: '2026-03-01T09:00:00.000Z',
      },
      {
        id: 'review-product-2-2',
        authorName: 'Полина',
        rating: 4,
        text: 'Для средних пород отлично, для очень крупных хотелось бы плотнее канат.',
        createdAt: '2026-03-03T11:30:00.000Z',
      },
      {
        id: 'review-product-2-3',
        authorName: 'Роман',
        rating: 5,
        text: 'Удобно брать на прогулку, собаке нравится таскать мяч.',
        createdAt: '2026-03-05T13:10:00.000Z',
      },
      {
        id: 'review-product-2-4',
        authorName: 'Елена',
        rating: 4,
        text: 'Хорошая игрушка, для ежедневных игр подошла.',
        createdAt: '2026-03-06T15:00:00.000Z',
      },
      {
        id: 'review-product-2-5',
        authorName: 'Артём',
        rating: 5,
        text: 'Материал крепкий, собака пока не смогла разгрызть.',
        createdAt: '2026-03-07T10:20:00.000Z',
      },
      {
        id: 'review-product-2-6',
        authorName: 'Дарья',
        rating: 5,
        text: 'Отличный вариант для активной собаки, играем каждый день.',
        createdAt: '2026-03-08T18:40:00.000Z',
      },
      {
        id: 'review-product-2-7',
        authorName: 'Максим',
        rating: 4,
        text: 'Неплохая игрушка, соответствует описанию.',
        createdAt: '2026-03-10T12:00:00.000Z',
      },
      {
        id: 'review-product-2-8',
        authorName: 'Алёна',
        rating: 5,
        text: 'Хорошо отвлекает питомца и помогает выплеснуть энергию.',
        createdAt: '2026-03-11T16:20:00.000Z',
      },
    ],
    createdAt: '2026-02-12T08:30:00.000Z',
    updatedAt: '2026-03-11T16:20:00.000Z',
  }),

  createProduct({
    id: 'product-3',
    slug: 'cat-litter-clumping',
    title: 'Комкующийся наполнитель для кошачьего туалета',
    categoryId: '3',
    categoryTitle: 'Уход',
    shortDescription: 'Комкующийся наполнитель 5 кг.',
    description:
      'Эффективно удерживает запахи, быстро образует плотные комки и удобен в использовании.',
    descriptionContent: {
      summary:
        'Комкующийся наполнитель 5 кг для поддержания чистоты и комфорта в кошачьем туалете.',
      suitableFor: [
        'Домов с одной или несколькими кошками',
        'Ежедневного использования',
        'Поддержания чистоты без лишних усилий',
      ],
      benefits: [
        'Эффективно удерживает запахи',
        'Быстро образует плотные комки',
        'Упрощает ежедневную уборку лотка',
      ],
      features: [
        'Подходит для регулярного использования',
        'Помогает поддерживать чистоту в зоне туалета',
        'Удобен в ежедневном уходе за лотком',
      ],
      usage:
        'Насыпьте наполнитель в чистый лоток, регулярно удаляйте образовавшиеся комки и при необходимости досыпайте свежий слой.',
    },
    price: 650,
    oldPrice: null,
    isAvailable: true,
    stockQuantity: 40,
    images: [
      {
        id: 'product-3-image-1',
        url: '/images/shop/product-cat-litter-1.jpg',
        alt: 'Наполнитель для кошачьего туалета',
      },
    ],
    reviews: [
      {
        id: 'review-product-3-1',
        authorName: 'Оксана',
        rating: 5,
        text: 'Хорошо держит запах и быстро комкуется.',
        createdAt: '2026-03-02T08:10:00.000Z',
      },
      {
        id: 'review-product-3-2',
        authorName: 'Людмила',
        rating: 5,
        text: 'Удобный в уборке, расход нормальный.',
        createdAt: '2026-03-03T10:00:00.000Z',
      },
      {
        id: 'review-product-3-3',
        authorName: 'Игорь',
        rating: 4,
        text: 'В целом хороший, но немного пылит при засыпании.',
        createdAt: '2026-03-04T13:45:00.000Z',
      },
      {
        id: 'review-product-3-4',
        authorName: 'Марина',
        rating: 5,
        text: 'Берём не первый раз, устраивает по качеству.',
        createdAt: '2026-03-05T15:30:00.000Z',
      },
      {
        id: 'review-product-3-5',
        authorName: 'Павел',
        rating: 4,
        text: 'Запах удерживает хорошо, кот принял сразу.',
        createdAt: '2026-03-06T09:55:00.000Z',
      },
      {
        id: 'review-product-3-6',
        authorName: 'Наталья',
        rating: 5,
        text: 'Очень удобно убирать, комки плотные.',
        createdAt: '2026-03-07T12:05:00.000Z',
      },
      {
        id: 'review-product-3-7',
        authorName: 'Владимир',
        rating: 4,
        text: 'Хороший вариант за свою цену.',
        createdAt: '2026-03-08T17:15:00.000Z',
      },
      {
        id: 'review-product-3-8',
        authorName: 'София',
        rating: 5,
        text: 'Лоток дольше остаётся свежим.',
        createdAt: '2026-03-09T11:35:00.000Z',
      },
      {
        id: 'review-product-3-9',
        authorName: 'Юлия',
        rating: 5,
        text: 'Отличный наполнитель, будем брать ещё.',
        createdAt: '2026-03-10T14:50:00.000Z',
      },
    ],
    createdAt: '2026-02-08T09:00:00.000Z',
    updatedAt: '2026-03-10T14:50:00.000Z',
  }),

  createProduct({
    id: 'product-4',
    slug: 'pet-bowl-ceramic',
    title: 'Керамическая миска для питомца',
    categoryId: '4',
    categoryTitle: 'Аксессуары',
    shortDescription: 'Устойчивая миска для воды и корма.',
    description:
      'Подходит для кошек и собак мелких пород.\nЛегко моется, не скользит по полу.',
    descriptionContent: {
      summary:
        'Керамическая миска для воды и корма, удобная для ежедневного использования.',
      suitableFor: ['Кошек', 'Собак мелких пород', 'Подачи воды и корма'],
      benefits: [
        'Устойчива в повседневном использовании',
        'Легко моется',
        'Не скользит по полу',
      ],
      features: [
        'Подходит для домашнего использования',
        'Помогает аккуратно организовать зону кормления',
        'Удобна для воды и корма',
      ],
      usage:
        'Используйте для подачи сухого или влажного корма, а также воды.\nРегулярно мойте после использования.',
    },
    price: 490,
    oldPrice: 590,
    isAvailable: true,
    stockQuantity: 15,
    images: [
      {
        id: 'product-4-image-1',
        url: '/images/shop/product-bowl-1.jpg',
        alt: 'Керамическая миска для питомца',
      },
    ],
    reviews: [
      {
        id: 'review-product-4-1',
        authorName: 'Вероника',
        rating: 5,
        text: 'Красивая и устойчивая миска, не ездит по полу.',
        createdAt: '2026-03-01T08:20:00.000Z',
      },
      {
        id: 'review-product-4-2',
        authorName: 'Степан',
        rating: 4,
        text: 'Удобная, но для крупной собаки маловата.',
        createdAt: '2026-03-04T10:10:00.000Z',
      },
      {
        id: 'review-product-4-3',
        authorName: 'Алина',
        rating: 5,
        text: 'Для кошки подошла идеально, легко мыть.',
        createdAt: '2026-03-06T13:20:00.000Z',
      },
      {
        id: 'review-product-4-4',
        authorName: 'Георгий',
        rating: 4,
        text: 'Хороший вариант, выглядит аккуратно.',
        createdAt: '2026-03-08T16:00:00.000Z',
      },
      {
        id: 'review-product-4-5',
        authorName: 'Лилия',
        rating: 5,
        text: 'Понравилась форма и качество покрытия.',
        createdAt: '2026-03-10T19:25:00.000Z',
      },
    ],
    createdAt: '2026-02-15T13:00:00.000Z',
    updatedAt: '2026-03-10T19:25:00.000Z',
  }),

  createProduct({
    id: 'product-5',
    slug: 'pet-vitamin-complex',
    title: 'Витаминный комплекс для питомцев',
    categoryId: '5',
    categoryTitle: 'Здоровье',
    shortDescription: 'Поддержка иммунитета и активности.',
    description:
      'Комплекс витаминов и минералов для кошек и собак.\nПодходит для курсового применения.',
    descriptionContent: {
      summary:
        'Витаминный комплекс для поддержки иммунитета и общего тонуса питомца.',
      suitableFor: [
        'Кошек и собак',
        'Курсового применения',
        'Поддержки активности и общего состояния',
      ],
      benefits: [
        'Содержит витамины и минералы',
        'Подходит для регулярных курсов',
        'Помогает поддерживать общее самочувствие питомца',
      ],
      features: [
        'Подходит как часть регулярного ухода',
        'Может использоваться курсом',
        'Удобен для планового применения по схеме',
      ],
      usage:
        'Применяйте курсом в соответствии с рекомендациями по дозировке и индивидуальными особенностями питомца.',
    },
    price: 1190,
    oldPrice: 1390,
    isAvailable: false,
    stockQuantity: 0,
    images: [
      {
        id: 'product-5-image-1',
        url: '/images/shop/product-vitamins-1.jpg',
        alt: 'Витаминный комплекс для питомцев',
      },
    ],
    reviews: [
      {
        id: 'review-product-5-1',
        authorName: 'Евгения',
        rating: 5,
        text: 'Удобно давать курсом, питомец переносит хорошо.',
        createdAt: '2026-03-01T09:40:00.000Z',
      },
      {
        id: 'review-product-5-2',
        authorName: 'Кирилл',
        rating: 5,
        text: 'Брали по рекомендации, состояние шерсти стало лучше.',
        createdAt: '2026-03-02T11:00:00.000Z',
      },
      {
        id: 'review-product-5-3',
        authorName: 'Милана',
        rating: 4,
        text: 'Хороший комплекс, но хотелось бы упаковку большего объёма.',
        createdAt: '2026-03-03T14:25:00.000Z',
      },
      {
        id: 'review-product-5-4',
        authorName: 'Сергей',
        rating: 5,
        text: 'Удобный курс, собака стала бодрее.',
        createdAt: '2026-03-04T16:45:00.000Z',
      },
      {
        id: 'review-product-5-5',
        authorName: 'Карина',
        rating: 5,
        text: 'Нравится состав и понятная схема применения.',
        createdAt: '2026-03-05T08:35:00.000Z',
      },
      {
        id: 'review-product-5-6',
        authorName: 'Денис',
        rating: 5,
        text: 'Питомец чувствует себя хорошо, курс прошёл спокойно.',
        createdAt: '2026-03-06T10:50:00.000Z',
      },
      {
        id: 'review-product-5-7',
        authorName: 'Анастасия',
        rating: 5,
        text: 'Удобно использовать курсом весной и осенью.',
        createdAt: '2026-03-07T12:15:00.000Z',
      },
      {
        id: 'review-product-5-8',
        authorName: 'Руслан',
        rating: 4,
        text: 'Хороший вариант для поддерживающего курса.',
        createdAt: '2026-03-08T15:10:00.000Z',
      },
      {
        id: 'review-product-5-9',
        authorName: 'Инна',
        rating: 5,
        text: 'Качественный комплекс, будем повторять курс.',
        createdAt: '2026-03-09T18:05:00.000Z',
      },
      {
        id: 'review-product-5-10',
        authorName: 'Михаил',
        rating: 5,
        text: 'Понравился результат и понятная инструкция.',
        createdAt: '2026-03-10T09:30:00.000Z',
      },
      {
        id: 'review-product-5-11',
        authorName: 'Нина',
        rating: 5,
        text: 'После курса питомец стал заметно активнее.',
        createdAt: '2026-03-11T13:40:00.000Z',
      },
    ],
    createdAt: '2026-02-20T10:30:00.000Z',
    updatedAt: '2026-03-11T13:40:00.000Z',
  }),
];

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean);
}

export function getSearchFields(product: Product): string[] {
  return [
    product.title,
    product.shortDescription,
    product.description,
    product.categoryTitle,
  ];
}

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a.length === 0) {
    return b.length;
  }

  if (b.length === 0) {
    return a.length;
  }

  const matrix: number[][] = Array.from(
    { length: a.length + 1 },
    (_, rowIndex) =>
      Array.from({ length: b.length + 1 }, (_, columnIndex) => {
        if (rowIndex === 0) {
          return columnIndex;
        }

        if (columnIndex === 0) {
          return rowIndex;
        }

        return 0;
      }),
  );

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;

      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

export function matchesSearch(product: Product, search: string): boolean {
  const queryTokens = tokenize(search);

  if (queryTokens.length === 0) {
    return true;
  }

  const normalizedFields = getSearchFields(product).map(normalizeText);
  const fullText = normalizedFields.join(' ');
  const fieldTokens = tokenize(fullText);

  return queryTokens.every((queryToken) => {
    if (fullText.includes(queryToken)) {
      return true;
    }

    return fieldTokens.some((fieldToken) => {
      return (
        fieldToken.includes(queryToken) ||
        queryToken.includes(fieldToken) ||
        levenshteinDistance(fieldToken, queryToken) <= 1
      );
    });
  });
}

export function applySort(items: Product[], sort: ProductSort): Product[] {
  const copy = [...items];

  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);

    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);

    case 'rating-desc':
      return copy.sort((a, b) => b.rating - a.rating);

    case 'newest':
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    case 'popular':
    default:
      return copy.sort((a, b) => b.reviewsCount - a.reviewsCount);
  }
}

export function applyFilters(
  items: Product[],
  filters: CatalogFilterState,
): Product[] {
  return items.filter((product) => {
    const isMatchedBySearch = matchesSearch(product, filters.search);
    const isMatchedByCategory =
      filters.categoryIds.length === 0 ||
      filters.categoryIds.includes(product.categoryId);
    const isMatchedByMinPrice =
      filters.minPrice === null || product.price >= filters.minPrice;
    const isMatchedByMaxPrice =
      filters.maxPrice === null || product.price <= filters.maxPrice;
    const isMatchedByAvailability =
      !filters.onlyAvailable || product.isAvailable;

    return (
      isMatchedBySearch &&
      isMatchedByCategory &&
      isMatchedByMinPrice &&
      isMatchedByMaxPrice &&
      isMatchedByAvailability
    );
  });
}

export function buildCatalogMetaMock(): CatalogMetaResponse {
  const prices = SHOP_PRODUCTS_MOCK.map((product) => product.price);

  return {
    categories: SHOP_CATEGORIES_MOCK,
    minPrice: prices.length > 0 ? Math.min(...prices) : 0,
    maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    availableSorts: [
      'popular',
      'newest',
      'rating-desc',
      'price-asc',
      'price-desc',
    ],
  };
}