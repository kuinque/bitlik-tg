const express = require('express');
const UserController = require('../controllers/userController');

const setUserRoutes = (app) => {
    const router = express.Router();
    const userController = new UserController();

    router.post('/users', userController.createUser.bind(userController));
    router.get('/users/:id', userController.getUser.bind(userController));
    router.put('/users/:id', userController.updateUser.bind(userController));
    router.delete('/users/:id', userController.deleteUser.bind(userController));

    app.use('/api', router);
};

module.exports = setUserRoutes;
```

<!DOCTYPE html>
<html>
<head>
  <title>Telegram Auth</title>
  <script async src="https://telegram.org/js/telegram-widget.js?21" 
          data-telegram-login="YourBotUsername"
          data-size="large"
          data-auth-url="https://your-domain.com/api/telegram/auth"
          data-request-access="write">
  </script>
</head>
<body>
  <!-- The widget button will appear here -->
</body>
</html>