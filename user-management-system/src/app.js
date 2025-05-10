require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const setUserRoutes = require('./routes/userRoutes');
const telegramAuth = require('./routes/telegramAuth');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

// Register routes
setUserRoutes(app);
app.use('/api/telegram', telegramAuth);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;