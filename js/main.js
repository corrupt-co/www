(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function store(key, value) {
    try {
      if (value === undefined) {
        return localStorage.getItem(key);
      }
      localStorage.setItem(key, value);
    } catch (e) {
      return null;
    }
  }

  var target = 0.035;
  var current = 0.035;
  var lastMove = 0;

  addEventListener('pointermove', function (e) {
    var dx = (e.clientX / innerWidth - 0.5) * 2;

    target = 0.035 + Math.abs(dx) * 0.05;
    lastMove = performance.now();
  });

  function frame(t) {
    if (!reduce && t - lastMove > 2500) {
      target = 0.045 + Math.sin(t / 1600) * 0.02;
    }

    current += (target - current) * 0.08;
    root.style.setProperty('--aberration', current.toFixed(4));
    requestAnimationFrame(frame);
  }

  if (!reduce) {
    requestAnimationFrame(frame);
  }

  var revealEls = $$('.reveal');

  if ('IntersectionObserver' in window && !reduce) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(function (el) {
      revealer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  $$('.spotlight, .blueprint-figure').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var rect = el.getBoundingClientRect();

      el.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
      el.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
    });
  });

  var announce = $('.announcement');

  if (announce) {
    if (store('corrupt-company-announcement') === 'closed') {
      announce.hidden = true;
    }

    $('button', announce).addEventListener('click', function () {
      announce.hidden = true;
      store('corrupt-company-announcement', 'closed');
    });
  }

  var header = $('header.site');
  var menuBtn = $('.menu-button');

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');

      menuBtn.setAttribute('aria-expanded', open);
    });

    $$('nav.main a').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('menu-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var toTop = $('.back-to-top');
  var ticking = false;

  function onScroll() {
    if (toTop) {
      toTop.classList.toggle('visible', scrollY > 700);
    }

    ticking = false;
  }

  addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  var cookie = $('.cookie');

  if (cookie) {
    if (store('corrupt-company-cookie')) {
      cookie.hidden = true;
    }

    $$('button', cookie).forEach(function (btn) {
      btn.addEventListener('click', function () {
        store('corrupt-company-cookie', btn.dataset.choice);
        cookie.hidden = true;
      });
    });
  }

  $$('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
