exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied – Admin only' });
    }
    next();
  };
  
  exports.isSeller = (req, res, next) => {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Access denied – Seller only' });
    }
    next();
  };
  