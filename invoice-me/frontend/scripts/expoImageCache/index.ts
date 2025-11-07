const imageCache = new Set();

export const isImageCached = (uri: string) => {
    return imageCache.has(uri);
};

export const addImageToCache = (uri: string) => {
    imageCache.add(uri);
};
