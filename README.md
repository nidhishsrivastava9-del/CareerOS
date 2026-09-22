# CareerOS — Modern Student Career Dashboard

> **"Build your skills. Track your growth. Shape your career."**

CareerOS is a modern, student-first career management platform designed to help aspiring engineers track their curriculum milestones, benchmark their skills against industry standards, manage technical projects, monitor algorithmic problem solving (DSA), and optimize ATS resumes.

This repository contains **Day 1: Modern Student Career Dashboard Frontend**, establishing the core design system, responsive layouts, interactive widgets, and modular data layers.

---

## 🚀 Tech Stack

- **Core**: React 18, Vite 5, JavaScript (ES6+)
- **Styling**: Tailwind CSS v3, PostCSS, Autoprefixer
- **Navigation & Routing**: React Router v6
- **Visualizations & Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Design Aesthetic**: Modern SaaS dark-first theme, glassmorphism, glowing accents, and responsive layout

---

## 📂 Project Structure

```text
src/
├── components/
│   ├── ActivityChart.jsx       # Recharts weekly study & activity visualization
│   ├── GoalCard.jsx            # Interactive daily checklist with dynamic completion percentage
│   ├── Header.jsx              # Responsive top bar with search, notifications, theme toggle & avatar
│   ├── Layout.jsx              # Shared application layout (Sidebar + Header + Page Content)
│   ├── ProgressCard.jsx        # Large career progress indicator with circular gauge (68%)
│   ├── ProjectCard.jsx         # Card displaying project tags, live links, and completion bars
│   ├── QuickActionsModal.jsx   # Interactive modal feedback for adding skills, projects & goals
│   ├── Roadmap.jsx             # Visual milestone timeline with status nodes
│   ├── Sidebar.jsx             # Collapsible sidebar with navigation and student profile
│   ├── SkillCard.jsx           # Animated skill progress bar with proficiency tags
│   └── StatCard.jsx            # KPI cards with metrics, trends, and glowing Lucide icons
│
├── context/
│   └── ThemeContext.jsx        # Theme provider supporting persistent Dark/Light modes
│
├── data/
│   └── dummyData.js            # Centralized student profile, roadmap, skills, and projects data
│
├── pages/
│   ├── Dashboard.jsx           # Main Hub: Greeting, Stats, Roadmap, Skills, Chart, Projects, Goals
│   ├── Roadmap.jsx             # In-depth multi-phase full-stack software developer roadmap
│   ├── Skills.jsx              # Categorized technical skill matrix with mastery filters
│   ├── Projects.jsx            # Portfolio repository showcase with modal detail view
│   ├── DSA.jsx                 # DSA Tracker: Problem categories, difficulty distribution, streak
│   ├── Goals.jsx               # Milestone & goal management (Daily, Short-Term, Long-Term)
│   ├── Resume.jsx              # ATS Resume Studio with 80% score gauge and export preview
│   ├── Analytics.jsx           # Analytics charts: Study hours, DSA split, and skill comparison
│   └── Settings.jsx            # User profile preferences, theme switch, and notification settings
│
├── App.jsx                     # Application root and route configuration
├── main.jsx                    # React entry point
└── index.css                   # Global Tailwind styles, glassmorphism utilities, and custom scrollbars
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (tested with `v20.17.0`)
- **npm**: `v9.0.0` or higher

### Installation

```bash
# Clone or navigate to the repository
cd /path/to/careeros

# Install dependencies
npm install
```

### Running Development Server

```bash
npm run dev
```

The application will start locally at:
```text
http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 🧭 Application Modules & Routes

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | **Dashboard** | Main dashboard with greeting, progress gauge, KPI cards, roadmap, activity, and goals |
| `/roadmap` | **Roadmap** | Multi-phase curriculum covering Foundations, React, Node.js, DSA, System Design |
| `/skills` | **Skills** | Technical skill matrix with category tabs (Frontend, Backend, Database, DevOps, Core CS) |
| `/projects` | **Projects** | Showcase of verified student projects (AI Study Buddy, NS Gaming Hub, etc.) |
| `/dsa` | **DSA Tracker** | Problem breakdown (84 solved), topic progress (Arrays to DP), and streak metrics |
| `/goals` | **Goals** | Interactive goal checklist with live progress tracking and deadlines |
| `/resume` | **Resume** | ATS-optimized live resume viewer with 80% strength score and improvement tips |
| `/analytics` | **Analytics** | Deep Recharts analytics: Weekly hours, difficulty donut, and velocity bars |
| `/settings` | **Settings** | Student profile editor, appearance switch, and notification toggles |

---

## 🔮 Future Development Roadmap

CareerOS is architected for clean full-stack evolution without modifying component contracts:

```text
React Frontend (Day 1 — Complete)
       ↓
Node.js + Express REST API (Day 2)
       ↓
MongoDB & Mongoose Data Layer (Day 3)
       ↓
Authentication & JWT Session Management (Day 4)
       ↓
AI Career Assistant & ATS Intelligence (Day 5)
       ↓
Production Cloud Deployment & CI/CD (Day 6)
```

- **Day 2**: Replace `src/data/dummyData.js` imports with Axios/Fetch API service consuming `/api/v1/*` endpoints.
- **Day 3**: MongoDB schema creation for `Students`, `Roadmaps`, `Skills`, `Projects`, and `DSATracking`.
- **Day 4**: User authentication (Google OAuth & JWT) with multi-student profiles.
- **Day 5**: AI Career Assistant integration for automated resume reviews and personalized interview prep.

---

## 📄 License

MIT License. Designed with excellence for student career acceleration.
