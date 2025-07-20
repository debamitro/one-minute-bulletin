import { NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs';
import path from 'path';

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error('Missing ELEVENLABS_API_KEY environment variable');
}

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
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

    const refinedText = "Welcome to The One Minute Bulletin. " + text;
    // Read the intro audio file
    const introPath = path.join(process.cwd(), 'public', 'intro1.mp3');
    const introBuffer = fs.readFileSync(introPath);

    // Generate the main content audio
    const stream = await elevenlabs.textToSpeech.convert('LG95yZDEHg6fCZdQjLqj', 
      {
        text: refinedText,
        modelId: 'eleven_multilingual_v2',
        voiceSettings: {
          speed: 1.2,
        },
        outputFormat: 'mp3_44100_64'
      }
    );

    // Convert ReadableStream to Uint8Array
    const chunks = [];
    const reader = stream.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    // Concatenate main audio chunks into a single Uint8Array
    const mainAudioLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const mainAudio = new Uint8Array(mainAudioLength);
    let offset = 0;
    for (const chunk of chunks) {
      mainAudio.set(chunk, offset);
      offset += chunk.length;
    }

    // Concatenate intro audio + main audio
    const totalLength = introBuffer.length + mainAudio.length;
    const concatenated = new Uint8Array(totalLength);
    concatenated.set(new Uint8Array(introBuffer), 0);
    concatenated.set(mainAudio, introBuffer.length);

    // Convert to base64
    const base64Audio = Buffer.from(concatenated).toString('base64');

    // Return the audio data as base64
    return NextResponse.json({
      audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
      message: 'Audio generated successfully'
    });

  } catch (error) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}
