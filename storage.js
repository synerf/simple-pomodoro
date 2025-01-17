const saveToStorage = async (key, value) => {
    const obj = {};
    obj[key] = value;
    await chrome.storage.local.set(obj);
};

const loadFromStorage = async (key, defaultValue) => {
    const result = await chrome.storage.local.get(key);
    return result[key] || defaultValue;
};
