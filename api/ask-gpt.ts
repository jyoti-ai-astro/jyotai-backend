import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // fallback to empty string to avoid undefined
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required in request body' });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'No response from AI';
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('[GPT ERROR]', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      details: error?.message || 'Unknown error',
    });
  }
}
