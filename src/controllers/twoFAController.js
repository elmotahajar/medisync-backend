const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { User } = require('../models');

/**
 * POST /auth/2fa/setup
 * Génère le secret 2FA et retourne le QR code à scanner.
 * Réservé à l'admin.
 */
exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    const secret = speakeasy.generateSecret({
      name: `MediSync (${user.email})`,
      issuer: 'MediSync',
    });

    // Sauvegarder le secret temporairement
    user.twoFASecret = secret.base32;
    user.twoFAEnabled = false;
    await user.save();

    // Générer le QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return res.json({
      message: 'Scannez ce QR code avec Google Authenticator.',
      qrCode: qrCodeUrl,
      secret: secret.base32, // backup manuel
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * POST /auth/2fa/verify
 * Vérifier le code TOTP et activer le 2FA.
 * Body : { token }
 */
exports.verify2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const { token } = req.body;

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Code invalide.' });
    }

    user.twoFAEnabled = true;
    await user.save();

    return res.json({ message: '2FA activé avec succès ✅' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

/**
 * POST /auth/2fa/validate
 * Appelé après le login pour valider le code 2FA.
 * Body : { userId, token }
 */
exports.validate2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findByPk(userId);

    if (!user || !user.twoFAEnabled) {
      return res.status(400).json({ message: '2FA non activé.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({ message: 'Code 2FA invalide.' });
    }

    return res.json({ message: '2FA validé ✅', userId: user.id });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};