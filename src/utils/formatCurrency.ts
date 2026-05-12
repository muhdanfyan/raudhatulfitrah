export const formatCurrency = (amount: number | string): string => {
    // Convert string to number if needed, removing non-numeric characters except for dots/commas if they are part of the number structure (simplified here)
    const num = typeof amount === 'string' ? parseInt(amount.replace(/[^0-9]/g, ''), 10) : amount;

    if (isNaN(num)) return 'Rp 0';

    // Format with 'k' for thousands
    if (num >= 1000) {
        // Check if it's a multiple of 1000
        if (num % 1000 === 0) {
            return `Rp ${(num / 1000).toLocaleString('id-ID')}k`;
        }
    }

    return `Rp ${num.toLocaleString('id-ID')}`;
};
