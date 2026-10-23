const db = require('../config/db');

// @desc    Get all addresses for authenticated user
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [addresses] = await db.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, street_address, city, state, postal_code, country = 'United States', is_default = false } = req.body;

    if (!full_name || !phone || !street_address || !city || !state || !postal_code) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required address fields.'
      });
    }

    // Check if user has any existing addresses
    const [existing] = await db.query('SELECT COUNT(*) as count FROM addresses WHERE user_id = ?', [userId]);
    const shouldBeDefault = is_default || existing[0].count === 0 ? 1 : 0;

    if (shouldBeDefault) {
      // Remove default status from others
      await db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }

    const [result] = await db.query(`
      INSERT INTO addresses (user_id, full_name, phone, street_address, city, state, postal_code, country, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, full_name.trim(), phone.trim(), street_address.trim(), city.trim(), state.trim(), postal_code.trim(), country.trim(), shouldBeDefault]);

    const [created] = await db.query('SELECT * FROM addresses WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      address: created[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addressId = parseInt(req.params.id, 10);
    const { full_name, phone, street_address, city, state, postal_code, country = 'United States', is_default = false } = req.body;

    const [existing] = await db.query('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    if (is_default) {
      await db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }

    await db.query(`
      UPDATE addresses 
      SET full_name = ?, phone = ?, street_address = ?, city = ?, state = ?, postal_code = ?, country = ?, is_default = ?
      WHERE id = ? AND user_id = ?
    `, [full_name.trim(), phone.trim(), street_address.trim(), city.trim(), state.trim(), postal_code.trim(), country.trim(), is_default ? 1 : 0, addressId, userId]);

    const [updated] = await db.query('SELECT * FROM addresses WHERE id = ?', [addressId]);

    res.json({
      success: true,
      message: 'Address updated successfully.',
      address: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addressId = parseInt(req.params.id, 10);

    await db.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);

    res.json({
      success: true,
      message: 'Address removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set address as default
// @route   PUT /api/users/addresses/:id/default
// @access  Private
const setDefaultAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addressId = parseInt(req.params.id, 10);

    await db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    await db.query('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?', [addressId, userId]);

    res.json({
      success: true,
      message: 'Default address updated.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
