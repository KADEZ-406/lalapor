const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  
  if (!bearerHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const token = bearerHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'Token format is invalid' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized, invalid token' });
  }
};

module.exports = verifyToken;
