/* ============================================================
   PRISKMAX — main.js
   Navbar burbuja · Scroll spy · Reveal · Utilidades
   ============================================================ */

(function () {
  'use strict';

  /* ── Elementos ─────────────────────────────────────────── */
  const topNav    = document.getElementById('top-nav');
  const bubbleNav = document.getElementById('bubble-nav');
  const bubbleInner = bubbleNav?.querySelector('.bubble-inner');
  const hamburger = bubbleNav?.querySelector('.bubble-hamburger');

  /* ── Navbar doble (top ↔ burbuja) ──────────────────────── */
  const SCROLL_THRESHOLD = 80;

  function updateNav() {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;

    if (topNav) {
      topNav.classList.toggle('hide', scrolled);
    }
    if (bubbleNav) {
      bubbleNav.classList.toggle('visible', scrolled);
    }
  }

  /* ── Scroll spy (sección activa) ───────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const bubbleLinks = document.querySelectorAll('.bubble-link[data-section]');

  function updateActiveSection() {
    if (!bubbleLinks.length) return;

    let current = '';
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= 120) current = sec.id;
    });

    bubbleLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  /* ── Scroll listener con throttle ──────────────────────── */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNav();
        updateActiveSection();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateNav();

  /* ── Menú hamburger móvil ──────────────────────────────── */
  if (hamburger && bubbleInner) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = hamburger.classList.toggle('open');
      bubbleInner.classList.toggle('menu-open', open);
      hamburger.setAttribute('aria-expanded', open);
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!bubbleInner.contains(e.target)) {
        hamburger.classList.remove('open');
        bubbleInner.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', false);
      }
    });

    // Cerrar al navegar
    document.querySelectorAll('.bubble-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        bubbleInner.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', false);
      });
    });
  }

  /* ── Scroll reveal ─────────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Contador animado ──────────────────────────────────── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const dur    = 1800;
    const start  = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

  /* ── Feedback visual en formularios ───────────────────── */
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function (e) {
      const btn = form.querySelector('[type="submit"]');
      if (!btn) return;
      btn.disabled = true;
      btn.dataset.original = btn.textContent;
      btn.textContent = 'Enviando…';
    });
  });

  /* ── Smooth scroll para anclas internas ───────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Toast de notificación ─────────────────────────────── */
  window.showToast = function(msg, type = 'success') {
    const existing = document.querySelector('.prisk-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'prisk-toast';
    toast.style.cssText = `
      position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(80px);
      background:${type === 'success' ? 'var(--green)' : '#e74c3c'};
      color:${type === 'success' ? 'var(--navy-dark)' : '#fff'};
      padding:0.85rem 1.75rem; border-radius:var(--radius-pill);
      font-weight:600; font-size:0.9rem; font-family:var(--font-body);
      box-shadow:0 8px 32px rgba(0,0,0,0.4); z-index:9999;
      transition:transform 0.4s cubic-bezier(.34,1.56,.64,1), opacity 0.3s ease;
      opacity:0;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(80px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  };

})();
