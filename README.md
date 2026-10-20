# reviewSummariser

An AI customer support chatbot for WonderWorld, a fictitious Australian theme park. Visitors can ask about
tickets, park hours, rides, dining, accommodation and accessibility, and the bot answers in a cheerful tone
with a bit of Aussie slang. Its answers come from a park information sheet, and it is told to stay on topic
and not make anything up.

## Features

- **Chat interface:** user and bot messages show as separate bubbles, and the view scrolls smoothly to the
  newest message
- **Grounded answers:** the system prompt includes the full WonderWorld park information sheet
  ([`prompts/WonderWorld.md`](packages/server/prompts/WonderWorld.md)), so answers come from real park data
  rather than the model's general knowledge
- **Persona and guardrails:** the bot only answers WonderWorld questions, uses Australian slang, and is told
  not to invent information
- **Conversation memory:** each browser session gets a UUID conversation ID, and the server chains replies
  using the OpenAI Responses API's `previous_response_id`, so follow-up questions keep their context
- **Markdown replies:** bot responses are rendered with `react-markdown`, so lists, emphasis and links
  display properly
- **Typing indicator:** animated dots show while a reply is on its way
- **Sound cues:** a short "pop" when a message is sent and a notification sound when a reply arrives
- **Keyboard friendly:** <kbd>Enter</kbd> sends and <kbd>Shift</kbd>+<kbd>Enter</kbd> adds a new line
- **Validation on both sides:** the form blocks empty or whitespace-only messages and caps them at 1,000
  characters, and the server checks the same rules with a Zod schema
- **Error handling:** invalid requests return `400` with field-level errors, model failures return `500`,
  and the chat shows an error message

## Tech Stack

| Layer    | Technology                                                                                   |
| -------- | -------------------------------------------------------------------------------------------- |
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS v4, shadcn/ui, React Hook Form, Axios, React Icons |
| Backend  | Bun + Express 5 + TypeScript, Zod request validation                                         |
| AI       | OpenAI Responses API (`openai` SDK)                                                          |
| Tooling  | Bun workspaces, ESLint (flat config, typescript-eslint), Prettier, Husky + lint-staged       |

## Prerequisites

- [Bun](https://bun.com) 1.4+
- An [OpenAI API key](https://platform.openai.com/api-keys)

## Getting Started

**1. Clone and install dependencies**

```bash
git clone https://github.com/GlennSeymon/ReviewSummariser.git
cd reviewSummariser
bun install
```

**2. Configure environment variables**

```bash
cp packages/server/.env.example packages/server/.env
```

Edit `packages/server/.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-...
PORT=3000   # optional, defaults to 3000
```

**3. Run the dev servers**

```bash
bun run dev   # starts the client and server together
```

Frontend: http://localhost:5173 (proxies `/api/*` to the backend)
Backend: http://localhost:3000

**4. Build / lint / format**

```bash
cd packages/client
bun run build     # type-check and build the frontend into dist/
bun run lint      # lint the frontend with ESLint
cd ../..
bun run format    # format the whole repo with Prettier
```

A Husky pre-commit hook runs Prettier on staged files automatically.

## Project Structure

```
reviewSummariser/
├── packages/
│   ├── client/                  # Vite + React frontend
│   │   └── src/
│   │       ├── assets/sounds/   # Sent/received message sound cues
│   │       ├── components/
│   │       │   ├── chat/        # ChatBot (state + API call), ChatInput, ChatMessages, TypingIndicator
│   │       │   └── ui/          # shadcn/ui components
│   │       └── lib/             # Class name helper (cn)
│   └── server/                  # Express API
│       ├── index.ts             # Express entry point
│       ├── routes.ts            # Route definitions
│       ├── controllers/         # Request validation (Zod) and HTTP responses
│       ├── services/            # OpenAI call and system prompt assembly
│       ├── repositories/        # Conversation state (conversation ID → last response ID)
│       ├── prompts/
│       │   ├── chatbot.txt      # System prompt template with persona and guardrails
│       │   └── WonderWorld.md   # Park information injected into the prompt
│       └── .env.example
├── LICENSE
└── package.json                 # Bun workspace root
```

## Message Lifecycle

```
User types a question and presses Enter
        │
        ▼
  Client adds the message to the chat, plays the "pop" sound,
  shows the typing indicator
        │
        ▼
  POST /api/chat  { prompt, conversationId }
        │
        ▼
  Controller validates with Zod (non-empty, ≤ 1000 chars, UUID conversation ID)
        │
        ├─── Invalid → 400 with field errors, error message shown in chat
        │
        └─── Valid → Service calls the OpenAI Responses API with:
                • system prompt = chatbot.txt + WonderWorld.md
                • previous_response_id for this conversation (if any)
                │
                ▼
          Repository stores the new response ID for the conversation
                │
                ▼
          Client renders the reply as markdown and plays the notification sound
```

## API

The Vite dev server proxies `/api/*` to the backend, so no CORS configuration is needed in development.

| Method | Path         | Description                            |
| ------ | ------------ | -------------------------------------- |
| `POST` | `/api/chat`  | Send a message and get the bot's reply |
| `GET`  | `/api/hello` | Simple check that the API is reachable |

**`POST /api/chat`**

Request:

```json
{
	"prompt": "What time does the park open?",
	"conversationId": "3f1c2b8e-7a4d-4e1f-9c2a-5b6d8e0f1a2b"
}
```

Response (`200`):

```json
{ "message": "G'day! The main park opens at 9 AM and closes at 10 PM, mate!" }
```

Errors: `400` with Zod field errors if validation fails, and `500` with
`{ "error": "Failed to generate a response" }` if the model call fails.

## Future Release Plan

Possible next steps:

- **Persistent conversation storage:** conversation state is held in an in-memory `Map`, so it is lost on
  every server restart and can't be shared across instances. A production version would store it in
  SQLite, Redis or Postgres.
- **Streaming responses:** stream tokens to the client so replies appear as they are generated rather than
  all at once.
- **Automated tests:** unit tests for the controller's validation and the service's prompt assembly, plus
  component tests for the chat UI.
- **Rate limiting and abuse protection:** there is currently nothing stopping a client from sending
  unlimited requests to a paid API.
- **Conversation reset:** a "new chat" button. Today a fresh conversation needs a page reload.
- **Deployment:** host the client and API, with the API key held as a server-side secret.

## License

This project is licensed under the [MIT License](LICENSE).
