const crypto = require('crypto');
const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();
const userController = new UserController();

// Helper to verify Telegram login data
function checkTelegramAuthorization(botToken, query) {
  const authData = Object.assign({}, query);
  const hash = authData.hash;
  delete authData.hash;

  // Sort keys and build data string
  const dataCheckArr = [];
  for (const key of Object.keys(authData).sort()) {
    dataCheckArr.push(`${key}=${authData[key]}`);
  }
  const dataCheckString = dataCheckArr.join('\n');

  // Create Hmac using sha256 and your botToken
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return hmac === hash;
}

router.get('/auth', async (req, res) => {
  try {
    // Bot token from environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // Verify data authenticity
    const isValid = checkTelegramAuthorization(botToken, req.query);
    if (!isValid) {
      return res.status(403).json({ error: 'Data not from Telegram' });
    }

    // Check if data is outdated
    const authDate = parseInt(req.query.auth_date, 10);
    if ((Date.now() / 1000) - authDate > 86400) { // 24 hours
      return res.status(401).json({ error: 'Login data is too old' });
    }

    // Extract user info
    const { id, username, first_name, last_name, photo_url } = req.query;

    // Save or update user in DB
    const user = await userController.upsertTelegramUser({
      telegramId: id,
      username,
      firstName: first_name,
      lastName: last_name,
      photoUrl: photo_url,
    });

    // Create session or JWT
    // e.g., req.session.userId = user._id;

    // For a simple flow, redirect to your dashboard or return JSON
    // For example:
    return res.redirect(`/user-dashboard?user_id=${user._id}`);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;