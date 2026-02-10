/**
 * CONTINUOUS LOOP: 6-Hour Aesthetic Cycle
 * Simulates a "living" gallery by slowly shifting ambient colors and lighting
 * based on the time of day or a 6-hour loop cycle.
 */

(function() {
    console.log('∞ Starting Continuous Loop Cycle (6h)...');

    const STORAGE_KEY = 'naroa_loop_start';
    let startTime = localStorage.getItem(STORAGE_KEY);
    
    if (!startTime) {
        startTime = Date.now();
        localStorage.setItem(STORAGE_KEY, startTime);
    }

    const CYCLE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in ms

    function updateAtmosphere() {
        const now = Date.now();
        const elapsed = (now - startTime) % CYCLE_DURATION;
        const progress = elapsed / CYCLE_DURATION; // 0.0 to 1.0

        // Map progress to color shifts (HSL hue rotation)
        const hueShift = Math.floor(progress * 360);
        
        // Define aesthetic phases
        // 0.0 - 0.2: Morning/Golden (Warm)
        // 0.2 - 0.5: Day/Vibrant (Pop)
        // 0.5 - 0.8: Evening/Atmospheric (Purple/Blue)
        // 0.8 - 1.0: Night/Neon (Cyber)

        document.documentElement.style.setProperty('--loop-hue', `${hueShift}deg`);
        
        // Dynamic Accent Adjustments
        // We use style injection to shift accents slightly
        const primaryAccent = `hsl(${hueShift}, 80%, 60%)`;
        const secondaryAccent = `hsl(${(hueShift + 180) % 360}, 70%, 55%)`;

        // Update CSS variables if they support dynamic changes, 
        // or toggle classes on the body
        
        if (progress < 0.25) {
            document.body.dataset.loopPhase = 'golden';
        } else if (progress < 0.5) {
            document.body.dataset.loopPhase = 'pop';
        } else if (progress < 0.75) {
            document.body.dataset.loopPhase = 'deep';
        } else {
            document.body.dataset.loopPhase = 'neon';
        }

        requestAnimationFrame(updateAtmosphere);
    }

    // Start the loop
    updateAtmosphere();

    // Auto-evolve specific elements
    setInterval(() => {
        evolvePalette();
    }, 1000 * 60 * 15); // Every 15 minutes, shift the "Palette" layout slightly
    
    function evolvePalette() {
        // Subtle randomization of the Nav Paint blobs
        const nav = document.querySelector('.nav');
        if (nav) {
            const rx = Math.random() * 10 - 5; // -5 to 5
            const ry = Math.random() * 10 - 5;
            // Apply slight organic morph
            // This is just a conceptual hook for now
        }
    }

})();
