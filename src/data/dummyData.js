// CareerOS — Centralized Mock Data & API Service Simulation
// This structured data mimics future backend API payloads (/api/v1/...)

export const studentProfile = {
  name: "Alex Rivera",
  roleTitle: "Student",
  major: "Computer Science",
  university: "Institute of Technology",
  graduationYear: "2027",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  targetRole: "Software Developer",
  status: "Active Learner",
  bio: "Passionate CS sophomore focusing on full-stack web engineering, scalable systems, and algorithmic problem solving.",
  github: "https://github.com/alexrivera",
  linkedin: "https://linkedin.com/in/alexrivera",
  email: "alex.rivera@university.edu"
};

export const careerProgressData = {
  percentage: 68,
  milestonesCompleted: 12,
  totalMilestones: 18,
  statusMessage: "You're making great progress toward your career goals.",
  currentFocus: "Frontend Architecture & Asynchronous JS",
  estimatedTimeToReady: "3.5 months"
};

export const statCardsData = [
  {
    id: "skills",
    title: "Skills",
    value: "7 / 12",
    badge: "+2 this month",
    badgeType: "positive",
    subtitle: "Core competencies mastered",
    iconName: "Code",
    accentColor: "indigo"
  },
  {
    id: "projects",
    title: "Projects",
    value: "3",
    badge: "1 in progress",
    badgeType: "neutral",
    subtitle: "Production-ready builds",
    iconName: "FolderGit2",
    accentColor: "purple"
  },
  {
    id: "dsa",
    title: "DSA Progress",
    value: "42%",
    badge: "84 problems solved",
    badgeType: "positive",
    subtitle: "Target: 200 problems",
    iconName: "Binary",
    accentColor: "cyan"
  },
  {
    id: "resume",
    title: "Resume Strength",
    value: "80%",
    badge: "Good progress",
    badgeType: "positive",
    subtitle: "ATS Optimization Score",
    iconName: "FileCheck2",
    accentColor: "emerald"
  }
];

export const roadmapMilestones = [
  {
    id: "m-1",
    title: "HTML & CSS",
    phase: "Phase 1: Foundations",
    status: "completed",
    description: "Semantic HTML5, CSS Flexbox, Grid, Responsive Design & CSS Variables",
    hours: "25 hrs",
    completedDate: "Jan 2026"
  },
  {
    id: "m-2",
    title: "JavaScript",
    phase: "Phase 1: Foundations",
    status: "completed",
    description: "ES6+, Event Loop, DOM Manipulation, Async/Await & Promises",
    hours: "40 hrs",
    completedDate: "Feb 2026"
  },
  {
    id: "m-3",
    title: "Git & GitHub",
    phase: "Phase 1: Foundations",
    status: "completed",
    description: "Version control, branch workflows, pull requests, merge conflict resolution",
    hours: "15 hrs",
    completedDate: "Feb 2026"
  },
  {
    id: "m-4",
    title: "React",
    phase: "Phase 2: Frontend Mastery",
    status: "current",
    description: "Hooks, Context API, React Router, Custom Hooks, Performance Optimization",
    hours: "35 hrs (In Progress)",
    completedDate: "Active Now"
  },
  {
    id: "m-5",
    title: "Node.js",
    phase: "Phase 3: Backend & API",
    status: "upcoming",
    description: "Express.js REST APIs, Middleware, Authentication, Event Architecture",
    hours: "30 hrs estimated",
    completedDate: "Planned"
  },
  {
    id: "m-6",
    title: "MongoDB",
    phase: "Phase 3: Backend & API",
    status: "upcoming",
    description: "NoSQL document schemas, Mongoose models, aggregation pipelines & indexing",
    hours: "20 hrs estimated",
    completedDate: "Planned"
  },
  {
    id: "m-7",
    title: "DSA",
    phase: "Phase 4: Problem Solving",
    status: "upcoming",
    description: "Data Structures & Algorithms, LeetCode 75, Trees, Graphs, DP mastery",
    hours: "60 hrs ongoing",
    completedDate: "Planned"
  },
  {
    id: "m-8",
    title: "System Design",
    phase: "Phase 5: Architecture",
    status: "upcoming",
    description: "Caching, Load Balancing, Microservices, DB Sharding & Rate Limiting",
    hours: "25 hrs estimated",
    completedDate: "Planned"
  },
  {
    id: "m-9",
    title: "Interview Preparation",
    phase: "Phase 6: Career Launch",
    status: "upcoming",
    description: "Behavioral STAR questions, live coding mocks, system rounds & portfolio polish",
    hours: "20 hrs estimated",
    completedDate: "Planned"
  }
];

export const skillProgressData = [
  { name: "JavaScript", level: 85, category: "Frontend", status: "Proficient", color: "#F59E0B" },
  { name: "React", level: 65, category: "Frontend", status: "Intermediate", color: "#6366F1" },
  { name: "Node.js", level: 40, category: "Backend", status: "Learning", color: "#10B981" },
  { name: "MongoDB", level: 35, category: "Database", status: "Learning", color: "#06B6D4" },
  { name: "Git/GitHub", level: 80, category: "DevOps", status: "Proficient", color: "#EC4899" },
  { name: "DSA", level: 42, category: "Core CS", status: "Intermediate", color: "#8B5CF6" },
  { name: "Python", level: 70, category: "Backend", status: "Proficient", color: "#3B82F6" },
  { name: "SQL", level: 60, category: "Database", status: "Intermediate", color: "#14B8A6" },
  { name: "TypeScript", level: 50, category: "Frontend", status: "Intermediate", color: "#3178C6" },
  { name: "Docker", level: 30, category: "DevOps", status: "Beginner", color: "#0284C7" }
];

export const weeklyActivityData = [
  { day: "Mon", hours: 4.5, problemsSolved: 4, commits: 7 },
  { day: "Tue", hours: 6.0, problemsSolved: 6, commits: 12 },
  { day: "Wed", hours: 3.5, problemsSolved: 3, commits: 5 },
  { day: "Thu", hours: 5.5, problemsSolved: 5, commits: 9 },
  { day: "Fri", hours: 4.0, problemsSolved: 4, commits: 8 },
  { day: "Sat", hours: 7.0, problemsSolved: 8, commits: 15 },
  { day: "Sun", hours: 5.0, problemsSolved: 5, commits: 6 }
];

export const recentProjectsData = [
  {
    id: "proj-1",
    title: "AI Study Buddy",
    status: "In Progress",
    progress: 65,
    description: "Intelligent flashcard generator and real-time study tutor leveraging LLMs and spaced repetition.",
    techStack: ["React", "Node.js", "MongoDB", "AI"],
    githubUrl: "https://github.com/alexrivera/ai-study-buddy",
    demoUrl: "https://studybuddy-demo.app",
    featured: true
  },
  {
    id: "proj-2",
    title: "NS Gaming Hub",
    status: "Completed",
    progress: 100,
    description: "Responsive browser gaming portal featuring classic arcade titles, local leaderboards, and sound effects.",
    techStack: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/alexrivera/ns-gaming-hub",
    demoUrl: "https://nsgaminghub.io",
    featured: true
  },
  {
    id: "proj-3",
    title: "Food Nutrition Calculator",
    status: "In Progress",
    progress: 45,
    description: "Macro-nutrient tracker consuming Edamam Food API with dynamic charts and weekly calorie insights.",
    techStack: ["React", "API", "Tailwind CSS"],
    githubUrl: "https://github.com/alexrivera/nutrition-calc",
    demoUrl: "https://nutri-calc.app",
    featured: true
  },
  {
    id: "proj-4",
    title: "Campus Event Connect",
    status: "Completed",
    progress: 100,
    description: "Student discovery platform for hackathons, club meetings, and technical workshops with RSVP reminders.",
    techStack: ["React", "Firebase", "Tailwind CSS"],
    githubUrl: "https://github.com/alexrivera/campus-connect",
    demoUrl: "https://campusconnect.edu",
    featured: false
  }
];

export const initialGoalsData = [
  { id: "g-1", text: "Solve 5 DSA questions", completed: true, category: "DSA", deadline: "Today" },
  { id: "g-2", text: "Complete React hooks lesson", completed: true, category: "Learning", deadline: "Today" },
  { id: "g-3", text: "Work on portfolio project", completed: false, category: "Projects", deadline: "Tomorrow" },
  { id: "g-4", text: "Read DBMS notes", completed: false, category: "Academics", deadline: "Friday" }
];

export const dsaTopicsData = [
  { topic: "Arrays", solved: 18, total: 25, easy: 10, medium: 7, hard: 1, color: "from-blue-500 to-indigo-600" },
  { topic: "Strings", solved: 15, total: 20, easy: 8, medium: 6, hard: 1, color: "from-indigo-500 to-purple-600" },
  { topic: "Linked List", solved: 10, total: 15, easy: 6, medium: 4, hard: 0, color: "from-purple-500 to-pink-600" },
  { topic: "Stack", solved: 8, total: 12, easy: 4, medium: 3, hard: 1, color: "from-pink-500 to-rose-600" },
  { topic: "Queue", solved: 6, total: 10, easy: 4, medium: 2, hard: 0, color: "from-rose-500 to-amber-600" },
  { topic: "Trees", solved: 12, total: 20, easy: 5, medium: 5, hard: 2, color: "from-emerald-500 to-teal-600" },
  { topic: "Graphs", solved: 8, total: 18, easy: 3, medium: 4, hard: 1, color: "from-teal-500 to-cyan-600" },
  { topic: "Dynamic Programming", solved: 7, total: 25, easy: 2, medium: 4, hard: 1, color: "from-cyan-500 to-blue-600" }
];

export const dsaSummary = {
  totalSolved: 84,
  targetGoal: 200,
  easy: 42,
  medium: 35,
  hard: 7,
  activeStreakDays: 14,
  acceptanceRate: "76.4%"
};

export const resumeData = {
  score: 80,
  targetRole: "Junior Full Stack Developer",
  summary: "Results-driven Computer Science student proficient in JavaScript, React, and RESTful web development. Demonstrated leadership in collaborative academic projects, building modern web applications with seamless UX and maintainable architectures.",
  education: [
    {
      degree: "B.Tech in Computer Science and Engineering",
      institution: "State Institute of Science & Technology",
      period: "2023 - 2027",
      gpa: "3.85 / 4.0",
      highlights: ["Dean's Honor List (Fall 2024, Spring 2025)", "Vice President, ACM Student Chapter"]
    }
  ],
  skillsList: [
    "JavaScript (ES6+)", "TypeScript", "React", "Node.js", "Express", "HTML5/CSS3",
    "Tailwind CSS", "Git & GitHub", "MongoDB", "SQL", "Data Structures & Algorithms"
  ],
  certifications: [
    { name: "Meta Frontend Developer Professional Certificate", issuer: "Coursera", date: "2025" },
    { name: "JavaScript Algorithms & Data Structures", issuer: "freeCodeCamp", date: "2024" }
  ],
  improvements: [
    { title: "Quantify Project Impact", desc: "Add metric-driven bullet points (e.g. 'reduced latency by 25%').", status: "recommended" },
    { title: "Add Docker / CI-CD keywords", desc: "Include containerization exposure to pass modern automated ATS filters.", status: "in-progress" },
    { title: "Clean Layout & Heading Hierarchy", desc: "Standard 1-page single-column layout verified for 99% ATS parseability.", status: "completed" }
  ]
};

// Simulated mock API delays/fetchers for future backend plug-and-play
export const mockApi = {
  getProfile: () => Promise.resolve(studentProfile),
  getDashboardData: () => Promise.resolve({
    profile: studentProfile,
    progress: careerProgressData,
    stats: statCardsData,
    roadmap: roadmapMilestones,
    skills: skillProgressData,
    weeklyActivity: weeklyActivityData,
    projects: recentProjectsData,
    goals: initialGoalsData
  }),
  getRoadmap: () => Promise.resolve(roadmapMilestones),
  getSkills: () => Promise.resolve(skillProgressData),
  getProjects: () => Promise.resolve(recentProjectsData),
  getDSA: () => Promise.resolve({ topics: dsaTopicsData, summary: dsaSummary }),
  getResume: () => Promise.resolve(resumeData)
};
