// Loaded in <head> so a saved theme applies before first paint
(function () {
  var root = document.documentElement;
  // Lets CSS show controls that only work with JavaScript
  root.classList.add('js');
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
  } catch (e) {}

  var system = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function isDark() {
    return root.dataset.theme
      ? root.dataset.theme === 'dark'
      : !!(system && system.matches);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    var bars = document.querySelectorAll('meta[name="theme-color"]');
    // The phone's address bar matches the header; the tags follow the OS setting, so a saved choice overrides both
    function sync() {
      btn.setAttribute('aria-pressed', isDark());
      var field = getComputedStyle(root).getPropertyValue('--field').trim();
      bars.forEach(function (m) { m.content = field; });
    }
    sync();
    // Keep the button state right when the OS theme changes and nothing is saved
    if (system && system.addEventListener) system.addEventListener('change', sync);
    else if (system && system.addListener) system.addListener(sync);
    btn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      // Buttons fade their colour on hover; without this they would lag behind the rest of the page on a theme switch
      root.classList.add('theme-switch');
      root.dataset.theme = next;
      void root.offsetHeight;
      root.classList.remove('theme-switch');
      sync();
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  });
})();
