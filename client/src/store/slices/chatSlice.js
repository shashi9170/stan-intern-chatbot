import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentChatId: null,
  chats: [], // Array of { _id, title, messages: [] }
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // 1. Set the Active Chat ID
    setCurrentChat(state, action) {
      state.currentChatId = action.payload;
    },

    // 2. Load History List (Merges with existing state to preserve loaded messages)
    setChats(state, action) {
      const incomingChats = action.payload; // Expects [{ _id, title, ... }]
      
      if (state.chats.length === 0) {
        state.chats = incomingChats.map(c => ({ ...c, messages: [] }));
      } else {
        state.chats = incomingChats.map(newChat => {
          const existing = state.chats.find(c => c._id === newChat._id);
          return existing 
            ? { ...newChat, messages: existing.messages } 
            : { ...newChat, messages: [] };
        });
      }
    },

    // 3. Set Messages for a Specific Chat (Clicking Sidebar)
    setChatMessages(state, action) {
      const { chatId, messages } = action.payload;
      const chat = state.chats.find(c => c._id === chatId);
      if (chat) {
        chat.messages = messages;
      }
    },

    // 4. Add a Single Message (Optimistic Updates)
    addMessage(state, action) {
      const { chatId, message } = action.payload;
      if (!chatId) return;

      const chat = state.chats.find(c => c._id === chatId);
      if (chat) {
        if (!chat.messages) chat.messages = [];
        chat.messages.push(message);
      }
    },

    // 5. Update Last Message (For Real-time Streaming)
    updateLastMessage(state, action) {
      const { chatId, content } = action.payload;
      if (!chatId) return;

      const chat = state.chats.find(c => c._id === chatId);
      if (chat && chat.messages && chat.messages.length > 0) {
        const lastIndex = chat.messages.length - 1;
        chat.messages[lastIndex].content = content;
      }
    },
    
    // 6. Reset State (Logout)
    clearChatState(state) {
        state.currentChatId = null;
        state.chats = [];
    }
  },
});

export const { 
  setCurrentChat, 
  setChats, 
  setChatMessages, 
  addMessage, 
  updateLastMessage,
  clearChatState 
} = chatSlice.actions;

export default chatSlice.reducer;