// Advanced Page Loader Management
function initializePageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  const progressBar = document.querySelector('.loader-progress');
  const loaderText = document.querySelector('.loader-text p');
  const skipBtn = document.querySelector('.skip-loader');

  let isLoading = true;
  let currentStep = 0;
  const steps = [
    { msg: 'Initializing interface...', delay: 400 },
    { msg: 'Loading assets...', delay: 400 },
    { msg: 'Starting services...', delay: 350 },
    { msg: 'Finalizing...', delay: 250 }
  ];

  function safe(fn){try{fn();}catch(e){console.warn('Loader error caught:',e);forceHide();}}

  function update(step){
    const pct = Math.min(100, Math.round((step/steps.length)*100));
    if(progressBar) progressBar.style.width = pct + '%';
    if(loaderText && steps[step]) loaderText.textContent = steps[step].msg;
  }

  function finalize(){
    if(!isLoading) return;
    isLoading = false;
    loader.classList.add('loaded');
    document.body.classList.add('page-loaded');
    setTimeout(()=>{if(loader && loader.parentNode){loader.remove();}},900);
  }

  function forceHide(){
    if(loader){loader.classList.add('loader-force-hide');}
    finalize();
  }

  function advance(){
    if(!isLoading) return;
    update(currentStep);
    currentStep++;
    if(currentStep < steps.length){
      setTimeout(advance, steps[currentStep-1].delay);
    } else {
      // slight pause for UX polish
      setTimeout(finalize, 150);
    }
  }

  // Begin sequence
  setTimeout(advance, 100);

  // Early completion when window load fires
  window.addEventListener('load', ()=> setTimeout(finalize, 100));

  // If DOM ready and images all loaded
  document.addEventListener('readystatechange', ()=>{
    if(document.readyState === 'interactive' || document.readyState === 'complete'){
      const pending = Array.from(document.images).filter(i=>!i.complete);
      if(pending.length === 0) finalize();
    }
  });

  // Skip button
  if(skipBtn){
    skipBtn.addEventListener('click', e=>{e.preventDefault(); finalize();});
    skipBtn.addEventListener('keydown', e=>{if((e.key==='Enter'||e.key===' ') && isLoading){e.preventDefault(); finalize();}});
  }

  // Particles failsafe
  setTimeout(()=>{if(isLoading && !window.particlesJS){console.warn('[Loader] particles.js not detected, finalizing.'); finalize();}},2000);
  // Primary timeout
  setTimeout(()=>{if(isLoading){console.warn('[Loader] primary timeout 4500ms'); finalize();}},4500);
  // Hard kill
  setTimeout(()=>{if(isLoading){console.error('[Loader] hard fallback 8000ms'); forceHide();}},8000);

  // Global error handlers to prevent stuck loader
  window.addEventListener('error', ()=>{if(isLoading){console.error('[Loader] window error - forcing hide'); forceHide();}}, true);
  window.addEventListener('unhandledrejection', ()=>{if(isLoading){console.error('[Loader] unhandled rejection - forcing hide'); forceHide();}});
}

// Advanced Announcement System
class AdvancedAnnouncement {
  constructor() {
    this.currentAnnouncement = null;
    this.animationFrameId = null;
    this.particles = [];
    this.config = this.loadConfig();
  }

  loadConfig() {
    const saved = localStorage.getItem('yw_announcement_config');
    return saved ? JSON.parse(saved) : {
      text: 'NOTICE: Currently only offering Web Development Services. Other services coming soon!',
      icon: '🎉',
      priority: 'info',
      effects: {
        bubbles: true,
        glow: true,
        pulse: true,
        float: false,
        particles: true,
        shake: false
      },
      behavior: {
        speed: 'normal',
        duration: 10000,
        position: 'floating',
        entrance: 'bounce'
      },
      enabled: true,
      autoReshow: false
    };
  }

  saveConfig(config) {
    this.config = { ...this.config, ...config };
    localStorage.setItem('yw_announcement_config', JSON.stringify(this.config));
  }

  createBubbleAnnouncement() {
    if (!this.config.enabled) return;
    
    const isDismissed = localStorage.getItem('yw_announcement_dismissed');
    if (isDismissed && !this.config.autoReshow) return;

    // Clear any existing announcement
    this.clearAnnouncement();

    // Create main container
    const container = document.createElement('div');
    container.className = 'advanced-announcement-container';
    container.id = 'advancedAnnouncement';
    
    // Create the bubble
    const bubble = document.createElement('div');
    bubble.className = `announcement-bubble ${this.config.priority} ${this.config.behavior.position}`;
    
    // Add visual effects classes
    if (this.config.effects.glow) bubble.classList.add('glow-effect');
    if (this.config.effects.pulse) bubble.classList.add('pulse-effect');
    if (this.config.effects.float) bubble.classList.add('float-effect');
    if (this.config.effects.shake) bubble.classList.add('shake-effect');

    // Create bubble content
    bubble.innerHTML = `
      <div class="bubble-content">
        <div class="announcement-icon">${this.config.icon}</div>
        <div class="announcement-text">${this.config.text}</div>
        <button class="close-button" aria-label="Close Announcement">×</button>
      </div>
      <div class="bubble-tail"></div>
    `;

    container.appendChild(bubble);

    // Add entrance animation
    bubble.classList.add(`entrance-${this.config.behavior.entrance}`);
    bubble.style.animationDuration = this.getAnimationDuration();

    // Add particles if enabled
    if (this.config.effects.particles) {
      this.createParticleEffect(container);
    }

    // Add floating bubbles if enabled
    if (this.config.effects.bubbles) {
      this.createFloatingBubbles(container);
    }

    // Position the announcement
    this.positionAnnouncement(container);

    document.body.appendChild(container);
    this.currentAnnouncement = container;

    // Add event listeners
    bubble.querySelector('.close-button').addEventListener('click', () => {
      this.dismissAnnouncement();
    });

    // Auto-dismiss if duration is set
    if (this.config.behavior.duration > 0) {
      setTimeout(() => {
        this.dismissAnnouncement();
      }, this.config.behavior.duration);
    }

    // Start animation loop for effects
    this.startAnimationLoop();
  }

  createParticleEffect(container) {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'announcement-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 2 + 's';
      particle.style.animationDuration = (2 + Math.random() * 3) + 's';
      
      // Random particle symbols
      const symbols = ['✨', '⭐', '💫', '🌟', '✦', '◆', '◇', '○', '●'];
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      
      particleContainer.appendChild(particle);
    }
    
    container.appendChild(particleContainer);
  }

  createFloatingBubbles(container) {
    const bubbleContainer = document.createElement('div');
    bubbleContainer.className = 'floating-bubbles-container';
    
    for (let i = 0; i < 8; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'floating-bubble';
      bubble.style.left = Math.random() * 100 + '%';
      bubble.style.animationDelay = Math.random() * 3 + 's';
      bubble.style.animationDuration = (3 + Math.random() * 4) + 's';
      
      bubbleContainer.appendChild(bubble);
    }
    
    container.appendChild(bubbleContainer);
  }

  positionAnnouncement(container) {
    switch (this.config.behavior.position) {
      case 'top':
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.right = '0';
        container.style.zIndex = '10000';
        break;
      case 'floating':
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '10000';
        break;
      case 'corner':
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '10000';
        break;
      case 'center':
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.zIndex = '10000';
        break;
      case 'sidebar':
        container.style.position = 'fixed';
        container.style.left = '20px';
        container.style.top = '50%';
        container.style.transform = 'translateY(-50%)';
        container.style.zIndex = '10000';
        break;
    }
  }

  getAnimationDuration() {
    const speeds = {
      slow: '3s',
      normal: '2s',
      fast: '1s',
      hyper: '0.5s'
    };
    return speeds[this.config.behavior.speed] || '2s';
  }

  startAnimationLoop() {
    const animate = () => {
      if (this.currentAnnouncement) {
        // Update particle positions and effects
        this.updateParticles();
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };
    animate();
  }

  updateParticles() {
    // Additional dynamic effects can be added here
    if (this.config.effects.float) {
      const bubble = this.currentAnnouncement?.querySelector('.announcement-bubble');
      if (bubble) {
        const time = Date.now() * 0.001;
        const offsetY = Math.sin(time) * 5;
        bubble.style.transform = `translateY(${offsetY}px)`;
      }
    }
  }

  dismissAnnouncement() {
    if (!this.currentAnnouncement) return;

    const bubble = this.currentAnnouncement.querySelector('.announcement-bubble');
    bubble.classList.add('exit-animation');
    
    setTimeout(() => {
      if (this.currentAnnouncement) {
        this.currentAnnouncement.remove();
        this.currentAnnouncement = null;
      }
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }, 500);

    localStorage.setItem('yw_announcement_dismissed', 'true');
  }

  clearAnnouncement() {
    if (this.currentAnnouncement) {
      this.currentAnnouncement.remove();
      this.currentAnnouncement = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  updateAnnouncement(config) {
    this.saveConfig(config);
    localStorage.removeItem('yw_announcement_dismissed'); // Allow re-showing
    this.createBubbleAnnouncement();
  }

  preview() {
    const tempDismissed = localStorage.getItem('yw_announcement_dismissed');
    localStorage.removeItem('yw_announcement_dismissed');
    this.createBubbleAnnouncement();
    if (tempDismissed) {
      setTimeout(() => {
        localStorage.setItem('yw_announcement_dismissed', tempDismissed);
      }, 100);
    }
  }
}

// Initialize the advanced announcement system
const advancedAnnouncement = new AdvancedAnnouncement();

// Make it globally accessible for admin panel
window.advancedAnnouncement = advancedAnnouncement;

// Legacy function for compatibility
function initializeAnnouncement() {
  advancedAnnouncement.createBubbleAnnouncement();
}

// Mobile Menu Management
function initializeMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const headerRight = document.querySelector('.header-right');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const navLinks = document.querySelectorAll('.header-right nav a');

  if (!mobileToggle || !headerRight || !mobileOverlay) return;

  // Toggle mobile menu
  mobileToggle.addEventListener('click', () => {
    headerRight.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    document.body.style.overflow = headerRight.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when overlay is clicked
  mobileOverlay.addEventListener('click', () => {
    headerRight.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Close menu when nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      headerRight.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && headerRight.classList.contains('active')) {
      headerRight.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      headerRight.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Set default announcement if none exists
if (!localStorage.getItem('yw_announcement')) {
  localStorage.setItem('yw_announcement', 'NOTICE: Currently only offering Web Development Services. Other services coming soon!');
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize page loader first
  initializePageLoader();
  
  // Initialize announcement banner
  initializeAnnouncement();
  
  // Initialize mobile menu
  initializeMobileMenu();

  // === Smooth Scrolling for Nav Links ===
  const navLinks = document.querySelectorAll('header nav a[href^="#"], .cta-button');
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      if(link.hash) {
        e.preventDefault();
        const target = document.querySelector(link.hash);
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // === Hero CTA Button Particle Glow ===
  const ctaButton = document.querySelector('.cta-button');
  if(ctaButton){
    ctaButton.addEventListener('mouseenter', () => {
      // Add temporary particle burst effect using particles.js custom config
      particlesJS("particles-js", {
        "particles": {
          "number": { "value": 50 },
          "color": { "value": "#ffd700" },
          "shape": { "type": "circle" },
          "opacity": { "value": 1 },
          "size": { "value": 3 },
          "line_linked": { "enable": false },
          "move": { "enable": true, "speed": 3, "direction": "none", "out_mode": "out" }
        },
        "interactivity": {
          "detect_on": "canvas",
          "events": { "onhover": { "enable": false }, "onclick": { "enable": false } }
        },
        "retina_detect": true
      });
    });
  }

  // === Community Text Editable Storage ===
  const communityText = document.getElementById('communityText');
  if(communityText){
    communityText.value = localStorage.getItem('yw_community_v2') || communityText.value;
    communityText.addEventListener('input', () => {
      localStorage.setItem('yw_community_v2', communityText.value);
    });
  }

  // === Contact Form Submission ===
  const contactForm = document.getElementById('contactForm');
  const quoteForm = document.getElementById('quoteForm');
  
  const handleFormSubmit = async (form, isQuoteForm = false) => {
    const formData = {
      name: form.name.value,
      email: form.email.value,
      date: new Date().toLocaleString()
    };

    if (isQuoteForm) {
      formData.service = 'Web Development';
      formData.package = form.package.value;
      formData.requirements = form.requirements.value;
    } else {
      formData.service = form.service.value;
      formData.message = form.message.value;
    }

    try {
      // Send to Google Apps Script
      const googleScriptURL = 'https://script.google.com/macros/s/AKfycbwRnxGTfZzXL9jGSD-L790A2aErb0bimYIQHMLQOqbApr6ueMq7FQm8pyWekxo-UX2j/exec';
      const formDataForGoogle = new FormData();
      Object.keys(formData).forEach(key => {
        formDataForGoogle.append(key, formData[key]);
      });

      const response = await fetch(googleScriptURL, {
        method: 'POST',
        body: formDataForGoogle
      });

      if (response.ok) {
        alert('Form submitted successfully!');
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  if(contactForm){
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      handleFormSubmit(contactForm);
    });
  }

  const webQuoteForm = document.getElementById('webQuoteForm');
  if(webQuoteForm) {
    webQuoteForm.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = {
        name: webQuoteForm.name.value,
        email: webQuoteForm.email.value,
        phone: webQuoteForm.phone.value,
        package: webQuoteForm.package.value,
        timeline: webQuoteForm.timeline.value,
        requirements: webQuoteForm.requirements.value,
        date: new Date().toLocaleString(),
        type: 'web-development'
      };

      // Store web quotes separately
      const webQuotes = JSON.parse(localStorage.getItem('yw_web_quotes') || '[]');
      webQuotes.push(formData);
      localStorage.setItem('yw_web_quotes', JSON.stringify(webQuotes));

      // Send to Google Apps Script
      try {
        const googleScriptURL = 'https://script.google.com/macros/s/AKfycbwRnxGTfZzXL9jGSD-L790A2aErb0bimYIQHMLQOqbApr6ueMq7FQm8pyWekxo-UX2j/exec';
        const formDataForGoogle = new FormData();
        Object.keys(formData).forEach(key => {
          formDataForGoogle.append(key, formData[key]);
        });

        const response = await fetch(googleScriptURL, {
          method: 'POST',
          body: formDataForGoogle
        });

        if (response.ok) {
          alert('Quote request submitted successfully! We\'ll get back to you soon.');
          webQuoteForm.reset();
        } else {
          throw new Error('Failed to submit quote');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Your quote request has been saved. We\'ll contact you soon!');
        webQuoteForm.reset();
      }
    });
  }

  if(quoteForm){
    quoteForm.addEventListener('submit', e => {
      e.preventDefault();
      handleFormSubmit(quoteForm, true);
    });
  }

  // Initialize Whitney AI Chatbot
  initializeWhitneyChatbot();
  
  // Initialize Scroll Animations
  initializeScrollAnimations();

  // Initialize admin/auth state update for header (if token present)
  try {
    const token = localStorage.getItem('yw_auth_token');
    if (token) {
      document.body.classList.add('auth-logged-in');
    }
  } catch (e) { console.warn('Auth state check failed', e); }

  // Conditional login page enhancements
  if (document.getElementById('login-page')) {
    // If global script needs to augment login later (placeholder)
    console.log('[Login] Page detected. Inline handler active.');
  }
});

// === ADVANCED WHITNEY AI CHATBOT SYSTEM ===
function initializeWhitneyChatbot() {
  const toggle = document.getElementById('whitney-toggle');
  const chat = document.getElementById('whitney-chat');
  const popup = document.getElementById('whitney-popup');
  const notification = document.getElementById('whitney-notification');
  const closeChat = document.getElementById('close-chat');
  const closePopup = document.getElementById('close-popup');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-message');
  const messagesContainer = document.getElementById('chat-messages');
  const popupText = document.getElementById('popup-text');

  // Safety check - ensure critical elements exist
  if (!toggle || !chat || !messagesContainer || !chatInput || !sendButton) {
    console.error('Whitney AI: Critical chatbot elements missing', {
      toggle: !!toggle,
      chat: !!chat, 
      messagesContainer: !!messagesContainer,
      chatInput: !!chatInput,
      sendButton: !!sendButton
    });
    return;
  }
  
  console.log('Whitney AI: Chatbot initialized successfully!');

  let hasShownInitialPopup = localStorage.getItem('whitney_popup_shown');
  let chatHistory = JSON.parse(localStorage.getItem('whitney_chat_history') || '[]');
  let currentCalculation = null;

  // ADVANCED PRICING CALCULATOR SYSTEM
  const advancedPricingEngine = {
    // Snow removal pricing matrices
    snowRemoval: {
      residential: {
        driveways: {
          small: { basePrice: 35, maxPrice: 50, maxLength: 30, maxWidth: 15, cars: '1-2' },
          medium: { basePrice: 50, maxPrice: 70, maxLength: 50, maxWidth: 20, cars: '3-4' },
          large: { basePrice: 70, maxPrice: 100, maxLength: 80, maxWidth: 25, cars: '5-6' },
          extraLarge: { basePrice: 100, maxPrice: 150, maxLength: 120, maxWidth: 30, cars: '7+' }
        },
        walkways: { pricePerFoot: 0.5, minCharge: 10, maxCharge: 20 },
        stairs: { pricePerStep: 2, minSteps: 5, maxCharge: 30 }
      },
      commercial: {
        small: { basePrice: 75, maxPrice: 120, sqftRange: '1000-3000', parking: '4-8 cars' },
        medium: { basePrice: 120, maxPrice: 250, sqftRange: '3000-8000', parking: '10-20 cars' },
        large: { basePrice: 250, maxPrice: 600, sqftRange: '8000-25000', parking: '25-100 cars' },
        massive: { basePrice: 600, maxPrice: 1500, sqftRange: '25000+', parking: '100+ cars' }
      },
      addOns: {
        salting: { multiplier: 0.3, minCharge: 20, maxCharge: 100 },
        iceScraping: { hourlyRate: 65, minHours: 1 },
        emergency: { multiplier: 0.25, minCharge: 25 },
        repeat: { discount: 0.15, minVisits: 3 }
      },
      seasonal: {
        earlyBird: { discount: 0.1, cutoffDate: '2025-12-01' },
        monthly: { multiplier: 4.5, discount: 0.1 },
        fullSeason: { multiplier: 15, discount: 0.18 }
      },
      travel: {
        freeRadius: 15, // km from Whitehorse
        ratePerKm: 1.75,
        hainesJunction: { fixedFee: 50, additionalPerKm: 2.25 }
      }
    },
    
    // Geographic calculations
    calculateTravelCost: function(location) {
      const distances = {
        'whitehorse': 0,
        'downtown whitehorse': 0,
        'riverdale': 5,
        'hillcrest': 8,
        'granger': 12,
        'cowley creek': 18,
        'fish lake': 25,
        'haines junction': 160,
        'champagne': 60,
        'mendenhall': 40
      };
      
      const distance = distances[location.toLowerCase()] || 20;
      
      if (distance <= this.snowRemoval.travel.freeRadius) {
        return { cost: 0, distance: distance, note: 'Within free service area' };
      } else if (location.toLowerCase().includes('haines')) {
        return { 
          cost: this.snowRemoval.travel.hainesJunction.fixedFee + 
                (distance - 160) * this.snowRemoval.travel.hainesJunction.additionalPerKm,
          distance: distance, 
          note: 'Haines Junction area service' 
        };
      } else {
        const extraKm = distance - this.snowRemoval.travel.freeRadius;
        return { 
          cost: extraKm * this.snowRemoval.travel.ratePerKm,
          distance: distance,
          note: `${extraKm}km beyond free service area`
        };
      }
    },

    // Intelligent dimension parser
    parseDimensions: function(text) {
      const patterns = [
        /(\d+)\s*(?:by|x)\s*(\d+)\s*(?:feet?|ft|')/i,
        /(\d+)\s*(?:feet?|ft|')\s*(?:by|x)\s*(\d+)\s*(?:feet?|ft|')/i,
        /(\d+)\s*(?:x|by)\s*(\d+)/i,
        /(\d+)\s*(?:feet?|ft|')\s*(?:long|wide|driveway)/i,
        /(\d+)\s*(?:foot|ft|')/i
      ];
      
      for (let pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          if (match[2]) {
            return { length: parseInt(match[1]), width: parseInt(match[2]) };
          } else {
            return { length: parseInt(match[1]), width: null };
          }
        }
      }
      
      // Check for car capacity mentions
      const carMatch = text.match(/(\d+)\s*car/i);
      if (carMatch) {
        const cars = parseInt(carMatch[1]);
        if (cars <= 2) return { category: 'small', cars: cars };
        if (cars <= 4) return { category: 'medium', cars: cars };
        if (cars <= 6) return { category: 'large', cars: cars };
        return { category: 'extraLarge', cars: cars };
      }
      
      return null;
    },

    // Advanced cost calculator
    calculateSnowRemovalCost: function(dimensions, location = 'whitehorse', services = [], frequency = 'one-time') {
      let calculation = {
        breakdown: {},
        total: 0,
        savings: 0,
        recommendations: [],
        details: {}
      };
      
      // Determine driveway size
      let category = 'medium';
      let basePrice = 60;
      
      if (dimensions) {
        if (dimensions.category) {
          category = dimensions.category;
        } else if (dimensions.length && dimensions.width) {
          const area = dimensions.length * dimensions.width;
          const maxDimension = Math.max(dimensions.length, dimensions.width);
          
          if (area <= 450 && maxDimension <= 30) category = 'small';
          else if (area <= 1000 && maxDimension <= 50) category = 'medium';  
          else if (area <= 2000 && maxDimension <= 80) category = 'large';
          else category = 'extraLarge';
          
          calculation.details.area = area;
          calculation.details.dimensions = `${dimensions.length}' x ${dimensions.width}'`;
        } else if (dimensions.length) {
          if (dimensions.length <= 30) category = 'small';
          else if (dimensions.length <= 50) category = 'medium';
          else if (dimensions.length <= 80) category = 'large';
          else category = 'extraLarge';
          
          calculation.details.estimatedDimensions = `${dimensions.length}' long (estimated width based on typical driveways)`;
        }
      }
      
      const drivewayInfo = this.snowRemoval.residential.driveways[category];
      basePrice = (drivewayInfo.basePrice + drivewayInfo.maxPrice) / 2;
      
      calculation.breakdown.drivewayClearing = basePrice;
      calculation.details.drivewaySize = `${category} (${drivewayInfo.cars} cars)`;
      
      // Add services
      services.forEach(service => {
        switch(service.toLowerCase()) {
          case 'walkway':
          case 'sidewalk':
            const walkwayCost = 15; // average
            calculation.breakdown.walkwayClearing = walkwayCost;
            break;
          case 'salting':
          case 'salt':
            const saltCost = Math.max(20, basePrice * 0.3);
            calculation.breakdown.saltApplication = saltCost;
            break;
          case 'stairs':
          case 'steps':
            calculation.breakdown.stairClearing = 15; // average 7 steps
            break;
          case 'emergency':
            const emergencyFee = Math.max(25, basePrice * 0.25);
            calculation.breakdown.emergencyService = emergencyFee;
            break;
        }
      });
      
      // Travel costs
      const travel = this.calculateTravelCost(location);
      if (travel.cost > 0) {
        calculation.breakdown.travelFee = travel.cost;
        calculation.details.travel = travel.note;
      }
      
      // Frequency adjustments
      let frequencyMultiplier = 1;
      if (frequency.includes('month') || frequency.includes('season')) {
        if (frequency.includes('month')) {
          frequencyMultiplier = 4.5;
          calculation.savings = basePrice * 4.5 * 0.1; // 10% monthly discount
          calculation.details.frequency = 'Monthly contract (10% discount applied)';
        } else {
          frequencyMultiplier = 15;
          calculation.savings = basePrice * 15 * 0.18; // 18% seasonal discount  
          calculation.details.frequency = 'Full season contract (18% discount applied)';
        }
      }
      
      // Calculate total
      const subtotal = Object.values(calculation.breakdown).reduce((sum, cost) => sum + cost, 0);
      calculation.total = (subtotal * frequencyMultiplier) - calculation.savings;
      
      // Add recommendations
      if (!services.includes('salting') && category !== 'small') {
        calculation.recommendations.push('Consider adding salt application for better safety (+$20-40)');
      }
      
      if (frequency === 'one-time' && category !== 'small') {
        const monthlySavings = (basePrice * 4.5) - (basePrice * 4.5 * 0.9);
        calculation.recommendations.push(`Save $${monthlySavings.toFixed(0)} with a monthly contract!`);
      }
      
      return calculation;
    }
  };

  // ADVANCED NATURAL LANGUAGE PROCESSOR
  const advancedNLP = {
    extractSnowRemovalInfo: function(text) {
      const info = {
        dimensions: null,
        location: 'whitehorse',
        services: [],
        frequency: 'one-time',
        urgency: 'normal'
      };
      
      // Extract dimensions
      info.dimensions = advancedPricingEngine.parseDimensions(text);
      
      // Extract location
      const locations = ['haines junction', 'riverdale', 'hillcrest', 'granger', 'cowley creek', 'fish lake', 'champagne', 'mendenhall'];
      for (let loc of locations) {
        if (text.toLowerCase().includes(loc)) {
          info.location = loc;
          break;
        }
      }
      
      // Extract services
      if (text.match(/walkway|sidewalk|path/i)) info.services.push('walkway');
      if (text.match(/salt|ice|slippery/i)) info.services.push('salting');  
      if (text.match(/stairs?|steps?/i)) info.services.push('stairs');
      if (text.match(/emergency|urgent|asap|immediately/i)) {
        info.services.push('emergency');
        info.urgency = 'emergency';
      }
      
      // Extract frequency
      if (text.match(/month|monthly/i)) info.frequency = 'monthly';
      if (text.match(/season|winter|all season/i)) info.frequency = 'seasonal';
      if (text.match(/weekly/i)) info.frequency = 'weekly';
      
      return info;
    },
    
    parseQuestionIntent: function(text) {
      const intents = {
        pricing: /(?:cost|price|charge|fee|expensive|cheap|rate|quote)/i,
        dimensions: /(?:foot|feet|ft|'|"|long|wide|big|size|dimension)/i,
        location: /(?:where|area|zone|travel|distance|haines|riverdale|granger)/i,
        services: /(?:include|service|walkway|salt|stairs|emergency)/i,
        booking: /(?:book|schedule|appointment|when|available)/i,
        comparison: /(?:vs|versus|compare|difference|better|cheaper)/i
      };
      
      const detected = [];
      for (let [intent, pattern] of Object.entries(intents)) {
        if (pattern.test(text)) detected.push(intent);
      }
      
      return detected.length > 0 ? detected : ['general'];
    }
  };

  // ENHANCED WHITNEY KNOWLEDGE BASE
  const whitneyAdvancedKnowledge = {
    greetings: [
      "Hey there! I'm Whitney, your ADVANCED AI assistant for Yukon Wildcats! 🚀",
      "Hi! I'm Whitney 2.0, ready to calculate exact costs and help with everything! ⚡",
      "Hello! Whitney here with INSTANT precise quotes and smart calculations! 🧠✨"
    ],
    
    smartResponses: {
      snowCostAnalysis: function(userInput, calculation) {
        let response = `🏔️ **SNOW REMOVAL COST ANALYSIS** ❄️\n\n`;
        
        if (calculation.details.dimensions) {
          response += `📐 **Your Driveway:** ${calculation.details.dimensions}\n`;
        }
        if (calculation.details.drivewaySize) {
          response += `🚗 **Size Category:** ${calculation.details.drivewaySize}\n`;
        }
        
        response += `\n💰 **COST BREAKDOWN:**\n`;
        for (let [service, cost] of Object.entries(calculation.breakdown)) {
          const serviceName = service.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          response += `• ${serviceName}: $${cost.toFixed(0)}\n`;
        }
        
        if (calculation.savings > 0) {
          response += `\n🎉 **SAVINGS:** -$${calculation.savings.toFixed(0)}\n`;
        }
        
        response += `\n🏆 **TOTAL COST: $${calculation.total.toFixed(0)}**\n`;
        
        if (calculation.details.frequency) {
          response += `📅 **Payment Plan:** ${calculation.details.frequency}\n`;
        }
        
        if (calculation.details.travel) {
          response += `🛣️ **Travel:** ${calculation.details.travel}\n`;
        }
        
        if (calculation.recommendations.length > 0) {
          response += `\n💡 **RECOMMENDATIONS:**\n`;
          calculation.recommendations.forEach(rec => {
            response += `• ${rec}\n`;
          });
        }
        
        response += `\n📞 **Ready to book? Call us:**\n`;
        response += `• Lazarus: 1-867-332-0223\n`;
        response += `• Micah: 1-867-332-4551\n\n`;
        response += `Want to modify anything? Just ask! 😊`;
        
        return response;
      },
      
      services: {
        'snow removal': {
          description: 'Professional snow removal with PRECISE cost calculations',
          pricing: 'Let me calculate exact costs based on your specific needs!'
        },
        'towing': {
          description: 'Emergency towing and vehicle transport in Whitehorse and Haines Junction areas',
          pricing: '$100-200 within Whitehorse | $150+ Haines Junction | Emergency +25%'
        },
        'excavation': {
          description: 'Expert excavation services with hourly and project rates',
          pricing: '$150-300/hour | Foundation work $200-250/hour | Project quotes available'
        },
        'web development': {
          description: 'Professional website design and development services',
          pricing: 'Basic: $500-1500 | Custom: $2000-5000 | Premium: $5000+ | E-commerce: $3000+'
        }
      },
      
      intelligentResponses: {
        default: "I'm Whitney, your ADVANCED AI assistant! 🚀 I can calculate EXACT snow removal costs, provide instant quotes for all services, and help you save money with smart recommendations! What can I help you with?",
        
        pricing: "I can calculate PRECISE costs! 💰 Tell me about your project - dimensions, location, services needed - and I'll give you an instant detailed breakdown!",
        
        contact: "📞 **CONTACT YUKON WILDCATS:**\n• Lazarus (Founder): 1-867-332-0223\n• Micah (Co-founder): 1-867-332-4551\n• 📧 Email quotes available\n• 🤖 AI instant quotes (that's me!)\n• 📍 Serving Whitehorse & Haines Junction",
        
        location: "🗺️ We serve Whitehorse and surrounding areas with FREE travel within 15km! Haines Junction has special rates. I can calculate travel costs instantly - just tell me your location!"
      }
    },
    
    // VISUAL EFFECTS SYSTEM
    createVisualEffects: {
      sparkleText: function(element) {
        element.style.position = 'relative';
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const sparkle = document.createElement('span');
            sparkle.innerHTML = '✨';
            sparkle.style.cssText = `
              position: absolute;
              top: ${Math.random() * 100}%;
              left: ${Math.random() * 100}%;
              font-size: 12px;
              animation: sparkleFloat 1s ease-out forwards;
              pointer-events: none;
              z-index: 100;
            `;
            element.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1000);
          }, i * 200);
        }
      },
      
      typewriterEffect: function(element, text, callback, speed = 30) {
        element.innerHTML = '';
        let i = 0;
        
        const type = () => {
          if (i < text.length) {
            if (text.charAt(i) === '\n') {
              element.innerHTML += '<br>';
            } else {
              element.innerHTML += text.charAt(i);
            }
            i++;
            setTimeout(type, speed);
          } else {
            if (callback) callback();
          }
        };
        
        type();
      },
      
      addCalculationAnimation: function(element) {
        element.style.cssText += `
          background: linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%);
          border: 2px solid rgba(255,215,0,0.3);
          border-radius: 15px;
          padding: 15px;
          margin: 10px 0;
          box-shadow: 0 8px 25px rgba(255,215,0,0.2);
          animation: calculationGlow 2s ease-in-out;
        `;
      }
    }
  };

  // ADVANCED MESSAGE PROCESSING ENGINE
  function processAdvancedMessage(userInput) {
    const text = userInput.toLowerCase().trim();
    const intents = advancedNLP.parseQuestionIntent(text);
    
    // Snow removal cost calculation
    if (text.includes('snow') && (intents.includes('pricing') || intents.includes('dimensions'))) {
      const info = advancedNLP.extractSnowRemovalInfo(text);
      const calculation = advancedPricingEngine.calculateSnowRemovalCost(
        info.dimensions, info.location, info.services, info.frequency
      );
      
      currentCalculation = calculation;
      return whitneyAdvancedKnowledge.smartResponses.snowCostAnalysis(text, calculation);
    }
    
    // Service-specific responses  
    for (let [service, data] of Object.entries(whitneyAdvancedKnowledge.smartResponses.services)) {
      if (text.includes(service.replace(' ', ''))) {
        return `🎯 **${service.toUpperCase()}** 🎯\n\n${data.description}\n\n💰 **PRICING:** ${data.pricing}\n\nNeed specific calculations? Just tell me your requirements!`;
      }
    }
    
    // Intent-based responses
    if (intents.includes('pricing')) {
      return whitneyAdvancedKnowledge.smartResponses.intelligentResponses.pricing;
    }
    
    if (intents.includes('location')) {
      return whitneyAdvancedKnowledge.smartResponses.intelligentResponses.location;
    }
    
    if (text.includes('contact') || text.includes('call') || text.includes('phone')) {
      return whitneyAdvancedKnowledge.smartResponses.intelligentResponses.contact;
    }
    
    // Greeting responses
    if (text.match(/^(hi|hello|hey|good morning|good afternoon)$/)) {
      return whitneyAdvancedKnowledge.greetings[Math.floor(Math.random() * whitneyAdvancedKnowledge.greetings.length)];
    }
    
    return whitneyAdvancedKnowledge.smartResponses.intelligentResponses.default;
  }
  
  // ENHANCED UI FUNCTIONS WITH FLASHY EFFECTS
  function addAdvancedMessage(message, isBot = false) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${isBot ? 'bot' : 'user'}`;
    
    if (isBot) {
      messageEl.classList.add('advanced-bot-message');
      messageEl.innerHTML = `
        <div class="message-avatar">
          <img src="assets/whitney-avatar.svg" alt="Whitney" class="bot-avatar">
          <div class="avatar-glow"></div>
        </div>
        <div class="message-content advanced-content">
          <div class="message-text">${message.replace(/\n/g, '<br>')}</div>
          <div class="message-effects">
            <div class="typing-pulse"></div>
          </div>
        </div>
      `;
    } else {
      messageEl.innerHTML = `
        <div class="message-content user-content">
          <div class="message-text">${message}</div>
        </div>
      `;
    }
    
    messagesContainer.appendChild(messageEl);
    
    if (isBot) {
      // Add flashy effects for bot messages
      setTimeout(() => {
        messageEl.classList.add('message-animate');
        whitneyAdvancedKnowledge.createVisualEffects.sparkleText(messageEl);
        
        // Add calculation glow if it's a cost analysis
        if (message.includes('COST BREAKDOWN') || message.includes('TOTAL COST')) {
          whitneyAdvancedKnowledge.createVisualEffects.addCalculationAnimation(messageEl);
        }
      }, 100);
      
      // Type writer effect for advanced responses
      const textElement = messageEl.querySelector('.message-text');
      const originalText = textElement.innerHTML;
      whitneyAdvancedKnowledge.createVisualEffects.typewriterEffect(textElement, originalText, () => {
        // Add pulse effect after typing
        textElement.classList.add('text-complete');
      }, 15);
    }
    
    scrollToBottom();
    saveChatHistory();
  }
  
  function showAdvancedTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'advanced-typing-indicator';
    indicator.id = 'advanced-typing';
    indicator.innerHTML = `
      <div class="typing-avatar">
        <img src="assets/whitney-avatar.svg" alt="Whitney" class="bot-avatar">
        <div class="thinking-particles">
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
        </div>
      </div>
      <div class="typing-content">
        <div class="typing-text">Whitney is analyzing your request...</div>
        <div class="typing-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    `;
    
    messagesContainer.appendChild(indicator);
    scrollToBottom();
  }
  
  function hideAdvancedTypingIndicator() {
    const indicator = document.getElementById('advanced-typing');
    if (indicator) {
      indicator.style.opacity = '0';
      setTimeout(() => indicator.remove(), 300);
    }
  }

  // Show initial popup if first visit
  if (!hasShownInitialPopup) {
    setTimeout(() => {
      showInitialPopup();
    }, 2000);
  }

  // Event listeners with accessibility and error handling
  if (toggle) {
    toggle.addEventListener('click', toggleChat);
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleChat();
      }
    });
  }
  
  if (closeChat) {
    closeChat.addEventListener('click', hideChat);
    closeChat.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hideChat();
      }
    });
  }
  
  if (closePopup) {
    closePopup.addEventListener('click', hidePopup);
    closePopup.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hidePopup();
      }
    });
  }
  
  if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
    sendButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sendMessage();
      }
    });
  }
  
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
  
  // Escape key to close chat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !chat.classList.contains('hidden')) {
      hideChat();
    }
  });

  // Load chat history
  loadChatHistory();
  
  // Show initial greeting if chat is empty
  if (chatHistory.length === 0) {
    setTimeout(() => {
      addAdvancedMessage("👋 Hi! I'm Whitney, your AI assistant for Yukon Wildcats Contracting! Ask me about our services, pricing, or get instant cost estimates for snow removal! ✨", true);
    }, 500);
  }

  function showInitialPopup() {
    const messages = [
      "Hey! I'm Whitney, here to help with pricing and services! 💫",
      "Hi there! I'm Whitney, your AI assistant for all things contracting! ✨",
      "Hello! Whitney here to help with quotes and questions! 🚀"
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    typeWriterEffect(popupText, message, () => {
      popup.classList.remove('hidden');
      setTimeout(hidePopup, 8000); // Auto hide after 8 seconds
    });
  }

  function typeWriterEffect(element, text, callback) {
    element.innerHTML = '';
    let i = 0;
    element.classList.add('typewriter-text');
    
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, 50);
      } else {
        element.classList.remove('typewriter-text');
        if (callback) callback();
      }
    }
    type();
  }

  function toggleChat() {
    if (chat.classList.contains('hidden')) {
      showChat();
    } else {
      hideChat();
    }
  }

  function showChat() {
    chat.classList.remove('hidden');
    hidePopup();
    hideNotification();
    
    // Accessibility improvements
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close Whitney AI Assistant Chat');
    
    // Focus management for accessibility
    setTimeout(() => {
      if (chatInput) chatInput.focus();
    }, 100);
    
    // Add welcome message if no chat history
    if (chatHistory.length === 0) {
      setTimeout(() => {
        addBotMessage(whitneyKnowledge.greetings[Math.floor(Math.random() * whitneyKnowledge.greetings.length)]);
      }, 500);
    }
  }

  function hideChat() {
    chat.classList.add('hidden');
  }

  function hidePopup() {
    popup.classList.add('hidden');
    localStorage.setItem('whitney_popup_shown', 'true');
  }

  function hideNotification() {
    notification.style.display = 'none';
  }

  // ADVANCED MESSAGE SENDING WITH FLASHY EFFECTS
  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message with effects
    addAdvancedMessage(message, false);
    chatInput.value = '';
    
    // Show advanced typing indicator
    showAdvancedTypingIndicator();
    
    // Process with AI delay for realistic feel
    const processingTime = 800 + Math.random() * 1200;
    setTimeout(() => {
      hideAdvancedTypingIndicator();
      const response = processAdvancedMessage(message);
      addAdvancedMessage(response, true);
      
      // Add sound effect (optional)
      playNotificationSound();
    }, processingTime);
  }

  function addUserMessage(message) {
    // Legacy support - redirect to advanced function
    addAdvancedMessage(message, false);
    
    // Save to history
    chatHistory.push({type: 'user', message, timestamp: Date.now()});
    saveChatHistory();
  }

  function addBotMessage(message) {
    // Legacy support - redirect to advanced function
    addAdvancedMessage(message, true);
    
    // Save to history
    chatHistory.push({type: 'bot', message, timestamp: Date.now()});
    saveChatHistory();
  }
  
  // SOUND EFFECTS SYSTEM
  function playNotificationSound() {
    // Create subtle notification sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Fallback - no sound if Web Audio API not supported
      console.log('Audio notification not available');
    }
  }

  // ADVANCED MESSAGE ELEMENT CREATION WITH ANIMATIONS
  function createMessageElement(type, message) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = message;
    return div;
  }
  
  // ADVANCED MESSAGE SYSTEM WITH FLASHY EFFECTS
  function addAdvancedMessage(message, isBot = false) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${isBot ? 'bot' : 'user'} advanced-message`;
    
    const contentEl = document.createElement('div');
    contentEl.className = 'message-content advanced-content';
    
    if (isBot) {
      messageEl.innerHTML = `
        <div class="bot-avatar">
          <div class="avatar-glow"></div>
          🤖
        </div>
        <div class="message-content advanced-content"></div>
      `;
      contentEl = messageEl.querySelector('.message-content');
    } else {
      messageEl.innerHTML = `
        <div class="message-content advanced-content"></div>
        <div class="user-avatar">
          <div class="avatar-glow"></div>
          👤
        </div>
      `;
      contentEl = messageEl.querySelector('.message-content');
    }
    
    // Add sparkle effect for bot messages
    if (isBot) {
      addSparkleEffect(messageEl);
    }
    
    // Start with empty content and animate typing
    contentEl.textContent = '';
    messagesContainer.appendChild(messageEl);
    
    // Animate message appearance
    messageEl.style.opacity = '0';
    messageEl.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
      messageEl.style.transition = 'all 0.3s ease-out';
      messageEl.style.opacity = '1';
      messageEl.style.transform = 'translateY(0)';
      
      // Start typing animation
      typeWriterEffect(contentEl, message, isBot ? 50 : 30);
    });
    
    scrollToBottom();
  }
  
  // TYPEWRITER EFFECT WITH VARIABLE SPEED
  function typeWriterEffect(element, text, speed = 50) {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        
        // Scroll to bottom as text appears
        scrollToBottom();
        
        // Add cursor blink effect
        if (!element.classList.contains('typing')) {
          element.classList.add('typing');
        }
      } else {
        clearInterval(interval);
        element.classList.remove('typing');
      }
    }, speed);
  }

  // LEGACY TYPING INDICATORS (kept for compatibility)
  function showTypingIndicator() {
    showAdvancedTypingIndicator();
  }

  function hideTypingIndicator() {
    hideAdvancedTypingIndicator();
  }
  
  // ADVANCED TYPING INDICATORS
  function showAdvancedTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message bot typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <div class="bot-avatar pulsing">
        <div class="avatar-glow"></div>
        🤖
      </div>
      <div class="message-content">
        <div class="typing-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <div class="thinking-text">Whitney is thinking...</div>
      </div>
    `;
    
    messagesContainer.appendChild(indicator);
    scrollToBottom();
    
    // Add pulse animation to indicator
    indicator.style.animation = 'pulse 1.5s ease-in-out infinite';
  }
  
  function hideAdvancedTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    }
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function generateResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Check for pricing questions FIRST (before greetings)
    if (message.includes('price') || message.includes('cost') || message.includes('quote') || message.includes('how much') || message.includes('plowed') || message.includes('driveway') || message.includes('100 foot') || message.includes('large') || message.includes('snow')) {
      // Check for specific service
      for (const [service, info] of Object.entries(whitneyKnowledge.services)) {
        if (message.includes(service.replace(' ', '')) || message.includes(service) || (service === 'snow removal' && (message.includes('snow') || message.includes('plow') || message.includes('driveway')))) {
          return `For ${service}: ${info.pricing}. ${info.description}. Would you like more details or have questions about other services?`;
        }
      }
      return whitneyKnowledge.responses.pricing;
    }
    
    // Check for greetings (but only simple ones)
    if (message.match(/^(hi|hello|good morning|good afternoon|good evening)$/)) {
      return whitneyKnowledge.greetings[Math.floor(Math.random() * whitneyKnowledge.greetings.length)];
    }
    
    // Check for service inquiries
    for (const [service, info] of Object.entries(whitneyKnowledge.services)) {
      if (message.includes(service.replace(' ', '')) || message.includes(service)) {
        return `${info.description}. Pricing: ${info.pricing}. Need more details or want to request a quote?`;
      }
    }
    
    // Check for contact/location questions
    if (message.includes('contact') || message.includes('reach') || message.includes('call') || message.includes('email')) {
      return whitneyKnowledge.responses.contact;
    }
    
    if (message.includes('location') || message.includes('where') || message.includes('address')) {
      return whitneyKnowledge.responses.location;
    }
    
    // Check for company info
    if (message.includes('about') || message.includes('who') || message.includes('company') || message.includes('business')) {
      return whitneyKnowledge.responses.about;
    }
    
    // Default response
    return whitneyKnowledge.responses.default;
  }

  function loadChatHistory() {
    chatHistory.forEach(chat => {
      const messageEl = createMessageElement(chat.type, chat.message);
      messagesContainer.appendChild(messageEl);
    });
    if (chatHistory.length > 0) {
      scrollToBottom();
    }
  }

  function saveChatHistory() {
    // Keep only last 50 messages to prevent storage bloat
    if (chatHistory.length > 50) {
      chatHistory = chatHistory.slice(-50);
    }
    localStorage.setItem('whitney_chat_history', JSON.stringify(chatHistory));
  }
}

// === Enhanced Scroll Animation Effects ===
function initializeScrollAnimations() {
  // Enhanced Intersection Observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: [0.1, 0.3, 0.5, 0.7]
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const element = entry.target;
      const intersectionRatio = entry.intersectionRatio;
      
      if (entry.isIntersecting && intersectionRatio >= 0.1) {
        element.classList.add('visible');
        
        // Enhanced stagger animation for cards
        if (element.classList.contains('stagger-animation')) {
          const cards = element.querySelectorAll('.card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('visible');
              card.style.transitionDelay = `${index * 0.15}s`;
            }, index * 50);
          });
        }
        
        // Add floating animation to visible elements
        setTimeout(() => {
          if (element.classList.contains('visible')) {
            element.classList.add('floating');
          }
        }, 1000);
      }
    });
  }, observerOptions);

  // Observe all scroll sections and animations
  const animatedElements = document.querySelectorAll(
    '.scroll-section, .fade-up, .stagger-animation, .slide-in-left, .slide-in-right'
  );
  animatedElements.forEach(element => {
    observer.observe(element);
  });

  // Enhanced scroll effects with proper z-index management
  let ticking = false;
  let currentSection = 0;
  
  function updateScrollEffects() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    // Enhanced parallax with multiple layers
    const hero = document.querySelector('.hero');
    if (hero) {
      const heroOffset = scrollTop * 0.3;
      const heroRotation = scrollTop * 0.01;
      hero.style.transform = `translateY(${heroOffset}px) rotateX(${heroRotation}deg)`;
    }
    
    // Advanced section visibility with proper z-index
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const sectionCenter = sectionTop + sectionHeight / 2;
      
      // Calculate visibility and transform
      if (sectionTop < windowHeight && sectionTop + sectionHeight > 0) {
        // Ensure proper stacking order
        section.style.zIndex = sections.length - index;
        
        // Enhanced opacity calculation to prevent clipping
        let opacity = 1;
        if (sectionTop > windowHeight * 0.8) {
          opacity = 1 - (sectionTop - windowHeight * 0.8) / (windowHeight * 0.2);
        } else if (sectionTop + sectionHeight < windowHeight * 0.2) {
          opacity = (sectionTop + sectionHeight) / (windowHeight * 0.2);
        }
        
        section.style.opacity = Math.max(0.1, Math.min(1, opacity));
        
        // Smooth transform for current section
        if (Math.abs(sectionCenter - windowHeight / 2) < windowHeight / 3) {
          currentSection = index;
          const offset = (sectionCenter - windowHeight / 2) * 0.1;
          section.style.transform = `translateY(${offset}px) scale(${1 - Math.abs(offset) * 0.0001})`;
        }
      } else {
        section.style.zIndex = 1;
        section.style.opacity = 0.1;
      }
    });
    
    // Particle effect enhancement
    updateParticleIntensity(scrollTop);
    
    ticking = false;
  }
  
  function updateParticleIntensity(scrollTop) {
    // Dynamically adjust particle effects based on scroll position
    const intensity = Math.sin(scrollTop * 0.001) * 0.5 + 0.5;
    const particleOverlay = document.querySelector('.particle-overlay');
    if (particleOverlay) {
      particleOverlay.style.opacity = 0.3 + intensity * 0.4;
    }
  }
  
  function requestScrollUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }
  
  // Throttled scroll listener for performance
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    requestScrollUpdate();
    
    // Clear existing timeout
    clearTimeout(scrollTimeout);
    
    // Set a timeout to stop intensive calculations
    scrollTimeout = setTimeout(() => {
      ticking = false;
    }, 150);
  });
  
  // Enhanced resize handler
  window.addEventListener('resize', () => {
    clearTimeout(scrollTimeout);
    setTimeout(updateScrollEffects, 100);
  });
  
  // Initial setup
  updateScrollEffects();
  
  // Add smooth scrolling for navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  });
}

// === Professional Quote System Functions ===

let currentQuoteStep = 1;
const totalSteps = 3;
let quoteData = {};

// Show quote form
function showQuoteForm() {
  const formSection = document.getElementById('quote-form-section');
  if (formSection) {
    formSection.style.display = 'block';
    formSection.scrollIntoView({ behavior: 'smooth' });
    resetQuoteForm();
  }
}

// Reset quote form to step 1
function resetQuoteForm() {
  currentQuoteStep = 1;
  quoteData = {};
  updateFormProgress();
  showStep(1);
}

// Change form step
function changeStep(direction) {
  const currentStep = currentQuoteStep + direction;
  
  if (direction > 0 && !validateCurrentStep()) {
    return;
  }
  
  if (currentStep >= 1 && currentStep <= totalSteps) {
    currentQuoteStep = currentStep;
    showStep(currentQuoteStep);
    updateFormProgress();
  }
}

// Show specific step
function showStep(step) {
  // Hide all steps
  document.querySelectorAll('.form-step').forEach(stepEl => {
    stepEl.classList.remove('active');
  });
  
  // Show current step
  const stepEl = document.querySelector(`[data-step="${step}"]`);
  if (stepEl) {
    stepEl.classList.add('active');
  }
  
  // Update navigation buttons
  updateNavigationButtons();
  
  // Update step-specific content
  if (step === 3) {
    generateQuoteSummary();
  }
}

// Update progress bar and step indicator
function updateFormProgress() {
  const progressFill = document.getElementById('progress-fill');
  const currentStepEl = document.getElementById('current-step');
  const totalStepsEl = document.getElementById('total-steps');
  
  if (progressFill) {
    const progress = (currentQuoteStep / totalSteps) * 100;
    progressFill.style.width = `${progress}%`;
  }
  
  if (currentStepEl) currentStepEl.textContent = currentQuoteStep;
  if (totalStepsEl) totalStepsEl.textContent = totalSteps;
}

// Update navigation buttons
function updateNavigationButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  
  if (prevBtn) {
    prevBtn.style.display = currentQuoteStep > 1 ? 'block' : 'none';
  }
  
  if (nextBtn) {
    nextBtn.style.display = currentQuoteStep < totalSteps ? 'block' : 'none';
  }
  
  if (submitBtn) {
    submitBtn.style.display = currentQuoteStep === totalSteps ? 'block' : 'none';
  }
}

// Validate current step
function validateCurrentStep() {
  if (currentQuoteStep === 1) {
    const selectedService = document.querySelector('.service-card.selected');
    if (!selectedService) {
      alert('Please select a service before continuing.');
      return false;
    }
    quoteData.service = selectedService.dataset.service;
  }
  
  if (currentQuoteStep === 2) {
    const description = document.getElementById('project-description').value.trim();
    if (!description) {
      alert('Please provide a project description.');
      return false;
    }
    quoteData.description = description;
    quoteData.timeline = document.getElementById('project-timeline').value;
    quoteData.budget = document.getElementById('project-budget').value;
    quoteData.location = document.getElementById('project-location').value;
  }
  
  if (currentQuoteStep === 3) {
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    
    if (!name || !email) {
      alert('Please provide your name and email address.');
      return false;
    }
    
    quoteData.name = name;
    quoteData.email = email;
    quoteData.phone = document.getElementById('contact-phone').value;
    quoteData.contactMethod = document.getElementById('contact-method').value;
    quoteData.bestTime = document.getElementById('best-time').value;
  }
  
  return true;
}

// Generate quote summary
function generateQuoteSummary() {
  const summaryEl = document.getElementById('quote-summary');
  if (!summaryEl) return;
  
  const serviceNames = {
    'snow-removal': 'Snow Removal',
    'towing': 'Towing Services',
    'excavation': 'Excavation',
    'construction': 'Construction',
    'web-development': 'Web Development',
    'other': 'Other Service'
  };
  
  const budgetLabels = {
    'under-500': 'Under $500',
    '500-1000': '$500 - $1,000',
    '1000-2500': '$1,000 - $2,500',
    '2500-5000': '$2,500 - $5,000',
    '5000-10000': '$5,000 - $10,000',
    '10000-plus': '$10,000+',
    'not-sure': 'Not Sure'
  };
  
  summaryEl.innerHTML = `
    <h4>Quote Request Summary</h4>
    <p><strong>Service:</strong> ${serviceNames[quoteData.service] || 'Not selected'}</p>
    <p><strong>Budget Range:</strong> ${budgetLabels[quoteData.budget] || 'Not specified'}</p>
    <p><strong>Timeline:</strong> ${quoteData.timeline || 'Not specified'}</p>
    <p><strong>Location:</strong> ${quoteData.location || 'Not specified'}</p>
    <p><strong>Contact:</strong> ${quoteData.name} (${quoteData.email})</p>
  `;
}

// Handle service card selection
document.addEventListener('DOMContentLoaded', () => {
  // Service card selection
  document.addEventListener('click', (e) => {
    if (e.target.closest('.service-card')) {
      const card = e.target.closest('.service-card');
      
      // Remove previous selection
      document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
      
      // Add selection to clicked card
      card.classList.add('selected');
    }
  });
  
  // Professional quote form submission
  const quoteForm = document.getElementById('professionalQuoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!validateCurrentStep()) {
        return;
      }
      
      // Prepare submission data
      const submissionData = {
        type: 'professional-quote',
        service: quoteData.service,
        description: quoteData.description,
        timeline: quoteData.timeline,
        budget: quoteData.budget,
        location: quoteData.location,
        name: quoteData.name,
        email: quoteData.email,
        phone: quoteData.phone,
        contactMethod: quoteData.contactMethod,
        bestTime: quoteData.bestTime,
        date: new Date().toLocaleString()
      };
      
      // Store locally
      let submissions = JSON.parse(localStorage.getItem('yw_submissions_v1') || '[]');
      submissions.push(submissionData);
      localStorage.setItem('yw_submissions_v1', JSON.stringify(submissions));
      
      // Submit to server
      try {
        const response = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData)
        });
        
        if (response.ok) {
          alert('Quote request submitted successfully! We\'ll contact you within 24 hours.');
          resetQuoteForm();
          document.getElementById('quote-form-section').style.display = 'none';
        } else {
          throw new Error('Server error');
        }
      } catch (error) {
        alert('Quote saved locally. We\'ll process it as soon as possible!');
        resetQuoteForm();
        document.getElementById('quote-form-section').style.display = 'none';
      }
    });
  }
});

// === Whitney AI Quote Functions ===

function openWhitneyQuote() {
  const modal = document.getElementById('whitney-quote-modal');
  if (modal) {
    modal.style.display = 'block';
    initializeWhitneyQuote();
  }
}

function closeWhitneyQuote() {
  const modal = document.getElementById('whitney-quote-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function initializeWhitneyQuote() {
  const messagesContainer = document.getElementById('whitney-quote-messages');
  if (messagesContainer) {
    // Clear messages and show initial message
    setTimeout(() => {
      messagesContainer.innerHTML = '';
      addWhitneyQuoteMessage('Hi! I\'m Whitney, your AI quote assistant! 🤖 Tell me what service you need and I\'ll provide instant pricing estimates. I can help with snow removal, towing, excavation, construction, web development, and more!', true);
    }, 500);
  }
}

function sendWhitneyQuoteMessage() {
  const input = document.getElementById('whitney-quote-input');
  const message = input.value.trim();
  
  if (message) {
    addWhitneyQuoteMessage(message, false);
    input.value = '';
    
    // Process message and respond
    setTimeout(() => {
      const response = generateWhitneyQuoteResponse(message);
      addWhitneyQuoteMessage(response, true);
    }, 1000);
  }
}

function addWhitneyQuoteMessage(message, isAI) {
  const messagesContainer = document.getElementById('whitney-quote-messages');
  if (!messagesContainer) return;
  
  const messageEl = document.createElement('div');
  messageEl.className = `message ${isAI ? 'ai-message' : 'user-message'}`;
  
  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  contentEl.innerHTML = message;
  
  messageEl.appendChild(contentEl);
  messagesContainer.appendChild(messageEl);
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateWhitneyQuoteResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  // Quote-specific responses
  if (message.includes('quote') || message.includes('price') || message.includes('cost')) {
    if (message.includes('snow')) {
      return 'Snow Removal Pricing (Winter 2025-26): ❄️<br><br><strong>Residential Driveways:</strong><br>• Small (1-2 cars): $35-50<br>• Medium (3-4 cars): $50-70<br>• Large (70-100+ ft): $70-100+<br>• Walkway clearing: +$10-20<br><br><strong>Monthly/Seasonal:</strong><br>• Monthly contract: $180-250<br>• Full season: $700-900<br><br><strong>Commercial Lots:</strong><br>• Small lot (4-8 cars): $75-120<br>• Medium lot (10-20 cars): $120-250<br>• Large lot (big stores): $250-600+<br><br><strong>Equipment Rates:</strong><br>• ATV with plow: $65-85/hr<br>• Pickup truck: $90-120/hr<br>• Skid steer: $110-150/hr<br><br><strong>Add-ons:</strong><br>• Salting/Sanding: +$20-50<br>• Ice scraping: $40-100/hr<br>• Travel fee (15km+): $1.50-2/km<br>• Emergency service: +25%<br><br>Early booking discount: 10% off before Dec 1! 🎉';
    }
    if (message.includes('tow')) {
      return 'Towing Service Pricing: 🚗<br>• Local towing (Whitehorse): $100-150<br>• Long distance: $200+<br>• Emergency service: $150-200<br>• Haines Junction area: +$50 travel<br><br>Need immediate towing? Call Micah: 1-867-332-4551';
    }
    if (message.includes('web') || message.includes('website')) {
      return 'Web Development Pricing: 💻<br>• Basic package: $500-1,500<br>• Custom solution: $2,000-5,000<br>• Premium package: $5,000+<br><br>Includes hosting, domain, and maintenance! Want a detailed quote?';
    }
    if (message.includes('excavat') || message.includes('dig')) {
      return 'Excavation Pricing: 🚜<br>• Hourly rate: $150-300/hour<br>• Foundation work: $200-250/hour<br>• Landscaping: $150-200/hour<br>• Equipment varies by job size<br><br>Tell me more about your project!';
    }
    return 'I can provide quotes for all our services! What specific service are you interested in?<br><br>• Snow Removal 🌨️<br>• Towing Services 🚗<br>• Excavation 🚜<br>• Construction 🏠<br>• Web Development 💻<br><br>Just ask about any service!';
  }
  
  // Service inquiries
  if (message.includes('service')) {
    return 'We offer comprehensive contracting services in Whitehorse and Haines Junction:<br><br>🌨️ <strong>Snow Removal</strong> - Residential & Commercial<br>🚗 <strong>Towing</strong> - Emergency & Scheduled<br>🚜 <strong>Excavation</strong> - Foundations & Landscaping<br>🏠 <strong>Construction</strong> - Complete building services<br>💻 <strong>Web Development</strong> - Professional websites<br><br>What can I help you with?';
  }
  
  // Contact information
  if (message.includes('contact') || message.includes('phone') || message.includes('call')) {
    return 'Ready to get started? Here\'s how to reach us:<br><br>📞 <strong>Lazarus Vanbibber (Founder):</strong> 1-867-332-0223<br>📧 lazarus.vanbibber@icloud.com | lazarusvanbibber@yukon-wildcats.ca<br>📞 <strong>Micah Wolfe (Co-founder):</strong> 1-867-332-4551<br>📧 Micahsage4444@gmail.com<br>💬 <strong>Quote Form:</strong> Fill out our detailed form<br>🤖 <strong>AI Chat:</strong> Keep talking with me!<br><br>We serve Whitehorse and Haines Junction areas!';
  }
  
  // Default helpful response
  return 'I\'m here to help with quotes and service information! You can ask me about:<br><br>• Pricing for any service<br>• Service details and availability<br>• Contact information<br>• Project timelines<br><br>What would you like to know? 😊';
}

// === Phone Quote Functions ===

function initiatePhoneQuote() {
  const modal = document.getElementById('phone-quote-modal');
  if (modal) {
    modal.style.display = 'block';
  }
}

function closePhoneQuote() {
  const modal = document.getElementById('phone-quote-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function scheduleCallback() {
  alert('Callback scheduling feature coming soon! For now, please call us directly at 1-867-332-4551 or use our quote form.');
}

function requestCallback() {
  const phone = prompt('Please enter your phone number for a callback within 2 hours:');
  if (phone) {
    alert(`Thank you! We'll call you back at ${phone} within 2 hours during business hours.`);
    // Here you would normally send this to your server
  }
}

// Enhanced Whitney chatbot accessibility
document.addEventListener('DOMContentLoaded', () => {
  // Keyboard shortcuts for Whitney
  document.addEventListener('keydown', (e) => {
    // Alt + W to open Whitney
    if (e.altKey && e.key === 'w') {
      const whitneyToggle = document.getElementById('whitney-toggle');
      if (whitneyToggle) {
        whitneyToggle.click();
      }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
      closeWhitneyQuote();
      closePhoneQuote();
    }
  });
  
  // Enter to send Whitney quote messages
  const whitneyQuoteInput = document.getElementById('whitney-quote-input');
  if (whitneyQuoteInput) {
    whitneyQuoteInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendWhitneyQuoteMessage();
      }
    });
  }
});

// ===== SERVICE CART SYSTEM =====

let serviceCart = JSON.parse(localStorage.getItem('yw_service_cart')) || [];

function updateCartDisplay() {
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const emptyCart = document.getElementById('emptyCart');
  
  if (!cartCount) return;
  
  // Update cart count
  if (serviceCart.length > 0) {
    cartCount.textContent = serviceCart.length;
    cartCount.classList.remove('hidden');
  } else {
    cartCount.classList.add('hidden');
  }
  
  // Update cart items display
  if (serviceCart.length === 0) {
    emptyCart.style.display = 'block';
    cartFooter.style.display = 'none';
    cartItems.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-clipboard-list"></i>
        <p>No services added yet</p>
        <small>Browse our services and add them to create your request</small>
      </div>
    `;
  } else {
    emptyCart.style.display = 'none';
    cartFooter.style.display = 'block';
    
    cartItems.innerHTML = serviceCart.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.price} - ${item.description}</p>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${index})" title="Remove service">
          ×
        </button>
      </div>
    `).join('');
    
    // Update service count
    const serviceCount = document.getElementById('serviceCount');
    if (serviceCount) {
      serviceCount.textContent = serviceCart.length;
    }
  }
}

function addToCart(serviceId, serviceName, servicePrice, serviceDescription) {
  // Check if service already exists
  const existingService = serviceCart.find(item => item.id === serviceId);
  
  if (existingService) {
    // Show message that item is already added
    showNotification('Service already added to your request!', 'warning');
    return;
  }
  
  // Add service to cart
  const service = {
    id: serviceId,
    name: serviceName,
    price: servicePrice,
    description: serviceDescription,
    addedAt: new Date().toISOString()
  };
  
  serviceCart.push(service);
  localStorage.setItem('yw_service_cart', JSON.stringify(serviceCart));
  
  // Update UI
  updateCartDisplay();
  
  // Show success message
  showNotification(`${serviceName} added to your service request!`, 'success');
  
  // Update button state
  const buttons = document.querySelectorAll(`[onclick*="${serviceId}"]`);
  buttons.forEach(button => {
    button.innerHTML = '<i class="fas fa-check"></i> Added to Request';
    button.classList.add('added');
  });
}

function removeFromCart(index) {
  const removedService = serviceCart[index];
  serviceCart.splice(index, 1);
  localStorage.setItem('yw_service_cart', JSON.stringify(serviceCart));
  
  // Update UI
  updateCartDisplay();
  
  // Reset button state
  const buttons = document.querySelectorAll(`[onclick*="${removedService.id}"]`);
  buttons.forEach(button => {
    button.innerHTML = '<i class="fas fa-plus"></i> Add to Service Request';
    button.classList.remove('added');
  });
  
  showNotification(`${removedService.name} removed from your request`, 'info');
}

function toggleServiceCart() {
  const cartDropdown = document.getElementById('cartDropdown');
  if (!cartDropdown) return;
  
  cartDropdown.classList.toggle('visible');
  
  // Update cart display when opened
  if (cartDropdown.classList.contains('visible')) {
    updateCartDisplay();
  }
}

function proceedToCheckout() {
  if (serviceCart.length === 0) {
    showNotification('Please add some services to your request first!', 'warning');
    return;
  }
  
  // Redirect to checkout page
  window.location.href = 'checkout.html';
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${getNotificationIcon(type)}"></i>
    <span>${message}</span>
  `;
  
  // Style the notification
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${getNotificationColor(type)};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function getNotificationIcon(type) {
  switch(type) {
    case 'success': return 'check-circle';
    case 'warning': return 'exclamation-triangle';
    case 'error': return 'times-circle';
    default: return 'info-circle';
  }
}

function getNotificationColor(type) {
  switch(type) {
    case 'success': return 'linear-gradient(135deg, #4CAF50, #45a049)';
    case 'warning': return 'linear-gradient(135deg, #ff9800, #f57c00)';
    case 'error': return 'linear-gradient(135deg, #f44336, #d32f2f)';
    default: return 'linear-gradient(135deg, #2196F3, #1976D2)';
  }
}

// Authentication Navigation Management
function initializeAuthNavigation() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const founderAuth = localStorage.getItem('yw_founder_authenticated') === 'true';
  const founderName = localStorage.getItem('yw_founder_name');
  const authSection = document.querySelector('.auth-section');
  const adminLink = document.querySelector('.admin-login');
  
  // If we have an auth section (new layout), update it
  if (authSection) {
    const adminAccessLink = authSection.querySelector('.admin-access');
    const loginLink = authSection.querySelector('.login-link');
    
    if (founderAuth && founderName) {
      // Founder is authenticated - show founder status
      if (adminAccessLink) {
        const displayName = founderName.charAt(0).toUpperCase() + founderName.slice(1);
        adminAccessLink.innerHTML = '<i class="fas fa-users" style="color: gold;"></i><span>' + displayName + '</span>';
        adminAccessLink.title = 'Founder Access - Logged In';
      }
    }
    
    if (currentUser) {
      // Regular user is logged in - show account menu
      if (loginLink) {
        loginLink.outerHTML = `
          <div class="dropdown auth-dropdown">
            <a href="#" class="dropbtn auth-user">
              <i class="fas fa-user-circle"></i>
              <span>${currentUser.firstName || 'Account'}</span>
            </a>
            <div class="dropdown-content">
              <a href="dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
              <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
          </div>
        `;
      }
    }
    return;
  }
  
  // Legacy single admin-login element handling
  if (currentUser) {
    // User is logged in - show account menu
    if (adminLink) {
      adminLink.outerHTML = `
        <div class="dropdown auth-dropdown">
          <a href="#" class="dropbtn auth-user">
            <i class="fas fa-user-circle"></i>
            <span>${currentUser.firstName || 'Account'}</span>
          </a>
          <div class="dropdown-content">
            <a href="dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
            <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
          </div>
        </div>
      `;
    }
  } else {
    // User is not logged in - show login link
    if (adminLink) {
      adminLink.outerHTML = `
        <a href="login.html" class="login-link" title="Login / Create Account">
          <i class="fas fa-sign-in-alt"></i>
          <span>Login</span>
        </a>
      `;
    }
  }
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartDisplay();
  initializeAuthNavigation();
  initializePageTransitions();
  initializeAdvancedFeatures();
  
  // Update button states for already added services
  serviceCart.forEach(service => {
    const buttons = document.querySelectorAll(`[onclick*="${service.id}"]`);
    buttons.forEach(button => {
      button.innerHTML = '<i class="fas fa-check"></i> Added to Request';
      button.classList.add('added');
    });
  });
});

// === Advanced Page Transitions ===
function initializePageTransitions() {
  // Create transition overlay
  const transitionOverlay = document.createElement('div');
  transitionOverlay.className = 'page-transition';
  transitionOverlay.innerHTML = `
    <div class="transition-content">
      <img src="assets/logo.png" alt="Loading..." class="transition-logo">
      <p>Loading...</p>
    </div>
  `;
  document.body.appendChild(transitionOverlay);
  
  // Intercept navigation clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    
    if (link && 
        link.href && 
        !link.href.includes('#') && 
        !link.href.includes('mailto:') && 
        !link.href.includes('tel:') &&
        !link.target &&
        !link.classList.contains('external-link')) {
      
      // Only handle internal navigation
      if (link.hostname === window.location.hostname) {
        e.preventDefault();
        
        // Show transition
        transitionOverlay.classList.add('active');
        
        // Navigate after animation
        setTimeout(() => {
          window.location.href = link.href;
        }, 300);
      }
    }
  });
}

// === Advanced Features Initialization ===
function initializeAdvancedFeatures() {
  // Performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      console.log(`Page loaded in ${loadTime}ms`);
      
      // Analytics could be sent here
      if (loadTime > 3000) {
        console.warn('Page load time is above recommended 3 seconds');
      }
    });
  }
  
  // Enhanced form handling
  enhanceFormsWithModernFeatures();
  
  // Lazy loading for images
  initializeLazyLoading();
  
  // Enhanced accessibility
  initializeAccessibilityFeatures();
  
  // Advanced error handling
  initializeErrorHandling();
}

// === Enhanced Form Features ===
function enhanceFormsWithModernFeatures() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Add modern input styling
      const wrapper = document.createElement('div');
      wrapper.className = 'modern-input';
      
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      
      // Add floating labels if placeholder exists
      if (input.placeholder && !input.previousElementSibling) {
        const label = document.createElement('label');
        label.textContent = input.placeholder;
        label.setAttribute('for', input.id || '');
        wrapper.appendChild(label);
        input.placeholder = '';
      }
      
      // Enhanced validation feedback
      input.addEventListener('invalid', (e) => {
        e.preventDefault();
        showValidationMessage(input, input.validationMessage);
      });
      
      input.addEventListener('input', () => {
        clearValidationMessage(input);
      });
    });
    
    // Enhanced submit handling
    form.addEventListener('submit', (e) => {
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn && !submitBtn.disabled) {
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      }
    });
  });
}

function showValidationMessage(input, message) {
  clearValidationMessage(input);
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'validation-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #ff6b6b;
    font-size: 0.85rem;
    margin-top: 0.25rem;
    padding: 0.25rem 0;
    opacity: 0;
    transform: translateY(-5px);
    transition: all 0.3s ease;
  `;
  
  input.parentNode.appendChild(errorDiv);
  
  // Animate in
  requestAnimationFrame(() => {
    errorDiv.style.opacity = '1';
    errorDiv.style.transform = 'translateY(0)';
  });
}

function clearValidationMessage(input) {
  const errorDiv = input.parentNode.querySelector('.validation-error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// === Lazy Loading Implementation ===
function initializeLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// === Accessibility Enhancements ===
function initializeAccessibilityFeatures() {
  // Keyboard navigation enhancement
  let focusedIndex = -1;
  const focusableElements = document.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  
  document.addEventListener('keydown', (e) => {
    // Skip functionality if user is typing in an input
    if (document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA') {
      return;
    }
    
    switch (e.key) {
      case 'Tab':
        // Enhanced tab navigation feedback
        setTimeout(() => {
          if (document.activeElement) {
            document.activeElement.classList.add('keyboard-focused');
          }
        }, 0);
        break;
        
      case 'Escape':
        // Close modals, dropdowns, etc.
        document.querySelectorAll('.modal.active, .dropdown.active').forEach(el => {
          el.classList.remove('active');
        });
        break;
    }
  });
  
  // Remove keyboard focus styling on mouse interaction
  document.addEventListener('mousedown', () => {
    document.querySelectorAll('.keyboard-focused').forEach(el => {
      el.classList.remove('keyboard-focused');
    });
  });
  
  // Announce dynamic content changes for screen readers
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  // Make announcements available globally
  window.announceToScreenReader = announceToScreenReader;
}

// === Advanced Error Handling ===
function initializeErrorHandling() {
  // Global error handler
  window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    
    // In production, you might want to send this to an error tracking service
    if (window.location.hostname !== 'localhost') {
      // Example: sendErrorToService(e.error);
    }
  });
  
  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
  });
  
  // Network error detection
  window.addEventListener('online', () => {
    showNetworkStatus('Connected to internet', 'success');
  });
  
  window.addEventListener('offline', () => {
    showNetworkStatus('No internet connection', 'error');
  });
}

function showNetworkStatus(message, type) {
  const notification = document.createElement('div');
  notification.className = `network-status ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-weight: 500;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// === PAYMENT SYSTEM FUNCTIONALITY ===
document.addEventListener('DOMContentLoaded', function() {
  initializePaymentForm();
});

function initializePaymentForm() {
  const paymentForm = document.getElementById('payment-form');
  const paymentMethodSelect = document.getElementById('payment-method');
  const cardDetails = document.getElementById('card-details');
  const transferDetails = document.getElementById('transfer-details');
  const cardNumberInput = document.getElementById('card-number');

  if (!paymentForm) return;

  if (paymentMethodSelect) {
    paymentMethodSelect.addEventListener('change', function() {
      const selectedMethod = this.value;
      
      if (cardDetails) cardDetails.style.display = 'none';
      if (transferDetails) transferDetails.style.display = 'none';
      
      if (selectedMethod === 'credit-card' || selectedMethod === 'debit-card') {
        if (cardDetails) cardDetails.style.display = 'block';
        updateRequiredFields(true);
      } else if (selectedMethod === 'e-transfer' || selectedMethod === 'bank-transfer') {
        if (transferDetails) transferDetails.style.display = 'block';
        updateRequiredFields(false);
      } else {
        updateRequiredFields(false);
      }
    });
  }

  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function() {
      let value = this.value.replace(/\s/g, '').replace(/\D/g, '');
      let formattedValue = '';
      
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
      
      this.value = formattedValue;
    });
  }

  const cvvInput = document.getElementById('cvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '');
    });
  }

  if (paymentForm) {
    paymentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (validatePaymentForm()) {
        processPayment();
      }
    });
  }
}

function updateRequiredFields(cardRequired) {
  const cardFields = ['card-number', 'expiry-month', 'expiry-year', 'cvv', 'cardholder-name'];
  
  cardFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.required = cardRequired;
    }
  });
}

function validatePaymentForm() {
  const invoiceNumber = document.getElementById('invoice-number').value.trim();
  const amount = parseFloat(document.getElementById('payment-amount').value);
  const paymentMethod = document.getElementById('payment-method').value;
  const customerEmail = document.getElementById('customer-email').value.trim();

  if (!invoiceNumber) {
    showPaymentError('Please enter your invoice number');
    return false;
  }

  if (!amount || amount <= 0) {
    showPaymentError('Please enter a valid payment amount');
    return false;
  }

  if (!paymentMethod) {
    showPaymentError('Please select a payment method');
    return false;
  }

  if (!customerEmail || !isValidEmail(customerEmail)) {
    showPaymentError('Please enter a valid email address');
    return false;
  }

  if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiryMonth = document.getElementById('expiry-month').value;
    const expiryYear = document.getElementById('expiry-year').value;
    const cvv = document.getElementById('cvv').value;
    const cardholderName = document.getElementById('cardholder-name').value.trim();

    if (!cardNumber || cardNumber.length < 13) {
      showPaymentError('Please enter a valid card number');
      return false;
    }

    if (!expiryMonth || !expiryYear) {
      showPaymentError('Please enter card expiry date');
      return false;
    }

    if (!cvv || cvv.length < 3) {
      showPaymentError('Please enter a valid CVV');
      return false;
    }

    if (!cardholderName) {
      showPaymentError('Please enter cardholder name');
      return false;
    }
  }

  return true;
}

function processPayment() {
  const submitButton = document.querySelector('.submit-payment');
  const originalText = submitButton.innerHTML;
  
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
  submitButton.disabled = true;

  setTimeout(() => {
    const mockResponse = {
      success: true,
      transactionId: 'YWC-' + Date.now(),
      message: 'Payment processed successfully'
    };
    
    showPaymentSuccess(mockResponse);
    
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
  }, 2000);
}

function showPaymentSuccess(data) {
  const successMessage = 
    <div class="payment-success" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.95); border: 2px solid #4ecdc4; border-radius: 15px; padding: 2rem; text-align: center; z-index: 10000; min-width: 400px; color: white;">
      <div style="font-size: 3rem; color: #4ecdc4; margin-bottom: 1rem;"></div>
      <h2 style="color: #4ecdc4; margin-bottom: 1rem;">Payment Successful!</h2>
      <p style="margin-bottom: 1rem;">Your payment has been processed successfully.</p>
      <p style="margin-bottom: 1rem;"><strong>Transaction ID:</strong> </p>
      <p style="margin-bottom: 2rem;">A confirmation email has been sent to your address.</p>
      <button onclick="this.parentElement.remove()" style="background: #4ecdc4; color: #000; border: none; padding: 0.8rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600;">Close</button>
    </div>
  ;
  
  document.body.insertAdjacentHTML('beforeend', successMessage);
  
  document.getElementById('payment-form').reset();
  document.getElementById('card-details').style.display = 'none';
  document.getElementById('transfer-details').style.display = 'none';
}

function showPaymentError(message) {
  const errorDiv = document.querySelector('.payment-error');
  if (errorDiv) errorDiv.remove();
  
  const errorMessage = 
    <div class="payment-error" style="background: rgba(255, 107, 107, 0.1); border: 2px solid #ff6b6b; border-radius: 10px; padding: 1rem; margin: 1rem 0; color: #ff6b6b; text-align: center;">
      <i class="fas fa-exclamation-triangle"></i> 
    </div>
  ;
  
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    paymentForm.insertAdjacentHTML('afterbegin', errorMessage);
    setTimeout(() => {
      const error = document.querySelector('.payment-error');
      if (error) error.remove();
    }, 5000);
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// === DOCUMENT MANAGEMENT FUNCTIONALITY ===
document.addEventListener('DOMContentLoaded', function() {
  initializeDocumentManagement();
  animateStats();
});

function initializeDocumentManagement() {
  setupDocumentSearch();
  setupFileUpload();
  checkUserAuthentication();
}

// Animate statistics counters
function animateStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    let current = 0;
    const increment = target / 100;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        stat.textContent = target;
        clearInterval(timer);
      } else {
        stat.textContent = Math.floor(current);
      }
    }, 20);
  });
}

// Document search functionality
function setupDocumentSearch() {
  const searchInput = document.getElementById('document-search');
  const categoryFilter = document.getElementById('document-category');
  const statusFilter = document.getElementById('document-status');
  const accessFilter = document.getElementById('document-access');
  
  if (searchInput) {
    searchInput.addEventListener('input', filterDocuments);
  }
  
  [categoryFilter, statusFilter, accessFilter].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', filterDocuments);
    }
  });
}

function filterDocuments() {
  const searchTerm = document.getElementById('document-search')?.value.toLowerCase() || '';
  const category = document.getElementById('document-category')?.value || '';
  const status = document.getElementById('document-status')?.value || '';
  const access = document.getElementById('document-access')?.value || '';
  
  const documentCards = document.querySelectorAll('.document-card');
  
  documentCards.forEach(card => {
    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
    const cardCategory = card.getAttribute('data-category') || '';
    const cardStatus = card.getAttribute('data-status') || '';
    const cardAccess = card.getAttribute('data-access') || '';
    
    const matchesSearch = title.includes(searchTerm);
    const matchesCategory = !category || cardCategory === category;
    const matchesStatus = !status || cardStatus === status;
    const matchesAccess = !access || cardAccess === access;
    
    if (matchesSearch && matchesCategory && matchesStatus && matchesAccess) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function filterByCategory(category) {
  const categoryFilter = document.getElementById('document-category');
  if (categoryFilter) {
    categoryFilter.value = category;
    filterDocuments();
    
    // Scroll to document grid
    const documentGrid = document.querySelector('.document-grid');
    if (documentGrid) {
      documentGrid.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// File upload functionality
function setupFileUpload() {
  const uploadArea = document.getElementById('document-upload-area');
  const fileInput = document.getElementById('file-upload');
  
  if (uploadArea && fileInput) {
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    
    // File input change handler
    fileInput.addEventListener('change', handleFileSelect);
  }
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.style.borderColor = '#ffd700';
  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
}

function handleDragLeave(e) {
  e.preventDefault();
  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
}

function handleFileDrop(e) {
  e.preventDefault();
  handleDragLeave(e);
  
  const files = e.dataTransfer.files;
  processFiles(files);
}

function handleFileSelect(e) {
  const files = e.target.files;
  processFiles(files);
}

function processFiles(files) {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  Array.from(files).forEach(file => {
    if (!allowedTypes.includes(file.type)) {
      showNotification('Error: ' + file.name + ' is not a supported file type', 'error');
      return;
    }
    
    if (file.size > maxSize) {
      showNotification('Error: ' + file.name + ' exceeds the 50MB size limit', 'error');
      return;
    }
    
    uploadFile(file);
  });
}

function uploadFile(file) {
  const progressSection = document.getElementById('upload-progress');
  const progressBar = document.getElementById('progress-fill');
  const statusText = document.getElementById('upload-status');
  
  if (progressSection) progressSection.style.display = 'block';
  
  // Simulate upload progress
  let progress = 0;
  const progressTimer = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressTimer);
      
      if (statusText) statusText.textContent = 'Upload completed: ' + file.name;
      showNotification('File uploaded successfully: ' + file.name, 'success');
      
      setTimeout(() => {
        if (progressSection) progressSection.style.display = 'none';
        if (progressBar) progressBar.style.width = '0%';
      }, 2000);
    } else {
      if (statusText) statusText.textContent = 'Uploading: ' + file.name + ' (' + Math.floor(progress) + '%)';
    }
    
    if (progressBar) progressBar.style.width = progress + '%';
  }, 200);
}

// Document viewer functions
function viewDocument(filename) {
  const modal = document.getElementById('document-modal');
  const viewer = document.getElementById('document-viewer');
  const title = document.getElementById('modal-title');
  
  if (modal && viewer && title) {
    title.textContent = filename;
    viewer.src = '/documents/' + filename; // This would be the actual document path
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeDocumentModal() {
  const modal = document.getElementById('document-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

function downloadDocument(filename) {
  // Create a temporary link to trigger download
  const link = document.createElement('a');
  link.href = '/documents/' + filename;
  link.download = filename;
  link.click();
  
  showNotification('Download started: ' + filename, 'success');
}

function downloadCurrentDocument() {
  const viewer = document.getElementById('document-viewer');
  if (viewer && viewer.src) {
    const filename = viewer.src.split('/').pop();
    downloadDocument(filename);
  }
}

// Authentication check
function checkUserAuthentication() {
  const isLoggedIn = localStorage.getItem('yw_user_logged_in');
  const userRole = localStorage.getItem('yw_user_role');
  
  const clientDocs = document.getElementById('client-documents');
  const clientLogin = document.getElementById('client-portal-login');
  const adminSection = document.getElementById('admin-docs');
  
  if (isLoggedIn === 'true') {
    if (clientLogin) clientLogin.style.display = 'none';
    if (clientDocs) clientDocs.style.display = 'block';
    
    if (userRole === 'admin' && adminSection) {
      adminSection.style.display = 'block';
    }
  }
}

// Admin functions
function openBulkUpload() {
  showNotification('Bulk upload feature coming soon!', 'info');
}

function generateReport() {
  showNotification('Generating document usage report...', 'info');
  
  setTimeout(() => {
    const reportData = {
      totalDocuments: 156,
      downloadsThisMonth: 1847,
      storageUsed: '2.4 GB',
      mostDownloaded: 'Certificate of Compliance'
    };
    
    showNotification('Report generated successfully!', 'success');
    console.log('Document Report:', reportData);
  }, 2000);
}

function manageAccess() {
  showNotification('Access management panel opening...', 'info');
  // This would redirect to admin panel or open a modal
}

// Utility function for notifications
function showDocumentNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#4CAF50' : '#2196F3'};
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    z-index: 10001;
    font-weight: 600;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
