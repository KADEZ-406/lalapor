const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (roles.includes(req.userRole)) {
      next();
    } else {
      return res.status(403).json({ message: 'Forbidden, insufficient permissions' });
    }
  };
};

module.exports = checkRole;
