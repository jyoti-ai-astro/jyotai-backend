require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const OpenAI = require("openai");
const { db, auth } = require('./firebase.cjs');
const {
  getTipOfTheDay,
  calculateLifePath,
  generateLifePathSummary,
  calculateNakshatra,
  generateMuhurat,
  createMemeImage,
  generatePDFReport,
  generateAstroChart,
  generateReferralCode
} = require('./utils.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware to verify Firebase token
async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "JyotAI backend is live!",
    tip: getTipOfTheDay(),
    timestamp: new Date().toISOString()
  });
});

// Get tip of the day
app.get("/api/tip-of-the-day", (req, res) => {
  res.json({ tip: getTipOfTheDay() });
});

// Enhanced prediction endpoint
app.post("/api/predict", async (req, res) => {
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

    let raw = response.choices[0].message.content;
    raw = raw.replace(/```json\n?/, "").replace(/```/, "").trim();

    let predictionData;
    try {
      predictionData = JSON.parse(raw);
    } catch (err) {
      predictionData = { summary: raw, insights: {} };
    }

    // Add additional features
    const additionalData = {
      tip_of_the_day: getTipOfTheDay(),
      prediction_id: `pred_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString()
    };

    // Premium features
    if (plan === 'premium' && birth_details) {
      const nakshatra = calculateNakshatra(birth_details.dob, birth_details.time, birth_details.place);
      const lifePathNumber = calculateLifePath(birth_details.dob);
      const lifePathSummary = generateLifePathSummary(lifePathNumber);
      const muhurat = generateMuhurat();
      const astroChart = generateAstroChart(birth_details);

      additionalData.premium_features = {
        nakshatra,
        life_path_number: lifePathNumber,
        life_path_summary: lifePathSummary,
        muhurat_times: muhurat,
        astro_chart: astroChart
      };
    }

    // Save to database if email provided
    if (email) {
      try {
        await db.collection('predictions').add({
          user_email: email,
          name,
          type,
          birth_details,
          prediction_data: predictionData,
          additional_data: additionalData,
          plan,
          created_at: new Date(),
          is_featured: false
        });
      } catch (dbError) {
        console.error('Database save error:', dbError);
      }
    }

    return res.json({
      ...predictionData,
      ...additionalData
    });

  } catch (error) {
    console.error("Prediction error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate prediction." });
  }
});

// Save prediction result
app.post("/api/saveResult", async (req, res) => {
  const { email, name, prediction_data, user_plan, birth_details } = req.body;

  if (!email || !prediction_data) {
    return res.status(400).json({ error: "Email and prediction data required" });
  }

  try {
    const docRef = await db.collection('predictions').add({
      user_email: email,
      name: name || 'Anonymous',
      prediction_data,
      user_plan: user_plan || 'standard',
      birth_details: birth_details || {},
      created_at: new Date(),
      is_featured: false
    });

    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Save result error:', error);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

// Get user history
app.get("/api/history", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  try {
    const snapshot = await db.collection('predictions')
      .where('user_email', '==', email)
      .orderBy('created_at', 'desc')
      .limit(50)
      .get();

    const history = [];
    snapshot.forEach(doc => {
      history.push({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at.toDate().toISOString()
      });
    });

    res.json({ history });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Update user plan
app.post("/api/user/updatePlan", async (req, res) => {
  const { email, plan, payment_info } = req.body;

  if (!email || !plan) {
    return res.status(400).json({ error: "Email and plan required" });
  }

  try {
    // Check if user exists
    let userRef = db.collection('users').doc(email);
    const userDoc = await userRef.get();

    const userData = {
      email,
      plan,
      updated_at: new Date(),
      payment_info: payment_info || {},
      question_count: plan === 'premium' ? 20 : 3,
      questions_used: 0,
      referral_code: generateReferralCode(email)
    };

    if (userDoc.exists) {
      await userRef.update(userData);
    } else {
      userData.created_at = new Date();
      await userRef.set(userData);
    }

    res.json({ success: true, user_data: userData });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Handle referral
app.post("/api/referral", async (req, res) => {
  const { referral_code, new_user_email } = req.body;

  if (!referral_code || !new_user_email) {
    return res.status(400).json({ error: "Referral code and new user email required" });
  }

  try {
    // Find referrer
    const snapshot = await db.collection('users')
      .where('referral_code', '==', referral_code)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    const referrerDoc = snapshot.docs[0];
    const referrerData = referrerDoc.data();

    // Credit referrer with +1 question
    await referrerDoc.ref.update({
      question_count: (referrerData.question_count || 0) + 1,
      referrals_made: (referrerData.referrals_made || 0) + 1
    });

    // Log referral
    await db.collection('referrals').add({
      referrer_email: referrerData.email,
      new_user_email,
      referral_code,
      created_at: new Date(),
      credited: true
    });

    res.json({ success: true, message: "Referral credited successfully" });
  } catch (error) {
    console.error('Referral error:', error);
    res.status(500).json({ error: 'Failed to process referral' });
  }
});

// Generate shareable meme
app.post("/api/generate-meme", async (req, res) => {
  const { prediction_data, user_info } = req.body;

  if (!prediction_data || !user_info) {
    return res.status(400).json({ error: "Prediction data and user info required" });
  }

  try {
    const memeDataUrl = await createMemeImage(prediction_data, user_info);
    res.json({ meme_url: memeDataUrl });
  } catch (error) {
    console.error('Meme generation error:', error);
    res.status(500).json({ error: 'Failed to generate meme' });
  }
});

// Generate PDF report
app.post("/api/generate-pdf", async (req, res) => {
  const { prediction_data, user_info, additional_data } = req.body;

  if (!prediction_data || !user_info) {
    return res.status(400).json({ error: "Prediction data and user info required" });
  }

  try {
    const pdfDataUrl = await generatePDFReport(prediction_data, user_info, additional_data);
    res.json({ pdf_url: pdfDataUrl });
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Get astro chart (Premium only)
app.post("/api/astro-chart", async (req, res) => {
  const { birth_details, user_plan } = req.body;

  if (user_plan !== 'premium') {
    return res.status(403).json({ 
      error: "Premium feature", 
      message: "Upgrade to Premium to unlock Astro Chart" 
    });
  }

  if (!birth_details) {
    return res.status(400).json({ error: "Birth details required" });
  }

  try {
    const chart = generateAstroChart(birth_details);
    res.json({ chart });
  } catch (error) {
    console.error('Astro chart error:', error);
    res.status(500).json({ error: 'Failed to generate astro chart' });
  }
});

// Get featured gallery (anonymized results)
app.get("/api/gallery", async (req, res) => {
  try {
    const snapshot = await db.collection('predictions')
      .where('is_featured', '==', true)
      .orderBy('created_at', 'desc')
      .limit(10)
      .get();

    const gallery = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      gallery.push({
        summary: data.prediction_data.summary.substring(0, 150) + '...',
        name: data.name.charAt(0) + '***', // Anonymize
        type: data.type,
        created_at: data.created_at.toDate().toISOString()
      });
    });

    res.json({ gallery });
  } catch (error) {
    console.error('Gallery error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// Get user info and validate session
app.get("/api/user/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const userDoc = await db.collection('users').doc(email).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    
    // Reset monthly question count if needed
    const now = new Date();
    const lastReset = userData.last_reset ? userData.last_reset.toDate() : new Date(0);
    const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                       (now.getMonth() - lastReset.getMonth());

    if (monthsDiff >= 1 && userData.plan === 'premium') {
      await userDoc.ref.update({
        questions_used: 0,
        last_reset: now
      });
      userData.questions_used = 0;
    }

    res.json({ user: userData });
  } catch (error) {
    console.error('User info error:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

// Test payment endpoint (dummy for now)
app.post("/api/test-payment", async (req, res) => {
  const { email, plan, amount } = req.body;

  try {
    // Simulate payment success
    const paymentData = {
      payment_id: `test_${Date.now()}`,
      amount,
      status: 'success',
      created_at: new Date()
    };

    // Update user plan
    await db.collection('users').doc(email).set({
      email,
      plan,
      payment_info: paymentData,
      question_count: plan === 'premium' ? 20 : 3,
      questions_used: 0,
      referral_code: generateReferralCode(email),
      created_at: new Date(),
      updated_at: new Date()
    }, { merge: true });

    res.json({ 
      success: true, 
      payment_id: paymentData.payment_id,
      message: "Payment successful (test mode)" 
    });
  } catch (error) {
    console.error('Test payment error:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

// Analytics endpoint for admin
app.get("/api/analytics", async (req, res) => {
  try {
    const [usersSnapshot, predictionsSnapshot] = await Promise.all([
      db.collection('users').get(),
      db.collection('predictions').get()
    ]);

    const analytics = {
      total_users: usersSnapshot.size,
      total_predictions: predictionsSnapshot.size,
      premium_users: 0,
      standard_users: 0,
      recent_activity: []
    };

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.plan === 'premium') {
        analytics.premium_users++;
      } else {
        analytics.standard_users++;
      }
    });

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 JyotAI server running on port ${PORT}`);
  console.log(`💡 Tip of the day: ${getTipOfTheDay()}`);
});