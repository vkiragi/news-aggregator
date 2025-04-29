import { NextResponse } from 'next/server';

// Simple extractive summarization function
function extractiveSummarize(text: string, sentenceCount: number = 3): string {
  if (!text || text.trim().length === 0) {
    return '';
  }

  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  // If there are fewer sentences than requested, return the whole text
  if (sentences.length <= sentenceCount) {
    return text.trim();
  }

  // Score each sentence based on its position (earlier sentences usually have more importance in news)
  // and length (very short sentences are less likely to be informative)
  const scoredSentences = sentences.map((sentence, index) => {
    const words = sentence.trim().split(/\s+/);
    const lengthScore = Math.min(words.length / 20, 1); // Normalize length score
    const positionScore = 1 - (index / sentences.length); // Earlier sentences get higher scores
    
    return {
      sentence: sentence.trim(),
      score: (positionScore * 0.6) + (lengthScore * 0.4), // Weight position more than length
      index
    };
  });

  // Sort by score and take the top N sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, sentenceCount);

  // Sort by original position to maintain narrative flow
  topSentences.sort((a, b) => a.index - b.index);

  // Join the sentences back together
  return topSentences.map(item => item.sentence).join(' ');
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'Article content is required' },
        { status: 400 }
      );
    }
    
    // Generate summary using the extractive summarization method
    const summary = extractiveSummarize(content);
    
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Error summarizing article:', error.message);
    return NextResponse.json(
      { error: 'Failed to summarize article' },
      { status: 500 }
    );
  }
} 