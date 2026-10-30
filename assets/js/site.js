// Behaviour shared by every page; loaded with defer
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

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
