// Announcement Banner Management
function initializeAnnouncement() {
  const header = document.querySelector('header');
  const announcement = localStorage.getItem('yw_announcement');
  const isDismissed = localStorage.getItem('yw_announcement_dismissed');
  
  if (announcement && !isDismissed) {
    const banner = document.createElement('div');
    banner.className = 'announcement-banner';
    banner.innerHTML = `
      <p class="announcement-text">${announcement}</p>
      <button class="close-button" aria-label="Close Announcement">&times;</button>
    `;
    document.body.insertBefore(banner, document.body.firstChild);
    header.classList.remove('no-announcement');

    banner.querySelector('.close-button').addEventListener('click', () => {
      banner.classList.add('hidden');
      header.classList.add('no-announcement');
      localStorage.setItem('yw_announcement_dismissed', 'true');
      setTimeout(() => banner.remove(), 300);
    });
  } else {
    header.classList.add('no-announcement');
  }
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
});

// === Whitney AI Chatbot Functionality ===
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

  let hasShownInitialPopup = localStorage.getItem('whitney_popup_shown');
  let chatHistory = JSON.parse(localStorage.getItem('whitney_chat_history') || '[]');

  // Whitney's knowledge base
  const whitneyKnowledge = {
    services: {
      'snow removal': {
        description: 'Professional snow removal for residential and commercial properties in Whitehorse and Haines Junction',
        pricing: 'Residential: $50-150 per visit in Whitehorse | Travel charges apply for Haines Junction'
      },
      'towing': {
        description: 'Emergency towing and vehicle transport in Whitehorse and Haines Junction areas',
        pricing: '$100-200 within Whitehorse | Additional travel charges for Haines Junction area'
      },
      'excavation': {
        description: 'Expert excavation services for foundations, landscaping, and construction',
        pricing: '$150-300/hour depending on equipment needed'
      },
      'dump trucking': {
        description: 'Material hauling and transport services',
        pricing: '$200-400 per load depending on distance and material'
      },
      'housing contracts': {
        description: 'Complete construction and renovation services',
        pricing: 'Custom quotes - contact us for detailed estimates'
      },
      'lawn mowing': {
        description: 'Seasonal lawn maintenance and landscaping',
        pricing: 'Residential: $40-80 per visit | Commercial properties: Custom rates'
      },
      'web development': {
        description: 'Professional website design and development services',
        pricing: 'Basic: $500-1500 | Custom: $2000-5000 | Premium: $5000+'
      }
    },
    greetings: [
      "Hey there! I'm Whitney, your AI assistant for Yukon Wildcats Contracting! 🌟",
      "Hi! I'm Whitney, here to help you learn about our services and pricing! 👋",
      "Hello! Whitney here, ready to assist you with any questions about our contracting services! ⚡"
    ],
    responses: {
      default: "I'd be happy to help! You can ask me about our services like snow removal, towing, excavation, dump trucking, housing contracts, lawn mowing, or web development. I can also provide pricing information!",
      pricing: "I can help with pricing! Which service are you interested in? We offer snow removal, towing, excavation, dump trucking, housing contracts, lawn mowing, and web development.",
      contact: "You can get a quote in multiple ways: 1) Use our professional quote form, 2) Chat with me for instant estimates, or 3) Call us directly - Lazarus: 1-867-332-0223 or Micah: 1-867-332-4551. We serve Whitehorse and Haines Junction areas! For legal documents, check our Legal Info page.",
      quote: "I can help you get an instant quote! Tell me what service you need: snow removal, towing, excavation, construction, web development, or something else. I'll provide pricing estimates and can even start a detailed quote request for you!",
      location: "We're based in Whitehorse, Yukon, and provide services in Whitehorse and Haines Junction areas. Our team is familiar with local conditions and regulations in both locations!",
      about: "Yukon Wildcats Contracting is your trusted team for reliable, fast, and futuristic contracting services in Whitehorse and Haines Junction. We specialize in snow removal, towing, excavation, construction, and web development!"
    }
  };

  // Show initial popup if first visit
  if (!hasShownInitialPopup) {
    setTimeout(() => {
      showInitialPopup();
    }, 2000);
  }

  // Event listeners
  toggle.addEventListener('click', toggleChat);
  closeChat.addEventListener('click', hideChat);
  closePopup.addEventListener('click', hidePopup);
  sendButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Load chat history
  loadChatHistory();

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
    chatInput.focus();
    
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

  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addUserMessage(message);
    chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Generate response after delay
    setTimeout(() => {
      hideTypingIndicator();
      const response = generateResponse(message);
      addBotMessage(response);
    }, 1000 + Math.random() * 1000);
  }

  function addUserMessage(message) {
    const messageEl = createMessageElement('user', message);
    messagesContainer.appendChild(messageEl);
    scrollToBottom();
    
    // Save to history
    chatHistory.push({type: 'user', message, timestamp: Date.now()});
    saveChatHistory();
  }

  function addBotMessage(message) {
    const messageEl = createMessageElement('bot', message);
    messagesContainer.appendChild(messageEl);
    scrollToBottom();
    
    // Save to history
    chatHistory.push({type: 'bot', message, timestamp: Date.now()});
    saveChatHistory();
  }

  function createMessageElement(type, message) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = message;
    return div;
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    indicator.id = 'typing-indicator';
    messagesContainer.appendChild(indicator);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function generateResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Check for greetings
    if (message.match(/^(hi|hello|hey|good|morning|afternoon|evening)/)) {
      return whitneyKnowledge.greetings[Math.floor(Math.random() * whitneyKnowledge.greetings.length)];
    }
    
    // Check for pricing questions
    if (message.includes('price') || message.includes('cost') || message.includes('quote') || message.includes('how much')) {
      // Check for specific service
      for (const [service, info] of Object.entries(whitneyKnowledge.services)) {
        if (message.includes(service.replace(' ', '')) || message.includes(service)) {
          return `For ${service}: ${info.pricing}. ${info.description}. Would you like more details or have questions about other services?`;
        }
      }
      return whitneyKnowledge.responses.pricing;
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
      return 'Snow Removal Pricing: 🌨️<br>• Residential driveways: $50-80/visit<br>• Large driveways: $80-120/visit<br>• Commercial lots: $120-150+/visit<br>• Haines Junction: +$25 travel fee<br><br>Would you like me to start a detailed quote for you?';
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
