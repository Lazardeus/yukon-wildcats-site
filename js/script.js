document.addEventListener('DOMContentLoaded', () => {

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
  if(contactForm){
    const googleScriptURL = 'https://script.google.com/macros/s/AKfycbwspcRJeN8zAURiiGTEj-ic6blmzQ-V7mOB8zR2-fjsMzD9BjN0kr-4fst4jbLYW4cE/exec';

    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      // Save to localStorage
      const submissions = JSON.parse(localStorage.getItem('yw_submissions_v1')) || [];
      submissions.push({
        name: contactForm.name.value,
        email: contactForm.email.value,
        service: contactForm.service.value,
        message: contactForm.message.value,
        date: new Date().toLocaleString()
      });
      localStorage.setItem('yw_submissions_v1', JSON.stringify(submissions));

      // Send to Google Sheets
      fetch(googleScriptURL, { method: 'POST', body: new FormData(contactForm) })
        .then(() => {
          alert('Form submitted successfully!');
          contactForm.reset();
        })
        .catch(() => alert('Error submitting form.'));
    });
  }

  // === Admin Panel Login Handling ===
  const adminLogin = document.getElementById('adminLogin');
  const submissionList = document.getElementById('submissionList');
  const adminUsername = 'admin';
  const adminPassword = 'wildcats2025';

  if(adminLogin){
    adminLogin.addEventListener('submit', e => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if(username === adminUsername && password === adminPassword){
        alert('Login successful!');
        const submissions = JSON.parse(localStorage.getItem('yw_submissions_v1')) || [];
        submissionList.textContent = JSON.stringify(submissions, null, 2);
      } else {
        alert('Invalid username or password.');
      }
    });
  }

});
