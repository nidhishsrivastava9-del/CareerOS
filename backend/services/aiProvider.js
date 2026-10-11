/**
 * CareerOS — AI Provider Abstraction (Day 9)
 * 
 * Pluggable AI provider interface supporting:
 * 1. MockAiProvider (Zero-dependency local dev mode with CareerOS-aware responses)
 * 2. GeminiAiProvider (Google Gemini API via standard REST endpoint)
 * 3. OpenAiProvider (OpenAI-compatible chat completion provider)
 */

const DEFAULT_TIMEOUT_MS = 20000;

/**
 * Intelligent Mock Provider for Local Development & Testing
 * Adapts responses dynamically using authenticated student context.
 */
export class MockAiProvider {
  constructor(config = {}) {
    this.name = 'mock';
    this.model = config.model || 'careeros-mock-v1';
  }

  async generateResponse({ messages = [], systemPrompt = '', userContext = {}, options = {} }) {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    const query = lastUserMessage.toLowerCase();

    const studentName = userContext.student?.name || 'Learner';
    const careerTitle = userContext.career?.title || 'Full Stack Developer';
    const currentModule = userContext.module?.title || 'JavaScript Core';
    const progressPercent = userContext.progress?.overallPercentage ?? 0;
    const weakSkills = userContext.weakAreas?.skills || [];
    const weakDsa = userContext.weakAreas?.dsa || [];
    const diagnostics = userContext.assessmentDiagnostics;
    const recommendations = userContext.recommendations || [];

    // Simulate minor asynchronous response latency (300ms)
    await new Promise(r => setTimeout(r, 300));

    const retrieved = userContext.retrievedKnowledge || [];
    const isGrounded = Boolean(userContext.isGrounded && retrieved.length > 0);
    const topSource = retrieved[0];

    // Grounding prefix if retrieved CareerOS knowledge exists
    const groundingHeader = isGrounded && topSource
      ? `*Based on CareerOS learning material: **${topSource.title}** (${topSource.sourceType.toUpperCase()})*\n\n`
      : '';

    // Non-grounded Fallback notice if query did not match any CareerOS material
    const fallbackNotice = !isGrounded
      ? `> **Note**: CareerOS does not currently have a matching learning resource for this question in **${currentModule}** (${careerTitle}). Here is a general engineering explanation:\n\n`
      : '';

    // A1. JavaScript Functions (Day 10 Real Content Test)
    if (query.includes('function') && !query.includes('weak') && !query.includes('practice')) {
      const functionAnswer = isGrounded
        ? `${groundingHeader}### Understanding JavaScript Functions

Hello **${studentName}**! In CareerOS **${currentModule}**, JavaScript functions are fundamental reusable blocks of code that create their own execution context and manage their own local scope.

#### Core Function Properties in JavaScript:
1. **First-Class Citizens**: Functions can be assigned to variables, passed as arguments to other functions, and returned from other functions.
2. **Execution Context**: When invoked, a function creates a new Local Execution Context with its own memory allocation and scope chain.
3. **Lexical Scoping**: Inner functions maintain access to the outer lexical environment where they were authored, forming the basis of closures.

\`\`\`javascript
// Example: First-class function factory
function createMultiplier(multiplier) {
  return function(value) {
    return value * multiplier;
  };
}

const double = createMultiplier(2);
console.log(double(10)); // 20
\`\`\`

Would you like to explore how functions manage memory or test this with a practice challenge?`
        : `${fallbackNotice}### JavaScript Functions (General Overview)

A JavaScript function is a block of code designed to perform a particular task when invoked. It executes within the JavaScript runtime execution stack.`;

      return {
        content: functionAnswer,
        provider: 'mock',
        model: this.model
      };
    }

    // A2. Specific Topics (e.g., closures, event loop)
    if (query.includes('closure')) {
      return {
        content: `${groundingHeader}### Understanding JavaScript Closures

Hello **${studentName}**! Since you're studying **${careerTitle}** (currently in **${currentModule}** with ${progressPercent}% progress), here is a tailored explanation of closures:

#### What is a Closure?
A **closure** is created when a function is bundled together with references to its surrounding lexical environment. In simple terms: **an inner function always remembers and has access to the variables of its outer function, even after the outer function has finished executing.**

\`\`\`javascript
function createGreeting(greeting) {
  // 'greeting' is captured inside the returned closure
  return function(name) {
    return \`\${greeting}, \${name}!\`;
  };
}

const sayHello = createGreeting('Hello');
console.log(sayHello('${studentName}')); // "Hello, ${studentName}!"
\`\`\`

#### Key Mental Model:
- **Memory Preservation**: The JavaScript engine will *not* garbage collect the outer variable because the inner function still holds a reference to it.
- **Common Real-World Uses**: Data encapsulation (private variables), function factories, and event handler state.

Would you like a practice challenge on this topic or shall we look at a common closure bug?`,
        provider: 'mock',
        model: this.model
      };
    }

    if (query.includes('event loop')) {
      return {
        content: `${groundingHeader}### The JavaScript Event Loop & Concurrency

Great question, **${studentName}**! At this stage in your **${careerTitle}** roadmap, understanding the runtime concurrency model is essential.

#### Core Components:
1. **Call Stack**: Executes instructions synchronously (LIFO - Last In, First Out).
2. **Web APIs**: Browser threads handling asynchronous work (e.g. \`setTimeout\`, \`fetch\`, DOM events).
3. **Microtask Queue**: High priority queue (Promises: \`.then\`, \`queueMicrotask\`).
4. **Macrotask Queue**: Standard callback queue (\`setTimeout\`, \`setInterval\`, I/O).

#### The Golden Rule:
> **The Call Stack must be completely empty before the Event Loop runs all Microtasks, followed by the next Macrotask.**

\`\`\`javascript
console.log('1. Start'); // Synchronous

setTimeout(() => console.log('2. Timeout'), 0); // Macrotask

Promise.resolve().then(() => console.log('3. Promise')); // Microtask

console.log('4. End'); // Synchronous

// Output Order: 1, 4, 3, 2
\`\`\`

Let me know if you would like to test your understanding with a short quiz!`,
        provider: 'mock',
        model: this.model
      };
    }

    // A3. Explicit Fallback for Out-of-Syllabus / Unindexed queries
    if (!isGrounded && (query.includes('quantum') || query.includes('firewall') || query.includes('cyber') || query.includes('pentest') || query.includes('astronomy'))) {
      return {
        content: `${fallbackNotice}### Conceptual Explanation: ${lastUserMessage}

While this topic is outside your current **${careerTitle}** enrolled curriculum in CareerOS, here is a foundational overview:

1. **Foundational Concept**: This discipline addresses specialized architectural problems outside web application development.
2. **Next Step**: To maintain optimal momentum toward your career milestones, we recommend focusing on your active module: **${currentModule}**.`,
        provider: 'mock',
        model: this.model
      };
    }

    if (query.includes('explain') || query.includes('what is') || query.includes('how does') || query.includes('show me')) {
      return {
        content: `${groundingHeader}### Conceptual Explanation: ${lastUserMessage}

Hello **${studentName}**! Here is an explanation tailored to your current focus in **${currentModule}** (${careerTitle}):

1. **Fundamental Principle**: Break the concept into its building blocks before looking at the syntax.
2. **How It Works**: Modern web engines evaluate these instructions within the active execution context.
3. **Best Practice**: Always structure your solution to minimize side effects and maintain clean data boundaries.

Is there a specific code snippet or error related to this you'd like to inspect?`,
        provider: 'mock',
        model: this.model
      };
    }

    // B. Practice Questions / Exercise Generation
    if (query.includes('practice') || query.includes('question') || query.includes('exercise') || query.includes('quiz')) {
      return {
        content: `### 🎯 Practice Challenge Set for ${currentModule}

Here are 5 targeted practice exercises tailored for your progress (${progressPercent}% completed in ${careerTitle}):

1. **Conceptual Warmup**: What is the difference between function scope and block scope in modern JavaScript?
2. **Debugging Challenge**: Identify why \`for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }\` outputs \`3, 3, 3\` instead of \`0, 1, 2\`.
3. **Coding Task (Medium)**: Write a higher-order function \`once(fn)\` that ensures the wrapped function can only be executed a single time. Subsequent calls should return the original result.
4. **Data Structures Check**: When would you choose a JavaScript \`Map\` over a plain object literal for caching keys?
5. **Interview PYQ**: How does the V8 engine garbage collect closures that capture unused variables?

💡 *Tip: Reply with your answer for any question, and I will review it and provide feedback!*`,
        provider: 'mock',
        model: this.model
      };
    }

    // C. Personalized Study Plan
    if (query.includes('study plan') || query.includes('hours') || query.includes('today') || query.includes('schedule')) {
      return {
        content: `### ⏱️ Personalized 2-Hour Study Plan

Based on your active progress in **${careerTitle}** (currently **${progressPercent}%** overall), here is an optimized session breakdown for today:

- **00:00 - 00:30 (30 mins)**: Theory & Notes on **${currentModule}**
  - Read through execution lifecycle and review mental model cheatsheets in the Learning Hub.
- **00:30 - 01:15 (45 mins)**: Hands-on Practice
  - Solve the active coding challenge in **${currentModule}** (e.g. Memoize utility).
  - Test edge cases and observe closure memory retention.
- **01:15 - 01:45 (30 mins)**: DSA Targeted Revision
  - Solve 1 problem in **${weakDsa[0] || 'Arrays & Sliding Window'}** to maintain your streak.
- **01:45 - 02:00 (15 mins)**: Knowledge Check & Reflection
  - Complete the module quiz and review any missed questions.

Ready to begin with the theory review?`,
        provider: 'mock',
        model: this.model
      };
    }

    // D. Progress & Weak Areas Analysis
    if (query.includes('weak') || query.includes('struggl') || query.includes('analy') || query.includes('progress')) {
      const skillsFeedback = weakSkills.length
        ? `Your records show lower confidence in: **${weakSkills.join(', ')}** (< 50% rating).`
        : 'Your tracked frontend and backend skills are in good health!';

      const dsaFeedback = weakDsa.length
        ? `In DSA, you have lower solve rates in: **${weakDsa.join(', ')}**.`
        : 'Your DSA topics are progressing consistently across arrays and strings.';

      const assessmentFeedback = diagnostics && diagnostics.totalAttempts > 0
        ? `\n- **Assessment Diagnostics**: Average score of **${diagnostics.averageScore}%** across ${diagnostics.totalAttempts} attempts. Strong topics: **${(diagnostics.strongTopics || []).join(', ') || 'None yet'}**. Review recommended for: **${(diagnostics.decliningTopics || diagnostics.weakAreas || []).join(', ') || 'None'}**.`
        : '';

      const recFeedback = recommendations.length > 0
        ? `\n\n#### Adaptive Recommendations:\n` + recommendations.slice(0, 3).map((r, i) => {
            const title = r.title || r.name || 'Recommended Action';
            const priority = (r.priority || 'medium').toUpperCase();
            const desc = r.description || r.reason || 'Continue your curriculum roadmap progress.';
            return `${i + 1}. **${title}** (${priority}): ${desc}`;
          }).join('\n')
        : `\n\n#### Recommended Next Steps:\n1. Revisit the theory and video walkthrough in **${currentModule}**.\n2. Dedicate 20 minutes to practice tasks in your identified weak areas.\n3. Review your pending goals to keep your daily streak active.`;

      return {
        content: `### 📊 Learning Diagnostics & Weak Area Analysis

Hello **${studentName}**, here is your learning diagnosis derived from your actual CareerOS records:

- **Roadmap Progression**: **${progressPercent}%** completed in **${careerTitle}**.
- **Active Focus**: Currently working on **${currentModule}**.
- **Skill Diagnostics**: ${skillsFeedback}
- **DSA Diagnostics**: ${dsaFeedback}${assessmentFeedback}${recFeedback}`,
        provider: 'mock',
        model: this.model
      };
    }

    // E. What should I learn next?
    if (query.includes('what should i learn next') || query.includes('next') || query.includes('roadmap') || query.includes('study next')) {
      const adaptivePlan = recommendations.length > 0
        ? `\n\n#### Immediate Personalized Recommendations from Assessments:\n` +
          recommendations.slice(0, 3).map((r, i) => {
            const title = r.title || r.name || 'Recommended Action';
            const priority = (r.priority || 'medium').toUpperCase();
            const desc = r.description || r.reason || 'Continue your curriculum roadmap progress.';
            const action = r.action || 'Continue';
            return `${i + 1}. [${priority}] **${title}**: ${desc} *(Action: ${action})*`;
          }).join('\n')
        : '';

      return {
        content: `### 🗺️ Next Recommended Learning Action

Based on your roadmap position in **${careerTitle}**:

- **Current Stage**: **${currentModule}** (${progressPercent}% complete).
- **Immediate Milestone**: Finish the active video lecture and hands-on practice challenge for this module.
- **Upcoming Milestone**: Next in the roadmap is **Asynchronous Architecture (Promises & Microtasks)**.${adaptivePlan}

Would you like me to walk you through the key concepts or jump into your next recommended assessment?`,
        provider: 'mock',
        model: this.model
      };
    }

    // F. Code Debugging & Help
    if (query.includes('debug') || query.includes('error') || query.includes('undefined') || query.includes('code')) {
      return {
        content: `### 🐛 Code Review & Debugging Guidance

Let's inspect this together, **${studentName}**!

#### Common Reasons for \`undefined\` in JavaScript:
1. **Missing Return Statement**: Functions without an explicit \`return\` evaluate to \`undefined\`.
2. **Accessing Uninitialized Variables**: Accessing variables declared with \`var\` before assignment returns \`undefined\`.
3. **Missing Object Properties**: Accessing a property that does not exist on an object yields \`undefined\`.
4. **Asynchronous Timing**: Reading data from a \`Promise\` synchronously before it resolves.

Paste your snippet below, and I will point out the exact line causing the issue and provide a corrected version!`,
        provider: 'mock',
        model: this.model
      };
    }

    // Default Friendly Response
    return {
      content: `Hello **${studentName}**! I'm your CareerOS Helping AI, tailored specifically to assist your journey through the **${careerTitle}** roadmap.

I'm currently aware of your progress in **${currentModule}** (${progressPercent}% completed).

Here are a few things I can help you with right now:
- **Topic Explanations**: "Explain closures or event loop simply"
- **Code Assistance**: "Help me debug this function"
- **Practice**: "Give me 5 practice questions for this module"
- **Study Planning**: "I have 2 hours today, what should I study?"
- **Diagnostics**: "What are my weak areas?"

What would you like to focus on today?`,
      provider: 'mock',
      model: this.model
    };
  }
}

/**
 * Google Gemini Provider Adapter
 */
export class GeminiAiProvider {
  constructor(config = {}) {
    this.name = 'gemini';
    this.apiKey = config.apiKey || process.env.AI_API_KEY || '';
    this.model = config.model || process.env.AI_MODEL || 'gemini-1.5-flash';
  }

  async generateResponse({ messages = [], systemPrompt = '', userContext = {}, options = {} }) {
    if (!this.apiKey) {
      throw new Error('Gemini API key is missing. Configure AI_API_KEY in backend/.env');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || DEFAULT_TIMEOUT_MS);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

      // Convert messages to Gemini format
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const body = {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 1500
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Gemini API error (${res.status}): ${errorData.error?.message || res.statusText}`);
      }

      const data = await res.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

      return {
        content: textResponse,
        provider: 'gemini',
        model: this.model
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

/**
 * Factory to get active AI provider based on environment configuration
 */
export function getAiProvider() {
  const providerName = (process.env.AI_PROVIDER || 'mock').toLowerCase().trim();
  const modelName = process.env.AI_MODEL;
  const apiKey = process.env.AI_API_KEY;

  if (providerName === 'gemini' && apiKey) {
    return new GeminiAiProvider({ apiKey, model: modelName });
  }

  // Default to robust Mock Provider
  return new MockAiProvider({ model: modelName || 'careeros-mock-v1' });
}

export default {
  MockAiProvider,
  GeminiAiProvider,
  getAiProvider
};
