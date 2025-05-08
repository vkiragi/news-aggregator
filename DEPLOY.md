# Deploying to Netlify

This guide will help you deploy your Next.js News Aggregator to Netlify.

## Step 1: Push your code to GitHub

Make sure your repository is up to date on GitHub.

## Step 2: Connect to Netlify

1. Visit [Netlify's website](https://app.netlify.com/) and log in or create an account
2. Click "Add new site" > "Import an existing project"
3. Connect to your GitHub account and select your news-aggregator repository

## Step 3: Configure Build Settings

Configure the following build settings:
- **Build command**: `npm run build`
- **Publish directory**: `.next`

## Step 4: Set Environment Variables

In your Netlify site settings, go to "Environment variables" and add the following:

```
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database (MongoDB)
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/news-aggregator

# News API
NEWS_API_KEY=your_newsapi_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Step 5: Deploy

Click "Deploy site" and wait for the build to complete.

## Step 6: Configure Clerk

In your Clerk dashboard:
1. Go to "Webhooks & API Keys" 
2. Add your Netlify domain to the allowed redirect URLs
3. Make sure to include:
   - `https://your-netlify-domain.netlify.app/`
   - `https://your-netlify-domain.netlify.app/sign-in`
   - `https://your-netlify-domain.netlify.app/sign-up`

## Troubleshooting

If you encounter issues:
1. Check your Netlify deploy logs
2. Make sure your MongoDB database is accessible from Netlify
3. Verify all environment variables are set correctly
4. Ensure Clerk is properly configured with your Netlify domain

## Adding to Your Resume

Once deployed, you can add to your resume:
- Live URL: `https://your-site-name.netlify.app`
- GitHub: `https://github.com/yourusername/news-aggregator`
- Technologies: Next.js, MongoDB, Prisma, Clerk Authentication, Tailwind CSS 