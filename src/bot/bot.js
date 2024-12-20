const TelegramBot = require("node-telegram-bot-api");
const { saveMessage } = require("../services/conversationService");
const { OpenAI } = require("openai");

require("dotenv").config();

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to get GPT response
async function getGPTResponse(prompt) {
  console.log("****************");
  console.log("promopt", prompt);
  console.log("****************");
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error from OpenAI:", error.message);
    return "Sorry, I couldn’t understand that. Can you rephrase?";
  }
}

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// In-memory conversation state
const userConversations = {};

// Handle incoming messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id.toString();
  const userResponse = msg.text?.toLowerCase();

  // Initialize conversation state if not already present
  if (!userConversations[chatId]) {
    userConversations[chatId] = {
      step: 0, // Tracks which question the user is on
      conversationId: new Date().getTime(), // Unique conversation ID
    };
  }

  const currentState = userConversations[chatId];

  try {
    if (currentState.step === 0) {
      // Step 0: Ask the first question
      await bot.sendMessage(
        chatId,
        "Are you looking for a health insurance plan? (yes/no)"
      );
      currentState.step++;
    } else if (currentState.step === 1) {
      // Step 1: Handle the response to the first question
      await saveMessage(
        chatId,
        "Are you looking for a health insurance plan?",
        userResponse,
        currentState.conversationId
      );

      if (userResponse.includes("yes")) {
        await bot.sendMessage(chatId, "Great! What is your family size?");
        currentState.step++;
      } else {
        await bot.sendMessage(
          chatId,
          "Okay, feel free to ask me if you have any questions!"
        );
        delete userConversations[chatId]; // End conversation
      }
    } else if (currentState.step === 2) {
      // Step 2: Ask about family size
      if (isNaN(userResponse)) {
        await bot.sendMessage(
          chatId,
          "Please enter a valid number for family size."
        );
        return; // Retry the same step
      }
      await saveMessage(
        chatId,
        "What is your family size?",
        userResponse,
        currentState.conversationId
      );
      await bot.sendMessage(chatId, "What is your household income?");
      currentState.step++;
    } else if (currentState.step === 3) {
      // Step 3: Ask about household income
      await saveMessage(
        chatId,
        "What is your household income?",
        userResponse,
        currentState.conversationId
      );
      await bot.sendMessage(chatId, "What is your gender?");
      currentState.step++;
    } else if (currentState.step === 4) {
      // Step 4: Handle the user's gender response
      await saveMessage(
        chatId,
        "What is your gender?",
        userResponse,
        currentState.conversationId
      );

      // Get GPT response based on gender
      const botResponse = await getGPTResponse(
        `The user said their gender is ${userResponse}. Reply in a friendly way.`
      );

      await bot.sendMessage(chatId, botResponse);

      // End the conversation
      delete userConversations[chatId];
    }
  } catch (error) {
    console.error("Error handling message:", error.message);
    await bot.sendMessage(
      chatId,
      "Something went wrong. Please try again later."
    );
  }
});

module.exports = bot;
