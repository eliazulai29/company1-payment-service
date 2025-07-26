const validatePaymentRequest = (req, res, next) => {
  const { amount, currency, customer_id } = req.body;
  const errors = [];

  // Check if required fields are present
  if (!amount) {
    errors.push('Amount is required');
  }

  if (!customer_id) {
    errors.push('Customer ID is required');
  }

  // Validate data types
  if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
    errors.push('Amount must be a positive number');
  }

  if (currency !== undefined && typeof currency !== 'string') {
    errors.push('Currency must be a string');
  }

  if (customer_id !== undefined && typeof customer_id !== 'string') {
    errors.push('Customer ID must be a string');
  }

  // Validate currency format (3-letter ISO code)
  if (currency && !/^[A-Z]{3}$/.test(currency)) {
    errors.push('Currency must be a valid 3-letter ISO code (e.g., USD, EUR)');
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  // If validation passes, continue to the next middleware
  next();
};

module.exports = { validatePaymentRequest };