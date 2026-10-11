import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const suites = [
  { name: 'Day 5 Security & Unit Suite', file: 'test-day5-unit.js', expectedChecks: 7 },
  { name: 'Auth & Registration E2E Suite', file: 'test-registration-e2e.js', expectedChecks: 8 },
  { name: 'Day 6 DB Integration Suite', file: 'test-day6-integration.js', expectedChecks: 28 },
  { name: 'Day 7 Career Catalog & Learning Hub', file: 'test-day7-integration.js', expectedChecks: 60 },
  { name: 'Day 8 Video System & URL Normalization', file: 'test-video-system.js', expectedChecks: 34 },
  { name: 'Day 8 Content Engine Integration', file: 'test-day8-integration.js', expectedChecks: 51 },
  { name: 'Day 9 Helping AI Assistant', file: 'test-day9-ai.js', expectedChecks: 43 },
  { name: 'Day 10 Knowledge Base & RAG Grounding', file: 'test-day10-rag.js', expectedChecks: 61 },
  { name: 'Day 11 Assessment Engine & Adaptive', file: 'test-day11-assessment.js', expectedChecks: 57 },
  { name: 'Day 12 Production Deployment & Polish', file: 'test-day12-production.js', expectedChecks: 43 }
];

async function runSuite(suite) {
  return new Promise((resolve) => {
    const fullPath = path.join(__dirname, suite.file);
    const child = spawn(process.execPath, [fullPath], {
      cwd: __dirname,
      env: { ...process.env, NODE_ENV: 'test' }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (code) => {
      // Count [PASS] or ✓ in output
      const passMatches = stdout.match(/\[PASS\]|✓/g) || [];
      resolve({
        name: suite.name,
        file: suite.file,
        code,
        passesCounted: passMatches.length,
        expectedChecks: suite.expectedChecks,
        stdout,
        stderr
      });
    });
  });
}

async function main() {
  console.log('================================================================');
  console.log('  CareerOS Master Test Runner — Executing All Test Suites       ');
  console.log('================================================================\n');

  let totalExpected = 0;
  let totalCounted = 0;
  let allSuccess = true;
  const results = [];

  for (const suite of suites) {
    process.stdout.write(`Running ${suite.name} (${suite.file})... `);
    const res = await runSuite(suite);
    totalExpected += suite.expectedChecks;
    totalCounted += res.passesCounted;
    const ok = res.code === 0;
    if (!ok) allSuccess = false;
    results.push(res);
    console.log(ok ? `[PASSED] (${res.passesCounted} checks)` : `[FAILED] (exit code ${res.code})`);
  }

  console.log('\n================================================================');
  console.log('  Detailed Verification Reconciliation Matrix                   ');
  console.log('================================================================');
  console.log('| Suite Name | File | Expected | Counted | Status |');
  console.log('|---|---|---|---|---|');
  for (const r of results) {
    console.log(`| ${r.name} | ${r.file} | ${r.expectedChecks} | ${r.passesCounted} | ${r.code === 0 ? 'PASS' : 'FAIL'} |`);
  }
  console.log('----------------------------------------------------------------');
  console.log(`Aggregated 10-Suite Total: ${totalExpected} canonical checks.`);
  console.log(`Actual Counted [PASS]/✓ Markers: ${totalCounted} markers.`);
  console.log(`All suites passed: ${allSuccess}`);
  console.log('================================================================\n');
}

main().catch(console.error);
