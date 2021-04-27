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

const ComputePageSizeRelativeToScreen = (realPageWidth: number, realPageHeight: number): [number, number] => {
    let width: number;
    let height: number;

    if (realPageWidth > GetScreenWidth()) {
        const shrinkRatio = realPageWidth / GetScreenWidth();
        width = GetScreenWidth();
        height = realPageHeight / shrinkRatio;
    } else {
        width = realPageWidth;
        height = realPageHeight;
    }
    return [width, height];
};

export default {
    GetScreenWidth,
    GetScreenHeight,
    ComputePageSizeRelativeToScreen,
};
