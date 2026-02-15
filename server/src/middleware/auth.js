const jwt = require('jsonwebtoken');

function auth(requiredRole) {
  return (req, res, next) => {
    try {
      const token =
        req.cookies.token ||
        (req.headers.authorization && req.headers.authorization.split(' ')[1]);

      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      const decoded = jwt.verify(token, req.appConfig.JWT_SECRET);
      req.user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (err) {
      console.error('Auth error:', err.message);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  };
}

module.exports = auth;


