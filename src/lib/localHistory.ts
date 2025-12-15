// User's requested structure wrapper
export interface LocalHistoryOrder {
    account: {
        nickname: string;
        userId: string;
        zoneId?: string;
    };
    createdAt: string;
    invoiceNumber: string;
    pricing: {
        currency: string;
        discount: number;
        paymentFee: number;
        subtotal: number;
        total: number;
    };
    product: {
        code: string;
        image: string;
        name: string;
    };
    quantity: number;
    sku: {
        code: string;
        image: string;
        name: string;
    };
    status: {
        paymentStatus: string;
        transactionStatus: string;
    };
    // Kept flat properties for backward compatibility during migration if needed, 
    // but user requested only saving specific fields.
    // We will stick to the structure above.
}


const STORAGE_KEY = 'sea_last_transactions';

interface StorageStructure {
    [region: string]: LocalHistoryOrder[];
}

// Helper to filter object to only allowed fields
const filterTransaction = (data: any): LocalHistoryOrder => {
    return {
        account: {
            nickname: data.account?.nickname || '',
            userId: data.account?.userId || '',
            zoneId: data.account?.zoneId
        },
        createdAt: data.createdAt,
        invoiceNumber: data.invoiceNumber,
        pricing: data.pricing,
        product: {
            code: data.product?.code || data.productCode || '',
            image: data.product?.image || '',
            name: data.product?.name || data.productName || ''
        },
        quantity: data.quantity,
        sku: {
            code: data.sku?.code || data.skuCode || '',
            image: data.sku?.image || '',
            name: data.sku?.name || data.skuName || ''
        },
        status: {
            paymentStatus: data.status?.paymentStatus || 'UNPAID', // Fallback
            transactionStatus: data.status?.transactionStatus || (typeof data.status === 'string' ? data.status : 'PENDING')
        }
    };
};

export const saveLocalTransaction = (region: string, transaction: any) => {
    if (typeof window === 'undefined') return;

    try {
        const filtered = filterTransaction(transaction);

        const existingRaw = localStorage.getItem(STORAGE_KEY);
        const storage: StorageStructure = existingRaw ? JSON.parse(existingRaw) : {};

        if (!storage[region]) storage[region] = [];

        // Check for duplicates
        const existing = storage[region];
        const index = existing.findIndex(t => t.invoiceNumber === filtered.invoiceNumber);

        if (index !== -1) {
            // Already exists, update it if needed or just return?
            // saveLocalTransaction is usually called on creation, so we might want to return if exists
            // But let's overwrite to be safe
            existing[index] = filtered;
        } else {
            // Add new to top
            existing.unshift(filtered);
        }

        // Limit to 10
        storage[region] = existing.slice(0, 10);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    } catch (error) {
        console.error('Failed to save local transaction:', error);
    }
};

export const syncLocalTransaction = (region: string, transaction: any) => {
    if (typeof window === 'undefined') return;

    try {
        const filtered = filterTransaction(transaction);
        const existingRaw = localStorage.getItem(STORAGE_KEY);
        const storage: StorageStructure = existingRaw ? JSON.parse(existingRaw) : {};

        if (!storage[region]) storage[region] = [];

        const existingList = storage[region];
        const index = existingList.findIndex(t => t.invoiceNumber === filtered.invoiceNumber);

        if (index === -1) {
            // Not in storage, save it
            existingList.unshift(filtered);
            // Limit
            storage[region] = existingList.slice(0, 10);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
        } else {
            // Exists, check status
            const current = existingList[index];
            if (
                current.status.transactionStatus !== filtered.status.transactionStatus ||
                current.status.paymentStatus !== filtered.status.paymentStatus
            ) {
                // Status changed, update
                existingList[index] = filtered;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
            }
        }

    } catch (error) {
        console.error('Failed to sync local transaction:', error);
    }
}

export const getLocalTransactions = (region: string): LocalHistoryOrder[] => {
    if (typeof window === 'undefined') return [];

    try {
        const existingRaw = localStorage.getItem(STORAGE_KEY);
        if (!existingRaw) return [];

        const storage: StorageStructure = JSON.parse(existingRaw);
        return storage[region] || [];
    } catch (error) {
        console.error('Failed to get local transactions:', error);
        return [];
    }
};
