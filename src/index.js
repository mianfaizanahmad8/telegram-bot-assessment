const bot = require("./bot/bot"); // Import the bot setup
const connectDB = require("./db/db"); // Import the MongoDB connection
const { saveMessage } = require("./services/conversationService"); // Import the service to save messages

// Connect to MongoDB
connectDB();

// Handle user conversation flow
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Hello! Are you looking for a health insurance plan? (Yes/No)"
  );
});

bot.onText(/(yes|no)/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const userResponse = match[0].toLowerCase();

  if (userResponse === "yes") {
    await saveMessage(
      chatId,
      "Are you looking for a health insurance plan?",
      "Yes"
    );
    bot.sendMessage(
      chatId,
      "Great! Let's get started. What is your family size?"
    );
  } else {
    await saveMessage(
      chatId,
      "Are you looking for a health insurance plan?",
      "No"
    );
    bot.sendMessage(
      chatId,
      "No problem! Let me know if you need assistance later."
    );
  }
});

// Handle family size response
bot.onText(/What is your family size\?/, async (msg) => {
  const chatId = msg.chat.id;
  const userResponse = msg.text;
  await saveMessage(chatId, "What is your family size?", userResponse);
  bot.sendMessage(chatId, "What is your household income?");
});

// Handle household income response
bot.onText(/What is your household income\?/, async (msg) => {
  const chatId = msg.chat.id;
  const userResponse = msg.text;
  await saveMessage(chatId, "What is your household income?", userResponse);
  bot.sendMessage(chatId, "What is your gender?");
});

// Handle gender response
bot.onText(/What is your gender\?/, async (msg) => {
  const chatId = msg.chat.id;
  const userResponse = msg.text;
  await saveMessage(chatId, "What is your gender?", userResponse);
  bot.sendMessage(
    chatId,
    "Thanks for sharing! We'll get back to you with options soon."
  );
});
