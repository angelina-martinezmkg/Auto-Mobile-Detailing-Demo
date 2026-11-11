/* ==========================================================================
   Mobile Auto Detailing — interactions
   - Navigation, mobile menu, smooth scrolling
   - Scroll reveals (GSAP ScrollTrigger, with IntersectionObserver fallback)
   - Parallax, mouse-following light, card spotlights
   - Before/after comparison slider
   - Service "Learn More" dialog
   - Netlify Forms booking request (AJAX submit + validation)
   ========================================================================== */
(function () {
  'use strict';

  window.__siteReady = true;

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------------
     EDIT SERVICES: popup details for each "Learn More" button.
     Keys match data-open-service="..." in index.html.
     ------------------------------------------------------------------ */
  var SERVICE_DETAILS = {
    exterior: {
      num: '01', title: 'Exterior Detailing', img: 'assets/img/service-exterior.jpg',
      formValue: 'Exterior Detailing',
      desc: 'A careful, hands-on exterior refresh that removes everyday grime and leaves your paint, glass, and wheels looking crisp.',
      list: ['Pre-rinse and foam pre-wash', 'Two-bucket hand wash', 'Wheel faces, barrels & tire cleaning', 'Tire dressing', 'Exterior glass cleaning', 'Hand dry and finishing touches'],
      ideal: 'Regular upkeep and a quick, noticeable refresh'
    },
    interior: {
      num: '02', title: 'Interior Detailing', img: 'assets/img/service-interior.jpg',
      formValue: 'Interior Detailing',
      desc: 'A thorough interior clean focused on the surfaces you see and touch every day.',
      list: ['Full vacuum: seats, carpets, mats & trunk', 'Dashboard, console & door panel detailing', 'Cup holders, vents & crevices', 'Interior glass & mirrors', 'Surface wipe-down & refresh'],
      ideal: 'Daily drivers, family vehicles, rideshare cars'
    },
    full: {
      num: '03', title: 'Full Interior & Exterior Detail', img: 'assets/img/service-full.jpg',
      formValue: 'Full Interior & Exterior Detail',
      desc: 'Our most complete cleaning package — combining full exterior and interior detailing in one visit.',
      list: ['Everything in Exterior Detailing', 'Everything in Interior Detailing', 'Door jambs & entry areas', 'Final walkthrough inspection'],
      ideal: 'Seasonal deep cleans, selling or trading in, special occasions'
    },
    paint: {
      num: '04', title: 'Paint Correction', img: 'assets/img/service-paint.jpg',
      formValue: 'Paint Correction',
      desc: 'Machine polishing designed to reduce the appearance of light scratches, swirl marks, and other surface imperfections. Results depend on the condition and depth of the defects.',
      list: ['Wash & decontamination prep', 'Paint inspection under lighting', 'Machine compounding / polishing', 'Panel wipe & final inspection'],
      ideal: 'Dull, hazy, or swirled paint; prep before ceramic coating'
    },
    ceramic: {
      num: '05', title: 'Ceramic Coating', img: 'assets/img/service-ceramic.jpg',
      formValue: 'Ceramic Coating',
      desc: 'A protective coating applied to properly prepared paint to enhance gloss and help make future cleaning easier. Durability varies by product and care.',
      list: ['Wash & decontamination', 'Surface prep (polish recommended)', 'Coating application & leveling', 'Cure guidance and aftercare tips'],
      ideal: 'New vehicles or freshly corrected paint'
    },
    engine: {
      num: '06', title: 'Engine Bay Cleaning', img: 'assets/img/service-engine.jpg',
      formValue: 'Engine Bay Cleaning',
      desc: 'Careful cleaning and dressing of accessible engine bay surfaces, with sensitive components protected first.',
      list: ['Cover sensitive components', 'Degrease accessible surfaces', 'Gentle agitation & controlled rinse', 'Dry and dress plastics & hoses'],
      ideal: 'Pre-sale presentation, enthusiasts, routine upkeep'
    }
  };

  /* ---------------- Year ---------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Navigation ---------------- */
  var nav = $('#nav');
  function onScrollNav() { nav.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  // Active link highlighting
  var navLinks = $$('.nav__link');
  if ('IntersectionObserver' in window) {
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', 'about', 'services', 'why', 'results', 'book', 'contact'].forEach(function (id) {
      var el = document.getElementById(id); if (el) sectionIO.observe(el);
    });
  }

  /* ---------------- Mobile menu ---------------- */
  var toggle = $('.nav__toggle');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    doc.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    if (open) { menu.removeAttribute('inert'); } else { menu.setAttribute('inert', ''); }
  }
  toggle.addEventListener('click', function () { setMenu(!doc.classList.contains('menu-open')); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && doc.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 960 && doc.classList.contains('menu-open')) setMenu(false); });

  /* ---------------- Smooth anchor scrolling ---------------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var hash = link.getAttribute('href');
    if (hash.length < 2) return;
    var target = document.getElementById(hash.slice(1));
    if (!target) return;
    e.preventDefault();
    var wasOpen = doc.classList.contains('menu-open');
    if (wasOpen) setMenu(false);
    var go = function () {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (history.pushState) history.pushState(null, '', hash);
    };
    // let the menu release the scroll lock first
    wasOpen ? setTimeout(go, 60) : go();
  });

  /* ---------------- Split headings into words ---------------- */
  var wordIndex = 0;
  function splitNode(node, parent) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var parts = child.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var outer = document.createElement('span'); outer.className = 'sw';
          var inner = document.createElement('span'); inner.className = 'sw__i';
          inner.style.setProperty('--i', wordIndex++);
          inner.textContent = part;
          outer.appendChild(inner); frag.appendChild(outer);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1) {
        // keep gradient text working by moving the class onto each word
        if (child.classList.contains('accent')) {
          splitNode(child);
          $$('.sw__i', child).forEach(function (w) { w.classList.add('accent'); });
          child.classList.remove('accent');
        } else {
          splitNode(child);
        }
      }
    });
  }
  $$('[data-reveal="split"]').forEach(function (el) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    wordIndex = 0;
    splitNode(el);
    $$('.sw', el).forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
  });

  /* ---------------- Scroll reveals ---------------- */
  var revealEls = $$('[data-reveal]');
  function reveal(el, delay) {
    if (delay) {
      el.style.transitionDelay = delay + 's';
      setTimeout(function () { el.style.transitionDelay = ''; }, delay * 1000 + 1800);
    }
    el.classList.add('is-in');
  }

  if (reduceMotion) {
    revealEls.forEach(function (el) { reveal(el); });
  } else if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.batch(revealEls, {
      start: 'top 88%',
      once: true,
      onEnter: function (batch) { batch.forEach(function (el, i) { reveal(el, i * 0.1); }); }
    });
  } else if ('IntersectionObserver' in window) {
    var queue = [], flushing = false;
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { queue.push(entry.target); revealIO.unobserve(entry.target); }
      });
      if (!flushing) {
        flushing = true;
        requestAnimationFrame(function () {
          queue.forEach(function (el, i) { reveal(el, i * 0.1); });
          queue = []; flushing = false;
        });
      }
    }, { rootMargin: '0px 0px -12% 0px' });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { reveal(el); });
  }

  /* ---------------- GSAP scroll effects (parallax etc.) ---------------- */
  if (hasGSAP && !reduceMotion) {
    // Hero content lifts away as you scroll
    gsap.to('.hero__title, .hero__bottom', {
      y: -80, opacity: 0.15, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });

    // Floating light orbs
    $$('[data-parallax]').forEach(function (el) {
      var s = parseFloat(el.getAttribute('data-parallax')) || 0.2;
      gsap.fromTo(el, { yPercent: -40 * s }, {
        yPercent: 40 * s, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // Final CTA: photo rises in and the scene opens up
    gsap.fromTo('.cta__car', { y: 60, opacity: 0.2 }, {
      y: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.cta', start: 'top 85%', end: 'center 60%', scrub: 0.8 }
    });
    gsap.fromTo('.cta__glow', { scale: 0.6, opacity: 0.3 }, {
      scale: 1, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'center center', scrub: true }
    });

    // Recalculate after fonts/images settle to avoid layout drift
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ---------------- Mouse-following lights (desktop only) ---------------- */
  if (finePointer && !reduceMotion) {
    var light = $('.cursor-light');
    var tx = window.innerWidth / 2, ty = window.innerHeight / 2, cx = tx, cy = ty, running = false;
    function loop() {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      light.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) { requestAnimationFrame(loop); } else { running = false; }
    }
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      doc.classList.add('has-cursor');
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { doc.classList.remove('has-cursor'); });

    // Hero glow follows the pointer gently
    var hero = $('.hero');
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty('--hx', (px * 120).toFixed(1) + 'px');
      hero.style.setProperty('--hy', (py * 80).toFixed(1) + 'px');
    }, { passive: true });

    // Card spotlights
    $$('.service-card, .why-card, .form-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  /* ---------------- Before / After slider ---------------- */
  var ba = $('.ba');
  if (ba) {
    var handle = $('.ba__handle', ba);
    var pos = 50, dragging = false, touched = false;
    var setPos = function (p) {
      pos = Math.max(0, Math.min(100, p));
      ba.style.setProperty('--pos', pos + '%');
      handle.setAttribute('aria-valuenow', String(Math.round(pos)));
      handle.setAttribute('aria-valuetext', 'Showing ' + Math.round(pos) + '% before');
    };
    var fromEvent = function (e) {
      var r = ba.getBoundingClientRect();
      setPos(((e.clientX - r.left) / r.width) * 100);
    };
    ba.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; touched = true;
      try { ba.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      ba.classList.add('is-dragging');
      fromEvent(e);
    });
    ba.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    var stop = function () { dragging = false; ba.classList.remove('is-dragging'); };
    ba.addEventListener('pointerup', stop);
    ba.addEventListener('pointercancel', stop);
    ba.addEventListener('lostpointercapture', stop);

    handle.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 4;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setPos(pos - step); e.preventDefault(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setPos(pos + step); e.preventDefault(); }
      else if (e.key === 'Home') { setPos(0); e.preventDefault(); }
      else if (e.key === 'End') { setPos(100); e.preventDefault(); }
      touched = true;
    });

    // Teaser sweep the first time it comes into view
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var teaseIO = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        teaseIO.disconnect();
        var keys = [50, 24, 76, 50], seg = 0, t0 = null, dur = 900;
        var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
        var step = function (ts) {
          if (touched) return;
          if (t0 === null) t0 = ts;
          var t = Math.min(1, (ts - t0) / dur);
          setPos(keys[seg] + (keys[seg + 1] - keys[seg]) * ease(t));
          if (t === 1) { seg++; t0 = null; if (seg >= keys.length - 1) return; }
          requestAnimationFrame(step);
        };
        setTimeout(function () { requestAnimationFrame(step); }, 900);
      }, { threshold: 0.5 });
      teaseIO.observe(ba);
    }
  }

  /* ---------------- Service dialog ---------------- */
  var dialog = $('#service-dialog');
  var currentService = null;
  var lastFocus = null;
  var supportsDialog = dialog && typeof dialog.showModal === 'function';

  function openService(key) {
    var s = SERVICE_DETAILS[key];
    if (!s) return;
    currentService = s;
    if (!supportsDialog) { selectServiceAndScroll(s.formValue); return; }
    lastFocus = document.activeElement;
    $('#sd-num').textContent = 'Service ' + s.num;
    $('#sd-title').textContent = s.title;
    $('#sd-desc').textContent = s.desc;
    $('#sd-ideal').textContent = s.ideal;
    var img = $('#sd-img'); img.src = s.img; img.alt = '';
    var list = $('#sd-list'); list.innerHTML = '';
    s.list.forEach(function (item) {
      var li = document.createElement('li');
      li.innerHTML = '<svg width="16" height="16" aria-hidden="true"><use href="#i-check"/></svg>';
      li.appendChild(document.createTextNode(item));
      list.appendChild(li);
    });
    dialog.showModal();
    doc.classList.add('dialog-open');
    $('.service-dialog__inner', dialog).scrollTop = 0;
  }
  function closeService() { if (dialog.open) dialog.close(); }

  $$('[data-open-service]').forEach(function (btn) {
    btn.addEventListener('click', function () { openService(btn.getAttribute('data-open-service')); });
  });
  if (supportsDialog) {
    dialog.addEventListener('close', function () {
      doc.classList.remove('dialog-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) closeService(); });
    $('[data-close-dialog]', dialog).addEventListener('click', closeService);
    $('#sd-cta').addEventListener('click', function () {
      var value = currentService && currentService.formValue;
      lastFocus = null;
      closeService();
      selectServiceAndScroll(value);
    });
  }

  function selectServiceAndScroll(value) {
    var select = $('#f-service');
    if (select && value) {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    var book = $('#book');
    book.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () { var n = $('#f-name'); if (n) n.focus({ preventScroll: true }); }, reduceMotion ? 0 : 900);
  }

  /* ---------------- Booking form (Netlify Forms) ---------------- */
  var form = $('#booking-form');
  if (form) {
    form.setAttribute('novalidate', '');
    var alertBox = $('#form-alert');
    var successBox = $('#form-success');
    var submitBtn = $('.form__submit', form);
    var submitLabel = $('.form__submit-label', form);

    // Earliest date = today (local time)
    var dateInput = $('#f-date');
    var now = new Date();
    var today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateInput.min = today;

    var messages = {
      name: 'Please enter your full name.',
      phone: 'Please enter a valid phone number (at least 10 digits).',
      email: 'Please enter a valid email address.',
      vehicle: 'Please enter your vehicle make and model.',
      vehicle_type: 'Please select your vehicle type.',
      service: 'Please choose a service.',
      preferred_date: 'Please choose a preferred date (today or later).',
      preferred_time: 'Please choose a preferred time window.',
      address: 'Please enter your service address or ZIP code.'
    };

    var validateField = function (el) {
      if (!el.name || !messages[el.name]) return true;
      var v = (el.value || '').trim();
      var ok = v.length > 0;
      if (ok && el.name === 'name') ok = v.length >= 2;
      if (ok && el.name === 'phone') ok = v.replace(/\D/g, '').length >= 10;
      if (ok && el.name === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      if (ok && el.name === 'preferred_date') ok = v >= today;
      if (ok && el.name === 'address') ok = v.length >= 3;
      var field = el.closest('.field');
      var err = field && $('.field__error', field);
      field.classList.toggle('is-invalid', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      if (err) err.textContent = ok ? '' : messages[el.name];
      return ok;
    };

    var controls = $$('input, select, textarea', form).filter(function (el) { return el.type !== 'hidden' && el.name !== 'bot-field'; });
    controls.forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) validateField(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-invalid')) validateField(el); });
      el.addEventListener('change', function () { if (el.closest('.field').classList.contains('is-invalid')) validateField(el); });
    });

    var showAlert = function (html) { alertBox.innerHTML = html; alertBox.hidden = false; };
    var hideAlert = function () { alertBox.hidden = true; alertBox.textContent = ''; };
    var setLoading = function (on) {
      submitBtn.classList.toggle('is-loading', on);
      submitBtn.disabled = on;
      submitLabel.textContent = on ? 'Sending…' : 'Request My Appointment';
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideAlert();

      var firstInvalid = null;
      controls.forEach(function (el) { if (!validateField(el) && !firstInvalid) firstInvalid = el; });
      if (firstInvalid) {
        showAlert('Please check the highlighted fields and try again.');
        firstInvalid.focus();
        return;
      }

      setLoading(true);
      var body = new URLSearchParams(new FormData(form)).toString();

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      }).then(function (res) {
        if (!res.ok) throw new Error('Request failed with status ' + res.status);
        var data = new FormData(form);
        var service = data.get('service');
        var date = data.get('preferred_date');
        var phone = data.get('phone');
        var pretty = date;
        try { pretty = new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }); } catch (err) { /* keep raw */ }
        $('.form-success__msg', successBox).textContent =
          'Thanks! Your request for ' + service + ' on ' + pretty + ' has been sent. ' +
          'This is not yet a confirmed booking — we\'ll contact you at ' + phone + ' to confirm availability.';
        form.hidden = true;
        successBox.hidden = false;
        $('h3', successBox).focus();
        form.reset();
      }).catch(function () {
        showAlert('Sorry — we couldn\'t send your request right now. Please try again in a moment, or call us at <a href="tel:+10000000000">000-000-0000</a>.');
        alertBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }).then(function () { setLoading(false); });
    });

    $('#form-reset').addEventListener('click', function () {
      successBox.hidden = true;
      form.hidden = false;
      controls.forEach(function (el) {
        var f = el.closest('.field'); if (f) f.classList.remove('is-invalid');
        el.removeAttribute('aria-invalid');
      });
      $('#f-name').focus();
    });
  }
})();
