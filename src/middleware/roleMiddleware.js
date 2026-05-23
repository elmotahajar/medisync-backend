/**
 * Middleware d'autorisation par rôle.
 * Usage : router.use(authorizeRoles('admin', 'secretaire'))
 */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}.`,
      });
    }
    next();
  };
};