# Genetiq - Digital Health Twin & AI Triage Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Three.js-r172-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Google_Gemini-3.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Gemma_4-Local_AI-orange?style=for-the-badge&logo=google&logoColor=white" alt="Gemma" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

---

## 🌍 The Problem at Hand
Healthcare delivery in emerging markets and rural communities faces critical structural challenges:
1. **Clinical Scarcity & Triage Delays**: Remote clinics and Community-based Health Planning and Services (CHPS) compounds operate with severe staffing shortages, leading to long waiting times for basic consultations.
2. **Diagnostic & Literacy Barriers**: Laboratory reports, Rapid Diagnostic Tests (RDTs), and clinical prescriptions are dense with technical jargon that patients struggle to comprehend.
3. **Language Inclusivity Gaps**: Vital medical instructions and emergency guidelines are predominantly in English, creating barriers for speakers of local languages like **Twi, Ga, Ewe, and Fante**.
4. **Connectivity Constraints & Privacy**: Remote clinics often suffer from intermittent internet connectivity, requiring intelligent on-device edge capabilities that operate without continuous cloud access.

---

## 💡 Our Solution: Genetiq
**Genetiq** is a next-generation **Digital Health Twin and Clinical Triage Platform** that merges frontier multimodal AI, edge-native on-device models, interactive 3D anatomical visualization, and real-time telemedicine connectivity.

- **3D Digital Twin Visualizer**: Maps patient vitals, genetic markers, and lab results onto high-fidelity interactive **Male and Female 3D anatomical models**, highlighting affected biological systems in real-time.
- **Multimodal Lab & RDT Scanner**: Patients snap or upload photos of lab reports or test cassettes (e.g., Malaria RDT, Complete Blood Count). Multimodal AI reads biomarkers and explains them in clear, plain language.
- **Dual AI Engine (Cloud + Edge)**: Powered by **Google Gemini 3.5 Flash** for deep multimodal cloud processing and local **Google Gemma 4** models via FastAPI for offline edge triage.
- **Doctor Portal & Telemedicine Sync**: Dedicated clinical dashboard allowing physicians to review patient 3D digital twins, inspect biomarker telemetry, and interact via real-time encrypted chat.
- **Culturally-Tailored Care & Localized Dialects**: Triage advice includes verified local dietary remedies (Moringa, Sobolo, Kontomire, Neem) and instant translations into **Twi, Ga, Ewe, and Fante**.

---

## 🛠️ The Tech Stack

### Frontend (`/client`)
- **Core Framework**: React 18.3, TypeScript 5.6, Vite 6.0
- **3D Graphics & Rendering**: Three.js (r172), React Three Fiber (`@react-three/fiber`), `@react-three/drei`, Postprocessing
- **State & Data Flow**: Redux Toolkit, TanStack React Query, React Router v7
- **Styling & UI**: Modular SCSS, Framer Motion, Lucide Icons, React Icons
- **Real-Time Client**: Socket.io Client, Supabase JS SDK

### Backend & Cloud Services (`/server`)
- **API Server**: Node.js & Express.js (ESM/CommonJS with hot reloading)
- **Database & Auth**: Supabase (PostgreSQL) / MongoDB schemas
- **AI & Multimodal Vision**: `@google/genai` (Gemini 3.5 Flash SDK) & Tesseract OCR
- **Storage & Cloud Deployment**: Google Cloud Storage (GCS), Google Cloud Run, Vercel
- **Real-Time Engine**: Socket.io & WebSocket server (`ws`)

### Local Edge AI Engine (`/server/gemma`)
- **Gateway**: Python 3.10+, FastAPI, Uvicorn
- **Machine Learning Core**: PyTorch, Hugging Face Transformers, Accelerated CPU/GPU runtime
- **Models Supported**: `google/gemma-2-2b-it`, `google/gemma-4-12B-it`, `google/paligemma-3b-pt-224`

---

## ✨ Key Features & Capabilities

### 🧬 1. Interactive 3D Digital Twin
- **Dual Anatomical Models**: Toggle seamlessly between high-precision **Male** and **Female** 3D biological models.
- **Dynamic System Glow & Mapping**: Real-time glowing indicators mapped to specific physiological systems:
  - *Cardiovascular, Respiratory, Digestive, Endocrine, Renal/Urological, Neurological, Musculoskeletal, Hematology*.
- **Biomarker Color Legend**: Interactive HUD detailing biomarker status (Normal, Borderline, Critical) with direct coordinate pinpointing.
- **Cinematic Camera Transitions**: Automated smooth zooming and orbital positioning focusing on symptomatic regions.

### 🩺 2. Clinical Doctor Portal & Telemedicine
- **Live Patient Queue**: Clinicians can inspect active patients, triage urgency levels, and historical health records.
- **Synchronized 3D Pathology View**: Visualizes the selected patient's active health anomalies directly on the 3D body model.
- **Real-Time Telemedicine Chat Sync**: Secure doctor-patient messaging channel (`PatientDoctorChatSync`) for consultations and follow-up guidance.
- **Lab Telemetry Inspection**: Instant breakdown of patient lab panels with normal range comparisons.

### 🧠 3. Multimodal AI Assistant & Lab Ingestion
- **Lab Report & RDT Vision Scanner**: Automated OCR and clinical entity extraction from lab sheets and rapid test strips.
- **Interactive Audio & Voice Triage**: Supports spoken symptom logs and natural conversation triage.
- **Ghanaian Dialect Translation**: Instant translation of diagnosis and treatment advice into **Twi, Ga, Ewe, and Fante**.
- **Local Remedy Integration**: Context-aware recommendations incorporating verified local nutrition (e.g., Sobolo for blood pressure support, Moringa, Kontomire for iron deficiency).
- **Smart Offline Fallback Mode**: Gracefully shifts to an offline simulation engine with preloaded medical presets when edge GPU or internet connectivity is unavailable.

### 📊 4. Health Dashboard & Analytics
- **Personalized Health Score**: Wellness score calculation with historical trend lines.
- **Activity & Vitals Telemetry**: Weekly activity tracking (steps, active calories, sleep, heart rate).
- **Action Plans & Risk Categorization**: Segmented guidance for Follow-up Care, Targeted Supplements, and Lifestyle Modifications.

### 📈 5. Health History & Smart Data Charts
- **Historical Uploads Archive**: Paginated past laboratory records and diagnostic test results.
- **Comparative SVG Charts**: Visual trends showing health score progression and abnormal vs. normal biomarker fluctuations over time.

---

## 📁 Project Structure

```
Genetiq/
├── client/                     # Frontend React & Three.js Application
│   ├── public/                 # Static assets & 3D models (.obj, .mtl, .gltf)
│   │   └── assets/models/      # Male and Female anatomical 3D models
│   ├── src/
│   │   ├── App/                # App services, Redux store & global styling
│   │   │   ├── Redux/          # Slices (triageSlice, authSlice, etc.)
│   │   │   ├── Services/       # GemmaService, PatientDoctorChatSync, API connectors
│   │   │   └── theme/          # Theme context & color tokens
│   │   ├── Features/           # Core feature components
│   │   │   ├── DigitalTwin/    # 3D canvas, Three.js models, CameraController, Shaders
│   │   │   ├── Dashboard/      # Dashboard widgets, AI Assistant panel, telemetry
│   │   │   └── Onboarding/     # Onboarding flows & upload modalities
│   │   ├── Views/              # Routed pages
│   │   │   ├── Dashboard/      # Main patient dashboard
│   │   │   ├── DoctorPortal/   # Clinical telemedicine portal
│   │   │   ├── HealthHistory/  # Historical lab panels & data charts
│   │   │   ├── DetailedRisk/   # In-depth risk analysis view
│   │   │   └── Landing/        # Landing page & entry point
│   │   ├── vite.config.ts      # Vite configuration
│   │   └── package.json        # Client dependencies & scripts
│
├── server/                     # Backend API & AI Engine
│   ├── config/                 # Supabase, DB & environment config
│   ├── controllers/            # Express controllers (auth, uploads, telemetry, chat)
│   ├── routes/                 # API route definitions
│   ├── services/               # Gemini AI & Google Cloud Storage services
│   ├── models/                 # Database models & schemas
│   ├── gemma/                  # Edge AI Python Service
│   │   ├── server.py           # FastAPI local Gemma 4 endpoint
│   │   ├── prompts.py          # Clinical prompts & Ghanaian remedy dataset
│   │   └── requirements.txt    # Python machine learning dependencies
│   ├── index.js                # Express & Socket.io server entry point
│   └── package.json            # Server dependencies
│
├── cloudbuild.yaml             # Google Cloud Build pipeline
├── docker-compose.yml          # Container orchestration
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **yarn**
- **Python**: `3.10+` (optional, for local Gemma edge inference)
- **Supabase Account** or **PostgreSQL** database

---

### Installation & Quickstart

1. **Clone the repository**
   ```bash
   git clone https://github.com/agudu50/Genetiq.git
   cd Genetiq
   ```

2. **Setup Client & Server Dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in `client/`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Create a `.env` file in `server/`:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_google_gemini_api_key
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GCS_BUCKET_NAME=your_gcs_bucket_name
   ```

4. **Run the Full Stack Development Environment**

   From the `client` directory:
   ```bash
   # Runs both Express Server and Vite Client concurrently with auto-reload:
   npm run dev
   ```

   To run with the local **Gemma AI** server concurrently:
   ```bash
   npm run dev:ai
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 🧠 Running Local Gemma 4 Edge AI (Optional)

If the local Gemma service is not started, Genetiq automatically uses **Google Gemini 3.5 Flash** or switches to the **Smart Offline Fallback Engine**.

To run Gemma 4 locally on your machine:

1. **Request Model Access**: Accept the license on Hugging Face for [google/gemma-2-2b-it](https://huggingface.co/google/gemma-2-2b-it) or `google/gemma-4-12B-it`.
2. **Install Python Requirements**:
   ```bash
   cd server/gemma
   pip install -r requirements.txt
   ```
3. **Launch the FastAPI Server**:
   ```bash
   # PowerShell
   $env:HF_TOKEN="your_huggingface_token"
   python server.py --model google/gemma-2-2b-it

   # Bash / macOS / Linux
   export HF_TOKEN="your_huggingface_token"
   python server.py --model google/gemma-2-2b-it
   ```

---

## 📜 Available NPM Scripts

### In `client/`:
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Express backend and Vite client concurrently |
| `npm run dev:ai` | Starts Express backend, Vite client, and FastAPI Gemma server |
| `npm run build` | Builds TypeScript and bundles production client via Vite |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint across client codebase |
| `npm run format` | Formats code with Prettier |

### In `server/`:
| Command | Description |
| :--- | :--- |
| `npm start` | Starts the Express server |
| `npm run dev` | Starts the Express server with native Node `--watch` mode |

---

## 🐳 Docker Deployment

You can build and deploy the complete containerized stack using Docker Compose:

```bash
docker-compose up --build
```

---

## 🎯 Roadmap & Completed Milestones

- [x] High-precision 3D Digital Twin with system-level glow shaders
- [x] Male and Female anatomical body models with dynamic mesh mapping
- [x] Interactive Biomarker Color Legend & spatial coordinate locator
- [x] Clinical Doctor Portal with live telemedicine chat sync
- [x] Multimodal Lab Sheet & RDT Scanner with Google Gemini 3.5 Flash
- [x] Local Edge AI Triage with Google Gemma 4 (FastAPI + PyTorch)
- [x] Localized Ghanaian Language Translation (Twi, Ga, Ewe, Fante)
- [x] Ghanaian Nutritional & Natural Remedy Encyclopedia
- [x] Dynamic Health History analytics & SVG trend visualizations
- [ ] Wearable device telemetry sync (Apple Health, Fitbit, Garmin)
- [ ] Longitudinal AI-powered predictive disease forecasting
- [ ] Offline Mesh-Networking for village CHPS compound node-to-node sync

---

## 📄 License
This project is proprietary software. All rights reserved.

<p align="center">
  Made with ❤️ by the Genetiq Engineering Team
</p>
