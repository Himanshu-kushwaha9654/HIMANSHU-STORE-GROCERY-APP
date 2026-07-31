/**
 * Formats a number to an Indian Rupee string (e.g. ₹1,299).
 * It uses the 'en-IN' locale to ensure correct comma placement (crores, lakhs, thousands).
 * Fractional digits are removed for a cleaner look.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}
