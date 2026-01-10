import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setCurrentChat,
  addMessage,
  setChats,
  updateLastMessage,
  setChatMessages
} from "../store/slices/chatSlice";
import {
  Bot,
  Send,
  Plus,
  MessageSquare,
  Loader2,
  User
} from "lucide-react";
import {
  getChatHistory,
  getChatMessages,
  streamChat
} from "../service/chat.service";
import MessageContent from "../components/MessageContent";

const ChatPage = () => {
  const dispatch = useDispatch();
  const bottomRef = useRef(null);

  const { currentChatId, chats } = useSelector(state => state.chat);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [tempMessages, setTempMessages] = useState([]);

  /* ---------------- LOAD CHAT HISTORY ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const history = await getChatHistory();
        dispatch(setChats(history || []));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingHistory(false);
      }
    })();
  }, [dispatch]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChatId, chats, tempMessages.length]);

  const messages = currentChatId
    ? chats.find(c => c._id === currentChatId)?.messages || []
    : tempMessages;

  /* ---------------- NEW CHAT ---------------- */
  const handleNewChat = () => {
    if (isStreaming) return;
    dispatch(setCurrentChat(null));
    setTempMessages([]);
  };

  /* ---------------- LOAD CHAT ---------------- */
  const loadChat = async (chatId) => {
    if (isStreaming || chatId === currentChatId) return;

    dispatch(setCurrentChat(chatId));
    setTempMessages([]);

    const cached = chats.find(c => c._id === chatId);
    if (cached?.messages?.length) return;

    setIsLoadingMessages(true);
    try {
      const msgs = await getChatMessages(chatId);
      dispatch(setChatMessages({ chatId, messages: msgs }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  /* ---------------- SEND MESSAGE (SAFE) ---------------- */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const text = input;
    setInput("");
    setIsStreaming(true);

    const userMsg = { role: "user", content: text };
    const botMsg = { role: "assistant", content: "" };

    /* ========= CASE 1: EXISTING CHAT ========= */
    if (currentChatId) {
      dispatch(addMessage({ chatId: currentChatId, message: userMsg }));
      dispatch(addMessage({ chatId: currentChatId, message: botMsg }));

      let fullResponse = "";

      try {
        const stream = streamChat({
          message: text,
          chatId: currentChatId // 🔒 DO NOT CHANGE
        });

        for await (const chunk of stream) {
          fullResponse += chunk;
          dispatch(updateLastMessage({
            chatId: currentChatId,
            content: fullResponse
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsStreaming(false);
      }

      return; // ⛔ STOP – DO NOT CREATE NEW CHAT
    }

    /* ========= CASE 2: NEW CHAT ========= */
    setTempMessages([userMsg, botMsg]);
    let fullResponse = "";

    try {
      const stream = streamChat({ message: text });

      for await (const chunk of stream) {
        fullResponse += chunk;
        setTempMessages(prev => {
          const copy = [...prev];
          copy[1] = { ...copy[1], content: fullResponse };
          return copy;
        });
      }

      const history = await getChatHistory();
      const newChat = history[0];

      dispatch(setChats(history));
      dispatch(setCurrentChat(newChat._id));
      dispatch(setChatMessages({
        chatId: newChat._id,
        messages: [
          userMsg,
          { role: "assistant", content: fullResponse }
        ]
      }));

      setTempMessages([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
    }
  };

  /* ======================= UI ======================= */

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex overflow-hidden">

      {/* ---------- SIDEBAR ---------- */}
      <aside className="hidden md:flex w-72 flex-col bg-slate-900 border-r border-white/5">
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl px-4 py-3 font-medium"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
          {isLoadingHistory ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            chats.map(chat => (
              <button
                key={chat._id}
                onClick={() => loadChat(chat._id)}
                className={`w-full px-3 py-3 rounded-lg flex gap-3 text-sm
                  ${currentChatId === chat._id
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5"}
                `}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">{chat.title || "New Chat"}</span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ---------- CHAT AREA ---------- */}
      <section className="flex-1 relative">

        {/* ---------- MESSAGES ---------- */}
        <div
          className="absolute top-0 left-0 right-0 bottom-[88px]
                     overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar"
        >
          {isLoadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <Bot className="w-20 h-20 mb-4 text-indigo-500" />
              <h2 className="text-3xl font-bold">STAN AI</h2>
              <p>How can I help you today?</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex max-w-4xl mx-auto gap-4
                  ${msg.role === "user" ? "justify-end" : ""}
                `}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mt-1">
                    <Bot className="w-5 h-5 text-indigo-400" />
                  </div>
                )}

                <div
                  className={`px-5 py-3 rounded-2xl text-sm max-w-[85%]
                    ${msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm"}
                  `}
                >
                  {msg.role === "assistant" ? (
                    msg.content ? (
                      <MessageContent content={msg.content} />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        STAN is thinking…
                      </div>
                    )
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mt-1">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* ---------- INPUT ---------- */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[88px]
                     border-t border-white/5 bg-slate-950 flex items-center px-4"
        >
          <form
            onSubmit={handleSend}
            className="max-w-4xl mx-auto w-full relative"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isStreaming}
              placeholder={isStreaming ? "Generating response…" : "Message STAN AI"}
              className="w-full px-5 py-4 rounded-xl bg-slate-900 border border-white/10
                         focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         h-10 w-10 bg-indigo-600 hover:bg-indigo-500 rounded-lg
                         flex items-center justify-center disabled:opacity-50"
            >
              {isStreaming ? <Loader2 className="animate-spin" /> : <Send />}
            </button>
          </form>
        </div>

      </section>
    </div>
  );
};

export default ChatPage;
