import { NextResponse } from 'next/server';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Generate a prompt for the image based on the news text
    const imagePrompt = `Create a professional news bulletin thumbnail image for: "${text}". Style: hyper-modern, meme-ified, sarcastic, like fireship`;

    // Generate image using OpenAI's DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image data received');
    }

    const imageUrl = response.data[0].url;

    if (!imageUrl) {
      throw new Error('Failed to generate image');
    }

    return NextResponse.json({
      imageUrl,
      message: 'Image generated successfully'
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
