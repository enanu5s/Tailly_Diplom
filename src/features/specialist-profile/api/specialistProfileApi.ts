// src/features/specialist-profile/api/specialistProfileApi.ts

import { fetchJson } from '@/shared/api/fetchJson';

import type { SpecialistProfileResponse } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const MOCK_SPECIALIST_PROFILES: SpecialistProfileResponse[] = [
    {
        id: 'specialist-1',
        slug: 'maria-ivanova',
        isOwner: true,
        main: {
            avatarUrl: '/images/specialists/maria-ivanova.jpg',
            firstName: 'Мария',
            lastName: 'Иванова',
            city: 'Москва',
            district: 'Пресненский район',
            phone: '+7 (999) 123-45-67',
            email: 'maria.ivanova@tailly.ru',
        },
        stats: {
            experienceYears: 5,
            rating: 5,
            reviewsCount: 18,
            completedOrdersCount: 46,
            repeatOrdersCount: 14,
        },
        calendar: {
            bookedDates: [
                '2026-03-11',
                '2026-03-12',
                '2026-03-14',
                '2026-03-18',
                '2026-03-19',
                '2026-03-21',
                '2026-03-25',
            ],
        },
        petGallery: [
            {
                id: 'gallery-1',
                imageUrl: '/images/specialists/pets/pet-1.jpg',
                alt: 'Питомец клиента во время передержки',
            },
            {
                id: 'gallery-2',
                imageUrl: '/images/specialists/pets/pet-2.jpg',
                alt: 'Кот клиента на передержке',
            },
            {
                id: 'gallery-3',
                imageUrl: '/images/specialists/pets/pet-3.jpg',
                alt: 'Кролик клиента во время ухода',
            },
            {
                id: 'gallery-4',
                imageUrl: '/images/specialists/pets/pet-4.jpg',
                alt: 'Собака клиента на прогулке',
            },
            {
                id: 'gallery-5',
                imageUrl: '/images/specialists/pets/pet-5.jpg',
                alt: 'Питомец клиента дома у специалиста',
            },
            {
                id: 'gallery-6',
                imageUrl: '/images/specialists/pets/pet-6.jpg',
                alt: 'Уход за питомцем клиента',
            },
        ],
        details: {
            experienceLabel: '5 лет',
            housingType: 'apartment',
            petSizes: ['small', 'medium'],
            petAges: ['baby', 'young', 'adult', 'senior'],
            hasChildrenUnderTen: 'no',
            petTypes: ['cat', 'rodent', 'rabbit', 'bird'],
            advantages: [
                { id: 'adv-1', title: 'Отправляет ежедневные фото/видеоотчеты' },
                { id: 'adv-2', title: 'Соблюдает рекомендации по режиму и питанию' },
                { id: 'adv-3', title: 'Есть опыт с тревожными питомцами' },
            ],
            about: `Меня зовут Мария, и вот уже 5 лет я с радостью забочусь о домашних питомцах. В моей квартире созданы все условия для комфортного проживания кошек, грызунов и кроликов — просторные клетки, уютные уголки для отдыха и много игрушек.

Я прекрасно понимаю, как важно для хозяев знать, что их любимец в безопасности. Поэтому отправляю ежедневные фото- и видеоотчёты, а также строго соблюдаю все ваши рекомендации по питанию и режиму.

Почему мне можно доверять?
Опыт работы с разными животными, включая пугливых и тревожных
Умение распознавать потребности питомцев
Чистота и порядок в доме
Готовность к экстренным ситуациям (знаю основы первой помощи)
Для меня важно, чтобы каждый подопечный чувствовал себя как дома. Буду рада познакомиться с вашим питомцем!`,
        },
        services: [
            {
                id: 'service-1',
                name: 'Передержка кошек',
                locationLabel: 'У специалиста дома',
                price: 900,
                priceUnit: 'day',
            },
            {
                id: 'service-2',
                name: 'Передержка кроликов и грызунов',
                locationLabel: 'У специалиста дома',
                price: 700,
                priceUnit: 'day',
            },
            {
                id: 'service-3',
                name: 'Присмотр на дому у клиента',
                locationLabel: 'У клиента',
                price: 1200,
                priceUnit: 'visit',
            },
            {
                id: 'service-4',
                name: 'Консультация перед первым заказом',
                locationLabel: 'Онлайн',
                price: 0,
                priceUnit: 'service',
            },
        ],
        reviews: [
            {
                id: 'review-1',
                authorName: 'Анна',
                petName: 'Марта',
                rating: 5,
                createdAt: '2026-02-18',
                text: 'Оставляла у Марии кошку на неделю. Каждый день получала фото и видео, кошка быстро адаптировалась и чувствовала себя спокойно.',
                specialistReply: {
                    text: 'Анна, спасибо большое за доверие. Марта очень ласковая и аккуратная кошка, с ней было приятно проводить время.',
                    createdAt: '2026-02-19',
                },
            },
            {
                id: 'review-2',
                authorName: 'Кирилл',
                petName: 'Пушок',
                rating: 5,
                createdAt: '2026-02-10',
                text: 'Очень понравился подход. Всё чётко по рекомендациям, всегда на связи, видно, что человек реально любит животных.',
            },
            {
                id: 'review-3',
                authorName: 'Елена',
                petName: 'Снежок',
                rating: 5,
                createdAt: '2026-01-27',
                text: 'Передержка прошла идеально. Кролик был в хорошем настроении, место чистое, рекомендации соблюдены полностью.',
                specialistReply: {
                    text: 'Елена, спасибо. Снежок чудесный, буду рада помочь снова.',
                    createdAt: '2026-01-28',
                },
            },
            {
                id: 'review-4',
                authorName: 'Ольга',
                petName: 'Тиша',
                rating: 5,
                createdAt: '2026-01-12',
                text: 'Спокойный и внимательный специалист. Мне было важно получать ежедневные отчёты, и Мария это делала без напоминаний.',
            },
            {
                id: 'review-5',
                authorName: 'Дмитрий',
                petName: 'Ричи',
                rating: 5,
                createdAt: '2025-12-22',
                text: 'Очень комфортный опыт. Видно, что специалист умеет работать даже с тревожными животными.',
            },
        ],
    },
];

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

async function mockGetSpecialistProfileBySlug(
    slug: string,
): Promise<SpecialistProfileResponse> {
    await delay(350);

    const profile = MOCK_SPECIALIST_PROFILES.find((item) => item.slug === slug);

    if (!profile) {
        throw new Error('Профиль специалиста не найден.');
    }

    return JSON.parse(JSON.stringify(profile)) as SpecialistProfileResponse;
}

async function realGetSpecialistProfileBySlug(
    slug: string,
): Promise<SpecialistProfileResponse> {
    return fetchJson<SpecialistProfileResponse>(
        `${API_BASE_URL}/specialists/${encodeURIComponent(slug)}`,
    );
}

export const specialistProfileApi = {
    getBySlug(slug: string): Promise<SpecialistProfileResponse> {
        if (USE_MOCK) {
            return mockGetSpecialistProfileBySlug(slug);
        }

        return realGetSpecialistProfileBySlug(slug);
    },
};