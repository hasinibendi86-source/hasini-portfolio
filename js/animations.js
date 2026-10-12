/**
 * ==========================================================================
 * BENDI HASINI - CINEMATIC GSAP & SCROLLTRIGGER ANIMATIONS
 * Editorial Stagger Reveals, Smooth Entrances & Ambient Particle Field
 * ==========================================================================
 */

(function () {
  'use strict';

  // Ambient Starfield Canvas System
  const bgCanvas = document.getElementById('ambient-bg-canvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let width, height;
    let particles = [];
    const count = 75;

    function resizeBg() {
      width = window.innerWidth;
      height = window.innerHeight;
      bgCanvas.width = width * window.devicePixelRatio;
      bgCanvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resizeBg();
    window.addEventListener('resize', resizeBg);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.5 ? '#00f0ff' : '#8b5cf6'
      });
    }

    function renderBg() {
      requestAnimationFrame(renderBg);
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    renderBg();
  }

  // --- GSAP SCROLLTRIGGER ORCHESTRATION ---
  function initGSAP() {
    if (typeof gsap === 'undefined') {
      console.log('GSAP not loaded, native fallbacks active');
      return;
    }

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero entrance timeline
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl
      .from('.hero-badge', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.2
      })
      .from('.hero-name-primary', {
        opacity: 0,
        y: 50,
        duration: 1,
        skewY: 2
      }, '-=0.5')
      .from('.hero-name-secondary', {
        opacity: 0,
        y: 50,
        duration: 1,
        skewY: -2
      }, '-=0.7')
      .from('.hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.7
      }, '-=0.6')
      .from('.hero-intro', {
        opacity: 0,
        y: 25,
        duration: 0.8
      }, '-=0.5')
      .from('.hero-meta', {
        opacity: 0,
        y: 20,
        duration: 0.6
      }, '-=0.5')
      .from('.hero-cta-group', {
        opacity: 0,
        y: 20,
        duration: 0.8
      }, '-=0.4')
      .from('.hero-centerpiece', {
        opacity: 0,
        scale: 0.85,
        duration: 1.2
      }, '-=1.2')
      .from('.hero-scroll-indicator', {
        opacity: 0,
        y: 20,
        duration: 0.8
      }, '-=0.6');

    // Section Headers Reveal
    gsap.utils.toArray('.section-header').forEach((header) => {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out'
      });
    });

    // Bento Cards Stagger
    if (document.querySelector('.bento-stats-grid')) {
      gsap.from('.bento-card', {
        scrollTrigger: {
          trigger: '.bento-stats-grid',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.2)'
      });
    }

    // Skills Matrix Stagger
    if (document.querySelector('.skills-matrix-grid')) {
      gsap.from('.skill-card', {
        scrollTrigger: {
          trigger: '.skills-matrix-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 35,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out'
      });
    }

    // Project Editorial Cards Stagger & Scale
    gsap.utils.toArray('.project-editorial-card').forEach((card) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 60,
        duration: 1,
        ease: 'power3.out'
      });
    });

    // Timeline Steps Stagger
    gsap.utils.toArray('.journey-step').forEach((step, idx) => {
      gsap.from(step, {
        scrollTrigger: {
          trigger: step,
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        x: -40,
        duration: 0.8,
        delay: idx * 0.1,
        ease: 'power3.out'
      });
    });

    // Contact CTA Cards Stagger
    if (document.querySelector('.contact-channels-grid')) {
      gsap.from('.contact-channel-card', {
        scrollTrigger: {
          trigger: '.contact-channels-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.3)'
      });
    }
  }

  // Initialize once window loaded
  window.addEventListener('load', initGSAP);
})();
