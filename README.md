# News Aggregator

A modern, AI-powered news aggregation platform built with Next.js, TypeScript, and MongoDB. This application fetches news from various sources, analyzes sentiment, generates summaries, and provides a personalized news experience.

![News Aggregator Screenshot](https://placehold.co/600x400/5271ff/ffffff?text=News+Aggregator)

## Features

- **Authentication & User Management**
  - Secure authentication via Clerk
  - Protected routes and user profiles
  - Personalized news feed based on user preferences

- **News Aggregation**
  - Real-time news fetching from various sources
  - Category-based browsing (General, Technology, Business, etc.)
  - Infinite scrolling for seamless news discovery

- **AI-Powered Analysis**
  - Sentiment analysis for each article (Positive, Neutral, Negative)
  - Automated article summarization for quick consumption
  - Topic clustering to group related stories

- **User Experience**
  - Responsive design for all devices
  - Dark/Light mode support
  - Bookmark articles for later reading
  - Advanced search and filtering options

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, TailwindCSS
- **Backend**: Next.js API routes, Node.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: Clerk
- **AI Services**: Sentiment analysis and extractive summarization
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance (or MongoDB Atlas account)
- Clerk account for authentication
- News API key from [newsapi.org](https://newsapi.org)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vkiragi/news-aggregator.git
cd news-aggregator
```

2. Install dependencies:
```bash
npm install
```

3. Environment Setup:
   - Create a `.env.local` file in the root directory
   - Add the following environment variables:
   ```
   # Authentication - Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Database - MongoDB
   DATABASE_URL=your_mongodb_connection_string

   # News API
   NEWS_API_KEY=your_newsapi_key

   # API URL for frontend requests
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
news-aggregator/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Dashboard route group
│   ├── api/                # API routes
│   ├── sign-in/            # Authentication pages
│   └── sign-up/
├── components/             # React components
├── lib/                    # Utility functions and database client
│   └── db.ts               # Prisma client
├── prisma/                 # Prisma schema and migrations
└── public/                 # Static assets
```

## Deployment

This application is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy!

## License

MIT

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.com/)
- [Prisma](https://www.prisma.io/)
- [NewsAPI](https://newsapi.org/)
- [TailwindCSS](https://tailwindcss.com/)
