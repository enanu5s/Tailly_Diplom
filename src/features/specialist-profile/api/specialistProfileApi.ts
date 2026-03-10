// src/features/specialist-profile/api/specialistProfileApi.ts

import { fetchJson } from '@/shared/api/fetchJson';

import type {
    SpecialistDetailsUpdatePayload,
    SpecialistMainInfoUpdatePayload,
    SpecialistProfileResponse,
    SpecialistCalendarUpdatePayload,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const MOCK_SPECIALIST_PROFILES: SpecialistProfileResponse[] = [
    {
        id: 'specialist-1',
        slug: 'maria-ivanova',
        main: {
            avatarUrl: '/images/specialists/maria-ivanova.jpg',
            firstName: 'Мария',
            lastName: 'Иванова',
            city: 'Москва',
            district: 'Пресненский район',
            phone: '+7 (999) 123-45-67',
            email: 'specialist@tailly.ru',
        },
        stats: {
            experienceYears: 5,
            rating: 5,
            reviewsCount: 18,
            completedOrdersCount: 46,
            repeatOrdersCount: 14,
        },
        calendar: {
            timezone: 'Europe/Moscow',
            dayOverrides: [
                { date: '2026-03-15', status: 'day_off' },
                { date: '2026-03-18', status: 'fully_booked' },
            ],
            bookedSlots: [
                {
                    id: 'booked-1',
                    date: '2026-03-12',
                    startTime: '10:00',
                    endTime: '11:00',
                    serviceIds: ['service-1'],
                },
                {
                    id: 'booked-2',
                    date: '2026-03-12',
                    startTime: '17:00',
                    endTime: '18:00',
                    serviceIds: ['service-3'],
                },
            ],
            availabilityWindows: [
                {
                    id: 'window-1',
                    date: '2026-03-12',
                    startTime: '19:00',
                    endTime: '21:00',
                    serviceIds: ['service-1', 'service-2'],
                    comment: 'Только вечерние записи',
                },
            ],
        },
        specialistGallery: [
            {
                id: 'specialist-gallery-1',
                imageUrl: '/images/specialists/maria-ivanova.jpg',
                alt: 'Мария Иванова дома с питомцем',
            },
            {
                id: 'specialist-gallery-2',
                imageUrl: '/images/specialists/pets/pet-4.jpg',
                alt: 'Мария Иванова на прогулке с собакой',
            },
        ],
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
            experienceDurationValue: 5,
            experienceDurationUnit: 'years',
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

function cloneProfile(profile: SpecialistProfileResponse): SpecialistProfileResponse {
    return JSON.parse(JSON.stringify(profile)) as SpecialistProfileResponse;
}

function normalizeProfileKey(value: string): string {
    return value.trim().toLowerCase();
}

function findProfileIndexBySlug(slug: string): number {
    const normalizedSlug = normalizeProfileKey(decodeURIComponent(slug));

    const bySlug = MOCK_SPECIALIST_PROFILES.findIndex(
        (item) => normalizeProfileKey(item.slug) === normalizedSlug,
    );

    if (bySlug !== -1) {
        return bySlug;
    }

    const byId = MOCK_SPECIALIST_PROFILES.findIndex(
        (item) => normalizeProfileKey(item.id) === normalizedSlug,
    );

    if (byId !== -1) {
        return byId;
    }

    if (MOCK_SPECIALIST_PROFILES.length === 1) {
        return 0;
    }

    return -1;
}

async function mockGetSpecialistProfileBySlug(
    slug: string,
): Promise<SpecialistProfileResponse> {
    await delay(350);

    const profileIndex = findProfileIndexBySlug(slug);

    if (profileIndex === -1) {
        throw new Error('Профиль специалиста не найден.');
    }

    return cloneProfile(MOCK_SPECIALIST_PROFILES[profileIndex]);
}

async function mockUpdateMainInfo(
    slug: string,
    payload: SpecialistMainInfoUpdatePayload,
): Promise<SpecialistProfileResponse> {
    await delay(450);

    const profileIndex = findProfileIndexBySlug(slug);

    if (profileIndex === -1) {
        throw new Error('Профиль специалиста не найден.');
    }

    const currentProfile = MOCK_SPECIALIST_PROFILES[profileIndex];

    MOCK_SPECIALIST_PROFILES[profileIndex] = {
        ...currentProfile,
        main: {
            avatarUrl: payload.avatarUrl?.trim() || undefined,
            firstName: payload.firstName.trim(),
            lastName: payload.lastName.trim(),
            city: payload.city.trim(),
            district: payload.district.trim(),
            phone: payload.phone.trim(),
            email: currentProfile.main.email,
        },
    };

    return cloneProfile(MOCK_SPECIALIST_PROFILES[profileIndex]);
}

async function mockUpdateDetails(
    slug: string,
    payload: SpecialistDetailsUpdatePayload,
): Promise<SpecialistProfileResponse> {
    await delay(500);

    const profileIndex = findProfileIndexBySlug(slug);

    if (profileIndex === -1) {
        throw new Error('Профиль специалиста не найден.');
    }

    const currentProfile = MOCK_SPECIALIST_PROFILES[profileIndex];

    MOCK_SPECIALIST_PROFILES[profileIndex] = {
        ...currentProfile,
        specialistGallery: (payload.specialistGallery ?? []).map((item, index) => ({
            id: item.id || `specialist-gallery-${Date.now()}-${index}`,
            imageUrl: item.imageUrl.trim(),
            alt: item.alt.trim() || `Фото специалиста ${index + 1}`,
        })),
        details: {
            experienceLabel: payload.experienceLabel.trim(),
            experienceDurationValue: payload.experienceDurationValue,
            experienceDurationUnit: payload.experienceDurationUnit,
            housingType: payload.housingType,
            petSizes: [...payload.petSizes],
            petAges: [...payload.petAges],
            hasChildrenUnderTen: payload.hasChildrenUnderTen,
            petTypes: [...payload.petTypes],
            advantages: payload.advantages
                .map((title, index) => ({
                    id: `adv-${Date.now()}-${index}`,
                    title: title.trim(),
                }))
                .filter((item) => item.title.length > 0),
            about: payload.about.trim(),
        },
        services: payload.services.map((service, index) => ({
            id: service.id || `service-${Date.now()}-${index}`,
            name: service.name.trim(),
            locationLabel: service.locationLabel.trim(),
            price: service.price,
            priceUnit: service.priceUnit,
        })),
    };

    return cloneProfile(MOCK_SPECIALIST_PROFILES[profileIndex]);
}

async function realGetSpecialistProfileBySlug(
    slug: string,
): Promise<SpecialistProfileResponse> {
    return fetchJson<SpecialistProfileResponse>(
        `${API_BASE_URL}/specialists/${encodeURIComponent(slug)}`,
    );
}

async function realUpdateMainInfo(
    slug: string,
    payload: SpecialistMainInfoUpdatePayload,
): Promise<SpecialistProfileResponse> {
    return fetchJson<SpecialistProfileResponse>(
        `${API_BASE_URL}/specialists/${encodeURIComponent(slug)}/main`,
        {
            method: 'PATCH',
            body: JSON.stringify(payload),
        },
    );
}

async function realUpdateDetails(
    slug: string,
    payload: SpecialistDetailsUpdatePayload,
): Promise<SpecialistProfileResponse> {
    return fetchJson<SpecialistProfileResponse>(
        `${API_BASE_URL}/specialists/${encodeURIComponent(slug)}/details`,
        {
            method: 'PATCH',
            body: JSON.stringify(payload),
        },
    );
}

export const specialistProfileApi = {
    getBySlug(slug: string): Promise<SpecialistProfileResponse> {
        if (USE_MOCK) {
            return mockGetSpecialistProfileBySlug(slug);
        }
        return realGetSpecialistProfileBySlug(slug);
    },

    updateMainInfo(
        slug: string,
        payload: SpecialistMainInfoUpdatePayload,
    ): Promise<SpecialistProfileResponse> {
        if (USE_MOCK) {
            return mockUpdateMainInfo(slug, payload);
        }

        return realUpdateMainInfo(slug, payload);
    },

    updateDetails(
        slug: string,
        payload: SpecialistDetailsUpdatePayload,
    ): Promise<SpecialistProfileResponse> {
        if (USE_MOCK) {
            return mockUpdateDetails(slug, payload);
        }

        return realUpdateDetails(slug, payload);
    },
    updateCalendar(
        slug: string,
        payload: SpecialistCalendarUpdatePayload,
    ): Promise<SpecialistProfileResponse> {
        if (USE_MOCK) {
            return mockUpdateCalendar(slug, payload);
        }

        return realUpdateCalendar(slug, payload);
    },
};
async function mockUpdateCalendar(
    slug: string,
    payload: SpecialistCalendarUpdatePayload,
): Promise<SpecialistProfileResponse> {
    await delay(450);

    const profileIndex = findProfileIndexBySlug(slug);

    if (profileIndex === -1) {
        throw new Error('Профиль специалиста не найден.');
    }

    const currentProfile = MOCK_SPECIALIST_PROFILES[profileIndex];

    MOCK_SPECIALIST_PROFILES[profileIndex] = {
        ...currentProfile,
        calendar: {
            ...currentProfile.calendar,
            timezone: payload.timezone.trim(),
            dayOverrides: payload.dayOverrides.map((item) => ({
                date: item.date,
                status: item.status,
            })),
            availabilityWindows: payload.availabilityWindows.map((item, index) => ({
                id: item.id || `window-${Date.now()}-${index}`,
                date: item.date,
                startTime: item.startTime,
                endTime: item.endTime,
                serviceIds: [...item.serviceIds],
                comment: item.comment?.trim() || undefined,
            })),
        },
    };

    return cloneProfile(MOCK_SPECIALIST_PROFILES[profileIndex]);
}
async function realUpdateCalendar(
    slug: string,
    payload: SpecialistCalendarUpdatePayload,
): Promise<SpecialistProfileResponse> {
    return fetchJson<SpecialistProfileResponse>(
        `${API_BASE_URL} / specialists / ${encodeURIComponent(slug)} / calendar`,
        {
            method: 'PATCH',
            body: JSON.stringify(payload),
        },
    );
}