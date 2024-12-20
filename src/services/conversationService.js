const Conversation = require("../models/conversation");

const startConversation = async (userId) => {
  let conversation = await Conversation.findOne({ userId });
  if (!conversation) {
    conversation = new Conversation({ userId, messages: [] });
  }
  return conversation;
};

async function saveMessage(chatId, question, answer) {
  try {
    const conversation = await Conversation.findOneAndUpdate(
      { chatId },
      {
        $push: { messages: { question, answer, timestamp: new Date() } },
      },
      { upsert: true, new: true }
    );
    return conversation;
  } catch (error) {
    console.error("Error saving message:", error.message);
  }
}

module.exports = { saveMessage };
