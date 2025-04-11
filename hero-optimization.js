/**
 * Hero Section Optimization
 * Improves performance of animations in the hero section
 */

document.addEventListener('DOMContentLoaded', function() {
    // Hero section optimization
    const splineContainer = document.querySelector('.spline-container');
    const heroSection = document.querySelector('.hero-section');
    const splineIframe = document.querySelector('.spline-container iframe');
    const heroContent = document.querySelector('.hero-content');
    
    if (!splineContainer || !heroSection || !splineIframe) return;
    
    // Apply will-change to optimize animations
    splineContainer.style.willChange = 'transform';
    heroContent.style.willChange = 'transform, opacity';
    
    // Use transform3d for hardware acceleration
    splineContainer.style.transform = 'translate3d(0,0,0)';
    heroContent.style.transform = 'translate3d(0,0,0)';
    
    // Load Spline with delay to ensure smooth initial page load
    setTimeout(() => {
        const splineUrl = splineIframe.getAttribute('data-src');
        if (splineUrl) {
            // Only load if visible in viewport or close to it
            if (isElementInViewport(heroSection)) {
                splineIframe.setAttribute('src', splineUrl);
                splineIframe.classList.add('loaded');
            } else {
                // Add listener to load when scrolled into view
                const scrollListener = function() {
                    if (isElementInViewport(heroSection)) {
                        splineIframe.setAttribute('src', splineUrl);
                        splineIframe.classList.add('loaded');
                        window.removeEventListener('scroll', scrollListener);
                    }
                };
                window.addEventListener('scroll', scrollListener);
            }
        }
    }, 300);
    
    // Reduce animation work during scroll for better performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            // During rapid scrolling, throttle animations
            splineContainer.style.willChange = 'auto';
            heroContent.style.willChange = 'auto';
            splineIframe.style.transform = 'translate3d(-50%, -50%, 0) scale(1.3)';
            
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(function() {
            // Re-enable smooth animations after scrolling stops
            splineContainer.style.willChange = 'transform';
            heroContent.style.willChange = 'transform, opacity';
        }, 200);
    });
    
    // Add intersection observer for more efficient loading
    if ('IntersectionObserver' in window) {
        const heroObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Optimize when in view
                        splineContainer.style.willChange = 'transform';
                        heroContent.style.willChange = 'transform, opacity';
                    } else {
                        // Reduce resources when not in view
                        splineContainer.style.willChange = 'auto';
                        heroContent.style.willChange = 'auto';
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        heroObserver.observe(heroSection);
    }
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        // Apply styles for reduced motion preference
        document.body.classList.add('reduced-motion');
        
        // Show a static background instead of animation
        splineIframe.style.display = 'none';
        heroSection.style.backgroundImage = 'linear-gradient(to right, rgba(26, 77, 60, 0.8), rgba(26, 77, 60, 0.4)), url("images/hero-bg.jpg")';
        heroSection.style.backgroundSize = 'cover';
        heroSection.style.backgroundPosition = 'center';
    }
    
    // Helper function to check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        
        return (
            rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom > 0 &&
            rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
            rect.right > 0
        );
    }
    
    // Use passive event listeners for better scrolling performance
    window.addEventListener('scroll', function() {
        // Parallax effect for smoother animation
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (splineIframe && splineIframe.classList.contains('loaded')) {
            // Create subtle parallax on spline
            requestAnimationFrame(() => {
                const scale = 1.3 - (scrollTop * 0.0005);
                const translateY = -50 + (scrollTop * 0.05);
                splineIframe.style.transform = `translate3d(-50%, ${translateY}%, 0) scale(${Math.max(1, scale)})`;
            });
        }
    }, { passive: true });
    
    // Apply smooth transitions
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Optional: Preload hero background image for faster display
    const preloadImage = new Image();
    preloadImage.src = 'images/hero-bg.jpg';
});

// Add custom styles for animation optimizations
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .spline-container iframe.loaded {
            animation: fadeIn 1s ease-out forwards;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .hero-section {
            contain: layout style paint;
        }
        
        .spline-container {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            contain: content;
        }
        
        body.reduced-motion .hero-content > * {
            animation: none !important;
            opacity: 1;
            transform: none;
        }
    `;
    document.head.appendChild(style);
}); 