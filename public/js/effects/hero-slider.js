/**
 * Hero Slider - Spectacular Edition
 * Handles the Ken Burns effect cycling for the hero section.
 */

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero__slide');
    if (!slides.length) return;

    let currentSlide = 0;
    const intervalTime = 6000; // 6 seconds per slide

    // Preload next image to avoid flicker
    const preloadImage = (url) => {
        const img = new Image();
        img.src = url;
    };

    // Get background image URL from style
    slides.forEach(slide => {
        const style = slide.getAttribute('style');
        const match = style.match(/url\(['"]?(.*?)['"]?\)/);
        if (match && match[1]) {
            preloadImage(match[1]);
        }
    });

    const nextSlide = () => {
        // Remove active class from current
        slides[currentSlide].classList.remove('active');

        // Calculate next
        currentSlide = (currentSlide + 1) % slides.length;

        // Add active class to next
        slides[currentSlide].classList.add('active');
    };

    // Start loop
    setInterval(nextSlide, intervalTime);
    
    console.log('Hero Slider initialized with ' + slides.length + ' slides.');
});
