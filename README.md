# GrantWise AI

AI-powered grant proposal generation platform for nonprofits.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your OpenAI API key.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📋 Features

- **AI-Powered Drafting**: Generate compelling grant proposals using GPT-4
- **Organization Voice Learning**: AI learns your unique writing style
- **Guidelines Compliance**: Automatically follow funder requirements
- **Multi-Step Wizard**: Intuitive form for collecting project information
- **Export Options**: Download as PDF or Word document
- **Premium UI/UX**: Modern, beautiful interface with dark mode

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS templates, Vanilla JavaScript
- **AI**: OpenAI GPT-4
- **Styling**: Custom CSS with design system
- **Security**: Helmet, rate limiting, input validation

## 📁 Project Structure

```
grantwise-ai/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   └── utils/           # Helper functions
├── views/
│   ├── layouts/         # Page layouts
│   ├── pages/           # Page templates
│   ├── partials/        # Reusable components
│   └── errors/          # Error pages
├── public/
│   ├── css/             # Stylesheets
│   └── js/              # Client-side scripts
└── server.js            # Entry point
```

## 🔐 Environment Variables

Required:
- `OPENAI_API_KEY` - Your OpenAI API key
- `SESSION_SECRET` - Random string for session encryption

Optional:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint

## 🎨 Design System

The application uses a comprehensive design system with:
- HSL color palette for easy theming
- Responsive typography scale
- Consistent spacing system
- Reusable components
- Dark mode support

## 🚧 Roadmap

- [x] Phase 1: Core Architecture
- [x] Phase 2: Premium UI/UX
- [x] Phase 3: Advanced Features (Voice Learning, Guidelines Parser, Export)
- [ ] Phase 4: User Authentication & Payments
- [ ] Phase 5: Analytics & Funder Intelligence

## 🚀 Deployment

### Deploy to Render

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repo
   - Render will auto-detect `render.yaml`
   - Add environment variable: `OPENAI_API_KEY`
   - Click "Create Web Service"

3. **Your app will be live at:**
   `https://grantwise-ai.onrender.com`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📄 License

MIT

## 🤝 Support

For support, email support@grantwise.ai or open an issue.
