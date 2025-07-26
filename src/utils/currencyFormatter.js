/**
 * Currency formatter utility using Intl.NumberFormat API
 * Supports multiple currencies and locales
 */

/**
 * Format a number as currency
 * @param {number|string} amount - The amount to format
 * @param {Object} options - Formatting options
 * @param {string} options.currency - Currency code (e.g., 'USD', 'EUR', 'GBP')
 * @param {string} options.locale - Locale code (e.g., 'en-US', 'de-DE', 'fr-FR')
 * @param {number} options.minimumFractionDigits - Minimum decimal places
 * @param {number} options.maximumFractionDigits - Maximum decimal places
 * @param {string} options.currencyDisplay - How to display currency ('symbol', 'code', 'name')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (
  amount,
  {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    currencyDisplay = 'symbol'
  } = {}
) => {
  // Handle null, undefined, or empty values
  if (amount === null || amount === undefined || amount === '') {
    return formatCurrency(0, { currency, locale, minimumFractionDigits, maximumFractionDigits, currencyDisplay });
  }

  // Convert string to number if needed
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Handle invalid numbers
  if (isNaN(numericAmount)) {
    throw new Error('Invalid amount provided. Amount must be a valid number.');
  }

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
      currencyDisplay
    });

    return formatter.format(numericAmount);
  } catch (error) {
    throw new Error(`Currency formatting failed: ${error.message}`);
  }
};

/**
 * Format currency with specific presets for common use cases
 */
export const currencyPresets = {
  /**
   * Format as US Dollar
   */
  usd: (amount, options = {}) => formatCurrency(amount, { currency: 'USD', locale: 'en-US', ...options }),

  /**
   * Format as Euro
   */
  eur: (amount, options = {}) => formatCurrency(amount, { currency: 'EUR', locale: 'de-DE', ...options }),

  /**
   * Format as British Pound
   */
  gbp: (amount, options = {}) => formatCurrency(amount, { currency: 'GBP', locale: 'en-GB', ...options }),

  /**
   * Format as Japanese Yen
   */
  jpy: (amount, options = {}) => formatCurrency(amount, { 
    currency: 'JPY', 
    locale: 'ja-JP', 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0, 
    ...options 
  }),

  /**
   * Format as Chinese Yuan
   */
  cny: (amount, options = {}) => formatCurrency(amount, { currency: 'CNY', locale: 'zh-CN', ...options })
};

/**
 * Parse currency string back to number
 * @param {string} currencyString - Formatted currency string
 * @param {string} locale - Locale used for parsing
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString, locale = 'en-US') => {
  if (!currencyString || typeof currencyString !== 'string') {
    return 0;
  }

  // Remove currency symbols and extract numeric value
  // This is a simplified approach - for production use, consider more robust parsing
  const cleanString = currencyString.replace(/[^\d.,-]/g, '');
  
  // Handle different decimal separators based on locale
  let normalizedString = cleanString;
  
  if (locale.includes('de') || locale.includes('fr')) {
    // German/French format: 1.234,56
    normalizedString = cleanString.replace(/\./g, '').replace(',', '.');
  } else {
    // US format: 1,234.56
    normalizedString = cleanString.replace(/,/g, '');
  }

  return parseFloat(normalizedString) || 0;
};

/**
 * Get currency symbol for a given currency code
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for symbol format
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency = 'USD', locale = 'en-US') => {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    // Extract symbol by formatting 0 and removing digits
    return formatter.format(0).replace(/[\d\s]/g, '');
  } catch (error) {
    return currency;
  }
};

export default formatCurrency;