/**
 * CareerOS — Question Bank & Assessment Seed Data (Day 11)
 * 
 * Authoritative curriculum questions covering:
 * - Single choice
 * - Multiple choice
 * - True/False
 * - Code & output reasoning
 * - Conceptual evaluation
 */

export const QUESTIONS_SEED = [
  // =========================================================================
  // JavaScript Core: Functions & Execution Context
  // =========================================================================
  {
    questionId: 'q-js-func-1',
    text: 'What happens in the creation phase of the JavaScript execution context when a function is declared with the "function" keyword?',
    type: 'single_choice',
    options: [
      'The function identifier is declared but set to undefined until runtime execution',
      'The function is allocated in heap memory and its entire definition is stored, enabling hoisting',
      'The function throws a ReferenceError if invoked before its definition line',
      'Memory is allocated only when the function is explicitly invoked'
    ],
    correctAnswers: [1],
    explanation: 'During the creation / memory allocation phase, the JavaScript engine stores function declarations in heap memory in their entirety. This allows them to be safely called before their definition line in the source file.',
    difficulty: 'beginner',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Execution Context',
    skills: ['JavaScript', 'Execution Context'],
    tags: ['V8', 'Memory', 'Hoisting'],
    points: 10,
    status: 'active'
  },
  {
    questionId: 'q-js-func-2',
    text: 'What is the output of the following code snippet?',
    type: 'code_reasoning',
    codeSnippet: `var x = 10;
function test() {
  console.log(x);
  var x = 20;
}
test();`,
    options: [
      '10',
      '20',
      'undefined',
      'ReferenceError: Cannot access "x" before initialization'
    ],
    correctAnswers: [2],
    explanation: 'Due to variable hoisting within the local execution context of "test()", the local "var x" is hoisted to the top of the function and initialized with "undefined", shadowing the outer "x = 10".',
    difficulty: 'intermediate',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Execution Context',
    skills: ['JavaScript', 'Scope'],
    tags: ['Hoisting', 'Shadowing'],
    points: 10,
    status: 'active'
  },
  {
    questionId: 'q-js-closure-1',
    text: 'Which of the following statements accurately defines a JavaScript closure?',
    type: 'single_choice',
    options: [
      'A method used to immediately terminate recursive function calls',
      'A function bundled together with references to its surrounding lexical environment',
      'A syntax error caused by forgetting to close matching curly brackets',
      'A private class construct introduced in ECMAScript 2022'
    ],
    correctAnswers: [1],
    explanation: 'A closure is the combination of a function bundled together with references to its lexical environment. An inner function retains access to the variables of its enclosing outer function even after the outer function has completed execution.',
    difficulty: 'beginner',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Closures',
    skills: ['JavaScript', 'Closures'],
    tags: ['Lexical Scope', 'Mental Model'],
    points: 10,
    status: 'active'
  },
  {
    questionId: 'q-js-closure-2',
    text: 'What will be printed to the console when the following code is executed?',
    type: 'code_reasoning',
    codeSnippet: `function makeCounter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}

const c1 = makeCounter();
const c2 = makeCounter();
c1();
c1();
console.log(c1(), c2());`,
    options: [
      '3 1',
      '3 3',
      '2 1',
      'undefined undefined'
    ],
    correctAnswers: [0],
    explanation: 'Each invocation of "makeCounter()" creates a distinct lexical environment and its own independent "count" variable in memory. "c1" is called 3 times (count reaches 3), while "c2" is called once (count reaches 1).',
    difficulty: 'intermediate',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Closures',
    skills: ['JavaScript', 'Closures'],
    tags: ['Encapsulation', 'Counter'],
    points: 10,
    status: 'active'
  },
  {
    questionId: 'q-js-closure-3',
    text: 'Why does the following loop print "3, 3, 3" instead of "0, 1, 2", and how can it be fixed?',
    type: 'conceptual',
    codeSnippet: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 50);
}`,
    options: [
      '"var" is function-scoped, so all callbacks share the same single mutated "i" reference; change "var" to "let" to create a fresh block scope per iteration',
      '"setTimeout" is synchronous and blocks the loop until completion',
      'Console.log is executing inside the microtask queue instead of the macrotask queue',
      'The setTimeout delay of 50ms is too short for the JavaScript engine to schedule properly'
    ],
    correctAnswers: [0],
    explanation: 'Variables declared with "var" are function-scoped, meaning there is only one "i" in memory shared by all three timer callbacks. By switching to "let", each iteration gets its own lexical block scope and preserves the current value in closure.',
    difficulty: 'intermediate',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Closures',
    skills: ['JavaScript', 'Closures', 'Scope'],
    tags: ['Interview Classic', 'Event Loop'],
    points: 10,
    status: 'active'
  },
  {
    questionId: 'q-js-closure-4',
    text: 'How can closures inadvertently cause memory leaks in single-page web applications?',
    type: 'multiple_choice',
    options: [
      'By holding active references to detached DOM nodes or large unneeded data structures in outer scope',
      'By preventing the JavaScript garbage collector from releasing unused memory retained in closure scopes',
      'By executing an infinite loop in the Web API thread',
      'By automatically duplicating variables across all browser worker threads'
    ],
    correctAnswers: [0, 1],
    explanation: 'If an inner function closure references large data structures or DOM nodes, the garbage collector will not reclaim them as long as the closure itself remains referenced (e.g. attached to global event listeners).',
    difficulty: 'advanced',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Closures',
    skills: ['JavaScript', 'Memory Management'],
    tags: ['Garbage Collection', 'Optimization'],
    points: 10,
    status: 'active'
  },
  {
    questionId: 'q-js-eventloop-1',
    text: 'In the JavaScript runtime concurrency model, which task queue has higher execution priority once the call stack is cleared?',
    type: 'single_choice',
    options: [
      'Macrotask Queue (setTimeout, setInterval, setImmediate)',
      'Microtask Queue (Promises: .then/.catch, queueMicrotask, MutationObserver)',
      'I/O Callback Queue',
      'RequestAnimationFrame Queue'
    ],
    correctAnswers: [1],
    explanation: 'The event loop completely drains the Microtask queue (executing all queued microtasks, including any microtasks scheduled during their execution) before taking the next macrotask from the macrotask queue.',
    difficulty: 'beginner',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Event Loop',
    skills: ['JavaScript', 'Event Loop'],
    tags: ['Microtasks', 'Promises'],
    points: 10,
    status: 'active'
  },
  {
    questionId: 'q-js-eventloop-2',
    text: 'What is the exact console output order of the following program?',
    type: 'code_reasoning',
    codeSnippet: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');`,
    options: [
      '1, 2, 3, 4',
      '1, 4, 2, 3',
      '1, 4, 3, 2',
      '3, 1, 4, 2'
    ],
    correctAnswers: [2],
    explanation: '"1" and "4" execute synchronously on the call stack. Once the stack is empty, microtasks execute, printing "3". Finally, the next macrotask runs, printing "2". Output: 1, 4, 3, 2.',
    difficulty: 'intermediate',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Event Loop',
    skills: ['JavaScript', 'Event Loop'],
    tags: ['Concurrency', 'Execution Order'],
    points: 10,
    status: 'active'
  },
  {
    questionId: 'q-js-tdz-1',
    text: 'True or False: Variables declared with "const" and "let" are not hoisted at all in JavaScript.',
    type: 'true_false',
    options: [
      'True',
      'False'
    ],
    correctAnswers: [1],
    explanation: 'False. Variables declared with let and const ARE hoisted to the start of their enclosing block, but unlike var, they remain in the Temporal Dead Zone (TDZ) and are uninitialized. Accessing them before declaration throws a ReferenceError.',
    difficulty: 'beginner',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Scope',
    skills: ['JavaScript', 'Scope'],
    tags: ['TDZ', 'ES6'],
    points: 10,
    status: 'active'
  },
  {
    questionId: 'q-js-adv-gc-1',
    text: 'How does the V8 engine optimize closure variable retention in modern JavaScript?',
    type: 'conceptual',
    options: [
      'V8 only captures variables that are actually referenced by the closure, rather than copying the entire outer scope',
      'V8 converts all closure scopes into static global variables at compile time',
      'V8 disables garbage collection for all files containing arrow functions',
      'V8 re-executes the outer function every time the inner function is invoked'
    ],
    correctAnswers: [0],
    explanation: 'Modern JavaScript engines like V8 perform context analysis at parse time and allocate a context object on the heap that contains ONLY the specific variables captured by inner closures, avoiding retaining unused outer variables.',
    difficulty: 'advanced',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Closures',
    skills: ['JavaScript', 'Memory Management'],
    tags: ['V8 Internals', 'Optimization'],
    points: 10,
    status: 'active'
  }
];

export const ASSESSMENTS_SEED = [
  {
    assessmentId: 'js-core-foundations-quiz',
    title: 'JavaScript Core & Execution Context Assessment',
    description: 'Comprehensive evaluation of execution contexts, hoisting, and function call stack mechanics.',
    type: 'quiz',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Execution Context',
    difficulty: 'beginner',
    timeLimitMinutes: 10,
    questionCount: 4,
    passingScore: 70,
    adaptive: false,
    questionIds: ['q-js-func-1', 'q-js-func-2', 'q-js-tdz-1', 'q-js-eventloop-1'],
    skills: ['JavaScript', 'Execution Context', 'Scope'],
    tags: ['Foundations', 'Quiz'],
    status: 'published'
  },
  {
    assessmentId: 'js-closures-deep-dive',
    title: 'Closures, Scope & Memory Retention Mastery',
    description: 'Rigorous assessment testing lexical environments, closure gotchas, and memory leak diagnosis.',
    type: 'topic_assessment',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Closures',
    difficulty: 'intermediate',
    timeLimitMinutes: 15,
    questionCount: 4,
    passingScore: 75,
    adaptive: false,
    questionIds: ['q-js-closure-1', 'q-js-closure-2', 'q-js-closure-3', 'q-js-closure-4'],
    skills: ['JavaScript', 'Closures', 'Memory Management'],
    tags: ['Closures', 'Deep Dive'],
    status: 'published'
  },
  {
    assessmentId: 'js-full-stack-adaptive-assessment',
    title: 'Full Stack JavaScript Adaptive Evaluation',
    description: 'Dynamic assessment that automatically adjusts question difficulty based on student performance.',
    type: 'module_assessment',
    career: 'full-stack-developer',
    phase: 1,
    subject: 'JavaScript Core & Asynchronous Runtime',
    module: 'javascript-core',
    topic: 'Adaptive JS Mastery',
    difficulty: 'adaptive',
    timeLimitMinutes: 20,
    questionCount: 5,
    passingScore: 70,
    adaptive: true,
    questionIds: [], // Dynamic selection from question bank
    skills: ['JavaScript', 'Closures', 'Event Loop', 'Execution Context'],
    tags: ['Adaptive', 'Mastery'],
    status: 'published'
  }
];

export default {
  QUESTIONS_SEED,
  ASSESSMENTS_SEED
};
