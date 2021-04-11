const GetScreenWidth = (): number => {
    if (window.innerWidth > window.outerWidth) {
        return window.outerWidth;
    }
    return window.innerWidth;
};

const GetScreenHeight = (): number => {
    if (window.innerHeight > window.outerHeight) {
        return window.outerHeight;
    }
    return window.innerHeight;
};

export default {
    GetScreenWidth,
    GetScreenHeight,
};
