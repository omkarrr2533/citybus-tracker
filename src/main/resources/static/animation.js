// Enhanced Animations & Interactions - Add this as animations.js

// Initialize enhanced animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initEnhancedAnimations();
    setupAdvancedInteractions();
    createFloatingElements();
    setupParallaxEffects();
});

// Enhanced particle system
function initEnhancedAnimations() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    // Clear existing particles
    particlesContainer.innerHTML = '';

    const particleCount = window.innerWidth > 768 ? 60 : 30;

    for (let i = 0; i < particleCount; i++) {
        createEnhancedParticle(particlesContainer, i);
    }

    // Add animated background shapes
    createBackgroundShapes(particlesContainer);
}

function createEnhancedParticle(container, index) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    // Varied particle sizes and colors
    const size = Math.random() * 6 + 2;
    const hue = [240, 160, 280][Math.floor(Math.random() * 3)]; // Blue, Green, Purple
    const opacity = Math.random() * 0.6 + 0.2;

    particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        background: hsla(${hue}, 70%, 60%, ${opacity});
        border-radius: 50%;
        position: absolute;
        animation: enhancedFloat ${15 + Math.random() * 10}s infinite ease-in-out;
        animation-delay: ${Math.random() * 5}s;
        filter: blur(${Math.random() * 2}px);
        box-shadow: 0 0 ${size * 2}px hsla(${hue}, 70%, 60%, 0.3);
    `;

    container.appendChild(particle);
}

function createBackgroundShapes(container) {
    const shapes = ['circle', 'triangle', 'square'];

    for (let i = 0; i < 8; i++) {
        const shape = document.createElement('div');
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        const size = Math.random() * 100 + 50;
        const hue = 240 + Math.random() * 80; // Blue to purple range

        shape.className = `bg-shape bg-${shapeType}`;
        shape.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            background: hsla(${hue}, 50%, 50%, 0.05);
            border-radius: ${shapeType === 'circle' ? '50%' : shapeType === 'triangle' ? '0' : '10%'};
            animation: backgroundShapeFloat ${20 + Math.random() * 15}s infinite ease-in-out;
            animation-delay: ${Math.random() * 10}s;
            z-index: -1;
        `;

        if (shapeType === 'triangle') {
            shape.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        }

        container.appendChild(shape);
    }
}

// Advanced interaction effects
function setupAdvancedInteractions() {
    // Mouse follow effect
    createMouseFollower();

    // Hover magnetic effect for buttons
    setupMagneticButtons();

    // Scroll-triggered animations
    setupScrollAnimations();

    // Interactive cursor effects
    setupCustomCursor();

   
}

function createMouseFollower() {
    const follower = document.createElement('div');
    follower.className = 'mouse-follower';
    follower.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.1s ease;
        transform: translate(-50%, -50%);
        opacity: 0;
    `;

    document.body.appendChild(follower);

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        follower.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        follower.style.opacity = '0';
    });

    function updateFollower() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        requestAnimationFrame(updateFollower);
    }

    updateFollower();
}

function setupMagneticButtons() {
    const buttons = document.querySelectorAll('.btn, .track-bus-btn, .nav-item');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', function(e) {
            this.style.transform = 'scale(1.05)';
        });

        button.addEventListener('mouseleave', function(e) {
            this.style.transform = '';
        });

        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            this.style.transform = `scale(1.05) translate(${deltaX * 5}px, ${deltaY * 5}px) rotateX(${deltaY * 5}deg) rotateY(${deltaX * 5}deg)`;
        });
    });
}

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animatedElements = document.querySelectorAll(
        '.feature-card, .bus-card, .info-card, .control-card, .map-section'
    );

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.animationDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

function setupCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: linear-gradient(45deg, #6366f1, #06d6a0);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        transition: all 0.2s ease;
        transform: translate(-50%, -50%);
        opacity: 0;
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
    `;

    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursor.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });

    // Scale cursor on hover over interactive elements
    const interactiveElements = document.querySelectorAll('button, a, .bus-card, .nav-item');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(3)';
            cursor.style.opacity = '0.5';
        });

        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.opacity = '1';
        });
    });
}

function createFloatingElements() {
    const container = document.body;

    // Create floating icons
    const icons = ['🚌', '📍', '🗺️', '⚡', '🔄', '📱'];

    icons.forEach((icon, index) => {
        const floatingIcon = document.createElement('div');
        floatingIcon.className = 'floating-icon';
        floatingIcon.textContent = icon;
        floatingIcon.style.cssText = `
            position: fixed;
            font-size: 2rem;
            opacity: 0.1;
            pointer-events: none;
            z-index: -1;
            animation: floatIcon ${15 + Math.random() * 10}s infinite ease-in-out;
            animation-delay: ${index * 2}s;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;

        container.appendChild(floatingIcon);
    });
}

function setupParallaxEffects() {
    let ticking = false;

    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero, .feature-card');

        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });

        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);
}

// Advanced CSS animations via JavaScript
function addAdvancedAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes enhancedFloat {
            0%, 100% {
                transform: translate3d(0, 0, 0) rotate(0deg);
                opacity: 0.3;
            }
            25% {
                transform: translate3d(-20px, -30px, 0) rotate(90deg);
                opacity: 1;
            }
            50% {
                transform: translate3d(10px, -20px, 0) rotate(180deg);
                opacity: 0.5;
            }
            75% {
                transform: translate3d(30px, -10px, 0) rotate(270deg);
                opacity: 0.8;
            }
        }

        @keyframes backgroundShapeFloat {
            0%, 100% {
                transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
            }
            33% {
                transform: translate3d(50px, -30px, 0) rotate(120deg) scale(1.1);
            }
            66% {
                transform: translate3d(-30px, 20px, 0) rotate(240deg) scale(0.9);
            }
        }

        @keyframes floatIcon {
            0%, 100% {
                transform: translateY(0px) rotate(0deg);
                opacity: 0.1;
            }
            50% {
                transform: translateY(-100px) rotate(180deg);
                opacity: 0.3;
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes ripple {
            0% {
                transform: scale(0);
                opacity: 1;
            }
            100% {
                transform: scale(4);
                opacity: 0;
            }
        }

        @keyframes typewriter {
            from { width: 0; }
            to { width: 100%; }
        }

        @keyframes blink {
            50% { border-color: transparent; }
        }
    `;

    document.head.appendChild(style);
}

// Add ripple effect to buttons
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn, .track-bus-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                pointer-events: none;
                animation: ripple 0.6s ease-out;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Enhanced bus card interactions
function enhanceBusCards() {
    const busCards = document.querySelectorAll('.bus-card');

    busCards.forEach((card, index) => {
        // Add staggered animation delay
        card.style.animationDelay = `${index * 0.1}s`;

        // Add advanced hover effects
        card.addEventListener('mouseenter', function(e) {
            this.style.filter = 'brightness(1.1) saturate(1.2)';

            // Create floating particles around card
            createCardParticles(this);
        });

        card.addEventListener('mouseleave', function(e) {
            this.style.filter = '';

            // Remove particles
            const particles = this.querySelectorAll('.card-particle');
            particles.forEach(particle => particle.remove());
        });

        // Add selection animation
        card.addEventListener('click', function(e) {
            // Remove selection from other cards
            busCards.forEach(otherCard => {
                if (otherCard !== this) {
                    otherCard.classList.remove('selected');
                }
            });

            // Add selection with animation
            this.classList.add('selected');

            // Create selection burst effect
            createSelectionBurst(this);
        });
    });
}

function createCardParticles(card) {
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'card-particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: linear-gradient(45deg, #6366f1, #06d6a0);
            border-radius: 50%;
            pointer-events: none;
            animation: cardParticleFloat 2s ease-out infinite;
            animation-delay: ${i * 0.1}s;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            z-index: 10;
        `;

        card.style.position = 'relative';
        card.appendChild(particle);
    }

    // Add particle animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cardParticleFloat {
            0% {
                transform: translateY(0) scale(0);
                opacity: 0;
            }
            50% {
                opacity: 1;
                transform: translateY(-20px) scale(1);
            }
            100% {
                transform: translateY(-40px) scale(0);
                opacity: 0;
            }
        }
    `;

    if (!document.querySelector('#cardParticleStyle')) {
        style.id = 'cardParticleStyle';
        document.head.appendChild(style);
    }
}

function createSelectionBurst(card) {
    const burst = document.createElement('div');
    burst.className = 'selection-burst';
    burst.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent);
        pointer-events: none;
        animation: selectionBurst 0.6s ease-out;
        z-index: 5;
    `;

    card.style.position = 'relative';
    card.appendChild(burst);

    // Add burst animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes selectionBurst {
            0% {
                width: 0;
                height: 0;
                opacity: 1;
                transform: translate(-50%, -50%) scale(0);
            }
            100% {
                width: 300px;
                height: 300px;
                opacity: 0;
                transform: translate(-50%, -50%) scale(1);
            }
        }
    `;

    if (!document.querySelector('#selectionBurstStyle')) {
        style.id = 'selectionBurstStyle';
        document.head.appendChild(style);
    }

    setTimeout(() => {
        burst.remove();
    }, 600);
}

// Enhanced map animations
function enhanceMapAnimations() {
    const maps = document.querySelectorAll('#tracking-map, #driver-map, #home-map');

    maps.forEach(mapElement => {
        if (!mapElement) return;

        // Add loading animation
        mapElement.style.opacity = '0';
        mapElement.style.transform = 'scale(0.95)';

        // Simulate map loading
        setTimeout(() => {
            mapElement.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            mapElement.style.opacity = '1';
            mapElement.style.transform = 'scale(1)';
        }, 500);
    });
}

// Navigation enhancement with typewriter effect
function enhanceNavigation() {
    const logo = document.querySelector('.logo');
    if (logo) {
        const text = logo.textContent;
        logo.textContent = '';
        logo.style.borderRight = '2px solid #6366f1';
        logo.style.animation = 'blink 1s infinite';

        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                logo.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                logo.style.borderRight = 'none';
                logo.style.animation = 'none';
            }
        }

        setTimeout(typeWriter, 1000);
    }
}

// Page transition effects
function setupPageTransitions() {
    const pages = document.querySelectorAll('.page');

    pages.forEach(page => {
        page.style.opacity = '0';
        page.style.transform = 'translateX(50px)';
        page.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    // Show active page
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        setTimeout(() => {
            activePage.style.opacity = '1';
            activePage.style.transform = 'translateX(0)';
        }, 100);
    }
}

// Weather animation effect (decorative)
function createWeatherEffects() {
    if (Math.random() > 0.7) {  
        createRainEffect();
    }
}

function createRainEffect() {
    const rainContainer = document.createElement('div');
    rainContainer.className = 'weather-rain';
    rainContainer.style.cssText = `
        position: fixed;
        top: -100px;
        left: 0;
        width: 100%;
        height: 100vh;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;

    document.body.appendChild(rainContainer);

    for (let i = 0; i < 50; i++) {
        const raindrop = document.createElement('div');
        raindrop.className = 'raindrop';
        raindrop.style.cssText = `
            position: absolute;
            width: 2px;
            height: 20px;
            background: linear-gradient(transparent, rgba(99, 102, 241, 0.3), transparent);
            left: ${Math.random() * 100}%;
            animation: rainFall ${2 + Math.random() * 3}s linear infinite;
            animation-delay: ${Math.random() * 2}s;
        `;

        rainContainer.appendChild(raindrop);
    }

    // Add rain animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainFall {
            0% {
                transform: translateY(-100px);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(100vh);
                opacity: 0;
            }
        }
    `;

    if (!document.querySelector('#rainStyle')) {
        style.id = 'rainStyle';
        document.head.appendChild(style);
    }

    // Remove rain after 30 seconds
    setTimeout(() => {
        rainContainer.remove();
    }, 30000);
}

// Performance optimization
function optimizeAnimations() {
    // Reduce animations on slower devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.body.classList.add('reduced-animations');

        const style = document.createElement('style');
        style.textContent = `
            .reduced-animations * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Pause animations when tab is not visible
    document.addEventListener('visibilitychange', () => {
        const particles = document.querySelectorAll('.particle, .bg-shape, .floating-icon');

        if (document.hidden) {
            particles.forEach(particle => {
                particle.style.animationPlayState = 'paused';
            });
        } else {
            particles.forEach(particle => {
                particle.style.animationPlayState = 'running';
            });
        }
    });
}

// Initialize all enhancements
function initializeAllEnhancements() {
    setTimeout(() => {
        addAdvancedAnimations();
        addRippleEffect();
        enhanceBusCards();
        enhanceMapAnimations();
        enhanceNavigation();
        setupPageTransitions();
        optimizeAnimations();

        // Optional weather effects (uncomment to enable)
        // createWeatherEffects();

        console.log('Enhanced animations initialized successfully!');
    }, 500);
}

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllEnhancements);
} else {
    initializeAllEnhancements();
}
