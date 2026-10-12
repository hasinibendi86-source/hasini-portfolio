/**
 * ==========================================================================
 * BENDI HASINI - PERSONAL BRAND ORBITAL VISUALIZATION
 * 3D Keyword Orbit System with Canvas Dynamic Data Links
 * ==========================================================================
 */

(function () {
  'use strict';

  const container = document.getElementById('brand-orbit-container');
  const canvas = document.getElementById('brand-orbit-canvas');
  if (!container || !canvas) return;

  const ctx = canvas.getContext('2d');

  const keywords = [
    { text: 'AI', desc: 'Neural Architectures & Cognitive Systems', color: '#00f0ff', angle: 0 },
    { text: 'ML', desc: 'Predictive Modeling & Statistical Inference', color: '#8b5cf6', angle: (Math.PI / 3) * 1 },
    { text: 'DATA', desc: 'Analytics, Data Pipelines & Telemetry', color: '#38bdf8', angle: (Math.PI / 3) * 2 },
    { text: 'CODE', desc: 'Full-Stack Systems & Scalable APIs', color: '#c084fc', angle: (Math.PI / 3) * 3 },
    { text: 'DESIGN', desc: 'Cinematic UI/UX & Responsive Aesthetics', color: '#f43f5e', angle: (Math.PI / 3) * 4 },
    { text: 'INNOVATION', desc: 'Hackathons & Rapid Solutions', color: '#10b981', angle: (Math.PI / 3) * 5 }
  ];

  let width, height, centerX, centerY;
  let radiusX = 260, radiusY = 90;
  let rotationSpeed = 0.005;
  let isHovered = false;
  let animFrame = null;
  let tagElements = [];

  function resizeCanvas() {
    width = container.clientWidth;
    height = container.clientHeight || 520;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    centerX = width / 2;
    centerY = height / 2;

    // Adjust orbital radii responsively
    if (width < 600) {
      radiusX = width * 0.42;
      radiusY = 65;
    } else if (width < 900) {
      radiusX = width * 0.38;
      radiusY = 85;
    } else {
      radiusX = Math.min(320, width * 0.32);
      radiusY = 100;
    }
  }

  function createTags() {
    // Clear any existing
    const existingTags = container.querySelectorAll('.orbit-tag');
    existingTags.forEach(t => t.remove());
    tagElements = [];

    keywords.forEach((item, index) => {
      const tag = document.createElement('div');
      tag.className = 'orbit-tag';
      tag.id = `orbit-tag-${index}`;
      tag.innerHTML = `<span>${item.text}</span>`;
      tag.setAttribute('data-desc', item.desc);
      tag.setAttribute('title', item.desc);

      tag.addEventListener('mouseenter', () => {
        isHovered = true;
        rotationSpeed = 0.001; // slow down
        showTooltip(item);
      });

      tag.addEventListener('mouseleave', () => {
        isHovered = false;
        rotationSpeed = 0.005;
        hideTooltip();
      });

      container.appendChild(tag);
      tagElements.push({ el: tag, data: item });
    });
  }

  const tooltipEl = document.getElementById('brand-orbit-tooltip');
  function showTooltip(item) {
    if (!tooltipEl) return;
    tooltipEl.textContent = `${item.text} // ${item.desc}`;
    tooltipEl.style.opacity = '1';
    tooltipEl.style.transform = 'translateX(-50%) translateY(0)';
  }

  function hideTooltip() {
    if (!tooltipEl) return;
    tooltipEl.style.opacity = '0';
    tooltipEl.style.transform = 'translateX(-50%) translateY(10px)';
  }

  function update() {
    animFrame = requestAnimationFrame(update);

    ctx.clearRect(0, 0, width, height);

    // Draw elliptical orbital guidelines
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.stroke();

    // Inner subtle glow ellipse
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX * 0.75, radiusY * 0.75, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
    ctx.stroke();
    ctx.restore();

    // Update positions of keyword tags
    tagElements.forEach(({ el, data }) => {
      data.angle += rotationSpeed;

      const x = centerX + Math.cos(data.angle) * radiusX;
      const y = centerY + Math.sin(data.angle) * radiusY;

      // Depth perception calculation
      const depth = Math.sin(data.angle); // -1 (back) to 1 (front)
      const scale = 0.8 + ((depth + 1) / 2) * 0.35; // 0.8 to 1.15
      const opacity = 0.45 + ((depth + 1) / 2) * 0.55; // 0.45 to 1.0
      const zIndex = Math.round((depth + 1) * 10) + 1;

      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
      el.style.opacity = opacity;
      el.style.zIndex = zIndex;

      // Draw glowing synaptic line from center to tag
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);

      const grad = ctx.createLinearGradient(centerX, centerY, x, y);
      grad.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
      grad.addColorStop(0.7, data.color + '33'); // with alpha
      grad.addColorStop(1, data.color + 'aa');

      ctx.strokeStyle = grad;
      ctx.lineWidth = depth > 0 ? 1.5 : 0.8;
      ctx.stroke();

      // Node dot on orbital path
      ctx.beginPath();
      ctx.arc(x, y, 3.5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = data.color;
      ctx.shadowColor = data.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    });
  }

  function init() {
    resizeCanvas();
    createTags();
    window.addEventListener('resize', () => {
      resizeCanvas();
    });
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
