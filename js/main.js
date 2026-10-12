/**
 * ==========================================================================
 * BENDI HASINI - MAIN CONTROLLER & INTERACTION SYSTEM
 * Audio FX, Custom Cursor, Spotlight, Magnetic Buttons, & Dynamic Telemetry
 * ==========================================================================
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIS ENGINE (WEB AUDIO API) ---
  let audioCtx = null;
  let soundEnabled = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playUiBeep(freq = 880, duration = 0.05, type = 'sine', gainVal = 0.04) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext policy catch
    }
  }

  function playConfirmChime() {
    if (!soundEnabled || !audioCtx) return;
    playUiBeep(523.25, 0.08, 'sine', 0.05); // C5
    setTimeout(() => playUiBeep(659.25, 0.1, 'sine', 0.05), 50); // E5
    setTimeout(() => playUiBeep(783.99, 0.15, 'sine', 0.06), 100); // G5
  }

  // Sound toggle button setup
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      const icon = soundBtn.querySelector('i');
      if (soundEnabled) {
        soundBtn.style.color = 'var(--accent-cyan)';
        soundBtn.style.borderColor = 'var(--accent-cyan)';
        soundBtn.setAttribute('title', 'Sound FX: Enabled');
        playConfirmChime();
        showToast('Futuristic Audio FX: Enabled');
      } else {
        soundBtn.style.color = '';
        soundBtn.style.borderColor = '';
        soundBtn.setAttribute('title', 'Sound FX: Disabled');
        showToast('Sound FX: Disabled');
      }
      if (window.lucide) lucide.createIcons();
    });
  }

  // --- TOAST NOTIFICATIONS ---
  const toast = document.getElementById('toast-notice');
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // --- CUSTOM CURSOR ---
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  let cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2;
  let ringX = cursorX, ringY = cursorY;

  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursorDot.style.left = `${cursorX}px`;
      cursorDot.style.top = `${cursorY}px`;
    });

    function renderCursor() {
      ringX += (cursorX - ringX) * 0.18;
      ringY += (cursorY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Expand cursor on interactive targets
    const interactives = 'a, button, input, .skill-card, .bento-card, .project-editorial-card, .orbit-tag, .contact-channel-card';
    document.querySelectorAll(interactives).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('cursor-hover');
        playUiBeep(1200, 0.03, 'sine', 0.02);
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('cursor-hover');
      });
    });
  }

  // --- NAVBAR SCROLL & ACTIVE SECTION HIGHLIGHT ---
  const navbar = document.getElementById('navbar-wrapper');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section[id]');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Navbar shrink
    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Back to top button
    if (backToTopBtn) {
      if (scrollY > 500) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Active Section Spy
    let currentId = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 180;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      playConfirmChime();
    });
  }

  // --- MOBILE DRAWER TOGGLE ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      const isOpen = mobileDrawer.classList.contains('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      playUiBeep(600, 0.05, 'triangle', 0.05);
    });

    mobileDrawer.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- DYNAMIC SPOTLIGHT TRACKER ON CARDS ---
  const spotlightCards = document.querySelectorAll('.bento-card, .skill-card, .project-editorial-card');
  spotlightCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // --- 3D CARD TILT ON BENTO & PROJECT CARDS ---
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.bento-card, .project-editorial-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // --- MAGNETIC BUTTONS ---
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-nav-connect').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // --- SKILL CATEGORY MATRIX FILTERING ---
  const skillTabs = document.querySelectorAll('.skill-tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      skillTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filterCategory = tab.getAttribute('data-filter');
      playUiBeep(750, 0.05, 'sine', 0.04);

      skillCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filterCategory === 'all' || category === filterCategory) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 30);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px) scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // --- HACKMATCH LIVE INTERACTIVE CANVAS GRAPH ---
  const hackmatchCanvas = document.getElementById('hackmatch-graph-canvas');
  if (hackmatchCanvas) {
    const gCtx = hackmatchCanvas.getContext('2d');
    let gW, gH;

    function resizeGraph() {
      gW = hackmatchCanvas.parentElement.clientWidth;
      gH = hackmatchCanvas.parentElement.clientHeight || 240;
      hackmatchCanvas.width = gW * window.devicePixelRatio;
      hackmatchCanvas.height = gH * window.devicePixelRatio;
      gCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resizeGraph();
    window.addEventListener('resize', resizeGraph);

    // Node entities
    const nodes = [
      { name: 'AI / ML', role: 'Model Architect', x: 0.25, y: 0.35, color: '#00f0ff' },
      { name: 'Full Stack', role: 'System Eng', x: 0.72, y: 0.3, color: '#8b5cf6' },
      { name: 'Data Sci', role: 'Analytics Lead', x: 0.45, y: 0.75, color: '#38bdf8' },
      { name: 'UI / UX', role: 'Design Tech', x: 0.85, y: 0.7, color: '#f43f5e' },
      { name: 'HackMatch', role: 'Synergy Engine', x: 0.5, y: 0.45, color: '#10b981', isCore: true }
    ];

    let graphAngle = 0;

    function drawGraph() {
      requestAnimationFrame(drawGraph);
      gCtx.clearRect(0, 0, gW, gH);
      graphAngle += 0.015;

      const coreX = gW * nodes[4].x;
      const coreY = gH * nodes[4].y + Math.sin(graphAngle) * 6;

      // Draw synergy linkage beams
      for (let i = 0; i < 4; i++) {
        const n = nodes[i];
        const nx = gW * n.x + Math.cos(graphAngle + i) * 4;
        const ny = gH * n.y + Math.sin(graphAngle + i) * 4;

        gCtx.beginPath();
        gCtx.moveTo(coreX, coreY);
        gCtx.lineTo(nx, ny);

        const beamGrad = gCtx.createLinearGradient(coreX, coreY, nx, ny);
        beamGrad.addColorStop(0, 'rgba(16, 185, 129, 0.7)');
        beamGrad.addColorStop(1, n.color + '88');
        gCtx.strokeStyle = beamGrad;
        gCtx.lineWidth = 1.6;
        gCtx.stroke();

        // Animated pulse packet traveling on the line
        const packetT = ((graphAngle * 0.8 + i * 0.25) % 1);
        const px = coreX + (nx - coreX) * packetT;
        const py = coreY + (ny - coreY) * packetT;
        gCtx.beginPath();
        gCtx.arc(px, py, 2.5, 0, Math.PI * 2);
        gCtx.fillStyle = '#ffffff';
        gCtx.shadowColor = '#00f0ff';
        gCtx.shadowBlur = 8;
        gCtx.fill();

        // Node circle
        gCtx.beginPath();
        gCtx.arc(nx, ny, 16, 0, Math.PI * 2);
        gCtx.fillStyle = 'rgba(12, 18, 36, 0.85)';
        gCtx.strokeStyle = n.color;
        gCtx.lineWidth = 1.8;
        gCtx.fill();
        gCtx.stroke();

        // Node label
        gCtx.font = '600 9px "JetBrains Mono", monospace';
        gCtx.fillStyle = '#ffffff';
        gCtx.textAlign = 'center';
        gCtx.fillText(n.name, nx, ny + 3);
      }

      // Draw Center Matchmaker Node
      gCtx.beginPath();
      gCtx.arc(coreX, coreY, 22, 0, Math.PI * 2);
      gCtx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      gCtx.strokeStyle = '#10b981';
      gCtx.lineWidth = 2;
      gCtx.fill();
      gCtx.stroke();

      gCtx.font = '700 8.5px "Space Grotesk", sans-serif';
      gCtx.fillStyle = '#34d399';
      gCtx.textAlign = 'center';
      gCtx.fillText('MATCHED', coreX, coreY + 3);
    }
    drawGraph();
  }

  // --- QUICK INQUIRY DIRECT WHATSAPP ACTION ---
  const quickMsgInput = document.getElementById('quick-inquiry-input');
  const sendInquiryBtn = document.getElementById('btn-send-inquiry');

  if (sendInquiryBtn && quickMsgInput) {
    sendInquiryBtn.addEventListener('click', () => {
      const msg = quickMsgInput.value.trim();
      const defaultText = "Hi Hasini! I viewed your portfolio and would like to connect regarding an AI/Engineering opportunity.";
      const textToSend = msg.length > 0 ? `Hi Hasini! ${msg}` : defaultText;
      const waUrl = `https://wa.me/919281018026?text=${encodeURIComponent(textToSend)}`;
      playConfirmChime();
      showToast('Opening WhatsApp to initiate message transmission...');
      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }, 300);
    });

    quickMsgInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendInquiryBtn.click();
      }
    });
  }

  // --- INITIALIZE LUCIDE ICONS ---
  document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
      lucide.createIcons();
    }
  });

  // Sound triggers on CTA buttons
  document.querySelectorAll('.btn-primary, .btn-secondary, .project-btn-action').forEach((btn) => {
    btn.addEventListener('click', () => {
      playConfirmChime();
    });
  });

})();
