const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("JyotAI backend is live!");
});

app.post("/api/predict", async (req, res) => {
  const { type, data, name, birth_details } = req.body;

  if (!type || !data || !name) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
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

    const raw = response.choices[0].message.content;

    try {
      const json = JSON.parse(raw);
      return res.json(json);
    } catch (err) {
      return res.json({ summary: raw, insights: {} });
    }
  } catch (error) {
    console.error("Prediction error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate prediction." });
  }
});

app.listen(PORT, () => {
  console.log(`JyotAI server running on port ${PORT}`);
});