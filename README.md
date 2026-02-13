# GrantWise AI - AI-Powered Grant Proposal Generator

> Transform your project ideas into winning grant proposals in minutes using AI.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Zhovon/Foundation)

## 🌟 Features

### ✅ **Phase 1 & 2: Core Platform (Complete)**
- 🤖 **AI-Powered Proposal Generation** - GPT-4 creates professional grant proposals
- 🎨 **Premium UI/UX** - Modern, responsive design with dark mode
- 📝 **Multi-Step Form Wizard** - Intuitive project input with validation
- 💾 **Auto-Save** - Never lose your progress
- 📋 **Copy to Clipboard** - One-click proposal copying

### ✅ **Phase 3: Advanced Features (Complete)**
- 🎯 **Organization Voice Learning** - AI learns your writing style
- 📊 **Guidelines Auto-Parser** - Extracts requirements from grant guidelines
- ✅ **Compliance Checking** - Ensures proposals meet all requirements
- 📄 **Export to Word** - Professional .docx formatting
- 📑 **Export to PDF** - Print-ready PDF documents
- 📝 **Export to Text** - Plain text format
- 🔍 **Grant Discovery** - Find matching federal grants via Grants.gov
- 🎯 **AI Grant Matching** - Relevance scoring for grant opportunities

### ⏳ **Phase 4: Authentication (In Progress)**
- 🔐 **Supabase Authentication** - Email/password + Google OAuth
- 👤 **User Profiles** - Save proposals and track history
- 📊 **Usage Tracking** - Monitor proposal generation limits
- 💎 **Subscription Tiers** - Free, Starter, Professional, Team

### 🚧 **Phase 5: Coming Soon**
- 💳 **Stripe Payments** - Subscription management
- 📈 **Analytics Dashboard** - Track proposal success rates
- 👥 **Team Collaboration** - Share proposals with team members
- 🔔 **Grant Deadline Reminders** - Never miss an opportunity

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Supabase account ([Sign up free](https://supabase.com))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Zhovon/Foundation.git
   cd Foundation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your keys:
   ```bash
   OPENAI_API_KEY=sk-proj-your-key-here
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SESSION_SECRET=your-secret-key
   ```

4. **Set up Supabase database:**
   - Follow instructions in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
   - Run the SQL schema in Supabase SQL Editor

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
Foundation/
├── src/
│   ├── config/          # Configuration files
│   │   ├── constants.js # App constants and pricing
│   │   ├── openai.js    # OpenAI client setup
│   │   └── supabase.js  # Supabase client setup
│   ├── controllers/     # Route controllers
│   │   ├── authController.js      # Authentication logic
│   │   ├── exportController.js    # Export functionality
│   │   ├── grantsController.js    # Grant search
│   │   └── proposalController.js  # Proposal generation
│   ├── middleware/      # Express middleware
│   │   ├── auth.js           # Authentication middleware
│   │   ├── errorHandler.js   # Error handling
│   │   ├── rateLimiter.js    # Rate limiting
│   │   └── validation.js     # Input validation
│   ├── routes/          # Route definitions
│   │   └── index.js     # Main routes
│   ├── services/        # Business logic
│   │   ├── exportService.js      # Word/PDF generation
│   │   ├── grantsService.js      # Grants.gov API
│   │   ├── guidelinesParser.js   # Guideline parsing
│   │   └── openaiService.js      # AI proposal generation
│   └── utils/           # Utility functions
│       ├── logger.js    # Winston logger
│       └── validators.js # Custom validators
├── views/               # EJS templates
│   ├── layouts/         # Layout templates
│   ├── pages/           # Page templates
│   ├── partials/        # Reusable components
│   └── errors/          # Error pages
├── public/              # Static assets
│   ├── css/             # Stylesheets
│   └── js/              # Client-side JavaScript
├── logs/                # Application logs
├── server.js            # Express app entry point
├── package.json         # Dependencies
├── render.yaml          # Render deployment config
└── README.md            # This file
```

---

## 🎯 Usage

### Generate a Proposal

1. **Navigate to the generator:**
   - Click "Start Free" or visit `/generate`

2. **Fill out the form:**
   - **Step 1:** Project basics (name, mission, problem)
   - **Step 2:** Solution details (activities, outcomes)
   - **Step 3:** Budget and metrics
   - **Step 4:** Grant guidelines (paste requirements)

3. **Optional - Add organization voice:**
   - Paste 2-3 past successful proposals
   - AI will learn your writing style

4. **Generate:**
   - Click "Generate Proposal"
   - Wait 10-30 seconds for AI to create your proposal

5. **Export:**
   - Download as Word (.docx)
   - Download as PDF
   - Copy to clipboard

### Find Matching Grants

After generating a proposal:
- View "Matching Grants" section
- See AI-scored relevance (0-100%)
- Click to view grant details on Grants.gov
- Browse all grants at `/grants`

---

## 🚀 Deployment

### Deploy to Render

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repo
   - Render auto-detects `render.yaml`
   - Add environment variables
   - Click "Create Web Service"

3. **Set environment variables in Render:**
   ```
   OPENAI_API_KEY=your-key
   SUPABASE_URL=your-url
   SUPABASE_ANON_KEY=your-key
   SESSION_SECRET=auto-generated
   NODE_ENV=production
   APP_URL=https://your-app.onrender.com
   ```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Supabase** - Authentication & database (PostgreSQL)
- **OpenAI GPT-4** - AI proposal generation

### Frontend
- **EJS** - Templating engine
- **Vanilla CSS** - Custom design system
- **Vanilla JavaScript** - No framework dependencies

### APIs & Services
- **Grants.gov API** - Federal grant opportunities (FREE)
- **OpenAI API** - GPT-4 for proposal generation
- **Supabase Auth** - User authentication
- **Docx** - Word document generation
- **PDFKit** - PDF generation

### DevOps
- **Render** - Hosting platform
- **Winston** - Logging
- **Helmet** - Security headers
- **Express Rate Limit** - API protection

---

## 📊 Pricing Tiers

| Tier | Price | Proposals/Month | Features |
|------|-------|-----------------|----------|
| **Free** | $0 | 1 | Basic generation, exports |
| **Starter** | $49 | 5 | + Voice learning, compliance |
| **Professional** | $99 | Unlimited | + Priority support, analytics |
| **Team** | $199 | Unlimited | + Team collaboration, admin |

---

## 🔒 Security

- ✅ **Helmet.js** - Security headers
- ✅ **Rate Limiting** - API abuse prevention
- ✅ **Input Validation** - XSS protection
- ✅ **Row-Level Security** - Supabase RLS
- ✅ **Session Management** - Secure cookies
- ✅ **Environment Variables** - Sensitive data protection

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **OpenAI** - GPT-4 API
- **Supabase** - Backend infrastructure
- **Grants.gov** - Federal grant data
- **Render** - Hosting platform

---

## 📧 Support

- **Documentation:** [SUPABASE_SETUP.md](SUPABASE_SETUP.md), [DEPLOYMENT.md](DEPLOYMENT.md)
- **Issues:** [GitHub Issues](https://github.com/Zhovon/Foundation/issues)
- **Email:** support@grantwise.ai

---

**Built with ❤️ for nonprofits making a difference**
