import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Tip of the Day data
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

function calculateLifePath(dob: string) {
  const digits = dob.replace(/[-\/]/g, '').split('').map(Number);
  let sum = digits.reduce((acc, digit) => acc + digit, 0);
  
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').map(Number).reduce((acc, digit) => acc + digit, 0);
  }
  
  return sum;
}

function generateLifePathSummary(lifePathNumber: number) {
  const summaries: Record<number, string> = {
    1: "You are a natural born leader with strong independence and pioneering spirit.",
    2: "You are a peacemaker with exceptional diplomatic skills and cooperative nature.",
    3: "You are creative and expressive with natural communication and artistic talents.",
    4: "You are practical and hardworking with strong organizational abilities.",
    5: "You are adventurous and freedom-loving with a dynamic personality.",
    6: "You are nurturing and responsible with natural healing and caring abilities.",
    7: "You are spiritual and analytical with deep intuitive understanding.",
    8: "You are ambitious and material-focused with strong business acumen.",
    9: "You are humanitarian and generous with universal love and wisdom.",
    11: "You are highly intuitive and inspirational with spiritual leadership qualities.",
    22: "You are a master builder with the ability to turn dreams into reality.",
    33: "You are a master teacher with exceptional healing and guidance abilities."
  };
  
  return summaries[lifePathNumber] || summaries[1];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type, data, name, birth_details, email, plan = 'standard' } = req.body;

  if (!type || !data || !name) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Generate base prediction
    let prompt = `You are JyotAI, an intelligent and spiritual AI astrologer.
Given the following input, generate a personalized prediction including marriage, career, health, children, wealth, and travel. Keep tone spiritual, uplifting, and detailed.

Name: ${name}
Type: ${type}
`;

    if (type === "kundli") {
      prompt += `Kundli Input: ${data}\n`;
    } else if (type === "face" || type === "palm") {
      prompt += `Image-based interpretation (encoded): [omitted base64 for brevity]\n`;
    }

    if (birth_details) {
      prompt += `Birth Details:
Date of Birth: ${birth_details.dob}
Time: ${birth_details.time}
Place: ${birth_details.place}\n`;
    }

    prompt += `\nOutput format: 
{
  "summary": "...",
  "insights": {
    "marriage": "...",
    "career": "...",
    "health": "...",
    "children": "...",
    "wealth": "...",
    "travel": "..."
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let raw = response.choices[0].message.content || '';
    raw = raw.replace(/```json\n?/, "").replace(/```/, "").trim();

    let predictionData;
    try {
      predictionData = JSON.parse(raw);
    } catch (err) {
      predictionData = { summary: raw, insights: {} };
    }

    // Add additional features
    const additionalData: any = {
      tip_of_the_day: getTipOfTheDay(),
      prediction_id: `pred_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      plan: plan
    };

    // Premium features
    if (plan === 'premium' && birth_details) {
      const lifePathNumber = calculateLifePath(birth_details.dob);
      const lifePathSummary = generateLifePathSummary(lifePathNumber);

      additionalData.premium_features = {
        life_path_number: lifePathNumber,
        life_path_summary: lifePathSummary,
        nakshatra: "Ashwini", // Simplified for demo
        lucky_gem: "Red Coral",
        muhurat_times: {
          abhijit_muhurat: "11:24 AM - 12:12 PM",
          brahma_muhurat: "4:24 AM - 5:12 AM"
        }
      };
    }

    return res.status(200).json({
      ...predictionData,
      ...additionalData
    });

  } catch (error: any) {
    console.error("Prediction error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to generate prediction." });
  }
}