import api, { BASE_URL } from "./api.service"; // Ensure 'baseurl' is exported from api.js

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const getChatHistory = async () => {
  const res = await api.get("/chat/all");
  // Backend returns: { status: "success", data: [...] }
  return res.data.data; 
};

export const getChatMessages = async (chatId) => {
  const res = await api.get(`/chat/${chatId}`);
  // Backend returns: { status: "success", data: { chat_id: "...", messages: [...] } }
  // Make sure to access the nested data correctly
  return res.data.data.messages; 
};

export async function* streamChat({ message, chatId }) {
  // Construct URL
  // Note: baseurl usually does not include '/api' if axios base includes it, 
  // but fetch needs the full path. Adjust '/api' if your baseurl already has it.
  const url = `${BASE_URL}/api/chat/stream${chatId ? `?chat_id=${chatId}` : ""}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Essential for cookies
    body: JSON.stringify({
      messages: [ // Must be an array
        {
          role: "user", // "user" is the standard for most LLM schemas (OpenAI/Pydantic)
          content: message,
        },
      ],
    }),
  });

  if (!response.body) {
    throw new Error("Streaming not supported by browser");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    yield decoder.decode(value);
  }
}