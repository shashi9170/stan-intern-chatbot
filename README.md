# STAN — Intern Chatbot

A production-style, full‑stack chatbot application with persistent memory, user authentication, and multi-model LLM support. The backend is built with FastAPI + MongoDB and integrates with LLM providers (HuggingFace / Llama endpoints). The frontend is a React + Vite SPA. Both backend and frontend are deployed on Render.

Live demo
- Full app (backend + UI): https://stan-intern-chatbot.onrender.com
- Frontend: https://stan-intern-chatbot-1.onrender.com

Quick repository path
- Repo: https://github.com/shashi9170/stan-intern-chatbot

Table of contents
- Features
- Architecture overview
- Repository structure
- Requirements & prerequisites
- Environment variables (backend & frontend)
- Install & run locally (backend & frontend)
- API reference (endpoints + examples)
- Client: streaming example (JS)
- Tech stack
- Deployment notes (Render)
- Troubleshooting & common errors
- Contributing
- License
- Screenshots & diagrams (placeholders)
- Contact / maintainers

---

Features
- Sign up / Login with JWT set in secure HTTP-only cookie
- Create and manage chat sessions (branches)
- Streaming assistant responses (server-side streaming)
- Persistent chat history saved in MongoDB
- Vector memory store integration (Pinecone + embeddings)
- Automatic memory extraction (deterministic regex + LLM-based extraction)
- Short title generation background task for newly created chats
- Prompt refinement graph (LangGraph-like workflow) to rewrite ambiguous user inputs
- Frontend: modern, responsive chat UI built with React + Vite and Redux

---

Architecture overview
- Frontend (React) <--> Backend (FastAPI REST + streaming endpoints)
- Backend:
  - AuthService: register / login / profile (JWT in cookie, decode_token dependency)
  - ChatService: create chats, branches, messages, fetch last N messages
  - ModelFactory & LlamaModel: encapsulates LLM clients (HuggingFace chat endpoints)
  - Vector store: embeddings (HuggingFace) and Pinecone client for upsert/query
  - Chat streaming controller: handles prompt refinement, memory lookups, message persistence, streaming to client, and post-save memories
- Database: MongoDB collections for users, chats, branches, messages
- Deploy: Render for both backend and frontend (environment variables set in Render dashboard)

---

Repository structure (high-level)
- backend / app
  - api/ — route definitions (auth, chat)
  - controller/ — chat controller that yields streaming responses
  - core/ — config, identity/system prompts, security utils (JWT, hashing)
  - db/ — mongo client + collection exports, entity document factories
  - graphs/ — prompt refiner graph
  - models/ — BaseChatModel, LlamaModel, ModelFactory
  - services/ — AuthService, ChatService, memory_extractor, etc.
  - tasks/ — background tasks (title generation)
  - vectorstore/ — embeddings, pinecone client, memory store helpers
- frontend
  - src/ — React app, pages, components, store, services
  - vite config, package.json, etc.
- requirements.txt (backend)
- package.json (frontend)
---

Requirements & prerequisites

Backend
- Python 3.10+
- A modern async-capable MongoDB driver (Motor)
- FastAPI, Uvicorn
- jose, passlib[bcrypt] for JWT + password hashing
- pinecone client (or Pinecone Serverless SDK) and huggingface libs (langchain-huggingface wrappers may be used)
- pip packages in requirements.txt

Frontend
- Node 16+ (recommended)
- npm or yarn
- Vite + React + Redux Toolkit

Other services
- MongoDB (Atlas recommended for production)
- Pinecone (optional; used for vector memory)
- HuggingFace API / other LLM endpoints
- OpenAI (optional — code supports multi-provider patterns)

---

Environment variables

Important backend variables (present in app/core/config.py)
- JWT_SECRET_KEY (or JWT_SECRET_KEY) — secret used to sign JWTs (REQUIRED)
- JWT_ALGORITHM — signing algorithm, default HS256
- JWT_EXPIRE_MINUTES — token expiry in minutes
- MONGODB_URI — connection string for MongoDB (REQUIRED)
- MONGODB_DB_NAME — database name (default in code: "chat_app")
- HUGGINGFACE_API_KEY (HuggingFace token used for embeddings & model access)
- PINECONE_API_KEY — Pinecone API key (optional, required if using Pinecone)
- PINECONE_INDEX — Pinecone index name (required for Pinecone)
- PINECONE_REGION — Pinecone region (used for index creation)
- DIMENSION — embedding vector dimension (default 384)
- BASE_URL (or FRONTEND_URL) — frontend origin to allow CORS
- Other provider keys can be added to API_KEYS and BASE_URLS dicts in config.py

Frontend env (Vite)
- VITE_API_BASE_URL — base API URL (e.g., http://localhost:8000 or https://stan-intern-chatbot.onrender.com)
Note: Vite env vars must be prefixed with VITE_.

Security note: Never commit real API keys. Use .env (frontend) and the host provider's secret management (Render / environment variables).

---

Install & run locally

Backend (FastAPI)
1. Clone repo:
   git clone https://github.com/shashi9170/stan-intern-chatbot.git
   cd stan-intern-chatbot

2. Create virtualenv and install:
   python -m venv .venv
   source .venv/bin/activate   # macOS/Linux
   .venv\Scripts\activate      # Windows
   pip install -r requirements.txt

3. Create a .env file in backend root (see Environment variables above). Example:
   JWT_SECRET_KEY="change_this_to_a_strong_secret"
   MONGODB_URI="mongodb://localhost:27017"
   MONGODB_DB_NAME="chat_app"
   HUGGINGFACE_API_KEY="hf_xxx"
   PINECONE_API_KEY="pc_xxx"
   PINECONE_INDEX="stan-mem-index"
   PINECONE_REGION="us-west1-gcp"
   DIMENSION=384
   BASE_URL="http://localhost:5173"

4. Start the app:
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

5. Open docs:
   Swagger UI: http://localhost:8000/docs
   Root health: http://localhost:8000/

Frontend (React + Vite)
1. cd frontend (or wherever the front-end lives)
2. Install:
   npm install
3. Create .env (example):
   VITE_API_BASE_URL="http://localhost:8000"
4. Run dev server:
   npm run dev
5. Open Vite URL (typically http://localhost:5173)

Docker (optional)
- If you prefer containers, create Dockerfiles for frontend and backend and a docker-compose.yml that injects env vars and links containers to a MongoDB container or external Atlas. (This repo may not include Docker files; create them if needed.)

---

API Reference (routes found in app/api)

Base root
- GET / -> Health: returns {"message": "Multi-Model LangGraph Chatbot API is running!"}

Auth
- POST /api/auth/register
  - Request body: RegisterRequest { username, email, password }
  - Response: sets cookie `access_token` (httpOnly) and returns {"message": "User registered successfully"}
- POST /api/auth/login
  - Request body: LoginRequest { username, password }
  - Response: sets cookie `access_token` and returns {"message": "Login successful"}
- GET /api/auth/me
  - Auth: cookie `access_token` required
  - Response: user profile { id, username, email, plan, created_at }

Chats
- GET /api/chat/all
  - Returns: { status: "success", data: [ { _id, title, created_at } ] }
  - Auth: cookie `access_token`
- GET /api/chat/latest
  - Returns: most recent chat with messages or {"status":"empty"}
  - Auth: cookie
- GET /api/chat/{chat_id}
  - Returns: chat details + messages
  - Auth: cookie
- POST /api/chat/stream
  - Streaming endpoint (text/plain) for sending a message and receiving the assistant response in a streaming manner.
  - Params:
    - Query: chat_id (optional) to append to an existing chat
    - Body: ChatRequest { messages: [ ChatMessage {...} ] } — typically include a single user message as last element
  - Response: StreamingResponse that yields chunks of assistant content (frontend reads incrementally)
  - Behavior:
    - Creates chat (if chat_id omitted)
    - Refines prompt via prompt_refiner_graph
    - Extracts deterministic facts (regex) for names/jobs
    - Optionally extracts additional facts using an LLM
    - Queries vector memory (Pinecone) for context
    - Streams assistant reply, persists final assistant content to messages, and upserts conversation memory

Notes
- The streaming response is produced by model.stream_response (LlamaModel) which yields chunks from the underlying huggingface endpoint. The streaming content is plain text chunks (concatenate to reconstruct the full assistant message).
- The cookie `access_token` is used for authentication; get_current_user dependency reads it via Cookie.

Example curl (login)
curl -X POST "http://localhost:8000/api/auth/login" -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}' -i

Example message (non-streaming simulation)
- The API is streaming-first. To use it, the client opens `/api/chat/stream` and reads chunks.

Client streaming example (JavaScript fetch)
- The backend returns a chunked text/plain response. Use a fetch reader to process chunks in real time.

Example:
```js
async function streamMessage(message, chatId = null) {
  const res = await fetch(`${API_BASE}/api/chat/stream${chatId ? `?chat_id=${chatId}` : ''}`, {
    method: 'POST',
    credentials: 'include', // send cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: message }] }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let done = false;
  let assistantText = '';

  while (!done) {
    const { value, done: streamDone } = await reader.read();
    done = streamDone;
    if (value) {
      const chunk = decoder.decode(value);
      assistantText += chunk;
      // update UI with `assistantText`
    }
  }

  return assistantText; // final response
}
```

If you need an example using Axios + responseType='stream', prefer native fetch or the frontend service helper that already wraps streaming.

---

Tech stack

Backend
- FastAPI (async), Uvicorn
- Motor (async MongoDB client)
- passlib (bcrypt), python-jose for JWT
- Pinecone (vector DB) + HuggingFace inference client for embeddings & LLM chat
- LangGraph-style graph (state graph) for prompt refinement
- Pydantic for request models / validation

Frontend
- React + Vite
- Redux Toolkit for state
- Tailwind CSS (styling classes seen in components)
- Axios / fetch for API calls

Dev tooling
- Prettier, ESLint, Black (recommended)
- Testing frameworks: pytest (backend), jest / react testing library (frontend) — add tests if needed

---

Deployment notes (Render)

Backend on Render
- Create a Render web service, point to the repo, set runtime to use a Python start command:
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
- Configure environment variables on Render:
  - JWT_SECRET_KEY, MONGODB_URI, HUGGINGFACE_API_KEY, PINECONE_API_KEY, PINECONE_INDEX, PINECONE_REGION, DIMENSION, BASE_URL (frontend origin)
- Ensure `withCredentials: true` and correct CORS allowed origins (app/core/config.py -> ORIGINS) includes your frontend URL

Frontend on Render
- Create a static site or web service on Render with build command `npm run build` and publish directory `dist`
- Set VITE_API_BASE_URL to deployed backend URL

CORS
- Backend sets CORS origins from ORIGINS variable. Ensure FRONTEND URL is present.

Scaling & production
- Use MongoDB Atlas (replica set) and a managed Pinecone index for production.
- Set large enough timeouts and monitor LLM usage & costs.
- Store secrets in Render environment variables (do not commit .env).

---

Troubleshooting & common issues

1. 401 Unauthorized after login
- Ensure cookies are sent with requests: fetch/axios must use credentials: 'include' / withCredentials: true.
- Confirm JWT_SECRET_KEY is identical across instances and not changed between login and subsequent requests.

2. Pinecone index creation failures
- Verify PINECONE_API_KEY, PINECONE_INDEX, PINECONE_REGION are set.
- Ensure the Pinecone SDK version matches the code’s usage. The repo may expect the newest ServerlessSpec API; adapt if using a different Pinecone client.

3. Embedding shape mismatch
- The code expects DIMENSION to match the HuggingFace embedding dimension (default 384 for all-MiniLM-L6-v2). If your model returns a different vector length, update DIMENSION.

4. Streaming responses not arriving
- The backend streams text/plain chunks — ensure your client reads Response.body with ReadableStream (native fetch) or equivalent.
- If using a proxy (e.g., nginx) ensure proxy buffering is disabled for streaming endpoints.

5. LLM / HuggingFace errors
- Ensure HUGGINGFACE_API_KEY and BASE_URLS are correct and the chosen model supports chat/streaming.
- Some HF endpoints require different client adapters; update LlamaModel wrappers if necessary.

6. CORS / Cookie issues in dev
- When developing locally: set FRONTEND_URL or BASE_URL to the exact origin (including port) of your frontend and ensure SAMESITE cookie flags are compatible with cross-site requests (samesite="none" + secure=True requires HTTPS on browsers).

---

Developer notes & extension points

- ModelFactory: add other model adapters (OpenAI, Gemini) by implementing BaseChatModel.
- Memory store: current abstraction uses Pinecone; you can swap for Milvus, Weaviate, or a local FAISS store.
- Prompt refinement graph: add more nodes to implement safety checks, translation, or prompt engineering flows.
- Conversation branching: branches_collection is created when new chats are created — use branching UI to allow user forks.
- Tests: add unit tests for services, e2e for API streaming behavior.

---

Contributing

Contributions are welcome. Suggested workflow:
1. Fork repository
2. Create feature branch: git checkout -b feat/your-feature
3. Implement & add tests
4. Lint / format (Black for Python, Prettier/ESLint for JS)
5. Open a PR with clear description and testing notes

Please open issues for bugs or feature requests. Use clear reproduction steps and include logs.

---

Contact / Maintainers

- Repo owner: shashi9170 — open issues or PRs on GitHub: https://github.com/shashi9170/stan-intern-chatbot
- For urgent infra or billing issues (Pinecone/HuggingFace/OpenAI), consult each provider's support channels.

---

Appendix: Helpful curl + JS examples

Login (curl)
curl -i -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'

Stream message (JS fetch)
(see "Client streaming example (JavaScript fetch)" section above)

---

Thanks for checking out STAN. If you want, I can:
- generate Dockerfiles + docker-compose for local dev,
- add a Postman collection,
- add unit tests for AuthService / ChatService,
- or create a small CONTRIBUTING.md with PR checklist.

Which would you like next?
