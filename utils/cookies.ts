export const setCookie = (name: string, value: string, days = 7) => {
    const expires = new Date(
        Date.now() + days * 24 * 60 * 60 * 1000
    ).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

export const removeCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};
