/* =====================================================
   Place2B - main.js
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------------------------------------------------
  // Hero Toggle
  // ---------------------------------------------------
  const toggleBtns = document.querySelectorAll('.hero__toggle-btn');
  const heroVariants = document.querySelectorAll('.hero__variant');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      toggleBtns.forEach(b => b.classList.remove('active'));
      heroVariants.forEach(v => v.classList.remove('active'));
      btn.classList.add('active');
      const targetEl = document.getElementById(target);
      if (targetEl) targetEl.classList.add('active');
    });
  });

  // ---------------------------------------------------
  // Mobile Hamburger Menu
  // ---------------------------------------------------
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });

    // Close nav on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }

  // ---------------------------------------------------
  // Stories Slider
  // ---------------------------------------------------
  const track = document.getElementById('storiesTrack');
  const dotsContainer = document.getElementById('storiesDots');
  const prevBtn = document.getElementById('storiesPrev');
  const nextBtn = document.getElementById('storiesNext');

  if (track && dotsContainer) {
    const cards = track.querySelectorAll('.story-card');
    const isMobile = () => window.innerWidth <= 768;
    const visibleCount = () => isMobile() ? 1 : 3;
    let current = 0;
    const total = cards.length;

    function maxIndex() {
      return Math.max(0, total - visibleCount());
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      const dotCount = maxIndex() + 1;
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'stories__dot' + (i === current ? ' active' : '');
        dot.setAttribute('aria-label', `スライド ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex()));
      const cardWidth = cards[0].offsetWidth + 24;
      track.style.transform = `translateX(-${current * cardWidth}px)`;
      dotsContainer.querySelectorAll('.stories__dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    buildDots();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        current = 0;
        buildDots();
        goTo(0);
      }, 200);
    });

    // Auto-play
    let autoPlay = setInterval(() => {
      if (current >= maxIndex()) {
        goTo(0);
      } else {
        goTo(current + 1);
      }
    }, 4000);

    track.closest('.stories__slider').addEventListener('mouseenter', () => clearInterval(autoPlay));
    track.closest('.stories__slider').addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => {
        if (current >= maxIndex()) {
          goTo(0);
        } else {
          goTo(current + 1);
        }
      }, 4000);
    });

    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
      }
    });
  }

  // ---------------------------------------------------
  // FAQ Accordion
  // ---------------------------------------------------
  const faqQuestions = document.querySelectorAll('.faq__question');

  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const answer = btn.nextElementSibling;

      // Close all others
      faqQuestions.forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const otherAnswer = other.nextElementSibling;
          if (otherAnswer) otherAnswer.classList.remove('open');
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (answer) answer.classList.toggle('open', !isOpen);
    });
  });

  // ---------------------------------------------------
  // Contact Form Validation
  // ---------------------------------------------------
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    const fields = {
      name: { el: document.getElementById('name'), error: document.getElementById('nameError'), msg: 'お名前を入力してください' },
      email: { el: document.getElementById('email'), error: document.getElementById('emailError'), msg: '正しいメールアドレスを入力してください' },
      phone: { el: document.getElementById('phone'), error: document.getElementById('phoneError'), msg: '電話番号を入力してください' },
    };

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateField(key) {
      const { el, error, msg } = fields[key];
      let valid = true;
      if (!el.value.trim()) {
        error.textContent = msg;
        el.classList.add('error');
        valid = false;
      } else if (key === 'email' && !validateEmail(el.value.trim())) {
        error.textContent = msg;
        el.classList.add('error');
        valid = false;
      } else {
        error.textContent = '';
        el.classList.remove('error');
      }
      return valid;
    }

    Object.keys(fields).forEach(key => {
      fields[key].el.addEventListener('blur', () => validateField(key));
      fields[key].el.addEventListener('input', () => {
        if (fields[key].el.classList.contains('error')) validateField(key);
      });
    });

    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const valid = Object.keys(fields).map(validateField).every(Boolean);
      if (valid) {
        // Show success state
        const btn = contactForm.querySelector('.btn--submit');
        btn.textContent = '送信完了しました！';
        btn.style.background = '#4caf50';
        btn.disabled = true;

        // Create success message
        const success = document.createElement('div');
        success.className = 'form-success show';
        success.innerHTML = '<h3>お問い合わせを受け付けました</h3><p>担当者より折り返しご連絡いたします。<br>しばらくお待ちください。</p>';
        contactForm.insertAdjacentElement('afterend', success);
        contactForm.style.display = 'none';
      }
    });
  }

  // ---------------------------------------------------
  // Sticky Header Shadow on Scroll
  // ---------------------------------------------------
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      } else {
        header.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)';
      }
    });
  }

  // ---------------------------------------------------
  // Smooth Scroll for Anchor Links
  // ---------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerH = document.getElementById('header')?.offsetHeight || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---------------------------------------------------
  // Scroll Animation (Intersection Observer)
  // ---------------------------------------------------
  const animElements = document.querySelectorAll(
    '.feature-card, .story-card, .team-member, .process__step, .faq__item, .about__stat'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    animElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  }

});
