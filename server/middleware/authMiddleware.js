const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token = req.cookies.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, session token missing'));
  }

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback_secret_key';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401);
    return next(new Error('Not authorized, token validation failed'));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Role ${req.user ? req.user.role : 'Guest'} is not authorized to access this resource`));
    }
    next();
  };
};

module.exports = { protect, authorize };
