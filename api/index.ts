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

  const apiDocumentation = {
    service: "JyotAI Backend API",
    version: "1.0.0",
    description: "AI-powered astrology platform with comprehensive feature matrix",
    status: "🟢 Live",
    tip_of_the_day: getTipOfTheDay(),
    timestamp: new Date().toISOString(),
    
    endpoints: {
      core: {
        "GET /api/tip-of-the-day": "Get daily spiritual guidance",
        "POST /api/predict": "Enhanced prediction with plan-based features",
        "POST /api/astro-chart": "Generate birth chart (Premium only)",
        "GET /api/gallery": "Featured predictions gallery (anonymized)"
      },
      content: {
        "POST /api/generate-pdf": "Generate downloadable PDF report",
        "POST /api/ask-gpt": "Basic GPT interaction (legacy)"
      }
    },
    
    feature_matrix: {
      standard_plan: {
        price: "₹499 (One-time)",
        features: [
          "Prediction Results",
          "Tip of the Day", 
          "Ask Another Question (3 max)",
          "History Page",
          "Shareable Memes",
          "Download PDF",
          "Referral System",
          "Featured Gallery"
        ]
      },
      premium_plan: {
        price: "₹999/month",
        features: [
          "All Standard features",
          "Astro Map View (SVG Charts)",
          "Lucky Gem & Nakshatra insights",
          "Muhurat Times",
          "Life Path Summary",
          "Ask Another Question (20/month)",
          "WhatsApp PDF sharing (planned)"
        ]
      }
    },
    
    usage_examples: {
      prediction: {
        endpoint: "POST /api/predict",
        payload: {
          type: "kundli|face|palm",
          data: "input_data",
          name: "User Name",
          birth_details: {
            dob: "1990-01-01",
            time: "10:30",
            place: "City, Country"
          },
          plan: "standard|premium"
        }
      },
      astro_chart: {
        endpoint: "POST /api/astro-chart", 
        payload: {
          birth_details: {
            dob: "1990-01-01",
            time: "10:30",
            place: "City, Country"
          },
          user_plan: "premium"
        }
      }
    },
    
    response_format: {
      success: {
        data: "...",
        tip_of_the_day: "Daily spiritual guidance",
        timestamp: "ISO 8601 timestamp"
      },
      error: {
        error: "Error message",
        details: "Additional error details (optional)"
      }
    }
  };

  return res.status(200).json(apiDocumentation);
}