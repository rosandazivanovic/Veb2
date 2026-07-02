export const createShareModel = (data = {}) => ({
    accessType: data.accessType || 'VIEW',
    expiresInDays: data.expiresInDays || 7,
});