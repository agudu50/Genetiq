# Genetiq - Digital Health Twin Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Three.js-r172-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
</p>

## 📋 Overview

**Genetiq** is a cutting-edge digital health platform that provides users with a
personalized 3D digital twin visualization of their body, combined with
comprehensive health insights, risk assessments, and actionable wellness
recommendations.

The platform leverages advanced 3D visualization technology, modern glassmorphic
UI/UX, and bleeding-edge **Web3 Authentication via the Sui Blockchain** to help
users understand their health data securely, intuitively, and interactively.

## ✨ Features

### 🧬 3D Digital Twin

- **Interactive 3D Body Model**: Visually track and pinpoint health conditions
  in real-time
- **Dynamic System Highlights**: Real-time glowing indicators precisely mapped
  to key biological regions (Respiratory, Digestive, Endocrine, Renal,
  Urological, Neurological, Cardiovascular, & Musculoskeletal)
- Real-time camera transitions and cinematic zooming transitions
- Switch between full body and specialized system views seamlessly

### 📊 Health Dashboard

- **Welcome Header**: Personalized greetings with quick health stats
- **Health Score**: Track your overall wellness score with trends
- **Activity Charts**: Weekly activity visualization with multiple metrics
- **Health Insights**: AI-powered health alerts and recommendations
- **Quick Actions**: Fast access to common health tasks

### ⚠️ Risk Assessment & Dashboard

- **Key Areas of Concern**: Stunning glassmorphic cards indicating exact health
  risks visually (e.g. Diagnostic Costs, Information Gaps)
- **Action Plans**: Follow-up Care, Supplements, and Lifestyle modifications
  categorized using interactive pill-shaped tabs
- **Activity Charts**: Weekly activity visualization featuring dynamic step,
  calorie, and active minute metrics
- **Cardiovascular Risk Analysis**: Detailed heart health monitoring

### 📋 Action Plans

- **Follow-up Care**: Recommended medical checkups and tests
- **Supplements**: Personalized supplement recommendations
- **Lifestyle**: Daily habits and lifestyle improvements

### 🌍 Internationalization

Support for 17 languages including:

- English, Spanish, French, German, Italian
- Portuguese, Russian, Arabic, Chinese, Japanese
- Korean, Hindi, Polish, Turkish, and more

### 🔐 Web3 & Blockchain Integration

- **Sui Network Authentication**: Frictionless Web3 login using decentralized,
  secure zkLogin and dAppKit wallet connectivity
- **Decentralized Data Ownership**: Laying the foundation for sovereign health
  records on-chain
- **Smart Contract Interoperability**: Readily equipped with a `Move` package
  architecture enabling transparent logic

### 📋 Onboarding & Data Control

- **Dynamic Action Navigation**: Specialized Navbar guide for onboarding steps
  (Quiz, Supplements, Uploads, Connections).
- **High-Fidelity Modals**: Premium dark-glassmorphic confirmation and success
  modals for health data processing.
- **Genetic Data Ingestion**: Secure file upload system for genetic and
  biomarker data results.
- **Real-time Processing**: Visual feedback during Digital Twin generation with
  estimated notification timers.

### 🎨 Modern UI/UX

- **Premium Dark Aesthetics**: High-contrast dark theme by default, optimized
  for OLED and mobile readability.
- **Glassmorphism & Glows**: Advanced backdrop blurs and subtle glows for
  high-risk health metrics.
- **Responsive Fluidity**: Perfectly balanced layouts for mobile, tablet, and
  desktop viewports.
- **Micro-animations**: Smooth transitions for modal state changes and route
  navigation.
- **Brand Consistency**: Unified indigo-violet gradient branding across all
  primary action components.

## 🛠️ Tech Stack

### Frontend

| Technology        | Purpose          |
| ----------------- | ---------------- |
| React 18          | UI Framework     |
| TypeScript        | Type Safety      |
| Vite              | Build Tool       |
| Sui dApp Kit      | Web3 Auth/Wallet |
| React Three Fiber | 3D Rendering     |
| Three.js          | 3D Graphics      |
| Redux Toolkit     | State Management |
| React Router      | Navigation       |
| SCSS Modules      | Styling          |

### Backend

| Technology | Purpose                 |
| ---------- | ----------------------- |
| Express.js | API Server              |
| MongoDB    | Database                |
| Mongoose   | ODM                     |
| Socket.io  | Real-time Communication |
| bcrypt     | Password Hashing        |

## 📁 Project Structure

```
genetiq-app/
├── public/                 # Static assets
│   └── assets/models/      # 3D model files
├── server/                 # Backend API
│   ├── controllers/        # Route handlers
│   ├── models/             # Database schemas
│   └── routes/             # API routes
├── src/
│   ├── App/                # App configuration
│   │   ├── i18n/           # Internationalization
│   │   ├── Redux/          # State management
│   │   ├── Routes/         # Routing config
│   │   ├── Styles/         # Global styles
│   │   └── theme/          # Theme context
│   ├── assets/             # Images & icons
│   ├── Features/           # Feature modules
│   │   ├── Auth/           # Authentication
│   │   ├── Dashboard/      # Dashboard widgets
│   │   ├── DigitalTwin/    # 3D visualization
│   │   ├── Onboarding/     # User onboarding
│   │   ├── Risk/           # Risk assessment
│   │   └── Structural/     # Layout components
│   ├── locales/            # Translation files
│   └── Views/              # Page components
├── docker-compose.yml      # Docker configuration
├── Dockerfile              # Container build
└── vite.config.ts          # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (for backend)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/genetiq-app.git
   cd genetiq-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

| Command           | Description               |
| ----------------- | ------------------------- |
| `npm run dev`     | Start development server  |
| `npm run build`   | Build for production      |
| `npm run preview` | Preview production build  |
| `npm run lint`    | Run ESLint                |
| `npm run format`  | Format code with Prettier |

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t genetiq-app .
docker run -p 3000:3000 genetiq-app
```

## 🌐 Deployment

The application is configured for deployment on:

- **Vercel** (Frontend) - see `vercel.json`
- **Docker** (Full stack) - see `Dockerfile` and `docker-compose.yml`

## 🎯 Roadmap

- [x] Premium Dashboard UI/UX Refinement
- [x] High-Fidelity Onboarding Modals
- [x] Integrate Sui Web3 Wallet Authentication
- [x] Add dynamic systemic visualizations (Respiratory, Digestive, etc) to 3D
      Digital Twin
- [ ] Wearable device integration (Apple Watch, Fitbit, Oura)
- [ ] AI-powered predictive health analytics
- [ ] On-chain patient data tokenization & encryption
- [ ] Family health history tracking
- [ ] Telemedicine integration

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before
submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support, please contact the development team or open an issue in the
repository.

---

<p align="center">
  Made with ❤️ by the Genetiq Team
</p>
