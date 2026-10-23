// Input Validation Helpers

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters long.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the errors.',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
      errors
    });
  }

  next();
};

const validateProduct = (req, res, next) => {
  const { title, price, category_id, stock_quantity, image_url } = req.body;
  const errors = {};

  if (!title || title.trim().length < 3) {
    errors.title = 'Product title must be at least 3 characters.';
  }

  if (price === undefined || isNaN(price) || Number(price) <= 0) {
    errors.price = 'Price must be a positive number.';
  }

  if (!category_id || isNaN(category_id)) {
    errors.category_id = 'A valid category must be selected.';
  }

  if (stock_quantity === undefined || isNaN(stock_quantity) || Number(stock_quantity) < 0) {
    errors.stock_quantity = 'Stock quantity cannot be negative.';
  }

  if (!image_url || !image_url.trim()) {
    errors.image_url = 'A main product image URL is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Product validation failed.',
      errors
    });
  }

  next();
};

const validateOrder = (req, res, next) => {
  const { shipping_address, items } = req.body;
  const errors = {};

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.items = 'Your order must contain at least one item.';
  }

  if (!shipping_address) {
    errors.shipping_address = 'Shipping address is required.';
  } else {
    if (!shipping_address.full_name) errors.full_name = 'Recipient name is required.';
    if (!shipping_address.phone) errors.phone = 'Contact phone number is required.';
    if (!shipping_address.street_address) errors.street_address = 'Street address is required.';
    if (!shipping_address.city) errors.city = 'City is required.';
    if (!shipping_address.state) errors.state = 'State / Province is required.';
    if (!shipping_address.postal_code) errors.postal_code = 'Postal / ZIP code is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Order validation failed.',
      errors
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateOrder
};
