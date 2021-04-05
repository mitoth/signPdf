const IsPhone = (): boolean => {
    if (window.innerWidth < 600) {
        return true;
    }
    return false;
};

const IsTablet = (): boolean => {
    if (window.innerWidth >= 600 && window.innerWidth <= 768) {
        return true;
    }
    return false;
};

const IsLargeEnoughSoYouDontCare = (): boolean => {
    if (window.innerWidth > 768) {
        return true;
    }
    return false;
};

export default {
    IsPhone,
    IsTablet,
    IsLargeEnoughSoYouDontCare,
};
