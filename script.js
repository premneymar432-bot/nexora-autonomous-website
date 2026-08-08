/* =========================================================
   NEXORA — MAIN SCRIPT
   Loader → Smooth Scroll → GSAP Reveals → Micro-interactions
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);

  /* =========================================================
     1. LOADER
  ========================================================= */
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPct = document.getElementById('loaderPct');

  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      loaderFill.style.width = '100%';
      loaderPct.textContent = '100%';
      setTimeout(finishLoad, 350);
    } else {
      loaderFill.style.width = progress + '%';
      loaderPct.textContent = Math.floor(progress).toString().padStart(2, '0') + '%';
    }
  }, 160);

  function finishLoad() {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    initLenis();
    playHeroIntro();
    initRevealAnimations();
  }

  /* =========================================================
     2. LENIS SMOOTH SCROLL + SCROLLTRIGGER BRIDGE
  ========================================================= */
  let lenis;
  function initLenis() {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // Hero scroll progress -> Three.js camera
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        if (window.__setHeroScroll) window.__setHeroScroll(self.progress);
      }
    });
  }

  /* =========================================================
     3. HERO INTRO TIMELINE
  ========================================================= */
  function playHeroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero .eyebrow', { opacity: 1, y: 0, duration: 1 }, 0.1)
      .to('.hero-title .line', { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, 0.2)
      .to('.hero-sub', { opacity: 1, y: 0, duration: 1 }, 0.7)
      .to('.hero-cta', { opacity: 1, y: 0, duration: 1 }, 0.85)
      .to('.hero-stats-strip', { opacity: 1, duration: 1 }, 1)
      .to('.scroll-indicator', { opacity: 1, duration: 1 }, 1.1);
  }

  /* =========================================================
     4. SCROLL REVEAL (fade-up, stagger, scale) FOR REST OF PAGE
  ========================================================= */
  function initRevealAnimations() {

    // generic fade-up reveals
    document.querySelectorAll('.reveal-up').forEach((el) => {
      if (el.closest('.hero')) return; // hero handled by its own timeline
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // service / glass cards scale-in stagger
    gsap.utils.toArray('.services-grid .service-card').forEach((card, i) => {
      gsap.fromTo(card, { opacity: 0, y: 50, scale: .94 }, {
        opacity: 1, y: 0, scale: 1, duration: .9, ease: 'power3.out',
        delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: card, start: 'top 90%' }
      });
    });

    // mini cards
    gsap.utils.toArray('.mini-card').forEach((card, i) => {
      gsap.fromTo(card, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: .8, delay: i * 0.1,
        scrollTrigger: { trigger: card, start: 'top 92%' }
      });
    });

    // masonry image reveal
    gsap.utils.toArray('.masonry-item').forEach((item, i) => {
      gsap.fromTo(item, { opacity: 0, y: 60, scale: .96 }, {
        opacity: 1, y: 0, scale: 1, duration: .9, ease: 'power3.out',
        delay: (i % 3) * 0.06,
        scrollTrigger: { trigger: item, start: 'top 92%' }
      });
    });

    // pricing cards
    gsap.utils.toArray('.price-card').forEach((card, i) => {
      gsap.fromTo(card, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: .9, delay: i * 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 90%' }
      });
    });

    // testimonial section heading only (track scrolls infinitely on its own)
    gsap.fromTo('.carousel-track-wrap', { opacity: 0 }, {
      opacity: 1, duration: 1.2,
      scrollTrigger: { trigger: '.testimonials', start: 'top 80%' }
    });

    // section titles subtle parallax
    gsap.utils.toArray('section').forEach((sec) => {
      const title = sec.querySelector('.section-title');
      if (!title) return;
      gsap.fromTo(title, { backgroundPositionX: '0%' }, {
        backgroundPositionX: '0%', // reserved for future gradient text motion
      });
    });

    initCounters();
    initAboutCardTiltParallax();
  }

  /* =========================================================
     5. COUNTERS + CIRCULAR PROGRESS RINGS
  ========================================================= */
  function initCounters() {
    document.querySelectorAll('.counter').forEach((el) => {
      const target = parseFloat(el.dataset.count);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: () => {
          gsap.fromTo(el, { innerText: 0 }, {
            innerText: target,
            duration: 1.8,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate: function () { el.textContent = Math.floor(el.innerText); }
          });
        }
      });
    });

    document.querySelectorAll('.progress-ring').forEach((ring) => {
      const value = parseFloat(ring.dataset.value);
      const circle = ring.querySelector('.ring-fill');
      const numEl = ring.querySelector('.progress-num');
      const circumference = 2 * Math.PI * 52;
      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = circumference;

      ScrollTrigger.create({
        trigger: ring,
        start: 'top 92%',
        once: true,
        onEnter: () => {
          const offset = circumference - (value / 100) * circumference;
          circle.style.strokeDashoffset = offset;
          gsap.fromTo(numEl, { innerText: 0 }, {
            innerText: value, duration: 1.6, ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate: function () { numEl.textContent = Math.floor(numEl.innerText); }
          });
        }
      });
    });
  }

  /* =========================================================
     6. NAVBAR: shrink on scroll + mobile menu
  ========================================================= */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  /* =========================================================
     7. CUSTOM CURSOR (smooth follow + magnetic + hover states)
  ========================================================= */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let cx = 0, cy = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', (e) => {
    cx = e.clientX; cy = e.clientY;
    cursorDot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
  });

  function cursorLoop() {
    rx += (cx - rx) * 0.16;
    ry += (cy - ry) * 0.16;
    cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(cursorLoop);
  }
  cursorLoop();

  document.querySelectorAll('[data-cursor="link"], a, button, .tilt-card').forEach((el) => {
    el.addEventListener('mouseenter', () => { cursorRing.classList.add('hover'); cursorDot.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursorRing.classList.remove('hover'); cursorDot.classList.remove('hover'); });
  });

  // magnetic buttons
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: relX * 0.35, y: relY * 0.45, duration: .4, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,0.4)' });
    });
  });

  /* =========================================================
     8. BUTTON RIPPLE
  ========================================================= */
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      this.classList.remove('rippling');
      void this.offsetWidth; // reflow to restart animation
      this.classList.add('rippling');
      setTimeout(() => this.classList.remove('rippling'), 550);
    });
  });

  /* =========================================================
     9. TILT CARDS (3D hover tilt)
  ========================================================= */
  document.querySelectorAll('.tilt-card, .service-card, .price-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateX: py * -8,
        rotateY: px * 10,
        transformPerspective: 700,
        duration: .4,
        ease: 'power2.out'
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: .6, ease: 'power3.out' });
    });
  });

  /* =========================================================
     10. PORTFOLIO FILTER (animated)
  ========================================================= */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const masonryItems = document.querySelectorAll('.masonry-item');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      masonryItems.forEach((item) => {
        const match = filter === 'all' || item.dataset.cat === filter;
        if (match) {
          item.classList.remove('hide');
          gsap.fromTo(item, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .5, ease: 'power2.out' });
        } else {
          gsap.to(item, {
            opacity: 0, scale: .9, duration: .3, ease: 'power2.in',
            onComplete: () => item.classList.add('hide')
          });
        }
      });
    });
  });

  /* =========================================================
     11. FAQ ACCORDION
  ========================================================= */
  document.querySelectorAll('.accordion-item').forEach((item) => {
    const head = item.querySelector('.accordion-head');
    const body = item.querySelector('.accordion-body');
    head.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item.open').forEach((openItem) => {
        openItem.classList.remove('open');
        openItem.querySelector('.accordion-body').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* =========================================================
     12. ABOUT MINI-CARD TILT PARALLAX (extra micro-interaction)
  ========================================================= */
  function initAboutCardTiltParallax() {
    // handled generically by .tilt-card selector above; placeholder for future extension
  }

  /* =========================================================
     13. RESERVATION FORM — EMAILJS
     =========================================================
     Replace the three values below with your EmailJS details.
     These are NOT passwords/secrets:
       1) Public Key
       2) Service ID
       3) Template ID

     EmailJS dashboard:
       https://dashboard.emailjs.com/
  ========================================================= */
  const EMAILJS_PUBLIC_KEY = 'i-CGn-zs9oWXAlH6F';
const EMAILJS_SERVICE_ID = 'prem@123';
const EMAILJS_TEMPLATE_ID = 'template_w4gjncp';

const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (form) {

  emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
  });

  form.addEventListener('submit', async (e) => {

    e.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const buttonText = submitButton
      ? submitButton.querySelector('span')
      : null;

    if (submitButton) submitButton.disabled = true;
    if (buttonText) buttonText.textContent = 'Sending…';

    const params = {
      name: document.getElementById('fname').value.trim(),
      email: document.getElementById('femail').value.trim(),
      model: document.getElementById('fmodel').value.trim() || 'Not specified',
      message: document.getElementById('fmsg').value.trim() || 'No additional message'
    };

    try {

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        params
      );

      formNote.textContent =
        'Request received — a Nexora delivery engineer will contact you soon.';

      formNote.style.color = '';

      gsap.fromTo(
        formNote,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: .5 }
      );

      form.reset();

    } catch (error) {

      console.error('EmailJS error:', error);

      formNote.textContent =
        'We could not send your request. Please check your EmailJS settings.';

      formNote.style.color = '#d9b39f';

    } finally {

      if (submitButton) submitButton.disabled = false;
      if (buttonText) buttonText.textContent = 'Submit Request';

    }

  });

}

  /* =========================================================
     14. FADE-IN BODY (prevents flash before loader completes)
  ========================================================= */
  document.body.style.overflow = 'hidden';

});
