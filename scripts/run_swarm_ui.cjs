const fs = require('fs');
// Set environment variable for real execution
process.env.USE_REAL_EXECUTION = 'true';

const enginePath = '/Users/borjafernandezangulo/game/.agent/skills/autonomous-browser-swarm/scripts/swarm-v5-engine.js';
if (!fs.existsSync(enginePath)) {
  console.error('Swarm Engine not found at:', enginePath);
  process.exit(1);
}
const SwarmV5Engine = require(enginePath);

async function run() {
  console.log('🚀 Launching Fractal Swarm (40 Agents) for UI Upgrade...');
  
  const swarm = new SwarmV5Engine();
  swarm.config = { ...swarm.config, MAX_CONCURRENT_AGENTS: 40 };

  try {
    // Mission: Research & Propose UI Improvements
    const report = await swarm.executePlan('Investiga tendencias visuales "Feb 2026" (WebGPU, Organic, Micro-interactions) y genera código CSS/JS concreto para mejorar naroa.online.', {
      targetPath: '/Users/borjafernandezangulo/game/naroa-2026',
      agentCount: 40,
      missionType: 'lex-luthor-creative' // Custom type for creative generation
    });

    console.log('\n✅ Mission Complete!');
    console.log('📄 Report generated at:', report.filePath);
    swarm.printDashboard();
    
    if (fs.existsSync(report.filePath)) {
        console.log('\n--- REPORT SUMMARY ---\n');
        console.log(fs.readFileSync(report.filePath, 'utf8').substring(0, 3000));
    }

  } catch (error) {
    console.error('❌ Mission Failed:', error);
  }
}

run();
