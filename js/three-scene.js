/**
 * ==========================================================================
 * BENDI HASINI - 3D AI NEURAL CORE CENTERPIECE
 * Interactive Three.js WebGL Visualization
 * ==========================================================================
 */

(function () {
  'use strict';

  const container = document.getElementById('hero-3d-canvas-container');
  if (!container) return;

  // Scene setup
  let scene, camera, renderer;
  let neuralCore, innerSphere, wireframeLattice, particleSystem, orbitRings = [];
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let isVisible = true;
  let animId = null;

  function init() {
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // 1. Scene
    scene = new THREE.Scene();

    // 2. Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 18;

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 4, 30);
    cyanLight.position.set(5, 5, 8);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 4.5, 30);
    violetLight.position.set(-6, -4, 6);
    scene.add(violetLight);

    const coreLight = new THREE.PointLight(0xc084fc, 2.5, 15);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // 5. Build Neural Hierarchy
    neuralCore = new THREE.Group();
    scene.add(neuralCore);

    // Inner Glowing Core (Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(2.4, 2);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x581c87,
      emissive: 0x3b0764,
      wireframe: true,
      wireframeLinewidth: 1.5,
      transparent: true,
      opacity: 0.65
    });
    innerSphere = new THREE.Mesh(coreGeo, coreMat);
    neuralCore.add(innerSphere);

    // Deep Inner Pulsing Seed
    const seedGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const seedMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const innerSeed = new THREE.Mesh(seedGeo, seedMat);
    innerSphere.add(innerSeed);

    // Outer Geodesic Lattice (Neural Shell)
    const shellGeo = new THREE.IcosahedronGeometry(4.2, 2);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x082f49,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    wireframeLattice = new THREE.Mesh(shellGeo, shellMat);
    neuralCore.add(wireframeLattice);

    // Vertices / Synaptic Nodes on the Lattice
    const posAttr = shellGeo.attributes.position;
    const nodeCount = posAttr.count;
    const nodeGeo = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount * 3; i++) {
      nodePositions[i] = posAttr.array[i];
    }
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

    // Custom circular glow texture for nodes
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 240, 255, 1)');
    grad.addColorStop(0.3, 'rgba(192, 132, 252, 0.8)');
    grad.addColorStop(0.8, 'rgba(139, 92, 246, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const nodeTexture = new THREE.CanvasTexture(canvas);

    const nodeMat = new THREE.PointsMaterial({
      size: 0.45,
      map: nodeTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const nodes = new THREE.Points(nodeGeo, nodeMat);
    wireframeLattice.add(nodes);

    // Orbiting Data Rings
    createOrbitRing(5.2, 0.05, 0x00f0ff, 0.45, [1, 0.4, 0.2]);
    createOrbitRing(6.0, 0.04, 0xc084fc, 0.4, [-0.5, 1, 0.3]);
    createOrbitRing(6.8, 0.03, 0x38bdf8, 0.3, [0.2, -0.6, 1]);

    // Floating Synaptic Particle Cloud
    const particleCount = 280;
    const particlesGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 5 + Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = radius * Math.cos(phi);
      pScales[i] = Math.random();
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.35,
      map: nodeTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xc084fc
    });

    particleSystem = new THREE.Points(particlesGeo, pMat);
    neuralCore.add(particleSystem);

    // Event Listeners
    setupEvents();

    // Intersection Observer to save GPU when scrolled away
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          animate();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(container);

    // Start animation
    animate();
  }

  function createOrbitRing(radius, tubeRadius, color, opacity, rotAxis) {
    const ringGeo = new THREE.TorusGeometry(radius, tubeRadius, 8, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true,
      transparent: true,
      opacity: opacity
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = rotAxis[0] * Math.PI;
    ring.rotation.y = rotAxis[1] * Math.PI;
    ring.rotation.z = rotAxis[2] * Math.PI;
    ring.userData = { axis: rotAxis, speed: 0.003 * (orbitRings.length % 2 === 0 ? 1 : -1) };
    neuralCore.add(ring);
    orbitRings.push(ring);
  }

  function setupEvents() {
    window.addEventListener('resize', onWindowResize, false);

    // Mouse movement interaction
    window.addEventListener('mousemove', (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetX = (e.clientX - halfW) / halfW;
      targetY = (e.clientY - halfH) / halfH;
    });

    // Touch & Mouse Drag on canvas
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      neuralCore.rotation.y += deltaX * 0.008;
      neuralCore.rotation.x += deltaY * 0.008;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    // Touch support
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;
      neuralCore.rotation.y += deltaX * 0.008;
      neuralCore.rotation.x += deltaY * 0.008;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
  }

  function onWindowResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  let clock = new THREE.Clock();

  function animate() {
    if (!isVisible) {
      animId = null;
      return;
    }
    animId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Inertia & Mouse Follow
    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;

    if (!isDragging) {
      neuralCore.rotation.y = elapsedTime * 0.15 + mouseX * 0.6;
      neuralCore.rotation.x = Math.sin(elapsedTime * 0.2) * 0.15 + mouseY * 0.4;
    }

    // Inner Core Pulsing & Counter-Rotation
    if (innerSphere) {
      innerSphere.rotation.y = -elapsedTime * 0.35;
      innerSphere.rotation.z = Math.cos(elapsedTime * 0.3) * 0.2;
      const pulse = 1 + Math.sin(elapsedTime * 2.2) * 0.06;
      innerSphere.scale.set(pulse, pulse, pulse);
    }

    // Outer Lattice Gentle Breathing
    if (wireframeLattice) {
      wireframeLattice.rotation.y = elapsedTime * 0.08;
      wireframeLattice.rotation.x = Math.sin(elapsedTime * 0.15) * 0.1;
    }

    // Orbit Rings
    orbitRings.forEach((ring, idx) => {
      ring.rotation.z += ring.userData.speed;
      ring.rotation.x += ring.userData.speed * 0.5;
    });

    // Particle field slight drift
    if (particleSystem) {
      particleSystem.rotation.y = -elapsedTime * 0.05;
    }

    renderer.render(scene, camera);
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
