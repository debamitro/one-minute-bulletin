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

    // First, use OpenAI to generate a creative image idea from the text
    const ideaResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a creative director for Fireship-style content. Generate a concise image prompt for DALL-E based on the given text. Make it hyper-modern, meme-ified, sarcastic. Make sure the prompt has text that is safe for work."
        },
        {
          role: "user",
          content: `Create a concise DALL-E prompt for a thumbnail image based on this text: "${text}"`
        }
      ],
      max_tokens: 50,
      temperature: 0.8
    });

    const imagePrompt = ideaResponse.choices[0]?.message?.content || 
      `Create a professional news bulletin thumbnail image for: "${text}". Style: hyper-modern, meme-ified, sarcastic, like fireship`;

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
