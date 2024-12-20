const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  chatId: { type: String, required: true },
  messages: [
    {
      question: String,
      answer: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
