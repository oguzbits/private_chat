# private_chat

A secure, private, and self-destructing chat room application built with Next.js 16, Elysia, and Upstash.

## Features

- 🔒 **Private Rooms**: Generate unique, secure room links instantly.
- ⏱️ **Self-Destructing**: Rooms automatically expire and delete all data after 10 minutes.
- 👥 **Capacity Limited**: Rooms are limited to 2 participants for true private one-on-one conversations.
- ⚡ **Real-time Messaging**: Instant chat powered by Upstash Realtime and Redis.
- 🚫 **No Trace**: History and metadata are completely wiped upon room modification/destruction.
- 💅 **Modern UI**: Clean, dark-themed interface built with Tailwind CSS v4.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **API Engine**: [Elysia](https://elysiajs.com/) (adapted for Next.js)
- **Database**: [Upstash Redis](https://upstash.com/)
- **Realtime**: [Upstash Realtime](https://upstash.com/)
- **Type Safety**: TypeScript & Zod

## Getting Started

### Prerequisites

- Node.js 18+
- An [Upstash](https://upstash.com/) account (Redis database required)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
NEXT_PUBLIC_APP_URL=your_app_url
```

> Note: The application uses `@upstash/redis` and `@upstash/realtime`. Ensure your database is correctly configured.

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd private_chat
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Lobby**: Provides a button to create a new secure room.
2. **Room Creation**: Generates a random room ID and initializes metadata in Redis with a 10-minute TTL (Time To Live).
3. **Joining**: Users joining via the link are authenticated anonymously.
4. **Messaging**: Messages are pushed to Redis and broadcasted via Upstash Realtime.
5. **Expiration**: The room and all its contents are automatically evited from Redis after the TTL expires.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
