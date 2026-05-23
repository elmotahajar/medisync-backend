const AuditLog = require('../models/AuditLog');

/**
 * Usage dans une route :
 * router.delete('/:id', verifyToken, audit('SUPPRESSION_USER'), controller)
 */
exports.audit = (action, ressource = null) => {
  return async (req, res, next) => {
    // On laisse passer, puis on log après la réponse
    const originalJson = res.json.bind(res);

    res.json = async (data) => {
      // Log uniquement si la requête a réussi (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await AuditLog.create({
            userId: req.user?.id || null,
            role: req.user?.role || 'inconnu',
            action,
            ressource: ressource
              ? `${ressource}#${req.params?.id || ''}`
              : req.originalUrl,
            details: {
              method: req.method,
              body: req.body,
              params: req.params,
            },
            ip: req.ip || req.headers['x-forwarded-for'],
            statut: 'SUCCES',
          });
        } catch (err) {
          console.error('Audit log error:', err.message);
        }
      }
      return originalJson(data);
    };
    next();
  };
};