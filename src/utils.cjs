const { jsPDF } = require('jspdf');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

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

// Nakshatra data
const NAKSHATRAS = [
  { name: "Ashwini", ruler: "Ketu", element: "Earth", lucky_gem: "Red Coral" },
  { name: "Bharani", ruler: "Venus", element: "Earth", lucky_gem: "Diamond" },
  { name: "Krittika", ruler: "Sun", element: "Fire", lucky_gem: "Ruby" },
  { name: "Rohini", ruler: "Moon", element: "Earth", lucky_gem: "Pearl" },
  { name: "Mrigashira", ruler: "Mars", element: "Earth", lucky_gem: "Red Coral" },
  { name: "Ardra", ruler: "Rahu", element: "Air", lucky_gem: "Hessonite" },
  { name: "Punarvasu", ruler: "Jupiter", element: "Water", lucky_gem: "Yellow Sapphire" },
  { name: "Pushya", ruler: "Saturn", element: "Water", lucky_gem: "Blue Sapphire" },
  { name: "Ashlesha", ruler: "Mercury", element: "Water", lucky_gem: "Emerald" }
];

// Generate Tip of the Day
function getTipOfTheDay() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return TIPS_OF_THE_DAY[dayOfYear % TIPS_OF_THE_DAY.length];
}

// Calculate Life Path Number
function calculateLifePath(dob) {
  const digits = dob.replace(/[-\/]/g, '').split('').map(Number);
  let sum = digits.reduce((acc, digit) => acc + digit, 0);
  
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').map(Number).reduce((acc, digit) => acc + digit, 0);
  }
  
  return sum;
}

// Generate Life Path Summary
function generateLifePathSummary(lifePathNumber) {
  const summaries = {
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

// Calculate Nakshatra based on birth details
function calculateNakshatra(dob, time, place) {
  // Simplified calculation - in real implementation, you'd use proper astronomical calculations
  const birthDate = new Date(dob);
  const dayOfYear = Math.floor((birthDate - new Date(birthDate.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const nakshatraIndex = dayOfYear % NAKSHATRAS.length;
  return NAKSHATRAS[nakshatraIndex];
}

// Generate lucky muhurat times
function generateMuhurat() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return {
    abhijit_muhurat: "11:24 AM - 12:12 PM",
    brahma_muhurat: "4:24 AM - 5:12 AM",
    vijaya_muhurat: "2:24 PM - 3:12 PM",
    godhuli_muhurat: "6:24 PM - 7:12 PM"
  };
}

// Create shareable meme data (SVG format for now)
async function createMemeImage(predictionData, userInfo) {
  const summary = predictionData.summary.substring(0, 200) + '...';
  
  // Generate SVG-based meme
  const svgContent = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4ECDC4;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="800" height="600" fill="url(#bgGradient)"/>
      
      <text x="400" y="60" font-family="Arial, sans-serif" font-size="36" font-weight="bold" 
            text-anchor="middle" fill="white">🔮 JyotAI Prediction</text>
      
      <text x="400" y="100" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
            text-anchor="middle" fill="white">For ${userInfo.name}</text>
      
      <foreignObject x="50" y="130" width="700" height="300">
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          font-family: Arial, sans-serif; 
          font-size: 18px; 
          line-height: 1.5; 
          color: white; 
          padding: 20px;
          word-wrap: break-word;
        ">
          ${summary}
        </div>
      </foreignObject>
      
      <text x="400" y="550" font-family="Arial, sans-serif" font-size="20" font-weight="bold" 
            text-anchor="middle" fill="white">✨ Generated by JyotAI ✨</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
}

// Generate PDF report
async function generatePDFReport(predictionData, userInfo, additionalData = {}) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(40, 40, 40);
  doc.text('JyotAI Astrological Report', 105, 30, { align: 'center' });
  
  // User details
  doc.setFontSize(14);
  doc.text(`Name: ${userInfo.name}`, 20, 50);
  if (userInfo.dob) doc.text(`Date of Birth: ${userInfo.dob}`, 20, 60);
  if (userInfo.time) doc.text(`Time of Birth: ${userInfo.time}`, 20, 70);
  if (userInfo.place) doc.text(`Place of Birth: ${userInfo.place}`, 20, 80);
  
  // Summary
  doc.setFontSize(16);
  doc.text('Prediction Summary:', 20, 100);
  doc.setFontSize(12);
  const summaryLines = doc.splitTextToSize(predictionData.summary, 170);
  doc.text(summaryLines, 20, 110);
  
  let yPos = 110 + summaryLines.length * 5 + 10;
  
  // Insights
  if (predictionData.insights) {
    const insights = predictionData.insights;
    const categories = ['marriage', 'career', 'health', 'children', 'wealth', 'travel'];
    
    categories.forEach(category => {
      if (insights[category] && yPos < 270) {
        doc.setFontSize(14);
        doc.text(`${category.charAt(0).toUpperCase() + category.slice(1)}:`, 20, yPos);
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(insights[category], 170);
        doc.text(lines, 20, yPos + 8);
        yPos += lines.length * 4 + 15;
      }
    });
  }
  
  // Additional premium features
  if (additionalData.nakshatra) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 30;
    }
    
    doc.setFontSize(16);
    doc.text('Premium Insights:', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(12);
    doc.text(`Nakshatra: ${additionalData.nakshatra.name}`, 20, yPos);
    doc.text(`Ruling Planet: ${additionalData.nakshatra.ruler}`, 20, yPos + 10);
    doc.text(`Lucky Gem: ${additionalData.nakshatra.lucky_gem}`, 20, yPos + 20);
    yPos += 35;
  }
  
  if (additionalData.lifePathSummary) {
    doc.text('Life Path Summary:', 20, yPos);
    const lifepathLines = doc.splitTextToSize(additionalData.lifePathSummary, 170);
    doc.text(lifepathLines, 20, yPos + 10);
    yPos += lifepathLines.length * 5 + 15;
  }
  
  // Footer
  doc.setFontSize(10);
  doc.text('Generated by JyotAI - Your AI Astrologer', 105, 280, { align: 'center' });
  doc.text(`Report ID: ${uuidv4().substring(0, 8)}`, 105, 285, { align: 'center' });
  
  return doc.output('datauristring');
}

// Generate static astro chart (simplified SVG)
function generateAstroChart(birthDetails) {
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
  const planetaryPositions = {};
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

// Generate referral code
function generateReferralCode(email) {
  return `JYOT${email.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

module.exports = {
  getTipOfTheDay,
  calculateLifePath,
  generateLifePathSummary,
  calculateNakshatra,
  generateMuhurat,
  createMemeImage,
  generatePDFReport,
  generateAstroChart,
  generateReferralCode,
  NAKSHATRAS
};