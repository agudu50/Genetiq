# Genetiq - Digital Health Twin Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Three.js-r172-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
</p>

## 🌍 The Problem at Hand
Ghanaian healthcare, particularly in rural and sub-urban communities, faces three critical challenges:
1. **Clinical Scarcity & Gaps**: Rural clinics and Community-based Health Planning and Services (CHPS) compounds are often understaffed, meaning patients wait hours for basic consultations or triage.
2. **Diagnostic & Literacy Barriers**: Medical lab reports, Rapid Diagnostic Tests (RDTs), and prescriptions are filled with complex medical jargon that patients cannot interpret on their own.
3. **Language Barriers**: Important medical guidelines and emergency directions are predominantly published in English, excluding patients who speak local languages like Twi, Ga, Ewe, or Fante.
4. **Connectivity Constraints**: Relying on cloud-based Artificial Intelligence (AI) is impractical for remote regions with unstable internet connectivity.

## 💡 Our Solution: Genetiq + Gemma 4 Local Artificial Intelligence (AI)
Genetiq addresses these challenges by bringing local, edge-native intelligence directly to the patient's device, with no internet required:
1. **Edge-Native Gemma 4 Artificial Intelligence (AI) Assistant**: By running Google's frontier Gemma 4 models locally on-device, we deliver medical triage and guidance without relying on cloud services.
2. **Multimodal Lab Scanner**: Patients upload or scan photos of their laboratory sheets or Rapid Diagnostic Test (RDT) cassettes. Gemma 4 reads the image, extracts biomarkers, and translates them into a plain-English layout.
3. **3D Digital Twin Visualizer**: Triage inputs automatically zoom and highlight affected biological systems on an interactive 3D human body model (e.g. malaria/anemia highlights *Hematology*), visually reinforcing where the issue is.
4. **Localized Remedies & Languages**: The portal provides health advice, diet recovery tips (like Moringa and Sobolo), and translates all diagnostic text into **Twi, Ga, Ewe, and Fante** dynamically.

## 🛠️ The Tech Stack We Used
- **Frontend Core**: React 18, TypeScript, and Vite.
- **3D Visualization**: Three.js & React Three Fiber (R3F) for the interactive digital twin.
- **Artificial Intelligence (AI) Backend Service**: FastAPI (Fast Application Programming Interface) (Python 3) local server.
- **Machine Learning Core**: PyTorch and Hugging Face Transformers for executing model inference on the edge.

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

### 📈 Health History Tracking

- **Historical Uploads Panel**: Modern paginated cards to trace past laboratory findings effortlessly.
- **Smart Data Charts**: Dynamic side-by-side SVG charts for tracking health scores over time and visualizing normal vs. abnormal markers.
- **Fluid & Responsive Layout**: Clean, centered, single-column design that stretches gracefully on desktops and adapts flawlessly to mobile screens.
- **Horizontal Profile Banner**: Quick access to patient vital stats and new upload actions directly at the top of the history page.

### 📋 Action Plans

- **Follow-up Care**: Recommended medical checkups and tests
- **Supplements**: Personalized supplement recommendations
- **Lifestyle**: Daily habits and lifestyle improvements

### 🌍 Internationalization

Support for 17 languages including:

- English, Spanish, French, German, Italian
- Portuguese, Russian, Arabic, Chinese, Japanese
- Korean, Hindi, Polish, Turkish, and more



### 📋 Onboarding & Data Control

- **Dynamic Action Navigation**: Specialized Navbar guide for onboarding steps
  (Quiz, Supplements, Uploads, Connections).
- **High-Fidelity Modals**: Premium dark-glassmorphic confirmation and success
  modals for health data processing.
- **Genetic Data Ingestion**: Secure file upload system for genetic and
  biomarker data results.
- **Real-time Processing**: Visual feedback during Digital Twin generation with
  estimated notification timers.

### 🇬🇭 Ghanaian Gemma 4 Health Assistant

- **Edge-Native Artificial Intelligence (AI) Assistant**: Powered by a local FastAPI (Fast Application Programming Interface) server running Google Gemma 4 models via PyTorch/Transformers.
- **Multimodal Lab Scanning**: Optical Character Recognition (OCR) and visual comprehension of uploaded lab sheets, Rapid Diagnostic Test (RDT) strips, and prescriptions.
- **Ghanaian Language Translation**: Instantly toggle translations of clinical findings and summaries into Twi, Ga, Ewe, and Fante.
- **3D Digital Twin Integration**: Dynamic symptom triage automatically zooms and highlights relevant biological systems on the 3D twin (e.g. malaria/anemia zooms to *Hematology*).
- **Local Remedy Encyclopedia**: Curated nutrition advice featuring local food items like Moringa, Sobolo, Kontomire, and Neem tree tea.
- **Smart Offline Fallback**: Zero-setup offline simulator ensures presets and dashboard remain 100% functional during pitches or offline reviews without requiring active Graphics Processing Unit (GPU) resources.

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
| React Three Fiber | 3D Rendering     |
| Three.js          | 3D Graphics      |
| Redux Toolkit     | State Management |
| React Router      | Navigation       |
| SCSS Modules      | Styling          |

### Backend & Artificial Intelligence (AI) Engine

| Technology | Purpose                 |
| ---------- | ----------------------- |
| Express.js | Main Application Programming Interface (API) Server |
| MongoDB    | Database                |
| Mongoose   | Object Document Mapper (ODM) |
| Python 3   | Artificial Intelligence (AI) Server Environment |
| FastAPI    | Artificial Intelligence (AI) REST Application Programming Interface (API) Gateway |
| PyTorch    | Machine Learning Engine |
| Transformers | Large Language Model (LLM) Weights Loader     |

## 📁 Project Structure

```
genetiq-app/
├── public/                 # Static assets
│   └── assets/models/      # 3D model files
├── server/                 # Backend API
│   ├── controllers/        # Route handlers
│   ├── gemma/              # Gemma 4 local AI service (Python)
│   │   ├── prompts.py      # Local Ghanaian remedies & prompts
│   │   ├── server.py       # FastAPI Gemma server
│   │   └── requirements.txt# Python dependencies
│   ├── models/             # Database schemas
│   └── routes/             # API routes
├── src/
│   ├── App/                # App configuration
│   │   ├── Services/       # GemmaService.ts (client API connector)
│   │   ├── Redux/          # State management (triageSlice.tsx)
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
- MongoDB (for main backend)
- Python 3.10+ (for local Gemma Artificial Intelligence (AI) server)

### Client & Express Server Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/genetiq-app.git
   cd genetiq-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start client & server development**

   ```bash
   npm run dev
   ```

### 🧠 Local Gemma Artificial Intelligence (AI) Engine Setup

If the Gemma Artificial Intelligence (AI) server is not running, the application will automatically activate **Smart Offline Fallback Mode** (indicated by an orange badge), where all preset medical cases remain testable using local templates. 

To run the live Gemma model locally:

1. **Accept the Model License**
   Log in to Hugging Face (HF), visit the [google/gemma-2-2b-it](https://huggingface.co/google/gemma-2-2b-it) page (or the gated `google/gemma-4-12B-it` model page), and click **Acknowledge license / Request access**.

2. **Create an Access Token**
   Go to your [Hugging Face settings -> Access Tokens](https://huggingface.co/settings/tokens) and copy a new **Read** token.

3. **Install Python dependencies**
   ```bash
   cd server/gemma
   pip install -r requirements.txt
   ```

4. **Start the Gemma 4 Local Server**
   Start the FastAPI instance passing your Hugging Face (HF) token in your terminal environment:
   
   * **PowerShell**:
     ```powershell
     $env:HF_TOKEN="your_token_here"
     python server.py --model google/gemma-2-2b-it
     ```
   * **Command Prompt (CMD)**:
     ```cmd
     set HF_TOKEN=your_token_here
     python server.py --model google/gemma-2-2b-it
     ```

   *(You can substitute `--model` with `google/paligemma-3b-pt-224` to test real-time multimodal image scanning, or `google/gemma-4-12B-it` on laptops equipped with high-end Graphics Processing Units (GPUs) and Video Random Access Memory (VRAM)).*

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
- [x] Integrate Google Gemma 4 Local AI Assistant
- [x] Add dynamic systemic visualizations (Respiratory, Digestive, etc) to 3D
      Digital Twin
- [x] Health History Page Redesign & Smart Chart Enhancements
- [ ] Wearable device integration (Apple Watch, Fitbit, Oura)
- [ ] AI-powered predictive health analytics
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
