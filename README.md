# News Aggregator

A modern web application that aggregates news from various sources, provides sentiment analysis, and summarizes articles for quick consumption.

## Features

- News fetching from multiple sources
- Article categorization
- Sentiment analysis
- Article summarization
- User authentication with Clerk
- Responsive design for all devices
- Dashboard with different news views (All, Top, For You, etc.)

## Tech Stack

- Next.js 15
- TypeScript
- MongoDB (Prisma ORM)
- Clerk for authentication
- TailwindCSS
- AI-powered sentiment analysis and summarization

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/vkiragi/news-aggregator.git
cd news-aggregator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_mongodb_connection_string
NEWS_API_KEY=your_newsapi_key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

MIT
