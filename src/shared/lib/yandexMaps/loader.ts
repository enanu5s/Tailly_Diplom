//src/shared/lib/yandexMaps/loader.ts

let loadingPromise: Promise<any> | null = null;

export function loadYandexMaps(): Promise<any> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Yandex Maps can be loaded only in browser'));
    }

    if (window.ymaps) {
        return Promise.resolve(window.ymaps);
    }

    if (loadingPromise) return loadingPromise;

    const apiKey = import.meta.env.VITE_YMAPS_API_KEY ?? '';
    const lang = 'ru_RU';

    loadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const keyPart = apiKey ? `apikey = ${ encodeURIComponent(apiKey)
    }&` : '';
    script.src = `https://api-maps.yandex.ru/2.1/?${keyPart}lang=${lang}`;
    script.async = true;

    script.onload = () => {
        if (!window.ymaps) {
            reject(new Error('ymaps is not available after script load'));
        } else {
            resolve(window.ymaps);
        }
    };

    script.onerror = () => reject(new Error('Failed to load Yandex Maps script'));

    document.head.appendChild(script);
});

return loadingPromise;
}