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

document.addEventListener('DOMContentLoaded', () => {
  // Initialize announcement banner
  initializeAnnouncement();

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

      // Send email notification (you'll need to set this up in your server)
      try {
        const response = await fetch('/api/web-quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
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

});
