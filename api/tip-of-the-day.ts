import type { VercelRequest, VercelResponse } from '@vercel/node';

const TIPS_OF_THE_DAY = [
  "🌟 Chant 'Om Gam Ganapataye Namaha' 108 times for removing obstacles",
  "🌙 Meditate during early morning hours (4-6 AM) for better spiritual connection",
  "💎 Wear your lucky gemstone on the prescribed finger for maximum benefits",
  "🕉️ Practice gratitude daily to attract positive cosmic energy",
  "⭐ Check your daily nakshatra for important decision making",
  "🔥 Light a diya every evening to invite prosperity into your home",
  "🌸 Offer water to the Sun every morning facing east for vitality",
  "🙏 Read your zodiac mantra during your ruling planetary hour",
  "🌺 Keep fresh flowers in your home to maintain positive vibrations",
  "📿 Wear rudraksha beads to enhance spiritual protection"
];

function getTipOfTheDay() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return TIPS_OF_THE_DAY[dayOfYear % TIPS_OF_THE_DAY.length];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const tip = getTipOfTheDay();
    return res.status(200).json({ 
      tip,
      date: new Date().toISOString().split('T')[0],
      source: "JyotAI Daily Wisdom"
    });
  } catch (error) {
    console.error('Tip generation error:', error);
    return res.status(500).json({ error: 'Failed to get tip of the day' });
  }
}