# Review Summariser

A product review page with AI-generated review summaries. The app lists a product's customer reviews with
star ratings, and a **Summarise** button asks a local open model, run through [Ollama](https://ollama.com),
to condense them into a short paragraph covering the main positive and negative themes. Summaries are saved
to the database and reused for 7 days, so the model only runs when needed.

## Screenshots

**Reviews for a product, before summarising.** Pick a product from the drop-down to see its reviews,
newest first, with star ratings. Products without a saved summary show the **Summarise** button.

![Review page for the Dyson V15 Detect, showing the product drop-down, the AI summary card with a Summarise button, and the review table](screenshots/01ReviewPage-NoSummary.png)

**Generating a summary.** While the local Ollama model works, the button shows a spinner and is disabled,
and placeholder lines mark where the summary will appear.

![AI summary card with a disabled Summarise button showing a spinner, and skeleton placeholder lines below it](screenshots/02ReviewPage-Summarising.png)

**The finished summary.** The summary replaces the button. It is saved for 7 days, so the next visit
shows it straight away without calling the model again.

![AI summary card showing a paragraph that sums up the strengths and drawbacks customers mention for the Dyson V15 Detect](screenshots/03ReviewPage-Summary.png)

## Features

- **Review list:** shows each review's author, star rating, content and date, newest first
- **Star ratings:** ratings display as filled and empty stars
- **Loading skeletons:** placeholder rows show while reviews load, and a placeholder paragraph shows while a
  summary is being generated
- **One-click summaries:** the **Summarise** button sends the 10 most recent reviews to a local Ollama
  model (`tinyllama`) and shows the result above the list
- **Local LLM:** summaries are generated on your own machine through Ollama, with no API key, usage costs or
  data sent to a third party
- **Cached summaries:** each summary is stored in the `summaries` table with a 7-day expiry. While it is
  valid, it is returned with the reviews and the button is hidden, and repeat summarise requests return it
  without calling the model
- **Client-side caching:** reviews are fetched with TanStack Query, and a new summary is written straight
  into the cached reviews for that product, so it never shows on the wrong product
- **Error handling:** an invalid product ID returns `400`, a missing product or a product with no reviews
  returns `404`, and model failures return `500`. Server error messages are shown in the UI, and the
  underlying error is logged in the server console

## Tech Stack

| Layer     | Technology                                                                             |
| --------- | -------------------------------------------------------------------------------------- |
| Frontend  | React 19 + TypeScript, Vite, Tailwind CSS v4, shadcn/ui, TanStack Query, Axios         |
| UI extras | React Icons, React Loading Skeleton                                                    |
| Backend   | Bun + Express 5 + TypeScript                                                           |
| Database  | MySQL / MariaDB with Prisma ORM 7 (`@prisma/adapter-mariadb` driver adapter)           |
| AI        | Ollama running `tinyllama` locally, called with the `ollama` JavaScript SDK            |
| Tooling   | Bun workspaces, ESLint (flat config, typescript-eslint), Prettier, Husky + lint-staged |

## Prerequisites

- [Bun](https://bun.com) 1.4+
- A MySQL or MariaDB database
- [Ollama](https://docs.ollama.com/quickstart) installed locally

Small models like `tinyllama` run fine on the CPU, so a GPU isn't required, though summaries are faster
with one. See Ollama's [hardware support](https://docs.ollama.com/gpu) page.

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

Edit `packages/server/.env`:

```
DATABASE_URL="mysql://user:password@localhost:3306/review_summariser"
OPENAI_API_KEY=placeholder   # must be set for the server to start (see note below)
PORT=3000                    # optional, defaults to 3000
```

Summaries don't use OpenAI, but `llm/client.ts` still creates an OpenAI client on startup for older code in
the project, and it throws if `OPENAI_API_KEY` is missing. Any value works. `HF_TOKEN` is not used.

**3. Set up the database**

```bash
cd packages/server
bunx prisma migrate deploy   # create the products, reviews and summaries tables
bunx prisma generate         # generate the Prisma client into generated/prisma
cd ../..
```

There is no seed script, so add some rows to `products` and `reviews` yourself, for example with
`bunx prisma studio`. `App.tsx` shows the product with ID `4`; change the `productId` prop to match your
data.

**4. Start Ollama and pull the model**

```bash
ollama serve           # leave running in its own terminal (not needed if Ollama runs as a service)
ollama pull tinyllama  # in another terminal
```

The server connects to Ollama at `http://localhost:11434`. To use a different model, pull it and change the
`model` in `llmClient.summarise` in [`llm/client.ts`](packages/server/llm/client.ts).

**5. Run the dev servers**

```bash
bun run dev   # starts the client and server together
```

Frontend: http://localhost:5173 (proxies `/api/*` to the backend)
Backend: http://localhost:3000

**6. Build / lint / format**

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
│   ├── client/                          # Vite + React frontend
│   │   └── src/
│   │       ├── main.tsx                 # React root with the TanStack Query provider
│   │       ├── App.tsx                  # Renders ReviewList for one product
│   │       ├── components/
│   │       │   ├── reviews/
│   │       │   │   ├── ReviewList.tsx   # Summary, Summarise button and review table
│   │       │   │   ├── StarRating.tsx   # Star display for a 1–5 rating
│   │       │   │   └── reviewsAPI.ts    # API calls, response types and error messages
│   │       │   └── ui/                  # shadcn/ui components
│   │       └── lib/                     # Class name helper (cn)
│   └── server/                          # Express API
│       ├── index.ts                     # Express entry point
│       ├── routes.ts                    # Route definitions
│       ├── controllers/
│       │   └── review.controllers.ts    # Validates product ID and existence, sends responses
│       ├── services/
│       │   └── review.services.ts       # Reuses a cached summary or generates and saves a new one
│       ├── repositories/
│       │   ├── prisma.ts                # Prisma client with the MariaDB adapter
│       │   ├── product.repository.ts    # Product lookup
│       │   └── review.repository.ts     # Reviews and summary queries (7-day expiry)
│       ├── llm/
│       │   ├── client.ts                # summarise() calls Ollama
│       │   └── prompts/
│       │       └── summarise-reviews.txt  # System prompt for review summaries
│       ├── prisma/
│       │   ├── schema.prisma            # Product, Review and Summary models
│       │   └── migrations/
│       ├── prisma.config.ts
│       └── .env.example
├── LICENSE
└── package.json                         # Bun workspace root
```

## Data Model

| Table       | Key fields                                                          |
| ----------- | ------------------------------------------------------------------- |
| `products`  | `id`, `name`, `description`, `price`                                |
| `reviews`   | `id`, `author`, `rating` (1–5), `content`, `createdAt`, `productId` |
| `summaries` | `id`, `productId` (unique), `content`, `generatedAt`, `expiresAt`   |

Each product has at most one summary. Saving a new summary replaces the old one.

## Request Lifecycle

**Loading the page**

```
ReviewList mounts for a product
        │
        ▼
  GET /api/products/:id/reviews   (TanStack Query, key ['reviews', id])
        │
        ▼
  Controller checks the ID is a number and the product exists
        │
        ├─── Invalid ID → 400, missing product → 404, error shown on the page
        │
        └─── Returns the reviews (newest first) and any unexpired summary
                │
                ▼
  Client shows the summary if there is one, otherwise the Summarise button,
  followed by the review table
```

**Generating a summary**

```
User clicks Summarise
        │
        ▼
  POST /api/products/:id/reviews/summarise   (TanStack Query mutation)
  Button is disabled and a skeleton paragraph shows
        │
        ▼
  Controller checks the ID is valid, the product exists and it has reviews
        │
        ├─── Invalid ID → 400, missing product or no reviews → 404
        │
        └─── Service looks for an unexpired summary in the database
                │
                ├─── Found → returned without calling the model
                │
                └─── Not found → 10 most recent reviews sent to Ollama (tinyllama)
                     with summarise-reviews.txt as the system prompt
                        │
                        ├─── Model fails → error logged, 500 returned
                        │
                        └─── Summary saved with a 7-day expiry and returned
                                │
                                ▼
  Client writes the summary into the cached reviews for that product and shows it
  in place of the button. On error, the server's message is shown under the button.
```

## API

The Vite dev server proxies `/api/*` to the backend, so no CORS configuration is needed in development.

| Method | Path                                  | Description                                     |
| ------ | ------------------------------------- | ----------------------------------------------- |
| `GET`  | `/api/products/:id/reviews`           | Get a product's reviews and any cached summary  |
| `POST` | `/api/products/:id/reviews/summarise` | Return the cached summary or generate a new one |
| `GET`  | `/api/hello`                          | Simple check that the API is reachable          |

**`GET /api/products/:id/reviews`**

Response (`200`). Reviews are newest first, and `reviewSummary` is `null` when there is no unexpired
summary:

```json
{
	"reviewSummary": null,
	"reviews": [
		{
			"id": 12,
			"author": "Sam",
			"rating": 4,
			"content": "Comfortable and the battery lasts all day.",
			"createdAt": "2026-10-20T05:12:00.000Z",
			"productId": 4
		}
	]
}
```

Errors:

| Status | Body                                     |
| ------ | ---------------------------------------- |
| `400`  | `{ "error": "Invalid product ID" }`      |
| `404`  | `{ "error": "Product not found" }`       |
| `500`  | `{ "error": "Failed to fetch reviews" }` |

**`POST /api/products/:id/reviews/summarise`**

No request body. Response (`200`):

```json
{ "summary": "Customers love the comfort and battery life, but several mention a flimsy case." }
```

Errors:

| Status | Body                                               |
| ------ | -------------------------------------------------- |
| `400`  | `{ "error": "Invalid product ID" }`                |
| `404`  | `{ "error": "Product not found" }`                 |
| `404`  | `{ "error": "There are no reviews to summarise" }` |
| `500`  | `{ "error": "Failed to fetch review summary" }`    |

## Future Release Plan

Possible next steps:

- **Product selection:** the product ID is hard-coded in `App.tsx`. Add a product list or a route per
  product.
- **Seed data:** a Prisma seed script so a fresh database has products and reviews to try.
- **Configurable model:** read the Ollama model and host from environment variables instead of code.
- **Regenerate summaries:** a way to refresh a summary before its 7-day expiry, for example when new
  reviews arrive.
- **Streaming summaries:** stream the model's output so the summary appears as it is generated.
- **Remove leftover code:** the OpenAI and Hugging Face clients in `llm/client.ts` and the earlier chatbot
  code are no longer used by the review summariser.
- **Automated tests:** unit tests for the controller, summary caching and repository, plus component tests
  for the review list.
- **Deployment:** host the client, API and database, with Ollama on a server or a hosted model provider.

## License

This project is licensed under the [MIT License](LICENSE).
