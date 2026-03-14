document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // Smooth Scrolling - Lenis
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical',
    smooth: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time)=>{
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0, 0);

  // 1. Loading Sequence
  const loader = document.querySelector('.loader');
  const progressText = document.getElementById('progress-text');
  
  let progress = { val: 0 };
  gsap.to(progress, {
    val: 100,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      progressText.innerText = Math.round(progress.val);
    },
    onComplete: () => {
      gsap.to(loader, {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          loader.style.display = 'none';
          initHeroAnimations();
        }
      });
    }
  });

  // 1.5 Init Particles
  if(document.getElementById('particles-js')) {
    particlesJS("particles-js", {
      "particles": {
        "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": "#06b6d4" },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.5, "random": false },
        "size": { "value": 3, "random": true },
        "line_linked": {
          "enable": true,
          "distance": 150,
          "color": "#2563eb",
          "opacity": 0.4,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 2,
          "direction": "none",
          "random": false,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": { "enable": true, "mode": "grab" },
          "onclick": { "enable": true, "mode": "push" },
          "resize": true
        },
        "modes": {
          "grab": { "distance": 140, "line_linked": { "opacity": 1 } },
          "push": { "particles_nb": 4 }
        }
      },
      "retina_detect": true
    });
  }

  // 2. Hero Animations
  function initHeroAnimations() {
    const tl = gsap.timeline();

    // Title Reveal
    tl.fromTo('.hero-title', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }, 0.5
    );

    tl.fromTo('.hero-sub', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.8"
    );
    
    // Header Fade In
    gsap.fromTo('.header',
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=1.5"
    );
  }

  // 3. Header Scroll Effect
  ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    toggleClass: {className: 'scrolled', targets: '.header'}
  });

  // 4. Scroll Animations (Fade Up)
  const fadeUpElements = gsap.utils.toArray('.fade-up');
  fadeUpElements.forEach((el) => {
    gsap.fromTo(el, 
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
        }
      }
    );
  });

  // 5. Parallax Texts
  const parallaxTexts = document.querySelectorAll('.hero-bg-text');
  parallaxTexts.forEach(text => {
    gsap.to(text, {
      yPercent: -30,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  });

  // 6. Ambient Glow Mouse Follow (Subtle Interactive Spotlight)
  const glow1 = document.querySelector('.glow-1');
  const glow2 = document.querySelector('.glow-2');
  
  if(glow1 && glow2) {
    document.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      gsap.to(glow1, {
        x: (x - 0.5) * 100,
        y: (y - 0.5) * 100,
        duration: 2,
        ease: "power2.out"
      });
      
      gsap.to(glow2, {
        x: (x - 0.5) * -100,
        y: (y - 0.5) * -100,
        duration: 2.5,
        ease: "power2.out"
      });
    });
  }

  // 7. Contact Form - Async Submission (Vercel Functions)
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const formMessage = document.getElementById('form-message');

  if (contactForm && formMessage) {
    console.log("Contact form initialized:", contactForm);
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log("Form submit event triggered!");

      // UIを送信中に変更
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.textContent = '送信中...';
      formMessage.className = 'mt-4 text-center text-sm font-bold block';
      formMessage.textContent = '送信しています...';
      
      const formData = {
        company: document.getElementById('company-name').value,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value,
      };

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
          // Success
          formMessage.textContent = 'お問い合わせを送信しました。担当者よりご連絡いたします。';
          formMessage.classList.add('text-cyan');
          formMessage.classList.remove('text-red-500');
          contactForm.reset(); // フォームをクリア
        } else {
          // Error from API
          formMessage.textContent = result.message || '送信に失敗しました。';
          formMessage.classList.add('text-red-500');
          formMessage.classList.remove('text-cyan');
        }
      } catch (error) {
        // Network Error etc
        console.error('Submission error:', error);
        formMessage.textContent = '通信エラーが発生しました。時間を置いて再度お試しください。';
        formMessage.classList.add('text-red-500');
        formMessage.classList.remove('text-cyan');
      } finally {
        // UIを元に戻す
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = '送信する';
      }
    });
  }

});
