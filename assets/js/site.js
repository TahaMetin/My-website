// Behaviour shared by every page; loaded with defer
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Visit counts without cookies, so no consent banner is needed. It skips localhost by itself.
  // Links with data-goatcounter-click are counted as events (CV downloads, email, profiles).
  var gc = document.createElement('script');
  gc.async = true;
  gc.src = 'https://gc.zgo.at/count.v4.js';
  gc.integrity = 'sha384-nRw6qfbWyJha9LhsOtSb2YJDyZdKvvCFh0fJYlkquSFjUxp9FVNugbfy8q1jdxI+';
  gc.crossOrigin = 'anonymous';
  gc.setAttribute('data-goatcounter', 'https://tahametin.goatcounter.com/count');
  document.head.appendChild(gc);

  // Requirement check on the homepage: each chip shows or hides its row; without JS the whole list stays visible
  var chips = document.querySelector('.chips');
  if (chips) {
    var empty = document.querySelector('.check .empty');
    var start = ['Java 21', 'Spring Boot', 'SOAP', 'Oracle'];
    document.querySelectorAll('.results li').forEach(function (li) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = li.dataset.req;
      function set(on) {
        b.setAttribute('aria-pressed', on);
        li.hidden = !on;
        empty.hidden = !!document.querySelector('.results li:not([hidden])');
      }
      set(start.indexOf(li.dataset.req) > -1);
      b.addEventListener('click', function () { set(b.getAttribute('aria-pressed') !== 'true'); });
      chips.appendChild(b);
    });
    chips.hidden = false;
  }

  // Case files stack as you scroll. Each folder sticks one tab row below the folder before it, or whole rows higher
  // if it is too tall for that, so its bottom is on screen before the next folder covers it. A covered folder shows
  // only its whole tab above the next one: never a cut-off slice of its text or half a tab.
  var files = document.querySelector('.files');
  if (files) {
    var folders = files.querySelectorAll('.folder');
    var phone = window.matchMedia('(max-width: 760px)');
    // The small viewport height stays put while a phone's address bar slides in and out, so folders do not jump
    var probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;top:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
    files.classList.add('stack');
    var fit = function () {
      var screen = probe.offsetHeight, tab = folders[0].querySelector('.tab').offsetHeight, top = 0, bottom = 0;
      var shown = []; // tabs still visible in the pile: { top, left, right }
      folders.forEach(function (f) { f.querySelector('.file').style.minHeight = ''; });
      folders.forEach(function (f, k) {
        var file = f.querySelector('.file'), t = f.querySelector('.tab'), h = f.offsetHeight;
        var left = t.offsetLeft, right = left + t.offsetWidth, prev = shown[shown.length - 1];
        // On phones the tabs alternate sides, so every second folder shares the row above when the two tabs fit side by side
        var share = phone.matches && k % 2 && (prev.right <= left || right <= prev.left);
        top = Math.min(k ? top + (share ? 0 : tab) : 0, Math.floor((screen - h) / tab) * tab);
        while (shown.some(function (s) { return s.top === top && s.left < right && left < s.right; })) top -= tab;
        // Tabs in lower rows are now under this folder
        shown = shown.filter(function (s) { return s.top <= top; });
        shown.push({ top: top, left: left, right: right });
        // A folder shorter than the one under it gets empty paper added, so none of that one shows below it.
        // The last folder needs none: the section ends at its bottom, so the folders under it cannot reach lower.
        if (k < folders.length - 1 && top + h < bottom) {
          file.style.minHeight = file.offsetHeight + bottom - top - h + 'px';
          h = bottom - top;
        }
        bottom = top + h;
        f.style.setProperty('--top', top + 'px');
      });
    };
    fit();
    window.addEventListener('resize', fit);
    if (document.fonts) document.fonts.ready.then(fit);
  }

  // Parts rise in as they reach the screen. Without IntersectionObserver, or with reduced motion, everything just shows.
  // Stacking folders are left out: a half-faded folder sliding over another shows both at once
  var parts = document.querySelectorAll('.letter, .files .section-head, .check h2, .check .intro, .chips, #experience .section-head, .job, #skills .sheet, .contact h2, .contact p, .biz, .prose .flow, .next');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    parts.forEach(function (el, i) {
      el.classList.add('reveal');
      if (el.closest('.contact')) el.style.setProperty('--d', (i % 3) * 0.09 + 's');
      io.observe(el);
    });
  }

  // Case study section tabs: mark the last section whose heading has passed the top quarter of the screen,
  // or the final one once the page is scrolled to the end
  var nav = document.querySelector('.sections');
  if (nav) {
    var links = nav.querySelectorAll('a');
    var heads = [];
    links.forEach(function (a) {
      var h = document.getElementById(a.hash.slice(1));
      if (h) heads.push(h);
    });
    var update = function () {
      var current = null;
      heads.forEach(function (h) { if (h.getBoundingClientRect().top <= innerHeight * 0.25) current = h; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) current = heads[heads.length - 1];
      links.forEach(function (a) {
        if (current && a.hash === '#' + current.id) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    };
    // Four headings to measure, so running on every scroll event is cheap
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
