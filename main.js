/* ============================================
   LET'S BE READY — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Sticky Nav ---
  const nav = document.getElementById('nav');
  if (nav) {
    const isHeroPage = nav.classList.contains('nav--hero');
    const onScroll = () => {
      const scrolled = window.scrollY > 50;
      nav.classList.toggle('nav--scrolled', scrolled);
      // On hero pages, keep nav--hero for the transparent state at top
      if (isHeroPage) {
        nav.classList.toggle('nav--hero', !scrolled);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Mobile Menu ---
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';

      // Animate hamburger
      const spans = hamburger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      });
    });
  }

  // --- Scroll Reveal (IntersectionObserver) ---
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale, .stagger-children');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // --- Counter Animation ---
  const counters = document.querySelectorAll('[data-count]');

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2000;
    const startTime = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = Math.round(easedProgress * target);

      el.textContent = prefix + current.toLocaleString() + (current >= target ? '+' : '') + suffix;

      // Remove the trailing '+' for percentage values
      if (suffix === '%') {
        el.textContent = prefix + current + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Final value
        if (suffix === '%') {
          el.textContent = prefix + target + suffix;
        } else {
          el.textContent = prefix + target.toLocaleString() + '+' + suffix;
        }
      }
    }

    requestAnimationFrame(update);
  }

  // --- Smooth Scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navHeight = document.querySelector('.nav')?.offsetHeight || 72;
        const top = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Newsletter Form ---
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      const button = newsletterForm.querySelector('button');
      const originalText = button.textContent;

      button.textContent = 'Subscribed!';
      button.style.background = 'var(--success)';
      input.value = '';

      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 3000);
    });
  }

  // --- Tracker Progress Bar Animation (Donate page) ---
  const progressFill = document.getElementById('progressFill');
  if (progressFill) {
    const progressObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 47,250 / 75,000 = 63%
          setTimeout(() => {
            progressFill.style.width = '63%';
          }, 300);
          progressObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    progressObserver.observe(progressFill.closest('.d-tracker__card') || progressFill.closest('.tracker__card'));
  }

});

// --- Spin animation for submit button ---
const style = document.createElement('style');
style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
document.head.appendChild(style);
