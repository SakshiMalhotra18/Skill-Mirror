# SkillMirror — AI Hiring Intelligence

![SkillMirror Banner](public/banner.png)

**SkillMirror** is a high-end, AI-powered candidate evaluation tool designed for senior hiring panels and engineering managers. It provides brutally honest, structured analysis of candidate profiles, focusing on deep technical signals, enterprise maturity, and market positioning.

Built with **Vite**, **TypeScript**, and **Chart.js**, and powered by the **Groq Llama 3.3** engine.

---

## ✨ Key Features

- 🎯 **Verdicts with Confidence**: Get a clear hiring verdict (Hire/No Hire/Strong Hire) backed by high-confidence reasoning.
- 📊 **Skill Vector Visualization**: Interactive radar charts showing the candidate's skill distribution.
- 🚦 **Signal Analysis**: Automated detection of strong, weak, and missing technical signals.
- 🕳️ **Gap Analysis**: Detailed breakdown of technical gaps, their impact, and potential fixes/mitigations.
- 🏢 **Enterprise ML Assessment**: Evaluation of pipeline maturity, production readiness, and scale signals.
- 📝 **Impact Rewriting**: AI-driven suggestions for refining candidate impact statements.
- ⚡ **Ultra-Fast Analysis**: Powered by Groq for near-instantaneous AI processing.

---

## 🛠️ Tech Stack

- **Frontend**: Vite + TypeScript
- **Styling**: Vanilla CSS (Modern, Responsive, Glassmorphic UI)
- **AI Engine**: Groq (Llama-3.3-70b-versatile)
- **Charts**: Chart.js
- **Persistence**: LocalStorage with 24-hour caching

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Groq API Key (Get one for free at [console.groq.com](https://console.groq.com/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SakshiMalhotra18/Skill-Mirror.git
   cd Skill-Mirror
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Groq API key:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## 📖 Usage

1. Paste a candidate's resume or profile description into the input area.
2. (Optional) Provide specific role context or job description to tailor the analysis.
3. Click **"Analyze Candidate"**.
4. Review the comprehensive dashboard, including the skill radar, gap analysis, and market positioning.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📮 Contact

**Sakshi Malhotra** - [GitHub](https://github.com/SakshiMalhotra18)

Project Link: [https://github.com/SakshiMalhotra18/Skill-Mirror](https://github.com/SakshiMalhotra18/Skill-Mirror)
