import type { VercelRequest, VercelResponse } from '@vercel/node';

function generateAstroChart(birthDetails: any) {
  const houses = [
    "1st House - Self & Personality",
    "2nd House - Wealth & Family", 
    "3rd House - Communication",
    "4th House - Home & Mother",
    "5th House - Children & Education",
    "6th House - Health & Enemies",
    "7th House - Marriage & Partnership",
    "8th House - Longevity & Secrets",
    "9th House - Fortune & Spirituality",
    "10th House - Career & Status",
    "11th House - Gains & Friendship",
    "12th House - Loss & Liberation"
  ];
  
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  
  // Simplified planetary positions (in real app, calculate based on birth details)
  const planetaryPositions: Record<string, number> = {};
  planets.forEach((planet, index) => {
    planetaryPositions[planet] = (index * 40 + Math.random() * 30) % 360;
  });
  
  return {
    houses,
    planetaryPositions,
    svgData: `
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#f8f9fa" stroke="#333" stroke-width="2"/>
        <!-- House divisions -->
        <line x1="200" y1="0" x2="200" y2="400" stroke="#666" stroke-width="1"/>
        <line x1="0" y1="200" x2="400" y2="200" stroke="#666" stroke-width="1"/>
        <line x1="58" y1="58" x2="342" y2="342" stroke="#666" stroke-width="1"/>
        <line x1="342" y1="58" x2="58" y2="342" stroke="#666" stroke-width="1"/>
        
        <!-- House numbers -->
        <text x="300" y="100" font-family="Arial" font-size="14" text-anchor="middle">1</text>
        <text x="300" y="300" font-family="Arial" font-size="14" text-anchor="middle">2</text>
        <text x="100" y="300" font-family="Arial" font-size="14" text-anchor="middle">3</text>
        <text x="100" y="100" font-family="Arial" font-size="14" text-anchor="middle">4</text>
        
        <!-- Sample planets -->
        <circle cx="280" cy="120" r="8" fill="#FF6B35"/>
        <text x="280" y="125" font-family="Arial" font-size="10" text-anchor="middle" fill="white">Su</text>
        
        <circle cx="280" cy="280" r="8" fill="#4A90E2"/>
        <text x="280" y="285" font-family="Arial" font-size="10" text-anchor="middle" fill="white">Mo</text>
        
        <text x="200" y="380" font-family="Arial" font-size="12" text-anchor="middle">Birth Chart</text>
      </svg>
    `
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { birth_details, user_plan } = req.body;

  if (user_plan !== 'premium') {
    return res.status(403).json({ 
      error: "Premium feature", 
      message: "Upgrade to Premium to unlock Astro Chart",
      upgrade_url: "/upgrade"
    });
  }

  if (!birth_details) {
    return res.status(400).json({ error: "Birth details required" });
  }

  try {
    const chart = generateAstroChart(birth_details);
    return res.status(200).json({ 
      chart,
      generated_at: new Date().toISOString(),
      birth_details
    });
  } catch (error) {
    console.error('Astro chart error:', error);
    return res.status(500).json({ error: 'Failed to generate astro chart' });
  }
}