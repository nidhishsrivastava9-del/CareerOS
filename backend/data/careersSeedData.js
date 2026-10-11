/**
 * CareerOS — 23 Technical Career Catalogs & Roadmap Seed Dataset (Day 7)
 * 
 * Scalable hierarchical data structure:
 * Career -> Phase -> Subject -> Module -> Lessons/Resources (Theory, Notes, Videos, Quiz, PYQs, Practice, Project)
 */

export const CAREERS_SEED = [
  // 1. Full Stack Developer
  {
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    description: 'Master modern end-to-end web engineering, from responsive React user interfaces to scalable Node.js microservices and production database systems.',
    category: 'Software & Web Development',
    difficulty: 'Beginner to Advanced',
    estimatedHours: 260,
    skills: ['JavaScript / TypeScript', 'React', 'Node.js', 'Express', 'MongoDB / PostgreSQL', 'REST & GraphQL', 'Docker', 'System Design'],
    prerequisites: ['Basic computer literacy', 'Problem-solving mindset', 'Basic HTML/CSS familiarity'],
    status: 'Trending',
    icon: 'Layers',
    featured: true,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Modern Frontend Foundations',
        description: 'Establish deep mastery over semantic HTML5, modern CSS3 layout paradigms, and ES6+ JavaScript runtime mechanics.',
        estimatedHours: 65,
        subjects: [
          {
            id: 'fs-sub-1',
            title: 'JavaScript Core & Asynchronous Runtime',
            description: 'Event loop mechanics, promises, closures, prototypes, and DOM interaction.',
            estimatedHours: 35,
            icon: 'Code',
            modules: [
              {
                id: 'mod-fs-js-core',
                slug: 'javascript-core',
                title: 'JavaScript Core & Execution Context',
                description: 'Deep dive into execution context, call stack, closures, hoisting, and scope chaining.',
                estimatedHours: 12,
                difficulty: 'Beginner',
                order: 1,
                learningObjectives: [
                  'Understand the JavaScript call stack and memory heap',
                  'Master lexical scoping and closures in real-world patterns',
                  'Differentiate between var, let, and const at the bytecode level',
                  'Leverage higher-order functions for declarative data transformations'
                ],
                resources: [
                  {
                    id: 'res-js-th-1',
                    type: 'theory',
                    title: 'JavaScript Execution Context & Memory Lifecycle',
                    description: 'In-depth conceptual breakdown of how V8 compiles and executes JavaScript code.',
                    duration: '25 mins',
                    difficulty: 'Beginner',
                    order: 1,
                    content: `### Execution Context & Call Stack in JavaScript

JavaScript is a single-threaded, non-blocking asynchronous language. At its heart lies the **Execution Context**, which is an environment where JavaScript code is evaluated and executed.

#### 1. Phases of Execution Context
Whenever a JavaScript script runs, the engine creates the **Global Execution Context (GEC)** through two distinct phases:
1. **Creation / Memory Allocation Phase**: 
   - Allocates memory for variables and functions.
   - Variables declared with \`var\` are initialized with \`undefined\`.
   - Variables declared with \`let\` and \`const\` are placed in the **Temporal Dead Zone (TDZ)**.
   - Function declarations are scanned and fully stored in heap memory.
2. **Code Execution Phase**:
   - Executes instructions line by line, assigning real values and executing function calls.

\`\`\`javascript
// Example: Closure in action
function createCounter(initialValue = 0) {
  let count = initialValue;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.getValue());   // 11
\`\`\`

#### 2. Closures & Lexical Environment
A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). Closures give inner functions access to outer function scopes even after the outer function has returned.`,
                    tags: ['JavaScript', 'Execution Context', 'Closures', 'Fundamentals']
                  },
                  {
                    id: 'res-js-nt-1',
                    type: 'notes',
                    title: 'JavaScript Closures & Scope Cheatsheet',
                    description: 'Key mental models, gotchas, and memory leak prevention techniques.',
                    duration: '15 mins',
                    difficulty: 'Beginner',
                    order: 2,
                    content: `### Essential Takeaways:
- **Lexical Scoping**: Scope is determined by the physical location of code at compile time.
- **Closures**: Inner functions hold references to outer variables, preventing garbage collection.
- **TDZ (Temporal Dead Zone)**: Accessing \`let\` or \`const\` before declaration throws a \`ReferenceError\`.
- **Memory Gotcha**: Unintentionally retaining DOM references inside closures can cause memory leaks in single-page applications. Always clean up listeners in component unmounts.`,
                    tags: ['Notes', 'Cheatsheet', 'Closures']
                  },
                  {
                    id: 'res-js-vid-1',
                    type: 'video',
                    title: 'JavaScript Event Loop & Concurrency Model Visualized',
                    description: 'Watch the microtask queue, macrotask queue, and call stack operate step by step.',
                    duration: '22:15',
                    difficulty: 'Intermediate',
                    order: 3,
                    videoMetadata: {
                      platform: 'youtube',
                      videoId: '8aGhZQkoFbQ',
                      channel: 'What the heck is the event loop anyway? - JSConf',
                      duration: '22:15',
                      language: 'English',
                      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
                      topic: 'Event Loop & Promises',
                      difficulty: 'Intermediate',
                      approvalState: 'published',
                      displayOrder: 1
                    },
                    tags: ['Video', 'Event Loop', 'Concurrency']
                  },
                  {
                    id: 'res-js-qz-1',
                    type: 'quiz',
                    title: 'Core JavaScript Execution Assessment',
                    description: 'Test your understanding of closures, scope, and the temporal dead zone.',
                    duration: '10 mins',
                    difficulty: 'Intermediate',
                    order: 4,
                    quizQuestions: [
                      {
                        id: 'q1',
                        question: 'What happens when accessing a "let" variable before its declaration in the source code?',
                        options: [
                          'It returns undefined because of hoisting',
                          'It throws a ReferenceError due to the Temporal Dead Zone',
                          'It throws a TypeError',
                          'It returns null'
                        ],
                        correctAnswer: 1,
                        explanation: 'Variables declared with let and const are hoisted to the block start but remain uninitialized in the Temporal Dead Zone until their definition line executes.'
                      },
                      {
                        id: 'q2',
                        question: 'Which queue has higher processing priority after a synchronous call stack becomes empty?',
                        options: [
                          'Macrotask Queue (setTimeout, setInterval)',
                          'Microtask Queue (Promise.then, MutationObserver, queueMicrotask)',
                          'RequestAnimationFrame Queue',
                          'I/O Polling Queue'
                        ],
                        correctAnswer: 1,
                        explanation: 'The event loop processes all microtasks in the microtask queue to completion before picking the next task from the macrotask queue.'
                      },
                      {
                        id: 'q3',
                        question: 'What is a closure in JavaScript?',
                        options: [
                          'A syntax error when closing braces are missing',
                          'A method to immediately terminate recursive execution',
                          'A function paired with its lexical environment reference',
                          'A database connection pool wrapper'
                        ],
                        correctAnswer: 2,
                        explanation: 'A closure is created whenever a function is defined, giving it access to variables in its outer lexical scope.'
                      }
                    ],
                    tags: ['Quiz', 'Assessment', 'JavaScript']
                  },
                  {
                    id: 'res-js-pyq-1',
                    type: 'pyq',
                    title: 'Top Frontend Interview PYQs: JavaScript Runtimes',
                    description: 'Actual questions asked at Google, Amazon, Microsoft, and Uber frontend rounds.',
                    duration: '20 mins',
                    difficulty: 'Intermediate',
                    order: 5,
                    pyqItems: [
                      {
                        company: 'Amazon',
                        role: 'Frontend Engineer (SDE I/II)',
                        question: 'What is the output of `for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }` and how do you fix it?',
                        answerSnippet: 'Outputs `3, 3, 3` because `var` is function-scoped and by the time the timer expires, `i` has reached 3. Fix by changing `var` to `let`, creating block scope per iteration, or using an IIFE.',
                        frequency: 'Very High'
                      },
                      {
                        company: 'Google',
                        role: 'Software Engineer (UI/UX)',
                        question: 'Explain how JavaScript handles garbage collection with closures.',
                        answerSnippet: 'V8 uses mark-and-sweep garbage collection. When a closure retains a variable reference from an outer scope, that variable remains reachable from root references and will not be garbage collected.',
                        frequency: 'High'
                      }
                    ],
                    tags: ['PYQ', 'Interview', 'Amazon', 'Google']
                  },
                  {
                    id: 'res-js-pr-1',
                    type: 'practice',
                    title: 'Hands-on Challenge: Build a Memoize Utility',
                    description: 'Implement a production-grade memoize function using closures and a Map cache.',
                    duration: '30 mins',
                    difficulty: 'Intermediate',
                    order: 6,
                    practiceTask: {
                      problemStatement: 'Write a higher-order function `memoize(fn)` that caches results based on arguments stringified. Subsequent calls with identical arguments must return the cached output without re-evaluating the expensive function.',
                      instructions: [
                        'Handle multiple arguments',
                        'Use Map or plain Object for O(1) lookups',
                        'Return the exact result of the original computation'
                      ],
                      hints: [
                        'Use JSON.stringify(args) as the cache key',
                        'Check cache.has(key) before computing'
                      ],
                      starterCode: `function memoize(fn) {\n  const cache = new Map();\n  return function(...args) {\n    // Write your code here\n  };\n}`,
                      solutionCode: `function memoize(fn) {\n  const cache = new Map();\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) {\n      return cache.get(key);\n    }\n    const result = fn.apply(this, args);\n    cache.set(key, result);\n    return result;\n  };\n}`
                    },
                    tags: ['Practice', 'Coding', 'Memoization']
                  },
                  {
                    id: 'res-js-proj-1',
                    type: 'project',
                    title: 'Mini Project: Interactive State-Driven Event Bus',
                    description: 'Architect a lightweight Publish/Subscribe event emitter with unsubscribe tokens.',
                    duration: '45 mins',
                    difficulty: 'Intermediate',
                    order: 7,
                    projectSpec: {
                      title: 'Custom Event Emitter Library',
                      overview: 'Build an event emitter class supporting .on(event, handler), .emit(event, ...args), .once(event, handler), and .off(event, handler).',
                      features: [
                        'Multiple listeners per topic',
                        'Unsubscribe closure token returned on subscription',
                        'Zero external dependencies'
                      ],
                      techStack: ['Vanilla JavaScript', 'ES6 Classes']
                    },
                    tags: ['Project', 'Architecture', 'Mini-Project']
                  }
                ]
              },
              {
                id: 'mod-fs-async',
                slug: 'asynchronous-javascript',
                title: 'Asynchronous JavaScript & Promises',
                description: 'Callbacks, Promises, async/await, error propagation, and concurrency helpers (Promise.allSettled).',
                estimatedHours: 15,
                difficulty: 'Intermediate',
                order: 2,
                learningObjectives: [
                  'Implement robust error-handled async/await patterns',
                  'Orchestrate concurrent operations with Promise.all vs Promise.allSettled',
                  'Handle abortable requests using AbortController'
                ],
                resources: [
                  {
                    id: 'res-async-th-1',
                    type: 'theory',
                    title: 'Asynchronous Architecture: Promises & Async/Await',
                    description: 'Deep architectural dive into microtasks, unhandled rejections, and retry wrappers.',
                    duration: '30 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: `### Understanding the Promise State Machine

A **Promise** is a proxy for a value not necessarily known when the promise is created. It exists in one of three states:
- **Pending**: Initial state, neither fulfilled nor rejected.
- **Fulfilled**: Operation completed successfully.
- **Rejected**: Operation failed with an error reason.

\`\`\`javascript
// Robust async fetcher with retry pattern
async function fetchWithRetry(url, options = {}, retries = 3, backoffMs = 500) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (err) {
    if (retries <= 1) throw err;
    await new Promise(r => setTimeout(r, backoffMs));
    return fetchWithRetry(url, options, retries - 1, backoffMs * 2);
  }
}
\`\`\``,
                    tags: ['Async', 'Promises', 'Concurrency']
                  },
                  {
                    id: 'res-async-vid-1',
                    type: 'video',
                    title: 'Mastering Promise Combinators in Modern Web Apps',
                    description: 'When to use Promise.all, Promise.race, Promise.allSettled, and Promise.any.',
                    duration: '18:40',
                    difficulty: 'Intermediate',
                    order: 2,
                    videoMetadata: {
                      platform: 'youtube',
                      videoId: 'vn3tm0quoqE',
                      channel: 'Web Dev Simplified',
                      duration: '18:40',
                      language: 'English',
                      thumbnail: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=600&auto=format&fit=crop&q=80',
                      topic: 'Promise Combinators',
                      difficulty: 'Intermediate',
                      approvalState: 'published',
                      displayOrder: 2
                    },
                    tags: ['Video', 'Promises']
                  },
                  {
                    id: 'res-async-qz-1',
                    type: 'quiz',
                    title: 'Async/Await & Error Handling Quiz',
                    description: 'Assess edge cases in async promise aggregation.',
                    duration: '8 mins',
                    difficulty: 'Intermediate',
                    order: 3,
                    quizQuestions: [
                      {
                        id: 'q-as-1',
                        question: 'What happens if one promise rejects in Promise.all([p1, p2, p3])?',
                        options: [
                          'It waits for the others to settle then returns all results',
                          'It immediately rejects with the reason of the first rejected promise',
                          'It returns undefined for the rejected promise',
                          'It converts rejection into a warning'
                        ],
                        correctAnswer: 1,
                        explanation: 'Promise.all short-circuits as soon as any input promise rejects (fail-fast behavior).'
                      }
                    ],
                    tags: ['Quiz', 'Async']
                  }
                ]
              }
            ]
          },
          {
            id: 'fs-sub-2',
            title: 'React Architecture & State Modeling',
            description: 'Component lifecycles, hooks, context API, custom hooks, and performance profiling.',
            estimatedHours: 30,
            icon: 'Layers',
            modules: [
              {
                id: 'mod-fs-react-hooks',
                slug: 'react-hooks-architecture',
                title: 'Advanced React Hooks & Performance',
                description: 'Master useState, useEffect, useMemo, useCallback, useRef, and custom state machines.',
                estimatedHours: 15,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: [
                  'Avoid stale closures and infinite render loops',
                  'Optimize component re-renders with useMemo and memo',
                  'Extract reusable domain logic into declarative custom hooks'
                ],
                resources: [
                  {
                    id: 'res-rk-th-1',
                    type: 'theory',
                    title: 'React Fiber & Hook Execution Rules',
                    description: 'How React tracks hooks internally via linked lists and Fiber nodes.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: `### React Fiber Architecture and Hooks Internal Mechanics

React hooks rely on **Fiber node linked lists**. Each Fiber node maintains a \`memoizedState\` pointer linked to each hook call in strict lexical execution order.

#### Rules of Hooks Explained:
1. **Only call hooks at the top level**: Never inside loops, conditions, or nested functions so React preserves the exact linked-list hook index between renders.
2. **Only call hooks from React function components or custom hooks**.`,
                    tags: ['React', 'Hooks', 'Fiber']
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Scalable Backend Services & APIs',
        description: 'Design robust Node.js and Express RESTful architectures with MongoDB and PostgreSQL.',
        estimatedHours: 85,
        subjects: [
          {
            id: 'fs-sub-3',
            title: 'Node.js Core & REST API Architecture',
            description: 'Middleware pipelines, authentication with JWT, error formatting, and validation.',
            estimatedHours: 40,
            icon: 'Server',
            modules: [
              {
                id: 'mod-fs-node-api',
                slug: 'express-rest-architecture',
                title: 'Enterprise REST APIs with Express & Node.js',
                description: 'Clean controller-service-repository patterns, token authentication, and robust validation.',
                estimatedHours: 18,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: [
                  'Structure Express apps using modular routers and controllers',
                  'Implement JWT bearer tokens with refresh token rotation',
                  'Enforce schema validation with Joi or Zod'
                ],
                resources: [
                  {
                    id: 'res-node-th-1',
                    type: 'theory',
                    title: 'REST Architectural Constraints & Best Practices',
                    description: 'Statelessness, idempotency, proper HTTP status codes, and security headers.',
                    duration: '20 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: `### RESTful API Design Standards

A mature REST service adheres to key Fielding constraints:
- **Statelessness**: Every request contains all necessary auth and context.
- **Idempotency**: GET, PUT, and DELETE operations should be safely repeatable without unintended side effects.
- **Consistent Response Schema**: Uniform envelopes with status, success, and error payload structures.`,
                    tags: ['Backend', 'REST', 'Node.js']
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        phaseNumber: 3,
        title: 'Phase 3: Database Engineering & Caching',
        description: 'Document databases, relational schemas, indexing strategies, and Redis caching layers.',
        estimatedHours: 60,
        subjects: [
          {
            id: 'fs-sub-4',
            title: 'MongoDB & PostgreSQL Design Patterns',
            description: 'Data modeling, aggregation pipelines, schema migrations, and indexing.',
            estimatedHours: 35,
            icon: 'Database',
            modules: [
              {
                id: 'mod-fs-mongo-design',
                slug: 'database-indexing-design',
                title: 'Database Modeling & Index Optimization',
                description: 'B-tree index mechanics, compound indexes, explain plans, and query performance.',
                estimatedHours: 14,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: [
                  'Understand compound index ordering (Equality, Sort, Range)',
                  'Diagnose slow queries using explain() analyze',
                  'Avoid full table/collection scans in production'
                ],
                resources: [
                  {
                    id: 'res-db-th-1',
                    type: 'theory',
                    title: 'Database Indexing: The ESR Rule (Equality, Sort, Range)',
                    description: 'How to build compound indexes that satisfy complex multi-key queries.',
                    duration: '20 mins',
                    difficulty: 'Advanced',
                    order: 1,
                    content: `### Index Optimization: The ESR Rule
When building compound indexes on databases like MongoDB or PostgreSQL, follow the ESR rule:
1. **Equality**: Place fields with exact match lookups first.
2. **Sort**: Place fields used in ORDER BY or sort() second.
3. **Range**: Place fields with range operators (<, >, $gte, $lte) last.`,
                    tags: ['Database', 'Indexing', 'Optimization']
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        phaseNumber: 4,
        title: 'Phase 4: DevOps, Cloud Deployment & System Design',
        description: 'Docker containerization, CI/CD pipelines, cloud deployment, and scalable distributed system design.',
        estimatedHours: 50,
        subjects: [
          {
            id: 'fs-sub-5',
            title: 'Docker, CI/CD & Production Deployment',
            description: 'Multi-stage Docker builds, GitHub Actions pipelines, and reverse proxies.',
            estimatedHours: 25,
            icon: 'Cloud',
            modules: [
              {
                id: 'mod-fs-docker',
                slug: 'docker-containerization',
                title: 'Docker Multi-Stage Builds & Compose',
                description: 'Containerize frontend and backend stacks into production-ready lightweight images.',
                estimatedHours: 12,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: [
                  'Write multi-stage Dockerfiles for Node.js and React Vite',
                  'Orchestrate local full-stack environments with docker-compose',
                  'Implement healthchecks and non-root execution'
                ],
                resources: [
                  {
                    id: 'res-doc-th-1',
                    type: 'theory',
                    title: 'Production Docker Containerization Architecture',
                    description: 'Techniques for sub-100MB container images, layer caching, and security hardening.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: `### Why Multi-Stage Docker Builds Matter
Multi-stage builds allow separating build-time tools (like npm, typescript, vite compiler) from the runtime image, resulting in dramatically smaller and more secure images.`,
                    tags: ['Docker', 'DevOps', 'Containers']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 2. Software Developer
  {
    title: 'Software Developer',
    slug: 'software-developer',
    description: 'Build robust, maintainable software systems with strong algorithmic foundations, object-oriented design patterns, and clean engineering practices.',
    category: 'Software & Web Development',
    difficulty: 'Beginner to Advanced',
    estimatedHours: 240,
    skills: ['Data Structures & Algorithms', 'System Design', 'Java / C++ / Python', 'Git & CI/CD', 'Testing & TDD', 'Design Patterns'],
    prerequisites: ['Basic programming syntax', 'Logical thinking'],
    status: 'Popular',
    icon: 'Terminal',
    featured: true,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Computer Science Foundations & Algorithmic Thinking',
        description: 'Core memory models, pointers, Big O analysis, and foundational data structures.',
        estimatedHours: 60,
        subjects: [
          {
            id: 'sd-sub-1',
            title: 'Data Structures & Algorithmic Complexity',
            description: 'Arrays, linked lists, trees, graphs, sorting, and dynamic programming.',
            estimatedHours: 40,
            icon: 'Binary',
            modules: [
              {
                id: 'mod-sd-algo-1',
                slug: 'asymptotic-complexity-and-dsa',
                title: 'Asymptotic Analysis & Big O Mastery',
                description: 'Master time and space complexity analysis across iterative and recursive patterns.',
                estimatedHours: 12,
                difficulty: 'Beginner',
                order: 1,
                learningObjectives: ['Calculate Big O', 'Understand recursion tree method', 'Master master theorem basics'],
                resources: [
                  {
                    id: 'res-sd-dsa-1',
                    type: 'theory',
                    title: 'Time & Space Complexity Formal Principles',
                    description: 'Rigorous derivation of runtime efficiency from O(1) to O(2^n).',
                    duration: '25 mins',
                    difficulty: 'Beginner',
                    order: 1,
                    content: '### Asymptotic Complexity\nBig-O notation describes the upper bound of algorithm growth rate relative to input size n.',
                    tags: ['DSA', 'Complexity', 'Big O']
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Object-Oriented & Modular System Architecture',
        description: 'SOLID principles, Gang of Four design patterns, and clean code hygiene.',
        estimatedHours: 60,
        subjects: [
          {
            id: 'sd-sub-2',
            title: 'Software Design Patterns & SOLID',
            description: 'Creational, structural, and behavioral design patterns in real-world codebases.',
            estimatedHours: 35,
            icon: 'Layers',
            modules: [
              {
                id: 'mod-sd-solid',
                slug: 'solid-design-principles',
                title: 'SOLID Principles in Production Systems',
                description: 'Practical implementations of SRP, OCP, LSP, ISP, and DIP.',
                estimatedHours: 14,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Implement dependency inversion', 'Refactor code to adhere to Open-Closed Principle'],
                resources: [
                  {
                    id: 'res-solid-th-1',
                    type: 'theory',
                    title: 'Applying SOLID in Modern Software',
                    description: 'Real-world case studies and architectural refactorings.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### SOLID Principles: The Backbone of Maintainable Software\nSingle Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.',
                    tags: ['Architecture', 'SOLID', 'Design Patterns']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 3. Frontend Developer
  {
    title: 'Frontend Developer',
    slug: 'frontend-developer',
    description: 'Specialize in building ultra-responsive, accessible, and high-performance user interfaces using modern web standards and React ecosystem tools.',
    category: 'Software & Web Development',
    difficulty: 'Beginner to Advanced',
    estimatedHours: 200,
    skills: ['HTML5 & Semantic Markup', 'Tailwind CSS / modern CSS', 'TypeScript', 'React.js', 'State Management (Zustand/Redux)', 'Web Performance & Core Web Vitals', 'Testing (Vitest, Playwright)'],
    prerequisites: ['Basic HTML/CSS understanding'],
    status: 'In Demand',
    icon: 'Layout',
    featured: true,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Web Standards & Modern Layouts',
        description: 'Semantic HTML, accessibility (a11y), modern Flexbox/Grid, and responsive UI design.',
        estimatedHours: 45,
        subjects: [
          {
            id: 'fe-sub-1',
            title: 'Advanced CSS & Modern Layout Systems',
            description: 'Subgrid, Container Queries, CSS Variables, and fluid typography.',
            estimatedHours: 25,
            icon: 'Palette',
            modules: [
              {
                id: 'mod-fe-css-layout',
                slug: 'modern-css-grid-flexbox',
                title: 'Mastering CSS Grid & Flexbox Systems',
                description: 'Build enterprise fluid layouts without media query spaghetti.',
                estimatedHours: 10,
                difficulty: 'Beginner',
                order: 1,
                learningObjectives: ['Master Grid auto-fit and minmax()', 'Create complex two-dimensional dashboard interfaces'],
                resources: [
                  {
                    id: 'res-fe-grid-th',
                    type: 'theory',
                    title: 'CSS Grid Deep Dive: Fractional Units and Auto-Fill',
                    description: 'Comprehensive guide to building adaptive application layouts.',
                    duration: '20 mins',
                    difficulty: 'Beginner',
                    order: 1,
                    content: '### Modern CSS Layout: Grid vs Flexbox\nFlexbox is one-dimensional (content-first); Grid is two-dimensional (layout-first).',
                    tags: ['CSS', 'Grid', 'Flexbox']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 4. Backend Developer
  {
    title: 'Backend Developer',
    slug: 'backend-developer',
    description: 'Design and build resilient server architectures, high-throughput microservices, secure authentication systems, and database infrastructures.',
    category: 'Software & Web Development',
    difficulty: 'Intermediate to Advanced',
    estimatedHours: 220,
    skills: ['Node.js / Go / Java', 'Express / Fastify / Spring', 'PostgreSQL & MongoDB', 'Redis Caching', 'gRPC & Message Queues', 'Docker & Kubernetes'],
    prerequisites: ['Basic programming', 'Understanding of client-server model'],
    status: 'High Demand',
    icon: 'Server',
    featured: true,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Server Architectures & Network Protocols',
        description: 'TCP/IP, HTTP/1.1 vs HTTP/2/3, WebSockets, gRPC, and REST.',
        estimatedHours: 55,
        subjects: [
          {
            id: 'be-sub-1',
            title: 'HTTP Protocol, REST & Asynchronous I/O',
            description: 'Headers, status codes, socket streaming, and non-blocking I/O event loops.',
            estimatedHours: 30,
            icon: 'Terminal',
            modules: [
              {
                id: 'mod-be-http',
                slug: 'network-protocols-and-http3',
                title: 'HTTP/2, HTTP/3 & Modern Web Protocols',
                description: 'Multiplexing, head-of-line blocking, QUIC protocol, and streaming sockets.',
                estimatedHours: 12,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Differentiate HTTP/1.1 pipelining vs HTTP/2 multiplexing', 'Understand UDP-based QUIC in HTTP/3'],
                resources: [
                  {
                    id: 'res-be-http-th',
                    type: 'theory',
                    title: 'From HTTP/1.0 to HTTP/3 QUIC: An Architectural Evolution',
                    description: 'How modern protocol design eliminated latency bottlenecks.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### Modern Protocols: QUIC and HTTP/3\nHTTP/3 replaces TCP with QUIC over UDP to eliminate head-of-line blocking.',
                    tags: ['Protocols', 'HTTP/3', 'Networking']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 5. Mobile Developer
  {
    title: 'Mobile Developer',
    slug: 'mobile-developer',
    description: 'Craft high-performance native and cross-platform mobile apps for iOS and Android using React Native, Flutter, Swift, or Kotlin.',
    category: 'Software & Web Development',
    difficulty: 'Intermediate',
    estimatedHours: 210,
    skills: ['React Native', 'Flutter', 'Swift / Kotlin', 'Mobile UI/UX', 'Offline-First Storage', 'App Store Deployment'],
    prerequisites: ['Basic JavaScript or OOP knowledge'],
    status: 'Active',
    icon: 'Smartphone',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Mobile UI & Cross-Platform Fundamentals',
        description: 'Mobile lifecycle, native bridges, gestures, and layout engines.',
        estimatedHours: 50,
        subjects: [
          {
            id: 'mob-sub-1',
            title: 'React Native & Flutter Core Frameworks',
            description: 'Component lifecycles, navigation stacks, and platform-specific adaptations.',
            estimatedHours: 30,
            icon: 'Smartphone',
            modules: [
              {
                id: 'mod-mob-core',
                slug: 'mobile-navigation-and-state',
                title: 'Mobile Navigation Stacks & Offline State',
                description: 'Deep linking, screen transitions, and AsyncStorage/MMKV persistence.',
                estimatedHours: 14,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Implement nested tab and stack navigators', 'Cache API data for offline availability'],
                resources: [
                  {
                    id: 'res-mob-th-1',
                    type: 'theory',
                    title: 'Mobile Architecture: Bridged vs Fabric Architecture',
                    description: 'Understanding React Native new architecture and JSI.',
                    duration: '20 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### React Native Architecture\nThe new Fabric rendering system and TurboModules eliminate asynchronous JSON serialization across the bridge.',
                    tags: ['Mobile', 'React Native']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 6. AI/ML Engineer
  {
    title: 'AI/ML Engineer',
    slug: 'ai-ml-engineer',
    description: 'Build, train, evaluate, and deploy production machine learning models, deep neural networks, and computer vision pipelines.',
    category: 'Data & Artificial Intelligence',
    difficulty: 'Intermediate to Advanced',
    estimatedHours: 280,
    skills: ['Python', 'PyTorch / TensorFlow', 'Scikit-Learn', 'Math (Linear Algebra, Calculus, Prob)', 'MLOps', 'Feature Engineering'],
    prerequisites: ['Python proficiency', 'Calculus and linear algebra fundamentals'],
    status: 'Trending',
    icon: 'Cpu',
    featured: true,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Mathematical Foundations & Data Science Stack',
        description: 'NumPy vectorization, Pandas data cleaning, and statistical inference.',
        estimatedHours: 70,
        subjects: [
          {
            id: 'ai-sub-1',
            title: 'Linear Algebra, Probability & NumPy Matrix Operations',
            description: 'Eigenvalues, dot products, gradient calculation, and tensors.',
            estimatedHours: 40,
            icon: 'Binary',
            modules: [
              {
                id: 'mod-ai-math',
                slug: 'vectorized-linear-algebra-for-ml',
                title: 'Vectorized Linear Algebra for Machine Learning',
                description: 'Matrix decomposition, dot products, and multi-dimensional tensor slicing.',
                estimatedHours: 15,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Perform matrix multiplication without loops', 'Compute eigenvalues and SVD'],
                resources: [
                  {
                    id: 'res-ai-th-1',
                    type: 'theory',
                    title: 'Matrix Factorization & Gradient Descent Calculus',
                    description: 'Deriving backpropagation from multivariable chain rules.',
                    duration: '35 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### Linear Algebra in Neural Networks\nEvery layer in a feedforward network performs affine transformations: Z = W * X + b followed by non-linear activation.',
                    tags: ['AI', 'Linear Algebra', 'PyTorch']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 7. Data Scientist
  {
    title: 'Data Scientist',
    slug: 'data-scientist',
    description: 'Extract business insights from complex data through statistical modeling, hypothesis testing, predictive analytics, and visualization.',
    category: 'Data & Artificial Intelligence',
    difficulty: 'Intermediate',
    estimatedHours: 230,
    skills: ['Python / R', 'SQL & Advanced Analytics', 'Statistical Modeling', 'Tableau / PowerBI', 'A/B Testing', 'Machine Learning'],
    prerequisites: ['Introductory statistics', 'Basic Python/SQL'],
    status: 'High Demand',
    icon: 'LineChart',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Exploratory Data Analysis & Statistical Inference',
        description: 'Distributions, hypothesis testing (p-values, z-test, t-test), and data storytelling.',
        estimatedHours: 60,
        subjects: [
          {
            id: 'ds-sub-1',
            title: 'Applied Statistics & Experimental Design',
            description: 'Confidence intervals, regression analysis, and causal inference.',
            estimatedHours: 35,
            icon: 'BarChart',
            modules: [
              {
                id: 'mod-ds-stats',
                slug: 'hypothesis-testing-and-ab-experiments',
                title: 'Hypothesis Testing & A/B Experimentation',
                description: 'Design robust experiments with sample sizing, power analysis, and statistical significance.',
                estimatedHours: 14,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Determine statistical significance', 'Avoid p-hacking and sample bias'],
                resources: [
                  {
                    id: 'res-ds-th-1',
                    type: 'theory',
                    title: 'Statistical Testing Frameworks in Tech Companies',
                    description: 'How Netflix and Uber run millions of controlled online experiments.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### A/B Testing Principles\nFormulate Null hypothesis H0 and Alternate hypothesis H1. Control type I error (alpha) and type II error (beta).',
                    tags: ['Data Science', 'Statistics', 'A/B Testing']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 8. Data Analyst
  {
    title: 'Data Analyst',
    slug: 'data-analyst',
    description: 'Turn raw datasets into actionable executive insights with advanced SQL queries, interactive dashboards, and business metrics modeling.',
    category: 'Data & Artificial Intelligence',
    difficulty: 'Beginner to Intermediate',
    estimatedHours: 180,
    skills: ['Advanced SQL (Window Functions, CTEs)', 'PowerBI / Tableau', 'Excel Modeling', 'Python (Pandas, Seaborn)', 'Business Intelligence'],
    prerequisites: ['Basic spreadsheet familiarity'],
    status: 'Popular',
    icon: 'PieChart',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Advanced SQL & Relational Querying',
        description: 'Window functions, Common Table Expressions, indexing, and data aggregation.',
        estimatedHours: 50,
        subjects: [
          {
            id: 'da-sub-1',
            title: 'Modern SQL for Analytics',
            description: 'LEAD, LAG, RANK, PARTITION BY, and complex cohort analyses.',
            estimatedHours: 30,
            icon: 'Database',
            modules: [
              {
                id: 'mod-da-sql',
                slug: 'sql-window-functions-cohort-analysis',
                title: 'SQL Window Functions & Cohort Retention',
                description: 'Write high-performance analytical queries without expensive self-joins.',
                estimatedHours: 12,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Master ROW_NUMBER(), RANK(), DENSE_RANK()', 'Calculate 30-day user retention cohorts in pure SQL'],
                resources: [
                  {
                    id: 'res-da-th-1',
                    type: 'theory',
                    title: 'Window Functions Masterclass: Mechanics and Partitions',
                    description: 'How SQL query planners execute window frames without grouping.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### SQL Window Functions\nUnlike GROUP BY which aggregates rows into a single summary row, window functions compute metrics over a set of rows while preserving individual row identity.',
                    tags: ['SQL', 'Analytics', 'Window Functions']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 9. Data Engineer
  {
    title: 'Data Engineer',
    slug: 'data-engineer',
    description: 'Architect scalable data pipelines, streaming ETL processes, distributed warehouses (Snowflake, BigQuery), and data lakehouses.',
    category: 'Data & Artificial Intelligence',
    difficulty: 'Intermediate to Advanced',
    estimatedHours: 250,
    skills: ['Apache Spark', 'Apache Kafka', 'Airflow', 'Python & Scala', 'Snowflake / Databricks', 'Data Modeling (Star Schema)'],
    prerequisites: ['SQL mastery', 'Python fundamentals', 'Database basics'],
    status: 'High Demand',
    icon: 'Network',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Distributed Data Systems & Spark',
        description: 'Hadoop ecosystem, Spark RDDs and DataFrames, and partition optimizations.',
        estimatedHours: 65,
        subjects: [
          {
            id: 'de-sub-1',
            title: 'Apache Spark & Distributed Compute',
            description: 'Catalyst optimizer, shuffle operations, memory tuning, and Delta Lake.',
            estimatedHours: 35,
            icon: 'Cpu',
            modules: [
              {
                id: 'mod-de-spark',
                slug: 'spark-dataframe-optimizations',
                title: 'Spark Partitioning & Shuffle Optimizations',
                description: 'Eliminate data skew and optimize distributed join algorithms.',
                estimatedHours: 14,
                difficulty: 'Advanced',
                order: 1,
                learningObjectives: ['Resolve broadcast hash joins vs sort-merge joins', 'Tackle OOM shuffle exceptions in PySpark'],
                resources: [
                  {
                    id: 'res-de-th-1',
                    type: 'theory',
                    title: 'Distributed Compute Internals: The Spark Catalyst Optimizer',
                    description: 'How Spark converts logical plans to optimized physical byte execution.',
                    duration: '30 mins',
                    difficulty: 'Advanced',
                    order: 1,
                    content: '### Apache Spark Internals\nSpark achieves fast in-memory execution by pipelining narrow transformations into single stages and minimizing wide shuffles.',
                    tags: ['Data Engineering', 'Spark', 'Big Data']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 10. Generative AI Engineer
  {
    title: 'Generative AI Engineer',
    slug: 'generative-ai-engineer',
    description: 'Build intelligent applications leveraging Large Language Models (LLMs), RAG pipelines, Vector Databases, and Multi-Agent Orchestration.',
    category: 'Data & Artificial Intelligence',
    difficulty: 'Intermediate to Advanced',
    estimatedHours: 220,
    skills: ['LangChain & LlamaIndex', 'Vector Databases (Pinecone, Chroma)', 'RAG Architecture', 'Prompt Engineering', 'Model Fine-Tuning (LoRA)', 'OpenAI / Anthropic APIs'],
    prerequisites: ['Python proficiency', 'API integrations', 'Basic machine learning concepts'],
    status: 'Trending',
    icon: 'Sparkles',
    featured: true,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: LLM Foundations & Embeddings',
        description: 'Transformer architecture, tokenization, embeddings, and context window mechanics.',
        estimatedHours: 50,
        subjects: [
          {
            id: 'genai-sub-1',
            title: 'Vector Embeddings & Semantic Search',
            description: 'Cosine similarity, HNSW vector indexing, and embedding models.',
            estimatedHours: 25,
            icon: 'Binary',
            modules: [
              {
                id: 'mod-genai-rag',
                slug: 'production-rag-pipelines',
                title: 'Production Retrieval Augmented Generation (RAG)',
                description: 'Build hallucination-resistant RAG systems with hybrid search, re-ranking, and chunking strategies.',
                estimatedHours: 12,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Implement semantic chunking', 'Deploy hybrid keyword + dense vector search with cross-encoders'],
                resources: [
                  {
                    id: 'res-genai-th-1',
                    type: 'theory',
                    title: 'Advanced RAG Architectures: Hybrid Search & Re-Ranking',
                    description: 'Modern architectures to overcome context limits and information loss.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### Production RAG Systems\nRAG combines retrieval over private document stores with generative generation, grounding responses in verified facts.',
                    tags: ['GenAI', 'RAG', 'LLMs', 'Vector DB']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 11. Cybersecurity
  {
    title: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Defend systems and networks from adversarial attacks through penetration testing, vulnerability assessment, cryptography, and security operations.',
    category: 'Security & Systems',
    difficulty: 'Intermediate to Advanced',
    estimatedHours: 240,
    skills: ['Network Security', 'Penetration Testing (Kali, Burp Suite)', 'Cryptography', 'OWASP Top 10', 'SIEM & SOC', 'Incident Response'],
    prerequisites: ['Networking fundamentals (TCP/IP)', 'Linux command line fluency'],
    status: 'High Demand',
    icon: 'Shield',
    featured: true,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Web Security & OWASP Top 10',
        description: 'SQLi, XSS, CSRF, SSRF, IDOR, and modern browser security headers.',
        estimatedHours: 60,
        subjects: [
          {
            id: 'sec-sub-1',
            title: 'Web Application Penetration Testing',
            description: 'Vulnerability assessment, exploit recreation, and defensive patching.',
            estimatedHours: 35,
            icon: 'ShieldAlert',
            modules: [
              {
                id: 'mod-sec-owasp',
                slug: 'owasp-top-10-vulnerabilities',
                title: 'Exploiting & Patching OWASP Top 10',
                description: 'Hands-on exploitation of SQL injection, cross-site scripting (XSS), and broken access controls.',
                estimatedHours: 15,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Execute parameterized SQL queries to eliminate SQLi', 'Implement Content Security Policy (CSP) against XSS'],
                resources: [
                  {
                    id: 'res-sec-th-1',
                    type: 'theory',
                    title: 'Anatomy of Web Vulnerabilities & Defense in Depth',
                    description: 'Comprehensive analysis of modern web attack vectors and zero-trust principles.',
                    duration: '30 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### Defense in Depth Principles\nSecurity must be layered: network perimeter, TLS termination, application firewalls, parameterization, and least-privilege IAM roles.',
                    tags: ['Cybersecurity', 'OWASP', 'PenTesting']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 12. Cloud Engineer
  {
    title: 'Cloud Engineer',
    slug: 'cloud-engineer',
    description: 'Design, configure, and maintain scalable cloud infrastructure across AWS, Azure, and Google Cloud with high availability and disaster recovery.',
    category: 'Cloud & Infrastructure',
    difficulty: 'Intermediate to Advanced',
    estimatedHours: 230,
    skills: ['AWS / Azure / GCP', 'Terraform (IaC)', 'Networking (VPC, Subnets, DNS)', 'Cloud Security (IAM)', 'Cost Optimization', 'Serverless'],
    prerequisites: ['Linux fundamentals', 'Networking basics'],
    status: 'Popular',
    icon: 'Cloud',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Cloud Foundations & Core AWS Services',
        description: 'VPC design, EC2 auto-scaling, S3 storage classes, and IAM policies.',
        estimatedHours: 55,
        subjects: [
          {
            id: 'cld-sub-1',
            title: 'Virtual Private Clouds & Cloud Architecture',
            description: 'Multi-AZ architecture, NAT gateways, route tables, and peering.',
            estimatedHours: 30,
            icon: 'Network',
            modules: [
              {
                id: 'mod-cld-vpc',
                slug: 'aws-vpc-architecture-and-security',
                title: 'Enterprise VPC Architecture & Subnetting',
                description: 'Architect isolated public and private subnet topologies with bastion hosts and NAT gateways.',
                estimatedHours: 12,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Design CIDR blocks without overlap', 'Configure Security Groups vs Network ACLs'],
                resources: [
                  {
                    id: 'res-cld-th-1',
                    type: 'theory',
                    title: 'Cloud Networking Architecture: AWS VPC Deep Dive',
                    description: 'Security groups, stateful tracking, and private link endpoints.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### AWS VPC Fundamentals\nA Virtual Private Cloud (VPC) provides a private isolated virtual network dedicated to your cloud resources.',
                    tags: ['Cloud', 'AWS', 'Networking']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 13. DevOps Engineer
  {
    title: 'DevOps Engineer',
    slug: 'devops-engineer',
    description: 'Bridge software development and IT operations through continuous integration, automated deployment pipelines, infrastructure as code, and observability.',
    category: 'Cloud & Infrastructure',
    difficulty: 'Intermediate to Advanced',
    estimatedHours: 240,
    skills: ['CI/CD (GitHub Actions, GitLab)', 'Docker & Kubernetes', 'Terraform & Ansible', 'Prometheus & Grafana', 'Bash / Python Scripting', 'GitOps'],
    prerequisites: ['Linux proficiency', 'Basic container knowledge'],
    status: 'Trending',
    icon: 'Workflow',
    featured: true,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Infrastructure as Code & CI/CD Automation',
        description: 'Declarative Terraform state, automated testing pipelines, and artifact management.',
        estimatedHours: 60,
        subjects: [
          {
            id: 'devops-sub-1',
            title: 'CI/CD Pipelines & GitHub Actions',
            description: 'Workflow triggers, secrets management, caching, and automated canary deployments.',
            estimatedHours: 35,
            icon: 'PlayCircle',
            modules: [
              {
                id: 'mod-devops-cicd',
                slug: 'github-actions-production-pipelines',
                title: 'Production CI/CD Pipelines with GitHub Actions',
                description: 'Build, test, lint, and deploy full-stack apps with zero downtime.',
                estimatedHours: 14,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Implement matrix testing across multiple Node/Python versions', 'Automate Docker build and push to container registries'],
                resources: [
                  {
                    id: 'res-dops-th-1',
                    type: 'theory',
                    title: 'Continuous Delivery Patterns & Canary Deployment Strategies',
                    description: 'Minimizing risk through automated health probes and rollback scripts.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### The DevOps Feedback Loop\nContinuous integration ensures every commit is verified by automated builds and tests before reaching staging environments.',
                    tags: ['DevOps', 'CI/CD', 'Automation']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 14. SRE (Site Reliability Engineer)
  {
    title: 'SRE',
    slug: 'sre',
    description: 'Apply software engineering practices to operations problems, ensuring maximum uptime, system resiliency, SLI/SLO adherence, and automated incident recovery.',
    category: 'Cloud & Infrastructure',
    difficulty: 'Advanced',
    estimatedHours: 230,
    skills: ['SLIs, SLOs & Error Budgets', 'Kubernetes Ops', 'Chaos Engineering', 'Distributed Tracing (OpenTelemetry)', 'Incident Response', 'Go / Python'],
    prerequisites: ['DevOps or Backend engineering background', 'Strong Linux internals'],
    status: 'In Demand',
    icon: 'Activity',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Reliability Principles & Observability',
        description: 'Google SRE book principles, metrics, distributed traces, and log aggregation.',
        estimatedHours: 55,
        subjects: [
          {
            id: 'sre-sub-1',
            title: 'SLO Engineering & Error Budget Management',
            description: 'Defining user-centric SLIs, alerting on burn rates, and blameless postmortems.',
            estimatedHours: 30,
            icon: 'BarChart',
            modules: [
              {
                id: 'mod-sre-slo',
                slug: 'sli-slo-error-budgets',
                title: 'Architecting SLIs, SLOs & Error Budgets',
                description: 'Calculate multi-window burn rate alerts to prevent alert fatigue.',
                estimatedHours: 12,
                difficulty: 'Advanced',
                order: 1,
                learningObjectives: ['Formulate Service Level Indicators', 'Calculate error budget consumption rate'],
                resources: [
                  {
                    id: 'res-sre-th-1',
                    type: 'theory',
                    title: 'The Google SRE Methodology: Error Budgets in Practice',
                    description: 'Balancing product velocity against operational reliability.',
                    duration: '30 mins',
                    difficulty: 'Advanced',
                    order: 1,
                    content: '### What is an Error Budget?\n100% uptime is the wrong target for almost every service. Error budgets quantify allowable downtime to encourage innovation.',
                    tags: ['SRE', 'SLO', 'Reliability']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 15. Network Engineer
  {
    title: 'Network Engineer',
    slug: 'network-engineer',
    description: 'Design, configure, and troubleshoot enterprise network architectures, routing protocols (BGP, OSPF), VPNs, firewalls, and software-defined networking (SDN).',
    category: 'Cloud & Infrastructure',
    difficulty: 'Intermediate',
    estimatedHours: 200,
    skills: ['Cisco CCNA / CCNP Concepts', 'BGP & OSPF Routing', 'Wireshark Packet Analysis', 'VLANs & Trunks', 'VPNs & IPsec', 'Network Automation (Python/Netmiko)'],
    prerequisites: ['Basic computer networking knowledge'],
    status: 'Active',
    icon: 'Radio',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: OSI Model & Deep Packet Inspection',
        description: 'Layer 2 to Layer 7 protocols, packet dissection in Wireshark, and subnet calculation.',
        estimatedHours: 50,
        subjects: [
          {
            id: 'net-sub-1',
            title: 'IP Routing & Packet Analysis with Wireshark',
            description: 'Three-way handshakes, ARP resolution, TCP windowing, and congestion control.',
            estimatedHours: 28,
            icon: 'Terminal',
            modules: [
              {
                id: 'mod-net-packet',
                slug: 'tcp-handshake-packet-analysis',
                title: 'TCP Handshake & Wireshark Diagnostics',
                description: 'Trace SYN, SYN-ACK, ACK packets and diagnose latency, packet drops, and retransmissions.',
                estimatedHours: 12,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Decode raw pcap files', 'Identify TCP window exhaustion'],
                resources: [
                  {
                    id: 'res-net-th-1',
                    type: 'theory',
                    title: 'TCP Protocol Internals: Congestion Control & Flow Control',
                    description: 'Slow start, AIMD, sliding windows, and modern BBR congestion algorithms.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### TCP Reliability Mechanisms\nTCP guarantees ordered, error-checked delivery of a stream of octets through sequence numbering and ACKs.',
                    tags: ['Networking', 'TCP/IP', 'Wireshark']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 16. QA Engineer
  {
    title: 'QA Engineer',
    slug: 'qa-engineer',
    description: 'Ensure software quality, reliability, and standards compliance through manual testing methodologies, test cases, regression testing, and defect tracking.',
    category: 'Quality & Testing',
    difficulty: 'Beginner to Intermediate',
    estimatedHours: 160,
    skills: ['Test Plan Authoring', 'Functional & Regression Testing', 'Jira & TestRail', 'API Testing (Postman)', 'Boundary Value Analysis', 'Agile QA Workflows'],
    prerequisites: ['Attention to detail', 'Basic web knowledge'],
    status: 'Active',
    icon: 'CheckSquare',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Software Testing Methodologies & Test Planning',
        description: 'Black-box testing, equivalence partitioning, boundary value analysis, and bug lifecycle.',
        estimatedHours: 40,
        subjects: [
          {
            id: 'qa-sub-1',
            title: 'Test Design Techniques & Defect Reporting',
            description: 'Writing high-quality bug reports with reproducible steps and severity classification.',
            estimatedHours: 22,
            icon: 'CheckCircle',
            modules: [
              {
                id: 'mod-qa-testplan',
                slug: 'test-case-design-and-boundary-values',
                title: 'Test Case Design & Boundary Value Analysis',
                description: 'Systematically uncover software defects using boundary value testing and equivalence classes.',
                estimatedHours: 10,
                difficulty: 'Beginner',
                order: 1,
                learningObjectives: ['Draft test matrices for web apps', 'Perform equivalence partitioning on input fields'],
                resources: [
                  {
                    id: 'res-qa-th-1',
                    type: 'theory',
                    title: 'Modern QA Principles: Verification vs Validation',
                    description: 'Core testing paradigms across the Software Development Life Cycle (SDLC).',
                    duration: '20 mins',
                    difficulty: 'Beginner',
                    order: 1,
                    content: '### The Defect Lifecycle\nFrom New -> Assigned -> Open -> Fixed -> Pending Retest -> Verified -> Closed.',
                    tags: ['QA', 'Testing', 'Test Cases']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 17. Automation Test Engineer
  {
    title: 'Automation Test Engineer',
    slug: 'automation-test-engineer',
    description: 'Build automated end-to-end testing suites, API test harnesses, and CI performance regression tests using Playwright, Cypress, Selenium, and Jest.',
    category: 'Quality & Testing',
    difficulty: 'Intermediate',
    estimatedHours: 200,
    skills: ['Playwright', 'Cypress', 'Selenium WebDriver', 'JavaScript / TypeScript / Python', 'Postman / Newman API Testing', 'CI/CD Test Integration'],
    prerequisites: ['Basic JavaScript or Python', 'Basic understanding of HTML/CSS DOM'],
    status: 'Popular',
    icon: 'Repeat',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: End-to-End Test Automation with Playwright',
        description: 'Page Object Model, locators, auto-waiting, visual regression, and parallel workers.',
        estimatedHours: 50,
        subjects: [
          {
            id: 'auto-sub-1',
            title: 'Modern E2E Testing with Playwright & TypeScript',
            description: 'Resilient tests without arbitrary sleep statements, mock networks, and headless CI.',
            estimatedHours: 30,
            icon: 'Play',
            modules: [
              {
                id: 'mod-auto-playwright',
                slug: 'playwright-page-object-model',
                title: 'Playwright Page Object Model & Flakiness Elimination',
                description: 'Build enterprise-grade test automation architectures with clean abstraction layers.',
                estimatedHours: 12,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Implement Page Object Model (POM)', 'Mock API responses inside Playwright tests'],
                resources: [
                  {
                    id: 'res-auto-th-1',
                    type: 'theory',
                    title: 'Eliminating Test Flakiness: Auto-Waiting and Locator Strategies',
                    description: 'Why modern locator engines outperform legacy Selenium XPath selectors.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### Playwright Auto-Waiting\nPlaywright checks for actionability (visible, stable, enabled, editable) before executing user interactions.',
                    tags: ['Automation', 'Playwright', 'E2E Testing']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 18. Database Engineer / DBA
  {
    title: 'Database Engineer / DBA',
    slug: 'database-engineer',
    description: 'Ensure mission-critical database availability, consistency, transaction durability (ACID), replication, backups, query tuning, and schema governance.',
    category: 'Quality & Testing',
    difficulty: 'Intermediate to Advanced',
    estimatedHours: 220,
    skills: ['PostgreSQL & MySQL', 'MongoDB Internals', 'Transaction Isolation Levels', 'Query Optimization & EXPLAIN', 'Replication & Failover (WAL, Patroni)', 'Backup & Disaster Recovery'],
    prerequisites: ['SQL proficiency', 'Relational database basics'],
    status: 'Active',
    icon: 'Database',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Database Engine Internals & ACID Transactions',
        description: 'Write-Ahead Logging (WAL), MVCC (Multi-Version Concurrency Control), and isolation anomalies.',
        estimatedHours: 60,
        subjects: [
          {
            id: 'dba-sub-1',
            title: 'Transaction Isolation & Concurrency Anomalies',
            description: 'Dirty reads, non-repeatable reads, phantom reads, and serializable snapshot isolation.',
            estimatedHours: 35,
            icon: 'Database',
            modules: [
              {
                id: 'mod-dba-isolation',
                slug: 'transaction-isolation-and-mvcc',
                title: 'ACID Isolation Levels & Postgres MVCC',
                description: 'Master how relational databases prevent data corruption during massive parallel writes.',
                estimatedHours: 14,
                difficulty: 'Advanced',
                order: 1,
                learningObjectives: ['Diagnose deadlocks with pg_stat_activity', 'Select proper isolation level for financial transactions'],
                resources: [
                  {
                    id: 'res-dba-th-1',
                    type: 'theory',
                    title: 'Inside PostgreSQL MVCC: Tuples, Vacuuming, and WAL',
                    description: 'How Postgres updates records without locking read transactions.',
                    duration: '30 mins',
                    difficulty: 'Advanced',
                    order: 1,
                    content: '### MVCC Architecture\nIn MVCC, each update creates a new version of the row tuple with xmin and xmax transaction IDs.',
                    tags: ['Database', 'Postgres', 'DBA', 'ACID']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 19. UI/UX Designer
  {
    title: 'UI/UX Designer',
    slug: 'ui-ux-designer',
    description: 'Design intuitive, accessible, and aesthetically breathtaking digital user experiences through user research, wireframing, design systems, and Figma prototyping.',
    category: 'Design & Product',
    difficulty: 'Beginner to Intermediate',
    estimatedHours: 190,
    skills: ['Figma Mastery', 'Design Systems & Tokens', 'Wireframing & Prototyping', 'User Research & Personas', 'Accessibility (WCAG)', 'Micro-Interactions'],
    prerequisites: ['Creative inclination', 'Empathy for user friction points'],
    status: 'Popular',
    icon: 'Palette',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Design Systems, Typography & Color Harmony',
        description: 'Atomic design, token architectures, 8pt spatial grid, and accessible color contrast.',
        estimatedHours: 45,
        subjects: [
          {
            id: 'ui-sub-1',
            title: 'Design Tokens & Scalable Figma Components',
            description: 'Auto-layout, component variants, interactive components, and token handoff.',
            estimatedHours: 25,
            icon: 'Figma',
            modules: [
              {
                id: 'mod-ui-tokens',
                slug: 'figma-auto-layout-and-design-tokens',
                title: 'Figma Auto-Layout & Design Tokens Architecture',
                description: 'Build enterprise design libraries with synchronized light/dark mode variables.',
                estimatedHours: 12,
                difficulty: 'Beginner',
                order: 1,
                learningObjectives: ['Construct responsive layouts in Figma', 'Organize color and typography semantic tokens'],
                resources: [
                  {
                    id: 'res-ui-th-1',
                    type: 'theory',
                    title: 'The Modern Design Token Specification',
                    description: 'Bridging the design-to-engineering handoff with design tokens.',
                    duration: '20 mins',
                    difficulty: 'Beginner',
                    order: 1,
                    content: '### Design Tokens Architecture\nTokens store visual design attributes (colors, radius, spacing) as reusable JSON variables for both Figma and CSS.',
                    tags: ['Design', 'UI/UX', 'Figma']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 20. Embedded Systems Engineer
  {
    title: 'Embedded Systems Engineer',
    slug: 'embedded-systems-engineer',
    description: 'Program resource-constrained microcontrollers (ARM Cortex, ESP32, STM32) using Bare-Metal C, C++, and RTOS for firmware and robotics.',
    category: 'Systems & Hardware',
    difficulty: 'Intermediate to Advanced',
    estimatedHours: 240,
    skills: ['Embedded C & Modern C++', 'ARM Cortex-M Architecture', 'FreeRTOS', 'Hardware Protocols (I2C, SPI, UART, CAN)', 'Oscilloscopes & Logic Analyzers', 'Memory Optimization'],
    prerequisites: ['C programming', 'Basic digital electronics and circuit fundamentals'],
    status: 'In Demand',
    icon: 'Cpu',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Bare-Metal C & Hardware Communication Protocols',
        description: 'Memory-mapped I/O, bitwise register manipulation, interrupts, and serial protocols.',
        estimatedHours: 60,
        subjects: [
          {
            id: 'emb-sub-1',
            title: 'I2C, SPI & UART Protocol Drivers',
            description: 'Clock polarity, phase, master-slave addressing, and DMA data transfer.',
            estimatedHours: 35,
            icon: 'Terminal',
            modules: [
              {
                id: 'mod-emb-spi',
                slug: 'spi-i2c-hardware-drivers',
                title: 'Writing Bare-Metal SPI & I2C Drivers in C',
                description: 'Direct register manipulation without heavy vendor HAL overhead.',
                estimatedHours: 15,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Configure clock prescalers', 'Write interrupt service routines (ISRs) with volatile flags'],
                resources: [
                  {
                    id: 'res-emb-th-1',
                    type: 'theory',
                    title: 'Embedded Memory Architectures: Flash vs SRAM',
                    description: 'Stack and heap memory safety on constrained 32KB microcontrollers.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### Volatile Keyword in Embedded C\nDeclaring hardware registers as volatile tells the compiler never to optimize away memory reads.',
                    tags: ['Embedded', 'Firmware', 'C']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 21. IoT Engineer
  {
    title: 'IoT Engineer',
    slug: 'iot-engineer',
    description: 'Connect smart physical devices to cloud telemetry platforms using lightweight IoT protocols (MQTT, CoAP), edge computing, and sensors.',
    category: 'Systems & Hardware',
    difficulty: 'Intermediate',
    estimatedHours: 210,
    skills: ['MQTT & CoAP Protocols', 'ESP32 / Raspberry Pi', 'AWS IoT Core / Azure IoT', 'Sensor Interfacing', 'Edge ML (TinyML)', 'Device Security'],
    prerequisites: ['Basic electronics and Python/C programming'],
    status: 'Active',
    icon: 'Radio',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Telemetry Protocols & Cloud IoT Broker Ingestion',
        description: 'MQTT QoS levels, TLS mutual authentication, pub/sub topics, and low-power sleep modes.',
        estimatedHours: 50,
        subjects: [
          {
            id: 'iot-sub-1',
            title: 'MQTT Protocol & Secure Device Provisioning',
            description: 'Publish/subscribe patterns, Keep-Alive ping, and broker architectures (Mosquitto, EMQX).',
            estimatedHours: 28,
            icon: 'Network',
            modules: [
              {
                id: 'mod-iot-mqtt',
                slug: 'mqtt-telemetry-and-qos-levels',
                title: 'MQTT Telemetry Streams & QoS Delivery Guarantees',
                description: 'Implement resilient sensor telemetry with QoS 0, 1, and 2 under intermittent cellular connections.',
                estimatedHours: 12,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Differentiate QoS 0, 1, and 2', 'Implement Last Will and Testament (LWT) message'],
                resources: [
                  {
                    id: 'res-iot-th-1',
                    type: 'theory',
                    title: 'IoT Protocols: Why MQTT Outperforms HTTP for Connected Devices',
                    description: 'Binary packet efficiency and persistent bidirectional socket keeping.',
                    duration: '20 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### MQTT Efficiency\nMQTT has a minimal 2-byte header, making it ideal for satellite and constrained battery-powered devices.',
                    tags: ['IoT', 'MQTT', 'Sensors']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 22. Blockchain/Web3 Developer
  {
    title: 'Blockchain/Web3 Developer',
    slug: 'blockchain-web3-developer',
    description: 'Develop decentralized applications (dApps), secure smart contracts in Solidity, and interact with EVM blockchains via Ethers.js and Viem.',
    category: 'Web3 & Emerging',
    difficulty: 'Intermediate to Advanced',
    estimatedHours: 220,
    skills: ['Solidity', 'EVM Internals & Gas Optimization', 'Hardhat & Foundry', 'Ethers.js / Viem', 'DeFi & NFT Standards (ERC-20, ERC-721)', 'Smart Contract Security'],
    prerequisites: ['JavaScript proficiency', 'Basic cryptography understanding'],
    status: 'Active',
    icon: 'Boxes',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Smart Contract Engineering & EVM Fundamentals',
        description: 'Solidity syntax, storage vs memory, reentrancy guards, and unit testing with Foundry.',
        estimatedHours: 60,
        subjects: [
          {
            id: 'web3-sub-1',
            title: 'Solidity & EVM Gas Optimization',
            description: 'Storage slot packing, opcode gas costs, and custom errors.',
            estimatedHours: 35,
            icon: 'Code',
            modules: [
              {
                id: 'mod-web3-solidity',
                slug: 'solidity-smart-contracts-and-security',
                title: 'Solidity Smart Contracts & Reentrancy Defenses',
                description: 'Write hardened ERC-20 token contracts with OpenZeppelin and prevent reentrancy exploits.',
                estimatedHours: 14,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Implement Checks-Effects-Interactions pattern', 'Optimize storage variable layouts to save gas'],
                resources: [
                  {
                    id: 'res-web3-th-1',
                    type: 'theory',
                    title: 'The Ethereum Virtual Machine (EVM) Execution Model',
                    description: 'Stack machine architecture, bytecode execution, and gas economics.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### Checks-Effects-Interactions Pattern\nAlways update internal contract balances before performing external transfers to prevent reentrancy attacks.',
                    tags: ['Web3', 'Blockchain', 'Solidity']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // 23. Game Developer
  {
    title: 'Game Developer',
    slug: 'game-developer',
    description: 'Build 2D and 3D games with physics, particle engines, shaders, and AI behaviors using Unity (C#) or Unreal Engine (C++).',
    category: 'Software & Web Development',
    difficulty: 'Intermediate to Advanced',
    estimatedHours: 250,
    skills: ['Unity (C#) or Unreal Engine (C++)', '3D Math (Vectors, Quaternions, Matrices)', 'Shader Programming (HLSL/GLSL)', 'Game Physics Engines', 'Game Loop Architecture', 'Animation Systems'],
    prerequisites: ['C# or C++ basics', 'Trigonometry and vector geometry'],
    status: 'Active',
    icon: 'Gamepad2',
    featured: false,
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Game Loop Mechanics & 3D Math',
        description: 'FixedUpdate vs Update, delta time, dot/cross products, and quaternion rotations.',
        estimatedHours: 60,
        subjects: [
          {
            id: 'game-sub-1',
            title: 'Vectors, Quaternions & Physics Simulation',
            description: 'Raycasting, rigid bodies, collision layers, and kinematic calculations.',
            estimatedHours: 35,
            icon: 'Play',
            modules: [
              {
                id: 'mod-game-math',
                slug: '3d-vector-math-and-game-loops',
                title: '3D Vector Mathematics & Frame-Rate Independence',
                description: 'Implement smooth camera follows and predictive trajectory calculations using linear interpolation (Lerp).',
                estimatedHours: 14,
                difficulty: 'Intermediate',
                order: 1,
                learningObjectives: ['Master Vector3.Dot and Vector3.Cross in gameplay', 'Prevent gimbal lock using Quaternions'],
                resources: [
                  {
                    id: 'res-game-th-1',
                    type: 'theory',
                    title: 'The Architecture of Modern Game Loops',
                    description: 'Separating input processing, physics ticks, and rendering frames.',
                    duration: '25 mins',
                    difficulty: 'Intermediate',
                    order: 1,
                    content: '### Frame-Rate Independence\nAlways multiply positional movement by Time.deltaTime so speed remains constant regardless of 60fps or 144fps monitors.',
                    tags: ['GameDev', 'Unity', 'Physics']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export default CAREERS_SEED;
