require("dotenv").config();

module.exports = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
  MONGO_URI: process.env.MONGO_URI,
};
