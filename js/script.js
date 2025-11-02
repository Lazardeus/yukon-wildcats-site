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
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
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

  if(quoteForm){
    quoteForm.addEventListener('submit', e => {
      e.preventDefault();
      handleFormSubmit(quoteForm, true);
    });
  }

});
