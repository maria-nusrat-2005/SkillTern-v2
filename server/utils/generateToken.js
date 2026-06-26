const jwt = require('jsonwebtoken');

/**
 * Generates JWT Access and Refresh tokens and sets them as httpOnly cookies on the response.
 * @param {Object} res - Express response object
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {Object} { accessToken, refreshToken }
 */
const generateTokens = (res, userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret_key',
    { expiresIn: '7d' }
  );

  // Set Access Token Cookie (15 mins)
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  // Set Refresh Token Cookie (7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
