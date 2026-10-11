/**
 * CareerOS — Content Engine Seed Resources (Day 8)
 * 
 * Realistic, structured learning resources covering:
 * - Theory (markdown with code and architectural explanations)
 * - Videos (embeddable YouTube educational resources with valid IDs)
 * - Notes & Cheatsheets (mental models, summaries)
 * - Quizzes (multi-question assessments with explanations)
 * - PYQs (real interview questions from top tech companies)
 * - Practice Challenges (interactive coding tasks with hints and solutions)
 * - Mini Projects (complete project specs with user stories and requirements)
 */

export const RESOURCES_SEED = [
  // =========================================================================
  // TOPIC/MODULE: JavaScript Core & Execution Context (full-stack-developer)
  // =========================================================================
  {
    title: 'JavaScript Execution Context & Memory Lifecycle',
    slug: 'js-execution-context-memory-lifecycle',
    type: 'theory',
    description: 'In-depth conceptual breakdown of how the V8 engine compiles and executes JavaScript code across creation and execution phases.',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Execution Context',
    duration: '25 mins',
    durationMinutes: 25,
    difficulty: 'Beginner',
    language: 'English',
    tags: ['JavaScript', 'V8', 'Memory', 'Execution Context'],
    order: 1,
    status: 'published',
    source: 'CareerOS Academy',
    sourceUrl: 'https://careeros.dev/content/js-execution-context',
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
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'
  },
  {
    title: 'Lexical Environment & Closure Mechanics',
    slug: 'lexical-environment-closure-mechanics',
    type: 'theory',
    description: 'Deep dive into scope chains, lexical scoping rules, and memory management in closures.',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Closures & Scopes',
    duration: '20 mins',
    durationMinutes: 20,
    difficulty: 'Intermediate',
    language: 'English',
    tags: ['JavaScript', 'Closures', 'Scope Chain'],
    order: 2,
    status: 'published',
    source: 'CareerOS Academy',
    sourceUrl: 'https://careeros.dev/content/closures-mechanics',
    content: `### Lexical Scope and Closure Mechanics

Every execution context in JavaScript contains a reference to its **Outer Lexical Environment**.

#### 1. Scope Chaining
When the JavaScript engine encounters a variable identifier:
1. It first checks the current Local Execution Context.
2. If not found, it traverses up the outer lexical environment reference.
3. This process continues up to the Global Scope.
4. If still unresolved, it throws a \`ReferenceError\`.

#### 2. Practical Use Cases of Closures
- **Data Privacy & Encapsulation**: Emulating private variables before ES private class fields.
- **Factory Functions**: Producing configured instances without class inheritance overhead.
- **Currying & Partial Application**: Pre-configuring arguments for reusable utility functions.`
  },
  {
    title: 'What the heck is the event loop anyway? - Philip Roberts',
    slug: 'js-event-loop-visualized-jsconf',
    type: 'video',
    description: 'The definitive visual explanation of the JavaScript call stack, browser Web APIs, callback queue, and the event loop.',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Event Loop',
    duration: '22:15',
    durationMinutes: 22,
    difficulty: 'Intermediate',
    language: 'English',
    tags: ['JavaScript', 'Event Loop', 'JSConf', 'Concurrency'],
    order: 3,
    status: 'published',
    source: 'JSConf',
    sourceUrl: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
    embedUrl: 'https://www.youtube-nocookie.com/embed/8aGhZQkoFbQ',
    thumbnail: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=600&auto=format&fit=crop&q=80',
    videoMetadata: {
      platform: 'youtube',
      videoId: '8aGhZQkoFbQ',
      channel: 'JSConf',
      duration: '22:15',
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=600&auto=format&fit=crop&q=80',
      topic: 'Event Loop & Call Stack',
      difficulty: 'Intermediate',
      approvalState: 'published',
      displayOrder: 1
    }
  },
  {
    title: 'Closures in JavaScript Explained with Examples',
    slug: 'closures-in-javascript-akshay-saini',
    type: 'video',
    description: 'Master closures with practical examples, memory snapshots, and interview traps.',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Closures',
    duration: '18:40',
    durationMinutes: 19,
    difficulty: 'Beginner',
    language: 'English',
    tags: ['JavaScript', 'Closures', 'Namaste JS', 'Tutorial'],
    order: 4,
    status: 'published',
    source: 'Namaste JavaScript',
    sourceUrl: 'https://www.youtube.com/watch?v=qikxEIxsXco',
    embedUrl: 'https://www.youtube-nocookie.com/embed/qikxEIxsXco',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    videoMetadata: {
      platform: 'youtube',
      videoId: 'qikxEIxsXco',
      channel: 'Akshay Saini',
      duration: '18:40',
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      topic: 'Closures & Lexical Scope',
      difficulty: 'Beginner',
      approvalState: 'published',
      displayOrder: 2
    }
  },
  {
    title: 'JavaScript Closures & Scope Cheatsheet',
    slug: 'js-closures-scope-cheatsheet',
    type: 'notes',
    description: 'Executive summary of lexical scoping, TDZ gotchas, and memory leak prevention patterns.',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Summary & Notes',
    duration: '15 mins',
    durationMinutes: 15,
    difficulty: 'Beginner',
    language: 'English',
    tags: ['Notes', 'Cheatsheet', 'Closures'],
    order: 5,
    status: 'published',
    source: 'CareerOS Academy',
    sourceUrl: 'https://careeros.dev/notes/js-closures',
    content: `### Essential Takeaways & Mental Models:
- **Lexical Scoping**: Scope is determined by the physical location of code at compile time, not where it is called.
- **Closures**: Inner functions hold references to outer variables, preventing garbage collection even after the outer function finishes execution.
- **TDZ (Temporal Dead Zone)**: Accessing \`let\` or \`const\` before declaration throws a \`ReferenceError\`.
- **Memory Gotcha**: Unintentionally retaining DOM references inside closures can cause memory leaks in single-page applications. Always clean up listeners in component unmounts.`
  },
  {
    title: 'Core JavaScript Execution Assessment',
    slug: 'core-js-execution-assessment',
    type: 'quiz',
    description: 'Interactive multiple choice assessment testing understanding of closures, scope, and the temporal dead zone.',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Assessment',
    duration: '10 mins',
    durationMinutes: 10,
    difficulty: 'Intermediate',
    language: 'English',
    tags: ['Quiz', 'Assessment', 'JavaScript'],
    order: 6,
    status: 'published',
    source: 'CareerOS Assessment Engine',
    quizMetadata: {
      questionCount: 3,
      estimatedMinutes: 10,
      questions: [
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
      ]
    }
  },
  {
    title: 'Top Frontend Interview PYQs: JavaScript Runtimes',
    slug: 'top-frontend-interview-pyqs-js-runtimes',
    type: 'pyq',
    description: 'Actual questions asked at Google, Amazon, Microsoft, and Uber in frontend software engineering rounds.',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Interview Questions',
    duration: '20 mins',
    durationMinutes: 20,
    difficulty: 'Intermediate',
    language: 'English',
    tags: ['PYQ', 'Interview', 'Amazon', 'Google'],
    order: 7,
    status: 'published',
    source: 'CareerOS Interview Database',
    pyqMetadata: {
      company: 'Amazon & Google',
      role: 'Frontend / Full Stack Engineer',
      examYear: '2024–2025',
      frequency: 'Very High',
      items: [
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
      ]
    }
  },
  {
    title: 'Hands-on Challenge: Build a Memoize Utility',
    slug: 'hands-on-challenge-memoize-utility',
    type: 'practice',
    description: 'Implement a production-grade memoize function using closures and a Map cache.',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Practice',
    duration: '30 mins',
    durationMinutes: 30,
    difficulty: 'Intermediate',
    language: 'English',
    tags: ['Practice', 'Coding', 'Memoization'],
    order: 8,
    status: 'published',
    source: 'CareerOS Code Sandbox',
    practiceMetadata: {
      problemStatement: 'Write a higher-order function `memoize(fn)` that caches results based on arguments stringified. Subsequent calls with identical arguments must return the cached output without re-evaluating the expensive function.',
      instructions: [
        'Handle multiple arguments of any primitive type',
        'Use Map or plain Object for O(1) lookups',
        'Return the exact result of the original computation'
      ],
      hints: [
        'Use JSON.stringify(args) as the cache key',
        'Check cache.has(key) before computing'
      ],
      starterCode: `function memoize(fn) {\n  const cache = new Map();\n  return function(...args) {\n    // Write your code here\n  };\n}`,
      solutionCode: `function memoize(fn) {\n  const cache = new Map();\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) {\n      return cache.get(key);\n    }\n    const result = fn.apply(this, args);\n    cache.set(key, result);\n    return result;\n  };\n}`,
      testCases: [
        { input: 'add(2, 3) -> 5', expectedOutput: '5 (evaluated once, cached thereafter)' }
      ]
    }
  },
  {
    title: 'Mini Project: Interactive State-Driven Event Bus',
    slug: 'mini-project-interactive-event-bus',
    type: 'project',
    description: 'Architect a lightweight Publish/Subscribe event emitter with unsubscribe tokens and topic filtering.',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Mini Project',
    duration: '45 mins',
    durationMinutes: 45,
    difficulty: 'Intermediate',
    language: 'English',
    tags: ['Project', 'Architecture', 'Mini-Project', 'EventEmitter'],
    order: 9,
    status: 'published',
    source: 'CareerOS Labs',
    projectMetadata: {
      title: 'Custom Event Emitter Library',
      overview: 'Build an event emitter class supporting .on(event, handler), .emit(event, ...args), .once(event, handler), and .off(event, handler).',
      features: [
        'Support multiple concurrent listeners per topic',
        'Return an unsubscribe closure token directly from .on()',
        'Implement .once() which auto-deregisters after the first trigger',
        'Zero external runtime dependencies'
      ],
      techStack: ['Vanilla JavaScript', 'ES6 Classes', 'Node.js or Browser runtime'],
      difficulty: 'Intermediate',
      estimatedHours: 1
    }
  },

  // =========================================================================
  // ADDITIONAL SAMPLES TO DEMONSTRATE EXTENSIBILITY ACROSS CAREERS
  // =========================================================================
  {
    title: 'Asynchronous Architecture: Promises & Async/Await',
    slug: 'async-architecture-promises-async-await',
    type: 'theory',
    description: 'Deep architectural dive into microtasks, unhandled rejections, and retry wrappers.',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'asynchronous-javascript',
    topic: 'Promises',
    duration: '30 mins',
    durationMinutes: 30,
    difficulty: 'Intermediate',
    language: 'English',
    tags: ['Async', 'Promises', 'Concurrency'],
    order: 1,
    status: 'published',
    source: 'CareerOS Academy',
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
\`\`\``
  },
  {
    title: 'Mastering Promise Combinators in Modern Web Apps',
    slug: 'mastering-promise-combinators-web-apps',
    type: 'video',
    description: 'When and why to use Promise.all, Promise.race, Promise.allSettled, and Promise.any.',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'asynchronous-javascript',
    topic: 'Promise Combinators',
    duration: '18:40',
    durationMinutes: 19,
    difficulty: 'Intermediate',
    language: 'English',
    tags: ['Video', 'Promises', 'WebDevSimplified'],
    order: 2,
    status: 'published',
    source: 'Web Dev Simplified',
    sourceUrl: 'https://www.youtube.com/watch?v=vn3tm0quoqE',
    embedUrl: 'https://www.youtube-nocookie.com/embed/vn3tm0quoqE',
    thumbnail: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=600&auto=format&fit=crop&q=80',
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
      displayOrder: 1
    }
  },
  {
    title: 'Anatomy of Web Vulnerabilities & Defense in Depth',
    slug: 'anatomy-of-web-vulnerabilities-defense-in-depth',
    type: 'theory',
    description: 'Comprehensive analysis of modern web attack vectors and zero-trust principles for cybersecurity engineering.',
    career: 'cybersecurity',
    phase: 1,
    subject: 'Web Application Penetration Testing',
    module: 'owasp-top-10-vulnerabilities',
    topic: 'Web Security',
    duration: '30 mins',
    durationMinutes: 30,
    difficulty: 'Intermediate',
    language: 'English',
    tags: ['Cybersecurity', 'OWASP', 'PenTesting'],
    order: 1,
    status: 'published',
    source: 'CareerOS Cyber Security Lab',
    content: `### Defense in Depth Principles
Security must be layered: network perimeter, TLS termination, application firewalls, parameterization, and least-privilege IAM roles.`
  }
];

export default RESOURCES_SEED;
