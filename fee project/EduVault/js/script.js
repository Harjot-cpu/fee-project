/* ============================================
   EduVault — script.js
   Vanilla JS: Tabs, Accordion, Filter,
   Scroll FX, Mobile Nav, Progress Bar
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. NAVBAR: scroll shadow + active link ─
  const navbar   = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
      updateProgress();
    }, { passive: true });
  }

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Active nav link based on current page
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const linkPath = link.getAttribute('href') || '';
    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
    }
    // Hash links active on scroll
    if (linkPath.startsWith('#')) {
      link.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    }
  });


  // ── 2. READING PROGRESS BAR ────────────────
  const progressBar = document.querySelector('.progress-bar');

  function updateProgress() {
    if (!progressBar) return;
    const scrollTop    = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress     = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }


  // ── 3. FADE-IN ON SCROLL (IntersectionObserver) ──
  const fadeEls = document.querySelectorAll('.fade-in');

  if (fadeEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (i % 4) * 0.08 + 's';
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(el => observer.observe(el));
  }


  // ── 4. TAB SYSTEM (semester page) ─────────
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  if (tabBtns.length > 0) {
    // Restore tab from URL hash
    const urlHash = window.location.hash.replace('#', '');
    const initialTab = urlHash && document.querySelector(`[data-tab="${urlHash}"]`)
      ? urlHash
      : tabBtns[0]?.dataset.tab;

    function activateTab(tabId) {
      tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
      tabPanels.forEach(panel => panel.classList.toggle('active', panel.id === tabId));
      history.replaceState(null, '', `#${tabId}`);
    }

    activateTab(initialTab);

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => activateTab(btn.dataset.tab));
    });
  }


  // ── 5. ACCORDION — QUESTIONS ───────────────
  const questionItems = document.querySelectorAll('.question-item');

  questionItems.forEach(item => {
    const header = item.querySelector('.question-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all others (single-open mode)
      questionItems.forEach(q => q.classList.remove('open'));
      // Toggle this one
      if (!isOpen) item.classList.add('open');
    });

    // Keyboard accessibility
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'false');
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); header.click(); }
    });
  });

  // Update aria-expanded on toggle
  const mutationObs = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        const item = m.target;
        const header = item.querySelector('.question-header');
        if (header) header.setAttribute('aria-expanded', item.classList.contains('open'));
      }
    });
  });
  questionItems.forEach(item => mutationObs.observe(item, { attributes: true }));


  // ── 6. SEARCH + FILTER (topics / semesters) ──
  const searchInput = document.querySelector('.search-input');
  const filterChips = document.querySelectorAll('.filter-chip');
  let activeFilter  = 'all';

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter || 'all';
      applyFilters();
    });
  });

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // For semester cards on index
    const semCards = document.querySelectorAll('.semester-card');
    semCards.forEach(card => {
      const text     = card.textContent.toLowerCase();
      const category = card.dataset.category || '';
      const matchQ   = !query || text.includes(query);
      const matchF   = activeFilter === 'all' || category === activeFilter;
      card.style.display = matchQ && matchF ? '' : 'none';
    });

    // For topic cards on semester page
    const topicCards = document.querySelectorAll('.topic-card');
    topicCards.forEach(card => {
      const text   = card.textContent.toLowerCase();
      const tag    = card.dataset.tag || '';
      const matchQ = !query || text.includes(query);
      const matchF = activeFilter === 'all' || tag === activeFilter;
      card.style.display = matchQ && matchF ? '' : 'none';
    });
  }


  // ── 7. SMOOTH SCROLL for anchor links ──────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight + 20 : 80;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });


  // ── 8. ANIMATED COUNTERS (stats bar) ────────
  const statNums = document.querySelectorAll('.stat-num[data-count]');

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur    = 1800;
      const step   = 16;
      const inc    = target / (dur / step);
      let current  = 0;

      const timer = setInterval(() => {
        current += inc;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current).toLocaleString() + suffix;
      }, step);

      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => counterObs.observe(el));


  // ── 9. THEORY INDEX highlight on scroll ─────
  const indexLinks    = document.querySelectorAll('.index-link');
  const theoryArticles = document.querySelectorAll('.theory-article[id]');

  if (indexLinks.length > 0 && theoryArticles.length > 0) {
    const articleObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          indexLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    theoryArticles.forEach(a => articleObs.observe(a));
  }


  // ── 10. CONTACT FORM — basic validation ─────
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = contactForm.querySelectorAll('[required]');
      let valid = true;

      fields.forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#f87171';
          valid = false;
        }
      });

      if (valid) {
        const btn = contactForm.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = '✓ Message Sent!';
        btn.style.background = '#16a34a';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = '';
          btn.disabled = false;
          contactForm.reset();
        }, 3000);
      }
    });
  }


  // ── 11. TOOLTIP for semester cards ──────────
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const tip = document.createElement('div');
      tip.className = 'tooltip';
      tip.textContent = el.dataset.tooltip;
      tip.style.cssText = `
        position:absolute; z-index:9999;
        background:#112240; color:#F8F9FC;
        border:1px solid rgba(59,130,246,0.3);
        padding:6px 12px; border-radius:8px;
        font-size:0.78rem; font-weight:500;
        white-space:nowrap; pointer-events:none;
        box-shadow:0 4px 20px rgba(0,0,0,0.4);
      `;
      document.body.appendChild(tip);
      const rect = el.getBoundingClientRect();
      tip.style.top  = (rect.top + window.scrollY - tip.offsetHeight - 10) + 'px';
      tip.style.left = (rect.left + rect.width / 2 - tip.offsetWidth / 2) + 'px';
      el._tooltip = tip;
    });
    el.addEventListener('mouseleave', () => {
      if (el._tooltip) { el._tooltip.remove(); el._tooltip = null; }
    });
  });


  // ── 12. KEYBOARD TRAP for mobile menu ───────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) {
      hamburger?.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

});
