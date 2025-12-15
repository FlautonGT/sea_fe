export interface InputField {
    label: string;
    value: string;
}

export interface SavedAccount {
    nickname: string;
    inputs: InputField[];
    lastUsed?: string;
}

const STORAGE_KEY = 'sea_recent_fields';

interface StorageStructure {
    [region: string]: {
        [productCode: string]: SavedAccount[];
    };
}

export const saveRecentAccount = (region: string, productCode: string, account: SavedAccount) => {
    if (typeof window === 'undefined') return;

    try {
        const existingRaw = localStorage.getItem(STORAGE_KEY);
        const storage: StorageStructure = existingRaw ? JSON.parse(existingRaw) : {};

        // Ensure region and product objects exist
        if (!storage[region]) storage[region] = {};
        if (!storage[region][productCode]) storage[region][productCode] = [];

        const productAccounts = storage[region][productCode];

        // Check for duplicates based on inputs
        // Account matches if ALL inputs match
        const findMatchIndex = (list: SavedAccount[], incoming: SavedAccount) => {
            return list.findIndex(existing => {
                if (existing.inputs.length !== incoming.inputs.length) return false;
                return existing.inputs.every((input, i) =>
                    input.label === incoming.inputs[i].label && input.value === incoming.inputs[i].value
                );
            });
        };

        const existingIndex = findMatchIndex(productAccounts, account);

        if (existingIndex !== -1) {
            // Match found
            const existing = productAccounts[existingIndex];
            // If nickname is the same, do nothing (preserve original order/timestamp?) 
            // Or just return to avoid unnecessary write
            if (existing.nickname === account.nickname) return;

            // If nickname is different, remove the old one so we can add the new one at top
            productAccounts.splice(existingIndex, 1);
        }

        // Add new to top
        const updated = [account, ...productAccounts].slice(0, 5); // Max 5 per product

        storage[region][productCode] = updated;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    } catch (error) {
        console.error('Failed to save recent account:', error);
    }
};

export const getRecentAccounts = (region: string, productCode: string): SavedAccount[] => {
    if (typeof window === 'undefined') return [];

    try {
        const existingRaw = localStorage.getItem(STORAGE_KEY);
        if (!existingRaw) return [];

        const storage: StorageStructure = JSON.parse(existingRaw);

        return storage[region]?.[productCode] || [];
    } catch (error) {
        console.error('Failed to get recent accounts:', error);
        return [];
    }
};
