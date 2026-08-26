# 🏗️ SoulSpace — Frontend Architecture Flowchart
### Technical Blueprint & System Design (React 19 + TypeScript + Vite)

---

## 🧭 Complete Frontend Architecture Flowchart (Mermaid)

```mermaid
flowchart TD
    %% ──────────────────────────────────────────────────────────────────────────
    %% LAYER 1: CLIENT ENTRY & RUNTIME BOOTSTRAP
    %% ──────────────────────────────────────────────────────────────────────────
    subgraph L1["Layer 1: Entry Point & DOM Bootstrap"]
        HTML["📄 index.html<br/>(Single Page Root #root)"] --> MAIN["⚡ main.tsx<br/>(React 19 createRoot DOM Mount)"]
    end

    %% ──────────────────────────────────────────────────────────────────────────
    %% LAYER 2: GLOBAL STATE & SECURITY CONTEXT
    %% ──────────────────────────────────────────────────────────────────────────
    subgraph L2["Layer 2: Global State & Auth Management"]
        MAIN --> AUTH_PROVIDER["🛡️ AuthProvider (AuthContext.tsx)<br/>• Session Token (JWT)<br/>• User Profile & Handle (@username)<br/>• localStorage Sync ('ss_token', 'ss_user')<br/>• Login / Register / Demo Login / Update Profile"]
    end

    %% ──────────────────────────────────────────────────────────────────────────
    %% LAYER 3: APPLICATION SHELL & CLIENT-SIDE ROUTER
    %% ──────────────────────────────────────────────────────────────────────────
    subgraph L3["Layer 3: Router & Global App Shell (App.tsx)"]
        AUTH_PROVIDER --> ROUTER["🌐 BrowserRouter & AppContent Shell"]
        
        ROUTER --> NAV["🧭 Navbar Component<br/>• Brand Logo<br/>• Navigation Links<br/>• Auth Profile Dropdown Hub"]
        ROUTER --> FOOTER["⚓ Footer Component<br/>• Helplines & Links"]
        ROUTER --> CHATBOT_WIDGET["🤖 Draggable ChatbotWidget<br/>• Pointer Events API<br/>• Floating Assistant Shortcut"]
    end

    %% ──────────────────────────────────────────────────────────────────────────
    %% LAYER 4: FEATURE MODULES & PAGE ROUTING
    %% ──────────────────────────────────────────────────────────────────────────
    subgraph L4["Layer 4: Feature Modules & Page Controllers"]
        ROUTER --> ROUTES{"🔀 React Router Switch"}

        %% Page 1: Home
        ROUTES -->|"/ "| P_HOME["🏠 Home.tsx<br/>• Hero Section<br/>• About Section<br/>• Statistics (@react-map/india)<br/>• Services Grid"]

        %% Page 2: AI Support
        ROUTES -->|"/ai-support"| P_AI["💬 AiSupport.tsx<br/>• Conversational CBT Engine<br/>• 20-turn Sliding Memory<br/>• Keyword Crisis Trigger (9152987821)<br/>• Multi-session Management"]

        %% Page 3: Mental Health
        ROUTES -->|"/mental-health"| P_MH["📋 MentalHealth.tsx<br/>• 4 Validated DSM-5 Tests:<br/>  - PHQ-9 (Depression: 9 Qs)<br/>  - GAD-7 (Anxiety: 7 Qs)<br/>  - PCL-5 (PTSD: 20 Qs)<br/>  - ISI (Insomnia: 7 Qs)<br/>• Instant Score & Severity Calculation"]

        %% Page 4: Appointments
        ROUTES -->|"/appointment"| P_APT["📅 Appointment.tsx<br/>• AI Doctor Recommender (Gemini)<br/>• Specialty & City Filters<br/>• 4-Step Interactive Booking Wizard<br/>• Nodemailer SMTP Email Dispatcher<br/>• Realtime Status Tracker"]

        %% Page 5: Mood Tracker
        ROUTES -->|"/mood-tracker"| P_MOOD["🎭 MoodTracker.tsx<br/>• AI Biometric Face Scan (7 Emotions)<br/>• Confidence Score Engine (85-99%)<br/>• Hand-coded SVG Trend Line Graph<br/>• Daily Mood Log Timeline"]

        %% Page 6: Profile Hub
        ROUTES -->|"/profile"| P_PROF["👤 Profile.tsx<br/>• User Identity & @Handle<br/>• 4 Vital Wellbeing Cards<br/>• 4-Tab Activity Track Record:<br/>  - Assessments History<br/>  - Mood Timeline<br/>  - Doctor Bookings<br/>  - Safety & Contact Modal"]

        %% Page 7: Resources
        ROUTES -->|"/resources"| P_RES["📚 ResourcesPage.tsx<br/>• Curated Mental Wellness Library<br/>• Realtime Search & Category Filters"]

        %% Page 8: Auth
        ROUTES -->|"/login, /register"| P_AUTH["🔐 Auth.tsx<br/>• JWT Login & Register Forms<br/>• 1-Click Demo Login<br/>• Instant Validation"]
    end

    %% ──────────────────────────────────────────────────────────────────────────
    %% LAYER 5: CLIENT NETWORKING & BACKEND INTEGRATION
    %% ──────────────────────────────────────────────────────────────────────────
    subgraph L5["Layer 5: Client Networking & REST API Gateway"]
        FETCH["📡 Native Browser Fetch Client<br/>• JSON Payloads<br/>• Bearer Token Authorization<br/>• Auto-error Handling"]

        P_AUTH --> FETCH
        P_AI --> FETCH
        P_MH --> FETCH
        P_APT --> FETCH
        P_MOOD --> FETCH
        P_PROF --> FETCH

        FETCH ==> BACKEND["🟢 Backend REST API (Node.js/Express :5000)<br/>• /api/auth (JWT, Profiles)<br/>• /api/chat (Gemini/Ollama)<br/>• /api/assessments (History)<br/>• /api/appointments (AI Match & SMTP)"]
    end

    %% Styles & Colors
    style L1 fill:#f8fafc,stroke:#94a3b8,stroke-width:2px
    style L2 fill:#ecfdf5,stroke:#10b981,stroke-width:2px
    style L3 fill:#eff6ff,stroke:#3b82f6,stroke-width:2px
    style L4 fill:#fdf4ff,stroke:#c084fc,stroke-width:2px
    style L5 fill:#fff7ed,stroke:#f97316,stroke-width:2px
    style BACKEND fill:#1e293b,stroke:#0f172a,color:#ffffff,stroke-width:2px
```

---

## 🏛️ The 5-Layer Frontend Architecture (PPT Breakdown)

### 1. Entry & Runtime Bootstrap (`main.tsx` + `index.html`)
- **Single Page Application (SPA)** root mounted on `#root`.
- **React 19 + TypeScript** runtime with strict type safety.
- **Vite 8** with HMR (Hot Module Replacement) and optimized bundling.

### 2. Global State & Security Context (`AuthContext.tsx`)
- **Centralized Session State**: Stores active user object, unique `@username`, and JWT bearer token.
- **Local Storage Persistence**: Rehydrates credentials (`ss_token`, `ss_user`) on refresh.
- **Stateless Verification**: Seamless login, registration, 1-click demo login, and live profile updates.

### 3. Application Shell & Navigation Hub (`App.tsx` + `Navbar.tsx`)
- **Declarative Client-side Routing**: Managed by `react-router-dom` v7.
- **App Shell**: Top sticky `Navbar` with dynamic auth profile dropdown, responsive mobile drawer, dynamic `Footer`, and floating draggable `ChatbotWidget` (powered by Pointer Events API).

### 4. Modular Feature Pages & Sub-Systems
| Module | Component | Key Responsibilities |
|--------|-----------|----------------------|
| **Home** | `Home.tsx` | Landing experience, India SVG interactive choropleth map (`@react-map/india`), clinical overview. |
| **AI Support** | `AiSupport.tsx` | Empathetic CBT chatbot, 20-turn sliding memory, 20+ keyword crisis detection with instant helpline triggers. |
| **Mental Health** | `MentalHealth.tsx` | 4 DSM-5 clinical screeners (PHQ-9, GAD-7, PCL-5, ISI) with instant scoring and recommendations. |
| **Appointment Concierge** | `Appointment.tsx` | Gemma-2B-3BrainCell specialist recommendation, 3-step wizard, Nodemailer SMTP patient/doctor dispatch. |
| **Mood Tracker** | `MoodTracker.tsx` | Biometric AI facial expression scanner (7 emotions), confidence indicator, hand-crafted SVG line trend chart. |
| **Profile Hub** | `Profile.tsx` | User identity card, unique handle `@username`, 4-tab clinical & mood track records, live edit modal. |
| **Resources** | `ResourcesPage.tsx` | Mental health directory with category filter and search. |
| **Auth** | `Auth.tsx` | Secure login, registration, and 1-click Demo mode. |

### 5. Client Networking & Gateway Layer
- **Native Fetch API**: Standardized JSON communication with the Express backend (`http://localhost:5000/api`).
- **Authorization Interceptor**: Automatic `Bearer <JWT>` header injection for protected endpoints.
- **Resilience**: Client-side error boundaries, toast notifications, and retry logic for high API availability.

---

## 🎤 30-Second Elevator Pitch for Judges (Presentation Script)

> *"SoulSpace’s frontend is engineered with **React 19 and TypeScript**, built for speed, privacy, and clinical reliability. It features a clean **5-layer modular architecture**: from our **Auth & Session Context** to a **responsive App Shell**, branching into **7 core modules** including AI Therapy Chat (powered by Team 3BrainCell's Fine-Tuned Gemma 2B Clinical Model), DSM-5 Screeners, and Biometric Mood Tracking. Everything communicates through a secure **JWT-authenticated REST gateway** connected to our Node.js AI backend. Zero heavy third-party UI libraries — fully custom, ultra-fast, and accessible."*
