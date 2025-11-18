import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: String, // "doctor" or "patient"
  text: String,
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  chatId: String,
  messages: [messageSchema],
});

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);
