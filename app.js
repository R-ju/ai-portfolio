/**
 * Mohan Raaju — AI Fellow · Creative Technologist
 * Main Application Logic: Three.js 3D Canvas, Video Cinema Player,
 * Gemini Multimodal Creative Lab, Portfolio Filter, CLI Terminal
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Three.js Interactive 3D Background (Neural Constellation & Core)
  // =========================================================================
  const canvasContainer = document.getElementById('canvas-container');
  let scene, camera, renderer;
  let particleMesh, lineMesh, coreMesh, outerHalo;
  const particleCount = 280;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];
  const maxDistance = 140;

  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;

  function initThree() {
    if (!canvasContainer || !window.THREE) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020711, 0.0012);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 750;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasContainer.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Particles Setup
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 1600;
      const y = (Math.random() - 0.5) * 1200;
      const z = (Math.random() - 0.5) * 1000;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.6,
        y: (Math.random() - 0.5) * 0.6,
        z: (Math.random() - 0.5) * 0.6
      });
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Glow dot texture generated dynamically
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(93, 230, 255, 1)');
    grad.addColorStop(0.3, 'rgba(93, 230, 255, 0.8)');
    grad.addColorStop(0.8, 'rgba(168, 85, 247, 0.2)');
    grad.addColorStop(1, 'rgba(2, 7, 17, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 14,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particleMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleMesh);

    // Dynamic Connections Line Geometry
    const lineGeometry = new THREE.BufferGeometry();
    const maxLineSegments = particleCount * particleCount;
    const linePositions = new Float32Array(maxLineSegments * 3);
    const lineColors = new Float32Array(maxLineSegments * 3);

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.45,
      depthWrite: false
    });

    lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // Central Neural Geometric Core (Wireframe Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(130, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x5de6ff,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });
    coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 40, -100);
    scene.add(coreMesh);

    // Outer Halo
    const haloGeo = new THREE.TorusGeometry(190, 1.2, 16, 100);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });
    outerHalo = new THREE.Mesh(haloGeo, haloMat);
    outerHalo.position.set(0, 40, -100);
    outerHalo.rotation.x = Math.PI / 3;
    scene.add(outerHalo);

    update3DViewportScale();

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    animate();
  }

  function update3DViewportScale() {
    if (!coreMesh || !outerHalo) return;
    const isMobile = window.innerWidth < 768;
    const scale = isMobile ? 0.58 : 1.0;
    coreMesh.scale.set(scale, scale, scale);
    outerHalo.scale.set(scale, scale, scale);
    const posY = isMobile ? 65 : 40;
    coreMesh.position.set(0, posY, -100);
    outerHalo.position.set(0, posY, -100);
  }

  function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    update3DViewportScale();
  }

  function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.4;
    mouseY = (event.clientY - windowHalfY) * 0.4;
  }

  function animate() {
    requestAnimationFrame(animate);

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    camera.position.x = targetX * 0.8;
    camera.position.y = -targetY * 0.8;
    camera.lookAt(scene.position);

    if (coreMesh) {
      coreMesh.rotation.x += 0.003;
      coreMesh.rotation.y += 0.005;
    }

    if (outerHalo) {
      outerHalo.rotation.z += 0.004;
      outerHalo.rotation.x = Math.PI / 3 + Math.sin(Date.now() * 0.001) * 0.2;
    }

    // Update particles position & build connecting lines
    const positions = particleMesh.geometry.attributes.position.array;
    const linePos = lineMesh.geometry.attributes.position.array;
    const lineCol = lineMesh.geometry.attributes.color.array;

    let lineIndex = 0;
    let colorIndex = 0;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += particleVelocities[i].x;
      positions[i * 3 + 1] += particleVelocities[i].y;
      positions[i * 3 + 2] += particleVelocities[i].z;

      // Bounds bounce
      if (positions[i * 3] < -800 || positions[i * 3] > 800) particleVelocities[i].x *= -1;
      if (positions[i * 3 + 1] < -600 || positions[i * 3 + 1] > 600) particleVelocities[i].y *= -1;
      if (positions[i * 3 + 2] < -500 || positions[i * 3 + 2] > 500) particleVelocities[i].z *= -1;

      // Connect nearby particles
      for (let j = i + 1; j < particleCount; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          const alpha = 1.0 - dist / maxDistance;

          linePos[lineIndex++] = positions[i * 3];
          linePos[lineIndex++] = positions[i * 3 + 1];
          linePos[lineIndex++] = positions[i * 3 + 2];

          linePos[lineIndex++] = positions[j * 3];
          linePos[lineIndex++] = positions[j * 3 + 1];
          linePos[lineIndex++] = positions[j * 3 + 2];

          // Cyan to Violet gradient lines
          lineCol[colorIndex++] = 0.36 * alpha;
          lineCol[colorIndex++] = 0.90 * alpha;
          lineCol[colorIndex++] = 1.00 * alpha;

          lineCol[colorIndex++] = 0.65 * alpha;
          lineCol[colorIndex++] = 0.33 * alpha;
          lineCol[colorIndex++] = 0.96 * alpha;
        }
      }
    }

    particleMesh.geometry.attributes.position.needsUpdate = true;
    lineMesh.geometry.attributes.position.needsUpdate = true;
    lineMesh.geometry.attributes.color.needsUpdate = true;
    lineMesh.geometry.setDrawRange(0, lineIndex / 3);

    renderer.render(scene, camera);
  }

  // =========================================================================
  // 2. Featured Video Player (BAR NONE Commercial)
  // =========================================================================
  const video = document.getElementById('showcase-video');
  const videoOverlay = document.getElementById('video-overlay');
  const bigPlayBtn = document.getElementById('big-play-btn');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const playIcon = document.getElementById('play-icon');
  const muteBtn = document.getElementById('mute-btn');
  const volumeIcon = document.getElementById('volume-icon');
  const replayBtn = document.getElementById('replay-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const videoProgressContainer = document.getElementById('video-progress-container');
  const videoProgressBar = document.getElementById('video-progress-bar');
  const videoTime = document.getElementById('video-time');
  const ambientGlow = document.getElementById('video-ambient-glow');

  function setupVideoPlayer() {
    if (!video) return;

    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function togglePlay() {
      if (video.paused || video.ended) {
        video.play();
        videoOverlay.classList.add('hidden');
        if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
        if (ambientGlow) ambientGlow.style.opacity = '1';
      } else {
        video.pause();
        videoOverlay.classList.remove('hidden');
        if (playIcon) playIcon.setAttribute('data-lucide', 'play');
        if (ambientGlow) ambientGlow.style.opacity = '0.4';
      }
      if (window.lucide) window.lucide.createIcons();
    }

    bigPlayBtn?.addEventListener('click', togglePlay);
    playPauseBtn?.addEventListener('click', togglePlay);
    videoOverlay?.addEventListener('click', togglePlay);

    video.addEventListener('timeupdate', () => {
      const current = video.currentTime;
      const duration = video.duration || 0;
      const percentage = (current / duration) * 100;
      if (videoProgressBar) videoProgressBar.style.width = `${percentage}%`;
      if (videoTime) videoTime.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    });

    video.addEventListener('ended', () => {
      videoOverlay.classList.remove('hidden');
      if (playIcon) playIcon.setAttribute('data-lucide', 'play');
      if (ambientGlow) ambientGlow.style.opacity = '0.5';
      if (window.lucide) window.lucide.createIcons();
    });

    muteBtn?.addEventListener('click', () => {
      video.muted = !video.muted;
      if (volumeIcon) {
        volumeIcon.setAttribute('data-lucide', video.muted ? 'volume-x' : 'volume-2');
        if (window.lucide) window.lucide.createIcons();
      }
    });

    replayBtn?.addEventListener('click', () => {
      video.currentTime = 0;
      video.play();
      videoOverlay.classList.add('hidden');
      if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
      if (window.lucide) window.lucide.createIcons();
    });

    fullscreenBtn?.addEventListener('click', () => {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      }
    });

    videoProgressContainer?.addEventListener('click', (e) => {
      const rect = videoProgressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * (video.duration || 0);
    });
  }

  // =========================================================================
  // 3. Inspector Tabs & Copy Buttons
  // =========================================================================
  function setupInspector() {
    const tabButtons = document.querySelectorAll('.inspector-tabs .tab-btn');
    const tabPanes = document.querySelectorAll('.inspector-panel .tab-pane');

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabButtons.forEach((b) => b.classList.remove('active'));
        tabPanes.forEach((p) => p.classList.remove('active'));

        btn.classList.add('active');
        const targetId = `tab-${btn.dataset.tab}`;
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    const copyBtn = document.getElementById('copy-prompt-btn');
    copyBtn?.addEventListener('click', () => {
      const code = document.querySelector('#tab-prompt code')?.innerText;
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          const span = copyBtn.querySelector('span');
          const original = span.textContent;
          span.textContent = 'Copied to Clipboard!';
          copyBtn.style.borderColor = 'var(--accent-cyan)';
          setTimeout(() => {
            span.textContent = original;
            copyBtn.style.borderColor = '';
          }, 2000);
        });
      }
    });
  }

  // =========================================================================
  // 4. Interactive Gemini Creative Lab
  // =========================================================================
  const defaultStoryboards = {
    'BAR NONE': [
      {
        shot: 'SHOT 01 — THE SNAP',
        title: 'Macro Fracture & Specification',
        desc: 'Extreme macro close-up on obsidian slate. A solid BAR NONE protein bar snaps cleanly down the center. Specular highlights bounce off dark chocolate gloss as roasted almond flakes disperse in zero-gravity slow motion.',
        lens: 'Cooke Anamorphic 100mm Macro · f/1.8 · 1000 FPS',
        lighting: 'Warm key softbox at 45°, rim illumination on chocolate ridges'
      },
      {
        shot: 'SHOT 02 — APPETITE TEXTURE',
        title: 'Nutrient Core Cross-Section',
        desc: 'Camera floats sideways along the newly exposed bar interior. Visible golden honey caramel binding puffed quinoa, whole California almonds, and rich raw cacao nibs.',
        lens: 'Panavision Primo Anamorphic · f/2.2 · Slow Pan',
        lighting: 'Prismatic golden hour backlight with volumetric micro-dust particles'
      },
      {
        shot: 'SHOT 03 — ARCHITECTURAL STILL LIFE',
        title: 'The Modern Fuel Monolith',
        desc: 'Low-angle cinematic pedestal shot. The two halves rest upright against each other like architectural monuments, surrounded by crisp roasted nuts and packaging with clean minimalist typography.',
        lens: 'ARRI Master Prime 50mm · f/2.8 · Dolly Out',
        lighting: 'Deep moody low-key fill, intense contrast obsidian reflections'
      },
      {
        shot: 'SHOT 04 — BRAND RESOLUTION',
        title: 'PROTEIN. BEYOND THE GYM.',
        desc: 'Clean editorial title card fades over the hero product with subtle light leak. The tagline reflects functional luxury for creative thinkers, makers, and innovators.',
        lens: 'Static 4K Master Composition · ACEScc Color Grade',
        lighting: 'Cyan ambient undertone, subtle warm golden fill'
      }
    ]
  };

  function renderStoryboard(shots) {
    const container = document.getElementById('storyboard-output');
    if (!container) return;

    container.innerHTML = shots
      .map(
        (s) => `
      <div class="storyboard-card">
        <span class="sb-shot-tag">${s.shot}</span>
        <h4 class="sb-shot-title">${s.title}</h4>
        <p class="sb-shot-desc">${s.desc}</p>
        <div class="sb-shot-meta">
          <div><strong>Optics:</strong> ${s.lens}</div>
          <div><strong>Atmosphere:</strong> ${s.lighting}</div>
        </div>
      </div>
    `
      )
      .join('');
  }

  function setupCreativeLab() {
    // Mode switcher
    const modeBtns = document.querySelectorAll('.lab-mode-btn');
    const tools = {
      storyboard: document.getElementById('tool-storyboard'),
      alchemist: document.getElementById('tool-alchemist'),
      persona: document.getElementById('tool-persona')
    };

    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        Object.values(tools).forEach((t) => t?.classList.remove('active'));
        const mode = btn.dataset.mode;
        if (tools[mode]) tools[mode].classList.add('active');
      });
    });

    // API Key Popover
    const apiKeyBtn = document.getElementById('api-key-toggle-btn');
    const apiKeyPopover = document.getElementById('api-key-popover');
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    const apiKeyInput = document.getElementById('gemini-api-key-input');
    const apiKeyStatus = document.getElementById('api-key-status-text');

    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      if (apiKeyInput) apiKeyInput.value = savedKey;
      if (apiKeyStatus) apiKeyStatus.textContent = 'Gemini Live Connected';
      apiKeyBtn?.classList.add('active');
    }

    apiKeyBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      apiKeyPopover?.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!apiKeyPopover?.contains(e.target) && e.target !== apiKeyBtn) {
        apiKeyPopover?.classList.remove('show');
      }
    });

    saveApiKeyBtn?.addEventListener('click', () => {
      const key = apiKeyInput?.value.trim();
      if (key) {
        localStorage.setItem('gemini_api_key', key);
        if (apiKeyStatus) apiKeyStatus.textContent = 'Gemini Live Connected';
        alert('Gemini API key saved for this browser session!');
      } else {
        localStorage.removeItem('gemini_api_key');
        if (apiKeyStatus) apiKeyStatus.textContent = 'Using Demo Mode (Instant)';
      }
      apiKeyPopover?.classList.remove('show');
    });

    // Storyboard Generator
    renderStoryboard(defaultStoryboards['BAR NONE']);

    const generateSbBtn = document.getElementById('generate-storyboard-btn');
    const regenerateSbBtn = document.getElementById('regenerate-sb-btn');

    function generateCustomStoryboard() {
      const product = document.getElementById('sb-product')?.value || 'AURA';
      const category = document.getElementById('sb-category')?.value || 'protein-food';
      const mood = document.getElementById('sb-mood')?.value || 'moody-macro';

      generateSbBtn.disabled = true;
      generateSbBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Synthesizing Treatment...';
      if (window.lucide) window.lucide.createIcons();

      setTimeout(() => {
        const generatedShots = [
          {
            shot: 'SHOT 01 — THE HOOK',
            title: `Macro Awakening of ${product}`,
            desc: `Extreme telephoto probe lens pushing through a veil of atmospheric vapor onto ${product}. Light caresses the textured silhouette, emphasizing pure culinary craftsmanship and tactile materials.`,
            lens: 'Laowa 24mm Probe Lens · f/14 · Controlled Motion Control Rig',
            lighting: `Curated ${mood} with high contrast rim accents and rich shadows`
          },
          {
            shot: 'SHOT 02 — THE METAMORPHOSIS',
            title: 'Dynamic Particle Dispersal',
            desc: `High-speed 1000 FPS capture of the primary elements separating in slow motion. Specular highlights scatter across dark slate, celebrating natural ingredients and architectural purity.`,
            lens: 'Phantom Flex 4K · 100mm Macro · f/2.0',
            lighting: 'Dual 1.2kW HMI Fresnels bounced through bleached muslin'
          },
          {
            shot: 'SHOT 03 — SENSORY REALISM',
            title: 'Material Elevation & Form',
            desc: `360-degree orbital sweep tracking around the centerpiece. Prismatic optical flares refract across glossy edges as fine golden dust glides gently in the background.`,
            lens: 'Cooke Anamorphic /i Full Frame Plus 65mm',
            lighting: 'Warm 3200K tungsten kicker against deep 5600K cyan ambiance'
          },
          {
            shot: 'SHOT 04 — ICONIC BRANDING',
            title: `${product.toUpperCase()} — BEYOND BOUNDARIES`,
            desc: `Hero lockup on a sleek stone monolith. Minimalist typography cuts cleanly through cinematic smoke, creating an aspirational luxury statement.`,
            lens: 'Master Prime 35mm · Crisp Edge Contrast · ACES Film Emulation',
            lighting: 'Balanced studio fill with intentional dark negative space'
          }
        ];

        renderStoryboard(generatedShots);
        generateSbBtn.disabled = false;
        generateSbBtn.innerHTML = '<i data-lucide="sparkles"></i> <span>Generate Storyboard</span>';
        if (window.lucide) window.lucide.createIcons();

        // Trigger confetti celebration
        if (window.confetti) {
          window.confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
        }
      }, 700);
    }

    generateSbBtn?.addEventListener('click', generateCustomStoryboard);
    regenerateSbBtn?.addEventListener('click', generateCustomStoryboard);

    // Copy Storyboard
    document.getElementById('copy-storyboard-btn')?.addEventListener('click', () => {
      const cards = document.querySelectorAll('.storyboard-card');
      let text = '';
      cards.forEach((c) => {
        text += c.innerText + '\n\n---\n\n';
      });
      navigator.clipboard.writeText(text).then(() => {
        alert('Storyboard copied to clipboard!');
      });
    });

    // Prompt Alchemist
    const alchemizeBtn = document.getElementById('alchemize-btn');
    const rawPromptInput = document.getElementById('raw-prompt-input');
    const alchemistOutput = document.getElementById('alchemist-output');
    const copyAlchemistBtn = document.getElementById('copy-alchemist-btn');

    // Chip selection
    const chips = document.querySelectorAll('#aspect-ratio-chips .chip');
    chips.forEach((c) => {
      c.addEventListener('click', () => {
        chips.forEach((ch) => ch.classList.remove('active'));
        c.classList.add('active');
      });
    });

    alchemizeBtn?.addEventListener('click', () => {
      const raw = rawPromptInput?.value.trim() || 'A chocolate bar breaking with roasted nuts on dark stone';
      const activeAspect = document.querySelector('#aspect-ratio-chips .chip.active')?.dataset.val || '16:9';
      const cameraRig = document.getElementById('camera-rig-select')?.value || 'arri-macro';

      alchemizeBtn.disabled = true;
      alchemizeBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Alchemizing...';
      if (window.lucide) window.lucide.createIcons();

      setTimeout(() => {
        const enhancedJSON = {
          "model_target": "Google Veo (Video Generation) / Imagen 3",
          "aspect_ratio": activeAspect,
          "camera_system": cameraRig === 'arri-macro' ? "ARRI Alexa 65 with Cooke Anamorphic /i 100mm Macro" : "Phantom Flex 4K High-Speed 1000fps",
          "lighting": "Low-key chiaroscuro with 45-degree softbox key and warm specular edge highlights",
          "subject_composition": `${raw}. Hyper-tactile material definition, zero-gravity micro-crumb kinematics, specular liquid sheen on chocolate coating`,
          "color_space": "ACEScc with rich deep shadows (#020711), luminous golden undertones, and anamorphic blue streak flares",
          "diffusion_parameters": {
            "motion_bucket": 127,
            "cfg_scale": 7.5,
            "temporal_coherence": "maximum",
            "fps": 24
          }
        };

        alchemistOutput.innerHTML = `<pre class="code-block"><code>${syntaxHighlight(JSON.stringify(enhancedJSON, null, 2))}</code></pre>`;
        alchemizeBtn.disabled = false;
        alchemizeBtn.innerHTML = '<i data-lucide="wand-2"></i> <span>Alchemize Prompt</span>';
        if (window.lucide) window.lucide.createIcons();
      }, 600);
    });

    copyAlchemistBtn?.addEventListener('click', () => {
      const text = alchemistOutput?.innerText;
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          alert('Alchemized prompt copied!');
        });
      }
    });

    // AI Fellow Persona Chat
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');

    const personaKnowledge = {
      'bar none': "For the BAR NONE commercial, our goal was to redefine how protein snacks are portrayed in visual culture. Rather than typical gym locker-room clichés, we approached it with culinary luxury: macro anamorphic lenses, low-key obsidian surfaces, and high-speed crumb kinematics in Google Veo.",
      'tech stack': "My creative technologist stack centers on: Google Gemini 2.5 Pro for creative scripting and prompt architecture, Google Veo and Imagen 3 for diffusion visuals, Three.js & WebGL for real-time spatial interaction, and Framer Motion with modern TypeScript.",
      'temporal coherence': "Maintaining temporal consistency in AI video requires three key techniques: 1) Anchor prompts with strict architectural geometry and camera trajectories; 2) Fine-tuning motion bucket values (typically between 120-135); 3) Multi-stage latent keyframing in Imagen 3 prior to temporal expansion in Veo.",
      'fellowship': "As an AI Fellow, my mission is to pioneer methodologies that bridge human emotional intuition with machine intelligence—treating generative models not as automation tools, but as conversational co-directors.",
      'default': "That's a fascinating area of creative technology. In my practice, whether crafting cinematic spots or developing interactive 3D installations, I prioritize sensory depth, physical realism, and narrative elegance. Would you like to explore a specific prompt or technique?"
    };

    function addChatMessage(role, text) {
      const msg = document.createElement('div');
      msg.className = `chat-message ${role}`;
      msg.innerHTML = `
        <div class="chat-avatar">${role === 'assistant' ? 'MR' : 'YOU'}</div>
        <div class="chat-bubble"><p>${text}</p></div>
      `;
      chatMessages.appendChild(msg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function handleSend() {
      const query = chatInput?.value.trim();
      if (!query) return;

      addChatMessage('user', query);
      chatInput.value = '';

      // Check for responses
      setTimeout(() => {
        const lower = query.toLowerCase();
        let reply = personaKnowledge['default'];
        if (lower.includes('bar none') || lower.includes('commercial')) {
          reply = personaKnowledge['bar none'];
        } else if (lower.includes('stack') || lower.includes('tools') || lower.includes('technology')) {
          reply = personaKnowledge['tech stack'];
        } else if (lower.includes('temporal') || lower.includes('coherence') || lower.includes('flicker')) {
          reply = personaKnowledge['temporal coherence'];
        } else if (lower.includes('fellow') || lower.includes('who are you') || lower.includes('philosophy')) {
          reply = personaKnowledge['fellowship'];
        }
        addChatMessage('assistant', reply);
      }, 500);
    }

    chatSendBtn?.addEventListener('click', handleSend);
    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    suggestionChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        if (chatInput) chatInput.value = chip.textContent;
        handleSend();
      });
    });
  }

  function syntaxHighlight(json) {
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'token-string';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'token-key';
        }
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  // =========================================================================
  // 5. Selected Works & Case Studies Filter & Modal
  // =========================================================================
  const projectData = {
    'bar-none': {
      title: 'BAR NONE™ — Protein. Beyond The Gym',
      category: 'AI Product Commercial',
      tags: ['ChatGPT', 'Google Flow', 'Canva', 'Google Veo', 'Gemini'],
      media: '<video src="assets/video/bar-none.mp4" poster="assets/video/bar-none-poster.png" preload="metadata" controls autoplay playsinline loop></video>',
      desc: 'An end-to-end AI-directed commercial exploring appetite appeal, food textures, and micro-particle scattering. Replaces generic fitness commercial tropes with dark culinary luxury.',
      metrics: [
        { label: 'Platform', val: 'Google Veo + Gemini' },
        { label: 'Resolution', val: '1080p Cinematic' },
        { label: 'Frame Coherence', val: '99.4%' },
        { label: 'Role', val: 'Director & Prompt Architect' }
      ]
    },
    'karuppasamy-temple': {
      title: 'KARUPPASAMY TEMPLE',
      category: 'AI Cinematic Documentary',
      tags: ['ChatGPT', 'Gemini', 'Claude', 'Google Flow', 'Canva'],
      media: '<video src="assets/video/karuppasamy-temple.mp4" poster="assets/images/karuppasamy-temple.png" preload="metadata" controls autoplay playsinline loop style="width:100%;border-radius:12px;"></video>',
      desc: 'A cinematic AI-generated documentary-style video that explores the sacred atmosphere, traditions and cultural essence of ancient South Indian folklore with evocative golden firelight and twilight mountain atmospheres.',
      metrics: [
        { label: 'Genre', val: 'Cultural Heritage Documentary' },
        { label: 'Aesthetics', val: 'Twilight Gopuram & Diyas' },
        { label: 'Pipeline', val: 'Multimodal Scripting + Diffusion' },
        { label: 'Role', val: 'Visual Director & Researcher' }
      ]
    },
    'brain-let-go': {
      title: "WHY CAN'T YOUR BRAIN LET IT GO?",
      category: 'AI Educational Carousel',
      tags: ['Gemini', 'Claude', 'ChatGPT', 'Midjourney', 'Canva'],
      media: '<div class="modal-carousel-wrapper" id="modal-brain-carousel">' +
        '<div class="modal-carousel-track">' +
          '<img src="assets/images/carousel/brain-slide-1.jpg" id="modal-carousel-active-img" alt="Why Can\'t Your Brain Let It Go? - Slide 1" style="width:100%;max-height:460px;object-fit:contain;border-radius:12px;cursor:pointer;" />' +
        '</div>' +
        '<div class="modal-carousel-thumbs">' +
          '<img src="assets/images/carousel/brain-slide-1.jpg" class="modal-thumb active" data-slide="0" alt="Slide 1: Why Can\'t Your Brain Let It Go?" title="Slide 1: Hook & Core Question" />' +
          '<img src="assets/images/carousel/brain-slide-2.jpg" class="modal-thumb" data-slide="1" alt="Slide 2: Built to Remember the Cringe" title="Slide 2: Survival Architecture" />' +
          '<img src="assets/images/carousel/brain-slide-3.jpg" class="modal-thumb" data-slide="2" alt="Slide 3: The More You Replay It" title="Slide 3: Reinforcement Loops" />' +
          '<img src="assets/images/carousel/brain-slide-4.jpg" class="modal-thumb" data-slide="3" alt="Slide 4: Change Its Power" title="Slide 4: Emotional Neutralization" />' +
        '</div>' +
        '<div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--accent-cyan);display:flex;align-items:center;gap:6px;margin-top:4px;">' +
          '<span>Click slide or thumbnails to cycle through all 4 carousel pages</span>' +
        '</div>' +
      '</div>',
      desc: 'An AI-powered educational carousel that turns a complex psychological concept into a simple, relatable and visually captivating breakdown using schematic cognitive loop diagrams and relatable visual storytelling.',
      metrics: [
        { label: 'Format', val: '4-Slide High-Impact Carousel' },
        { label: 'Slide 1', val: "Why Can't Your Brain Let It Go?" },
        { label: 'Slide 2', val: 'Your Brain is Built to Remember the Cringe' },
        { label: 'Slide 3', val: 'The More You Replay It, The Stronger The Memory' },
        { label: 'Slide 4', val: "You Can't Erase The Memory, But You Can Change Its Power" },
        { label: 'Tools', val: 'Gemini + Midjourney + Brandbird + Canva' },
        { label: 'Role', val: 'Information Designer & Technologist' }
      ]
    },
    'campa-energy': {
      title: 'CAMPA ENERGY',
      category: 'Commercial Video Spec',
      tags: ['Midjourney', 'Google Flow', 'Gemini', 'Suno'],
      media: '<div style="position:relative;width:100%;background:#020713;border-radius:12px;overflow:hidden;"><video controls autoplay playsinline poster="assets/images/campa-energy.png" style="width:100%;max-height:440px;display:block;border-radius:12px;"><source src="assets/video/campa-energy.mp4" type="video/mp4" /><source src="Campa.mp4" type="video/mp4" /></video></div>',
      desc: 'A vibrant personal creative spec film showcasing kinetic typography, surging electric citrus liquid flows, and hyper-caffeinated energy aesthetics.',
      metrics: [
        { label: 'Soundtrack', val: 'Suno AI Sonic Score' },
        { label: 'Visual Style', val: 'Kinetic Citrus Hyper-Speed' },
        { label: 'Model', val: 'Google Flow Diffusion' },
        { label: 'Resolution', val: '1280 × 720 HD' },
        { label: 'Role', val: 'Commercial Director' }
      ]
    },
    'wild-stone': {
      title: 'WILD STONE',
      category: 'Commercial Video Spec',
      tags: ['Midjourney', 'Google Flow', 'Canva'],
      media: '<div style="position:relative;width:100%;background:#020713;border-radius:12px;overflow:hidden;"><video controls autoplay playsinline poster="assets/images/wild-stone.png" style="width:100%;max-height:440px;display:block;border-radius:12px;"><source src="assets/video/wild-stone.mp4" type="video/mp4" /><source src="Wild Stone.mp4" type="video/mp4" /></video></div>',
      desc: 'An atmospheric personal spec piece capturing primal elemental textures, volcanic obsidian rock, and mist-shrouded fragrance notes.',
      metrics: [
        { label: 'Texture Study', val: 'Obsidian & Volcanic Basalt' },
        { label: 'Atmosphere', val: 'Cold Mist & Primal Cedar' },
        { label: 'Frame Consistency', val: 'Custom Latent Seeds' },
        { label: 'Resolution', val: '1280 × 720 HD' },
        { label: 'Role', val: 'Creative Director' }
      ]
    },
    'ibaco': {
      title: 'IBACO',
      category: 'Commercial Video Spec',
      tags: ['Midjourney', 'Google Flow', 'Canva'],
      media: '<div style="position:relative;width:100%;background:#020713;border-radius:12px;overflow:hidden;"><video controls autoplay playsinline poster="assets/images/ibaco.png" style="width:100%;max-height:440px;display:block;border-radius:12px;"><source src="assets/video/ibaco.mp4" type="video/mp4" /><source src="Ibaco.mp4" type="video/mp4" /></video></div>',
      desc: 'A sensory personal spec project exploring fluid chocolate viscosity, velvety scoops, and decadent confectionery diffusion.',
      metrics: [
        { label: 'Physics Focus', val: 'Chocolate Viscosity & Melting Point' },
        { label: 'Color Grade', val: 'Warm Cocoa & Gold Caustics' },
        { label: 'Client Target', val: 'Luxury Gourmet Confectionery' },
        { label: 'Resolution', val: '1280 × 720 HD' },
        { label: 'Role', val: 'Prompt Architect & Designer' }
      ]
    },
    'life-on-mars': {
      title: 'LIFE ON MARS',
      category: 'AI Education Film',
      tags: ['Midjourney', 'Google Flow', 'Claude', 'Suno'],
      media: '<div style="position:relative;width:100%;background:#020713;border-radius:12px;overflow:hidden;"><video controls autoplay playsinline poster="assets/images/life-on-mars.png" style="width:100%;max-height:440px;display:block;border-radius:12px;"><source src="assets/video/life-on-mars.mp4" type="video/mp4" /><source src="Mars.mp4" type="video/mp4" /></video></div>',
      desc: "A speculative science visual essay examining terraforming, sub-surface ice caverns, and humanity's multi-planetary future.",
      metrics: [
        { label: 'Setting', val: 'Valles Marineris, Mars' },
        { label: 'Scientific Basis', val: 'NASA Sub-surface Ice Data' },
        { label: 'Visual Narrative', val: 'Cinematic Speculative 8K' },
        { label: 'Resolution', val: '1280 × 720 HD' },
        { label: 'Role', val: 'Director & Researcher' }
      ]
    },
    'women-struggles': {
      title: 'WOMEN STRUGGLES',
      category: 'AI Visual Storytelling',
      tags: ['Midjourney', 'ChatGPT', 'Canva'],
      media: '<div style="width:100%;max-height:480px;display:flex;justify-content:center;background:#020713;border-radius:12px;overflow:hidden;"><img src="assets/images/women-struggles.jpg" alt="Women Struggles - AI Visual Storytelling" style="width:100%;height:auto;max-height:480px;object-fit:contain;border-radius:12px;display:block;" /></div>',
      desc: 'A poignant, cinematic AI visual narrative depicting societal burdens, resilience, and the unyielding pursuit of education, career, and personal dignity.',
      metrics: [
        { label: 'Medium', val: 'High-Impact Visual Narrative' },
        { label: 'Subject', val: 'Education, Career, Autonomy vs Social Pressures' },
        { label: 'Tone', val: 'Poetic, Urgent & Empathetic' },
        { label: 'Composition', val: 'Headline Weight & Cinematic Lighting' },
        { label: 'Role', val: 'Visual Storyteller & Concept Creator' }
      ]
    }
  };

  function setupProjects() {
    // Both new filter pill buttons and legacy filter buttons
    const filterPills = document.querySelectorAll('.filter-pill-btn, .filter-btn');
    const cards = document.querySelectorAll('.work-card, .project-card');

    filterPills.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterPills.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = (btn.dataset.filter || '').toLowerCase();
        cards.forEach((card) => {
          if (filter === 'all') {
            card.style.display = 'flex';
          } else {
            const cats = (card.dataset.category || '').toLowerCase();
            card.style.display = cats.includes(filter) ? 'flex' : 'none';
          }
        });
      });
    });

    // Card click opens modal (unless clicking directly on thumbnail)
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('.work-card-media')) return;
        const id = card.dataset.project;
        if (id) openModal(id);
      });
    });

    // Reusable Video Player Controller for Work Cards & Case Studies
    function setupVideoPlayerElement(mediaId, videoId, overlayId, soundId) {
      const media = document.getElementById(mediaId);
      const video = document.getElementById(videoId);
      const overlay = document.getElementById(overlayId);
      const sound = document.getElementById(soundId);

      if (!media || !video) return;

      // Instant pre-buffering on hover/touch before user clicks play
      media.addEventListener('pointerenter', () => {
        if (video.paused && video.readyState < 2) {
          if (video.preload === 'none') {
            video.preload = 'metadata';
          }
        }
      }, { once: true });

      function updatePlayIcon(iconName) {
        const circle = overlay?.querySelector('.work-play-circle, .study-play-circle');
        if (circle) {
          circle.innerHTML = `<i data-lucide="${iconName}" class="work-play-icon"></i>`;
          if (window.lucide) window.lucide.createIcons();
        }
      }

      function showBuffering() {
        overlay?.classList.add('buffering');
        const circle = overlay?.querySelector('.work-play-circle, .study-play-circle');
        if (circle) {
          circle.innerHTML = '<div class="video-buffer-spinner"></div>';
        }
      }

      function hideBuffering() {
        overlay?.classList.remove('buffering');
      }

      video.addEventListener('waiting', () => {
        showBuffering();
      });

      video.addEventListener('playing', () => {
        hideBuffering();
        overlay?.classList.add('playing');
        sound?.classList.add('show');
        updatePlayIcon('pause');
      });

      video.addEventListener('pause', () => {
        hideBuffering();
        overlay?.classList.remove('playing');
        updatePlayIcon('play');
      });

      video.addEventListener('ended', () => {
        hideBuffering();
        overlay?.classList.remove('playing');
        updatePlayIcon('play');
      });

      function toggleVideo(e) {
        if (e.target.closest('.video-sound-pill')) return;
        e.stopPropagation();

        // Pause other active videos across the site
        document.querySelectorAll('.work-card-video, .study-media-video').forEach((v) => {
          if (v !== video && !v.paused) {
            v.pause();
          }
        });

        if (video.paused) {
          if (video.preload === 'none') {
            video.preload = 'auto';
          }
          showBuffering();
          video.play().catch((err) => {
            console.log('Video play error:', err);
            hideBuffering();
            overlay?.classList.remove('playing');
            updatePlayIcon('play');
          });
        } else {
          video.pause();
        }
      }

      media.addEventListener('click', toggleVideo);

      sound?.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        sound.innerHTML = video.muted ? '<i data-lucide="volume-x"></i>' : '<i data-lucide="volume-2"></i>';
        if (window.lucide) window.lucide.createIcons();
      });
    }

    // Initialize all work card video players
    setupVideoPlayerElement('bar-none-card-media', 'bar-none-work-video', 'bar-none-work-play-overlay', 'bar-none-sound-toggle');
    setupVideoPlayerElement('temple-card-media', 'temple-work-video', 'temple-work-play-overlay', 'temple-sound-toggle');
    setupVideoPlayerElement('campa-card-media', 'campa-work-video', 'campa-work-play-overlay', 'campa-sound-toggle');
    setupVideoPlayerElement('wild-stone-card-media', 'wild-stone-work-video', 'wild-stone-work-play-overlay', 'wild-stone-sound-toggle');
    setupVideoPlayerElement('ibaco-card-media', 'ibaco-work-video', 'ibaco-work-play-overlay', 'ibaco-sound-toggle');
    setupVideoPlayerElement('mars-card-media', 'mars-work-video', 'mars-work-play-overlay', 'mars-sound-toggle');

    // Initialize case study video players
    setupVideoPlayerElement('study-bar-none-media', 'study-bar-none-video', 'study-bar-none-play-overlay', 'study-bar-none-sound-toggle');
    setupVideoPlayerElement('study-temple-media', 'study-temple-video', 'study-temple-play-overlay', 'study-temple-sound-toggle');

    // Lazy Preloader via IntersectionObserver:
    // Only pre-warm video metadata when the card scrolls within 250px of the viewport,
    // ensuring initial page load does not download below-the-fold videos.
    if ('IntersectionObserver' in window) {
      const videoCardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const vid = entry.target.querySelector('video');
            if (vid && vid.preload === 'none') {
              vid.preload = 'metadata';
            }
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '250px 0px' });

      document.querySelectorAll('.work-card-media, .study-media-wrapper').forEach((el) => {
        videoCardObserver.observe(el);
      });
    }

    // Click handler for Women Struggles image card
    const womenMedia = document.getElementById('women-struggles-card-media');
    womenMedia?.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal('women-struggles');
    });

    // Reusable Carousel Controller
    function setupCarousel(cardId, trackId, slideSelector, dotsSelector, counterId, prevBtnId, nextBtnId) {
      const card = document.getElementById(cardId);
      const slides = document.querySelectorAll(slideSelector);
      const dots = document.querySelectorAll(dotsSelector);
      const counter = document.getElementById(counterId);
      const prevBtn = document.getElementById(prevBtnId);
      const nextBtn = document.getElementById(nextBtnId);
      const track = document.getElementById(trackId);

      if (!card || slides.length === 0) return;

      let currentSlide = 0;
      const totalSlides = slides.length;

      function goToSlide(index) {
        currentSlide = (index + totalSlides) % totalSlides;
        slides.forEach((s, idx) => s.classList.toggle('active', idx === currentSlide));
        dots.forEach((d, idx) => d.classList.toggle('active', idx === currentSlide));
        if (counter) counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
      }

      prevBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        goToSlide(currentSlide - 1);
      });

      nextBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        goToSlide(currentSlide + 1);
      });

      dots.forEach((dot) => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          const idx = parseInt(dot.dataset.slide, 10);
          if (!isNaN(idx)) goToSlide(idx);
        });
      });

      track?.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(currentSlide + 1);
      });

      let touchStartX = 0;
      let touchEndX = 0;
      track?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      track?.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 35) goToSlide(currentSlide + 1);
        else if (touchEndX - touchStartX > 35) goToSlide(currentSlide - 1);
      }, { passive: true });
    }

    // Initialize Work Card Carousel
    setupCarousel(
      'brain-carousel-card',
      'brain-carousel-track',
      '#brain-carousel-track .carousel-slide',
      '#brain-carousel-dots .carousel-dot',
      'brain-counter-pill',
      'brain-carousel-prev',
      'brain-carousel-next'
    );

    // Initialize Case Study 03 Carousel
    setupCarousel(
      'study-brain-carousel-card',
      'study-brain-carousel-track',
      '#study-brain-carousel-track .study-carousel-slide',
      '#study-brain-carousel-dots .carousel-dot',
      'study-brain-counter-pill',
      'study-brain-carousel-prev',
      'study-brain-carousel-next'
    );

    // Dedicated Fullscreen Carousel Reader Modal Setup
    function setupCarouselReaderModal() {
      const readerModal = document.getElementById('carousel-reader-modal');
      if (!readerModal) return;

      const overlay = document.getElementById('carousel-reader-overlay');
      const closeBtn = document.getElementById('carousel-reader-close-btn');
      const activeImg = document.getElementById('reader-active-img');
      const slideWrapper = document.getElementById('reader-slide-wrapper');
      const prevBtn = document.getElementById('reader-btn-prev');
      const nextBtn = document.getElementById('reader-btn-next');
      const counterPill = document.getElementById('reader-counter-pill');
      const topicTitle = document.getElementById('reader-topic-title');
      const topicDesc = document.getElementById('reader-topic-desc');
      const thumbItems = document.querySelectorAll('.reader-thumb-item');

      const slidesData = [
        {
          src: 'assets/images/carousel/brain-slide-1.jpg',
          title: "1. Core Hook: Why Can't Your Brain Let It Go?",
          desc: "The Science of Rumination: Understanding why repetitive loops and awkward memories replay in our consciousness.",
          alt: "Why Can't Your Brain Let It Go? - Slide 1"
        },
        {
          src: 'assets/images/carousel/brain-slide-2.jpg',
          title: "2. Survival Architecture: Your Brain is Built to Remember the Cringe",
          desc: "Evolutionary Threat Detection: Negative social experiences triggered ancient tribal survival alarm systems.",
          alt: "Your Brain is Built to Remember the Cringe - Slide 2"
        },
        {
          src: 'assets/images/carousel/brain-slide-3.jpg',
          title: "3. Reinforcement Loops: The More You Replay It, The Stronger The Memory",
          desc: "Synaptic Plasticity & Rehearsal Bias: Active rumination physically strengthens neural pathways in the cortex.",
          alt: "The More You Replay It, The Stronger The Memory - Slide 3"
        },
        {
          src: 'assets/images/carousel/brain-slide-4.jpg',
          title: "4. Cognitive Reframing: You Can't Erase The Memory, But You Can Change Its Power",
          desc: "Actionable Mental Models: Neutralizing cringe by normalizing imperfection and stepping out of reflexive feedback loops.",
          alt: "You Can't Erase The Memory, But You Can Change Its Power - Slide 4"
        }
      ];

      let currentReaderIndex = 0;

      function renderReaderSlide(idx) {
        if (idx < 0) idx = slidesData.length - 1;
        if (idx >= slidesData.length) idx = 0;
        currentReaderIndex = idx;

        const data = slidesData[currentReaderIndex];
        if (activeImg) {
          activeImg.src = data.src;
          activeImg.alt = data.alt;
        }
        if (counterPill) {
          counterPill.textContent = `${currentReaderIndex + 1} / ${slidesData.length}`;
        }
        if (topicTitle) {
          topicTitle.textContent = data.title;
        }
        if (topicDesc) {
          topicDesc.textContent = data.desc;
        }

        thumbItems.forEach((thumb, i) => {
          if (i === currentReaderIndex) {
            thumb.classList.add('active');
          } else {
            thumb.classList.remove('active');
          }
        });
      }

      function openReader(initialIndex = 0) {
        renderReaderSlide(initialIndex);
        readerModal.classList.add('open');
        readerModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (window.lucide) window.lucide.createIcons();
      }

      function closeReader() {
        readerModal.classList.remove('open');
        readerModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      prevBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        renderReaderSlide(currentReaderIndex - 1);
      });

      nextBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        renderReaderSlide(currentReaderIndex + 1);
      });

      slideWrapper?.addEventListener('click', (e) => {
        e.stopPropagation();
        renderReaderSlide(currentReaderIndex + 1);
      });

      thumbItems.forEach((thumb) => {
        thumb.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(thumb.dataset.index, 10);
          if (!isNaN(idx)) renderReaderSlide(idx);
        });
      });

      closeBtn?.addEventListener('click', closeReader);
      overlay?.addEventListener('click', closeReader);

      window.addEventListener('keydown', (e) => {
        if (!readerModal.classList.contains('open')) return;
        if (e.key === 'Escape') {
          closeReader();
        } else if (e.key === 'ArrowLeft') {
          renderReaderSlide(currentReaderIndex - 1);
        } else if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          renderReaderSlide(currentReaderIndex + 1);
        }
      });

      // Work Page Expand Button
      const brainWorkExpandBtn = document.getElementById('brain-carousel-expand-btn');
      brainWorkExpandBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentActive = document.querySelector('#brain-carousel-track .carousel-slide.active');
        const idx = currentActive ? parseInt(currentActive.dataset.index, 10) : 0;
        openReader(isNaN(idx) ? 0 : idx);
      });

      // Work Page Slide Click
      document.querySelectorAll('#brain-carousel-track .carousel-slide').forEach((slide) => {
        slide.addEventListener('click', (e) => {
          if (e.target.closest('.carousel-nav-btn') || e.target.closest('.carousel-dots-bar')) return;
          const idx = parseInt(slide.dataset.index, 10);
          openReader(isNaN(idx) ? 0 : idx);
        });
      });

      // Case Study 03 Expand Button
      const brainStudyExpandBtn = document.getElementById('study-brain-carousel-expand-btn');
      brainStudyExpandBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentActive = document.querySelector('#study-brain-carousel-track .study-carousel-slide.active');
        const idx = currentActive ? parseInt(currentActive.dataset.index, 10) : 0;
        openReader(isNaN(idx) ? 0 : idx);
      });

      // Case Study 03 Slide Click
      document.querySelectorAll('#study-brain-carousel-track .study-carousel-slide').forEach((slide) => {
        slide.addEventListener('click', (e) => {
          if (e.target.closest('.carousel-nav-btn') || e.target.closest('.carousel-dots-bar')) return;
          const idx = parseInt(slide.dataset.index, 10);
          openReader(isNaN(idx) ? 0 : idx);
        });
      });

      window.openCarouselReaderModal = openReader;
    }

    setupCarouselReaderModal();

    // Modal Handling
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close-btn');
    const modalMedia = document.getElementById('modal-media');
    const modalContent = document.getElementById('modal-content');

    function openModal(id) {
      if (id === 'brain-let-go') {
        if (window.openCarouselReaderModal) {
          window.openCarouselReaderModal(0);
          return;
        }
      }

      const data = projectData[id];
      if (!data) return;

      modalMedia.innerHTML = data.media;
      modalContent.innerHTML = `
        <div class="project-tags" style="margin-bottom: 0.8rem;">
          ${data.tags.map((t) => `<span>${t}</span>`).join(' ')}
        </div>
        <h2 style="font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 0.8rem;">${data.title}</h2>
        <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem;">${data.desc}</p>
        <div class="params-table">
          ${data.metrics
            .map(
              (m) => `
            <div class="param-row">
              <span class="param-name">${m.label}</span>
              <span class="param-val">${m.val}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `;

      // Pause any active card videos
      document.querySelectorAll('.work-card-video, .study-media-video').forEach((v) => {
        if (!v.paused) {
          v.pause();
        }
      });

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (window.lucide) window.lucide.createIcons();
    }

    document.querySelectorAll('[data-project]').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (el.dataset.project === 'brain-let-go') {
          if (e.target.closest('.carousel-nav-btn') || e.target.closest('.carousel-dots-bar')) return;
          e.preventDefault();
          if (window.openCarouselReaderModal) {
            const currentActive = document.querySelector('#brain-carousel-track .carousel-slide.active');
            const idx = currentActive ? parseInt(currentActive.dataset.index, 10) : 0;
            window.openCarouselReaderModal(isNaN(idx) ? 0 : idx);
          }
          return;
        }

        if (el.classList.contains('work-card') && (e.target.closest('.work-card-media') || e.target.closest('a'))) return;
        e.preventDefault();
        openModal(el.dataset.project);
      });
    });

    function closeModal() {
      modal?.classList.remove('open');
      document.body.style.overflow = '';
      const v = modalMedia?.querySelector('video');
      if (v) v.pause();
      if (modalMedia) modalMedia.innerHTML = '';
    }

    modalClose?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // =========================================================================
  // 6. Confetti & Micro-interactions
  // =========================================================================
  function setupConfetti() {
    const heroSparkBtn = document.getElementById('confetti-hero-btn');
    heroSparkBtn?.addEventListener('click', () => {
      if (window.confetti) {
        window.confetti({
          particleCount: 80,
          spread: 80,
          colors: ['#5de6ff', '#a855f7', '#f43f5e', '#ffffff'],
          origin: { y: 0.6 }
        });
      }
    });

    const contactForm = document.getElementById('contact-form');
    const feedback = document.getElementById('contact-feedback');

    contactForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (feedback) {
        feedback.textContent = 'Transmission received. Mohan Raaju will review your creative brief shortly.';
        feedback.className = 'form-feedback success';
      }
      contactForm.reset();
      if (window.confetti) {
        window.confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.8 }
        });
      }
    });
  }

  // =========================================================================
  // 7. Interactive Developer CLI Terminal
  // =========================================================================
  function setupTerminal() {
    const terminalTrigger = document.getElementById('terminal-trigger-btn');
    const terminalDrawer = document.getElementById('terminal-drawer');
    const terminalClose = document.getElementById('terminal-close-btn');
    const terminalClose2 = document.getElementById('terminal-close-btn-2');
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');

    function toggleTerminal() {
      terminalDrawer?.classList.toggle('open');
      if (terminalDrawer?.classList.contains('open')) {
        terminalInput?.focus();
      }
    }

    const terminalHeroBtn = document.getElementById('terminal-trigger-hero');
    terminalHeroBtn?.addEventListener('click', toggleTerminal);
    terminalTrigger?.addEventListener('click', toggleTerminal);
    terminalClose?.addEventListener('click', toggleTerminal);
    terminalClose2?.addEventListener('click', toggleTerminal);

    document.addEventListener('keydown', (e) => {
      if (e.key === '`' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleTerminal();
      } else if (e.key === 'Escape' && terminalDrawer?.classList.contains('open')) {
        toggleTerminal();
      }
    });

    const commands = {
      help: 'Available commands:\n  • <span class="cmd-highlight">bio</span>: Mohan Raaju career & fellowship summary\n  • <span class="cmd-highlight">stack</span>: Generative AI & creative tech stack\n  • <span class="cmd-highlight">projects</span>: Curated portfolio case studies\n  • <span class="cmd-highlight">video</span>: Jump to BAR NONE commercial spotlight\n  • <span class="cmd-highlight">ai-status</span>: Gemini multimodal model connection\n  • <span class="cmd-highlight">confetti</span>: Trigger celebratory neural particle shower\n  • <span class="cmd-highlight">contact</span>: Inquiries and communication links\n  • <span class="cmd-highlight">clear</span>: Clear terminal console\n  • <span class="cmd-highlight">exit</span>: Close CLI drawer',
      bio: 'Mohan Raaju is an AI Fellow and Creative Technologist specializing in generative AI, multimodal storytelling, and real-time computational graphics. Known for pioneering commercial workflows using Google Veo, Gemini, and custom WebGL shaders.',
      stack: 'Tech Stack Matrix:\n  - Models: Gemini 2.5 Flash/Pro, Google Veo, Imagen 3, Runway Gen-3\n  - Frontend & Graphics: Three.js, WebGL GLSL, React 19, Vite\n  - Styling: Custom Design System + CSS Modules / Tailwind v4\n  - Motion: Framer Motion / Motion for React, Canvas-Confetti',
      projects: '1. BAR NONE™ — AI-Directed Commercial (Veo + Gemini)\n2. Neural Tapestry — Real-time WebGL audio-reactive environment\n3. Chronosynth — Speculative 4D cinematic short film\n4. Synthetic Realism — Prismatic luxury packaging studio',
      'ai-status': 'Model: Gemini 2.5 Multimodal Engine\nStatus: ONLINE\nContext Window: 2,000,000 Tokens\nCapabilities: Vision, Video Diffusion Prompts, Code Synthesis, Creative Direction',
      contact: 'Email: mohan.aicreator99@gmail.com\nPhone / WhatsApp: +91 9677351772\nX / Twitter: https://x.com/MohanRaaju99',
      confetti: () => {
        if (window.confetti) {
          window.confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
        }
        return 'Neural sparks unleashed across all dimensions!';
      },
      video: () => {
        window.location.hash = '#spotlight';
        video?.play();
        videoOverlay?.classList.add('hidden');
        return 'Navigating to featured commercial spotlight & playing video...';
      },
      clear: () => {
        if (terminalOutput) {
          terminalOutput.innerHTML = '';
        }
        return '';
      },
      exit: () => {
        toggleTerminal();
        return 'Closing terminal session...';
      }
    };

    terminalInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const line = terminalInput.value.trim().toLowerCase();
        terminalInput.value = '';
        if (!line) return;

        const cmdRow = document.createElement('div');
        cmdRow.className = 'terminal-line';
        cmdRow.innerHTML = `<span class="terminal-sym">mohan@studio $</span> <span>${line}</span>`;
        terminalOutput.appendChild(cmdRow);

        let response = commands[line];
        if (typeof response === 'function') {
          response = response();
        } else if (!response) {
          response = `Command not recognized: "${line}". Type <span class="cmd-highlight">help</span> for valid directives.`;
        }

        if (response) {
          const respRow = document.createElement('div');
          respRow.className = 'terminal-line';
          respRow.innerHTML = response.replace(/\n/g, '<br/>');
          terminalOutput.appendChild(respRow);
        }

        terminalOutput.scrollTop = terminalOutput.scrollHeight;
      }
    });
  }

  // =========================================================================
  // 8. Hero Stage Card 3D Tilt & Cube Hotspot Details
  // =========================================================================
  function setupHeroStage() {
    const card = document.getElementById('hologram-stage-card');
    if (!card) return;

    // Ensure hero video autoplays reliably across all mobile and desktop browsers
    const heroVideo = card.querySelector('.hologram-main-video');
    if (heroVideo) {
      heroVideo.muted = true;
      const playPromise = heroVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const startPlayback = () => {
            heroVideo.play().catch(() => {});
            window.removeEventListener('scroll', startPlayback);
            window.removeEventListener('touchstart', startPlayback);
            window.removeEventListener('click', startPlayback);
          };
          window.addEventListener('scroll', startPlayback, { passive: true, once: true });
          window.addEventListener('touchstart', startPlayback, { passive: true, once: true });
          window.addEventListener('click', startPlayback, { passive: true, once: true });
        });
      }
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotateX = -(y / (rect.height / 2)) * 6;
      const rotateY = (x / (rect.width / 2)) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });

    // Hotspot clicks trigger sparks & detail modal
    const hotspots = document.querySelectorAll('.cube-hotspot');
    hotspots.forEach((h) => {
      h.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = h.dataset.title || 'Creative Project';
        const sub = h.dataset.sub || 'Generative Exploration';

        if (window.confetti) {
          window.confetti({
            particleCount: 40,
            spread: 60,
            origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
          });
        }

        // Open modal with quick spotlight
        const modal = document.getElementById('project-modal');
        const modalMedia = document.getElementById('modal-media');
        const modalContent = document.getElementById('modal-content');

        if (modal && modalMedia && modalContent) {
          modalMedia.innerHTML = `<img src="assets/images/hero-hand-cubes.jpg" alt="${title}" style="width:100%;height:100%;object-fit:cover;" />`;
          modalContent.innerHTML = `
            <div class="project-tags" style="margin-bottom: 0.8rem;">
              <span>Google Veo</span>
              <span>Gemini Multimodal</span>
              <span>AI Fellow Project</span>
            </div>
            <h2 style="font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 0.8rem;">${title}</h2>
            <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem;">${sub}. Re-imagined as an immersive 3D holographic generative artifact in Mohan Raaju's creative technologist portfolio.</p>
            <div class="params-table">
              <div class="param-row"><span class="param-name">Platform</span><span class="param-val">Google AI Studio</span></div>
              <div class="param-row"><span class="param-name">Pipeline</span><span class="param-val">Prompt Synthesis + Diffusion</span></div>
              <div class="param-row"><span class="param-name">Role</span><span class="param-val">Director & Technologist</span></div>
            </div>
          `;
          modal.classList.add('open');
          if (window.lucide) window.lucide.createIcons();
        }
      });
    });
  }

  // =========================================================================
  // 9. Scroll Spy Navigation & Radar Schematic Card Tilt
  // =========================================================================
  function setupScrollSpyAndRadar() {
    const navItems = document.querySelectorAll('.nav-menu-links .nav-item');
    const sections = document.querySelectorAll('section[id]');

    // Smooth active state on scroll
    window.addEventListener('scroll', () => {
      let currentSection = 'hero';
      const scrollPosition = window.scrollY + 200;

      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          currentSection = sec.getAttribute('id');
        }
      });

      navItems.forEach((item) => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${currentSection}`) {
          item.classList.add('active');
        }
      });
    }, { passive: true });

    // Click updates active directly
    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        navItems.forEach((n) => n.classList.remove('active'));
        item.classList.add('active');
      });
    });

    // Radar Card 3D Tilt
    const radarCard = document.getElementById('radar-schematic-card');
    if (radarCard) {
      radarCard.addEventListener('mousemove', (e) => {
        const rect = radarCard.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotateX = -(y / (rect.height / 2)) * 5;
        const rotateY = (x / (rect.width / 2)) * 5;

        radarCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      radarCard.addEventListener('mouseleave', () => {
        radarCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      });
    }

    // About Card View Toggle (Portrait vs Radar)
    const btnPortrait = document.getElementById('btn-view-portrait');
    const btnRadar = document.getElementById('btn-view-radar');
    const portraitStage = document.getElementById('about-portrait-stage');
    const radarStage = document.getElementById('about-radar-stage');

    btnPortrait?.addEventListener('click', () => {
      btnPortrait.classList.add('active');
      btnRadar?.classList.remove('active');
      if (portraitStage) portraitStage.style.display = 'flex';
      if (radarStage) radarStage.style.display = 'none';
      if (window.lucide) window.lucide.createIcons();
    });

    btnRadar?.addEventListener('click', () => {
      btnRadar.classList.add('active');
      btnPortrait?.classList.remove('active');
      if (radarStage) radarStage.style.display = 'flex';
      if (portraitStage) portraitStage.style.display = 'none';
      if (window.lucide) window.lucide.createIcons();
    });

    // Methodology pills click celebration
    const pills = document.querySelectorAll('.methodology-pill');
    pills.forEach((p) => {
      p.addEventListener('click', (e) => {
        if (window.confetti) {
          window.confetti({
            particleCount: 25,
            spread: 50,
            origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
          });
        }
      });
    });
  }

  // =========================================================================
  // Initialize Application
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initThree();
    setupVideoPlayer();
    setupInspector();
    setupCreativeLab();
    setupProjects();
    setupConfetti();
    setupTerminal();
    setupHeroStage();
    setupScrollSpyAndRadar();
    setupSkillsAndContact();
    setupMobileNav();
    if (window.lucide) window.lucide.createIcons();
  });

  // =========================================================================
  // 10. Skills Tab Switching & Contact Actions
  // =========================================================================
  function setupSkillsAndContact() {
    const toggleToolsBtn = document.getElementById('toggle-tools-btn');
    const toggleDisciplinesBtn = document.getElementById('toggle-disciplines-btn');
    const toolsGrid = document.getElementById('tools-grid');
    const disciplinesGrid = document.getElementById('disciplines-grid');

    if (toggleToolsBtn && toggleDisciplinesBtn) {
      toggleToolsBtn.addEventListener('click', () => {
        toggleToolsBtn.classList.add('active');
        toggleDisciplinesBtn.classList.remove('active');
        if (toolsGrid) toolsGrid.style.display = 'grid';
        if (disciplinesGrid) disciplinesGrid.style.display = 'none';
        if (window.lucide) window.lucide.createIcons();
      });

      toggleDisciplinesBtn.addEventListener('click', () => {
        toggleDisciplinesBtn.classList.add('active');
        toggleToolsBtn.classList.remove('active');
        if (toolsGrid) toolsGrid.style.display = 'none';
        if (disciplinesGrid) disciplinesGrid.style.display = 'grid';
        if (window.lucide) window.lucide.createIcons();
      });
    }

    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('mohan.aicreator99@gmail.com').then(() => {
          const span = copyEmailBtn.querySelector('span');
          if (span) {
            const original = span.textContent;
            span.textContent = 'Copied to Clipboard!';
            setTimeout(() => {
              span.textContent = original;
            }, 2000);
          }
        });
      });
    }

    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // =========================================================================
  // 11. Responsive Mobile Navigation Drawer
  // =========================================================================
  function setupMobileNav() {
    const toggleBtn = document.getElementById('nav-mobile-toggle');
    const menuLinks = document.getElementById('nav-menu-links');
    const pillContainer = document.querySelector('.nav-pill-container');
    if (!toggleBtn || !menuLinks) return;

    const menuIcon = toggleBtn.querySelector('.mobile-menu-icon');
    const closeIcon = toggleBtn.querySelector('.mobile-close-icon');

    function toggleMenu(e) {
      if (e) e.stopPropagation();
      const isOpen = menuLinks.classList.toggle('mobile-open');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (menuIcon && closeIcon) {
        menuIcon.style.display = isOpen ? 'none' : 'inline-block';
        closeIcon.style.display = isOpen ? 'inline-block' : 'none';
      }
      if (window.lucide) window.lucide.createIcons();
    }

    function closeMenu() {
      if (menuLinks.classList.contains('mobile-open')) {
        menuLinks.classList.remove('mobile-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        if (menuIcon && closeIcon) {
          menuIcon.style.display = 'inline-block';
          closeIcon.style.display = 'none';
        }
        if (window.lucide) window.lucide.createIcons();
      }
    }

    toggleBtn.addEventListener('click', toggleMenu);

    menuLinks.querySelectorAll('.nav-item').forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    document.addEventListener('click', (e) => {
      if (pillContainer && !pillContainer.contains(e.target)) {
        closeMenu();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }
})();


