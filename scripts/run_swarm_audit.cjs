const fs = require('fs');
const path = require('path');

// Set environment variable for real execution (if supported by environment)
process.env.USE_REAL_EXECUTION = 'true';

// Import Swarm Engine
const enginePath = '/Users/borjafernandezangulo/game/.agent/skills/autonomous-browser-swarm/scripts/swarm-v5-engine.js';
if (!fs.existsSync(enginePath)) {
  console.error('Swarm Engine not found at:', enginePath);
  process.exit(1);
}
const SwarmV5Engine = require(enginePath);

async function run() {
  console.log('🚀 Launching Fractal Swarm (40 Agents) for Code Review...');
  
  const swarm = new SwarmV5Engine();
  // Override max agents per mission to 40 as requested
  swarm.config = { ...swarm.config, MAX_CONCURRENT_AGENTS: 40 };

  try {
    // Run Mission: Full Codebase Audit
    console.log('🔍 Target: /Users/borjafernandezangulo/game/naroa-2026');
    const report = await swarm.executePlan('Audita todo el código de naroa-2026 buscando bugs, performance issues y seguridad.', {
      targetPath: '/Users/borjafernandezangulo/game/naroa-2026',
      agentCount: 40, // Request 40 agents
      missionType: 'code-review'
    });

    console.log('\n✅ Mission Complete!');
    console.log('📄 Report generated at:', report.filePath);
    
    // Print Dashboard
    swarm.printDashboard();
    
    // Read and print the report summary to stdout so Antigravity can read it
    if (fs.existsSync(report.filePath)) {
        console.log('\n--- REPORT SUMMARY ---\n');
        console.log(fs.readFileSync(report.filePath, 'utf8').substring(0, 2000) + '...');
    }

  } catch (error) {
    console.error('❌ Mission Failed:', error);
  }
}

run();
