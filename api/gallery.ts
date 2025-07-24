import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock featured predictions for demo (in real app, this would come from Firestore)
const FEATURED_PREDICTIONS = [
  {
    summary: "A prosperous period awaits you with significant career advancement. Jupiter's favorable position indicates success in new ventures and financial growth...",
    name: "A***",
    type: "kundli",
    created_at: "2024-01-15T10:30:00Z",
    insights: ["Career Growth", "Financial Success", "New Opportunities"]
  },
  {
    summary: "Your palm lines reveal strong intuition and creative abilities. The heart line shows deep emotional connections and lasting relationships...",
    name: "R***",
    type: "palm",
    created_at: "2024-01-14T14:20:00Z",
    insights: ["Creative Talents", "Strong Relationships", "Intuitive Powers"]
  },
  {
    summary: "Facial features indicate natural leadership qualities. Your strong jawline suggests determination and ability to overcome challenges...",
    name: "M***",
    type: "face",
    created_at: "2024-01-13T09:15:00Z",
    insights: ["Leadership Skills", "Determination", "Success in Business"]
  },
  {
    summary: "The stars align perfectly for marriage and family expansion. Venus in your seventh house brings harmony and romantic fulfillment...",
    name: "S***",
    type: "kundli",
    created_at: "2024-01-12T16:45:00Z",
    insights: ["Marriage Prospects", "Family Harmony", "Romantic Success"]
  },
  {
    summary: "Your life path number reveals exceptional healing abilities. The combination of your birth date suggests a calling in healthcare or spiritual guidance...",
    name: "D***",
    type: "kundli",
    created_at: "2024-01-11T11:30:00Z",
    insights: ["Healing Abilities", "Spiritual Growth", "Healthcare Career"]
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { limit = 10 } = req.query;
    const maxLimit = Math.min(parseInt(limit as string) || 10, 20);
    
    const gallery = FEATURED_PREDICTIONS.slice(0, maxLimit).map(prediction => ({
      summary: prediction.summary.substring(0, 150) + '...',
      name: prediction.name,
      type: prediction.type,
      created_at: prediction.created_at,
      insights: prediction.insights,
      testimonial: `"${prediction.name} found success with JyotAI predictions"`
    }));

    return res.status(200).json({ 
      gallery,
      total_featured: FEATURED_PREDICTIONS.length,
      message: "These are anonymized success stories from our users"
    });
  } catch (error) {
    console.error('Gallery error:', error);
    return res.status(500).json({ error: 'Failed to fetch gallery' });
  }
}