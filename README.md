# 🔮 JyotAI Backend - Complete Feature Implementation

JyotAI is an AI-powered astrology platform offering personalized predictions through multiple input methods (Kundli, Face Reading, Palm Reading) with a comprehensive feature matrix for Standard and Premium users.

## 🌟 Features Implemented

### ✅ Core Features (Both Plans)
- **Prediction Engine**: AI-powered predictions via OpenAI GPT-4
- **Tip of the Day**: Daily spiritual guidance rotated automatically
- **Spinner/Loading States**: Built-in loading indicators
- **Shareable Memes**: Canvas-generated prediction images
- **PDF Reports**: Comprehensive astrological reports
- **History Page**: User prediction history tracking
- **Referral System**: Invite friends for bonus predictions
- **Featured Gallery**: Anonymized prediction showcase

### 🎯 Premium-Only Features
- **Astro Map View**: Static SVG birth chart generation
- **Nakshatra & Lucky Gems**: Vedic astrology insights
- **Muhurat Times**: Auspicious timing recommendations
- **Life Path Summary**: Numerology-based life analysis
- **WhatsApp PDF Sharing**: Direct WhatsApp integration (planned)

### 🔐 Authentication & Plans
- **Firebase Authentication**: Post-payment user creation
- **Smart Session Management**: Auto-login with session persistence
- **Plan Management**: Standard (₹499 one-time) vs Premium (₹999/month)
- **Question Limits**: 3 questions (Standard) vs 20/month (Premium)

## 🚀 API Endpoints

### Core Endpoints
```
GET  /                          # Health check + daily tip
GET  /api/tip-of-the-day        # Get daily spiritual tip
POST /api/predict               # Enhanced prediction with plan features
POST /api/astro-chart           # Generate birth chart (Premium only)
```

### User Management
```
POST /api/saveResult            # Save prediction to database
GET  /api/history?email=...     # Get user prediction history
POST /api/user/updatePlan       # Update user subscription plan
GET  /api/user/:email           # Get user info and validate session
```

### Additional Features
```
POST /api/referral              # Process referral credits
POST /api/generate-meme         # Create shareable prediction image
POST /api/generate-pdf          # Generate downloadable PDF report
GET  /api/gallery               # Get featured predictions (anonymized)
POST /api/test-payment          # Test payment processing (demo)
GET  /api/analytics             # Admin analytics dashboard
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

### 3. Configure Firebase
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Generate service account credentials
4. Update `.env` with Firebase configuration

### 4. Configure OpenAI
1. Get API key from https://platform.openai.com
2. Add to `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 5. Run Development Server
```bash
npm run dev
```

### 6. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📊 Database Schema (Firestore)

### Users Collection
```typescript
{
  email: string,
  plan: 'standard' | 'premium',
  question_count: number,
  questions_used: number,
  referral_code: string,
  created_at: Date,
  updated_at: Date,
  payment_info: object,
  last_reset: Date
}
```

### Predictions Collection
```typescript
{
  user_email: string,
  name: string,
  type: 'kundli' | 'face' | 'palm',
  birth_details: object,
  prediction_data: object,
  additional_data: object,
  plan: string,
  created_at: Date,
  is_featured: boolean
}
```

### Referrals Collection
```typescript
{
  referrer_email: string,
  new_user_email: string,
  referral_code: string,
  created_at: Date,
  credited: boolean
}
```

## 🎨 Feature Matrix Implementation

| Feature | Standard | Premium | Implementation |
|---------|----------|---------|----------------|
| Prediction Result | ✅ | ✅ | `/api/predict` |
| Tip of the Day | ✅ | ✅ | `/api/tip-of-the-day` |
| Ask Another Question | ✅ (3 max) | ✅ (20/month) | Question counting in user doc |
| History Page | ✅ | ✅ | `/api/history` |
| Shareable Meme | ✅ | ✅ | `/api/generate-meme` |
| Download PDF | ✅ | ✅ | `/api/generate-pdf` |
| Astro Map View | ❌ | ✅ | `/api/astro-chart` |
| Lucky Gem/Nakshatra | ❌ | ✅ | Premium features in prediction |
| WhatsApp PDF | ❌ | ✅ | Planned integration |
| Life Path Summary | ❌ | ✅ | Numerology calculation |

## 🔮 Premium Features Deep Dive

### Nakshatra Calculation
Uses simplified astronomical calculation based on birth date to determine:
- Nakshatra name
- Ruling planet
- Element association
- Lucky gemstone

### Life Path Numerology
Calculates life path number from birth date:
```typescript
function calculateLifePath(dob: string) {
  const digits = dob.replace(/[-\/]/g, '').split('').map(Number);
  let sum = digits.reduce((acc, digit) => acc + digit, 0);
  
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').map(Number).reduce((acc, digit) => acc + digit, 0);
  }
  
  return sum;
}
```

### Astro Chart Generation
Creates static SVG birth chart with:
- 12 house divisions
- Planetary positions (simplified)
- Traditional Vedic chart layout

## 💳 Payment Integration Roadmap

### Current: Test Mode
- Dummy payment endpoint for testing
- Immediate plan upgrade simulation
- Firebase user creation post-payment

### Planned: Razorpay Integration
```typescript
// Webhook endpoint for payment verification
POST /api/payment/webhook
- Verify payment signature
- Create/update Firebase user
- Send confirmation email
- Activate plan benefits
```

## 🔄 User Flow Implementation

### New User Journey
1. User enters details → sees prediction
2. Payment processing → email captured
3. Firebase user created silently
4. Session established → continue asking questions

### Returning User Flow
1. Check localStorage session → auto-login
2. No session → "Already Paid? Recover Account" link
3. Email entry → OTP verification → data recovery

### Question Limit Management
- Standard users: 3 questions total
- Premium users: 20 questions per month
- Monthly reset for premium users
- Referral bonus: +1 question per successful referral

## 🎯 Smart Upgrade Prompts

Premium features show teaser content:
```typescript
if (user_plan !== 'premium') {
  return {
    error: "Premium feature",
    message: "Unlock your Nakshatra & Lucky Gem",
    upgrade_url: "/upgrade"
  };
}
```

## 📱 Frontend Integration Points

The backend is designed to work with Angular frontend expecting:

### Authentication Headers
```typescript
headers: {
  'Authorization': `Bearer ${firebaseToken}`
}
```

### Response Formats
All endpoints return consistent JSON:
```typescript
{
  success?: boolean,
  error?: string,
  data?: any,
  tip_of_the_day?: string,
  timestamp?: string
}
```

## 🚧 Planned Enhancements

1. **WhatsApp Integration**: Direct PDF sharing to WhatsApp
2. **Advanced Astrology**: Real astronomical calculations
3. **Voice Predictions**: Audio-based predictions
4. **Regional Languages**: Multi-language support
5. **Advanced Charts**: Interactive birth chart widgets

## 📈 Analytics & Monitoring

Admin analytics endpoint provides:
- Total users count
- Premium vs Standard distribution
- Total predictions generated
- Recent activity trends

## 🔒 Security Features

- Firebase token verification middleware
- Input validation and sanitization
- Rate limiting (planned)
- CORS configuration
- Environment variable protection

## 📞 Support & Documentation

For questions or support:
- Check API endpoint documentation above
- Review environment configuration
- Test with provided endpoints
- Monitor Vercel deployment logs

---

**🌟 JyotAI - Bringing Ancient Wisdom to Modern Technology** 🌟