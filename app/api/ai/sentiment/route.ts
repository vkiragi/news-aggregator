import { NextResponse } from 'next/server';
import Sentiment from 'sentiment';

// Initialize the sentiment analyzer
const sentiment = new Sentiment();

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'Article content is required' },
        { status: 400 }
      );
    }
    
    // Analyze sentiment using the sentiment.js library
    const result = sentiment.analyze(content);
    
    // Determine sentiment category based on the score
    let sentimentCategory = 'NEUTRAL';
    
    if (result.score > 2) {
      sentimentCategory = 'POSITIVE';
    } else if (result.score < -2) {
      sentimentCategory = 'NEGATIVE';
    }
    
    // Log the result for debugging
    console.log(`Sentiment analysis: Score ${result.score}, Comparative: ${result.comparative}, Result: ${sentimentCategory}`);
    
    return NextResponse.json({ sentiment: sentimentCategory });
  } catch (error: any) {
    console.error('Error analyzing sentiment:', error.message);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
} 