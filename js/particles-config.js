// Enhanced Particles.js configuration with multiple particle types
particlesJS("particles-js", {
  "particles": {
    "number": { 
      "value": 120,
      "density": {
        "enable": true,
        "value_area": 1000
      }
    },
    "color": { 
      "value": ["#ffd700", "#ffed4a", "#fff", "#f39c12", "#e67e22"]
    },
    "shape": { 
      "type": ["circle", "triangle", "star"],
      "stroke": {
        "width": 1,
        "color": "#ffd700"
      },
      "polygon": {
        "nb_sides": 6
      }
    },
    "opacity": { 
      "value": 0.4,
      "random": true,
      "anim": {
        "enable": true,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": { 
      "value": 4,
      "random": true,
      "anim": {
        "enable": true,
        "speed": 2,
        "size_min": 0.5,
        "sync": false
      }
    },
    "line_linked": { 
      "enable": true, 
      "distance": 150, 
      "color": "#ffd700", 
      "opacity": 0.2, 
      "width": 1.5,
      "shadow": {
        "enable": true,
        "color": "#ffd700",
        "blur": 5
      }
    },
    "move": { 
      "enable": true, 
      "speed": 1.5,
      "direction": "none",
      "random": true,
      "straight": false,
      "out_mode": "bounce",
      "bounce": false,
      "attract": {
        "enable": true,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": { 
        "enable": true, 
        "mode": ["repulse", "bubble"]
      },
      "onclick": { 
        "enable": true, 
        "mode": "push" 
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 200,
        "line_linked": {
          "opacity": 0.8
        }
      },
      "bubble": {
        "distance": 200,
        "size": 8,
        "duration": 2,
        "opacity": 0.8,
        "speed": 3
      },
      "repulse": { 
        "distance": 120,
        "duration": 0.4
      },
      "push": { 
        "particles_nb": 6 
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
});

// Dynamic particle effects based on scroll
let particleIntensity = 1;

function adjustParticleEffects() {
  const scrollPercent = window.pageYOffset / (document.body.scrollHeight - window.innerHeight);
  const newIntensity = 0.5 + scrollPercent * 0.5;
  
  if (Math.abs(newIntensity - particleIntensity) > 0.1) {
    particleIntensity = newIntensity;
    
    // Update particle configuration dynamically
    if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
      const pJS = window.pJSDom[0].pJS;
      pJS.particles.opacity.value = 0.2 + particleIntensity * 0.3;
      pJS.particles.line_linked.opacity = 0.1 + particleIntensity * 0.2;
      pJS.particles.move.speed = 1 + particleIntensity * 2;
    }
  }
}

// Throttled scroll listener for particle effects
let particleTicking = false;
window.addEventListener('scroll', () => {
  if (!particleTicking) {
    requestAnimationFrame(adjustParticleEffects);
    particleTicking = true;
    setTimeout(() => { particleTicking = false; }, 100);
  }
});
