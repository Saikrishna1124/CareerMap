# 🗺️ CareerMap

**CareerMap** is an AI-powered career intelligence platform designed to help users navigate their professional journeys. Built with modern web technologies, it offers personalized job recommendations, resume building tools, and AI-driven interview preparation.

## ✨ Features

- **🤖 AI Insights Engine:** Powered by Google Gemini AI for smart career recommendations and interview prep.
- **📊 Interactive Dashboard:** Visualize career trajectories and skill growth using Recharts and D3.js.
- **📄 Resume Builder:** Generate professional resumes dynamically.
- **🎨 Modern UI/UX:** Built with React, Framer Motion for smooth animations, and Tailwind CSS for responsive design.
- **🔐 Secure Authentication:** Custom JWT-based authentication system ensuring user data privacy.

## 🛠️ Tech Stack

**Frontend:**
- React (v19) & Vite
- Tailwind CSS (v4) & Framer Motion
- React Router DOM

**Backend:**
- Node.js & Express.js
- Custom JWT Authentication (bcryptjs, cookie-parser)
- Google GenAI SDK

**Database:**
- PostgreSQL / MongoDB (Mongoose) / SQLite
- Drizzle ORM

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Saikrishna1124/CareerMap.git
   cd CareerMap
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Configuration:**
   Copy the `.env.example` file to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   Ensure you have:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `DATABASE_URL`: Your database connection string (PostgreSQL/MongoDB/SQLite).
   - `JWT_SECRET`: A secret string for JWT signing.

### Running the App

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## 🏗️ Project Structure

```
CareerMap/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/             # Page components (Dashboard, Profile, etc.)
│   ├── context/           # React Context providers (Auth, Theme)
│   ├── services/          # API service calls
│   └── db/                # Database schema and Drizzle ORM configuration
├── public/                # Static assets
├── drizzle/               # Database migrations
└── ...
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. **Fork** the repository.
2. Create a **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4. **Push** to the branch (`git push origin feature/AmazingFeature`).
5. Open a **Pull Request**.


